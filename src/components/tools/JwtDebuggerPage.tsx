import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik11Y2hhbWFkIElydmFuIiwiZW1haWwiOiJ2YW52aW9sZXQuanNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MjQ5MDU2MDB9.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const JwtDebuggerPage: React.FC = () => {
  const { language } = usePortfolio();
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [secretInput, setSecretInput] = useState<string>('your-256-bit-secret');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Base64Url decode helper
  const decodeBase64Url = (str: string) => {
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
  };

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
            ? 'JWT must contain exactly 3 parts separated by dots (Header.Payload.Signature)'
            : 'JWT harus memiliki tepat 3 bagian yang dipisahkan oleh titik (Header.Payload.Signature)',
      };
    }

    const [rawHeader, rawPayload, signature] = parts;
    const decodedHeaderStr = decodeBase64Url(rawHeader);
    const decodedPayloadStr = decodeBase64Url(rawPayload);

    let parsedHeader = null;
    let parsedPayload = null;
    let headerError = null;
    let payloadError = null;

    try {
      if (decodedHeaderStr) parsedHeader = JSON.parse(decodedHeaderStr);
    } catch {
      headerError = language === 'en' ? 'Invalid JSON Header' : 'Header JSON tidak valid';
    }

    try {
      if (decodedPayloadStr) parsedPayload = JSON.parse(decodedPayloadStr);
    } catch {
      payloadError = language === 'en' ? 'Invalid JSON Payload' : 'Payload JSON tidak valid';
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

  // Format timestamps inside payload
  const formatTimeClaim = (timestamp: number | undefined) => {
    if (!timestamp || typeof timestamp !== 'number') return null;
    const date = new Date(timestamp * 1000);
    const isPast = date.getTime() < Date.now();
    const formatted = date.toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
    return { date, formatted, isPast };
  };

  const expInfo = useMemo(() => {
    if (!parsedToken.payload?.exp) return null;
    return formatTimeClaim(parsedToken.payload.exp);
  }, [parsedToken.payload, language]);

  const iatInfo = useMemo(() => {
    if (!parsedToken.payload?.iat) return null;
    return formatTimeClaim(parsedToken.payload.iat);
  }, [parsedToken.payload, language]);

  const nbfInfo = useMemo(() => {
    if (!parsedToken.payload?.nbf) return null;
    return formatTimeClaim(parsedToken.payload.nbf);
  }, [parsedToken.payload, language]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'JWT Debugger & Decoder — Muchamad Irvan' : 'JWT Debugger & Decoder'}
        description={
          language === 'en'
            ? 'Decode, inspect, and verify JSON Web Tokens (JWT) client-side with claims parsing and expiration checker.'
            : 'Dekode, analisis, dan periksa masa berlaku JSON Web Token (JWT) secara instan dan aman di browser.'
        }
        url="/tools/jwt-debugger"
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
          <KeyRound size={14} />
          <span>{language === 'en' ? 'Developer Security Tool' : 'Tool Keamanan Dev'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          {language === 'en' ? 'JWT Debugger & Claims Decoder' : 'JWT Debugger & Dekoder Token'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Inspect JSON Web Tokens (RFC 7519) in real-time. Decode headers, payloads, Unix timestamps, and check signature algorithm structure safely 100% on your device.'
            : 'Periksa dan analisis token JWT (RFC 7519) secara real-time. Dekode header, payload klaim, konversi waktu Unix, dan struktur tanda tangan sepenuhnya di peramban Anda.'}
        </p>
      </div>

      {/* Main Grid: Left Token String, Right Decoded View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Raw Encoded Token (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-2">
                <FileCode size={14} className="text-rose-500" />
                <span>{language === 'en' ? 'Encoded Token' : 'String Token Terenkode'}</span>
              </label>
              <button
                onClick={() => setTokenInput(SAMPLE_JWT)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw size={12} />
                <span>{language === 'en' ? 'Load Sample' : 'Muat Contoh'}</span>
              </button>
            </div>

            <textarea
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              placeholder="eyJhbGciOi..."
              rows={12}
              className="w-full font-mono text-xs p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 text-stone-900 dark:text-zinc-100 resize-none break-all leading-relaxed"
            />

            {/* Token Structure Color Legend */}
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2 text-xs">
              <span className="font-semibold text-[11px] text-stone-500 dark:text-zinc-400 uppercase tracking-wider block">
                {language === 'en' ? 'JWT Token Format Breakdown' : 'Struktur Bagian JWT'}
              </span>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
                  Header (Red)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                  Payload (Purple)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                  Signature (Cyan)
                </span>
              </div>
            </div>

            {/* Token Status Badge */}
            {parsedToken.isValid ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{language === 'en' ? 'Valid JWT Syntax structure' : 'Struktur sintaks JWT valid'}</span>
              </div>
            ) : tokenInput.trim() ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{parsedToken.error || (language === 'en' ? 'Malformed JWT token' : 'Token JWT tidak sesuai')}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Decoded Payload & Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Block */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-500/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold">
                  HEADER: ALGORITHM & TOKEN TYPE
                </span>
              </div>
              {parsedToken.header && (
                <button
                  onClick={() => handleCopy(JSON.stringify(parsedToken.header, null, 2), 'header')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  {copiedSection === 'header' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedSection === 'header' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <pre className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-rose-600 dark:text-rose-400 overflow-x-auto">
              {parsedToken.header
                ? JSON.stringify(parsedToken.header, null, 2)
                : parsedToken.headerError || '// Invalid or missing header'}
            </pre>
          </div>

          {/* Payload Block */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold">
                  PAYLOAD: DATA & CLAIMS
                </span>
              </div>
              {parsedToken.payload && (
                <button
                  onClick={() => handleCopy(JSON.stringify(parsedToken.payload, null, 2), 'payload')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  {copiedSection === 'payload' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedSection === 'payload' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <pre className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-purple-600 dark:text-purple-400 overflow-x-auto">
              {parsedToken.payload
                ? JSON.stringify(parsedToken.payload, null, 2)
                : parsedToken.payloadError || '// Invalid or missing payload'}
            </pre>

            {/* Time Claims Breakdown */}
            {parsedToken.payload && (expInfo || iatInfo || nbfInfo) && (
              <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {expInfo && (
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      expInfo.isPast
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    <Clock size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        exp ({language === 'en' ? 'Expiration' : 'Kedaluwarsa'})
                      </span>
                      <span className="text-[11px] block mt-0.5">{expInfo.formatted}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider block mt-1">
                        {expInfo.isPast
                          ? language === 'en'
                            ? '🔴 Token Expired'
                            : '🔴 Token Kedaluwarsa'
                          : language === 'en'
                          ? '🟢 Token Active & Valid'
                          : '🟢 Token Masih Aktif'}
                      </span>
                    </div>
                  </div>
                )}

                {iatInfo && (
                  <div className="p-3 rounded-xl border bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 flex items-start gap-2.5">
                    <Calendar size={16} className="shrink-0 mt-0.5 text-stone-500" />
                    <div>
                      <span className="font-bold block">
                        iat ({language === 'en' ? 'Issued At' : 'Diterbitkan'})
                      </span>
                      <span className="text-[11px] block mt-0.5">{iatInfo.formatted}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Signature Block */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-sky-500/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 text-xs font-mono font-bold">
                SIGNATURE
              </span>
            </div>

            <pre className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-sky-600 dark:text-sky-400 overflow-x-auto break-all">
              {parsedToken.signature || '// No signature segment'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
