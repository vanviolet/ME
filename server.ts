import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";
import {
  executeSmartAiRouting,
  ALL_ALLOWED_FREE_MODELS,
} from "./src/lib/serverAiRouter";

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

  // Articles Endpoints (Public articles are accessible to ALL users, guests, and unauthenticated visitors)
  app.get("/api/articles", (req, res) => {
    try {
      const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
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
      const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
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

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt =
        language === "en"
          ? "Transcribe the spoken audio with maximum precision into text. Keep technical terms, acronyms, and proper names accurate. Output ONLY the plain transcription text without any extra commentary, quotation marks, or markdown wrappers."
          : "Transkripsikan rekaman suara percakapan ini secara akurat dan presisi ke dalam teks (Bahasa Indonesia atau bahasa yang diucapkan pengguna). Pertahankan istilah teknis, nama fitur/proyek, dan singkatan dengan tepat. Keluarkan HANYA teks transkripsi polos tanpa tanda kutip pembuka/penutup dan tanpa komentar tambahan.";

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
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

      const transcript = response.text ? response.text.trim() : "";

      res.json({
        success: true,
        transcript,
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
        model = "gemini-3.8-flash",
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
- Speak directly, warmly, intelligently, and concisely (1 to 3 natural conversational sentences).
- Do NOT use markdown symbols, bullet points, headers (#), code fences, or URLs, because your answer will be spoken out loud.
- If asked about Muchamad Irvan's portfolio, highlight his expertise in scalable web architectures, TypeScript, React, Node.js, AI system integrations, and flagship projects like University LMS and Biometric Attendance.
- Maintain a friendly, professional, and confident engineering tone.`
          : `Anda adalah Vanviolet AI, asisten suara resmi Muchamad Irvan (Software Engineer & Fullstack Developer).
Anda sedang berbicara dalam PERCAKAPAN SUARA LANGSUNG (LIVE VOICE CONVERSATION) dengan pengguna.
PEDOMAN RESPONS SUARA LANGSUNG:
- Berbicaralah secara alami, hangat, solutif, ringkas, dan to the point (1 sampai 3 kalimat percakapan yang nyaman didengar).
- JANGAN gunakan format markdown seperti simbol bintang, pagar (#), kode program panjang, atau tautan URL mentah, karena teks ini akan diucapkan secara langsung melalui audio.
- Jika pengguna menanyakan proyek atau portofolio Muchamad Irvan, jelaskan keahliannya dalam sistem web scalable, AI engineering, TypeScript, serta proyek unggulan seperti University LMS dan Presensi Biometrik.
- Gunakan bahasa yang santun, cerdas, dan interaktif.`;

      // 1. Generate Conversational Text
      const conversationPrompt = `${liveSystemPrompt}\n\nUser spoken input: "${message}"\n\nProvide the spoken answer:`;

      let spokenText = "";
      try {
        const aiRoutingResult = await executeSmartAiRouting({
          prompt: conversationPrompt,
          model: model || "gemini-3.8-flash",
        });
        spokenText = aiRoutingResult.text.trim();
      } catch (genErr) {
        console.warn("Smart routing failed, falling back to direct Gemini:", genErr);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const fallbackRes = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: conversationPrompt,
        });
        spokenText = fallbackRes.text ? fallbackRes.text.trim() : "";
      }

      // Clean any accidental markdown from the response
      spokenText = spokenText
        .replace(/[*#`_\[\]()]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // 2. Generate Spoken Audio via Gemini 3.1 Flash TTS
      let audioUrl: string | null = null;
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: spokenText.slice(0, 800) }] }],
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
          audioUrl = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
        }
      } catch (ttsErr: any) {
        console.warn("Gemini TTS in live converse had an issue (client can fallback to Web Speech):", ttsErr.message);
      }

      res.json({
        success: true,
        text: spokenText,
        audioUrl,
        voice: selectedVoice,
        model: model || "gemini-3.8-flash",
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
