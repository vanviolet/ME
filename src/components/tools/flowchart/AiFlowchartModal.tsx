import React, { useState } from 'react';
import { FlowchartNode, FlowchartEdge, CanvasDirection } from './types';
import { mermaidToFlowchart } from './mermaidConverter';
import { computeAutoLayout } from './autoLayout';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface AiFlowchartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedFlowchart: (
    title: string,
    nodes: FlowchartNode[],
    edges: FlowchartEdge[],
    direction: CanvasDirection
  ) => void;
}

export const AiFlowchartModal: React.FC<AiFlowchartModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedFlowchart,
}) => {
  const [prompt, setPrompt] = useState('');
  const [direction, setDirection] = useState<CanvasDirection>('TD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    'Sistem autentikasi multi-factor (MFA) dengan SMS OTP & Google Authenticator',
    'Arsitektur pemrosesan order e-commerce dengan RabbitMQ & Payment Gateway',
    'Alur algoritma pencarian rute terpendek Dijkstra step-by-step',
    'Sistem antrean tiket konser musik anti-bot dengan virtual waiting room & Redis',
    'Siklus hidup deployment mikroservis dengan Docker, Trivy scan, dan Kubernetes',
  ];

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-flowchart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          direction,
          model: 'gemini-3.8-flash',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghasilkan diagram dengan AI');
      }

      const generated = data.data;

      let finalNodes: FlowchartNode[] = [];
      let finalEdges: FlowchartEdge[] = [];

      const mermaidString = generated.mermaid || generated.mermaidCode;

      if (generated.nodes && generated.nodes.length > 0) {
        finalNodes = generated.nodes;
        finalEdges = generated.edges || [];
      } else if (mermaidString) {
        // Parse from Mermaid code returned by AI
        const parsed = mermaidToFlowchart(mermaidString);
        finalNodes = parsed.nodes;
        finalEdges = parsed.edges;
      }

      if (finalNodes.length === 0) {
        throw new Error('AI tidak menghasilkan node yang dapat divisualisasikan.');
      }

      // Automatically organize with balanced hierarchical auto-layout
      const arrangedNodes = computeAutoLayout(finalNodes, finalEdges, direction);

      onApplyGeneratedFlowchart(
        generated.title || prompt.slice(0, 40),
        arrangedNodes,
        finalEdges,
        direction
      );
      onClose();
    } catch (err: any) {
      console.error('Error generating AI flowchart:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-linear-to-r from-rose-500/10 via-purple-500/10 to-blue-500/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-linear-to-br from-rose-500 to-purple-600 text-white shadow-xs shrink-0">
              <Wand2 size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>AI Flowchart Architect</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-zinc-400">
                Deskripsikan alur yang diinginkan, AI akan merancang visual diagram secara lengkap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Deskripsi Alur Sistem / Logika Bisnis
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Contoh: Buat flowchart arsitektur pemrosesan pembayaran otomatis dengan webhook, pengecekan signature HMAC, retry queue di Celery, dan notifikasi WhatsApp invoice..."
              className="w-full p-3 text-xs bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white leading-relaxed resize-none font-sans"
            />
          </div>

          {/* Direction Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-600 dark:text-zinc-400">
              Orientasi Arah Diagram:
            </span>
            <div className="flex items-center gap-1.5 p-0.5 bg-stone-100 dark:bg-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={() => setDirection('TD')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  direction === 'TD'
                    ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Atas ke Bawah (TD)
              </button>
              <button
                type="button"
                onClick={() => setDirection('LR')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  direction === 'LR'
                    ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Kiri ke Kanan (LR)
              </button>
            </div>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 dark:text-zinc-400">
              <Lightbulb size={13} className="text-amber-500" />
              <span>Contoh Prompt Cepat:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="px-2.5 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 rounded-lg transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-end gap-2 bg-stone-50/50 dark:bg-zinc-800/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="px-5 py-2 bg-linear-to-r from-rose-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-transform active:scale-98"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Merancang Diagram...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Hasilkan Diagram</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
