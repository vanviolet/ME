import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
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
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
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

async function callGeminiNative(geminiModel: string, systemInstruction: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build-assist' },
    },
  });

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      systemInstruction,
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
    const { action, text, context = '', model = 'gemini-3.8-flash' } = req.body || {};

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for AI assistance.' });
      return;
    }

    const systemInstruction = `You are a technical writing assistant and code reviewer for an engineering blog and knowledge base.
You must return only the resulting improved text, code, or explanation without conversational fillers.
${context ? `Additional article context: ${context}` : ''}`;

    let prompt = '';
    switch (action) {
      case 'improve':
        prompt = `Tolong perbaiki gaya bahasa, alur penjelasan, dan kualitas teknis dari teks berikut agar lebih profesional, ringkas, dan jelas:\n\n${text}`;
        break;
      case 'summarize':
        prompt = `Tolong buatkan ringkasan eksekutif padat dalam 2-3 poin dari teks berikut:\n\n${text}`;
        break;
      case 'generate_code':
        prompt = `Tolong buatkan implementasi kode produksi lengkap, bersih, dan beranotasi tipe data berdasarkan instruksi berikut:\n\n${text}`;
        break;
      case 'fix_grammar':
        prompt = `Tolong perbaiki tata bahasa, ejaan baku, dan tanda baca dari teks berikut tanpa mengubah makna substansi:\n\n${text}`;
        break;
      default:
        prompt = text;
        break;
    }

    let resultText = '';
    let usedModel = model;
    let provider = 'Google Gemini Free Tier';
    const executionPath: string[] = [];

    // Tier 1: OpenCode native upstream
    if (model.startsWith('opencode/')) {
      executionPath.push('opencode-zen-upstream');
      const zenRes = await callOpenCodeZenUpstream(model, systemInstruction, prompt);
      if (zenRes) {
        resultText = zenRes;
        usedModel = model;
        provider = 'OpenCode Free (No Auth)';
      } else {
        executionPath.push('public-zero-auth-gateway');
        const gwRes = await callPublicZeroAuthGateway(model, systemInstruction, prompt);
        if (gwRes) {
          resultText = gwRes;
          usedModel = model;
          provider = 'Zero-Auth Free Gateway';
        }
      }
    }

    // Tier 2: OpenRouter / Free models
    if (!resultText && (model.startsWith('openrouter/') || model.includes(':free'))) {
      executionPath.push('public-zero-auth-gateway');
      const gwRes = await callPublicZeroAuthGateway(model, systemInstruction, prompt);
      if (gwRes) {
        resultText = gwRes;
        usedModel = model;
        provider = 'Open-Source Free Gateway';
      }
    }

    // Tier 3: Gemini cascade
    if (!resultText) {
      const isGemini = model.startsWith('gemini');
      const validGeminiModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      const geminiCascade = isGemini && validGeminiModels.includes(model)
        ? [model, ...validGeminiModels.filter((m) => m !== model)]
        : validGeminiModels;

      for (const gModel of geminiCascade) {
        executionPath.push(`gemini-native:${gModel}`);
        try {
          resultText = await callGeminiNative(gModel, systemInstruction, prompt);
          usedModel = gModel;
          provider = 'Google Gemini Free Tier';
          break;
        } catch (_err) {
          console.warn(`[Assist AI] Model ${gModel} temporarily unavailable, trying next in cascade...`);
        }
      }
    }

    if (!resultText) {
      throw new Error('Semua jalur model AI gagal menghasilkan bantuan teks.');
    }

    res.status(200).json({
      success: true,
      result: resultText,
      usedModel,
      provider,
      executionPath,
    });
  } catch (error: any) {
    console.error('Error assisting text:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI assist request',
    });
  }
}
