import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileImage,
  Sparkles,
  Maximize2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { ExportSettings } from './types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseWidth: number;
  baseHeight: number;
  previewUrl: string | null;
  onExportDownload: (settings: ExportSettings) => Promise<void>;
  onExportClipboard: (settings: ExportSettings) => Promise<boolean>;
  onExportBase64: (settings: ExportSettings) => Promise<string>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  baseWidth,
  baseHeight,
  previewUrl,
  onExportDownload,
  onExportClipboard,
  onExportBase64,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg' | 'pdf'>('png');
  const [scale, setScale] = useState<number>(1);
  const [quality, setQuality] = useState<number>(0.95);
  const [fileName, setFileName] = useState<string>('photo-studio-design');
  const [transparentBg, setTransparentBg] = useState<boolean>(false);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [copiedBase64, setCopiedBase64] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentWidth = Math.round(baseWidth * scale);
  const currentHeight = Math.round(baseHeight * scale);

  const currentSettings: ExportSettings = {
    format,
    scale,
    quality,
    fileName: fileName || 'photo-studio-design',
    transparentBg,
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await onExportDownload(currentSettings);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    setIsExporting(true);
    try {
      const ok = await onExportClipboard(currentSettings);
      if (ok) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyBase64 = async () => {
    setIsExporting(true);
    try {
      const b64 = await onExportBase64(currentSettings);
      navigator.clipboard.writeText(b64);
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Download size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-100 font-sans">
                Export Photo Design
              </h2>
              <p className="text-xs text-zinc-400">
                High-Resolution Canvas Rendering & Vector Export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Preview & Resolution stats */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
            {previewUrl && (
              <div className="w-28 h-24 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center p-1 shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            )}
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Export Resolution ({scale}x Multiplier)
              </span>
              <div className="text-base font-extrabold font-mono text-zinc-100">
                {currentWidth} × {currentHeight} px
              </div>
              <p className="text-xs text-zinc-400">
                {scale === 1 && 'Standard 72-96 DPI web resolution'}
                {scale === 2 && 'Retina 2X High Density display crispness'}
                {scale === 3 && 'Ultra-HD 3X display & commercial print'}
                {scale === 4 && 'Maximum 4K Ultra Print Quality'}
              </p>
            </div>
          </div>

          {/* Export Format Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">File Format</label>
            <div className="grid grid-cols-5 gap-2">
              {(['png', 'jpeg', 'webp', 'svg', 'pdf'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all uppercase ${
                    format === fmt
                      ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Resolution Multiplier */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">Resolution Multiplier</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${
                    scale === s
                      ? 'border-purple-500 bg-purple-600 text-white shadow-sm'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                  }`}
                >
                  {s}x {s === 1 ? '(100%)' : s === 2 ? '(2K HD)' : s === 4 ? '(4K UHD)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG and WEBP) */}
          {(format === 'jpeg' || format === 'webp') && (
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                <span>Compression Quality</span>
                <span className="font-mono text-purple-400 font-bold">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={1.0}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          )}

          {/* File Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 block">File Name</label>
            <div className="flex items-center bg-zinc-950 rounded-xl border border-zinc-800 px-3 py-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="photo-studio-design"
                className="bg-transparent text-xs text-zinc-100 outline-none flex-1 font-mono"
              />
              <span className="text-xs font-mono text-zinc-500 uppercase">.{format}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700 disabled:opacity-50"
              title="Copy raster image to system clipboard"
            >
              {copiedImage ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedImage ? 'Copied Image!' : 'Copy Image'}</span>
            </button>

            <button
              onClick={handleCopyBase64}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700 disabled:opacity-50"
              title="Copy Base64 Data URL"
            >
              {copiedBase64 ? <Check size={14} className="text-emerald-400" /> : <Sparkles size={14} />}
              <span>{copiedBase64 ? 'Base64 Copied!' : 'Copy Base64'}</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <CheckCircle2 size={16} />
            ) : (
              <Download size={16} className="stroke-[2.5]" />
            )}
            <span>{downloadSuccess ? 'File Downloaded!' : `Download .${format.toUpperCase()}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
