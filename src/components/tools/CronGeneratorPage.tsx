import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Calendar,
  Sparkles,
  HelpCircle,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CronPreset {
  title: string;
  titleId: string;
  cron: string;
  description: string;
  descriptionId: string;
}

const CRON_PRESETS: CronPreset[] = [
  {
    title: 'Every Minute',
    titleId: 'Setiap Menit',
    cron: '* * * * *',
    description: 'Runs every single minute',
    descriptionId: 'Dijalankan setiap 1 menit sekali',
  },
  {
    title: 'Every 5 Minutes',
    titleId: 'Setiap 5 Menit',
    cron: '*/5 * * * *',
    description: 'Runs at minute :00, :05, :10, etc.',
    descriptionId: 'Dijalankan pada menit ke-0, 5, 10, dst.',
  },
  {
    title: 'Every 15 Minutes',
    titleId: 'Setiap 15 Menit',
    cron: '*/15 * * * *',
    description: 'Quarterly hourly execution',
    descriptionId: 'Dijalankan setiap kelipatan 15 menit',
  },
  {
    title: 'Every Hour on the Hour',
    titleId: 'Setiap Jam Tepat (:00)',
    cron: '0 * * * *',
    description: 'Runs at minute 0 of every hour',
    descriptionId: 'Dijalankan pada menit ke-0 setiap jam',
  },
  {
    title: 'Every Day at Midnight (00:00)',
    titleId: 'Setiap Hari Tengah Malam (00:00)',
    cron: '0 0 * * *',
    description: 'Runs daily at 00:00 UTC/Local',
    descriptionId: 'Dijalankan setiap hari pukul 00:00',
  },
  {
    title: 'Weekdays at 09:00 AM',
    titleId: 'Hari Kerja Pukul 09:00 Pagi',
    cron: '0 9 * * 1-5',
    description: 'Monday through Friday at 09:00',
    descriptionId: 'Senin hingga Jumat tepat pukul 09:00',
  },
  {
    title: 'Work Hours Every 30 Mins',
    titleId: 'Jam Kerja Setiap 30 Menit',
    cron: '*/30 9-17 * * 1-5',
    description: 'Mon–Fri 09:00 to 17:00 every 30 mins',
    descriptionId: 'Senin–Jumat jam 09:00–17:00 setiap 30 menit',
  },
  {
    title: 'Every Sunday at Midnight',
    titleId: 'Setiap Hari Minggu Pukul 00:00',
    cron: '0 0 * * 0',
    description: 'Weekly on Sunday at 00:00',
    descriptionId: 'Mingguan setiap hari Minggu pukul 00:00',
  },
  {
    title: 'First Day of Every Month',
    titleId: 'Hari Pertama Setiap Bulan (00:00)',
    cron: '0 0 1 * *',
    description: 'Runs at 00:00 on the 1st of every month',
    descriptionId: 'Pukul 00:00 pada tanggal 1 setiap bulan',
  },
];

const DAYS_OF_WEEK = [
  { label: 'Sun', labelId: 'Min', val: 0 },
  { label: 'Mon', labelId: 'Sen', val: 1 },
  { label: 'Tue', labelId: 'Sel', val: 2 },
  { label: 'Wed', labelId: 'Rab', val: 3 },
  { label: 'Thu', labelId: 'Kam', val: 4 },
  { label: 'Fri', labelId: 'Jum', val: 5 },
  { label: 'Sat', labelId: 'Sab', val: 6 },
];

const MONTHS = [
  { label: 'Jan', val: 1 },
  { label: 'Feb', val: 2 },
  { label: 'Mar', val: 3 },
  { label: 'Apr', val: 4 },
  { label: 'May', val: 5 },
  { label: 'Jun', val: 6 },
  { label: 'Jul', val: 7 },
  { label: 'Aug', val: 8 },
  { label: 'Sep', val: 9 },
  { label: 'Oct', val: 10 },
  { label: 'Nov', val: 11 },
  { label: 'Dec', val: 12 },
];

// Helper to explain standard cron in human language
function explainCron(cronStr: string, isEn: boolean): { summary: string; detail: string } {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      summary: isEn ? 'Invalid Cron expression format' : 'Format ekspresi Cron tidak valid',
      detail: isEn ? 'Standard Cron must have exactly 5 fields (minute hour day month weekday)' : 'Cron standar membutuhkan tepat 5 bagian (menit jam hari bulan hari_kerja)',
    };
  }

  const [min, hour, dom, mon, dow] = parts;

  let minDesc = '';
  if (min === '*') minDesc = isEn ? 'every minute' : 'setiap menit';
  else if (min.startsWith('*/')) minDesc = isEn ? `every ${min.slice(2)} minutes` : `setiap ${min.slice(2)} menit`;
  else minDesc = isEn ? `at minute ${min}` : `pada menit ke-${min}`;

  let hourDesc = '';
  if (hour === '*') hourDesc = isEn ? 'of every hour' : 'di setiap jam';
  else if (hour.startsWith('*/')) hourDesc = isEn ? `every ${hour.slice(2)} hours` : `setiap ${hour.slice(2)} jam`;
  else if (hour.includes('-')) hourDesc = isEn ? `between ${hour.replace('-', ':00 and ')}:00` : `antara pukul ${hour.replace('-', ':00 dan ')}:00`;
  else hourDesc = isEn ? `at ${hour.padStart(2, '0')}:00` : `pukul ${hour.padStart(2, '0')}:00`;

  let domDesc = '';
  if (dom !== '*') domDesc = isEn ? `on day ${dom} of the month` : `pada tanggal ${dom}`;

  let monDesc = '';
  if (mon !== '*') monDesc = isEn ? `in month ${mon}` : `pada bulan ${mon}`;

  let dowDesc = '';
  if (dow === '1-5') dowDesc = isEn ? 'on Monday through Friday' : 'dari Senin sampai Jumat';
  else if (dow === '0,6' || dow === '6,0') dowDesc = isEn ? 'on weekends (Sat-Sun)' : 'pada akhir pekan (Sabtu-Minggu)';
  else if (dow !== '*') dowDesc = isEn ? `on day-of-week ${dow}` : `pada hari ke-${dow}`;

  const summary = isEn
    ? `Runs ${minDesc} ${hourDesc}${domDesc ? `, ${domDesc}` : ''}${monDesc ? `, ${monDesc}` : ''}${dowDesc ? `, ${dowDesc}` : ''}.`
    : `Dijalankan ${minDesc} ${hourDesc}${domDesc ? `, ${domDesc}` : ''}${monDesc ? `, ${monDesc}` : ''}${dowDesc ? `, ${dowDesc}` : ''}.`;

  const detail = isEn
    ? `Minute: [${min}], Hour: [${hour}], Day of Month: [${dom}], Month: [${mon}], Day of Week: [${dow}]`
    : `Menit: [${min}], Jam: [${hour}], Tanggal: [${dom}], Bulan: [${mon}], Hari: [${dow}]`;

  return { summary, detail };
}

// Calculate next N run dates based on cron
function calculateNextRuns(cronStr: string, count = 5): Date[] {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minP, hourP, domP, monP, dowP] = parts;

  function matches(val: number, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.startsWith('*/')) {
      const step = parseInt(pattern.slice(2), 10);
      return !isNaN(step) && step > 0 && val % step === 0;
    }
    if (pattern.includes(',')) {
      return pattern.split(',').some(p => matches(val, p));
    }
    if (pattern.includes('-')) {
      const [start, end] = pattern.split('-').map(Number);
      return val >= start && val <= end;
    }
    return Number(pattern) === val;
  }

  const results: Date[] = [];
  const current = new Date();
  // Move to next minute boundary
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  // Lookahead up to 60 days
  while (results.length < count && iterations < 90000) {
    iterations++;
    const minute = current.getMinutes();
    const hour = current.getHours();
    const dom = current.getDate();
    const month = current.getMonth() + 1;
    const dow = current.getDay();

    if (
      matches(minute, minP) &&
      matches(hour, hourP) &&
      matches(dom, domP) &&
      matches(month, monP) &&
      matches(dow, dowP)
    ) {
      results.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

export const CronGeneratorPage: React.FC = () => {
  const { language } = usePortfolio();

  const [cronExpression, setCronExpression] = useState<string>('*/15 * * * *');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'minutes' | 'hours' | 'dom' | 'months' | 'dow'>('minutes');
  const [commandScript, setCommandScript] = useState<string>('/usr/bin/curl -s https://api.myservice.com/cron-job');

  // Breakdown of parts
  const parts = useMemo(() => {
    const p = cronExpression.trim().split(/\s+/);
    if (p.length === 5) {
      return { min: p[0], hour: p[1], dom: p[2], mon: p[3], dow: p[4] };
    }
    return { min: '*', hour: '*', dom: '*', mon: '*', dow: '*' };
  }, [cronExpression]);

  const updatePart = (field: 'min' | 'hour' | 'dom' | 'mon' | 'dow', val: string) => {
    const current = cronExpression.trim().split(/\s+/);
    while (current.length < 5) current.push('*');
    const map = { min: 0, hour: 1, dom: 2, mon: 3, dow: 4 };
    current[map[field]] = val;
    setCronExpression(current.join(' '));
  };

  const explanation = useMemo(() => {
    return explainCron(cronExpression, language === 'en');
  }, [cronExpression, language]);

  const nextRuns = useMemo(() => {
    return calculateNextRuns(cronExpression, 6);
  }, [cronExpression]);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'Visual Cron Expression Generator & Explainer — Muchamad Irvan' : 'Generator & Penjelas Ekspresi Cron — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Interactive visual Cron schedule builder, human-readable translator, and next execution calendar calculator.'
            : 'Pembuat jadwal Cron visual interaktif, penerjemah bahasa manusia, dan kalkulator perkiraan jadwal eksekusi berikutnya.'
        }
        url="/tools/cron-generator"
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
              <Clock size={13} />
              <span>DevOps & Crontab Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Visual Cron Expression Generator' : 'Generator Ekspresi Cron Visual'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Easily construct, edit, and translate Crontab schedule expressions into human-readable language with live upcoming run schedules.'
              : 'Buat, ubah, dan terjemahkan jadwal ekspresi Crontab ke bahasa sehari-hari lengkap dengan daftar waktu eksekusi mendatang.'}
          </p>
        </div>

        {/* Copy expression button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleCopy(cronExpression)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy Cron' : 'Salin Cron')}</span>
          </button>
        </div>
      </div>

      {/* Main Display Card: Cron Expression & Human Translation */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
            {language === 'en' ? 'Live Cron Expression' : 'Ekspresi Cron Aktif'}
          </label>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{language === 'en' ? 'Two-way interactive' : 'Interaktif dua arah'}</span>
          </div>
        </div>

        {/* Big Cron Text Input */}
        <div className="relative">
          <input
            type="text"
            value={cronExpression}
            onChange={e => setCronExpression(e.target.value)}
            className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 font-mono text-xl sm:text-2xl font-bold tracking-widest text-center text-rose-600 dark:text-rose-400 focus:outline-none focus:border-rose-500 transition-colors"
            placeholder="* * * * *"
          />
        </div>

        {/* 5 Field Sub-labels */}
        <div className="grid grid-cols-5 gap-1 text-center text-[10px] sm:text-xs font-mono text-stone-500 dark:text-zinc-400">
          <div className="p-1 rounded bg-stone-100 dark:bg-zinc-800/60">
            <span className="block font-semibold text-stone-800 dark:text-zinc-200">{parts.min}</span>
            <span>{language === 'en' ? 'minute' : 'menit'}</span>
          </div>
          <div className="p-1 rounded bg-stone-100 dark:bg-zinc-800/60">
            <span className="block font-semibold text-stone-800 dark:text-zinc-200">{parts.hour}</span>
            <span>{language === 'en' ? 'hour' : 'jam'}</span>
          </div>
          <div className="p-1 rounded bg-stone-100 dark:bg-zinc-800/60">
            <span className="block font-semibold text-stone-800 dark:text-zinc-200">{parts.dom}</span>
            <span>{language === 'en' ? 'day (month)' : 'tgl (bln)'}</span>
          </div>
          <div className="p-1 rounded bg-stone-100 dark:bg-zinc-800/60">
            <span className="block font-semibold text-stone-800 dark:text-zinc-200">{parts.mon}</span>
            <span>{language === 'en' ? 'month' : 'bulan'}</span>
          </div>
          <div className="p-1 rounded bg-stone-100 dark:bg-zinc-800/60">
            <span className="block font-semibold text-stone-800 dark:text-zinc-200">{parts.dow}</span>
            <span>{language === 'en' ? 'day (week)' : 'hari (mgg)'}</span>
          </div>
        </div>

        {/* Human Readable Explanation Box */}
        <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-3">
          <Sparkles size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-rose-900 dark:text-rose-300 uppercase tracking-wide">
              {language === 'en' ? 'Human-Readable Schedule' : 'Jadwal Terjemahan Bahasa Manusia'}
            </h4>
            <p className="text-sm sm:text-base font-medium text-stone-900 dark:text-zinc-100 leading-snug">
              &ldquo;{explanation.summary}&rdquo;
            </p>
            <p className="text-xs font-mono text-rose-700 dark:text-rose-400/80">
              {explanation.detail}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Preset Library */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" />
          <span>{language === 'en' ? 'Common Schedule Presets' : 'Preset Jadwal Populer'}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
          {CRON_PRESETS.map(preset => (
            <button
              key={preset.cron + preset.title}
              onClick={() => setCronExpression(preset.cron)}
              className={`p-3 rounded-xl border text-left transition-all ${
                cronExpression === preset.cron
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-1 ring-rose-500 shadow-xs'
                  : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-300 dark:hover:border-rose-900'
              }`}
            >
              <div className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                {preset.cron}
              </div>
              <div className="text-xs font-semibold text-stone-900 dark:text-zinc-100 mt-1">
                {language === 'en' ? preset.title : preset.titleId}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                {language === 'en' ? preset.description : preset.descriptionId}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Builder Tabs */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 p-2 flex overflow-x-auto gap-1">
          {[
            { id: 'minutes', label: language === 'en' ? '1. Minutes (0-59)' : '1. Menit (0-59)' },
            { id: 'hours', label: language === 'en' ? '2. Hours (0-23)' : '2. Jam (0-23)' },
            { id: 'dom', label: language === 'en' ? '3. Day of Month (1-31)' : '3. Tanggal (1-31)' },
            { id: 'months', label: language === 'en' ? '4. Month (1-12)' : '4. Bulan (1-12)' },
            { id: 'dow', label: language === 'en' ? '5. Day of Week' : '5. Hari Kerja' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs border border-stone-200/80 dark:border-zinc-700'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* TAB 1: MINUTES */}
          {activeTab === 'minutes' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updatePart('min', '*')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.min === '*'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every Minute (*)' : 'Setiap Menit (*)'}
                </button>
                <button
                  onClick={() => updatePart('min', '*/5')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.min === '*/5'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every 5 Minutes (*/5)' : 'Setiap 5 Menit (*/5)'}
                </button>
                <button
                  onClick={() => updatePart('min', '*/15')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.min === '*/15'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every 15 Minutes (*/15)' : 'Setiap 15 Menit (*/15)'}
                </button>
                <button
                  onClick={() => updatePart('min', '*/30')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.min === '*/30'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every 30 Minutes (*/30)' : 'Setiap 30 Menit (*/30)'}
                </button>
                <button
                  onClick={() => updatePart('min', '0')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.min === '0'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Minute 0 only (0)' : 'Hanya Menit ke-0 (0)'}
                </button>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block mb-2">
                  {language === 'en' ? 'Pick Specific Minute (0 - 59):' : 'Pilih Menit Spesifik (0 - 59):'}
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto p-1">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const isSelected = parts.min === String(i);
                    return (
                      <button
                        key={i}
                        onClick={() => updatePart('min', String(i))}
                        className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-rose-400'
                        }`}
                      >
                        {String(i).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updatePart('hour', '*')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.hour === '*'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every Hour (*)' : 'Setiap Jam (*)'}
                </button>
                <button
                  onClick={() => updatePart('hour', '*/2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.hour === '*/2'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every 2 Hours (*/2)' : 'Setiap 2 Jam (*/2)'}
                </button>
                <button
                  onClick={() => updatePart('hour', '9-17')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.hour === '9-17'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Working Hours (9-17)' : 'Jam Kerja (09:00 - 17:00)'}
                </button>
                <button
                  onClick={() => updatePart('hour', '0')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.hour === '0'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Midnight (00:00)' : 'Tengah Malam (00:00)'}
                </button>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block mb-2">
                  {language === 'en' ? 'Pick Specific Hour (0 - 23):' : 'Pilih Jam Spesifik (0 - 23):'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const isSelected = parts.hour === String(i);
                    return (
                      <button
                        key={i}
                        onClick={() => updatePart('hour', String(i))}
                        className={`py-2 text-xs font-mono font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-rose-400'
                        }`}
                      >
                        {String(i).padStart(2, '0')}:00
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAY OF MONTH */}
          {activeTab === 'dom' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updatePart('dom', '*')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.dom === '*'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every Day (*)' : 'Setiap Tanggal (*)'}
                </button>
                <button
                  onClick={() => updatePart('dom', '1')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.dom === '1'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'First Day of Month (1)' : 'Tanggal 1 (Awal Bulan)'}
                </button>
                <button
                  onClick={() => updatePart('dom', '1,15')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.dom === '1,15'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? '1st & 15th (1,15)' : 'Tanggal 1 & 15 (Bi-monthly)'}
                </button>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block mb-2">
                  {language === 'en' ? 'Pick Date (1 - 31):' : 'Pilih Tanggal (1 - 31):'}
                </label>
                <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
                  {Array.from({ length: 31 }).map((_, i) => {
                    const val = i + 1;
                    const isSelected = parts.dom === String(val);
                    return (
                      <button
                        key={val}
                        onClick={() => updatePart('dom', String(val))}
                        className={`py-2 text-xs font-mono font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-rose-400'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MONTHS */}
          {activeTab === 'months' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updatePart('mon', '*')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.mon === '*'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every Month (*)' : 'Setiap Bulan (*)'}
                </button>
                <button
                  onClick={() => updatePart('mon', '1,4,7,10')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.mon === '1,4,7,10'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Quarterly (Q1, Q2, Q3, Q4)' : 'Tiap Kuartal (Jan, Apr, Jul, Okt)'}
                </button>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block mb-2">
                  {language === 'en' ? 'Pick Specific Month:' : 'Pilih Bulan Tertentu:'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {MONTHS.map(m => {
                    const isSelected = parts.mon === String(m.val);
                    return (
                      <button
                        key={m.val}
                        onClick={() => updatePart('mon', String(m.val))}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-rose-400'
                        }`}
                      >
                        {m.label} ({m.val})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DAY OF WEEK */}
          {activeTab === 'dow' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updatePart('dow', '*')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.dow === '*'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Every Day of Week (*)' : 'Semua Hari (*)'}
                </button>
                <button
                  onClick={() => updatePart('dow', '1-5')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.dow === '1-5'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Mon-Fri (Weekdays 1-5)' : 'Hari Kerja (Senin - Jumat 1-5)'}
                </button>
                <button
                  onClick={() => updatePart('dow', '0,6')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    parts.dow === '0,6'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'border-stone-200 dark:border-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'Sat & Sun (Weekends 0,6)' : 'Akhir Pekan (Sabtu & Minggu 0,6)'}
                </button>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block mb-2">
                  {language === 'en' ? 'Pick Specific Day of Week:' : 'Pilih Hari Tertentu:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(d => {
                    const isSelected = parts.dow === String(d.val);
                    return (
                      <button
                        key={d.val}
                        onClick={() => updatePart('dow', String(d.val))}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-rose-400'
                        }`}
                      >
                        {language === 'en' ? d.label : d.labelId} ({d.val})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Execution Dates Schedule */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-rose-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Upcoming 6 Scheduled Runs' : '6 Jadwal Eksekusi Mendatang'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500 dark:text-zinc-400">
            {language === 'en' ? 'Local System Timezone' : 'Zona Waktu Komputer Lokal'}
          </span>
        </div>

        {nextRuns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {nextRuns.map((date, idx) => {
              const diffMs = date.getTime() - Date.now();
              const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
              const hours = Math.floor(diffMinutes / 60);
              const mins = diffMinutes % 60;
              const countdown =
                hours > 0
                  ? `${hours}h ${mins}m`
                  : `${mins}m`;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/70 border border-stone-200 dark:border-zinc-700/80 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                      {date.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="font-mono text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      {date.toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      {language === 'en' ? `in ~${countdown}` : `dlm ~${countdown}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
            {language === 'en'
              ? 'Could not calculate next runs. Please verify the Cron expression.'
              : 'Tidak dapat menghitung jadwal berikutnya. Mohon periksa kembali ekspresi Cron.'}
          </div>
        )}
      </div>

      {/* Crontab Command Generator Card */}
      <div className="p-5 rounded-2xl bg-stone-900 text-zinc-100 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Terminal size={15} className="text-emerald-400" />
            <span>{language === 'en' ? 'Crontab Line Preview' : 'Contoh Baris Crontab Siap Tempel'}</span>
          </div>
          <button
            onClick={() => handleCopy(`${cronExpression} ${commandScript}`)}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 p-1"
          >
            <Copy size={13} />
            <span>{language === 'en' ? 'Copy Line' : 'Salin Baris'}</span>
          </button>
        </div>
        <div className="p-3 rounded-xl bg-black/60 font-mono text-xs text-emerald-400 overflow-x-auto select-all">
          <code>{cronExpression} {commandScript}</code>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span>{language === 'en' ? 'Paste into Linux crontab via:' : 'Tempel ke crontab Linux dengan:'}</span>
          <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200">crontab -e</code>
        </div>
      </div>
    </div>
  );
};
