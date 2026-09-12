import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { createArticleInFirestore } from '../services/firestoreService';
import { ArrowLeft, Send, Sparkles, Globe, Lock, User, FileText, CheckCircle2, ChevronDown } from 'lucide-react';
import { Seo } from './Seo';
import { RichEditor } from './RichEditor';
import { TemplateUploadZone } from './TemplateUploadZone';
import { AiPromptModal } from './AiPromptModal';
import { ParsedArticleFile } from '../utils/fileParser';

export const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

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
  const [aiModel, setAiModel] = useState('ChatGPT (GPT-4o)');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
      if (confirm(language === 'en' ? 'Please sign in with Google to publish an article.' : 'Silakan masuk dengan Google untuk mempublikasikan artikel.')) {
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
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const generatedSlug = (slugInput.trim() || titleEn.trim() || titleId.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const isSubmittingAdmin = user.email === adminEmail;
      const authorName = user.displayName || user.email?.split('@')[0] || 'Contributor';

      const created = await createArticleInFirestore(
        {
          slug: generatedSlug,
          titleId: titleId.trim(),
          titleEn: titleEn.trim() || titleId.trim(),
          summaryId: summaryId.trim(),
          summaryEn: summaryEn.trim() || summaryId.trim(),
          contentId: contentId.trim(),
          contentEn: contentEn.trim() || contentId.trim(),
          category,
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
          ? (language === 'en' ? 'Article published successfully!' : 'Artikel berhasil dipublikasikan!')
          : (language === 'en' ? 'Article submitted! Awaiting approval.' : 'Artikel berhasil diajukan! Menunggu persetujuan admin.')
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
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
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
          className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/20"
        >
          <User className="w-4 h-4" />
          <span>{language === 'en' ? 'Sign In with Google' : 'Masuk dengan Google'}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
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
          onClick={() => setIsAiModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-zinc-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-stone-500 dark:text-zinc-400" />
          <span>{language === 'en' ? 'Firebase AI Logic' : 'Firebase AI Logic'}</span>
        </button>
      </div>

      <div className="mt-6">
        <div className="border-b border-stone-200 dark:border-zinc-800 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 flex items-center gap-3">
            <FileText className="w-6 h-6 text-stone-700 dark:text-zinc-300 shrink-0" />
            <span>{language === 'en' ? 'Create New Article' : 'Buat Artikel Baru'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
            {language === 'en'
              ? 'Share your research, code walkthroughs, or architectural insights.'
              : 'Bagikan riset, panduan kode, atau wawasan arsitektur Anda.'}
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* File Template Upload Dropzone */}
        <div className="mb-8">
          <TemplateUploadZone
            mode="article"
            onArticleLoaded={handleTemplateLoaded}
            onOpenAiHelper={() => setIsAiModalOpen(true)}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Automatic Author Badge */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold flex items-center justify-center text-sm">
                {(user.displayName || user.email || 'A')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                  {language === 'en' ? 'Author (Auto-Assigned)' : 'Penulis (Otomatis)'}
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

          {/* Visibility Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-2">
              {language === 'en' ? 'Visibility Setting' : 'Pengaturan Visibilitas'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === 'public'
                    ? 'border-stone-900 dark:border-zinc-100 bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 ring-1 ring-stone-900 dark:ring-zinc-100'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Globe className="w-5 h-5 shrink-0 mt-0.5 text-stone-700 dark:text-zinc-300" />
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>{language === 'en' ? 'Public Article' : 'Artikel Publik'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200/80 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-medium">
                      Public
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                    {language === 'en'
                      ? 'Visible to everyone on the web (including guests who are not logged in).'
                      : 'Dapat dilihat oleh semua pengunjung (termasuk yang belum login).'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === 'private'
                    ? 'border-stone-900 dark:border-zinc-100 bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 ring-1 ring-stone-900 dark:ring-zinc-100'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Lock className="w-5 h-5 shrink-0 mt-0.5 text-stone-700 dark:text-zinc-300" />
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>{language === 'en' ? 'Private Article' : 'Artikel Privat'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200/80 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-medium">
                      Private
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                    {language === 'en'
                      ? 'Only visible to you (and Administrator). Hidden from public feeds.'
                      : 'Hanya dapat dilihat oleh Anda (dan Administrator).'}
                  </p>
                </div>
              </button>
            </div>
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
                onChange={e => setTitleId(e.target.value)}
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
                onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. Understanding Vector Search Algorithms"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
              />
            </div>
          </div>

          {/* Category & Custom Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Category' : 'Kategori'}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30 cursor-pointer"
                >
                  <option value="Learning (AI)">Learning (AI)</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="System Architecture">System Architecture</option>
                  <option value="Database Systems">Database Systems</option>
                  <option value="Security & Auth">Security & Auth</option>
                  <option value="General">General</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Custom Slug (URL)' : 'Slug URL Kustom (Opsional)'}
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
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
              onChange={e => setTags(e.target.value)}
              placeholder="AI, Vector, Algorithm, Firestore"
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
              onChange={e => setSummaryId(e.target.value)}
              rows={2}
              placeholder="Penjelasan singkat mengenai artikel..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400/30"
            />
          </div>

          {/* Article Content with RichEditor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Article Content (Markdown & Latex supported)' : 'Isi Artikel (Mendukung Markdown & LaTeX)'} *
            </label>
            <RichEditor
              value={contentId}
              onChange={setContentId}
              placeholder="Tulis artikel lengkap di sini... Anda bisa menggunakan format Markdown seperti # Judul, **teks tebal**, $$rumus matematika$$, atau [[slug-vanpedia]]..."
              minHeight="350px"
            />
          </div>

          {/* AI Assistance Toggle */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aiAssistedCheck"
                checked={isAiAssisted}
                onChange={e => setIsAiAssisted(e.target.checked)}
                className="w-4 h-4 text-stone-900 dark:text-zinc-100 rounded border-stone-300 dark:border-zinc-700 focus:ring-stone-400"
              />
              <label htmlFor="aiAssistedCheck" className="text-sm font-semibold text-stone-900 dark:text-zinc-100 cursor-pointer flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-stone-500 dark:text-zinc-400" />
                <span>{language === 'en' ? 'Written / Researched with AI Assistance' : 'Ditulis / Diriset dengan Bantuan AI'}</span>
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
                  onChange={e => setAiModel(e.target.value)}
                  placeholder="misal: Gemini 2.5 Flash, Claude 3.7 Sonnet, ChatGPT (GPT-4o)"
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
                  ? (language === 'en' ? 'Publishing...' : 'Menerbitkan...')
                  : (language === 'en' ? 'Publish Article' : 'Terbitkan Artikel')}
              </span>
            </button>
          </div>
        </form>
      </div>

      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        mode="article"
        defaultCategory={category}
        onApplyArticle={(art) => {
          setTitleId(art.titleId);
          setTitleEn(art.titleEn || art.titleId);
          setCategory(art.category);
          setSummaryId(art.summaryId);
          setSummaryEn(art.summaryEn || art.summaryId);
          setContentId(art.content);
          setContentEn(art.content);
          if (art.tags && art.tags.length > 0) {
            setTags(art.tags.join(', '));
          }
          setIsAiAssisted(true);
          setAiModel(art.aiModel);
          setFeedback(
            language === 'en'
              ? 'Draft generated with Firebase AI Logic! You can review, edit, and publish.'
              : 'Draf berhasil digenerate dengan Firebase AI Logic! Anda dapat meninjau, mengedit, dan mempublikasikan.'
          );
        }}
      />
    </section>
  );
};
