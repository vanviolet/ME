import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Type,
  Music2,
  Smile,
  Palette,
  Sliders,
  LayoutGrid,
  X,
  Scissors,
  Copy,
  Trash2,
  ChevronDown,
  Monitor,
  ArrowLeft,
  Home,
  Wrench,
} from 'lucide-react';
import {
  Project,
  Clip,
  Track,
  ActiveTab,
  MediaAsset,
  AspectRatio,
  TimelineMarker,
} from './types';
import { SAMPLE_VIDEOS, LUT_PRESETS } from './sampleMedia';
import { TopNavbar } from './TopNavbar';
import { LeftSidebar } from './LeftSidebar';
import { PlayerPreview } from './PlayerPreview';
import { Timeline } from './Timeline';
import { RightInspector } from './RightInspector';
import { ExportModal } from './ExportModal';
import { RecordModal } from './RecordModal';
import {
  videoElementCache,
  audioElementCache,
  getOrCreateVideoElement,
  getOrCreateAudioElement,
  renderProjectFrame,
  getAspectRatioDimensions,
  syncAllMediaElements,
  resetMediaElementCache,
} from './renderEngine';

const INITIAL_PROJECT: Project = {
  id: 'proj-1',
  title: 'Untitled Video Project',
  aspectRatio: '16:9',
  backgroundColor: '#09090b',
  duration: 15,
  fps: 30,
  tracks: [
    { id: 'track-overlay', name: 'Text & Overlays', type: 'overlay', muted: false, hidden: false, locked: false },
    { id: 'track-video', name: 'Main Video', type: 'video', muted: false, hidden: false, locked: false },
    { id: 'track-audio', name: 'Audio & Music', type: 'audio', muted: false, hidden: false, locked: false },
  ],
  clips: [
    {
      id: 'clip-sample-video',
      trackId: 'track-video',
      name: 'Coastal Waves',
      type: 'video',
      src: SAMPLE_VIDEOS[0].url,
      thumbnail: SAMPLE_VIDEOS[0].thumbnail,
      start: 0,
      duration: 10,
      offset: 0,
      sourceDuration: 15,
      speed: 1,
      volume: 1,
      muted: false,
      fadeIn: 0.5,
      fadeOut: 0.5,
      opacity: 1,
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      fit: 'cover',
      filters: {
        brightness: 0,
        contrast: 10,
        saturation: 15,
        sepia: 0,
        grayscale: 0,
        invert: 0,
        blur: 0,
        hueRotate: 0,
        vignette: 15,
        lutPreset: 'cinematic',
      },
    },
    {
      id: 'clip-sample-title',
      trackId: 'track-overlay',
      name: 'Welcome Title',
      type: 'text',
      start: 1,
      duration: 5,
      offset: 0,
      speed: 1,
      volume: 1,
      muted: false,
      fadeIn: 0.3,
      fadeOut: 0.3,
      opacity: 1,
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      fit: 'contain',
      filters: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sepia: 0,
        grayscale: 0,
        invert: 0,
        blur: 0,
        hueRotate: 0,
        vignette: 0,
        lutPreset: 'none',
      },
      textData: {
        text: 'CREATIVE VIDEO STUDIO',
        fontFamily: 'Montserrat',
        fontSize: 48,
        fontWeight: 800,
        color: '#ffffff',
        backgroundColor: '#e11d48',
        bgPadding: 10,
        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
        animation: 'bounce',
        x: 50,
        y: 50,
        align: 'center',
      },
    },
  ],
};

export const VideoEditor: React.FC = () => {
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem('vanviolet_video_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_PROJECT;
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [masterVolume, setMasterVolume] = useState(1);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('media');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<
    'media' | 'audio' | 'text' | 'stickers' | 'filters' | 'canvas' | 'inspector' | null
  >(null);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  const playheadTimerRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Recalculate duration automatically when clips change
  const updateProjectWithHistory = useCallback((updater: (prev: Project) => Project) => {
    setProject((prev) => {
      const next = updater(prev);
      // Auto compute total duration
      let maxEnd = 10;
      next.clips.forEach((c) => {
        if (c.start + c.duration > maxEnd) {
          maxEnd = c.start + c.duration;
        }
      });
      next.duration = Math.ceil(maxEnd + 2);

      setUndoStack((u) => [...u.slice(-20), prev]);
      setRedoStack([]);
      localStorage.setItem('vanviolet_video_project', JSON.stringify(next));
      return next;
    });
  }, []);

  // Selected clip helper
  const selectedClip = project.clips.find((c) => c.id === selectedClipId) || null;

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      lastTickTimeRef.current = performance.now();

      const tick = () => {
        const now = performance.now();
        const delta = (now - lastTickTimeRef.current) / 1000;
        lastTickTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= project.duration) {
            setIsPlaying(false);
            return 0; // Loop back
          }
          return next;
        });

        playheadTimerRef.current = requestAnimationFrame(tick);
      };

      playheadTimerRef.current = requestAnimationFrame(tick);
    } else {
      if (playheadTimerRef.current) cancelAnimationFrame(playheadTimerRef.current);
    }

    return () => {
      if (playheadTimerRef.current) cancelAnimationFrame(playheadTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, project.duration]);

  // Master media synchronization (Video and Audio) during playback and scrub
  useEffect(() => {
    syncAllMediaElements(project, currentTime, isPlaying, masterVolume, isMasterMuted);
  }, [isPlaying, currentTime, project, masterVolume, isMasterMuted]);

  // Clean mount/unmount lifecycle for media caches
  useEffect(() => {
    resetMediaElementCache();
    return () => {
      resetMediaElementCache();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (selectedClipId) {
          e.preventDefault();
          handleSplitClipAtPlayhead();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleAddMarker({
          id: `marker-${Date.now()}`,
          time: currentTime,
          label: `Marker ${(project.markers?.length || 0) + 1}`,
          color: '#f59e0b',
        });
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, currentTime]);

  // Undo / Redo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, project]);
    setProject(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, project]);
    setProject(next);
  };

  // Add clip to timeline
  const handleAddClipToTimeline = (clipData: Partial<Clip>) => {
    const newId = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const targetTrackId = clipData.trackId || project.tracks[0].id;

    // Place after current playhead or last clip
    const newClip: Clip = {
      id: newId,
      trackId: targetTrackId,
      name: clipData.name || 'New Clip',
      type: clipData.type || 'video',
      src: clipData.src,
      thumbnail: clipData.thumbnail,
      start: currentTime,
      duration: clipData.duration || 5,
      offset: clipData.offset || 0,
      sourceDuration: clipData.sourceDuration || clipData.duration || 5,
      speed: clipData.speed || 1,
      volume: clipData.volume ?? 1,
      muted: clipData.muted || false,
      fadeIn: 0,
      fadeOut: 0,
      opacity: 1,
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      fit: 'contain',
      filters: clipData.filters || {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sepia: 0,
        grayscale: 0,
        invert: 0,
        blur: 0,
        hueRotate: 0,
        vignette: 0,
        lutPreset: 'none',
      },
      textData: clipData.textData,
      stickerData: clipData.stickerData,
    };

    updateProjectWithHistory((p) => ({
      ...p,
      clips: [...p.clips, newClip],
    }));

    setSelectedClipId(newId);
  };

  // Update clip
  const handleUpdateClip = (clipId: string, updates: Partial<Clip>) => {
    updateProjectWithHistory((p) => ({
      ...p,
      clips: p.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
    }));
  };

  // Delete clip
  const handleDeleteClip = (clipId: string) => {
    updateProjectWithHistory((p) => ({
      ...p,
      clips: p.clips.filter((c) => c.id !== clipId),
    }));
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  // Duplicate clip
  const handleDuplicateClip = (clipId: string) => {
    const original = project.clips.find((c) => c.id === clipId);
    if (!original) return;

    const duplicated: Clip = {
      ...original,
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${original.name} (Copy)`,
      start: original.start + original.duration + 0.2,
    };

    updateProjectWithHistory((p) => ({
      ...p,
      clips: [...p.clips, duplicated],
    }));
    setSelectedClipId(duplicated.id);
    setSelectedClipIds([duplicated.id]);
  };

  // Detach audio from video clip onto a dedicated audio track
  const handleDetachAudio = (clipId: string) => {
    const videoClip = project.clips.find((c) => c.id === clipId);
    if (!videoClip || !videoClip.src) return;

    // Find or create an audio track
    let audioTrack = project.tracks.find((t) => t.type === 'audio' && !t.locked);
    let updatedTracks = [...project.tracks];
    if (!audioTrack) {
      audioTrack = {
        id: `track-audio-${Date.now()}`,
        name: `A${project.tracks.filter((t) => t.type === 'audio').length + 1} Audio`,
        type: 'audio',
        muted: false,
        hidden: false,
        locked: false,
      };
      updatedTracks.push(audioTrack);
    }

    const detachedAudioClip: Clip = {
      id: `clip-audio-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      trackId: audioTrack.id,
      name: `${videoClip.name} (Detached Audio)`,
      type: 'audio',
      src: videoClip.src,
      start: videoClip.start,
      duration: videoClip.duration,
      offset: videoClip.offset,
      sourceDuration: videoClip.sourceDuration,
      speed: videoClip.speed,
      volume: videoClip.volume ?? 1,
      muted: false,
      fadeIn: videoClip.fadeIn || 0,
      fadeOut: videoClip.fadeOut || 0,
      opacity: 1,
      scale: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      fit: 'contain',
      filters: { ...videoClip.filters },
      audioSettings: videoClip.audioSettings ? { ...videoClip.audioSettings } : undefined,
    };

    // Mute original video clip so audio isn't duplicated
    const updatedClips = project.clips
      .map((c) => (c.id === videoClip.id ? { ...c, muted: true } : c))
      .concat(detachedAudioClip);

    updateProjectWithHistory((p) => ({
      ...p,
      tracks: updatedTracks,
      clips: updatedClips,
    }));

    setSelectedClipId(detachedAudioClip.id);
    setSelectedClipIds([detachedAudioClip.id]);
  };

  // Timeline Markers management
  const handleAddMarker = (marker: TimelineMarker) => {
    updateProjectWithHistory((p) => {
      const existing = p.markers ? [...p.markers] : [];
      const idx = existing.findIndex((m) => m.id === marker.id);
      let nextMarkers = [...existing];
      if (idx >= 0) {
        nextMarkers[idx] = marker;
      } else {
        nextMarkers.push(marker);
      }
      return { ...p, markers: nextMarkers };
    });
  };

  const handleDeleteMarker = (markerId: string) => {
    updateProjectWithHistory((p) => ({
      ...p,
      markers: (p.markers || []).filter((m) => m.id !== markerId),
    }));
  };

  // Batch update multiple clips (from multi-drag in canvas timeline)
  const handleBatchUpdateClips = (updates: { id: string; updates: Partial<Clip> }[]) => {
    updateProjectWithHistory((p) => {
      const map = new Map(updates.map((u) => [u.id, u.updates]));
      return {
        ...p,
        clips: p.clips.map((c) => (map.has(c.id) ? { ...c, ...map.get(c.id) } : c)),
      };
    });
  };

  // Split clip at playhead
  const handleSplitClipAtPlayhead = () => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.start || currentTime >= selectedClip.start + selectedClip.duration) {
      alert('Playhead cursor must be inside the selected clip to split it.');
      return;
    }

    const firstHalfDuration = currentTime - selectedClip.start;
    const secondHalfDuration = selectedClip.duration - firstHalfDuration;

    const firstHalf: Clip = {
      ...selectedClip,
      duration: firstHalfDuration,
    };

    const secondHalf: Clip = {
      ...selectedClip,
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${selectedClip.name} (Part 2)`,
      start: currentTime,
      duration: secondHalfDuration,
      offset: selectedClip.offset + firstHalfDuration * selectedClip.speed,
    };

    updateProjectWithHistory((p) => ({
      ...p,
      clips: p.clips.map((c) => (c.id === selectedClip.id ? firstHalf : c)).concat(secondHalf),
    }));

    setSelectedClipId(secondHalf.id);
  };

  // Reorder clips on track (from @hello-pangea/dnd)
  const handleReorderClips = (trackId: string, startIndex: number, endIndex: number) => {
    const trackClips = project.clips.filter((c) => c.trackId === trackId);
    const otherClips = project.clips.filter((c) => c.trackId !== trackId);

    const reordered: Clip[] = Array.from(trackClips);
    const [moved] = reordered.splice(startIndex, 1);
    if (moved) {
      reordered.splice(endIndex, 0, moved);
    }

    // Reposition start times sequentially
    let currentStart = 0;
    const updatedTrackClips: Clip[] = reordered.map((c: Clip) => {
      const clipWithNewStart: Clip = { ...c, start: currentStart };
      currentStart += c.duration;
      return clipWithNewStart;
    });

    updateProjectWithHistory((p) => ({
      ...p,
      clips: [...otherClips, ...updatedTrackClips],
    }));
  };

  // Move clip between tracks
  const handleMoveClipToTrack = (clipId: string, targetTrackId: string, newIndex: number) => {
    const clip = project.clips.find((c) => c.id === clipId);
    if (!clip) return;

    updateProjectWithHistory((p) => ({
      ...p,
      clips: p.clips.map((c) => (c.id === clipId ? { ...c, trackId: targetTrackId } : c)),
    }));
  };

  // Apply LUT filter to selected clip
  const handleApplyLutToSelectedClip = (lutId: string) => {
    const lut = LUT_PRESETS.find((l) => l.id === lutId);
    if (!lut || !selectedClipId) return;

    updateProjectWithHistory((p) => ({
      ...p,
      clips: p.clips.map((c) =>
        c.id === selectedClipId
          ? {
              ...c,
              filters: {
                ...c.filters,
                ...lut.filter,
              },
            }
          : c
      ),
    }));
  };

  // Take snapshot of current frame
  const handleTakeSnapshot = () => {
    const { width, height } = getAspectRatioDimensions(project.aspectRatio, 1920);
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = width;
    snapCanvas.height = height;
    const ctx = snapCanvas.getContext('2d');
    if (!ctx) return;

    renderProjectFrame(ctx, project, currentTime, width, height, null);

    snapCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}-frame-${currentTime.toFixed(1)}s.png`;
      a.click();
    });
  };

  // Save project to JSON
  const handleSaveProject = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}-project.json`;
    a.click();
  };

  // Load project from JSON
  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedProject = JSON.parse(event.target?.result as string);
        if (loadedProject && loadedProject.tracks && loadedProject.clips) {
          setProject(loadedProject);
          setCurrentTime(0);
          setUndoStack([]);
          setRedoStack([]);
        }
      } catch (err) {
        alert('Invalid video project JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Add new track
  const handleAddTrack = (type: 'video' | 'audio' | 'overlay') => {
    const count = project.tracks.filter((t) => t.type === type).length + 1;
    const typeLabel = type === 'video' ? 'V' : type === 'audio' ? 'A' : 'T';
    const newTrack: Track = {
      id: `track-${type}-${Date.now()}`,
      name: `${typeLabel}${count} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      muted: false,
      hidden: false,
      locked: false,
    };
    updateProjectWithHistory((p) => ({
      ...p,
      tracks: [...p.tracks, newTrack],
    }));
  };

  const [bypassMobile, setBypassMobile] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If opened on mobile screen and user has not explicitly bypassed, show clean desktop notice
  if (isMobileScreen && !bypassMobile) {
    return (
      <div className="fixed inset-0 bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 z-50 select-none text-center font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <Monitor size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Desktop Studio Only
            </span>
            <h2 className="text-xl font-bold text-zinc-100">
              Buka di Layar Desktop / Laptop
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Video Editor Studio dirancang khusus untuk pengalaman layar lebar. Pengeditan timeline multi-track, preview canvas, waveform audio, dan keyframing memerlukan ruang layar desktop agar optimal dan nyaman digunakan.
            </p>
          </div>

          <div className="w-full space-y-2.5 pt-2">
            <Link
              to="/tools"
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 active:scale-98 transition-all cursor-pointer"
            >
              <Wrench size={15} />
              <span>Lihat Perkakas Lainnya</span>
            </Link>

            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border border-zinc-700/60"
            >
              <Home size={14} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 w-full text-center">
            <button
              onClick={() => setBypassMobile(true)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Tetap Buka Editor di HP (Mode Eksperimental)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-100 flex flex-col select-none overflow-hidden font-sans z-40">
      {/* Top Navigation Bar */}
      <TopNavbar
        project={project}
        onUpdateTitle={(title) => updateProjectWithHistory((p) => ({ ...p, title }))}
        onChangeAspectRatio={(aspectRatio) =>
          updateProjectWithHistory((p) => ({ ...p, aspectRatio }))
        }
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTakeSnapshot={handleTakeSnapshot}
        onOpenExportModal={() => {
          setIsPlaying(false);
          setIsExportModalOpen(true);
        }}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
      />

      {/* Main Studio Middle Split: Left Sidebar + Center Player Preview + Right Inspector */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Drawer (Media, Audio, Text, Stickers, Filters, Canvas) */}
        <LeftSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          project={project}
          mediaAssets={mediaAssets}
          onAddMediaAsset={(asset) => setMediaAssets((prev) => [asset, ...prev])}
          onAddClipToTimeline={handleAddClipToTimeline}
          onApplyLutToSelectedClip={handleApplyLutToSelectedClip}
          onUpdateProjectBgColor={(backgroundColor) =>
            updateProjectWithHistory((p) => ({ ...p, backgroundColor }))
          }
          onOpenRecordModal={() => setIsRecordModalOpen(true)}
        />

        {/* Center Canvas Viewport */}
        <PlayerPreview
          project={project}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onSeek={(time) => setCurrentTime(time)}
          selectedClip={selectedClip}
          onSelectClip={(c) => setSelectedClipId(c?.id || null)}
          onUpdateClip={handleUpdateClip}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          masterVolume={masterVolume}
          onVolumeChange={setMasterVolume}
          isMasterMuted={isMasterMuted}
          onToggleMute={() => setIsMasterMuted((m) => !m)}
        />

        {/* Right Properties Inspector */}
        <RightInspector
          selectedClip={selectedClip}
          project={project}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onDuplicateClip={handleDuplicateClip}
          onDeselectClip={() => {
            setSelectedClipId(null);
            setSelectedClipIds([]);
          }}
          onDetachAudio={handleDetachAudio}
        />
      </div>

      {/* Bottom Multi-Track Timeline */}
      <Timeline
        project={project}
        currentTime={currentTime}
        onSeek={(time) => setCurrentTime(time)}
        selectedClip={selectedClip}
        onSelectClip={(c) => {
          setSelectedClipId(c?.id || null);
          setSelectedClipIds(c ? [c.id] : []);
        }}
        selectedClipIds={selectedClipIds}
        onSelectClipIds={(ids) => {
          setSelectedClipIds(ids);
          setSelectedClipId(ids.length > 0 ? ids[ids.length - 1] : null);
        }}
        onUpdateClip={handleUpdateClip}
        onBatchUpdateClips={handleBatchUpdateClips}
        onDeleteClip={handleDeleteClip}
        onDuplicateClip={handleDuplicateClip}
        onSplitClipAtPlayhead={handleSplitClipAtPlayhead}
        onReorderClips={handleReorderClips}
        onMoveClipToTrack={handleMoveClipToTrack}
        onAddTrack={handleAddTrack}
        onDetachAudio={handleDetachAudio}
        onAddMarker={handleAddMarker}
        onDeleteMarker={handleDeleteMarker}
        onToggleTrackMute={(trackId) =>
          updateProjectWithHistory((p) => ({
            ...p,
            tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
          }))
        }
        onToggleTrackHidden={(trackId) =>
          updateProjectWithHistory((p) => ({
            ...p,
            tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, hidden: !t.hidden } : t)),
          }))
        }
        onToggleTrackLock={(trackId) =>
          updateProjectWithHistory((p) => ({
            ...p,
            tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
          }))
        }
      />

      {/* Floating Mobile Quick Action Bar (shown when clip selected on mobile) */}
      {selectedClip && !mobileDrawerTab && (
        <div className="lg:hidden fixed bottom-16 left-1/2 -translate-x-1/2 z-35 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1 text-xs">
          <span className="font-semibold text-zinc-300 truncate max-w-[90px] mr-1 text-[11px]">
            {selectedClip.name}
          </span>
          <button
            onClick={handleSplitClipAtPlayhead}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 active:scale-95 transition-all"
            title="Split Clip"
          >
            <Scissors size={14} className="text-rose-400" />
          </button>
          <button
            onClick={() => handleDuplicateClip(selectedClip.id)}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 active:scale-95 transition-all"
            title="Duplicate Clip"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => setMobileDrawerTab('inspector')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] shadow-sm shadow-rose-600/30 active:scale-95 transition-all"
          >
            <Sliders size={12} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDeleteClip(selectedClip.id)}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-red-900/50 text-red-400 active:scale-95 transition-all"
            title="Delete Clip"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Toolbar (lg:hidden) */}
      <nav className="lg:hidden h-14 bg-zinc-950 border-t border-zinc-800/90 px-1 flex items-center justify-around text-zinc-400 select-none z-30 shrink-0">
        <button
          onClick={() => {
            setActiveTab('media');
            setMobileDrawerTab('media');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            mobileDrawerTab === 'media' ? 'text-rose-400 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <FolderOpen size={17} />
          <span>Media</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('text');
            setMobileDrawerTab('text');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            mobileDrawerTab === 'text' ? 'text-rose-400 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Type size={17} />
          <span>Text</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('audio');
            setMobileDrawerTab('audio');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            mobileDrawerTab === 'audio' ? 'text-rose-400 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Music2 size={17} />
          <span>Audio</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stickers');
            setMobileDrawerTab('stickers');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            mobileDrawerTab === 'stickers' ? 'text-rose-400 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Smile size={17} />
          <span>Stickers</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('filters');
            setMobileDrawerTab('filters');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            mobileDrawerTab === 'filters' ? 'text-rose-400 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <Palette size={17} />
          <span>Filters</span>
        </button>

        <button
          onClick={() => setMobileDrawerTab('inspector')}
          className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            mobileDrawerTab === 'inspector'
              ? 'text-rose-400 font-bold'
              : selectedClip
              ? 'text-zinc-200 font-semibold'
              : 'hover:text-zinc-200'
          }`}
        >
          <Sliders size={17} />
          <span>{selectedClip ? 'Clip' : 'Settings'}</span>
          {selectedClip && (
            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('canvas');
            setMobileDrawerTab('canvas');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            mobileDrawerTab === 'canvas' ? 'text-rose-400 font-bold' : 'hover:text-zinc-200'
          }`}
        >
          <LayoutGrid size={17} />
          <span>Canvas</span>
        </button>
      </nav>

      {/* Mobile Tool Drawer / Bottom Sheet Modal */}
      {mobileDrawerTab && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="flex-1"
            onClick={() => setMobileDrawerTab(null)}
          />

          <div className="w-full max-h-[82vh] bg-zinc-900 border-t border-zinc-700/80 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            {/* Drawer Header */}
            <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center">
                  {mobileDrawerTab === 'inspector' ? (
                    <Sliders size={14} />
                  ) : mobileDrawerTab === 'media' ? (
                    <FolderOpen size={14} />
                  ) : mobileDrawerTab === 'text' ? (
                    <Type size={14} />
                  ) : mobileDrawerTab === 'audio' ? (
                    <Music2 size={14} />
                  ) : mobileDrawerTab === 'stickers' ? (
                    <Smile size={14} />
                  ) : mobileDrawerTab === 'filters' ? (
                    <Palette size={14} />
                  ) : (
                    <LayoutGrid size={14} />
                  )}
                </div>
                <div className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                  {mobileDrawerTab === 'inspector'
                    ? selectedClip
                      ? `Edit: ${selectedClip.name}`
                      : 'Project Properties'
                    : `${mobileDrawerTab} Studio`}
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerTab(null)}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <span>Done</span>
                <X size={13} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
              {mobileDrawerTab === 'inspector' ? (
                <RightInspector
                  isMobileDrawer={true}
                  selectedClip={selectedClip}
                  project={project}
                  onUpdateClip={handleUpdateClip}
                  onDeleteClip={(id) => {
                    handleDeleteClip(id);
                    setMobileDrawerTab(null);
                  }}
                  onDuplicateClip={handleDuplicateClip}
                  onDeselectClip={() => {
                    setSelectedClipId(null);
                    setSelectedClipIds([]);
                  }}
                  onDetachAudio={handleDetachAudio}
                />
              ) : (
                <LeftSidebar
                  isMobileDrawer={true}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  project={project}
                  mediaAssets={mediaAssets}
                  onAddMediaAsset={(asset) => setMediaAssets((prev) => [asset, ...prev])}
                  onAddClipToTimeline={(clip) => {
                    handleAddClipToTimeline(clip);
                    setMobileDrawerTab(null);
                  }}
                  onApplyLutToSelectedClip={(lutId) => {
                    handleApplyLutToSelectedClip(lutId);
                  }}
                  onUpdateProjectBgColor={(backgroundColor) =>
                    updateProjectWithHistory((p) => ({ ...p, backgroundColor }))
                  }
                  onOpenRecordModal={() => {
                    setMobileDrawerTab(null);
                    setIsRecordModalOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Video Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          // Resynchronize preview elements so editor remains completely stable and responsive
          syncAllMediaElements(project, currentTime, false, masterVolume, isMasterMuted);
        }}
        project={project}
      />

      {/* Screen & Webcam Record Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onRecordFinished={(asset, addToTimeline) => {
          setMediaAssets((prev) => [asset, ...prev]);
          if (addToTimeline) {
            handleAddClipToTimeline({
              trackId: project.tracks.find((t) => t.type === 'video')?.id || project.tracks[0].id,
              name: asset.name,
              type: 'video',
              src: asset.url,
              duration: asset.duration,
              sourceDuration: asset.duration,
            });
          }
        }}
      />
    </div>
  );
};
