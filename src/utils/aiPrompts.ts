export interface DiscussionContext {
  title: string;
  summary: string;
  category: string;
  language: 'id' | 'en';
  isVanpedia?: boolean;
  formula?: string;
  phonetic?: string;
  tags?: string[];
  url?: string;
}

export interface AiDiscussionLinks {
  chatGptPrompt: string;
  chatGptUrl: string;
  claudePrompt: string;
  claudeUrl: string;
  v0Prompt: string;
  v0Url: string;
  sciraPrompt: string;
  sciraUrl: string;
}

/**
 * Builds smart, targeted technical discussion inquiries rather than dumping the raw document text.
 * This respects query length constraints and yields far superior responses from ChatGPT/Claude.
 */
export function buildAiDiscussionLinks(ctx: DiscussionContext): AiDiscussionLinks {
  const isEn = ctx.language === 'en';

  let chatGptPrompt = '';
  let claudePrompt = '';
  let v0Prompt = '';
  let sciraPrompt = '';

  if (ctx.isVanpedia) {
    if (isEn) {
      chatGptPrompt = `I am studying the technical concept "${ctx.title}" in ${ctx.category}.
Definition: "${ctx.summary}"
${ctx.formula ? `Formulation: ${ctx.formula}` : ''}

Please discuss the following focused questions:
1. What is the fundamental mathematical or architectural principle behind this concept?
2. How is this applied in real-world high-scale production systems or audio/AI architectures?
3. What are the subtle edge cases, common misconceptions, or performance trade-offs?`;

      claudePrompt = `Deep dive inquiry into "${ctx.title}" (${ctx.category}):
"${ctx.summary}"
Could you provide an architectural breakdown and comparative analysis against alternative paradigms?`;

      v0Prompt = `Create an interactive visual widget or educational simulation demonstrating the concept "${ctx.title}": ${ctx.summary}`;
      sciraPrompt = `State of the art research and practical engineering benchmarks for "${ctx.title}" ${ctx.category}`;
    } else {
      chatGptPrompt = `Saya sedang mempelajari istilah teknis "${ctx.title}" dalam kategori ${ctx.category}.
Definisi: "${ctx.summary}"
${ctx.formula ? `Formulasi/Rumus: ${ctx.formula}` : ''}

Mohon bantu jelaskan dan diskusikan pertanyaan-pertanyaan berikut:
1. Bagaimana prinsip fundamental atau dasar matematis dari konsep ini?
2. Bagaimana penerapan praktisnya dalam sistem nyata (software engineering, AI, atau teori musik)?
3. Apa saja trade-off, batasan kinerja, atau kesalahan umum (common pitfalls) yang sering terjadi?`;

      claudePrompt = `Analisis arsitektural mendalam untuk konsep "${ctx.title}" (${ctx.category}):
"${ctx.summary}"
Bisakah Anda berikan perbandingan komprehensif dengan pendekatan alternatif di industri?`;

      v0Prompt = `Buat komponen visual interaktif atau dashboard edukatif yang memvisualisasikan cara kerja konsep "${ctx.title}": ${ctx.summary}`;
      sciraPrompt = `Riset teknologi terkini dan studi kasus nyata untuk konsep "${ctx.title}" dalam ${ctx.category}`;
    }
  } else {
    // Standard Technical Article
    if (isEn) {
      chatGptPrompt = `I am analyzing the technical article "${ctx.title}" (${ctx.category}).
Summary: "${ctx.summary}"

Please answer and explore these discussion questions:
1. What are the key architectural trade-offs, advantages, and limitations discussed in this topic?
2. Can you provide a concrete production-grade implementation pattern and best practices?
3. What catastrophic failure modes or edge cases should engineers guard against when deploying this?`;

      claudePrompt = `Regarding the architecture article "${ctx.title}" (${ctx.category}) about "${ctx.summary}":
Can you critique the architectural pattern, discuss system scalability bottlenecks, and provide recommendations?`;

      v0Prompt = `Build an interactive web application UI prototype demonstrating the architectural flow of "${ctx.title}": ${ctx.summary}`;
      sciraPrompt = `Recent industry engineering blogs, RFCs, and implementations related to "${ctx.title}" ${ctx.category}`;
    } else {
      chatGptPrompt = `Saya sedang menganalisis artikel teknis "${ctx.title}" (Kategori: ${ctx.category}).
Ringkasan: "${ctx.summary}"

Mohon diskusikan pertanyaan-pertanyaan teknis berikut:
1. Apa saja trade-off arsitektural, keunggulan, dan batasan utama dalam topik ini?
2. Bagaimana pola implementasi standar industri dan best practices yang direkomendasikan?
3. Apa saja potensi bottleneck performa, risiko kegagalan, atau edge cases yang harus diantisipasi?`;

      claudePrompt = `Terkait artikel arsitektur "${ctx.title}" (${ctx.category}) mengenai "${ctx.summary}":
Bisakah Anda berikan review arsitektur mendalam, analisis skalabilitas sistem, dan rekomendasi implementasinya?`;

      v0Prompt = `Buat prototipe antarmuka aplikasi web interaktif yang memperagakan konsep arsitektur "${ctx.title}": ${ctx.summary}`;
      sciraPrompt = `Referensi engineering terkini, studi kasus perusahaan teknologi, dan implementasi dari "${ctx.title}"`;
    }
  }

  return {
    chatGptPrompt,
    chatGptUrl: `https://chatgpt.com/?q=${encodeURIComponent(chatGptPrompt)}`,
    claudePrompt,
    claudeUrl: `https://claude.ai/new?q=${encodeURIComponent(claudePrompt)}`,
    v0Prompt,
    v0Url: `https://v0.dev?q=${encodeURIComponent(v0Prompt)}`,
    sciraPrompt,
    sciraUrl: `https://scira.ai/?q=${encodeURIComponent(sciraPrompt)}`,
  };
}
