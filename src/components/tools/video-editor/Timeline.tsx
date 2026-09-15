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
  Magnet,
  Bookmark,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { Project, Clip, Track, TimelineMarker } from './types';
import { TimelineCanvas } from './TimelineCanvas';

interface TimelineProps {
  project: Project;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedClip: Clip | null;
  onSelectClip: (clip: Clip | null) => void;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onBatchUpdateClips?: (updates: { id: string; updates: Partial<Clip> }[]) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onSplitClipAtPlayhead: () => void;
  onReorderClips?: (trackId: string, startIndex: number, endIndex: number) => void;
  onMoveClipToTrack?: (clipId: string, targetTrackId: string, newIndex: number) => void;
  onToggleTrackMute: (trackId: string) => void;
  onToggleTrackHidden: (trackId: string) => void;
  onToggleTrackLock: (trackId: string) => void;
  onAddTrack?: (type: 'video' | 'audio' | 'overlay') => void;
  onDetachAudio?: (clipId: string) => void;
  onAddMarker?: (marker: TimelineMarker) => void;
  onDeleteMarker?: (markerId: string) => void;
  selectedClipIds?: string[];
  onSelectClipIds?: (ids: string[]) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  onSeek,
  selectedClip,
  onSelectClip,
  onUpdateClip,
  onBatchUpdateClips,
  onDeleteClip,
  onDuplicateClip,
  onSplitClipAtPlayhead,
  onToggleTrackMute,
  onToggleTrackHidden,
  onToggleTrackLock,
  onAddTrack,
  onDetachAudio,
  onAddMarker,
  onDeleteMarker,
  selectedClipIds: externalSelectedClipIds,
  onSelectClipIds: externalOnSelectClipIds,
}) => {
  const [zoomLevel, setZoomLevel] = useState(45); // pixels per second
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);
  const [timelineMode, setTimelineMode] = useState<'canvas' | 'dom'>('canvas');
  const [markerModal, setMarkerModal] = useState<{ isOpen: boolean; marker?: TimelineMarker; time: number } | null>(null);
  const [markerLabel, setMarkerLabel] = useState('');
  const [markerColor, setMarkerColor] = useState('#f59e0b');

  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState({ scrollLeft: 0, scrollTop: 0 });
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 260 });

  // Internal multi-selection state if not provided externally
  const [internalSelectedClipIds, setInternalSelectedClipIds] = useState<string[]>([]);
  const selectedClipIds = externalSelectedClipIds || internalSelectedClipIds;

  const handleSelectClipIds = useCallback(
    (ids: string[]) => {
      if (externalOnSelectClipIds) {
        externalOnSelectClipIds(ids);
      } else {
        setInternalSelectedClipIds(ids);
      }
      if (ids.length > 0) {
        const found = project.clips.find((c) => c.id === ids[ids.length - 1]);
        onSelectClip(found || null);
      } else {
        onSelectClip(null);
      }
    },
    [externalOnSelectClipIds, project.clips, onSelectClip]
  );

  // Sync selectedClip into selectedClipIds
  useEffect(() => {
    if (selectedClip && !selectedClipIds.includes(selectedClip.id)) {
      handleSelectClipIds([selectedClip.id]);
    } else if (!selectedClip && selectedClipIds.length > 0 && !externalSelectedClipIds) {
      handleSelectClipIds([]);
    }
  }, [selectedClip]);

  // Keep track of scroll positions for canvas rendering
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPos({
      scrollLeft: e.currentTarget.scrollLeft,
      scrollTop: e.currentTarget.scrollTop,
    });
  };

  // ResizeObserver for timeline viewport
  useEffect(() => {
    const el = timelineScrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: Math.max(400, entry.contentRect.width),
          height: Math.max(160, entry.contentRect.height),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Timeline dimensions
  const maxClipEnd = project.clips.reduce((acc, c) => Math.max(acc, c.start + c.duration), 0);
  const totalDuration = Math.max(15, project.duration, maxClipEnd + 5);
  const timelineWidthPx = Math.max(1000, Math.ceil(totalDuration * zoomLevel) + 200);
  const timelineHeightPx = Math.max(containerSize.height, 28 + project.tracks.length * 58 + 20);

  // Format time MM:SS.s
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
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

  // Marker creation & editing
  const handleOpenMarkerModal = (marker?: TimelineMarker, atTime?: number) => {
    const time = marker ? marker.time : atTime !== undefined ? atTime : currentTime;
    setMarkerModal({
      isOpen: true,
      marker,
      time,
    });
    setMarkerLabel(marker ? marker.label : `Marker ${(project.markers?.length || 0) + 1}`);
    setMarkerColor(marker ? marker.color : '#f59e0b');
  };

  const handleSaveMarker = () => {
    if (!markerModal) return;
    if (onAddMarker) {
      onAddMarker({
        id: markerModal.marker ? markerModal.marker.id : `marker-${Date.now()}`,
        time: markerModal.time,
        label: markerLabel.trim() || 'Marker',
        color: markerColor,
      });
    }
    setMarkerModal(null);
  };

  const canDetachAudio =
    selectedClip &&
    (selectedClip.type === 'video' || selectedClip.type === 'image') &&
    selectedClip.src &&
    !selectedClip.muted;

  return (
    <div className="h-72 sm:h-80 bg-zinc-950 border-t border-zinc-800 flex flex-col select-none shrink-0 z-20 shadow-2xl relative">
      {/* 1. Timeline Action & Navigation Bar */}
      <div className="h-10 px-3 sm:px-4 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0 gap-2">
        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Split at Playhead */}
          <button
            onClick={onSplitClipAtPlayhead}
            disabled={!selectedClip}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Split Selected Clip at Playhead (S)"
          >
            <Scissors size={13} className="text-rose-400" />
            <span className="hidden sm:inline">Split</span>
          </button>

          {/* Duplicate Clip */}
          <button
            onClick={() => selectedClip && onDuplicateClip(selectedClip.id)}
            disabled={!selectedClip}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Duplicate Selected Clip (Ctrl+D)"
          >
            <Copy size={13} />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Delete Clip */}
          <button
            onClick={() => selectedClip && onDeleteClip(selectedClip.id)}
            disabled={!selectedClip}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-red-900/40 hover:text-red-300 text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Delete Selected Clip (Del)"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Detach Audio Button */}
          {onDetachAudio && canDetachAudio && (
            <button
              onClick={() => onDetachAudio(selectedClip.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-300 transition-colors font-semibold cursor-pointer animate-fadeIn"
              title="Separate video audio into an independent audio track"
            >
              <Volume2 size={13} className="text-emerald-400" />
              <span>Detach Audio</span>
            </button>
          )}

          {/* Add Marker Button */}
          <button
            onClick={() => handleOpenMarkerModal()}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-amber-950/40 hover:text-amber-300 text-zinc-300 border border-zinc-700 hover:border-amber-600/50 transition-colors font-medium cursor-pointer"
            title="Add Timeline Marker at Playhead (M)"
          >
            <Bookmark size={13} className="text-amber-400" />
            <span className="hidden md:inline">+ Marker</span>
          </button>

          <span className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block" />

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

          {/* Engine Mode Toggle (Canvas vs DOM) */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-md border border-zinc-800 ml-1">
            <button
              onClick={() => setTimelineMode('canvas')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                timelineMode === 'canvas'
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="High performance Canvas rendering (Smooth scrolling & instant clip waveforms)"
            >
              <Layers size={11} className={timelineMode === 'canvas' ? 'text-rose-400' : ''} />
              <span>Canvas (Fast)</span>
            </button>
            <button
              onClick={() => setTimelineMode('dom')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                timelineMode === 'dom'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Standard DOM elements mode"
            >
              DOM
            </button>
          </div>
        </div>

        {/* Center: Live Timecode Display */}
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-md border border-zinc-800 font-mono text-xs shrink-0">
          <span className="text-rose-400 font-bold">{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">{formatTime(totalDuration)}</span>
        </div>

        {/* Right: Zoom Level Slider & Add Track */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setZoomLevel((z) => Math.max(15, z - 8))}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Zoom Out Timeline"
          >
            <ZoomOut size={14} />
          </button>

          <input
            type="range"
            min="15"
            max="120"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            className="w-16 sm:w-24 h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
            title={`Zoom: ${zoomLevel} px/sec`}
          />

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
                <span>+ Track</span>
              </button>

              {isAddTrackOpen && (
                <div className="absolute right-0 bottom-full mb-1.5 w-36 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      onAddTrack('video');
                      setIsAddTrackOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Video size={13} className="text-blue-400" />
                    <span>Video Track</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddTrack('audio');
                      setIsAddTrackOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Music2 size={13} className="text-emerald-400" />
                    <span>Audio Track</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddTrack('overlay');
                      setIsAddTrackOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Type size={13} className="text-amber-400" />
                    <span>Text Track</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Timeline Split View (Headers on Left + Canvas/Tracks on Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Fixed Track Control Headers */}
        <div className="w-36 sm:w-44 bg-zinc-900/90 border-r border-zinc-800 flex flex-col shrink-0 z-20">
          <div className="h-7 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-zinc-500 shrink-0">
            <span>Tracks ({project.tracks.length})</span>
            {selectedClipIds.length > 1 && (
              <span className="text-rose-400 font-normal lowercase">{selectedClipIds.length} sel</span>
            )}
          </div>

          {/* Track Headers List synced with vertical scroll */}
          <div
            className="flex-1 overflow-hidden divide-y divide-zinc-800/80"
            style={{
              transform: `translateY(-${scrollPos.scrollTop}px)`,
            }}
          >
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className={`h-[56px] px-2 sm:px-3 flex items-center justify-between transition-colors ${
                  track.locked ? 'bg-zinc-950/70 opacity-60' : 'bg-zinc-900/40 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
                  <div className="p-1 rounded bg-zinc-800 shrink-0">{getTrackIcon(track.type)}</div>
                  <span className="text-xs font-semibold text-zinc-200 truncate" title={track.name}>
                    {track.name}
                  </span>
                </div>

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

        {/* Right Side: Scrollable Timeline Area */}
        <div
          ref={timelineScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-zinc-950/90 custom-scrollbar"
        >
          {timelineMode === 'canvas' ? (
            /* CANVAS / WEBGL TIMELINE RENDERING ENGINE */
            <div style={{ width: `${timelineWidthPx}px`, height: `${timelineHeightPx}px` }} className="relative">
              <TimelineCanvas
                project={project}
                currentTime={currentTime}
                zoomLevel={zoomLevel}
                snapEnabled={snapEnabled}
                selectedClipIds={selectedClipIds}
                onSelectClipIds={handleSelectClipIds}
                onSeek={onSeek}
                onUpdateClip={onUpdateClip}
                onBatchUpdateClips={onBatchUpdateClips}
                onAddMarker={onAddMarker}
                onDeleteMarker={onDeleteMarker}
                onOpenMarkerModal={handleOpenMarkerModal}
                totalDuration={totalDuration}
                scrollLeft={scrollPos.scrollLeft}
                scrollTop={scrollPos.scrollTop}
                canvasWidth={containerSize.width}
                canvasHeight={containerSize.height}
              />
            </div>
          ) : (
            /* FALLBACK DOM RENDERING ENGINE */
            <div style={{ width: `${timelineWidthPx}px` }} className="min-h-full flex flex-col relative">
              {/* Ruler */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const time = Math.max(0, Math.min(totalDuration, (e.clientX - rect.left) / zoomLevel));
                  onSeek(time);
                }}
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

              {/* DOM Track Lanes */}
              <div className="flex-1 flex flex-col divide-y divide-zinc-800/60 relative">
                {project.tracks.map((track) => {
                  const clipsOnTrack = project.clips.filter((c) => c.trackId === track.id);
                  return (
                    <div
                      key={track.id}
                      className={`h-[56px] relative transition-colors ${
                        track.locked ? 'bg-zinc-950/60' : 'bg-zinc-900/20 hover:bg-zinc-900/30'
                      }`}
                    >
                      {clipsOnTrack.map((clip) => {
                        const isSelected = selectedClipIds.includes(clip.id);
                        const clipLeftPx = clip.start * zoomLevel;
                        const clipWidthPx = Math.max(28, clip.duration * zoomLevel);

                        return (
                          <div
                            key={clip.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectClipIds([clip.id]);
                            }}
                            style={{
                              left: `${clipLeftPx}px`,
                              width: `${clipWidthPx}px`,
                            }}
                            className={`h-11 absolute top-1.5 rounded-lg select-none flex items-center justify-between px-2 text-xs transition-shadow cursor-pointer overflow-hidden ${
                              isSelected
                                ? 'ring-2 ring-rose-500 shadow-lg shadow-rose-500/25 z-20 brightness-110'
                                : 'hover:ring-1 hover:ring-zinc-500 z-10'
                            } ${
                              clip.type === 'video'
                                ? 'bg-blue-600/40 border border-blue-500/60 text-blue-100'
                                : clip.type === 'audio'
                                ? 'bg-emerald-600/40 border border-emerald-500/60 text-emerald-100'
                                : 'bg-amber-600/40 border border-amber-500/60 text-amber-100'
                            }`}
                          >
                            <div className="flex-1 min-w-0 px-1 pointer-events-none">
                              <div className="font-bold text-[11px] truncate leading-tight">{clip.name}</div>
                              <div className="text-[9px] opacity-75 font-mono">
                                {clip.duration.toFixed(1)}s
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* DOM Playhead */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-40 flex flex-col items-center"
                style={{ left: `${currentTime * zoomLevel}px` }}
              >
                <div className="w-3.5 h-3.5 bg-rose-500 rotate-45 -mt-1 shadow-md shadow-rose-500/80" />
                <div className="w-0.5 flex-1 bg-rose-500 shadow-sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Marker Configuration Modal */}
      {markerModal?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-sm p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark size={16} className="text-amber-400" />
                <span className="font-bold text-sm text-zinc-100">
                  {markerModal.marker ? 'Edit Marker' : 'Add Timeline Marker'}
                </span>
              </div>
              <button
                onClick={() => setMarkerModal(null)}
                className="text-zinc-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Time (Seconds)</label>
              <div className="font-mono text-sm text-rose-400 bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-800">
                {markerModal.time.toFixed(2)}s ({formatTime(markerModal.time)})
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Marker Label</label>
              <input
                type="text"
                value={markerLabel}
                onChange={(e) => setMarkerLabel(e.target.value)}
                placeholder="e.g. Intro, Drop, Chorus, Cut"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-rose-500"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1.5">Color Tag</label>
              <div className="flex items-center gap-2">
                {[
                  { color: '#f59e0b', name: 'Amber' },
                  { color: '#f43f5e', name: 'Rose' },
                  { color: '#06b6d4', name: 'Cyan' },
                  { color: '#10b981', name: 'Emerald' },
                  { color: '#8b5cf6', name: 'Violet' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setMarkerColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      markerColor === c.color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              {markerModal.marker && onDeleteMarker ? (
                <button
                  onClick={() => {
                    onDeleteMarker(markerModal.marker!.id);
                    setMarkerModal(null);
                  }}
                  className="px-2.5 py-1.5 rounded bg-red-900/40 hover:bg-red-800 text-red-200 text-xs font-semibold cursor-pointer"
                >
                  Delete
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMarkerModal(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMarker}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Marker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
