import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Seo } from './Seo';
import {
  Wrench,
  Type,
  Code2,
  Binary,
  Palette,
  Crop,
  ArrowRight,
  Kanban,
  KeyRound,
  Code,
  Fingerprint,
  Database,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToolsIndexPage: React.FC = () => {
  const { language } = usePortfolio();

  const toolsList = [
    {
      id: 'video-editor',
      title: 'Video Editor Studio',
      description:
        language === 'en'
          ? 'Professional multi-track web video editor with drag & drop timeline, Web Audio SFX synthesis, mic voiceover recording, animated subtitles, stickers, cinematic LUT filters, and 1080p client-side rendering.'
          : 'Editor video multi-track profesional berbasis web dengan timeline drag & drop, sintesis efek suara Web Audio, rekaman voiceover mic, subtitle animasi, stiker, filter warna LUT sinematik, dan ekspor render 1080p instan.',
      icon: Video,
      category: 'Media & Production',
      path: '/tools/video-editor',
      status: 'active',
      badge: language === 'en' ? 'Featured Studio' : 'Studio Unggulan',
    },
    {
      id: 'jwt-debugger',
      title: 'JWT Debugger & Decoder',
      description:
        language === 'en'
          ? 'Decode, inspect, and verify JSON Web Tokens (RFC 7519) client-side with claims parsing, unix timestamps, and signature structure.'
          : 'Dekode, analisis isi klaim payload JSON Web Token (JWT), konversi waktu Unix, dan periksa tanda tangan secara aman 100% di browser.',
      icon: KeyRound,
      category: 'Developer & Security',
      path: '/tools/jwt-debugger',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'regex-tester',
      title: 'Regex Tester & Explainer',
      description:
        language === 'en'
          ? 'Interactive regular expression sandbox with real-time match group highlighting, substitution testing, and pre-built pattern library.'
          : 'Penguji Regex interaktif real-time dengan penyorotan grup penangkapan, pengujian penggantian teks, dan pustaka pola umum.',
      icon: Code,
      category: 'Developer & Regex',
      path: '/tools/regex-tester',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'uuid-generator',
      title: 'UUID / ULID & Hash Studio',
      description:
        language === 'en'
          ? 'Generate cryptographic UUID v4, timestamp-ordered UUID v7, sortable ULID keys, and compute real-time SHA-256 / MD5 checksums.'
          : 'Hasilkan UUID v4, UUID v7 terurut waktu, ULID, serta kalkulator hash kriptografi (SHA-256, SHA-512, MD5) instan.',
      icon: Fingerprint,
      category: 'Backend & Cryptography',
      path: '/tools/uuid-generator',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'sql-formatter',
      title: 'SQL Formatter & Minifier',
      description:
        language === 'en'
          ? 'Format, beautify, and minify SQL queries for PostgreSQL, MySQL, and SQLite with keyword capitalizing and indentation controls.'
          : 'Format, percantik, dan minifikasi kueri SQL (PostgreSQL, MySQL, SQLite) dengan huruf kapital otomatis dan pengaturan spasi.',
      icon: Database,
      category: 'Database & Backend',
      path: '/tools/sql-formatter',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'json-formatter',
      title: 'JSON Formatter & Validator',
      description:
        language === 'en'
          ? 'Format, minify, validate, and convert JSON structures with real-time error checking.'
          : 'Format, minifikasi, validasi sintaks, dan periksa struktur data JSON secara real-time.',
      icon: Code2,
      category: 'Developer Utility',
      path: '/tools/json-formatter',
      status: 'active',
      badge: language === 'en' ? 'Available' : 'Tersedia',
    },
    {
      id: 'base64-converter',
      title: 'Base64 Encoder & Decoder',
      description:
        language === 'en'
          ? 'Encode text and files to Base64 strings or decode back safely with UTF-8 support.'
          : 'Enkode teks dan berkas ke string Base64 atau dekode kembali secara instan.',
      icon: Binary,
      category: 'Security & Web',
      path: '/tools/base64',
      status: 'active',
      badge: language === 'en' ? 'Available' : 'Tersedia',
    },
    {
      id: 'image-cropper',
      title: 'Photo Editor & Design Studio',
      description:
        language === 'en'
          ? 'Full-featured photo editor with advanced typography formatting, filters, layer stacking, background removal, vector shapes, stickers, and 4K export.'
          : 'Editor foto & studio desain grafis lengkap dengan pengaturan tipografi presisi, layer, filter warna, hapus background otomatis, bentuk vektor, dan ekspor 4K.',
      icon: Crop,
      category: 'Media & Design',
      path: '/tools/image-cropper',
      status: 'active',
      badge: language === 'en' ? 'Upgraded Studio' : 'Studio Baru',
    },
    {
      id: 'css-gradient',
      title: 'CSS Gradient Generator',
      description:
        language === 'en'
          ? 'Design linear and radial CSS gradients with direct Tailwind CSS and React style code export.'
          : 'Desain gradien warna CSS linear & radial dengan ekspor kode Tailwind dan React.',
      icon: Palette,
      category: 'UI & Design',
      path: '/tools/css-gradient',
      status: 'active',
      badge: language === 'en' ? 'Available' : 'Tersedia',
    },
    {
      id: 'lorem-ipsum',
      title: 'Lorem Ipsum Generator',
      description:
        language === 'en'
          ? 'Generate clean dummy text with customizable paragraph count, HTML tags wrapper, Tech Jargon, and Nusantara vocabulary.'
          : 'Generator teks dummy placeholder bersih dengan pengaturan paragraf, tag HTML, istilah teknis dev, dan kosakata Nusantara.',
      icon: Type,
      category: 'Content & Design',
      path: '/tools/lorem-ipsum',
      status: 'active',
      badge: language === 'en' ? 'Available' : 'Tersedia',
    },
    {
      id: 'jira',
      title: 'Jira Cloud Project Management',
      description:
        language === 'en'
          ? 'Enterprise-grade Agile issue tracking, Scrum & Kanban boards, sprint planning, roadmap Gantt, burndown reports, automations, and RBAC team permissions.'
          : 'Manajemen proyek enterprise terinspirasi Jira: Kanban & Scrum board, perencanaan sprint, roadmap Gantt, laporan burndown, otomasi, dan izin tim RBAC.',
      icon: Kanban,
      category: 'Project & Engineering',
      path: '/tools/jira',
      status: 'coming_soon',
      badge: language === 'en' ? 'Coming Soon' : 'Segera Hadir',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <Seo
        title={language === 'en' ? 'Developer & Designer Tools — Muchamad Irvan' : 'Perkakas Tool Pengembang & Desainer'}
        description={
          language === 'en'
            ? 'Free online utility tools for developers and designers, including Lorem Ipsum Generator, JSON tools, and converters.'
            : 'Kumpulan perkakas tool online gratis untuk pengembang perangkat lunak dan desainer UI.'
        }
        url="/tools"
      />

      {/* Header Banner */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 shadow-xs">
          <Wrench size={14} />
          <span>{language === 'en' ? 'Developer Tools Hub' : 'Pusat Perkakas Tool'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          {language === 'en' ? 'Tools for Creators & Developers' : 'Perkakas Tool Pengembang & Kreatif'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
          {language === 'en'
            ? 'A collection of lightweight, client-side developer utility tools built for speed, privacy, and smooth developer workflow.'
            : 'Koleksi tool utilitas online yang berjalan langsung di peramban Anda — cepat, privat, tanpa pelacakan data.'}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toolsList.map(tool => {
          const Icon = tool.icon;
          const isComingSoon = tool.status === 'coming_soon';

          return (
            <Link
              to={tool.path}
              key={tool.id}
              className={`group p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border transition-all duration-200 flex flex-col justify-between ${
                isComingSoon
                  ? 'border-amber-500/30 dark:border-amber-500/20 hover:border-amber-500/60 dark:hover:border-amber-500/40 hover:shadow-md'
                  : 'border-stone-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-900/50 hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                      isComingSoon
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-600 dark:group-hover:text-white'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-600 dark:group-hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                      isComingSoon
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider block font-semibold ${
                      isComingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tool.category}
                  </span>
                  <h3
                    className={`text-lg font-bold text-stone-900 dark:text-zinc-100 transition-colors ${
                      isComingSoon
                        ? 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
                        : 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
                    }`}
                  >
                    {tool.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div
                className={`pt-5 mt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-zinc-100 group-hover:translate-x-1 transition-all ${
                  isComingSoon
                    ? 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
                    : 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
                }`}
              >
                <span>
                  {isComingSoon
                    ? language === 'en'
                      ? 'Preview & Roadmap'
                      : 'Pratinjau & Roadmap'
                    : language === 'en'
                    ? 'Open Tool'
                    : 'Buka Tool'}
                </span>
                <ArrowRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
