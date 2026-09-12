import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Brain,
  Sparkles,
  Code2,
  Check,
  ChevronDown,
  Cpu,
} from 'lucide-react';
import { AI_MODELS_LIST, AiModelConfig, getCleanModelName } from '../lib/models';

interface AiModelSelectProps {
  value: string;
  onChange: (modelId: string) => void;
  label?: string;
  className?: string;
  direction?: 'down' | 'up';
}

export const AiModelSelect: React.FC<AiModelSelectProps> = ({
  value,
  onChange,
  label,
  className = '',
  direction = 'down',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active model
  const activeModel =
    AI_MODELS_LIST.find((m) => m.id === value) ||
    AI_MODELS_LIST.find((m) => m.name.toLowerCase() === value.toLowerCase()) ||
    AI_MODELS_LIST[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (category: string) => {
    switch (category) {
      case 'ultra':
        return <Zap className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'reasoning':
        return <Brain className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'fast':
      default:
        return <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'ultra':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'reasoning':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'code':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'fast':
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 hover:border-stone-400 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-stone-400/20 transition-all text-left shadow-xs cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shrink-0">
            {getModelIcon(activeModel.category)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate text-stone-900 dark:text-zinc-100">
                {activeModel.name}
              </span>
              {activeModel.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-block ${getBadgeStyle(
                    activeModel.category
                  )}`}
                >
                  {activeModel.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-stone-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'down' ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'down' ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 w-full min-w-[280px] p-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl ${
              direction === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'
            }`}
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800/80 mb-1.5 flex items-center justify-between">
              <span>Pilihan Model AI Engine</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Cpu className="w-3 h-3" /> Zero Setup
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {AI_MODELS_LIST.map((model: AiModelConfig) => {
                const isSelected = model.id === activeModel.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-100 dark:bg-zinc-800 font-semibold text-stone-900 dark:text-zinc-100'
                        : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1 rounded-md bg-stone-100 dark:bg-zinc-800 shrink-0">
                        {getModelIcon(model.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm truncate">{model.name}</span>
                          {model.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${getBadgeStyle(
                                model.category
                              )}`}
                            >
                              {model.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
