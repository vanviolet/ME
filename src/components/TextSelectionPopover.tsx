import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle } from 'lucide-react';

export const TextSelectionPopover: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // Delay clearing to allow click on popover
        return;
      }

      const text = selection.toString().trim();

      // Ignore short or extremely long selections, or selections inside input/textarea
      if (text.length < 2 || text.length > 250) {
        return;
      }

      // Check anchor element
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Check if selection is inside popover or chatbox
      const anchorNode = selection.anchorNode;
      if (anchorNode) {
        const parentEl = anchorNode.parentElement;
        if (
          parentEl?.closest('#vanbot-chat-drawer') ||
          parentEl?.closest('#text-selection-popover')
        ) {
          return;
        }
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          // Calculate top-center position relative to viewport
          const x = rect.left + rect.width / 2;
          const y = Math.max(10, rect.top - 10);
          setPosition({ x, y });
          setSelectedText(text);
        }
      } catch {
        setPosition(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking outside selection popover, clear popover
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return;
      }
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setPosition(null);
          setSelectedText('');
        }
      }, 150);
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleAskAi = () => {
    if (!selectedText) return;

    const termName = selectedText;
    const queryPrompt = `Jelaskan secara ringkas & mendalam istilah teknis: "${termName}". Berikan definisi inti (1-2 kalimat), konsep utama, dan contoh penerapannya.`;

    // Dispatch custom event to trigger VanBot chatbot
    window.dispatchEvent(
      new CustomEvent('ask-vanbot', {
        detail: {
          query: queryPrompt,
          termName: termName,
        },
      })
    );

    // Clear selection & popover
    window.getSelection()?.removeAllRanges();
    setPosition(null);
    setSelectedText('');
  };

  if (!position || !selectedText) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="text-selection-popover"
        ref={popoverRef}
        initial={{ opacity: 0, y: 6, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
        }}
        className="-translate-x-1/2 -translate-y-full mb-1 flex items-center gap-1.5 p-1 rounded-full bg-stone-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 shadow-2xl shadow-stone-950/40 border border-stone-700/80 dark:border-zinc-300/80 backdrop-blur-md text-xs font-medium select-none pointer-events-auto"
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAskAi();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-stone-800 dark:hover:bg-zinc-200 transition text-xs font-semibold cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500 animate-pulse group-hover:rotate-12 transition-transform" />
          <span>Tanyakan ke AI</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 dark:bg-amber-500/20 text-amber-300 dark:text-amber-700 font-bold ml-0.5">
            VanBot
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
