import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Calendar,
  Globe,
  Pause,
  Play,
  ArrowRightLeft,
  Sparkles,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TIMEZONE_LIST = [
  { name: 'WIB (Waktu Indonesia Barat)', city: 'Jakarta, Bandung, Surabaya', tz: 'Asia/Jakarta', offset: 'UTC+7' },
  { name: 'WITA (Waktu Indonesia Tengah)', city: 'Denpasar, Makassar, Balikpapan', tz: 'Asia/Makassar', offset: 'UTC+8' },
  { name: 'WIT (Waktu Indonesia Timur)', city: 'Jayapura, Ambon', tz: 'Asia/Jayapura', offset: 'UTC+9' },
  { name: 'UTC / GMT', city: 'Coordinated Universal Time', tz: 'UTC', offset: 'UTC+0' },
  { name: 'SGT (Singapore Time)', city: 'Singapore, Kuala Lumpur', tz: 'Asia/Singapore', offset: 'UTC+8' },
  { name: 'JST (Japan Standard Time)', city: 'Tokyo, Kyoto, Osaka', tz: 'Asia/Tokyo', offset: 'UTC+9' },
  { name: 'EST (Eastern Standard Time)', city: 'New York, Toronto, Miami', tz: 'America/New_York', offset: 'UTC-5' },
  { name: 'PST (Pacific Standard Time)', city: 'San Francisco, Los Angeles, Seattle', tz: 'America/Los_Angeles', offset: 'UTC-8' },
  { name: 'CET (Central European Time)', city: 'Berlin, Paris, Amsterdam', tz: 'Europe/Berlin', offset: 'UTC+1' },
];

function getRelativeTime(timestampMs: number, isEn: boolean): string {
  const now = Date.now();
  const diffSec = Math.round((timestampMs - now) / 1000);
  const isPast = diffSec < 0;
  const absSec = Math.abs(diffSec);

  if (absSec < 5) return isEn ? 'Just now' : 'Baru saja';
  if (absSec < 60) return isEn ? `${absSec} seconds ${isPast ? 'ago' : 'from now'}` : `${absSec} detik ${isPast ? 'yang lalu' : 'mendatang'}`;

  const absMin = Math.round(absSec / 60);
  if (absMin < 60) return isEn ? `${absMin} minute${absMin > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}` : `${absMin} menit ${isPast ? 'yang lalu' : 'lagi'}`;

  const absHours = Math.round(absMin / 60);
  if (absHours < 24) return isEn ? `${absHours} hour${absHours > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}` : `${absHours} jam ${isPast ? 'yang lalu' : 'lagi'}`;

  const absDays = Math.round(absHours / 24);
  if (absDays < 30) return isEn ? `${absDays} day${absDays > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}` : `${absDays} hari ${isPast ? 'yang lalu' : 'lagi'}`;

  const absMonths = Math.round(absDays / 30);
  return isEn ? `${absMonths} month${absMonths > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}` : `${absMonths} bulan ${isPast ? 'yang lalu' : 'lagi'}`;
}

export const TimestampConverterPage: React.FC = () => {
  const { language } = usePortfolio();

  // Live ticking clock state
  const [liveNow, setLiveNow] = useState<number>(Date.now());
  const [isClockRunning, setIsClockRunning] = useState<boolean>(true);

  // User input states
  const [timestampInput, setTimestampInput] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [inputUnit, setInputUnit] = useState<'seconds' | 'milliseconds'>('seconds');

  // Date picker state (YYYY-MM-DDTHH:mm)
  const [datePickerValue, setDatePickerValue] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live clock interval
  useEffect(() => {
    if (!isClockRunning) return;
    const interval = setInterval(() => {
      setLiveNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockRunning]);

  // Derived Target Date from timestampInput
  const targetDate = useMemo(() => {
    const raw = timestampInput.trim();
    if (!raw || isNaN(Number(raw))) return null;
    let ms = Number(raw);
    if (inputUnit === 'seconds') {
      ms = ms * 1000;
    }
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [timestampInput, inputUnit]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSetToNow = () => {
    const nowMs = Date.now();
    setTimestampInput(inputUnit === 'seconds' ? Math.floor(nowMs / 1000).toString() : nowMs.toString());
    const d = new Date(nowMs);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setDatePickerValue(d.toISOString().slice(0, 16));
  };

  const handleAdjustTime = (offsetMs: number) => {
    if (!targetDate) return;
    const newMs = targetDate.getTime() + offsetMs;
    setTimestampInput(inputUnit === 'seconds' ? Math.floor(newMs / 1000).toString() : newMs.toString());
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDatePickerValue(val);
    if (!val) return;
    const picked = new Date(val);
    if (!isNaN(picked.getTime())) {
      setTimestampInput(inputUnit === 'seconds' ? Math.floor(picked.getTime() / 1000).toString() : picked.getTime().toString());
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'Unix Timestamp & Multi-Timezone Studio — Muchamad Irvan' : 'Konverter Unix Timestamp & Zona Waktu — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Live ticking Unix epoch clock, two-way date converter, and multi-timezone matrix (WIB, WITA, WIT, UTC, JST, PST, EST).'
            : 'Jam Unix epoch live, konverter dua arah tanggal ke timestamp, dan perbandingan zona waktu lengkap (WIB, WITA, WIT, UTC, JST, PST).'
        }
        url="/tools/timestamp-converter"
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
              <Clock size={13} />
              <span>Unix & Timezone Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Unix Timestamp & Timezone Converter' : 'Konverter Unix Timestamp & Zona Waktu'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Convert seconds and milliseconds to human-readable dates and inspect real-time international timezones.'
              : 'Konversi detik dan milidetik Epoch ke format tanggal dan bandingkan zona waktu internasional (WIB, WITA, WIT, UTC) secara instan.'}
          </p>
        </div>

        <button
          onClick={handleSetToNow}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs"
        >
          <Zap size={14} />
          <span>{language === 'en' ? 'Reset to Now' : 'Set ke Waktu Sekarang'}</span>
        </button>
      </div>

      {/* Live Ticking Clock Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isClockRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
              {language === 'en' ? 'Current Epoch Unix Time' : 'Waktu Unix Epoch Saat Ini'}
            </span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-zinc-100 tracking-tight">
              {Math.floor(liveNow / 1000)}
            </span>
            <span className="font-mono text-sm text-stone-500 dark:text-zinc-400">
              ({liveNow} ms)
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-zinc-400">
            {new Date(liveNow).toUTCString()}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsClockRunning(!isClockRunning)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-medium text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors"
          >
            {isClockRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isClockRunning ? (language === 'en' ? 'Pause' : 'Jeda') : (language === 'en' ? 'Resume' : 'Lanjutkan')}</span>
          </button>
          <button
            onClick={() => handleCopy(Math.floor(liveNow / 1000).toString(), 'live-sec')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-zinc-100 text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            {copiedKey === 'live-sec' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedKey === 'live-sec' ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Copy Epoch' : 'Salin Epoch')}</span>
          </button>
        </div>
      </div>

      {/* Two-way Converter Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Controls */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
              <ArrowRightLeft size={16} className="text-rose-500" />
              <span>{language === 'en' ? 'Timestamp Input' : 'Input Nilai Timestamp'}</span>
            </h3>

            {/* Unit Selector */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => {
                  if (inputUnit !== 'seconds') {
                    setInputUnit('seconds');
                    setTimestampInput(Math.floor(Number(timestampInput) / 1000).toString());
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  inputUnit === 'seconds'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                {language === 'en' ? 'Seconds (s)' : 'Detik (s)'}
              </button>
              <button
                onClick={() => {
                  if (inputUnit !== 'milliseconds') {
                    setInputUnit('milliseconds');
                    setTimestampInput((Number(timestampInput) * 1000).toString());
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  inputUnit === 'milliseconds'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                {language === 'en' ? 'Milliseconds (ms)' : 'Milidetik (ms)'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
              {language === 'en' ? 'Epoch Number' : 'Angka Epoch'}
            </label>
            <input
              type="text"
              value={timestampInput}
              onChange={e => setTimestampInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 font-mono text-lg font-bold text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. 1789045168"
            />
          </div>

          {/* Quick Adjustment Offsets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 dark:text-zinc-400 block">
              {language === 'en' ? 'Quick Time Offsets' : 'Geser Waktu Cepat'}
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => handleAdjustTime(-3600000)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:border-rose-400 text-stone-700 dark:text-zinc-300 transition-colors"
              >
                -1 Hour
              </button>
              <button
                onClick={() => handleAdjustTime(3600000)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:border-rose-400 text-stone-700 dark:text-zinc-300 transition-colors"
              >
                +1 Hour
              </button>
              <button
                onClick={() => handleAdjustTime(-86400000)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:border-rose-400 text-stone-700 dark:text-zinc-300 transition-colors"
              >
                -1 Day
              </button>
              <button
                onClick={() => handleAdjustTime(86400000)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:border-rose-400 text-stone-700 dark:text-zinc-300 transition-colors"
              >
                +1 Day
              </button>
              <button
                onClick={() => handleAdjustTime(86400000 * 7)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:border-rose-400 text-stone-700 dark:text-zinc-300 transition-colors"
              >
                +7 Days
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Or pick a specific calendar date & time:' : 'Atau pilih tanggal & jam dari kalender:'}</span>
            </label>
            <input
              type="datetime-local"
              value={datePickerValue}
              onChange={handleDatePickerChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-medium text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Right: Human Formats Output */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <span>{language === 'en' ? 'Parsed Date Formats' : 'Format Tanggal Terjemahan'}</span>
            </span>
            {targetDate && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {getRelativeTime(targetDate.getTime(), language === 'en')}
              </span>
            )}
          </h3>

          {targetDate ? (
            <div className="space-y-3 text-xs">
              {/* Local Date */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400">
                    {language === 'en' ? 'Local Time' : 'Waktu Lokal'}
                  </div>
                  <div className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                    {targetDate.toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
                      dateStyle: 'full',
                      timeStyle: 'long',
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(targetDate.toLocaleString(), 'local')}
                  className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                >
                  {copiedKey === 'local' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>

              {/* UTC / GMT */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400">UTC / GMT (RFC 2822)</div>
                  <div className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                    {targetDate.toUTCString()}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(targetDate.toUTCString(), 'utc')}
                  className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                >
                  {copiedKey === 'utc' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>

              {/* ISO 8601 */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400">ISO 8601 (Standard API Payload)</div>
                  <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {targetDate.toISOString()}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(targetDate.toISOString(), 'iso')}
                  className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                >
                  {copiedKey === 'iso' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Seconds & Milliseconds Summary */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 text-center">
                  <div className="text-[10px] text-stone-500">Epoch Seconds</div>
                  <div className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                    {Math.floor(targetDate.getTime() / 1000)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800 text-center">
                  <div className="text-[10px] text-stone-500">Epoch Milliseconds</div>
                  <div className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                    {targetDate.getTime()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-stone-500 text-xs">
              {language === 'en' ? 'Enter a valid numeric epoch timestamp' : 'Masukkan angka timestamp yang valid'}
            </div>
          )}
        </div>
      </div>

      {/* International Timezone Comparison Matrix */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'International Timezone Comparison' : 'Perbandingan Zona Waktu Internasional'}
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            {language === 'en' ? 'Calculated for selected date' : 'Dihitung untuk tanggal terpilih'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TIMEZONE_LIST.map(tzItem => {
            const dateObj = targetDate || new Date();
            let timeStr = '';
            let dateStr = '';
            try {
              timeStr = dateObj.toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', {
                timeZone: tzItem.tz,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              dateStr = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                timeZone: tzItem.tz,
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
            } catch {
              timeStr = '--:--:--';
            }

            return (
              <div
                key={tzItem.tz}
                className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                      {tzItem.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300">
                      {tzItem.offset}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400 line-clamp-1">
                    {tzItem.city}
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-stone-200/60 dark:border-zinc-700/60">
                  <span className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400">
                    {timeStr}
                  </span>
                  <span className="text-xs font-medium text-stone-600 dark:text-zinc-300">
                    {dateStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
