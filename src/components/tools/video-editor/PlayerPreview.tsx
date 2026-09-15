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

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-zinc-950 items-center justify-between p-3 select-none relative overflow-hidden"
    >
      {/* Aspect Ratio Badge floating top-left */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-800 text-[11px] font-medium text-zinc-300">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        <span>{aspectConfig.label}</span>
        <span className="text-zinc-500 font-mono">({canvasW}×{canvasH})</span>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 relative my-auto">
        <div
          className="relative max-h-full max-w-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-zinc-800/80"
          style={{
            aspectRatio: `${aspectConfig.ratio}`,
            width: aspectConfig.ratio >= 1 ? '100%' : 'auto',
            height: aspectConfig.ratio < 1 ? '100%' : 'auto',
            maxHeight: 'calc(100% - 10px)',
            maxWidth: 'calc(100% - 20px)',
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
            className={`w-full h-full object-contain ${
              selectedClip && (selectedClip.type === 'text' || selectedClip.type === 'sticker')
                ? 'cursor-move'
                : 'cursor-default'
            }`}
          />

          {/* Instruction hint when text/sticker is active */}
          {selectedClip && (selectedClip.type === 'text' || selectedClip.type === 'sticker') && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-sm text-[11px] text-rose-300 border border-rose-500/30 flex items-center gap-1.5 pointer-events-none">
              <Sparkles size={12} />
              <span>Drag overlay on canvas to reposition</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Transport Bar */}
      <div className="w-full max-w-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl px-4 py-2 flex items-center justify-between shadow-xl shrink-0 z-10 mt-2">
        {/* Left: Timecode Display */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-rose-400 font-bold">{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">{formatTime(project.duration)}</span>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Step -1s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 1))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Step backward 1s (Left Arrow)"
          >
            <SkipBack size={16} />
          </button>

          {/* Primary Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          {/* Step +1s */}
          <button
            onClick={() => onSeek(Math.min(project.duration, currentTime + 1))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Step forward 1s (Right Arrow)"
          >
            <SkipForward size={16} />
          </button>

          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLooping ? 'text-rose-400 bg-rose-500/15' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Right: Volume, Speed & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="bg-zinc-800 text-[11px] font-semibold text-zinc-300 px-2 py-1 rounded-md border border-zinc-700 outline-none cursor-pointer"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          {/* Volume Mute */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isMasterMuted ? 'Unmute' : 'Mute'}
            >
              {isMasterMuted || masterVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
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
              className="w-16 h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer hidden sm:inline-block"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
