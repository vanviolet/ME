import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Palette,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  ArrowRightLeft,
  Sparkles,
  Eye,
  CheckCircle2,
  XCircle,
  FileCode,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRESET_COMBINATIONS = [
  {
    name: 'Modern Slate & Off-White',
    text: '#0f172a',
    bg: '#f8fafc',
  },
  {
    name: 'Deep Zinc & Rose Accent',
    text: '#fb7185',
    bg: '#18181b',
  },
  {
    name: 'Cyberpunk Neon Amber',
    text: '#fbbf24',
    bg: '#09090b',
  },
  {
    name: 'Teal & Crisp White',
    text: '#0f766e',
    bg: '#ffffff',
  },
  {
    name: 'Accessible Charcoal & Light Gray',
    text: '#374151',
    bg: '#f3f4f6',
  },
  {
    name: 'Indigo & Midnight Navy',
    text: '#818cf8',
    bg: '#0f172a',
  },
];

// Helper: parse hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

// Calculate relative luminance based on WCAG 2.1
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio
function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export const ColorContrastPage: React.FC = () => {
  const { language } = usePortfolio();

  const [textColor, setTextColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#f8fafc');
  const [copied, setCopied] = useState<boolean>(false);
  const [simulateGrayscale, setSimulateGrayscale] = useState<boolean>(false);
  const [simulateBlur, setSimulateBlur] = useState<boolean>(false);

  const contrast = useMemo(() => {
    return getContrastRatio(textColor, bgColor);
  }, [textColor, bgColor]);

  const roundedRatio = contrast.toFixed(2);

  // WCAG 2.1 Compliance checks
  const passAANormal = contrast >= 4.5;
  const passAALarge = contrast >= 3.0;
  const passAAANormal = contrast >= 7.0;
  const passAAALarge = contrast >= 4.5;
  const passUI = contrast >= 3.0;

  const handleSwap = () => {
    const temp = textColor;
    setTextColor(bgColor);
    setBgColor(temp);
  };

  const handleCopyCss = () => {
    const cssSnippet = `/* WCAG Contrast Ratio: ${roundedRatio}:1 */
:root {
  --color-foreground: ${textColor};
  --color-background: ${bgColor};
}

.accessible-card {
  color: var(--color-foreground);
  background-color: var(--color-background);
}`;
    navigator.clipboard.writeText(cssSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'WCAG Color Contrast & Accessibility Studio — Muchamad Irvan' : 'Pemeriksa Kontras Warna WCAG & Aksesibilitas — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Test and optimize color contrast ratios according to WCAG 2.1 AA and AAA standards with live UI simulation.'
            : 'Uji dan optimalkan rasio kontras warna berdasarkan standar aksesibilitas WCAG 2.1 tingkat AA dan AAA dengan simulasi UI langsung.'
        }
        url="/tools/color-contrast"
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Palette size={13} />
              <span>WCAG 2.1 Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Color Contrast & Accessibility Studio' : 'Studio Kontras Warna & Aksesibilitas WCAG'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Calculate color contrast ratios, check WCAG 2.1 AA/AAA compliance, and test readability under various visual simulations.'
              : 'Hitung rasio kontras warna, periksa kepatuhan WCAG 2.1 level AA/AAA, dan simulasi keterbacaan antarmuka secara interaktif.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
            title="Swap text and background colors"
          >
            <ArrowRightLeft size={14} />
            <span>{language === 'en' ? 'Swap Colors' : 'Tukar Warna'}</span>
          </button>
          <button
            onClick={handleCopyCss}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy CSS' : 'Salin CSS')}</span>
          </button>
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles size={13} /> {language === 'en' ? 'Curated Presets:' : 'Preset Populer:'}
        </span>
        {PRESET_COMBINATIONS.map(preset => (
          <button
            key={preset.name}
            onClick={() => {
              setTextColor(preset.text);
              setBgColor(preset.bg);
            }}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-400 text-stone-700 dark:text-zinc-300 whitespace-nowrap flex items-center gap-1.5 transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: preset.bg }}
            />
            <span
              className="w-3 h-3 rounded-full border border-black/10 inline-block"
              style={{ backgroundColor: preset.text }}
            />
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Main Ratio Card & Visual Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Large Score Indicator */}
        <div className="rounded-2xl p-6 border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
              {language === 'en' ? 'Contrast Ratio' : 'Rasio Kontras'}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900 dark:text-zinc-100 font-mono">
                {roundedRatio}
              </span>
              <span className="text-xl font-bold text-stone-400 dark:text-zinc-600">: 1</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              {passAANormal ? (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              ) : (
                <XCircle size={18} className="text-rose-500 shrink-0" />
              )}
              <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
                {passAANormal
                  ? language === 'en'
                    ? 'Passes WCAG 2.1 AA Requirements'
                    : 'Lolos Standar Standar WCAG 2.1 AA'
                  : language === 'en'
                  ? 'Fails WCAG 2.1 AA (Low Contrast)'
                  : 'Gagal Standar WCAG 2.1 AA (Kontras Rendah)'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1">
              {language === 'en'
                ? 'Standard body text requires at least 4.5:1 ratio.'
                : 'Teks paragraf normal membutuhkan rasio minimal 4.5:1.'}
            </p>
          </div>
        </div>

        {/* Detailed Compliance Matrix */}
        <div className="md:col-span-2 rounded-2xl p-5 border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* AA Normal */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400">WCAG AA Normal</span>
              <div className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">Req: ≥ 4.5:1</div>
            </div>
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  passAANormal
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {passAANormal ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* AA Large */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400">WCAG AA Large</span>
              <div className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">Req: ≥ 3.0:1</div>
            </div>
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  passAALarge
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {passAALarge ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* AAA Normal */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400">WCAG AAA Normal</span>
              <div className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">Req: ≥ 7.0:1</div>
            </div>
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  passAAANormal
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {passAAANormal ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          {/* UI Elements */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400">UI Controls</span>
              <div className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">Req: ≥ 3.0:1</div>
            </div>
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  passUI
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {passUI ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Color Selectors & Accessibility Filter Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Foreground / Text Picker */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              {language === 'en' ? 'Foreground (Text Color)' : 'Warna Teks (Foreground)'}
            </span>
            <span className="text-xs font-mono uppercase text-stone-500 dark:text-zinc-400">
              {textColor}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={textColor}
              onChange={e => setTextColor(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={textColor}
              onChange={e => setTextColor(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 font-mono text-xs text-stone-900 dark:text-zinc-100 uppercase"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Background Picker */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              {language === 'en' ? 'Background Color' : 'Warna Latar (Background)'}
            </span>
            <span className="text-xs font-mono uppercase text-stone-500 dark:text-zinc-400">
              {bgColor}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 font-mono text-xs text-stone-900 dark:text-zinc-100 uppercase"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Live Interactive UI Simulation */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
            {language === 'en' ? 'Live UI Component Simulation' : 'Simulasi Komponen UI Langsung'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSimulateGrayscale(!simulateGrayscale)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                simulateGrayscale
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400'
              }`}
            >
              {language === 'en' ? 'Simulate Grayscale' : 'Simulasi Monokrom'}
            </button>
            <button
              onClick={() => setSimulateBlur(!simulateBlur)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                simulateBlur
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400'
              }`}
            >
              {language === 'en' ? 'Simulate Blurred Vision' : 'Simulasi Penglihatan Kabur'}
            </button>
          </div>
        </div>

        {/* Preview Sandbox */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border border-stone-300 dark:border-zinc-700 transition-all ${
            simulateGrayscale ? 'grayscale' : ''
          } ${simulateBlur ? 'blur-[1.5px]' : ''}`}
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <div className="space-y-4 max-w-2xl">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-xs font-bold border"
              style={{ borderColor: textColor }}
            >
              {language === 'en' ? 'Accessibility Preview Tag' : 'Tag Pratinjau Aksesibilitas'}
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'en'
                ? 'Crafting inclusive digital experiences with high contrast'
                : 'Membangun pengalaman digital inklusif dengan kontras tinggi'}
            </h3>

            <p className="text-sm sm:text-base leading-relaxed opacity-90">
              {language === 'en'
                ? 'High contrast improves reading comprehension, reduces cognitive fatigue, and guarantees compliance with international web accessibility guidelines (WCAG 2.1 Level AA and AAA).'
                : 'Kontras yang tepat meningkatkan kenyamanan membaca, mencegah kelelahan mata, dan menjamin kepatuhan terhadap pedoman aksesibilitas internasional (WCAG 2.1 Level AA & AAA).'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-opacity"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                {language === 'en' ? 'Primary Action Button' : 'Tombol Aksi Utama'}
              </button>
              <button
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border"
                style={{ borderColor: textColor, color: textColor }}
              >
                {language === 'en' ? 'Secondary Action' : 'Tombol Sekunder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
