import React, { useEffect, useState, useMemo } from 'react';
import { marked } from 'marked';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { vanpediaTermsData, articlesData } from '../data/articlesData';
import {
  ArrowLeft,
  Tag,
  BookOpen,
  Link2,
  Search,
  Compass,
  Sparkles,
  Layers,
  Share2,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Seo } from './Seo';

/**
 * Vanpedia term page — each term (e.g. /vanpedia/tritone) gets its own SEO-optimized page.
 */
export const VanpediaPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = usePortfolio();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const term = vanpediaTermsData.find(v => v.slug === slug);

  if (!term) {
    return (
      <section className="py-24 px-6 sm:px-8 max-w-4xl mx-auto min-h-screen">
        <Seo
          title={language === 'en' ? 'Term Not Found | Vanpedia' : 'Istilah Tidak Ditemukan | Vanpedia'}
          description={language === 'en' ? 'The requested vanpedia term could not be found.' : 'Istilah vanpedia yang diminta tidak ditemukan.'}
          type="website"
        />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mb-4">
            {language === 'en' ? 'Term Not Found' : 'Istilah Tidak Ditemukan'}
          </h2>
          <p className="text-stone-600 dark:text-zinc-400 mb-6">
            {language === 'en'
              ? `No vanpedia entry found for "${slug}".`
              : `Tidak ditemukan entri vanpedia untuk "${slug}".`}
          </p>
          <Link
            to="/vanpedia"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {language === 'en' ? 'Back to Vanpedia' : 'Kembali ke Vanpedia'}
          </Link>
        </div>
      </section>
    );
  }

  // Resolve related terms and articles
  const relatedTerms = (term.relatedTerms || [])
    .map(s => vanpediaTermsData.find(v => v.slug === s))
    .filter(Boolean) as NonNullable<typeof term>[];

  const relatedArticles = (term.articleIds || [])
    .map(id => articlesData.find(a => a.id === id))
    .filter(Boolean) as NonNullable<typeof articlesData>[0][];

  const termUrl = `https://vanviolet.my.id/vanpedia/${term.slug}`;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Seo
        title={`${t(term.title)} - Definisi & Penjelasan | Vanpedia | Muchamad Irvan`}
        description={t(term.definition)}
        url={termUrl}
        type="article"
        keywords={`${t(term.title)}, ${term.category}, vanpedia, glossary, kamus teknis`}
      />

      <article className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-zinc-400 mb-8">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-100">
            {language === 'en' ? 'Home' : 'Beranda'}
          </Link>
          <ChevronRight size={12} />
          <Link to="/vanpedia" className="hover:text-stone-900 dark:hover:text-zinc-100">
            Vanpedia
          </Link>
          <ChevronRight size={12} />
          <span className="text-rose-600 dark:text-rose-400 font-semibold truncate max-w-[200px]">
            {t(term.title)}
          </span>
        </nav>

        {/* Term Header Banner */}
        <header className="mb-10 border-b border-stone-200 dark:border-zinc-800 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider border border-rose-500/20">
                {term.category}
              </span>
              <span className="text-stone-400 dark:text-zinc-600">•</span>
              <span className="text-xs font-mono text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                <Compass size={13} />
                <span>Vanpedia Knowledge Entry</span>
              </span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 text-xs font-mono text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span>{copied ? (language === 'en' ? 'Copied Link' : 'Tersalin') : (language === 'en' ? 'Share' : 'Bagikan')}</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mb-4">
            {t(term.title)}
          </h1>

          {/* Core Definition Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500/20 text-stone-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed font-medium">
            {t(term.definition)}
          </div>

          {/* Mathematical / Technical Formula (if present) */}
          {term.formula && (
            <div className="mt-4 p-4 rounded-xl bg-stone-100/80 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 font-mono text-xs sm:text-sm text-stone-800 dark:text-zinc-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-zinc-500 block mb-0.5">
                  {language === 'en' ? 'Mathematical Formulation / Concept' : 'Formula Matematis / Konsep'}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">{term.formula}</span>
              </div>
              <Sparkles size={16} className="text-rose-500 shrink-0 opacity-70" />
            </div>
          )}
        </header>

        {/* Detailed Explanation / Markdown Content */}
        {term.content && (
          <div
            className="max-w-none text-sm sm:text-base leading-relaxed space-y-4 text-stone-700 dark:text-zinc-300 mb-12"
            data-article-content
            dangerouslySetInnerHTML={{
              __html: marked.parse(t(term.content) || '', { gfm: true, breaks: true, async: false }),
            }}
          />
        )}

        {/* Examples Section */}
        {term.examples && (
          <div className="mb-12 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-rose-500" />
              <span>{language === 'en' ? 'Real-World Examples & Applications' : 'Contoh Nyata & Penerapan'}</span>
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-zinc-300">
              {term.examples[language]?.map((ex, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">→</span>
                  <span className="leading-relaxed">{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <div className="mb-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Link2 size={18} className="text-rose-500" />
              <span>{language === 'en' ? 'Related Terms in Vanpedia' : 'Istilah Terkait di Vanpedia'}</span>
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {relatedTerms.map(rt => (
                <Link
                  key={rt.slug}
                  to={`/vanpedia/${rt.slug}`}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all group"
                >
                  <span className="font-medium text-xs sm:text-sm text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    {t(rt.title)}
                  </span>
                  <span className="ml-2 text-[10px] font-mono uppercase text-stone-400">
                    {rt.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-rose-500" />
              <span>{language === 'en' ? 'Articles Referencing This Term' : 'Artikel yang Mengulas Istilah Ini'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map(a => (
                <Link
                  key={a.slug}
                  to={`/articles/${a.slug}`}
                  className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/30 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs font-mono">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">{a.category}</span>
                      <span className="text-stone-400">{a.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {t(a.title)}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-2">
                      {t(a.summary)}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800/80 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <span>{language === 'en' ? 'Read Full Article' : 'Baca Artikel Lengkap'}</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
          <Link
            to="/vanpedia"
            className="inline-flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline"
          >
            <ArrowLeft size={14} />
            <span>{language === 'en' ? 'Back to All Vanpedia Terms' : 'Kembali ke Semua Istilah Vanpedia'}</span>
          </Link>
        </div>
      </article>
    </>
  );
};

/**
 * Vanpedia index page — lists all terms with interactive category menu and search.
 */
export const VanpediaIndexPage: React.FC = () => {
  const { language, t } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(vanpediaTermsData.map(v => v.category))).sort();
  }, []);

  const filteredTerms = useMemo(() => {
    return vanpediaTermsData.filter(term => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        t(term.title).toLowerCase().includes(q) ||
        t(term.definition).toLowerCase().includes(q) ||
        term.category.toLowerCase().includes(q) ||
        term.slug.toLowerCase().includes(q);

      const matchesCategory = activeCategory === 'all' || term.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, t]);

  return (
    <>
      <Seo
        title={language === 'en' ? 'Vanpedia - Technical Glossary & Knowledge | Muchamad Irvan' : 'Vanpedia - Kamus Istilah Teknis & Pengetahuan | Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Vanpedia — curated technical glossary defining concepts across music theory, AI calculus, computer systems, databases, and biometric security.'
            : 'Vanpedia — kamus istilah teknis terkurasi: teori musik, matematika AI, sistem komputer, database, dan keamanan biometrik.'
        }
        url="https://vanviolet.my.id/vanpedia"
        type="website"
        keywords="vanpedia, glossary, dictionary, technical terms, music theory, artificial intelligence, computer science"
      />

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
              {language === 'en' ? 'Vanpedia — Technical Glossary' : 'Vanpedia — Kamus Istilah Teknis'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono border border-rose-500/20 font-bold">
              {vanpediaTermsData.length} Istilah
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Concepts and Terms, Defined.' : 'Konsep dan Istilah, Terdefinisi.'}
          </h1>
          <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-2xl mt-3">
            {language === 'en'
              ? 'Click any highlighted term in an article to jump here. Each entry features exact mathematical models, practical examples, and cross-references.'
              : 'Setiap kata teknis dalam artikel dapat diklik untuk membuka penjelasan di sini. Dilengkapi model matematika, contoh nyata, dan keterkaitan sistem.'}
          </p>
        </header>

        {/* Search & Category Filter Menu */}
        <div className="mb-8 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Search terms (e.g. tritone, backpropagation, floating-point)...'
                  : 'Cari istilah (misal: tritone, backpropagation, floating-point)...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-colors"
            />
          </div>

          {/* Category Menu Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500 dark:text-zinc-400 mr-1">
              <Filter size={13} />
              <span>{language === 'en' ? 'Categories:' : 'Kategori:'}</span>
            </div>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-all ${
                activeCategory === 'all'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'en' ? 'All Terms' : 'Semua Istilah'} ({vanpediaTermsData.length})
            </button>
            {categories.map(cat => {
              const count = vanpediaTermsData.filter(v => v.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-all ${
                    activeCategory === cat
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.map(term => (
            <Link
              key={term.slug}
              to={`/vanpedia/${term.slug}`}
              className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/40 dark:hover:border-rose-500/50 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 font-semibold">
                    {term.category}
                  </span>
                  {term.articleIds && term.articleIds.length > 0 && (
                    <span className="text-[10px] font-mono text-stone-400 dark:text-zinc-500 flex items-center gap-1">
                      <BookOpen size={10} />
                      <span>{term.articleIds.length} ref</span>
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-base text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {t(term.title)}
                </h3>

                <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                  {t(term.definition)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-zinc-400">
                <span className="text-stone-400">/{term.slug}</span>
                <span className="group-hover:translate-x-1 transition-transform text-rose-600 dark:text-rose-400 font-semibold">
                  Lihat →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="py-16 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl">
            <p className="text-stone-600 dark:text-zinc-400 text-sm mb-3">
              {language === 'en'
                ? 'No terms match your search.'
                : 'Tidak ada istilah yang cocok dengan pencarian Anda.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-xs font-mono text-rose-600 dark:text-rose-400 underline"
            >
              {language === 'en' ? 'Reset Filters' : 'Reset Filter'}
            </button>
          </div>
        )}
      </section>
    </>
  );
};
