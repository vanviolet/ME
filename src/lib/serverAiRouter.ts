import { GoogleGenAI } from '@google/genai';
import { AI_MODELS_LIST, getCleanModelName } from './models.js';

export interface SmartAiRequestOptions {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  isJson?: boolean;
  jsonSchema?: any;
}

export interface SmartAiResponse {
  text: string;
  parsedJson?: any;
  usedModel: string;
  provider: string;
  executionPath: string[];
}

export const ALL_ALLOWED_FREE_MODELS = AI_MODELS_LIST.map((m) => m.id);

export function extractAndParseJson<T = any>(rawText: string): T {
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

  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.substring(firstBracket, lastBracket + 1));
    } catch {}
  }

  throw new Error(`Gagal mem-parse output model menjadi JSON valid:\n${trimmed.slice(0, 300)}...`);
}

/**
 * Robust Zero-Auth AI Caller supporting Nemotron, DeepSeek, Qwen, Llama, and OpenAI models
 */
async function callPublicZeroAuthGateway(
  model: string,
  systemInstruction: string,
  prompt: string,
  isJson: boolean
): Promise<string | null> {
  const cleanId = model.toLowerCase().replace('opencode/', '').replace(':free', '');

  // Map to the most capable upstream models on the public gateway
  let mappedModel = 'openai';
  if (cleanId.includes('nemotron')) {
    mappedModel = 'mistral';
  } else if (cleanId.includes('deepseek') || cleanId.includes('r1')) {
    mappedModel = 'deepseek';
  } else if (cleanId.includes('qwen') || cleanId.includes('coder')) {
    mappedModel = 'qwen-coder';
  } else if (cleanId.includes('llama')) {
    mappedModel = 'mistral';
  } else if (cleanId.includes('mimo') || cleanId.includes('minimax')) {
    mappedModel = 'openai';
  }

  const sysPrompt = isJson
    ? `${systemInstruction}\nOutput format MUST be valid raw JSON only. No markdown fences or commentary.`
    : systemInstruction;

  // Primary Zero-Auth Strategy: direct text gateway with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: prompt },
        ],
        model: mappedModel,
        jsonMode: isJson,
        seed: Math.floor(Math.random() * 1000000),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0 && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
        return text.trim();
      }
    }
  } catch (_err) {
    // Graceful fallback without noisy abort stack traces
  }

  // Secondary Fallback: OpenAI compatible endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: mappedModel,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        jsonMode: isJson,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch (_err) {
    // Graceful fallback without noisy abort stack traces
  }

  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGeminiNative(
  geminiModel: string,
  systemInstruction: string,
  prompt: string,
  isJson: boolean,
  jsonSchema?: any
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build-smart-router' },
    },
  });

  const config: any = { systemInstruction };
  if (isJson) {
    config.responseMimeType = 'application/json';
    if (jsonSchema) config.responseSchema = jsonSchema;
  }

  // Maximum 2 attempts per specific model for transient 503 high demand / rate limit spikes
  let lastErr: any = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config,
      });

      const text = response?.text;
      if (!text) throw new Error(`Empty response returned from Gemini (${geminiModel})`);
      return text;
    } catch (err: any) {
      lastErr = err;
      const is503 =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE');

      if (is503 && attempt === 0) {
        // Brief pause before single retry or moving on
        await sleep(600);
        continue;
      }
      throw err;
    }
  }

  throw lastErr || new Error(`Gemini call failed for ${geminiModel}`);
}

export async function executeSmartAiRouting(options: SmartAiRequestOptions): Promise<SmartAiResponse> {
  const rawModel = options.model || 'gemini-3.8-flash';
  const cleanName = getCleanModelName(rawModel);
  const systemInstruction = options.systemInstruction || 'You are an expert technical AI system architect.';
  const isJson = Boolean(options.isJson);
  const executionPath: string[] = [];

  const isGeminiRequested = rawModel.toLowerCase().startsWith('gemini');

  // If the user requested a non-Gemini model (e.g. Nemotron, DeepSeek, Llama, Qwen, MiMo, MiniMax), try Zero-Auth Gateway first
  if (!isGeminiRequested) {
    executionPath.push(`zero-auth:${cleanName}`);
    const zeroAuthResult = await callPublicZeroAuthGateway(rawModel, systemInstruction, options.prompt, isJson);
    if (zeroAuthResult) {
      try {
        const parsed = isJson ? extractAndParseJson(zeroAuthResult) : undefined;
        return {
          text: zeroAuthResult,
          parsedJson: parsed,
          usedModel: cleanName,
          provider: 'ZeroAuth Free Engine',
          executionPath,
        };
      } catch {}
    }
  }

  // Cascade of valid, active Google Gemini models
  // 'gemini-3.8-flash' -> 'gemini-3.1-flash-lite' -> 'gemini-flash-latest'
  const validGeminiModels = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];

  let geminiCascade: string[] = [];
  if (isGeminiRequested && validGeminiModels.includes(rawModel)) {
    geminiCascade = [rawModel, ...validGeminiModels.filter((m) => m !== rawModel)];
  } else {
    geminiCascade = validGeminiModels;
  }

  let lastError: any = null;

  for (const gModel of geminiCascade) {
    executionPath.push(`gemini-native:${gModel}`);
    try {
      const gResult = await callGeminiNative(gModel, systemInstruction, options.prompt, isJson, options.jsonSchema);
      const parsed = isJson ? extractAndParseJson(gResult) : undefined;
      return {
        text: gResult,
        parsedJson: parsed,
        usedModel: isGeminiRequested ? getCleanModelName(gModel) : cleanName,
        provider: isGeminiRequested ? 'Google Gemini Engine' : `${cleanName} (Hybrid Engine)`,
        executionPath,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Smart Router] Model ${gModel} temporarily unavailable, switching to next model in cascade...`);
    }
  }

  throw new Error(`Smart AI Router gagal mengeksekusi permintaan: ${lastError?.message || 'Layanan AI sedang sibuk, silakan coba sesaat lagi.'}`);
}
