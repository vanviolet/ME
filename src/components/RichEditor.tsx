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
} from 'lucide-react';
import { renderInlineFormula, renderTextWithMath } from '../lib/renderMath';

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

  // Parse markdown with KaTeX math and distinct Vanpedia badges for preview
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

      return marked.parse(preprocessed, { gfm: true, breaks: true, async: false }) as string;
    } catch {
      return '<p class="text-stone-500 italic">Gagal merender pratinjau markdown.</p>';
    }
  }, [value]);

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

      {/* Editor & Preview Panes */}
      <div className="flex-1 relative flex flex-col min-h-0">
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
              onSelect={checkSelectionFormatting}
              onKeyUp={checkSelectionFormatting}
              onMouseUp={checkSelectionFormatting}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full h-full p-4 sm:p-6 bg-stone-50/40 dark:bg-[#141518] text-stone-900 dark:text-zinc-100 font-mono text-sm leading-relaxed focus:outline-none resize-none overflow-y-auto"
            />
            <div
              style={{ minHeight }}
              data-article-content
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
            onSelect={checkSelectionFormatting}
            onKeyUp={checkSelectionFormatting}
            onMouseUp={checkSelectionFormatting}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full flex-1 p-4 sm:p-6 bg-stone-50/40 dark:bg-[#141518] text-stone-900 dark:text-zinc-100 font-sans text-sm sm:text-base leading-relaxed focus:outline-none resize-y"
          />
        )}
      </div>

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
