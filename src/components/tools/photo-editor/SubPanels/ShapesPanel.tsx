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
} from 'lucide-react';
import { ShapeOption } from '../types';

interface ShapesPanelProps {
  onAddShape: (type: string, fill: string, stroke?: string) => void;
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

export const ShapesPanel: React.FC<ShapesPanelProps> = ({ onAddShape }) => {
  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shapes size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Vector Shapes</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
          Geometric & Graphics
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {SHAPE_LIST.map((shape) => (
            <button
              key={shape.id}
              onClick={() => onAddShape(shape.id, shape.defaultFill)}
              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-800/60 text-left transition-all group flex flex-col items-center justify-center gap-2"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm"
                style={{ backgroundColor: shape.defaultFill }}
              >
                {shape.id === 'rect' && <Square size={20} />}
                {shape.id === 'rounded-rect' && <Square size={20} className="rounded-md" />}
                {shape.id === 'circle' && <Circle size={20} />}
                {shape.id === 'triangle' && <Triangle size={20} />}
                {shape.id === 'star' && <Star size={20} fill="currentColor" />}
                {shape.id === 'arrow' && <ArrowRight size={20} />}
                {shape.id === 'line' && <Minus size={24} />}
                {shape.id === 'heart' && <Heart size={20} fill="currentColor" />}
                {shape.id === 'shield' && <Shield size={20} />}
                {shape.id === 'speech' && <MessageSquare size={20} />}
              </div>
              <span className="text-xs font-semibold text-zinc-300 group-hover:text-white truncate">
                {shape.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
