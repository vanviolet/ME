import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { articlesData } from '../data/articlesData';
import { fetchArticlesFromFirestore, createArticleInFirestore, updateArticleStatusInFirestore } from '../services/firestoreService';
import { Article } from '../types';
import {
  ArrowUpRight,
  Calendar,
  Clock,
  BookOpen,
  Search,
  Filter,
  Tag,
  X,
  Compass,
  MessageSquare,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  UserCheck,
  Send,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Seo } from './Seo';
import { RichEditor } from './RichEditor';
import { TemplateUploadZone } from './TemplateUploadZone';
import { AiPromptModal } from './AiPromptModal';
import { ParsedArticleFile } from '../utils/fileParser';

/**
 * Articles listing page — shows all articles in a responsive grid with
 * live search, category & tag filters, user submission with automated email
 * notification to vanviolet.js@gmail.com, and admin moderation workflow.
 */
export const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

  const [articles, setArticles] = useState<Article[]>(articlesData);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('');

  // Submit Article Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [newTitleId, setNewTitleId] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newCategory, setNewCategory] = useState('Learning (AI)');
  const [newTags, setNewTags] = useState('');
  const [newSummaryId, setNewSummaryId] = useState('');
  const [newSummaryEn, setNewSummaryEn] = useState('');
  const [newContentId, setNewContentId] = useState('');
  const [newContentEn, setNewContentEn] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const handleArticleTemplateLoaded = (parsed: ParsedArticleFile) => {
    if (parsed.title) setNewTitleId(parsed.title);
    if (parsed.category) setNewCategory(parsed.category);
    if (parsed.summary) setNewSummaryId(parsed.summary);
    if (parsed.content) setNewContentId(parsed.content);
    if (parsed.tags && parsed.tags.length > 0) setNewTags(parsed.tags.join(', '));
  };

  // Load from Firestore
  const loadArticles = async () => {
    try {
      const data = await fetchArticlesFromFirestore(isAdmin, user?.uid);
      setArticles(data);
    } catch (e) {
      console.error('Error fetching firestore articles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [isAdmin, user?.uid]);

  // Derive categories and tags
  const categories = useMemo(
    () => Array.from(new Set(articles.map(a => a.category))).sort(),
    [articles],
  );

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        t(article.title).toLowerCase().includes(searchLower) ||
        t(article.summary).toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower));

      const matchesCategory = activeCategory === '' || article.category === activeCategory;
      const matchesTag = activeTag === '' || article.tags.includes(activeTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [articles, searchQuery, activeCategory, activeTag, t]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('');
    setActiveTag('');
  };

  const hasActiveFilters = searchQuery !== '' || activeCategory !== '' || activeTag !== '';

  const handleOpenSubmit = () => {
    if (!user) {
      if (confirm(language === 'en' ? 'Please sign in with Google to submit an article.' : 'Silakan masuk dengan Google terlebih dahulu untuk mengajukan artikel.')) {
        signInWithGoogle();
      }
      return;
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleId.trim()) {
      alert(language === 'en' ? 'Please fill in the title.' : 'Mohon isi judul artikel.');
      return;
    }

    setSubmitting(true);
    try {
      const slugCandidate = newTitleEn.trim()
        ? newTitleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : newTitleId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const parsedTags = newTags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const wordsCount = (newContentId + ' ' + (newContentEn || '')).split(/\s+/).length;
      const readMinutes = Math.max(1, Math.round(wordsCount / 180));

      const isSubmittingAdmin = user?.email === adminEmail;

      const created = await createArticleInFirestore(
        {
          slug: slugCandidate || `article-${Date.now()}`,
          title: {
            id: newTitleId.trim(),
            en: newTitleEn.trim() || newTitleId.trim(),
          },
          summary: {
            id: newSummaryId.trim() || newTitleId.trim(),
            en: newSummaryEn.trim() || newSummaryId.trim() || newTitleId.trim(),
          },
          category: newCategory,
          tags: parsedTags.length > 0 ? parsedTags : ['general'],
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          readTime: `${readMinutes} min read`,
          author: {
            name: user?.displayName || 'Contributor',
            role: isSubmittingAdmin ? 'Lead Architect' : 'Community Author',
            avatar: user?.photoURL || undefined,
          },
          content: {
            id: newContentId.trim() || newSummaryId.trim(),
            en: newContentEn.trim() || newContentId.trim() || newSummaryId.trim(),
          },
          featured: false,
          likes: 0,
        },
        user?.email || undefined,
        user?.uid || undefined,
        isSubmittingAdmin
      );

      setIsSubmitModalOpen(false);
      setNewTitleId('');
      setNewTitleEn('');
      setNewTags('');
      setNewSummaryId('');
      setNewSummaryEn('');
      setNewContentId('');
      setNewContentEn('');

      if (isSubmittingAdmin) {
        setFeedbackBanner(
          language === 'en'
            ? 'Article published directly as Administrator!'
            : 'Artikel berhasil langsung dipublikasikan sebagai Administrator!'
        );
      } else {
        setFeedbackBanner(
          language === 'en'
            ? `Your article has been submitted! It is awaiting verification by ${adminEmail}. A notification email has been dispatched.`
            : `Artikel Anda berhasil dikirim! Menunggu verifikasi oleh ${adminEmail}. Email notifikasi telah dikirimkan ke admin.`
        );
      }

      await loadArticles();
    } catch (err: any) {
      alert('Error submitting article: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickApprove = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateArticleStatusInFirestore(articleId, 'approved', adminEmail);
      setFeedbackBanner(language === 'en' ? 'Article approved and published!' : 'Artikel disetujui dan ditayangkan!');
      await loadArticles();
    } catch (err: any) {
      alert('Error approving article: ' + err.message);
    }
  };

  return (
    <>
      <Seo
        title={language === 'id' ? 'Artikel | Muchamad Irvan' : 'Articles | Muchamad Irvan'}
        description={
          language === 'id'
            ? 'Kumpulan artikel teknis tentang arsitektur sistem, AI, keamanan biometrik, Web Audio API, dan teori musik.'
            : 'Technical articles on system architecture, AI, biometric security, Web Audio API, and music theory.'
        }
        keywords="articles, blog, technical writing, software engineering, architecture, ai, music theory"
        url="https://vanviolet.my.id/articles"
        type="website"
      />
      <section className="py-24 px-6 sm:px-8 max-w-6xl mx-auto min-h-screen">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
                {language === 'en' ? 'Articles & Writing' : 'Artikel & Catatan Teknis'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
                {language === 'en' ? 'Engineering Updates.' : 'Catatan Rekayasa.'}
              </h1>
              <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md mt-2">
                {language === 'en'
                  ? 'Reflections on system design, Web Audio math, biometric security, AI, and scaling infrastructure.'
                  : 'Tulisan teknis mengenai arsitektur sistem, Web Audio API, AI, keamanan biometrik, dan skalabilitas kampus.'}
              </p>
            </div>

            {/* Action buttons: Submit Article & Admin Link */}
            <div className="flex items-center gap-2.5 shrink-0">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <ShieldCheck size={15} />
                  <span>Admin Hub</span>
                </Link>
              )}

              <button
                onClick={handleOpenSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-xs font-mono font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-xs"
              >
                <Plus size={15} />
                <span>{language === 'en' ? 'Submit Article' : 'Tulis Artikel'}</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackBanner && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>{feedbackBanner}</span>
              <button onClick={() => setFeedbackBanner(null)} className="hover:opacity-75 font-bold">✕</button>
            </div>
          )}

          {/* Vanpedia Cross-Link Banner */}
          <div className="mt-6 p-4 rounded-2xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Compass size={18} className="text-rose-500 shrink-0" />
              <p className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300">
                {language === 'en'
                  ? 'Encounter unfamiliar technical terms like Tritone, Backpropagation, or Sub-40ms Concurrency? Explore our glossary.'
                  : 'Menemukan istilah seperti Tritone, Backpropagation, atau Konkurensi Sub-40ms? Temukan definisinya di kamus.'}
              </p>
            </div>
            <Link
              to="/vanpedia"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono font-semibold hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-xs"
            >
              <span>{language === 'en' ? 'Explore Vanpedia' : 'Buka Vanpedia'}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search articles...' : 'Cari artikel...'}
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500 dark:text-zinc-400">
              <Filter size={13} />
              <span>{language === 'en' ? 'Filter by:' : 'Filter:'}</span>
            </div>

            {/* Category pills */}
            <button
              onClick={() => setActiveCategory('')}
              className={`px-2.5 py-1 text-xs font-mono rounded-full transition-all ${
                activeCategory === ''
                  ? 'bg-rose-600 text-white'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'en' ? 'All Categories' : 'Semua Kategori'}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs font-mono rounded-full transition-all ${
                  activeCategory === cat
                    ? 'bg-rose-600 text-white'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline"
            >
              {language === 'en' ? 'Clear all filters' : 'Hapus semua filter'}
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-mono text-stone-500 dark:text-zinc-400">
            {language === 'en'
              ? `${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''} available`
              : `${filteredArticles.length} artikel tersedia`}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map(post => {
            const isPending = post.status === 'pending';
            return (
              <div
                key={post.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/articles/${post.slug}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/articles/${post.slug}`);
                  }
                }}
                className={`group border rounded-2xl transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between gap-6 p-6 sm:p-8 relative cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${
                  isPending
                    ? 'border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400'
                    : 'border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-400/70 dark:hover:border-rose-500/60'
                }`}
              >
                {/* Pending Verification Banner */}
                {isPending && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 rounded-xl bg-amber-100/90 dark:bg-amber-900/40 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-200">
                      <Clock3 size={14} className="shrink-0 animate-pulse text-amber-600" />
                      <span>{language === 'en' ? `Pending verification by ${adminEmail}` : `Menunggu verifikasi oleh ${adminEmail}`}</span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickApprove(post.id, e);
                        }}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shrink-0"
                      >
                        <CheckCircle2 size={11} />
                        <span>Setujui</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider border border-rose-500/20 shrink-0">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2.5 text-xs text-stone-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={13} className="text-stone-400 dark:text-zinc-500" />
                        <span>{post.date}</span>
                      </span>
                      <span className="text-stone-300 dark:text-zinc-700">•</span>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Clock size={13} className="text-stone-400 dark:text-zinc-500" />
                        <span>{post.readTime}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-reading-sans text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug flex items-start justify-between gap-3 pt-1">
                      <span>{t(post.title)}</span>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-stone-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform mt-0.5"
                      />
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 line-clamp-3 leading-relaxed font-reading-sans">
                    {t(post.summary)}
                  </p>
                </div>

                <div className="pt-5 border-t border-stone-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {post.tags.slice(0, 3).map(tg => (
                      <span
                        key={tg}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCategory('');
                          setSearchQuery(tg);
                        }}
                        className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800/90 text-stone-600 dark:text-zinc-400 border border-stone-200/60 dark:border-zinc-700/60 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-400/50 transition-colors"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs sm:text-sm whitespace-nowrap group-hover:translate-x-0.5 transition-transform">
                    <BookOpen size={14} className="shrink-0" />
                    <span>{language === 'en' ? 'Read Article' : 'Baca Artikel'}</span>
                    <ArrowUpRight size={14} className="shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-600 dark:text-zinc-400 mb-4 font-mono text-sm">
              {language === 'en'
                ? 'No articles match your search. Try adjusting the filters.'
                : 'Tidak ada artikel yang cocok. Coba sesuaikan filter.'}
            </p>
            <button
              onClick={clearFilters}
              className="text-sm font-mono text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline"
            >
              {language === 'en' ? 'Clear filters' : 'Hapus filter'}
            </button>
          </div>
        )}

        {/* Submission Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold font-mono text-stone-900 dark:text-zinc-100">
                    {language === 'en' ? 'Submit New Article' : 'Tulis & Ajukan Artikel Baru'}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 font-mono mt-0.5">
                    {user?.email === adminEmail
                      ? (language === 'en' ? 'Publishing with Admin authority (instant live).' : 'Dipublikasikan langsung dengan otoritas Admin.')
                      : (language === 'en' ? `Will be reviewed by ${adminEmail}. Email notification will be triggered.` : `Akan ditinjau oleh ${adminEmail}. Email notifikasi otomatis dikirimkan.`)}
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                >
                  <X size={18} />
                </button>
              </div>

              <TemplateUploadZone
                mode="article"
                onArticleLoaded={handleArticleTemplateLoaded}
                onOpenAiHelper={() => setIsAiModalOpen(true)}
              />

              <form onSubmit={handleSubmitArticle} className="space-y-4 text-xs font-mono">
                {/* Indonesian Title */}
                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Title (Indonesian / Primary) *' : 'Judul Artikel (Bahasa Indonesia) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitleId}
                    onChange={e => setNewTitleId(e.target.value)}
                    placeholder="Contoh: Belajar Backpropagation dalam Jaringan Saraf Tiruan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                {/* English Title */}
                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Title (English) [Optional]' : 'Judul Artikel (Bahasa Inggris) [Opsional]'}
                  </label>
                  <input
                    type="text"
                    value={newTitleEn}
                    onChange={e => setNewTitleEn(e.target.value)}
                    placeholder="Example: Learning Backpropagation in Artificial Neural Networks"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                {/* Category & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                      {language === 'en' ? 'Category' : 'Kategori'}
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                    >
                      <option value="Learning (AI)">Learning (AI)</option>
                      <option value="Fakta Unik">Fakta Unik</option>
                      <option value="Hobby (Music)">Hobby (Music)</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Security">Security</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                      {language === 'en' ? 'Tags (comma separated)' : 'Tag (pisahkan dengan koma)'}
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={e => setNewTags(e.target.value)}
                      placeholder="neural-network, backprop, ai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Summary / Excerpt *' : 'Ringkasan / Sinopsis *'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newSummaryId}
                    onChange={e => setNewSummaryId(e.target.value)}
                    placeholder="Ringkasan singkat tentang apa yang dibahas dalam artikel..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                  />
                </div>

                {/* Content (Rich Markdown Editor) */}
                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Full Content (Markdown format) *' : 'Isi Lengkap Artikel (Format Markdown) *'}
                  </label>
                  <p className="text-[10px] text-stone-400 dark:text-zinc-500 mb-2">
                    {language === 'en'
                      ? 'Rich Editor supports Headings, Code Blocks, Tables, Math, and [[slug]] for Vanpedia backlinks.'
                      : 'Editor kaya mendukung Heading, Blok Kode, Tabel, Formula, serta [[slug]] untuk menghubungkan istilah ke Vanpedia.'}
                  </p>
                  <RichEditor
                    value={newContentId}
                    onChange={setNewContentId}
                    placeholder="Tulis artikel dengan heading (##), penjelasan, contoh kode, atau tautan istilah [[tritone]]..."
                    height="380px"
                  />
                </div>

                <div className="p-3 rounded-xl bg-stone-100 dark:bg-zinc-800/60 text-[11px] text-stone-600 dark:text-zinc-400">
                  {language === 'en'
                    ? `Author: ${user?.displayName} (${user?.email}). Verified articles are indexed for optimal SEO.`
                    : `Penulis: ${user?.displayName} (${user?.email}). Notifikasi email pengajuan akan dikirim langsung ke ${adminEmail}.`}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'Batal'}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{submitting ? (language === 'en' ? 'Submitting...' : 'Mengirim...') : (language === 'en' ? 'Submit Article' : 'Kirim Artikel')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI ChatGPT Outline Prompt Modal */}
        <AiPromptModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          mode="article"
          defaultCategory={newCategory}
        />
      </section>
    </>
  );
};
