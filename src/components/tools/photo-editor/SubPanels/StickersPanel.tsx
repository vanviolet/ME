import React, { useState } from 'react';
import { Smile, Sparkles, Tag, Flame, Star, Heart, CheckCircle2, X } from 'lucide-react';

interface StickersPanelProps {
  onAddEmojiSticker: (emoji: string) => void;
  onAddGraphicSticker: (svgUrl: string, name: string) => void;
  onClose?: () => void;
}

const EMOJI_CATEGORIES = [
  {
    category: 'Vibes & Mood',
    emojis: ['🔥', '✨', '⚡', '💫', '🌟', '🚀', '💖', '👑', '😎', '🎉', '🏆', '💯'],
  },
  {
    category: 'Fashion & Aesthetic',
    emojis: ['🕶️', '👠', '💄', '💍', '👗', '👜', '🌹', '🎨', '📸', '💎', '🍒', '🦋'],
  },
  {
    category: 'Stamps & Badges',
    emojis: ['🏷️', '🎯', '📍', '⭐', '🌈', '🍀', '💡', '🎵', '🍿', '☕', '🧁', '🍕'],
  },
  {
    category: 'Gestures & Reactions',
    emojis: ['✌️', '🤙', '🙌', '👏', '👀', '💪', '🤩', '🥳', '🪄', '🔮', '🦄', '❤️‍🔥'],
  },
];

export const StickersPanel: React.FC<StickersPanelProps> = ({ onAddEmojiSticker, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Stickers & Elements</h2>
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
        {/* Category switcher */}
        <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800 gap-1 overflow-x-auto custom-scrollbar">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeCategory === idx
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* EMOJI GRID */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            {EMOJI_CATEGORIES[activeCategory].category}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => onAddEmojiSticker(emoji)}
                className="h-14 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-800/60 flex items-center justify-center text-2xl transition-all active:scale-90 hover:scale-105 shadow-sm"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
