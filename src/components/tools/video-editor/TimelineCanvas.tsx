import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Project, Clip, Track, TimelineMarker } from './types';

interface TimelineCanvasProps {
  project: Project;
  currentTime: number;
  zoomLevel: number; // px per second
  snapEnabled: boolean;
  selectedClipIds: string[];
  onSelectClipIds: (ids: string[]) => void;
  onSeek: (time: number) => void;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onBatchUpdateClips?: (updates: { id: string; updates: Partial<Clip> }[]) => void;
  onAddMarker?: (marker: TimelineMarker) => void;
  onDeleteMarker?: (markerId: string) => void;
  onOpenMarkerModal?: (marker?: TimelineMarker, atTime?: number) => void;
  totalDuration: number;
  scrollLeft: number;
  scrollTop: number;
  canvasWidth: number;
  canvasHeight: number;
}

const RULER_HEIGHT = 28;
const TRACK_HEIGHT = 56;
const TRACK_GAP = 2;
const TRIM_HANDLE_WIDTH = 12;

// Thumbnail cache to prevent redrawing/fetching
const thumbnailImgCache = new Map<string, HTMLImageElement>();
function getCachedThumbnail(src: string): HTMLImageElement | null {
  if (thumbnailImgCache.has(src)) {
    const img = thumbnailImgCache.get(src)!;
    return img.complete ? img : null;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  thumbnailImgCache.set(src, img);
  return null;
}

// Procedural pseudo-random waveform peaks generator based on clip identity
function getClipWaveformPeaks(clip: Clip, count: number): number[] {
  const peaks: number[] = [];
  let seed = 0;
  for (let i = 0; i < clip.id.length; i++) {
    seed = (seed * 31 + clip.id.charCodeAt(i)) % 10007;
  }
  const vol = Math.min(1.5, clip.volume ?? 1);

  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd1 = seed / 233280;
    seed = (seed * 9301 + 49297) % 233280;
    const rnd2 = seed / 233280;
    // Natural audio-like rhythmic clustering
    const wave = Math.sin((i / count) * Math.PI * 16) * 0.35 + 0.5;
    const val = Math.min(1, Math.max(0.12, (wave * 0.6 + rnd1 * 0.4) * vol * (0.4 + rnd2 * 0.6)));
    peaks.push(val);
  }
  return peaks;
}

export const TimelineCanvas: React.FC<TimelineCanvasProps> = ({
  project,
  currentTime,
  zoomLevel,
  snapEnabled,
  selectedClipIds,
  onSelectClipIds,
  onSeek,
  onUpdateClip,
  onBatchUpdateClips,
  onAddMarker,
  onDeleteMarker,
  onOpenMarkerModal,
  totalDuration,
  scrollLeft,
  scrollTop,
  canvasWidth,
  canvasHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction State
  const [hoverCursor, setHoverCursor] = useState<string>('default');
  const [activeSnapLine, setActiveSnapLine] = useState<number | null>(null);

  const interactionRef = useRef<{
    mode: 'none' | 'scrub' | 'move-clips' | 'trim-left' | 'trim-right' | 'marquee' | 'drag-marker';
    startX: number;
    startY: number;
    initialMouseTime: number;
    targetClipId?: string;
    initialClipPositions?: Map<string, { start: number; duration: number; offset: number }>;
    markerId?: string;
    marqueeBox?: { x1: number; y1: number; x2: number; y2: number };
    hasMoved: boolean;
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    initialMouseTime: 0,
    hasMoved: false,
  });

  // Calculate snap points (starts and ends of all clips + markers + playhead)
  const getSnapPoints = useCallback(
    (excludeClipIds: string[] = []): number[] => {
      const points = [0, currentTime];
      if (project.markers) {
        project.markers.forEach((m) => points.push(m.time));
      }
      project.clips.forEach((c) => {
        if (!excludeClipIds.includes(c.id)) {
          points.push(c.start);
          points.push(c.start + c.duration);
        }
      });
      return points;
    },
    [project.clips, project.markers, currentTime]
  );

  // Find snap target
  const findSnap = useCallback(
    (targetTime: number, excludeClipIds: string[] = [], tolerancePx = 10): { snappedTime: number; snapPoint: number | null } => {
      if (!snapEnabled) return { snappedTime: targetTime, snapPoint: null };
      const points = getSnapPoints(excludeClipIds);
      const toleranceSec = tolerancePx / zoomLevel;

      let closestDiff = Infinity;
      let snapPoint: number | null = null;

      for (const pt of points) {
        const diff = Math.abs(targetTime - pt);
        if (diff < toleranceSec && diff < closestDiff) {
          closestDiff = diff;
          snapPoint = pt;
        }
      }

      if (snapPoint !== null) {
        return { snappedTime: snapPoint, snapPoint };
      }
      return { snappedTime: targetTime, snapPoint: null };
    },
    [snapEnabled, getSnapPoints, zoomLevel]
  );

  // Convert canvas mouse coordinates to timeline track index & time
  const getTimelineCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { time: 0, trackIndex: -1, isRuler: false, rawX: 0, rawY: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      const worldX = rawX + scrollLeft;
      const worldY = rawY + scrollTop;

      const isRuler = rawY < RULER_HEIGHT;
      const time = Math.max(0, Math.min(totalDuration, worldX / zoomLevel));
      const trackIndex = isRuler ? -1 : Math.floor((worldY - RULER_HEIGHT) / (TRACK_HEIGHT + TRACK_GAP));

      return { time, trackIndex, isRuler, rawX, rawY, worldX, worldY };
    },
    [scrollLeft, scrollTop, totalDuration, zoomLevel]
  );

  // Find clip at world coordinates
  const findClipAt = useCallback(
    (worldX: number, worldY: number) => {
      if (worldY < RULER_HEIGHT) return null;
      const trackIndex = Math.floor((worldY - RULER_HEIGHT) / (TRACK_HEIGHT + TRACK_GAP));
      if (trackIndex < 0 || trackIndex >= project.tracks.length) return null;
      const track = project.tracks[trackIndex];
      const time = worldX / zoomLevel;

      // Find clip on this track spanning this time
      const clip = project.clips.find(
        (c) => c.trackId === track.id && time >= c.start && time <= c.start + c.duration
      );
      if (!clip) return null;

      // Check if mouse is on left or right trim handle
      const clipLeftPx = clip.start * zoomLevel;
      const clipRightPx = (clip.start + clip.duration) * zoomLevel;
      const isLeftTrim = Math.abs(worldX - clipLeftPx) <= TRIM_HANDLE_WIDTH;
      const isRightTrim = Math.abs(worldX - clipRightPx) <= TRIM_HANDLE_WIDTH;

      return {
        clip,
        track,
        trackIndex,
        isLeftTrim,
        isRightTrim,
        clipLeftPx,
        clipRightPx,
      };
    },
    [project.tracks, project.clips, zoomLevel]
  );

  // Find marker at ruler coordinates
  const findMarkerAt = useCallback(
    (worldX: number, worldY: number) => {
      if (worldY > RULER_HEIGHT || !project.markers) return null;
      const toleranceSec = 8 / zoomLevel;
      const time = worldX / zoomLevel;
      return project.markers.find((m) => Math.abs(m.time - time) <= toleranceSec) || null;
    },
    [project.markers, zoomLevel]
  );

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    // Offset view by scroll position
    ctx.translate(-scrollLeft, -scrollTop);

    // ==========================================
    // 1. DRAW TRACK LANES & BACKGROUND
    // ==========================================
    const totalTracks = project.tracks.length;
    for (let i = 0; i < totalTracks; i++) {
      const track = project.tracks[i];
      const trackTop = RULER_HEIGHT + i * (TRACK_HEIGHT + TRACK_GAP);

      // Track lane background
      if (track.locked) {
        ctx.fillStyle = 'rgba(24, 24, 27, 0.45)';
      } else {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(39, 39, 42, 0.2)' : 'rgba(24, 24, 27, 0.15)';
      }
      ctx.fillRect(scrollLeft, trackTop, canvasWidth, TRACK_HEIGHT);

      // Lane bottom border
      ctx.strokeStyle = 'rgba(63, 63, 70, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scrollLeft, trackTop + TRACK_HEIGHT + 0.5);
      ctx.lineTo(scrollLeft + canvasWidth, trackTop + TRACK_HEIGHT + 0.5);
      ctx.stroke();

      // Track locked crosshatch pattern
      if (track.locked) {
        ctx.save();
        ctx.strokeStyle = 'rgba(113, 113, 122, 0.12)';
        ctx.lineWidth = 1;
        const startX = Math.floor(scrollLeft / 24) * 24;
        for (let x = startX; x < scrollLeft + canvasWidth + TRACK_HEIGHT; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, trackTop);
          ctx.lineTo(x - TRACK_HEIGHT, trackTop + TRACK_HEIGHT);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // ==========================================
    // 2. ADAPTIVE TIME GRID LINES
    // ==========================================
    let majorInterval = 5; // seconds
    let minorInterval = 1;

    if (zoomLevel >= 120) {
      majorInterval = 1;
      minorInterval = 0.2;
    } else if (zoomLevel >= 60) {
      majorInterval = 2;
      minorInterval = 0.5;
    } else if (zoomLevel >= 30) {
      majorInterval = 5;
      minorInterval = 1;
    } else if (zoomLevel >= 15) {
      majorInterval = 10;
      minorInterval = 2;
    } else {
      majorInterval = 30;
      minorInterval = 5;
    }

    const startSec = Math.max(0, Math.floor(scrollLeft / zoomLevel / minorInterval) * minorInterval);
    const endSec = Math.min(totalDuration + 10, Math.ceil((scrollLeft + canvasWidth) / zoomLevel / minorInterval) * minorInterval);

    const tracksTotalHeight = totalTracks * (TRACK_HEIGHT + TRACK_GAP);

    ctx.save();
    for (let s = startSec; s <= endSec; s += minorInterval) {
      const x = Math.round(s * zoomLevel);
      const isMajor = Math.abs(s % majorInterval) < 0.001;

      // Track vertical grid line
      ctx.beginPath();
      ctx.strokeStyle = isMajor ? 'rgba(82, 82, 91, 0.25)' : 'rgba(63, 63, 70, 0.1)';
      ctx.lineWidth = 1;
      ctx.moveTo(x + 0.5, RULER_HEIGHT);
      ctx.lineTo(x + 0.5, RULER_HEIGHT + tracksTotalHeight);
      ctx.stroke();
    }
    ctx.restore();

    // ==========================================
    // 3. DRAW CLIPS ON TRACKS
    // ==========================================
    for (let i = 0; i < totalTracks; i++) {
      const track = project.tracks[i];
      const trackTop = RULER_HEIGHT + i * (TRACK_HEIGHT + TRACK_GAP);
      const clipsOnTrack = project.clips.filter((c) => c.trackId === track.id);

      for (const clip of clipsOnTrack) {
        const clipX = clip.start * zoomLevel;
        const clipW = Math.max(28, clip.duration * zoomLevel);
        const clipY = trackTop + 4;
        const clipH = TRACK_HEIGHT - 8;
        const isSelected = selectedClipIds.includes(clip.id);

        // Visibility cull
        if (clipX + clipW < scrollLeft || clipX > scrollLeft + canvasWidth) {
          continue;
        }

        ctx.save();

        // Clip Rounded Path
        ctx.beginPath();
        const r = 6;
        ctx.roundRect(clipX, clipY, clipW, clipH, r);
        ctx.clip();

        // Base Clip Gradient & Colors based on Clip Type
        let bgGradient = ctx.createLinearGradient(clipX, clipY, clipX, clipY + clipH);
        let strokeColor = '#3b82f6';
        let accentColor = '#60a5fa';

        if (clip.type === 'video') {
          bgGradient.addColorStop(0, '#1d4ed8'); // blue-700
          bgGradient.addColorStop(1, '#1e3a8a'); // blue-900
          strokeColor = '#3b82f6';
          accentColor = '#93c5fd';
        } else if (clip.type === 'audio') {
          bgGradient.addColorStop(0, '#047857'); // emerald-700
          bgGradient.addColorStop(1, '#064e3b'); // emerald-900
          strokeColor = '#10b981';
          accentColor = '#6ee7b7';
        } else if (clip.type === 'text') {
          bgGradient.addColorStop(0, '#be123c'); // rose-700
          bgGradient.addColorStop(1, '#881337'); // rose-900
          strokeColor = '#f43f5e';
          accentColor = '#fda4af';
        } else {
          bgGradient.addColorStop(0, '#b45309'); // amber-700
          bgGradient.addColorStop(1, '#78350f'); // amber-900
          strokeColor = '#f59e0b';
          accentColor = '#fde68a';
        }

        ctx.fillStyle = bgGradient;
        ctx.fillRect(clipX, clipY, clipW, clipH);

        // --- Video Thumbnails Filmstrip ---
        if (clip.type === 'video' && clip.thumbnail && clipW > 50) {
          const thumbImg = getCachedThumbnail(clip.thumbnail);
          if (thumbImg) {
            ctx.save();
            ctx.globalAlpha = 0.45;
            const thumbAspect = 16 / 9;
            const thumbH = clipH;
            const thumbW = thumbH * thumbAspect;
            const numThumbs = Math.ceil(clipW / thumbW);
            for (let t = 0; t < numThumbs; t++) {
              ctx.drawImage(thumbImg, clipX + t * thumbW, clipY, thumbW, thumbH);
            }
            ctx.restore();
          }
        }

        // --- Audio Waveform Drawing ---
        if (clip.type === 'audio' || (clip.type === 'video' && !clip.muted)) {
          ctx.save();
          ctx.globalAlpha = clip.type === 'audio' ? 0.8 : 0.4;
          const barWidth = 3;
          const barGap = 1.5;
          const totalBars = Math.floor(clipW / (barWidth + barGap));
          const peaks = getClipWaveformPeaks(clip, totalBars);

          const centerY = clipY + clipH / 2;
          const maxWaveHeight = (clipH / 2) - 4;

          ctx.fillStyle = clip.type === 'audio' ? '#a7f3d0' : '#bfdbfe';

          for (let b = 0; b < totalBars; b++) {
            const barX = clipX + b * (barWidth + barGap) + 4;
            if (barX + barWidth > clipX + clipW - 4) break;
            const peakH = peaks[b] * maxWaveHeight;

            // Mirrored waveform bar
            ctx.fillRect(barX, centerY - peakH, barWidth, peakH * 2);
          }
          ctx.restore();
        }

        // --- Fade In / Out Visual Shading ---
        if (clip.fadeIn && clip.fadeIn > 0) {
          const fadeW = Math.min(clipW / 2, clip.fadeIn * zoomLevel);
          const gradFade = ctx.createLinearGradient(clipX, clipY, clipX + fadeW, clipY);
          gradFade.addColorStop(0, 'rgba(0,0,0,0.65)');
          gradFade.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gradFade;
          ctx.fillRect(clipX, clipY, fadeW, clipH);
        }
        if (clip.fadeOut && clip.fadeOut > 0) {
          const fadeW = Math.min(clipW / 2, clip.fadeOut * zoomLevel);
          const gradFade = ctx.createLinearGradient(clipX + clipW - fadeW, clipY, clipX + clipW, clipY);
          gradFade.addColorStop(0, 'rgba(0,0,0,0)');
          gradFade.addColorStop(1, 'rgba(0,0,0,0.65)');
          ctx.fillStyle = gradFade;
          ctx.fillRect(clipX + clipW - fadeW, clipY, fadeW, clipH);
        }

        // --- Clip Header Label & Duration Tag ---
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const labelText = clip.name;
        const textMaxW = Math.max(10, clipW - 32);
        let displayText = labelText;
        if (ctx.measureText(displayText).width > textMaxW) {
          while (displayText.length > 3 && ctx.measureText(displayText + '…').width > textMaxW) {
            displayText = displayText.slice(0, -1);
          }
          displayText += '…';
        }

        if (clipW > 40) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(displayText, clipX + 10, clipY + 8);

          // Subtitle duration & speed
          ctx.font = '500 9px monospace';
          ctx.fillStyle = accentColor;
          let subText = `${clip.duration.toFixed(1)}s`;
          if (clip.speed !== 1) subText += ` • ${clip.speed}x`;
          if (clip.volume !== undefined && clip.volume !== 1) subText += ` • ${Math.round(clip.volume * 100)}%`;
          ctx.fillText(subText, clipX + 10, clipY + 24);
          ctx.shadowBlur = 0;
        }

        // Restore clipping for handles & borders
        ctx.restore();

        // --- Left & Right Trim Handles ---
        ctx.save();
        // Left Handle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(clipX, clipY, TRIM_HANDLE_WIDTH, clipH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(clipX + 3, clipY + clipH / 2 - 6, 1.5, 12);
        ctx.fillRect(clipX + 6, clipY + clipH / 2 - 6, 1.5, 12);

        // Right Handle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(clipX + clipW - TRIM_HANDLE_WIDTH, clipY, TRIM_HANDLE_WIDTH, clipH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(clipX + clipW - 7.5, clipY + clipH / 2 - 6, 1.5, 12);
        ctx.fillRect(clipX + clipW - 4.5, clipY + clipH / 2 - 6, 1.5, 12);

        // Border & Selection Highlight
        ctx.beginPath();
        ctx.roundRect(clipX, clipY, clipW, clipH, 6);
        if (isSelected) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.8)';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // ==========================================
    // 4. RUBBER-BAND / MARQUEE SELECTION BOX
    // ==========================================
    const box = interactionRef.current.marqueeBox;
    if (interactionRef.current.mode === 'marquee' && box) {
      const bx = Math.min(box.x1, box.x2);
      const by = Math.min(box.y1, box.y2);
      const bw = Math.abs(box.x2 - box.x1);
      const bh = Math.abs(box.y2 - box.y1);

      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
      ctx.fillRect(bx, by, bw, bh);

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.restore();
    }

    // ==========================================
    // 5. MAGNETIC SNAP LINE (Cyan Vertical)
    // ==========================================
    if (activeSnapLine !== null) {
      const snapX = Math.round(activeSnapLine * zoomLevel);
      ctx.save();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(snapX + 0.5, RULER_HEIGHT);
      ctx.lineTo(snapX + 0.5, RULER_HEIGHT + tracksTotalHeight);
      ctx.stroke();
      ctx.restore();
    }

    // ==========================================
    // 6. PLAYHEAD VERTICAL NEEDLE (Over tracks)
    // ==========================================
    const playheadX = Math.round(currentTime * zoomLevel);
    ctx.save();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(playheadX + 0.5, RULER_HEIGHT);
    ctx.lineTo(playheadX + 0.5, RULER_HEIGHT + tracksTotalHeight);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // Restore scroll offset translation

    // ==========================================
    // 7. STICKY TOP RULER (Drawn in Screen-Space)
    // ==========================================
    ctx.save();
    // Ruler background
    ctx.fillStyle = '#18181b'; // zinc-900
    ctx.fillRect(0, 0, canvasWidth, RULER_HEIGHT);
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, RULER_HEIGHT - 0.5);
    ctx.lineTo(canvasWidth, RULER_HEIGHT - 0.5);
    ctx.stroke();

    // Ruler Ticks and Numbers
    ctx.fillStyle = '#a1a1aa'; // zinc-400
    ctx.font = '500 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let s = startSec; s <= endSec; s += minorInterval) {
      const screenX = Math.round(s * zoomLevel - scrollLeft);
      if (screenX < -20 || screenX > canvasWidth + 20) continue;

      const isMajor = Math.abs(s % majorInterval) < 0.001;

      ctx.beginPath();
      ctx.strokeStyle = isMajor ? '#71717a' : '#3f3f46';
      ctx.lineWidth = 1;

      if (isMajor) {
        ctx.moveTo(screenX + 0.5, RULER_HEIGHT - 12);
        ctx.lineTo(screenX + 0.5, RULER_HEIGHT);
        ctx.stroke();

        // Timecode text (MM:SS)
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        const sub = Math.floor((s % 1) * 10);
        let timeStr = `${m}:${sec.toString().padStart(2, '0')}`;
        if (zoomLevel >= 120) timeStr += `.${sub}`;

        ctx.fillText(timeStr, screenX, 3);
      } else {
        ctx.moveTo(screenX + 0.5, RULER_HEIGHT - 6);
        ctx.lineTo(screenX + 0.5, RULER_HEIGHT);
        ctx.stroke();
      }
    }

    // ==========================================
    // 8. TIMELINE MARKERS ON RULER
    // ==========================================
    if (project.markers) {
      for (const marker of project.markers) {
        const markerScreenX = Math.round(marker.time * zoomLevel - scrollLeft);
        if (markerScreenX < -15 || markerScreenX > canvasWidth + 15) continue;

        ctx.save();
        ctx.fillStyle = marker.color || '#f59e0b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        // Flag shape on ruler
        ctx.beginPath();
        ctx.moveTo(markerScreenX - 5, 2);
        ctx.lineTo(markerScreenX + 5, 2);
        ctx.lineTo(markerScreenX + 5, 14);
        ctx.lineTo(markerScreenX, 20);
        ctx.lineTo(markerScreenX - 5, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Marker label tag
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(marker.label, markerScreenX + 8, 4);

        ctx.restore();
      }
    }

    // ==========================================
    // 9. PLAYHEAD HANDLE (Triangle Flag on Ruler)
    // ==========================================
    const playheadScreenX = Math.round(currentTime * zoomLevel - scrollLeft);
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = 'rgba(244, 63, 94, 0.7)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(playheadScreenX - 6, 2);
    ctx.lineTo(playheadScreenX + 6, 2);
    ctx.lineTo(playheadScreenX + 6, 16);
    ctx.lineTo(playheadScreenX, 24);
    ctx.lineTo(playheadScreenX - 6, 16);
    ctx.closePath();
    ctx.fill();

    // Center needle dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(playheadScreenX, 9, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }, [
    project,
    currentTime,
    zoomLevel,
    snapEnabled,
    selectedClipIds,
    activeSnapLine,
    totalDuration,
    scrollLeft,
    scrollTop,
    canvasWidth,
    canvasHeight,
  ]);

  // ==========================================
  // MOUSE EVENT HANDLERS
  // ==========================================
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left click
    const coords = getTimelineCoordinates(e.clientX, e.clientY);

    // 1. Clicked on Ruler: Scrub playhead or drag marker
    if (coords.isRuler) {
      const hitMarker = findMarkerAt(coords.worldX, coords.rawY);
      if (hitMarker) {
        onSeek(hitMarker.time);
        interactionRef.current = {
          mode: 'drag-marker',
          startX: coords.worldX,
          startY: coords.rawY,
          initialMouseTime: coords.time,
          markerId: hitMarker.id,
          hasMoved: false,
        };
        return;
      }

      onSeek(coords.time);
      interactionRef.current = {
        mode: 'scrub',
        startX: coords.worldX,
        startY: coords.rawY,
        initialMouseTime: coords.time,
        hasMoved: false,
      };
      return;
    }

    // 2. Clicked in Track Area: Clip Trim, Clip Move, or Marquee Selection
    const hit = findClipAt(coords.worldX, coords.worldY);

    if (hit) {
      const isShift = e.shiftKey || e.ctrlKey || e.metaKey;
      let newSelected = [...selectedClipIds];

      if (hit.isLeftTrim || hit.isRightTrim) {
        // Trimming
        interactionRef.current = {
          mode: hit.isLeftTrim ? 'trim-left' : 'trim-right',
          startX: coords.worldX,
          startY: coords.rawY,
          initialMouseTime: coords.time,
          targetClipId: hit.clip.id,
          initialClipPositions: new Map([
            [hit.clip.id, { start: hit.clip.start, duration: hit.clip.duration, offset: hit.clip.offset }],
          ]),
          hasMoved: false,
        };
        if (!selectedClipIds.includes(hit.clip.id)) {
          onSelectClipIds([hit.clip.id]);
        }
        return;
      }

      // Moving Clip(s)
      if (isShift) {
        if (newSelected.includes(hit.clip.id)) {
          newSelected = newSelected.filter((id) => id !== hit.clip.id);
        } else {
          newSelected.push(hit.clip.id);
        }
      } else {
        if (!newSelected.includes(hit.clip.id)) {
          newSelected = [hit.clip.id];
        }
      }
      onSelectClipIds(newSelected);

      // Record initial start times of all selected clips
      const posMap = new Map<string, { start: number; duration: number; offset: number }>();
      project.clips.forEach((c) => {
        if (newSelected.includes(c.id)) {
          posMap.set(c.id, { start: c.start, duration: c.duration, offset: c.offset });
        }
      });

      interactionRef.current = {
        mode: 'move-clips',
        startX: coords.worldX,
        startY: coords.rawY,
        initialMouseTime: coords.time,
        targetClipId: hit.clip.id,
        initialClipPositions: posMap,
        hasMoved: false,
      };
    } else {
      // Clicked on empty canvas space -> Marquee selection or seek
      onSeek(coords.time);
      if (!e.shiftKey) {
        onSelectClipIds([]);
      }
      interactionRef.current = {
        mode: 'marquee',
        startX: coords.worldX,
        startY: coords.worldY,
        initialMouseTime: coords.time,
        marqueeBox: { x1: coords.worldX, y1: coords.worldY, x2: coords.worldX, y2: coords.worldY },
        hasMoved: false,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getTimelineCoordinates(e.clientX, e.clientY);
    const interaction = interactionRef.current;

    // --- Active Dragging Handling ---
    if (interaction.mode === 'scrub') {
      interaction.hasMoved = true;
      onSeek(coords.time);
      return;
    }

    if (interaction.mode === 'drag-marker' && interaction.markerId) {
      interaction.hasMoved = true;
      const snap = findSnap(coords.time);
      setActiveSnapLine(snap.snapPoint);
      if (onAddMarker) {
        onAddMarker({
          id: interaction.markerId,
          time: snap.snappedTime,
          label: project.markers?.find((m) => m.id === interaction.markerId)?.label || 'Marker',
          color: project.markers?.find((m) => m.id === interaction.markerId)?.color || '#f59e0b',
        });
      }
      return;
    }

    if (interaction.mode === 'trim-left' && interaction.targetClipId && interaction.initialClipPositions) {
      interaction.hasMoved = true;
      const init = interaction.initialClipPositions.get(interaction.targetClipId);
      if (!init) return;

      const deltaSec = coords.time - interaction.initialMouseTime;
      let newStart = init.start + deltaSec;
      const maxStart = init.start + init.duration - 0.3;
      newStart = Math.min(maxStart, Math.max(0, newStart));

      const snap = findSnap(newStart, [interaction.targetClipId]);
      setActiveSnapLine(snap.snapPoint);
      newStart = snap.snappedTime;

      const newDuration = init.start + init.duration - newStart;
      const newOffset = Math.max(0, init.offset + (newStart - init.start));

      onUpdateClip(interaction.targetClipId, {
        start: newStart,
        duration: Math.max(0.3, newDuration),
        offset: newOffset,
      });
      return;
    }

    if (interaction.mode === 'trim-right' && interaction.targetClipId && interaction.initialClipPositions) {
      interaction.hasMoved = true;
      const init = interaction.initialClipPositions.get(interaction.targetClipId);
      if (!init) return;

      const deltaSec = coords.time - interaction.initialMouseTime;
      let newEnd = init.start + init.duration + deltaSec;
      newEnd = Math.max(init.start + 0.3, newEnd);

      const snap = findSnap(newEnd, [interaction.targetClipId]);
      setActiveSnapLine(snap.snapPoint);
      newEnd = snap.snappedTime;

      const newDuration = Math.max(0.3, newEnd - init.start);
      onUpdateClip(interaction.targetClipId, {
        duration: newDuration,
      });
      return;
    }

    if (interaction.mode === 'move-clips' && interaction.initialClipPositions) {
      interaction.hasMoved = true;
      const deltaSec = coords.time - interaction.initialMouseTime;
      const selectedIds = Array.from(interaction.initialClipPositions.keys());

      // Find primary target initial position to snap
      const primaryInit = interaction.initialClipPositions.get(interaction.targetClipId || selectedIds[0]);
      let finalDeltaSec = deltaSec;

      if (primaryInit) {
        let proposedStart = Math.max(0, primaryInit.start + deltaSec);
        const snap = findSnap(proposedStart, selectedIds);
        setActiveSnapLine(snap.snapPoint);
        finalDeltaSec = snap.snappedTime - primaryInit.start;
      }

      // Apply delta to all moved clips
      if (onBatchUpdateClips) {
        const batch = selectedIds.map((id) => {
          const init = interaction.initialClipPositions!.get(id)!;
          return {
            id,
            updates: { start: Math.max(0, init.start + finalDeltaSec) },
          };
        });
        onBatchUpdateClips(batch);
      } else {
        selectedIds.forEach((id) => {
          const init = interaction.initialClipPositions!.get(id)!;
          onUpdateClip(id, { start: Math.max(0, init.start + finalDeltaSec) });
        });
      }
      return;
    }

    if (interaction.mode === 'marquee' && interaction.marqueeBox) {
      interaction.hasMoved = true;
      interaction.marqueeBox.x2 = coords.worldX;
      interaction.marqueeBox.y2 = coords.worldY;

      const bx1 = Math.min(interaction.marqueeBox.x1, coords.worldX);
      const bx2 = Math.max(interaction.marqueeBox.x1, coords.worldX);
      const by1 = Math.min(interaction.marqueeBox.y1, coords.worldY);
      const by2 = Math.max(interaction.marqueeBox.y1, coords.worldY);

      // Find clips overlapping box
      const selectedInBox: string[] = [];
      project.tracks.forEach((track, tIdx) => {
        const trackY = RULER_HEIGHT + tIdx * (TRACK_HEIGHT + TRACK_GAP);
        const trackH = TRACK_HEIGHT;

        if (trackY + trackH >= by1 && trackY <= by2) {
          project.clips
            .filter((c) => c.trackId === track.id)
            .forEach((c) => {
              const cX1 = c.start * zoomLevel;
              const cX2 = (c.start + c.duration) * zoomLevel;
              if (cX2 >= bx1 && cX1 <= bx2) {
                selectedInBox.push(c.id);
              }
            });
        }
      });

      onSelectClipIds(selectedInBox);
      return;
    }

    // --- Hover Cursor Update ---
    if (coords.isRuler) {
      const hitMarker = findMarkerAt(coords.worldX, coords.rawY);
      setHoverCursor(hitMarker ? 'pointer' : 'col-resize');
    } else {
      const hit = findClipAt(coords.worldX, coords.worldY);
      if (hit) {
        if (hit.isLeftTrim || hit.isRightTrim) {
          setHoverCursor('ew-resize');
        } else {
          setHoverCursor('grab');
        }
      } else {
        setHoverCursor('default');
      }
    }
  };

  const handleMouseUp = () => {
    setActiveSnapLine(null);
    interactionRef.current = {
      mode: 'none',
      startX: 0,
      startY: 0,
      initialMouseTime: 0,
      hasMoved: false,
    };
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getTimelineCoordinates(e.clientX, e.clientY);
    if (coords.isRuler) {
      // Double click on ruler adds a marker at this time
      const markerTime = coords.time;
      if (onOpenMarkerModal) {
        onOpenMarkerModal(undefined, markerTime);
      } else if (onAddMarker) {
        onAddMarker({
          id: `marker-${Date.now()}`,
          time: markerTime,
          label: `Marker ${((project.markers?.length || 0) + 1)}`,
          color: '#f59e0b',
        });
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: hoverCursor,
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
      }}
      className="block outline-none"
    />
  );
};
