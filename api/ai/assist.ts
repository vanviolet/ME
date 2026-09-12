import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ALLOWED_FREE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

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
    const { prompt, task = 'general', context = '', model = 'gemini-3.8-flash' } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error:
          'GEMINI_API_KEY belum diset. Silakan tambahkan GEMINI_API_KEY di pengaturan Vercel (Project Settings -> Environment Variables).',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const targetModel = ALLOWED_FREE_MODELS.includes(model) ? model : 'gemini-3.8-flash';

    let systemInstruction =
      'Anda adalah asisten AI cerdas (Firebase AI Logic) untuk portal Muchamad Irvan yang memberikan jawaban teknis yang tepat, padat, dan elegan.';

    if (task === 'qa_answer') {
      systemInstruction =
        'Anda adalah Software Engineer Senior. Berikan jawaban teknis komprehensif dengan kode jika relevan untuk menjawab pertanyaan developer.';
    } else if (task === 'summary') {
      systemInstruction = 'Buat ringkasan padat dan informatif dari teks yang diberikan.';
    }

    const fullContents = context ? `Konteks:\n${context}\n\nPermintaan:\n${prompt}` : prompt;

    let response;
    let usedModel = targetModel;

    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: fullContents,
        config: {
          systemInstruction,
        },
      });
    } catch (primaryErr) {
      console.warn(`[AI Logic] Model ${targetModel} error, trying fallback to gemini-3.6-flash...`, primaryErr);
      usedModel = 'gemini-3.6-flash';
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: fullContents,
        config: {
          systemInstruction,
        },
      });
    }

    res.status(200).json({
      success: true,
      result: response?.text || '',
      aiModel: usedModel,
    });
  } catch (error: any) {
    console.error('Error in AI assist:', error);
    res.status(500).json({
      error: error.message || 'Failed to execute AI assist',
    });
  }
}
