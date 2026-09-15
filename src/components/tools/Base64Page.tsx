import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Binary,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowRightLeft,
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  BarChart2,
  Sparkles,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Code,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UTF-8 safe base64 helpers
function utf8ToBase64(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch {
    return 'Error encoding string';
  }
}

function base64ToUtf8(str: string): string {
  try {
    const cleanStr = str.trim().replace(/^data:.*?;base64,/, '');
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(cleanStr), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return 'Invalid Base64 string';
  }
}

const BASE64_PRESETS = [
  {
    name: 'Emoji & Unicode Text',
    nameId: 'Teks Emoji & Unicode',
    type: 'encode',
    text: 'Hello, World! 🚀 Powered by React 19 & TypeScript ✨ 2026',
  },
  {
    name: 'Sample SVG Data URI',
    nameId: 'Contoh Data URI SVG',
    type: 'decode',
    text: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlMTFkNDgiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTEyIDJ2MjBNMTcgNXZ4NE03IDV2MTRNOSA5aDZNOSAxNWg2Ii8+PC9zdmc+',
  },
  {
    name: 'Config JSON Payload',
    nameId: 'Payload Konfigurasi JSON',
    type: 'encode',
    text: '{"app": "DevStudio", "version": "3.2.0", "active": true, "env": "production"}',
  },
];

export const Base64Page: React.FC = () => {
  const { language } = usePortfolio();
  const [mode, setMode] = useState<'encode' | 'decode' | 'file'>('encode');
  const [input, setInput] = useState<string>(
    'Hello World! Welcome to Muchamad Irvan Developer Tools & Utility Studio.'
  );
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'text' | 'analysis'>('text');

  // File Upload State
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);

  // Computed Conversion
  const output = useMemo(() => {
    if (mode === 'encode') {
      let b64 = utf8ToBase64(input);
      if (urlSafe) {
        b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      return b64;
    } else if (mode === 'decode') {
      let rawB64 = input;
      if (urlSafe) {
        rawB64 = rawB64.replace(/-/g, '+').replace(/_/g, '/');
        while (rawB64.length % 4) {
          rawB64 += '=';
        }
      }
      return base64ToUtf8(rawB64);
    }
    return fileDataUri;
  }, [input, mode, urlSafe, fileDataUri]);

  // Detected Image or SVG preview for decoded data
  const detectedPreviewType = useMemo(() => {
    const raw = (mode === 'decode' ? output : input).trim();
    if (raw.startsWith('<svg') && raw.endsWith('</svg>')) return 'svg';
    if (fileDataUri && fileType.startsWith('image/')) return 'image';
    return null;
  }, [output, input, mode, fileDataUri, fileType]);

  // Base64 Analytics
  const stats = useMemo(() => {
    const rawInputBytes = new TextEncoder().encode(input).length;
    const base64Length = mode === 'encode' ? output.length : input.length;
    const paddingCount = (mode === 'encode' ? output : input).split('=').length - 1;
    const inflation = rawInputBytes > 0 ? Math.round(((base64Length - rawInputBytes) / rawInputBytes) * 100) : 33;

    return {
      rawInputBytes,
      base64Length,
      paddingCount,
      inflation: inflation > 0 ? `+${inflation}%` : `${inflation}%`,
    };
  }, [input, output, mode]);

  const handleSwap = () => {
    if (mode === 'encode') {
      setMode('decode');
      setInput(output);
    } else if (mode === 'decode') {
      setMode('encode');
      setInput(output);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = mode === 'encode' ? 'encoded.b64' : 'decoded.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'Interactive Base64 Encoder, Decoder & Media Studio — Tools'
            : 'Enkoder & Dekoder Base64, Media Studio Interaktif — Tools'
        }
        description={
          language === 'en'
            ? 'Encode text and files to Base64, decode Base64 strings with live SVG & image visualizer, URL-safe toggle, and memory inflation analytics.'
            : 'Enkode teks & berkas ke Base64, dekode string Base64 dengan penampil media SVG/gambar langsung, mode URL-safe, dan analisis rasio ukuran data.'
        }
        url="/tools/base64"
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-500 font-mono">
        <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
          {language === 'en' ? 'Home' : 'Beranda'}
        </Link>
        <span>/</span>
        <Link to="/tools" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
          {language === 'en' ? 'Tools' : 'Perkakas'}
        </Link>
        <span>/</span>
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">Base64 Converter</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Binary size={14} />
            <span>{language === 'en' ? 'Data Transfer & Binary Encoding' : 'Enkoding Biner & Format Data'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            Base64 Encoder & Decoder
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Convert text and media files into Base64 data URIs, inspect encoded byte inflation, preview embedded images and SVG vectors in real-time, with full UTF-8 support.'
              : 'Konversi teks dan berkas ke Base64 data URI, analisis rasio inflasi ukuran biner, pratinjau vektor SVG atau gambar langsung, dengan dukungan penuh UTF-8.'}
          </p>
        </div>

        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors shadow-xs self-start md:self-auto"
        >
          <ArrowLeft size={13} />
          <span>{language === 'en' ? 'All Tools' : 'Semua Perkakas'}</span>
        </Link>
      </div>

      {/* Mode & Presets Quick Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
          {[
            { id: 'encode', label: language === 'en' ? 'Encode Text' : 'Enkode Teks' },
            { id: 'decode', label: language === 'en' ? 'Decode Base64' : 'Dekode Base64' },
            { id: 'file', label: language === 'en' ? 'File to Base64' : 'Berkas Media' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === tab.id
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 font-mono text-[11px]">
            {language === 'en' ? 'Presets:' : 'Contoh:'}
          </span>
          {BASE64_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMode(p.type as any);
                setInput(p.text);
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-900/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300"
            >
              {language === 'en' ? p.name : p.nameId}
            </button>
          ))}
        </div>

        {/* Options */}
        {mode !== 'file' && (
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={e => setUrlSafe(e.target.checked)}
                className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="font-mono text-[11px]">URL-Safe (- / _)</span>
            </label>

            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors"
              title="Swap"
            >
              <ArrowRightLeft size={13} />
              <span>Swap</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats & Inflation Metric Card */}
      {mode !== 'file' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] text-stone-500 block font-medium">Raw Bytes (UTF-8)</span>
            <span className="font-mono font-bold text-stone-900 dark:text-zinc-100 text-sm">
              {stats.rawInputBytes} bytes
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] text-stone-500 block font-medium">Base64 Length</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
              {stats.base64Length} chars
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] text-stone-500 block font-medium">Size Inflation</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
              {stats.inflation} (4/3 ratio)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
            <span className="text-[11px] text-stone-500 block font-medium">Padding '=' Chars</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {stats.paddingCount} {stats.paddingCount === 1 ? 'pad' : 'pads'}
            </span>
          </div>
        </div>
      )}

      {/* Main Conversion View */}
      {mode === 'file' ? (
        /* File Upload View */
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="space-y-2 text-center max-w-md mx-auto">
            <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-rose-600 bg-stone-50/50 dark:bg-zinc-950/50 cursor-pointer transition-colors group">
              <Upload size={32} className="text-stone-400 group-hover:scale-110 group-hover:text-rose-500 transition-all mb-2" />
              <span className="text-xs font-semibold text-stone-900 dark:text-zinc-100">
                {language === 'en' ? 'Click or drag file to encode to Base64' : 'Klik atau seret berkas untuk dienkode'}
              </span>
              <span className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1">
                PNG, JPG, SVG, WEBP, PDF, TXT (Max 5MB recommended)
              </span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {fileDataUri && (
            <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                  <strong>{fileName}</strong> ({fileType || 'Unknown type'}) • {Math.round(fileSize / 1024)} KB
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied Data URI' : 'Copy Data URI'}</span>
                </button>
              </div>

              {fileType.startsWith('image/') && (
                <div className="p-4 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-200 dark:border-zinc-800 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                    Interactive Image Preview
                  </span>
                  <img src={fileDataUri} alt="Preview" className="max-h-56 object-contain rounded-lg shadow-xs" />
                </div>
              )}

              <textarea
                readOnly
                value={fileDataUri}
                rows={8}
                className="w-full p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs font-mono leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-hidden"
              />
            </div>
          )}
        </div>
      ) : (
        /* Text Dual View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Input Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                {mode === 'encode' ? (language === 'en' ? 'Input Plain Text' : 'Teks Biasa') : 'Base64 Input'}
              </label>
              <button
                onClick={() => setInput('')}
                className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                title="Clear"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string to decode...'}
              rows={14}
              className="w-full p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs font-mono leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 resize-none"
            />
          </div>

          {/* Output Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                {mode === 'encode' ? 'Base64 Encoded Output' : (language === 'en' ? 'Decoded Text' : 'Hasil Dekode')}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white transition-colors"
                  title="Download"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={output}
              rows={14}
              className="w-full p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs font-mono leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-hidden select-all resize-none"
            />

            {/* If SVG detected in output, render preview */}
            {detectedPreviewType === 'svg' && (
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-mono font-bold text-stone-500 uppercase tracking-wider block">
                  Rendered SVG Vector Preview
                </span>
                <div
                  className="flex items-center justify-center p-3 bg-white dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-800"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
