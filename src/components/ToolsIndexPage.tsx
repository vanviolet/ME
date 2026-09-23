import React, { useState, useMemo } from 'react';
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
  Network,
  Globe,
  Braces,
  Clock,
  Terminal,
  FileDiff,
  FileCode,
  FileText,
  Shield,
  Share2,
  QrCode,
  Link2,
  Search,
  X,
  Sparkles,
  ShieldAlert,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToolsIndexPage: React.FC = () => {
  const { language } = usePortfolio();

  const toolsList = [
    {
      id: 'trilium-notes',
      title: language === 'en' ? 'Trilium Notes: Hierarchical Personal Knowledge Base' : 'Trilium Notes: Basis Pengetahuan Hierarkis & Editor Visual',
      description:
        language === 'en'
          ? 'Desktop-grade hierarchical note-taking inspired by Trilium Notes: unlimited nested tree structure, pure WYSIWYG rich text editor with tables, task lists, code notes, note tabs, and Trilium label attributes.'
          : 'Sistem pencatatan hierarkis ala Trilium Notes: struktur pohon tanpa batas kedalaman, editor visual murni (WYSIWYG) dengan tabel, checklist to-do, cuplikan kode, tab multi-catatan, dan sistem label atribut.',
      icon: BookOpen,
      category: 'Productivity & Knowledge Base',
      path: '/tools/notes',
      status: 'active',
      badge: language === 'en' ? 'Trilium Edition' : 'Edisi Trilium',
    },
    {
      id: 'eslint-rules-generator',
      title: 'ESLint Rules Generator & Interactive Guide',
      description:
        language === 'en'
          ? 'Interactive ESLint rules builder with live error previews on hover, comprehensive explanations, preset configurations, and live syntax sandbox.'
          : 'Generator konfigurasi ESLint visual interaktif dengan pratinjau contoh error saat di-hover, penjelasan aturan lengkap, preset siap pakai, dan sandbox pengujian kode live.',
      icon: ShieldAlert,
      category: 'Developer & Code Quality',
      path: '/tools/eslint-rules',
      status: 'active',
      badge: language === 'en' ? 'Interactive Guide' : 'Panduan Interaktif',
    },
    {
      id: 'ai-illustration',
      title: 'AI Illustration Studio (Multi-Style Diffusion)',
      description:
        language === 'en'
          ? 'Generate stylized art and illustrations with ready-to-use presets: Ink Drawing v4, Flat Vector, 3D Isometric, Cyberpunk, and Gemini prompt enhancement.'
          : 'Generator seni dan ilustrasi AI dengan preset gaya siap pakai: Ink Drawing v4, Flat Vector, 3D Isometric, Cyberpunk, dan peningkatan prompt AI.',
      icon: Sparkles,
      category: 'AI & Creative Studio',
      path: '/tools/ai-illustration',
      status: 'active',
      badge: language === 'en' ? 'New Studio' : 'Studio Baru',
    },
    {
      id: 'api-tester',
      title: 'API Testing Studio (Postman Web)',
      description:
        language === 'en'
          ? 'Powerful HTTP client & API test suite with automatic CORS bypass via Node.js proxy, environment variables, multi-language cURL/code generator, and response inspector.'
          : 'Klien HTTP & pengujian API mirip Postman dengan fitur bypass CORS otomatis melalui proxy Node.js, variabel environment, generator cURL/kode multi-bahasa, dan inspektur response.',
      icon: Globe,
      category: 'API & Networking',
      path: '/tools/api-tester',
      status: 'active',
      badge: language === 'en' ? 'Bypass CORS' : 'Bebas CORS',
    },
    {
      id: 'flowchart-studio',
      title: 'Interactive Flowchart & Mermaid Studio',
      description:
        language === 'en'
          ? 'Overpowered drag & drop flowchart canvas with bidirectional Mermaid code sync, AI system architect, auto-layout, interactive logic step simulator, and 4K vector export.'
          : 'Kanvas flowchart interaktif drag & drop dengan sinkronisasi kode Mermaid 2 arah, arsitek sistem AI, tata letak otomatis rapi, simulator alur logika, dan ekspor resolusi tinggi.',
      icon: Network,
      category: 'Architecture & Diagrams',
      path: '/tools/flowchart',
      status: 'active',
      badge: language === 'en' ? 'Flagship Tool' : 'Tool Unggulan',
    },
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
      badge: language === 'en' ? 'Desktop Studio' : 'Desktop Studio',
      desktopOnly: true,
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
      id: 'json-to-types',
      title: 'JSON to TypeScript & Zod Studio',
      description:
        language === 'en'
          ? 'Transform JSON response payloads into clean TypeScript interfaces, type aliases, and Zod validation schemas with instant export.'
          : 'Ubah payload JSON respon API secara instan menjadi TypeScript interface, type alias, dan skema validasi runtime Zod.',
      icon: Braces,
      category: 'TypeScript & Schema',
      path: '/tools/json-to-types',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'cron-generator',
      title: 'Visual Cron Expression Generator',
      description:
        language === 'en'
          ? 'Interactive Crontab schedule builder, human-readable translator, reverse expression parser, and next 6 run execution dates calculator.'
          : 'Pembuat jadwal Cron interaktif, penerjemah bahasa manusia dua arah, dan kalkulator perkiraan 6 jadwal eksekusi berikutnya.',
      icon: Clock,
      category: 'DevOps & Crontab',
      path: '/tools/cron-generator',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'timestamp-converter',
      title: 'Unix Timestamp & Timezone Studio',
      description:
        language === 'en'
          ? 'Live ticking Unix epoch clock, two-way date converter (seconds/ms), quick time offsets, and multi-timezone matrix (WIB, WITA, WIT, UTC, JST, EST, PST).'
          : 'Jam Unix Epoch real-time, konverter dua arah tanggal ke detik/milidetik, dan perbandingan zona waktu lengkap (WIB, WITA, WIT, UTC, JST).',
      icon: Clock,
      category: 'Time & Converter',
      path: '/tools/timestamp-converter',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'curl-to-code',
      title: 'cURL to Code Converter',
      description:
        language === 'en'
          ? 'Convert raw cURL terminal commands into modern HTTP client code for JavaScript Fetch, Axios, Python (requests), Go, and PHP.'
          : 'Ubah perintah cURL terminal mentah menjadi kode HTTP client siap pakai untuk JS Fetch, Axios, Python, Go, dan PHP.',
      icon: Terminal,
      category: 'HTTP & API',
      path: '/tools/curl-to-code',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'diff-checker',
      title: 'Code & Text Diff Checker',
      description:
        language === 'en'
          ? 'Compare differences between two code or text snippets side-by-side or unified with additions, deletions, and line stats.'
          : 'Bandingkan perbedaan kode atau teks secara berdampingan (side-by-side) maupun satu kolom dengan penghitung perubahan baris.',
      icon: FileDiff,
      category: 'Code & Text',
      path: '/tools/diff-checker',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'color-contrast',
      title: 'WCAG Color Contrast & Accessibility Studio',
      description:
        language === 'en'
          ? 'Test and optimize color contrast ratios according to WCAG 2.1 AA/AAA standards with real-time UI simulations (grayscale & blur vision).'
          : 'Uji dan optimalkan rasio kontras warna sesuai standar WCAG 2.1 AA/AAA dengan simulasi UI langsung dan filter aksesibilitas visual.',
      icon: Palette,
      category: 'Design & Accessibility',
      path: '/tools/color-contrast',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'svg-to-jsx',
      title: 'SVG to React JSX & Data URI Studio',
      description:
        language === 'en'
          ? 'Convert raw SVG into clean React TypeScript components, sanitize JSX attributes, generate optimized CSS Data URIs, with live visual canvas preview.'
          : 'Ubah file SVG mentah menjadi komponen React TypeScript yang bersih, rapikan atribut JSX, dan buat CSS background Data URI dengan pratinjau live.',
      icon: FileCode,
      category: 'Frontend & UI',
      path: '/tools/svg-to-jsx',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'yaml-json-converter',
      title: 'YAML ↔ JSON Two-Way Converter',
      description:
        language === 'en'
          ? 'Convert two-way between YAML and JSON files with real-time syntax validation, indentation spacing controls, and Kubernetes/Docker cloud presets.'
          : 'Konversi dua arah antara YAML dan JSON secara instan dengan validasi sintaks, pengaturan indentasi spasi, dan preset manifest Kubernetes & Docker.',
      icon: FileText,
      category: 'DevOps & Backend',
      path: '/tools/yaml-json-converter',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'mock-data-generator',
      title: 'Mock Data & Database Seeder Studio',
      description:
        language === 'en'
          ? 'Generate realistic mock data and database seeds in JSON, CSV, and SQL INSERT formats with customizable schema columns and Indonesian localization.'
          : 'Buat data dummy realistis dan seeder database dalam format JSON, CSV, dan SQL INSERT dengan kustomisasi kolom serta lokalisasi Indonesia.',
      icon: Database,
      category: 'DevOps & Backend',
      path: '/tools/mock-data-generator',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'chmod-calculator',
      title: 'Chmod & Linux Permissions Calculator',
      description:
        language === 'en'
          ? 'Visual Linux file permissions calculator for octal (755, 644, 600) and symbolic (rwxr-xr-x) with SUID/SGID/Sticky bits and security warnings.'
          : 'Kalkulator izin berkas Linux interaktif untuk notasi oktal (755, 644, 600), simbolik rwxr-xr-x, bit khusus SUID/SGID/Sticky, dan analisis keamanan.',
      icon: Shield,
      category: 'DevOps & Backend',
      path: '/tools/chmod-calculator',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'meta-tag-generator',
      title: 'Meta Tag & Open Graph Social Previewer',
      description:
        language === 'en'
          ? 'Generate essential SEO meta tags, OpenGraph cards, and Twitter Cards with real-time visual simulation on Google, X, and Facebook.'
          : 'Buat tag meta SEO, kartu media sosial OpenGraph, dan Twitter Card lengkap dengan simulasi visual langsung di Google, X/Twitter, dan Facebook.',
      icon: Share2,
      category: 'Frontend & UI',
      path: '/tools/meta-tag-generator',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
    },
    {
      id: 'qr-generator',
      title: 'High-Resolution QR Code Studio',
      description:
        language === 'en'
          ? 'Generate print-ready, high-resolution QR codes in PNG, JPEG & SVG for URLs, Wi-Fi networks, vCards, with custom palette styling and center logos.'
          : 'Buat kode QR resolusi tinggi siap cetak format PNG, JPEG & SVG untuk URL, jaringan Wi-Fi, kontak vCard, dengan palet warna kustom dan sematan logo.',
      icon: QrCode,
      category: 'Developer Utility',
      path: '/tools/qr-generator',
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
      id: 'url-encoder-decoder',
      title: 'URL Encoder & Decoder Studio',
      description:
        language === 'en'
          ? 'Encode and decode URLs, query strings, and parameter components with RFC 3986 support, query inspector, and instant copy.'
          : 'Enkoder & dekoder URL, query string, dan parameter komponen dengan standar RFC 3986, inspektur URL, serta salin instan.',
      icon: Link2,
      category: 'HTTP & Web Utilities',
      path: '/tools/url-encoder-decoder',
      status: 'active',
      badge: language === 'en' ? 'New Tool' : 'Tool Baru',
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set(toolsList.map(t => t.category)));
    return ['all', ...rawCategories];
  }, [toolsList]);

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return toolsList.filter(tool => {
      const matchCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!matchCategory) return false;
      if (!query) return true;

      return (
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.id.toLowerCase().includes(query) ||
        tool.badge.toLowerCase().includes(query)
      );
    });
  }, [toolsList, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
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

      {/* Search Bar & Category Filter Controls */}
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* Search Input Box */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 dark:text-zinc-500 group-focus-within:text-rose-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            id="tools-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Search utilities by name or keyword... (e.g. URL, QR, Regex, Chmod, JWT)'
                : 'Cari tool berdasarkan nama atau kata kunci... (misal: URL, QR, Regex, Chmod, JWT)'
            }
            className="w-full pl-10 pr-20 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-sm text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-xs transition-all"
          />

          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-mono text-stone-400 dark:text-zinc-500 bg-stone-100 dark:bg-zinc-800 rounded-md border border-stone-200/50 dark:border-zinc-700/50">
              {filteredTools.length}/{toolsList.length}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            const label =
              cat === 'all'
                ? language === 'en'
                  ? 'All Utilities'
                  : 'Semua Tool'
                : cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs font-semibold'
                    : 'bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700/80 hover:text-stone-900 dark:hover:text-zinc-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid or Empty State */}
      {filteredTools.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl border border-dashed border-stone-300 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <Search size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'No matching utilities found' : 'Tidak ada tool yang cocok'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-sm mx-auto">
              {language === 'en'
                ? `No tools matched "${searchQuery}". Try searching with different keywords or reset your filters.`
                : `Tidak ada perkakas yang sesuai dengan "${searchQuery}". Coba kata kunci lain atau reset filter.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
          >
            <X size={14} />
            <span>{language === 'en' ? 'Reset Filters' : 'Reset Filter'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {filteredTools.map(tool => {
            const Icon = tool.icon;
            const isComingSoon = tool.status === 'coming_soon';

            return (
              <Link
                to={tool.path}
                key={tool.id}
                className={`group p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border transition-all duration-200 flex flex-col justify-between ${
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
      )}
    </div>
  );
};
