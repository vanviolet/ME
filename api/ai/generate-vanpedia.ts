import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const AI_MODELS_LIST = [
  { id: 'nemotron-3-ultra', name: 'Nemotron 3 Ultra' },
  { id: 'deepseek-r1', name: 'DeepSeek R1' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
  { id: 'mimo-v2-pro', name: 'MiMo V2 Pro' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B' },
  { id: 'qwen-2.5-coder', name: 'Qwen 2.5 Coder' },
  { id: 'minimax-m2.5', name: 'MiniMax M2.5' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
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
    const timeout = setTimeout(() => controller.abort(), 8000);
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
    const timeout = setTimeout(() => controller.abort(), 9000);

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
          { role: 'system', content: `${systemInstruction}\nReturn purely valid JSON strictly matching the schema with no commentary.` },
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
      headers: { 'User-Agent': 'aistudio-build-vanpedia' },
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
    const { termName, category = '', details = '', model = 'gemini-3.8-flash' } = req.body || {};

    if (!termName || typeof termName !== 'string' || !termName.trim()) {
      res.status(400).json({ error: 'Term name is required.' });
      return;
    }

    const systemInstruction =
      'You are an authoritative encyclopedic technical lexicographer creating concise, high-precision glossary entries in JSON format.';

    const prompt = `Anda adalah Leksikografer Teknis Rekayasa Perangkat Lunak dan AI.
Tolong buatkan entri kamus istilah teknis untuk "Vanpedia" yang RINGKAS, PADAT, AKURAT, dan SANGAT JELAS:
- Nama Istilah: "${termName.trim()}"
${category && category !== 'Auto' ? `- Kategori yang Diinginkan: "${category}"` : "- Kategori: (Tentukan otomatis kategori teknis yang paling tepat dan representatif, contoh: 'Learning (AI)', 'Computer Systems', 'Database Systems', 'Distributed Systems', 'Security & Auth', 'Algorithms & Optimization', atau nama kategori lainnya)"}
${details ? `- Catatan Khusus / Deskripsi Singkat: "${details}"` : ''}

Ketentuan Format:
- Jangan menyertakan metafora musik atau audio, fokus murni pada ilmu komputer, software engineering, AI, atau teknologi umum.
- definitionId: Definisi formal 1-2 kalimat presisi dan mudah dipahami dalam Bahasa Indonesia.
- definitionEn: Definisi formal 1-2 kalimat dalam Bahasa Inggris.
- phonetic: Notasi fonetik standar IPA (misal: "/ˈbækˌprɑːpəˈɡeɪʃən/").
- formula: Rumus/notasi matematis singkat jika relevan (kosongkan string jika tidak relevan).
- examples: Array 2-3 contoh penerapan nyata dan singkat di industri modern.
- content: Penjelasan singkat yang jelas dan padat (maksimal 2 sub-bab ringkas: "## Konsep Inti" dan "## Contoh Penerapan Praktis").

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
      required: [
        'termId',
        'termEn',
        'slug',
        'category',
        'phonetic',
        'definitionId',
        'definitionEn',
        'examples',
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
      const geminiCascade = model.startsWith('gemini-')
        ? [model, 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
        : ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];
      
      const uniqueModels = Array.from(new Set(geminiCascade));

      for (const gModel of uniqueModels) {
        executionPath.push(`gemini-native:${gModel}`);
        try {
          const gRes = await callGeminiNative(gModel, systemInstruction, prompt, jsonSchema);
          parsedData = extractAndParseJson(gRes);
          usedModel = gModel;
          provider = 'Google Gemini Free Tier';
          break;
        } catch (err) {
          console.warn(`[Vanpedia AI] Failed on ${gModel}, trying next...`, err);
        }
      }
    }

    if (!parsedData) {
      throw new Error('Semua jalur model AI gagal menghasilkan respon kamus.');
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
    console.error('Error generating Vanpedia term:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate Vanpedia term using Smart AI Engine',
    });
  }
}
