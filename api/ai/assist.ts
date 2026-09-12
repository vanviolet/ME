import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors';
import { getGeminiClient, callGeminiWithRetry } from '../_lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const { prompt, task = 'general', context = '' } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const ai = getGeminiClient();
    let systemInstruction =
      'Anda adalah asisten AI cerdas (Firebase AI Logic) untuk portal Muchamad Irvan yang memberikan jawaban teknis yang tepat, padat, dan elegan.';

    if (task === 'qa_answer') {
      systemInstruction =
        'Anda adalah Software Engineer Senior. Berikan jawaban teknis komprehensif dengan kode jika relevan untuk menjawab pertanyaan developer.';
    } else if (task === 'summary') {
      systemInstruction = 'Buat ringkasan padat dan informatif dari teks yang diberikan.';
    }

    const fullContents = context ? `Konteks:\n${context}\n\nPermintaan:\n${prompt}` : prompt;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullContents,
        config: {
          systemInstruction,
        },
      })
    );

    res.status(200).json({
      success: true,
      result: response.text || '',
      aiModel: 'Gemini 3.8 Flash',
    });
  } catch (error: any) {
    console.error('Error in AI assist:', error);
    res.status(500).json({
      error: error.message || 'Failed to execute AI assist',
    });
  }
}
