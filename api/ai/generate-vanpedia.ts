import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { handleCors } from '../_lib/cors';
import { getGeminiClient, callGeminiWithRetry } from '../_lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const { termName, category = 'Learning (AI)', details = '' } = req.body || {};

    if (!termName || typeof termName !== 'string' || !termName.trim()) {
      res.status(400).json({ error: 'Term name is required.' });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Anda adalah Leksikografer Teknis Rekayasa Perangkat Lunak dan AI (Firebase AI Logic).
Tolong buatkan entri kamus istilah teknis untuk "Vanpedia" yang RINGKAS, PADAT, AKURAT, dan SANGAT JELAS (tidak bertele-tele, tidak panjang-panjang, fokus pada esensi dan pemahaman praktis):
- Nama Istilah: "${termName.trim()}"
- Kategori: "${category}"
${details ? `- Catatan Khusus: "${details}"` : ''}

Ketentuan Format:
- Jangan menyertakan metafora musik atau audio, fokus murni pada ilmu komputer, software engineering, AI, atau teknologi umum.
- definitionId: Definisi formal 1-2 kalimat presisi dan mudah dipahami dalam Bahasa Indonesia.
- definitionEn: Definisi formal 1-2 kalimat dalam Bahasa Inggris.
- phonetic: Notasi fonetik standar IPA (misal: "/ˈbækˌprɑːpəˈɡeɪʃən/").
- formula: Rumus/notasi matematis singkat jika relevan (kosongkan string jika tidak relevan).
- examples: Array 2-3 contoh penerapan nyata dan singkat di industri modern.
- content: Penjelasan singkat yang jelas dan padat (maksimal 2 sub-bab ringkas: "## Konsep Inti" dan "## Contoh Penerapan Praktis"). Tidak perlu uraian panjang yang melelahkan, utamakan kejelasan konsep.

Keluaran HARUS berupa JSON dengan properti:
- termId: Nama istilah dalam Bahasa Indonesia
- termEn: Term name in English
- slug: URL-friendly slug (huruf kecil, strip pengganti spasi)
- category: Kategori
- phonetic: Notasi fonetik IPA
- definitionId: Definisi presisi 1-2 kalimat dalam Bahasa Indonesia
- definitionEn: Formal 1-2 sentence definition in English
- formula: Formula singkat jika ada
- examples: Array 2-3 string contoh nyata
- content: Penjelasan ringkas dan jelas dalam format Markdown`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an encyclopedic technical lexicographer creating authoritative glossary entries.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              termId: { type: Type.STRING },
              termEn: { type: Type.STRING },
              slug: { type: Type.STRING },
              category: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              definitionId: { type: Type.STRING },
              definitionEn: { type: Type.STRING },
              formula: { type: Type.STRING },
              examples: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              content: { type: Type.STRING },
            },
            required: [
              'termId',
              'termEn',
              'slug',
              'category',
              'phonetic',
              'definitionId',
              'definitionEn',
              'examples',
              'content',
            ],
          },
        },
      })
    );

    const text = response.text;
    if (!text) {
      throw new Error('No response generated from Gemini model');
    }

    const parsedData = JSON.parse(text);

    res.status(200).json({
      success: true,
      data: {
        ...parsedData,
        isAiAssisted: true,
        aiModel: 'Gemini 3.8 Flash (Firebase AI Logic)',
      },
    });
  } catch (error: any) {
    console.error('Error generating Vanpedia term:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate Vanpedia term using AI Logic',
    });
  }
}
