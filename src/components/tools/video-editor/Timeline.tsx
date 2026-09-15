import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Video,
  Music2,
  Type,
  Smile,
  Plus,
  Magnet,
  ChevronDown,
} from 'lucide-react';
import { Project, Clip, Track } from './types';

interface TimelineProps {
  project: Project;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedClip: Clip | null;
  onSelectClip: (clip: Clip | null) => void;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onSplitClipAtPlayhead: () => void;
  onReorderClips?: (trackId: string, startIndex: number, endIndex: number) => void;
  onMoveClipToTrack?: (clipId: string, targetTrackId: string, newIndex: number) => void;
  onToggleTrackMute: (trackId: string) => void;
  onToggleTrackHidden: (trackId: string) => void;
  onToggleTrackLock: (trackId: string) => void;
  onAddTrack?: (type: 'video' | 'audio' | 'overlay') => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  onSeek,
  selectedClip,
  onSelectClip,
  onUpdateClip,
  onDeleteClip,
  onDuplicateClip,
  onSplitClipAtPlayhead,
  onToggleTrackMute,
  onToggleTrackHidden,
  onToggleTrackLock,
  onAddTrack,
}) => {
  const [zoomLevel, setZoomLevel] = useState(40); // pixels per second
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [isScrubbingRuler, setIsScrubbingRuler] = useState(false);

  // Dragging / Trimming state
  const [dragState, setDragState] = useState<{
    clipId: string;
    mode: 'move' | 'trim-left' | 'trim-right';
    startX: number;
    initialClipStart: number;
    initialClipDuration: number;
    initialClipOffset: number;
    currentStart: number;
    currentDuration: number;
    snapLine: number | null; // Time in seconds where snap line should appear
  } | null>(null);

  // Timeline dimensions
  const maxClipEnd = project.clips.reduce((acc, c) => Math.max(acc, c.start + c.duration), 0);
  const totalDuration = Math.max(15, project.duration, maxClipEnd + 5);
  const timelineWidthPx = Math.max(900, Math.ceil(totalDuration * zoomLevel));

  // Time formatting helper (MM:SS.s)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Convert mouse event X in timeline to seconds
  const getSecondsFromMouseEvent = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!timelineScrollRef.current) return 0;
      const rect = timelineScrollRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + timelineScrollRef.current.scrollLeft;
      return Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
    },
    [totalDuration, zoomLevel]
  );

  // Ruler Scrubbing
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbingRuler(true);
    const targetTime = getSecondsFromMouseEvent(e);
    onSeek(targetTime);
  };

  // Handle click on empty space in track
  const handleTrackLaneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState) return;
    const targetTime = getSecondsFromMouseEvent(e);
    onSeek(targetTime);
    onSelectClip(null);
  };

  // Mouse move and up handlers for ruler scrubbing and clip drag/trim
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbingRuler) {
        const time = getSecondsFromMouseEvent(e);
        onSeek(time);
        return;
      }

      if (dragState) {
        const deltaPx = e.clientX - dragState.startX;
        const deltaSec = deltaPx / zoomLevel;
        const currentClip = project.clips.find((c) => c.id === dragState.clipId);
        if (!currentClip) return;

        // Snapping targets (0, playhead needle, other clips)
        const snapThresholdSec = 8 / zoomLevel; // 8px tolerance
        const snapTargets = [0, currentTime];
        project.clips.forEach((c) => {
          if (c.id !== currentClip.id && c.trackId === currentClip.trackId) {
            snapTargets.push(c.start);
            snapTargets.push(c.start + c.duration);
          }
        });

        if (dragState.mode === 'move') {
          let newStart = Math.max(0, dragState.initialClipStart + deltaSec);
          let activeSnapLine: number | null = null;

          if (snapEnabled) {
            for (const target of snapTargets) {
              // Snap clip start
              if (Math.abs(newStart - target) <= snapThresholdSec) {
                newStart = target;
                activeSnapLine = target;
                break;
              }
              // Snap clip end
              const newEnd = newStart + dragState.initialClipDuration;
              if (Math.abs(newEnd - target) <= snapThresholdSec) {
                newStart = target - dragState.initialClipDuration;
                activeSnapLine = target;
                break;
              }
            }
          }

          setDragState((prev) =>
            prev
              ? {
                  ...prev,
                  currentStart: Math.max(0, newStart),
                  snapLine: activeSnapLine,
                }
              : null
          );
        } else if (dragState.mode === 'trim-left') {
          // Trimming the in-point
          let newStart = dragState.initialClipStart + deltaSec;
          const maxAllowedStart = dragState.initialClipStart + dragState.initialClipDuration - 0.3;
          newStart = Math.max(0, Math.min(maxAllowedStart, newStart));
          const newDuration = dragState.initialClipDuration - (newStart - dragState.initialClipStart);

          setDragState((prev) =>
            prev
              ? {
                  ...prev,
                  currentStart: newStart,
                  currentDuration: Math.max(0.3, newDuration),
                  snapLine: null,
                }
              : null
          );
        } else if (dragState.mode === 'trim-right') {
          // Trimming the out-point
          let newDuration = dragState.initialClipDuration + deltaSec;
          let activeSnapLine: number | null = null;

          if (snapEnabled) {
            const currentEnd = dragState.initialClipStart + newDuration;
            for (const target of snapTargets) {
              if (Math.abs(currentEnd - target) <= snapThresholdSec) {
                newDuration = target - dragState.initialClipStart;
                activeSnapLine = target;
                break;
              }
            }
          }

          setDragState((prev) =>
            prev
              ? {
                  ...prev,
                  currentDuration: Math.max(0.3, newDuration),
                  snapLine: activeSnapLine,
                }
              : null
          );
        }
      }
    };

    const handleMouseUp = () => {
      if (isScrubbingRuler) {
        setIsScrubbingRuler(false);
      }

      if (dragState) {
        if (dragState.mode === 'move') {
          onUpdateClip(dragState.clipId, {
            start: Math.round(dragState.currentStart * 100) / 100,
          });
        } else if (dragState.mode === 'trim-left') {
          const deltaStart = dragState.currentStart - dragState.initialClipStart;
          onUpdateClip(dragState.clipId, {
            start: Math.round(dragState.currentStart * 100) / 100,
            duration: Math.round(dragState.currentDuration * 100) / 100,
            offset: Math.max(0, Math.round((dragState.initialClipOffset + deltaStart) * 100) / 100),
          });
        } else if (dragState.mode === 'trim-right') {
          onUpdateClip(dragState.clipId, {
            duration: Math.round(dragState.currentDuration * 100) / 100,
          });
        }
        setDragState(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbingRuler,
    dragState,
    zoomLevel,
    snapEnabled,
    currentTime,
    project.clips,
    getSecondsFromMouseEvent,
    onSeek,
    onUpdateClip,
  ]);

  // Start clip drag move
  const handleClipMouseDown = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    onSelectClip(clip);

    setDragState({
      clipId: clip.id,
      mode: 'move',
      startX: e.clientX,
      initialClipStart: clip.start,
      initialClipDuration: clip.duration,
      initialClipOffset: clip.offset,
      currentStart: clip.start,
      currentDuration: clip.duration,
      snapLine: null,
    });
  };

  // Start clip trim left
  const handleTrimLeftMouseDown = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    onSelectClip(clip);

    setDragState({
      clipId: clip.id,
      mode: 'trim-left',
      startX: e.clientX,
      initialClipStart: clip.start,
      initialClipDuration: clip.duration,
      initialClipOffset: clip.offset,
      currentStart: clip.start,
      currentDuration: clip.duration,
      snapLine: null,
    });
  };

  // Start clip trim right
  const handleTrimRightMouseDown = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    onSelectClip(clip);

    setDragState({
      clipId: clip.id,
      mode: 'trim-right',
      startX: e.clientX,
      initialClipStart: clip.start,
      initialClipDuration: clip.duration,
      initialClipOffset: clip.offset,
      currentStart: clip.start,
      currentDuration: clip.duration,
      snapLine: null,
    });
  };

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Music2 size={13} className="text-emerald-400" />;
      case 'overlay':
        return <Type size={13} className="text-amber-400" />;
      default:
        return <Video size={13} className="text-blue-400" />;
    }
  };

  return (
    <div className="h-68 sm:h-76 bg-zinc-950 border-t border-zinc-800 flex flex-col select-none shrink-0 z-20 shadow-2xl">
      {/* 1. Timeline Action & Navigation Bar */}
      <div className="h-10 px-4 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0">
        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Split at Playhead */}
          <button
            onClick={onSplitClipAtPlayhead}
            disabled={!selectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Split Selected Clip at Playhead (S)"
          >
            <Scissors size={14} className="text-rose-400" />
            <span className="hidden sm:inline">Split</span>
          </button>

          {/* Duplicate Clip */}
          <button
            onClick={() => selectedClip && onDuplicateClip(selectedClip.id)}
            disabled={!selectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Duplicate Selected Clip (Ctrl+D)"
          >
            <Copy size={14} />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Delete Clip */}
          <button
            onClick={() => selectedClip && onDeleteClip(selectedClip.id)}
            disabled={!selectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-red-900/40 hover:text-red-300 text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Delete Selected Clip (Del)"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <span className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Magnetic Snap Toggle */}
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
              snapEnabled
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Magnetic Snapping to clips & playhead"
          >
            <Magnet size={13} />
            <span className="text-[10px] font-mono hidden md:inline">Snap</span>
          </button>
        </div>

        {/* Center: Live Timecode Display */}
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-md border border-zinc-800 font-mono text-xs">
          <span className="text-rose-400 font-bold">{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">{formatTime(totalDuration)}</span>
        </div>

        {/* Right: Zoom Level Slider & Add Track */}
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            onClick={() => setZoomLevel((z) => Math.max(15, z - 8))}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Zoom Out Timeline"
          >
            <ZoomOut size={14} />
          </button>

          {/* Zoom Slider */}
          <input
            type="range"
            min="15"
            max="120"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            className="w-20 sm:w-28 h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
            title={`Zoom: ${zoomLevel} px/sec`}
          />

          {/* Zoom In */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(120, z + 8))}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Zoom In Timeline"
          >
            <ZoomIn size={14} />
          </button>

          {/* Add Track Dropdown */}
          {onAddTrack && (
            <div className="relative ml-1">
              <button
                onClick={() => setIsAddTrackOpen(!isAddTrackOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Plus size={12} />
                <span className="hidden sm:inline">Track</span>
                <ChevronDown size={11} />
              </button>

              {isAddTrackOpen && (
                <div
                  onMouseLeave={() => setIsAddTrackOpen(false)}
                  className="absolute right-0 bottom-full mb-1 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 z-50 text-[11px] space-y-0.5"
                >
                  <button
                    onClick={() => {
                      onAddTrack('video');
                      setIsAddTrackOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 text-zinc-200 text-left cursor-pointer"
                  >
                    <Video size={13} className="text-blue-400" />
                    <span>+ Video Track</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddTrack('audio');
                      setIsAddTrackOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 text-zinc-200 text-left cursor-pointer"
                  >
                    <Music2 size={13} className="text-emerald-400" />
                    <span>+ Audio Track</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddTrack('overlay');
                      setIsAddTrackOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800 text-zinc-200 text-left cursor-pointer"
                  >
                    <Type size={13} className="text-amber-400" />
                    <span>+ Overlay Track</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Timeline Splitter: Track Headers (Left) + Timeline Grid (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Fixed Track Control Headers */}
        <div className="w-36 sm:w-44 bg-zinc-900/90 border-r border-zinc-800 flex flex-col shrink-0 z-20">
          {/* Header spacer to match Time Ruler height */}
          <div className="h-7 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center text-[10px] uppercase tracking-wider font-bold text-zinc-500 shrink-0">
            Tracks ({project.tracks.length})
          </div>

          {/* Track Headers List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/80 custom-scrollbar">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className={`h-14 px-2 sm:px-3 flex items-center justify-between transition-colors ${
                  track.locked ? 'bg-zinc-950/70 opacity-60' : 'bg-zinc-900/40 hover:bg-zinc-900/80'
                }`}
              >
                {/* Track Icon & Name */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
                  <div className="p-1 rounded bg-zinc-800 shrink-0">{getTrackIcon(track.type)}</div>
                  <span className="text-xs font-semibold text-zinc-200 truncate" title={track.name}>
                    {track.name}
                  </span>
                </div>

                {/* Track Actions: Mute, Hide, Lock */}
                <div className="flex items-center gap-0.5 text-zinc-400 shrink-0">
                  {track.type !== 'overlay' && (
                    <button
                      onClick={() => onToggleTrackMute(track.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        track.muted ? 'text-red-400 bg-red-500/15' : 'hover:text-white hover:bg-zinc-800'
                      }`}
                      title={track.muted ? 'Unmute Track' : 'Mute Track'}
                    >
                      {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                  )}

                  <button
                    onClick={() => onToggleTrackHidden(track.id)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      track.hidden ? 'text-amber-400 bg-amber-500/15' : 'hover:text-white hover:bg-zinc-800'
                    }`}
                    title={track.hidden ? 'Show Track' : 'Hide Track'}
                  >
                    {track.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  <button
                    onClick={() => onToggleTrackLock(track.id)}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      track.locked ? 'text-rose-400 bg-rose-500/15' : 'hover:text-white hover:bg-zinc-800'
                    }`}
                    title={track.locked ? 'Unlock Track' : 'Lock Track'}
                  >
                    {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Scrollable Timeline Canvas & Accurate Time Ruler */}
        <div
          ref={timelineScrollRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-zinc-950/80 custom-scrollbar"
        >
          <div style={{ width: `${timelineWidthPx}px` }} className="min-h-full flex flex-col relative">
            {/* 1. Precise Time Ruler */}
            <div
              onMouseDown={handleRulerMouseDown}
              className="h-7 bg-zinc-900/95 border-b border-zinc-800 flex items-center relative cursor-ew-resize select-none shrink-0 sticky top-0 z-30"
            >
              {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pointer-events-none"
                  style={{ left: `${sec * zoomLevel}px` }}
                >
                  <div className={`w-px bg-zinc-700 ${sec % 5 === 0 ? 'h-3.5 bg-zinc-500' : 'h-1.5'}`} />
                  {sec % 5 === 0 && (
                    <span className="text-[9px] font-mono text-zinc-400 ml-1 mb-0.5 leading-none select-none">
                      {sec}s
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Track Lanes (Absolute Positioned Clips) */}
            <div className="flex-1 flex flex-col divide-y divide-zinc-800/60 relative">
              {project.tracks.map((track) => {
                const clipsOnTrack = project.clips.filter((c) => c.trackId === track.id);

                return (
                  <div
                    key={track.id}
                    onClick={handleTrackLaneClick}
                    className={`h-14 relative transition-colors ${
                      track.locked ? 'bg-zinc-950/60' : 'bg-zinc-900/20 hover:bg-zinc-900/30'
                    }`}
                  >
                    {/* Background track grid marks */}
                    <div className="absolute inset-0 pointer-events-none flex">
                      {Array.from({ length: Math.ceil(totalDuration / 5) }).map((_, i) => (
                        <div
                          key={i}
                          className="h-full border-r border-zinc-800/30"
                          style={{ width: `${5 * zoomLevel}px` }}
                        />
                      ))}
                    </div>

                    {/* Clips positioned by exact timestamp */}
                    {clipsOnTrack.map((clip) => {
                      const isDraggingThisClip = dragState?.clipId === clip.id;
                      const activeStart = isDraggingThisClip ? dragState.currentStart : clip.start;
                      const activeDuration = isDraggingThisClip ? dragState.currentDuration : clip.duration;

                      const isSelected = selectedClip?.id === clip.id;
                      const clipLeftPx = activeStart * zoomLevel;
                      const clipWidthPx = Math.max(28, activeDuration * zoomLevel);

                      return (
                        <div
                          key={clip.id}
                          onMouseDown={(e) => !track.locked && handleClipMouseDown(e, clip)}
                          style={{
                            left: `${clipLeftPx}px`,
                            width: `${clipWidthPx}px`,
                          }}
                          className={`h-11 absolute top-1.5 rounded-lg select-none flex items-center justify-between px-2 text-xs transition-shadow cursor-grab active:cursor-grabbing group overflow-hidden ${
                            isSelected
                              ? 'ring-2 ring-rose-500 shadow-lg shadow-rose-500/25 z-20 brightness-110'
                              : 'hover:ring-1 hover:ring-zinc-500 z-10'
                          } ${
                            clip.type === 'video'
                              ? 'bg-blue-600/40 border border-blue-500/60 text-blue-100'
                              : clip.type === 'audio'
                              ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-100'
                              : 'bg-amber-600/40 border border-amber-500/60 text-amber-100'
                          } ${isDraggingThisClip ? 'opacity-85 shadow-2xl scale-[1.01] z-30' : ''}`}
                        >
                          {/* Left Trim Handle (In-point) */}
                          <div
                            onMouseDown={(e) => !track.locked && handleTrimLeftMouseDown(e, clip)}
                            className="absolute left-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-black/30 hover:bg-rose-500 text-white/70 hover:text-white flex items-center justify-center cursor-ew-resize transition-all z-20"
                            title="Drag to trim start"
                          >
                            <span className="text-[8px] leading-none opacity-0 group-hover:opacity-100">‹</span>
                          </div>

                          {/* Clip Content Visual Preview */}
                          <div className="flex-1 min-w-0 px-2 flex items-center gap-2 pointer-events-none">
                            {/* Type Icon */}
                            <div className="shrink-0 opacity-80">{getTrackIcon(clip.type)}</div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-[11px] truncate leading-tight">
                                {clip.name}
                              </div>
                              <div className="text-[9px] opacity-75 font-mono flex items-center gap-1">
                                <span>{activeDuration.toFixed(1)}s</span>
                                {clip.speed !== 1 && <span>• {clip.speed}x</span>}
                                {clip.volume !== undefined && clip.volume !== 1 && (
                                  <span>• {Math.round(clip.volume * 100)}%</span>
                                )}
                              </div>
                            </div>

                            {/* Simulated Waveform for Audio */}
                            {clip.type === 'audio' && (
                              <div className="flex items-center gap-0.5 h-4 opacity-40 shrink-0">
                                <span className="w-0.5 h-2 bg-emerald-300 rounded-full" />
                                <span className="w-0.5 h-4 bg-emerald-300 rounded-full" />
                                <span className="w-0.5 h-3 bg-emerald-300 rounded-full" />
                                <span className="w-0.5 h-1.5 bg-emerald-300 rounded-full" />
                                <span className="w-0.5 h-3.5 bg-emerald-300 rounded-full" />
                              </div>
                            )}
                          </div>

                          {/* Right Trim Handle (Out-point) */}
                          <div
                            onMouseDown={(e) => !track.locked && handleTrimRightMouseDown(e, clip)}
                            className="absolute right-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-black/30 hover:bg-rose-500 text-white/70 hover:text-white flex items-center justify-center cursor-ew-resize transition-all z-20"
                            title="Drag to trim end"
                          >
                            <span className="text-[8px] leading-none opacity-0 group-hover:opacity-100">›</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* 3. Magnetic Snap Line (Cyan vertical indicator) */}
            {dragState?.snapLine !== null && dragState?.snapLine !== undefined && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-35 flex flex-col items-center"
                style={{ left: `${dragState.snapLine * zoomLevel}px` }}
              >
                <div className="w-0.5 flex-1 bg-cyan-400 shadow-md shadow-cyan-400/80 animate-pulse" />
              </div>
            )}

            {/* 4. Playhead Needle (Accurate Red Indicator) */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-40 flex flex-col items-center"
              style={{ left: `${currentTime * zoomLevel}px` }}
            >
              {/* Playhead Flag Handle */}
              <div className="w-3.5 h-3.5 bg-rose-500 rotate-45 -mt-1 shadow-md shadow-rose-500/80" />
              <div className="w-0.5 flex-1 bg-rose-500 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
