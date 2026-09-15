import React from 'react';
import {
  Shapes,
  Square,
  Circle,
  Triangle,
  Star,
  ArrowRight,
  Minus,
  Heart,
  Shield,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { ShapeOption } from '../types';

interface ShapesPanelProps {
  onAddShape: (type: string, fill: string, stroke?: string) => void;
  onClose?: () => void;
}

const SHAPE_LIST: ShapeOption[] = [
  { id: 'rect', name: 'Rectangle', iconName: 'Square', type: 'rect', defaultFill: '#8b5cf6' },
  { id: 'rounded-rect', name: 'Rounded Rect', iconName: 'Square', type: 'rect', defaultFill: '#3b82f6' },
  { id: 'circle', name: 'Circle', iconName: 'Circle', type: 'circle', defaultFill: '#ec4899' },
  { id: 'triangle', name: 'Triangle', iconName: 'Triangle', type: 'triangle', defaultFill: '#f59e0b' },
  { id: 'star', name: 'Star 5-Point', iconName: 'Star', type: 'star', defaultFill: '#eab308' },
  { id: 'arrow', name: 'Arrow Right', iconName: 'ArrowRight', type: 'arrow', defaultFill: '#10b981' },
  { id: 'line', name: 'Divider Line', iconName: 'Minus', type: 'line', defaultFill: '#ffffff' },
  { id: 'heart', name: 'Heart Badge', iconName: 'Heart', type: 'heart', defaultFill: '#f43f5e' },
  { id: 'shield', name: 'Shield Badge', iconName: 'Shield', type: 'badge', defaultFill: '#6366f1' },
  { id: 'speech', name: 'Speech Bubble', iconName: 'MessageSquare', type: 'speech', defaultFill: '#14b8a6' },
];

export const ShapesPanel: React.FC<ShapesPanelProps> = ({ onAddShape, onClose }) => {
  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shapes size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Vector Shapes</h2>
        </div>
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

      <div className="p-4 space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
          Geometric & Vector Primitives
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {SHAPE_LIST.map((shape) => (
            <button
              key={shape.id}
              onClick={() => onAddShape(shape.type, shape.defaultFill)}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-800/40 flex flex-col items-center justify-center gap-2 transition-all group active:scale-95 shadow-sm"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner"
                style={{ backgroundColor: `${shape.defaultFill}25` }}
              >
                {shape.type === 'rect' && <Square size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'circle' && <Circle size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'triangle' && <Triangle size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'star' && <Star size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'arrow' && <ArrowRight size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'line' && <Minus size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'heart' && <Heart size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'badge' && <Shield size={20} style={{ color: shape.defaultFill }} />}
                {shape.type === 'speech' && <MessageSquare size={20} style={{ color: shape.defaultFill }} />}
              </div>
              <span className="text-xs font-semibold text-zinc-300 group-hover:text-purple-300 text-center">
                {shape.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
