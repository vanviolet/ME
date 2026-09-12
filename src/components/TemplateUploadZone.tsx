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
  mode?: 'article' | 'vanpedia';
  type?: 'article' | 'vanpedia';
  onArticleLoaded?: (data: ParsedArticleFile) => void;
  onVanpediaLoaded?: (data: ParsedVanpediaFile) => void;
  onOpenAiHelper?: () => void;
}

export const TemplateUploadZone: React.FC<TemplateUploadZoneProps> = ({
  mode,
  type,
  onArticleLoaded,
  onVanpediaLoaded,
  onOpenAiHelper,
}) => {
  const activeMode = mode || type || 'article';
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    try {
      setStatusMessage(null);
      setFileName(file.name);

      if (activeMode === 'article') {
        const parsed = await parseArticleFile(file);
        if (onArticleLoaded) onArticleLoaded(parsed);
        setStatusMessage({
          type: 'success',
          text: `File "${file.name}" berhasil diunggah! Formulir dan editor terisi otomatis.`,
        });
      } else {
        const parsed = await parseVanpediaFile(file);
        if (onVanpediaLoaded) onVanpediaLoaded(parsed);
        setStatusMessage({
          type: 'success',
          text: `File "${file.name}" berhasil diunggah! Istilah Vanpedia terisi otomatis.`,
        });
      }
    } catch (err: any) {
      console.error('Failed to parse template file:', err);
      setStatusMessage({
        type: 'error',
        text: `Gagal membaca file: ${err.message || 'Format tidak valid'}. Pastikan format Markdown frontmatter atau JSON.`,
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
    if (activeMode === 'article') {
      downloadArticleTemplate();
    } else {
      downloadVanpediaTemplate();
    }
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Action Shortcut Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-stone-500 dark:text-zinc-400 shrink-0" />
          <span className="font-semibold text-stone-800 dark:text-zinc-200">
            Opsi Cepat Pembuatan:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiHelper && (
            <button
              type="button"
              onClick={onOpenAiHelper}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Firebase AI Logic</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500 dark:text-zinc-400" />
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
        className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-stone-400 bg-stone-100 dark:bg-zinc-800'
            : 'border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/40 hover:border-stone-400 dark:hover:border-zinc-600'
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
            <UploadCloud className="w-5 h-5 text-stone-500 dark:text-zinc-400" />
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-[11px] mt-1 border border-stone-200 dark:border-zinc-700">
              <FileText className="w-3.5 h-3.5 text-stone-500" />
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
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
