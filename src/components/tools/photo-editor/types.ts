import type { Canvas, FabricObject } from 'fabric';

export type ToolTab =
  | 'crop'
  | 'adjust'
  | 'filter'
  | 'effects'
  | 'bg-removal'
  | 'text'
  | 'shapes'
  | 'stickers'
  | 'draw'
  | 'layers';

export interface ImageAdjustments {
  brightness: number;  // -100 to 100 (0 default)
  contrast: number;    // -100 to 100 (0 default)
  saturation: number;  // -100 to 100 (0 default)
  vibrance: number;    // -100 to 100 (0 default)
  exposure: number;    // -100 to 100 (0 default)
  temperature: number; // -100 to 100 (warm/cool)
  tint: number;        // -100 to 100 (magenta/green)
  blur: number;        // 0 to 100
  sharpness: number;   // 0 to 100
  sepia: number;       // 0 to 100
  grayscale: number;   // 0 to 100
  invert: number;      // 0 to 100
  vignette: number;    // 0 to 100
  hueRotate: number;   // -180 to 180
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  blur: 0,
  sharpness: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  vignette: 0,
  hueRotate: 0,
};

export interface FilterPreset {
  id: string;
  name: string;
  desc: string;
  gradient: string;
  adjustments: Partial<ImageAdjustments>;
}

export interface FontOption {
  name: string;
  fontFamily: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
}

export const FONT_OPTIONS: FontOption[] = [
  { name: 'Archivo (Default)', fontFamily: "'Archivo', sans-serif", category: 'display' },
  { name: 'Plus Jakarta Sans', fontFamily: "'Plus Jakarta Sans', sans-serif", category: 'sans-serif' },
  { name: 'Bebas Neue', fontFamily: "'Bebas Neue', sans-serif", category: 'display' },
  { name: 'Playfair Display', fontFamily: "'Playfair Display', serif", category: 'serif' },
  { name: 'Montserrat', fontFamily: "'Montserrat', sans-serif", category: 'sans-serif' },
  { name: 'Syne', fontFamily: "'Syne', sans-serif", category: 'display' },
  { name: 'Cinzel', fontFamily: "'Cinzel', serif", category: 'serif' },
  { name: 'Poppins', fontFamily: "'Poppins', sans-serif", category: 'sans-serif' },
  { name: 'Oswald', fontFamily: "'Oswald', sans-serif", category: 'sans-serif' },
  { name: 'Geist Sans', fontFamily: "'Geist', sans-serif", category: 'sans-serif' },
  { name: 'Caveat Hand', fontFamily: "'Caveat', cursive", category: 'handwriting' },
  { name: 'JetBrains Mono', fontFamily: "'JetBrains Mono', monospace", category: 'monospace' },
];

export interface TextPreset {
  id: string;
  title: string;
  preview: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: string;
  fill: string;
  letterSpacing: number;
  lineHeight: number;
  stroke?: string;
  strokeWidth?: number;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  backgroundColor?: string;
}

export interface ShapeOption {
  id: string;
  name: string;
  iconName: string;
  type: 'rect' | 'circle' | 'triangle' | 'star' | 'polygon' | 'arrow' | 'line' | 'heart' | 'badge' | 'speech';
  defaultFill: string;
  defaultStroke?: string;
}

export interface StickerItem {
  id: string;
  category: 'badges' | 'emojis' | 'graphics' | 'aesthetic' | 'social';
  name: string;
  svg?: string;
  emoji?: string;
  color?: string;
}

export interface PhotoTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  aspectRatio: string;
  width: number;
  height: number;
  backgroundImage: string;
  objects: Array<{
    type: 'text' | 'shape' | 'sticker';
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontStyle?: string;
    fill?: string;
    left: number;
    top: number;
    angle?: number;
    scaleX?: number;
    scaleY?: number;
    stroke?: string;
    strokeWidth?: number;
    shadow?: any;
    letterSpacing?: number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    opacity?: number;
    shapeType?: string;
    width?: number;
    height?: number;
    rx?: number;
    ry?: number;
  }>;
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf';
  quality: number; // 0.1 to 1.0
  scale: number;   // 1x, 2x, 3x, 4x (for ultra high-res / 4K)
  fileName: string;
  transparentBg: boolean;
}
