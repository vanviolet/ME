import React from 'react';
import { Brush, Eraser, Highlighter, Sparkles, Check, X } from 'lucide-react';

interface DrawPanelProps {
  isDrawingMode: boolean;
  brushColor: string;
  brushWidth: number;
  brushType: 'pencil' | 'marker' | 'highlighter' | 'eraser';
  onToggleDrawingMode: (enabled: boolean) => void;
  onSetBrushColor: (color: string) => void;
  onSetBrushWidth: (width: number) => void;
  onSetBrushType: (type: 'pencil' | 'marker' | 'highlighter' | 'eraser') => void;
  onClearDrawing: () => void;
  onClose?: () => void;
}

const BRUSH_COLORS = [
  '#ffffff',
  '#f43f5e',
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#eab308',
  '#f97316',
  '#000000',
];

export const DrawPanel: React.FC<DrawPanelProps> = ({
  isDrawingMode,
  brushColor,
  brushWidth,
  brushType,
  onToggleDrawingMode,
  onSetBrushColor,
  onSetBrushWidth,
  onSetBrushType,
  onClearDrawing,
  onClose,
}) => {
  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brush size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Freehand Drawing</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearDrawing}
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

      <div className="p-4 space-y-4">
        {/* Toggle Brush Mode */}
        <button
          onClick={() => onToggleDrawingMode(!isDrawingMode)}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
            isDrawingMode
              ? 'bg-purple-600 text-white shadow-purple-600/30 ring-2 ring-purple-500/50'
              : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Brush size={14} />
          <span>{isDrawingMode ? 'Drawing Mode Active' : 'Start Drawing'}</span>
        </button>

        {/* Brush Types */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Brush Preset
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSetBrushType('pencil')}
              className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                brushType === 'pencil'
                  ? 'border-purple-500 bg-purple-600/20 text-white ring-1 ring-purple-500'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800/50'
              }`}
            >
              <Brush size={14} />
              <span className="text-[10px]">Pencil</span>
            </button>
            <button
              onClick={() => onSetBrushType('highlighter')}
              className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                brushType === 'highlighter'
                  ? 'border-purple-500 bg-purple-600/20 text-white ring-1 ring-purple-500'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800/50'
              }`}
            >
              <Highlighter size={14} />
              <span className="text-[10px]">Highlighter</span>
            </button>
            <button
              onClick={() => onSetBrushType('eraser')}
              className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                brushType === 'eraser'
                  ? 'border-purple-500 bg-purple-600/20 text-white ring-1 ring-purple-500'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800/50'
              }`}
            >
              <Eraser size={14} />
              <span className="text-[10px]">Eraser</span>
            </button>
          </div>
        </div>

        {/* Brush Size */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span>Stroke Size</span>
            <span className="font-mono text-purple-400 font-bold">{brushWidth}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={brushWidth}
            onChange={(e) => onSetBrushWidth(parseInt(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
          />
        </div>

        {/* Color Palette */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Ink Color
          </span>
          <div className="grid grid-cols-5 gap-2">
            {BRUSH_COLORS.map((color) => {
              const isSelected = brushColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  onClick={() => onSetBrushColor(color)}
                  className={`h-8 rounded-xl border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105 shadow-sm'
                      : 'border-zinc-800 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <Check
                      size={12}
                      className={color === '#ffffff' || color === '#eab308' ? 'text-black' : 'text-white'}
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
