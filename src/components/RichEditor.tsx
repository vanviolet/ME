import React, { useState, useRef, useMemo } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Sigma,
  BookOpen,
  Eye,
  Edit3,
  Columns,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  Minus,
  Wand2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { renderMarkdownWithMath } from '../lib/renderMath';
import { handleCodeBlockContainerClick } from '../utils/codeRunner';
import { formatCodeWithPrettier } from '../utils/codeFormatter';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  height?: string;
  label?: string;
  required?: boolean;
  vanpediaTerms?: { slug: string; title: string }[];
}

export const RichEditor: React.FC<RichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis konten artikel dalam format Markdown...',
  minHeight = '360px',
  label,
  required = false,
  vanpediaTerms = [],
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVanpediaPicker, setShowVanpediaPicker] = useState(false);
  const [showCodeSnippetsMenu, setShowCodeSnippetsMenu] = useState(false);
  const [isFormattingDoc, setIsFormattingDoc] = useState(false);
  const [formatDocSuccess, setFormatDocSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const vanpediaMenuRef = useRef<HTMLDivElement>(null);
  const codeMenuRef = useRef<HTMLDivElement>(null);

  // Undo/Redo history stack
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef<number>(0);
  const isUndoRedoAction = useRef<boolean>(false);

  const pushHistory = (newVal: string) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    const currentHist = historyRef.current.slice(0, historyIndexRef.current + 1);
    currentHist.push(newVal);
    if (currentHist.length > 50) currentHist.shift();
    historyRef.current = currentHist;
    historyIndexRef.current = currentHist.length - 1;
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      isUndoRedoAction.current = true;
      const prevVal = historyRef.current[historyIndexRef.current];
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      isUndoRedoAction.current = true;
      const nextVal = historyRef.current[historyIndexRef.current];
      onChange(nextVal);
    }
  };

  // Insert markdown snippet at current cursor or selection
  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const nextVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    pushHistory(nextVal);
    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  // Format the entire Markdown document or code blocks with Prettier
  const handleFormatAllWithPrettier = async () => {
    setIsFormattingDoc(true);
    try {
      const res = await formatCodeWithPrettier(value, 'markdown');
      if (res.code) {
        pushHistory(res.code);
        onChange(res.code);
        setFormatDocSuccess(true);
        setTimeout(() => setFormatDocSuccess(false), 2000);
      }
    } finally {
      setIsFormattingDoc(false);
    }
  };

  // Simple keydown shortcuts (Ctrl+B, Ctrl+I, Tab, Prettier)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertText('**', '**', 'teks tebal');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertText('*', '*', 'teks miring');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }
    if (e.shiftKey && (e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      handleFormatAllWithPrettier();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ', '', '');
      return;
    }
  };

  // Word & Character Statistics
  const stats = useMemo(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const chars = value.length;
    const readTimeMin = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readTimeMin };
  }, [value]);

  // Markdown to HTML preview renderer with KaTeX math & rich interactive code blocks
  const previewHtml = useMemo(() => {
    if (!value.trim()) return '';
    try {
      return renderMarkdownWithMath(value, {
        getTerm: (s) => {
          const item = vanpediaTerms.find((t) => t.slug === s);
          return item ? { title: item.title } : undefined;
        },
      });
    } catch {
      return '<p class="text-rose-500">Gagal memproses Markdown.</p>';
    }
  }, [value, vanpediaTerms]);

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleCodeBlockContainerClick(e);
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#15171b] border border-stone-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all shadow-2xs ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : 'relative'
      }`}
    >
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-stone-50/90 dark:bg-[#181a1f] border-b border-stone-200 dark:border-zinc-800 select-none">
        <div className="flex items-center gap-2">
          {label && (
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
              {label}
            </label>
          )}
          <span className="text-[11px] text-stone-400 dark:text-zinc-500 hidden sm:inline">
            {stats.words} kata • {stats.chars} karakter • ~{stats.readTimeMin} min baca
          </span>
        </div>

        {/* View Mode Switcher & Fullscreen */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Prettier Format All Button */}
          <button
            type="button"
            onClick={handleFormatAllWithPrettier}
            disabled={isFormattingDoc}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              formatDocSuccess
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                : 'bg-stone-200/60 dark:bg-zinc-800/80 hover:bg-stone-300 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 border-stone-300 dark:border-zinc-700'
            }`}
            title="Rapikan seluruh dokumen dengan Prettier (Shift+Alt+F)"
          >
            <Wand2 size={12} className={isFormattingDoc ? 'animate-spin' : 'text-amber-500'} />
            <span className="hidden sm:inline">{formatDocSuccess ? 'Diformat ✨' : 'Prettier'}</span>
          </button>

          <div className="flex items-center gap-0.5 bg-stone-200/70 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              <Edit3 size={12} />
              <span>Tulis</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              <Columns size={12} />
              <span>Split</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              <Eye size={12} />
              <span>Pratinjau</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 cursor-pointer transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* MARKDOWN & CODE SNIPPET TOOLBAR */}
      {viewMode !== 'preview' && (
        <div className="flex flex-wrap items-center gap-1 px-3.5 py-2 bg-stone-100/60 dark:bg-[#16181d] border-b border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 text-xs shrink-0 select-none">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('\n# ', '\n', 'Judul H1')}
              className="px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 font-extrabold text-[12px] cursor-pointer"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertText('\n## ', '\n', 'Subjudul H2')}
              className="px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 font-bold text-[12px] cursor-pointer"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertText('\n### ', '\n', 'Subjudul H3')}
              className="px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 font-semibold text-[12px] cursor-pointer"
              title="Heading 3"
            >
              H3
            </button>
          </div>

          {/* Bold, Italic, Strike */}
          <button
            type="button"
            onClick={() => insertText('**', '**', 'teks tebal')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Tebal (Ctrl+B)"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*', 'teks miring')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Miring (Ctrl+I)"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onClick={() => insertText('~~', '~~', 'teks tercoret')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Coretan"
          >
            <Strikethrough size={14} />
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => insertText('\n- ', '', 'Item daftar')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Daftar Poin (Bullet List)"
          >
            <List size={14} />
          </button>
          <button
            type="button"
            onClick={() => insertText('\n1. ', '', 'Langkah pertama')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Daftar Berurutan (Numbered List)"
          >
            <ListOrdered size={14} />
          </button>
          <button
            type="button"
            onClick={() => insertText('\n- [ ] ', '', 'Tugas baru')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Checklist Tugas"
          >
            <ListTodo size={14} />
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" />

          {/* Quote & Inline Code */}
          <button
            type="button"
            onClick={() => insertText('\n> ', '\n', 'Kutipan penting...')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Kutipan (Blockquote)"
          >
            <Quote size={14} />
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`', 'kode_inline')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer font-mono"
            title="Kode Inline (`code`)"
          >
            <Code size={14} />
          </button>

          {/* CODE SNIPPET INSERT MENU (Interactive Code Blocks) */}
          <div className="relative" ref={codeMenuRef}>
            <button
              type="button"
              onClick={() => setShowCodeSnippetsMenu(!showCodeSnippetsMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-200/70 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer font-mono text-[11px] font-semibold text-rose-600 dark:text-rose-400 transition-colors"
              title="Sisipkan Blok Kode Snippet dengan Error Lens & Runner"
            >
              <span>Code Snippet</span>
              <ChevronDown size={11} />
            </button>

            {showCodeSnippetsMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#1a1c21] rounded-xl shadow-xl border border-stone-200 dark:border-zinc-800 p-1.5 z-50 space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 dark:border-zinc-800">
                  Pilih Bahasa Snippet
                </div>
                <button
                  type="button"
                  onClick={() => {
                    insertText(
                      '\n```javascript\n// JavaScript Snippet (Runnable & Error Lens)\nfunction calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n\nconsole.log("Total:", calculateTotal([{ price: 100 }, { price: 250 }]));\n```\n'
                    );
                    setShowCodeSnippetsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-amber-500">JavaScript</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">Run</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertText(
                      '\n```typescript\n// TypeScript Snippet\ninterface UserProfile {\n  id: string;\n  name: string;\n  role: "admin" | "member";\n}\n\nconst user: UserProfile = {\n  id: "u1",\n  name: "Van Violet",\n  role: "admin",\n};\n```\n'
                    );
                    setShowCodeSnippetsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-blue-400">TypeScript</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded">Types</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertText(
                      '\n```json\n{\n  "title": "Dokumentasi API",\n  "version": "2.0.0",\n  "status": "active"\n}\n```\n'
                    );
                    setShowCodeSnippetsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-emerald-400">JSON</span>
                  <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1 py-0.5 rounded">Prettier</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertText(
                      '\n```python\n# Python Snippet\ndef greet(name: str) -> str:\n    return f"Halo {name}, selamat datang!"\n\nprint(greet("Van"))\n```\n'
                    );
                    setShowCodeSnippetsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-sky-400">Python</span>
                  <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1 py-0.5 rounded">PEP8</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertText(
                      '\n```html\n<div class="card p-4 rounded-xl shadow-md">\n  <h2 class="text-lg font-bold">Judul Kartu</h2>\n  <p>Deskripsi komponen antarmuka</p>\n</div>\n```\n'
                    );
                    setShowCodeSnippetsMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-orange-400">HTML / XML</span>
                  <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1 py-0.5 rounded">DOM</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-stone-300 dark:bg-zinc-700 mx-1" />

          {/* Links, Images, Tables */}
          <button
            type="button"
            onClick={() => insertText('[', '](https://example.com)', 'Teks Tautan')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Tautan [Label](URL)"
          >
            <LinkIcon size={14} />
          </button>
          <button
            type="button"
            onClick={() => insertText('![Deskripsi Gambar](', ')', 'https://images.unsplash.com/...')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Gambar ![Alt](URL)"
          >
            <ImageIcon size={14} />
          </button>
          <button
            type="button"
            onClick={() =>
              insertText(
                '\n| Kolom 1 | Kolom 2 |\n| :--- | :--- |\n| Baris 1 | Baris 1 |\n| Baris 2 | Baris 2 |\n'
              )
            }
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Tabel Markdown"
          >
            <TableIcon size={14} />
          </button>
          <button
            type="button"
            onClick={() => insertText('\n---\n')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Garis Horizontal (---)"
          >
            <Minus size={14} />
          </button>

          {/* Math Formula */}
          <button
            type="button"
            onClick={() => insertText('$', '$', 'E = mc^2')}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Formula Matematika ($formula$)"
          >
            <Sigma size={14} />
          </button>

          {/* Wiki Link to Vanpedia */}
          {vanpediaTerms.length > 0 && (
            <div className="relative" ref={vanpediaMenuRef}>
              <button
                type="button"
                onClick={() => setShowVanpediaPicker(!showVanpediaPicker)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold cursor-pointer text-xs"
                title="Tautkan ke Istilah Vanpedia ([[slug]])"
              >
                <BookOpen size={13} className="text-rose-600 dark:text-rose-400" />
                <span>Vanpedia</span>
              </button>

              {showVanpediaPicker && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#1a1c21] rounded-xl shadow-xl border border-stone-200 dark:border-zinc-800 p-2 z-50 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Pilih Istilah Vanpedia
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {vanpediaTerms.map((term) => (
                      <button
                        key={term.slug}
                        type="button"
                        onClick={() => {
                          insertText(`[[${term.slug}]]`);
                          setShowVanpediaPicker(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                      >
                        <span className="font-medium block">{term.title}</span>
                        <span className="text-[10px] font-mono text-stone-400">
                          [[{term.slug}]]
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Undo & Redo */}
          <div className="flex items-center gap-0.5 ml-auto">
            <button
              type="button"
              onClick={handleUndo}
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
              title="Urungkan (Ctrl+Z)"
            >
              <Undo size={13} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
              title="Ulangi (Ctrl+Y)"
            >
              <Redo size={13} />
            </button>
          </div>
        </div>
      )}

      {/* EDITOR & PREVIEW PANES */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {viewMode === 'split' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-zinc-800 min-h-0">
            <textarea
              ref={textareaRef}
              required={required}
              value={value}
              onChange={(e) => {
                pushHistory(e.target.value);
                onChange(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full h-full p-4 sm:p-6 bg-stone-50/40 dark:bg-[#141518] text-stone-900 dark:text-zinc-100 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-y-auto"
            />
            <div
              style={{ minHeight }}
              data-article-content
              onClick={handlePreviewClick}
              className="p-4 sm:p-6 bg-white dark:bg-[#15171b] overflow-y-auto text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: previewHtml || '<p class="text-stone-400 italic">Pratinjau kosong...</p>',
              }}
            />
          </div>
        ) : viewMode === 'preview' ? (
          <div
            style={{ minHeight }}
            data-article-content
            onClick={handlePreviewClick}
            className="flex-1 p-6 sm:p-8 bg-white dark:bg-[#15171b] overflow-y-auto text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                previewHtml || '<p class="text-stone-400 italic">Belum ada konten untuk ditampilkan...</p>',
            }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            required={required}
            value={value}
            onChange={(e) => {
              pushHistory(e.target.value);
              onChange(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full h-full p-4 sm:p-6 bg-white dark:bg-[#15171b] text-stone-900 dark:text-zinc-100 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-y-auto min-h-[360px]"
          />
        )}
      </div>
    </div>
  );
};
