import React, { useState } from 'react';
import { Sparkles, Palette, Sun, Contrast, Eye, Layers, X } from 'lucide-react';

interface EffectsPanelProps {
  onApplyEffect: (effectName: string, params: any) => void;
  onClearEffects: () => void;
  onClose?: () => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  onApplyEffect,
  onClearEffects,
  onClose,
}) => {
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(8);

  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);

  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold italic text-purple-400 text-lg">fx</span>
          <h2 className="text-sm font-bold text-zinc-100">Visual Effects</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearEffects}
            className="text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors"
          >
            Clear
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
        {/* SHADOW & GLOW EFFECT */}
        <div className="space-y-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-400" />
              <span>Shadow & Glow</span>
            </span>
            <button
              onClick={() =>
                onApplyEffect('shadow', {
                  color: shadowColor,
                  blur: shadowBlur,
                  offsetX: shadowOffsetX,
                  offsetY: shadowOffsetY,
                })
              }
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-sm"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Shadow Color</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={shadowColor}
                  onChange={(e) => setShadowColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-zinc-300">{shadowColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Blur Radius</span>
                <span className="font-mono text-purple-400">{shadowBlur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={shadowBlur}
                onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Offset Y</span>
                <span className="font-mono text-purple-400">{shadowOffsetY}px</span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                value={shadowOffsetY}
                onChange={(e) => setShadowOffsetY(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* OUTLINE / STROKE EFFECT */}
        <div className="space-y-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Layers size={14} className="text-purple-400" />
              <span>Outline / Stroke</span>
            </span>
            <button
              onClick={() =>
                onApplyEffect('stroke', {
                  color: strokeColor,
                  width: strokeWidth,
                })
              }
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-sm"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Stroke Color</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-[10px] text-zinc-300">{strokeColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Stroke Width</span>
                <span className="font-mono text-purple-400">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 1-CLICK STUDIO EFFECT PRESETS */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Instant Studio FX
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onApplyEffect('neon-cyan', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-xs font-semibold text-zinc-200 text-left transition-all group"
            >
              <div className="w-full h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 mb-1.5 flex items-center justify-center text-cyan-300 font-bold text-[11px] shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                NEON GLOW
              </div>
              <span className="group-hover:text-cyan-400">Cyber Cyan</span>
            </button>

            <button
              onClick={() => onApplyEffect('neon-pink', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-pink-500/50 hover:bg-pink-950/20 text-xs font-semibold text-zinc-200 text-left transition-all group"
            >
              <div className="w-full h-8 rounded-lg bg-pink-500/20 border border-pink-400/40 mb-1.5 flex items-center justify-center text-pink-300 font-bold text-[11px] shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                NEON PINK
              </div>
              <span className="group-hover:text-pink-400">Vapor Pink</span>
            </button>

            <button
              onClick={() => onApplyEffect('soft-shadow', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/40 text-xs font-semibold text-zinc-200 text-left transition-all"
            >
              <div className="w-full h-8 rounded-lg bg-zinc-800 shadow-xl mb-1.5 flex items-center justify-center text-zinc-300 text-[11px]">
                ELEVATION
              </div>
              <span>Soft Drop Shadow</span>
            </button>

            <button
              onClick={() => onApplyEffect('vignette', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/40 text-xs font-semibold text-zinc-200 text-left transition-all"
            >
              <div className="w-full h-8 rounded-lg bg-gradient-to-r from-black via-zinc-800 to-black mb-1.5 flex items-center justify-center text-zinc-300 text-[11px]">
                VIGNETTE
              </div>
              <span>Cinematic Edge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
