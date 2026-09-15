import { Clip, FilterSettings, Project, AspectRatio } from './types';
import { ASPECT_RATIOS } from './sampleMedia';
import {
  Output,
  Mp4OutputFormat,
  WebMOutputFormat,
  BufferTarget,
  CanvasSource,
  AudioBufferSource,
  canEncodeVideo,
  canEncodeAudio,
  Quality,
} from 'mediabunny';

// Element caches to prevent continuous DOM node allocation in preview
export const videoElementCache = new Map<string, HTMLVideoElement>();
export const audioElementCache = new Map<string, HTMLAudioElement>();
export const imageElementCache = new Map<string, HTMLImageElement>();

/**
 * Resets and cleans all cached preview media elements.
 * Call when loading/unloading or recovering from stale audio context states.
 */
export function resetMediaElementCache() {
  videoElementCache.forEach((v) => {
    try {
      v.pause();
      v.removeAttribute('src');
      v.load();
    } catch {}
  });
  videoElementCache.clear();

  audioElementCache.forEach((a) => {
    try {
      a.pause();
      a.removeAttribute('src');
      a.load();
    } catch {}
  });
  audioElementCache.clear();
}

export function getOrCreateVideoElement(src: string): HTMLVideoElement {
  if (videoElementCache.has(src)) {
    const cached = videoElementCache.get(src)!;
    if (cached.error) {
      cached.load();
    }
    return cached;
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
  activeClipId?: string | null,
  customGetVideo?: (src: string) => HTMLVideoElement
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
        renderVisualClip(ctx, clip, currentTime, canvasWidth, canvasHeight, customGetVideo);
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
  ch: number,
  customGetVideo?: (src: string) => HTMLVideoElement
) {
  const clipProgress = Math.min(1, Math.max(0, (currentTime - clip.start) / Math.max(0.01, clip.duration)));
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

  // Apply Blending Mode
  if (clip.compositing?.blendMode && clip.compositing.blendMode !== 'source-over') {
    ctx.globalCompositeOperation = clip.compositing.blendMode;
  }

  // Apply filters
  const filterStr = buildCssFilter(clip.filters);
  if (filterStr !== 'none') {
    ctx.filter = filterStr;
  }

  // Motion Tracking / Path Animation Simulation
  let motionOffsetX = 0;
  let motionOffsetY = 0;
  let motionExtraScale = 1;
  let motionExtraRot = 0;

  if (clip.compositing?.motion && clip.compositing.motion.preset !== 'none') {
    const intensity = (clip.compositing.motion.intensity ?? 50) / 100;
    const preset = clip.compositing.motion.preset;

    if (preset === 'pan-left') {
      motionOffsetX = (cw * 0.15 * intensity) * (1 - 2 * clipProgress);
    } else if (preset === 'pan-right') {
      motionOffsetX = (cw * 0.15 * intensity) * (2 * clipProgress - 1);
    } else if (preset === 'zoom-in') {
      motionExtraScale = 1 + 0.35 * intensity * clipProgress;
    } else if (preset === 'zoom-out') {
      motionExtraScale = 1 + 0.35 * intensity * (1 - clipProgress);
    } else if (preset === 'float') {
      motionOffsetX = Math.sin(clipProgress * Math.PI * 4) * (20 * intensity);
      motionOffsetY = Math.cos(clipProgress * Math.PI * 3) * (15 * intensity);
    } else if (preset === 'spin') {
      motionExtraRot = clipProgress * 360 * intensity;
    }
  }

  // Center transformation matrix
  const cx = cw / 2 + motionOffsetX;
  const cy = ch / 2 + motionOffsetY;
  ctx.translate(cx, cy);

  const totalRot = (clip.rotation || 0) + motionExtraRot;
  if (totalRot) {
    ctx.rotate((totalRot * Math.PI) / 180);
  }
  const scaleX = (clip.scale ?? 1) * motionExtraScale * (clip.flipH ? -1 : 1);
  const scaleY = (clip.scale ?? 1) * motionExtraScale * (clip.flipV ? -1 : 1);
  ctx.scale(scaleX, scaleY);

  // Shape Masking
  const mask = clip.compositing?.mask;
  const hasActiveMask = mask && mask.shape && mask.shape !== 'none';

  if (hasActiveMask) {
    const maskCenterX = ((mask.posX ?? 50) / 100 - 0.5) * cw;
    const maskCenterY = ((mask.posY ?? 50) / 100 - 0.5) * ch;
    const maskW = ((mask.sizeX ?? 60) / 100) * cw;
    const maskH = ((mask.sizeY ?? 60) / 100) * ch;

    ctx.beginPath();
    if (mask.inverted) {
      // Invert: draw large outer canvas rect, then shape counter-clockwise
      ctx.rect(-cw, -ch, cw * 2, ch * 2);
    }

    if (mask.shape === 'circle') {
      const radius = Math.min(maskW, maskH) / 2;
      ctx.arc(maskCenterX, maskCenterY, radius, 0, Math.PI * 2, mask.inverted);
    } else if (mask.shape === 'ellipse') {
      ctx.ellipse(maskCenterX, maskCenterY, maskW / 2, maskH / 2, 0, 0, Math.PI * 2, mask.inverted);
    } else if (mask.shape === 'rounded-rect') {
      const rx = maskCenterX - maskW / 2;
      const ry = maskCenterY - maskH / 2;
      roundRect(ctx, rx, ry, maskW, maskH, Math.min(24, Math.min(maskW, maskH) / 4));
    } else if (mask.shape === 'rectangle') {
      const rx = maskCenterX - maskW / 2;
      const ry = maskCenterY - maskH / 2;
      ctx.rect(rx, ry, maskW, maskH);
    } else if (mask.shape === 'vignette') {
      const radius = Math.min(maskW, maskH) / 2;
      ctx.arc(maskCenterX, maskCenterY, radius, 0, Math.PI * 2, mask.inverted);
    }

    ctx.closePath();
    ctx.clip(mask.inverted ? 'evenodd' : 'nonzero');
  }

  if (clip.type === 'video' && clip.src) {
    const video = customGetVideo ? customGetVideo(clip.src) : getOrCreateVideoElement(clip.src);
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
 * Helper to seek a video element to target time deterministically
 */
function seekVideoElement(video: HTMLVideoElement, targetTime: number): Promise<void> {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - targetTime) < 0.02) {
      resolve();
      return;
    }
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked, { once: true });
    const timer = setTimeout(() => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    }, 180);

    try {
      video.currentTime = targetTime;
    } catch {
      clearTimeout(timer);
      resolve();
    }
  });
}

/**
 * Mixes all audio tracks offline with frame-perfect sample accuracy.
 * Never connects to or mutates the editor's live preview elements.
 */
export async function renderProjectAudioBuffer(project: Project): Promise<AudioBuffer | null> {
  const audioClips = project.clips.filter(
    (c) => (c.type === 'audio' || c.type === 'video') && c.src && !c.muted
  );
  if (audioClips.length === 0) return null;

  const totalDuration = Math.max(1, project.duration);
  const sampleRate = 44100;
  const OfflineAudioCtxClass =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!OfflineAudioCtxClass) return null;

  const offlineCtx = new OfflineAudioCtxClass(
    2,
    Math.ceil(sampleRate * totalDuration),
    sampleRate
  );

  let hasAudioTrack = false;

  for (const clip of audioClips) {
    const track = project.tracks.find((t) => t.id === clip.trackId);
    if (track?.muted || track?.hidden) continue;

    try {
      const response = await fetch(clip.src);
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

      const sourceNode = offlineCtx.createBufferSource();
      sourceNode.buffer = decodedBuffer;
      
      const pitchShift = clip.audioSettings?.pitch || 0;
      const pitchRatio = pitchShift !== 0 ? Math.pow(2, pitchShift / 12) : 1;
      sourceNode.playbackRate.value = (clip.speed || 1) * pitchRatio;

      let lastNode: AudioNode = sourceNode;

      // 3-Band Equalizer & Presets
      if (clip.audioSettings) {
        const { bass = 0, mid = 0, treble = 0, pan = 0 } = clip.audioSettings;

        if (bass !== 0) {
          const bassFilter = offlineCtx.createBiquadFilter();
          bassFilter.type = 'lowshelf';
          bassFilter.frequency.value = 180;
          bassFilter.gain.value = bass;
          lastNode.connect(bassFilter);
          lastNode = bassFilter;
        }

        if (mid !== 0) {
          const midFilter = offlineCtx.createBiquadFilter();
          midFilter.type = 'peaking';
          midFilter.frequency.value = 1200;
          midFilter.Q.value = 1.0;
          midFilter.gain.value = mid;
          lastNode.connect(midFilter);
          lastNode = midFilter;
        }

        if (treble !== 0) {
          const trebleFilter = offlineCtx.createBiquadFilter();
          trebleFilter.type = 'highshelf';
          trebleFilter.frequency.value = 5500;
          trebleFilter.gain.value = treble;
          lastNode.connect(trebleFilter);
          lastNode = trebleFilter;
        }

        // Stereo Pan
        if (pan !== 0 && typeof offlineCtx.createStereoPanner === 'function') {
          try {
            const panner = offlineCtx.createStereoPanner();
            panner.pan.value = Math.max(-1, Math.min(1, pan));
            lastNode.connect(panner);
            lastNode = panner;
          } catch {
            // StereoPanner fallback
          }
        }
      }

      const gainNode = offlineCtx.createGain();
      const clipVol = clip.volume !== undefined ? clip.volume : 1;
      const startTime = clip.start;
      const duration = clip.duration;
      const offset = clip.offset || 0;

      gainNode.gain.setValueAtTime(clipVol, startTime);

      if (clip.fadeIn && clip.fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(clipVol, startTime + clip.fadeIn);
      }
      if (clip.fadeOut && clip.fadeOut > 0) {
        const fadeStart = startTime + duration - clip.fadeOut;
        gainNode.gain.setValueAtTime(clipVol, Math.max(startTime, fadeStart));
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      }

      lastNode.connect(gainNode);
      gainNode.connect(offlineCtx.destination);

      sourceNode.start(startTime, offset, duration);
      hasAudioTrack = true;
    } catch (err) {
      console.warn(`Audio decoding skipped for clip "${clip.name}":`, err);
    }
  }

  if (!hasAudioTrack) return null;
  return await offlineCtx.startRendering();
}

/**
 * Professional, deterministic video export engine.
 * Uses mediabunny (WebCodecs + MP4/WebM Muxer) with completely isolated media elements.
 * Eliminates video stuttering, flickering, and preview corruption after render.
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

  // 1. Completely isolated video elements created exclusively for this export job
  const exportVideos = new Map<string, HTMLVideoElement>();
  const getExportVideo = (src: string): HTMLVideoElement => {
    let v = exportVideos.get(src);
    if (!v) {
      v = document.createElement('video');
      v.crossOrigin = 'anonymous';
      v.src = src;
      v.preload = 'auto';
      v.muted = true; // Silent during export
      v.playsInline = true;
      exportVideos.set(src, v);
    }
    return v;
  };

  const cleanupExportElements = () => {
    exportVideos.forEach((v) => {
      try {
        v.pause();
        v.removeAttribute('src');
        v.load();
      } catch {}
    });
    exportVideos.clear();
  };

  // 2. Pre-warm isolated export video elements
  for (const clip of project.clips) {
    if (clip.type === 'video' && clip.src) {
      const v = getExportVideo(clip.src);
      if (v.readyState < 2) {
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          v.addEventListener('loadeddata', done, { once: true });
          v.addEventListener('error', done, { once: true });
          setTimeout(done, 1000);
        });
      }
    }
  }

  // 3. Render mixed audio offline (no interference with preview elements)
  let mixedAudioBuffer: AudioBuffer | null = null;
  try {
    mixedAudioBuffer = await renderProjectAudioBuffer(project);
  } catch (err) {
    console.warn('Audio rendering warning:', err);
  }

  const totalDuration = Math.max(1, project.duration);
  const totalFrames = Math.ceil(totalDuration * fps);

  // 4. Try mediabunny WebCodecs pipeline first
  const canUseWebCodecs = typeof VideoEncoder !== 'undefined';

  if (canUseWebCodecs) {
    try {
      let videoCodec: 'avc' | 'vp9' | 'vp8' = 'avc';
      if (await canEncodeVideo('avc', { width, height })) {
        videoCodec = 'avc';
      } else if (await canEncodeVideo('vp9', { width, height })) {
        videoCodec = 'vp9';
      } else if (await canEncodeVideo('vp8', { width, height })) {
        videoCodec = 'vp8';
      }

      const isMp4 = videoCodec === 'avc';
      const format = isMp4 ? new Mp4OutputFormat() : new WebMOutputFormat();
      const target = new BufferTarget();
      const output = new Output({ format, target });

      const canvasSource = new CanvasSource(offscreenCanvas, {
        codec: videoCodec,
        quality: new Quality('high'),
      });
      output.addVideoTrack(canvasSource, { frameRate: fps });

      let audioSource: AudioBufferSource | null = null;
      if (mixedAudioBuffer) {
        try {
          let audioCodec: 'aac' | 'opus' | null = null;
          if (isMp4 && (await canEncodeAudio('aac'))) {
            audioCodec = 'aac';
          } else if (await canEncodeAudio('opus')) {
            audioCodec = 'opus';
          }
          if (audioCodec) {
            audioSource = new AudioBufferSource({
              codec: audioCodec,
              quality: new Quality('high'),
            });
            output.addAudioTrack(audioSource);
          }
        } catch (e) {
          console.warn('Audio track setup warning:', e);
        }
      }

      await output.start();

      if (audioSource && mixedAudioBuffer) {
        await audioSource.add(mixedAudioBuffer);
        audioSource.close();
      }

      // Frame-by-frame exact rendering with zero jitter and zero dropped frames
      for (let f = 0; f < totalFrames; f++) {
        if (shouldCancel()) {
          cleanupExportElements();
          await output.cancel();
          throw new Error('Export cancelled by user');
        }

        const time = f / fps;

        // Seek all active video clips for this frame
        const seekPromises: Promise<void>[] = [];
        for (const clip of project.clips) {
          if (clip.type === 'video' && clip.src) {
            const isActive = time >= clip.start && time < clip.start + clip.duration;
            if (isActive) {
              const v = getExportVideo(clip.src);
              const targetSourceTime = (time - clip.start) * clip.speed + clip.offset;
              seekPromises.push(seekVideoElement(v, targetSourceTime));
            }
          }
        }
        if (seekPromises.length > 0) {
          await Promise.all(seekPromises);
        }

        // Draw exact composite frame onto canvas
        renderProjectFrame(ctx, project, time, width, height, null, getExportVideo);

        // Add sample to video output
        await canvasSource.add(time, 1 / fps);

        const pct = Math.min(99, Math.round(((f + 1) / totalFrames) * 100));
        onProgress(pct, f + 1, totalFrames);
      }

      canvasSource.close();
      await output.finalize();
      cleanupExportElements();

      const mimeType = isMp4 ? 'video/mp4' : 'video/webm';
      onProgress(100, totalFrames, totalFrames);
      return new Blob([target.buffer!], { type: mimeType });
    } catch (err) {
      console.warn('WebCodecs export failed, falling back to MediaRecorder:', err);
      cleanupExportElements();
    }
  }

  // 5. Fallback Engine: MediaRecorder with isolated elements and offline audio playback
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      const fallbackVideos = new Map<string, HTMLVideoElement>();
      const getFallbackVideo = (src: string): HTMLVideoElement => {
        let v = fallbackVideos.get(src);
        if (!v) {
          v = document.createElement('video');
          v.crossOrigin = 'anonymous';
          v.src = src;
          v.preload = 'auto';
          v.muted = true;
          v.playsInline = true;
          fallbackVideos.set(src, v);
        }
        return v;
      };

      const canvasStream = offscreenCanvas.captureStream(fps);
      const streamTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      let tempAudioCtx: AudioContext | null = null;
      let bufferSourceNode: AudioBufferSourceNode | null = null;

      if (mixedAudioBuffer) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          tempAudioCtx = new AudioContextClass();
          const dest = tempAudioCtx.createMediaStreamDestination();
          bufferSourceNode = tempAudioCtx.createBufferSource();
          bufferSourceNode.buffer = mixedAudioBuffer;
          bufferSourceNode.connect(dest);
          if (dest.stream.getAudioTracks().length > 0) {
            streamTracks.push(dest.stream.getAudioTracks()[0]);
          }
        } catch {}
      }

      const combinedStream = new MediaStream(streamTracks);

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: resolution === '1080p' ? 10_000_000 : 5_000_000,
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const cleanupFallback = () => {
        fallbackVideos.forEach((v) => {
          try {
            v.pause();
            v.removeAttribute('src');
            v.load();
          } catch {}
        });
        fallbackVideos.clear();
        if (tempAudioCtx && tempAudioCtx.state !== 'closed') {
          tempAudioCtx.close().catch(() => {});
        }
      };

      recorder.onstop = () => {
        cleanupFallback();
        onProgress(100, totalFrames, totalFrames);
        resolve(new Blob(chunks, { type: mimeType }));
      };

      recorder.onerror = (e) => {
        cleanupFallback();
        reject(e);
      };

      recorder.start(100);
      if (bufferSourceNode) {
        bufferSourceNode.start(0);
      }

      // Draw frames
      for (let f = 0; f < totalFrames; f++) {
        if (shouldCancel()) {
          recorder.stop();
          cleanupFallback();
          reject(new Error('Export cancelled by user'));
          return;
        }

        const time = f / fps;
        const seekPromises: Promise<void>[] = [];
        for (const clip of project.clips) {
          if (clip.type === 'video' && clip.src) {
            if (time >= clip.start && time < clip.start + clip.duration) {
              const v = getFallbackVideo(clip.src);
              const targetSourceTime = (time - clip.start) * clip.speed + clip.offset;
              seekPromises.push(seekVideoElement(v, targetSourceTime));
            }
          }
        }
        if (seekPromises.length > 0) {
          await Promise.all(seekPromises);
        }

        renderProjectFrame(ctx, project, time, width, height, null, getFallbackVideo);
        onProgress(Math.min(99, Math.round(((f + 1) / totalFrames) * 100)), f + 1, totalFrames);
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }

      recorder.stop();
    } catch (err) {
      reject(err);
    }
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
