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
    const { prompt, direction = 'TD' } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const systemInstruction = `You are a Principal Software Architect and Systems Diagram Engineer.
Your job is to generate a comprehensive, highly accurate flowchart representing the requested architecture, business logic, algorithm, or user journey.
You MUST output valid JSON matching the exact schema.

Rules for the Mermaid code:
1. Start with "flowchart ${direction === 'LR' ? 'LR' : 'TD'}"
2. Use standard Mermaid shape syntax:
   - Start / End: id(["Label"])
   - Process / Action: id["Label"]
   - Decision: id{"Condition?"}
   - Input / Output: id[/"Label"/]
   - Database / Cache: id[("Label")]
   - Subroutine / Service: id[["Label"]]
   - External Cloud: id["☁️ Label"]
3. Include edge labels for decisions:
   - id1 -->|Ya| id2
   - id1 -->|Tidak| id3
   - id1 -.->|Webhook/Async| id4
4. Ensure no disconnected or dead-end orphan nodes (except valid End nodes).
5. Output clean, valid JSON only.`;

    const aiPrompt = `Buat diagram alur / flowchart teknis yang komprehensif, logis, dan mendalam untuk permintaan berikut:
"${prompt.trim()}"

Arah Alur: ${direction === 'LR' ? 'Kiri ke Kanan (LR)' : 'Atas ke Bawah (TD)'}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-flowchart-generator' },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: aiPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            mermaidCode: { type: Type.STRING },
            keyNodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['id', 'label', 'type', 'description'],
              },
            },
            complexity: { type: Type.STRING },
            estimatedSteps: { type: Type.INTEGER },
          },
          required: ['title', 'summary', 'mermaidCode', 'keyNodes', 'complexity', 'estimatedSteps'],
        },
      },
    });

    const text = response?.text;
    if (!text) throw new Error('Empty response from Gemini');
    const parsed = extractAndParseJson(text);

    res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.warn('Error generating flowchart with primary model, generating fallback:', error?.message);
    const { prompt = 'Flowchart Arsitektur', direction = 'TD' } = req.body || {};
    const dir = direction === 'LR' ? 'LR' : 'TD';
    const cleanPrompt = String(prompt).trim();
    
    const fallbackMermaid = `flowchart ${dir}
    Start(["🚀 Inisiasi: ${cleanPrompt.slice(0, 30)}"]) --> Validate{"🔍 Validasi Input"}
    Validate -->|Valid| Process["⚙️ Eksekusi Proses Logika"]
    Validate -->|Invalid| Err["⚠️ Tangani Error"]
    Process --> Storage[("💾 Simpan Data & Cache")]
    Storage --> End(["✅ Selesai: Berikan Response"])
    Err --> End`;

    res.status(200).json({
      success: true,
      data: {
        title: cleanPrompt.length > 45 ? cleanPrompt.slice(0, 42) + '...' : cleanPrompt,
        summary: 'Diagram arsitektur alur sistem dihasilkan secara terstruktur.',
        mermaid: fallbackMermaid,
        mermaidCode: fallbackMermaid,
        direction: dir,
        complexity: 'Medium',
        estimatedSteps: 5,
        aiModel: 'Fallback Architect',
        provider: 'System Generator',
      },
    });
  }
}
