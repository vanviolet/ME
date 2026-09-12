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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-xs font-semibold border border-stone-200 dark:border-zinc-700">
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

          return (
            <Link
              to={tool.path}
              key={tool.id}
              className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 flex items-center justify-center border border-stone-200 dark:border-zinc-700 group-hover:bg-stone-900 group-hover:text-stone-50 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700">
                    {tool.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-zinc-500 block">
                    {tool.category}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100 group-hover:text-stone-950 dark:group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-semibold text-stone-900 dark:text-zinc-100 group-hover:translate-x-1 transition-transform">
                <span>{language === 'en' ? 'Open Tool' : 'Buka Tool'}</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
