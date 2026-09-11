import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { profileData } from '../data/portfolioData';
import { ArrowUp, Github, Instagram, Mail, BookOpen, Compass, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

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
              ? 'Software Engineer · Web Systems, Audio Math & AI Architecture'
              : 'Software Engineer · Rekayasa Web, Matematika Audio & Arsitektur AI'}
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors">
            {language === 'en' ? 'Portfolio' : 'Portofolio'}
          </Link>
          <span className="text-stone-300 dark:text-zinc-700">•</span>
          <Link to="/articles" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1">
            <BookOpen size={12} />
            <span>{language === 'en' ? 'Articles' : 'Artikel'}</span>
          </Link>
          <span className="text-stone-300 dark:text-zinc-700">•</span>
          <Link to="/vanpedia" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1">
            <Compass size={12} />
            <span>Vanpedia</span>
          </Link>
          <span className="text-stone-300 dark:text-zinc-700">•</span>
          <Link to="/issues" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{language === 'en' ? 'Q&A' : 'Diskusi'}</span>
          </Link>
        </div>

        {/* Social Links & Scroll to top */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
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
