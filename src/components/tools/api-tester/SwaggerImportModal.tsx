import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Layers,
  FolderPlus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { WorkspaceProject } from './types';
import { parseSwaggerOrOpenApi } from './swaggerGenerator';
import { getMethodBadgeClass } from './utils';

interface SwaggerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: WorkspaceProject | null;
  onImportWorkspace: (importedWorkspace: WorkspaceProject, mode: 'new' | 'merge') => void;
}

export const SwaggerImportModal: React.FC<SwaggerImportModalProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  onImportWorkspace,
}) => {
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'new' | 'merge'>('new');
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<{ workspace: WorkspaceProject; warnings: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessContent = (content: string) => {
    setError(null);
    try {
      const result = parseSwaggerOrOpenApi(content);
      if (result.workspace.endpoints.length === 0) {
        setError('Peringatan: File terbaca namun tidak ada path/endpoint operasi yang ditemukan.');
      }
      setParsedResult(result);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses file Swagger / OpenAPI.');
      setParsedResult(null);
    }
  };

  const handleTextChange = (text: string) => {
    setImportText(text);
    if (text.trim()) {
      handleProcessContent(text);
    } else {
      setParsedResult(null);
      setError(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readFile(e.target.files[0]);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      setImportText(content);
      handleProcessContent(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedResult) return;
    onImportWorkspace(parsedResult.workspace, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
              <Upload size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Import Swagger / OpenAPI (.json / .yaml)
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Impor file Swagger 2.0 atau OpenAPI 3.0 ke dalam Workspace API Testing Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-rose-500 bg-rose-500/5'
                : 'border-stone-300 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-rose-500/50 bg-stone-50/50 dark:bg-zinc-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-2.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300">
                <FileCode2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                  Tarik & lepas file <code className="text-rose-600 font-mono">swagger.json</code> atau <code className="text-rose-600 font-mono">.yaml</code> ke sini
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Atau klik untuk menelusuri file dari perangkat Anda
                </p>
              </div>
            </div>
          </div>

          {/* Paste Raw JSON/YAML */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                Atau Tempel (Paste) Konten Swagger JSON / YAML:
              </label>
              {importText && (
                <button
                  onClick={() => handleTextChange('')}
                  className="text-[11px] text-stone-400 hover:text-rose-600"
                >
                  Bersihkan
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={importText}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={`{\n  "swagger": "2.0",\n  "info": { "title": "My API", "version": "1.0.0" },\n  "paths": { ... }\n}`}
              className="w-full p-3 font-mono text-xs bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100 resize-y"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedResult && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 size={16} />
                  <span>Spesifikasi Berhasil Dikenali</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono">
                  {parsedResult.workspace.endpoints.length} Endpoint Terdeteksi
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700">
                  <span className="text-[10px] text-stone-400 block font-medium">Judul API</span>
                  <span className="font-bold text-stone-800 dark:text-zinc-100 truncate block">
                    {parsedResult.workspace.info?.title || parsedResult.workspace.name}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700">
                  <span className="text-[10px] text-stone-400 block font-medium">Versi</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-zinc-100 block">
                    v{parsedResult.workspace.info?.version || '1.0.0'}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-stone-400 block font-medium">Host / BasePath</span>
                  <span className="font-mono text-xs text-stone-800 dark:text-zinc-100 truncate block">
                    {parsedResult.workspace.host || 'api.example.com'}{parsedResult.workspace.basePath || '/'}
                  </span>
                </div>
              </div>

              {/* Sample Endpoints List Preview */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-stone-600 dark:text-zinc-400">
                  Daftar Operasi Endpoint:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-800">
                  {parsedResult.workspace.endpoints.map(ep => (
                    <div key={ep.id} className="flex items-center gap-2 text-xs">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border font-mono ${getMethodBadgeClass(ep.method)}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-stone-700 dark:text-zinc-300 truncate">
                        {ep.path || ep.url}
                      </span>
                      <span className="text-stone-400 truncate text-[11px] ml-auto">
                        {ep.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Mode */}
              <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                  Target Import:
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'new'}
                      onChange={() => setImportMode('new')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Buat Workspace / Project Baru</span>
                  </label>
                  {activeWorkspace && (
                    <label className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Gabungkan ke Workspace Aktif ({activeWorkspace.name})</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!parsedResult || parsedResult.workspace.endpoints.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus size={14} />
            <span>Selesaikan & Impor API</span>
          </button>
        </div>
      </div>
    </div>
  );
};
