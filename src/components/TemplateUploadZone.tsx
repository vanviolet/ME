import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Download, Bot, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  parseArticleFile,
  parseVanpediaFile,
  downloadArticleTemplate,
  downloadVanpediaTemplate,
  ParsedArticleFile,
  ParsedVanpediaFile,
} from '../utils/fileParser';

interface TemplateUploadZoneProps {
  mode: 'article' | 'vanpedia';
  onArticleLoaded?: (data: ParsedArticleFile) => void;
  onVanpediaLoaded?: (data: ParsedVanpediaFile) => void;
  onOpenAiHelper: () => void;
}

export const TemplateUploadZone: React.FC<TemplateUploadZoneProps> = ({
  mode,
  onArticleLoaded,
  onVanpediaLoaded,
  onOpenAiHelper,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    try {
      setStatusMessage(null);
      setFileName(file.name);

      if (mode === 'article') {
        const parsed = await parseArticleFile(file);
        if (onArticleLoaded) onArticleLoaded(parsed);
        setStatusMessage({
          type: 'success',
          text: `File "${file.name}" berhasil diunggah! Formulir dan Rich Editor telah terisi otomatis.`,
        });
      } else {
        const parsed = await parseVanpediaFile(file);
        if (onVanpediaLoaded) onVanpediaLoaded(parsed);
        setStatusMessage({
          type: 'success',
          text: `File "${file.name}" berhasil diunggah! Istilah Vanpedia telah terisi otomatis.`,
        });
      }
    } catch (err: any) {
      console.error('Failed to parse template file:', err);
      setStatusMessage({
        type: 'error',
        text: `Gagal membaca file: ${err.message || 'Format tidak valid'}. Pastikan menggunakan format Markdown dengan Frontmatter atau JSON.`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDownload = () => {
    if (mode === 'article') {
      downloadArticleTemplate();
    } else {
      downloadVanpediaTemplate();
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Action Shortcut Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-stone-100/70 dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Sparkles size={14} />
          </span>
          <span className="font-semibold text-stone-800 dark:text-zinc-200">
            Opsi Cepat Pembuatan:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAiHelper}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-xs"
          >
            <Bot size={13} />
            <span>🤖 Buat dengan ChatGPT</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <Download size={13} />
            <span>Unduh Template (.md)</span>
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 scale-[0.99]'
            : 'border-stone-300 dark:border-zinc-700 bg-stone-50/40 dark:bg-zinc-950/30 hover:border-rose-400 hover:bg-stone-50 dark:hover:bg-zinc-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.json,text/markdown,application/json"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-2.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
            <UploadCloud size={20} className="text-rose-500" />
          </div>

          <div>
            <span className="font-semibold text-stone-800 dark:text-zinc-200">
              Tarik & Lepas File Template (.md atau .json) di Sini
            </span>
            <span className="text-stone-500 dark:text-zinc-400 block text-[11px] mt-0.5">
              atau klik untuk memilih file dari komputer Anda
            </span>
          </div>

          {fileName && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-200/70 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-[11px] font-mono mt-1">
              <FileText size={12} />
              <span>{fileName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-800 dark:text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
