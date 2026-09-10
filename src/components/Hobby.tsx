import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { InteractiveNoteLogicDemo } from './InteractiveNoteLogicDemo';
import { Music2, Sparkles, ExternalLink } from 'lucide-react';

export const Hobby: React.FC = () => {
  const { language } = usePortfolio();

  return (
    <section
      id="hobby"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
              {language === 'en' ? '05 / Hobby-Driven Exploration' : '05 / Karya Berdasarkan Hobi'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
              2024
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Music exploration & personal craft.' : 'Karya Berdasarkan Hobi: NoteLogic.'}
          </h2>
        </div>
        <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md">
          {language === 'en'
            ? 'van-theory.vercel.app · Built in 2024 as a personal hobby project for self-study, solving music theory, chord visualization, and real-time audio synthesis challenges.'
            : 'van-theory.vercel.app · Dibuat di tahun 2024 murni sebagai hobi untuk diri sendiri, memecahkan kesulitan pembelajaran teori musik dan visualisasi harmoni dengan Web Audio API.'}
        </p>
      </div>

      {/* Interactive NoteLogic Demo Component */}
      <InteractiveNoteLogicDemo />
    </section>
  );
};
