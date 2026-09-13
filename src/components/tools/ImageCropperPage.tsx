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
  Download,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Sparkles,
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
  RotateCcw as ResetIcon,
  Eye,
  Sliders,
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
  const [sidebarTab, setSidebarTab] = useState<'crop' | 'filter' | 'adjust' | 'export'>('crop');

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
    link.download = `photo-studio-${Date.now()}.${ext}`;
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
    { label: '4:3 Photo', value: 4 / 3, shape: 'rect' as const },
    { label: '16:9 Banner', value: 16 / 9, shape: 'rect' as const },
    { label: '9:16 Story', value: 9 / 16, shape: 'rect' as const },
    { label: '3:2 Camera', value: 3 / 2, shape: 'rect' as const },
    { label: 'Free Aspect', value: undefined, shape: 'rect' as const },
  ];

  const currentFilterCss = getFilterString(filters);

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] pt-16 flex flex-col bg-zinc-950 text-zinc-100 select-none font-sans">
      <Seo
        title={language === 'en' ? 'Full Width Image Editor & Cropper Studio' : 'Editor Foto Modern Fullwidth & Crop'}
        description={
          language === 'en'
            ? 'Professional full-width photo studio editor with un-obscured interactive canvas, live CSS filters, lighting controls, avatar masks, and high-res export.'
            : 'Studio editor foto modern profesional lebar penuh dengan kanvas bebas hambatan, filter warna real-time, pengatur kecerahan & kontras, serta ekspor PNG, WEBP, JPEG.'
        }
        url="/tools/image-cropper"
      />

      {/* TOP STUDIO TOOLBAR */}
      <header className="w-full px-4 sm:px-6 py-3 bg-zinc-900 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700 shrink-0"
            title={language === 'en' ? 'Back to Tools' : 'Kembali ke Perkakas'}
          >
            <ArrowLeft size={15} />
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-100 font-mono">
              Modern Image Studio
            </h1>
          </div>

          {croppedResult && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="text-zinc-200 font-bold">{croppedResult.width} × {croppedResult.height} px</span>
              <span className="opacity-40">•</span>
              <span className="text-rose-400 font-bold">{(croppedResult.blob.size / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Sample Photo Buttons */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            <span className="text-[11px] font-bold text-zinc-400">Sample:</span>
            {SAMPLE_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setImageSrc(sample.url);
                  handleReset();
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
              >
                {sample.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-zinc-700"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Reset</span>
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
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold flex items-center gap-1.5 transition-colors border border-zinc-700"
          >
            <Upload size={13} />
            <span>Upload</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!croppedResult || isProcessing}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {downloadSuccess ? <CheckCircle2 size={15} /> : <Download size={15} />}
            <span>{downloadSuccess ? 'Downloaded!' : 'Export Photo'}</span>
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE split into Un-obscured Canvas + Dedicated Studio Sidebar */}
      <div className="w-full flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* CENTER UN-OBSCURED CANVAS VIEWPORT */}
        <main className="flex-1 relative bg-zinc-950 min-h-[420px] lg:min-h-[calc(100vh-9.5rem)] flex items-center justify-center overflow-hidden">
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
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#09090b',
                },
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
            />
          ) : (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center text-center p-8 space-y-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-2xl">
                <Upload size={36} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-extrabold text-zinc-100">
                  Click or Drag & Drop Image Here
                </p>
                <p className="text-xs text-zinc-400">
                  Supports High-Resolution PNG, JPG, WEBP, GIF, SVG
                </p>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT DEDICATED STUDIO INSPECTOR PANEL */}
        <aside className="w-full lg:w-[380px] bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col h-auto lg:h-[calc(100vh-9.5rem)] shrink-0 overflow-hidden">
          {/* Navigation Studio Tabs */}
          <div className="grid grid-cols-4 bg-zinc-950 p-1 border-b border-zinc-800 shrink-0">
            <button
              onClick={() => setSidebarTab('crop')}
              className={`py-2.5 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                sidebarTab === 'crop'
                  ? 'bg-rose-600 text-white shadow-sm rounded-xl'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Crop size={14} />
              <span className="text-[10px]">Crop</span>
            </button>

            <button
              onClick={() => setSidebarTab('filter')}
              className={`py-2.5 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                sidebarTab === 'filter'
                  ? 'bg-rose-600 text-white shadow-sm rounded-xl'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles size={14} />
              <span className="text-[10px]">Filters</span>
            </button>

            <button
              onClick={() => setSidebarTab('adjust')}
              className={`py-2.5 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                sidebarTab === 'adjust'
                  ? 'bg-rose-600 text-white shadow-sm rounded-xl'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span className="text-[10px]">Adjust</span>
            </button>

            <button
              onClick={() => setSidebarTab('export')}
              className={`py-2.5 text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                sidebarTab === 'export'
                  ? 'bg-rose-600 text-white shadow-sm rounded-xl'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye size={14} />
              <span className="text-[10px]">Result</span>
            </button>
          </div>

          {/* TAB 1: CROP & TRANSFORM CONTROLS */}
          {sidebarTab === 'crop' && (
            <div className="p-4 space-y-5 overflow-y-auto flex-1 custom-scrollbar animate-in fade-in duration-150">
              {/* Aspect Ratio Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                  Aspect Ratio & Shape
                </label>
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
                        className={`p-2.5 rounded-xl border text-xs font-extrabold text-left transition-all flex items-center justify-between ${
                          isActive
                            ? 'border-rose-500 bg-rose-500/20 text-white shadow-xs ring-1 ring-rose-500'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.shape === 'round' ? (
                          <Circle size={13} className="shrink-0 text-rose-400" />
                        ) : (
                          <Square size={13} className="shrink-0 opacity-60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transformation Sliders (Zoom, Rotation, Flip) */}
              <div className="space-y-4 pt-3 border-t border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                  Transformations
                </label>

                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn size={13} className="text-zinc-400" />
                      <span>Zoom Level</span>
                    </span>
                    <span className="font-mono text-rose-400 font-bold">{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Rotation Slider & Quick 90° Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <RotateCw size={13} className="text-zinc-400" />
                      <span>Rotation</span>
                    </span>
                    <span className="font-mono text-rose-400 font-bold">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value) || 0)}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setRotation(r => (r - 90 < -180 ? r - 90 + 360 : r - 90))}
                      className="flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-zinc-700"
                    >
                      <RotateCcw size={13} />
                      <span>-90°</span>
                    </button>
                    <button
                      onClick={() => setRotation(r => (r + 90 > 180 ? r + 90 - 360 : r + 90))}
                      className="flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-zinc-700"
                    >
                      <RotateCw size={13} />
                      <span>+90°</span>
                    </button>
                  </div>
                </div>

                {/* Flip Axis & Grid Toggle */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs font-bold text-zinc-400 block">
                    Flip & Grid Options
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        flip.horizontal
                          ? 'border-rose-500 bg-rose-500/20 text-white'
                          : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <FlipHorizontal size={14} />
                      <span>Flip H</span>
                    </button>
                    <button
                      onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        flip.vertical
                          ? 'border-rose-500 bg-rose-500/20 text-white'
                          : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <FlipVertical size={14} />
                      <span>Flip V</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      showGrid
                        ? 'border-rose-500 bg-rose-600 text-white'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Layers size={14} />
                    <span>{showGrid ? 'Grid Lines: Visible' : 'Grid Lines: Hidden'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILTERS */}
          {sidebarTab === 'filter' && (
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Preset Color Filters</span>
                </span>
                {activePreset !== 'normal' && (
                  <button
                    onClick={() => {
                      setFilters(DEFAULT_FILTERS);
                      setActivePreset('normal');
                    }}
                    className="text-[11px] font-bold text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <ResetIcon size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {FILTER_PRESETS.map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/20 ring-1 ring-rose-500'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-xl bg-gradient-to-r ${preset.colorBg} mb-1.5 shadow-xs`} />
                      <div className="text-xs font-extrabold text-zinc-100 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate font-medium">
                        {preset.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LIGHTING & TONE ADJUSTMENTS */}
          {sidebarTab === 'adjust' && (
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar animate-in fade-in duration-150">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block pb-2 border-b border-zinc-800">
                Lighting & Color Sliders
              </span>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Sun size={13} className="text-amber-400" />
                    <span>Brightness</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-rose-400">{filters.brightness}%</span>
                    {filters.brightness !== 100 && (
                      <button onClick={() => resetSingleFilter('brightness')} className="text-zinc-500 hover:text-rose-400">
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
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Contrast size={13} className="text-purple-400" />
                    <span>Contrast</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-rose-400">{filters.contrast}%</span>
                    {filters.contrast !== 100 && (
                      <button onClick={() => resetSingleFilter('contrast')} className="text-zinc-500 hover:text-rose-400">
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
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Palette size={13} className="text-rose-400" />
                    <span>Saturation</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-rose-400">{filters.saturate}%</span>
                    {filters.saturate !== 100 && (
                      <button onClick={() => resetSingleFilter('saturate')} className="text-zinc-500 hover:text-rose-400">
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
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Blur */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span>Blur Softness</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-rose-400">{filters.blur}px</span>
                    {filters.blur !== 0 && (
                      <button onClick={() => resetSingleFilter('blur')} className="text-zinc-500 hover:text-rose-400">
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
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Hue Shift */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span>Hue Shift</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-rose-400">{filters.hueRotate}°</span>
                    {filters.hueRotate !== 0 && (
                      <button onClick={() => resetSingleFilter('hueRotate')} className="text-zinc-500 hover:text-rose-400">
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
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Grayscale & Sepia */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
                    <span>Grayscale</span>
                    <span className="font-mono text-rose-400">{filters.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.grayscale}
                    onChange={e => updateFilter('grayscale', parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
                    <span>Sepia Tone</span>
                    <span className="font-mono text-rose-400">{filters.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.sepia}
                    onChange={e => updateFilter('sepia', parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESULT PREVIEW & EXPORT */}
          {sidebarTab === 'export' && (
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar animate-in fade-in duration-150">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block pb-2 border-b border-zinc-800">
                Live Result Output
              </span>

              {croppedResult ? (
                <div className="space-y-3">
                  <div className="w-full h-44 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center p-2 shadow-inner">
                    <img
                      src={croppedResult.url}
                      alt="Cropped Result Preview"
                      className={`max-h-full max-w-full object-contain ${
                        cropShape === 'round' ? 'rounded-full' : 'rounded-lg'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">RESOLUTION</span>
                      <span className="font-bold text-zinc-100">
                        {croppedResult.width} × {croppedResult.height} px
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">FILE SIZE</span>
                      <span className="font-bold text-rose-400">
                        {(croppedResult.blob.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500">
                  Processing output preview...
                </div>
              )}

              {/* Format Selection */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300 block">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {(['image/png', 'image/jpeg', 'image/webp'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        outputFormat === fmt
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {fmt.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              {outputFormat !== 'image/png' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Export Quality</span>
                    <span className="font-mono text-rose-400 font-bold">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!croppedResult || isProcessing}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {downloadSuccess ? <CheckCircle2 size={16} /> : <Download size={16} />}
                  <span>{downloadSuccess ? 'Downloaded!' : 'Export Cropped Image'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyImage}
                    disabled={!croppedResult || isProcessing}
                    className="py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {copiedImage ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedImage ? 'Copied' : 'Copy Image'}</span>
                  </button>

                  <button
                    onClick={handleCopyBase64}
                    disabled={!croppedResult || isProcessing}
                    className="py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {copiedBase64 ? <Check size={14} /> : <FileCode size={14} />}
                    <span>{copiedBase64 ? 'Copied' : 'Base64'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
