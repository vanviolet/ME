import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { AI_MODELS_LIST, getCleanModelName } from './models.js';

interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_KNOWLEDGE_PROMPT = `Anda adalah "VanBot", AI Assistant cerdas, ramah, dan sangat kompeten di website portofolio Van (Software Engineer & AI System Architect).

### Profil & Latar Belakang Van:
- **Nama/Panggilan**: Van
- **Keahlian Utama**: Arsitektur Full-Stack Modern (TypeScript, React 19, Next.js, Node.js/Express, Tailwind CSS), AI Engineering (Google Gemini API, DeepSeek, LangChain, PyTorch, Multi-tier LLM Cascades, Edge AI), dan Sistem Database Terdistribusi (PostgreSQL, Firebase Firestore, Vector DBs).
- **Filosofi & Pendekatan**: Craftsmanship tinggi, Zero-AI Slop (menolak UI generic, mengutamakan tipografi presisi, matematika layout, dan performa tinggi), Resilient Systems, Clean Code.
- **Fitur Spesial di Website**:
  1. **Articles & Research**: Blog teknis mendalam tentang AI, rekayasa perangkat lunak, dan arsitektur sistem dengan visualisasi rumus matematika (KaTeX) dan kode produksi.
  2. **Vanpedia (Tech Lexicon)**: Glosarium & ensiklopedia istilah teknis/AI interaktif dengan definisi bilingual, formula matematis, notasi fonetik IPA, dan contoh nyata.
  3. **Issues / Problem Tracker**: Pelacak masalah sistem dan solusi rekayasa.
  4. **Universal AI Studio Router**: Sistem routing AI multi-tier yang tangguh tanpa dependensi eksternal.

### Peran & Gaya Komunikasi Anda:
- Jawablah dengan nada ramah, profesional, solutif, dan sangat terstruktur.
- Gunakan bahasa yang sama dengan yang digunakan pengguna (Bahasa Indonesia secara default, atau Bahasa Inggris jika user bertanya dalam bahasa Inggris).
- Jika pengguna bertanya tentang pengalaman atau proyek Van, berikan penjelasan menarik dan arahkan mereka ke bagian yang relevan (Projects, Articles, atau Vanpedia).
- Jika pengguna bertanya konsep teknis, jelaskan secara jelas, runtut, berikan contoh kode jika perlu, atau referensikan istilah di Vanpedia (gunakan format [[slug-istilah]] jika merujuk istilah teknis).
- Format jawaban dengan Markdown rapi (bullet point, bold, heading bila perlu, dan kode dengan syntax highlighting).
`;

async function callPublicZeroAuthGateway(model: string, systemInstruction: string, messages: ChatMessageInput[]): Promise<string | null> {
  const cleanId = model.toLowerCase().replace('opencode/', '').replace(':free', '');
  let mappedModel = 'openai';
  if (cleanId.includes('nemotron')) mappedModel = 'mistral';
  else if (cleanId.includes('deepseek') || cleanId.includes('r1')) mappedModel = 'deepseek';
  else if (cleanId.includes('qwen') || cleanId.includes('coder')) mappedModel = 'qwen-coder';
  else if (cleanId.includes('llama')) mappedModel = 'mistral';

  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: formattedMessages,
        model: mappedModel,
        seed: Math.floor(Math.random() * 1000000),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0 && !text.includes('<!DOCTYPE html>')) {
        return text.trim();
      }
    }
  } catch {}

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: mappedModel,
        messages: formattedMessages,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    }
  } catch {}

  return null;
}

async function callGeminiNativeChat(geminiModel: string, systemInstruction: string, messages: ChatMessageInput[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build-vanbot-chat' },
    },
  });

  const lastMsg = messages[messages.length - 1]?.content || '';
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = ai.chats.create({
    model: geminiModel,
    config: {
      systemInstruction,
    },
    history,
  });

  const response = await chat.sendMessage({
    message: lastMsg,
  });

  const text = response?.text;
  if (!text) {
    throw new Error(`Empty response from Gemini (${geminiModel})`);
  }
  return text;
}

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
      messages = [],
      model = 'gemini-3.8-flash',
      context = '',
      includeThinking = true,
    } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const fullSystemInstruction = `${SYSTEM_KNOWLEDGE_PROMPT}
${context ? `\n### Konteks Halaman Pengguna Saat Ini:\n${context}` : ''}`;

    let reply = '';
    const cleanName = getCleanModelName(model);
    let usedModel = cleanName;
    let provider = 'Google Gemini Engine';
    const executionPath: string[] = [];

    const isGeminiRequested = model.toLowerCase().startsWith('gemini');

    // Priority 1: Zero Auth Free Gateway for non-Gemini requests (Nemotron, DeepSeek, etc.)
    if (!isGeminiRequested) {
      executionPath.push(`zero-auth:${cleanName}`);
      const gwRes = await callPublicZeroAuthGateway(model, fullSystemInstruction, messages);
      if (gwRes) {
        reply = gwRes;
        usedModel = cleanName;
        provider = `${cleanName} (ZeroAuth Engine)`;
      }
    }

    // Priority 2: Gemini Native Cascade
    if (!reply) {
      const geminiCascade = isGeminiRequested
        ? [model, 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
        : ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];

      const uniqueModels = Array.from(new Set(geminiCascade));

      for (const gModel of uniqueModels) {
        executionPath.push(`gemini-native:${gModel}`);
        try {
          reply = await callGeminiNativeChat(gModel, fullSystemInstruction, messages);
          usedModel = isGeminiRequested ? getCleanModelName(gModel) : cleanName;
          provider = isGeminiRequested ? 'Google Gemini Engine' : `${cleanName} (Hybrid Engine)`;
          break;
        } catch (err) {
          console.warn(`[VanBot Chat] Failed on ${gModel}, trying next...`, err);
        }
      }
    }

    if (!reply) {
      throw new Error('Semua jalur model AI gagal merespon pesan chat.');
    }

    const lastUserQuery = messages[messages.length - 1]?.content || '';
    const thinkingSteps = [
      `Menganalisis query: "${lastUserQuery.slice(0, 50)}${lastUserQuery.length > 50 ? '...' : ''}"`,
      `Menghubungkan konteks teknis portofolio & basis pengetahuan Vanpedia`,
      `Inferensi aktif menggunakan ${usedModel}`,
      `Memformat respon rapi dengan standar kode & tipografi tinggi`,
    ];

    res.status(200).json({
      success: true,
      data: {
        message: {
          role: 'assistant',
          content: reply,
          createdAt: new Date().toISOString(),
          model: usedModel,
          provider,
        },
        thinking: includeThinking
          ? {
              steps: thinkingSteps,
              executionPath,
              model: usedModel,
              provider,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error('Error in VanBot AI Chat:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate chat response',
    });
  }
}
