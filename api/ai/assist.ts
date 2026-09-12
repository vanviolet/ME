import type { VercelRequest, VercelResponse } from '@vercel/node';
import { executeSmartAiRouting } from '../_lib/serverAiRouter';

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

    let systemInstruction =
      'Anda adalah asisten AI cerdas untuk portal Muchamad Irvan yang memberikan jawaban teknis yang tepat, padat, dan elegan.';

    if (task === 'qa_answer') {
      systemInstruction =
        'Anda adalah Software Engineer Senior. Berikan jawaban teknis komprehensif dengan kode jika relevan untuk menjawab pertanyaan developer.';
    } else if (task === 'summary') {
      systemInstruction = 'Buat ringkasan padat dan informatif dari teks yang diberikan.';
    }

    const fullContents = context ? `Konteks:\n${context}\n\nPermintaan:\n${prompt}` : prompt;

    const aiResult = await executeSmartAiRouting({
      model,
      systemInstruction,
      prompt: fullContents,
      isJson: false,
    });

    res.status(200).json({
      success: true,
      result: aiResult.text,
      aiModel: aiResult.usedModel,
      provider: aiResult.provider,
      executionPath: aiResult.executionPath,
    });
  } catch (error: any) {
    console.error('Error in AI assist:', error);
    res.status(500).json({
      error: error.message || 'Failed to execute AI assist',
    });
  }
}
