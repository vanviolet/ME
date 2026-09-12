import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Type } from '@google/genai';
import { executeSmartAiRouting } from '../../src/lib/serverAiRouter';

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
    const { termName, category = 'Learning (AI)', details = '', model = 'gemini-3.8-flash' } = req.body || {};

    if (!termName || typeof termName !== 'string' || !termName.trim()) {
      res.status(400).json({ error: 'Term name is required.' });
      return;
    }

    const systemInstruction =
      'You are an encyclopedic technical lexicographer creating authoritative glossary entries in JSON format.';

    const prompt = `Anda adalah Leksikografer Teknis Rekayasa Perangkat Lunak dan AI.
Tolong buatkan entri kamus istilah teknis untuk "Vanpedia" yang RINGKAS, PADAT, AKURAT, dan SANGAT JELAS:
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
- content: Penjelasan singkat yang jelas dan padat (maksimal 2 sub-bab ringkas: "## Konsep Inti" dan "## Contoh Penerapan Praktis").

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

    const jsonSchema = {
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
    };

    const aiResult = await executeSmartAiRouting({
      model,
      systemInstruction,
      prompt,
      isJson: true,
      jsonSchema,
    });

    const parsedData = aiResult.parsedJson || JSON.parse(aiResult.text);

    res.status(200).json({
      success: true,
      data: {
        ...parsedData,
        isAiAssisted: true,
        aiModel: aiResult.usedModel,
        provider: aiResult.provider,
        executionPath: aiResult.executionPath,
      },
    });
  } catch (error: any) {
    console.error('Error generating Vanpedia term:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate Vanpedia term using Smart AI Engine',
    });
  }
}
