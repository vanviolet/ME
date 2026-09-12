import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Menu, X, ArrowUpRight, Sun, Moon, BookOpen, Layers, MessageSquare, Compass, ArrowLeft, ShieldCheck, Wrench, ChevronDown, Type, Code2, Binary, Palette, Crop } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme } = usePortfolio();
  const { isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track active section via scroll (only on home page)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (location.pathname !== '/') return;

      const sections = ['hero', 'about', 'experience', 'skills', 'projects', 'philosophy', 'contact'];
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
  }, [location.pathname]);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const isHomePage = location.pathname === '/';
  const isArticlesPage = location.pathname.startsWith('/articles');
  const isVanpediaPage = location.pathname.startsWith('/vanpedia');
  const isForumPage = location.pathname.startsWith('/forum') || location.pathname.startsWith('/issues');
  const isToolsPage = location.pathname.startsWith('/tools');

  // Key home anchors for desktop
  const homeNavAnchors = [
    { id: 'hero', label: language === 'en' ? 'Home' : 'Beranda', path: '/' },
    { id: 'about', label: language === 'en' ? 'About' : 'Tentang', path: '/#about' },
    { id: 'experience', label: language === 'en' ? 'Experience' : 'Pengalaman', path: '/#experience' },
    { id: 'projects', label: language === 'en' ? 'Systems' : 'Sistem', path: '/#projects' },
    { id: 'contact', label: language === 'en' ? 'Contact' : 'Kontak', path: '/#contact' },
  ];

  // Full home anchors for mobile drawer
  const allHomeAnchors = [
    { id: 'hero', label: language === 'en' ? 'Beranda (Top)' : 'Beranda (Atas)', path: '/' },
    { id: 'about', label: language === 'en' ? 'Tentang Saya' : 'Tentang Saya', path: '/#about' },
    { id: 'experience', label: language === 'en' ? 'Pengalaman Kerja' : 'Pengalaman Kerja', path: '/#experience' },
    { id: 'skills', label: language === 'en' ? 'Keahlian Teknis' : 'Keahlian Teknis', path: '/#skills' },
    { id: 'projects', label: language === 'en' ? 'Sistem & Karya' : 'Sistem & Karya', path: '/#projects' },
    { id: 'philosophy', label: language === 'en' ? 'Prinsip Rekayasa' : 'Prinsip Rekayasa', path: '/#philosophy' },
    { id: 'contact', label: language === 'en' ? 'Hubungi Saya' : 'Hubungi Saya', path: '/#contact' },
  ];

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-stone-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-stone-200/80 dark:border-zinc-800/80 py-3 shadow-xs'
          : 'bg-stone-50/80 dark:bg-zinc-950/80 backdrop-blur-xs py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Brand / Monogram */}
        <Link
          id="nav-brand-logo"
          to="/"
          className="group flex items-center gap-2.5 text-left shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg"
        >
          <span className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
            MI
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-stone-900 dark:text-zinc-100 leading-tight">
              Muchamad Irvan
            </span>
            <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
              Software Engineer
            </span>
          </span>
        </Link>

        {/* Desktop Navigation (Only rendered at lg: / 1024px+ to avoid header squish on tablet) */}
        <nav
          id="desktop-nav"
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1.5 bg-stone-100/80 dark:bg-zinc-900/80 p-1.5 rounded-full border border-stone-200/70 dark:border-zinc-800/70 shadow-xs"
        >
          {isHomePage ? (
            /* Home Page Section Anchors */
            <>
              <div className="flex items-center gap-1">
                {homeNavAnchors.map(item => (
                  <Link
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    to={item.path}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
                      activeSection === item.id
                        ? 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 shadow-xs'
                        : 'text-stone-600 dark:text-zinc-400 hover:text-stone-950 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Visual divider */}
              <span className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" aria-hidden="true" />
            </>
          ) : (
            /* Sub-pages: Quick back to portfolio link */
            <>
              <Link
                to="/"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>{language === 'en' ? 'Portfolio' : 'Portofolio'}</span>
              </Link>
              <span className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" aria-hidden="true" />
            </>
          )}

          {/* Primary Hub: Articles */}
          <Link
            id="nav-link-articles"
            to="/articles"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
              isArticlesPage
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <BookOpen size={13} />
            <span>{language === 'en' ? 'Articles' : 'Artikel'}</span>
          </Link>

          {/* Primary Hub: Vanpedia (Kamus Istilah) */}
          <Link
            id="nav-link-vanpedia"
            to="/vanpedia"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
              isVanpediaPage
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <Compass size={13} />
            <span>Vanpedia</span>
          </Link>

          {/* Primary Hub: Forum (Public & Private) */}
          <Link
            id="nav-link-forum"
            to="/forum"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
              isForumPage
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <MessageSquare size={13} />
            <span>Forum</span>
          </Link>

          {/* Primary Hub: Tools Dropdown */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              id="nav-link-tools"
              type="button"
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              onMouseEnter={() => setToolsDropdownOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 cursor-pointer ${
                isToolsPage || toolsDropdownOpen
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <Wrench size={13} />
              <span>Tool</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {toolsDropdownOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-72 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setToolsDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 mb-1">
                  {language === 'en' ? 'Available Tools' : 'Perkakas Tool Tersedia'}
                </div>

                <div className="space-y-0.5">
                  <Link
                    to="/tools/lorem-ipsum"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Type size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        Lorem Ipsum Generator
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-zinc-400">
                        {language === 'en' ? 'Dummy text & HTML tags' : 'Teks dummy & tag HTML'}
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/tools/json-formatter"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Code2 size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        JSON Formatter & Validator
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-zinc-400">
                        {language === 'en' ? 'Beautify & check syntax' : 'Format & cek sintaks'}
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/tools/base64"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Binary size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        Base64 Encoder & Decoder
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-zinc-400">
                        {language === 'en' ? 'Text & File conversion' : 'Konversi teks & berkas'}
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/tools/css-gradient"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Palette size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        CSS Gradient Generator
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-zinc-400">
                        {language === 'en' ? 'CSS & Tailwind gradients' : 'Gradien CSS & Tailwind'}
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/tools/image-cropper"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Crop size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        Image Cropper & Editor
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-zinc-400">
                        {language === 'en' ? 'Crop, rotate & avatar masks' : 'Potong foto & avatar lingkaran'}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="my-1 border-t border-stone-100 dark:border-zinc-800" />

                <Link
                  to="/tools"
                  onClick={() => setToolsDropdownOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Wrench size={13} className="text-rose-500" />
                    <span>{language === 'en' ? 'View All Tools Hub' : 'Lihat Pusat Tool'}</span>
                  </span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right Controls: Language, Theme, Contact CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Switcher (Desktop / Tablet only) */}
          <div className="hidden sm:flex items-center bg-stone-200/70 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-stone-300/60 dark:border-zinc-700/60">
            <button
              id="lang-toggle-en"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                language === 'en'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              id="lang-toggle-id"
              onClick={() => setLanguage('id')}
              className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                language === 'id'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
              title="Bahasa Indonesia"
            >
              ID
            </button>
          </div>

          {/* Theme Toggle Button (Desktop / Tablet only) */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="hidden sm:inline-flex p-2 rounded-lg border border-stone-300/60 dark:border-zinc-700/60 bg-stone-200/70 dark:bg-zinc-800/80 text-stone-700 dark:text-zinc-300 hover:text-stone-950 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Google OAuth Profile & Auth Control */}
          <AuthButton />

          {/* Let's Talk CTA (Desktop) */}
          <Link
            id="nav-cta-contact"
            to="/#contact"
            className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-xs"
          >
            <span>{language === 'en' ? "Let's Talk" : 'Hubungi'}</span>
            <ArrowUpRight size={13} />
          </Link>

          {/* Mobile/Tablet Menu Button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 rounded-lg border border-stone-300/70 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-900 text-stone-700 dark:text-zinc-300"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Visible on screens < 1024px) */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden border-b border-stone-200 dark:border-zinc-800 bg-stone-50/98 dark:bg-zinc-950/98 px-5 py-5 shadow-xl max-h-[85vh] overflow-y-auto space-y-6"
        >
          {/* Mobile Preferences: Language & Theme Switcher */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-semibold block px-0.5">
              {language === 'en' ? 'Quick Preferences' : 'Pengaturan Cepat'}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Language Selector */}
              <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                    language === 'en'
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('id')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                    language === 'id'
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                >
                  Bahasa
                </button>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-800 dark:text-zinc-200 font-medium hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span>Mode Terang</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-stone-700" />
                    <span>Mode Gelap</span>
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Knowledge & Community Section */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-semibold block mb-2 px-1">
              {language === 'en' ? 'Knowledge & Community' : 'Pengetahuan & Komunitas'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link
                to="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  isArticlesPage
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-200'
                }`}
              >
                <BookOpen size={16} className="text-rose-500 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-semibold">{language === 'en' ? 'Articles' : 'Artikel'}</div>
                  <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
                    {language === 'en' ? 'Tech & AI Insights' : 'Catatan Rekayasa'}
                  </div>
                </div>
              </Link>

              <Link
                to="/vanpedia"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  isVanpediaPage
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-200'
                }`}
              >
                <Compass size={16} className="text-rose-500 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-semibold">Vanpedia</div>
                  <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
                    {language === 'en' ? 'Glossary & Terms' : 'Kamus Istilah'}
                  </div>
                </div>
              </Link>

              <Link
                to="/forum"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  isForumPage
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-200'
                }`}
              >
                <MessageSquare size={16} className="text-rose-500 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-semibold">{language === 'en' ? 'Forum' : 'Forum Komunitas'}</div>
                  <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
                    Public & Private Threads
                  </div>
                </div>
              </Link>

              <Link
                to="/tools/lorem-ipsum"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  isToolsPage
                    ? 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-200'
                }`}
              >
                <Wrench size={16} className="text-rose-500 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <span>Lorem Ipsum Generator</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">New</span>
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
                    {language === 'en' ? 'Developer & Designer Tools' : 'Tool Teks Placeholder'}
                  </div>
                </div>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-3 col-span-full"
                >
                  <ShieldCheck size={16} className="text-rose-500 shrink-0" />
                  <div className="text-left">
                    <div className="text-xs font-semibold">{language === 'en' ? 'Admin Verification Center' : 'Pusat Verifikasi Admin'}</div>
                    <div className="text-[10px] text-rose-500/80 font-medium">
                      Moderasi vanviolet.js@gmail.com
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Portfolio Anchors Section */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-semibold block mb-2 px-1">
              {language === 'en' ? 'Portfolio Sections' : 'Bagian Portofolio'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {allHomeAnchors.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isHomePage && activeSection === item.id
                      ? 'bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-semibold'
                      : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Direct CTA */}
          <div className="pt-2 border-t border-stone-200 dark:border-zinc-800">
            <Link
              to="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-medium text-xs hover:bg-stone-800 dark:hover:bg-white transition-colors"
            >
              <span>{language === 'en' ? "Get in Touch / Let's Talk" : 'Hubungi Saya (Kontak)'}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
