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
  Maximize2,
  Minimize2,
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

// Main image cropping canvas generator
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
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
        outputFormat,
        quality
      );
      setCroppedResult(result);
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, flip, outputFormat, quality]);

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
        title={language === 'en' ? 'Image Cropper Tool — Powerful Online Image Editor' : 'Potong Gambar Online — Tool Crop & Edit Foto Powerful'}
        description={
          language === 'en'
            ? 'Crop, rotate, flip, zoom, and export high-resolution images with custom aspect ratios, circular avatar crops, and format conversions.'
            : 'Potong, putar, balikkan, zoom, dan potong foto gambar online dengan rasio aspek kustom, avatar lingkar, serta konversi PNG, WEBP, JPEG.'
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
          <span className="text-stone-900 dark:text-zinc-100 font-medium">Image Cropper</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-xs">
                <Crop size={18} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                Powerful Image Cropper
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 pt-1">
              {language === 'en'
                ? 'High-precision interactive cropping, rotation, zoom, circular masks, and instant PNG/WEBP/JPEG export.'
                : 'Tool potong foto interaktif presisi tinggi dengan rotasi, zoom, mask lingkaran avatar, dan ekspor instan.'}
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
        <div className="lg:col-span-8 space-y-4">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="relative w-full h-[400px] sm:h-[500px] rounded-3xl bg-zinc-950 overflow-hidden border border-stone-200 dark:border-zinc-800 shadow-xl group"
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
                  title={language === 'en' ? 'Reset Adjustments' : 'Reset Pengaturan'}
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
                  }}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/30 border border-stone-200 dark:border-zinc-700 transition-all"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controls, Presets & Result Export */}
        <div className="lg:col-span-4 space-y-6">
          {/* Preset Aspect Ratios */}
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

          {/* Export Settings & Output Result */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
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
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950/60 border border-stone-200 dark:border-zinc-800 space-y-2">
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
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
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
        </div>
      </div>
    </div>
  );
};
