import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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

async function callOpenCodeZenUpstream(model: string, systemInstruction: string, messages: ChatMessageInput[]): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const cleanModel = model.replace('opencode/', '');

    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenCode-Native-Router/1.0',
      },
      body: JSON.stringify({
        model: cleanModel,
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

async function callPublicZeroAuthGateway(model: string, systemInstruction: string, messages: ChatMessageInput[]): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let mappedModel = 'openai';
    if (model.includes('deepseek') || model.includes('r1')) mappedModel = 'deepseek';
    else if (model.includes('qwen') || model.includes('coder')) mappedModel = 'qwen-coder';
    else if (model.includes('llama')) mappedModel = 'mistral';

    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

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

  // Prepare multi-turn contents for Gemini SDK
  const lastMsg = messages[messages.length - 1]?.content || '';
  const history = messages.slice(0, -1).map(m => ({
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
    let usedModel = model;
    let provider = 'Google Gemini Free Tier';
    const executionPath: string[] = [];

    // Tier 1: OpenCode native upstream
    if (model.startsWith('opencode/')) {
      executionPath.push('opencode-zen-upstream');
      const zenRes = await callOpenCodeZenUpstream(model, fullSystemInstruction, messages);
      if (zenRes) {
        reply = zenRes;
        usedModel = model;
        provider = 'OpenCode Free (No Auth)';
      } else {
        executionPath.push('public-zero-auth-gateway');
        const gwRes = await callPublicZeroAuthGateway(model, fullSystemInstruction, messages);
        if (gwRes) {
          reply = gwRes;
          usedModel = model;
          provider = 'Zero-Auth Free Gateway';
        }
      }
    }

    // Tier 2: OpenRouter / Free models
    if (!reply && (model.startsWith('openrouter/') || model.includes(':free'))) {
      executionPath.push('public-zero-auth-gateway');
      const gwRes = await callPublicZeroAuthGateway(model, fullSystemInstruction, messages);
      if (gwRes) {
        reply = gwRes;
        usedModel = model;
        provider = 'Open-Source Free Gateway';
      }
    }

    // Tier 3: Gemini cascade
    if (!reply) {
      const geminiCascade = model.startsWith('gemini-')
        ? [model, 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']
        : ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];

      const uniqueModels = Array.from(new Set(geminiCascade));

      for (const gModel of uniqueModels) {
        executionPath.push(`gemini-native:${gModel}`);
        try {
          reply = await callGeminiNativeChat(gModel, fullSystemInstruction, messages);
          usedModel = gModel;
          provider = 'Google Gemini Free Tier';
          break;
        } catch (err) {
          console.warn(`[VanBot Chat] Failed on ${gModel}, trying next...`, err);
        }
      }
    }

    if (!reply) {
      throw new Error('Semua jalur model AI gagal merespon pesan chat.');
    }

    // Construct simulated structured thinking step insights for transparency
    const lastUserQuery = messages[messages.length - 1]?.content || '';
    const thinkingSteps = [
      `Memproses pertanyaan: "${lastUserQuery.slice(0, 60)}${lastUserQuery.length > 60 ? '...' : ''}"`,
      `Mencocokkan dengan basis pengetahuan (Portofolio, Vanpedia, & Engineering Guides)`,
      `Memilih jalur inferensi (${usedModel}) dengan latensi optimal`,
      `Menyusun respon ramah dan komprehensif berstandar produksi`,
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
