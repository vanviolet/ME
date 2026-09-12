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
  filters: ImageFilters;
}

const FILTER_PRESETS: PresetFilter[] = [
  { id: 'normal', name: 'Normal', filters: DEFAULT_FILTERS },
  { id: 'vintage', name: 'Vintage', filters: { ...DEFAULT_FILTERS, sepia: 60, contrast: 110, brightness: 95 } },
  { id: 'bw', name: 'B & W', filters: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 125 } },
  { id: 'warm', name: 'Warm Sunset', filters: { ...DEFAULT_FILTERS, sepia: 25, saturate: 140, brightness: 105 } },
  { id: 'cyber', name: 'Cool Cyber', filters: { ...DEFAULT_FILTERS, hueRotate: 180, saturate: 130, contrast: 110 } },
  { id: 'dramatic', name: 'Dramatic', filters: { ...DEFAULT_FILTERS, contrast: 150, saturate: 120, brightness: 85 } },
  { id: 'emerald', name: 'Emerald Soft', filters: { ...DEFAULT_FILTERS, hueRotate: 80, saturate: 110, brightness: 105 } },
  { id: 'invert', name: 'Negative', filters: { ...DEFAULT_FILTERS, invert: 100 } },
  { id: 'soft', name: 'Pastel Dream', filters: { ...DEFAULT_FILTERS, brightness: 110, saturate: 85, contrast: 90 } },
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

  // Active Control Panel Tab
  const [controlTab, setControlTab] = useState<'crop' | 'adjust' | 'export'>('crop');

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

  // Generate Cropped Image Preview
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

  // Auto update preview when crop changes or controls shift
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleGenerateCrop();
    }, 200);
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
    link.download = `cropped-image-${Date.now()}.${ext}`;
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

  // Aspect ratio option list
  const ASPECT_RATIOS = [
    { label: '1:1 (Square / Avatar)', value: 1, shape: 'rect' as const },
    { label: 'Circle Avatar', value: 1, shape: 'round' as const },
    { label: '4:3 (Standard Photo)', value: 4 / 3, shape: 'rect' as const },
    { label: '16:9 (Banner / YouTube)', value: 16 / 9, shape: 'rect' as const },
    { label: '9:16 (Story / Reels)', value: 9 / 16, shape: 'rect' as const },
    { label: '3:2 (Camera)', value: 3 / 2, shape: 'rect' as const },
    { label: 'Free (Custom)', value: undefined, shape: 'rect' as const },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'Image Cropper & Filter Editor — Powerful Tool' : 'Potong & Filter Gambar Online — Tool Crop & Edit Foto Powerful'}
        description={
          language === 'en'
            ? 'Crop, rotate, flip, zoom, apply filters, adjust brightness, contrast, saturation, and export high-resolution PNG, WEBP, JPEG images.'
            : 'Potong, putar, balikkan, atur kecerahan, kontras, saturasi, filter warna foto online dengan konversi PNG, WEBP, JPEG.'
        }
        url="/tools/image-cropper"
      />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-500 font-mono">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
            {language === 'en' ? 'Home' : 'Beranda'}
          </Link>
          <span>/</span>
          <Link to="/tools" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
            {language === 'en' ? 'Tools' : 'Perkakas'}
          </Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-zinc-100 font-medium">Image Cropper & Editor</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-xs">
                <Crop size={18} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                Powerful Image Cropper & Editor
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 pt-1">
              {language === 'en'
                ? 'Precision interactive cropping, rotation, zoom, color filters, brightness & contrast adjustments, and instant export.'
                : 'Tool potong & edit foto interaktif dengan filter warna, kecerahan, kontras, saturasi, mask avatar, dan ekspor instan.'}
            </p>
          </div>

          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900/50 text-xs font-medium transition-colors shadow-xs self-start sm:self-auto"
          >
            <ArrowLeft size={13} />
            <span>{language === 'en' ? 'All Tools' : 'Semua Perkakas'}</span>
          </Link>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Cropper Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="relative w-full h-[400px] sm:h-[520px] rounded-3xl bg-zinc-950 overflow-hidden border border-stone-200 dark:border-zinc-800 shadow-xl group"
          >
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
                mediaProps={{
                  style: {
                    filter: getFilterString(filters),
                  },
                }}
                classes={{
                  containerClassName: 'w-full h-full',
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <Upload size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-100">
                    {language === 'en' ? 'Drag & Drop your image here' : 'Tarik & lepas berkas foto di sini'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {language === 'en' ? 'Supports PNG, JPG, WEBP, GIF, SVG' : 'Mendukung format PNG, JPG, WEBP, GIF, SVG'}
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {language === 'en' ? 'Browse Files' : 'Pilih Foto'}
                </button>
              </div>
            )}

            {/* Canvas Floating Quick Controls */}
            {imageSrc && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg z-20">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                    showGrid
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title={language === 'en' ? 'Toggle Grid Lines' : 'Beralih Garis Kisi'}
                >
                  <Layers size={15} />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title={language === 'en' ? 'Reset All Adjustments' : 'Reset Semua Pengaturan'}
                >
                  <RefreshCw size={15} />
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
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors"
                >
                  <Upload size={13} />
                  <span>{language === 'en' ? 'Change Image' : 'Ganti Foto'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Sample Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
            <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Or try with sample images:' : 'Atau coba foto contoh:'}</span>
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
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 border border-stone-200 dark:border-zinc-700 transition-all"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-tab Controls & Export */}
        <div className="lg:col-span-5 space-y-4">
          {/* Navigation Control Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-xs">
            <button
              onClick={() => setControlTab('crop')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                controlTab === 'crop'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <Crop size={14} />
              <span>{language === 'en' ? 'Crop & Transform' : 'Potong & Putar'}</span>
            </button>

            <button
              onClick={() => setControlTab('adjust')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                controlTab === 'adjust'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <Wand2 size={14} />
              <span>{language === 'en' ? 'Filters & Color' : 'Filter & Warna'}</span>
            </button>

            <button
              onClick={() => setControlTab('export')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                controlTab === 'export'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <Download size={14} />
              <span>{language === 'en' ? 'Export File' : 'Unduh File'}</span>
            </button>
          </div>

          {/* TAB 1: CROP & TRANSFORM CONTROLS */}
          {controlTab === 'crop' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Aspect Ratio & Shape Presets */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-2 border-b border-stone-100 dark:border-zinc-800">
                  <Crop size={14} />
                  <span>{language === 'en' ? 'Aspect Ratio & Shape' : 'Rasio Aspek & Bentuk'}</span>
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
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                          isActive
                            ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs'
                            : 'border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/40 text-stone-700 dark:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.shape === 'round' ? (
                          <Circle size={14} className="shrink-0 text-rose-500" />
                        ) : (
                          <Square size={14} className="shrink-0 opacity-60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transformation Sliders (Zoom, Rotation, Flip) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-2 border-b border-stone-100 dark:border-zinc-800">
                  <Sliders size={14} />
                  <span>{language === 'en' ? 'Transformations' : 'Transformasi Gambar'}</span>
                </div>

                {/* Zoom Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn size={13} className="text-stone-400" />
                      <span>Zoom Level</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Rotation Slider & Quick 90° Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <RotateCw size={13} className="text-stone-400" />
                      <span>Rotation</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotation}
                    onChange={e => setRotation(parseInt(e.target.value) || 0)}
                    className="w-full accent-rose-600 dark:accent-rose-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-800 rounded-lg"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setRotation(r => (r - 90 < -180 ? r - 90 + 360 : r - 90))}
                      className="flex-1 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <RotateCcw size={13} />
                      <span>-90°</span>
                    </button>
                    <button
                      onClick={() => setRotation(r => (r + 90 > 180 ? r + 90 - 360 : r + 90))}
                      className="flex-1 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <RotateCw size={13} />
                      <span>+90°</span>
                    </button>
                  </div>
                </div>

                {/* Flip Controls */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-zinc-800">
                  <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
                    Flip Axis
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        flip.horizontal
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                      }`}
                    >
                      <FlipHorizontal size={14} />
                      <span>Flip Horizontal</span>
                    </button>
                    <button
                      onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        flip.vertical
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                      }`}
                    >
                      <FlipVertical size={14} />
                      <span>Flip Vertical</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILTERS & COLOR ADJUSTMENTS */}
          {controlTab === 'adjust' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Presets Grid */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    <Sparkles size={14} />
                    <span>{language === 'en' ? 'Filter Presets' : 'Preset Filter Warna'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setFilters(DEFAULT_FILTERS);
                      setActivePreset('normal');
                    }}
                    className="text-[11px] font-semibold text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {FILTER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        activePreset === preset.id
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs'
                          : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950/40 text-stone-700 dark:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Precise Color Adjustments */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-2 border-b border-stone-100 dark:border-zinc-800">
                  <SlidersHorizontal size={14} />
                  <span>{language === 'en' ? 'Lighting & Color Sliders' : 'Pengaturan Pencahayaan'}</span>
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Sun size={13} className="text-stone-400" />
                      <span>{language === 'en' ? 'Brightness' : 'Kecerahan'}</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{filters.brightness}%</span>
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
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Contrast size={13} className="text-stone-400" />
                      <span>{language === 'en' ? 'Contrast' : 'Kontras'}</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{filters.contrast}%</span>
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
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Palette size={13} className="text-stone-400" />
                      <span>{language === 'en' ? 'Saturation' : 'Saturasi Warna'}</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{filters.saturate}%</span>
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
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span>{language === 'en' ? 'Blur Softness' : 'Efek Blur'}</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{filters.blur}px</span>
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

                {/* Hue Rotate */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span>{language === 'en' ? 'Hue Color Shift' : 'Pergeseran Hue'}</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{filters.hueRotate}°</span>
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
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
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
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
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

          {/* TAB 3: EXPORT & DOWNLOAD */}
          {controlTab === 'export' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 pb-2 border-b border-stone-100 dark:border-zinc-800">
                <Download size={14} />
                <span>{language === 'en' ? 'Export Format & Download' : 'Format Ekspor & Unduh'}</span>
              </div>

              {/* Format Selection */}
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

              {/* Quality Slider (JPEG/WEBP) */}
              {outputFormat !== 'image/png' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    <span>Image Quality</span>
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

              {/* Result Preview Stats */}
              {croppedResult && (
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950/60 border border-stone-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-600 dark:text-zinc-400">
                    <span>Resolution:</span>
                    <span className="font-bold text-stone-900 dark:text-zinc-100">
                      {croppedResult.width} × {croppedResult.height} px
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-stone-600 dark:text-zinc-400">
                    <span>File Size:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {(croppedResult.blob.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-stone-600 dark:text-zinc-400">
                    <span>Active Filter:</span>
                    <span className="font-bold text-stone-800 dark:text-zinc-200 uppercase text-[10px]">
                      {activePreset}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!croppedResult || isProcessing}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {downloadSuccess ? <CheckCircle2 size={15} /> : <Download size={15} />}
                  <span>
                    {downloadSuccess
                      ? language === 'en'
                        ? 'Downloaded!'
                        : 'Berhasil Diunduh!'
                      : language === 'en'
                      ? 'Download Cropped Image'
                      : 'Unduh Hasil Crop'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyImage}
                    disabled={!croppedResult || isProcessing}
                    className="py-2 px-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {copiedImage ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedImage ? 'Copied Image' : 'Copy Image'}</span>
                  </button>

                  <button
                    onClick={handleCopyBase64}
                    disabled={!croppedResult || isProcessing}
                    className="py-2 px-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {copiedBase64 ? <Check size={14} /> : <FileCode size={14} />}
                    <span>{copiedBase64 ? 'Copied Base64' : 'Copy Base64'}</span>
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
