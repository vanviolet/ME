import React, { useState, useMemo } from 'react';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  ArrowRightLeft,
  Download,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRESET_CONFIGS = [
  {
    name: 'Kubernetes Pod Manifest',
    nameId: 'Manifest Pod Kubernetes',
    yaml: `apiVersion: v1
kind: Pod
metadata:
  name: nginx-webserver
  labels:
    app: web
    tier: frontend
spec:
  containers:
    - name: nginx
      image: nginx:1.25-alpine
      ports:
        - containerPort: 80
      resources:
        limits:
          memory: "128Mi"
          cpu: "500m"`,
  },
  {
    name: 'Docker Compose Stack',
    nameId: 'Docker Compose Stack',
    yaml: `version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://user:pass@db:5432/appdb
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    restart: always
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:`,
  },
  {
    name: 'GitHub Actions CI/CD',
    nameId: 'Workflow GitHub Actions',
    yaml: `name: Node.js CI
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm test`,
  },
];

export const YamlJsonConverterPage: React.FC = () => {
  const { language } = usePortfolio();

  const [mode, setMode] = useState<'yaml2json' | 'json2yaml'>('yaml2json');
  const [inputVal, setInputVal] = useState<string>(PRESET_CONFIGS[0].yaml);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');

  const { outputVal, error } = useMemo(() => {
    if (!inputVal || !inputVal.trim()) {
      return { outputVal: '', error: null };
    }

    try {
      if (mode === 'yaml2json') {
        const parsed = yamlLoad(inputVal);
        const jsonStr = JSON.stringify(parsed, null, indentSize);
        return { outputVal: jsonStr, error: null };
      } else {
        const parsed = JSON.parse(inputVal);
        const yamlStr = yamlDump(parsed, { indent: indentSize, lineWidth: -1 });
        return { outputVal: yamlStr, error: null };
      }
    } catch (err: any) {
      return { outputVal: '', error: err.message || 'Syntax parsing error' };
    }
  }, [inputVal, mode, indentSize]);

  const handleToggleMode = () => {
    if (outputVal && !error) {
      setInputVal(outputVal);
    }
    setMode(prev => (prev === 'yaml2json' ? 'json2yaml' : 'yaml2json'));
  };

  const handleCopy = () => {
    if (!outputVal) return;
    navigator.clipboard.writeText(outputVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputVal) return;
    const ext = mode === 'yaml2json' ? 'json' : 'yaml';
    const blob = new Blob([outputVal], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setInputVal(text);
        if (file.name.endsWith('.json')) {
          setMode('json2yaml');
        } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          setMode('yaml2json');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'YAML to JSON & JSON to YAML Converter — Muchamad Irvan' : 'Konverter YAML ke JSON & JSON ke YAML — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Convert two-way between YAML and JSON files instantly with schema syntax validation, indentation control, and preset cloud manifests.'
            : 'Konversi dua arah antara YAML dan JSON secara instan dengan validasi sintaks, pengaturan indentasi, dan preset konfigurasi Kubernetes/Docker.'
        }
        url="/tools/yaml-json-converter"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/tools"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Tools"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <FileText size={13} />
              <span>DevOps Config Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'YAML ↔ JSON Two-Way Converter' : 'Konverter Dua Arah YAML ↔ JSON'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Seamlessly transform DevOps configuration files between YAML and JSON with real-time error detection.'
              : 'Ubah file konfigurasi DevOps antara YAML dan JSON dengan deteksi error dan validasi struktur instan.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors">
            <Upload size={14} />
            <span className="hidden sm:inline">{language === 'en' ? 'Upload File' : 'Unggah File'}</span>
            <input type="file" accept=".yaml,.yml,.json" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            onClick={handleToggleMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
            title="Switch conversion direction"
          >
            <ArrowRightLeft size={14} />
            <span>{mode === 'yaml2json' ? 'YAML → JSON' : 'JSON → YAML'}</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!outputVal || !!error}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs disabled:opacity-40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy Output' : 'Salin')}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!outputVal || !!error}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors disabled:opacity-40"
            title="Download Result"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Preset Configs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles size={13} /> {language === 'en' ? 'Samples:' : 'Contoh:'}
        </span>
        {PRESET_CONFIGS.map(preset => (
          <button
            key={preset.name}
            onClick={() => {
              setMode('yaml2json');
              setInputVal(preset.yaml);
            }}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-400 text-stone-700 dark:text-zinc-300 whitespace-nowrap transition-colors"
          >
            {language === 'en' ? preset.name : preset.nameId}
          </button>
        ))}
      </div>

      {/* Settings Row */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-100 dark:bg-zinc-900/70 border border-stone-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-600 dark:text-zinc-400">
              {language === 'en' ? 'Indentation:' : 'Spasi Indentasi:'}
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg p-0.5 border border-stone-200 dark:border-zinc-700">
              {[2, 4].map(size => (
                <button
                  key={size}
                  onClick={() => setIndentSize(size)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    indentSize === size
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {size} spaces
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          {error ? (
            <span className="text-rose-500 font-semibold flex items-center gap-1">
              <AlertCircle size={13} /> {language === 'en' ? 'Invalid Syntax' : 'Sintaks Salah'}
            </span>
          ) : (
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> {language === 'en' ? 'Valid & Ready' : 'Sintaks Valid'}
            </span>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden rounded-xl bg-stone-100 dark:bg-zinc-800 p-1">
        <button
          onClick={() => setMobileTab('input')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'input'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {mode === 'yaml2json' ? 'YAML Input' : 'JSON Input'}
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'output'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {mode === 'yaml2json' ? 'JSON Output' : 'YAML Output'}
        </button>
      </div>

      {/* Editors Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Box */}
        <div
          className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
            mobileTab === 'output' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300 uppercase tracking-wider">
              {mode === 'yaml2json' ? 'YAML Input' : 'JSON Input'}
            </span>
            <button
              onClick={() => setInputVal('')}
              className="text-stone-400 hover:text-rose-500 p-1"
              title="Clear"
            >
              <RotateCcw size={13} />
            </button>
          </div>
          <textarea
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder={mode === 'yaml2json' ? 'Paste YAML here...' : 'Paste JSON here...'}
            className="w-full h-80 sm:h-[450px] p-4 font-mono text-xs bg-transparent text-stone-900 dark:text-zinc-100 resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Box */}
        <div
          className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
            mobileTab === 'input' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300 uppercase tracking-wider">
              {mode === 'yaml2json' ? 'JSON Output' : 'YAML Output'}
            </span>
            <button
              onClick={handleCopy}
              disabled={!outputVal || !!error}
              className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1 disabled:opacity-40"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="relative flex-1 min-h-[320px] sm:min-h-[450px] bg-stone-900 dark:bg-black/90 text-zinc-100 overflow-auto p-4 font-mono text-xs leading-relaxed">
            {error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> Syntax Parsing Error
                </div>
                <div className="text-[11px] whitespace-pre-wrap">{error}</div>
              </div>
            ) : (
              <pre className="text-blue-300 whitespace-pre">{outputVal}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
