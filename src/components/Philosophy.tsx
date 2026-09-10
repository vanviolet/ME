import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { philosophyData } from '../data/portfolioData';

export const Philosophy: React.FC = () => {
  const { language, t } = usePortfolio();

  return (
    <section
      id="philosophy"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      {/* Header */}
      <div className="mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
          {language === 'en' ? '06 / Philosophy' : '06 / Nilai & Pendekatan'}
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
          {language === 'en' ? 'How I build.' : 'Prinsip Rekayasa.'}
        </h2>
        <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 mt-2 max-w-lg">
          {language === 'en'
            ? 'Guiding principles forged from real enterprise deadlines, production incidents, and product evolution.'
            : 'Prinsip panduan yang diasah dari pengalaman nyata menghadapi tenggat waktu enterprise dan sistem skala besar.'}
        </p>
      </div>

      {/* Editorial Numbered Cards with Spacious Whitespace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {philosophyData.map(item => (
          <div
            key={item.number}
            className="group relative p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 hover:border-stone-400 dark:hover:border-zinc-700 transition-colors space-y-4"
          >
            {/* Number indicator */}
            <div className="text-3xl font-mono font-bold text-stone-300 dark:text-zinc-700 group-hover:text-rose-500 transition-colors">
              {item.number}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
              {t(item.title)}
            </h3>

            {/* Quote */}
            <blockquote className="text-sm sm:text-base font-medium italic text-stone-700 dark:text-zinc-300 border-l-2 border-rose-500/50 pl-3">
              "{t(item.quote)}"
            </blockquote>

            {/* Narrative */}
            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
              {t(item.description)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
