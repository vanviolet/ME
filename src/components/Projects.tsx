import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { projectsData } from '../data/portfolioData';
import { Project } from '../types';
import { InteractiveNoteLogicDemo } from './InteractiveNoteLogicDemo';
import { ProjectModal } from './ProjectModal';
import { ArrowUpRight, ExternalLink, Github, Filter, Sparkles, ChevronRight } from 'lucide-react';

export const Projects: React.FC = () => {
  const { language, t } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);

  const categories = [
    { id: 'all', label: language === 'en' ? 'All Systems (10)' : 'Semua Sistem (10)' },
    { id: 'edtech', label: language === 'en' ? 'EdTech & Creative' : 'EdTech & Kreatif' },
    { id: 'academic', label: language === 'en' ? 'University & Academic' : 'Sistem Kampus' },
    { id: 'enterprise', label: language === 'en' ? 'Enterprise Operations' : 'Operasional Enterprise' },
    { id: 'management', label: language === 'en' ? 'Business & Rentals' : 'Manajemen Bisnis' },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === selectedCategory);

  return (
    <section
      id="projects"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
            {language === 'en' ? '03 / Selected Work' : '03 / Karya Pilihan'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
            {language === 'en' ? 'Crafted with intention.' : 'Karya & Proyek Terpilih.'}
          </h2>
        </div>
        <p className="text-sm font-mono text-stone-500 dark:text-zinc-400 max-w-md">
          {language === 'en'
            ? 'Production systems built to solve high-concurrency academic operations and interactive creative challenges.'
            : 'Sistem skala produksi yang dibangun untuk memecahkan operasional kampus dan aplikasi interaktif.'}
        </p>
      </div>

      {/* Featured NoteLogic Interactive Showcase */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-rose-500" />
          <span className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-semibold">
            {language === 'en' ? 'Flagship Interactive Project' : 'Proyek Interaktif Unggulan'}
          </span>
        </div>
        <InteractiveNoteLogicDemo />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 text-xs font-mono no-scrollbar">
        <span className="text-stone-400 dark:text-zinc-500 flex items-center gap-1 mr-2 shrink-0">
          <Filter size={13} />
          <span>{language === 'en' ? 'Filter:' : 'Filter:'}</span>
        </span>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-stone-900 text-stone-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Editorial Projects Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project, idx) => {
          const numberStr = (idx + 1).toString().padStart(2, '0');

          return (
            <div
              key={project.id}
              onClick={() => setActiveProjectModal(project)}
              className="group cursor-pointer relative p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900/90 transition-all duration-300 hover:border-stone-400 dark:hover:border-zinc-700 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Metadata row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400 dark:text-zinc-500">
                      {numberStr}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                      {project.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-stone-400 dark:text-zinc-500">
                    {project.year}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center justify-between">
                    <span>{project.title}</span>
                    <ArrowUpRight
                      size={16}
                      className="text-stone-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </h3>
                  <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 mt-1">
                    {t(project.subtitle)}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                  {t(project.description)}
                </p>
              </div>

              {/* Technologies strip & View Details footer */}
              <div className="pt-5 mt-4 border-t border-stone-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 3).map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] font-mono rounded bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono text-stone-400">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:underline">
                  <span>{language === 'en' ? 'Details' : 'Lihat'}</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      <ProjectModal
        project={activeProjectModal}
        onClose={() => setActiveProjectModal(null)}
      />
    </section>
  );
};
