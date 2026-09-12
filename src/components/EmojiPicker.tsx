import React, { useState, useRef, useEffect } from 'react';
import { Smile, Sparkles, X } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  className?: string;
  buttonLabel?: string;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Top / Reaksi Cepat',
    emojis: ['👍', '❤️', '🔥', '💡', '🚀', '👏', '🎉', '✨', '💯', '🤝', '🧠', '💻', '🎯', '🤔', '🙌', '☕'],
  },
  {
    name: 'Wajah & Emosi',
    emojis: [
      '😊', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🥹', '😇',
      '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🧐',
      '🤓', '😎', '🥳', '😏', '😮', '😲', '🤯', '🫠', '🫡', '😴',
    ],
  },
  {
    name: 'Gestur & Tangan',
    emojis: [
      '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '👊', '✊', '🤛',
      '🤜', '🖐️', '✋', '👌', '🤌', '🤏', '🤙', '👈', '👉', '👆',
      '👇', '☝️', '✍️', '🙏', '💪', '🫶', '👋', '🤟',
    ],
  },
  {
    name: 'Teknologi & Koding',
    emojis: [
      '💻', '🖥️', '⌨️', '🖱️', '📱', '💾', '⚙️', '🔧', '🔨', '🚀',
      '⚡', '🔥', '🎯', '📊', '📈', '🧠', '📝', '📌', '📍', '🛡️',
      '🔐', '🔍', '💡', '📦', '🎨', '🤖', '🌐', '📡', '🗄️', '⏳',
    ],
  },
  {
    name: 'Simbol & Apresiasi',
    emojis: [
      '✨', '🌟', '⭐', '💯', '✅', '❌', '⚠️', '❓', '❗', '💬',
      '💭', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖',
      '☕', '🍕', '🏆', '🥇', '🎁', '🎈', '🪄', '💎', '🕊️', '💐',
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelectEmoji,
  className = '',
  buttonLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={pickerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 transition-all ${
          isOpen ? 'ring-2 ring-rose-500/30 border-rose-500/40 text-rose-600 dark:text-rose-400' : ''
        }`}
        title="Tambahkan Emoticon / Emoji"
      >
        <Smile size={14} className="text-amber-500" />
        <span>{buttonLabel || 'Emoji'}</span>
      </button>

      {/* Emoji Picker Popup */}
      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 font-semibold text-xs">
              <Sparkles size={13} className="text-rose-500" />
              <span>Pilih Emoticon</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 border-b border-stone-100 dark:border-zinc-800 no-scrollbar">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                  activeTab === idx
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.emojis[0]} {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Active Category Emoji Grid */}
          <div className="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto p-1 custom-scrollbar">
            {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                type="button"
                onClick={() => handleSelect(emoji)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-stone-100 dark:hover:bg-zinc-800 hover:scale-125 transition-transform active:scale-95"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Quick Frequent Bar at bottom */}
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-stone-400">
            <span>Klik emoji untuk menyisipkan</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-rose-500 hover:underline"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
