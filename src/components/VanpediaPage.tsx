import React, { useEffect } from 'react';
import { marked } from 'marked';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { vanpediaTermsData, articlesData } from '../data/articlesData';
import { ArrowLeft, Tag, BookOpen, Link2 } from 'lucide-react';
import { Seo } from './Seo';

/**
 * Vanpedia term page — each term (e.g. /vanpedia/tritone) gets its own page.
 */
export const VanpediaPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = usePortfolio();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <>
      <Seo
        title={`${t(term.title)} | Vanpedia | Muchamad Irvan`}
        description={t(term.definition)}
        url={termUrl}
        type="article"
        keywords={term.category}
      />

      <article className="py-24 px-6 sm:px-8 max-w-4xl mx-auto min-h-screen">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-mono text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{language === 'en' ? 'Back' : 'Kembali'}</span>
        </button>

        {/* Term Header */}
        <header className="mb-10 border-b border-stone-200 dark:border-zinc-800 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider border border-rose-500/20">
              {term.category}
            </span>
            <BookOpen size={14} className="text-stone-400 dark:text-zinc-500" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mb-4">
            {t(term.title)}
          </h1>

          <p className="text-lg text-stone-600 dark:text-zinc-300 leading-relaxed">
            {t(term.definition)}
          </p>
        </header>

        {/* Full Content */}
        {term.content && (
          <div
            className="max-w-none text-sm sm:text-base leading-relaxed space-y-4 text-stone-700 dark:text-zinc-300 mb-12"
            data-article-content
            dangerouslySetInnerHTML={{
              __html: marked.parse(t(term.content) || '', { gfm: true, breaks: true, async: false }),
            }}
          />
        )}

        {/* Examples */}
        {term.examples && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-zinc-100 mb-4">
              {language === 'en' ? 'Examples' : 'Contoh'}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-stone-700 dark:text-zinc-300">
              {term.examples[language]?.map((ex, idx) => (
                <li key={idx} className="leading-relaxed">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <div className="mb-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Link2 size={18} className="text-rose-500 dark:text-rose-400" />
              {language === 'en' ? 'Related Terms' : 'Istilah Terkait'}
            </h2>
            <div className="flex flex-wrap gap-3">
              {relatedTerms.map(rt => (
                <Link
                  key={rt.slug}
                  to={`/vanpedia/${rt.slug}`}
                  className="px-4 py-2 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
                >
                  <span className="font-medium text-stone-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400">
                    {t(rt.title)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-rose-500 dark:text-rose-400" />
              {language === 'en' ? 'Related Articles' : 'Artikel Terkait'}
            </h2>
            <div className="space-y-3">
              {relatedArticles.map(a => (
                <Link
                  key={a.slug}
                  to={`/articles/${a.slug}`}
                  className="block p-4 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                      {t(a.title)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                      <Tag size={10} />
                      {a.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-1">
                    {t(a.summary)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
};

/**
 * Vanpedia index page — lists all terms.
 */
export const VanpediaIndexPage: React.FC = () => {
  const { language, t } = usePortfolio();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Seo
        title={language === 'en' ? 'Vanpedia - Knowledge | Muchamad Irvan' : 'Vanpedia - Kamus | Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Vanpedia — a collection of technical terms, definitions, and examples across music theory, computer science, architecture, and security.'
            : 'Vanpedia — kumpulan istilah teknis, definisi, dan contoh dalam teori musik, ilmu komputer, arsitektur, dan keamanan.'
        }
        url="https://vanviolet.my.id/vanpedia"
        type="website"
        keywords="vanpedia, glossary, terminology, knowledge, dictionary"
      />

      <section className="py-24 px-6 sm:px-8 max-w-6xl mx-auto min-h-screen">
        <header className="mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
            {language === 'en' ? 'Vanpedia — Knowledge Base' : 'Vanpedia — Kamus Istilah'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Technical terms, defined.' : 'Istilah teknis, terdefinisi.'}
          </h1>
          <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md mt-4">
            {language === 'en'
              ? 'A curated dictionary of music theory, programming, database, and architecture terms referenced throughout these articles.'
              : 'Kamus istilah teknis yang direferensikan di artikel-artikel ini: teori musik, pemrograman, database, dan arsitektur.'}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vanpediaTermsData.map(term => (
            <Link
              key={term.slug}
              to={`/vanpedia/${term.slug}`}
              className="block p-5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/30 dark:hover:border-rose-500/50 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    {term.category}
                  </span>
                  <h3 className="font-semibold text-stone-900 dark:text-zinc-100 mt-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {t(term.title)}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-1.5">
                    {t(term.definition)}
                  </p>
                </div>
                <ArrowLeft
                  size={14}
                  className="rotate-180 text-stone-400 dark:text-zinc-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors shrink-0 mt-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};
