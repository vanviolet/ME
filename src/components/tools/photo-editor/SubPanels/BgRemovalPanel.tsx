import React, { useState } from 'react';
import { Wand2, Sparkles, Check, RefreshCw, Sliders, Zap, X } from 'lucide-react';

interface BgRemovalPanelProps {
  onAutoRemoveAI: () => Promise<void>;
  onRemoveBackground: (tolerance: number, keyColorHex: string) => Promise<void>;
  onSetBackgroundColor: (color: string) => void;
  onSetTransparentBackground: () => void;
  isProcessing: boolean;
  statusMessage?: string;
  onClose?: () => void;
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
  '#e2e8f0',
  '#fef08a',
  '#a7f3d0',
  '#fed7aa',
];

export const BgRemovalPanel: React.FC<BgRemovalPanelProps> = ({
  onAutoRemoveAI,
  onRemoveBackground,
  onSetBackgroundColor,
  onSetTransparentBackground,
  isProcessing,
  statusMessage,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>('ai');
  const [tolerance, setTolerance] = useState(35);
  const [keyColor, setKeyColor] = useState('#ffffff');
  const [activeBg, setActiveBg] = useState('transparent');

  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Background Remover</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            remove.bg AI
          </span>
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
        {/* MODE TABS */}
        <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('ai')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'ai'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap size={13} className={activeMode === 'ai' ? 'text-amber-300' : ''} />
            <span>Auto AI</span>
          </button>
          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'manual'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders size={13} />
            <span>Chroma / Key</span>
          </button>
        </div>

        {/* 1. AUTO AI REMOVE (remove.bg style) */}
        {activeMode === 'ai' && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-purple-900/40 space-y-3.5 shadow-inner">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" />
                <span>1-Click AI Subject Extraction</span>
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Automatically detects people, portraits, pets, fashion, and objects. Eliminates complex backgrounds with clean hair & edge matting.
              </p>
            </div>

            {isProcessing && (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-purple-200">
                  <RefreshCw size={13} className="animate-spin text-purple-400" />
                  <span>{statusMessage || 'Analyzing image subject...'}</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-full animate-pulse rounded-full" />
                </div>
              </div>
            )}

            <button
              onClick={onAutoRemoveAI}
              disabled={isProcessing}
              className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Removing Background...</span>
                </>
              ) : (
                <>
                  <Wand2 size={15} className="text-purple-200" />
                  <span>Auto Remove Background (AI)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 2. MANUAL CHROMA / COLOR ERASER */}
        {activeMode === 'manual' && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-inner">
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <Sliders size={14} className="text-purple-400" />
                <span>Color Key / Chroma Tolerance</span>
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Select a specific backdrop color to erase with feathering adjustment.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Color to Erase</span>
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
                  <span>Sensitivity / Tolerance</span>
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
                    <span>Processing Chroma...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    <span>Erase Color Backdrop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* REPLACE BACKGROUND COLOR / STUDIO BACKDROP */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
              Backdrop Color
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
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105 shadow-md'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                  style={{
                    backgroundColor: isTransparent ? undefined : color,
                    backgroundImage: isTransparent
                      ? 'radial-gradient(#6b7280 1px, transparent 1px)'
                      : undefined,
                    backgroundSize: isTransparent ? '5px 5px' : undefined,
                  }}
                  title={color}
                >
                  {isSelected && (
                    <Check
                      size={14}
                      className={
                        color === '#ffffff' || color === '#fef08a' || color === '#a7f3d0' || color === '#e2e8f0' || color === 'transparent'
                          ? 'text-zinc-950 font-bold'
                          : 'text-white font-bold'
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
