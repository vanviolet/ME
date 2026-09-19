import React from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { profileData } from '../data/portfolioData';
import { CheckCircle2, Terminal, Layers, Cpu, Code2, FileText, ArrowUpRight } from 'lucide-react';

export const About: React.FC = () => {
  const { language, t, tArr } = usePortfolio();
  const paragraphs = tArr(profileData.aboutEditorial);

  const pillars = [
    {
      icon: <Terminal size={18} className="text-rose-500" />,
      title: language === 'en' ? 'Fullstack & Systems' : 'Fullstack & Sistem',
      desc: language === 'en' ? 'End-to-end fluency from database schemas to client state machines.' : 'Kemampuan penuh dari skema database hingga manajemen state aplikasi.',
    },
    {
      icon: <Cpu size={18} className="text-rose-500" />,
      title: language === 'en' ? 'High Concurrency' : 'Konkurensi Tinggi',
      desc: language === 'en' ? 'Architected platforms handling thousands of synchronous academic users.' : 'Merancang platform yang melayani ribuan pengguna akademik serentak.',
    },
    {
      icon: <Layers size={18} className="text-rose-500" />,
      title: language === 'en' ? 'Clean Architecture' : 'Arsitektur Bersih',
      desc: language === 'en' ? 'Modular separation, strict contracts, and future-proof code.' : 'Pemisahan modul, kontrak tipe ketat, dan kode yang mudah diperluas.',
    },
    {
      icon: <Code2 size={18} className="text-rose-500" />,
      title: language === 'en' ? 'Container & Cloud' : 'Kontainer & Cloud',
      desc: language === 'en' ? 'Orchestrating Kubernetes microservices, Docker pipelines, and Redis caching.' : 'Orkestrasi microservices Kubernetes, pipeline Docker, dan caching Redis.',
    },
  ];

  return (
    <section
      id="about"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Heading & Quick Metadata Strip */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
              {language === 'en' ? '01 / Background' : '01 / Latar Belakang'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
              {language === 'en' ? 'A little about me.' : 'Seputar profil saya.'}
            </h2>
          </div>

          {/* Editorial Metadata Block */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 space-y-4 text-xs">
            <div>
              <div className="font-mono text-stone-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                {language === 'en' ? 'Location' : 'Lokasi'}
              </div>
              <div className="font-medium text-stone-800 dark:text-zinc-200 text-sm mt-0.5">
                Indonesia (GMT+7)
              </div>
            </div>

            <div className="h-px bg-stone-100 dark:bg-zinc-800" />

            <div>
              <div className="font-mono text-stone-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                {language === 'en' ? 'Experience' : 'Pengalaman'}
              </div>
              <div className="font-medium text-stone-800 dark:text-zinc-200 text-sm mt-0.5">
                5+ {language === 'en' ? 'Years in Production' : 'Tahun di Skala Produksi'}
              </div>
            </div>

            <div className="h-px bg-stone-100 dark:bg-zinc-800" />

            <div>
              <div className="font-mono text-stone-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                {language === 'en' ? 'Primary Focus' : 'Fokus Utama'}
              </div>
              <div className="font-medium text-stone-800 dark:text-zinc-200 text-sm mt-0.5">
                {language === 'en' ? 'Scalable Web Apps & Enterprise ERP' : 'Aplikasi Web Skalabel & ERP Kampus'}
              </div>
            </div>

            <div className="h-px bg-stone-100 dark:bg-zinc-800" />

            <div>
              <div className="font-mono text-stone-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                {language === 'en' ? 'Core Stack & Infrastructure' : 'Stack Inti & Infrastruktur'}
              </div>
              <div className="font-mono text-stone-800 dark:text-zinc-200 text-xs mt-0.5 leading-relaxed">
                TypeScript · React · NestJS · PostgreSQL · Redis · Docker · Kubernetes
              </div>
            </div>

            <div className="h-px bg-stone-100 dark:bg-zinc-800" />

            <div>
              <div className="font-mono text-stone-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                {language === 'en' ? 'Roles & Timeline' : 'Peran & Linimasa'}
              </div>
              <div className="font-medium text-stone-800 dark:text-zinc-200 text-xs mt-0.5 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">University Fullstack Developer</span>
                    <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
                      2022 — {language === 'en' ? 'Present' : 'Sekarang'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Remote Software Engineer</span>
                    <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
                      2023 — {language === 'en' ? 'Present' : 'Sekarang'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{language === 'en' ? 'Freelance Software Engineer' : 'Freelance Software Engineer'}</span>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {language === 'en' ? 'Bespoke Client Projects · Active' : 'Proyek Perorangan & Klien · Aktif'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-stone-100 dark:bg-zinc-800" />

            {/* Quick CV Download Link */}
            <Link
              id="about-cta-cv"
              to="/cv"
              className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-stone-200 dark:border-zinc-700/80 hover:border-rose-300 dark:hover:border-rose-800 text-stone-800 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 transition-all group"
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">
                  {language === 'en' ? 'View & Download Full CV' : 'Lihat & Unduh CV Lengkap'}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                PDF
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Editorial Text Narrative & Engineering Pillars */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-5 text-stone-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed font-normal">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* 4 Architectural Pillars */}
          <div className="pt-6 border-t border-stone-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200/80 dark:border-zinc-800/80 bg-stone-100/40 dark:bg-zinc-900/30"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-stone-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
