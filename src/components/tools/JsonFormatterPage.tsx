import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Code2,
  Copy,
  Check,
  Download,
  Trash2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sliders,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_JSON = JSON.stringify(
  {
    name: "Muchamad Irvan",
    role: "Software Engineer",
    skills: ["TypeScript", "React", "Node.js", "Docker", "Cloud Architecture"],
    location: "Indonesia",
    activeProjects: 12,
    preferences: {
      theme: "dark",
      language: "id",
      notifications: true
    },
    metadata: {
      timestamp: "2026-09-12T10:00:00Z",
      status: "active"
    }
  },
  null,
  2
);

export const JsonFormatterPage: React.FC = () => {
  const { language } = usePortfolio();
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // Parsing & Validation
  const parsedState = useMemo(() => {
    if (!inputJson.trim()) {
      return { isValid: null, formatted: '', error: null, stats: null };
    }
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize);
      
      // Calculate Stats
      const getStats = (obj: any) => {
        let keysCount = 0;
        let maxDepth = 0;

        const traverse = (item: any, currentDepth: number) => {
          if (currentDepth > maxDepth) maxDepth = currentDepth;
          if (item && typeof item === 'object') {
            if (Array.isArray(item)) {
              item.forEach(i => traverse(i, currentDepth + 1));
            } else {
              const keys = Object.keys(item);
              keysCount += keys.length;
              keys.forEach(k => traverse(item[k], currentDepth + 1));
            }
          }
        };

        traverse(obj, 1);
        const byteSize = new Blob([formatted]).size;
        return { keysCount, maxDepth, byteSize };
      };

      return {
        isValid: true,
        formatted,
        error: null,
        stats: getStats(parsed),
      };
    } catch (err: any) {
      return {
        isValid: false,
        formatted: '',
        error: err.message || 'Invalid JSON syntax',
        stats: null,
      };
    }
  }, [inputJson, indentSize]);

  const handleMinify = () => {
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
    } catch (e) {
      // ignore
    }
  };

  const handleFormat = () => {
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed, null, indentSize));
    } catch (e) {
      // ignore
    }
  };

  const handleCopy = () => {
    const textToCopy = parsedState.isValid ? parsedState.formatted : inputJson;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = parsedState.isValid ? parsedState.formatted : inputJson;
    const element = document.createElement('a');
    const file = new Blob([textToDownload], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'formatted-data.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'JSON Formatter & Validator — Tools' : 'Format & Validasi JSON — Tool Pengembang'}
        description={
          language === 'en'
            ? 'Format, minify, validate, and clean JSON code with real-time error checking.'
            : 'Format, minifikasi, dan validasi sintaks data JSON secara langsung.'
        }
        url="/tools/json-formatter"
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
          <span className="text-stone-900 dark:text-zinc-100 font-medium">JSON Formatter</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
              JSON Formatter & Validator
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">
              {language === 'en'
                ? 'Beautify, validate, minify, and inspect JSON payload structures instantly.'
                : 'Rapikan, validasi sintaks, dan minifikasi struktur data JSON secara real-time.'}
            </p>
          </div>

          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:text-stone-950 dark:hover:text-white text-xs font-medium transition-colors shadow-xs self-start sm:self-auto"
          >
            <ArrowLeft size={13} />
            <span>{language === 'en' ? 'All Tools' : 'Semua Perkakas'}</span>
          </Link>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="space-y-4">
        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleFormat}
              className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              {language === 'en' ? 'Beautify / Format' : 'Rapikan Format'}
            </button>

            <button
              onClick={handleMinify}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-950 dark:hover:text-white text-xs font-medium transition-colors"
            >
              {language === 'en' ? 'Minify JSON' : 'Minifikasi'}
            </button>

            {/* Indent Selector */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800/60 p-1 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs text-stone-600 dark:text-zinc-400">
              <span className="px-2 text-[11px] font-mono">{language === 'en' ? 'Indent:' : 'Spasi:'}</span>
              {[2, 4].map(size => (
                <button
                  key={size}
                  onClick={() => setIndentSize(size)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    indentSize === size
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {size}s
                </button>
              ))}
            </div>

            <button
              onClick={() => setInputJson(SAMPLE_JSON)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white text-xs font-medium transition-colors"
            >
              {language === 'en' ? 'Load Sample' : 'Muat Contoh'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputJson('')}
              className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title={language === 'en' ? 'Clear text' : 'Bersihkan teks'}
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 hover:bg-stone-200 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Copy' : 'Salin')}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white transition-colors"
              title={language === 'en' ? 'Download JSON' : 'Unduh JSON'}
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Validation Status Indicator Banner */}
        {inputJson.trim() && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
              parsedState.isValid
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {parsedState.isValid ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>{language === 'en' ? 'Valid JSON Syntax' : 'Sintaks JSON Valid'}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-rose-500 shrink-0" />
                  <span className="font-mono">{parsedState.error}</span>
                </>
              )}
            </div>

            {parsedState.stats && (
              <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] opacity-90">
                <span>{parsedState.stats.keysCount} keys</span>
                <span>•</span>
                <span>Depth: {parsedState.stats.maxDepth}</span>
                <span>•</span>
                <span>{parsedState.stats.byteSize} bytes</span>
              </div>
            )}
          </div>
        )}

        {/* Dual Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 dark:text-zinc-400 block uppercase tracking-wider font-mono">
              {language === 'en' ? 'Input JSON' : 'Input JSON Mentah'}
            </label>
            <textarea
              value={inputJson}
              onChange={e => setInputJson(e.target.value)}
              placeholder='{"key": "value"}'
              rows={18}
              className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs font-mono leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          {/* Formatted Output Panel */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 dark:text-zinc-400 block uppercase tracking-wider font-mono">
              {language === 'en' ? 'Formatted Output' : 'Hasil Format Clean'}
            </label>
            <textarea
              readOnly
              value={parsedState.isValid ? parsedState.formatted : inputJson}
              placeholder={language === 'en' ? 'Formatted output will appear here...' : 'Hasil format akan muncul di sini...'}
              rows={18}
              className="w-full p-4 rounded-2xl bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed border border-zinc-800 focus:outline-none select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
