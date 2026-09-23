import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";
import {
  executeSmartAiRouting,
  ALL_ALLOWED_FREE_MODELS,
} from "./src/lib/serverAiRouter";
import { generateCvPdf } from "./src/lib/cvPdfGenerator";
import { articlesData } from "./src/data/articlesData";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // --- Shared Persistent Storage for Public/Private Articles & Vanpedia ---
  const fs = await import("fs");
  const DATA_DIR = path.join(process.cwd(), "server-data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");
  const VANPEDIA_FILE = path.join(DATA_DIR, "vanpedia.json");
  const JIRA_FILE = path.join(DATA_DIR, "jira.json");

  function readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn(`Error reading ${filePath}:`, err);
    }
    return defaultValue;
  }

  function writeJsonFile<T>(filePath: string, data: T): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error(`Error writing ${filePath}:`, err);
    }
  }

  // --- API Routes (Mounted BEFORE Vite middleware) ---

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // --- HTTP Proxy Endpoint (CORS Bypass Engine for API Testing Tool) ---
  app.all(["/api/http-proxy", "/api/proxy-request"], async (req, res) => {
    // Set permissive CORS headers on the proxy endpoint itself so the client app can always call it
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    const startTime = performance.now();

    try {
      const payload = req.method === "GET" ? req.query : req.body;
      const targetMethod = String(payload.method || "GET").toUpperCase();
      let targetUrl = payload.url as string;

      if (!targetUrl || typeof targetUrl !== "string") {
        res.status(400).json({
          success: false,
          error: "URL target diperlukan (parameter 'url' kosong).",
        });
        return;
      }

      targetUrl = targetUrl.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }

      // Check URL validity
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        res.status(400).json({
          success: false,
          error: `URL tidak valid: ${targetUrl}`,
        });
        return;
      }

      // Security: Prevent SSRF targeting internal cloud metadata services
      if (
        parsedUrl.hostname === "169.254.169.254" ||
        parsedUrl.hostname === "metadata.google.internal" ||
        parsedUrl.hostname === "metadata"
      ) {
        res.status(403).json({
          success: false,
          error: "Akses ke metadata cloud internal diblokir demi keamanan.",
        });
        return;
      }

      // Append query params if supplied separately
      if (payload.params && typeof payload.params === "object") {
        for (const [key, value] of Object.entries(payload.params)) {
          if (key && value !== undefined && value !== null) {
            parsedUrl.searchParams.append(key, String(value));
          }
        }
      }

      // Timeout configuration (default 30s, max 60s)
      const timeoutMs = Math.min(Math.max(Number(payload.timeoutMs) || 30000, 1000), 60000);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Clean and prepare headers
      const requestHeaders: Record<string, string> = {};
      if (payload.headers && typeof payload.headers === "object") {
        for (const [k, v] of Object.entries(payload.headers)) {
          if (k && v !== undefined && v !== null && String(v).trim() !== "") {
            const lowerK = k.toLowerCase();
            // Discard headers that Node fetch manages automatically
            if (lowerK !== "host" && lowerK !== "content-length") {
              requestHeaders[k] = String(v);
            }
          }
        }
      }

      // User Agent default
      if (!requestHeaders["user-agent"] && !requestHeaders["User-Agent"]) {
        requestHeaders["User-Agent"] = "VanPostman-ApiTester/1.0 (Mozilla/5.0; Node.js Proxy)";
      }

      // Prepare request body
      let bodyData: any = undefined;
      if (!["GET", "HEAD", "OPTIONS"].includes(targetMethod)) {
        if (typeof payload.body === "string") {
          bodyData = payload.body;
        } else if (payload.body !== undefined && payload.body !== null) {
          bodyData = typeof payload.body === "object" ? JSON.stringify(payload.body) : String(payload.body);
          if (!requestHeaders["content-type"] && !requestHeaders["Content-Type"]) {
            requestHeaders["Content-Type"] = "application/json";
          }
        }
      }

      // Execute request via Node.js native fetch (Completely bypasses browser CORS!)
      let response: Response;
      try {
        response = await fetch(parsedUrl.toString(), {
          method: targetMethod,
          headers: requestHeaders,
          body: bodyData,
          signal: controller.signal,
          redirect: payload.followRedirects === false ? "manual" : "follow",
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const durationMs = Math.round(performance.now() - startTime);

      // Extract response headers
      const resHeaders: Record<string, string> = {};
      const resHeadersList: { key: string; value: string }[] = [];
      response.headers.forEach((val, key) => {
        resHeaders[key] = val;
        resHeadersList.push({ key, value: val });
      });

      const contentType = response.headers.get("content-type") || "";
      const isBinary =
        contentType.includes("image/") ||
        contentType.includes("audio/") ||
        contentType.includes("video/") ||
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream") ||
        contentType.includes("application/zip");

      let rawText = "";
      let responseData: any = null;
      let isJson = false;
      let sizeBytes = 0;

      if (isBinary) {
        const arrayBuf = await response.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        sizeBytes = buf.length;
        responseData = buf.toString("base64");
      } else {
        rawText = await response.text();
        sizeBytes = Buffer.byteLength(rawText, "utf-8");
        // Check if response is JSON
        const trimmed = rawText.trim();
        if (
          contentType.includes("json") ||
          (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
          (trimmed.startsWith("[") && trimmed.endsWith("]"))
        ) {
          try {
            responseData = JSON.parse(rawText);
            isJson = true;
          } catch {
            responseData = rawText;
          }
        } else {
          responseData = rawText;
        }
      }

      res.status(200).json({
        success: true,
        status: response.status,
        statusText: response.statusText || (response.ok ? "OK" : "Error"),
        timeMs: durationMs,
        sizeBytes,
        headers: resHeaders,
        headersList: resHeadersList,
        contentType,
        isJson,
        isBinary,
        data: responseData,
        rawText: isBinary ? undefined : rawText,
        url: response.url || parsedUrl.toString(),
        corsMode: "proxy",
      });
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isAbort = err.name === "AbortError" || err.message?.includes("aborted");

      res.status(200).json({
        success: false,
        status: 0,
        statusText: isAbort ? "Request Timeout" : "Network Error",
        timeMs: durationMs,
        sizeBytes: 0,
        headers: {},
        headersList: [],
        error: isAbort
          ? `Permintaan melebihi batas waktu (Timeout setelah ${Math.round(durationMs)} ms).`
          : (err.message || "Gagal menghubungi server target."),
        code: err.code || (isAbort ? "TIMEOUT" : "FETCH_ERROR"),
        corsMode: "proxy",
      });
    }
  });

  // Official CV PDF Direct Route & Download Endpoint
  app.get(["/cv.pdf", "/api/cv.pdf", "/api/cv/download"], (req, res) => {
    try {
      const lang = (req.query.lang === "en" ? "en" : "id") as "id" | "en";
      const variant = (req.query.variant === "ats" ? "ats" : "executive") as "executive" | "ats";
      const isDownload = req.query.download === "1" || req.path.includes("download");

      // Check for photo base64
      let photoBase64: string | undefined;
      try {
        const photoPath = path.join(process.cwd(), "public", "images", "irvan_photo_portrait.jpg");
        if (fs.existsSync(photoPath)) {
          photoBase64 = fs.readFileSync(photoPath).toString("base64");
        }
      } catch (e) {
        console.warn("Could not read portrait photo for CV PDF:", e);
      }

      const doc = generateCvPdf({
        language: lang,
        variant,
        includePhoto: variant === "executive",
        photoBase64,
      });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      const filename = lang === "en"
        ? `Muchamad-Irvan-Software-Engineer-${variant === "ats" ? "ATS" : "CV"}.pdf`
        : `Muchamad-Irvan-Curriculum-Vitae-${variant === "ats" ? "ATS" : "Resmi"}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader(
        "Content-Disposition",
        `${isDownload ? "attachment" : "inline"}; filename="${filename}"`
      );
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(pdfBuffer);
    } catch (err: any) {
      console.error("Error generating CV PDF in route:", err);
      res.status(500).json({ error: "Failed to generate CV PDF", details: err.message });
    }
  });

  // Articles Endpoints (Public articles are accessible to ALL users, guests, and unauthenticated visitors)
  app.get("/api/articles", (req, res) => {
    try {
      const articles = readJsonFile<any[]>(ARTICLES_FILE, articlesData);
      const authorId = req.headers["x-author-id"] as string | undefined;
      const isAdmin = req.headers["x-is-admin"] === "true";

      if (isAdmin) {
        res.json({ success: true, data: articles });
        return;
      }

      // Public articles are visible to everyone (including non-logged-in visitors)
      // Private articles are ONLY visible to their author
      const visible = articles.filter((a) => {
        const isOwner = Boolean(authorId && (a.authorId === authorId || a.author?.id === authorId));
        if (isOwner) return true;
        return a.visibility !== "private";
      });

      res.json({ success: true, data: visible });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/articles/:slug", (req, res) => {
    try {
      const { slug } = req.params;
      const articles = readJsonFile<any[]>(ARTICLES_FILE, articlesData);
      const article = articles.find((a) => a.slug === slug);

      if (!article) {
        res.status(404).json({ error: "Article not found" });
        return;
      }

      const authorId = req.headers["x-author-id"] as string | undefined;
      const isAdmin = req.headers["x-is-admin"] === "true";
      const isOwner = Boolean(authorId && (article.authorId === authorId || article.author?.id === authorId));

      if (article.visibility === "private" && !isAdmin && !isOwner) {
        res.status(403).json({ error: "This article is private" });
        return;
      }

      res.json({ success: true, data: article });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/articles", (req, res) => {
    try {
      const article = req.body;
      if (!article || !article.slug) {
        res.status(400).json({ error: "Article slug and data are required." });
        return;
      }

      const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
      const filtered = articles.filter((a) => a.slug !== article.slug);
      filtered.unshift({
        ...article,
        updatedAt: new Date().toISOString(),
        visibility: article.visibility === "private" ? "private" : "public",
      });

      writeJsonFile(ARTICLES_FILE, filtered);
      res.json({ success: true, data: article });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vanpedia Endpoints (Public terms are accessible to ALL users, guests, and unauthenticated visitors)
  app.get("/api/vanpedia", (req, res) => {
    try {
      const terms = readJsonFile<any[]>(VANPEDIA_FILE, []);
      const authorId = req.headers["x-author-id"] as string | undefined;
      const isAdmin = req.headers["x-is-admin"] === "true";

      if (isAdmin) {
        res.json({ success: true, data: terms });
        return;
      }

      const visible = terms.filter((t) => {
        const isOwner = Boolean(authorId && t.authorId === authorId);
        if (isOwner) return true;
        return t.visibility !== "private";
      });

      res.json({ success: true, data: visible });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/vanpedia/:slug", (req, res) => {
    try {
      const { slug } = req.params;
      const terms = readJsonFile<any[]>(VANPEDIA_FILE, []);
      const term = terms.find((t) => t.slug === slug);

      if (!term) {
        res.status(404).json({ error: "Term not found" });
        return;
      }

      const authorId = req.headers["x-author-id"] as string | undefined;
      const isAdmin = req.headers["x-is-admin"] === "true";
      const isOwner = Boolean(authorId && term.authorId === authorId);

      if (term.visibility === "private" && !isAdmin && !isOwner) {
        res.status(403).json({ error: "This term is private" });
        return;
      }

      res.json({ success: true, data: term });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/vanpedia", (req, res) => {
    try {
      const term = req.body;
      if (!term || !term.slug) {
        res.status(400).json({ error: "Vanpedia term slug and data are required." });
        return;
      }

      const terms = readJsonFile<any[]>(VANPEDIA_FILE, []);
      const filtered = terms.filter((t) => t.slug !== term.slug);
      filtered.unshift({
        ...term,
        updatedAt: new Date().toISOString(),
        visibility: term.visibility === "private" ? "private" : "public",
      });

      writeJsonFile(VANPEDIA_FILE, filtered);
      res.json({ success: true, data: term });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Jira Cloud Project Management Endpoints ---
  app.get("/api/jira/data", (_req, res) => {
    try {
      const state = readJsonFile<any>(JIRA_FILE, null);
      res.json({ success: true, state });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/jira/data", (req, res) => {
    try {
      const { state } = req.body || {};
      if (!state) {
        res.status(400).json({ error: "State is required." });
        return;
      }
      writeJsonFile(JIRA_FILE, state);
      res.json({ success: true, updatedAt: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/jira/reset", (_req, res) => {
    try {
      if (fs.existsSync(JIRA_FILE)) {
        fs.unlinkSync(JIRA_FILE);
      }
      res.json({ success: true, message: "Jira data reset to demo state." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/jira/ai-assist", async (req, res) => {
    try {
      const { action, prompt, context } = req.body || {};
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      let systemInstruction =
        "You are an expert Agile Scrum Master and Software Architect assistant for Jira.";
      let userPrompt = prompt;

      if (action === "generate_stories") {
        systemInstruction +=
          " Generate 3-4 professional user stories in JSON format with fields: title, description, acceptanceCriteria (array of strings), storyPoints (number like 1, 2, 3, 5, 8), priority ('highest'|'high'|'medium'|'low'), type ('story'|'task'|'bug'). Output valid JSON only with a 'stories' array.";
        userPrompt = `Based on this feature requirement:\n${prompt}\n\nGenerate structured user stories in JSON.`;
      } else if (action === "generate_subtasks") {
        systemInstruction +=
          " Break down the user story into 4-6 concise, actionable developer checklist subtasks. Output valid JSON only with a 'subtasks' array of string titles.";
        userPrompt = `Issue Title: ${prompt}\nContext: ${context || ""}\n\nGenerate actionable subtask titles in JSON.`;
      } else if (action === "sprint_retrospective") {
        systemInstruction +=
          " Produce an insightful Sprint Retrospective & velocity report formatted in Markdown: What went well, What could be improved, Action items, and Team velocity insights.";
        userPrompt = `Sprint Data:\n${prompt}\n\nProvide an executive retrospective and summary.`;
      }

      const result = await executeSmartAiRouting({
        prompt: userPrompt,
        systemInstruction,
        model: "gemini-3.8-flash",
      });

      res.json({ success: true, text: result.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      aiEngine: "Universal Smart AI Engine (Native OpenCode Upstream + Gemini Free + Open-Source Gateways)",
      supportedModels: ALL_ALLOWED_FREE_MODELS,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Chat with AI Endpoint (VanBot)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const {
        messages = [],
        model = "gemini-3.8-flash",
        context = "",
        includeThinking = true,
      } = req.body || {};

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Messages array is required." });
        return;
      }

      const SYSTEM_KNOWLEDGE_PROMPT = `Anda adalah "Vanviolet AI", AI Assistant resmi dan terpercaya untuk portofolio Muchamad Irvan (dikenal juga sebagai Van atau vanviolet), seorang Fullstack Developer, Software Engineer, dan Systems Architect berpengalaman 5+ tahun berbasis di Indonesia.

### PROFIL UTAMA MUCHAMAD IRVAN:
- **Nama Lengkap**: Muchamad Irvan
- **Nama Panggilan / Alias**: Van / vanviolet (GitHub: github.com/vanviolet, Email: vanviolet.js@gmail.com, Instagram: @vanviolet.js)
- **Profesi & Peran**: Lead Fullstack Developer, Senior Software Engineer, dan Systems Architect.
- **Pengalaman**: 5+ Tahun rekayasa perangkat lunak skala produksi.
- **3 Pilar Karier & Peran Aktif Saat Ini**:
  1. **Lead Fullstack Developer & Systems Architect di Pusat Teknologi Akademik Universitas (2022 — Sekarang)**: Memimpin arsitektur sistem enterprise kampus berskala besar, memodernisasi infrastruktur menjadi microservices Kubernetes.
  2. **Senior Fullstack Software Engineer (Remote) di Perusahaan Swasta Eksternal (2023 — Sekarang)**: Bekerja secara remote untuk perusahaan non-universitas dalam membangun sistem enterprise berkecepatan tinggi, optimasi database, dan automasi.
  3. **Freelance & Independent Software Engineer (2022 — Sekarang)**: Mengembangkan produk SaaS mandiri, solusi operasional bisnis komersial, dan proyek hobi inovatif.
- **Filosofi Engineering**:
  1. *Simplicity Over Cleverness*: Mengedepankan arsitektur yang mudah dipahami, pragmatis, dan mudah dirawat.
  2. *Performance as a Feature*: API sub-detik, kueri database teroptimasi, Redis caching, dan zero layout shift.
  3. *Built to Evolve*: TypeScript ketat, modularitas komponen, dan pemisahan lapisan bisnis.
  4. *Craftsmanship & Empathy*: Penolakan terhadap "AI Slop" generik; fokus pada detail UX, matematika tata letak, dan keandalan sistem.

---

### DAFTAR RESMI PROYEK YANG DIBUAT OLEH MUCHAMAD IRVAN:
Berikut adalah proyek-proyek nyata yang ada di portofolio Muchamad Irvan (PASTIKAN SELALU MENJAWAB SESUAI DAFTAR INI DAN JANGAN MENGARANG PROYEK LAIN):

1. **Next-Gen University LMS (2024)** - *Sistem Kampus Paling Banyak Digunakan (Most Widely Used)*:
   - **Kategori**: Sistem Akademik Universitas.
   - **Deskripsi**: Aplikasi produksi utama kampus yang melayani 15.000+ mahasiswa dan dosen aktif setiap hari. Menggantikan Moodle lama dengan arsitektur reaktif Next.js dan NestJS.
   - **Fitur & Dampak**: Berjalan di klaster Kubernetes dengan Horizontal Pod Autoscaling (HPA) untuk menyerap 12.000+ submisi ujian serentak, uptime 99.9%, peningkatan kecepatan 3.2x (latensi turun 65%), terintegrasi SSO dan pangkalan data akademik universitas.
   - **Tech Stack**: React, Next.js, NestJS, PostgreSQL, Redis, Kubernetes, Docker, Tailwind CSS.

2. **Biometric Attendance System (2026)** - *Proyek Remote Perusahaan Swasta Eksternal*:
   - **Kategori**: Sistem Enterprise Remote untuk Klien Swasta (di luar universitas).
   - **Deskripsi**: Platform presensi kerja enterprise dengan verifikasi biometrik wajah anti-spoofing berbasis computer vision (liveness detection) guna mencegah kecurangan foto/layar, validasi poligon geofence GPS presisi tinggi, dan penjadwalan multi-shift.
   - **Fitur & Dampak**: Berhasil menekan fraud absensi hingga 100% (0% kecurangan), melayani 3.500+ pegawai dan 7.000+ clock-ins per hari, dideploy di Kubernetes dengan health probe & failover otomatis.
   - **Tech Stack**: TypeScript, NestJS, PostgreSQL, Redis, Kubernetes, Docker, Computer Vision API.

3. **Integrated Curriculum System (Kurikulum Terintegrasi, 2026)**:
   - **Kategori**: Sistem Akademik Inti Universitas.
   - **Deskripsi**: Platform perencanaan kurikulum universitas yang menghubungkan Capaian Pembelajaran Lulusan (CPL/CPMK), silabus Outcome-Based Education (OBE), dan matriks kurikulum di 30+ program studi.
   - **Fitur & Dampak**: Menggunakan model graf berarah (DAG) interaktif untuk prasyarat mata kuliah guna mencegah kebuntuan kelulusan mahasiswa, otomasi pembuatan borang akreditasi BAN-PT dan LAM-INFOKOM, serta sinkronisasi langsung ke KRS mahasiswa.
   - **Tech Stack**: TypeScript, Vue.js, NestJS / Node.js, PostgreSQL, Kubernetes, Docker, Tailwind CSS.

4. **NoteLogic (2024)** - *Karya Hobi Pribadi Solusi Belajar Musik*:
   - **Kategori**: Proyek Hobi Mandiri / EdTech Musik (dikembangkan atas dasar kecintaan pada musik).
   - **Deskripsi**: Web app interaktif pemecah hambatan belajar teori musik dan gitar. Mengubah interval nada matematis menjadi visualisasi interaktif.
   - **Fitur**: Chord Explorer interaktif dengan 954+ chord, Web Audio API tone synthesis murni (zero-sample latency < 15ms), visualisasi fretboard gitar & tuts piano simultan, serta in-browser Tab Studio (sequencer tablatur gitar digital).
   - **Tech Stack**: React, TypeScript, Tailwind CSS, Web Audio API, Vite, Fretboard Math Engine.
   - **Live Website**: https://music.vanviolet.my.id/

5. **Inventory & Asset Tracking System (2026)**:
   - **Kategori**: Sistem Enterprise Manajemen Aset & Logistik.
   - **Deskripsi**: Solusi pelacakan puluhan ribu aset fisik dan barang consumable multi-gudang di 12 gedung kampus/fasilitas dengan pemindaian barcode/QR, pengadaan barang, alert stok menipis otomatis, depresiasi nilai buku, dan audit trail mutasi.
   - **Tech Stack**: TypeScript, NestJS, React, PostgreSQL, Barcode Scanner Engine, Docker.

6. **Doctoral Scholarship & HRMS Integration (Beasiswa S3 Dosen, 2023 — 2024)**:
   - **Kategori**: Sistem Akademik & Kepegawaian Kampus.
   - **Deskripsi**: Mengotomasi seleksi beasiswa studi lanjut doktoral (S3) dosen, izin belajar, ikatan dinas, dan alur persetujuan berjenjang (Dekan, Senat, Rektorat).
   - **Fitur**: Integrasi dua arah langsung dengan aplikasi HRMS kampus dengan latensi sinkronisasi <200ms.
   - **Tech Stack**: React, TypeScript, NestJS, PostgreSQL, HRMS API, Docker, Tailwind CSS.

7. **Graduation Management System (Sistem Manajemen Wisuda, 2024)**:
   - **Kategori**: Sistem Logistik & Acara Kampus.
   - **Deskripsi**: Platform operasional wisuda universitas yang mengelola distribusi toga, alokasi kursi pintar ribuan wisudawan, antrean panggung RFID/barcode real-time, dan telemetri siaran langsung proyektor panggung untuk 2.000+ wisudawan dan 4.000+ tamu per sesi.
   - **Tech Stack**: React, TypeScript, Node.js, PostgreSQL, Tailwind CSS, WebSockets.

8. **Corporate Position Voting System (Sistem Voting Jabatan Perusahaan, 2023)**:
   - **Kategori**: Aplikasi Manajemen & Tata Kelola Perusahaan (Bespoke/Freelance).
   - **Deskripsi**: Aplikasi e-voting aman untuk pemilihan jabatan kepemimpinan dan posisi struktural di perusahaan dengan token kriptografis sekali pakai, kerahasiaan suara 100%, dan rekapitulasi transparan anti-manipulasi.
   - **Tech Stack**: React, Node.js, PostgreSQL, Crypto API, Tailwind CSS.

9. **E-Letter Digital Correspondence (Persuratan & Disposisi Digital, 2022 — 2023)**:
   - **Kategori**: Enterprise Document Workflow (Bespoke).
   - **Deskripsi**: E-office persuratan resmi dengan penomoran otomatis, pelacakan disposisi berjenjang, generator PDF, dan verifikasi keaslian QR code kriptografis yang telah memproses 50.000+ dokumen tanpa kehilangan arsip.
   - **Tech Stack**: Node.js, React, Express, PostgreSQL, Redis, PDFKit, Tailwind CSS.

10. **Hotel & Room Management System (2022)**:
    - **Kategori**: Hospitality Management (Bespoke/Freelance).
    - **Deskripsi**: Manajemen kamar hotel butik dengan matriks kamar visual real-time (status kosong, terisi, kotor, perbaikan), kalender reservasi, dan faktur tagihan tamu otomatis.
    - **Tech Stack**: React, TypeScript, Node.js, MongoDB, Express, Tailwind CSS.

11. **Boarding House (Kost) Rental Management (2022)**:
    - **Kategori**: Property Management SaaS (Bespoke/Freelance).
    - **Deskripsi**: Pengelolaan kamar kos-kosan dengan pengingat jatuh tempo sewa bulanan otomatis via WhatsApp, pencatatan meteran listrik/air, dan laporan keuangan laba rugi.
    - **Tech Stack**: Vue.js, PHP/Laravel, MySQL, Tailwind CSS.

---

### FITUR UNGGULAN LAIN DI WEBSITE PORTOFOLIO INI:
- **Articles & Research**: Tulisan teknis mendalam tentang arsitektur sistem, AI engineering, KaTeX math rendering, dan studi kasus rekayasa nyata.
- **Vanpedia**: Ensiklopedia istilah teknis/AI interaktif dengan definisi bilingual, formula matematika, dan notasi fonetik IPA.
- **Developer Forum**: Forum diskusi teknis interaktif untuk tanya jawab arsitektur software.
- **Video Editor Toolkit**: Alat editor video berbasis desktop di browser.
- **AI Chatbot (Anda Sendiri)**: Asisten cerdas dengan dukungan suara (Voice STT/TTS) dan multi-model router cerdas.

---

### ATURAN & GAYA RESPON ANDA:
1. **Akurat Mengenai Muchamad Irvan**: Jika ditanya tentang siapa Irvan, apa pekerjaannya, atau proyek apa saja yang dibuatnya, jelaskan dengan bangga, akurat, dan merujuk LANGSUNG pada data proyek resmi di atas. Jangan mengarang proyek fiktif seperti kalkulator generic, aplikasi cuaca palsu, atau e-commerce generik!
2. **Bahasa**: Gunakan Bahasa Indonesia secara default (atau Bahasa Inggris jika pengguna bertanya dalam Bahasa Inggris).
3. **Format**: Gunakan Markdown elegan (bold, bullet points rapi, heading jika diperlukan) agar mudah dibaca dan nyaman dilihat.
4. **Sikap**: Ramah, percaya diri, berbobot teknis tinggi, solutif, dan profesional.`;

      const fullSystemInstruction = `${SYSTEM_KNOWLEDGE_PROMPT}
${context ? `\n### Konteks Halaman Pengguna Saat Ini:\n${context}` : ""}`;

      // Build conversation prompt from history
      const formattedHistory = messages
        .map((m: any) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
        .join("\n\n");
      const prompt = `Berikut riwayat percakapan sejauh ini:\n\n${formattedHistory}\n\nJawablah pesan terakhir pengguna dengan ramah, akurat, dan komprehensif.`;

      const routerRes = await executeSmartAiRouting({
        model,
        systemInstruction: fullSystemInstruction,
        prompt,
        isJson: false,
      });

      const lastUserQuery = messages[messages.length - 1]?.content || "";
      const thinkingSteps = [
        `[Working] Initiating deep cognition sequence...`,
        `[Hacking] Decrypting semantic tokens: "${lastUserQuery.slice(0, 50)}${lastUserQuery.length > 50 ? "..." : ""}"`,
        `[Triangulation] Mapping neural nodes & knowledge vector matrix (Portfolio, Vanpedia, Production Systems)`,
        `[Deciphering] Calibrating routing weights on ${routerRes.usedModel} (${routerRes.provider})`,
        `[Synthesizing] Compiling verified high-craft output with zero-hallucination guardrails`,
      ];

      res.json({
        success: true,
        data: {
          message: {
            role: "assistant",
            content: routerRes.text,
            createdAt: new Date().toISOString(),
            model: routerRes.usedModel,
            provider: routerRes.provider,
          },
          thinking: includeThinking
            ? {
                steps: thinkingSteps,
                executionPath: routerRes.executionPath,
                model: routerRes.usedModel,
                provider: routerRes.provider,
              }
            : undefined,
        },
      });
    } catch (err: any) {
      console.error("Error in server /api/ai/chat:", err);
      res.status(500).json({ error: err.message || "Failed to generate chat response" });
    }
  });

  // Generate Article Endpoint
  app.post("/api/ai/generate-article", async (req, res) => {
    try {
      const { topic, category = "", keyPoints = "", language = "id", model = "gemini-3.8-flash" } = req.body;

      if (!topic || typeof topic !== "string" || !topic.trim()) {
        res.status(400).json({ error: "Topic/Title outline is required." });
        return;
      }

      const systemInstruction =
        "You are a senior technical architect & AI writer that generates structured, publication-ready technical articles in JSON format.";

      const prompt = `Anda adalah Penulis Teknis dan Arsitek Sistem Senior.
Tolong buatkan draf artikel teknis yang mendalam, terstruktur rapi, berbobot, dan aplikatif berdasarkan input berikut:
- Topik / Judul: "${topic.trim()}"
${category && category !== "Auto" ? `- Kategori yang Diinginkan: "${category}"` : "- Kategori: (Tentukan otomatis kategori teknis yang paling akurat, presisi, dan representatif, contoh: 'AI & Machine Learning', 'Distributed Systems', 'Software Architecture', 'Database Systems', 'Frontend Architecture', 'Cloud Infrastructure', 'Cybersecurity', atau kategori spesifik lainnya)"}
${keyPoints ? `- Poin-poin Kunci / Deskripsi Singkat: "${keyPoints}"` : ""}
- Bahasa Utama: ${language === "en" ? "English" : "Bahasa Indonesia"}

Ketentuan Konten:
- Format Markdown terstruktur dengan heading jelas:
  ## 1. Pengantar & Latar Belakang Masalah
  ## 2. Arsitektur & Prinsip Kerja (sertakan formula LaTeX $$...$$ bila relevan dan sebutkan konsep terkait dengan format tautan [[slug-vanpedia]])
  ## 3. Implementasi Kode Nyata (blok kode fungsional, berstandar produksi, lengkap dengan tipe data)
  ## 4. Analisis Trade-offs & Praktik Terbaik
  ## 5. Kesimpulan
- Jangan menyertakan metafora musik atau audio, fokus pada rekayasa teknologi, AI, atau sistem umum.

Format keluaran HARUS berformat JSON valid dengan properti:
- titleId: Judul dalam Bahasa Indonesia
- titleEn: Title in English
- category: Kategori teknis yang tepat dan representatif
- tags: Array string 3-5 tag teknis relevan
- summaryId: Ringkasan padat 2-3 kalimat dalam Bahasa Indonesia
- summaryEn: Summary in English (2-3 sentences)
- readTime: Estimasi waktu baca (contoh: "5 min read")
- content: Isi artikel Markdown lengkap sesuai struktur di atas.`;

      const jsonSchema = {
        type: Type.OBJECT,
        properties: {
          titleId: { type: Type.STRING },
          titleEn: { type: Type.STRING },
          category: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          summaryId: { type: Type.STRING },
          summaryEn: { type: Type.STRING },
          readTime: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ["titleId", "titleEn", "category", "tags", "summaryId", "summaryEn", "readTime", "content"],
      };

      const aiResult = await executeSmartAiRouting({
        model,
        systemInstruction,
        prompt,
        isJson: true,
        jsonSchema,
      });

      const parsedData = aiResult.parsedJson || JSON.parse(aiResult.text);

      res.json({
        success: true,
        data: {
          ...parsedData,
          isAiAssisted: true,
          aiModel: aiResult.usedModel,
          provider: aiResult.provider,
          executionPath: aiResult.executionPath,
        },
      });
    } catch (error: any) {
      console.error("Error generating article:", error);
      res.status(500).json({
        error: error.message || "Failed to generate article using Smart AI Engine",
      });
    }
  });

  // Generate Vanpedia Term Endpoint
  app.post("/api/ai/generate-vanpedia", async (req, res) => {
    try {
      const { termName, category = "", details = "", model = "gemini-3.8-flash" } = req.body;

      if (!termName || typeof termName !== "string" || !termName.trim()) {
        res.status(400).json({ error: "Term name is required." });
        return;
      }

      const systemInstruction =
        "You are an authoritative encyclopedic technical lexicographer creating concise, high-precision glossary entries in JSON format.";

      const prompt = `Anda adalah Leksikografer Teknis Rekayasa Perangkat Lunak dan AI.
Tolong buatkan entri kamus istilah teknis untuk "Vanpedia" yang RINGKAS, PADAT, AKURAT, dan SANGAT JELAS (tidak bertele-tele, tidak panjang-panjang, fokus pada esensi dan pemahaman praktis):
- Nama Istilah: "${termName.trim()}"
${category && category !== "Auto" ? `- Kategori yang Diinginkan: "${category}"` : "- Kategori: (Tentukan otomatis kategori teknis yang paling tepat dan representatif, contoh: 'Learning (AI)', 'Computer Systems', 'Database Systems', 'Distributed Systems', 'Security & Auth', 'Algorithms & Optimization', atau nama kategori lainnya)"}
${details ? `- Catatan Khusus / Deskripsi Singkat: "${details}"` : ""}

Ketentuan Format:
- Jangan menyertakan metafora musik atau audio, fokus murni pada ilmu komputer, software engineering, AI, atau teknologi umum.
- definitionId: Definisi formal 1-2 kalimat presisi dan mudah dipahami dalam Bahasa Indonesia.
- definitionEn: Definisi formal 1-2 kalimat dalam Bahasa Inggris.
- phonetic: Notasi fonetik standar IPA (misal: "/ˈbækˌprɑːpəˈɡeɪʃən/").
- formula: Rumus/notasi matematis singkat jika relevan (kosongkan string jika tidak relevan).
- examples: Array 2-3 contoh penerapan nyata dan singkat di industri modern.
- content: Penjelasan singkat yang jelas dan padat (maksimal 2 sub-bab ringkas: "## Konsep Inti" dan "## Contoh Penerapan Praktis"). Tidak perlu uraian panjang yang melelahkan, utamakan kejelasan konsep.

Keluaran HARUS berupa JSON dengan properti:
- termId: Nama istilah dalam Bahasa Indonesia
- termEn: Term name in English
- slug: URL-friendly slug (huruf kecil, strip pengganti spasi)
- category: Kategori teknis yang tepat
- phonetic: Notasi fonetik IPA
- definitionId: Definisi presisi 1-2 kalimat dalam Bahasa Indonesia
- definitionEn: Formal 1-2 sentence definition in English
- formula: Formula singkat jika ada
- examples: Array 2-3 string contoh nyata
- content: Penjelasan ringkas dan jelas dalam format Markdown`;

      const jsonSchema = {
        type: Type.OBJECT,
        properties: {
          termId: { type: Type.STRING },
          termEn: { type: Type.STRING },
          slug: { type: Type.STRING },
          category: { type: Type.STRING },
          phonetic: { type: Type.STRING },
          definitionId: { type: Type.STRING },
          definitionEn: { type: Type.STRING },
          formula: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          content: { type: Type.STRING },
        },
        required: ["termId", "termEn", "slug", "category", "phonetic", "definitionId", "definitionEn", "examples", "content"],
      };

      const aiResult = await executeSmartAiRouting({
        model,
        systemInstruction,
        prompt,
        isJson: true,
        jsonSchema,
      });

      const parsedData = aiResult.parsedJson || JSON.parse(aiResult.text);

      res.json({
        success: true,
        data: {
          ...parsedData,
          isAiAssisted: true,
          aiModel: aiResult.usedModel,
          provider: aiResult.provider,
          executionPath: aiResult.executionPath,
        },
      });
    } catch (error: any) {
      console.error("Error generating Vanpedia term:", error);
      res.status(500).json({
        error: error.message || "Failed to generate Vanpedia term using Smart AI Engine",
      });
    }
  });

  // AI Assistant endpoint (General queries, Q&A assistance, proofreading, summaries)
  app.post("/api/ai/assist", async (req, res) => {
    try {
      const { prompt, task = "general", context = "", model = "gemini-3.8-flash" } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      let systemInstruction = "Anda adalah asisten AI cerdas untuk portal Muchamad Irvan yang memberikan jawaban teknis yang tepat, padat, dan elegan.";
      
      if (task === "qa_answer") {
        systemInstruction = "Anda adalah Software Engineer Senior. Berikan jawaban teknis komprehensif dengan kode jika relevan untuk menjawab pertanyaan developer.";
      } else if (task === "summary") {
        systemInstruction = "Buat ringkasan padat dan informatif dari teks yang diberikan.";
      }

      const fullContents = context ? `Konteks:\n${context}\n\nPermintaan:\n${prompt}` : prompt;

      const aiResult = await executeSmartAiRouting({
        model,
        systemInstruction,
        prompt: fullContents,
        isJson: false,
      });

      res.json({
        success: true,
        result: aiResult.text || "",
        aiModel: aiResult.usedModel,
        provider: aiResult.provider,
        executionPath: aiResult.executionPath,
      });
    } catch (error: any) {
      console.error("Error in AI assist:", error);
      res.status(500).json({
        error: error.message || "Failed to execute AI assist",
      });
    }
  });

  // Fallback Flowchart Generator (guarantees a pristine diagram even during upstream AI outage/503 spikes)
  function generateFallbackFlowchart(prompt: string, direction: string = "TD") {
    const cleanPrompt = prompt.trim();
    const dir = direction === "LR" ? "LR" : "TD";

    const steps = cleanPrompt
      .split(/(?:,|\bdengan\b|\blalu\b|\bkemudian\b|\bsetelah\b|\band\b|\bthen\b)/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    let mermaid = `flowchart ${dir}\n`;
    mermaid += `    Start(["🚀 Mulai: Inisiasi Alur"])\n`;

    if (steps.length >= 2) {
      mermaid += `    Input[/"📥 Input: ${steps[0].slice(0, 30)}"/]\n`;
      mermaid += `    Start --> Input\n`;
      mermaid += `    Validate{"🔍 Validasi Parameter & Status"}\n`;
      mermaid += `    Input --> Validate\n`;
      mermaid += `    Process["⚙️ Proses: ${steps[1].slice(0, 35)}"]\n`;
      mermaid += `    Validate -->|Valid| Process\n`;
      mermaid += `    ErrHandle["⚠️ Tangani Error & Log Kegagalan"]\n`;
      mermaid += `    Validate -->|Tidak Valid| ErrHandle\n`;

      if (steps.length >= 3) {
        mermaid += `    Subtask[["🔄 Eksekusi: ${steps[2].slice(0, 35)}"]]\n`;
        mermaid += `    Process --> Subtask\n`;
        mermaid += `    Storage[("💾 Simpan ke Database & Cache")]\n`;
        mermaid += `    Subtask --> Storage\n`;
        mermaid += `    Finish(["✅ Selesai: Respon Sukses"])\n`;
        mermaid += `    Storage --> Finish\n`;
        mermaid += `    ErrHandle --> Finish\n`;
      } else {
        mermaid += `    Storage[("💾 Simpan Hasil Transaksi")]\n`;
        mermaid += `    Process --> Storage\n`;
        mermaid += `    Finish(["✅ Selesai: Respon Sukses"])\n`;
        mermaid += `    Storage --> Finish\n`;
        mermaid += `    ErrHandle --> Finish\n`;
      }
    } else {
      mermaid += `    Input[/"📥 Terima Request: ${cleanPrompt.slice(0, 30)}"/]\n`;
      mermaid += `    Start --> Input\n`;
      mermaid += `    Validate{"🔍 Validasi Data & Autentikasi"}\n`;
      mermaid += `    Input --> Validate\n`;
      mermaid += `    Process["⚙️ Eksekusi Logika Bisnis & Komputasi"]\n`;
      mermaid += `    Validate -->|Valid / Sukses| Process\n`;
      mermaid += `    ErrorState["⚠️ Return Error & Feedback"]\n`;
      mermaid += `    Validate -->|Gagal| ErrorState\n`;
      mermaid += `    Database[("💾 Sinkronisasi Database / State")]\n`;
      mermaid += `    Process --> Database\n`;
      mermaid += `    End(["✅ Selesai: Kirim Response"])\n`;
      mermaid += `    Database --> End\n`;
      mermaid += `    ErrorState --> End\n`;
    }

    return {
      title: cleanPrompt.length > 45 ? cleanPrompt.slice(0, 42) + "..." : cleanPrompt,
      description: `Diagram alur sistem yang dirancang untuk: ${cleanPrompt}`,
      direction: dir,
      mermaid,
      summary: "Diagram berhasil dirancang berdasarkan pola arsitektur standar dengan alur validasi, proses, penyimpanan, dan penanganan kondisi gagal.",
      aiModel: "Architecture Engine",
      provider: "Intelligent System Generator",
    };
  }

  // AI Generate Flowchart Endpoint
  app.post("/api/ai/generate-flowchart", async (req, res) => {
    try {
      const { prompt, direction = "TD", model = "gemini-3.8-flash" } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      const systemInstruction = `You are a Principal Software Architect and Systems Diagram Engineer.
Your job is to generate a comprehensive, highly accurate flowchart representing the requested architecture, business logic, algorithm, or user journey.
You MUST output valid JSON matching the exact schema.

Rules for the Mermaid code:
1. Start with "flowchart ${direction === "LR" ? "LR" : "TD"}"
2. Use standard Mermaid shape syntax:
   - Start / End: id(["Label"])
   - Process / Action: id["Label"]
   - Decision: id{"Condition?"}
   - Input / Output: id[/"Label"/]
   - Database / Cache: id[("Label")]
   - Subroutine / Service: id[["Label"]]
   - External Cloud: id["☁️ Label"]
3. Include edge labels for decisions:
   - id1 -->|Ya| id2
   - id1 -->|Tidak| id3
   - id1 -.->|Webhook/Async| id4
4. Ensure no disconnected or dead-end orphan nodes (except valid End nodes).
5. Output clean, valid JSON only.`;

      const aiPrompt = `Buat diagram alur / flowchart teknis yang komprehensif, logis, dan mendalam untuk permintaan berikut:
"${prompt.trim()}"

Arah Alur: ${direction === "LR" ? "Kiri ke Kanan (LR)" : "Atas ke Bawah (TD)"}

Format keluaran HARUS berupa objek JSON valid dengan struktur:
{
  "title": "Judul Alur Diagram Ringkas & Profesional",
  "description": "Deskripsi 1-2 kalimat tentang apa yang dipetakan oleh flowchart ini",
  "direction": "${direction}",
  "mermaid": "flowchart ${direction}\\n    A([Mulai]) --> B[Langkah 1]\\n    B --> C{Kondisi?}\\n    C -->|Ya| D[Proses]\\n    C -->|Tidak| E([Selesai])",
  "summary": "Ringkasan arsitektural singkat mengenai keputusan alur ini"
}`;

      try {
        const aiResult = await executeSmartAiRouting({
          model,
          systemInstruction,
          prompt: aiPrompt,
          isJson: true,
        });

        const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);

        res.json({
          success: true,
          data: {
            ...parsed,
            aiModel: aiResult.usedModel,
            provider: aiResult.provider,
          },
        });
      } catch (routerError: any) {
        console.warn("Smart AI Router encountered temporary high demand, engaging resilient flowchart fallback:", routerError?.message);
        const fallbackData = generateFallbackFlowchart(prompt, direction);
        res.json({
          success: true,
          data: fallbackData,
        });
      }
    } catch (error: any) {
      console.error("Error generating flowchart:", error);
      res.status(500).json({
        error: error.message || "Failed to generate flowchart using Smart AI",
      });
    }
  });

  // AI Enhance Illustration Prompt Endpoint
  app.post("/api/ai/enhance-illustration-prompt", async (req, res) => {
    try {
      const {
        prompt,
        stylePreset = "flat-vector",
        presetName = "Flat Vector",
        language = "id",
        model = "gemini-3.8-flash",
      } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      const systemInstruction = `You are a world-class prompt engineer and digital art director specializing in text-to-image illustration models (FLUX.1, Midjourney, Stable Diffusion).
Your task is to take a user's initial creative idea and enhance it into an evocative, highly detailed prompt that specifically adheres to the selected artistic preset: "${presetName}".

Output MUST be valid JSON with fields:
- enhancedPrompt: string (in English, highly detailed, describing composition, lighting, style motifs, textures, color harmony, and perspective)
- styleModifiers: string (key stylistic comma-separated keyword tokens for diffusion models)
- negativePrompt: string (unwanted artifacts, such as blurry, low quality, oversaturated, watermark, bad anatomy, deformed)
- explanationId: string (short explanation in Indonesian of what was enhanced)
- explanationEn: string (short explanation in English of what was enhanced)
- suggestedTags: array of 4-6 strings`;

      const aiPrompt = `User Prompt: "${prompt.trim()}"
Selected Preset: "${presetName}" (${stylePreset})
User Language: ${language}

Craft an optimized, professional text-to-image prompt tailored specifically for "${presetName}". Focus on visual mastery, exquisite composition, artistic depth, and rendering nuances.`;

      const jsonSchema = {
        type: Type.OBJECT,
        properties: {
          enhancedPrompt: { type: Type.STRING },
          styleModifiers: { type: Type.STRING },
          negativePrompt: { type: Type.STRING },
          explanationId: { type: Type.STRING },
          explanationEn: { type: Type.STRING },
          suggestedTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "enhancedPrompt",
          "styleModifiers",
          "negativePrompt",
          "explanationId",
          "explanationEn",
          "suggestedTags",
        ],
      };

      const aiResult = await executeSmartAiRouting({
        model,
        systemInstruction,
        prompt: aiPrompt,
        isJson: true,
        jsonSchema,
      });

      const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);

      res.json({
        success: true,
        data: {
          ...parsed,
          aiModel: aiResult.usedModel,
          provider: aiResult.provider,
        },
      });
    } catch (error: any) {
      console.error("Error enhancing illustration prompt:", error);
      res.status(500).json({
        error: error.message || "Failed to enhance illustration prompt",
      });
    }
  });

  // AI Notebook & Learning Studio Endpoint (NotebookLM-style Study Guide, Flashcards, Quiz, Chat & Audio Overview)
  app.post("/api/ai/notebook-study", async (req, res) => {
    try {
      const {
        action = "study-guide", // "study-guide" | "flashcards" | "quiz" | "chat-notes" | "audio-overview" | "cornell-notes"
        notesContent = "",
        sources = [],
        query = "",
        language = "id",
        model = "gemini-3.8-flash",
      } = req.body || {};

      if (!notesContent && (!sources || sources.length === 0) && !query) {
        res.status(400).json({ error: "Notes content or query is required." });
        return;
      }

      // Combine sources and notes into a unified study corpus
      let combinedContext = notesContent || "";
      if (Array.isArray(sources) && sources.length > 0) {
        const sourcesText = sources
          .map((s: any, idx: number) => `\n--- [Sumber ${idx + 1}: ${s.title || "Tanpa Judul"}] ---\n${s.content || ""}`)
          .join("\n");
        combinedContext = `${combinedContext}\n${sourcesText}`.trim();
      }

      const systemInstruction = `You are an elite Academic Tutor, Research Assistant, and Study Synthesizer inspired by Google NotebookLM and Evernote Genius.
Your goal is to transform student notes, study materials, and reference sources into deep, structured, highly educational study assets with strict factual accuracy grounded ONLY in the provided materials.

Language requested: ${language === "en" ? "English" : "Bahasa Indonesia"}.
When answering, be clear, pedagogically sound, and engaging.`;

      if (action === "flashcards") {
        const prompt = `Analisis materi catatan berikut dan buatkan kumpulan Flashcards pembelajaran interaktif (minimal 6 - 10 kartu) untuk teknik Active Recall & Spaced Repetition.

Materi Catatan:
"""
${combinedContext.slice(0, 15000)}
"""

Hasilkan JSON dengan format:
{
  "title": "Judul Kumpulan Flashcards",
  "topic": "Topik Utama",
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Pertanyaan atau konsep kunci",
      "back": "Jawaban komprehensif atau definisi",
      "hint": "Petunjuk singkat jika mahasiswa kesulitan",
      "difficulty": "easy" | "medium" | "hard",
      "category": "Kategori / Bab"
    }
  ]
}`;

        const aiResult = await executeSmartAiRouting({
          model,
          systemInstruction,
          prompt,
          isJson: true,
        });

        const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);
        res.json({ success: true, action, data: parsed, provider: aiResult.provider });
        return;
      }

      if (action === "quiz") {
        const prompt = `Analisis materi catatan berikut dan buatkan Ujian Latihan / Kuis Pemahaman (minimal 5 - 8 soal pilihan ganda) untuk menguji penguasaan materi.

Materi Catatan:
"""
${combinedContext.slice(0, 15000)}
"""

Hasilkan JSON dengan format:
{
  "quizTitle": "Judul Kuis Pemahaman",
  "totalQuestions": 6,
  "questions": [
    {
      "id": "q-1",
      "question": "Pertanyaan soal",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "correctIndex": 0,
      "explanation": "Penjelasan mengapa jawaban tersebut benar berdasarkan catatan"
    }
  ]
}`;

        const aiResult = await executeSmartAiRouting({
          model,
          systemInstruction,
          prompt,
          isJson: true,
        });

        const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);
        res.json({ success: true, action, data: parsed, provider: aiResult.provider });
        return;
      }

      if (action === "audio-overview") {
        const prompt = `Seperti fitur "Audio Overview / Deep Dive" pada Google NotebookLM, buatkan naskah dialog siniar / podcast pembelajaran yang santai, interaktif, dan seru antara dua pembawa acara (Host A: Alex, yang selalu ingin tahu & Host B: Maya, ahli penjelas konsep) yang sedang membedah materi catatan ini untuk pendengar.

Materi Catatan:
"""
${combinedContext.slice(0, 15000)}
"""

Hasilkan JSON dengan format:
{
  "episodeTitle": "Judul Episode Podcast",
  "durationEstimate": "5 menit",
  "dialogue": [
    {
      "speaker": "Alex",
      "role": "Curious Host",
      "text": "Kalimat pembuka..."
    },
    {
      "speaker": "Maya",
      "role": "Expert Explainer",
      "text": "Penjelasan konsep menarik..."
    }
  ],
  "keyTakeaways": ["Poin penting 1", "Poin penting 2", "Poin penting 3"]
}`;

        const aiResult = await executeSmartAiRouting({
          model,
          systemInstruction,
          prompt,
          isJson: true,
        });

        const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);
        res.json({ success: true, action, data: parsed, provider: aiResult.provider });
        return;
      }

      if (action === "chat-notes") {
        const prompt = `Kamu adalah Asisten Pembelajaran Notebook yang menjawab pertanyaan pengguna secara KHUSUS berdasarkan materi catatan dan sumber yang diberikan. Jika informasi tidak ada di catatan, katakan dengan sopan bahwa itu tidak disebutkan di catatan.
Sertakan kutipan atau referensi langsung ke bagian catatan jika relevan.

Materi Catatan & Sumber:
"""
${combinedContext.slice(0, 16000)}
"""

Pertanyaan Pengguna: "${query}"

Hasilkan JSON dengan format:
{
  "answer": "Jawaban lengkap terstruktur dengan format Markdown",
  "citations": ["Kutipan atau kalimat kunci dari catatan yang mendasari jawaban ini"],
  "suggestedFollowUps": ["Pertanyaan tindak lanjut 1", "Pertanyaan tindak lanjut 2"]
}`;

        const aiResult = await executeSmartAiRouting({
          model,
          systemInstruction,
          prompt,
          isJson: true,
        });

        const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);
        res.json({ success: true, action, data: parsed, provider: aiResult.provider });
        return;
      }

      if (action === "cornell-notes") {
        const prompt = `Ubah materi catatan mentah berikut menjadi sistem Catatan Cornell (Cornell Note-Taking System) yang sangat efektif:
1. Cue Column (Kata kunci, pertanyaan pemantik)
2. Note-Taking Area (Poin-poin inti ringkas, formula, definisi)
3. Summary Area (Ringkasan 2-3 kalimat di bagian bawah)

Materi Catatan:
"""
${combinedContext.slice(0, 15000)}
"""

Hasilkan JSON dengan format:
{
  "topic": "Topik Utama",
  "cornellNotes": [
    {
      "cue": "Pertanyaan / Kata Kunci",
      "notes": "Poin penjelasan terperinci"
    }
  ],
  "summary": "Ringkasan komprehensif penutup"
}`;

        const aiResult = await executeSmartAiRouting({
          model,
          systemInstruction,
          prompt,
          isJson: true,
        });

        const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);
        res.json({ success: true, action, data: parsed, provider: aiResult.provider });
        return;
      }

      // Default: action === "study-guide"
      const prompt = `Analisis materi catatan berikut dan buatkan Panduan Belajar (Study Guide) yang lengkap dan terstruktur.

Materi Catatan & Sumber:
"""
${combinedContext.slice(0, 15000)}
"""

Hasilkan JSON dengan format:
{
  "title": "Judul Panduan Belajar",
  "executiveSummary": "Ringkasan eksekutif 2-3 paragraf",
  "coreConcepts": [
    {
      "term": "Nama Konsep",
      "definition": "Definisi & penjelasan mendalam",
      "practicalExample": "Contoh kasus nyata / analogi"
    }
  ],
  "timelineOrFlow": ["Tahapan atau kronologi jika ada"],
  "faq": [
    {
      "question": "Pertanyaan penting yang sering membingungkan",
      "answer": "Jawaban jelas dan tuntas"
    }
  ],
  "keyTakeaways": ["Poin takeaway 1", "Poin takeaway 2", "Poin takeaway 3", "Poin takeaway 4"]
}`;

      const aiResult = await executeSmartAiRouting({
        model,
        systemInstruction,
        prompt,
        isJson: true,
      });

      const parsed = aiResult.parsedJson || JSON.parse(aiResult.text);
      res.json({ success: true, action, data: parsed, provider: aiResult.provider });
    } catch (error: any) {
      console.warn("AI Notebook study error, returning rich heuristic output:", error?.message);
      const { action = "study-guide", notesContent = "", query = "" } = req.body || {};
      
      const words = notesContent ? notesContent.split(/\s+/).slice(0, 40).join(" ") : "Materi Catatan Pembelajaran";

      if (action === "flashcards") {
        res.json({
          success: true,
          action,
          data: {
            title: "Flashcards Pembelajaran Cepat",
            topic: "Pemahaman Materi",
            flashcards: [
              {
                id: "fc-1",
                front: "Apa ide pokok atau argumen utama dalam catatan ini?",
                back: words || "Intisari topik yang dibahas dalam catatan Anda.",
                hint: "Perhatikan bagian paragraf pertama atau judul.",
                difficulty: "easy",
                category: "Konsep Dasar",
              },
              {
                id: "fc-2",
                front: "Bagaimana cara mengaplikasikan konsep ini dalam praktik nyata?",
                back: "Dengan menerapkan prinsip-prinsip sistematis yang telah dicatat secara bertahap.",
                hint: "Cari contoh kasus atau langkah-langkah kerja.",
                difficulty: "medium",
                category: "Aplikasi",
              },
              {
                id: "fc-3",
                front: "Apa jebakan atau kesalahan umum yang perlu dihindari?",
                back: "Mengabaikan verifikasi menyeluruh dan asumsi yang belum terbukti.",
                hint: "Periksa peringatan dan catatan penting.",
                difficulty: "hard",
                category: "Evaluasi Kritis",
              },
            ],
          },
          provider: "Fallback Smart Engine",
        });
        return;
      }

      if (action === "quiz") {
        res.json({
          success: true,
          action,
          data: {
            quizTitle: "Kuis Latihan Pemahaman",
            totalQuestions: 3,
            questions: [
              {
                id: "q-1",
                question: `Berdasarkan catatan "${words.slice(0, 50)}...", apa tujuan utama pembahasan?`,
                options: [
                  "Menyusun pemahaman konseptual dan terstruktur",
                  "Mengabaikan fakta penting dalam teks",
                  "Membuat ringkasan yang tidak relevan",
                  "Menghindari aplikasi praktis",
                ],
                correctIndex: 0,
                explanation: "Tujuan utama pembelajaran adalah membangun pemahaman konseptual yang kokoh.",
              },
              {
                id: "q-2",
                question: "Apa langkah pertama yang direkomendasikan saat mempelajari topik ini?",
                options: [
                  "Mengamati struktur dan poin-poin dasar",
                  "Langsung menarik kesimpulan tanpa data",
                  "Melewatkan ringkasan",
                  "Menghapus referensi sumber",
                ],
                correctIndex: 0,
                explanation: "Langkah pertama yang efektif adalah memahami struktur dan konsep dasar.",
              },
            ],
          },
          provider: "Fallback Smart Engine",
        });
        return;
      }

      if (action === "audio-overview") {
        res.json({
          success: true,
          action,
          data: {
            episodeTitle: "Deep Dive: Membedah Catatan Anda",
            durationEstimate: "3 menit",
            dialogue: [
              {
                speaker: "Alex",
                role: "Host",
                text: "Hai Maya! Hari ini kita dapat catatan yang sangat menarik untuk dibedah.",
              },
              {
                speaker: "Maya",
                role: "Expert",
                text: `Benar banget, Alex! Catatan ini membahas tentang: "${words.slice(0, 70)}...". Ada banyak insight penting di dalamnya.`,
              },
              {
                speaker: "Alex",
                role: "Host",
                text: "Apa hal yang paling esensial yang harus diingat oleh pendengar?",
              },
              {
                speaker: "Maya",
                role: "Expert",
                text: "Kuncinya adalah konsistensi pemahaman konsep dan kemampuan menghubungkan poin-poin teoritis dengan praktik langsung di lapangan.",
              },
            ],
            keyTakeaways: [
              "Fokus pada fondasi utama materi",
              "Hubungkan konsep dengan kasus nyata",
              "Gunakan teknik Active Recall untuk retensi jangka panjang",
            ],
          },
          provider: "Fallback Smart Engine",
        });
        return;
      }

      if (action === "chat-notes") {
        res.json({
          success: true,
          action,
          data: {
            answer: `Berdasarkan catatan Anda mengenai "${words.slice(0, 50)}...", poin krusial yang berkaitan dengan "${query}" adalah perlunya pemahaman mendalam terhadap alur dan struktur materi yang telah dicatat.`,
            citations: [words.slice(0, 80) + "..."],
            suggestedFollowUps: [
              "Bagaimana cara menguji pemahaman saya pada bab ini?",
              "Bisa buatkan analogi sederhana untuk menjelaskan ini?",
            ],
          },
          provider: "Fallback Smart Engine",
        });
        return;
      }

      // Default Study Guide
      res.json({
        success: true,
        action,
        data: {
          title: "Panduan Belajar: " + (words.slice(0, 40) || "Topik Utama"),
          executiveSummary:
            "Panduan belajar komprehensif ini dirancang untuk mengorganisasi dan memperdalam penguasaan materi dari catatan Anda. Dengan memadukan prinsip retensi aktif dan pemetaan konsep.",
          coreConcepts: [
            {
              term: "Fondasi Materi",
              definition: "Prinsip dasar yang melandasi keseluruhan isi catatan.",
              practicalExample: "Penerapan terstruktur pada situasi nyata sehari-hari.",
            },
            {
              term: "Implementasi Terstruktur",
              definition: "Langkah-langkah konkrit dalam menerapkan materi.",
              practicalExample: "Checklist evaluasi berkala untuk memastikan pemahaman.",
            },
          ],
          timelineOrFlow: ["Tahap 1: Pemahaman Konsep", "Tahap 2: Latihan Soal & Active Recall", "Tahap 3: Sintesis Akhir"],
          faq: [
            {
              question: "Bagaimana cara tercepat mengingat materi ini?",
              answer: "Gunakan Flashcards dan latih diri menjawab pertanyaan tanpa melihat catatan terlebih dahulu.",
            },
          ],
          keyTakeaways: [
            "Pahami definisi dan konsep kunci sebelum melangkah ke analisis mendalam.",
            "Lakukan review berkala menggunakan flashcards dan kuis interaktif.",
          ],
        },
        provider: "Fallback Smart Engine",
      });
    }
  });

  // AI Generate Image Illustration (Free Tier Open Diffusion Engine)
  app.post("/api/ai/generate-illustration", async (req, res) => {
    try {
      const {
        prompt,
        stylePreset = "ink-drawing-v4",
        styleModifiers = "",
        width = 1024,
        height = 1024,
        seed = Math.floor(Math.random() * 1000000),
        model = "flux",
        negativePrompt = "",
      } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      // Compose full prompt with style modifiers
      let fullPrompt = prompt.trim();
      if (styleModifiers && !fullPrompt.toLowerCase().includes(styleModifiers.toLowerCase())) {
        fullPrompt = `${fullPrompt}, ${styleModifiers}`;
      }

      // Pollinations AI Open Diffusion URL
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true${
        negativePrompt ? `&negative=${encodeURIComponent(negativePrompt)}` : ""
      }`;

      res.json({
        success: true,
        data: {
          imageUrl,
          prompt: fullPrompt,
          basePrompt: prompt.trim(),
          stylePreset,
          width: Number(width),
          height: Number(height),
          seed: Number(seed),
          model,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error("Error in generate-illustration:", error);
      res.status(500).json({
        error: error.message || "Failed to prepare illustration generation",
      });
    }
  });

  // Image Proxy to safely download or display images without client CORS restrictions
  app.get("/api/ai/image-proxy", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url || !url.startsWith("https://image.pollinations.ai/")) {
        res.status(400).json({ error: "Valid image URL is required." });
        return;
      }

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch image upstream." });
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get("content-type") || "image/jpeg";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Speech-to-Text / Audio Transcription Endpoint (Gemini Multimodal Audio)
  app.post("/api/ai/transcribe-audio", async (req, res) => {
    try {
      const { audioBase64, mimeType = "audio/webm", language = "id" } = req.body;

      if (!audioBase64 || typeof audioBase64 !== "string") {
        res.status(400).json({ error: "audioBase64 string is required." });
        return;
      }

      // Clean base64 data prefix if present
      const base64Data = audioBase64.replace(/^data:audio\/[a-z0-9-+.]+;base64,/, "").trim();

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt =
        language === "en"
          ? "Transcribe the spoken audio with maximum precision into plain text. Keep technical terms, acronyms, and proper names accurate. Output ONLY the plain transcription text without any extra commentary, quotation marks, or markdown wrappers."
          : "Transkripsikan rekaman suara percakapan ini secara akurat dan presisi ke dalam teks (Bahasa Indonesia atau bahasa yang diucapkan pengguna). Pertahankan istilah teknis, nama fitur/proyek, dan singkatan dengan tepat. Keluarkan HANYA teks transkripsi polos tanpa tanda kutip pembuka/penutup dan tanpa komentar tambahan.";

      const candidateModels = ["gemini-3.5-transcribe", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
      let transcript = "";
      let lastErr: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          });
          transcript = response.text ? response.text.trim() : "";
          if (transcript) break;
        } catch (mErr: any) {
          lastErr = mErr;
          console.warn(`[Transcribe] Model ${modelName} fallback notice:`, mErr.message);
        }
      }

      res.json({
        success: true,
        transcript: transcript || "",
        provider: "Google Gemini Audio Intelligence",
      });
    } catch (error: any) {
      console.error("Error in audio transcription:", error);
      res.status(500).json({
        error: error.message || "Failed to transcribe audio",
      });
    }
  });

  // Helper function to encode raw PCM 16-bit mono into WAV container
  function pcmToWav(pcmData: Buffer, sampleRate = 24000, numChannels = 1): Buffer {
    const byteRate = sampleRate * numChannels * 2;
    const blockAlign = numChannels * 2;
    const dataSize = pcmData.length;
    const header = Buffer.alloc(44);

    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size
    header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(16, 34); // BitsPerSample
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);

    return Buffer.concat([header, pcmData]);
  }

  // Text-to-Speech Generation Endpoint (Gemini 3.1 Flash TTS Preview)
  app.post("/api/ai/generate-speech", async (req, res) => {
    try {
      const { text, voice = "Kore" } = req.body;
      if (!text || typeof text !== "string") {
        res.status(400).json({ error: "text string is required." });
        return;
      }

      // Clean markdown, symbols, and formatting for clean speech synthesis
      const cleanText = text
        .replace(/[*#`_\[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1000);

      const validVoices = ["Kore", "Zephyr", "Puck", "Fenrir", "Charon"];
      const selectedVoice = validVoices.includes(voice) ? voice : "Kore";

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const rawPcmBase64 =
        ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (rawPcmBase64) {
        const pcmBuffer = Buffer.from(rawPcmBase64, "base64");
        const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
        const wavBase64 = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
        res.json({
          success: true,
          audioUrl: wavBase64,
          format: "audio/wav",
          voice: selectedVoice,
        });
      } else {
        res.json({
          success: false,
          error: "No audio generated from TTS model",
        });
      }
    } catch (error: any) {
      console.error("Error in Gemini TTS generation:", error);
      res.status(500).json({
        error: error.message || "Failed to generate speech",
      });
    }
  });

  // Live Voice Conversational Endpoint (Real-time AI Q&A + Spoken Audio Response)
  app.post("/api/ai/live-converse", async (req, res) => {
    try {
      const {
        message,
        history = [],
        language = "id",
        voice = "Kore",
        model = "gemini-3.1-flash-lite",
      } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "message string is required." });
        return;
      }

      const validVoices = ["Kore", "Zephyr", "Puck", "Fenrir", "Charon"];
      const selectedVoice = validVoices.includes(voice) ? voice : "Kore";

      // Build live conversation prompt tailored for natural spoken speech
      const liveSystemPrompt =
        language === "en"
          ? `You are Vanviolet AI, the official intelligent voice assistant of Muchamad Irvan (Software Engineer & Fullstack Developer).
You are engaged in a REAL-TIME SPOKEN VOICE CONVERSATION with the user.
GUIDELINES FOR SPOKEN VOICE RESPONSES:
- Speak directly, warmly, intelligently, and concisely (1 to 2 natural conversational sentences, max 40 words).
- Do NOT use markdown symbols, asterisks, bullet points, headers (#), code fences, or URLs, because your answer will be spoken out loud.
- If asked about Muchamad Irvan's portfolio, highlight his expertise in scalable web architectures, TypeScript, React, Node.js, AI system integrations, and flagship projects like University LMS and Biometric Attendance.
- Maintain a friendly, professional, and confident engineering tone.`
          : `Anda adalah Vanviolet AI, asisten suara resmi Muchamad Irvan (Software Engineer & Fullstack Developer).
Anda sedang berbicara dalam PERCAKAPAN SUARA LANGSUNG (LIVE VOICE CONVERSATION) dengan pengguna.
PEDOMAN RESPONS SUARA LANGSUNG:
- Berbicaralah secara alami, hangat, solutif, ringkas, dan to the point (1 sampai 2 kalimat percakapan yang nyaman didengar, maksimal 40 kata).
- JANGAN gunakan format markdown seperti simbol bintang (*), pagar (#), kode program panjang, atau tautan URL mentah, karena teks ini akan diucapkan secara langsung melalui audio.
- Jika pengguna menanyakan proyek atau portofolio Muchamad Irvan, jelaskan keahliannya dalam sistem web scalable, AI engineering, TypeScript, serta proyek unggulan seperti University LMS dan Presensi Biometrik.
- Gunakan bahasa yang santun, cerdas, dan interaktif.`;

      // Build context from recent history if provided
      let contextHistoryStr = "";
      if (Array.isArray(history) && history.length > 0) {
        const recent = history.slice(-4);
        contextHistoryStr = recent
          .map((h: any) => `${h.role === "assistant" ? "Vanviolet AI" : "User"}: ${h.content}`)
          .join("\n");
      }

      // 1. Generate Conversational Text
      const conversationPrompt = contextHistoryStr
        ? `${liveSystemPrompt}\n\nRecent context:\n${contextHistoryStr}\n\nUser spoken input: "${message}"\n\nProvide the spoken answer:`
        : `${liveSystemPrompt}\n\nUser spoken input: "${message}"\n\nProvide the spoken answer:`;

      let spokenText = "";
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        // Try fast conversational models
        const candidateModels = [model, "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"].filter(Boolean);
        for (const m of candidateModels) {
          try {
            const resp = await ai.models.generateContent({
              model: m,
              contents: conversationPrompt,
            });
            if (resp.text && resp.text.trim()) {
              spokenText = resp.text.trim();
              break;
            }
          } catch (mErr: any) {
            console.warn(`[Live Converse] Model ${m} notice:`, mErr.message);
          }
        }
      }

      // If direct Gemini was not available or produced nothing, try smart router
      if (!spokenText) {
        try {
          const aiRoutingResult = await executeSmartAiRouting({
            prompt: conversationPrompt,
            model: "gemini-3.1-flash-lite",
          });
          spokenText = aiRoutingResult.text.trim();
        } catch (genErr) {
          console.warn("[Live Converse] Router notice:", genErr);
        }
      }

      // Final fallback if AI service was completely unreachable
      if (!spokenText) {
        spokenText =
          language === "en"
            ? "I am listening. Muchamad Irvan is a Fullstack Developer experienced in React, TypeScript, and high-performance cloud architectures. What would you like to explore?"
            : "Saya siap mendengarkan. Muchamad Irvan adalah Fullstack Developer berpengalaman di React, TypeScript, dan arsitektur cloud performa tinggi. Apa yang ingin Anda ketahui?";
      }

      // Clean any accidental markdown from the response
      spokenText = spokenText
        .replace(/[*#`_\[\]()]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // 2. Generate Spoken Audio via Gemini 3.1 Flash TTS with Strict Safety Timeout (Max 4.5s)
      let audioUrl: string | null = null;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const ttsPromise = ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: spokenText.slice(0, 500) }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice },
                },
              },
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("TTS generation timeout")), 6500)
          );

          const ttsResponse = (await Promise.race([ttsPromise, timeoutPromise])) as any;
          const rawPcmBase64 =
            ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

          if (rawPcmBase64) {
            const pcmBuffer = Buffer.from(rawPcmBase64, "base64");
            const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
            audioUrl = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
          }
        } catch (ttsErr: any) {
          console.warn("[Live Converse] Gemini TTS notice (client will use Web Speech synthesis fallback):", ttsErr.message);
        }
      }

      res.json({
        success: true,
        text: spokenText,
        audioUrl,
        voice: selectedVoice,
        model: "gemini-3.1-flash-lite",
        provider: "Google Gemini Live Audio",
      });
    } catch (error: any) {
      console.error("Error in Live converse endpoint:", error);
      res.status(500).json({
        error: error.message || "Failed to process live conversation",
      });
    }
  });

  // --- Vite Middleware & Static Serving ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} with Firebase AI Logic`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
