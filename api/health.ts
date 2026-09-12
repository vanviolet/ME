import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  res.status(200).json({
    status: 'ok',
    aiEngine: 'Firebase AI Logic (Powered by Gemini 3.8 Flash)',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    platform: 'Vercel Serverless',
  });
}
