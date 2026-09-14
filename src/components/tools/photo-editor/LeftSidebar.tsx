import React from 'react';
import {
  Crop,
  Sliders,
  Sparkles,
  Wand2,
  Type,
  Shapes,
  Smile,
  Brush,
  Layers,
  Sparkle,
} from 'lucide-react';
import { ToolTab } from './types';

interface LeftSidebarProps {
  activeTab: ToolTab | null;
  onSelectTab: (tab: ToolTab) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, onSelectTab }) => {
  const tools: Array<{ id: ToolTab; label: string; icon: React.ReactNode; isBadge?: boolean }> = [
    { id: 'crop', label: 'Crop', icon: <Crop size={18} /> },
    { id: 'adjust', label: 'Adjust', icon: <Sliders size={18} /> },
    { id: 'filter', label: 'Filter', icon: <Sparkles size={18} /> },
    { id: 'effects', label: 'Effects', icon: <span className="font-serif font-bold italic text-base">fx</span> },
    { id: 'bg-removal', label: 'BG Removal', icon: <Wand2 size={18} />, isBadge: true },
    { id: 'text', label: 'Text', icon: <Type size={18} /> },
    { id: 'shapes', label: 'Shapes', icon: <Shapes size={18} /> },
    { id: 'stickers', label: 'Stickers', icon: <Smile size={18} /> },
    { id: 'draw', label: 'Draw', icon: <Brush size={18} /> },
    { id: 'layers', label: 'Layers', icon: <Layers size={18} /> },
  ];

  return (
    <aside className="w-18 sm:w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-2.5 space-y-1.5 shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      {tools.map((tool) => {
        const isActive = activeTab === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onSelectTab(tool.id)}
            className={`w-14 sm:w-16 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative ${
              isActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
            }`}
            title={tool.label}
          >
            <div className="relative">
              {tool.icon}
              {tool.isBadge && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight text-center leading-tight">
              {tool.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
