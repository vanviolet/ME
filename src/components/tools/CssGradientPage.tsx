import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Palette,
  Copy,
  Check,
  RotateCw,
  Sliders,
  ArrowLeft,
  Sparkles,
  Layers,
  Code2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PresetGradient {
  name: string;
  type: 'linear' | 'radial';
  angle: number;
  color1: string;
  color2: string;
  color3?: string;
  twClasses: string;
}

const PRESETS: PresetGradient[] = [
  {
    name: 'Midnight Dark',
    type: 'linear',
    angle: 135,
    color1: '#0f172a',
    color2: '#1e1b4b',
    twClasses: 'bg-gradient-to-r from-slate-900 to-indigo-950',
  },
  {
    name: 'Sunset Rose',
    type: 'linear',
    angle: 90,
    color1: '#e11d48',
    color2: '#fb923c',
    twClasses: 'bg-gradient-to-r from-rose-600 to-orange-400',
  },
  {
    name: 'Cyberpunk Neon',
    type: 'linear',
    angle: 120,
    color1: '#ec4899',
    color2: '#8b5cf6',
    color3: '#3b82f6',
    twClasses: 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500',
  },
  {
    name: 'Emerald Lush',
    type: 'linear',
    angle: 135,
    color1: '#059669',
    color2: '#10b981',
    twClasses: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  },
  {
    name: 'Monochrome Slate',
    type: 'linear',
    angle: 180,
    color1: '#18181b',
    color2: '#27272a',
    twClasses: 'bg-gradient-to-b from-zinc-900 to-zinc-800',
  },
  {
    name: 'Deep Space',
    type: 'radial',
    angle: 0,
    color1: '#312e81',
    color2: '#09090b',
    twClasses: 'bg-radial from-indigo-900 to-zinc-950',
  },
];

export const CssGradientPage: React.FC = () => {
  const { language } = usePortfolio();

  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState<number>(135);
  const [color1, setColor1] = useState<string>('#e11d48');
  const [color2, setColor2] = useState<string>('#fb923c');
  const [useColor3, setUseColor3] = useState<boolean>(false);
  const [color3, setColor3] = useState<string>('#8b5cf6');

  const [activeTab, setActiveTab] = useState<'css' | 'tailwind' | 'react'>('css');
  const [copied, setCopied] = useState<boolean>(false);

  // Computed CSS Gradient String
  const cssValue = useMemo(() => {
    if (type === 'linear') {
      return useColor3
        ? `linear-gradient(${angle}deg, ${color1}, ${color3}, ${color2})`
        : `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else {
      return useColor3
        ? `radial-gradient(circle at center, ${color1}, ${color3}, ${color2})`
        : `radial-gradient(circle at center, ${color1}, ${color2})`;
    }
  }, [type, angle, color1, color2, color3, useColor3]);

  // Computed Tailwind approximation
  const tailwindValue = useMemo(() => {
    return `bg-gradient-to-r from-[${color1}] ${useColor3 ? `via-[${color3}] ` : ''}to-[${color2}]`;
  }, [color1, color2, color3, useColor3]);

  // Computed React Style Object String
  const reactStyleValue = useMemo(() => {
    return `const style = { background: '${cssValue}' };`;
  }, [cssValue]);

  const outputCode = useMemo(() => {
    if (activeTab === 'tailwind') return tailwindValue;
    if (activeTab === 'react') return reactStyleValue;
    return `background: ${cssValue};`;
  }, [activeTab, cssValue, tailwindValue, reactStyleValue]);

  const applyPreset = (preset: PresetGradient) => {
    setType(preset.type);
    setAngle(preset.angle);
    setColor1(preset.color1);
    setColor2(preset.color2);
    if (preset.color3) {
      setUseColor3(true);
      setColor3(preset.color3);
    } else {
      setUseColor3(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'CSS Gradient Generator — Tools' : 'Generator Gradien CSS — Tool Pengembang'}
        description={
          language === 'en'
            ? 'Design linear and radial CSS gradients with instant Tailwind CSS and React code export.'
            : 'Desain gradien warna CSS linear & radial dengan ekspor kode Tailwind dan React.'
        }
        url="/tools/css-gradient"
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
          <span className="text-stone-900 dark:text-zinc-100 font-medium">CSS Gradient</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 flex items-center justify-center border border-stone-200 dark:border-zinc-700">
                <Palette size={18} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                CSS Gradient Generator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 pt-1">
              {language === 'en'
                ? 'Create smooth linear and radial CSS gradients for modern UI components.'
                : 'Desain gradien warna linear & radial halus untuk antarmuka pengguna modern.'}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6 bg-white dark:bg-zinc-900/90 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 pb-3 border-b border-stone-100 dark:border-zinc-800">
            <Sliders size={14} />
            <span>{language === 'en' ? 'Gradient Controls' : 'Pengaturan Gradien'}</span>
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              Gradient Type
            </label>
            <div className="grid grid-cols-2 gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
              <button
                onClick={() => setType('linear')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  type === 'linear'
                    ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setType('radial')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  type === 'radial'
                    ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400'
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {/* Angle Slider (Linear only) */}
          {type === 'linear' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
                <span>Angle Position</span>
                <span className="font-mono text-stone-900 dark:text-zinc-100 font-bold">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={e => setAngle(parseInt(e.target.value) || 0)}
                className="w-full accent-stone-900 dark:accent-zinc-100 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-lg"
              />
            </div>
          )}

          {/* Color Stops Pickers */}
          <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-zinc-800">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              Color Stops
            </label>

            {/* Color 1 */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-800">
              <input
                type="color"
                value={color1}
                onChange={e => setColor1(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={color1}
                onChange={e => setColor1(e.target.value)}
                className="flex-1 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono uppercase text-stone-900 dark:text-zinc-100"
              />
              <span className="text-[10px] font-mono text-stone-400">Start</span>
            </div>

            {/* Color 3 (Optional Via) */}
            {useColor3 && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-800">
                <input
                  type="color"
                  value={color3}
                  onChange={e => setColor3(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={color3}
                  onChange={e => setColor3(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono uppercase text-stone-900 dark:text-zinc-100"
                />
                <button
                  onClick={() => setUseColor3(false)}
                  className="text-[10px] text-rose-500 font-mono hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Color 2 */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-800">
              <input
                type="color"
                value={color2}
                onChange={e => setColor2(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={color2}
                onChange={e => setColor2(e.target.value)}
                className="flex-1 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono uppercase text-stone-900 dark:text-zinc-100"
              />
              <span className="text-[10px] font-mono text-stone-400">End</span>
            </div>

            {!useColor3 && (
              <button
                onClick={() => setUseColor3(true)}
                className="text-xs text-stone-600 dark:text-zinc-400 font-medium hover:text-stone-950 dark:hover:text-white transition-colors underline decoration-dashed"
              >
                + Add Middle Color Stop (Via)
              </button>
            )}
          </div>

          {/* Preset Palettes */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              Curated Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="p-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950/50 hover:border-stone-400 dark:hover:border-zinc-600 transition-all text-left space-y-1.5 group"
                >
                  <div
                    className="h-8 rounded-lg border border-stone-200/50 dark:border-zinc-700/50 transition-transform group-hover:scale-98"
                    style={{
                      background: p.type === 'linear'
                        ? `linear-gradient(${p.angle}deg, ${p.color1}, ${p.color3 || p.color2})`
                        : `radial-gradient(circle at center, ${p.color1}, ${p.color2})`,
                    }}
                  />
                  <span className="text-[10px] font-semibold text-stone-800 dark:text-zinc-300 truncate block">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview & Code Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Canvas Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 dark:text-zinc-400 block uppercase tracking-wider font-mono">
              Live Preview
            </label>
            <div
              className="w-full h-64 sm:h-80 rounded-3xl shadow-lg border border-stone-200/80 dark:border-zinc-800 flex items-center justify-center p-6 text-center transition-all duration-300"
              style={{ background: cssValue }}
            >
              <div className="bg-zinc-950/80 backdrop-blur-md px-6 py-4 rounded-2xl text-zinc-100 border border-white/10 shadow-2xl space-y-1">
                <span className="text-sm font-bold block tracking-tight">Gradient Canvas</span>
                <span className="text-xs font-mono text-zinc-400 block">{color1} → {color2}</span>
              </div>
            </div>
          </div>

          {/* Export Code Card */}
          <div className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
                <button
                  onClick={() => setActiveTab('css')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'css'
                      ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                >
                  CSS Code
                </button>
                <button
                  onClick={() => setActiveTab('tailwind')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'tailwind'
                      ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                >
                  Tailwind CSS
                </button>
                <button
                  onClick={() => setActiveTab('react')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'react'
                      ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                >
                  React Object
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-xs font-semibold shadow-xs hover:opacity-90"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={outputCode}
              rows={4}
              className="w-full p-4 rounded-xl bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed border border-zinc-800 focus:outline-none select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
