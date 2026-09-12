import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is required. Pastikan GEMINI_API_KEY sudah diset di Vercel Environment Variables.'
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function callGeminiWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1200
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      const errorMsg = String(err?.message || '');
      const isTransient =
        errorMsg.includes('503') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('UNAVAILABLE') ||
        errorMsg.includes('RESOURCE_EXHAUSTED');
      if (attempt < maxRetries && isTransient) {
        console.warn(
          `[AI Logic] Transient Gemini spike detected, retrying (attempt ${attempt + 1}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Maximum retry attempts reached');
}
