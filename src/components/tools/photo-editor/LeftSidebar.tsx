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
    { id: 'effects', label: 'Effects', icon: <span className="font-serif font-bold italic text-base leading-none">fx</span> },
    { id: 'bg-removal', label: 'BG Remover', icon: <Wand2 size={18} />, isBadge: true },
    { id: 'text', label: 'Text', icon: <Type size={18} /> },
    { id: 'shapes', label: 'Shapes', icon: <Shapes size={18} /> },
    { id: 'stickers', label: 'Stickers', icon: <Smile size={18} /> },
    { id: 'draw', label: 'Draw', icon: <Brush size={18} /> },
    { id: 'layers', label: 'Layers', icon: <Layers size={18} /> },
  ];

  return (
    <aside
      className={`
        bg-zinc-900 border-zinc-800 select-none z-20 shrink-0
        /* Desktop: Vertical Left Sidebar */
        hidden md:flex md:flex-col md:w-18 lg:md:w-20 md:h-full md:border-r md:py-2.5 md:space-y-1.5 md:items-center overflow-y-auto custom-scrollbar
        /* Mobile: Fixed Bottom Navigation Bar */
        max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-16 max-md:border-t max-md:flex max-md:flex-row max-md:items-center max-md:px-2 max-md:gap-1.5 max-md:overflow-x-auto max-md:bg-zinc-900/95 max-md:backdrop-blur-xl
      `}
    >
      {tools.map((tool) => {
        const isActive = activeTab === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onSelectTab(tool.id)}
            className={`
              rounded-xl flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all group relative shrink-0
              /* Desktop sizing */
              md:w-14 lg:md:w-16 md:h-14
              /* Mobile touch sizing (min 48px touch target) */
              max-md:w-15 max-md:h-12 max-md:px-1.5
              ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 active:bg-zinc-800'
              }
            `}
            title={tool.label}
          >
            <div className="relative">
              {tool.icon}
              {tool.isBadge && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight text-center leading-tight whitespace-nowrap">
              {tool.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
