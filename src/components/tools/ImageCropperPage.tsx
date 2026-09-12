import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Crop,
  Upload,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Download,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  FileCode,
  Layers,
  Circle,
  Square,
  Sun,
  Contrast,
  Palette,
  Wand2,
  SlidersHorizontal,
  Eye,
  RotateCcw as ResetIcon,
  Maximize2,
  Minimize2,
  Sliders as ControlsIcon,
  Film,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Utility helper to create HTMLImageElement
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Rotate bounding box calculation
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

// Filter State Interface
export interface ImageFilters {
  brightness: number; // 0..200, default 100
  contrast: number;   // 0..200, default 100
  saturate: number;   // 0..200, default 100
  blur: number;       // 0..10, default 0
  hueRotate: number;  // -180..180, default 0
  grayscale: number;  // 0..100, default 0
  sepia: number;      // 0..100, default 0
  invert: number;     // 0..100, default 0
}

const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  hueRotate: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
};

// Convert ImageFilters object to CSS filter string
export const getFilterString = (filters: ImageFilters): string => {
  const parts: string[] = [];
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
};

// Filter Preset Definitions
interface PresetFilter {
  id: string;
  name: string;
  desc: string;
  colorBg: string;
  filters: ImageFilters;
}

const FILTER_PRESETS: PresetFilter[] = [
  { id: 'normal', name: 'Original', desc: 'No Filter', colorBg: 'from-stone-500 to-zinc-600', filters: DEFAULT_FILTERS },
  { id: 'vintage', name: 'Vintage', desc: 'Warm Classic', colorBg: 'from-amber-600 to-orange-700', filters: { ...DEFAULT_FILTERS, sepia: 60, contrast: 115, brightness: 95 } },
  { id: 'bw', name: 'Monochrome', desc: 'Deep B&W', colorBg: 'from-zinc-700 to-stone-900', filters: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 130 } },
  { id: 'warm', name: 'Warm Sunset', desc: 'Golden Hour', colorBg: 'from-amber-500 to-rose-600', filters: { ...DEFAULT_FILTERS, sepia: 25, saturate: 145, brightness: 105 } },
  { id: 'cyber', name: 'Cyberpunk', desc: 'Neon Cool', colorBg: 'from-cyan-500 to-blue-600', filters: { ...DEFAULT_FILTERS, hueRotate: 180, saturate: 140, contrast: 110 } },
  { id: 'dramatic', name: 'Dramatic', desc: 'High Contrast', colorBg: 'from-purple-600 to-indigo-800', filters: { ...DEFAULT_FILTERS, contrast: 160, saturate: 120, brightness: 85 } },
  { id: 'emerald', name: 'Emerald', desc: 'Fresh Nature', colorBg: 'from-emerald-500 to-teal-700', filters: { ...DEFAULT_FILTERS, hueRotate: 80, saturate: 115, brightness: 105 } },
  { id: 'negative', name: 'Film Negative', desc: 'Inverted', colorBg: 'from-rose-600 to-purple-700', filters: { ...DEFAULT_FILTERS, invert: 100 } },
  { id: 'soft', name: 'Pastel Dream', desc: 'Soft & Muted', colorBg: 'from-pink-400 to-purple-400', filters: { ...DEFAULT_FILTERS, brightness: 110, saturate: 85, contrast: 90 } },
];

// Main image cropping and filtering canvas generator
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  filters: ImageFilters = DEFAULT_FILTERS,
  outputFormat: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality = 0.92
): Promise<{ blob: Blob; url: string; base64: string; width: number; height: number }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Apply CSS Filters directly to canvas context
  const filterString = getFilterString(filters);
  if (filterString !== 'none') {
    ctx.filter = filterString;
  }

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Could not get cropped 2D canvas context');
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve({
            blob,
            url,
            base64,
            width: pixelCrop.width,
            height: pixelCrop.height,
          });
        };
      },
      outputFormat,
      quality
    );
  });
}

// Sample test images
const SAMPLE_IMAGES = [
  {
    name: 'Landscape Architecture',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Developer Workspace',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Minimal Abstract',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ImageCropperPage: React.FC = () => {
  const { language } = usePortfolio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Control Sidebar Tab
  const [controlTab, setControlTab] = useState<'adjust' | 'crop' | 'export'>('adjust');

  // Image & Cropper States
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flip, setFlip] = useState<{ horizontal: boolean; vertical: boolean }>({
    horizontal: false,
    vertical: false,
  });

  // Aspect Ratio & Shape
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [cropShape, setCropShape] = useState<'rect' | 'round'>('rect');
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Filters State
  const [filters, setFilters] = useState<ImageFilters>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<string>('normal');

  // Output settings
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(0.92);

  // Result States
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedResult, setCroppedResult] = useState<{
    blob: Blob;
    url: string;
    base64: string;
    width: number;
    height: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedBase64, setCopiedBase64] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState<boolean>(false);

  // Handle Crop Complete Callback from react-easy-crop
  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Generate Cropped Image Preview in Real-time
  const handleGenerateCrop = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flip,
        filters,
        outputFormat,
        quality
      );
      setCroppedResult(result);
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, flip, filters, outputFormat, quality]);

  // Ultra-responsive live update when crop or sliders change
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleGenerateCrop();
    }, 40);
    return () => clearTimeout(timeout);
  }, [handleGenerateCrop]);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlip({ horizontal: false, vertical: false });
        setFilters(DEFAULT_FILTERS);
        setActivePreset('normal');
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result as string);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setRotation(0);
          setFlip({ horizontal: false, vertical: false });
          setFilters(DEFAULT_FILTERS);
          setActivePreset('normal');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Download Output File
  const handleDownload = () => {
    if (!croppedResult) return;
    const link = document.createElement('a');
    const ext = outputFormat.split('/')[1] || 'png';
    link.download = `edited-image-${Date.now()}.${ext}`;
    link.href = croppedResult.url;
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!croppedResult) return;
    try {
      const data = [new ClipboardItem({ [croppedResult.blob.type]: croppedResult.blob })];
      await navigator.clipboard.write(data);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error('Copy image failed, fallback to base64', err);
      navigator.clipboard.writeText(croppedResult.base64);
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    }
  };

  // Copy Base64 String
  const handleCopyBase64 = () => {
    if (!croppedResult) return;
    navigator.clipboard.writeText(croppedResult.base64);
    setCopiedBase64(true);
    setTimeout(() => setCopiedBase64(false), 2000);
  };

  // Reset all adjustments
  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setFilters(DEFAULT_FILTERS);
    setActivePreset('normal');
  };

  // Apply Filter Preset
  const applyPreset = (preset: PresetFilter) => {
    setFilters(preset.filters);
    setActivePreset(preset.id);
  };

  // Update specific filter parameter
  const updateFilter = (key: keyof ImageFilters, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActivePreset('custom');
  };

  // Reset individual filter key
  const resetSingleFilter = (key: keyof ImageFilters) => {
    setFilters(prev => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
  };

  // Aspect ratio option list
  const ASPECT_RATIOS = [
    { label: '1:1 Square', value: 1, shape: 'rect' as const },
    { label: 'Circle Avatar', value: 1, shape: 'round' as const },
    { label: '4:3 Standard', value: 4 / 3, shape: 'rect' as const },
    { label: '16:9 Banner', value: 16 / 9, shape: 'rect' as const },
    { label: '9:16 Story', value: 9 / 16, shape: 'rect' as const },
    { label: '3:2 Camera', value: 3 / 2, shape: 'rect' as const },
    { label: 'Free Aspect', value: undefined, shape: 'rect' as const },
  ];

  const currentFilterCss = getFilterString(filters);

  return (
    <div className="min-h-screen pt-20 pb-16 px-3 sm:px-6 lg:px-8 max-w-[1500px] mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'Modern Image Editor & Cropper — Studio Pro' : 'Editor Foto Modern & Crop Online — Perkakas Pro'}
        description={
          language === 'en'
            ? 'Professional modern photo studio editor with interactive crop, real-time CSS color filters, lighting controls, avatar masks, and high-res export.'
            : 'Studio editor foto modern profesional dengan pemotong foto interaktif, filter warna real-time, pengatur kecerahan & kontras, serta ekspor PNG, WEBP, JPEG.'
        }
        url="/tools/image-cropper"
      />

      {/* Top Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="w-9 h-9 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors shadow-xs shrink-0"
            title={language === 'en' ? 'Back to Tools' : 'Kembali ke Perkakas'}
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Studio Editor Pro
              </span>
              <span className="text-xs text-stone-400 dark:text-zinc-500 font-mono">v2.0</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Modern Image Cropper & Filters</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} />
            <span>{language === 'en' ? 'Reset Studio' : 'Reset Semua'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-colors"
          >
            <Upload size={14} />
            <span>{language === 'en' ? 'Upload Photo' : 'Unggah Foto'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Interactive Canvas Stage & Floating Toolbar */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative w-full h-[450px] sm:h-[580px] rounded-3xl bg-zinc-950 border border-stone-200 dark:border-zinc-800/80 shadow-2xl overflow-hidden flex flex-col justify-between p-4 group">
            {/* Aspect Ratio Top Floating Pill Toolbar */}
            <div className="z-30 flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
              <div className="flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
                {ASPECT_RATIOS.map((item, idx) => {
                  const isActive = aspect === item.value && cropShape === item.shape;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setAspect(item.value);
                        setCropShape(item.shape);
                      }}
                      className={`px-3 py-1.2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {item.shape === 'round' ? <Circle size={12} /> : <Square size={12} />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                    showGrid ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Toggle Grid Lines"
                >
                  <Layers size={15} />
                </button>
              </div>
            </div>

            {/* Cropper Work Area with Direct Filter Application */}
            <div className="absolute inset-0 z-10 cropper-studio-container">
              {imageSrc ? (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  cropShape={cropShape}
                  showGrid={showGrid}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  style={{
                    mediaStyle: {
                      filter: currentFilterCss,
                      WebkitFilter: currentFilterCss,
                    },
                  }}
                  mediaProps={{
                    style: {
                      filter: currentFilterCss,
                      WebkitFilter: currentFilterCss,
                    },
                  }}
                  classes={{
                    containerClassName: 'w-full h-full',
                  }}
                />
              ) : (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                    <Upload size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-100">
                      {language === 'en' ? 'Click or Drag & Drop Image Here' : 'Klik atau Tarik & Lepas Foto di sini'}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Supports PNG, JPG, WEBP, GIF, SVG
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Floating Transformation Quick Controls */}
            {imageSrc && (
              <div className="z-30 mt-auto flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-xl">
                {/* Zoom Level Control */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1">
                    <ZoomIn size={13} />
                    <span>Zoom</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="w-24 sm:w-32 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-rose-400 w-8">{zoom.toFixed(1)}x</span>
                </div>

                {/* Rotation Control */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1">
                    <RotateCw size={13} />
                    <span>Rotate</span>
                  </span>
                  <button
                    onClick={() => setRotation(r => (r - 90 < -180 ? r - 90 + 360 : r - 90))}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                    title="Rotate -90°"
                  >
                    <RotateCcw size={13} />
                  </button>
                  <span className="text-xs font-mono font-bold text-rose-400 w-9 text-center">{rotation}°</span>
                  <button
                    onClick={() => setRotation(r => (r + 90 > 180 ? r + 90 - 360 : r + 90))}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                    title="Rotate +90°"
                  >
                    <RotateCw size={13} />
                  </button>
                </div>

                {/* Flip Toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      flip.horizontal
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <FlipHorizontal size={13} />
                    <span className="hidden sm:inline">Flip H</span>
                  </button>
                  <button
                    onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      flip.vertical
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <FlipVertical size={13} />
                    <span className="hidden sm:inline">Flip V</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sample Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-bold text-stone-600 dark:text-zinc-400 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Sample Photos:' : 'Foto Contoh:'}</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setImageSrc(sample.url);
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                    setRotation(0);
                    setFlip({ horizontal: false, vertical: false });
                    setFilters(DEFAULT_FILTERS);
                    setActivePreset('normal');
                  }}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200 dark:border-zinc-700 transition-all"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Modern Studio Editing Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Studio Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-stone-200/80 dark:bg-zinc-900 p-1.5 rounded-2xl border border-stone-300/60 dark:border-zinc-800 shadow-xs">
            <button
              onClick={() => setControlTab('adjust')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                controlTab === 'adjust'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <Wand2 size={14} />
              <span>Filters & Color</span>
            </button>

            <button
              onClick={() => setControlTab('crop')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                controlTab === 'crop'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <Crop size={14} />
              <span>Crop & Aspect</span>
            </button>

            <button
              onClick={() => setControlTab('export')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                controlTab === 'export'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <Download size={14} />
              <span>Live Result</span>
            </button>
          </div>

          {/* TAB 1: FILTERS & COLOR ADJUSTMENTS */}
          {controlTab === 'adjust' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Filter Preset Cards */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    <Sparkles size={14} />
                    <span>Filter Presets</span>
                  </div>
                  {activePreset !== 'normal' && (
                    <button
                      onClick={() => {
                        setFilters(DEFAULT_FILTERS);
                        setActivePreset('normal');
                      }}
                      className="text-[11px] font-bold text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <ResetIcon size={11} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {FILTER_PRESETS.map((preset) => {
                    const isSelected = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'border-rose-500 bg-rose-500/10 shadow-xs ring-1 ring-rose-500'
                            : 'border-stone-200 dark:border-zinc-800 bg-stone-50/60 dark:bg-zinc-950/40 hover:border-stone-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-full h-8 rounded-xl bg-gradient-to-r ${preset.colorBg} mb-1.5 shadow-xs group-hover:scale-105 transition-transform`} />
                        <div className="text-xs font-extrabold text-stone-900 dark:text-zinc-100 truncate">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-zinc-400 truncate font-medium">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lighting & Tone Fine-Tuning Sliders */}
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    <SlidersHorizontal size={14} />
                    <span>Lighting & Tone Controls</span>
                  </div>
                </div>

                {/* Brightness */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Sun size={14} className="text-amber-500" />
                      <span>{language === 'en' ? 'Brightness' : 'Kecerahan'}</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{filters.brightness}%</span>
                      {filters.brightness !== 100 && (
                        <button onClick={() => resetSingleFilter('brightness')} className="text-stone-400 hover:text-rose-500">
                          <ResetIcon size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={filters.brightness}
                    onChange={e => updateFilter('brightness', parseInt(e.target.value))}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Contrast size={14} className="text-purple-500" />
                      <span>{language === 'en' ? 'Contrast' : 'Kontras'}</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{filters.contrast}%</span>
                      {filters.contrast !== 100 && (
                        <button onClick={() => resetSingleFilter('contrast')} className="text-stone-400 hover:text-rose-500">
                          <ResetIcon size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={filters.contrast}
                    onChange={e => updateFilter('contrast', parseInt(e.target.value))}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Palette size={14} className="text-rose-500" />
                      <span>{language === 'en' ? 'Saturation' : 'Saturasi Warna'}</span>
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{filters.saturate}%</span>
                      {filters.saturate !== 100 && (
                        <button onClick={() => resetSingleFilter('saturate')} className="text-stone-400 hover:text-rose-500">
                          <ResetIcon size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={filters.saturate}
                    onChange={e => updateFilter('saturate', parseInt(e.target.value))}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span>{language === 'en' ? 'Blur Effect' : 'Efek Blur'}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{filters.blur}px</span>
                      {filters.blur !== 0 && (
                        <button onClick={() => resetSingleFilter('blur')} className="text-stone-400 hover:text-rose-500">
                          <ResetIcon size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={filters.blur}
                    onChange={e => updateFilter('blur', parseFloat(e.target.value))}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Hue Shift */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span>{language === 'en' ? 'Hue Color Shift' : 'Pergeseran Hue'}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{filters.hueRotate}°</span>
                      {filters.hueRotate !== 0 && (
                        <button onClick={() => resetSingleFilter('hueRotate')} className="text-stone-400 hover:text-rose-500">
                          <ResetIcon size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={filters.hueRotate}
                    onChange={e => updateFilter('hueRotate', parseInt(e.target.value))}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Grayscale & Sepia */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100 dark:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 dark:text-zinc-300">
                      <span>Grayscale</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{filters.grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={filters.grayscale}
                      onChange={e => updateFilter('grayscale', parseInt(e.target.value))}
                      className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 dark:text-zinc-300">
                      <span>Sepia Tone</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{filters.sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={filters.sepia}
                      onChange={e => updateFilter('sepia', parseInt(e.target.value))}
                      className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CROP & ASPECT RATIO */}
          {controlTab === 'crop' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-2 border-b border-stone-100 dark:border-zinc-800">
                  <Crop size={14} />
                  <span>Presets Aspect Ratio</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map((item, idx) => {
                    const isActive = aspect === item.value && cropShape === item.shape;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setAspect(item.value);
                          setCropShape(item.shape);
                        }}
                        className={`p-3 rounded-2xl border text-xs font-extrabold text-left transition-all flex items-center justify-between ${
                          isActive
                            ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-rose-500'
                            : 'border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/40 text-stone-700 dark:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.shape === 'round' ? (
                          <Circle size={15} className="shrink-0 text-rose-500" />
                        ) : (
                          <Square size={15} className="shrink-0 opacity-60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE RESULT PREVIEW & EXPORT STUDIO */}
          {controlTab === 'export' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-2 border-b border-stone-100 dark:border-zinc-800">
                <Eye size={14} />
                <span>Live Cropped Result</span>
              </div>

              {/* Real-time Result Output Image Container */}
              {croppedResult ? (
                <div className="space-y-3">
                  <div className="relative w-full h-48 rounded-2xl bg-zinc-950 border border-stone-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-2 group shadow-inner">
                    <img
                      src={croppedResult.url}
                      alt="Cropped Result Preview"
                      className={`max-h-full max-w-full object-contain ${
                        cropShape === 'round' ? 'rounded-full' : 'rounded-lg'
                      }`}
                    />
                    <div className="absolute top-2 right-2 bg-zinc-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-300 font-bold border border-white/10">
                      {croppedResult.width} × {croppedResult.height} px
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-2xl bg-stone-50 dark:bg-zinc-950/70 border border-stone-200 dark:border-zinc-800">
                    <div>
                      <span className="text-stone-400 dark:text-zinc-500 block text-[10px]">FILE SIZE</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {(croppedResult.blob.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 dark:text-zinc-500 block text-[10px]">FORMAT</span>
                      <span className="font-bold text-stone-900 dark:text-zinc-100 uppercase">
                        {outputFormat.split('/')[1]}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400 dark:text-zinc-500 font-medium">
                  Generating output preview...
                </div>
              )}

              {/* Format Selection */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-zinc-800">
                <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 block">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
                  {(['image/png', 'image/jpeg', 'image/webp'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        outputFormat === fmt
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {fmt.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider (JPEG/WEBP) */}
              {outputFormat !== 'image/png' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span>Export Quality</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!croppedResult || isProcessing}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {downloadSuccess ? <CheckCircle2 size={16} /> : <Download size={16} />}
                  <span>
                    {downloadSuccess
                      ? language === 'en'
                        ? 'Downloaded!'
                        : 'Berhasil Diunduh!'
                      : language === 'en'
                      ? 'Download Edited Photo'
                      : 'Unduh Hasil Foto'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyImage}
                    disabled={!croppedResult || isProcessing}
                    className="py-2.5 px-3 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {copiedImage ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedImage ? 'Copied' : 'Copy Image'}</span>
                  </button>

                  <button
                    onClick={handleCopyBase64}
                    disabled={!croppedResult || isProcessing}
                    className="py-2.5 px-3 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {copiedBase64 ? <Check size={14} /> : <FileCode size={14} />}
                    <span>{copiedBase64 ? 'Copied' : 'Copy Base64'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
