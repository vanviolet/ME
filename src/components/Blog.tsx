import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { blogPostsData } from '../data/portfolioData';
import { BlogPost } from '../types';
import { BlogModal } from './BlogModal';
import { ArrowUpRight, Calendar, Clock, BookOpen } from 'lucide-react';

export const Blog: React.FC = () => {
  const { language, t } = usePortfolio();
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  return (
    <section
      id="blog"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
            {language === 'en' ? '07 / Articles & Writing' : '07 / Artikel & Catatan Teknis'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Engineering Updates.' : 'Catatan Rekayasa.'}
          </h2>
        </div>
        <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md">
          {language === 'en'
            ? 'Reflections on system design, Web Audio math, biometric security, and scaling university infrastructure.'
            : 'Tulisan teknis mengenai arsitektur sistem, Web Audio API, keamanan biometrik, dan skalabilitas kampus.'}
        </p>
      </div>

      {/* Editorial Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPostsData.map(post => (
          <article
            key={post.id}
            onClick={() => setActivePost(post)}
            className="group cursor-pointer p-5 sm:p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 hover:border-stone-400 dark:hover:border-zinc-700 shadow-xs flex flex-col justify-between gap-6"
          >
            <div className="space-y-3 sm:space-y-4">
              {/* Category, Date & Read Time: Spacious & wrapped gracefully */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider border border-rose-500/20 shrink-0">
                  {post.category}
                </span>

                <div className="flex items-center gap-2.5 text-xs text-stone-500 dark:text-zinc-400 shrink-0">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar size={13} className="text-stone-400 dark:text-zinc-500 shrink-0" />
                    <span>{post.date}</span>
                  </span>
                  <span className="text-stone-300 dark:text-zinc-700">•</span>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Clock size={13} className="text-stone-400 dark:text-zinc-500 shrink-0" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
              </div>

              {/* Title with healthy spacing */}
              <h3 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug flex items-start justify-between gap-3 pt-1">
                <span>{t(post.title)}</span>
                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-stone-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform mt-0.5"
                />
              </h3>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                {t(post.summary)}
              </p>
            </div>

            {/* Tags & Action: Stacked gracefully on mobile, never cramped */}
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

              <div className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs sm:text-sm whitespace-nowrap group-hover:translate-x-0.5 transition-transform self-start sm:self-auto pt-1 sm:pt-0">
                <BookOpen size={14} className="shrink-0" />
                <span className="whitespace-nowrap">{language === 'en' ? 'Read Article' : 'Baca Artikel'}</span>
                <ArrowUpRight size={14} className="shrink-0" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Article Reader Modal */}
      <BlogModal post={activePost} onClose={() => setActivePost(null)} />
    </section>
  );
};
