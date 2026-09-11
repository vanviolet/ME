import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { articlesData } from '../data/articlesData';
import { ArrowUpRight, Calendar, Clock, BookOpen, Search, Filter, Tag, X, Compass, MessageSquare, Sparkles } from 'lucide-react';
import { Seo } from './Seo';

/**
 * Articles listing page — shows all articles in a responsive grid with
 * live search (by title/summary/tags) and filterable by category & tags.
 */
export const ArticlesPage: React.FC = () => {
  const { language, t } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('');

  // Derive all unique categories and tags across articles
  const categories = useMemo(
    () => Array.from(new Set(articlesData.map(a => a.category))).sort(),
    [],
  );
  const allTags = useMemo(
    () => Array.from(new Set(articlesData.flatMap(a => a.tags))).sort(),
    [],
  );

  // Filter articles by search query, category, and tag
  const filteredArticles = useMemo(() => {
    return articlesData.filter(article => {
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
  }, [searchQuery, activeCategory, activeTag, t]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('');
    setActiveTag('');
  };

  const hasActiveFilters = searchQuery !== '' || activeCategory !== '' || activeTag !== '';

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
        <div className="mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
            {language === 'en' ? 'Articles & Writing' : 'Artikel & Catatan Teknis'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Engineering Updates.' : 'Catatan Rekayasa.'}
          </h1>
          <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md mt-4">
            {language === 'en'
              ? 'Reflections on system design, Web Audio math, biometric security, and scaling university infrastructure.'
              : 'Tulisan teknis mengenai arsitektur sistem, Web Audio API, keamanan biometrik, dan skalabilitas kampus.'}
          </p>

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
              className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300"
                aria-label={language === 'en' ? 'Clear search' : 'Hapus pencarian'}
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

          {/* Tag Filter (only when a category is active) */}
          {activeCategory && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-mono text-stone-400 dark:text-zinc-500">
                {language === 'en' ? 'Tag:' : 'Tag:'}
              </span>
              <button
                onClick={() => setActiveTag('')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                  activeTag === ''
                    ? 'bg-rose-600 text-white'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                {language === 'en' ? 'All tags' : 'Semua tag'}
              </button>
              {Array.from(
                new Set(
                  articlesData
                    .filter(a => a.category === activeCategory)
                    .flatMap(a => a.tags),
                ),
              ).map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded flex items-center gap-1 ${
                    activeTag === tag
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

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
        <p className="text-xs font-mono text-stone-500 dark:text-zinc-400 mb-6">
          {language === 'en'
            ? `${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''} found`
            : `${filteredArticles.length} artikel${filteredArticles.length !== 1 ? ' ditemukan' : ''} ditemukan`}
        </p>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map(post => (
            <Link
              key={post.id}
              to={`/articles/${post.slug}`}
              className="group border border-stone-200 dark:border-zinc-800 rounded-2xl bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-xs flex flex-col justify-between gap-6 p-6 sm:p-8"
            >
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
                    <span className="text-stone-300 dark:text-zinc-700">•</span>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <MessageSquare size={13} className="text-stone-400 dark:text-zinc-500" />
                      <span>{post.commentsCount || 0}</span>
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug flex items-start justify-between gap-3 pt-1">
                  <span>{t(post.title)}</span>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-stone-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform mt-0.5"
                  />
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                  {t(post.summary)}
                </p>
              </div>

              <div className="pt-5 border-t border-stone-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {post.tags.slice(0, 3).map(tg => (
                    <span
                      key={tg}
                      className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800/90 text-stone-600 dark:text-zinc-400 border border-stone-200/60 dark:border-zinc-700/60"
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
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-600 dark:text-zinc-400 mb-4">
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
      </section>
    </>
  );
};
