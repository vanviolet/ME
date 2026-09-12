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
}): Promise<GeneratedArticleResult> {
  const res = await fetch('/api/ai/generate-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menghasilkan artikel dengan Firebase AI Logic');
  }

  const result = await res.json();
  return result.data;
}

export async function generateVanpediaWithAi(params: {
  termName: string;
  category?: string;
  details?: string;
}): Promise<GeneratedVanpediaResult> {
  const res = await fetch('/api/ai/generate-vanpedia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menghasilkan entri Vanpedia dengan Firebase AI Logic');
  }

  const result = await res.json();
  return result.data;
}

export async function askAiAssistant(params: {
  prompt: string;
  task?: 'general' | 'qa_answer' | 'summary';
  context?: string;
}): Promise<string> {
  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'AI Assistant request failed');
  }

  const result = await res.json();
  return result.result;
}
