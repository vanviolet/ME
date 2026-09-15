import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Upload,
  Sparkles,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopNavbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onOpenExport: () => void;
  onUploadImage: () => void;
  onResetCanvas: () => void;
  onOpenTemplates: () => void;
  activeTemplateName?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onOpenExport,
  onUploadImage,
  onResetCanvas,
  onOpenTemplates,
  activeTemplateName,
}) => {
  return (
    <header className="w-full h-14 px-2.5 sm:px-4 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 z-20 select-none">
      {/* Left side: Back to Tools & Undo/Redo & App Brand */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <Link
          to="/tools"
          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700/80 shrink-0"
          title="Back to Tools"
        >
          <ArrowLeft size={15} />
        </Link>

        {/* Undo / Redo buttons */}
        <div className="flex items-center gap-0.5 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-zinc-300 transition-colors"
          >
            <Undo2 size={14} />
            <span className="hidden md:inline">Undo</span>
          </button>
          <div className="w-[1px] h-3.5 bg-zinc-800" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-zinc-300 transition-colors"
          >
            <Redo2 size={14} />
            <span className="hidden md:inline">Redo</span>
          </button>
        </div>

        {/* Template name indicator badge (Desktop only) */}
        {activeTemplateName && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/50 text-[11px] font-medium text-zinc-300 truncate max-w-[180px]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
            <span className="truncate">{activeTemplateName}</span>
          </div>
        )}
      </div>

      {/* Center / Right Controls: Zoom & Templates & Upload & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Templates Picker Trigger */}
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/70 transition-all"
          title="Browse Studio Templates"
        >
          <Sparkles size={14} className="text-purple-400 shrink-0" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        {/* Upload Photo Button */}
        <button
          onClick={onUploadImage}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700/70 transition-all"
          title="Upload Photo or Graphic"
        >
          <Upload size={14} className="text-zinc-400 shrink-0" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:flex"
          >
            <ZoomOut size={13} />
          </button>

          <button
            onClick={onZoomFit}
            title="Fit to Screen (Click to auto-fit)"
            className="px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-mono font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button
            onClick={onZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:flex"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Reset / Clear */}
        <button
          onClick={onResetCanvas}
          title="Reset Canvas"
          className="hidden lg:flex items-center p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
        >
          <RotateCcw size={14} />
        </button>

        {/* EXPORT IMAGE BUTTON */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0"
        >
          <Download size={14} className="stroke-[2.5]" />
          <span className="font-sans font-bold tracking-wide">
            <span className="hidden sm:inline">Export Image</span>
            <span className="sm:hidden">Export</span>
          </span>
        </button>
      </div>
    </header>
  );
};
