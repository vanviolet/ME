import React, { useState } from 'react';
import { Wand2, Sparkles, Check, RefreshCw, Palette, Layers } from 'lucide-react';

interface BgRemovalPanelProps {
  onRemoveBackground: (tolerance: number, keyColorHex: string) => Promise<void>;
  onSetBackgroundColor: (color: string) => void;
  onSetTransparentBackground: () => void;
  isProcessing: boolean;
}

const BG_COLOR_PRESETS = [
  'transparent',
  '#09090b',
  '#ffffff',
  '#f43f5e',
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#18181b',
  '#27272a',
];

export const BgRemovalPanel: React.FC<BgRemovalPanelProps> = ({
  onRemoveBackground,
  onSetBackgroundColor,
  onSetTransparentBackground,
  isProcessing,
}) => {
  const [tolerance, setTolerance] = useState(35);
  const [keyColor, setKeyColor] = useState('#ffffff');
  const [activeBg, setActiveBg] = useState('transparent');

  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Background Removal</h2>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* MAGIC BACKGROUND ERASER */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-inner">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-400" />
              <span>Chroma / Cutout Eraser</span>
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Instantly removes solid, studio, white, or green screen backgrounds with edge feathering.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Target Color to Erase</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={keyColor}
                  onChange={(e) => setKeyColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[11px] text-zinc-400">{keyColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Color Sensitivity / Tolerance</span>
                <span className="font-mono text-purple-400 font-bold">{tolerance}</span>
              </div>
              <input
                type="range"
                min={5}
                max={90}
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            <button
              onClick={() => onRemoveBackground(tolerance, keyColor)}
              disabled={isProcessing}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Processing Cutout...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  <span>Remove Background</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* REPLACE BACKGROUND COLOR */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
              Canvas Background
            </span>
            <button
              onClick={() => {
                setActiveBg('transparent');
                onSetTransparentBackground();
              }}
              className="text-[11px] font-semibold text-zinc-400 hover:text-white"
            >
              Transparent
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BG_COLOR_PRESETS.map((color) => {
              const isSelected = activeBg === color;
              const isTransparent = color === 'transparent';
              return (
                <button
                  key={color}
                  onClick={() => {
                    setActiveBg(color);
                    if (isTransparent) onSetTransparentBackground();
                    else onSetBackgroundColor(color);
                  }}
                  className={`h-10 rounded-xl border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105 shadow-md'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                  style={{
                    backgroundColor: isTransparent ? undefined : color,
                    backgroundImage: isTransparent
                      ? 'radial-gradient(#4b5563 1px, transparent 1px)'
                      : undefined,
                    backgroundSize: isTransparent ? '6px 6px' : undefined,
                  }}
                  title={color}
                >
                  {isSelected && (
                    <Check
                      size={14}
                      className={
                        color === '#ffffff' || color === 'transparent'
                          ? 'text-zinc-900'
                          : 'text-white'
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
