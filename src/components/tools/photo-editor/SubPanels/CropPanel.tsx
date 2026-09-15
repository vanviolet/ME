import React from 'react';
import {
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
  Circle,
  Square,
  Sparkles,
  X,
} from 'lucide-react';

interface CropPanelProps {
  onApplyCrop: (aspectRatio?: number, shape?: 'rect' | 'round') => void;
  onRotate: (deg: number) => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onResetCrop: () => void;
  currentAspect?: number;
  onClose?: () => void;
}

const ASPECT_OPTIONS = [
  { label: 'Free Aspect', value: undefined, shape: 'rect' as const },
  { label: '1:1 Square (Instagram)', value: 1, shape: 'rect' as const },
  { label: 'Circle Profile Avatar', value: 1, shape: 'round' as const },
  { label: '4:5 Portrait Feed', value: 4 / 5, shape: 'rect' as const },
  { label: '16:9 Landscape / Banner', value: 16 / 9, shape: 'rect' as const },
  { label: '9:16 Story / TikTok / Reel', value: 9 / 16, shape: 'rect' as const },
  { label: '4:3 Standard Photo', value: 4 / 3, shape: 'rect' as const },
  { label: '3:2 Classic DSLR', value: 3 / 2, shape: 'rect' as const },
];

export const CropPanel: React.FC<CropPanelProps> = ({
  onApplyCrop,
  onRotate,
  onFlipH,
  onFlipV,
  onResetCrop,
  currentAspect,
  onClose,
}) => {
  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crop size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Crop & Transform</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetCrop}
            className="text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors"
          >
            Reset
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

      <div className="p-4 space-y-5">
        {/* ASPECT RATIO PRESETS */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Aspect Ratio & Shapes
          </span>

          <div className="grid grid-cols-1 gap-2">
            {ASPECT_OPTIONS.map((item, idx) => {
              const isSelected =
                (item.value === undefined && currentAspect === undefined) ||
                (item.value !== undefined && currentAspect === item.value);

              return (
                <button
                  key={idx}
                  onClick={() => onApplyCrop(item.value, item.shape)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-600/20 text-white shadow-sm ring-1 ring-purple-500/50'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.shape === 'round' ? (
                      <Circle size={14} className="text-purple-400" />
                    ) : (
                      <Square size={14} className="text-purple-400" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-purple-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROTATE & FLIP CONTROLS */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Rotate & Flip
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRotate(-90)}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Rotate -90°</span>
            </button>
            <button
              onClick={() => onRotate(90)}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCw size={14} />
              <span>Rotate +90°</span>
            </button>
            <button
              onClick={onFlipH}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors"
            >
              <FlipHorizontal size={14} />
              <span>Flip Horizontal</span>
            </button>
            <button
              onClick={onFlipV}
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors"
            >
              <FlipVertical size={14} />
              <span>Flip Vertical</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
