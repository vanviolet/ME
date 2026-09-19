import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { FlowchartNode, FlowchartEdge, CanvasDirection } from './types';
import { flowchartToMermaid, mermaidToFlowchart } from './mermaidConverter';
import { computeAutoLayout } from './autoLayout';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  Eye,
  FileCode,
  ArrowRightLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface MermaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  direction: CanvasDirection;
  projectTitle: string;
  onApplyMermaidToCanvas: (nodes: FlowchartNode[], edges: FlowchartEdge[], direction: CanvasDirection) => void;
}

export const MermaidModal: React.FC<MermaidModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  direction,
  projectTitle,
  onApplyMermaidToCanvas,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'preview'>('export');
  const [mermaidCode, setMermaidCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [previewSvg, setPreviewSvg] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Initialize mermaid
  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          curve: 'basis',
          htmlLabels: true,
        },
      });
    } catch (e) {
      console.warn('Mermaid init warning:', e);
    }
  }, []);

  // Update mermaid code whenever modal opens or canvas changes
  useEffect(() => {
    if (isOpen) {
      const code = flowchartToMermaid(nodes, edges, direction, projectTitle);
      setMermaidCode(code);
      renderMermaidSvg(code);
    }
  }, [isOpen, nodes, edges, direction, projectTitle]);

  const renderMermaidSvg = async (codeToRender: string) => {
    setPreviewLoading(true);
    try {
      const id = `mermaid-render-${Date.now()}`;
      const { svg } = await mermaid.render(id, codeToRender);
      setPreviewSvg(svg);
    } catch (err: any) {
      console.warn('Mermaid render error:', err);
      setPreviewSvg('');
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMmd = () => {
    const blob = new Blob([mermaidCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-') || 'flowchart'}.mmd`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportToCanvas = () => {
    try {
      setImportError(null);
      const parsed = mermaidToFlowchart(mermaidCode);
      if (parsed.nodes.length === 0) {
        throw new Error('Tidak ada node atau alur valid yang terdeteksi dari kode Mermaid.');
      }
      // Apply clean auto layout to imported diagram
      const arrangedNodes = computeAutoLayout(parsed.nodes, parsed.edges, parsed.direction);
      onApplyMermaidToCanvas(arrangedNodes, parsed.edges, parsed.direction);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Gagal mengonversi kode Mermaid');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/70 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-linear-to-br from-rose-500 to-purple-600 text-white shadow-xs">
              <FileCode size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Mermaid Flowchart Studio
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Ekspor, impor, dan pratinjau diagram Mermaid 2-way real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-4 pt-3 border-b border-stone-200 dark:border-zinc-800 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-zinc-300'
            }`}
          >
            <Code2 size={14} />
            <span>Kode Mermaid (Ekspor)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('preview');
              renderMermaidSvg(mermaidCode);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-zinc-300'
            }`}
          >
            <Eye size={14} />
            <span>Pratinjau Render Resmi</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-zinc-300'
            }`}
          >
            <ArrowRightLeft size={14} />
            <span>Impor Mermaid ke Kanvas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* TAB 1: EXPORT CODE */}
          {activeTab === 'export' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500 dark:text-zinc-400 font-mono">
                  Sintaks siap pakai untuk GitHub Markdown, Notion, Obsidian, atau Mermaid Live
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="py-1 px-2.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-stone-700 dark:text-zinc-200"
                  >
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMmd}
                    className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download size={13} />
                    <span>Unduh .mmd</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={14}
                  value={mermaidCode}
                  className="w-full font-mono text-xs p-3.5 bg-stone-900 text-emerald-400 rounded-xl border border-stone-800 shadow-inner outline-none resize-none leading-relaxed selection:bg-emerald-500/30"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PREVIEW RENDER */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-500 dark:text-zinc-400">
                Pratinjau diagram langsung yang dirender oleh mesin Mermaid.js
              </div>
              <div className="w-full min-h-[340px] max-h-[460px] overflow-auto p-6 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-200 dark:border-zinc-800 flex items-center justify-center">
                {previewLoading ? (
                  <div className="text-xs text-stone-400 flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin text-rose-500" />
                    <span>Merender diagram Mermaid...</span>
                  </div>
                ) : previewSvg ? (
                  <div
                    className="mermaid-render-output max-w-full overflow-auto flex justify-center"
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />
                ) : (
                  <div className="text-xs text-stone-400 text-center space-y-1">
                    <AlertCircle size={20} className="mx-auto text-amber-500" />
                    <p>Tidak dapat merender pratinjau grafik.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT TO CANVAS */}
          {activeTab === 'import' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                Tempel kode Mermaid (contoh: <code className="font-mono">flowchart TD</code>) dari dokumen atau AI Anda di bawah ini, lalu klik tombol untuk mengubahnya menjadi diagram interaktif di canvas!
              </div>

              <textarea
                rows={12}
                value={mermaidCode}
                onChange={e => setMermaidCode(e.target.value)}
                placeholder="flowchart TD&#10;    A([Mulai]) --> B[Input Data]&#10;    B --> C{Valid?}&#10;    C -->|Ya| D[Proses]&#10;    C -->|Tidak| B"
                className="w-full font-mono text-xs p-3.5 bg-stone-900 text-emerald-400 rounded-xl border border-stone-800 shadow-inner outline-none resize-none leading-relaxed"
              />

              {importError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleImportToCanvas}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-rose-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-98"
                >
                  <Sparkles size={14} />
                  <span>Terapkan ke Kanvas Interaktif</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
