import React, { useState } from 'react';
import { NodeType, CanvasDirection } from './types';
import { FLOWCHART_TEMPLATES, FlowchartTemplate } from './templates';
import {
  Play,
  Square,
  Diamond,
  Database,
  Cloud,
  FileText,
  User,
  StickyNote,
  Layers,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Sparkles,
  Search,
  Check,
  Plus,
} from 'lucide-react';

interface PaletteSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddNode: (type: NodeType) => void;
  onLoadTemplate: (template: FlowchartTemplate) => void;
  onOpenAiModal: () => void;
}

export const PaletteSidebar: React.FC<PaletteSidebarProps> = ({
  isOpen,
  onToggle,
  onAddNode,
  onLoadTemplate,
  onOpenAiModal,
}) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'templates'>('nodes');
  const [templateSearch, setTemplateSearch] = useState('');

  const nodePaletteItems: {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'start',
      label: 'Mulai / Selesai',
      description: 'Terminator pill',
      icon: <Play size={14} />,
      color: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300',
    },
    {
      type: 'process',
      label: 'Proses / Aksi',
      description: 'Kotak instruksi tugas',
      icon: <Square size={14} />,
      color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-700 dark:text-blue-300',
    },
    {
      type: 'decision',
      label: 'Keputusan (If/Else)',
      description: 'Belah ketupat kondisi',
      icon: <Diamond size={14} />,
      color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300',
    },
    {
      type: 'input',
      label: 'Input / Output',
      description: 'Data I/O jajar genjang',
      icon: <Layers size={14} />,
      color: 'bg-green-50 dark:bg-green-950/40 border-green-400 text-green-700 dark:text-green-300',
    },
    {
      type: 'database',
      label: 'Basis Data',
      description: 'Silinder database / cache',
      icon: <Database size={14} />,
      color: 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-700 dark:text-purple-300',
    },
    {
      type: 'cloud',
      label: 'Layanan Cloud / API',
      description: 'External service / webhook',
      icon: <Cloud size={14} />,
      color: 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-700 dark:text-sky-300',
    },
    {
      type: 'subroutine',
      label: 'Subrutin / Modul',
      description: 'Predefined process ganda',
      icon: <Layers size={14} />,
      color: 'bg-slate-50 dark:bg-slate-900 border-slate-400 text-slate-700 dark:text-slate-300',
    },
    {
      type: 'actor',
      label: 'Aktor / Pengguna',
      description: 'Client / user persona',
      icon: <User size={14} />,
      color: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 text-cyan-700 dark:text-cyan-300',
    },
    {
      type: 'document',
      label: 'Dokumen / Laporan',
      description: 'File cetak atau payload PDF',
      icon: <FileText size={14} />,
      color: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-400 text-fuchsia-700 dark:text-fuchsia-300',
    },
    {
      type: 'note',
      label: 'Catatan Tempel',
      description: 'Sticky note anotasi',
      icon: <StickyNote size={14} />,
      color: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-400 text-yellow-700 dark:text-yellow-300',
    },
  ];

  const filteredTemplates = FLOWCHART_TEMPLATES.filter(
    t =>
      t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div className="absolute top-16 left-3 z-30 flex flex-col gap-2">
        <button
          onClick={onToggle}
          title="Buka Panel Komponen & Template"
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-md text-stone-700 dark:text-zinc-300 hover:text-rose-600 hover:border-rose-400 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 h-[calc(100vh-64px)] border-r border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex flex-col z-30 shrink-0 shadow-lg select-none transition-all">
      {/* Top Header */}
      <div className="p-3 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-0.5 bg-stone-100 dark:bg-zinc-800 rounded-lg w-full">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'nodes'
                ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            Bentuk Node
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            Template Pro
          </button>
        </div>

        <button
          onClick={onToggle}
          title="Tutup Panel"
          className="ml-2 p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* AI Generator Banner */}
      <div className="p-3 border-b border-stone-100 dark:border-zinc-800/80 bg-linear-to-r from-rose-500/10 via-purple-500/10 to-blue-500/10">
        <button
          onClick={onOpenAiModal}
          className="w-full py-2 px-3 bg-linear-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-95 text-white rounded-xl shadow-xs text-xs font-semibold flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
        >
          <Sparkles size={14} className="animate-spin-slow" />
          <span>Buat Flowchart dengan AI</span>
        </button>
      </div>

      {/* Body: Nodes Tab */}
      {activeTab === 'nodes' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <span className="text-[10px] font-mono font-semibold uppercase text-stone-400 dark:text-zinc-500 tracking-wider">
            Klik untuk Menambahkan ke Canvas
          </span>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {nodePaletteItems.map(item => (
              <button
                key={item.type}
                onClick={() => onAddNode(item.type)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all hover:scale-[1.02] active:scale-98 shadow-2xs hover:shadow-sm cursor-pointer ${item.color}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/60 shadow-2xs">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-none">{item.label}</div>
                    <div className="text-[10px] opacity-75 mt-1">{item.description}</div>
                  </div>
                </div>
                <Plus size={14} className="opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Body: Templates Tab */}
      {activeTab === 'templates' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari arsitektur..."
              value={templateSearch}
              onChange={e => setTemplateSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-2">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => onLoadTemplate(template)}
                className="group p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-rose-600 bg-stone-50/50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold uppercase text-rose-600 dark:text-rose-400">
                    {template.category}
                  </span>
                  <span className="text-[10px] font-mono bg-stone-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-stone-600 dark:text-zinc-300">
                    {template.nodes.length} nodes
                  </span>
                </div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-zinc-100 mt-1 group-hover:text-rose-600 transition-colors">
                  {template.title}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
