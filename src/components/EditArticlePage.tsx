import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { fetchArticleBySlugFromFirestore, updateArticleInFirestore } from '../services/firestoreService';
import { Article } from '../types';
import { ArrowLeft, Save, Sparkles, Globe, Lock, User, Edit3, CheckCircle2 } from 'lucide-react';
import { Seo } from './Seo';
import { RichEditor } from './RichEditor';
import { ShadcnCombobox } from './ui/combobox';

export const EditArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language, t } = usePortfolio();
  const { user, isAdmin, signInWithGoogle } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const [titleId, setTitleId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState('Learning (AI)');
  const [tags, setTags] = useState('AI, Software Engineering');
  const [summaryId, setSummaryId] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentId, setContentId] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const [isAiAssisted, setIsAiAssisted] = useState(false);
  const [aiModel, setAiModel] = useState('ChatGPT (GPT-4o)');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;
      try {
        const data = await fetchArticleBySlugFromFirestore(slug, isAdmin, user?.uid);
        if (data) {
          setArticle(data);
          setTitleId(typeof data.title === 'object' ? data.title.id || data.title.en : data.title || '');
          setTitleEn(typeof data.title === 'object' ? data.title.en || data.title.id : data.title || '');
          setCategory(data.category || 'Software Engineering');
          setTags(Array.isArray(data.tags) ? data.tags.join(', ') : 'Engineering');
          setSummaryId(typeof data.summary === 'object' ? data.summary.id || data.summary.en : data.summary || '');
          setSummaryEn(typeof data.summary === 'object' ? data.summary.en || data.summary.id : data.summary || '');
          setContentId(typeof data.content === 'object' ? data.content.id || data.content.en : data.content || '');
          setContentEn(typeof data.content === 'object' ? data.content.en || data.content.id : data.content || '');
          setVisibility(data.visibility || 'public');
          setIsAiAssisted(Boolean(data.isAiAssisted));
          setAiModel(data.aiModel || 'ChatGPT (GPT-4o)');
        }
      } catch (err) {
        console.error('Failed to load article for edit:', err);
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [slug, isAdmin, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    if (!user) {
      if (confirm(language === 'en' ? 'Please sign in.' : 'Silakan masuk.')) {
        signInWithGoogle();
      }
      return;
    }

    const isOwner = user.uid === article.authorId;
    if (!isOwner && !isAdmin) {
      alert(language === 'en' ? 'You do not have permission to edit this article.' : 'Anda tidak memiliki izin untuk mengedit artikel ini.');
      return;
    }

    if (!titleId.trim()) {
      alert(language === 'en' ? 'Please enter a title.' : 'Mohon masukkan judul artikel.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await updateArticleInFirestore(article.id, {
        title: {
          id: titleId.trim(),
          en: titleEn.trim() || titleId.trim(),
        },
        summary: {
          id: summaryId.trim(),
          en: summaryEn.trim() || summaryId.trim(),
        },
        content: {
          id: contentId.trim(),
          en: contentEn.trim() || contentId.trim(),
        },
        category,
        tags: parsedTags.length > 0 ? parsedTags : ['Engineering'],
        visibility,
        isAiAssisted,
        aiModel: isAiAssisted ? aiModel : undefined,
      });

      setFeedback(language === 'en' ? 'Article updated successfully!' : 'Artikel berhasil diperbarui!');
      setTimeout(() => {
        navigate(`/articles/${article.slug}`);
      }, 1200);
    } catch (err: any) {
      alert('Error updating article: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 px-6 sm:px-8 max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500 dark:text-zinc-400">
          {language === 'en' ? 'Loading article for edit...' : 'Memuat artikel untuk diedit...'}
        </p>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="py-24 px-6 sm:px-8 max-w-3xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mb-4">
          {language === 'en' ? 'Article Not Found' : 'Artikel Tidak Ditemukan'}
        </h1>
        <Link
          to="/articles"
          className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
        >
          {language === 'en' ? 'Back to Articles' : 'Kembali ke Artikel'}
        </Link>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
      <Seo
        title={language === 'en' ? `Edit: ${t(article.title)}` : `Edit: ${t(article.title)}`}
        description="Edit article details and content."
      />

      {/* Header & Back Link */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to={`/articles/${article.slug}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Article' : 'Kembali ke Artikel'}</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xl overflow-hidden p-6 sm:p-8">
        <div className="border-b border-stone-100 dark:border-zinc-800 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 flex items-center gap-3">
            <Edit3 className="w-7 h-7 text-rose-600 dark:text-rose-500 shrink-0" />
            <span>{language === 'en' ? 'Edit Article' : 'Edit Artikel'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
            Slug: <code className="font-mono text-rose-600 dark:text-rose-400">{article.slug}</code>
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Author Badge */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-sm">
                {(article.author?.name || article.authorEmail || 'A')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 dark:text-zinc-400 uppercase tracking-wider">
                  {language === 'en' ? 'Author' : 'Penulis'}
                </p>
                <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {article.author?.name || article.authorEmail?.split('@')[0] || 'Contributor'}
                </p>
              </div>
            </div>
            {article.updatedAt && (
              <span className="text-xs font-mono text-stone-500 dark:text-zinc-400">
                {language === 'en' ? 'Last updated: ' : 'Terakhir diupdate: '}
                {new Date(article.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Visibility Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-2">
              {language === 'en' ? 'Visibility Setting' : 'Pengaturan Visibilitas'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === 'public'
                    ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 ring-2 ring-rose-600/20'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-700 dark:text-zinc-300'
                }`}
              >
                <Globe className={`w-5 h-5 shrink-0 mt-0.5 ${visibility === 'public' ? 'text-rose-600 dark:text-rose-400' : 'text-stone-400'}`} />
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>{language === 'en' ? 'Public Article' : 'Artikel Publik'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      🌐 Public
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                    {language === 'en'
                      ? 'Visible to everyone on the web (including guests who are not logged in).'
                      : 'Dapat dilihat oleh semua pengguna di internet (termasuk yang tidak login).'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  visibility === 'private'
                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 ring-2 ring-amber-600/20'
                    : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 text-stone-700 dark:text-zinc-300'
                }`}
              >
                <Lock className={`w-5 h-5 shrink-0 mt-0.5 ${visibility === 'private' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>{language === 'en' ? 'Private Article' : 'Artikel Privat'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      🔒 Private
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
                    {language === 'en'
                      ? 'Only visible to you (and Administrator). Hidden from public feeds.'
                      : 'Hanya dapat dilihat oleh Anda (dan Administrator). Tersembunyi dari publik.'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Title Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Title (Indonesian)' : 'Judul Artikel (Bahasa Indonesia)'} *
              </label>
              <input
                type="text"
                value={titleId}
                onChange={e => setTitleId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Title (English)' : 'Judul Artikel (Bahasa Inggris)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Category' : 'Kategori'}
              </label>
              <ShadcnCombobox
                value={category}
                onChange={val => setCategory(val)}
                placeholder="Pilih kategori..."
                searchPlaceholder="Cari kategori..."
                options={[
                  { value: 'Learning (AI)', label: 'Learning (AI)' },
                  { value: 'Software Engineering', label: 'Software Engineering' },
                  { value: 'System Architecture', label: 'System Architecture' },
                  { value: 'Database Systems', label: 'Database Systems' },
                  { value: 'Security & Auth', label: 'Security & Auth' },
                  { value: 'Music Theory', label: 'Music Theory' },
                  { value: 'General', label: 'General' },
                ]}
                size="md"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Tags (comma separated)' : 'Tag (pisahkan dengan koma)'}
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              {language === 'en' ? 'Summary / Excerpt' : 'Ringkasan Artikel'}
            </label>
            <textarea
              value={summaryId}
              onChange={e => setSummaryId(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Article Content with RichEditor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              {language === 'en' ? 'Article Content' : 'Isi Artikel'} *
            </label>
            <RichEditor
              value={contentId}
              onChange={setContentId}
              minHeight="350px"
            />
          </div>

          {/* AI Assistance Toggle */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-700/50 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aiAssistedEditCheck"
                checked={isAiAssisted}
                onChange={e => setIsAiAssisted(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-stone-300 dark:border-zinc-700 focus:ring-rose-500"
              />
              <label htmlFor="aiAssistedEditCheck" className="text-sm font-semibold text-stone-900 dark:text-zinc-100 cursor-pointer flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'en' ? 'Written / Researched with AI Assistance' : 'Ditulis / Diriset dengan Bantuan AI'}</span>
              </label>
            </div>

            {isAiAssisted && (
              <div className="pl-7">
                <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'AI Model Used' : 'Model AI yang Digunakan'}
                </label>
                <input
                  type="text"
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  placeholder="misal: Gemini 3.7 Flash, ChatGPT (GPT-4o), Claude 3.7 Sonnet"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <Link
              to={`/articles/${article.slug}`}
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <Save className="w-4 h-4" />
              <span>
                {submitting
                  ? (language === 'en' ? 'Saving Changes...' : 'Menyimpan Perubahan...')
                  : (language === 'en' ? 'Save Changes' : 'Simpan Perubahan')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
