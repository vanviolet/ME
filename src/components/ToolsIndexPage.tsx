import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Seo } from './Seo';
import {
  Wrench,
  Type,
  Code2,
  Binary,
  Palette,
  ArrowRight,
  Sparkles,
  FileCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ToolsIndexPage: React.FC = () => {
  const { language } = usePortfolio();

  const toolsList = [
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
      id: 'json-formatter',
      title: 'JSON Formatter & Validator',
      description:
        language === 'en'
          ? 'Format, minify, validate, and convert JSON structures with syntax highlighting.'
          : 'Format, minifikasi, validasi, dan konversi struktur data JSON dengan penyorot sintaks.',
      icon: Code2,
      category: 'Developer Utility',
      path: '#',
      status: 'coming_soon',
      badge: language === 'en' ? 'Coming Soon' : 'Segera Hadir',
    },
    {
      id: 'base64-converter',
      title: 'Base64 Encoder & Decoder',
      description:
        language === 'en'
          ? 'Encode text and images to Base64 strings or decode back safely.'
          : 'Enkripsi teks dan gambar ke string Base64 atau dekode kembali secara instan.',
      icon: Binary,
      category: 'Security & Web',
      path: '#',
      status: 'coming_soon',
      badge: language === 'en' ? 'Coming Soon' : 'Segera Hadir',
    },
    {
      id: 'css-gradient',
      title: 'CSS Gradient Generator',
      description:
        language === 'en'
          ? 'Design beautiful CSS mesh and linear gradients with direct Tailwind CSS code output.'
          : 'Desain gradien warna CSS dan dapatkan kode utility Tailwind CSS langsung.',
      icon: Palette,
      category: 'UI & Design',
      path: '#',
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
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
          const isActive = tool.status === 'active';

          return (
            <div
              key={tool.id}
              className={`group p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-white dark:bg-zinc-900/90 border-stone-200 dark:border-zinc-800 hover:border-rose-500/50 hover:shadow-lg'
                  : 'bg-stone-50/70 dark:bg-zinc-950/40 border-stone-200/60 dark:border-zinc-800/60 opacity-80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
                    <Icon size={24} />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-stone-200/70 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-300/50 dark:border-zinc-700/50'
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                    {tool.category}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-stone-100 dark:border-zinc-800/80">
                {isActive ? (
                  <Link
                    to={tool.path}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform"
                  >
                    <span>{language === 'en' ? 'Open Tool' : 'Buka Tool'}</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span className="text-xs font-medium text-stone-400 dark:text-zinc-600 cursor-not-allowed">
                    {language === 'en' ? 'In Development' : 'Dalam Pengembangan'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
