import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

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
    const {
      topic,
      category = 'Learning (AI)',
      keyPoints = '',
      language = 'id',
      model = 'gemini-3.8-flash',
    } = req.body || {};

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic/Title outline is required.' });
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

    const prompt = `Anda adalah Penulis Teknis dan Arsitek Sistem Senior (Firebase AI Logic).
Tolong buatkan draf artikel teknis yang mendalam, terstruktur rapi, berbobot, dan aplikatif berdasarkan input berikut:
- Topik / Judul: "${topic.trim()}"
- Kategori: "${category}"
${keyPoints ? `- Poin-poin kunci: "${keyPoints}"` : ''}
- Bahasa Utama: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}

Ketentuan Konten:
- Format Markdown terstruktur dengan heading jelas:
  ## 1. Pengantar & Latar Belakang Masalah
  ## 2. Arsitektur & Prinsip Kerja (sertakan formula LaTeX $$...$$ bila relevan dan sebutkan konsep terkait dengan format tautan [[slug-vanpedia]])
  ## 3. Implementasi Kode Nyata (blok kode fungsional, berstandar produksi, lengkap dengan tipe data)
  ## 4. Analisis Trade-offs & Praktik Terbaik
  ## 5. Kesimpulan
- Jangan menyertakan metafora musik atau audio, fokus pada rekayasa teknologi, AI, atau sistem umum.

Format keluaran HARUS berformat JSON valid dengan properti:
- titleId: Judul dalam Bahasa Indonesia
- titleEn: Title in English
- category: Kategori yang sesuai
- tags: Array string 3-5 tag teknis relevan
- summaryId: Ringkasan padat 2-3 kalimat dalam Bahasa Indonesia
- summaryEn: Summary in English (2-3 sentences)
- readTime: Estimasi waktu baca (contoh: "5 min read")
- content: Isi artikel Markdown lengkap sesuai struktur di atas.`;

    let response;
    let usedModel = targetModel;

    try {
      response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a technical AI writer that generates structured, publication-ready technical articles.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleId: { type: Type.STRING },
              titleEn: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              summaryId: { type: Type.STRING },
              summaryEn: { type: Type.STRING },
              readTime: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: [
              'titleId',
              'titleEn',
              'category',
              'tags',
              'summaryId',
              'summaryEn',
              'readTime',
              'content',
            ],
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn(`[AI Logic] Model ${targetModel} error, trying fallback to gemini-3.6-flash...`, primaryErr);
      usedModel = 'gemini-3.6-flash';
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a technical AI writer that generates structured, publication-ready technical articles.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titleId: { type: Type.STRING },
              titleEn: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              summaryId: { type: Type.STRING },
              summaryEn: { type: Type.STRING },
              readTime: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: [
              'titleId',
              'titleEn',
              'category',
              'tags',
              'summaryId',
              'summaryEn',
              'readTime',
              'content',
            ],
          },
        },
      });
    }

    const text = response?.text;
    if (!text) {
      throw new Error('No response generated from Gemini model');
    }

    const parsedData = JSON.parse(text);

    res.status(200).json({
      success: true,
      data: {
        ...parsedData,
        isAiAssisted: true,
        aiModel: usedModel,
      },
    });
  } catch (error: any) {
    console.error('Error generating article:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate article using AI Logic',
    });
  }
}
