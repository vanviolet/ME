export interface GeneratedArticleResult {
  titleId: string;
  titleEn: string;
  category: string;
  tags: string[];
  summaryId: string;
  summaryEn: string;
  readTime: string;
  content: string;
  isAiAssisted: boolean;
  aiModel: string;
}

export interface GeneratedVanpediaResult {
  termId: string;
  termEn: string;
  slug: string;
  category: string;
  phonetic: string;
  definitionId: string;
  definitionEn: string;
  formula?: string;
  examples: string[];
  content: string;
  isAiAssisted: boolean;
  aiModel: string;
}

export interface AiModelOption {
  id: string;
  name: string;
  provider: 'OpenCode Free (No Auth)' | 'Google Gemini Free' | 'OpenRouter Free';
  description: string;
  badge: string;
  isNoAuth?: boolean;
  tier: 'free';
}

export const ALL_FREE_MODELS: AiModelOption[] = [
  // --- OPENCODE FREE (9ROUTER / NO AUTH) ---
  {
    id: 'opencode/nemotron-3-ultra',
    name: 'Nemotron 3 Ultra (OpenCode Free)',
    provider: 'OpenCode Free (No Auth)',
    description: 'NVIDIA Nemotron 3 Ultra — Model coding & penalaran tanpa otentikasi / no API key',
    badge: 'No Auth Free',
    isNoAuth: true,
    tier: 'free',
  },
  {
    id: 'opencode/mimo-v2-pro',
    name: 'MiMo V2 Pro (OpenCode Free)',
    provider: 'OpenCode Free (No Auth)',
    description: 'MiMo V2 Pro — Ultra cepat, ringan, respons instan tanpa otentikasi',
    badge: 'No Auth Free',
    isNoAuth: true,
    tier: 'free',
  },
  {
    id: 'opencode/mimo-v2-omni',
    name: 'MiMo V2 Omni (OpenCode Free)',
    provider: 'OpenCode Free (No Auth)',
    description: 'MiMo V2 Omni — Model serbaguna untuk berbagai topik teknis dan analitis',
    badge: 'No Auth Free',
    isNoAuth: true,
    tier: 'free',
  },
  {
    id: 'opencode/minimax-m2.5',
    name: 'MiniMax M2.5 (OpenCode Free)',
    provider: 'OpenCode Free (No Auth)',
    description: 'MiniMax M2.5 — Handal untuk penulisan artikel panjang & struktur rapi',
    badge: 'No Auth Free',
    isNoAuth: true,
    tier: 'free',
  },
  {
    id: 'opencode/nemotron-3-super',
    name: 'Nemotron 3 Super (OpenCode Free)',
    provider: 'OpenCode Free (No Auth)',
    description: 'NVIDIA Nemotron 3 Super — Arsitektur mendalam untuk pemecahan masalah kompleks',
    badge: 'No Auth Free',
    isNoAuth: true,
    tier: 'free',
  },

  // --- GOOGLE GEMINI FREE TIER ---
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google Gemini Free',
    description: 'Rekomendasi Utama: Tercepat, penalaran mutakhir, akurat & draf komprehensif',
    badge: 'Rekomendasi',
    tier: 'free',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'Google Gemini Free',
    description: 'Model Flash Stabil: Direkomendasikan resmi oleh Google untuk API',
    badge: 'Stabil',
    tier: 'free',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'Google Gemini Free',
    description: 'Model Flash-Lite: Ultra cepat, latensi terendah, kuota hemat',
    badge: 'Ultra Fast',
    tier: 'free',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    provider: 'Google Gemini Free',
    description: 'Alias Otomatis: Selalu mengarah ke model Flash termutakhir',
    badge: 'Auto Latest',
    tier: 'free',
  },

  // --- OPENROUTER FREE MODELS ---
  {
    id: 'openrouter/free',
    name: 'OpenRouter Auto Free Router',
    provider: 'OpenRouter Free',
    description: 'Auto-routing cerdas ke model free tier yang sedang aktif di OpenRouter',
    badge: 'Auto Router',
    isNoAuth: true,
    tier: 'free',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct (Free)',
    provider: 'OpenRouter Free',
    description: 'Meta Llama 3.3 70B — Open-source LLM bertenaga tinggi untuk draf & kode',
    badge: '70B Free',
    tier: 'free',
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B (Free)',
    provider: 'OpenRouter Free',
    description: 'Alibaba Qwen 2.5 Coder — Spesialis pemrogram tingkat lanjut',
    badge: 'Coder Free',
    tier: 'free',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'OpenRouter Free',
    description: 'DeepSeek R1 — Penalaran berpikir langkah demi langkah (chain-of-thought)',
    badge: 'Reasoning Free',
    tier: 'free',
  },
];

// Alias for backwards compatibility
export const GEMINI_FREE_MODELS = ALL_FREE_MODELS;

export async function checkAiHealth(): Promise<{ status: string; aiEngine?: string; supportedModels?: string[]; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'error', hasGeminiKey: false };
  }
}

export async function generateArticleWithAi(params: {
  topic: string;
  category?: string;
  keyPoints?: string;
  language?: 'id' | 'en';
  model?: string;
}): Promise<GeneratedArticleResult> {
  const res = await fetch('/api/ai/generate-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let errorMsg = 'Gagal menghasilkan artikel dengan AI Engine';
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      if (res.status === 405) {
        errorMsg = 'Error 405 (Method Not Allowed). Pastikan konfigurasi vercel.json dan folder api/ sudah terdeploy di Vercel.';
      } else if (res.status === 404) {
        errorMsg = 'Error 404 (Endpoint Not Found). Endpoint AI belum tersedia di server.';
      }
    }
    throw new Error(errorMsg);
  }

  const result = await res.json();
  return result.data;
}

export async function generateVanpediaWithAi(params: {
  termName: string;
  category?: string;
  details?: string;
  model?: string;
}): Promise<GeneratedVanpediaResult> {
  const res = await fetch('/api/ai/generate-vanpedia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let errorMsg = 'Gagal menghasilkan entri Vanpedia dengan AI Engine';
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      if (res.status === 405) {
        errorMsg = 'Error 405 (Method Not Allowed). Pastikan konfigurasi vercel.json dan folder api/ sudah terdeploy di Vercel.';
      } else if (res.status === 404) {
        errorMsg = 'Error 404 (Endpoint Not Found). Endpoint AI belum tersedia di server.';
      }
    }
    throw new Error(errorMsg);
  }

  const result = await res.json();
  return result.data;
}

export async function askAiAssistant(params: {
  prompt: string;
  task?: 'general' | 'qa_answer' | 'summary';
  context?: string;
  model?: string;
}): Promise<string> {
  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let errorMsg = 'AI Assistant request failed';
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      if (res.status === 405) {
        errorMsg = 'Error 405 (Method Not Allowed). Pastikan route Vercel Serverless Function aktif.';
      }
    }
    throw new Error(errorMsg);
  }

  const result = await res.json();
  return result.result;
}
