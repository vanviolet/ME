import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FlowchartNode, FlowchartEdge, NodeType, CanvasDirection } from './types';
import { FLOWCHART_TEMPLATES, FlowchartTemplate } from './templates';
import { computeAutoLayout } from './autoLayout';
import { getNodeDefaultColors, flowchartToMermaid } from './mermaidConverter';
import { CanvasView } from './CanvasView';
import { PaletteSidebar } from './PaletteSidebar';
import { InspectorPanel } from './InspectorPanel';
import { MermaidModal } from './MermaidModal';
import { AiFlowchartModal } from './AiFlowchartModal';
import { SimulationModal } from './SimulationModal';
import { usePortfolio } from '../../../context/PortfolioContext';
import {
  ArrowLeft,
  Sparkles,
  Play,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Code2,
  Download,
  Share2,
  Moon,
  Sun,
  Layers,
  LayoutGrid,
  FileCode,
  Image as ImageIcon,
  Save,
  Check,
} from 'lucide-react';

interface HistorySnapshot {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  direction: CanvasDirection;
}

export const FlowchartStudio: React.FC = () => {
  const { darkMode, setDarkMode } = usePortfolio();

  // Project Meta
  const [projectTitle, setProjectTitle] = useState('Arsitektur Alur Sistem');
  const [direction, setDirection] = useState<CanvasDirection>('TD');

  // Initial State from Starter Template
  const defaultStarter = FLOWCHART_TEMPLATES[0]; // OAuth Auth Flow
  const [nodes, setNodes] = useState<FlowchartNode[]>(defaultStarter.nodes);
  const [edges, setEdges] = useState<FlowchartEdge[]>(defaultStarter.edges);

  // Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Canvas Viewport Pan & Zoom
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 80, y: 40 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [canvasBg, setCanvasBg] = useState<'dots' | 'grid' | 'blank'>('dots');

  // Sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Modals
  const [mermaidModalOpen, setMermaidModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);

  // Simulation Active Highlights
  const [simActiveNodeId, setSimActiveNodeId] = useState<string | null>(null);
  const [simActiveEdgeId, setSimActiveEdgeId] = useState<string | null>(null);

  // Undo / Redo Stack
  const [history, setHistory] = useState<HistorySnapshot[]>([
    { nodes: defaultStarter.nodes, edges: defaultStarter.edges, direction: defaultStarter.direction },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Export Dropdown
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setExportToast(msg);
    setTimeout(() => setExportToast(null), 2500);
  };

  // Push to history
  const pushHistory = useCallback(
    (newNodes: FlowchartNode[], newEdges: FlowchartEdge[], newDir: CanvasDirection = direction) => {
      setHistory(prev => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, { nodes: newNodes, edges: newEdges, direction: newDir }];
      });
      setHistoryIndex(prev => prev + 1);
    },
    [direction, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const target = history[prevIdx];
      setHistoryIndex(prevIdx);
      setNodes(target.nodes);
      setEdges(target.edges);
      setDirection(target.direction);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const target = history[nextIdx];
      setHistoryIndex(nextIdx);
      setNodes(target.nodes);
      setEdges(target.edges);
      setDirection(target.direction);
    }
  };

  // Add Node from Palette
  const handleAddNode = (type: NodeType) => {
    const defaultColors = getNodeDefaultColors(type);
    const id = `node_${Date.now()}`;
    const newNode: FlowchartNode = {
      id,
      type,
      label:
        type === 'start'
          ? 'Mulai Alur'
          : type === 'end'
          ? 'Selesai'
          : type === 'decision'
          ? 'Kondisi Valid?'
          : type === 'input'
          ? 'Input Parameter'
          : type === 'database'
          ? 'PostgreSQL DB'
          : type === 'cloud'
          ? 'Cloud Service'
          : 'Proses Baru',
      x: Math.round((-pan.x + 360) / scale),
      y: Math.round((-pan.y + 200) / scale),
      width: type === 'decision' ? 160 : 180,
      height: type === 'decision' ? 80 : 65,
      bgColor: defaultColors.bg,
      borderColor: defaultColors.border,
      textColor: defaultColors.text,
    };

    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    pushHistory(nextNodes, edges);
  };

  // Quick Add Connected Child Node
  const handleQuickAddChild = (sourceId: string, type: NodeType = 'process') => {
    const srcNode = nodes.find(n => n.id === sourceId);
    if (!srcNode) return;

    const defaultColors = getNodeDefaultColors(type);
    const newId = `node_${Date.now()}`;
    const offset = direction === 'TD' ? { x: 0, y: 120 } : { x: 220, y: 0 };

    const newNode: FlowchartNode = {
      id: newId,
      type,
      label: type === 'decision' ? 'Cabang Keputusan?' : 'Langkah Selanjutnya',
      x: srcNode.x + offset.x,
      y: srcNode.y + offset.y,
      width: type === 'decision' ? 160 : 180,
      height: type === 'decision' ? 80 : 65,
      bgColor: defaultColors.bg,
      borderColor: defaultColors.border,
      textColor: defaultColors.text,
    };

    const newEdge: FlowchartEdge = {
      id: `edge_${srcNode.id}_${newId}_${Date.now()}`,
      source: srcNode.id,
      target: newId,
      style: 'orthogonal',
      arrowEnd: true,
      color: '#64748b',
    };

    const nextNodes = [...nodes, newNode];
    const nextEdges = [...edges, newEdge];

    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeId(newId);
    setSelectedEdgeId(null);
    pushHistory(nextNodes, nextEdges);
  };

  // Node Updates
  const handleUpdateNode = (updated: FlowchartNode) => {
    setNodes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
  };

  const handleUpdateNodes = (updatedList: FlowchartNode[]) => {
    setNodes(updatedList);
    pushHistory(updatedList, edges);
  };

  const handleDeleteNode = (id: string) => {
    const nextNodes = nodes.filter(n => n.id !== id);
    const nextEdges = edges.filter(e => e.source !== id && e.target !== id);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeId(null);
    pushHistory(nextNodes, nextEdges);
  };

  const handleDuplicateNode = (id: string) => {
    const src = nodes.find(n => n.id === id);
    if (!src) return;

    const dupId = `node_${Date.now()}`;
    const dupNode: FlowchartNode = {
      ...src,
      id: dupId,
      label: `${src.label} (Salinan)`,
      x: src.x + 30,
      y: src.y + 30,
    };

    const nextNodes = [...nodes, dupNode];
    setNodes(nextNodes);
    setSelectedNodeId(dupId);
    pushHistory(nextNodes, edges);
  };

  // Edge Operations
  const handleAddEdge = (newEdgeData: Omit<FlowchartEdge, 'id'>) => {
    // Check if duplicate connection already exists
    const exists = edges.some(
      e => e.source === newEdgeData.source && e.target === newEdgeData.target
    );
    if (exists) return;

    const edge: FlowchartEdge = {
      ...newEdgeData,
      id: `edge_${Date.now()}`,
    };

    const nextEdges = [...edges, edge];
    setEdges(nextEdges);
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    pushHistory(nodes, nextEdges);
  };

  const handleUpdateEdge = (updated: FlowchartEdge) => {
    const nextEdges = edges.map(e => (e.id === updated.id ? updated : e));
    setEdges(nextEdges);
    pushHistory(nodes, nextEdges);
  };

  const handleDeleteEdge = (id: string) => {
    const nextEdges = edges.filter(e => e.id !== id);
    setEdges(nextEdges);
    setSelectedEdgeId(null);
    pushHistory(nodes, nextEdges);
  };

  // Auto Layout Action
  const handleAutoLayout = () => {
    const arranged = computeAutoLayout(nodes, edges, direction);
    setNodes(arranged);
    pushHistory(arranged, edges);
    showToast('Diagram berhasil dirapikan otomatis!');
  };

  // Load Template
  const handleLoadTemplate = (tpl: FlowchartTemplate) => {
    setProjectTitle(tpl.title);
    setDirection(tpl.direction);
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    pushHistory(tpl.nodes, tpl.edges, tpl.direction);
    showToast(`Template "${tpl.title}" berhasil dimuat!`);
  };

  // Apply Mermaid Code
  const handleApplyMermaid = (
    newNodes: FlowchartNode[],
    newEdges: FlowchartEdge[],
    newDir: CanvasDirection
  ) => {
    setNodes(newNodes);
    setEdges(newEdges);
    setDirection(newDir);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    pushHistory(newNodes, newEdges, newDir);
    showToast('Kode Mermaid berhasil diterapkan ke kanvas!');
  };

  // Apply AI Generated Flowchart
  const handleApplyAiFlowchart = (
    title: string,
    newNodes: FlowchartNode[],
    newEdges: FlowchartEdge[],
    newDir: CanvasDirection
  ) => {
    setProjectTitle(title);
    setNodes(newNodes);
    setEdges(newEdges);
    setDirection(newDir);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    pushHistory(newNodes, newEdges, newDir);
    showToast('Flowchart AI berhasil diterapkan!');
  };

  // Zoom to Fit
  const handleZoomToFit = () => {
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + n.height));

    const totalWidth = maxX - minX + 200;
    const totalHeight = maxY - minY + 200;

    const containerWidth = window.innerWidth - (leftSidebarOpen ? 280 : 40) - (rightSidebarOpen ? 280 : 40);
    const containerHeight = window.innerHeight - 80;

    const fitScale = Math.min(1.5, Math.max(0.3, Math.min(containerWidth / totalWidth, containerHeight / totalHeight)));
    setScale(fitScale);
    setPan({
      x: (containerWidth - totalWidth * fitScale) / 2 - minX * fitScale + 100,
      y: (containerHeight - totalHeight * fitScale) / 2 - minY * fitScale + 80,
    });
  };

  // Export as PNG image via Canvas drawing
  const handleExportPng = () => {
    try {
      const minX = Math.min(...nodes.map(n => n.x)) - 60;
      const maxX = Math.max(...nodes.map(n => n.x + n.width)) + 60;
      const minY = Math.min(...nodes.map(n => n.y)) - 60;
      const maxY = Math.max(...nodes.map(n => n.y + n.height)) + 60;

      const width = maxX - minX;
      const height = maxY - minY;

      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x Retina scale
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Simple rasterization representation
      nodes.forEach(n => {
        const nx = n.x - minX;
        const ny = n.y - minY;
        ctx.fillStyle = n.bgColor || '#ffffff';
        ctx.strokeStyle = n.borderColor || '#3b82f6';
        ctx.lineWidth = 2;

        if (n.type === 'start' || n.type === 'end') {
          ctx.beginPath();
          ctx.roundRect(nx, ny, n.width, n.height, 999);
          ctx.fill();
          ctx.stroke();
        } else if (n.type === 'decision') {
          ctx.beginPath();
          ctx.moveTo(nx + n.width / 2, ny);
          ctx.lineTo(nx + n.width, ny + n.height / 2);
          ctx.lineTo(nx + n.width / 2, ny + n.height);
          ctx.lineTo(nx, ny + n.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.roundRect(nx, ny, n.width, n.height, 10);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = n.textColor || '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, nx + n.width / 2, ny + n.height / 2);
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-') || 'flowchart'}.png`;
      a.click();
      showToast('Gambar PNG berhasil diunduh!');
    } catch (e) {
      console.error(e);
      showToast('Gagal mengekspor PNG');
    }
  };

  // Export as JSON project
  const handleExportJson = () => {
    const projectData = {
      title: projectTitle,
      direction,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-') || 'flowchart'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File JSON projek berhasil disimpan!');
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y / Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          handleDeleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          e.preventDefault();
          handleDeleteEdge(selectedEdgeId);
        }
      }

      // Escape: clear selection
      if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, historyIndex, history]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find(e => e.id === selectedEdgeId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-100 dark:bg-zinc-950 font-sans select-none">
      {/* Top Professional Studio Navbar */}
      <header className="h-16 border-b border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 flex items-center justify-between z-40 shrink-0">
        {/* Left Section: Back, Title, Status */}
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="p-2 rounded-xl text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Perkakas Tool</span>
          </Link>

          <div className="w-[1px] h-6 bg-stone-200 dark:border-zinc-800 hidden sm:block" />

          {/* Project Title (Inline editable) */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Layers size={16} />
            </div>
            <div>
              <input
                type="text"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                className="text-sm font-bold text-stone-900 dark:text-white bg-transparent hover:bg-stone-100 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 px-2 py-0.5 rounded-lg border border-transparent focus:border-rose-400 outline-none transition-all w-48 sm:w-64 truncate"
              />
              <div className="text-[10px] text-stone-400 dark:text-zinc-500 px-2 flex items-center gap-2">
                <span>{nodes.length} Simbol</span>
                <span>•</span>
                <span>{edges.length} Garis Alur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Undo, Redo, Zoom, Auto-Layout */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl border border-stone-200/60 dark:border-zinc-700/60">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <Redo2 size={15} />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

          <button
            onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
            title="Zoom Out"
            className="p-1.5 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-zinc-700 cursor-pointer"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] font-mono px-1 font-semibold text-stone-600 dark:text-zinc-300 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(2.2, s + 0.1))}
            title="Zoom In"
            className="p-1.5 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-zinc-700 cursor-pointer"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={handleZoomToFit}
            title="Zoom to Fit All"
            className="p-1.5 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-zinc-700 cursor-pointer"
          >
            <Maximize2 size={15} />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

          <button
            onClick={handleAutoLayout}
            title="Auto-Arrange Layout Hierarchy"
            className="py-1 px-2 text-xs font-semibold text-stone-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-zinc-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Auto Layout</span>
          </button>
        </div>

        {/* Right Section: Simulator, AI Architect, Mermaid Export */}
        <div className="flex items-center gap-2">
          {/* Logic Simulator */}
          <button
            onClick={() => setSimulationModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            <span className="hidden sm:inline">Simulasi Alur</span>
          </button>

          {/* AI Generator */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-linear-to-r from-rose-600 to-purple-600 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>AI Architect</span>
          </button>

          {/* Mermaid Modal */}
          <button
            onClick={() => setMermaidModalOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-stone-900 dark:bg-zinc-800 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Code2 size={14} className="text-emerald-400" />
            <span>Mermaid Studio</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Ekspor & Unduh"
            >
              <Download size={16} />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl border border-stone-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 animate-fade-in">
                <button
                  onClick={() => {
                    handleExportPng();
                    setExportMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                >
                  <ImageIcon size={14} className="text-blue-500" />
                  <span>Unduh Gambar (PNG 2x)</span>
                </button>
                <button
                  onClick={() => {
                    setMermaidModalOpen(true);
                    setExportMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                >
                  <Code2 size={14} className="text-emerald-500" />
                  <span>Ekspor Kode Mermaid (.mmd)</span>
                </button>
                <button
                  onClick={() => {
                    handleExportJson();
                    setExportMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                >
                  <Save size={14} className="text-purple-500" />
                  <span>Simpan Projek JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Palette Sidebar */}
        <PaletteSidebar
          isOpen={leftSidebarOpen}
          onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onAddNode={handleAddNode}
          onLoadTemplate={handleLoadTemplate}
          onOpenAiModal={() => setAiModalOpen(true)}
        />

        {/* Central Interactive Flowchart Canvas */}
        <div className="flex-1 h-full relative overflow-hidden">
          <CanvasView
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            activeSimNodeId={simActiveNodeId}
            activeSimEdgeId={simActiveEdgeId}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            canvasBg={canvasBg}
            onSelectNode={id => {
              setSelectedNodeId(id);
              setSelectedEdgeId(null);
            }}
            onSelectEdge={id => {
              setSelectedEdgeId(id);
              setSelectedNodeId(null);
            }}
            onUpdateNode={handleUpdateNode}
            onUpdateNodes={handleUpdateNodes}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onQuickAddChild={handleQuickAddChild}
            onAddEdge={handleAddEdge}
            onUpdateEdge={handleUpdateEdge}
            onDeleteEdge={handleDeleteEdge}
            scale={scale}
            pan={pan}
            onChangeScale={setScale}
            onChangePan={setPan}
          />
        </div>

        {/* Right Inspector Sidebar */}
        <InspectorPanel
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          nodesCount={nodes.length}
          edgesCount={edges.length}
          direction={direction}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          canvasBg={canvasBg}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
          onChangeDirection={d => {
            setDirection(d);
            const arranged = computeAutoLayout(nodes, edges, d);
            setNodes(arranged);
            pushHistory(arranged, edges, d);
          }}
          onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
          onChangeGridSize={setGridSize}
          onChangeCanvasBg={setCanvasBg}
          onTriggerAutoLayout={handleAutoLayout}
        />
      </div>

      {/* Floating Action Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-emerald-400" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Modals */}
      <MermaidModal
        isOpen={mermaidModalOpen}
        onClose={() => setMermaidModalOpen(false)}
        nodes={nodes}
        edges={edges}
        direction={direction}
        projectTitle={projectTitle}
        onApplyMermaidToCanvas={handleApplyMermaid}
      />

      <AiFlowchartModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApplyGeneratedFlowchart={handleApplyAiFlowchart}
      />

      <SimulationModal
        isOpen={simulationModalOpen}
        onClose={() => setSimulationModalOpen(false)}
        nodes={nodes}
        edges={edges}
        onHighlightNode={setSimActiveNodeId}
        onHighlightEdge={setSimActiveEdgeId}
      />
    </div>
  );
};
