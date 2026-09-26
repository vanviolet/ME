import React, { useState, useRef, useMemo, useEffect } from 'react';
import { marked } from 'marked';
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
  Sparkles,
  Copy,
  Check,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  ChevronDown,
  FileCode,
  Minus,
  Search,
  Terminal,
  Play,
  X,
} from 'lucide-react';
import { renderInlineFormula, renderTextWithMath } from '../lib/renderMath';
import {
  CodeLanguage,
  getCompletions,
  CompletionItem,
} from './tools/trilium/codeLanguageSupport';
import {
  findCodeBlockAtCursor,
  isRunnableLanguage,
  executeJavaScriptCode,
  renderRichCodeCardHtml,
  handleCodeBlockContainerClick,
  ConsoleLogEntry,
} from '../utils/codeRunner';

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

const CODE_LANGUAGES = [
  { id: 'typescript', label: 'TypeScript', ext: '.ts' },
  { id: 'javascript', label: 'JavaScript', ext: '.js' },
  { id: 'python', label: 'Python', ext: '.py' },
  { id: 'html', label: 'HTML', ext: '.html' },
  { id: 'css', label: 'CSS', ext: '.css' },
  { id: 'sql', label: 'SQL', ext: '.sql' },
  { id: 'json', label: 'JSON', ext: '.json' },
  { id: 'rust', label: 'Rust', ext: '.rs' },
  { id: 'go', label: 'Go', ext: '.go' },
  { id: 'bash', label: 'Bash / Shell', ext: '.sh' },
  { id: 'markdown', label: 'Markdown', ext: '.md' },
];

export const RichEditor: React.FC<RichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis konten menggunakan Markdown, heading, formula, dan tautan [[slug]]...',
  minHeight = '360px',
  label,
  required = false,
  vanpediaTerms = [
    { slug: 'machine-learning', title: 'Machine Learning' },
    { slug: 'backpropagation', title: 'Backpropagation Algorithm' },
    { slug: 'floating-point', title: 'IEEE 754 Floating-Point' },
    { slug: 'bcrypt', title: 'Bcrypt Hash Function' },
    { slug: 'neural-networks', title: 'Neural Networks' },
  ],
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [showVanpediaPicker, setShowVanpediaPicker] = useState(false);
  const [showCodeLangPicker, setShowCodeLangPicker] = useState(false);
  const [vanpediaSearch, setVanpediaSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeMenuRef = useRef<HTMLDivElement>(null);
  const vanpediaMenuRef = useRef<HTMLDivElement>(null);

  // Active Code Block & Autocomplete states
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([]);
  const [selectedCompletionIndex, setSelectedCompletionIndex] = useState<number>(0);
  const [completionPos, setCompletionPos] = useState<{ top: number; left: number }>({ top: 40, left: 60 });

  // Console Drawer states for running JavaScript
  const [showConsoleDrawer, setShowConsoleDrawer] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([]);

  // Detect active code block at cursor
  const activeCodeBlock = useMemo(() => {
    return findCodeBlockAtCursor(value, cursorPos);
  }, [value, cursorPos]);

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
    // Limit to 50 entries
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

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (codeMenuRef.current && !codeMenuRef.current.contains(e.target as Node)) {
        setShowCodeLangPicker(false);
      }
      if (vanpediaMenuRef.current && !vanpediaMenuRef.current.contains(e.target as Node)) {
        setShowVanpediaPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check whether current cursor or text selection is bold
  const checkSelectionFormatting = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (start !== end) {
      const selected = text.substring(start, end);
      // Case 1: user selected text that starts and ends with **
      if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
        setIsBoldActive(true);
        return;
      }
      // Case 2: surrounding characters are ** (e.g. user selected inside **text**)
      if (
        start >= 2 &&
        end + 2 <= text.length &&
        text.slice(start - 2, start) === '**' &&
        text.slice(end, end + 2) === '**'
      ) {
        setIsBoldActive(true);
        return;
      }
    }
    setIsBoldActive(false);
  };

  // Smart Bold Toggle: accurately bolds or unbolds selection
  const handleToggleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (start !== end) {
      const selected = text.substring(start, end);

      // If selected text already wrapped with **
      if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
        const unbolded = selected.slice(2, -2);
        const newText = text.substring(0, start) + unbolded + text.substring(end);
        pushHistory(newText);
        onChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + unbolded.length);
          checkSelectionFormatting();
        }, 0);
        return;
      }

      // If surrounding characters are ** (e.g. user selected text inside **text**)
      if (
        start >= 2 &&
        end + 2 <= text.length &&
        text.slice(start - 2, start) === '**' &&
        text.slice(end, end + 2) === '**'
      ) {
        const newText = text.substring(0, start - 2) + selected + text.substring(end + 2);
        pushHistory(newText);
        onChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start - 2, end - 2);
          checkSelectionFormatting();
        }, 0);
        return;
      }

      // Otherwise, wrap in **
      const bolded = `**${selected}**`;
      const newText = text.substring(0, start) + bolded + text.substring(end);
      pushHistory(newText);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
        checkSelectionFormatting();
      }, 0);
      return;
    }

    // No selection: insert bold placeholder
    insertText('**', '**', 'teks tebal');
  };

  // Insert or wrap text at cursor position
  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultText;

    const replacement = `${before}${selected}${after}`;
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    pushHistory(newValue);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + before.length + selected.length;
      textarea.setSelectionRange(newCursor, newCursor);
      checkSelectionFormatting();
    }, 10);
  };

  // Insert code block with specific language
  const handleInsertCodeBlock = (langId: string) => {
    insertText(`\n\`\`\`${langId}\n`, '\n\`\`\`\n', `// Tulis kode ${langId} di sini`);
    setShowCodeLangPicker(false);
  };

  // Parse markdown with KaTeX math, distinct Vanpedia badges, and interactive code blocks for preview
  const previewHtml = useMemo(() => {
    try {
      let preprocessed = value;

      // Replace [[slug]] or [[slug|label]] with visually distinct span tags for preview
      preprocessed = preprocessed.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, slug, label) => {
        const text = (label || slug).trim();
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-semibold"><span>📖</span><span>${text}</span></span>`;
      });

      // Render math formulas ($$...$$ for display, $...$ for inline)
      preprocessed = preprocessed.replace(/\$\$([\s\S]+?)\$\$/g, (_match, formula) => {
        const rendered = renderInlineFormula(formula);
        return `<div class="my-4 py-2 px-4 rounded-xl bg-stone-100/80 dark:bg-zinc-800/80 overflow-x-auto text-center">${rendered}</div>`;
      });
      preprocessed = renderTextWithMath(preprocessed);

      // Render fenced code blocks as interactive code cards
      preprocessed = preprocessed.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
        return `\n\n` + renderRichCodeCardHtml(code, lang) + `\n\n`;
      });

      return marked.parse(preprocessed, { gfm: true, breaks: true, async: false }) as string;
    } catch {
      return '<p class="text-stone-500 italic">Gagal merender pratinjau markdown.</p>';
    }
  }, [value]);

  // Trigger IntelliSense autocomplete popup
  const triggerAutocomplete = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart || 0;
    const block = findCodeBlockAtCursor(value, pos);
    const lang = (block?.lang || 'javascript') as CodeLanguage;
    const code = block ? block.code : value;
    const offset = block ? block.relativeCursor : pos;

    const items = getCompletions(code, offset, lang);
    if (items && items.length > 0) {
      setCompletionItems(items);
      setSelectedCompletionIndex(0);
      setShowCompletion(true);

      const before = value.slice(0, pos);
      const lines = before.split('\n');
      const lineNum = lines.length;
      const colNum = lines[lines.length - 1].length;

      const top = Math.min(Math.max(20, lineNum * 22 + 40 - textarea.scrollTop), 340);
      const left = Math.min(Math.max(20, colNum * 8 + 40), 400);
      setCompletionPos({ top, left });
    }
  };

  // Apply chosen autocomplete completion
  const applyCompletion = (item: CompletionItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart || 0;
    const before = value.slice(0, pos);
    const match = before.match(/([a-zA-Z0-9_$.:-]+)$/);
    const replaceLen = match ? match[1].length : 0;
    const start = pos - replaceLen;

    const newValue = value.slice(0, start) + item.insertText + value.slice(pos);
    pushHistory(newValue);
    onChange(newValue);
    setShowCompletion(false);

    const newPos = start + item.insertText.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
        setCursorPos(newPos);
      }
    }, 10);
  };

  // Editor keyboard events (IntelliSense navigation, Ctrl+Space, Ctrl+Enter)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCompletion && completionItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCompletionIndex((prev) => (prev + 1) % completionItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCompletionIndex((prev) => (prev - 1 + completionItems.length) % completionItems.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyCompletion(completionItems[selectedCompletionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCompletion(false);
        return;
      }
    }

    // Ctrl+Space triggers Autocomplete
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault();
      triggerAutocomplete();
      return;
    }

    // Ctrl+Enter runs JavaScript if within a runnable code block
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (activeCodeBlock && isRunnableLanguage(activeCodeBlock.lang)) {
        e.preventDefault();
        handleRunJsSnippet(activeCodeBlock.code);
        return;
      }
    }
  };

  // Run JavaScript code snippet safely
  const handleRunJsSnippet = (code: string) => {
    const logs = executeJavaScriptCode(code);
    setConsoleLogs(logs);
    setShowConsoleDrawer(true);
  };

  // Preview container click handler for running and copying code
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleCodeBlockContainerClick(e);
  };

  // Statistics
  const stats = useMemo(() => {
    const chars = value.length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const lines = value ? value.split('\n').length : 0;
    const readTimeMin = Math.max(1, Math.ceil(words / 200));
    return { chars, words, lines, readTimeMin };
  }, [value]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredVanpediaTerms = useMemo(() => {
    if (!vanpediaSearch.trim()) return vanpediaTerms;
    const q = vanpediaSearch.toLowerCase();
    return vanpediaTerms.filter(
      (t) => t.title.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [vanpediaTerms, vanpediaSearch]);

  return (
    <div
      className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#15171b] overflow-hidden shadow-xs transition-all flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Top Header & View Modes */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-stone-50 dark:bg-[#181a1f] border-b border-stone-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
              {label} {required && <span className="text-rose-500">*</span>}
            </span>
          )}
          <span className="text-[11px] text-stone-400 dark:text-zinc-500 hidden sm:inline">
            {stats.words} kata • {stats.chars} karakter • ~{stats.readTimeMin} min baca
          </span>
        </div>

        {/* View Mode Controls & Fullscreen */}
        <div className="flex items-center gap-1.5 ml-auto">
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

      {/* Formatting Toolbar */}
      {viewMode !== 'preview' && (
        <div className="flex flex-wrap items-center gap-1 px-3.5 py-2 bg-stone-100/60 dark:bg-[#16181d] border-b border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 text-xs shrink-0 select-none">
          {/* Headings Hierarchy (H1, H2, H3) */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('\n# ', '\n', 'Judul Utama H1')}
              title="Heading 1 (# Judul Utama)"
              className="px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 font-extrabold text-[12px] cursor-pointer transition-colors"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertText('\n## ', '\n', 'Subjudul Seksi H2')}
              title="Heading 2 (## Subjudul Seksi)"
              className="px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 font-bold text-[12px] cursor-pointer transition-colors"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertText('\n### ', '\n', 'Poin Subseksi H3')}
              title="Heading 3 (### Poin Subseksi)"
              className="px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 font-semibold text-[12px] cursor-pointer transition-colors"
            >
              H3
            </button>
          </div>

          {/* Text Styling: Bold (Smart Toggle), Italic, Strikethrough, Inline Code */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={handleToggleBold}
              title="Tebal (**teks**)"
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                isBoldActive
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300'
              }`}
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('*', '*', 'teks miring')}
              title="Miring (*teks*)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('~~', '~~', 'teks coret')}
              title="Coretan (~~teks~~)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <Strikethrough size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('`', '`', 'kode_inline()')}
              title="Kode Baris (`kode`)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <Code size={15} />
            </button>
          </div>

          {/* Code Block with Language Dropdown */}
          <div className="relative inline-block border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5" ref={codeMenuRef}>
            <button
              type="button"
              onClick={() => setShowCodeLangPicker(!showCodeLangPicker)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold cursor-pointer transition-colors"
              title="Sisipkan Blok Kode (Code Snippet dengan Pilihan Bahasa)"
            >
              <FileCode size={14} className="text-rose-600 dark:text-rose-400" />
              <span>Kode</span>
              <ChevronDown size={11} />
            </button>

            {showCodeLangPicker && (
              <div className="absolute left-0 mt-1 w-48 p-1.5 rounded-xl bg-white dark:bg-[#181a1f] border border-stone-200 dark:border-zinc-800 shadow-xl z-30 text-xs animate-in fade-in">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 mb-1">
                  Pilih Bahasa Kode
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {CODE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => handleInsertCodeBlock(lang.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center justify-between text-stone-800 dark:text-zinc-200 cursor-pointer transition-colors"
                    >
                      <span className="font-medium">{lang.label}</span>
                      <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">
                        {lang.ext}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lists: Bullet, Numbered, Task */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('\n- ', '\n', 'Poin list')}
              title="Daftar Poin (- item)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n1. ', '\n', 'Langkah bernomor')}
              title="Daftar Nomor (1. item)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n- [ ] ', '\n', 'Tugas checklist')}
              title="Checklist Tugas (- [ ] item)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <ListTodo size={15} />
            </button>
          </div>

          {/* Blocks: Quote, Math Formula, Table, Divider */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('\n> ', '\n', 'Kutipan penting...')}
              title="Kutipan (> quote)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n$$ ', ' $$\n', 'f(x) = \\int_{-\\infty}^{\\infty} e^{-x^2} dx')}
              title="Formula Matematika LaTeX ($$formula$$)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer transition-colors"
            >
              <Sigma size={15} />
            </button>
            <button
              type="button"
              onClick={() =>
                insertText(
                  '\n| Kolom 1 | Kolom 2 | Status |\n| :--- | :--- | :---: |\n| Data A | Keterangan | Aktif |\n| Data B | Keterangan | Selesai |\n'
                )
              }
              title="Tabel Markdown"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <TableIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n---\n')}
              title="Garis Pemisah (---)"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <Minus size={15} />
            </button>
          </div>

          {/* Links & Images */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('[', '](https://example.com)', 'Nama Tautan')}
              title="Tautan Web ([title](url))"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('![', '](https://images.unsplash.com/photo-example)', 'Deskripsi Gambar')}
              title="Gambar (![alt](url))"
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <ImageIcon size={15} />
            </button>
          </div>

          {/* Vanpedia Tag Link Helper */}
          <div className="relative inline-block" ref={vanpediaMenuRef}>
            <button
              type="button"
              onClick={() => setShowVanpediaPicker(!showVanpediaPicker)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-500/20 cursor-pointer transition-colors"
              title="Tautkan kata istilah ke Vanpedia [[slug]]"
            >
              <BookOpen size={13} />
              <span>[[Vanpedia]]</span>
            </button>

            {showVanpediaPicker && (
              <div className="absolute left-0 mt-1 w-72 p-2.5 rounded-xl bg-white dark:bg-[#181a1f] border border-stone-200 dark:border-zinc-800 shadow-2xl z-30 text-xs animate-in fade-in">
                <div className="font-semibold text-stone-800 dark:text-zinc-200 mb-1.5 text-xs">
                  Pilih Istilah Vanpedia:
                </div>
                <div className="relative mb-2">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={vanpediaSearch}
                    onChange={(e) => setVanpediaSearch(e.target.value)}
                    placeholder="Cari istilah..."
                    className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 focus:outline-rose-500"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredVanpediaTerms.map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => {
                        insertText(`[[${t.slug}]]`);
                        setShowVanpediaPicker(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <span className="text-stone-800 dark:text-zinc-200 font-medium truncate">
                        {t.title}
                      </span>
                      <span className="text-stone-400 dark:text-zinc-500 text-[10px] font-mono shrink-0 ml-1">
                        [[{t.slug}]]
                      </span>
                    </button>
                  ))}
                  {filteredVanpediaTerms.length === 0 && (
                    <div className="p-3 text-center text-stone-400 text-xs">
                      Tidak ada istilah yang cocok.
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-stone-100 dark:border-zinc-800 text-[10px] text-stone-400">
                  Ketik manual format <code className="text-rose-600 dark:text-rose-400 font-mono">[[slug-istilah]]</code>
                </div>
              </div>
            )}
          </div>

          {/* Right Actions: Undo, Redo, Copy */}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndexRef.current <= 0}
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors"
              title="Urungkan Perubahan (Undo)"
            >
              <Undo size={14} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndexRef.current >= historyRef.current.length - 1}
              className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors"
              title="Ulangi Perubahan (Redo)"
            >
              <Redo size={14} />
            </button>
            <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
              title="Salin Seluruh Markdown"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Code Block Information & Run Bar */}
      {activeCodeBlock && viewMode !== 'preview' && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#181a1f] text-zinc-300 border-b border-[#2d3139] text-xs font-mono select-none animate-in fade-in">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isRunnableLanguage(activeCodeBlock.lang)
                  ? 'bg-amber-400 text-black'
                  : 'bg-zinc-700 text-zinc-200'
              }`}
            >
              {activeCodeBlock.lang}
            </span>
            <span className="font-semibold text-zinc-200 text-xs">
              Blok Kode
            </span>
            <span className="text-zinc-400 text-[11px] hidden sm:inline">
              • Tekan <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">Ctrl+Space</kbd> untuk Autocomplete
            </span>
            {isRunnableLanguage(activeCodeBlock.lang) && (
              <span className="text-zinc-400 text-[11px] hidden md:inline">
                • <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">Ctrl+Enter</kbd> untuk Run
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isRunnableLanguage(activeCodeBlock.lang) && (
              <button
                type="button"
                onClick={() => handleRunJsSnippet(activeCodeBlock.code)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs cursor-pointer transition-colors shadow-xs"
                title="Jalankan kode JavaScript (Ctrl+Enter)"
              >
                <Play size={11} className="fill-current" />
                <span>Run JS</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(activeCodeBlock.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#2d2d2d] hover:bg-[#383838] text-zinc-300 hover:text-white border border-[#404040] text-xs cursor-pointer transition-colors"
              title="Salin isi blok kode"
            >
              <Copy size={11} />
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor & Preview Panes */}
      <div className="flex-1 relative flex flex-col min-h-0">
        {/* Autocomplete Popup */}
        {showCompletion && completionItems.length > 0 && (
          <div
            className="absolute z-50 bg-[#252526] text-[#cccccc] border border-[#454545] rounded-xl shadow-2xl overflow-hidden w-72 max-w-sm animate-in fade-in zoom-in-95 font-mono text-xs select-none"
            style={{
              top: `${completionPos.top}px`,
              left: `${completionPos.left}px`,
            }}
          >
            <div className="px-3 py-1.5 bg-[#1e1e1e] border-b border-[#333333] flex items-center justify-between text-[10px] text-zinc-400 font-sans">
              <span className="font-semibold uppercase tracking-wider text-rose-400">IntelliSense</span>
              <span>Tab / Enter untuk memilih</span>
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {completionItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => applyCompletion(item)}
                  className={`px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedCompletionIndex === idx
                      ? 'bg-[#094771] text-white font-medium'
                      : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-3.5 h-3.5 rounded text-[9px] flex items-center justify-center font-bold ${
                        item.kind === 'snippet'
                          ? 'bg-rose-500/20 text-rose-400'
                          : item.kind === 'function'
                          ? 'bg-purple-500/20 text-purple-400'
                          : item.kind === 'keyword'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {item.kind[0].toUpperCase()}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="text-[10px] opacity-60 font-sans truncate ml-2">
                    {item.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'split' ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-zinc-800 min-h-0">
            <textarea
              ref={textareaRef}
              required={required}
              value={value}
              onChange={(e) => {
                pushHistory(e.target.value);
                onChange(e.target.value);
                setCursorPos(e.target.selectionStart || 0);
              }}
              onKeyDown={handleEditorKeyDown}
              onClick={(e) => {
                checkSelectionFormatting();
                setCursorPos(e.currentTarget.selectionStart || 0);
              }}
              onKeyUp={(e) => {
                checkSelectionFormatting();
                setCursorPos(e.currentTarget.selectionStart || 0);
              }}
              onSelect={(e) => {
                checkSelectionFormatting();
                setCursorPos(e.currentTarget.selectionStart || 0);
              }}
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
              setCursorPos(e.target.selectionStart || 0);
            }}
            onKeyDown={handleEditorKeyDown}
            onClick={(e) => {
              checkSelectionFormatting();
              setCursorPos(e.currentTarget.selectionStart || 0);
            }}
            onKeyUp={(e) => {
              checkSelectionFormatting();
              setCursorPos(e.currentTarget.selectionStart || 0);
            }}
            onSelect={(e) => {
              checkSelectionFormatting();
              setCursorPos(e.currentTarget.selectionStart || 0);
            }}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full flex-1 p-4 sm:p-6 bg-stone-50/40 dark:bg-[#141518] text-stone-900 dark:text-zinc-100 font-sans text-sm sm:text-base leading-relaxed focus:outline-none resize-y"
          />
        )}
      </div>

      {/* Console Drawer for JavaScript Run Output */}
      {showConsoleDrawer && (
        <div className="border-t border-stone-200 dark:border-zinc-800 bg-[#181a1f] text-[#d4d4d4] font-mono text-xs select-none animate-in slide-in-from-bottom duration-150 shrink-0">
          <div className="flex items-center justify-between px-4 py-2 bg-[#21242b] border-b border-[#2d3139]">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              <span className="font-semibold text-zinc-200">Terminal Konsol JavaScript</span>
              <span className="text-[11px] text-zinc-400">({consoleLogs.length} output)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="px-2 py-0.5 rounded text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Bersihkan
              </button>
              <button
                type="button"
                onClick={() => setShowConsoleDrawer(false)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Tutup Konsol"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="p-3 max-h-52 overflow-y-auto space-y-1 font-mono text-xs">
            {consoleLogs.map((log, idx) => {
              const color =
                log.type === 'error'
                  ? 'text-rose-400 bg-rose-500/10'
                  : log.type === 'warn'
                  ? 'text-amber-300 bg-amber-500/10'
                  : log.type === 'info'
                  ? 'text-emerald-400'
                  : 'text-zinc-200';
              return (
                <div key={idx} className={`flex items-start gap-2 p-1 rounded ${color}`}>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">{log.time}</span>
                  <pre className="whitespace-pre-wrap font-mono text-xs m-0 flex-1">{log.text}</pre>
                </div>
              );
            })}
            {consoleLogs.length === 0 && (
              <div className="text-zinc-500 italic py-2 text-center text-xs">Konsol kosong.</div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="px-4 py-2 bg-stone-50 dark:bg-[#181a1f] border-t border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>{stats.chars} karakter</span>
          <span>•</span>
          <span>{stats.words} kata</span>
          <span>•</span>
          <span>{stats.lines} baris</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-400 dark:text-zinc-500 text-[10px]">
          <Sparkles size={11} className="text-rose-500" />
          <span>Mendukung Markdown GFM, Syntax Highlighting, Formula LaTeX, dan [[Vanpedia]]</span>
        </div>
      </div>
    </div>
  );
};
