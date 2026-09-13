import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  Menu,
  X,
  ArrowUpRight,
  Sun,
  Moon,
  BookOpen,
  Layers,
  MessageSquare,
  Compass,
  ArrowLeft,
  ShieldCheck,
  Wrench,
  ChevronDown,
  Type,
  Code2,
  Binary,
  Palette,
  Crop,
  Kanban,
  Search,
  Bell,
  Check,
  Plus,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuthButton } from './AuthButton';
import { useAuth } from '../context/AuthContext';
import { useJira } from './jira/JiraContext';

export const Navbar: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme } = usePortfolio();
  const { isAdmin } = useAuth();
  const jira = useJira();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const location = useLocation();
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const [isJiraProjectDropdownOpen, setIsJiraProjectDropdownOpen] = useState(false);
  const [isJiraUserDropdownOpen, setIsJiraUserDropdownOpen] = useState(false);
  const [isJiraNotifDropdownOpen, setIsJiraNotifDropdownOpen] = useState(false);
  const jiraProjectMenuRef = useRef<HTMLDivElement>(null);
  const jiraUserMenuRef = useRef<HTMLDivElement>(null);
  const jiraNotifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
      if (jiraProjectMenuRef.current && !jiraProjectMenuRef.current.contains(event.target as Node)) {
        setIsJiraProjectDropdownOpen(false);
      }
      if (jiraUserMenuRef.current && !jiraUserMenuRef.current.contains(event.target as Node)) {
        setIsJiraUserDropdownOpen(false);
      }
      if (jiraNotifMenuRef.current && !jiraNotifMenuRef.current.contains(event.target as Node)) {
        setIsJiraNotifDropdownOpen(false);
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
  const isJiraPage = location.pathname.startsWith('/tools/jira') || location.pathname.startsWith('/jira');

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
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            id="nav-brand-logo"
            to="/"
            className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg"
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

          {isJiraPage && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2.5 border-l border-stone-200 dark:border-zinc-800">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0">
                <Kanban size={11} />
              </span>
              <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                Jira Cloud
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation (Only rendered at lg: / 1024px+ to avoid header squish on tablet) */}
        <nav
          id="desktop-nav"
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1.5 bg-stone-100/80 dark:bg-zinc-900/80 p-1.5 rounded-full border border-stone-200/70 dark:border-zinc-800/70 shadow-xs"
        >
          {isJiraPage ? (
            /* Jira Mode: <- Portfolio link + Jira app menus */
            <div className="flex items-center gap-1.5">
              {/* <- Portfolio link */}
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-stone-200/80 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 hover:text-stone-950 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={13} />
                <span>{language === 'en' ? 'Portfolio' : 'Portofolio'}</span>
              </Link>

              <span className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-0.5" aria-hidden="true" />

              {/* Project Switcher */}
              <div className="relative" ref={jiraProjectMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsJiraProjectDropdownOpen(!isJiraProjectDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-xs hover:bg-stone-50 dark:hover:bg-zinc-700/80 text-stone-800 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  <span className="text-sm leading-none">{jira.activeProject.avatar}</span>
                  <span className="font-semibold truncate max-w-[130px]">{jira.activeProject.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {jira.activeProject.key}
                  </span>
                  <ChevronDown size={12} className="text-stone-400" />
                </button>

                {isJiraProjectDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 py-1.5 text-xs animate-in fade-in duration-100">
                    <div className="px-3 py-1.5 font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                      Projects ({jira.projects.length})
                    </div>
                    {jira.projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          jira.setActiveProjectId(p.id);
                          setIsJiraProjectDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.avatar}</span>
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-zinc-100">{p.name}</div>
                            <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
                              Key: {p.key} • {p.template}
                            </div>
                          </div>
                        </div>
                        {p.id === jira.activeProject.id && <Check size={14} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* + Create Button */}
              <button
                type="button"
                onClick={() => jira.setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>{language === 'en' ? 'Create' : 'Buat'}</span>
              </button>

              {/* Quick Search */}
              <button
                type="button"
                onClick={() => jira.setIsQuickSearchOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 border border-stone-200/70 dark:border-zinc-700/70 transition-colors cursor-pointer"
              >
                <Search size={13} />
                <span>{language === 'en' ? 'Search' : 'Cari'}</span>
                <kbd className="px-1.5 py-0.2 text-[9px] font-mono bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 rounded text-stone-500 dark:text-zinc-300">
                  ⌘K
                </kbd>
              </button>

              {/* Quick Filter: My Issues */}
              <button
                type="button"
                onClick={() => jira.setQuickFilter(jira.quickFilter === 'my' ? 'all' : 'my')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  jira.quickFilter === 'my'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                My Issues
              </button>

              {/* Notifications Bell */}
              <div className="relative" ref={jiraNotifMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsJiraNotifDropdownOpen(!isJiraNotifDropdownOpen);
                    if (!isJiraNotifDropdownOpen) jira.markNotificationsAsRead();
                  }}
                  className="relative p-1.5 rounded-full text-stone-600 dark:text-zinc-400 hover:bg-stone-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={15} />
                  {jira.notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-900" />
                  )}
                </button>

                {isJiraNotifDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 text-xs">
                    <div className="px-2 py-1.5 font-bold text-stone-900 dark:text-zinc-100 flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 mb-1">
                      <span>Activity & Alerts</span>
                      <span className="text-[10px] font-normal text-stone-400">Real-time</span>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {jira.notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <div className="font-medium text-stone-800 dark:text-zinc-200">{n.title}</div>
                          <div className="text-[10px] text-stone-400 dark:text-zinc-500 mt-0.5">{n.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Jira User Persona Switcher */}
              <div className="relative" ref={jiraUserMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsJiraUserDropdownOpen(!isJiraUserDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-stone-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title={`Active user: ${jira.currentUser.name} (${jira.currentUser.role})`}
                >
                  <img
                    src={jira.currentUser.avatar}
                    alt={jira.currentUser.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-stone-300 dark:ring-zinc-700"
                  />
                  <ChevronDown size={11} className="text-stone-400" />
                </button>

                {isJiraUserDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 py-1.5 text-xs">
                    <div className="px-3 py-1.5 border-b border-stone-100 dark:border-zinc-800 mb-1">
                      <div className="text-[10px] text-stone-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                        Jira Persona (RBAC)
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-zinc-400">
                        Switch role to test permissions:
                      </div>
                    </div>
                    {jira.workspace.members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          jira.setCurrentUser(member);
                          setIsJiraUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-zinc-100">{member.name}</div>
                            <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
                              {member.title} ({member.role})
                            </div>
                          </div>
                        </div>
                        {member.id === jira.currentUser.id && <Check size={14} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : isHomePage ? (
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
                    to="/tools/jira"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/60 transition-colors group mb-1"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Kanban size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <span>Jira Cloud PM</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[8px] font-bold uppercase font-mono">
                          Flagship
                        </span>
                      </div>
                      <div className="text-[10px] text-blue-700/80 dark:text-blue-300/80">
                        {language === 'en' ? 'Kanban, Sprints, Roadmap & RBAC' : 'Kanban, Sprint, Roadmap & RBAC'}
                      </div>
                    </div>
                  </Link>

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

          {/* Mobile Jira Quick Controls */}
          {isJiraPage && (
            <div className="flex lg:hidden items-center gap-1.5">
              <Link
                to="/"
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-stone-200/80 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 hover:text-stone-950 dark:hover:text-white"
                title="Kembali ke Portofolio"
              >
                <ArrowLeft size={13} />
                <span>Porto</span>
              </Link>
              <button
                type="button"
                onClick={() => jira.setIsCreateModalOpen(true)}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                title="Buat Issue Baru"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

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

          {isJiraPage ? (
            /* Jira Specific Mobile Drawer Content */
            <div className="space-y-4">
              {/* Return to Portfolio button */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-200/80 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-semibold text-xs hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2.5">
                  <ArrowLeft size={16} />
                  <span>{language === 'en' ? 'Return to Portfolio' : 'Kembali ke Portofolio'}</span>
                </span>
                <span className="text-[10px] uppercase font-mono text-stone-500 dark:text-zinc-400">vanviolet.my.id</span>
              </Link>

              {/* Active Project Switcher */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-semibold block px-0.5">
                  Jira Project
                </span>
                <div className="space-y-1.5">
                  {jira.projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        jira.setActiveProjectId(p.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                        p.id === jira.activeProject.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-stone-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.avatar}</span>
                        <div>
                          <div className="text-xs font-semibold text-stone-900 dark:text-zinc-100">{p.name}</div>
                          <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
                            {p.key} • {p.template}
                          </div>
                        </div>
                      </div>
                      {p.id === jira.activeProject.id && <Check size={16} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions: Create & Search */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    jira.setIsCreateModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  <Plus size={16} />
                  <span>{language === 'en' ? 'Create Issue' : 'Buat Issue'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    jira.setIsQuickSearchOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-stone-200/80 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 font-semibold text-xs cursor-pointer"
                >
                  <Search size={14} />
                  <span>{language === 'en' ? 'Search (⌘K)' : 'Cari (⌘K)'}</span>
                </button>
              </div>

              {/* Quick Filter: My Issues toggle */}
              <button
                type="button"
                onClick={() => {
                  jira.setQuickFilter(jira.quickFilter === 'my' ? 'all' : 'my');
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer ${
                  jira.quickFilter === 'my'
                    ? 'bg-blue-600 text-white'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                }`}
              >
                {jira.quickFilter === 'my' ? '✓ Filter: My Issues Active' : 'Filter by My Issues'}
              </button>

              {/* Persona RBAC Switcher */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-semibold block px-0.5">
                  RBAC Persona (Active User)
                </span>
                <div className="space-y-1">
                  {jira.workspace.members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        jira.setCurrentUser(member);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                        member.id === jira.currentUser.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <div className="text-xs">{member.name}</div>
                          <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
                            {member.title} ({member.role})
                          </div>
                        </div>
                      </div>
                      {member.id === jira.currentUser.id && <Check size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standard Mobile Drawer Content */
            <>
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
                to="/tools/jira"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-3"
              >
                <Kanban size={16} className="text-blue-600 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <span>Jira Cloud PM</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold uppercase font-mono">Flagship</span>
                  </div>
                  <div className="text-[10px] text-blue-700/80 dark:text-blue-300/80 font-medium">
                    Agile & Issue Tracker
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
          </>
          )}
        </div>
      )}
    </header>
  );
};
