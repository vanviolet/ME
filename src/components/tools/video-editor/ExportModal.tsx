import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Film,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project } from './types';
import { exportVideo } from './renderEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [fps, setFps] = useState<number>(30);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shouldCancelRef = useRef(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    try {
      setIsExporting(true);
      setProgress(0);
      setErrorMessage(null);
      setExportedUrl(null);
      shouldCancelRef.current = false;

      const blob = await exportVideo(
        project,
        resolution,
        fps,
        (pct, frame, total) => {
          setProgress(pct);
          setCurrentFrame(frame);
          setTotalFrames(total);
        },
        () => shouldCancelRef.current
      );

      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      setIsExporting(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    } catch (err: unknown) {
      if (!shouldCancelRef.current) {
        setErrorMessage(err instanceof Error ? err.message : 'Export failed. Please try again.');
      }
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    shouldCancelRef.current = true;
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Film size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Export Video Project</h3>
              <p className="text-[11px] text-zinc-400">High-definition client-side render</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {!exportedUrl && !isExporting && (
            <>
              {/* Resolution Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Resolution</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResolution('720p')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      resolution === '720p'
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold">720p HD</div>
                    <div className="text-[10px] opacity-80">Faster render, ideal for web</div>
                  </button>

                  <button
                    onClick={() => setResolution('1080p')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      resolution === '1080p'
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold">1080p Full HD</div>
                    <div className="text-[10px] opacity-80">Maximum quality & clarity</div>
                  </button>
                </div>
              </div>

              {/* Frame Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Framerate</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFps(30)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      fps === 30
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    30 FPS (Standard)
                  </button>
                  <button
                    onClick={() => setFps(60)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      fps === 60
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    60 FPS (Ultra Smooth)
                  </button>
                </div>
              </div>

              {/* Project Specs Summary */}
              <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs space-y-1 text-zinc-400">
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <span className="text-zinc-200 font-mono font-semibold">{project.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Duration:</span>
                  <span className="text-zinc-200 font-mono font-semibold">{project.duration.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="text-zinc-200 font-mono font-semibold">WebM / MP4 Video</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}

          {/* Export in Progress State */}
          {isExporting && (
            <div className="space-y-4 py-4 text-center">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-zinc-800"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-rose-500 transition-all duration-150"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xl font-bold font-mono text-white">{progress}%</span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-zinc-200">Rendering Video Frames...</div>
                <div className="text-xs text-zinc-400 font-mono">
                  Frame {currentFrame} of {totalFrames}
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel Export
              </button>
            </div>
          )}

          {/* Export Completed State */}
          {exportedUrl && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h4 className="text-base font-bold text-zinc-100">Video Rendered Successfully!</h4>
                <p className="text-xs text-zinc-400 mt-1">Your video is ready to download.</p>
              </div>

              {/* Video Player Preview */}
              <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video max-h-48 mx-auto">
                <video
                  src={exportedUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={exportedUrl}
                  download={`${project.title.toLowerCase().replace(/\s+/g, '-')}-${resolution}.webm`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                >
                  <Download size={15} />
                  <span>Download Video</span>
                </a>

                <button
                  onClick={() => {
                    setExportedUrl(null);
                    setProgress(0);
                  }}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                  title="Render Again"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!exportedUrl && !isExporting && (
          <div className="p-4 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Start Render</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
