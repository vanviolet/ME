import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
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
  GripVertical,
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
  onReorderClips: (trackId: string, startIndex: number, endIndex: number) => void;
  onMoveClipToTrack: (clipId: string, targetTrackId: string, newIndex: number) => void;
  onToggleTrackMute: (trackId: string) => void;
  onToggleTrackHidden: (trackId: string) => void;
  onToggleTrackLock: (trackId: string) => void;
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
  onReorderClips,
  onMoveClipToTrack,
  onToggleTrackMute,
  onToggleTrackHidden,
  onToggleTrackLock,
}) => {
  const [zoomLevel, setZoomLevel] = useState(40); // pixels per second
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Time ruler calculations
  const totalDuration = Math.max(15, project.duration);
  const timelineWidthPx = Math.max(800, totalDuration * zoomLevel);

  // Handle Playhead Scrubbing on Time Ruler
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    updatePlayheadFromEvent(e);
  };

  const updatePlayheadFromEvent = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if (!timelineScrollRef.current) return;
      const rect = timelineScrollRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + timelineScrollRef.current.scrollLeft;
      const targetTime = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
      onSeek(targetTime);
    },
    [totalDuration, zoomLevel, onSeek]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updatePlayheadFromEvent(e);
      }
    };
    const handleMouseUp = () => {
      if (isScrubbing) setIsScrubbing(false);
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, updatePlayheadFromEvent]);

  // Drag and Drop reordering with @hello-pangea/dnd
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      onReorderClips(source.droppableId, source.index, destination.index);
    } else {
      onMoveClipToTrack(draggableId, destination.droppableId, destination.index);
    }
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
    <div className="h-64 sm:h-72 bg-zinc-900 border-t border-zinc-800 flex flex-col select-none shrink-0 z-20">
      {/* Timeline Action Bar */}
      <div className="h-10 px-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0">
        {/* Left: Edit Operations */}
        <div className="flex items-center gap-1.5">
          {/* Split at Playhead */}
          <button
            onClick={onSplitClipAtPlayhead}
            disabled={!selectedClip}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Split Selected Clip at Current Playhead (S)"
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-red-950/40 text-red-400 hover:text-red-300 disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors font-medium cursor-pointer"
            title="Delete Selected Clip (Delete / Backspace)"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Right: Zoom Level Slider */}
        <div className="flex items-center gap-2 text-zinc-400">
          <button
            onClick={() => setZoomLevel((z) => Math.max(15, z - 10))}
            className="p-1 hover:text-zinc-100 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>

          <input
            type="range"
            min="15"
            max="120"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            className="w-20 sm:w-28 h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <button
            onClick={() => setZoomLevel((z) => Math.min(120, z + 10))}
            className="p-1 hover:text-zinc-100 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{zoomLevel}px</span>
        </div>
      </div>

      {/* Main Tracks + Timeline Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Track Headers Column */}
        <div className="w-36 sm:w-44 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0 z-10">
          {/* Header spacer aligned with ruler */}
          <div className="h-6 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center text-[10px] font-mono font-bold text-zinc-500 uppercase">
            Tracks
          </div>

          {/* Track Controls List */}
          <div className="flex-1 flex flex-col divide-y divide-zinc-800/80 overflow-y-auto">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 px-2.5 flex items-center justify-between text-zinc-300 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getTrackIcon(track.type)}
                  <span className="text-xs font-semibold truncate text-zinc-200">{track.name}</span>
                </div>

                <div className="flex items-center gap-1 text-zinc-500">
                  {/* Mute Track */}
                  <button
                    onClick={() => onToggleTrackMute(track.id)}
                    className={`p-1 hover:text-zinc-200 transition-colors cursor-pointer ${
                      track.muted ? 'text-amber-400' : ''
                    }`}
                    title={track.muted ? 'Unmute Track' : 'Mute Track'}
                  >
                    {track.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>

                  {/* Hide Track */}
                  <button
                    onClick={() => onToggleTrackHidden(track.id)}
                    className={`p-1 hover:text-zinc-200 transition-colors cursor-pointer ${
                      track.hidden ? 'text-rose-400' : ''
                    }`}
                    title={track.hidden ? 'Show Track' : 'Hide Track'}
                  >
                    {track.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>

                  {/* Lock Track */}
                  <button
                    onClick={() => onToggleTrackLock(track.id)}
                    className={`p-1 hover:text-zinc-200 transition-colors cursor-pointer ${
                      track.locked ? 'text-blue-400' : ''
                    }`}
                    title={track.locked ? 'Unlock Track' : 'Lock Track'}
                  >
                    {track.locked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Scrollable Timeline Tracks & Ruler */}
        <div
          ref={timelineScrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-zinc-950/60 custom-scrollbar"
        >
          <div style={{ width: `${timelineWidthPx}px` }} className="h-full flex flex-col relative">
            {/* 1. Time Ruler */}
            <div
              onMouseDown={handleRulerMouseDown}
              className="h-6 bg-zinc-900/90 border-b border-zinc-800 flex items-center relative cursor-ew-resize select-none shrink-0"
            >
              {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
                <div
                  key={sec}
                  className="absolute top-0 bottom-0 flex flex-col justify-end"
                  style={{ left: `${sec * zoomLevel}px` }}
                >
                  <div className={`w-px bg-zinc-700 ${sec % 5 === 0 ? 'h-3' : 'h-1.5'}`} />
                  {sec % 5 === 0 && (
                    <span className="text-[9px] font-mono text-zinc-400 ml-1 leading-none">
                      {sec}s
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Tracks with Drag and Drop */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex-1 flex flex-col divide-y divide-zinc-800/80 relative">
                {project.tracks.map((track) => {
                  const clips = project.clips.filter((c) => c.trackId === track.id);

                  return (
                    <Droppable key={track.id} droppableId={track.id} direction="horizontal">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`h-16 flex items-center px-1 gap-1 relative transition-colors ${
                            snapshot.isDraggingOver ? 'bg-zinc-800/50' : 'bg-zinc-900/20'
                          }`}
                        >
                          {clips.map((clip, index) => {
                            const isSelected = selectedClip?.id === clip.id;
                            const clipWidth = Math.max(50, clip.duration * zoomLevel);

                            return (
                              <Draggable draggableId={clip.id} index={index}>
                                {(dragProvided, dragSnapshot) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    onClick={() => onSelectClip(clip)}
                                    style={{
                                      width: `${clipWidth}px`,
                                      ...dragProvided.draggableProps.style,
                                    }}
                                    className={`h-12 rounded-lg relative flex items-center justify-between px-2 text-xs select-none transition-all cursor-pointer ${
                                      isSelected
                                        ? 'ring-2 ring-rose-500 shadow-md shadow-rose-500/20 z-20'
                                        : 'hover:ring-1 hover:ring-zinc-600'
                                    } ${
                                      clip.type === 'video'
                                        ? 'bg-blue-600/30 border border-blue-500/40 text-blue-200'
                                        : clip.type === 'audio'
                                        ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-200'
                                        : 'bg-amber-600/30 border border-amber-500/40 text-amber-200'
                                    } ${dragSnapshot.isDragging ? 'opacity-75 scale-105 z-30' : ''}`}
                                  >
                                    {/* Drag Handle */}
                                    <div
                                      {...dragProvided.dragHandleProps}
                                      className="cursor-grab text-zinc-400 hover:text-white mr-1"
                                      title="Drag to reorder clip"
                                    >
                                      <GripVertical size={14} />
                                    </div>

                                    {/* Clip Info */}
                                    <div className="flex-1 min-w-0 pr-1">
                                      <div className="font-semibold text-[11px] truncate leading-tight">
                                        {clip.name}
                                      </div>
                                      <div className="text-[9px] opacity-75 font-mono">
                                        {clip.duration.toFixed(1)}s {clip.speed !== 1 && `• ${clip.speed}x`}
                                      </div>
                                    </div>

                                    {/* Right Trim Handle indicator */}
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newDuration = prompt('Set clip duration (seconds):', clip.duration.toString());
                                        if (newDuration && !isNaN(parseFloat(newDuration))) {
                                          onUpdateClip(clip.id, { duration: Math.max(0.5, parseFloat(newDuration)) });
                                        }
                                      }}
                                      className="h-full w-2 flex items-center justify-center text-[9px] text-zinc-400 hover:text-white hover:bg-white/20 rounded-r transition-colors"
                                      title="Click to adjust duration"
                                    >
                                      ⋮
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </DragDropContext>

            {/* 3. Playhead Needle (Draggable Red Indicator) */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
              style={{ left: `${currentTime * zoomLevel}px` }}
            >
              {/* Playhead Flag Handle */}
              <div className="w-3.5 h-3.5 bg-rose-500 rotate-45 -mt-1 shadow-md shadow-rose-500/50" />
              <div className="w-0.5 flex-1 bg-rose-500 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
