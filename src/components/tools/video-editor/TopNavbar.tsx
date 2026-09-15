import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Camera,
  Download,
  Tv,
  Smartphone,
  Square,
  RectangleVertical,
  Film,
  FolderOpen,
  Save,
  Video,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AspectRatio, Project } from './types';
import { ASPECT_RATIOS } from './sampleMedia';

interface TopNavbarProps {
  project: Project;
  onUpdateTitle: (title: string) => void;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTakeSnapshot: () => void;
  onOpenExportModal: () => void;
  onOpenRecordModal: () => void;
  onSaveProject: () => void;
  onLoadProject: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  project,
  onUpdateTitle,
  onChangeAspectRatio,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTakeSnapshot,
  onOpenExportModal,
  onOpenRecordModal,
  onSaveProject,
  onLoadProject,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [aspectDropdownOpen, setAspectDropdownOpen] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aspectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleValue(project.title);
  }, [project.title]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aspectRef.current && !aspectRef.current.contains(e.target as Node)) {
        setAspectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      onUpdateTitle(titleValue.trim());
    } else {
      setTitleValue(project.title);
    }
  };

  const getAspectIcon = (aspect: AspectRatio) => {
    switch (aspect) {
      case '9:16':
        return <Smartphone size={15} />;
      case '1:1':
        return <Square size={15} />;
      case '4:5':
        return <RectangleVertical size={15} />;
      case '21:9':
        return <Film size={15} />;
      default:
        return <Tv size={15} />;
    }
  };

  return (
    <header className="h-14 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-zinc-100 select-none z-30 shrink-0">
      {/* Left Section: Back, Brand & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/tools"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Back to Tools Hub"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline font-medium">Tools</span>
        </Link>

        <div className="h-4 w-px bg-zinc-800" />

        {/* Project Title with inline editor */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs border border-rose-500/20">
            <Video size={14} />
          </div>

          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              autoFocus
              className="bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-100 px-2.5 py-1 rounded-md border border-rose-500 outline-none w-48 sm:w-64"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white px-2 py-1 rounded-md hover:bg-zinc-800/80 transition-colors text-left"
              title="Click to rename project"
            >
              <span className="truncate max-w-[140px] sm:max-w-[220px]">{project.title}</span>
              <span className="text-[10px] text-zinc-500 font-mono group-hover:text-rose-400">✎</span>
            </button>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center gap-1 ml-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Middle Section: Aspect Ratio Picker */}
      <div className="relative" ref={aspectRef}>
        <button
          onClick={() => setAspectDropdownOpen(!aspectDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700/90 text-xs font-semibold text-zinc-200 border border-zinc-700/60 transition-colors shadow-2xs cursor-pointer"
        >
          <span className="text-rose-400">{getAspectIcon(project.aspectRatio)}</span>
          <span>{project.aspectRatio}</span>
          <ChevronDown size={13} className={`text-zinc-400 transition-transform ${aspectDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {aspectDropdownOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Canvas Aspect Ratio
            </div>
            {ASPECT_RATIOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChangeAspectRatio(opt.value);
                  setAspectDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  project.aspectRatio === opt.value
                    ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300">
                    {getAspectIcon(opt.value)}
                  </div>
                  <div>
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500">{opt.sublabel}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Section: Actions (Record, Snapshot, Save/Load, Export) */}
      <div className="flex items-center gap-2">
        {/* Record Camera / Screen */}
        <button
          onClick={onOpenRecordModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700/60 transition-colors cursor-pointer"
          title="Record Screen or Webcam"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Record</span>
        </button>

        {/* Snapshot button */}
        <button
          onClick={onTakeSnapshot}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Capture Current Frame as PNG Image"
        >
          <Camera size={16} />
        </button>

        {/* Save / Load JSON */}
        <button
          onClick={onSaveProject}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Save Project File (.json)"
        >
          <Save size={16} />
        </button>

        <label
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Open / Import Project (.json)"
        >
          <FolderOpen size={16} />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onLoadProject}
            className="hidden"
          />
        </label>

        {/* Export Video Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Download size={14} />
          <span>Export</span>
          <Sparkles size={12} className="text-rose-200" />
        </button>
      </div>
    </header>
  );
};
