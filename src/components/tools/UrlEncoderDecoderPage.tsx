import React, { useState, useMemo, useCallback } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Link2,
  Copy,
  Check,
  ArrowRightLeft,
  ArrowLeft,
  Trash2,
  Plus,
  Download,
  ClipboardPaste,
  Sparkles,
  AlertTriangle,
  Info,
  Sliders,
  ExternalLink,
  Code2,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

type EncodeStandard = 'component' | 'uri' | 'rfc3986' | 'form';

export const UrlEncoderDecoderPage: React.FC = () => {
  const { language } = usePortfolio();

  // Mode: encode vs decode
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [standard, setStandard] = useState<EncodeStandard>('component');
  const [plusForSpace, setPlusForSpace] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'text' | 'params'>('text');

  // Input & Feedback
  const [input, setInput] = useState<string>(
    'https://api.example.com/v1/search?query=React 19 & TypeScript 🚀&filter[status]=active&redirect_uri=https://app.dev/callback'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Copy helper with visual feedback
  const handleCopy = useCallback((text: string, key = 'output') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(prev => (prev === key ? null : prev));
    }, 2000);
  }, []);

  // Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text);
    } catch {
      // Ignore if permission denied
    }
  }, []);

  // Presets
  const presets = [
    {
      label: language === 'en' ? 'OAuth 2.0 Auth Request' : 'Permintaan Autentikasi OAuth 2.0',
      value:
        'https://accounts.google.com/o/oauth2/v2/auth?client_id=123456789.apps.googleusercontent.com&redirect_uri=https://myapp.dev/auth/callback&response_type=code&scope=openid profile email&state=xyzState123',
    },
    {
      label: language === 'en' ? 'Unicode & Emoji Search' : 'Pencarian Unicode & Emoji',
      value: 'https://search.dev/find?q=Next.js 15 & Tailwind CSS 🎨✨&lang=id-ID&sort=best_match',
    },
    {
      label: language === 'en' ? 'Deep Link with Encoded Return URL' : 'Deep Link dengan Return URL Terenkode',
      value:
        'https://auth.company.com/login?service=cloud-console&return_to=https%3A%2F%2Fconsole.company.com%2Fdashboard%3Fproject%3Dalpha-core%26env%3Dproduction',
    },
    {
      label: language === 'en' ? 'Complex Query String Payload' : 'Query String Berstruktur Kompleks',
      value: 'filter[category]=backend&tags[]=security&tags[]=crypto&fields=id,name,description&limit=25&offset=0',
    },
  ];

  // Perform Encoding/Decoding
  const { output, error, detectedCount } = useMemo(() => {
    if (!input) {
      return { output: '', error: null, detectedCount: 0 };
    }

    try {
      if (direction === 'encode') {
        let result = '';
        if (standard === 'component') {
          result = encodeURIComponent(input);
        } else if (standard === 'uri') {
          result = encodeURI(input);
        } else if (standard === 'rfc3986') {
          // RFC 3986 strict
          result = encodeURIComponent(input).replace(/[!'()*]/g, c => {
            return '%' + c.charCodeAt(0).toString(16).toUpperCase();
          });
        } else if (standard === 'form') {
          // Form urlencoded: space becomes +, then encodeURIComponent
          result = encodeURIComponent(input).replace(/%20/g, '+');
        }

        if (standard !== 'form' && plusForSpace) {
          result = result.replace(/%20/g, '+');
        }

        const matches = result.match(/%[0-9A-Fa-f]{2}/g);
        return {
          output: result,
          error: null,
          detectedCount: matches ? matches.length : 0,
        };
      } else {
        // Decode mode
        let strToDecode = input;
        if (plusForSpace) {
          strToDecode = strToDecode.replace(/\+/g, ' ');
        }

        const result = decodeURIComponent(strToDecode);
        const matches = input.match(/%[0-9A-Fa-f]{2}/g);

        return {
          output: result,
          error: null,
          detectedCount: matches ? matches.length : 0,
        };
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Invalid URI sequence';
      return {
        output: '',
        error: errMsg,
        detectedCount: 0,
      };
    }
  }, [input, direction, standard, plusForSpace]);

  // Query Parameters Parser / Builder State
  const [paramsList, setParamsList] = useState<QueryParamItem[]>(() => {
    return [
      { id: '1', key: 'query', value: 'React 19 & TypeScript 🚀', enabled: true },
      { id: '2', key: 'filter[status]', value: 'active', enabled: true },
      { id: '3', key: 'redirect_uri', value: 'https://app.dev/callback', enabled: true },
    ];
  });

  const [baseUrlPart, setBaseUrlPart] = useState<string>('https://api.example.com/v1/search');
  const [hashPart, setHashPart] = useState<string>('');

  // Synchronize input URL with paramsList when user chooses
  const parseInputIntoParams = useCallback((rawUrl: string) => {
    try {
      let urlObj: URL | null = null;
      let rawQuery = '';

      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        urlObj = new URL(rawUrl);
        setBaseUrlPart(`${urlObj.origin}${urlObj.pathname}`);
        setHashPart(urlObj.hash);
        rawQuery = urlObj.search.startsWith('?') ? urlObj.search.slice(1) : urlObj.search;
      } else {
        // May be a relative path or raw query string
        const questionIdx = rawUrl.indexOf('?');
        const hashIdx = rawUrl.indexOf('#');

        if (questionIdx !== -1) {
          setBaseUrlPart(rawUrl.slice(0, questionIdx));
          const queryEnd = hashIdx !== -1 ? hashIdx : rawUrl.length;
          rawQuery = rawUrl.slice(questionIdx + 1, queryEnd);
          setHashPart(hashIdx !== -1 ? rawUrl.slice(hashIdx) : '');
        } else if (rawUrl.includes('=')) {
          setBaseUrlPart('');
          rawQuery = rawUrl;
          setHashPart('');
        }
      }

      if (rawQuery) {
        const pairs = rawQuery.split('&').filter(Boolean);
        const newParams: QueryParamItem[] = pairs.map((pair, idx) => {
          const eqIdx = pair.indexOf('=');
          if (eqIdx !== -1) {
            const rawK = pair.slice(0, eqIdx);
            const rawV = pair.slice(eqIdx + 1);
            let decodedK = rawK;
            let decodedV = rawV;
            try {
              decodedK = decodeURIComponent(rawK.replace(/\+/g, ' '));
            } catch {
              // keep as is
            }
            try {
              decodedV = decodeURIComponent(rawV.replace(/\+/g, ' '));
            } catch {
              // keep as is
            }
            return {
              id: `${Date.now()}-${idx}`,
              key: decodedK,
              value: decodedV,
              enabled: true,
            };
          }
          return {
            id: `${Date.now()}-${idx}`,
            key: pair,
            value: '',
            enabled: true,
          };
        });

        if (newParams.length > 0) {
          setParamsList(newParams);
        }
      }
    } catch {
      // Ignore if not standard URL
    }
  }, []);

  // Reconstruct Full URL from Params
  const constructedUrl = useMemo(() => {
    const activeParams = paramsList.filter(p => p.enabled && p.key.trim());
    if (activeParams.length === 0) {
      return `${baseUrlPart}${hashPart}`;
    }

    const queryParts = activeParams.map(p => {
      const k = encodeURIComponent(p.key.trim());
      const v = encodeURIComponent(p.value);
      return `${k}=${v}`;
    });

    const queryString = queryParts.join('&');
    const separator = baseUrlPart.includes('?') ? '&' : '?';
    const baseWithQuery = baseUrlPart ? `${baseUrlPart}${separator}${queryString}` : queryString;
    return `${baseWithQuery}${hashPart}`;
  }, [baseUrlPart, hashPart, paramsList]);

  // Params table controls
  const handleUpdateParam = (id: string, field: 'key' | 'value' | 'enabled', val: string | boolean) => {
    setParamsList(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleAddParam = () => {
    setParamsList(prev => [
      ...prev,
      { id: `${Date.now()}`, key: '', value: '', enabled: true },
    ]);
  };

  const handleDeleteParam = (id: string) => {
    setParamsList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearParams = () => {
    setParamsList([]);
  };

  // Swap input and output
  const handleSwap = () => {
    if (output) {
      setInput(output);
      setDirection(prev => (prev === 'encode' ? 'decode' : 'encode'));
    }
  };

  // Download result
  const handleDownload = () => {
    const content = output || input;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `url-${direction}d-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const inLen = input.length;
    const outLen = output.length;
    const diff = outLen - inLen;
    const diffPercent = inLen > 0 ? ((diff / inLen) * 100).toFixed(1) : '0';
    return { inLen, outLen, diff, diffPercent };
  }, [input, output]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={
          language === 'en'
            ? 'URL Encoder & Decoder Studio — Muchamad Irvan Tools'
            : 'Enkoder & Dekoder URL Online — Perkakas Muchamad Irvan'
        }
        description={
          language === 'en'
            ? 'Free online URL encoder and decoder. Quickly encode or decode query parameters, full URIs, and RFC 3986 strings with interactive breakdown and instant clipboard copy.'
            : 'Perkakas enkoder dan dekoder URL online gratis. Enkripsi dan dekripsi query parameter, link URI, serta string RFC 3986 dengan inspektur parameter interaktif.'
        }
        url="/tools/url-encoder-decoder"
      />

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{language === 'en' ? 'Back to Tools Hub' : 'Kembali ke Pusat Tool'}</span>
        </Link>
        <span className="text-[11px] font-mono text-stone-400 dark:text-zinc-500">
          RFC 3986 & URI Standards
        </span>
      </div>

      {/* Header Banner */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 shadow-xs">
          <Link2 size={14} />
          <span>{language === 'en' ? 'Web & HTTP Utility' : 'Utilitas Web & HTTP'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          {language === 'en' ? 'URL Encoder & Decoder Studio' : 'Studio Enkoder & Dekoder URL'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
          {language === 'en'
            ? 'Easily encode or decode full URLs, query parameters, and special characters with instant live sync, RFC 3986 compliance, and one-click clipboard export.'
            : 'Enkripsi atau dekripsi URL lengkap, query string, serta karakter khusus dengan hasil instan, standar RFC 3986, dan fitur salin ke clipboard satu klik.'}
        </p>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-stone-100 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/60 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowRightLeft size={14} />
            <span>{language === 'en' ? 'Fast Encoder & Decoder' : 'Enkoder & Dekoder Cepat'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('params');
              parseInputIntoParams(input);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'params'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            <ListFilter size={14} />
            <span>{language === 'en' ? 'Query Parameters Inspector' : 'Inspektur Query Parameter'}</span>
          </button>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-zinc-400 font-medium mr-1">
          <Sparkles size={14} className="text-rose-500" />
          <span>{language === 'en' ? 'Quick Presets:' : 'Preset Cepat:'}</span>
        </div>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInput(preset.value);
              parseInputIntoParams(preset.value);
            }}
            className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-rose-500/10 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 text-stone-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700/60 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {activeTab === 'text' ? (
        /* FAST ENCODER / DECODER VIEW */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            {/* Direction Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400">
                {language === 'en' ? 'Action:' : 'Aksi:'}
              </span>
              <div className="inline-flex p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setDirection('encode')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    direction === 'encode'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {language === 'en' ? 'Encode' : 'Enkripsi'}
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('decode')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    direction === 'decode'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {language === 'en' ? 'Decode' : 'Dekripsi'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                disabled={!output}
                title={language === 'en' ? 'Swap Input & Output' : 'Tukar Input & Output'}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-zinc-700/60 text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* Encoding Standard & Flags */}
            <div className="flex flex-wrap items-center gap-3">
              {direction === 'encode' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
                    {language === 'en' ? 'Method:' : 'Metode:'}
                  </span>
                  <select
                    value={standard}
                    onChange={e => setStandard(e.target.value as EncodeStandard)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="component">encodeURIComponent (Recommended)</option>
                    <option value="uri">encodeURI (Full URL safe)</option>
                    <option value="rfc3986">RFC 3986 Strict (!'()* escaped)</option>
                    <option value="form">Form urlencoded (space to +)</option>
                  </select>
                </div>
              )}

              <label className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={plusForSpace}
                  onChange={e => setPlusForSpace(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700"
                />
                <span>
                  {direction === 'encode'
                    ? language === 'en'
                      ? 'Encode space as +'
                      : 'Spasi jadi +'
                    : language === 'en'
                    ? 'Treat + as space'
                    : 'Ubah + jadi spasi'}
                </span>
              </label>
            </div>
          </div>

          {/* Dual Panel Editor: Input and Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="url-source-input"
                    className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-mono"
                  >
                    {direction === 'encode'
                      ? language === 'en'
                        ? 'Raw Input String'
                        : 'String Input Mentah'
                      : language === 'en'
                      ? 'Encoded URL / Query String'
                      : 'URL / Query String Terenkode'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-zinc-200 border border-stone-200 dark:border-zinc-700/60 transition-colors"
                      title={language === 'en' ? 'Paste from clipboard' : 'Tempel dari clipboard'}
                    >
                      <ClipboardPaste size={13} />
                      <span className="hidden sm:inline">
                        {language === 'en' ? 'Paste' : 'Tempel'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInput('')}
                      disabled={!input}
                      className="p-1 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 transition-colors"
                      title={language === 'en' ? 'Clear input' : 'Hapus teks'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <textarea
                  id="url-source-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={
                    direction === 'encode'
                      ? language === 'en'
                        ? 'Type or paste a URL or query string to encode...'
                        : 'Ketik atau tempel URL untuk dienkripsi...'
                      : language === 'en'
                      ? 'Type or paste an encoded URL to decode (e.g. %20, %2F)...'
                      : 'Ketik atau tempel URL terenkode untuk didekripsi...'
                  }
                  rows={8}
                  className="w-full p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs sm:text-sm font-mono text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-y leading-relaxed"
                />
              </div>

              {/* Input Meta Info */}
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-zinc-400 border-t border-stone-100 dark:border-zinc-800">
                <span>
                  {input.length} {language === 'en' ? 'chars' : 'karakter'}
                </span>
                {direction === 'decode' && detectedCount > 0 && (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    {detectedCount} {language === 'en' ? 'encoded tokens found' : 'token terdeteksi'}
                  </span>
                )}
              </div>
            </div>

            {/* Output Panel */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
                      {direction === 'encode'
                        ? language === 'en'
                          ? 'Encoded Result'
                          : 'Hasil Terenkode'
                        : language === 'en'
                        ? 'Decoded Result'
                        : 'Hasil Terdekode'}
                    </span>
                    {error && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <AlertTriangle size={12} />
                        {error}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Copy to Clipboard Button */}
                    <button
                      type="button"
                      id="copy-url-output-btn"
                      onClick={() => handleCopy(output, 'output')}
                      disabled={!output || !!error}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                        copiedKey === 'output'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {copiedKey === 'output' ? <Check size={14} /> : <Copy size={14} />}
                      <span>
                        {copiedKey === 'output'
                          ? language === 'en'
                            ? 'Copied!'
                            : 'Tersalin!'
                          : language === 'en'
                          ? 'Copy Output'
                          : 'Salin Hasil'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={!output}
                      className="p-1 rounded-lg text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                      title={language === 'en' ? 'Download as text file' : 'Unduh file teks'}
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={output}
                  placeholder={
                    error
                      ? language === 'en'
                        ? `Error: ${error}`
                        : `Kesalahan: ${error}`
                      : language === 'en'
                      ? 'The converted URL result will appear here automatically...'
                      : 'Hasil konversi URL akan muncul di sini secara otomatis...'
                  }
                  rows={8}
                  className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm font-mono resize-y leading-relaxed select-all ${
                    error
                      ? 'bg-amber-500/5 border-amber-500/30 text-amber-900 dark:text-amber-200 placeholder-amber-500'
                      : 'bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  }`}
                />
              </div>

              {/* Output Meta Info & Quick Actions */}
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-zinc-400 border-t border-stone-100 dark:border-zinc-800">
                <span>
                  {output.length} {language === 'en' ? 'chars' : 'karakter'}
                  {stats.inLen > 0 && output && (
                    <span className="ml-2 font-normal text-stone-400">
                      ({stats.diff >= 0 ? `+${stats.diff}` : stats.diff} / {stats.diffPercent}%)
                    </span>
                  )}
                </span>

                {output.startsWith('http') && !error && (
                  <a
                    href={output}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    <span>{language === 'en' ? 'Test Link' : 'Coba Link'}</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE QUERY PARAMETERS INSPECTOR & BUILDER */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                  <ListFilter size={16} className="text-rose-500" />
                  <span>{language === 'en' ? 'URL Query Parameter Builder' : 'Pembangun Query Parameter URL'}</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  {language === 'en'
                    ? 'Break down URLs into key-value pairs, enable or disable flags, and automatically encode query values.'
                    : 'Urai URL menjadi pasangan key-value, aktifkan/nonaktifkan parameter, dan susun URL terenkode otomatis.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddParam}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                >
                  <Plus size={14} />
                  <span>{language === 'en' ? 'Add Parameter' : 'Tambah Parameter'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearParams}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 border border-stone-200 dark:border-zinc-700 transition-colors"
                  title={language === 'en' ? 'Clear all parameters' : 'Hapus semua parameter'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Base URL and Hash Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  {language === 'en' ? 'Base URL / Endpoint' : 'Base URL / Endpoint'}
                </label>
                <input
                  type="text"
                  value={baseUrlPart}
                  onChange={e => setBaseUrlPart(e.target.value)}
                  placeholder="https://api.example.com/v1/search"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs sm:text-sm font-mono text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  {language === 'en' ? 'Hash / Fragment (Optional)' : 'Hash / Fragmen (Opsional)'}
                </label>
                <input
                  type="text"
                  value={hashPart}
                  onChange={e => setHashPart(e.target.value)}
                  placeholder="#section-1"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs sm:text-sm font-mono text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Parameter Key-Value Rows */}
            <div className="space-y-2 pt-2">
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-[11px] font-mono uppercase tracking-wider text-stone-400 dark:text-zinc-500 px-1">
                <div className="col-span-1 text-center">Active</div>
                <div className="col-span-4">Key / Parameter Name</div>
                <div className="col-span-6">Value (Decoded String)</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {paramsList.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-stone-200 dark:border-zinc-800 space-y-2">
                  <p className="text-xs text-stone-500 dark:text-zinc-400">
                    {language === 'en'
                      ? 'No query parameters added yet.'
                      : 'Belum ada parameter query yang ditambahkan.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddParam}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white shadow-xs"
                  >
                    <Plus size={14} />
                    <span>{language === 'en' ? 'Add Parameter' : 'Tambah Parameter'}</span>
                  </button>
                </div>
              ) : (
                paramsList.map(item => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 p-2.5 rounded-xl border transition-colors items-center ${
                      item.enabled
                        ? 'bg-stone-50/60 dark:bg-zinc-950/60 border-stone-200 dark:border-zinc-800'
                        : 'bg-stone-100/50 dark:bg-zinc-900/40 border-stone-200/50 dark:border-zinc-800/50 opacity-60'
                    }`}
                  >
                    {/* Enable Checkbox */}
                    <div className="flex sm:justify-center items-center gap-2 sm:col-span-1">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={e => handleUpdateParam(item.id, 'enabled', e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700"
                      />
                      <span className="text-[11px] sm:hidden text-stone-500">
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    {/* Key Input */}
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={item.key}
                        onChange={e => handleUpdateParam(item.id, 'key', e.target.value)}
                        placeholder="key"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-xs font-mono text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    {/* Value Input */}
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        value={item.value}
                        onChange={e => handleUpdateParam(item.id, 'value', e.target.value)}
                        placeholder="value"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-xs font-mono text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    {/* Delete Action */}
                    <div className="flex justify-end items-center sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteParam(item.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title={language === 'en' ? 'Remove parameter' : 'Hapus parameter'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reconstructed Full URL Output Box */}
            <div className="pt-4 space-y-2 border-t border-stone-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-stone-600 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'en' ? 'Constructed Full Encoded URL' : 'URL Terenkode Hasil Rekonstruksi'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(constructedUrl, 'constructed')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                      copiedKey === 'constructed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {copiedKey === 'constructed' ? <Check size={14} /> : <Copy size={14} />}
                    <span>
                      {copiedKey === 'constructed'
                        ? language === 'en'
                          ? 'Copied URL!'
                          : 'Tersalin!'
                        : language === 'en'
                        ? 'Copy Full URL'
                        : 'Salin URL'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInput(constructedUrl);
                      setActiveTab('text');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700/60 transition-colors"
                  >
                    <span>{language === 'en' ? 'Send to Decoder' : 'Kirim ke Dekoder'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs sm:text-sm font-mono text-stone-900 dark:text-zinc-100 break-all select-all leading-relaxed">
                {constructedUrl || (
                  <span className="text-stone-400 italic">
                    {language === 'en' ? 'No URL generated' : 'Belum ada URL'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference Card / Cheat Sheet */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-stone-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
          <Code2 size={16} className="text-rose-500" />
          <span>{language === 'en' ? 'Common URL Percent-Encoding Reference' : 'Referensi Karakter Enkode URL Umum'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 text-xs font-mono">
          {[
            { char: 'Space ( )', code: '%20 or +' },
            { char: '! (Exclamation)', code: '%21' },
            { char: '" (Quote)', code: '%22' },
            { char: '# (Hash)', code: '%23' },
            { char: '$ (Dollar)', code: '%24' },
            { char: '% (Percent)', code: '%25' },
            { char: '& (Ampersand)', code: '%26' },
            { char: "' (Single Quote)", code: '%27' },
            { char: '( (Open Paren)', code: '%28' },
            { char: ') (Close Paren)', code: '%29' },
            { char: '+ (Plus)', code: '%2B' },
            { char: ', (Comma)', code: '%2C' },
            { char: '/ (Slash)', code: '%2F' },
            { char: ': (Colon)', code: '%3A' },
            { char: '; (Semicolon)', code: '%3B' },
            { char: '= (Equal)', code: '%3D' },
            { char: '? (Question)', code: '%3F' },
            { char: '@ (At symbol)', code: '%40' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200/70 dark:border-zinc-800/80 flex flex-col justify-between"
            >
              <span className="text-stone-500 dark:text-zinc-400 text-[11px] truncate">{item.char}</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{item.code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default UrlEncoderDecoderPage;
