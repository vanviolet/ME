import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { profileData } from '../data/portfolioData';
import { ArrowUp, Github, Instagram, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80 text-xs font-mono text-stone-500 dark:text-zinc-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Statement */}
        <div className="space-y-1 text-center md:text-left">
          <div className="font-semibold text-stone-900 dark:text-zinc-100 flex items-center justify-center md:justify-start gap-2">
            <span className="w-5 h-5 rounded bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 flex items-center justify-center text-[10px] font-mono">
              MI
            </span>
            <span>Muchamad Irvan</span>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500">
            {language === 'en'
              ? 'Designed & built with intention · Fullstack Software Engineer'
              : 'Dirancang & dibangun dengan presisi · Fullstack Software Engineer'}
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-5">
          <a
            href={profileData.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
          <a
            href={profileData.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={16} />
          </a>
          <a
            href={`mailto:${profileData.email}`}
            className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
        </div>

        {/* Tech Credits & Scroll to top */}
        <div className="flex items-center gap-4">
          <span className="text-[11px]">
            React 19 · TypeScript · Tailwind CSS
          </span>
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top of page"
            className="w-7 h-7 rounded-md border border-stone-200 dark:border-zinc-800 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowUp size={13} />
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-200/60 dark:border-zinc-800/60 text-center text-[10px] text-stone-400 dark:text-zinc-600">
        © {currentYear} Muchamad Irvan. All rights reserved.
      </div>
    </footer>
  );
};
