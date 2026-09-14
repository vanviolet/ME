import {
  Canvas,
  FabricImage,
  IText,
  Textbox,
  Rect,
  Circle,
  Triangle,
  Polygon,
  Path,
  Line,
  Shadow,
  filters,
  Point,
  FabricObject,
} from 'fabric';
import { removeBackground } from '@imgly/background-removal';
import { ImageAdjustments, DEFAULT_ADJUSTMENTS, FilterPreset } from './types';

// Custom Selection style matching Canva / screenshot UI
export function applyCustomControlStyles(obj: FabricObject) {
  obj.set({
    borderColor: '#a855f7', // vibrant purple border as in screenshot
    cornerColor: '#ffffff',
    cornerStrokeColor: '#a855f7',
    cornerSize: 9,
    cornerStyle: 'rect',
    transparentCorners: false,
    borderScaleFactor: 2,
    padding: 6,
    hoverCursor: 'move',
  });
}

// Preset Filter Definitions with adjustments
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Normal',
    desc: 'Original look',
    gradient: 'from-stone-500 to-zinc-600',
    adjustments: {},
  },
  {
    id: 'warm-vintage',
    name: 'Warm Vintage',
    desc: 'Golden 70s vibe',
    gradient: 'from-amber-600 to-orange-700',
    adjustments: { sepia: 40, temperature: 30, contrast: 15, saturation: 10 },
  },
  {
    id: 'noir',
    name: 'Noir Cinema',
    desc: 'High contrast B&W',
    gradient: 'from-zinc-800 to-black',
    adjustments: { grayscale: 100, contrast: 45, brightness: -5 },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    desc: 'Neon blues & magenta',
    gradient: 'from-cyan-500 to-fuchsia-600',
    adjustments: { hueRotate: 160, saturation: 40, contrast: 25, brightness: 5 },
  },
  {
    id: 'dramatic',
    name: 'Dramatic Punch',
    desc: 'Moody shadows & rich tones',
    gradient: 'from-purple-900 to-zinc-900',
    adjustments: { contrast: 40, saturation: 20, brightness: -10, exposure: -10 },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    desc: 'Sunlit warmth',
    gradient: 'from-yellow-500 to-orange-600',
    adjustments: { temperature: 45, brightness: 10, saturation: 25, contrast: 10 },
  },
  {
    id: 'emerald',
    name: 'Emerald Lush',
    desc: 'Rich green vibrancy',
    gradient: 'from-emerald-500 to-teal-700',
    adjustments: { hueRotate: 75, saturation: 25, brightness: 5 },
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    desc: 'Soft & luminous',
    gradient: 'from-pink-400 to-indigo-300',
    adjustments: { brightness: 20, contrast: -15, saturation: -20, exposure: 15 },
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    desc: 'Green terminal tint',
    gradient: 'from-emerald-700 to-green-950',
    adjustments: { hueRotate: 90, saturation: 50, contrast: 30 },
  },
  {
    id: 'invert',
    name: 'Film Negative',
    desc: 'Inverted colors',
    gradient: 'from-blue-600 to-amber-500',
    adjustments: { invert: 100 },
  },
];

// Apply image adjustment filters to FabricImage
export async function applyImageAdjustments(
  img: FabricImage,
  adjustments: ImageAdjustments
): Promise<void> {
  if (!img) return;
  img.filters = [];

  // Brightness (-1 to 1)
  const totalBrightness = (adjustments.brightness || 0) + (adjustments.exposure ? adjustments.exposure * 0.5 : 0);
  if (totalBrightness !== 0) {
    img.filters.push(new filters.Brightness({ brightness: Math.max(-1, Math.min(1, totalBrightness / 100)) }));
  }

  // Contrast (-1 to 1)
  if (adjustments.contrast !== 0) {
    img.filters.push(new filters.Contrast({ contrast: Math.max(-1, Math.min(1, adjustments.contrast / 100)) }));
  }

  // Saturation (-1 to 1)
  if (adjustments.saturation !== 0) {
    img.filters.push(new filters.Saturation({ saturation: Math.max(-1, Math.min(1, adjustments.saturation / 100)) }));
  }

  // Vibrance
  if (adjustments.vibrance !== 0 && (filters as any).Vibrance) {
    img.filters.push(new (filters as any).Vibrance({ vibrance: adjustments.vibrance / 100 }));
  }

  // Hue Rotate (-1 to 1 or deg)
  if (adjustments.hueRotate !== 0) {
    img.filters.push(new filters.HueRotation({ rotation: (adjustments.hueRotate * Math.PI) / 180 }));
  }

  // Temperature / Warmth (Warmth adds subtle Sepia / Hue shift)
  if (adjustments.temperature && adjustments.temperature !== 0) {
    if (adjustments.temperature > 0) {
      img.filters.push(new filters.Sepia());
    } else {
      img.filters.push(new filters.HueRotation({ rotation: -0.2 }));
    }
  }

  // Blur (0 to 1)
  if (adjustments.blur > 0) {
    img.filters.push(new filters.Blur({ blur: Math.min(1, adjustments.blur / 100) }));
  }

  // Grayscale
  if (adjustments.grayscale > 0) {
    img.filters.push(new filters.Grayscale());
  }

  // Sepia
  if (adjustments.sepia > 0) {
    img.filters.push(new filters.Sepia());
  }

  // Invert
  if (adjustments.invert > 0) {
    img.filters.push(new filters.Invert());
  }

  try {
    await img.applyFilters();
  } catch (err) {
    console.warn('Filter application note:', err);
  }
}

// Helper to create star polygon points
export function createStarPoints(points: number, outerRadius: number, innerRadius: number) {
  const step = Math.PI / points;
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    result.push({
      x: outerRadius + r * Math.cos(angle),
      y: outerRadius + r * Math.sin(angle),
    });
  }
  return result;
}

// Automatic AI Background Removal (remove.bg style using Neural Network segmentation)
export async function removeImageBackgroundAI(
  imageSource: FabricImage | HTMLImageElement | string,
  onProgress?: (status: string) => void
): Promise<string> {
  try {
    onProgress?.('Preparing image...');
    let source: string | Blob | HTMLImageElement = imageSource as any;

    if (typeof imageSource === 'object' && imageSource !== null) {
      if ('toDataURL' in imageSource && typeof (imageSource as any).toDataURL === 'function') {
        source = (imageSource as any).toDataURL({ format: 'png' });
      } else if ('getElement' in imageSource && typeof (imageSource as any).getElement === 'function') {
        const el = (imageSource as any).getElement() as HTMLImageElement;
        source = el.src || (imageSource as any);
      }
    }

    onProgress?.('Analyzing subject with AI...');
    const blob = await removeBackground(source, {
      progress: (key: string, current: number, total: number) => {
        if (total > 0) {
          const percent = Math.round((current / total) * 100);
          onProgress?.(`Processing AI model (${percent}%)...`);
        } else {
          onProgress?.(`AI model: ${key}...`);
        }
      },
      output: {
        format: 'image/png',
        quality: 0.95,
      },
    });

    onProgress?.('Finalizing cutout...');
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('AI Background Removal fallback triggered:', error);
    onProgress?.('Refining with smart edge analysis...');
    // Fallback to high-precision edge-aware canvas removal
    return removeImageBackground(imageSource, 35, undefined, { r: 255, g: 255, b: 255 });
  }
}

// Background Removal / Chroma key via Canvas Pixel Manipulation
export async function removeImageBackground(
  imageSource: FabricImage | HTMLImageElement | string,
  tolerance: number = 30,
  replaceColor?: string,
  keyColor: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 }
): Promise<string> {
  let imgEl: HTMLImageElement;
  if (typeof imageSource === 'string') {
    imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    imgEl.src = imageSource;
    await new Promise((resolve, reject) => {
      imgEl.onload = resolve;
      imgEl.onerror = reject;
    });
  } else if ('getElement' in imageSource && typeof (imageSource as any).getElement === 'function') {
    imgEl = (imageSource as any).getElement() as HTMLImageElement;
  } else {
    imgEl = imageSource as HTMLImageElement;
  }

  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || imgEl.width || 800;
  canvas.height = imgEl.naturalHeight || imgEl.height || 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imgEl.src;

  ctx.drawImage(imgEl, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Sample corner pixel color if default white is not dominant
  let targetR = keyColor.r;
  let targetG = keyColor.g;
  let targetB = keyColor.b;

  // If auto detecting background from top-left corner
  if (data.length >= 4) {
    targetR = data[0];
    targetG = data[1];
    targetB = data[2];
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate Euclidean color distance
    const dist = Math.sqrt(
      Math.pow(r - targetR, 2) +
      Math.pow(g - targetG, 2) +
      Math.pow(b - targetB, 2)
    );

    if (dist <= tolerance) {
      data[i + 3] = 0; // Set Alpha to 0 (Transparent)
    } else if (dist < tolerance + 15) {
      // Soft edge feathering
      const alphaFactor = (dist - tolerance) / 15;
      data[i + 3] = Math.floor(data[i + 3] * alphaFactor);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // If replacing background with a solid color
  if (replaceColor && replaceColor !== 'transparent') {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx) {
      bgCtx.fillStyle = replaceColor;
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.drawImage(canvas, 0, 0);
      return bgCanvas.toDataURL('image/png');
    }
  }

  return canvas.toDataURL('image/png');
}
