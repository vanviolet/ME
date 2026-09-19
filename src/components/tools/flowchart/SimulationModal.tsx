import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FlowchartNode, FlowchartEdge } from './types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  X,
  Compass,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  onHighlightNode: (nodeId: string | null) => void;
  onHighlightEdge: (edgeId: string | null) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  onHighlightNode,
  onHighlightEdge,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ nodeId: string; label: string; edgeId?: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1500); // ms

  // Reset or start simulation when modal opens
  useEffect(() => {
    if (isOpen) {
      startSimulation();
    } else {
      stopSimulation();
    }
  }, [isOpen]);

  const startSimulation = () => {
    // Find a start node or root node (no incoming edges)
    const startNode =
      nodes.find(n => n.type === 'start') ||
      nodes.find(n => !edges.some(e => e.target === n.id)) ||
      nodes[0];

    if (startNode) {
      setCurrentNodeId(startNode.id);
      setHistory([{ nodeId: startNode.id, label: startNode.label }]);
      onHighlightNode(startNode.id);
      onHighlightEdge(null);
    }
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    onHighlightNode(null);
    onHighlightEdge(null);
  };

  // Find outgoing edges from current node
  const currentNode = nodes.find(n => n.id === currentNodeId);
  const outgoingEdges = edges.filter(e => e.source === currentNodeId);

  // Take a step along a specific edge
  const takeStepAlongEdge = (edge: FlowchartEdge) => {
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!targetNode) return;

    onHighlightEdge(edge.id);
    onHighlightNode(targetNode.id);
    setCurrentNodeId(targetNode.id);
    setHistory(prev => [
      ...prev,
      { nodeId: targetNode.id, label: targetNode.label, edgeId: edge.id },
    ]);

    const nextOutgoing = edges.filter(e => e.source === targetNode.id);
    if (targetNode.type === 'end' || nextOutgoing.length === 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        // Silently continue
      }
    }
  };

  // Step next automatically if only 1 outgoing edge
  const handleStepNext = () => {
    if (outgoingEdges.length === 1) {
      takeStepAlongEdge(outgoingEdges[0]);
    } else if (outgoingEdges.length > 1) {
      // Pick first edge as default if auto stepping
      takeStepAlongEdge(outgoingEdges[0]);
    }
  };

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && outgoingEdges.length === 1) {
      timer = setTimeout(() => {
        takeStepAlongEdge(outgoingEdges[0]);
      }, playSpeed);
    } else if (isPlaying && outgoingEdges.length !== 1) {
      // Pause at decision or end node
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentNodeId, outgoingEdges, playSpeed]);

  if (!isOpen) return null;

  const isEndReached = outgoingEdges.length === 0;
  const isDecisionPoint = outgoingEdges.length > 1;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-full max-w-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-fade-in select-none">
      {/* Header */}
      <div className="p-3 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/70 dark:bg-zinc-800/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Compass size={16} />
          </div>
          <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Simulator Alur Logika (Interactive Step-by-Step)
          </span>
        </div>
        <button
          onClick={() => {
            stopSimulation();
            onClose();
          }}
          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Active Node Card */}
        {currentNode ? (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold uppercase">
                  Langkah {history.length}: {currentNode.type}
                </span>
                {isEndReached && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold">
                    Titik Akhir Selesai
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-white">
                {currentNode.label}
              </div>
              {currentNode.description && (
                <div className="text-xs text-stone-600 dark:text-zinc-400">
                  {currentNode.description}
                </div>
              )}
            </div>

            <div className="shrink-0 p-2 rounded-full bg-emerald-500 text-white animate-pulse">
              <CheckCircle2 size={18} />
            </div>
          </div>
        ) : (
          <div className="text-xs text-stone-500 text-center py-2">
            Pilih node awal untuk memulai simulasi.
          </div>
        )}

        {/* Decision Branch Choices */}
        {isDecisionPoint && (
          <div className="space-y-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <GitBranch size={14} />
              <span>Titik Percabangan Logika — Pilih Jalur Eksekusi:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {outgoingEdges.map(edge => {
                const targetNode = nodes.find(n => n.id === edge.target);
                return (
                  <button
                    key={edge.id}
                    onClick={() => takeStepAlongEdge(edge)}
                    className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-transform active:scale-95"
                  >
                    <span>{edge.label || 'Lanjutkan'}</span>
                    <ArrowRight size={13} />
                    <span className="opacity-80">({targetNode?.label || 'Node'})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Controls Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={isEndReached || isDecisionPoint}
              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Jeda' : 'Auto Play'}</span>
            </button>
            <button
              onClick={handleStepNext}
              disabled={isEndReached || isDecisionPoint}
              className="py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 text-stone-700 dark:text-zinc-200 cursor-pointer"
            >
              <SkipForward size={14} />
              <span>Langkah Berikut</span>
            </button>
          </div>

          <button
            onClick={startSimulation}
            className="py-1.5 px-2.5 text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 text-xs font-medium flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>Ulangi Alur</span>
          </button>
        </div>
      </div>
    </div>
  );
};
