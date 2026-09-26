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
} from 'lucide-react';

interface NotionFloatingMenuProps {
  editor: Editor | null;
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

export const NotionFloatingMenu: React.FC<NotionFloatingMenuProps> = ({ editor }) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showToneSubmenu, setShowToneSubmenu] = useState(false);
  const [showTranslateSubmenu, setShowTranslateSubmenu] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [showCustomPromptInput, setShowCustomPromptInput] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Position update when text is selected in TipTap
  useEffect(() => {
    if (!editor) return;

    const updateMenuPosition = () => {
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
      // Small timeout to allow clicking menu items
      setTimeout(() => {
        if (!menuRef.current?.matches(':hover')) {
          setCoords(null);
        }
      }, 200);
    });

    return () => {
      editor.off('selectionUpdate', updateMenuPosition);
    };
  }, [editor]);

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

  if (!editor || !coords) return null;

  // Determine current block type
  const getCurrentBlockName = () => {
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

  // Execute AI action on selected text
  const executeAiAction = async (actionType: string, detail?: string) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ').trim();
    if (!selectedText) return;

    setIsAiLoading(true);
    setShowAiMenu(false);
    setShowToneSubmenu(false);
    setShowTranslateSubmenu(false);
    setShowCustomPromptInput(false);

    let prompt = '';
    switch (actionType) {
      case 'improve':
        prompt = `Sempurnakan dan tingkatkan kualitas penulisan teks berikut agar lebih elegan, padat, dan jelas. Keluarkan HANYA teks hasil yang telah disempurnakan tanpa pembuka/penutup:\n\n"${selectedText}"`;
        break;
      case 'tone':
        prompt = `Tulis ulang teks berikut dengan nada bicara (tone) "${detail}". Pastikan inti pesan tetap utuh. Keluarkan HANYA teks hasil akhir:\n\n"${selectedText}"`;
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
        prompt = `Buat ringkasan ringkas dari teks berikut dalam 1-2 kalimat padat. Keluarkan HANYA ringkasannya:\n\n"${selectedText}"`;
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
        body: JSON.stringify({ prompt, task: 'general' }),
      });

      if (!response.ok) throw new Error('AI assist request failed');
      const data = await response.json();
      const resultText = data.result?.trim() || selectedText;

      // Clean wrapping quotes if returned
      const cleanResult = resultText.replace(/^"|"$/g, '').trim();

      // Replace selection with improved text in editor
      editor.chain().focus().insertContentAt({ from, to }, cleanResult).run();
    } catch {
      // Fallback: simple client-side transformation
      let fallbackText = selectedText;
      if (actionType === 'grammar') {
        fallbackText = selectedText.charAt(0).toUpperCase() + selectedText.slice(1);
      } else if (actionType === 'emojify') {
        fallbackText = `✨ ${selectedText} 🚀`;
      }
      editor.chain().focus().insertContentAt({ from, to }, fallbackText).run();
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyLink = () => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  return (
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
              onClick={() => executeAiAction('extend')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <Maximize2 size={14} className="text-blue-500" />
              <span>Extend text</span>
            </button>

            <button
              type="button"
              onClick={() => executeAiAction('reduce')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <Minimize2 size={14} className="text-amber-500" />
              <span>Reduce text</span>
            </button>

            <button
              type="button"
              onClick={() => executeAiAction('simplify')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <FileText size={14} className="text-cyan-500" />
              <span>Simplify text</span>
            </button>

            <button
              type="button"
              onClick={() => executeAiAction('emojify')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <Smile size={14} className="text-amber-400" />
              <span>Emojify</span>
            </button>

            <div className="my-1 border-t border-stone-200 dark:border-zinc-800" />

            {/* Custom Ask AI prompt */}
            <button
              type="button"
              onClick={() => setShowCustomPromptInput(!showCustomPromptInput)}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium cursor-pointer"
            >
              <Sparkles size={14} className="text-purple-500" />
              <span>Ask AI...</span>
            </button>

            {showCustomPromptInput && (
              <div className="p-2 bg-stone-50 dark:bg-zinc-900 rounded-lg my-1 space-y-1.5">
                <input
                  type="text"
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customAiPrompt.trim()) {
                      executeAiAction('custom', customAiPrompt);
                    }
                  }}
                  placeholder="Tulis instruksi khusus..."
                  className="w-full px-2 py-1 text-xs rounded border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 focus:outline-purple-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAiPrompt.trim()) executeAiAction('custom', customAiPrompt);
                  }}
                  className="w-full py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium text-[11px] cursor-pointer"
                >
                  Kirim ke AI
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => executeAiAction('complete')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <CornerDownLeft size={14} className="text-stone-500" />
              <span>Complete sentence</span>
            </button>

            <button
              type="button"
              onClick={() => executeAiAction('summarize')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/40 text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <FileText size={14} className="text-emerald-500" />
              <span>Summarize</span>
            </button>

            {/* Translate sub-button */}
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

              {/* Translate Submenu */}
              {showTranslateSubmenu && (
                <div
                  onMouseLeave={() => setShowTranslateSubmenu(false)}
                  className="absolute left-full top-0 ml-1 w-48 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 max-h-60 overflow-y-auto space-y-0.5 z-50"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
                    Terjemahkan ke
                  </div>
                  {TRANSLATE_OPTIONS.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => executeAiAction('translate', lang.id)}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/40 font-medium text-stone-800 dark:text-zinc-200 cursor-pointer"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-stone-200 dark:border-zinc-700 mx-1" />

      {/* 2. BLOCK TYPE SELECTOR (e.g. Blockquote v, Heading 1, etc.) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowBlockMenu(!showBlockMenu);
            setShowAiMenu(false);
            setShowColorMenu(false);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-200 font-medium cursor-pointer"
        >
          <span>{getCurrentBlockName()}</span>
          <ChevronDown size={11} className="text-stone-400" />
        </button>

        {showBlockMenu && (
          <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1 z-50 space-y-0.5 text-xs animate-in fade-in">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer"
            >
              <FileText size={13} className="text-stone-500" />
              <span>Text (Paragraph)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer font-bold"
            >
              <Heading1 size={13} />
              <span>Heading 1</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer font-semibold"
            >
              <Heading2 size={13} />
              <span>Heading 2</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer"
            >
              <Heading3 size={13} />
              <span>Heading 3</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleBulletList().run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer"
            >
              <List size={13} />
              <span>Bullet List</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleOrderedList().run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer"
            >
              <ListOrdered size={13} />
              <span>Numbered List</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleTaskList().run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer"
            >
              <ListTodo size={13} />
              <span>Task List</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleBlockquote().run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer"
            >
              <Quote size={13} />
              <span>Blockquote</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleCodeBlock().run();
                setShowBlockMenu(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-800 dark:text-zinc-200 cursor-pointer font-mono"
            >
              <Code2 size={13} />
              <span>Code Block</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-stone-200 dark:border-zinc-700 mx-1" />

      {/* 3. INLINE FORMATTING BUTTONS (Bold, Italic, Underline, Strike, Code, Link, Color) */}
      <div className="flex items-center gap-0.5">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
            editor.isActive('bold') ? 'bg-stone-200 dark:bg-zinc-700 font-bold text-rose-600 dark:text-rose-400' : ''
          }`}
          title="Tebal (Ctrl+B)"
        >
          <Bold size={13} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
            editor.isActive('italic') ? 'bg-stone-200 dark:bg-zinc-700 font-bold text-rose-600 dark:text-rose-400' : ''
          }`}
          title="Miring (Ctrl+I)"
        >
          <Italic size={13} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
            editor.isActive('underline') ? 'bg-stone-200 dark:bg-zinc-700 font-bold text-rose-600 dark:text-rose-400' : ''
          }`}
          title="Garis Bawah (Ctrl+U)"
        >
          <UnderlineIcon size={13} />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
            editor.isActive('strike') ? 'bg-stone-200 dark:bg-zinc-700 font-bold text-rose-600 dark:text-rose-400' : ''
          }`}
          title="Coretan"
        >
          <Strikethrough size={13} />
        </button>

        {/* Inline Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
            editor.isActive('code') ? 'bg-stone-200 dark:bg-zinc-700 font-bold text-rose-600 dark:text-rose-400' : ''
          }`}
          title="Kode Baris (Ctrl+E)"
        >
          <Code size={13} />
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const currentHref = editor.getAttributes('link').href || '';
            setLinkUrl(currentHref);
            setShowLinkModal(!showLinkModal);
          }}
          className={`p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
            editor.isActive('link') ? 'bg-stone-200 dark:bg-zinc-700 text-rose-600 dark:text-rose-400' : ''
          }`}
          title="Tautan Web"
        >
          <LinkIcon size={13} />
        </button>

        {/* Color / Highlight */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorMenu(!showColorMenu);
              setShowAiMenu(false);
              setShowBlockMenu(false);
            }}
            className="flex items-center gap-0.5 p-1.5 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            title="Warna Teks & Sorotan"
          >
            <span className="font-serif font-bold text-xs underline decoration-2 decoration-rose-500">A</span>
            <ChevronDown size={10} className="text-stone-400" />
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

      {/* Link Input Modal */}
      {showLinkModal && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white dark:bg-[#1f2228] p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 shadow-2xl z-50 animate-in fade-in">
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
    </div>
  );
};
