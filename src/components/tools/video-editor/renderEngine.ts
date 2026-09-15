import { Clip, FilterSettings, Project, AspectRatio } from './types';
import { ASPECT_RATIOS } from './sampleMedia';

// Element caches to prevent continuous DOM node allocation
export const videoElementCache = new Map<string, HTMLVideoElement>();
export const audioElementCache = new Map<string, HTMLAudioElement>();
export const imageElementCache = new Map<string, HTMLImageElement>();

export function getOrCreateVideoElement(src: string): HTMLVideoElement {
  if (videoElementCache.has(src)) {
    return videoElementCache.get(src)!;
  }
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.src = src;
  video.preload = 'auto';
  video.playsInline = true;
  video.muted = false;
  videoElementCache.set(src, video);
  return video;
}

export function getOrCreateAudioElement(src: string): HTMLAudioElement {
  if (audioElementCache.has(src)) {
    return audioElementCache.get(src)!;
  }
  const audio = document.createElement('audio');
  audio.crossOrigin = 'anonymous';
  audio.src = src;
  audio.preload = 'auto';
  audioElementCache.set(src, audio);
  return audio;
}

export function getOrCreateImageElement(src: string): HTMLImageElement {
  if (imageElementCache.has(src)) {
    return imageElementCache.get(src)!;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imageElementCache.set(src, img);
  return img;
}

export function getAspectRatioDimensions(aspectRatio: AspectRatio, baseWidth = 1280): { width: number; height: number } {
  const match = ASPECT_RATIOS.find((a) => a.value === aspectRatio) || ASPECT_RATIOS[0];
  const width = baseWidth;
  const height = Math.round(baseWidth / match.ratio);
  return { width, height };
}

export function buildCssFilter(f: FilterSettings): string {
  const parts: string[] = [];
  if (f.brightness !== 0) parts.push(`brightness(${100 + f.brightness}%)`);
  if (f.contrast !== 0) parts.push(`contrast(${100 + f.contrast}%)`);
  if (f.saturation !== 0) parts.push(`saturate(${100 + f.saturation}%)`);
  if (f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale}%)`);
  if (f.invert > 0) parts.push(`invert(${f.invert}%)`);
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  if (f.hueRotate > 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Composites the full video frame at `currentTime` onto a destination 2D Canvas context
 */
export function renderProjectFrame(
  ctx: CanvasRenderingContext2D,
  project: Project,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number,
  activeClipId?: string | null
) {
  // 1. Clear background
  ctx.save();
  ctx.fillStyle = project.backgroundColor || '#09090b';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // Find tracks order (bottom visual tracks first, overlays last)
  const videoTracks = project.tracks.filter((t) => t.type === 'video' && !t.hidden);
  const overlayTracks = project.tracks.filter((t) => t.type === 'overlay' && !t.hidden);

  // 2. Render Visual Tracks (Video / Image)
  for (const track of videoTracks) {
    const clipsOnTrack = project.clips.filter((c) => c.trackId === track.id);
    for (const clip of clipsOnTrack) {
      if (currentTime >= clip.start && currentTime <= clip.start + clip.duration) {
        renderVisualClip(ctx, clip, currentTime, canvasWidth, canvasHeight);
      }
    }
  }

  // 3. Render Overlay Tracks (Text / Stickers / Subtitles)
  for (const track of overlayTracks) {
    const clipsOnTrack = project.clips.filter((c) => c.trackId === track.id);
    for (const clip of clipsOnTrack) {
      if (currentTime >= clip.start && currentTime <= clip.start + clip.duration) {
        if (clip.type === 'text') {
          renderTextClip(ctx, clip, currentTime, canvasWidth, canvasHeight, clip.id === activeClipId);
        } else if (clip.type === 'sticker') {
          renderStickerClip(ctx, clip, currentTime, canvasWidth, canvasHeight, clip.id === activeClipId);
        }
      }
    }
  }
}

function renderVisualClip(
  ctx: CanvasRenderingContext2D,
  clip: Clip,
  currentTime: number,
  cw: number,
  ch: number
) {
  const clipProgress = (currentTime - clip.start) / clip.duration;
  let opacity = clip.opacity ?? 1;

  // Handle Fade In / Out
  if (clip.fadeIn && clip.fadeIn > 0) {
    const timeSinceStart = currentTime - clip.start;
    if (timeSinceStart < clip.fadeIn) {
      opacity *= Math.min(1, Math.max(0, timeSinceStart / clip.fadeIn));
    }
  }
  if (clip.fadeOut && clip.fadeOut > 0) {
    const timeUntilEnd = clip.start + clip.duration - currentTime;
    if (timeUntilEnd < clip.fadeOut) {
      opacity *= Math.min(1, Math.max(0, timeUntilEnd / clip.fadeOut));
    }
  }

  ctx.save();
  ctx.globalAlpha = opacity;

  // Apply filters
  const filterStr = buildCssFilter(clip.filters);
  if (filterStr !== 'none') {
    ctx.filter = filterStr;
  }

  // Center transformation matrix
  const cx = cw / 2;
  const cy = ch / 2;
  ctx.translate(cx, cy);

  if (clip.rotation) {
    ctx.rotate((clip.rotation * Math.PI) / 180);
  }
  const scaleX = (clip.scale ?? 1) * (clip.flipH ? -1 : 1);
  const scaleY = (clip.scale ?? 1) * (clip.flipV ? -1 : 1);
  ctx.scale(scaleX, scaleY);

  if (clip.type === 'video' && clip.src) {
    const video = getOrCreateVideoElement(clip.src);
    // Draw directly from video element if it has frame dimensions
    if (video.videoWidth > 0) {
      drawImageOrVideoProp(ctx, video, -cw / 2, -ch / 2, cw, ch, clip.fit || 'contain');
    } else if (clip.thumbnail) {
      const thumb = getOrCreateImageElement(clip.thumbnail);
      if (thumb.complete && thumb.naturalWidth > 0) {
        drawImageOrVideoProp(ctx, thumb, -cw / 2, -ch / 2, cw, ch, clip.fit || 'contain');
      }
    }
  } else if (clip.type === 'image' && clip.src) {
    const img = getOrCreateImageElement(clip.src);
    if (img.complete && img.naturalWidth > 0) {
      drawImageOrVideoProp(ctx, img, -cw / 2, -ch / 2, cw, ch, clip.fit || 'contain');
    }
  }

  ctx.restore();

  // Apply Vignette overlay if enabled
  if (clip.filters.vignette > 0) {
    ctx.save();
    const grad = ctx.createRadialGradient(cw / 2, ch / 2, (cw / 2) * 0.4, cw / 2, ch / 2, cw * 0.7);
    const alpha = (clip.filters.vignette / 100) * 0.85;
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }
}

function renderTextClip(
  ctx: CanvasRenderingContext2D,
  clip: Clip,
  currentTime: number,
  cw: number,
  ch: number,
  isSelected: boolean
) {
  if (!clip.textData) return;
  const d = clip.textData;

  const x = (d.x / 100) * cw;
  const y = (d.y / 100) * ch;
  const fontSize = Math.max(12, Math.round((d.fontSize || 32) * (cw / 1280)));
  const fontFamily = d.fontFamily || 'Montserrat';
  const fontWeight = d.fontWeight || 700;

  ctx.save();

  // Calculate animation
  const elapsed = currentTime - clip.start;
  let animScale = 1;
  let animAlpha = 1;
  let animOffsetY = 0;
  let displayText = d.text;

  if (d.animation === 'fade') {
    animAlpha = Math.min(1, elapsed / 0.4);
  } else if (d.animation === 'bounce') {
    if (elapsed < 0.35) {
      const p = elapsed / 0.35;
      animScale = 1 + Math.sin(p * Math.PI) * 0.25;
    }
  } else if (d.animation === 'slide-up') {
    if (elapsed < 0.4) {
      const p = elapsed / 0.4;
      animOffsetY = (1 - p) * 40;
      animAlpha = p;
    }
  } else if (d.animation === 'typewriter') {
    const charsToShow = Math.floor((elapsed / (clip.duration * 0.8)) * d.text.length);
    displayText = d.text.slice(0, Math.min(d.text.length, charsToShow));
  }

  ctx.globalAlpha = (clip.opacity ?? 1) * animAlpha;
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = d.align || 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(displayText || ' ');
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;

  // Background Box / Pill
  if (d.backgroundColor && d.backgroundColor !== 'transparent') {
    const pad = (d.bgPadding || 8) * (cw / 1280);
    const boxWidth = textWidth + pad * 2;
    const boxHeight = textHeight + pad * 1.5;
    let boxX = x - boxWidth / 2;
    if (d.align === 'left') boxX = x - pad;
    if (d.align === 'right') boxX = x - boxWidth + pad;
    const boxY = y + animOffsetY - boxHeight / 2;

    ctx.fillStyle = d.backgroundColor;
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 8 * (cw / 1280));
    ctx.fill();
  }

  // Text Shadow
  if (d.textShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
  }

  // Stroke / Outline
  if (d.strokeWidth && d.strokeWidth > 0) {
    ctx.strokeStyle = d.strokeColor || '#000000';
    ctx.lineWidth = d.strokeWidth * (cw / 1280);
    ctx.strokeText(displayText, x, y + animOffsetY);
  }

  // Fill text
  ctx.fillStyle = d.color || '#ffffff';
  ctx.fillText(displayText, x, y + animOffsetY);

  // Selection outline if active
  if (isSelected) {
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    const selPad = 12;
    const selW = textWidth + selPad * 2;
    const selH = textHeight + selPad * 2;
    let selX = x - selW / 2;
    if (d.align === 'left') selX = x - selPad;
    if (d.align === 'right') selX = x - selW + selPad;
    ctx.strokeRect(selX, y + animOffsetY - selH / 2, selW, selH);
  }

  ctx.restore();
}

function renderStickerClip(
  ctx: CanvasRenderingContext2D,
  clip: Clip,
  currentTime: number,
  cw: number,
  ch: number,
  isSelected: boolean
) {
  if (!clip.stickerData) return;
  const s = clip.stickerData;
  const x = (s.x / 100) * cw;
  const y = (s.y / 100) * ch;
  const scale = (s.scale || 1) * (cw / 1280);

  ctx.save();
  ctx.translate(x, y);
  if (s.rotation) ctx.rotate((s.rotation * Math.PI) / 180);
  ctx.scale(scale, scale);

  if (s.badgeType) {
    // Render custom high-end vector badges
    renderCustomBadge(ctx, s.badgeType, s.label || '');
  } else if (s.emoji) {
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.emoji, 0, 0);
  }

  if (isSelected) {
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-60, -40, 120, 80);
  }

  ctx.restore();
}

function renderCustomBadge(ctx: CanvasRenderingContext2D, badgeType: string, label: string) {
  ctx.save();
  if (badgeType === 'subscribe') {
    ctx.fillStyle = '#e11d48';
    roundRect(ctx, -90, -26, 180, 52, 26);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔔 SUBSCRIBE', 0, 0);
  } else if (badgeType === 'like') {
    ctx.fillStyle = '#2563eb';
    roundRect(ctx, -70, -24, 140, 48, 24);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👍 LIKE', 0, 0);
  } else if (badgeType === 'rec') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, -60, -20, 120, 40, 8);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-30, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('REC', 15, 0);
  } else if (badgeType === 'live') {
    ctx.fillStyle = '#dc2626';
    roundRect(ctx, -65, -20, 130, 40, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('● LIVE STREAM', 0, 0);
  } else {
    ctx.fillStyle = '#10b981';
    roundRect(ctx, -60, -22, 120, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label || 'VERIFIED ✓', 0, 0);
  }
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Aspect-ratio fitting helper for canvas rendering (cover / contain)
 */
function drawImageOrVideoProp(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  fit: 'cover' | 'contain' = 'contain'
) {
  let nw = 0;
  let nh = 0;

  if (img instanceof HTMLVideoElement) {
    nw = img.videoWidth || 1920;
    nh = img.videoHeight || 1080;
  } else if (img instanceof HTMLImageElement) {
    nw = img.naturalWidth || 1920;
    nh = img.naturalHeight || 1080;
  } else {
    nw = 1920;
    nh = 1080;
  }

  const rw = w / nw;
  const rh = h / nh;
  const ratio = fit === 'cover' ? Math.max(rw, rh) : Math.min(rw, rh);

  const dw = nw * ratio;
  const dh = nh * ratio;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;

  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * High-performance full video export engine using canvas captureStream + MediaRecorder
 */
export async function exportVideo(
  project: Project,
  resolution: '720p' | '1080p',
  fps: number = 30,
  onProgress: (percent: number, frame: number, totalFrames: number) => void,
  shouldCancel: () => boolean
): Promise<Blob> {
  const baseWidth = resolution === '1080p' ? 1920 : 1280;
  const { width, height } = getAspectRatioDimensions(project.aspectRatio, baseWidth);

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext('2d', { alpha: false })!;

  const totalDuration = Math.max(1, project.duration);
  const totalFrames = Math.ceil(totalDuration * fps);

  // Setup Canvas Stream
  const stream = offscreenCanvas.captureStream(fps);

  // Determine supported mimeType
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/mp4';
  }

  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: resolution === '1080p' ? 8000000 : 4500000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  // Step through frames
  for (let f = 0; f <= totalFrames; f++) {
    if (shouldCancel()) {
      recorder.stop();
      throw new Error('Export cancelled by user');
    }

    const time = f / fps;
    renderProjectFrame(ctx, project, time, width, height, null);

    onProgress(Math.min(99, Math.round((f / totalFrames) * 100)), f, totalFrames);

    // Give time to capture frame
    await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
  }

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: mimeType });
      onProgress(100, totalFrames, totalFrames);
      resolve(finalBlob);
    };
    recorder.onerror = (e) => reject(e);
    recorder.stop();
  });
}

/**
 * Master synchronization function for all video and audio elements in the project.
 * Keeps media elements in sync with project timeline, ensures audio from uploaded
 * videos and audio clips plays clearly without mute bugs, and prevents flickering.
 */
export function syncAllMediaElements(
  project: Project,
  currentTime: number,
  isPlaying: boolean,
  masterVolume = 1,
  isMasterMuted = false
) {
  for (const clip of project.clips) {
    const track = project.tracks.find((t) => t.id === clip.trackId);
    const isTrackMuted = track?.muted || false;
    const isTrackHidden = track?.hidden || false;
    const isActive =
      currentTime >= clip.start &&
      currentTime < clip.start + clip.duration &&
      !isTrackHidden;

    if (clip.type === 'video' && clip.src) {
      const video = getOrCreateVideoElement(clip.src);
      const shouldMute = isMasterMuted || isTrackMuted || clip.muted || masterVolume === 0;
      const targetVol = shouldMute ? 0 : Math.min(1, Math.max(0, (clip.volume ?? 1) * masterVolume));

      video.muted = shouldMute;
      video.volume = targetVol;

      if (isActive) {
        const targetSourceTime = (currentTime - clip.start) * clip.speed + clip.offset;

        if (Math.abs(video.playbackRate - clip.speed) > 0.01) {
          video.playbackRate = clip.speed;
        }

        if (isPlaying) {
          // If video drifted by more than 0.35s, seek smoothly
          if (Math.abs(video.currentTime - targetSourceTime) > 0.35) {
            try {
              video.currentTime = targetSourceTime;
            } catch {
              // Ignore seek error
            }
          }
          if (video.paused) {
            video.play().catch(() => {});
          }
        } else {
          // Paused / scrubbing: update position to show paused frame
          if (Math.abs(video.currentTime - targetSourceTime) > 0.04) {
            try {
              video.currentTime = targetSourceTime;
            } catch {
              // Ignore seek error
            }
          }
          if (!video.paused) {
            video.pause();
          }
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    } else if (clip.type === 'audio' && clip.src) {
      const audio = getOrCreateAudioElement(clip.src);
      const shouldMute = isMasterMuted || isTrackMuted || clip.muted || masterVolume === 0;
      const targetVol = shouldMute ? 0 : Math.min(1, Math.max(0, (clip.volume ?? 1) * masterVolume));

      audio.muted = shouldMute;
      audio.volume = targetVol;

      if (isActive) {
        const targetSourceTime = (currentTime - clip.start) * clip.speed + clip.offset;

        if (Math.abs(audio.playbackRate - clip.speed) > 0.01) {
          audio.playbackRate = clip.speed;
        }

        if (isPlaying) {
          if (Math.abs(audio.currentTime - targetSourceTime) > 0.35) {
            try {
              audio.currentTime = targetSourceTime;
            } catch {}
          }
          if (audio.paused) {
            audio.play().catch(() => {});
          }
        } else {
          if (Math.abs(audio.currentTime - targetSourceTime) > 0.04) {
            try {
              audio.currentTime = targetSourceTime;
            } catch {}
          }
          if (!audio.paused) {
            audio.pause();
          }
        }
      } else {
        if (!audio.paused) {
          audio.pause();
        }
      }
    }
  }

  // If paused or stopped, ensure inactive media doesn't play audio
  if (!isPlaying) {
    videoElementCache.forEach((video) => {
      if (!video.paused) video.pause();
    });
    audioElementCache.forEach((audio) => {
      if (!audio.paused) audio.pause();
    });
  }
}
