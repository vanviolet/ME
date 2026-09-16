import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { Project, Clip } from './types';
import { renderProjectFrame, getAspectRatioDimensions } from './renderEngine';
import { ASPECT_RATIOS } from './sampleMedia';

interface PlayerPreviewProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  selectedClip: Clip | null;
  onSelectClip: (clip: Clip | null) => void;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  masterVolume: number;
  onVolumeChange: (volume: number) => void;
  isMasterMuted: boolean;
  onToggleMute: () => void;
}

export const PlayerPreview: React.FC<PlayerPreviewProps> = ({
  project,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  selectedClip,
  onSelectClip,
  onUpdateClip,
  playbackSpeed,
  onChangeSpeed,
  masterVolume,
  onVolumeChange,
  isMasterMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);

  // Aspect ratio dimensions
  const aspectConfig = ASPECT_RATIOS.find((a) => a.value === project.aspectRatio) || ASPECT_RATIOS[0];
  const { width: canvasW, height: canvasH } = getAspectRatioDimensions(project.aspectRatio, 1280);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    renderProjectFrame(ctx, project, currentTime, canvasW, canvasH, selectedClip?.id);
  }, [project, currentTime, canvasW, canvasH, selectedClip?.id]);

  // Format time (MM:SS.ss)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Mouse interaction for moving Text or Sticker overlay directly on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedClip) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    if (selectedClip.type === 'text' && selectedClip.textData) {
      setIsDraggingOverlay(true);
    } else if (selectedClip.type === 'sticker' && selectedClip.stickerData) {
      setIsDraggingOverlay(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingOverlay || !canvasRef.current || !selectedClip) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    if (selectedClip.type === 'text' && selectedClip.textData) {
      onUpdateClip(selectedClip.id, {
        textData: {
          ...selectedClip.textData,
          x: Math.round(xPct),
          y: Math.round(yPct),
        },
      });
    } else if (selectedClip.type === 'sticker' && selectedClip.stickerData) {
      onUpdateClip(selectedClip.id, {
        stickerData: {
          ...selectedClip.stickerData,
          x: Math.round(xPct),
          y: Math.round(yPct),
        },
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingOverlay(false);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0 || !canvasRef.current || !selectedClip) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    if (selectedClip.type === 'text' || selectedClip.type === 'sticker') {
      setIsDraggingOverlay(true);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingOverlay || !canvasRef.current || !selectedClip || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((touch.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((touch.clientY - rect.top) / rect.height) * 100));

    if (selectedClip.type === 'text' && selectedClip.textData) {
      onUpdateClip(selectedClip.id, {
        textData: {
          ...selectedClip.textData,
          x: Math.round(xPct),
          y: Math.round(yPct),
        },
      });
    } else if (selectedClip.type === 'sticker' && selectedClip.stickerData) {
      onUpdateClip(selectedClip.id, {
        stickerData: {
          ...selectedClip.stickerData,
          x: Math.round(xPct),
          y: Math.round(yPct),
        },
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-zinc-950 items-center justify-between p-2 sm:p-3 select-none relative overflow-hidden min-h-0"
    >
      {/* Aspect Ratio Badge floating top-left */}
      <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 sm:gap-2 bg-zinc-900/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-zinc-800 text-[10px] sm:text-[11px] font-medium text-zinc-300">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500" />
        <span>{aspectConfig.label}</span>
        <span className="text-zinc-500 font-mono hidden xs:inline">({canvasW}×{canvasH})</span>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 relative my-auto">
        <div
          className="relative max-h-full max-w-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80"
          style={{
            aspectRatio: `${aspectConfig.ratio}`,
            width: aspectConfig.ratio >= 1 ? '100%' : 'auto',
            height: aspectConfig.ratio < 1 ? '100%' : 'auto',
            maxHeight: 'calc(100% - 6px)',
            maxWidth: 'calc(100% - 12px)',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasMouseUp}
            style={{ touchAction: 'none' }}
            className={`w-full h-full object-contain ${
              selectedClip && (selectedClip.type === 'text' || selectedClip.type === 'sticker')
                ? 'cursor-move'
                : 'cursor-default'
            }`}
          />

          {/* Instruction hint when text/sticker is active */}
          {selectedClip && (selectedClip.type === 'text' || selectedClip.type === 'sticker') && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-[10px] sm:text-[11px] text-rose-300 border border-rose-500/30 flex items-center gap-1 pointer-events-none whitespace-nowrap">
              <Sparkles size={11} />
              <span>Drag to reposition</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Transport Bar */}
      <div className="w-full max-w-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800/80 rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between shadow-xl shrink-0 z-10 mt-1 sm:mt-2 gap-1 sm:gap-2">
        {/* Left: Timecode Display */}
        <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs">
          <span className="text-rose-400 font-bold">{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">{formatTime(project.duration)}</span>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Step -1s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 1))}
            className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer hidden xs:block"
            title="Step backward 1s"
          >
            <SkipBack size={15} />
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>

          {/* Step +1s */}
          <button
            onClick={() => onSeek(Math.min(project.duration, currentTime + 1))}
            className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer hidden xs:block"
            title="Step forward 1s"
          >
            <SkipForward size={15} />
          </button>

          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1 sm:p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLooping ? 'text-rose-400 bg-rose-500/15' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat size={14} />
          </button>
        </div>

        {/* Right: Volume, Speed & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="bg-zinc-800 text-[10px] sm:text-[11px] font-semibold text-zinc-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-zinc-700 outline-none cursor-pointer"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          {/* Volume Mute */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMute}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isMasterMuted ? 'Unmute' : 'Mute'}
            >
              {isMasterMuted || masterVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMasterMuted ? 0 : masterVolume}
              onChange={(e) => {
                onVolumeChange(parseFloat(e.target.value));
              }}
              className="w-14 sm:w-16 h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer hidden md:inline-block"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
