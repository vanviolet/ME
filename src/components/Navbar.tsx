import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, setLanguage } = usePortfolio();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'philosophy', 'blog', 'contact'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: language === 'en' ? 'Home' : 'Beranda' },
    { id: 'about', label: language === 'en' ? 'About' : 'Tentang' },
    { id: 'experience', label: language === 'en' ? 'Experience' : 'Pengalaman' },
    { id: 'projects', label: language === 'en' ? 'Work' : 'Proyek' },
    { id: 'skills', label: language === 'en' ? 'Skills' : 'Keahlian' },
    { id: 'philosophy', label: language === 'en' ? 'Approach' : 'Prinsip' },
    { id: 'blog', label: language === 'en' ? 'Blog' : 'Artikel' },
    { id: 'contact', label: language === 'en' ? 'Contact' : 'Kontak' },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-zinc-800/80 py-3 shadow-xs'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand / Monogram */}
        <button
          id="nav-brand-logo"
          onClick={() => scrollToSection('hero')}
          className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md"
        >
          <span className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 dark:bg-zinc-100 dark:text-zinc-900 font-mono text-sm font-semibold flex items-center justify-center transition-transform group-hover:scale-105">
            MI
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
              Muchamad Irvan
            </span>
            <span className="text-[11px] font-mono text-stone-500 dark:text-zinc-400">
              Software Engineer
            </span>
          </span>
        </button>

        {/* Desktop Nav Links */}
        <nav id="desktop-nav" aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-stone-100/80 dark:bg-zinc-900/80 p-1 rounded-full border border-stone-200/60 dark:border-zinc-800/60">
          {navItems.map(item => (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Controls: Language, Theme, CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-stone-200/60 dark:bg-zinc-800/60 p-0.5 rounded-md border border-stone-200 dark:border-zinc-700/60">
            <button
              id="lang-toggle-en"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                language === 'en'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              EN
            </button>
            <button
              id="lang-toggle-id"
              onClick={() => setLanguage('id')}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                language === 'id'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              ID
            </button>
          </div>

          {/* Let's Talk CTA */}
          <button
            id="nav-cta-contact"
            onClick={() => scrollToSection('contact')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-xs"
          >
            <span>{language === 'en' ? "Let's Talk" : 'Hubungi'}</span>
            <ArrowUpRight size={13} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden border-b border-stone-200 dark:border-zinc-800 bg-stone-50/98 dark:bg-zinc-950/98 px-6 py-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-stone-200/70 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-semibold'
                    : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-900'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 dark:text-zinc-400">
                {language === 'en' ? 'Language / Bahasa' : 'Bahasa / Language'}
              </span>
              <button
                onClick={toggleLanguage}
                className="text-xs font-mono font-semibold px-2 py-1 rounded bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200"
              >
                {language.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
