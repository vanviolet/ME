import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  AlertCircle,
  ArrowLeft,
  FileCode,
  Info,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  FolderTree,
  Eye,
  Edit3,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { JsonTreeView } from './common/JsonTreeView';

const SAMPLE_TOKENS = [
  {
    name: 'Admin Session (Valid)',
    nameId: 'Sesi Admin (Aktif)',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiJ1c3JfMDE5MmFiY2RlZiIsIm5hbWUiOiJNdWNoYW1hZCBJcnZhbiIsImVtYWlsIjoidmFudmlvbGV0LmpzQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSIsImFkbWluIl0sImlzcyI6ImF1dGgtcHJvdmlkZXIuZXhhbXBsZS5jb20iLCJhdWQiOiJhcGkuc2VydmljZS5jb20iLCJpYXQiOjE3ODk0NTYwMDAsImV4cCI6MTkyNDkwNTYwMH0.' +
      'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    secret: 'your-256-bit-secret',
  },
  {
    name: 'OAuth2 User Token',
    nameId: 'Token Pengguna OAuth2',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiI5ODc2NTQzMjEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5vcmciLCJzY29wZSI6WyJ1c2VyOnJlYWQiLCJwcm9maWxlIl0sImlhdCI6MTc4OTQ1NjAwMCwiZXhwIjoxOTI0OTA1NjAwfQ.' +
      'pA_kP15Y8m95eZ_1K87zQhK2mK6mQk7755kP15Y8m94',
    secret: 'secret-key-123',
  },
];

// Base64Url decode helper
function decodeBase64Url(str: string): string | null {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

// Base64Url encode helper
function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const JwtDebuggerPage: React.FC = () => {
  const { language } = usePortfolio();

  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_TOKENS[0].token);
  const [secretInput, setSecretInput] = useState<string>(SAMPLE_TOKENS[0].secret);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'raw' | 'edit'>('tree');
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));
  const [verifiedStatus, setVerifiedStatus] = useState<boolean | null>(null);

  // Periodic clock for live expiry updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Parsing JWT
  const parsedToken = useMemo(() => {
    const raw = tokenInput.trim();
    if (!raw) {
      return { isValid: false, header: null, payload: null, signature: '', parts: [] };
    }

    const parts = raw.split('.');
    if (parts.length !== 3) {
      return {
        isValid: false,
        header: null,
        payload: null,
        signature: '',
        parts,
        error:
          language === 'en'
            ? 'JWT must contain exactly 3 dot-separated segments (Header.Payload.Signature)'
            : 'JWT harus memiliki tepat 3 bagian yang dipisahkan titik (Header.Payload.Signature)',
      };
    }

    const [rawHeader, rawPayload, signature] = parts;
    const decodedHeaderStr = decodeBase64Url(rawHeader);
    const decodedPayloadStr = decodeBase64Url(rawPayload);

    let parsedHeader: any = null;
    let parsedPayload: any = null;
    let headerError = null;
    let payloadError = null;

    try {
      if (decodedHeaderStr) parsedHeader = JSON.parse(decodedHeaderStr);
    } catch {
      headerError = 'Invalid JSON Header';
    }

    try {
      if (decodedPayloadStr) parsedPayload = JSON.parse(decodedPayloadStr);
    } catch {
      payloadError = 'Invalid JSON Payload';
    }

    return {
      isValid: Boolean(parsedHeader && parsedPayload),
      header: parsedHeader,
      payload: parsedPayload,
      rawHeader,
      rawPayload,
      signature,
      headerError,
      payloadError,
      parts,
    };
  }, [tokenInput, language]);

  // HMAC-SHA256 signature verification via Web Crypto API
  useEffect(() => {
    let active = true;

    async function verifyHmac() {
      if (!parsedToken.isValid || !parsedToken.parts || parsedToken.parts.length !== 3) {
        setVerifiedStatus(null);
        return;
      }

      if (!secretInput.trim()) {
        setVerifiedStatus(null);
        return;
      }

      try {
        const alg = parsedToken.header?.alg;
        if (alg !== 'HS256') {
          // Only HS256 client-side verification
          setVerifiedStatus(null);
          return;
        }

        const enc = new TextEncoder();
        const keyData = enc.encode(secretInput);
        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const dataToSign = enc.encode(`${parsedToken.parts[0]}.${parsedToken.parts[1]}`);
        const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, dataToSign);

        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const binarySignature = String.fromCharCode(...signatureArray);
        const computedSignature = btoa(binarySignature)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        if (active) {
          setVerifiedStatus(computedSignature === parsedToken.signature);
        }
      } catch (err) {
        if (active) setVerifiedStatus(null);
      }
    }

    verifyHmac();
    return () => {
      active = false;
    };
  }, [parsedToken, secretInput]);

  // Claim descriptions
  const STANDARD_CLAIMS: { [key: string]: { label: string; descEn: string; descId: string } } = {
    iss: {
      label: 'Issuer',
      descEn: 'Principal that issued the JWT token.',
      descId: 'Pihak/layanan yang menerbitkan token JWT.',
    },
    sub: {
      label: 'Subject',
      descEn: 'Principal that is the subject of the JWT (e.g. User ID).',
      descId: 'Subjek pemilik token (contoh: ID Pengguna).',
    },
    aud: {
      label: 'Audience',
      descEn: 'Recipients that the JWT is intended for.',
      descId: 'Target penerima atau sistem audiens token.',
    },
    exp: {
      label: 'Expiration Time',
      descEn: 'Timestamp on or after which the token MUST NOT be accepted.',
      descId: 'Waktu kedaluwarsa token tidak boleh diterima lagi.',
    },
    nbf: {
      label: 'Not Before',
      descEn: 'Timestamp before which the token MUST NOT be accepted.',
      descId: 'Waktu awal token baru mulai sah berlaku.',
    },
    iat: {
      label: 'Issued At',
      descEn: 'Timestamp when the token was created.',
      descId: 'Waktu ketika token pertama kali dibuat.',
    },
    jti: {
      label: 'JWT ID',
      descEn: 'Unique identifier for the token to prevent replay attacks.',
      descId: 'ID unik token guna mencegah replay attack.',
    },
  };

  // Expiry time analysis
  const expClaim = parsedToken.payload?.exp;
  const isExpired = expClaim ? currentTime > expClaim : false;
  const timeRemainingSec = expClaim ? expClaim - currentTime : null;

  const formatRemaining = (seconds: number) => {
    if (seconds <= 0) return language === 'en' ? 'Expired' : 'Sudah Kedaluwarsa';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'Interactive JWT Debugger & Claims Decoder — Tools'
            : 'JWT Debugger & Claims Decoder Interaktif — Tools'
        }
        description={
          language === 'en'
            ? 'Decode and debug JSON Web Tokens (JWT) with interactive tree view, RFC 7519 claims analyzer, live expiry countdown, and HMAC-SHA256 signature verification.'
            : 'Dekode dan periksa token JWT dengan penampil pohon klaim, analisis standar RFC 7519, hitung mundur kedaluwarsa real-time, dan verifikasi tanda tangan.'
        }
        url="/tools/jwt-debugger"
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
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">JWT Debugger & Inspector</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <KeyRound size={14} />
            <span>{language === 'en' ? 'RFC 7519 Token Inspector' : 'Inspektur Token RFC 7519'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            JWT Debugger & Claims Decoder
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Decode encoded JWT segments, inspect payload claims with an interactive tree view, track live token expiration, and verify cryptographic signatures 100% client-side.'
              : 'Dekode token JWT, analisis klaim payload dengan penampil hierarki, pantau sisa waktu kedaluwarsa secara langsung, dan verifikasi tanda tangan HMAC secara aman di browser.'}
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

      {/* Status & Expiry Bar */}
      {parsedToken.isValid && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Token Validity */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono font-bold block">
                {language === 'en' ? 'Structure' : 'Format Token'}
              </span>
              <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                {language === 'en' ? 'Valid RFC 7519 3-Part JWT' : 'Valid 3 Bagian RFC 7519'}
              </span>
            </div>
          </div>

          {/* Expiration Countdown */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isExpired
                  ? 'bg-rose-500/10 text-rose-600'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono font-bold block">
                {language === 'en' ? 'Token Lifespan' : 'Masa Berlaku'}
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  isExpired
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {expClaim
                  ? isExpired
                    ? language === 'en'
                      ? 'Expired'
                      : 'Sudah Kedaluwarsa'
                    : `${formatRemaining(timeRemainingSec || 0)} (${language === 'en' ? 'Active' : 'Aktif'})`
                  : language === 'en'
                  ? 'No expiration set'
                  : 'Tanpa batas waktu'}
              </span>
            </div>
          </div>

          {/* Signature Verification */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                verifiedStatus === true
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : verifiedStatus === false
                  ? 'bg-rose-500/10 text-rose-600'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-500'
              }`}
            >
              {verifiedStatus === true ? (
                <ShieldCheck size={20} />
              ) : verifiedStatus === false ? (
                <ShieldAlert size={20} />
              ) : (
                <Lock size={20} />
              )}
            </div>
            <div>
              <span className="text-[11px] text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono font-bold block">
                {language === 'en' ? 'Signature Status' : 'Status Tanda Tangan'}
              </span>
              <span
                className={`text-xs font-bold ${
                  verifiedStatus === true
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : verifiedStatus === false
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                {verifiedStatus === true
                  ? language === 'en'
                    ? 'Signature Verified'
                    : 'Tanda Tangan Cocok'
                  : verifiedStatus === false
                  ? language === 'en'
                    ? 'Invalid Signature'
                    : 'Tanda Tangan Tidak Cocok'
                  : language === 'en'
                  ? 'Enter secret below to verify'
                  : 'Masukkan secret untuk cek'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Dual Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Encoded Token Area (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5 shrink-0">
              <KeyRound size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Encoded Token' : 'Token Terenkripsi'}</span>
            </label>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 w-full sm:w-auto">
              <span className="text-[11px] text-stone-400 shrink-0 sm:hidden">Samples:</span>
              {SAMPLE_TOKENS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTokenInput(s.token);
                    setSecretInput(s.secret);
                  }}
                  className="whitespace-nowrap shrink-0 px-2 py-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-[11px] font-medium text-stone-600 dark:text-zinc-400 hover:text-rose-600 transition-colors"
                >
                  {language === 'en' ? s.name : s.nameId}
                </button>
              ))}
            </div>
          </div>

          {/* Color-Coded Token Display */}
          <div className="relative">
            <textarea
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="Paste your JWT token here (eyJhbGciOi...)"
              className="w-full p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 font-mono text-xs leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 text-stone-900 dark:text-zinc-100 resize-none h-36 sm:h-72"
            />
          </div>

          {/* Token Parts Legend */}
          {parsedToken.parts && parsedToken.parts.length === 3 && (
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2 text-xs font-mono">
              <span className="text-[11px] font-sans font-bold text-stone-500 uppercase tracking-wider block">
                {language === 'en' ? 'Color-coded segments:' : 'Segmen Berwarna:'}
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-rose-600 dark:text-rose-400 font-bold">Header</span>
                <span className="text-stone-400 text-[11px]">Algorithm & token type</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Payload</span>
                <span className="text-stone-400 text-[11px]">Claims & identity data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Signature</span>
                <span className="text-stone-400 text-[11px]">Cryptographic verification</span>
              </div>
            </div>
          )}

          {/* Secret Key Verification Input */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock size={13} className="text-indigo-500" />
                <span>HMAC-SHA256 Secret Key</span>
              </label>
              <span className="text-[10px] text-stone-500 font-mono">Web Crypto API</span>
            </div>
            <input
              type="text"
              value={secretInput}
              onChange={e => setSecretInput(e.target.value)}
              placeholder="Enter 256-bit secret to verify signature..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
            <p className="text-[11px] text-stone-500 leading-normal">
              {language === 'en'
                ? 'Verification is calculated locally in your browser sandbox without sending secrets anywhere.'
                : 'Verifikasi tanda tangan dihitung 100% lokal di browser tanpa mengirim rahasia ke server.'}
            </p>
          </div>
        </div>

        {/* Right Column: Decoded Payload & Interactive Tree (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-5">
          {/* Header Segment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Header: Algorithm & Token Type
                </h3>
              </div>
              <button
                onClick={() =>
                  handleCopy(JSON.stringify(parsedToken.header, null, 2), 'header')
                }
                className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200 flex items-center gap-1 font-medium"
              >
                {copiedSection === 'header' ? (
                  <Check size={11} className="text-emerald-500" />
                ) : (
                  <Copy size={11} />
                )}
                <span>{copiedSection === 'header' ? 'Copied' : 'Copy Header'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-rose-500/20">
              {parsedToken.header ? (
                <JsonTreeView data={parsedToken.header} initialExpandedDepth={2} />
              ) : (
                <span className="text-xs text-stone-400 italic">No valid header found</span>
              )}
            </div>
          </div>

          {/* Payload Segment */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <span className="sm:hidden">Payload Claims</span>
                  <span className="hidden sm:inline">Payload: Data Claims</span>
                </h3>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-[11px]">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-2 py-0.5 rounded-md ${
                      viewMode === 'tree'
                        ? 'bg-white dark:bg-zinc-900 font-bold text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-stone-500'
                    }`}
                  >
                    Tree View
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-2 py-0.5 rounded-md ${
                      viewMode === 'raw'
                        ? 'bg-white dark:bg-zinc-900 font-bold text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-stone-500'
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleCopy(JSON.stringify(parsedToken.payload, null, 2), 'payload')
                  }
                  className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200 flex items-center gap-1 font-medium"
                >
                  {copiedSection === 'payload' ? (
                    <Check size={11} className="text-emerald-500" />
                  ) : (
                    <Copy size={11} />
                  )}
                  <span>{copiedSection === 'payload' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-indigo-500/20 max-h-[320px] overflow-y-auto">
              {parsedToken.payload ? (
                viewMode === 'tree' ? (
                  <JsonTreeView data={parsedToken.payload} initialExpandedDepth={3} />
                ) : (
                  <pre className="font-mono text-xs text-stone-900 dark:text-zinc-100 whitespace-pre">
                    {JSON.stringify(parsedToken.payload, null, 2)}
                  </pre>
                )
              ) : (
                <span className="text-xs text-stone-400 italic">No valid payload claims found</span>
              )}
            </div>
          </div>

          {/* Standard RFC Claims Breakdown Inspector */}
          {parsedToken.payload && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 font-mono">
                  {language === 'en'
                    ? 'RFC 7519 Claims Inspector'
                    : 'Inspeksi Klaim Standar RFC 7519'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.keys(parsedToken.payload).map(key => {
                  const val = parsedToken.payload[key];
                  const info = STANDARD_CLAIMS[key];

                  // If timestamp claim (exp, iat, nbf)
                  const isTimeClaim = ['exp', 'iat', 'nbf'].includes(key) && typeof val === 'number';
                  const dateVal = isTimeClaim ? new Date(val * 1000) : null;

                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {key}
                        </span>
                        {info && (
                          <span className="text-[10px] text-stone-400 font-medium">
                            {info.label}
                          </span>
                        )}
                      </div>

                      {isTimeClaim && dateVal ? (
                        <div className="font-mono text-[11px] text-stone-800 dark:text-zinc-200">
                          <div>{dateVal.toLocaleString()}</div>
                          <div className="text-stone-400 text-[10px]">Unix: {val}</div>
                        </div>
                      ) : (
                        <div className="font-mono text-[11px] text-stone-800 dark:text-zinc-200 truncate">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </div>
                      )}

                      {info && (
                        <p className="text-[10px] text-stone-500 dark:text-zinc-400 pt-0.5">
                          {language === 'en' ? info.descEn : info.descId}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
