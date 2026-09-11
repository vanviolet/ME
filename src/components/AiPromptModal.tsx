import React, { useState } from 'react';
import {
  Bot,
  Copy,
  Check,
  ExternalLink,
  Download,
  Sparkles,
  X,
  FileText,
  BookOpen,
} from 'lucide-react';
import {
  generateChatGptArticlePrompt,
  generateChatGptVanpediaPrompt,
  downloadArticleTemplate,
  downloadVanpediaTemplate,
} from '../utils/fileParser';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'article' | 'vanpedia';
  defaultCategory?: string;
  onApplyDirectly?: (content: string) => void;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({
  isOpen,
  onClose,
  mode,
  defaultCategory = 'Learning (AI)',
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [keyPoints, setKeyPoints] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generated =
    mode === 'article'
      ? generateChatGptArticlePrompt({
          outlineTitle: topic || 'Arsitektur dan Prinsip Kerja Sistem',
          category,
          keyPoints: keyPoints || undefined,
        })
      : generateChatGptVanpediaPrompt({
          termName: topic || 'Istilah Teknis',
          category,
          details: keyPoints || undefined,
        });

  const handleCopy = () => {
    navigator.clipboard.writeText(generated.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTemplate = () => {
    if (mode === 'article') {
      downloadArticleTemplate();
    } else {
      downloadVanpediaTemplate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{mode === 'article' ? 'Buat Artikel dengan ChatGPT' : 'Buat Istilah Vanpedia dengan ChatGPT'}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px]">
                  AI Helper
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                Tulis ide garis besar, dapatkan prompt siap pakai sesuai template, lalu upload kembali ke web ini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Step Instruction Card */}
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500/20 text-stone-700 dark:text-zinc-300">
            <div className="font-semibold text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Alur Kerja Praktis 4 Langkah:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Tuliskan <strong>Judul / Topik Garis Besar</strong> pada form di bawah.</li>
              <li>Klik tombol <strong>"Buka di ChatGPT"</strong> (atau Salin Prompt).</li>
              <li>Biarkan ChatGPT menghasilkan artikel lengkap sesuai format template Frontmatter.</li>
              <li>Simpan jawaban sebagai file <code>.md</code> atau salin isinya, lalu gunakan tombol <strong>"Upload File"</strong> pada form pembuatan!</li>
            </ol>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                {mode === 'article' ? 'Judul / Garis Besar Artikel *' : 'Nama Istilah / Konsep *'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={
                  mode === 'article'
                    ? 'Contoh: Arsitektur Transformer dan Multi-Head Attention'
                    : 'Contoh: Tritone Interval atau Backpropagation'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-rose-500/30 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
                >
                  <option value="Learning (AI)">Learning (AI)</option>
                  <option value="Theory Music">Theory Music</option>
                  <option value="Hobby (Music)">Hobby (Music)</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Security">Security</option>
                  <option value="Fakta Unik">Fakta Unik</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Template Standar
                </label>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 flex items-center justify-center gap-1.5 transition-colors font-semibold"
                >
                  <Download size={13} />
                  <span>Unduh Template Kosong (.md)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Poin Kunci / Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={keyPoints}
                onChange={e => setKeyPoints(e.target.value)}
                placeholder="Contoh: Sertakan formula matematis, contoh kode implementasi TypeScript, dan tautkan ke istilah [[tritone]]..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          {/* Generated Prompt Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-stone-700 dark:text-zinc-300">
                Prompt Otomatis untuk ChatGPT:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Prompt'}</span>
              </button>
            </div>
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-stone-900 text-zinc-100 text-[11px] leading-relaxed overflow-x-auto max-h-48 font-mono border border-stone-800">
                {generated.prompt}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/40">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Prompt Lengkap'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
            <a
              href={generated.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Bot size={15} />
              <span>Buka Langsung di ChatGPT</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
