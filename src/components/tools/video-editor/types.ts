export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';
export type Resolution = '720p' | '1080p' | '4K';
export type ClipType = 'video' | 'image' | 'audio' | 'text' | 'sticker';
export type TrackType = 'video' | 'audio' | 'overlay';
export type ActiveTab = 'media' | 'audio' | 'text' | 'stickers' | 'filters' | 'transitions' | 'canvas';

export interface FilterSettings {
  brightness: number; // -100 to 100 (0 default)
  contrast: number; // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  sepia: number; // 0 to 100 (0 default)
  grayscale: number; // 0 to 100 (0 default)
  invert: number; // 0 to 100 (0 default)
  blur: number; // 0 to 20 px (0 default)
  hueRotate: number; // 0 to 360 deg (0 default)
  vignette: number; // 0 to 100 (0 default)
  lutPreset: string; // 'none' | 'cinematic' | 'cyberpunk' | 'vintage' | 'noir' | 'sunset' | 'vibrant' | 'vhs'
}

export interface TextData {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  color: string;
  backgroundColor?: string;
  bgPadding?: number;
  textShadow?: string;
  strokeColor?: string;
  strokeWidth?: number;
  animation?: 'none' | 'fade' | 'typewriter' | 'slide-up' | 'bounce';
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  align: 'left' | 'center' | 'right';
}

export interface StickerData {
  category: string;
  emoji?: string;
  badgeType?: string;
  label?: string;
  svgIcon?: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale: number;
  rotation?: number;
}

export type BlendMode =
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export type MaskShape = 'none' | 'circle' | 'rectangle' | 'ellipse' | 'vignette' | 'rounded-rect';

export interface MaskSettings {
  shape: MaskShape;
  sizeX: number; // percentage (10 to 100)
  sizeY: number; // percentage (10 to 100)
  posX: number; // percentage (0 to 100, default 50)
  posY: number; // percentage (0 to 100, default 50)
  feather: number; // blur in px (0 to 40)
  inverted: boolean;
}

export type MotionPreset =
  | 'none'
  | 'pan-left'
  | 'pan-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'float'
  | 'spin';

export interface MotionSettings {
  preset: MotionPreset;
  intensity: number; // 0 to 100 (50 default)
}

export interface ChromaKeySettings {
  enabled: boolean;
  color: string; // Hex e.g. '#00ff00'
  tolerance: number; // 0 to 100 (default 40)
  smoothness: number; // 0 to 100 (default 15)
  spill: number; // 0 to 100 (default 30)
}

export interface CompositingSettings {
  blendMode: BlendMode;
  mask?: MaskSettings;
  motion?: MotionSettings;
  chromaKey?: ChromaKeySettings;
}

export type EqPreset = 'flat' | 'voice-boost' | 'bass-boost' | 'treble-boost' | 'radio' | 'warm';

export interface AudioSettings {
  eqPreset: EqPreset;
  bass: number; // -12dB to +12dB (0 default)
  mid: number; // -12dB to +12dB (0 default)
  treble: number; // -12dB to +12dB (0 default)
  pan: number; // -1.0 (Left) to +1.0 (Right), 0 center
  noiseGate: boolean;
  pitch: number; // -12 to +12 semitones (0 default)
  ducking?: boolean; // Automatically lowers background volume during speech
}

export interface TimelineMarker {
  id: string;
  time: number; // timestamp in seconds
  label: string;
  color: string;
}

export interface TransitionSettings {
  type: 'none' | 'fade' | 'dissolve' | 'wipe-left' | 'zoom-in';
  duration: number; // in seconds
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  type: ClipType;
  src?: string;
  thumbnail?: string;
  start: number; // timeline start position in seconds
  duration: number; // timeline duration span in seconds
  offset: number; // source in-point trim in seconds
  sourceDuration?: number; // total raw file duration
  speed: number; // 0.25 to 2.0
  volume: number; // 0 to 2.0 (1.0 default)
  muted: boolean;
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  opacity: number; // 0 to 1
  scale: number; // 0.2 to 3.0
  rotation: number; // in degrees
  flipH: boolean;
  flipV: boolean;
  fit: 'contain' | 'cover';
  filters: FilterSettings;
  textData?: TextData;
  stickerData?: StickerData;
  transition?: TransitionSettings;
  audioSettings?: AudioSettings;
  compositing?: CompositingSettings;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  hidden: boolean;
  locked: boolean;
}

export interface Project {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  backgroundColor: string;
  tracks: Track[];
  clips: Clip[];
  markers?: TimelineMarker[];
  duration: number;
  fps: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  duration: number;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  sublabel: string;
  ratio: number; // width / height
  iconName: string;
  width: number;
  height: number;
}

export interface LutPreset {
  id: string;
  name: string;
  previewColor: string;
  filter: Partial<FilterSettings>;
}

export interface TextPreset {
  id: string;
  name: string;
  category: string;
  data: Partial<TextData>;
}

export interface SoundEffect {
  id: string;
  name: string;
  category: 'impact' | 'foley' | 'ui' | 'cinematic' | 'musical';
  duration: number;
  type: 'whoosh' | 'ding' | 'pop' | 'camera' | 'glitch' | 'bass' | 'chime' | 'applause';
  previewUrl?: string;
}
