import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Lazy initialize Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is required for Firebase AI Logic / Gemini features");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Resilient retry wrapper for transient 503 / network errors
  async function callGeminiWithRetry<T>(operation: () => Promise<T>, maxRetries = 2, delayMs = 1200): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: any) {
        const errorMsg = String(err?.message || "");
        const isTransient = errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("UNAVAILABLE");
        if (attempt < maxRetries && isTransient) {
          console.warn(`[AI Logic] Transient Gemini spike detected, retrying (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Maximum retry attempts reached");
  }

  // --- API Routes (Mounted BEFORE Vite middleware) ---

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      aiEngine: "Firebase AI Logic (Powered by Gemini 3.8 Flash)",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Generate Article Endpoint
  app.post("/api/ai/generate-article", async (req, res) => {
    try {
      const { topic, category = "Learning (AI)", keyPoints = "", language = "id" } = req.body;

      if (!topic || typeof topic !== "string" || !topic.trim()) {
        res.status(400).json({ error: "Topic/Title outline is required." });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `Anda adalah Asisten Penulis Teknis dan Arsitek Sistem (Firebase AI Logic).
Tolong buatkan draf artikel teknis yang sangat mendalam, akurat, dan komprehensif berdasarkan input berikut:
- Topik / Judul: "${topic.trim()}"
- Kategori: "${category}"
${keyPoints ? `- Poin-poin kunci: "${keyPoints}"` : ""}
- Bahasa Utama: ${language === "en" ? "English" : "Bahasa Indonesia"}

Format keluaran HARUS berformat JSON valid dengan struktur berikut:
- titleId: Judul dalam Bahasa Indonesia
- titleEn: Title in English
- category: Kategori yang sesuai
- tags: Array string tag teknis (3-5 tag)
- summaryId: Ringkasan padat 2-3 kalimat dalam Bahasa Indonesia
- summaryEn: Summary in English (2-3 sentences)
- readTime: Estimasi waktu baca (contoh: "6 min read")
- content: Isi artikel lengkap dalam format Markdown dengan heading (##), formula LaTeX jika ada ($$...$$), pemanggilan kata kunci Vanpedia dengan format [[slug]], dan blok kode implementasi nyata.`;

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are a technical AI writer that generates structured, publication-ready technical articles.",
            responseMimeType: "application/json",
            responseSchema: {
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
            },
          },
        })
      );

      const text = response.text;
      if (!text) {
        throw new Error("No response generated from Gemini model");
      }

      const parsedData = JSON.parse(text);

      res.json({
        success: true,
        data: {
          ...parsedData,
          isAiAssisted: true,
          aiModel: "Gemini 3.8 Flash (Firebase AI Logic)",
        },
      });
    } catch (error: any) {
      console.error("Error generating article:", error);
      res.status(500).json({
        error: error.message || "Failed to generate article using AI Logic",
      });
    }
  });

  // Generate Vanpedia Term Endpoint
  app.post("/api/ai/generate-vanpedia", async (req, res) => {
    try {
      const { termName, category = "Learning (AI)", details = "" } = req.body;

      if (!termName || typeof termName !== "string" || !termName.trim()) {
        res.status(400).json({ error: "Term name is required." });
        return;
      }

      const ai = getGeminiClient();
      const prompt = `Anda adalah Leksikografer Teknis dan Ahli Rekayasa Perangkat Lunak (Firebase AI Logic).
Tolong buatkan entri kamus ensiklopedia teknis untuk "Vanpedia" berdasarkan istilah berikut:
- Nama Istilah: "${termName.trim()}"
- Kategori: "${category}"
${details ? `- Catatan: "${details}"` : ""}

Keluaran HARUS berupa JSON dengan properti:
- termId: Nama istilah dalam Bahasa Indonesia
- termEn: Term name in English
- slug: URL-friendly slug (huruf kecil, spasi diganti strip)
- category: Kategori
- phonetic: Notasi fonetik IPA (contoh: "/məˈʃiːn ˈlɜːrnɪŋ/")
- definitionId: Definisi formal 1-2 kalimat dalam Bahasa Indonesia
- definitionEn: Formal 1-2 sentence definition in English
- formula: Formula matematis atau arsitektural (bisa dikosongkan bila tidak relevan)
- examples: Array 2-3 contoh penerapan nyata
- content: Penjelasan mendalam dalam Markdown (heading ## Konsep Inti, ## Implementasi di Industri, ## Kesalahan Pemahaman Umum)`;

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an encyclopedic technical lexicographer creating authoritative glossary entries.",
            responseMimeType: "application/json",
            responseSchema: {
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
            },
          },
        })
      );

      const text = response.text;
      if (!text) {
        throw new Error("No response generated from Gemini model");
      }

      const parsedData = JSON.parse(text);

      res.json({
        success: true,
        data: {
          ...parsedData,
          isAiAssisted: true,
          aiModel: "Gemini 3.8 Flash (Firebase AI Logic)",
        },
      });
    } catch (error: any) {
      console.error("Error generating Vanpedia term:", error);
      res.status(500).json({
        error: error.message || "Failed to generate Vanpedia term using AI Logic",
      });
    }
  });

  // AI Assistant endpoint (General queries, Q&A assistance, proofreading, summaries)
  app.post("/api/ai/assist", async (req, res) => {
    try {
      const { prompt, task = "general", context = "" } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      const ai = getGeminiClient();
      let systemInstruction = "Anda adalah asisten AI cerdas (Firebase AI Logic) untuk portal Muchamad Irvan yang memberikan jawaban teknis yang tepat, padat, dan elegan.";
      
      if (task === "qa_answer") {
        systemInstruction = "Anda adalah Software Engineer Senior. Berikan jawaban teknis komprehensif dengan kode jika relevan untuk menjawab pertanyaan developer.";
      } else if (task === "summary") {
        systemInstruction = "Buat ringkasan padat dan informatif dari teks yang diberikan.";
      }

      const fullContents = context ? `Konteks:\n${context}\n\nPermintaan:\n${prompt}` : prompt;

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: fullContents,
          config: {
            systemInstruction,
          },
        })
      );

      res.json({
        success: true,
        result: response.text || "",
        aiModel: "Gemini 3.8 Flash",
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
