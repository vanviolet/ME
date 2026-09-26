import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Palette,
  Check,
  Languages,
  Wand2,
  Maximize2,
  Minimize2,
  Smile,
  FileText,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  CornerDownLeft,
  X,
  Loader2,
  AlertCircle,
  BrainCircuit,
  RotateCcw,
  ArrowDownToLine,
  CheckCheck,
  Zap,
  Trash2,
} from 'lucide-react';

interface NotionFloatingMenuProps {
  editor: Editor | null;
}

interface AiReviewState {
  originalFrom: number;
  originalTo: number;
  originalText: string;
  generatedText: string;
  actionType: string;
  detail?: string;
  appliedFrom: number;
  appliedTo: number;
}

const TONE_OPTIONS = [
  { id: 'Academic', label: 'Academic', desc: 'Akademis & ilmiah' },
  { id: 'Business', label: 'Business', desc: 'Profesional & korporat' },
  { id: 'Casual', label: 'Casual', desc: 'Santai & akrab' },
  { id: 'Childfriendly', label: 'Childfriendly', desc: 'Ramah anak & mudah' },
  { id: 'Confident', label: 'Confident', desc: 'Percaya diri & meyakinkan' },
  { id: 'Conversational', label: 'Conversational', desc: 'Mengalir & dialogis' },
  { id: 'Creative', label: 'Creative', desc: 'Kreatif & imajinatif' },
  { id: 'Emotional', label: 'Emotional', desc: 'Emosional & menggugah' },
  { id: 'Excited', label: 'Excited', desc: 'Antusias & bersemangat' },
  { id: 'Formal', label: 'Formal', desc: 'Baku & formal' },
  { id: 'Friendly', label: 'Friendly', desc: 'Hangat & bersahabat' },
  { id: 'Funny', label: 'Funny', desc: 'Jenaka & menghibur' },
  { id: 'Humorous', label: 'Humorous', desc: 'Humor cerdas' },
  { id: 'Informative', label: 'Informative', desc: 'Informatif & faktual' },
  { id: 'Inspirational', label: 'Inspirational', desc: 'Inspiratif & memotivasi' },
  { id: 'Memeify', label: 'Memeify', desc: 'Gaya meme / gaul' },
  { id: 'Narrative', label: 'Narrative', desc: 'Gaya bercerita naratif' },
  { id: 'Objective', label: 'Objective', desc: 'Objektif & netral' },
  { id: 'Persuasive', label: 'Persuasive', desc: 'Persuasif & meyakinkan' },
  { id: 'Poetic', label: 'Poetic', desc: 'Puitis & estetis' },
];

const TRANSLATE_OPTIONS = [
  { id: 'Indonesian', label: 'Indonesian (Bahasa Indonesia)' },
  { id: 'English', label: 'English (US/UK)' },
  { id: 'Japanese', label: 'Japanese (日本語)' },
  { id: 'Spanish', label: 'Spanish (Español)' },
  { id: 'German', label: 'German (Deutsch)' },
  { id: 'French', label: 'French (Français)' },
  { id: 'Korean', label: 'Korean (한국어)' },
  { id: 'Mandarin', label: 'Mandarin (中文)' },
  { id: 'Arabic', label: 'Arabic (العربية)' },
];

const COLOR_HIGHLIGHTS = [
  { label: 'Default', color: null, bg: null },
  { label: 'Gray', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' },
  { label: 'Red / Rose', color: '#e11d48', bg: 'rgba(225, 29, 72, 0.15)' },
  { label: 'Yellow / Amber', color: '#d97706', bg: 'rgba(245, 158, 11, 0.2)' },
  { label: 'Green / Emerald', color: '#059669', bg: 'rgba(16, 185, 129, 0.15)' },
  { label: 'Blue / Sky', color: '#0284c7', bg: 'rgba(14, 165, 233, 0.15)' },
  { label: 'Purple / Violet', color: '#7c3aed', bg: 'rgba(139, 92, 246, 0.15)' },
];

// Helper to clean raw LLM output into clean markdown/text
const cleanAiOutput = (raw: string): string => {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Strip wrapping markdown codeblocks e.g. ```markdown ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:markdown|html|text)?\s*\n?([\s\S]*?)\n?```$/i, '$1').trim();

  // Strip conversational preambles
  cleaned = cleaned.replace(/^(?:Tentu,?\s*(?:berikut|ini)?|Berikut\s*(?:adalah)?|Here\s*is\s*(?:the)?|Sure,?\s*here\s*is)\s*[^:\n]*:\s*\n?/i, '').trim();

  // Strip outer quotes if enclosed
  cleaned = cleaned.replace(/^["'«“]|["'»”]$/g, '').trim();

  return cleaned;
};

export const NotionFloatingMenu: React.FC<NotionFloatingMenuProps> = ({ editor }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [reviewCoords, setReviewCoords] = useState<{ top: number; left: number } | null>(null);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showToneSubmenu, setShowToneSubmenu] = useState(false);
  const [showTranslateSubmenu, setShowTranslateSubmenu] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  // AI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const [aiThinkingText, setAiThinkingText] = useState('AI sedang menganalisis & menyempurnakan tulisan...');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [showCustomPromptInput, setShowCustomPromptInput] = useState(false);
  const [aiReviewState, setAiReviewState] = useState<AiReviewState | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const reviewBarRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Position update when text is selected in TipTap
  useEffect(() => {
    if (!editor) return;

    const updateMenuPosition = () => {
      // If currently in review state or typing, keep reviewCoords intact
      if (aiReviewState || isTypingEffect) return;

      const { from, to, empty } = editor.state.selection;
      if (empty || from === to) {
        setCoords(null);
        setShowAiMenu(false);
        setShowBlockMenu(false);
        setShowColorMenu(false);
        return;
      }

      // Check active selection length
      const text = editor.state.doc.textBetween(from, to, ' ').trim();
      if (!text) {
        setCoords(null);
        return;
      }

      try {
        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        // Center menu horizontally above selection
        const left = Math.max(16, Math.min(window.innerWidth - 380, (start.left + end.right) / 2));
        const top = Math.max(10, start.top - 48);

        setCoords({ top, left });
      } catch {
        setCoords(null);
      }
    };

    editor.on('selectionUpdate', updateMenuPosition);
    editor.on('blur', () => {
      setTimeout(() => {
        if (!menuRef.current?.matches(':hover') && !reviewBarRef.current?.matches(':hover')) {
          if (!aiReviewState && !isTypingEffect) {
            setCoords(null);
          }
        }
      }, 250);
    });

    return () => {
      editor.off('selectionUpdate', updateMenuPosition);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [editor, aiReviewState, isTypingEffect]);

  // Click outside listener for submenus
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAiMenu(false);
        setShowToneSubmenu(false);
        setShowTranslateSubmenu(false);
        setShowBlockMenu(false);
        setShowColorMenu(false);
        setShowCustomPromptInput(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  // Determine current block type
  const getCurrentBlockName = () => {
    if (!editor) return 'Text';
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('bulletList')) return 'Bullet List';
    if (editor.isActive('orderedList')) return 'Numbered List';
    if (editor.isActive('taskList')) return 'Task List';
    if (editor.isActive('blockquote')) return 'Blockquote';
    if (editor.isActive('codeBlock')) return 'Code Block';
    return 'Text';
  };

  // Run Typewriter streaming animation into editor
  const runTypewriterAnimation = (
    from: number,
    to: number,
    targetText: string,
    onComplete: (appliedFrom: number, appliedTo: number) => void
  ) => {
    if (!editor) return;

    setIsTypingEffect(true);

    // 1. Delete initial selection once
    editor.chain().focus().setTextSelection({ from, to }).deleteSelection().run();
    const startPos = editor.state.selection.from;

    // 2. Tokenize by words with spaces
    const words = targetText.match(/\S+\s*/g) || [targetText];
    let currentIndex = 0;
    const batchSize = Math.max(1, Math.ceil(words.length / 22));

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (currentIndex >= words.length || !editor) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);

        const currentEndPos = editor.state.selection.to;

        // Finalize with clean Markdown parsing so headings, lists, bold, tables format cleanly
        editor
          .chain()
          .focus()
          .setTextSelection({ from: startPos, to: currentEndPos })
          .deleteSelection()
          .insertContent(targetText)
          .run();

        setIsTypingEffect(false);
        const finalTo = editor.state.selection.to;
        onComplete(startPos, finalTo);
        return;
      }

      const chunk = words.slice(currentIndex, currentIndex + batchSize).join('');
      currentIndex += batchSize;

      // Type chunk forward at active cursor
      editor.chain().focus().insertContent(chunk).run();
    }, 32);
  };

  // Execute AI action on selected text
  const executeAiAction = async (actionType: string, detail?: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ').trim();
    if (!selectedText) return;

    // Save initial coordinates for the review bar
    if (coords) {
      setReviewCoords(coords);
    }

    setIsAiLoading(true);
    setAiReviewState(null);

    let thinkingMsg = 'AI sedang berpikir & menyempurnakan tulisan...';
    if (actionType === 'grammar') thinkingMsg = 'Memeriksa & memperbaiki tata bahasa...';
    else if (actionType === 'tone') thinkingMsg = `Menyesuaikan gaya bahasa ke "${detail}"...`;
    else if (actionType === 'translate') thinkingMsg = `Menerjemahkan teks ke ${detail}...`;
    else if (actionType === 'summarize') thinkingMsg = 'Merangkum teks penting...';
    else if (actionType === 'extend') thinkingMsg = 'Mengembangkan & memperkaya konten...';
    else if (actionType === 'reduce') thinkingMsg = 'Meringkas teks...';
    else if (actionType === 'simplify') thinkingMsg = 'Menyederhanakan bahasa...';
    else if (actionType === 'emojify') thinkingMsg = 'Menambahkan emoji ekspresif...';
    setAiThinkingText(thinkingMsg);

    setShowAiMenu(false);
    setShowToneSubmenu(false);
    setShowTranslateSubmenu(false);
    setShowCustomPromptInput(false);

    let prompt = '';
    switch (actionType) {
      case 'improve':
        prompt = `Sempurnakan dan tingkatkan kualitas penulisan teks berikut agar lebih elegan, padat, dan jelas. Format tulisan agar menyatu alami dengan paragraf editor. Keluarkan HANYA teks hasil yang telah disempurnakan tanpa pembuka/penutup:\n\n"${selectedText}"`;
        break;
      case 'tone':
        prompt = `Tulis ulang teks berikut dengan nada bicara (tone) "${detail}". Pastikan pesan tetap utuh dan gaya penulisan rapi. Keluarkan HANYA teks hasil akhir:\n\n"${selectedText}"`;
        break;
      case 'grammar':
        prompt = `Perbaiki segala kesalahan ejaan (spelling), tata bahasa (grammar), tanda baca, dan typo pada teks berikut. Keluarkan HANYA teks hasil yang sudah diperbaiki:\n\n"${selectedText}"`;
        break;
      case 'extend':
        prompt = `Kembangkan dan elaborasikan teks berikut menjadi penjelasan yang lebih lengkap, jelas, dan kaya konteks. Keluarkan HANYA teks hasil pengembangannya:\n\n"${selectedText}"`;
        break;
      case 'reduce':
        prompt = `Ringkas teks berikut menjadi kalimat yang lebih ringkas, padat, dan esensial tanpa membuang makna utama. Keluarkan HANYA teks hasil ringkasannya:\n\n"${selectedText}"`;
        break;
      case 'simplify':
        prompt = `Sederhanakan bahasa teks berikut agar sangat mudah dimengerti oleh khalayak umum. Gunakan kosakata yang jernih dan sederhana. Keluarkan HANYA teks hasil:\n\n"${selectedText}"`;
        break;
      case 'emojify':
        prompt = `Berikan emoji yang relevan dan ekspresif pada teks berikut agar menarik dan hidup. Keluarkan HANYA teks hasil:\n\n"${selectedText}"`;
        break;
      case 'complete':
        prompt = `Lengkapi kalimat atau paragraf berikut secara alami, logis, dan koheren. Keluarkan teks yang sudah lengkap:\n\n"${selectedText}"`;
        break;
      case 'summarize':
        prompt = `Buat ringkasan ringkas dari teks berikut dalam format terstruktur atau poin padat. Keluarkan HANYA ringkasannya:\n\n"${selectedText}"`;
        break;
      case 'translate':
        prompt = `Terjemahkan teks berikut ke dalam bahasa ${detail} dengan akurat, fasih, dan alami. Keluarkan HANYA teks terjemahannya:\n\n"${selectedText}"`;
        break;
      case 'custom':
        prompt = `Instruksi: "${detail}". Terapkan instruksi ini pada teks berikut: "${selectedText}". Keluarkan HANYA teks hasil akhir:`;
        break;
      default:
        prompt = `Perbaiki dan tingkatkan teks berikut:\n\n"${selectedText}"`;
    }

    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          prompt,
          task: 'general',
          action: actionType,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Gagal memproses bantuan AI dari server.');
      }

      const rawResultText = (typeof data.result === 'string' ? data.result : data.text || '').trim();
      if (!rawResultText) {
        throw new Error('Hasil AI kosong.');
      }

      const cleanResult = cleanAiOutput(rawResultText);
      setIsAiLoading(false);

      // Run Typewriter effect in editor!
      runTypewriterAnimation(from, to, cleanResult, (appliedStart, appliedEnd) => {
        // Set Notion Review state for Apply, Insert below, Try again, Discard
        setAiReviewState({
          originalFrom: appliedStart,
          originalTo: appliedStart + selectedText.length,
          originalText: selectedText,
          generatedText: cleanResult,
          actionType,
          detail,
          appliedFrom: appliedStart,
          appliedTo: appliedEnd,
        });
      });
    } catch (err: any) {
      console.error('AI Assist error:', err);
      const errMsg = err?.message || 'Terjadi kesalahan saat menghubungi AI.';
      showToast('error', errMsg);
      setIsAiLoading(false);
      setIsTypingEffect(false);
    }
  };

  // NOTION REVIEW BAR HANDLERS
  // 1. Done / Replace Selection (Apply)
  const handleApplyReplace = () => {
    setAiReviewState(null);
    setReviewCoords(null);
    showToast('success', '✨ Perubahan AI berhasil diterapkan!');
  };

  // 2. Insert Below original text
  const handleInsertBelow = () => {
    if (!editor || !aiReviewState) return;
    const { originalFrom, originalText, generatedText, appliedFrom, appliedTo } = aiReviewState;

    // Delete generated text and restore original text
    editor
      .chain()
      .focus()
      .setTextSelection({ from: appliedFrom, to: appliedTo })
      .deleteSelection()
      .insertContent(originalText)
      .run();

    // Insert generated text in a new block right below
    editor.chain().focus().insertContent(`\n\n${generatedText}`).run();

    setAiReviewState(null);
    setReviewCoords(null);
    showToast('success', '✨ Teks disisipkan di bawah teks asli!');
  };

  // 3. Try Again
  const handleTryAgain = () => {
    if (!editor || !aiReviewState) return;
    const { originalFrom, originalText, appliedFrom, appliedTo, actionType, detail } = aiReviewState;

    // Revert generated content to original text
    editor
      .chain()
      .focus()
      .setTextSelection({ from: appliedFrom, to: appliedTo })
      .deleteSelection()
      .insertContent(originalText)
      .run();

    // Reselect original text
    const reselectedTo = originalFrom + originalText.length;
    editor.chain().focus().setTextSelection({ from: originalFrom, to: reselectedTo }).run();
    setAiReviewState(null);

    // Re-run
    executeAiAction(actionType, detail);
  };

  // 4. Discard / Revert
  const handleDiscard = () => {
    if (!editor || !aiReviewState) return;
    const { originalFrom, originalText, appliedFrom, appliedTo } = aiReviewState;

    // Revert generated content to original text
    editor
      .chain()
      .focus()
      .setTextSelection({ from: appliedFrom, to: appliedTo })
      .deleteSelection()
      .insertContent(originalText)
      .run();

    // Reselect original text
    const reselectedTo = originalFrom + originalText.length;
    editor.chain().focus().setTextSelection({ from: originalFrom, to: reselectedTo }).run();

    setAiReviewState(null);
    setReviewCoords(null);
    showToast('info', 'Perubahan AI dibatalkan.');
  };

  const handleApplyLink = () => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  // Render check
  if (!editor) return null;
  const activePosition = reviewCoords || coords;
  if (!activePosition && !toast) return null;

  return (
    <>
      {/* 1. NOTION AI REVIEW BAR (Replace, Insert Below, Try Again, Discard) */}
      {aiReviewState && activePosition && (
        <div
          ref={reviewBarRef}
          className="fixed z-50 -translate-x-1/2 flex flex-col items-center bg-white/95 dark:bg-[#1a1d24]/95 backdrop-blur-md text-stone-800 dark:text-zinc-100 rounded-2xl shadow-2xl border border-purple-300 dark:border-purple-800/80 p-2 text-xs select-none transition-all duration-150 animate-in fade-in slide-in-from-top-2"
          style={{
            top: `${Math.max(12, activePosition.top - 12)}px`,
            left: `${activePosition.left}px`,
          }}
        >
          {/* Header Info */}
          <div className="flex items-center justify-between w-full px-2 pb-1.5 mb-1.5 border-b border-stone-200 dark:border-zinc-800 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
              <Sparkles size={13} className="text-purple-600 dark:text-purple-400" />
              <span>Hasil AI Siap Ditinjau</span>
            </div>
            <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">
              Notion AI Review
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Replace / Apply */}
            <button
              type="button"
              onClick={handleApplyReplace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs cursor-pointer transition-all shadow-xs active:scale-95"
              title="Terapkan teks hasil AI (ganti seleksi)"
            >
              <CheckCheck size={14} />
              <span>Replace selection</span>
            </button>

            {/* Insert Below */}
            <button
              type="button"
              onClick={handleInsertBelow}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 font-medium text-xs cursor-pointer transition-colors"
              title="Sisipkan di bawah teks asli"
            >
              <ArrowDownToLine size={13} className="text-purple-500" />
              <span>Insert below</span>
            </button>

            {/* Try Again */}
            <button
              type="button"
              onClick={handleTryAgain}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 font-medium text-xs cursor-pointer transition-colors"
              title="Coba hasilkan ulang (generate ulang)"
            >
              <RotateCcw size={13} className="text-amber-500" />
              <span>Try again</span>
            </button>

            {/* Discard */}
            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 text-xs cursor-pointer transition-colors"
              title="Batalkan perubahan dan kembalikan teks asli"
            >
              <Trash2 size={13} />
              <span>Discard</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TYPEWRITER RUNNING INDICATOR PILL */}
      {isTypingEffect && activePosition && (
        <div
          className="fixed z-50 -translate-x-1/2 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/95 text-purple-100 border border-purple-700 shadow-2xl backdrop-blur-md text-xs font-sans animate-in fade-in"
          style={{
            top: `${Math.max(12, activePosition.top - 10)}px`,
            left: `${activePosition.left}px`,
          }}
        >
          <Zap size={14} className="text-amber-300 animate-pulse" />
          <span className="font-semibold">AI sedang mengetik...</span>
          <span className="inline-block w-1.5 h-3 bg-purple-400 animate-pulse ml-0.5" />
        </div>
      )}

      {/* 3. MAIN SELECTION BUBBLE MENU (When not reviewing) */}
      {!aiReviewState && !isTypingEffect && coords && (
        <div
          ref={menuRef}
          className="fixed z-50 -translate-x-1/2 flex items-center bg-white dark:bg-[#1f2228] text-stone-800 dark:text-zinc-100 rounded-xl shadow-2xl border border-stone-200 dark:border-zinc-700/80 p-1 text-xs select-none transition-all duration-75 animate-in fade-in zoom-in-95"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
        >
          {/* 1. ✨ IMPROVE AI BUTTON */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAiMenu(!showAiMenu);
                setShowToneSubmenu(false);
                setShowTranslateSubmenu(false);
                setShowBlockMenu(false);
                setShowColorMenu(false);
              }}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold cursor-pointer transition-colors shadow-xs"
            >
              {isAiLoading ? (
                <Loader2 size={13} className="animate-spin text-purple-600" />
              ) : (
                <Sparkles size={13} className="text-purple-600 dark:text-purple-400 fill-purple-500/20" />
              )}
              <span>{isAiLoading ? 'Memproses...' : 'Improve'}</span>
            </button>

            {/* AI Dropdown Menu */}
            {showAiMenu && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-sans animate-in fade-in">
                {/* Tone sub-button */}
                <div
                  onMouseEnter={() => {
                    setShowToneSubmenu(true);
                    setShowTranslateSubmenu(false);
                  }}
                  className="relative flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Wand2 size={14} className="text-purple-500" />
                    <span>Adjust tone</span>
                  </div>
                  <ChevronRight size={13} className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-zinc-200" />

                  {/* Adjust Tone Submenu */}
                  {showToneSubmenu && (
                    <div
                      onMouseLeave={() => setShowToneSubmenu(false)}
                      className="absolute left-full top-0 ml-1 w-52 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 max-h-72 overflow-y-auto space-y-0.5 z-50"
                    >
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
                        Pilih Gaya Nada
                      </div>
                      {TONE_OPTIONS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => executeAiAction('tone', t.id)}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium text-stone-800 dark:text-zinc-200">{t.label}</span>
                          <span className="text-[10px] text-stone-400 truncate max-w-[80px]">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => executeAiAction('grammar')}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
                >
                  <Check size={14} className="text-emerald-500" />
                  <span>Fix spelling & grammar</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeAiAction('improve')}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
                >
                  <Sparkles size={14} className="text-purple-500" />
                  <span>Improve writing</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeAiAction('extend')}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
                >
                  <Maximize2 size={14} className="text-sky-500" />
                  <span>Make longer</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeAiAction('reduce')}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
                >
                  <Minimize2 size={14} className="text-amber-500" />
                  <span>Make shorter</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeAiAction('simplify')}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
                >
                  <FileText size={14} className="text-blue-500" />
                  <span>Simplify language</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeAiAction('emojify')}
                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
                >
                  <Smile size={14} className="text-yellow-500" />
                  <span>Emojify</span>
                </button>

                {/* Translate Submenu */}
                <div
                  onMouseEnter={() => {
                    setShowTranslateSubmenu(true);
                    setShowToneSubmenu(false);
                  }}
                  className="relative flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Languages size={14} className="text-indigo-500" />
                    <span>Translate</span>
                  </div>
                  <ChevronRight size={13} className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-zinc-200" />

                  {showTranslateSubmenu && (
                    <div
                      onMouseLeave={() => setShowTranslateSubmenu(false)}
                      className="absolute left-full top-0 ml-1 w-52 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 max-h-60 overflow-y-auto space-y-0.5 z-50"
                    >
                      <div className="px-2 py-1 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
                        Pilih Bahasa
                      </div>
                      {TRANSLATE_OPTIONS.map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => executeAiAction('translate', lang.label)}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-800 dark:text-zinc-200 cursor-pointer"
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom AI Prompt Trigger */}
                <div className="pt-1 mt-1 border-t border-stone-100 dark:border-zinc-800">
                  {!showCustomPromptInput ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomPromptInput(true)}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-medium cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>Custom AI command...</span>
                    </button>
                  ) : (
                    <div className="p-1 space-y-1.5">
                      <input
                        type="text"
                        value={customAiPrompt}
                        onChange={(e) => setCustomAiPrompt(e.target.value)}
                        placeholder="Ketik instruksi AI..."
                        autoFocus
                        className="w-full px-2 py-1 text-xs rounded-md border border-purple-300 dark:border-purple-800 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customAiPrompt.trim()) {
                            executeAiAction('custom', customAiPrompt);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customAiPrompt.trim()) {
                            executeAiAction('custom', customAiPrompt);
                          }
                        }}
                        className="w-full py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px] cursor-pointer"
                      >
                        Jalankan AI
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-700 mx-1" />

          {/* 2. BLOCK TYPE SELECTOR */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowBlockMenu(!showBlockMenu);
                setShowAiMenu(false);
                setShowColorMenu(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 font-medium text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <span>{getCurrentBlockName()}</span>
              <ChevronDown size={12} />
            </button>

            {showBlockMenu && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1 z-50 space-y-0.5 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setParagraph().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <Heading1 size={14} />
                  <span>Heading 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <Heading2 size={14} />
                  <span>Heading 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <Heading3 size={14} />
                  <span>Heading 3</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleBulletList().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <List size={14} />
                  <span>Bullet List</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleOrderedList().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <ListOrdered size={14} />
                  <span>Numbered List</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleTaskList().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <ListTodo size={14} />
                  <span>To-do List</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleBlockquote().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <Quote size={14} />
                  <span>Quote</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleCodeBlock().run();
                    setShowBlockMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                >
                  <Code2 size={14} />
                  <span>Code Block</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-700 mx-1" />

          {/* 3. FORMATTING BUTTONS */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer ${
                editor.isActive('bold') ? 'bg-stone-200 dark:bg-zinc-700 font-bold text-rose-600' : ''
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold size={13} />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer ${
                editor.isActive('italic') ? 'bg-stone-200 dark:bg-zinc-700 italic text-rose-600' : ''
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic size={13} />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer ${
                editor.isActive('underline') ? 'bg-stone-200 dark:bg-zinc-700 underline text-rose-600' : ''
              }`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon size={13} />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer ${
                editor.isActive('strike') ? 'bg-stone-200 dark:bg-zinc-700 line-through text-rose-600' : ''
              }`}
              title="Strikethrough"
            >
              <Strikethrough size={13} />
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 font-mono cursor-pointer ${
                editor.isActive('code') ? 'bg-stone-200 dark:bg-zinc-700 text-rose-600' : ''
              }`}
              title="Inline Code"
            >
              <Code size={13} />
            </button>

            <button
              type="button"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                setLinkUrl(previousUrl || '');
                setShowLinkModal(true);
              }}
              className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer ${
                editor.isActive('link') ? 'bg-stone-200 dark:bg-zinc-700 text-rose-600' : ''
              }`}
              title="Link"
            >
              <LinkIcon size={13} />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-700 mx-1" />

          {/* 4. COLOR HIGHLIGHT BUTTON */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorMenu(!showColorMenu);
                setShowAiMenu(false);
                setShowBlockMenu(false);
              }}
              className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-0.5"
              title="Warna Sorotan"
            >
              <Palette size={13} />
              <ChevronDown size={10} />
            </button>

            {showColorMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in">
                <div className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase px-1">
                  Warna Sorotan
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {COLOR_HIGHLIGHTS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => {
                        if (!c.bg) {
                          editor.chain().focus().unsetHighlight().run();
                        } else {
                          editor.chain().focus().setHighlight({ color: c.bg }).run();
                        }
                        setShowColorMenu(false);
                      }}
                      className="flex items-center justify-between px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded border border-stone-300 dark:border-zinc-600"
                          style={{ backgroundColor: c.bg || '#ffffff' }}
                        />
                        <span>{c.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. LINK MODAL */}
      {showLinkModal && (
        <div className="fixed z-50 left-1/2 -translate-x-1/2 top-1/3 w-72 bg-white dark:bg-[#1f2228] p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-xs text-stone-700 dark:text-zinc-200">Sisipkan Tautan:</span>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
          <div className="flex gap-1">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-2 py-1 text-xs rounded border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 focus:outline-rose-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyLink();
              }}
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 5. AI THINKING STATE POPUP */}
      {isAiLoading && activePosition && (
        <div
          className="fixed z-50 -translate-x-1/2 min-w-[260px] bg-white dark:bg-[#1b1e24] border border-purple-300 dark:border-purple-900/60 rounded-xl shadow-2xl p-2.5 animate-in fade-in flex items-center gap-2.5"
          style={{
            top: `${Math.max(10, activePosition.top - 12)}px`,
            left: `${activePosition.left}px`,
          }}
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 shrink-0">
            <BrainCircuit size={15} className="text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                AI Sedang Berpikir...
              </span>
              <Loader2 size={11} className="animate-spin text-purple-600" />
            </div>
            <p className="text-[10px] text-stone-500 dark:text-zinc-400 truncate">
              {aiThinkingText}
            </p>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-sans animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-800/80 text-rose-100 backdrop-blur-md'
              : toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-800/80 text-emerald-100 backdrop-blur-md'
              : 'bg-zinc-900/95 border-zinc-800 text-zinc-100 backdrop-blur-md'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
          ) : (
            <Check size={16} className="text-emerald-400 shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </>
  );
};
