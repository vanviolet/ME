import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Fingerprint,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Sliders,
  Sparkles,
  Hash,
  Download,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Layers,
  FileCode,
  KeyRound,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Generation helpers
function generateCryptoRandomBytes(count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = generateCryptoRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateUuidV7(): string {
  const now = Date.now();
  const bytes = generateCryptoRandomBytes(16);

  // Timestamp 48 bits (6 bytes)
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  bytes[6] = 0x70 | (bytes[6] & 0x0f); // Version 7
  bytes[8] = 0x80 | (bytes[8] & 0x3f); // Variant 10xx

  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Crockford's Base32 for ULID
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function generateUlid(): string {
  const now = Date.now();
  let timeStr = '';
  let timeVal = now;
  for (let i = 9; i >= 0; i--) {
    const mod = timeVal % 32;
    timeStr = ENCODING.charAt(mod) + timeStr;
    timeVal = Math.floor(timeVal / 32);
  }

  const randomBytes = generateCryptoRandomBytes(10);
  let randomStr = '';
  for (let i = 0; i < 16; i++) {
    const randIndex = randomBytes[i % 10] % 32;
    randomStr += ENCODING.charAt(randIndex);
  }

  return timeStr + randomStr;
}

// Web Crypto Hash calculation
async function computeHash(algo: string, text: string): Promise<string> {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest(algo, enc.encode(text));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Compute HMAC
async function computeHmac(hashAlgo: string, secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: hashAlgo },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Extract timestamp from UUID v7
function extractTimestampFromUuidV7(uuid: string): { date: Date; ms: number } | null {
  try {
    const clean = uuid.replace(/-/g, '');
    if (clean.length !== 32) return null;
    const timeHex = clean.slice(0, 12);
    const ms = parseInt(timeHex, 16);
    if (isNaN(ms) || ms <= 0) return null;
    return { date: new Date(ms), ms };
  } catch {
    return null;
  }
}

export const UuidGeneratorPage: React.FC = () => {
  const { language } = usePortfolio();

  // Generator Options
  const [formatType, setFormatType] = useState<'uuid4' | 'uuid7' | 'ulid'>('uuid7');
  const [quantity, setQuantity] = useState<number>(5);
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [hasHyphens, setHasHyphens] = useState<boolean>(true);
  const [hasBraces, setHasBraces] = useState<boolean>(false);
  const [exportMode, setExportMode] = useState<'plain' | 'json' | 'sql'>('plain');

  // Generated results
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Hash Playground
  const [hashInput, setHashInput] = useState<string>('Hello World! 2026 Security Check');
  const [hmacSecret, setHmacSecret] = useState<string>('secret-salt-key');
  const [compareHash, setCompareHash] = useState<string>('');
  const [computedHashes, setComputedHashes] = useState<{ [key: string]: string }>({});

  // Inspector state
  const [inspectInput, setInspectInput] = useState<string>('');

  const generateBatch = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let id = '';
      if (formatType === 'uuid4') id = generateUuidV4();
      else if (formatType === 'uuid7') id = generateUuidV7();
      else id = generateUlid();

      if (formatType !== 'ulid' && !hasHyphens) {
        id = id.replace(/-/g, '');
      }

      if (isUppercase) {
        id = id.toUpperCase();
      } else {
        id = id.toLowerCase();
      }

      if (hasBraces) {
        id = `{${id}}`;
      }

      list.push(id);
    }
    setGeneratedIds(list);
    if (list.length > 0 && !inspectInput) {
      setInspectInput(list[0]);
    }
  };

  useEffect(() => {
    generateBatch();
  }, [formatType, quantity, isUppercase, hasHyphens, hasBraces]);

  // Compute hashes on input change
  useEffect(() => {
    let active = true;
    async function runHashes() {
      try {
        const sha256 = await computeHash('SHA-256', hashInput);
        const sha512 = await computeHash('SHA-512', hashInput);
        const sha1 = await computeHash('SHA-1', hashInput);
        const hmacSha256 = await computeHmac('SHA-256', hmacSecret, hashInput);

        if (active) {
          setComputedHashes({
            'SHA-256': sha256,
            'SHA-512': sha512,
            'SHA-1': sha1,
            'HMAC-SHA256': hmacSha256,
          });
        }
      } catch (err) {
        // ignore
      }
    }
    runHashes();
    return () => {
      active = false;
    };
  }, [hashInput, hmacSecret]);

  // Formatted Output for Export
  const formattedExport = useMemo(() => {
    if (exportMode === 'json') {
      return JSON.stringify(generatedIds, null, 2);
    }
    if (exportMode === 'sql') {
      const values = generatedIds.map(id => `('${id}')`).join(',\n  ');
      return `INSERT INTO records (id) VALUES\n  ${values};`;
    }
    return generatedIds.join('\n');
  }, [generatedIds, exportMode]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(formattedExport);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Timestamp inspection for UUID v7
  const inspectedTimestamp = useMemo(() => {
    if (!inspectInput.trim()) return null;
    return extractTimestampFromUuidV7(inspectInput.trim());
  }, [inspectInput]);

  // Checksum comparison
  const checksumMatch = useMemo(() => {
    if (!compareHash.trim() || !computedHashes['SHA-256']) return null;
    const cleanCompare = compareHash.trim().toLowerCase();
    const cleanComputed = computedHashes['SHA-256'].toLowerCase();
    return cleanCompare === cleanComputed;
  }, [compareHash, computedHashes]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'UUID v4, UUID v7, ULID & Crypto Hash Studio — Tools'
            : 'Generator UUID v4, UUID v7, ULID & Hash Kriptografi — Tools'
        }
        description={
          language === 'en'
            ? 'Generate cryptographic UUID v4, time-ordered UUID v7, ULID keys, inspect bit anatomy, extract timestamp, and verify SHA-256 & HMAC checksums.'
            : 'Hasilkan UUID v4, UUID v7 berurutan waktu, ULID, ekstraksi timestamp presisi, serta verifikasi checksum SHA-256 dan HMAC secara interaktif.'
        }
        url="/tools/uuid-generator"
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
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">UUID / ULID & Hash Studio</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Fingerprint size={14} />
            <span>{language === 'en' ? 'Cryptographic Identifier Studio' : 'Studio Identifier Kriptografi'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            UUID v4/v7, ULID & Hash Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Generate secure random UUID v4, database-optimized time-ordered UUID v7, sortable ULID, inspect timestamp anatomy, and verify cryptographic SHA-256 & HMAC hashes.'
              : 'Hasilkan UUID v4 acak kriptografi, UUID v7 terurut waktu untuk performa indeks database, ekstraksi timestamp milidetik, serta verifikasi hash SHA-256 & HMAC.'}
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

      {/* Format Selection Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-mono font-medium">
          <button
            onClick={() => setFormatType('uuid7')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              formatType === 'uuid7'
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Clock size={13} />
            <span>UUID v7 (Time-Ordered)</span>
          </button>

          <button
            onClick={() => setFormatType('uuid4')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              formatType === 'uuid4'
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Fingerprint size={13} />
            <span>UUID v4 (Random)</span>
          </button>

          <button
            onClick={() => setFormatType('ulid')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              formatType === 'ulid'
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Hash size={13} />
            <span>ULID (Sortable Base32)</span>
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-mono text-[11px]">Count:</span>
            {[1, 5, 10, 25].map(q => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold border transition-colors ${
                  quantity === q
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isUppercase}
              onChange={e => setIsUppercase(e.target.checked)}
              className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
            />
            <span>UPPERCASE</span>
          </label>

          {formatType !== 'ulid' && (
            <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={hasHyphens}
                onChange={e => setHasHyphens(e.target.checked)}
                className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
              />
              <span>Hyphens (-)</span>
            </label>
          )}

          <button
            onClick={generateBatch}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw size={13} />
            <span>{language === 'en' ? 'Regenerate' : 'Buat Ulang'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Generated List vs UUID Anatomy & Timestamp Extractor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Generated Identifiers List (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                {language === 'en' ? 'Generated Output' : 'Hasil Dibuat'} ({generatedIds.length})
              </span>
            </div>

            {/* Export Format Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-[11px] font-mono">
                {(['plain', 'json', 'sql'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setExportMode(m)}
                    className={`px-2 py-0.5 rounded-md uppercase font-bold transition-all ${
                      exportMode === m
                        ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-stone-500'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyAll}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                {copiedAll ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
              </button>
            </div>
          </div>

          {/* List Display */}
          {exportMode === 'plain' ? (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {generatedIds.map((id, index) => (
                <div
                  key={index}
                  onClick={() => setInspectInput(id)}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-900/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-mono text-stone-400 w-6 shrink-0">
                      #{index + 1}
                    </span>
                    <span className="font-mono text-xs text-stone-900 dark:text-zinc-100 font-semibold truncate select-all">
                      {id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleCopySingle(id, index);
                      }}
                      className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-500 transition-colors"
                      title="Copy item"
                    >
                      {copiedIndex === index ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100 overflow-auto max-h-[380px] leading-relaxed whitespace-pre">
              {formattedExport}
            </pre>
          )}
        </div>

        {/* Right: UUID Anatomy & Timestamp Extractor (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'UUID Anatomy & Timestamp Inspector' : 'Inspeksi Anatomi & Waktu UUID'}</span>
            </span>
            <p className="text-[11px] text-stone-500">
              {language === 'en'
                ? 'Inspect how bits are partitioned into timestamp, version, and randomness.'
                : 'Pahami pembagian bit UUID v7 antara waktu, versi, dan acak kriptografi.'}
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={inspectInput}
              onChange={e => setInspectInput(e.target.value)}
              placeholder="Paste any UUID v7 to extract timestamp..."
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />

            {inspectedTimestamp ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <Clock size={13} />
                  <span>
                    {language === 'en' ? 'Extracted Timestamp (UTC & Local):' : 'Waktu Terkandung:'}
                  </span>
                </div>
                <div className="font-mono text-stone-800 dark:text-zinc-200 font-bold">
                  {inspectedTimestamp.date.toLocaleString()}
                </div>
                <div className="text-[10px] text-stone-500 font-mono">
                  Epoch Milliseconds: {inspectedTimestamp.ms} ms
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs text-stone-400 italic">
                {language === 'en'
                  ? 'Paste a UUID v7 above to decode its embedded creation timestamp.'
                  : 'Tempel UUID v7 di atas untuk mengekstrak timestamp pembuatannya.'}
              </div>
            )}
          </div>

          {/* Educational UUID v7 vs v4 Comparison */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2 text-xs">
            <span className="font-bold text-stone-700 dark:text-zinc-300 font-mono text-[11px] uppercase tracking-wider block">
              {language === 'en' ? 'Why UUID v7 for Databases?' : 'Mengapa UUID v7 di Database?'}
            </span>
            <p className="text-[11px] text-stone-600 dark:text-zinc-400 leading-relaxed">
              {language === 'en'
                ? 'UUID v4 is completely random, causing B-Tree index fragmentation and high cache misses in PostgreSQL / MySQL. UUID v7 embeds a 48-bit millisecond timestamp at the beginning, preserving sequential insertion performance while guaranteeing uniqueness.'
                : 'UUID v4 acak penuh dapat menyebabkan fragmentasi indeks B-Tree pada database (PostgreSQL/MySQL). UUID v7 meletakkan timestamp 48-bit di awal, menjaga performa indeks B-Tree tetap terurut cepat.'}
            </p>
          </div>
        </div>
      </div>

      {/* Cryptographic Hash & HMAC Calculator & Verifier */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-rose-500" />
            <h3 className="text-sm font-bold tracking-tight text-stone-900 dark:text-zinc-100">
              {language === 'en'
                ? 'Cryptographic Hash & HMAC Checksum Verifier'
                : 'Kalkulator & Verifikasi Checksum Hash / HMAC'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-400">Web Crypto API</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 font-mono">
              {language === 'en' ? 'Source String / Message' : 'Teks Sumber / Pesan'}
            </label>
            <input
              type="text"
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 font-mono">
              {language === 'en' ? 'HMAC Secret Salt Key' : 'Kunci Rahasia Salt HMAC'}
            </label>
            <input
              type="text"
              value={hmacSecret}
              onChange={e => setHmacSecret(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Checksum Verifier Matcher */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 font-mono flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-indigo-500" />
            <span>{language === 'en' ? 'Integrity Verifier (Paste expected SHA-256):' : 'Verifikasi Integritas (Tempel hash SHA-256 yang diharapkan):'}</span>
          </label>
          <input
            type="text"
            value={compareHash}
            onChange={e => setCompareHash(e.target.value)}
            placeholder="Paste SHA-256 checksum to verify match..."
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
          />

          {checksumMatch !== null && (
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                checksumMatch
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}
            >
              {checksumMatch ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>
                    {language === 'en'
                      ? 'Integrity Verified: SHA-256 checksum matches perfectly!'
                      : 'Integritas Terverifikasi: Checksum SHA-256 cocok sempurna!'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert size={16} />
                  <span>
                    {language === 'en'
                      ? 'Checksum Mismatch: Hash does not match the computed output!'
                      : 'Checksum Tidak Cocok: Hash berbeda dari hasil komputasi!'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Computed Hash Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          {Object.keys(computedHashes).map(algo => {
            const hashVal = computedHashes[algo];
            return (
              <div
                key={algo}
                className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {algo}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(hashVal || ''));
                      setCopiedIndex(999);
                      setTimeout(() => setCopiedIndex(null), 1500);
                    }}
                    className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200 flex items-center gap-1"
                  >
                    <Copy size={11} />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-stone-800 dark:text-zinc-200 break-all select-all">
                  {hashVal}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
