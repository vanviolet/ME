import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

function extractAndParseJson<T = any>(rawText: string): T {
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

  throw new Error(`Failed to parse AI response as JSON: ${trimmed.slice(0, 200)}...`);
}

async function callGemini(systemInstruction: string, prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-illustration-enhancer' },
    },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          enhancedPrompt: { type: Type.STRING },
          styleModifiers: { type: Type.STRING },
          negativePrompt: { type: Type.STRING },
          explanationId: { type: Type.STRING },
          explanationEn: { type: Type.STRING },
          suggestedTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'enhancedPrompt',
          'styleModifiers',
          'negativePrompt',
          'explanationId',
          'explanationEn',
          'suggestedTags',
        ],
      },
    },
  });

  const text = response?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return extractAndParseJson(text);
}

async function callPublicZeroAuthFallback(systemInstruction: string, prompt: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: `${systemInstruction}\nReturn purely raw valid JSON without markdown wrapping.` },
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
    if (text) {
      return extractAndParseJson(text);
    }
  }
  throw new Error('Fallback zero-auth prompt enhancer failed');
}

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
      stylePreset = 'flat-vector',
      presetName = 'Flat Vector',
      language = 'id',
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const systemInstruction = `You are a world-class prompt engineer and digital art director specializing in text-to-image illustration models (FLUX.1, Midjourney, Stable Diffusion).
Your task is to take a user's initial creative idea and enhance it into an evocative, highly detailed prompt that specifically adheres to the selected artistic preset: "${presetName}".

Output MUST be valid JSON with fields:
- enhancedPrompt: string (in English, highly detailed, describing composition, lighting, style motifs, textures, color harmony, and perspective)
- styleModifiers: string (key stylistic comma-separated keyword tokens for diffusion models)
- negativePrompt: string (unwanted artifacts, such as blurry, low quality, oversaturated, watermark, bad anatomy, deformed)
- explanationId: string (short explanation in Indonesian of what was enhanced)
- explanationEn: string (short explanation in English of what was enhanced)
- suggestedTags: array of 4-6 strings`;

    const aiPrompt = `User Prompt: "${prompt.trim()}"
Selected Preset: "${presetName}" (${stylePreset})
User Language: ${language}

Craft an optimized, professional text-to-image prompt tailored specifically for "${presetName}". Focus on visual mastery, exquisite composition, artistic depth, and rendering nuances.`;

    let parsedResult;
    let provider = 'Google Gemini 3.8 Flash';
    let aiModel = 'gemini-3.8-flash';

    try {
      parsedResult = await callGemini(systemInstruction, aiPrompt);
    } catch (geminiError: any) {
      console.warn('Gemini prompt enhance failed, falling back to zero-auth gateway:', geminiError.message);
      try {
        parsedResult = await callPublicZeroAuthFallback(systemInstruction, aiPrompt);
        provider = 'Open-Source Zero-Auth Gateway';
        aiModel = 'pollinations-cluster';
      } catch (fallbackError: any) {
        // Safe programmatic enhancement if both APIs are unreachable
        parsedResult = {
          enhancedPrompt: `${prompt.trim()}, masterpiece high quality illustration, visually stunning composition, professional palette, pristine details, rendered in ${presetName} style`,
          styleModifiers: `${presetName}, high resolution, vector curves, clean aesthetics`,
          negativePrompt: 'blurry, low quality, distorted, extra limbs, bad anatomy, noisy',
          explanationId: `Prompt dioptimasi secara otomatis dengan detail gaya ${presetName}.`,
          explanationEn: `Prompt automatically enhanced with stylistic details for ${presetName}.`,
          suggestedTags: [stylePreset, 'illustration', 'vector', 'art', 'digital-painting'],
        };
        provider = 'Client-Side Rule Engine';
        aiModel = 'rule-based';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...parsedResult,
        aiModel,
        provider,
      },
    });
  } catch (error: any) {
    console.error('Error enhancing illustration prompt:', error);
    res.status(500).json({
      error: error.message || 'Failed to enhance illustration prompt',
    });
  }
}
