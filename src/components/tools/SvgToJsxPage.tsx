import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Download,
  Upload,
  Sparkles,
  Eye,
  Sliders,
  Layers,
  Image,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_SVGS = [
  {
    name: 'Shield Check Icon',
    nameId: 'Ikon Shield Check',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  <path d="m9 12 2 2 4-4"/>
</svg>`,
  },
  {
    name: 'Gradient Sparkle Star',
    nameId: 'Bintang Sparkle Gradasi',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <polygon points="50,5 64,36 98,39 72,62 80,95 50,77 20,95 28,62 2,39 36,36" fill="url(#starGrad)" stroke="#be123c" stroke-width="2" />
</svg>`,
  },
  {
    name: 'Simple Badge Banner',
    nameId: 'Badge Banner Sederhana',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="40" viewBox="0 0 140 40">
  <rect width="140" height="40" rx="8" fill="#4f46e5" />
  <circle cx="20" cy="20" r="10" fill="#ffffff" fill-opacity="0.2" />
  <path d="M16 20l3 3 5-5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <text x="38" y="25" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="bold">VERIFIED</text>
</svg>`,
  },
];

// SVG attribute to JSX property map
const SVG_TO_JSX_ATTRS: Record<string, string> = {
  class: 'className',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'text-anchor': 'textAnchor',
  'alignment-baseline': 'alignmentBaseline',
  'xmlns:xlink': 'xmlnsXlink',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
};

function transformSvgToJsx(rawSvg: string, componentName: string, format: 'component' | 'raw-jsx' | 'data-uri'): string {
  if (!rawSvg || !rawSvg.trim()) return '';

  // Clean XML prolog or doctype
  let cleaned = rawSvg
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .trim();

  // Replace hyphenated and HTML attributes with JSX equivalents
  Object.entries(SVG_TO_JSX_ATTRS).forEach(([svgAttr, jsxAttr]) => {
    const regex = new RegExp(`\\b${svgAttr}=`, 'gi');
    cleaned = cleaned.replace(regex, `${jsxAttr}=`);
  });

  // Convert inline style strings style="foo: bar; baz: qux" to style={{ foo: 'bar', baz: 'qux' }}
  cleaned = cleaned.replace(/style="([^"]*)"/gi, (_, styleStr) => {
    const styles = styleStr
      .split(';')
      .filter((s: string) => s.trim())
      .map((s: string) => {
        const [k, v] = s.split(':');
        if (!k || !v) return '';
        const camelK = k.trim().replace(/-([a-z])/g, (g: string) => g[1].toUpperCase());
        return `${camelK}: '${v.trim()}'`;
      })
      .filter(Boolean)
      .join(', ');
    return `style={{ ${styles} }}`;
  });

  if (format === 'data-uri') {
    const encoded = encodeURIComponent(rawSvg.trim())
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `/* CSS Data URI (Optimized) */
background-image: url("data:image/svg+xml,${encoded}");

/* HTML <img> src */
<img src="data:image/svg+xml,${encoded}" alt="${componentName}" />`;
  }

  if (format === 'raw-jsx') {
    return cleaned;
  }

  // Component format with props
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '') || 'CustomIcon';
  const pascalName = safeName.charAt(0).toUpperCase() + safeName.slice(1);

  // Inject props into opening <svg tag
  let withProps = cleaned.replace(
    /<svg\b([^>]*)>/i,
    `<svg$1 {...props}>`
  );

  return `import React from 'react';

export interface ${pascalName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function ${pascalName}({ size = 24, ...props }: ${pascalName}Props) {
  return (
    ${withProps.split('\n').map((line, i) => (i === 0 ? line : `    ${line}`)).join('\n')}
  );
}

export default ${pascalName};`;
}

export const SvgToJsxPage: React.FC = () => {
  const { language } = usePortfolio();

  const [svgInput, setSvgInput] = useState<string>(SAMPLE_SVGS[0].svg);
  const [componentName, setComponentName] = useState<string>('ShieldCheckIcon');
  const [format, setFormat] = useState<'component' | 'raw-jsx' | 'data-uri'>('component');
  const [copied, setCopied] = useState<boolean>(false);
  const [bgMode, setBgMode] = useState<'transparent' | 'dark' | 'light' | 'colored'>('transparent');
  const [mobileTab, setMobileTab] = useState<'code' | 'preview'>('code');

  const transformedCode = useMemo(() => {
    return transformSvgToJsx(svgInput, componentName, format);
  }, [svgInput, componentName, format]);

  const handleCopy = () => {
    if (!transformedCode) return;
    navigator.clipboard.writeText(transformedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isComponent = format === 'component';
    const filename = isComponent ? `${componentName || 'Icon'}.tsx` : 'svg-output.txt';
    const blob = new Blob([transformedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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
        setSvgInput(text);
        const nameWithoutExt = file.name.replace(/\.svg$/i, '').replace(/[^a-zA-Z0-9]/g, '');
        if (nameWithoutExt) {
          setComponentName(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1) + 'Icon');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'SVG to React JSX & CSS Data URI Studio — Muchamad Irvan' : 'Konverter SVG ke React JSX & Data URI — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Convert raw SVG into clean React/TypeScript components, sanitize JSX attributes, and generate optimized CSS Data URIs.'
            : 'Ubah file SVG mentah menjadi komponen React TypeScript yang bersih, rapikan atribut JSX, dan buat CSS background Data URI.'
        }
        url="/tools/svg-to-jsx"
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <FileCode size={13} />
              <span>SVG Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'SVG to React JSX & Data URI Studio' : 'Studio Konverter SVG ke React JSX'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Sanitize raw SVG into typed React TypeScript components, inline JSX, or optimized CSS Data URIs.'
              : 'Ubah SVG mentah menjadi komponen React TypeScript, JSX bersih tanpa konflik atribut, atau CSS Data URI instan.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors">
            <Upload size={14} />
            <span>{language === 'en' ? 'Upload SVG' : 'Unggah SVG'}</span>
            <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
          </label>
          <button
            onClick={handleCopy}
            disabled={!transformedCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs disabled:opacity-40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy Output' : 'Salin Kode')}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!transformedCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors disabled:opacity-40"
            title="Download Component"
          >
            <Download size={14} />
            <span className="hidden sm:inline">{language === 'en' ? 'Download' : 'Unduh'}</span>
          </button>
        </div>
      </div>

      {/* Preset SVGs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles size={13} /> {language === 'en' ? 'Samples:' : 'Contoh:'}
        </span>
        {SAMPLE_SVGS.map(sample => (
          <button
            key={sample.name}
            onClick={() => setSvgInput(sample.svg)}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-400 text-stone-700 dark:text-zinc-300 whitespace-nowrap transition-colors"
          >
            {language === 'en' ? sample.name : sample.nameId}
          </button>
        ))}
      </div>

      {/* Configurations Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-100 dark:bg-zinc-900/70 border border-stone-200 dark:border-zinc-800 text-xs">
        {/* Output Format Select */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-600 dark:text-zinc-400">
            {language === 'en' ? 'Output Format' : 'Format Keluaran'}
          </label>
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-xl p-1 border border-stone-200 dark:border-zinc-700">
            {[
              { id: 'component', label: 'React TS' },
              { id: 'raw-jsx', label: 'JSX Only' },
              { id: 'data-uri', label: 'Data URI' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                  format === f.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Component Name */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-600 dark:text-zinc-400">
            {language === 'en' ? 'Component Name' : 'Nama Komponen'}
          </label>
          <input
            type="text"
            value={componentName}
            onChange={e => setComponentName(e.target.value)}
            disabled={format !== 'component'}
            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100 disabled:opacity-40"
            placeholder="MyIcon"
          />
        </div>

        {/* Preview Background Theme */}
        <div className="space-y-1">
          <label className="font-semibold text-stone-600 dark:text-zinc-400">
            {language === 'en' ? 'Preview Canvas' : 'Kanvas Pratinjau'}
          </label>
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-xl p-1 border border-stone-200 dark:border-zinc-700">
            {[
              { id: 'transparent', label: 'Grid' },
              { id: 'dark', label: 'Dark' },
              { id: 'light', label: 'Light' },
              { id: 'colored', label: 'Color' },
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setBgMode(b.id as any)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                  bgMode === b.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden rounded-xl bg-stone-100 dark:bg-zinc-800 p-1">
        <button
          onClick={() => setMobileTab('code')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'code'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'Code View' : 'Editor & Kode'}
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'preview'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'Visual Preview' : 'Pratinjau Visual'}
        </button>
      </div>

      {/* Main Grid: Input & Transformed Code + Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Input SVG (5 cols) */}
        <div
          className={`lg:col-span-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
            mobileTab === 'preview' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              {language === 'en' ? 'Raw SVG Markup' : 'Kode SVG Mentah'}
            </span>
            <button
              onClick={() => setSvgInput('')}
              className="text-stone-400 hover:text-rose-500 p-1"
              title="Clear"
            >
              <RotateCcw size={13} />
            </button>
          </div>
          <textarea
            value={svgInput}
            onChange={e => setSvgInput(e.target.value)}
            placeholder="<svg ...> ... </svg>"
            className="w-full h-64 lg:h-[450px] p-4 font-mono text-xs bg-transparent text-stone-900 dark:text-zinc-100 resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Right: Output Code (7 cols) */}
        <div
          className={`lg:col-span-7 flex flex-col gap-4 ${
            mobileTab === 'preview' ? 'flex' : 'flex'
          }`}
        >
          {/* Live Visual Canvas Preview */}
          <div
            className={`rounded-2xl border border-stone-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden ${
              bgMode === 'dark'
                ? 'bg-zinc-950 text-white'
                : bgMode === 'light'
                ? 'bg-white text-stone-900'
                : bgMode === 'colored'
                ? 'bg-rose-500 text-white'
                : 'bg-stone-100 dark:bg-zinc-900/60 text-stone-800 dark:text-zinc-200'
            }`}
          >
            <div className="absolute top-2.5 left-3 text-[10px] font-semibold tracking-wider uppercase text-stone-500 dark:text-zinc-400">
              {language === 'en' ? 'Live Render Preview' : 'Pratinjau Render'}
            </div>

            <div
              className="flex items-center justify-center max-h-[120px] max-w-[200px]"
              dangerouslySetInnerHTML={{ __html: svgInput }}
            />
          </div>

          {/* Transformed Output */}
          <div
            className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col ${
              mobileTab === 'preview' ? 'hidden sm:flex' : 'flex'
            }`}
          >
            <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code2 size={13} className="text-rose-500" />
                <span>
                  {format === 'component'
                    ? 'React TypeScript Component'
                    : format === 'raw-jsx'
                    ? 'Sanitized JSX'
                    : 'CSS Data URI'}
                </span>
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 bg-stone-900 dark:bg-black/90 text-zinc-100 font-mono text-xs overflow-auto max-h-[280px] leading-relaxed">
              <pre className="text-emerald-400 whitespace-pre">{transformedCode}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
