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
term_id: "Machine Learning"
term_en: "Machine Learning"
slug: "machine-learning"
category: "Learning (AI)"
phonetic: "/məˈʃiːn ˈlɜːrnɪŋ/"
definition_id: "Cabang dari kecerdasan buatan (AI) yang berfokus pada penggunaan data dan algoritma untuk meniru cara manusia belajar, dengan meningkatkan akurasi seiring waktu secara bertahap."
definition_en: "A branch of artificial intelligence (AI) and computer science which focuses on the use of data and algorithms to imitate the way that humans learn, gradually improving its accuracy."
formula: "y = wx + b"
is_ai_assisted: true
ai_model: "Gemini 3.7 Flash"
examples:
  - "Sistem rekomendasi pada e-commerce"
  - "Pengenalan gambar pada aplikasi medis"
---

# Penjelasan Mendalam Istilah

## Karakteristik Akustik & Teori
Uraikan secara mendalam bagaimana istilah ini bekerja, baik dari sudut pandang fisika gelombang, matematika, maupun implementasi kode perangkat lunak.

## Contoh Penerapan
Tuliskan contoh kasus konkret dalam arsitektur sistem atau seni musik.
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
  const modelName = data.targetModel || 'ChatGPT (GPT-4o)';
  const prompt = `Anda adalah seorang Penulis Teknis Senior, Arsitek Sistem, dan Peneliti AI.
Tolong buatkan draf artikel teknis yang sangat mendalam, akurat, dan komprehensif berdasarkan garis besar ide berikut:

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
read_time: "7 min read"
is_ai_assisted: true
ai_model: "${modelName}"
author_name: "Nama Anda"
author_role: "Author / Engineer"
---

# [Judul Utama Artikel]

## 1. Pengantar & Latar Belakang Masalah
[Jelaskan motivasi teknis mengapa topik ini penting, masalah yang dihadapi, dan solusi yang ditawarkan.]

## 2. Konsep Inti & Landasan Teoretis
[Jelaskan arsitektur teknis secara gamblang. Jika relevan, sertakan formula matematis LaTeX atau analogi visual. Bila menyebutkan istilah teknis, hubungkan dengan format [[istilah-slug]] (misal: [[backpropagation]], [[floating-point-arithmetic]], dll).]

## 3. Implementasi Kode Nyata (Production-Ready)
[Berikan contoh kode TypeScript/Python/Arsitektur yang bersih, memiliki tipe data, dan komentar instruktif.]

\`\`\`typescript
// Contoh kode implementasi nyata
\`\`\`

## 4. Trade-Offs, Bottlenecks & Best Practices
- **Keunggulan**: ...
- **Trade-off & Batasan**: ...
- **Tips Implementasi di Produksi**: ...

## 5. Kesimpulan & Referensi
[Rangkuman padat dan wawasan penutup.]

Tolong buat artikel ini secara berbobot, berstandar engineering tinggi, dan lengkap tanpa memotong kode atau penjelasan.`;

  const encoded = encodeURIComponent(prompt);

  return {
    prompt,
    url: `https://chatgpt.com/?q=${encoded}`,
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
  const modelName = data.targetModel || 'Gemini 3.7 Flash';
  const prompt = `Anda adalah seorang Leksikografer Teknis dan Arsitek Rekayasa Perangkat Lunak.
Tolong buatkan entri kamus istilah teknis komprehensif untuk kamus "Vanpedia" berdasarkan istilah berikut:

- Nama Istilah: "${data.termName}"
- Kategori: "${data.category}"
${data.details ? `- Catatan Khusus: "${data.details}"` : ''}

Format keluaran HARUS berformat Markdown dengan YAML Frontmatter persis seperti struktur berikut (langsung outputkan markdown tanpa basa-basi):

---
term_id: "[Nama Istilah Bahasa Indonesia]"
term_en: "[Term Name in English]"
slug: "[slug-ramah-url-huruf-kecil-tanpa-spasi]"
category: "${data.category}"
phonetic: "/[simbol fonetik]/ (contoh: /ˈtraɪtoʊn/)"
definition_id: "[Definisi presisi 1-2 kalimat dalam Bahasa Indonesia yang formal dan ilmiah]"
definition_en: "[Formal 1-2 sentence definition in English]"
formula: "[Model matematis, rumus frekuensi, atau formulasi algoritma jika ada]"
is_ai_assisted: true
ai_model: "${modelName}"
examples:
  - "[Contoh nyata 1]"
  - "[Contoh nyata 2]"
---

# Penjelasan Komprehensif

## 1. Landasan Konseptual & Mekanisme
[Jelaskan cara kerja, asal-usul teoretis, dan mekanismenya secara detail.]

## 2. Implementasi & Relevansi Industri
[Bagaimana konsep ini digunakan di dunia nyata: di AI, software engineering, keamanan siber, dll.]

## 3. Kesalahan Konsep yang Sering Terjadi (Common Misconceptions)
[Uraikan kekeliruan umum yang sering dipahami orang mengenai istilah ini.]`;

  const encoded = encodeURIComponent(prompt);

  return {
    prompt,
    url: `https://chatgpt.com/?q=${encoded}`,
    chatGptUrl: `https://chatgpt.com/?q=${encoded}`,
    claudeUrl: `https://claude.ai/new?q=${encoded}`,
    v0Url: `https://v0.dev/chat?q=${encoded}`,
    sciraUrl: `https://scira.ai/?q=${encoded}`,
    glmUrl: `https://chatglm.cn/main/gcommit?prompt=${encoded}`,
    geminiUrl: `https://gemini.google.com/app?text=${encoded}`,
  };
}
