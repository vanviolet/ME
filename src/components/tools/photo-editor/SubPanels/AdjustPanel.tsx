import React from 'react';
import {
  Sliders,
  Sun,
  Contrast,
  Palette,
  Thermometer,
  Eye,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { ImageAdjustments } from '../types';

interface AdjustPanelProps {
  adjustments: ImageAdjustments;
  onChangeAdjustment: (key: keyof ImageAdjustments, value: number) => void;
  onResetAll: () => void;
  onClose?: () => void;
}

export const AdjustPanel: React.FC<AdjustPanelProps> = ({
  adjustments,
  onChangeAdjustment,
  onResetAll,
  onClose,
}) => {
  const sliders: Array<{
    key: keyof ImageAdjustments;
    label: string;
    icon: React.ReactNode;
    min: number;
    max: number;
    step: number;
    unit: string;
  }> = [
    { key: 'brightness', label: 'Brightness', icon: <Sun size={14} className="text-amber-400" />, min: -100, max: 100, step: 1, unit: '' },
    { key: 'contrast', label: 'Contrast', icon: <Contrast size={14} className="text-purple-400" />, min: -100, max: 100, step: 1, unit: '' },
    { key: 'saturation', label: 'Saturation', icon: <Palette size={14} className="text-rose-400" />, min: -100, max: 100, step: 1, unit: '' },
    { key: 'temperature', label: 'Warmth / Temperature', icon: <Thermometer size={14} className="text-orange-400" />, min: -100, max: 100, step: 1, unit: '' },
    { key: 'exposure', label: 'Exposure', icon: <Sun size={14} className="text-yellow-400" />, min: -100, max: 100, step: 1, unit: '' },
    { key: 'blur', label: 'Blur Softness', icon: <Eye size={14} className="text-blue-400" />, min: 0, max: 100, step: 1, unit: 'px' },
    { key: 'hueRotate', label: 'Hue Color Shift', icon: <Palette size={14} className="text-emerald-400" />, min: -180, max: 180, step: 1, unit: '°' },
    { key: 'sepia', label: 'Sepia Vintage', icon: <Sparkles size={14} className="text-amber-500" />, min: 0, max: 100, step: 1, unit: '%' },
    { key: 'grayscale', label: 'Grayscale B&W', icon: <Contrast size={14} className="text-zinc-400" />, min: 0, max: 100, step: 1, unit: '%' },
    { key: 'invert', label: 'Film Invert', icon: <Sparkles size={14} className="text-fuchsia-400" />, min: 0, max: 100, step: 1, unit: '%' },
  ];

  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Image Adjustments</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetAll}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
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

      <div className="p-4 space-y-4">
        {sliders.map((s) => {
          const val = adjustments[s.key] ?? 0;
          return (
            <div key={s.key} className="space-y-1.5 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                  {s.icon}
                  <span>{s.label}</span>
                </span>
                <span className="font-mono text-purple-400 font-bold text-[11px]">
                  {val > 0 && s.min < 0 ? `+${val}` : val}
                  {s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => onChangeAdjustment(s.key, parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
