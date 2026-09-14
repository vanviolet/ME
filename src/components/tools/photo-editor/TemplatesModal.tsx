import React from 'react';
import { X, Sparkles, LayoutTemplate, ArrowRight } from 'lucide-react';
import { SAMPLE_TEMPLATES } from './templateData';
import { PhotoTemplate } from './types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PhotoTemplate) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <LayoutTemplate size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-100 font-sans">
                Studio Templates & Starters
              </h2>
              <p className="text-xs text-zinc-400">
                Pick a template to instantly start editing with pre-arranged typography & effects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl);
                onClose();
              }}
              className="group p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/70 hover:bg-zinc-800/40 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <img
                  src={tmpl.thumbnail}
                  alt={tmpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-200 border border-white/10">
                  {tmpl.aspectRatio}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 block font-semibold">
                    {tmpl.category}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-300 transition-colors">
                    {tmpl.name}
                  </h3>
                </div>

                <div className="w-8 h-8 rounded-xl bg-zinc-800 group-hover:bg-purple-600 group-hover:text-white text-zinc-400 flex items-center justify-center transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
