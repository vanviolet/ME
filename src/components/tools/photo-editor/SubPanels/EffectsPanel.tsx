import React, { useState } from 'react';
import { Sparkles, Palette, Sun, Contrast, Eye, Layers } from 'lucide-react';

interface EffectsPanelProps {
  onApplyEffect: (effectName: string, params: any) => void;
  onClearEffects: () => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ onApplyEffect, onClearEffects }) => {
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(8);

  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);

  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold italic text-purple-400 text-lg">fx</span>
          <h2 className="text-sm font-bold text-zinc-100">Visual Effects</h2>
        </div>
        <button
          onClick={onClearEffects}
          className="text-xs font-semibold text-zinc-400 hover:text-purple-400 transition-colors"
        >
          Clear
        </button>
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
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-colors"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Shadow Color</span>
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Blur Radius</span>
                <span className="font-mono text-zinc-200">{shadowBlur}px</span>
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

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Offset X</span>
                  <span className="font-mono text-zinc-200">{shadowOffsetX}px</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={shadowOffsetX}
                  onChange={(e) => setShadowOffsetX(parseInt(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1 bg-zinc-800 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Offset Y</span>
                  <span className="font-mono text-zinc-200">{shadowOffsetY}px</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={shadowOffsetY}
                  onChange={(e) => setShadowOffsetY(parseInt(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1 bg-zinc-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OUTLINE / STROKE EFFECT */}
        <div className="space-y-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Layers size={14} className="text-purple-400" />
              <span>Sticker Outline</span>
            </span>
            <button
              onClick={() =>
                onApplyEffect('stroke', {
                  color: strokeColor,
                  width: strokeWidth,
                })
              }
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-colors"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Outline Color</span>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Thickness</span>
                <span className="font-mono text-zinc-200">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* QUICK ONE-CLICK FX STYLES */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Quick Style Presets
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onApplyEffect('neon-cyan', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-400 text-left transition-colors"
            >
              <div className="text-xs font-bold text-cyan-400 mb-0.5">Neon Cyan</div>
              <div className="text-[10px] text-zinc-500">Electric glow</div>
            </button>

            <button
              onClick={() => onApplyEffect('neon-pink', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-pink-500 text-left transition-colors"
            >
              <div className="text-xs font-bold text-pink-400 mb-0.5">Neon Magenta</div>
              <div className="text-[10px] text-zinc-500">Cyber glow</div>
            </button>

            <button
              onClick={() => onApplyEffect('soft-shadow', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-400 text-left transition-colors"
            >
              <div className="text-xs font-bold text-zinc-200 mb-0.5">Soft Elevation</div>
              <div className="text-[10px] text-zinc-500">Modern 3D lift</div>
            </button>

            <button
              onClick={() => onApplyEffect('vignette', {})}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-400 text-left transition-colors"
            >
              <div className="text-xs font-bold text-zinc-200 mb-0.5">Vignette Edge</div>
              <div className="text-[10px] text-zinc-500">Dark cinematic frame</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
