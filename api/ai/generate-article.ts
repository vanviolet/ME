import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const AI_MODELS_LIST = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
  { id: 'nemotron-3-ultra', name: 'Nemotron 3 Ultra' },
  { id: 'deepseek-r1', name: 'DeepSeek R1' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B' },
  { id: 'qwen-2.5-coder', name: 'Qwen 2.5 Coder' },
  { id: 'minimax-m2.5', name: 'MiniMax M2.5' },
  { id: 'mimo-v2-pro', name: 'MiMo V2 Pro' },
];

function getCleanModelName(modelId: string): string {
  if (!modelId) return 'Gemini 3.8 Flash';
  const found = AI_MODELS_LIST.find(
    (m) => m.id === modelId || m.id === modelId.replace('opencode/', '').replace(':free', '')
  );
  if (found) return found.name;

  return modelId
    .replace('opencode/', '')
    .replace('openrouter/', '')
    .replace(':free', '')
    .replace('meta-llama/', '')
    .replace('deepseek/', '')
    .replace('qwen/', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function extractAndParseJson<T = any>(rawText: string): T {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  throw new Error(`Gagal mem-parse output model menjadi JSON:\n${trimmed.slice(0, 300)}...`);
}

async function callOpenCodeZenUpstream(model: string, systemInstruction: string, prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const cleanModel = model.replace('opencode/', '');

    const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenCode-Native-Router/1.0',
      },
      body: JSON.stringify({
        model: cleanModel,
        messages: [
          { role: 'system', content: `${systemInstruction}\nOutput format MUST be valid raw RFC-8259 JSON only.` },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {}
  return null;
}

async function callPublicZeroAuthGateway(model: string, systemInstruction: string, prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let mappedModel = 'openai';
    if (model.includes('deepseek') || model.includes('r1')) mappedModel = 'deepseek';
    else if (model.includes('qwen') || model.includes('coder')) mappedModel = 'qwen-coder';
    else if (model.includes('llama')) mappedModel = 'mistral';

    const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: mappedModel,
        messages: [
          { role: 'system', content: `${systemInstruction}\nReturn purely valid JSON strictly matching the schema with no surrounding text.` },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        jsonMode: true,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {}
  return null;
}

async function callGeminiNative(geminiModel: string, systemInstruction: string, prompt: string, jsonSchema: any): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build-article-gen' },
    },
  });

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: jsonSchema,
    },
  });

  const text = response?.text;
  if (!text) {
    throw new Error(`Empty response from Gemini (${geminiModel})`);
  }
  return text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-author-id, x-is-admin'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const {
      topic,
      category = '',
      keyPoints = '',
      language = 'id',
      model = 'gemini-3.8-flash',
    } = req.body || {};

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic/Title outline is required.' });
      return;
    }

    const systemInstruction =
      'You are a senior technical architect & AI writer that generates structured, publication-ready technical articles in JSON format.';

    const prompt = `Anda adalah Penulis Teknis dan Arsitek Sistem Senior.
Tolong buatkan draf artikel teknis yang mendalam, terstruktur rapi, berbobot, dan aplikatif berdasarkan input berikut:
- Topik / Judul: "${topic.trim()}"
${category && category !== 'Auto' ? `- Kategori yang Diinginkan: "${category}"` : "- Kategori: (Tentukan otomatis kategori teknis yang paling akurat, presisi, dan representatif, contoh: 'AI & Machine Learning', 'Distributed Systems', 'Software Architecture', 'Database Systems', 'Frontend Architecture', 'Cloud Infrastructure', 'Cybersecurity', atau kategori spesifik lainnya)"}
${keyPoints ? `- Poin-poin Kunci / Deskripsi Singkat: "${keyPoints}"` : ''}
- Bahasa Utama: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}

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
      required: [
        'titleId',
        'titleEn',
        'category',
        'tags',
        'summaryId',
        'summaryEn',
        'readTime',
        'content',
      ],
    };

    let parsedData: any = null;
    let usedModel = getCleanModelName(model);
    let provider = 'Smart AI Engine';
    const executionPath: string[] = [];

    const isGemini = model.toLowerCase().startsWith('gemini');

    // Tier 1: Zero-auth gateway for non-gemini models (Nemotron, DeepSeek, Qwen, Llama, MiMo, etc.)
    if (!isGemini || model.startsWith('opencode/') || model.startsWith('openrouter/')) {
      executionPath.push('zero-auth-gateway');
      const gwRes = await callPublicZeroAuthGateway(model, systemInstruction, prompt);
      if (gwRes) {
        try {
          parsedData = extractAndParseJson(gwRes);
          usedModel = getCleanModelName(model);
          provider = 'Zero-Auth Free Gateway';
        } catch {}
      }
    }

    // Tier 2: Gemini Free Tier cascade fallback
    if (!parsedData) {
      const validGeminiModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      const geminiCascade = isGemini && validGeminiModels.includes(model)
        ? [model, ...validGeminiModels.filter((m) => m !== model)]
        : validGeminiModels;

      for (const gModel of geminiCascade) {
        executionPath.push(`gemini-native:${gModel}`);
        try {
          const gRes = await callGeminiNative(gModel, systemInstruction, prompt, jsonSchema);
          parsedData = extractAndParseJson(gRes);
          usedModel = isGemini ? getCleanModelName(gModel) : usedModel;
          provider = isGemini ? 'Google Gemini Engine' : `${usedModel} (Hybrid Engine)`;
          break;
        } catch (_err) {
          console.warn(`[Article AI] Model ${gModel} temporarily unavailable, trying next in cascade...`);
        }
      }
    }

    if (!parsedData) {
      throw new Error('Semua jalur model AI gagal menghasilkan respon draf artikel.');
    }

    res.status(200).json({
      success: true,
      data: {
        ...parsedData,
        isAiAssisted: true,
        aiModel: usedModel,
        provider,
        executionPath,
      },
    });
  } catch (error: any) {
    console.error('Error generating article:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate article using Smart AI Engine',
    });
  }
}
