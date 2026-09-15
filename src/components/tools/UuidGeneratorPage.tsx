import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Fingerprint,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Hash,
  Download,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UUID v4 generator
function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// UUID v7 generator (time-ordered)
function generateUuidV7(): string {
  const timestamp = Date.now();
  const hexTime = timestamp.toString(16).padStart(12, '0');
  const part1 = hexTime.slice(0, 8);
  const part2 = hexTime.slice(8, 12);
  const randA = Math.floor(Math.random() * 0x0fff)
    .toString(16)
    .padStart(3, '0');
  const randB = Math.floor(Math.random() * 0x3fff) | 0x8000;
  const randBHex = randB.toString(16);
  const randC = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${part1}-${part2}-7${randA}-${randBHex}-${randC}`;
}

// Crockford Base32 for ULID
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function generateUlid(): string {
  const now = Date.now();
  let timeStr = '';
  let timeVal = now;
  for (let i = 9; i >= 0; i--) {
    const mod = timeVal % 32;
    timeStr = ENCODING[mod] + timeStr;
    timeVal = Math.floor(timeVal / 32);
  }

  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);
  let randStr = '';
  for (let i = 0; i < 10; i++) {
    randStr += ENCODING[randomBytes[i] % 32];
  }

  return timeStr + randStr;
}

// Fallback MD5 in pure JS for cryptographic hash panel
function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  }
  function F(x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  }
  function G(x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  }
  function H(x: number, y: number, z: number) {
    return x ^ y ^ z;
  }
  function I(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = '',
      wordToHexValueTemp = '',
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = '0' + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301,
    b = 0xefcdab89,
    c = 0x98badcfe,
    d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a,
      BB = b,
      CC = c,
      DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

export const UuidGeneratorPage: React.FC = () => {
  const { language } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'uuid' | 'hash'>('uuid');
  const [uuidType, setUuidType] = useState<'v4' | 'v7' | 'ulid'>('v4');
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Hash state
  const [hashInput, setHashInput] = useState<string>('Hello World! VanViolet Security Studio 2026');
  const [hashes, setHashes] = useState<{ [key: string]: string }>({});

  const generateItems = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let val = '';
      if (uuidType === 'v4') val = generateUuidV4();
      else if (uuidType === 'v7') val = generateUuidV7();
      else if (uuidType === 'ulid') val = generateUlid();

      if (!hyphens && uuidType !== 'ulid') {
        val = val.replace(/-/g, '');
      }
      if (uppercase) {
        val = val.toUpperCase();
      } else {
        val = val.toLowerCase();
      }
      if (braces && uuidType !== 'ulid') {
        val = `{${val}}`;
      }
      list.push(val);
    }
    setGeneratedList(list);
  }, [quantity, uuidType, hyphens, uppercase, braces]);

  useEffect(() => {
    generateItems();
  }, [generateItems]);

  // Compute Web Crypto Hashes
  useEffect(() => {
    async function computeHashes() {
      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);

      const computed: { [key: string]: string } = {};

      try {
        const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
        computed['SHA-256'] = Array.from(new Uint8Array(sha256Buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
        computed['SHA-512'] = Array.from(new Uint8Array(sha512Buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
        computed['SHA-1'] = Array.from(new Uint8Array(sha1Buffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        computed['MD5'] = md5(hashInput);
      } catch (e) {
        console.error('Hash calculation error:', e);
      }

      setHashes(computed);
    }

    computeHashes();
  }, [hashInput]);

  const handleCopySingle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedList.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedList.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uuidType}-identifiers.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'UUID / ULID & Hash Generator — Muchamad Irvan' : 'UUID / ULID & Hash Generator'}
        description={
          language === 'en'
            ? 'Generate cryptographically secure UUID v4, UUID v7, ULID, and calculate real-time SHA-256, SHA-512, MD5 hashes client-side.'
            : 'Generator UUID v4, UUID v7, ULID terurut waktu, dan kalkulator hash kriptografi (SHA-256, SHA-512, MD5) di browser.'
        }
        url="/tools/uuid-generator"
      />

      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{language === 'en' ? 'Back to Tools Hub' : 'Kembali ke Tools'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
          <Fingerprint size={14} />
          <span>{language === 'en' ? 'Identity & Cryptography' : 'Identitas & Kriptografi'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          {language === 'en' ? 'UUID / ULID & Crypto Hash Generator' : 'Generator UUID, ULID & Hash Kriptografi'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Generate RFC 4122 compliant UUID v4, timestamp-ordered UUID v7, sortable ULID keys, and compute real-time SHA & MD5 cryptographic checksums.'
            : 'Hasilkan pengenal unik UUID v4, UUID v7 terurut waktu, ULID, dan hitung nilai hash kriptografi (SHA-256, SHA-512, MD5) secara instan dan privat.'}
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab('uuid')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-1 ${
            activeTab === 'uuid'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-zinc-400'
          }`}
        >
          <Layers size={14} />
          <span>{language === 'en' ? 'UUID & ULID Generator' : 'Generator UUID & ULID'}</span>
        </button>
        <button
          onClick={() => setActiveTab('hash')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 -mb-1 ${
            activeTab === 'hash'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-zinc-400'
          }`}
        >
          <Hash size={14} />
          <span>{language === 'en' ? 'Crypto Hash Calculator' : 'Kalkulator Hash Kripto'}</span>
        </button>
      </div>

      {activeTab === 'uuid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Settings (4 cols) */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
              {language === 'en' ? 'Generation Settings' : 'Pengaturan Identifier'}
            </h3>

            {/* Identifier Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400">
                {language === 'en' ? 'Identifier Standard' : 'Standar Identifier'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
                {(['v4', 'v7', 'ulid'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setUuidType(type)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg uppercase transition-all ${
                      uuidType === type
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-tight">
                {uuidType === 'v4' &&
                  (language === 'en'
                    ? 'RFC 4122 random UUID with 122 bits of cryptographically secure entropy.'
                    : 'UUID v4 acak standar RFC 4122 dengan entropi kriptografi 122-bit.')}
                {uuidType === 'v7' &&
                  (language === 'en'
                    ? 'Unix Epoch time-ordered UUID optimized for database indexing & sorting.'
                    : 'UUID v7 terurut timestamp Unix untuk performa indeks database yang optimal.')}
                {uuidType === 'ulid' &&
                  (language === 'en'
                    ? '26-character Crockford Base32 sortable lexicographical identifier.'
                    : 'Identifier 26 karakter Base32 yang dapat diurutkan secara leksikografis.')}
              </p>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-600 dark:text-zinc-400">
                  {language === 'en' ? 'Quantity' : 'Jumlah Generator'}
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{quantity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Format Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-zinc-800">
              <label className="flex items-center gap-2.5 text-xs font-medium text-stone-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={e => setUppercase(e.target.checked)}
                  className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                />
                <span>{language === 'en' ? 'Uppercase Characters' : 'Huruf Kapital (UPPERCASE)'}</span>
              </label>

              {uuidType !== 'ulid' && (
                <>
                  <label className="flex items-center gap-2.5 text-xs font-medium text-stone-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hyphens}
                      onChange={e => setHyphens(e.target.checked)}
                      className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{language === 'en' ? 'Include Hyphens' : 'Sertakan Tanda Hubung (-)'}</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-medium text-stone-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={braces}
                      onChange={e => setBraces(e.target.checked)}
                      className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{language === 'en' ? 'Wrap in Braces {}' : 'Bungkus Kurung Kurawal {}'}</span>
                  </label>
                </>
              )}
            </div>

            <button
              onClick={generateItems}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>{language === 'en' ? 'Regenerate Now' : 'Buat Ulang Sekarang'}</span>
            </button>
          </div>

          {/* Generated Results (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Generated Output' : 'Daftar Identifier Terbuat'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 cursor-pointer"
                >
                  {copiedAll ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 font-mono text-xs">
              {generatedList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 hover:border-rose-400/50 transition-colors group"
                >
                  <span className="text-stone-900 dark:text-zinc-100 font-semibold select-all truncate mr-2">
                    {item}
                  </span>
                  <button
                    onClick={() => handleCopySingle(item, idx)}
                    className="shrink-0 p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    title="Copy identifier"
                  >
                    {copiedIndex === idx ? (
                      <Check size={13} className="text-emerald-500" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Cryptographic Hashing Calculator */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-2">
                <Hash size={14} className="text-rose-500" />
                <span>{language === 'en' ? 'Input Text String' : 'Teks Yang Dihash'}</span>
              </label>
              <span className="text-[11px] font-mono text-stone-400">
                {hashInput.length} {language === 'en' ? 'characters' : 'karakter'}
              </span>
            </div>

            <textarea
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              rows={4}
              placeholder="Enter text to generate cryptographic checksum hashes..."
              className="w-full font-mono text-xs p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 text-stone-900 dark:text-zinc-100 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(hashes).map(([algo, hashVal]) => (
              <div
                key={algo}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {algo}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(hashVal || ''));
                      setCopiedIndex(999);
                      setTimeout(() => setCopiedIndex(null), 1500);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer text-stone-600 dark:text-zinc-300"
                  >
                    <Copy size={11} />
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100 break-all overflow-x-auto select-all">
                  {hashVal || '...'}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
