import React, { useState } from 'react';
import { Smile, Sparkles, Tag, Flame, Star, Heart, CheckCircle2 } from 'lucide-react';

interface StickersPanelProps {
  onAddEmojiSticker: (emoji: string) => void;
  onAddGraphicSticker: (svgUrl: string, name: string) => void;
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

const BADGE_TEMPLATES = [
  { text: 'NEW ARRIVAL', bg: '#ef4444', color: '#ffffff' },
  { text: '50% OFF SALE', bg: '#f59e0b', color: '#000000' },
  { text: 'BESTSELLER', bg: '#8b5cf6', color: '#ffffff' },
  { text: 'LIMITED EDITION', bg: '#10b981', color: '#ffffff' },
  { text: 'PREMIUM QUALITY', bg: '#3b82f6', color: '#ffffff' },
  { text: 'HANDMADE WITH LOVE', bg: '#ec4899', color: '#ffffff' },
];

export const StickersPanel: React.FC<StickersPanelProps> = ({ onAddEmojiSticker }) => {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Stickers & Elements</h2>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* PROMO STAMP BADGES */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Stamps & Badges
          </span>

          <div className="grid grid-cols-2 gap-2">
            {BADGE_TEMPLATES.map((badge, idx) => (
              <button
                key={idx}
                onClick={() => onAddEmojiSticker(`[${badge.text}]`)}
                className="p-2.5 rounded-xl border border-zinc-800 hover:border-purple-500 hover:scale-[1.02] text-center transition-all font-mono font-extrabold text-[10px] tracking-wider truncate"
                style={{ backgroundColor: badge.bg, color: badge.color }}
              >
                {badge.text}
              </button>
            ))}
          </div>
        </div>

        {/* EMOJI STICKERS */}
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Emoji Elements
          </span>

          {EMOJI_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-[11px] text-zinc-400 font-medium">{cat.category}</span>
              <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
                {cat.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onAddEmojiSticker(emoji)}
                    className="h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-2xl flex items-center justify-center hover:scale-125 transition-transform"
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
