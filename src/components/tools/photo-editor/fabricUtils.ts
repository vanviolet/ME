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
  img.filters = [];

  // Brightness (-1 to 1)
  if (adjustments.brightness !== 0) {
    img.filters.push(new filters.Brightness({ brightness: adjustments.brightness / 100 }));
  }

  // Contrast (-1 to 1)
  if (adjustments.contrast !== 0) {
    img.filters.push(new filters.Contrast({ contrast: adjustments.contrast / 100 }));
  }

  // Saturation (-1 to 1)
  if (adjustments.saturation !== 0) {
    img.filters.push(new filters.Saturation({ saturation: adjustments.saturation / 100 }));
  }

  // Vibrance
  if (adjustments.vibrance !== 0 && (filters as any).Vibrance) {
    img.filters.push(new (filters as any).Vibrance({ vibrance: adjustments.vibrance / 100 }));
  }

  // Hue Rotate (-1 to 1 or deg)
  if (adjustments.hueRotate !== 0) {
    img.filters.push(new filters.HueRotation({ rotation: (adjustments.hueRotate * Math.PI) / 180 }));
  }

  // Blur (0 to 1)
  if (adjustments.blur > 0) {
    img.filters.push(new filters.Blur({ blur: adjustments.blur / 100 }));
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

  await img.applyFilters();
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

// Background Removal / Chroma key via Canvas Pixel Manipulation
export async function removeImageBackground(
  imageElement: HTMLImageElement,
  keyColor: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 },
  tolerance: number = 30
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageElement.src;

  ctx.drawImage(imageElement, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate Euclidean color distance
    const dist = Math.sqrt(
      Math.pow(r - keyColor.r, 2) +
      Math.pow(g - keyColor.g, 2) +
      Math.pow(b - keyColor.b, 2)
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
  return canvas.toDataURL('image/png');
}
