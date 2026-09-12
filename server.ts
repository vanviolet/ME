import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Type } from "@google/genai";
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

      const SYSTEM_KNOWLEDGE_PROMPT = `Anda adalah "VanBot", AI Assistant cerdas, ramah, dan sangat kompeten di website portofolio Van (Software Engineer & AI System Architect).

### Profil & Latar Belakang Van:
- **Nama/Panggilan**: Van
- **Keahlian Utama**: Arsitektur Full-Stack Modern (TypeScript, React 19, Next.js, Node.js/Express, Tailwind CSS), AI Engineering (Google Gemini API, DeepSeek, LangChain, PyTorch, Multi-tier LLM Cascades, Edge AI), dan Sistem Database Terdistribusi (PostgreSQL, Firebase Firestore, Vector DBs).
- **Filosofi & Pendekatan**: Craftsmanship tinggi, Zero-AI Slop (menolak UI generic, mengutamakan tipografi presisi, matematika layout, dan performa tinggi), Resilient Systems, Clean Code.
- **Fitur Spesial di Website**:
  1. **Articles & Research**: Blog teknis mendalam tentang AI, rekayasa perangkat lunak, dan arsitektur sistem dengan visualisasi rumus matematika (KaTeX) dan kode produksi.
  2. **Vanpedia (Tech Lexicon)**: Glosarium & ensiklopedia istilah teknis/AI interaktif dengan definisi bilingual, formula matematis, notasi fonetik IPA, dan contoh nyata.
  3. **Issues / Problem Tracker**: Pelacak masalah sistem dan solusi rekayasa.
  4. **Universal AI Studio Router**: Sistem routing AI multi-tier yang tangguh tanpa dependensi eksternal.

### Peran & Gaya Komunikasi Anda:
- Jawablah dengan nada ramah, profesional, solutif, dan sangat terstruktur.
- Gunakan bahasa yang sama dengan yang digunakan pengguna (Bahasa Indonesia secara default, atau Bahasa Inggris jika user bertanya dalam bahasa Inggris).
- Jika pengguna bertanya tentang pengalaman atau proyek Van, berikan penjelasan menarik dan arahkan mereka ke bagian yang relevan (Projects, Articles, atau Vanpedia).
- Jika pengguna bertanya konsep teknis, jelaskan secara jelas, runtut, berikan contoh kode jika perlu, atau referensikan istilah di Vanpedia (gunakan format [[slug-istilah]] jika merujuk istilah teknis).
- Format jawaban dengan Markdown rapi (bullet point, bold, heading bila perlu, dan kode dengan syntax highlighting).
`;

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
        `Memproses pertanyaan: "${lastUserQuery.slice(0, 60)}${lastUserQuery.length > 60 ? "..." : ""}"`,
        `Mencocokkan dengan basis pengetahuan (Portofolio, Vanpedia, & Engineering Guides)`,
        `Memilih jalur inferensi (${routerRes.usedModel}) dengan latensi optimal`,
        `Menyusun respon ramah dan komprehensif berstandar produksi`,
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
      const { topic, category = "Learning (AI)", keyPoints = "", language = "id", model = "gemini-3.8-flash" } = req.body;

      if (!topic || typeof topic !== "string" || !topic.trim()) {
        res.status(400).json({ error: "Topic/Title outline is required." });
        return;
      }

      const systemInstruction =
        "You are a technical AI writer that generates structured, publication-ready technical articles in JSON format.";

      const prompt = `Anda adalah Penulis Teknis dan Arsitek Sistem Senior.
Tolong buatkan draf artikel teknis yang mendalam, terstruktur rapi, berbobot, dan aplikatif berdasarkan input berikut:
- Topik / Judul: "${topic.trim()}"
- Kategori: "${category}"
${keyPoints ? `- Poin-poin kunci: "${keyPoints}"` : ""}
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
- category: Kategori yang sesuai
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
      const { termName, category = "Learning (AI)", details = "", model = "gemini-3.8-flash" } = req.body;

      if (!termName || typeof termName !== "string" || !termName.trim()) {
        res.status(400).json({ error: "Term name is required." });
        return;
      }

      const systemInstruction =
        "You are an encyclopedic technical lexicographer creating authoritative glossary entries in JSON format.";

      const prompt = `Anda adalah Leksikografer Teknis Rekayasa Perangkat Lunak dan AI.
Tolong buatkan entri kamus istilah teknis untuk "Vanpedia" yang RINGKAS, PADAT, AKURAT, dan SANGAT JELAS (tidak bertele-tele, tidak panjang-panjang, fokus pada esensi dan pemahaman praktis):
- Nama Istilah: "${termName.trim()}"
- Kategori: "${category}"
${details ? `- Catatan Khusus: "${details}"` : ""}

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
- category: Kategori
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
