import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
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
    const {
      prompt,
      stylePreset = 'ink-drawing-v4',
      styleModifiers = '',
      width = 1024,
      height = 1024,
      seed = Math.floor(Math.random() * 1000000),
      model = 'flux',
      negativePrompt = '',
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    // Compose full prompt with style modifiers
    let fullPrompt = prompt.trim();
    if (styleModifiers && !fullPrompt.toLowerCase().includes(styleModifiers.toLowerCase())) {
      fullPrompt = `${fullPrompt}, ${styleModifiers}`;
    }

    // Pollinations AI Open Diffusion URL
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true${
      negativePrompt ? `&negative=${encodeURIComponent(negativePrompt)}` : ''
    }`;

    res.status(200).json({
      success: true,
      data: {
        imageUrl,
        prompt: fullPrompt,
        basePrompt: prompt.trim(),
        stylePreset,
        width: Number(width),
        height: Number(height),
        seed: Number(seed),
        model,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error in generate-illustration:', error);
    res.status(500).json({
      error: error.message || 'Failed to prepare illustration generation',
    });
  }
}
