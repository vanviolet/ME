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
} from 'lucide-react';

interface CropPanelProps {
  onApplyCrop: (aspectRatio?: number, shape?: 'rect' | 'round') => void;
  onRotate: (deg: number) => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onResetCrop: () => void;
  currentAspect?: number;
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
}) => {
  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crop size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Crop & Transform</h2>
        </div>
        <button
          onClick={onResetCrop}
          className="text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* ASPECT RATIO PRESETS */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Aspect Ratio & Shapes
          </span>

          <div className="grid grid-cols-1 gap-2">
            {ASPECT_OPTIONS.map((item, idx) => {
              const isActive = currentAspect === item.value;
              return (
                <button
                  key={idx}
                  onClick={() => onApplyCrop(item.value, item.shape)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-purple-500 bg-purple-600/20 text-white shadow-xs ring-1 ring-purple-500'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.shape === 'round' ? (
                    <Circle size={14} className="text-purple-400 shrink-0" />
                  ) : (
                    <Square size={14} className="opacity-50 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROTATE & FLIP */}
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Rotate & Flip
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRotate(-90)}
              className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Rotate -90°</span>
            </button>

            <button
              onClick={() => onRotate(90)}
              className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCw size={14} />
              <span>Rotate +90°</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onFlipH}
              className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FlipHorizontal size={14} />
              <span>Flip Horizontal</span>
            </button>

            <button
              onClick={onFlipV}
              className="py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
