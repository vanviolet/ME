import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Code2,
  Copy,
  Check,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sliders,
  Sparkles,
  Search,
  Maximize2,
  Minimize2,
  FolderTree,
  Table as TableIcon,
  FileCode2,
  Wrench,
  Layers,
  BarChart3,
  RotateCcw,
  Braces,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { JsonTreeView } from './common/JsonTreeView';

const SAMPLE_DATASETS: { name: string; nameId: string; data: any }[] = [
  {
    name: 'User Profile & Preferences',
    nameId: 'Profil Pengguna & Preferensi',
    data: {
      userId: 'usr_8923a1f4',
      name: 'Muchamad Irvan',
      role: 'Full-Stack Software Engineer',
      isActive: true,
      contact: {
        email: 'vanviolet.js@gmail.com',
        phone: '+6281234567890',
        location: {
          city: 'Jakarta',
          country: 'Indonesia',
          timezone: 'Asia/Jakarta',
          coordinates: { lat: -6.2088, lng: 106.8456 },
        },
      },
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'GCP'],
      stats: {
        repositories: 48,
        totalContributions: 1420,
        rating: 4.95,
      },
      settings: {
        theme: 'dark',
        notifications: { email: true, sms: false, push: true },
        security: { twoFactorEnabled: true, lastLogin: '2026-09-15T09:12:00Z' },
      },
    },
  },
  {
    name: 'E-Commerce Order & Items',
    nameId: 'Pesanan E-Commerce & Item',
    data: {
      orderId: 'ORD-2026-9921',
      customer: { id: 'cust_441', name: 'Siti Rahmawati', tier: 'Gold' },
      status: 'shipped',
      currency: 'IDR',
      items: [
        { sku: 'TECH-KB-01', name: 'Mechanical Keyboard RGB', qty: 1, price: 1250000 },
        { sku: 'TECH-MS-02', name: 'Wireless Ergonomic Mouse', qty: 2, price: 450000 },
      ],
      pricing: { subtotal: 2150000, discount: 150000, shippingFee: 25000, grandTotal: 2025000 },
      shippingAddress: { province: 'Jawa Barat', postalCode: '40123' },
    },
  },
  {
    name: 'REST API Response',
    nameId: 'Respon REST API Standar',
    data: {
      status: 'success',
      statusCode: 200,
      timestamp: 1789456800,
      meta: { page: 1, perPage: 20, totalPages: 5, totalRecords: 92 },
      data: [
        { id: 1, title: 'Optimizing React Rendering', status: 'published', views: 3200 },
        { id: 2, title: 'Building Resilient Microservices', status: 'published', views: 5120 },
      ],
    },
  },
];

// Helper to auto-fix common JSON mistakes (single quotes, trailing commas, unquoted keys)
function attemptAutoFixJson(brokenJson: string): string {
  let cleaned = brokenJson.trim();
  // Replace single quotes with double quotes
  cleaned = cleaned.replace(/'/g, '"');
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
  // Quote unquoted object keys (simple heuristic)
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  return cleaned;
}

// Generate TypeScript interface from JSON
function generateTypeScriptInterface(data: any, rootName = 'RootObject'): string {
  if (data === null || typeof data !== 'object') {
    return `type ${rootName} = ${typeof data};`;
  }

  const interfaces: string[] = [];

  function parseType(val: any, name: string): string {
    if (val === null) return 'null | any';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const itemType = parseType(val[0], `${name}Item`);
      return `${itemType}[]`;
    }
    if (typeof val === 'object') {
      const typeName = name.charAt(0).toUpperCase() + name.slice(1);
      const lines: string[] = [];
      for (const key of Object.keys(val)) {
        const childType = parseType(val[key], key);
        lines.push(`  ${key}: ${childType};`);
      }
      interfaces.push(`export interface ${typeName} {\n${lines.join('\n')}\n}`);
      return typeName;
    }
    return typeof val;
  }

  const rootTypeName = parseType(data, rootName);
  if (!interfaces.some(i => i.includes(`export interface ${rootTypeName} `))) {
    return `export type ${rootTypeName} = ${typeof data};\n\n` + interfaces.join('\n\n');
  }
  return interfaces.join('\n\n');
}

export const JsonFormatterPage: React.FC = () => {
  const { language } = usePortfolio();

  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify(SAMPLE_DATASETS[0].data, null, 2)
  );
  const [indentSize, setIndentSize] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tree' | 'raw' | 'table' | 'ts'>('tree');
  const [treeExpandedDepth, setTreeExpandedDepth] = useState<number>(3);

  // Sorting helper
  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((result: any, key: string) => {
          result[key] = sortObjectKeys(obj[key]);
          return result;
        }, {});
    }
    return obj;
  };

  // Parsing & Analysis
  const parseResult = useMemo(() => {
    if (!inputJson.trim()) {
      return {
        isValid: false,
        parsed: null,
        formatted: '',
        minified: '',
        error: null,
        errorPos: null,
        stats: null,
      };
    }

    try {
      let parsed = JSON.parse(inputJson);
      if (sortKeys) {
        parsed = sortObjectKeys(parsed);
      }

      const formatted = JSON.stringify(parsed, null, indentSize);
      const minified = JSON.stringify(parsed);

      // Detailed Statistics
      let totalKeys = 0;
      let totalArrays = 0;
      let totalObjects = 0;
      let totalStrings = 0;
      let totalNumbers = 0;
      let totalBooleans = 0;
      let totalNulls = 0;
      let maxDepth = 0;

      const analyzeNode = (node: any, depth: number) => {
        if (depth > maxDepth) maxDepth = depth;

        if (node === null) {
          totalNulls++;
        } else if (Array.isArray(node)) {
          totalArrays++;
          node.forEach(item => analyzeNode(item, depth + 1));
        } else if (typeof node === 'object') {
          totalObjects++;
          const keys = Object.keys(node);
          totalKeys += keys.length;
          keys.forEach(k => analyzeNode(node[k], depth + 1));
        } else if (typeof node === 'string') {
          totalStrings++;
        } else if (typeof node === 'number') {
          totalNumbers++;
        } else if (typeof node === 'boolean') {
          totalBooleans++;
        }
      };

      analyzeNode(parsed, 1);

      const rawBytes = new Blob([inputJson]).size;
      const formattedBytes = new Blob([formatted]).size;
      const minifiedBytes = new Blob([minified]).size;
      const compressionRatio =
        rawBytes > 0 ? Math.round(((rawBytes - minifiedBytes) / rawBytes) * 100) : 0;

      return {
        isValid: true,
        parsed,
        formatted,
        minified,
        error: null,
        errorPos: null,
        stats: {
          rawBytes,
          formattedBytes,
          minifiedBytes,
          compressionRatio,
          totalKeys,
          totalArrays,
          totalObjects,
          totalStrings,
          totalNumbers,
          totalBooleans,
          totalNulls,
          maxDepth,
        },
      };
    } catch (err: any) {
      // Find line and column from error message
      let errorLine = null;
      let errorCol = null;
      const match = (err.message || '').match(/line (\d+) column (\d+)/i);
      if (match) {
        errorLine = parseInt(match[1], 10);
        errorCol = parseInt(match[2], 10);
      } else {
        const atMatch = (err.message || '').match(/position (\d+)/i);
        if (atMatch) {
          const pos = parseInt(atMatch[1], 10);
          const lines = inputJson.slice(0, pos).split('\n');
          errorLine = lines.length;
          errorCol = lines[lines.length - 1].length + 1;
        }
      }

      return {
        isValid: false,
        parsed: null,
        formatted: '',
        minified: '',
        error: err.message || 'Syntax Error',
        errorPos: errorLine ? { line: errorLine, col: errorCol } : null,
        stats: null,
      };
    }
  }, [inputJson, indentSize, sortKeys]);

  // TypeScript representation
  const typeScriptCode = useMemo(() => {
    if (!parseResult.isValid || !parseResult.parsed) return '';
    return generateTypeScriptInterface(parseResult.parsed);
  }, [parseResult]);

  // Flattened Table rows
  const tableData = useMemo(() => {
    if (!parseResult.isValid || !parseResult.parsed) return [];
    const rows: { path: string; type: string; value: string }[] = [];

    const flatten = (node: any, path: string) => {
      if (node === null) {
        rows.push({ path: path || '$', type: 'null', value: 'null' });
      } else if (Array.isArray(node)) {
        if (node.length === 0) {
          rows.push({ path: path || '$', type: 'array', value: '[]' });
        } else {
          node.forEach((val, idx) => flatten(val, `${path}[${idx}]`));
        }
      } else if (typeof node === 'object') {
        const keys = Object.keys(node);
        if (keys.length === 0) {
          rows.push({ path: path || '$', type: 'object', value: '{}' });
        } else {
          keys.forEach(k => flatten(node[k], path ? `${path}.${k}` : k));
        }
      } else {
        rows.push({ path: path || '$', type: typeof node, value: String(node) });
      }
    };

    flatten(parseResult.parsed, '');
    return rows;
  }, [parseResult]);

  const filteredTableData = useMemo(() => {
    if (!searchQuery) return tableData;
    const q = searchQuery.toLowerCase();
    return tableData.filter(
      r => r.path.toLowerCase().includes(q) || r.value.toLowerCase().includes(q)
    );
  }, [tableData, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFix = () => {
    const fixed = attemptAutoFixJson(inputJson);
    setInputJson(fixed);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'Interactive JSON Formatter, Validator & Tree Inspector — Tools'
            : 'JSON Formatter, Validasi & Tree Inspector Interaktif — Tools'
        }
        description={
          language === 'en'
            ? 'Interactive JSON tree viewer, deep schema analysis, syntax validator, auto-fix, TypeScript interface generator, and minifier.'
            : 'Perkakas JSON profesional: penampil pohon interaktif, analisis skema mendalam, perbaikan sintaks otomatis, dan generator TypeScript.'
        }
        url="/tools/json-formatter"
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
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">JSON Formatter & Studio</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Braces size={14} />
            <span>{language === 'en' ? 'Interactive JSON Studio' : 'Studio JSON Interaktif'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            JSON Formatter, Validator & Tree View
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Inspect nested payloads with an interactive collapsible tree, generate TypeScript types, analyze depth & schema metrics, and auto-fix invalid syntax.'
              : 'Analisis payload terstruktur dengan pohon hierarki interaktif, konversi ke interface TypeScript, validasi sintaks dengan petunjuk error, dan minifikasi instan.'}
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

      {/* Main Studio Controls Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Presets & Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono mr-1">
            {language === 'en' ? 'Presets:' : 'Contoh:'}
          </span>
          {SAMPLE_DATASETS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setInputJson(JSON.stringify(s.data, null, indentSize))}
              className="px-2.5 py-1 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-900/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300"
            >
              {language === 'en' ? s.name : s.nameId}
            </button>
          ))}
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Keys Toggle */}
          <button
            onClick={() => setSortKeys(!sortKeys)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              sortKeys
                ? 'bg-rose-500 text-white border-rose-500'
                : 'border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 bg-stone-50 dark:bg-zinc-800'
            }`}
            title="Sort object keys alphabetically"
          >
            <span>A-Z</span>
            <span>{language === 'en' ? 'Sort Keys' : 'Urutkan Kunci'}</span>
          </button>

          {/* Indent size buttons */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs">
            <span className="px-1.5 text-[11px] text-stone-500 font-mono">
              {language === 'en' ? 'Indent' : 'Spasi'}
            </span>
            {[2, 4].map(s => (
              <button
                key={s}
                onClick={() => setIndentSize(s)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                  indentSize === s
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {s}s
              </button>
            ))}
          </div>

          {/* Clear input */}
          <button
            onClick={() => setInputJson('')}
            className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Clear"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Validation Status & Error Bar */}
      {inputJson.trim() && (
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            parseResult.isValid
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-start sm:items-center gap-2.5">
            {parseResult.isValid ? (
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>
                  {parseResult.isValid
                    ? language === 'en'
                      ? 'Valid JSON Schema'
                      : 'Sintaks JSON Valid & Terverifikasi'
                    : language === 'en'
                    ? 'JSON Syntax Error Detected'
                    : 'Kesalahan Sintaks JSON Terdeteksi'}
                </span>
                {parseResult.errorPos && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono text-[11px]">
                    Line {parseResult.errorPos.line}, Col {parseResult.errorPos.col}
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                {parseResult.isValid
                  ? language === 'en'
                    ? 'Payload ready for serialization, API routing, and parsing.'
                    : 'Payload siap digunakan untuk API, serialisasi database, dan parsing.'
                  : parseResult.error}
              </p>
            </div>
          </div>

          {!parseResult.isValid && (
            <button
              onClick={handleAutoFix}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors self-start sm:self-auto shadow-xs"
            >
              <Wrench size={13} />
              <span>{language === 'en' ? 'Attempt Auto-Fix' : 'Coba Perbaiki Otomatis'}</span>
            </button>
          )}

          {parseResult.isValid && parseResult.stats && (
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 font-semibold">
                {parseResult.stats.totalKeys} keys
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 font-semibold">
                Depth {parseResult.stats.maxDepth}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 font-semibold">
                {parseResult.stats.formattedBytes} bytes
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Dual Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Editor (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-rose-500" />
              <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                {language === 'en' ? 'Raw JSON Input' : 'Input JSON Mentah'}
              </label>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
              <span>{inputJson.split('\n').length} lines</span>
              <span>•</span>
              <span>{inputJson.length} chars</span>
            </div>
          </div>

          <textarea
            value={inputJson}
            onChange={e => setInputJson(e.target.value)}
            placeholder='Paste JSON here (e.g. {"key": "value"})'
            rows={22}
            className="w-full p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs font-mono leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 resize-none"
          />

          {/* Bottom quick actions for input */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <button
              onClick={() => {
                if (parseResult.isValid) setInputJson(parseResult.formatted);
              }}
              disabled={!parseResult.isValid}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 disabled:opacity-50 text-xs font-semibold transition-colors"
            >
              {language === 'en' ? 'Format in Editor' : 'Rapikan di Editor'}
            </button>
            <button
              onClick={() => {
                if (parseResult.isValid) setInputJson(parseResult.minified);
              }}
              disabled={!parseResult.isValid}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 disabled:opacity-50 text-xs font-semibold transition-colors"
            >
              {language === 'en' ? 'Minify in Editor' : 'Minifikasi di Editor'}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Inspector & Outputs (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          {/* Navigation Tabs for Views */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <FolderTree size={13} />
                <span>{language === 'en' ? 'Interactive Tree' : 'Pohon Interaktif'}</span>
              </button>

              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'raw'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <FileCode2 size={13} />
                <span>{language === 'en' ? 'Formatted Code' : 'Kode Terformat'}</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <TableIcon size={13} />
                <span>{language === 'en' ? 'Table View' : 'Tabel Kunci'}</span>
              </button>

              <button
                onClick={() => setViewMode('ts')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'ts'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Code2 size={13} />
                <span>TypeScript</span>
              </button>
            </div>

            {/* View Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(parseResult.formatted || inputJson)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
                title="Copy formatted JSON"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => handleDownload(parseResult.formatted || inputJson, 'payload.json')}
                className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                title="Download .json file"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Search bar & Depth Control in Tree & Table modes */}
          {(viewMode === 'tree' || viewMode === 'table') && parseResult.isValid && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Filter keys or values in tree...'
                      : 'Cari kunci atau nilai di pohon JSON...'
                  }
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {viewMode === 'tree' && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-stone-500 font-mono text-[11px] mr-1">
                    {language === 'en' ? 'Expand:' : 'Tingkat:'}
                  </span>
                  {[1, 2, 4, 10].map(d => (
                    <button
                      key={d}
                      onClick={() => setTreeExpandedDepth(d)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                        treeExpandedDepth === d
                          ? 'bg-rose-500 text-white border-rose-500 font-bold'
                          : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                      }`}
                    >
                      {d === 10 ? 'All' : `L${d}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copied path notification */}
          {copiedPath && (
            <div className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-1.5">
              <Check size={12} />
              <span>Copied JSON Path: {copiedPath}</span>
            </div>
          )}

          {/* View Container */}
          <div className="rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 overflow-hidden min-h-[440px] max-h-[560px] flex flex-col">
            {!parseResult.isValid ? (
              <div className="p-8 flex flex-col items-center justify-center text-center m-auto space-y-2 text-stone-400">
                <AlertCircle size={32} className="text-rose-400" />
                <p className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  {language === 'en' ? 'Invalid JSON Syntax' : 'Sintaks JSON Belum Valid'}
                </p>
                <p className="text-xs text-stone-500 max-w-sm">
                  {language === 'en'
                    ? 'Fix syntax errors on the left panel or click "Attempt Auto-Fix" to generate an interactive view.'
                    : 'Perbaiki kesalahan sintaks di panel kiri atau tekan "Coba Perbaiki Otomatis" untuk melihat pohon interaktif.'}
                </p>
              </div>
            ) : viewMode === 'tree' ? (
              /* Tree View Mode */
              <div className="p-4 overflow-auto flex-1">
                <JsonTreeView
                  key={`${treeExpandedDepth}-${searchQuery}-${sortKeys}`}
                  data={parseResult.parsed}
                  initialExpandedDepth={treeExpandedDepth}
                  highlightSearch={searchQuery}
                  onCopyPath={path => {
                    setCopiedPath(path);
                    setTimeout(() => setCopiedPath(null), 2500);
                  }}
                />
              </div>
            ) : viewMode === 'raw' ? (
              /* Formatted Raw Code Mode */
              <div className="p-4 overflow-auto flex-1 font-mono text-xs text-stone-900 dark:text-zinc-100 leading-relaxed whitespace-pre">
                {parseResult.formatted}
              </div>
            ) : viewMode === 'table' ? (
              /* Table View Mode */
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-100 dark:bg-zinc-900 sticky top-0 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3 font-semibold">JSON Path</th>
                      <th className="py-2 px-3 font-semibold">Type</th>
                      <th className="py-2 px-3 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-zinc-800/60">
                    {filteredTableData.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-stone-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                      >
                        <td className="py-1.5 px-3 text-rose-600 dark:text-rose-400 font-medium">
                          {row.path}
                        </td>
                        <td className="py-1.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.type === 'string'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : row.type === 'number'
                                ? 'bg-sky-500/10 text-sky-600'
                                : row.type === 'boolean'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-stone-200 dark:bg-zinc-800 text-stone-500'
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-stone-800 dark:text-zinc-200 max-w-xs truncate">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TypeScript Interface Generator Mode */
              <div className="p-4 overflow-auto flex-1 font-mono text-xs leading-relaxed text-sky-700 dark:text-sky-300 whitespace-pre">
                {typeScriptCode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deep JSON Metrics & Schema Analysis Dashboard */}
      {parseResult.isValid && parseResult.stats && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-rose-500" />
            <h3 className="text-sm font-bold tracking-tight text-stone-900 dark:text-zinc-100">
              {language === 'en'
                ? 'Deep Payload & Schema Analysis'
                : 'Analisis Metrik Skema & Beban Payload'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 block font-medium">
                {language === 'en' ? 'Total Keys' : 'Total Kunci'}
              </span>
              <span className="text-lg font-bold font-mono text-stone-900 dark:text-zinc-100">
                {parseResult.stats.totalKeys}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 block font-medium">
                {language === 'en' ? 'Max Nesting Depth' : 'Kedalaman Maksimal'}
              </span>
              <span className="text-lg font-bold font-mono text-stone-900 dark:text-zinc-100">
                {parseResult.stats.maxDepth} levels
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 block font-medium">
                {language === 'en' ? 'Arrays / Collections' : 'Array / Koleksi'}
              </span>
              <span className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400">
                {parseResult.stats.totalArrays}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 block font-medium">
                {language === 'en' ? 'Objects Count' : 'Jumlah Objek'}
              </span>
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                {parseResult.stats.totalObjects}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 block font-medium">
                {language === 'en' ? 'Strings & Numbers' : 'String & Angka'}
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {parseResult.stats.totalStrings}s / {parseResult.stats.totalNumbers}n
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 block font-medium">
                {language === 'en' ? 'Minified Savings' : 'Penghematan Minifikasi'}
              </span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                {parseResult.stats.compressionRatio}% saved
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
