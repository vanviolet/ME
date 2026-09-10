import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { experienceData } from '../data/portfolioData';
import { Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export const Experience: React.FC = () => {
  const { language, t, tArr } = usePortfolio();

  return (
    <section
      id="experience"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
            {language === 'en' ? '02 / Career Record' : '02 / Rekam Jejak'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Work Experience.' : 'Pengalaman Kerja.'}
          </h2>
        </div>
        <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md">
          {language === 'en'
            ? 'Engineering scalable web systems for higher education, remote tech teams, and independent products.'
            : 'Membangun sistem web skala besar untuk institusi universitas, tim tech remote, dan produk mandiri.'}
        </p>
      </div>

      {/* Editorial Timeline List */}
      <div className="space-y-12">
        {experienceData.map((exp, index) => {
          const achievements = tArr(exp.achievements);

          return (
            <div
              key={exp.id}
              className="group relative pt-8 border-t border-stone-200 dark:border-zinc-800/80 transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Timeline Column (Company & Metadata) */}
                <div className="lg:col-span-4 space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400 font-medium">
                    <Calendar size={13} />
                    <span>{exp.period}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-stone-900 dark:text-zinc-100">
                    {exp.company}
                  </h3>

                  <div className="text-sm font-medium text-stone-600 dark:text-zinc-400">
                    {t(exp.role)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-zinc-400 font-mono pt-1">
                    <MapPin size={12} />
                    <span>{t(exp.location)}</span>
                  </div>
                </div>

                {/* Details Column (Narrative & Achievements) */}
                <div className="lg:col-span-8 space-y-5">
                  <p className="text-stone-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                    {t(exp.description)}
                  </p>

                  {/* Bullet achievements */}
                  <div className="space-y-2.5">
                    {achievements.map((item, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
                        <CheckCircle2 size={15} className="text-rose-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Technologies tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {exp.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-stone-100 dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 border border-stone-200/80 dark:border-zinc-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
