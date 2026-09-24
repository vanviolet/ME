import React from 'react';
import { FlowchartNode, FlowchartEdge, NodeType, EdgeStyle, EdgeLineStyle, CanvasDirection } from './types';
import { ShadcnSelect } from '../../ui/select';
import {
  Sliders,
  Trash2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Paintbrush,
  Maximize2,
  Type,
  Layout,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InspectorPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedNode: FlowchartNode | null;
  selectedEdge: FlowchartEdge | null;
  nodesCount: number;
  edgesCount: number;
  direction: CanvasDirection;
  snapToGrid: boolean;
  gridSize: number;
  canvasBg: 'dots' | 'grid' | 'blank';
  onUpdateNode: (node: FlowchartNode) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onUpdateEdge: (edge: FlowchartEdge) => void;
  onDeleteEdge: (id: string) => void;
  onChangeDirection: (dir: CanvasDirection) => void;
  onToggleSnapToGrid: () => void;
  onChangeGridSize: (size: number) => void;
  onChangeCanvasBg: (bg: 'dots' | 'grid' | 'blank') => void;
  onTriggerAutoLayout: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  isOpen,
  onToggle,
  selectedNode,
  selectedEdge,
  nodesCount,
  edgesCount,
  direction,
  snapToGrid,
  gridSize,
  canvasBg,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onUpdateEdge,
  onDeleteEdge,
  onChangeDirection,
  onToggleSnapToGrid,
  onChangeGridSize,
  onChangeCanvasBg,
  onTriggerAutoLayout,
}) => {
  if (!isOpen) {
    return (
      <div className="hidden lg:flex absolute top-16 right-3 z-30 flex-col gap-2">
        <button
          onClick={onToggle}
          title="Buka Inspector Properti"
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-md text-stone-700 dark:text-zinc-300 hover:text-rose-600 hover:border-rose-400 transition-all cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
    );
  }

  // Preset color palettes
  const colorPresets = [
    { name: 'Emerald', bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
    { name: 'Sky Blue', bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    { name: 'Amber', bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    { name: 'Rose', bg: '#fff1f2', border: '#f43f5e', text: '#9f1239' },
    { name: 'Purple', bg: '#faf5ff', border: '#a855f7', text: '#6b21a8' },
    { name: 'Slate', bg: '#f8fafc', border: '#64748b', text: '#1e293b' },
    { name: 'Dark Cyber', bg: '#18181b', border: '#06b6d4', text: '#e0e7ff' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden"
        onClick={onToggle}
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-72 sm:w-80 max-w-[85vw] h-full lg:static lg:w-72 lg:h-[calc(100vh-64px)] border-l border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex flex-col shrink-0 shadow-2xl lg:shadow-lg select-none transition-all">
        {/* Header */}
        <div className="p-3.5 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={15} className="text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              {selectedNode ? 'Properti Node' : selectedEdge ? 'Properti Garis' : 'Pengaturan Kanvas'}
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* CASE 1: NODE SELECTED */}
        {selectedNode && (
          <div className="space-y-4">
            {/* Label Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Teks Label Utama
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={e => onUpdateNode({ ...selectedNode, label: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 font-medium"
              />
            </div>

            {/* Description Subtitle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Keterangan Tambahan
              </label>
              <textarea
                rows={2}
                value={selectedNode.description || ''}
                onChange={e => onUpdateNode({ ...selectedNode, description: e.target.value })}
                placeholder="Catatan kecil di bawah label..."
                className="w-full px-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 resize-none"
              />
            </div>

            {/* Node Shape / Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Bentuk / Tipe Simbol
              </label>
              <ShadcnSelect
                value={selectedNode.type}
                onChange={(val) => onUpdateNode({ ...selectedNode, type: val as NodeType })}
                size="sm"
                options={[
                  { value: 'process', label: 'Proses / Tugas [Kotak Persegi]' },
                  { value: 'decision', label: 'Keputusan {Belah Ketupat}' },
                  { value: 'start', label: 'Mulai / Selesai ([Pill Kapsul])' },
                  { value: 'input', label: 'Input / Output [/Jajar Genjang/]' },
                  { value: 'database', label: 'Basis Data [(Silinder)]' },
                  { value: 'subroutine', label: 'Subrutin [[Kotak Ganda]]' },
                  { value: 'cloud', label: 'Layanan Cloud [☁️ Awan]' },
                  { value: 'actor', label: 'Aktor / Pengguna [👤 User]' },
                  { value: 'document', label: 'Dokumen [>Laporan]' },
                  { value: 'note', label: 'Catatan Tempel [Sticky Note]' },
                ]}
              />
            </div>

            {/* Color Theme Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Preset Warna
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {colorPresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      onUpdateNode({
                        ...selectedNode,
                        bgColor: preset.bg,
                        borderColor: preset.border,
                        textColor: preset.text,
                      })
                    }
                    className="p-1.5 rounded-lg border text-center text-[10px] font-semibold transition-all hover:scale-105 shadow-2xs"
                    style={{
                      backgroundColor: preset.bg,
                      borderColor: preset.border,
                      color: preset.text,
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-stone-500">Lebar (px)</label>
                <input
                  type="number"
                  min={100}
                  max={400}
                  step={10}
                  value={selectedNode.width}
                  onChange={e => onUpdateNode({ ...selectedNode, width: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs bg-stone-50 dark:bg-zinc-800 border rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-stone-500">Tinggi (px)</label>
                <input
                  type="number"
                  min={50}
                  max={250}
                  step={5}
                  value={selectedNode.height}
                  onChange={e => onUpdateNode({ ...selectedNode, height: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-xs bg-stone-50 dark:bg-zinc-800 border rounded"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onDuplicateNode(selectedNode.id)}
                className="flex-1 py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy size={13} />
                <span>Duplikat</span>
              </button>
              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: EDGE SELECTED */}
        {selectedEdge && !selectedNode && (
          <div className="space-y-4">
            {/* Edge Label */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Label Teks Garis
              </label>
              <input
                type="text"
                value={selectedEdge.label || ''}
                placeholder="Contoh: Ya / Tidak / Sukses / Gagal"
                onChange={e => onUpdateEdge({ ...selectedEdge, label: e.target.value || undefined })}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 font-medium"
              />
            </div>

            {/* Routing Style */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Gaya Lengkungan
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['orthogonal', 'curved', 'straight'] as EdgeStyle[]).map(style => (
                  <button
                    key={style}
                    onClick={() => onUpdateEdge({ ...selectedEdge, style })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      (selectedEdge.style || 'orthogonal') === style
                        ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {style === 'orthogonal' ? 'Siku' : style === 'curved' ? 'Lengkung' : 'Lurus'}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Dash Style */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Pola Garis
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['solid', 'dashed', 'dotted'] as EdgeLineStyle[]).map(lineStyle => (
                  <button
                    key={lineStyle}
                    onClick={() => onUpdateEdge({ ...selectedEdge, lineStyle })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      (selectedEdge.lineStyle || 'solid') === lineStyle
                        ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {lineStyle === 'solid' ? 'Solid' : lineStyle === 'dashed' ? 'Putus' : 'Titik'}
                  </button>
                ))}
              </div>
            </div>

            {/* Edge Color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Warna Garis
              </label>
              <div className="flex items-center gap-2">
                {['#64748b', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'].map(color => (
                  <button
                    key={color}
                    onClick={() => onUpdateEdge({ ...selectedEdge, color })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      selectedEdge.color === color ? 'scale-125 border-rose-500' : 'border-white dark:border-zinc-800'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => onDeleteEdge(selectedEdge.id)}
              className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} />
              <span>Hapus Garis Penghubung</span>
            </button>
          </div>
        )}

        {/* CASE 3: CANVAS SETTINGS (Nothing Selected) */}
        {!selectedNode && !selectedEdge && (
          <div className="space-y-4">
            {/* Auto-Layout Hero Action */}
            <div className="p-3 rounded-xl bg-linear-to-r from-rose-500/10 via-amber-500/10 to-blue-500/10 border border-rose-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-500" />
                  Auto-Layout Rapi
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-zinc-400 leading-relaxed">
                Rapikan posisi diagram secara otomatis berdasarkan hierarki cabang.
              </p>
              <button
                onClick={onTriggerAutoLayout}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-transform active:scale-98"
              >
                Susun Ulang Otomatis
              </button>
            </div>

            {/* Flow Direction */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Arah Alur (Flow Direction)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeDirection('TD')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    direction === 'TD'
                      ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  <span>Atas ke Bawah (TD)</span>
                </button>
                <button
                  onClick={() => onChangeDirection('LR')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    direction === 'LR'
                      ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  <span>Kiri ke Kanan (LR)</span>
                </button>
              </div>
            </div>

            {/* Canvas Background Pattern */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400">
                Pola Latar Kanvas
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['dots', 'grid', 'blank'] as const).map(bg => (
                  <button
                    key={bg}
                    onClick={() => onChangeCanvasBg(bg)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      canvasBg === bg
                        ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {bg === 'dots' ? 'Titik (Dots)' : bg === 'grid' ? 'Grid Kotak' : 'Polos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Snap to Grid */}
            <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                  Magnet Snap to Grid
                </span>
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={onToggleSnapToGrid}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Diagram Telemetry Stats */}
            <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono font-semibold uppercase text-stone-400 tracking-wider">
                Statistik Diagram
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80">
                  <div className="text-lg font-bold text-stone-900 dark:text-white font-mono">{nodesCount}</div>
                  <div className="text-[10px] text-stone-500">Total Simbol Node</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80">
                  <div className="text-lg font-bold text-stone-900 dark:text-white font-mono">{edgesCount}</div>
                  <div className="text-[10px] text-stone-500">Koneksi Alur</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};
