import React, { useState, useRef, useMemo } from 'react';
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
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

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
  placeholder = 'Tulis konten menggunakan Markdown, heading, formula, dan tautan [[slug]]...',
  minHeight = '320px',
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
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse markdown for preview
  const previewHtml = useMemo(() => {
    try {
      // Replace [[slug]] with visually distinct span tags for preview
      const preprocessed = value.replace(/\[\[([a-zA-Z0-9_-]+)\]\]/g, (match, slug) => {
        return `<span class="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-800">${slug}</span>`;
      });
      return marked.parse(preprocessed, { gfm: true, breaks: true, async: false }) as string;
    } catch {
      return '<p class="text-stone-500 italic">Error rendering preview</p>';
    }
  }, [value]);

  // Statistics
  const stats = useMemo(() => {
    const chars = value.length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const readTimeMin = Math.max(1, Math.ceil(words / 200));
    return { chars, words, readTimeMin };
  }, [value]);

  // Insert or wrap text at cursor position in textarea
  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultText;

    const replacement = `${before}${selected}${after}`;
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + before.length + selected.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs transition-colors">
      {/* Top Header & View Modes */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-stone-50/80 dark:bg-zinc-900/90 border-b border-stone-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
              {label} {required && <span className="text-rose-500">*</span>}
            </span>
          )}
          <span className="text-[11px] text-stone-400 dark:text-zinc-500 hidden sm:inline">
            {stats.words} kata • ~{stats.readTimeMin} min baca
          </span>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
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
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            <Columns size={12} />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      {viewMode !== 'preview' && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-stone-100/50 dark:bg-zinc-950/40 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 text-xs">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('\n# ', '\n', 'Judul H1')}
              title="Heading 1 (#)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Heading1 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n## ', '\n', 'Subjudul H2')}
              title="Heading 2 (##)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n### ', '\n', 'Poin H3')}
              title="Heading 3 (###)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Heading3 size={15} />
            </button>
          </div>

          {/* Text Styles */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('**', '**', 'teks tebal')}
              title="Tebal (**teks**)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('*', '*', 'teks miring')}
              title="Miring (*teks*)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('~~', '~~', 'teks coret')}
              title="Coret (~~teks~~)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Strikethrough size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('`', '`', 'kode_inline()')}
              title="Inline Code (`kode`)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Code size={15} />
            </button>
          </div>

          {/* Blocks */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('\n```typescript\n', '\n```\n', '// Kode TypeScript Anda')}
              title="Code Block (```lang)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors text-[11px] font-semibold"
            >
              &lt;/&gt;
            </button>
            <button
              type="button"
              onClick={() => insertText('\n> ', '\n', 'Kutipan atau poin penting...')}
              title="Kutipan (> quote)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n$$ ', ' $$\n', 'f(x) = \\int_{-\\infty}^{\\infty} e^{-x^2} dx')}
              title="Formula Matematika LaTeX ($$formula$$)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors text-rose-600 dark:text-rose-400 font-semibold"
            >
              <Sigma size={15} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => insertText('\n- ', '\n', 'Poin list')}
              title="Bullet List (- item)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n1. ', '\n', 'Langkah bernomor')}
              title="Numbered List (1. item)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('\n- [ ] ', '\n', 'Tugas checklist')}
              title="Task List (- [ ] item)"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ListTodo size={15} />
            </button>
          </div>

          {/* Tables & Media */}
          <div className="flex items-center gap-0.5 border-r border-stone-300 dark:border-zinc-700 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() =>
                insertText(
                  '\n| Fitur | Keterangan | Status |\n| :--- | :--- | :---: |\n| Kolom 1 | Nilai | Aktif |\n| Kolom 2 | Nilai | Pending |\n'
                )
              }
              title="Tabel Markdown"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <TableIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('[', '](https://example.com)', 'Nama Tautan')}
              title="Tautan Web ([title](url))"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertText('![', '](https://images.unsplash.com/photo-example)', 'Deskripsi Gambar')}
              title="Gambar (![alt](url))"
              className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ImageIcon size={15} />
            </button>
          </div>

          {/* Vanpedia Tag Helper Button */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowVanpediaPicker(!showVanpediaPicker)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 text-[11px] font-medium border border-stone-200 dark:border-zinc-700 transition-colors"
              title="Tautkan kata istilah ke Vanpedia [[slug]]"
            >
              <BookOpen size={12} className="text-stone-500" />
              <span>[[Vanpedia]]</span>
            </button>

            {showVanpediaPicker && (
              <div className="absolute left-0 mt-1 w-64 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xl z-20 text-xs">
                <div className="font-semibold text-stone-700 dark:text-zinc-300 mb-1.5 text-[11px]">
                  Pilih Istilah Vanpedia:
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {vanpediaTerms.map(t => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => {
                        insertText(`[[${t.slug}]]`);
                        setShowVanpediaPicker(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-stone-800 dark:text-zinc-200 font-medium">{t.title}</span>
                      <span className="text-stone-500 dark:text-zinc-400 text-[10px]">[[{t.slug}]]</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-stone-100 dark:border-zinc-800 text-[10px] text-stone-400">
                  Atau tulis langsung <code className="text-stone-600 dark:text-zinc-300">[[slug-istilah]]</code>
                </div>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-500 dark:text-zinc-400 text-[11px] font-medium transition-colors"
              title="Salin Markdown"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor & Preview Panes */}
      <div className="relative">
        {/* Split View */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-zinc-800">
            <textarea
              ref={textareaRef}
              required={required}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full p-4 sm:p-6 bg-stone-50/30 dark:bg-zinc-950/20 text-stone-900 dark:text-zinc-100 text-sm leading-relaxed focus:outline-none resize-y"
            />
            <div
              style={{ minHeight }}
              className="p-4 sm:p-6 bg-stone-50 dark:bg-zinc-950 overflow-y-auto max-h-[550px] text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed prose prose-stone dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-stone-400 italic">Pratinjau kosong...</p>' }}
            />
          </div>
        ) : viewMode === 'preview' ? (
          <div
            style={{ minHeight }}
            className="p-4 sm:p-8 bg-stone-50 dark:bg-zinc-950 overflow-y-auto max-h-[600px] text-stone-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed prose prose-stone dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-stone-400 italic">Belum ada konten untuk ditampilkan...</p>' }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            required={required}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full p-4 sm:p-6 bg-stone-50/30 dark:bg-zinc-950/20 text-stone-900 dark:text-zinc-100 text-sm sm:text-base leading-relaxed focus:outline-none resize-y"
          />
        )}
      </div>

      {/* Bottom status bar */}
      <div className="px-3.5 py-2 bg-stone-50/60 dark:bg-zinc-950/60 border-t border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span>{stats.chars} karakter</span>
          <span>•</span>
          <span>{stats.words} kata</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-stone-400">
          <Sparkles size={11} className="text-stone-500" />
          <span>Mendukung Markdown, LaTeX ($$), dan Tautan [[Vanpedia]]</span>
        </div>
      </div>
    </div>
  );
};
