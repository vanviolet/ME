import React from 'react';
import { Brush, Eraser, Highlighter, Sparkles, Check } from 'lucide-react';

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
}) => {
  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brush size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Freehand Drawing</h2>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* ENABLE / DISABLE DRAWING MODE */}
        <button
          onClick={() => onToggleDrawingMode(!isDrawingMode)}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
            isDrawingMode
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 ring-2 ring-purple-400'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
          }`}
        >
          <Brush size={16} />
          <span>{isDrawingMode ? 'Drawing Active (Click to Exit)' : 'Start Drawing on Canvas'}</span>
        </button>

        {/* BRUSH TYPE */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Brush Style
          </span>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'pencil', label: 'Fine Pen', icon: <Brush size={14} /> },
              { id: 'marker', label: 'Bold Marker', icon: <Brush size={16} /> },
              { id: 'highlighter', label: 'Highlighter', icon: <Highlighter size={14} /> },
              { id: 'eraser', label: 'Eraser', icon: <Eraser size={14} /> },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => onSetBrushType(b.id as any)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  brushType === b.id
                    ? 'border-purple-500 bg-purple-600/20 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                {b.icon}
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* BRUSH SIZE */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
            <span>Stroke Thickness</span>
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

        {/* BRUSH COLOR */}
        {brushType !== 'eraser' && (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                Ink Color
              </span>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => onSetBrushColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {BRUSH_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onSetBrushColor(c)}
                  className={`h-8 rounded-lg border flex items-center justify-center transition-all ${
                    brushColor === c ? 'border-purple-400 ring-2 ring-purple-500/40 scale-105' : 'border-zinc-800'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {brushColor === c && (
                    <Check size={12} className={c === '#ffffff' ? 'text-black' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
