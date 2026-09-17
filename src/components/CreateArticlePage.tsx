import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { createArticleInFirestore } from '../services/firestoreService';
import { generateArticleWithAi } from '../services/aiService';
import { AI_MODELS_LIST, getCleanModelName } from '../lib/models';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Globe,
  Lock,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Wand2,
  Cpu,
  Layers,
  UploadCloud,
} from 'lucide-react';
import { Seo } from './Seo';
import { RichEditor } from './RichEditor';
import { CategoryFreetextInput } from './CategoryFreetextInput';
import { TemplateUploadZone } from './TemplateUploadZone';
import { ParsedArticleFile } from '../utils/fileParser';
import { AiModelSelect } from './AiModelSelect';

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

  // Fast-Track "Generate with AI" Inputs
  const [aiTopic, setAiTopic] = useState('');
  const [aiShortDesc, setAiShortDesc] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Main Form States
  const [titleId, setTitleId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [category, setCategory] = useState('Learning (AI)');
  const [tags, setTags] = useState('AI, Software Engineering');
  const [summaryId, setSummaryId] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentId, setContentId] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const [isAiAssisted, setIsAiAssisted] = useState(false);
  const [aiModel, setAiModel] = useState('Gemini 3.8 Flash');

  const [showTemplateUpload, setShowTemplateUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto-prefill form from location.state (e.g. from AI Chatbot "Olah & Tambahkan ke Article")
  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (prefill) {
      if (prefill.titleId || prefill.title || prefill.topic) {
        const t = prefill.titleId || prefill.title || prefill.topic;
        setAiTopic(t);
        setTitleId(t);
        setTitleEn(prefill.titleEn || t);
        setSlugInput(
          (prefill.slug || t)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        );
      }
      if (prefill.category) {
        setCategory(prefill.category);
      }
      if (prefill.tags) {
        setTags(Array.isArray(prefill.tags) ? prefill.tags.join(', ') : prefill.tags);
      }
      if (prefill.summaryId || prefill.summary) {
        setSummaryId(prefill.summaryId || prefill.summary);
        setSummaryEn(prefill.summaryEn || prefill.summaryId || prefill.summary);
      }
      if (prefill.content) {
        setContentId(prefill.content);
        setContentEn(prefill.content);
      }
      if (prefill.aiModel) {
        setAiModel(getCleanModelName(prefill.aiModel));
      }
      setIsAiAssisted(true);
      setFeedback(
        language === 'en'
          ? `Article successfully synthesized and formatted with ${getCleanModelName(prefill.aiModel || 'AI Assistant')}! Review and publish.`
          : `Artikel berhasil diolah dan distrukturkan rapi oleh ${getCleanModelName(prefill.aiModel || 'AI Assistant')}! Silakan tinjau dan terbitkan.`
      );
    }
  }, [location.state, language]);

  // Fast-Track AI Generation Handler
  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) {
      setGenerationError(
        language === 'en'
          ? 'Please enter an article title or topic to generate.'
          : 'Mohon masukkan judul atau topik artikel yang ingin digenerate.'
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = await generateArticleWithAi({
        topic: aiTopic.trim(),
        category: category !== 'Learning (AI)' && category ? category : undefined,
        keyPoints: aiShortDesc.trim() || undefined,
        language: language === 'en' ? 'en' : 'id',
        model: selectedModel,
      });

      if (result) {
        setTitleId(result.titleId || aiTopic.trim());
        setTitleEn(result.titleEn || aiTopic.trim());
        if (result.category) {
          setCategory(result.category);
        }
        if (result.tags && result.tags.length > 0) {
          setTags(result.tags.join(', '));
        }
        setSummaryId(result.summaryId || '');
        setSummaryEn(result.summaryEn || result.summaryId || '');
        setContentId(result.content || '');
        setContentEn(result.content || '');
        setIsAiAssisted(true);
        setAiModel(getCleanModelName(result.aiModel || selectedModel));

        setFeedback(
          language === 'en'
            ? `Article generated successfully with ${getCleanModelName(result.aiModel || selectedModel)}! Category: "${result.category}". You can review, edit, and publish.`
            : `Artikel berhasil digenerate dengan ${getCleanModelName(result.aiModel || selectedModel)}! Kategori otomatis: "${result.category}". Anda dapat meninjau, mengedit, atau langsung menerbitkan.`
        );
      }
    } catch (err: any) {
      console.error('AI Article Generation Error:', err);
      setGenerationError(err.message || 'Gagal menghasilkan artikel dengan AI Engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateLoaded = (parsed: ParsedArticleFile) => {
    if (parsed.title) setTitleId(parsed.title);
    if (parsed.category) setCategory(parsed.category);
    if (parsed.summary) setSummaryId(parsed.summary);
    if (parsed.content) setContentId(parsed.content);
    if (parsed.tags && parsed.tags.length > 0) setTags(parsed.tags.join(', '));
    if (parsed.isAiAssisted !== undefined) setIsAiAssisted(parsed.isAiAssisted);
    if (parsed.aiModel) {
      setIsAiAssisted(true);
      setAiModel(parsed.aiModel);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (
        confirm(
          language === 'en'
            ? 'Please sign in with Google to publish an article.'
            : 'Silakan masuk dengan Google untuk mempublikasikan artikel.'
        )
      ) {
        signInWithGoogle();
      }
      return;
    }

    if (!titleId.trim()) {
      alert(language === 'en' ? 'Please enter a title.' : 'Mohon masukkan judul artikel.');
      return;
    }
    if (!contentId.trim()) {
      alert(language === 'en' ? 'Please enter article content.' : 'Mohon isi konten artikel.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const generatedSlug = (slugInput.trim() || titleEn.trim() || titleId.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const isSubmittingAdmin = user.email === adminEmail;
      const authorName = user.displayName || user.email?.split('@')[0] || 'Contributor';

      await createArticleInFirestore(
        {
          slug: generatedSlug,
          titleId: titleId.trim(),
          titleEn: titleEn.trim() || titleId.trim(),
          summaryId: summaryId.trim(),
          summaryEn: summaryEn.trim() || summaryId.trim(),
          contentId: contentId.trim(),
          contentEn: contentEn.trim() || contentId.trim(),
          category: category.trim() || 'General',
          tags: parsedTags.length > 0 ? parsedTags : ['Engineering'],
          visibility,
          isAiAssisted,
          aiModel: isAiAssisted ? aiModel : undefined,
          authorName,
          authorEmail: user.email || undefined,
        },
        user,
        user.uid,
        isSubmittingAdmin
      );

      setFeedback(
        isSubmittingAdmin
          ? language === 'en'
            ? 'Article published successfully!'
            : 'Artikel berhasil dipublikasikan!'
          : language === 'en'
          ? 'Article submitted! Awaiting approval.'
          : 'Artikel berhasil diajukan! Menunggu persetujuan admin.'
      );

      setTimeout(() => {
        navigate('/articles');
      }, 1500);
    } catch (err: any) {
      alert('Error saving article: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="py-24 px-6 sm:px-8 max-w-3xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 flex items-center justify-center mb-6">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 mb-3">
          {language === 'en' ? 'Authentication Required' : 'Autentikasi Diperlukan'}
        </h1>
        <p className="text-stone-600 dark:text-zinc-400 mb-8 max-w-md text-sm leading-relaxed">
          {language === 'en'
            ? 'You need to sign in with your Google account to create and publish articles.'
            : 'Anda perlu masuk dengan akun Google untuk membuat dan mempublikasikan artikel.'}
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <User className="w-4 h-4" />
          <span>{language === 'en' ? 'Sign In with Google' : 'Masuk dengan Google'}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <Seo
        title={language === 'en' ? 'Create Article | Muchamad Irvan' : 'Tulis Artikel | Muchamad Irvan'}
        description="Create and publish a technical article or research note."
      />

      {/* Header & Back Link */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Articles' : 'Kembali ke Artikel'}</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowTemplateUpload((prev) => !prev)}
          className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-zinc-700"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{showTemplateUpload ? (language === 'en' ? 'Hide Template Upload' : 'Tutup Upload File') : (language === 'en' ? 'Import from File/Template' : 'Upload Template File')}</span>
        </button>
      </div>

      <div>
        <div className="border-b border-stone-200 dark:border-zinc-800 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 flex items-center gap-3">
            <FileText className="w-6 h-6 text-stone-700 dark:text-zinc-300 shrink-0" />
            <span>{language === 'en' ? 'Create Technical Article' : 'Buat Artikel Teknis'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
            {language === 'en'
              ? 'Draft publication-ready articles with instant AI generation, LaTeX formulas, and production code.'
              : 'Tulis draf artikel teknis dengan aksi instan Generate AI, formula LaTeX, dan standar kode produksi.'}
          </p>
        </div>

        {/* ========================================================= */}
        {/* FAST-TRACK "GENERATE WITH AI" SECTION */}
        {/* ========================================================= */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-stone-50 to-white dark:from-zinc-900/80 dark:to-zinc-900 border border-stone-300/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-white dark:bg-zinc-100 dark:text-stone-900 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{language === 'en' ? 'Generate Article with AI' : 'Aksi Cepat: Generate dengan AI'}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Auto-Fill Everything
                  </span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  {language === 'en'
                    ? 'Simply provide a title and short outline. AI will generate the full markdown, category, tags, and summary.'
                    : 'Cukup masukkan Judul & Deskripsi Singkat. AI akan otomatis membuatkan isi artikel, kategori bebas, tag, dan ringkasan.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Judul Input */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                  {language === 'en' ? '1. Article Title / Topic' : '1. Judul / Topik Artikel'} *
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'e.g. Distributed Consensus with Raft in TypeScript'
                      : 'misal: Implementasi Distributed Consensus dengan Raft di TypeScript'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
                />
              </div>

              {/* Model Selector */}
              <div className="sm:col-span-5">
                <AiModelSelect
                  value={selectedModel}
                  onChange={setSelectedModel}
                  label={language === 'en' ? 'AI Model Engine' : 'Pilihan Model AI Engine'}
                />
              </div>
            </div>

            {/* Deskripsi Singkat */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? '2. Short Description / Outline (Optional)' : '2. Deskripsi Singkat / Poin-Poin Utama (Opsional)'}
              </label>
              <textarea
                value={aiShortDesc}
                onChange={(e) => setAiShortDesc(e.target.value)}
                rows={2}
                placeholder={
                  language === 'en'
                    ? 'e.g. Cover election timers, log replication, edge-case network partitions, and full code examples with LaTeX formulas.'
                    : 'misal: Bahas mekanisme election timeout, replikasi log, penanganan partisi jaringan, sertakan formula LaTeX dan kode produksi.'
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>

            {/* Error Message */}
            {generationError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            {/* Generate Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400">
                ⚡ Kategori, tag, dan ringkasan akan otomatis ditentukan oleh model AI.
              </span>
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGenerating}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 disabled:opacity-50 text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{language === 'en' ? 'Generating with AI...' : 'Sedang Generate Artikel...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>{language === 'en' ? 'Generate with AI' : 'Generate with AI'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="leading-relaxed">{feedback}</span>
          </div>
        )}

        {/* Optional Template Upload Dropzone */}
        {showTemplateUpload && (
          <div className="mb-8">
            <TemplateUploadZone
              mode="article"
              onArticleLoaded={handleTemplateLoaded}
              onOpenAiHelper={() => {}}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN ARTICLE FORM & EDITOR */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Author Badge */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold flex items-center justify-center text-sm">
                {(user.displayName || user.email || 'A')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                  {language === 'en' ? 'Author' : 'Penulis'}
                </p>
                <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                  {user.displayName || user.email?.split('@')[0]}
                  {isAdmin && (
                    <span className="ml-2 text-[10px] bg-stone-700 text-white px-2 py-0.5 rounded-md font-medium">
                      ADMIN
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="text-xs text-stone-500 dark:text-zinc-400">{user.email}</span>
          </div>

          {/* Title Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Title (Indonesian)' : 'Judul Artikel (Bahasa Indonesia)'} *
              </label>
              <input
                type="text"
                value={titleId}
                onChange={(e) => setTitleId(e.target.value)}
                placeholder="misal: Memahami Algoritma Pencarian Vektor"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Title (English - Optional)' : 'Judul Artikel (Bahasa Inggris)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Understanding Vector Search Algorithms"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>
          </div>

          {/* Freetext Category & Custom Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category with Freetext + Master Data Auto-Saving */}
            <CategoryFreetextInput
              value={category}
              onChange={setCategory}
              type="article"
              language={language === 'en' ? 'en' : 'id'}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Custom Slug (URL)' : 'Slug URL Kustom (Opsional)'}
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="misal: memahami-algoritma-vektor"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Tags (comma separated)' : 'Tag (pisahkan dengan koma)'}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, Vector, Algorithm, Firestore, Architecture"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Summary / Excerpt' : 'Ringkasan Artikel'}
            </label>
            <textarea
              value={summaryId}
              onChange={(e) => setSummaryId(e.target.value)}
              rows={2}
              placeholder="Penjelasan singkat 2-3 kalimat mengenai intisari artikel..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
            />
          </div>

          {/* Article Content with RichEditor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Article Content (Markdown & LaTeX supported)' : 'Isi Artikel (Mendukung Markdown & LaTeX)'} *
            </label>
            <RichEditor
              value={contentId}
              onChange={setContentId}
              placeholder="Tulis artikel lengkap di sini... Anda bisa menggunakan format Markdown seperti # Judul, **teks tebal**, $$rumus matematika$$, atau [[slug-vanpedia]]..."
              minHeight="380px"
            />
          </div>

          {/* Visibility Setting */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-2">
              {language === 'en' ? 'Visibility' : 'Pengaturan Visibilitas'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === 'public'
                    ? 'border-stone-900 dark:border-zinc-100 bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 ring-1 ring-stone-900 dark:ring-zinc-100'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0 mt-0.5 text-stone-700 dark:text-zinc-300" />
                <div>
                  <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{language === 'en' ? 'Public Article' : 'Artikel Publik'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300">
                      Public
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                    {language === 'en' ? 'Visible to everyone on the web.' : 'Dapat dibaca oleh semua pengunjung.'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === 'private'
                    ? 'border-stone-900 dark:border-zinc-100 bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 ring-1 ring-stone-900 dark:ring-zinc-100'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-stone-700 dark:text-zinc-300" />
                <div>
                  <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{language === 'en' ? 'Private Article' : 'Artikel Privat'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300">
                      Private
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                    {language === 'en' ? 'Only visible to you and Admin.' : 'Hanya dapat dilihat oleh Anda dan Admin.'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* AI Assistance Metadata */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aiAssistedCheck"
                checked={isAiAssisted}
                onChange={(e) => setIsAiAssisted(e.target.checked)}
                className="w-4 h-4 text-stone-900 dark:text-zinc-100 rounded border-stone-300 dark:border-zinc-700 focus:ring-stone-400"
              />
              <label
                htmlFor="aiAssistedCheck"
                className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-zinc-100 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-stone-500 dark:text-zinc-400" />
                <span>{language === 'en' ? 'Researched / Written with AI Assistance' : 'Diriset / Ditulis dengan Bantuan AI'}</span>
              </label>
            </div>

            {isAiAssisted && (
              <div className="pl-7">
                <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'AI Model Used' : 'Model AI yang Digunakan'}
                </label>
                <input
                  type="text"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  placeholder="misal: Gemini 3.8 Flash, Nemotron 3 Ultra, DeepSeek R1"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400/30"
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-stone-200 dark:border-zinc-800">
            <Link
              to="/articles"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 text-sm font-medium transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 disabled:opacity-50 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? language === 'en'
                    ? 'Publishing...'
                    : 'Menerbitkan...'
                  : language === 'en'
                  ? 'Publish Article'
                  : 'Terbitkan Artikel'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
