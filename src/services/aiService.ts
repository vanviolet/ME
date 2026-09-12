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

export interface GeminiModelOption {
  id: string;
  name: string;
  description: string;
  badge: string;
  tier: 'free' | 'preview';
}

export const GEMINI_FREE_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    description: 'Rekomendasi Utama: Tercepat, bernalar tinggi, akurat & draf komprehensif',
    badge: 'Rekomendasi',
    tier: 'free',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    description: 'Model Flash Stabil: Direkomendasikan resmi oleh Google untuk API',
    badge: 'Stabil',
    tier: 'free',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    description: 'Model Flash-Lite: Ultra cepat, latensi terendah, kuota hemat',
    badge: 'Ultra Fast',
    tier: 'free',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    description: 'Alias Otomatis: Selalu mengarah ke model Flash termutakhir',
    badge: 'Auto Latest',
    tier: 'free',
  },
];

export async function checkAiHealth(): Promise<{ status: string; aiEngine?: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err: any) {
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
    let errorMsg = 'Gagal menghasilkan artikel dengan Firebase AI Logic';
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
    let errorMsg = 'Gagal menghasilkan entri Vanpedia dengan Firebase AI Logic';
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
