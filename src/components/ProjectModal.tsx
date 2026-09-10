import React, { useEffect } from 'react';
import { Project } from '../types';
import { usePortfolio } from '../context/PortfolioContext';
import { X, ExternalLink, Github, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { getAiTagStyle } from './Projects';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { language, t, tArr } = usePortfolio();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const highlights = tArr(project.highlights);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 text-stone-900 dark:text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header & Close */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-500 font-semibold">
                {project.category}
              </span>
              <span className="text-xs font-mono text-stone-400">·</span>
              <span className="text-xs font-mono text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                <Calendar size={12} />
                <span>{project.year}</span>
              </span>

              {project.isMostUsed && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  ⭐ {language === 'en' ? 'Most Widely Used' : 'Paling Banyak Digunakan'}
                </span>
              )}

              {project.isHobby && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  🎸 {language === 'en' ? 'Hobby Project: Solving Music Learning' : 'Karya Hobi: Solusi Belajar Musik'}
                </span>
              )}
            </div>

            {/* AI Model Badges in Header */}
            {project.aiModels && project.aiModels.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {project.aiModels.map(model => (
                  <span
                    key={model}
                    className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getAiTagStyle(model)}`}
                  >
                    {model === 'Tanpa AI' ? (
                      <span>{language === 'en' ? 'Handcrafted (Built Without AI)' : 'Rekayasa Mandiri (Tanpa AI)'}</span>
                    ) : (
                      <>
                        <Sparkles size={11} className="shrink-0" />
                        <span>{model}</span>
                      </>
                    )}
                  </span>
                ))}
              </div>
            )}

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight pt-1">
              {project.title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-zinc-400 font-medium">
              {t(project.subtitle)}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-lg border border-stone-200 dark:border-zinc-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Row if available */}
        {project.stats && project.stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/70 dark:bg-zinc-950/50 border border-stone-200 dark:border-zinc-800">
            {project.stats.map((st, i) => (
              <div key={i}>
                <div className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                  {st.value}
                </div>
                <div className="text-[11px] font-mono text-stone-500 dark:text-zinc-400">
                  {t(st.label)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Long Narrative Description */}
        <div className="space-y-3 text-stone-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-semibold">
            {language === 'en' ? 'System Overview & Architecture' : 'Ikhtisar Sistem & Arsitektur'}
          </h4>
          <p>{t(project.longDescription)}</p>
        </div>

        {/* Key Engineering Highlights */}
        {highlights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-semibold">
              {language === 'en' ? 'Key Implementation Outcomes' : 'Hasil Implementasi Utama'}
            </h4>
            <div className="space-y-2">
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-600 dark:text-zinc-300">
                  <CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Assisted Development Details */}
        {project.aiModels && project.aiModels.length > 0 && (
          <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700/80 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
              <Sparkles size={13} className="text-rose-500" />
              <span>{language === 'en' ? 'AI Assistance in Development' : 'Model AI Pendukung Pembuatan Aplikasi'}</span>
            </h4>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {project.aiModels.map(model => (
                <span
                  key={model}
                  className={`text-xs font-mono font-medium px-3 py-1 rounded-full border flex items-center gap-1.5 ${getAiTagStyle(model)}`}
                >
                  {model === 'Tanpa AI' ? (
                    <span>{language === 'en' ? 'Built Without AI (Handcrafted Engineering)' : 'Murni Rekayasa Mandiri (Tanpa AI)'}</span>
                  ) : (
                    <>
                      <Sparkles size={12} className="shrink-0" />
                      <span>{model}</span>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack Badges */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-semibold">
            {language === 'en' ? 'Technologies Deployed' : 'Teknologi yang Digunakan'}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map(tName => (
              <span
                key={tName}
                className="px-2.5 py-1 text-xs font-mono rounded-md bg-stone-200/70 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border border-stone-300/60 dark:border-zinc-700/60"
              >
                {tName}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-4 border-t border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <span>{language === 'en' ? 'Launch Live Application' : 'Buka Aplikasi Live'}</span>
                <ExternalLink size={14} />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-300 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
              >
                <Github size={14} />
                <span>GitHub</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-stone-600 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-800"
          >
            {language === 'en' ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
