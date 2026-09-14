import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Square,
  Highlighter,
  Sliders,
  Layers,
  Trash2,
  Copy,
  ChevronDown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { FONT_OPTIONS } from './types';

interface ContextToolbarProps {
  selectedType: 'text' | 'image' | 'shape' | 'sticker' | null;
  // Text Props
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  underline?: boolean;
  textAlign?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  opacity?: number;
  hasShadow?: boolean;
  isLocked?: boolean;
  // Handlers
  onUpdateTextProp: (prop: string, value: any) => void;
  onUpdateShapeProp: (prop: string, value: any) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onOpenAdvanced: () => void;
}

export const ContextToolbar: React.FC<ContextToolbarProps> = ({
  selectedType,
  fontFamily = "'Archivo', sans-serif",
  fontSize = 48,
  fontWeight = 'normal',
  fontStyle = 'normal',
  underline = false,
  textAlign = 'left',
  fillColor = '#ffffff',
  strokeColor = '#000000',
  strokeWidth = 0,
  backgroundColor = 'transparent',
  opacity = 1,
  hasShadow = false,
  isLocked = false,
  onUpdateTextProp,
  onUpdateShapeProp,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
  onToggleLock,
  onFlipH,
  onFlipV,
  onOpenAdvanced,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showShadowSettings, setShowShadowSettings] = useState(false);

  const isBold = fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
  const isItalic = fontStyle === 'italic';

  if (!selectedType) {
    return (
      <div className="w-full h-11 bg-zinc-900/90 border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Canvas Ready • Select any element or add text/shapes from the left panel</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-zinc-500 font-mono text-[11px]">
          <span>Space + Drag to Pan</span>
          <span>•</span>
          <span>Scroll to Zoom</span>
          <span>•</span>
          <span>Del to Remove</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-12 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar select-none z-10 shrink-0">
      <div className="flex items-center gap-1.5 min-w-max">
        {/* TEXT SPECIFIC CONTROLS (Matches the reference screenshot top bar) */}
        {selectedType === 'text' && (
          <>
            {/* Font Family Selector */}
            <div className="relative flex items-center">
              <select
                value={fontFamily}
                onChange={(e) => onUpdateTextProp('fontFamily', e.target.value)}
                className="h-8 pl-2.5 pr-7 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 text-zinc-100 text-xs font-semibold border border-zinc-700 cursor-pointer appearance-none outline-none focus:ring-1 focus:ring-purple-500"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.name} value={f.fontFamily} style={{ fontFamily: f.fontFamily }}>
                    {f.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 text-zinc-400 pointer-events-none" />
            </div>

            {/* Bold Toggle */}
            <button
              onClick={() => onUpdateTextProp('fontWeight', isBold ? 'normal' : 'bold')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${
                isBold
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold size={14} />
            </button>

            {/* Italic Toggle */}
            <button
              onClick={() => onUpdateTextProp('fontStyle', isItalic ? 'normal' : 'italic')}
              className={`w-8 h-8 rounded-lg flex items-center justify-center italic transition-colors ${
                isItalic
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic size={14} />
            </button>

            {/* Underline Toggle */}
            <button
              onClick={() => onUpdateTextProp('underline', !underline)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                underline
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Underline (Ctrl+U)"
            >
              <Underline size={14} />
            </button>

            {/* Font Size Stepper: - 57 pt + */}
            <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700 px-1 h-8">
              <button
                onClick={() => onUpdateTextProp('fontSize', Math.max(8, fontSize - 2))}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded text-sm font-bold"
              >
                −
              </button>
              <input
                type="number"
                value={Math.round(fontSize)}
                onChange={(e) => onUpdateTextProp('fontSize', parseInt(e.target.value) || 12)}
                className="w-10 text-center bg-transparent text-xs font-mono font-bold text-zinc-100 outline-none"
              />
              <span className="text-[10px] text-zinc-400 mr-1 font-mono">pt</span>
              <button
                onClick={() => onUpdateTextProp('fontSize', fontSize + 2)}
                className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded text-sm font-bold"
              >
                +
              </button>
            </div>

            {/* Text Alignment */}
            <div className="flex items-center bg-zinc-800/80 rounded-lg border border-zinc-700/80 p-0.5">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdateTextProp('textAlign', align)}
                  className={`p-1.5 rounded-md transition-colors ${
                    textAlign === align
                      ? 'bg-purple-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                  }`}
                  title={`Align ${align}`}
                >
                  {align === 'left' && <AlignLeft size={13} />}
                  {align === 'center' && <AlignCenter size={13} />}
                  {align === 'right' && <AlignRight size={13} />}
                  {align === 'justify' && <AlignJustify size={13} />}
                </button>
              ))}
            </div>

            {/* Color Swatch & Picker */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
              <span className="text-[11px] font-medium text-zinc-300">Color</span>
              <input
                type="color"
                value={fillColor.startsWith('#') ? fillColor : '#ffffff'}
                onChange={(e) => onUpdateTextProp('fill', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 outline-none"
              />
            </div>

            {/* Background Highlight Swatch */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
              <span className="text-[11px] font-medium text-zinc-300">Background</span>
              <input
                type="color"
                value={backgroundColor.startsWith('#') ? backgroundColor : '#000000'}
                onChange={(e) => onUpdateTextProp('backgroundColor', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 outline-none"
              />
              {backgroundColor !== 'transparent' && (
                <button
                  onClick={() => onUpdateTextProp('backgroundColor', 'transparent')}
                  className="text-[10px] text-zinc-400 hover:text-rose-400"
                  title="Clear background"
                >
                  ×
                </button>
              )}
            </div>

            {/* Shadow Toggle */}
            <button
              onClick={() => {
                if (hasShadow) {
                  onUpdateTextProp('shadow', null);
                } else {
                  onUpdateTextProp('shadow', {
                    color: 'rgba(0,0,0,0.6)',
                    blur: 15,
                    offsetX: 2,
                    offsetY: 4,
                  });
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                hasShadow
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <Sparkles size={13} />
              <span>Shadow</span>
            </button>

            {/* Advanced Typography Drawer button */}
            <button
              onClick={onOpenAdvanced}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1"
            >
              <span>Advanced</span>
            </button>
          </>
        )}

        {/* SHAPE SPECIFIC CONTROLS */}
        {selectedType === 'shape' && (
          <>
            {/* Fill Color */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
              <span className="text-xs font-semibold text-zinc-300">Fill</span>
              <input
                type="color"
                value={fillColor.startsWith('#') ? fillColor : '#8b5cf6'}
                onChange={(e) => onUpdateShapeProp('fill', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            {/* Border Stroke Color */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
              <span className="text-xs font-semibold text-zinc-300">Border</span>
              <input
                type="color"
                value={strokeColor.startsWith('#') ? strokeColor : '#ffffff'}
                onChange={(e) => onUpdateShapeProp('stroke', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="number"
                min={0}
                max={30}
                value={strokeWidth}
                onChange={(e) => onUpdateShapeProp('strokeWidth', parseInt(e.target.value) || 0)}
                className="w-10 text-center bg-zinc-900 rounded text-xs font-mono font-bold text-zinc-100 outline-none"
              />
              <span className="text-[10px] text-zinc-400 font-mono">px</span>
            </div>
          </>
        )}

        {/* COMMON OPACITY SLIDER */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
          <span className="text-[11px] font-medium text-zinc-300">Opacity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => {
              const val = parseInt(e.target.value) / 100;
              if (selectedType === 'text') onUpdateTextProp('opacity', val);
              else onUpdateShapeProp('opacity', val);
            }}
            className="w-16 accent-purple-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
          />
          <span className="text-[11px] font-mono text-zinc-300 w-8 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>

      {/* RIGHT ACTIONS: Flip, Layer Arrange, Duplicate, Lock, Delete */}
      <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-zinc-800">
        <button
          onClick={onFlipH}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Flip Horizontal"
        >
          <FlipHorizontal size={14} />
        </button>

        <button
          onClick={onFlipV}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Flip Vertical"
        >
          <FlipVertical size={14} />
        </button>

        <button
          onClick={onBringForward}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Bring Forward"
        >
          <ArrowUp size={14} />
        </button>

        <button
          onClick={onSendBackward}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Send Backward"
        >
          <ArrowDown size={14} />
        </button>

        <button
          onClick={onToggleLock}
          className={`p-1.5 rounded-lg transition-colors ${
            isLocked ? 'text-amber-400 bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title={isLocked ? 'Unlock Element' : 'Lock Element'}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>

        <button
          onClick={onDuplicate}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Duplicate (Ctrl+D)"
        >
          <Copy size={14} />
        </button>

        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          title="Delete (Del)"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
