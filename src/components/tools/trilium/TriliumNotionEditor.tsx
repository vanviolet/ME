import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link as LinkExtension } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { NotionFloatingMenu } from '../../notion-editor/NotionFloatingMenu';
import { NotionBlockGutter } from '../../notion-editor/NotionBlockGutter';
import { NotionSlashMenu } from '../../notion-editor/NotionSlashMenu';
import { handleCodeBlockContainerClick, isRunnableLanguage, executeJavaScriptCode } from '../../../utils/codeRunner';
import {
  Sparkles,
  Code2,
  Table as TableIcon,
  Plus,
  Play,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  X,
  RotateCcw,
  Wand2,
} from 'lucide-react';
import { RICH_CODE_LANGUAGES } from '../NotesNotebookPage';

const lowlightInstance = createLowlight(common);

interface TriliumNotionEditorProps {
  content: string;
  noteTitle: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const TriliumNotionEditor: React.FC<TriliumNotionEditorProps> = ({
  content,
  noteTitle,
  onChange,
  placeholder = 'Ketik "/" untuk perintah blok Notion, atau blok teks untuk menu ✨ Improve (AI)...',
  minHeight = '480px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Quick Table & Code popovers
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isCodeDropdownOpen, setIsCodeDropdownOpen] = useState(false);
  const tableBtnRef = useRef<HTMLDivElement>(null);
  const codeBtnRef = useRef<HTMLDivElement>(null);

  // Sandboxed Code Execution Drawer in Trilium Notes
  const [showConsoleDrawer, setShowConsoleDrawer] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: 'log' | 'warn' | 'error' | 'info'; text: string; time: string }[]>([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'trilium-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-rose-600 dark:text-rose-400 underline font-medium cursor-pointer',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: lowlightInstance,
        defaultLanguage: 'typescript',
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'tiptap-content outline-none focus:outline-none min-h-[420px] p-6 text-stone-900 dark:text-zinc-100 font-sans leading-relaxed text-sm sm:text-base',
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      onChange(html);
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
  });

  // Synchronize when external note changes
  useEffect(() => {
    if (!editor || isInternalUpdate.current) return;
    const currentHTML = editor.getHTML();
    if (content !== currentHTML) {
      editor.commands.setContent(content || '<p></p>', { emitUpdate: false });
    }
  }, [content, editor]);

  // Close popovers on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (tableBtnRef.current && !tableBtnRef.current.contains(e.target as Node)) {
        setIsTableDropdownOpen(false);
      }
      if (codeBtnRef.current && !codeBtnRef.current.contains(e.target as Node)) {
        setIsCodeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Quick Table Inserter
  const insertTable = (rows: number, cols: number) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setIsTableDropdownOpen(false);
  };

  // Quick Code Block Inserter
  const insertCodeBlock = (lang: string) => {
    if (!editor) return;
    editor.chain().focus().toggleCodeBlock({ language: lang }).run();
    setIsCodeDropdownOpen(false);
  };

  // Run first code block in document or selected code block
  const handleRunActiveCode = () => {
    if (!editor) return;
    setIsRunningCode(true);
    setShowConsoleDrawer(true);

    try {
      // Find code from pre/code elements in current document
      const preEls = containerRef.current?.querySelectorAll('pre code');
      let targetCode = '';
      if (preEls && preEls.length > 0) {
        targetCode = preEls[0].textContent || '';
      }

      if (!targetCode.trim()) {
        setConsoleLogs([
          {
            type: 'warn',
            text: 'Tidak ada blok kode JavaScript/TypeScript yang ditemukan di catatan ini.',
            time: new Date().toLocaleTimeString(),
          },
        ]);
        setIsRunningCode(false);
        return;
      }

      const resultLogs = executeJavaScriptCode(targetCode);
      setConsoleLogs(resultLogs);
    } catch (err: any) {
      setConsoleLogs([
        {
          type: 'error',
          text: err?.message || String(err),
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsRunningCode(false);
    }
  };

  const isInsideTable = editor?.isActive('table');
  const isInsideCode = editor?.isActive('codeBlock');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#15171b]">
      {/* NOTION EDITOR TOP CONVENIENCE BAR */}
      <div className="px-4 py-2 bg-stone-50/90 dark:bg-[#181a1f] border-b border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 select-none">
        
        {/* Left: Notion badge & Quick Blocks */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
            <Sparkles size={12} className="text-purple-600 dark:text-purple-400 animate-pulse" />
            <span>Notion AI Editor</span>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-700 mx-1 hidden sm:block" />

          {/* Code Block Dropdown */}
          <div className="relative" ref={codeBtnRef}>
            <button
              type="button"
              onClick={() => setIsCodeDropdownOpen(!isCodeDropdownOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                isInsideCode
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 border-stone-200 dark:border-zinc-700 hover:border-rose-400'
              }`}
              title="Sisipkan Blok Kode dengan Syntax Highlighting"
            >
              <Code2 size={13} className={isInsideCode ? 'text-white' : 'text-rose-600 dark:text-rose-400'} />
              <span>Blok Kode</span>
              <ChevronDown size={11} />
            </button>

            {isCodeDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#1a1c21] rounded-xl shadow-xl border border-stone-200 dark:border-zinc-800 p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Pilih Bahasa Kode
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {RICH_CODE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => insertCodeBlock(lang.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer transition-colors"
                    >
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-[10px] font-mono text-stone-400 dark:text-zinc-500">
                        {lang.ext}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Table Dropdown */}
          <div className="relative" ref={tableBtnRef}>
            <button
              type="button"
              onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                isInsideTable
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 border-stone-200 dark:border-zinc-700 hover:border-rose-400'
              }`}
              title="Sisipkan Tabel"
            >
              <TableIcon size={13} className="text-rose-600 dark:text-rose-400" />
              <span>Tabel</span>
              <ChevronDown size={11} />
            </button>

            {isTableDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#1a1c21] rounded-xl shadow-xl border border-stone-200 dark:border-zinc-800 p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Sisipkan Ukuran Tabel
                </div>
                <button
                  type="button"
                  onClick={() => insertTable(2, 2)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                >
                  Tabel 2 × 2
                </button>
                <button
                  type="button"
                  onClick={() => insertTable(3, 3)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                >
                  Tabel 3 × 3 (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => insertTable(4, 3)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                >
                  Tabel 4 × 3
                </button>
              </div>
            )}
          </div>

          {/* Contextual Table Controls */}
          {isInsideTable && (
            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg px-2 py-0.5 text-[11px] animate-fadeIn">
              <button
                type="button"
                onClick={() => editor?.chain().focus().addRowAfter().run()}
                className="px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer font-medium"
              >
                + Baris
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().addColumnAfter().run()}
                className="px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer font-medium"
              >
                + Kolom
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().deleteRow().run()}
                className="px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer font-medium"
              >
                - Baris
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().deleteTable().run()}
                className="px-1.5 py-0.5 rounded hover:bg-rose-200 dark:hover:bg-rose-800/60 text-rose-800 dark:text-rose-200 cursor-pointer font-bold"
              >
                Hapus
              </button>
            </div>
          )}

          {/* Run Code Block Button */}
          <button
            type="button"
            onClick={handleRunActiveCode}
            disabled={isRunningCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer transition-colors shadow-2xs"
            title="Jalankan Kode JS/TS dalam Catatan"
          >
            <Play size={12} fill="currentColor" />
            <span>Jalankan Kode</span>
          </button>
        </div>

        {/* Right: Quick shortcuts tips */}
        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-zinc-400">
          <span className="hidden md:inline">
            Ketik <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono text-[10px] shadow-2xs">/</kbd> untuk perintah blok
          </span>
          <span className="hidden lg:inline text-stone-300 dark:text-zinc-600">•</span>
          <span className="hidden lg:inline">
            Blok teks untuk menu <strong className="text-purple-600 dark:text-purple-400">✨ Improve</strong>
          </span>
          {consoleLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-200/80 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-900 cursor-pointer"
            >
              <Terminal size={11} />
              <span>Output ({consoleLogs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN NOTION EDITOR CANVAS WITH BUBBLE MENU, GUTTER & SLASH MENU */}
      <div
        ref={containerRef}
        onClick={handleCodeBlockContainerClick}
        className="relative flex-1 p-4 sm:p-8 bg-white dark:bg-[#15171b] overflow-y-auto select-text notion-like-canvas"
        style={{ minHeight }}
      >
        {/* 1. NOTION SELECTION BUBBLE MENU (✨ Improve, AI Dropdown, Block type, Format) */}
        <NotionFloatingMenu editor={editor} />

        {/* 2. NOTION DRAG & DROP BLOCK GUTTER (::: drag handle and block action menu) */}
        <NotionBlockGutter editor={editor} editorContainerRef={containerRef} />

        {/* 3. NOTION SLASH COMMAND MENU (/ quick inserter) */}
        <NotionSlashMenu editor={editor} />

        {/* 4. MAIN PROSEMIRROR EDITABLE CANVAS */}
        <EditorContent editor={editor} />
      </div>

      {/* 5. CODE OUTPUT CONSOLE DRAWER */}
      {showConsoleDrawer && (
        <div className="border-t border-stone-200 dark:border-zinc-800 bg-[#1e1e1e] text-zinc-100 text-xs shrink-0 max-h-56 flex flex-col z-30 animate-fadeIn">
          <div className="px-4 py-2 bg-[#252526] border-b border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-zinc-300">
              <Terminal size={13} className="text-emerald-400" />
              <span>Trilium Code Execution Console</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-700 text-zinc-300 font-sans">
                {consoleLogs.length} pesan
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded cursor-pointer"
                title="Bersihkan konsol"
              >
                <RotateCcw size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowConsoleDrawer(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded cursor-pointer"
                title="Tutup konsol"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="p-3 overflow-y-auto font-mono text-xs space-y-1.5">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 leading-relaxed ${
                  log.type === 'error'
                    ? 'text-rose-400'
                    : log.type === 'warn'
                    ? 'text-amber-300'
                    : log.type === 'info'
                    ? 'text-sky-300'
                    : 'text-zinc-200'
                }`}
              >
                <span className="text-zinc-500 text-[10px] select-none shrink-0">
                  [{log.time}]
                </span>
                <span className="font-semibold uppercase text-[10px] select-none shrink-0 opacity-70">
                  {log.type}:
                </span>
                <pre className="font-mono whitespace-pre-wrap break-all flex-1 m-0 p-0 bg-transparent border-none">
                  {log.text}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
