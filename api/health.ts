import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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

  res.status(200).json({
    status: 'ok',
    aiEngine: 'Universal Free AI Logic (OpenCode Free / 9Router + Google Gemini + OpenRouter)',
    supportedModels: [
      // OpenCode Free (No Auth)
      'opencode/nemotron-3-ultra',
      'opencode/mimo-v2-pro',
      'opencode/mimo-v2-omni',
      'opencode/minimax-m2.5',
      'opencode/nemotron-3-super',
      // Google Gemini Free
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      // OpenRouter Free
      'openrouter/free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'deepseek/deepseek-r1:free',
    ],
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    platform: 'Vercel Serverless & Express Hybrid',
  });
}
