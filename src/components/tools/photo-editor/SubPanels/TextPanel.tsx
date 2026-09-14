import React from 'react';
import {
  Type,
  Plus,
  X,
  Underline,
  Strikethrough,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  List,
  ListOrdered,
  Sparkles,
  MoveHorizontal,
} from 'lucide-react';
import { TextPreset } from '../types';

interface TextPanelProps {
  onAddHeading: () => void;
  onAddSubheading: () => void;
  onAddBodyText: () => void;
  onApplyPreset: (preset: TextPreset) => void;
  // Selected Text Advanced Props (from screenshot)
  hasSelection: boolean;
  letterCase: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number;
  listStyle: 'none' | 'disc' | 'decimal';
  underline: boolean;
  linethrough: boolean;
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight: number;
  paragraphSpacing: number;
  frameBehavior: 'auto' | 'fixed';
  clipping: boolean;
  onUpdateProp: (prop: string, value: any) => void;
  onClose?: () => void;
}

const TYPOGRAPHY_PRESETS: TextPreset[] = [
  {
    id: 'fashion-bold',
    title: 'Fashion Bold Editorial',
    preview: 'FASHION',
    fontFamily: "'Archivo', sans-serif",
    fontSize: 72,
    fontWeight: '900',
    fontStyle: 'italic',
    fill: '#ffffff',
    letterSpacing: 100,
    lineHeight: 1,
    shadow: { color: 'rgba(0,0,0,0.5)', blur: 15, offsetX: 0, offsetY: 4 },
  },
  {
    id: 'neon-glow',
    title: 'Neon Cyber Glow',
    preview: 'CYBERPUNK',
    fontFamily: "'Syne', sans-serif",
    fontSize: 56,
    fontWeight: '800',
    fontStyle: 'normal',
    fill: '#00ffff',
    letterSpacing: 80,
    lineHeight: 1.1,
    shadow: { color: '#00ffff', blur: 25, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'classic-serif',
    title: 'Luxury Monogram',
    preview: 'VOGUE',
    fontFamily: "'Playfair Display', serif",
    fontSize: 64,
    fontWeight: '700',
    fontStyle: 'italic',
    fill: '#fef08a',
    letterSpacing: 140,
    lineHeight: 1,
  },
  {
    id: 'bebas-stamp',
    title: 'Bold Street Stamp',
    preview: 'LIMITED EDITION',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 48,
    fontWeight: '700',
    fontStyle: 'normal',
    fill: '#ef4444',
    letterSpacing: 90,
    lineHeight: 1,
  },
  {
    id: 'aesthetic-script',
    title: 'Aesthetic Handwriting',
    preview: 'Golden hour memories',
    fontFamily: "'Caveat', cursive",
    fontSize: 42,
    fontWeight: '700',
    fontStyle: 'normal',
    fill: '#ffffff',
    letterSpacing: 0,
    lineHeight: 1.2,
  },
  {
    id: 'tech-mono',
    title: 'Terminal Code',
    preview: 'SYSTEM_ONLINE_2026',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 32,
    fontWeight: '600',
    fontStyle: 'normal',
    fill: '#4ade80',
    letterSpacing: 40,
    lineHeight: 1.2,
  },
];

export const TextPanel: React.FC<TextPanelProps> = ({
  onAddHeading,
  onAddSubheading,
  onAddBodyText,
  onApplyPreset,
  hasSelection,
  letterCase,
  letterSpacing,
  listStyle,
  underline,
  linethrough,
  verticalAlign,
  lineHeight,
  paragraphSpacing,
  frameBehavior,
  clipping,
  onUpdateProp,
  onClose,
}) => {
  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      {/* HEADER MATCHING SCREENSHOT "Advanced" / Text Studio */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">
            {hasSelection ? 'Advanced Typography' : 'Add Text & Typography'}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* ADD STANDARD TEXT ELEMENTS */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Add Text
          </span>
          <div className="space-y-2">
            <button
              onClick={onAddHeading}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/80 text-left flex items-center justify-between group transition-all"
            >
              <span className="text-base font-extrabold text-white group-hover:text-purple-300 font-sans">
                Add a heading
              </span>
              <Plus size={16} className="text-zinc-400 group-hover:text-white" />
            </button>

            <button
              onClick={onAddSubheading}
              className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/80 text-left flex items-center justify-between group transition-all"
            >
              <span className="text-sm font-semibold text-zinc-200 group-hover:text-purple-300">
                Add a subheading
              </span>
              <Plus size={15} className="text-zinc-400 group-hover:text-white" />
            </button>

            <button
              onClick={onAddBodyText}
              className="w-full py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/80 text-left flex items-center justify-between group transition-all"
            >
              <span className="text-xs text-zinc-300 group-hover:text-purple-300">
                Add a little bit of body text
              </span>
              <Plus size={14} className="text-zinc-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* ADVANCED PROPERTIES (EXACT REPLICA OF THE SCREENSHOT SUB-PANEL) */}
        {hasSelection && (
          <div className="space-y-4 pt-4 border-t border-zinc-800 animate-in fade-in">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
              Advanced Controls
            </span>

            {/* Letter Case: - AG ag Ag */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Letter Case</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('textCase', 'none')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    letterCase === 'none' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Normal"
                >
                  −
                </button>
                <button
                  onClick={() => onUpdateProp('textCase', 'uppercase')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    letterCase === 'uppercase' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="UPPERCASE"
                >
                  AG
                </button>
                <button
                  onClick={() => onUpdateProp('textCase', 'lowercase')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    letterCase === 'lowercase' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="lowercase"
                >
                  ag
                </button>
                <button
                  onClick={() => onUpdateProp('textCase', 'capitalize')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    letterCase === 'capitalize' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Capitalize"
                >
                  Ag
                </button>
              </div>
            </div>

            {/* Letter Spacing: - 0 + */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Letter Spacing</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('charSpacing', Math.max(-50, letterSpacing - 20))}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-sm font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center font-mono text-xs font-bold text-zinc-100">
                  {letterSpacing}
                </span>
                <button
                  onClick={() => onUpdateProp('charSpacing', letterSpacing + 20)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* List Style */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">List Style</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('listStyle', 'none')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    listStyle === 'none' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  −
                </button>
                <button
                  onClick={() => onUpdateProp('listStyle', 'disc')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    listStyle === 'disc' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <List size={13} />
                </button>
                <button
                  onClick={() => onUpdateProp('listStyle', 'decimal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    listStyle === 'decimal' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ListOrdered size={13} />
                </button>
              </div>
            </div>

            {/* Decoration: U / S */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Decoration</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('underline', !underline)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    underline ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Underline"
                >
                  <Underline size={14} />
                </button>
                <button
                  onClick={() => onUpdateProp('linethrough', !linethrough)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    linethrough ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Strikethrough"
                >
                  <Strikethrough size={14} />
                </button>
              </div>
            </div>

            {/* Vertical Alignment */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Vertical Alignment</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('verticalAlign', 'top')}
                  className={`p-1.5 rounded-lg transition-all ${
                    verticalAlign === 'top' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlignVerticalJustifyStart size={14} />
                </button>
                <button
                  onClick={() => onUpdateProp('verticalAlign', 'middle')}
                  className={`p-1.5 rounded-lg transition-all ${
                    verticalAlign === 'middle' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlignVerticalJustifyCenter size={14} />
                </button>
                <button
                  onClick={() => onUpdateProp('verticalAlign', 'bottom')}
                  className={`p-1.5 rounded-lg transition-all ${
                    verticalAlign === 'bottom' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlignVerticalJustifyEnd size={14} />
                </button>
              </div>
            </div>

            {/* Line Height: - 1 + */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Line Height</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('lineHeight', Math.max(0.5, Number((lineHeight - 0.1).toFixed(1))))}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-sm font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center font-mono text-xs font-bold text-zinc-100">
                  {lineHeight}
                </span>
                <button
                  onClick={() => onUpdateProp('lineHeight', Number((lineHeight + 0.1).toFixed(1)))}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Paragraph Spacing */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Paragraph Spacing</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('paragraphSpacing', Math.max(0, paragraphSpacing - 5))}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-sm font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center font-mono text-xs font-bold text-zinc-100">
                  {paragraphSpacing}
                </span>
                <button
                  onClick={() => onUpdateProp('paragraphSpacing', paragraphSpacing + 5)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Frame Behavior & Clipping */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Clipping</span>
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1">
                <button
                  onClick={() => onUpdateProp('clipping', true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    clipping ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => onUpdateProp('clipping', false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    !clipping ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TYPOGRAPHY STYLE PRESETS */}
        <div className="space-y-2.5 pt-4 border-t border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Curated Style Presets</span>
          </span>

          <div className="space-y-2">
            {TYPOGRAPHY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800/40 text-left transition-all group flex flex-col gap-1"
              >
                <div
                  className="text-lg font-bold tracking-tight text-white group-hover:text-purple-300 truncate"
                  style={{
                    fontFamily: preset.fontFamily,
                    fontStyle: preset.fontStyle,
                    fontWeight: preset.fontWeight,
                  }}
                >
                  {preset.preview}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{preset.title}</span>
                  <span className="font-mono text-[10px] text-purple-400">Apply</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
