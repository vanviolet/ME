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
  Compass,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Type,
  Maximize2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PresetGradient {
  name: string;
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  color1: string;
  color2: string;
  color3?: string;
  stop1: number;
  stop2: number;
  stop3?: number;
}

const PRESETS: PresetGradient[] = [
  {
    name: 'Sunset Rose',
    type: 'linear',
    angle: 90,
    color1: '#f43f5e',
    color2: '#fb923c',
    stop1: 0,
    stop2: 100,
  },
  {
    name: 'Cyberpunk Neon',
    type: 'linear',
    angle: 135,
    color1: '#ec4899',
    color2: '#8b5cf6',
    color3: '#3b82f6',
    stop1: 0,
    stop2: 100,
    stop3: 50,
  },
  {
    name: 'Emerald Lush',
    type: 'linear',
    angle: 135,
    color1: '#059669',
    color2: '#10b981',
    stop1: 0,
    stop2: 100,
  },
  {
    name: 'Midnight Abyss',
    type: 'linear',
    angle: 180,
    color1: '#090d16',
    color2: '#1e1b4b',
    stop1: 0,
    stop2: 100,
  },
  {
    name: 'Aurora Borealis',
    type: 'linear',
    angle: 120,
    color1: '#06b6d4',
    color2: '#10b981',
    color3: '#6366f1',
    stop1: 0,
    stop2: 100,
    stop3: 50,
  },
  {
    name: 'Conic Spectrum',
    type: 'conic',
    angle: 0,
    color1: '#f43f5e',
    color2: '#3b82f6',
    color3: '#10b981',
    stop1: 0,
    stop2: 100,
    stop3: 50,
  },
];

const PRESET_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export const CssGradientPage: React.FC = () => {
  const { language } = usePortfolio();

  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState<number>(135);
  const [color1, setColor1] = useState<string>('#f43f5e');
  const [stop1, setStop1] = useState<number>(0);
  const [color2, setColor2] = useState<string>('#fb923c');
  const [stop2, setStop2] = useState<number>(100);
  const [useColor3, setUseColor3] = useState<boolean>(false);
  const [color3, setColor3] = useState<string>('#8b5cf6');
  const [stop3, setStop3] = useState<number>(50);

  const [activeTab, setActiveTab] = useState<'css' | 'tailwind' | 'react'>('css');
  const [previewComponent, setPreviewComponent] = useState<'canvas' | 'card' | 'text' | 'button' | 'phone'>('canvas');
  const [copied, setCopied] = useState<boolean>(false);

  // Computed CSS Gradient String
  const cssValue = useMemo(() => {
    if (type === 'linear') {
      return useColor3
        ? `linear-gradient(${angle}deg, ${color1} ${stop1}%, ${color3} ${stop3}%, ${color2} ${stop2}%)`
        : `linear-gradient(${angle}deg, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    } else if (type === 'radial') {
      return useColor3
        ? `radial-gradient(circle at center, ${color1} ${stop1}%, ${color3} ${stop3}%, ${color2} ${stop2}%)`
        : `radial-gradient(circle at center, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    } else {
      // Conic
      return useColor3
        ? `conic-gradient(from ${angle}deg at 50% 50%, ${color1} ${stop1}%, ${color3} ${stop3}%, ${color2} ${stop2}%)`
        : `conic-gradient(from ${angle}deg at 50% 50%, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    }
  }, [type, angle, color1, stop1, color2, stop2, color3, stop3, useColor3]);

  // Computed Tailwind approximation
  const tailwindValue = useMemo(() => {
    if (type === 'linear') {
      const dirMap: { [key: number]: string } = {
        0: 'to-t',
        45: 'to-tr',
        90: 'to-r',
        135: 'to-br',
        180: 'to-b',
        225: 'to-bl',
        270: 'to-l',
        315: 'to-tl',
      };
      const dir = dirMap[angle] || 'to-r';
      return `bg-gradient-${dir} from-[${color1}] ${useColor3 ? `via-[${color3}] ` : ''}to-[${color2}]`;
    }
    return `[background:${cssValue}]`;
  }, [type, angle, color1, color2, color3, useColor3, cssValue]);

  // Computed React Style Object String
  const reactStyleValue = useMemo(() => {
    return `const gradientStyle: React.CSSProperties = {\n  backgroundImage: '${cssValue}',\n};`;
  }, [cssValue]);

  const outputCode = useMemo(() => {
    if (activeTab === 'tailwind') return tailwindValue;
    if (activeTab === 'react') return reactStyleValue;
    return `background-image: ${cssValue};`;
  }, [activeTab, cssValue, tailwindValue, reactStyleValue]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (p: PresetGradient) => {
    setType(p.type);
    setAngle(p.angle);
    setColor1(p.color1);
    setStop1(p.stop1);
    setColor2(p.color2);
    setStop2(p.stop2);
    if (p.color3) {
      setUseColor3(true);
      setColor3(p.color3);
      setStop3(p.stop3 || 50);
    } else {
      setUseColor3(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'Interactive CSS Gradient Generator & UI Simulator — Tools'
            : 'Generator Gradien CSS & Simulator Komponen UI — Tools'
        }
        description={
          language === 'en'
            ? 'Design linear, radial, and conic CSS gradients with multi-stop color controls, angle dial, and real-world UI previews on cards, buttons, text, and phone mockups.'
            : 'Rancang gradien CSS linear, radial, dan conic dengan pengaturan multi-stop, dial sudut interaktif, dan simulasi pratinjau komponen UI nyata.'
        }
        url="/tools/css-gradient"
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
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">CSS Gradient Studio</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Palette size={14} />
            <span>{language === 'en' ? 'CSS3 & Tailwind Visualizer' : 'Visualizer CSS3 & Tailwind'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            CSS Gradient Studio & Simulator
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Craft linear, radial, and conic gradients with interactive multi-stop color pickers, an angle compass dial, and live previews across cards, text headers, buttons, and mobile screens.'
              : 'Buat gradien CSS modern dengan kontrol multi-stop, kompas sudut interaktif, dan simulator langsung pada komponen kartu, tombol CTA, tipografi gradien, serta layar perangkat.'}
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

      {/* Preset Library Quick Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono mr-1">
            {language === 'en' ? 'Curated Palettes:' : 'Palet Pilihan:'}
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:border-rose-400 transition-colors bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-black/10 shadow-2xs"
                style={{
                  background: `linear-gradient(135deg, ${p.color1}, ${p.color3 || p.color2})`,
                }}
              />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Controls & Sliders (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-5">
          {/* Gradient Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
              {language === 'en' ? 'Gradient Style' : 'Tipe Gradien'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
              {(['linear', 'radial', 'conic'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-1.5 rounded-lg capitalize transition-all ${
                    type === t
                      ? 'bg-rose-500 text-white font-bold shadow-xs'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Angle Dial & Presets (for linear & conic) */}
          {type !== 'radial' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Compass size={13} className="text-rose-500" />
                  <span>{language === 'en' ? 'Angle Direction' : 'Sudat Arah'}: {angle}°</span>
                </label>
              </div>

              {/* Angle Slider */}
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />

              {/* Quick Angle Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {PRESET_ANGLES.map(deg => (
                  <button
                    key={deg}
                    onClick={() => setAngle(deg)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                      angle === deg
                        ? 'bg-rose-500 text-white border-rose-500 font-bold'
                        : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Stops */}
          <div className="space-y-3 pt-1 border-t border-stone-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono block">
              {language === 'en' ? 'Color Stops' : 'Titik Warna & Posisi'}
            </span>

            {/* Stop 1 */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
                  Color #1 (Start)
                </span>
                <span className="font-mono text-xs text-stone-500">{stop1}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color1}
                  onChange={e => setColor1(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={e => setColor1(e.target.value)}
                  className="w-24 px-2 py-1 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop1}
                  onChange={e => setStop1(Number(e.target.value))}
                  className="flex-1 h-2 bg-stone-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>
            </div>

            {/* Stop 3 (Middle / Optional) */}
            {useColor3 && (
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Color #3 (Middle Stop)
                  </span>
                  <span className="font-mono text-xs text-stone-500">{stop3}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color3}
                    onChange={e => setColor3(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={color3}
                    onChange={e => setColor3(e.target.value)}
                    className="w-24 px-2 py-1 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop3}
                    onChange={e => setStop3(Number(e.target.value))}
                    className="flex-1 h-2 bg-stone-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                </div>
              </div>
            )}

            {/* Stop 2 */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
                  Color #2 (End)
                </span>
                <span className="font-mono text-xs text-stone-500">{stop2}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color2}
                  onChange={e => setColor2(e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={e => setColor2(e.target.value)}
                  className="w-24 px-2 py-1 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop2}
                  onChange={e => setStop2(Number(e.target.value))}
                  className="flex-1 h-2 bg-stone-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>
            </div>

            <button
              onClick={() => setUseColor3(!useColor3)}
              className="w-full py-2 rounded-xl border border-dashed border-stone-300 dark:border-zinc-700 hover:border-rose-400 text-xs font-semibold text-stone-600 dark:text-zinc-400 transition-colors"
            >
              {useColor3
                ? language === 'en'
                  ? '- Remove Middle Color Stop'
                  : '- Hapus Titik Warna Tengah'
                : language === 'en'
                ? '+ Add 3rd Color Stop (Multi-Color)'
                : '+ Tambah Titik Warna ke-3'}
            </button>
          </div>
        </div>

        {/* Right: Interactive UI Simulator & Code Output (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-5">
          {/* Simulator Component Selector */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Eye size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'UI Component Simulator' : 'Simulator Komponen UI'}</span>
            </span>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
              {[
                { id: 'canvas', label: 'Canvas', icon: Maximize2 },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'text', label: 'Text', icon: Type },
                { id: 'phone', label: 'Phone', icon: Smartphone },
              ].map(comp => {
                const Icon = comp.icon;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setPreviewComponent(comp.id as any)}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                      previewComponent === comp.id
                        ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{comp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="min-h-[260px] flex items-center justify-center p-6 rounded-2xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 overflow-hidden">
            {previewComponent === 'canvas' && (
              <div
                className="w-full h-64 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center text-white font-mono text-xs font-bold"
                style={{ backgroundImage: cssValue }}
              >
                <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
                  {type.toUpperCase()} • {angle}°
                </div>
              </div>
            )}

            {previewComponent === 'card' && (
              <div
                className="w-full max-w-sm p-6 rounded-2xl shadow-xl text-white space-y-4 transition-all duration-300"
                style={{ backgroundImage: cssValue }}
              >
                <div className="flex items-center justify-between">
                  <CreditCard size={24} />
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">PLATINUM</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] opacity-80 block">Current Balance</span>
                  <div className="text-2xl font-bold font-mono">$48,920.00</div>
                </div>
                <div className="flex items-center justify-between text-xs font-mono opacity-90 pt-2">
                  <span>MUCHAMAD IRVAN</span>
                  <span>09 / 28</span>
                </div>
              </div>
            )}

            {previewComponent === 'text' && (
              <div className="text-center space-y-2 p-4">
                <h2
                  className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent transition-all duration-300"
                  style={{ backgroundImage: cssValue }}
                >
                  Create Without Limits
                </h2>
                <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-md mx-auto">
                  Demonstrating gradient clipping on typography for high-impact display headlines.
                </p>
              </div>
            )}

            {previewComponent === 'phone' && (
              <div className="w-56 h-80 rounded-3xl border-4 border-stone-800 dark:border-zinc-700 shadow-2xl overflow-hidden relative flex flex-col justify-between p-4 text-white">
                <div
                  className="absolute inset-0 -z-10 transition-all duration-300"
                  style={{ backgroundImage: cssValue }}
                />
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span>9:41</span>
                  <span>5G • 100%</span>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-light font-mono">09:41</div>
                  <div className="text-[11px] opacity-80">Wednesday, September 15</div>
                </div>
                <div className="w-20 h-1 bg-white/70 rounded-full mx-auto" />
              </div>
            )}
          </div>

          {/* Code Export Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
                {(['css', 'tailwind', 'react'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                      activeTab === tab
                        ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100 overflow-x-auto leading-relaxed whitespace-pre select-all">
              {outputCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
