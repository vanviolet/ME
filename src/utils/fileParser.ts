export interface ParsedArticleFile {
  title?: string;
  titleId?: string;
  titleEn?: string;
  category?: string;
  tags?: string[];
  summary?: string;
  summaryId?: string;
  summaryEn?: string;
  readTime?: string;
  content?: string;
  contentId?: string;
  contentEn?: string;
  isAiAssisted?: boolean;
  aiModel?: string;
  authorName?: string;
  authorRole?: string;
}

export interface ParsedVanpediaFile {
  title?: string;
  termId?: string;
  termEn?: string;
  slug?: string;
  category?: string;
  phonetic?: string;
  definition?: string;
  definitionId?: string;
  definitionEn?: string;
  formula?: string;
  examples?: string[];
  content?: string;
  contentId?: string;
  contentEn?: string;
  isAiAssisted?: boolean;
  aiModel?: string;
}

/**
 * Extracts simple YAML-like frontmatter from markdown text
 */
function parseFrontmatter(rawText: string): { frontmatter: Record<string, any>; body: string } {
  const trimmed = rawText.trim();
  const fmMatch = trimmed.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);

  if (!fmMatch) {
    return { frontmatter: {}, body: trimmed };
  }

  const rawFm = fmMatch[1];
  const body = fmMatch[2].trim();
  const frontmatter: Record<string, any> = {};

  const lines = rawFm.split(/\r?\n/);
  let currentKey = '';
  let isArrayMode = false;
  let currentArray: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    // Check array item
    if (trimmedLine.startsWith('- ') && isArrayMode && currentKey) {
      currentArray.push(trimmedLine.substring(2).trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      if (isArrayMode && currentKey) {
        frontmatter[currentKey] = currentArray;
        isArrayMode = false;
        currentArray = [];
      }

      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');

      if (!val) {
        // Possibility of multiline array or object
        currentKey = key;
        isArrayMode = true;
        currentArray = [];
      } else {
        frontmatter[key] = val;
      }
    }
  }

  if (isArrayMode && currentKey) {
    frontmatter[currentKey] = currentArray;
  }

  return { frontmatter, body };
}

/**
 * Parses an uploaded file (Markdown or JSON) into Article form data
 */
export async function parseArticleFile(file: File): Promise<ParsedArticleFile> {
  const text = await file.text();

  if (file.name.endsWith('.json')) {
    try {
      const data = JSON.parse(text);
      return {
        title: data.titleId || data.title_id || (typeof data.title === 'object' ? data.title.id : data.title),
        titleId: data.titleId || data.title_id || (typeof data.title === 'object' ? data.title.id : data.title),
        titleEn: data.titleEn || data.title_en || (typeof data.title === 'object' ? data.title.en : ''),
        category: data.category,
        tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : []),
        summary: data.summaryId || data.summary_id || (typeof data.summary === 'object' ? data.summary.id : data.summary),
        summaryId: data.summaryId || data.summary_id || (typeof data.summary === 'object' ? data.summary.id : data.summary),
        summaryEn: data.summaryEn || data.summary_en || (typeof data.summary === 'object' ? data.summary.en : ''),
        readTime: data.readTime || data.read_time,
        content: data.contentId || data.content_id || (typeof data.content === 'object' ? data.content.id : data.content),
        contentId: data.contentId || data.content_id || (typeof data.content === 'object' ? data.content.id : data.content),
        contentEn: data.contentEn || data.content_en || (typeof data.content === 'object' ? data.content.en : ''),
        isAiAssisted: data.isAiAssisted ?? data.is_ai_assisted ?? Boolean(data.aiModel || data.ai_model),
        aiModel: data.aiModel || data.ai_model || undefined,
        authorName: data.authorName || data.author_name || (typeof data.author === 'object' ? data.author.name : undefined),
        authorRole: data.authorRole || data.author_role || (typeof data.author === 'object' ? data.author.role : undefined),
      };
    } catch (e) {
      throw new Error('Invalid JSON format: ' + (e as any).message);
    }
  }

  // Treat as Markdown with Frontmatter
  const { frontmatter, body } = parseFrontmatter(text);

  const rawTags = frontmatter.tags || frontmatter.tag || '';
  const tags = Array.isArray(rawTags)
    ? rawTags
    : String(rawTags)
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

  const titleVal = frontmatter.title_id || frontmatter.titleId || frontmatter.title;
  const summaryVal = frontmatter.summary_id || frontmatter.summaryId || frontmatter.summary;
  const contentVal = body || frontmatter.content_id || frontmatter.contentId;

  const rawAiAssisted = frontmatter.is_ai_assisted ?? frontmatter.isAiAssisted;
  const isAiAssisted = rawAiAssisted === true || rawAiAssisted === 'true' || Boolean(frontmatter.ai_model || frontmatter.aiModel);
  const aiModel = frontmatter.ai_model || frontmatter.aiModel || (isAiAssisted ? 'ChatGPT (GPT-4o)' : undefined);

  return {
    title: titleVal,
    titleId: titleVal,
    titleEn: frontmatter.title_en || frontmatter.titleEn,
    category: frontmatter.category,
    tags: tags.length > 0 ? tags : undefined,
    summary: summaryVal,
    summaryId: summaryVal,
    summaryEn: frontmatter.summary_en || frontmatter.summaryEn,
    readTime: frontmatter.read_time || frontmatter.readTime,
    content: contentVal,
    contentId: contentVal,
    contentEn: frontmatter.content_en || frontmatter.contentEn,
    isAiAssisted,
    aiModel,
    authorName: frontmatter.author_name || frontmatter.authorName,
    authorRole: frontmatter.author_role || frontmatter.authorRole,
  };
}

/**
 * Parses an uploaded file for Vanpedia term
 */
export async function parseVanpediaFile(file: File): Promise<ParsedVanpediaFile> {
  const text = await file.text();

  if (file.name.endsWith('.json')) {
    try {
      const data = JSON.parse(text);
      const termTitle = data.termId || data.term_id || data.titleId || (typeof data.title === 'object' ? data.title.id : data.title);
      const defVal = data.definitionId || data.definition_id || (typeof data.definition === 'object' ? data.definition.id : data.definition);
      return {
        title: termTitle,
        termId: termTitle,
        termEn: data.termEn || data.term_en || data.titleEn || (typeof data.title === 'object' ? data.title.en : ''),
        slug: data.slug,
        category: data.category,
        phonetic: data.phonetic,
        definition: defVal,
        definitionId: defVal,
        definitionEn: data.definitionEn || data.definition_en || (typeof data.definition === 'object' ? data.definition.en : ''),
        formula: data.formula,
        examples: Array.isArray(data.examples) ? data.examples : (typeof data.examples === 'string' ? [data.examples] : []),
        content: data.contentId || data.content_id || data.content,
        contentId: data.contentId || data.content_id || data.content,
        contentEn: data.contentEn || data.content_en,
        isAiAssisted: data.isAiAssisted ?? data.is_ai_assisted ?? Boolean(data.aiModel || data.ai_model),
        aiModel: data.aiModel || data.ai_model,
      };
    } catch (e) {
      throw new Error('Invalid JSON format: ' + (e as any).message);
    }
  }

  const { frontmatter, body } = parseFrontmatter(text);

  let parsedExamples: string[] = [];
  if (Array.isArray(frontmatter.examples)) {
    parsedExamples = frontmatter.examples;
  } else if (typeof frontmatter.examples === 'string') {
    parsedExamples = frontmatter.examples.split('\n').map(s => s.trim()).filter(Boolean);
  }

  const vTitle = frontmatter.term_id || frontmatter.termId || frontmatter.title_id || frontmatter.title;
  const vDef = frontmatter.definition_id || frontmatter.definitionId || frontmatter.definition;
  const vContent = body || frontmatter.content_id || frontmatter.content;

  const rawAiAssisted = frontmatter.is_ai_assisted ?? frontmatter.isAiAssisted;
  const isAiAssisted = rawAiAssisted === true || rawAiAssisted === 'true' || Boolean(frontmatter.ai_model || frontmatter.aiModel);
  const aiModel = frontmatter.ai_model || frontmatter.aiModel || (isAiAssisted ? 'Gemini 3.7 Flash' : undefined);

  return {
    title: vTitle,
    termId: vTitle,
    termEn: frontmatter.term_en || frontmatter.termEn || frontmatter.title_en,
    slug: frontmatter.slug,
    category: frontmatter.category,
    phonetic: frontmatter.phonetic,
    definition: vDef,
    definitionId: vDef,
    definitionEn: frontmatter.definition_en || frontmatter.definitionEn,
    formula: frontmatter.formula,
    examples: parsedExamples.length > 0 ? parsedExamples : undefined,
    content: vContent,
    contentId: vContent,
    isAiAssisted,
    aiModel,
  };
}

/**
 * Downloads a pre-formatted Article Markdown Template
 */
export function downloadArticleTemplate(): void {
  const content = `---
title_id: "Judul Artikel Menarik Bahasa Indonesia"
title_en: "Compelling Article Title in English"
category: "Learning (AI)"
tags: "neural-network, deep-learning, machine-learning"
summary_id: "Ringkasan komprehensif dalam 2 hingga 3 kalimat yang memikat dan padat informasi mengenai bahasan artikel ini."
summary_en: "A comprehensive 2-3 sentence overview describing the core technical takeaways of this article."
read_time: "6 min read"
is_ai_assisted: true
ai_model: "ChatGPT (GPT-4o)"
author_name: "Muchamad Irvan"
author_role: "Software Engineer"
---

# Judul Utama Artikel

## 1. Pengantar & Motivasi
Tuliskan latar belakang mengapa konsep ini penting. Anda dapat menghubungkan istilah teknis ke Vanpedia menggunakan format \`[[kata-kunci]]\`, contohnya \`[[machine-learning]]\` atau \`[[backpropagation]]\`.

## 2. Arsitektur & Prinsip Kerja
Jelaskan cara kerja sistem secara mendalam. Anda dapat menuliskan formula matematika:
$$f(x) = \\frac{1}{1 + e^{-x}}$$

## 3. Contoh Kode Implementasi
Gunakan code block dengan penanda bahasa:

\`\`\`typescript
interface ModelConfig {
  learningRate: number;
  epochs: number;
}

export function trainModel(config: ModelConfig) {
  console.log('Training initialized with LR:', config.learningRate);
}
\`\`\`

## 4. Trade-offs & Evaluasi
- **Kelebihan**: Efisiensi komputasi tinggi, skalabilitas teruji.
- **Tantangan**: Membutuhkan tuning hiperparameter yang teliti.

## 5. Kesimpulan
Rangkuman kesimpulan dan arah pengembangan selanjutnya.
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-artikel-vanviolet.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a pre-formatted Vanpedia Term Template
 */
export function downloadVanpediaTemplate(): void {
  const content = `---
term_id: "Backpropagation"
term_en: "Backpropagation Algorithm"
slug: "backpropagation"
category: "Learning (AI)"
phonetic: "/ˈbækˌprɑːpəˈɡeɪʃən/"
definition_id: "Algoritma optimasi berbasis gradien untuk melatih jaringan saraf tiruan dengan menghitung gradien fungsi kerugian terhadap setiap bobot menggunakan aturan rantai kalkulus."
definition_en: "A gradient-based optimization algorithm used to train artificial neural networks by computing gradients of the loss function with respect to weights using calculus chain rule."
formula: "\\\\frac{\\\\partial L}{\\\\partial w_{ij}} = \\\\frac{\\\\partial L}{\\\\partial y} \\\\cdot \\\\frac{\\\\partial y}{\\\\partial z} \\\\cdot \\\\frac{\\\\partial z}{\\\\partial w_{ij}}"
is_ai_assisted: true
ai_model: "Gemini 3.8 Flash (Firebase AI Logic)"
examples:
  - "Pelatihan model deep learning untuk klasifikasi citra"
  - "Penyesuaian bobot pada transformer dan LLM"
---

# Penjelasan Istilah

## Konsep Inti & Prinsip Kerja
Jelaskan prinsip dasar bagaimana konsep ini bekerja secara ringkas, jelas, dan akurat tanpa bertele-tele.

## Contoh Penerapan di Industri
Tuliskan contoh kasus nyata dalam rekayasa perangkat lunak, arsitektur sistem, atau kecerdasan buatan.
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-vanpedia-vanviolet.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface AiPromptResult {
  prompt: string;
  url: string;
  chatGptUrl: string;
  claudeUrl: string;
  v0Url: string;
  sciraUrl: string;
  glmUrl: string;
  geminiUrl: string;
}

/**
 * Generates the master prompt for writing an article matching the exact template
 */
export function generateChatGptArticlePrompt(data: {
  outlineTitle: string;
  category: string;
  keyPoints?: string;
  targetLanguage?: 'id' | 'en' | 'both';
  targetModel?: string;
}): AiPromptResult {
  const modelName = data.targetModel || 'Gemini 3.8 Flash';
  const prompt = `Anda adalah seorang Penulis Teknis Senior dan Arsitek Rekayasa Perangkat Lunak.
Tolong buatkan draf artikel teknis yang mendalam, terstruktur rapi, berbobot, dan aplikatif berdasarkan garis besar ide berikut:

- Judul / Topik Garis Besar: "${data.outlineTitle}"
- Kategori Artikel: "${data.category}"
${data.keyPoints ? `- Poin-poin Kunci yang Harus Dibahas: "${data.keyPoints}"` : ''}

PENTING:
Format keluaran Anda HARUS berformat Markdown persis dengan struktur YAML Frontmatter di bawah ini (tanpa teks pembuka atau basa-basi lain) agar saya dapat langsung menyimpan file sebagai .md dan mengunggahnya ke portal web:

---
title_id: "[Judul Menarik & Berbobot dalam Bahasa Indonesia]"
title_en: "[Title in English]"
category: "${data.category}"
tags: "tag1, tag2, tag3, tag4"
summary_id: "[Ringkasan padat 2-3 kalimat dalam Bahasa Indonesia yang menjelaskan problem, solusi, dan intisari]"
summary_en: "[Concise 2-3 sentence summary in English]"
read_time: "6 min read"
is_ai_assisted: true
ai_model: "${modelName}"
author_name: "Muchamad Irvan"
author_role: "Software Engineer"
---

# [Judul Utama Artikel]

## 1. Pengantar & Latar Belakang Masalah
[Tuliskan latar belakang masalah mengapa topik ini krusial untuk dipahami. Hubungkan konsep atau istilah penting dengan format tautan Vanpedia seperti [[nama-istilah]]].

## 2. Arsitektur & Prinsip Kerja
[Jelaskan mekanisme kerja sistem secara konseptual. Sertakan formula matematis bila relevan, contoh: $$f(x) = \\sigma(W \\cdot x + b)$$].

## 3. Implementasi Kode Nyata
[Sajikan contoh kode produksi yang fungsional, bersih, dan bertipe data lengkap].

## 4. Analisis Trade-offs & Praktik Terbaik
- **Kelebihan**: [Keunggulan arsitektural atau performa]
- **Keterbatasan / Trade-off**: [Trade-off komputasi atau kompleksitas]
- **Praktik Terbaik**: [Rekomendasi teknis di lingkungan produksi]

## 5. Kesimpulan
[Rangkuman esensial dan wawasan penutup].`;

  const encoded = encodeURIComponent(prompt);

  return {
    prompt,
    url: `https://gemini.google.com/app?text=${encoded}`,
    chatGptUrl: `https://chatgpt.com/?q=${encoded}`,
    claudeUrl: `https://claude.ai/new?q=${encoded}`,
    v0Url: `https://v0.dev/chat?q=${encoded}`,
    sciraUrl: `https://scira.ai/?q=${encoded}`,
    glmUrl: `https://chatglm.cn/main/gcommit?prompt=${encoded}`,
    geminiUrl: `https://gemini.google.com/app?text=${encoded}`,
  };
}

/**
 * Generates the master prompt for creating a Vanpedia Glossary Entry matching template
 */
export function generateChatGptVanpediaPrompt(data: {
  termName: string;
  category: string;
  details?: string;
  targetModel?: string;
}): AiPromptResult {
  const modelName = data.targetModel || 'Gemini 3.8 Flash';
  const prompt = `Anda adalah seorang Leksikografer Teknis Rekayasa Perangkat Lunak dan AI.
Tolong buatkan entri kamus istilah teknis untuk "Vanpedia" yang RINGKAS, PADAT, AKURAT, dan SANGAT JELAS (tidak perlu banyak-banyak contentnya tapi jelas, tidak bertele-tele, tanpa metafora audio/musik):

- Nama Istilah: "${data.termName}"
- Kategori: "${data.category}"
${data.details ? `- Catatan Khusus: "${data.details}"` : ''}

Format keluaran HARUS berformat Markdown dengan YAML Frontmatter persis seperti struktur berikut (langsung outputkan markdown tanpa teks pengantar):

---
term_id: "[Nama Istilah Bahasa Indonesia]"
term_en: "[Term Name in English]"
slug: "[slug-ramah-url-huruf-kecil-tanpa-spasi]"
category: "${data.category}"
phonetic: "/[simbol fonetik IPA]/"
definition_id: "[Definisi presisi 1-2 kalimat dalam Bahasa Indonesia yang lugas dan mudah dipahami]"
definition_en: "[Formal 1-2 sentence definition in English]"
formula: "[Formula matematis, notasi algoritma, atau kosongkan jika tidak ada]"
is_ai_assisted: true
ai_model: "${modelName}"
examples:
  - "[Contoh konkret 1 di industri software/AI/sistem]"
  - "[Contoh konkret 2 di industri software/AI/sistem]"
---

# Penjelasan Istilah

## Konsep Inti & Prinsip Kerja
[Uraikan esensi istilah, prinsip dasar, dan mekanismenya secara padat dan jelas dalam 1-2 paragraf. Tidak perlu bertele-tele.]

## Contoh Penerapan Praktis
[Jelaskan bagaimana konsep ini diterapkan secara nyata pada sistem industri modern.]`;

  const encoded = encodeURIComponent(prompt);

  return {
    prompt,
    url: `https://gemini.google.com/app?text=${encoded}`,
    chatGptUrl: `https://chatgpt.com/?q=${encoded}`,
    claudeUrl: `https://claude.ai/new?q=${encoded}`,
    v0Url: `https://v0.dev/chat?q=${encoded}`,
    sciraUrl: `https://scira.ai/?q=${encoded}`,
    glmUrl: `https://chatglm.cn/main/gcommit?prompt=${encoded}`,
    geminiUrl: `https://gemini.google.com/app?text=${encoded}`,
  };
}

