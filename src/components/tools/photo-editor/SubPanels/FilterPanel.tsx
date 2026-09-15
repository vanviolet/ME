import React from 'react';
import { Sparkles, RotateCcw, X } from 'lucide-react';
import { FILTER_PRESETS } from '../fabricUtils';
import { FilterPreset } from '../types';

interface FilterPanelProps {
  activeFilterId: string;
  onApplyFilter: (preset: FilterPreset) => void;
  onResetFilter: () => void;
  onClose?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  activeFilterId,
  onApplyFilter,
  onResetFilter,
  onClose,
}) => {
  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Photo Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterId !== 'normal' && (
            <button
              onClick={onResetFilter}
              className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
          Preset Looks
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {FILTER_PRESETS.map((preset) => {
            const isSelected = activeFilterId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onApplyFilter(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all group ${
                  isSelected
                    ? 'border-purple-500 bg-purple-600/20 ring-1 ring-purple-500 shadow-md'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-800/50'
                }`}
              >
                <div
                  className={`w-full h-12 rounded-lg bg-gradient-to-tr ${preset.gradient} mb-2 shadow-inner group-hover:scale-[1.02] transition-transform`}
                />
                <div className="text-xs font-bold text-zinc-100 group-hover:text-purple-300 truncate">
                  {preset.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {preset.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
