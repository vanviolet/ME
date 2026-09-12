import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { createVanpediaTermInFirestore } from '../services/firestoreService';
import { generateVanpediaWithAi } from '../services/aiService';
import { AI_MODELS_LIST, getCleanModelName } from '../lib/models';
import {
  ArrowLeft,
  Send,
  Sparkles,
  BookOpen,
  Globe,
  Lock,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileCode,
  FileText,
} from 'lucide-react';
import { Seo } from './Seo';
import { RichEditor } from './RichEditor';
import { CategoryFreetextInput } from './CategoryFreetextInput';
import { TemplateUploadZone } from './TemplateUploadZone';
import { ParsedVanpediaFile } from '../utils/fileParser';
import { AiModelSelect } from './AiModelSelect';

export const CreateVanpediaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

  // Fast-Track AI Generation States
  const [aiTermName, setAiTermName] = useState('');
  const [aiDetails, setAiDetails] = useState('');
  const [selectedModel, setSelectedModel] = useState('nemotron-3-ultra');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Form Fields
  const [titleId, setTitleId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [category, setCategory] = useState('Learning (AI)');
  const [phonetic, setPhonetic] = useState('');
  const [definitionId, setDefinitionId] = useState('');
  const [definitionEn, setDefinitionEn] = useState('');
  const [contentId, setContentId] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [formula, setFormula] = useState('');
  const [examples, setExamples] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const [isAiAssisted, setIsAiAssisted] = useState(false);
  const [aiModel, setAiModel] = useState('Nemotron 3 Ultra');

  const [showTemplateUpload, setShowTemplateUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto-prefill form from location.state (e.g. from AI Chatbot "Tambahkan ke VanPedia")
  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (prefill) {
      if (prefill.termName) {
        setAiTermName(prefill.termName);
        setTitleId(prefill.termName);
        setTitleEn(prefill.termName);
        setSlugInput(
          prefill.termName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        );
      }
      if (prefill.definition) {
        setDefinitionId(prefill.definition);
        setDefinitionEn(prefill.definition);
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
          ? `Form pre-filled automatically from AI Chatbot (${getCleanModelName(prefill.aiModel || 'AI Assistant')}). You can review and publish.`
          : `Form VanPedia berhasil terisi otomatis dari respon AI Chatbot (${getCleanModelName(prefill.aiModel || 'AI Assistant')}). Silakan tinjau dan simpan.`
      );
    }
  }, [location.state, language]);

  // Fast-Track AI Generator
  const handleGenerateWithAi = async () => {
    if (!aiTermName.trim()) {
      setGenerationError(
        language === 'en'
          ? 'Please enter a term name to generate.'
          : 'Mohon masukkan nama istilah yang ingin digenerate.'
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const chosenModelName = getCleanModelName(selectedModel);
      const result = await generateVanpediaWithAi({
        termName: aiTermName.trim(),
        category: category !== 'Learning (AI)' && category ? category : undefined,
        details: aiDetails.trim() || undefined,
        model: selectedModel,
      });

      if (result) {
        setTitleId(result.termId || aiTermName.trim());
        setTitleEn(result.termEn || aiTermName.trim());
        if (result.slug) {
          setSlugInput(result.slug);
        }
        if (result.category) {
          setCategory(result.category);
        }
        if (result.phonetic) {
          setPhonetic(result.phonetic);
        }
        // Strict definition separation: definition is 1-2 sentence core meaning
        setDefinitionId(result.definitionId || '');
        setDefinitionEn(result.definitionEn || result.definitionId || '');
        // Detailed explanation markdown stored in content
        if (result.content) {
          setContentId(result.content);
          setContentEn(result.content);
        }
        if (result.formula) {
          setFormula(result.formula);
        }
        if (result.examples && Array.isArray(result.examples)) {
          setExamples(result.examples.join('\n'));
        }
        setIsAiAssisted(true);
        const resolvedModelName = getCleanModelName(result.aiModel || selectedModel);
        setAiModel(resolvedModelName);

        setFeedback(
          language === 'en'
            ? `Vanpedia term generated successfully with ${resolvedModelName}! Category: "${result.category}". You can review, edit, and publish.`
            : `Istilah Vanpedia berhasil digenerate dengan ${resolvedModelName}! Kategori otomatis: "${result.category}". Anda dapat meninjau, mengedit, atau langsung menyimpan.`
        );
      }
    } catch (err: any) {
      console.error('AI Vanpedia Generation Error:', err);
      setGenerationError(err.message || 'Gagal menghasilkan entri Vanpedia dengan AI Engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateLoaded = (parsed: ParsedVanpediaFile) => {
    if (parsed.title || parsed.termId) setTitleId(parsed.title || parsed.termId || '');
    if (parsed.category) setCategory(parsed.category);
    if (parsed.phonetic) setPhonetic(parsed.phonetic);
    if (parsed.definition) setDefinitionId(parsed.definition);
    if (parsed.formula) setFormula(parsed.formula);
    if (parsed.examples && parsed.examples.length > 0) setExamples(parsed.examples.join('\n'));
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
            ? 'Please sign in with Google to submit a term.'
            : 'Silakan masuk dengan Google terlebih dahulu untuk menambahkan istilah.'
        )
      ) {
        signInWithGoogle();
      }
      return;
    }

    if (!titleId.trim()) {
      alert(language === 'en' ? 'Please enter a term title.' : 'Mohon masukkan nama istilah.');
      return;
    }
    if (!definitionId.trim()) {
      alert(language === 'en' ? 'Please enter a definition.' : 'Mohon isi definisi atau penjelasan istilah.');
      return;
    }

    setSubmitting(true);
    try {
      const generatedSlug = (slugInput.trim() || titleEn.trim() || titleId.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const isSubmittingAdmin = user.email === adminEmail;
      const parsedExamples = examples
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const authorName = user.displayName || user.email?.split('@')[0] || 'Contributor';

      await createVanpediaTermInFirestore(
        {
          slug: generatedSlug,
          title: {
            id: titleId.trim(),
            en: titleEn.trim() || titleId.trim(),
          },
          category: category.trim() || 'Learning (AI)',
          phonetic: phonetic.trim() || undefined,
          definition: {
            id: definitionId.trim(),
            en: definitionEn.trim() || definitionId.trim(),
          },
          content: contentId.trim()
            ? {
                id: contentId.trim(),
                en: contentEn.trim() || contentId.trim(),
              }
            : undefined,
          formula: formula.trim() || undefined,
          examples: {
            id: parsedExamples.length > 0 ? parsedExamples : ['Contoh penerapan istilah ini.'],
            en: parsedExamples.length > 0 ? parsedExamples : ['Real-world application example.'],
          },
          authorName,
          authorEmail: user.email || undefined,
          authorId: user.uid,
          visibility,
          isAiAssisted,
          aiModel: isAiAssisted ? aiModel : undefined,
        },
        user.email || undefined,
        user.uid,
        isSubmittingAdmin
      );

      setFeedback(
        visibility === 'public'
          ? language === 'en'
            ? 'Public term published! Visible to everyone.'
            : 'Istilah publik berhasil dipublikasikan! Dapat dilihat oleh semua orang.'
          : language === 'en'
          ? 'Private term saved! Only visible in your account.'
          : 'Istilah privat berhasil disimpan! Hanya dapat dilihat di akun Anda.'
      );

      setTimeout(() => {
        navigate('/vanpedia');
      }, 1200);
    } catch (err: any) {
      alert('Error saving term: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 flex items-center justify-center mb-6 border border-stone-200 dark:border-zinc-700">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 mb-3">
          {language === 'en' ? 'Authentication Required' : 'Autentikasi Diperlukan'}
        </h1>
        <p className="text-stone-600 dark:text-zinc-400 mb-8 max-w-md text-sm leading-relaxed">
          {language === 'en'
            ? 'You need to sign in with your Google account to add new Vanpedia terms.'
            : 'Anda perlu masuk dengan akun Google untuk menambahkan istilah baru ke Vanpedia.'}
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'en' ? 'Sign In with Google' : 'Masuk dengan Google'}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <Seo
        title={language === 'en' ? 'Add Vanpedia Term | Van' : 'Tambah Istilah Vanpedia | Van'}
        description="Add a new technical term, definition, and formula to the encyclopedia."
      />

      {/* Header & Back Link */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/vanpedia"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Vanpedia' : 'Kembali ke Vanpedia'}</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowTemplateUpload((prev) => !prev)}
          className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-zinc-700"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>
            {showTemplateUpload
              ? language === 'en'
                ? 'Hide Template Upload'
                : 'Tutup Upload File'
              : language === 'en'
              ? 'Import from File/Template'
              : 'Upload Template File'}
          </span>
        </button>
      </div>

      <div>
        <div className="border-b border-stone-200 dark:border-zinc-800 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-stone-700 dark:text-zinc-300 shrink-0" />
            <span>{language === 'en' ? 'Add Technical Term' : 'Tambah Istilah Baru ke Vanpedia'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
            {language === 'en'
              ? 'Create concise, high-precision technical glossary definitions with formulas, IPA notation, and examples.'
              : 'Buat glosarium istilah teknis yang padat, akurat, formula matematis LaTeX, notasi fonetik IPA, dan contoh nyata.'}
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
                  <span>{language === 'en' ? 'Generate Term with AI' : 'Aksi Cepat: Generate dengan AI'}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Auto-Fill Everything
                  </span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  {language === 'en'
                    ? 'Simply enter the term name & short context. AI will auto-generate phonetic IPA, category, concise definition, formula & examples.'
                    : 'Cukup masukkan Nama Istilah & Konteks Singkat. AI akan otomatis mengisi fonetik IPA, kategori bebas, definisi ringkas, rumus LaTeX, dan contoh nyata.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Nama Istilah Input */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                  {language === 'en' ? '1. Term Name' : '1. Nama Istilah Teknis'} *
                </label>
                <input
                  type="text"
                  value={aiTermName}
                  onChange={(e) => setAiTermName(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'e.g. Backpropagation, Consistent Hashing, Vector Embedding'
                      : 'misal: Backpropagation, Consistent Hashing, Vector Embedding'
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

            {/* Konteks Singkat */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? '2. Short Context / Details (Optional)' : '2. Deskripsi Singkat / Konteks Istilah (Opsional)'}
              </label>
              <textarea
                value={aiDetails}
                onChange={(e) => setAiDetails(e.target.value)}
                rows={2}
                placeholder={
                  language === 'en'
                    ? 'e.g. Focus on computational graph chain rule, loss gradients, and deep learning optimizer application.'
                    : 'misal: Fokus pada aturan rantai graf komputasi (chain rule), gradien fungsi loss, dan optimasi bobot jaringan syaraf.'
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
                ⚡ Kategori, rumus matematis, fonetik IPA, dan contoh nyata akan diisi otomatis.
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
                    <span>{language === 'en' ? 'Generating with AI...' : 'Sedang Generate Istilah...'}</span>
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
              mode="vanpedia"
              onVanpediaLoaded={handleTemplateLoaded}
              onOpenAiHelper={() => {}}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN VANPEDIA FORM & EDITOR */}
        {/* ========================================================= */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visibility Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Visibility & Author' : 'Visibilitas & Penulis'}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                {user.displayName || user.email} {isAdmin && '• (Admin Verified)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  visibility === 'public'
                    ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-stone-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Public' : 'Publik'}</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  visibility === 'private'
                    ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-stone-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Private' : 'Privat'}</span>
              </button>
            </div>
          </div>

          {/* Title Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Term Name (Indonesian)' : 'Nama Istilah (Bahasa Indonesia)'} *
              </label>
              <input
                type="text"
                value={titleId}
                onChange={(e) => setTitleId(e.target.value)}
                placeholder="misal: Gradient Descent"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Term Name (English - Optional)' : 'Nama Istilah (Bahasa Inggris - Opsional)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Gradient Descent Optimization"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>
          </div>

          {/* Category, Phonetic, & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category with Freetext + Master Data Auto-Saving */}
            <CategoryFreetextInput
              value={category}
              onChange={setCategory}
              type="vanpedia"
              language={language === 'en' ? 'en' : 'id'}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Phonetic IPA (Optional)' : 'Pengucapan / Fonetik IPA'}
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="misal: /ˈɡreɪdiənt dɪˈsɛnt/"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Custom URL Slug' : 'Slug URL Kustom'}
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="misal: gradient-descent"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>
          </div>

          {/* Core Definition */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Core Definition (1-2 Sentences)' : 'Definisi Inti Ringkas (1-2 Kalimat)'} *
            </label>
            <textarea
              value={definitionId}
              onChange={(e) => setDefinitionId(e.target.value)}
              required
              rows={3}
              placeholder="Definisi formal dan ringkas istilah ini..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30 font-reading-sans"
            />
          </div>

          {/* Full Detailed Content with RichEditor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Detailed Explanation & Sections (Markdown & Math)' : 'Penjelasan Lengkap & Sub-Bab (Mendukung Markdown & Rumus)'}
              </label>
              <span className="text-[10px] text-stone-400 dark:text-zinc-500">Opsional / Lengkap</span>
            </div>
            <RichEditor
              value={contentId}
              onChange={setContentId}
              placeholder="Uraian mendalam, sub-bab, intuisi matematis, perbandingan, atau kode contoh..."
              minHeight="280px"
            />
          </div>

          {/* Mathematical Formula (LaTeX) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Mathematical Formula (LaTeX - Optional)' : 'Rumus Matematika / Formula (LaTeX - Opsional)'}
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="misal: \theta_{t+1} = \theta_t - \eta \nabla L(\theta_t)"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
            />
          </div>

          {/* Real-World Examples */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Real-World Examples (1 per line)' : 'Contoh Penerapan Nyata (1 per baris)'}
            </label>
            <textarea
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              rows={3}
              placeholder={'Misal:\nOptimasi bobot model deep learning saat proses training\nPenyesuaian parameter regresi linier pada dataset besar'}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
            />
          </div>

          {/* AI Assistance Toggle */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aiAssistedTermCheck"
                checked={isAiAssisted}
                onChange={(e) => setIsAiAssisted(e.target.checked)}
                className="w-4 h-4 text-stone-900 dark:text-zinc-100 rounded border-stone-300 dark:border-zinc-700 focus:ring-stone-400"
              />
              <label
                htmlFor="aiAssistedTermCheck"
                className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-zinc-100 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-stone-500 dark:text-zinc-400" />
                <span>{language === 'en' ? 'Researched with AI Assistance' : 'Diriset dengan Bantuan AI'}</span>
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
              to="/vanpedia"
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
                    ? 'Submitting...'
                    : 'Menyimpan...'
                  : language === 'en'
                  ? 'Add Term'
                  : 'Tambah Istilah'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
