import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { skillGroupsData } from '../data/portfolioData';
import { Terminal, Code, Cpu, Database, Server, PenTool } from 'lucide-react';

export const Skills: React.FC = () => {
  const { language, t } = usePortfolio();

  const categoryIcons: Record<string, React.ReactNode> = {
    'Frontend Engineering': <Code size={16} className="text-rose-500" />,
    'Backend Architecture': <Server size={16} className="text-rose-500" />,
    'Data & Artificial Intelligence': <Database size={16} className="text-rose-500" />,
    'Infrastruktur & DevOps': <Cpu size={16} className="text-rose-500" />,
    'Infrastructure & DevOps': <Cpu size={16} className="text-rose-500" />,
    'Programming Languages': <Terminal size={16} className="text-rose-500" />,
    'Bahasa Pemrograman': <Terminal size={16} className="text-rose-500" />,
    'Design & Developer Tooling': <PenTool size={16} className="text-rose-500" />,
    'Desain & Tool Pengembang': <PenTool size={16} className="text-rose-500" />,
  };

  return (
    <section
      id="skills"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
            {language === 'en' ? '04 / Technical Depth' : '04 / Keahlian Teknis'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Skills & Technologies.' : 'Keahlian & Teknologi.'}
          </h2>
        </div>
        <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md">
          {language === 'en'
            ? 'A clean inventory of tools, languages, and runtime environments proven across real production systems.'
            : 'Daftar perangkat, bahasa pemrograman, dan infrastruktur yang teruji di lingkungan produksi nyata.'}
        </p>
      </div>

      {/* Infrastructure Spotlight: Kubernetes */}
      <div className="mb-12 p-6 sm:p-8 rounded-2xl border border-sky-500/30 dark:border-sky-500/20 bg-sky-500/5 dark:bg-sky-950/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-mono font-semibold border border-sky-500/20">
              <Cpu size={14} />
              <span>{language === 'en' ? 'Infrastructure Spotlight: Kubernetes (K8s)' : 'Sorotan Infrastruktur: Kubernetes (K8s)'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'High-Availability Cluster Orchestration' : 'Orkestrasi Klaster Skala Produksi'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">
              {language === 'en'
                ? 'Production systems including the University LMS, Biometric Attendance, and Curriculum platforms are containerized and orchestrated on Kubernetes clusters. Configured with Horizontal Pod Autoscaling (HPA), Ingress controllers, automated health probes, and rolling zero-downtime updates—comfortably absorbing concurrency spikes of 12,000+ simultaneous students during peak exam periods.'
                : 'Sistem produksi kampus seperti LMS universitas, Absensi Biometrik, dan Kurikulum dikontainerisasi dan diorkestrasi di atas klaster Kubernetes. Dilengkapi Horizontal Pod Autoscaling (HPA), Ingress controller, health probe otomatis, dan deployment zero-downtime—mampu menyerap lonjakan 12.000+ mahasiswa saat ujian serentak tanpa lag.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/80 border border-sky-500/20 text-center">
              <div className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-wider">{language === 'en' ? 'Exam Peak' : 'Puncak Ujian'}</div>
              <div className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-0.5">12,000+</div>
              <div className="text-[10px] text-stone-500 dark:text-zinc-400">{language === 'en' ? 'Concurrent Pods' : 'Mahasiswa Serentak'}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/80 border border-sky-500/20 text-center">
              <div className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-wider">{language === 'en' ? 'Reliability' : 'Keandalan'}</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">99.9%</div>
              <div className="text-[10px] text-stone-500 dark:text-zinc-400">{language === 'en' ? 'HPA Zero-Downtime' : 'Uptime Produksi'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Clean Typography Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skillGroupsData.map((group, index) => {
          const catName = t(group.category);
          const icon = categoryIcons[catName] || <Terminal size={16} className="text-rose-500" />;

          return (
            <div
              key={index}
              className="p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 space-y-4"
            >
              {/* Category Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {icon}
                  <h3 className="text-base font-semibold text-stone-900 dark:text-zinc-100">
                    {catName}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  {t(group.description)}
                </p>
              </div>

              {/* Skills Itemized List */}
              <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 space-y-2.5">
                {group.skills.map(sk => (
                  <div key={sk.name} className="group/item flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <span>{sk.name}</span>
                        {sk.highlight && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                        )}
                      </div>
                      {sk.note && (
                        <div className="text-[11px] text-stone-400 dark:text-zinc-500 leading-snug">
                          {sk.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
