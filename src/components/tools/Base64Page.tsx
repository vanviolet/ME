import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Binary,
  Copy,
  Check,
  Download,
  Trash2,
  ArrowRightLeft,
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UTF-8 safe base64 helpers
function utf8ToBase64(str: string): string {
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    return 'Error encoding string';
  }
}

function base64ToUtf8(str: string): string {
  try {
    const cleanStr = str.trim().replace(/^data:.*?;base64,/, '');
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(cleanStr), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    return 'Invalid Base64 string';
  }
}

export const Base64Page: React.FC = () => {
  const { language } = usePortfolio();
  const [mode, setMode] = useState<'encode' | 'decode' | 'file'>('encode');
  const [input, setInput] = useState<string>('Hello World! Welcome to Muchamad Irvan Developer Tools.');
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // File Upload State
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  // Computed Conversion
  const output = useMemo(() => {
    if (mode === 'encode') {
      let b64 = utf8ToBase64(input);
      if (urlSafe) {
        b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      return b64;
    } else if (mode === 'decode') {
      let rawB64 = input;
      if (urlSafe) {
        rawB64 = rawB64.replace(/-/g, '+').replace(/_/g, '/');
        while (rawB64.length % 4) {
          rawB64 += '=';
        }
      }
      return base64ToUtf8(rawB64);
    }
    return fileDataUri;
  }, [input, mode, urlSafe, fileDataUri]);

  const handleSwap = () => {
    if (mode === 'encode') {
      setMode('decode');
      setInput(output);
    } else if (mode === 'decode') {
      setMode('encode');
      setInput(output);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUri(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([output], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = mode === 'encode' ? 'encoded.b64' : 'decoded.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'Base64 Encoder & Decoder — Tools' : 'Enkoder & Dekoder Base64 — Tool Pengembang'}
        description={
          language === 'en'
            ? 'Encode text or files to Base64, or decode Base64 strings safely with UTF-8 support.'
            : 'Enkripsi teks atau berkas ke Base64, atau dekode string Base64 secara instan.'
        }
        url="/tools/base64"
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
          <span className="text-stone-900 dark:text-zinc-100 font-medium">Base64 Converter</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
              Base64 Encoder & Decoder
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">
              {language === 'en'
                ? 'Encode strings and files to Base64 or decode Base64 strings with UTF-8 support.'
                : 'Enkode teks & berkas ke Base64 atau dekode string Base64 dengan dukungan karakter UTF-8.'}
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

      {/* Main Container */}
      <div className="space-y-4">
        {/* Mode Selector & Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
            {[
              { id: 'encode', label: language === 'en' ? 'Encode Text' : 'Enkode Teks' },
              { id: 'decode', label: language === 'en' ? 'Decode Base64' : 'Dekode Base64' },
              { id: 'file', label: language === 'en' ? 'File to Base64' : 'Berkas ke Base64' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === tab.id
                    ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode !== 'file' && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={e => setUrlSafe(e.target.checked)}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-400 border-stone-300 dark:border-zinc-700 accent-stone-900 dark:accent-zinc-100"
                />
                <span>URL Safe Base64</span>
              </label>

              <button
                onClick={handleSwap}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-950 dark:hover:text-white text-xs font-medium transition-colors"
                title={language === 'en' ? 'Swap Input & Output' : 'Tukar Input & Output'}
              >
                <ArrowRightLeft size={13} />
                <span>{language === 'en' ? 'Swap' : 'Tukar'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Input & Output Area */}
        {mode === 'file' ? (
          /* File Upload View */
          <div className="space-y-6 bg-white dark:bg-zinc-900/90 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
            <div className="space-y-2 text-center max-w-md mx-auto">
              <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-600 bg-stone-50/50 dark:bg-zinc-950/50 cursor-pointer transition-colors group">
                <Upload size={32} className="text-stone-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-semibold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'Click or drag file to encode to Base64' : 'Klik atau seret berkas untuk dienkode'}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-zinc-500 mt-1">
                  PNG, JPG, SVG, WEBP, PDF, TXT (Max 5MB recommended)
                </span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {fileDataUri && (
              <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                    <strong>{fileName}</strong> ({fileType || 'Unknown type'})
                  </div>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-xs font-semibold"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'Copied Data URI' : 'Copy Data URI'}</span>
                  </button>
                </div>

                {fileType.startsWith('image/') && (
                  <div className="p-3 bg-stone-50 dark:bg-zinc-950 rounded-xl border border-stone-200 dark:border-zinc-800 flex justify-center">
                    <img src={fileDataUri} alt="Preview" className="max-h-48 object-contain rounded-lg" />
                  </div>
                )}

                <textarea
                  readOnly
                  value={fileDataUri}
                  rows={8}
                  className="w-full p-4 rounded-xl bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed border border-zinc-800 focus:outline-none"
                />
              </div>
            )}
          </div>
        ) : (
          /* Text Input/Output Dual View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                  {mode === 'encode' ? (language === 'en' ? 'Input Plain Text' : 'Teks Biasa') : 'Base64 String'}
                </label>
                <button
                  onClick={() => setInput('')}
                  className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                  title="Clear"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string to decode...'}
                rows={16}
                className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs font-mono leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>

            {/* Output Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                  {mode === 'encode' ? 'Base64 Output' : (language === 'en' ? 'Decoded Text Output' : 'Teks Hasil Dekode')}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-xs font-semibold shadow-xs"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white"
                  >
                    <Download size={12} />
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={output}
                rows={16}
                className="w-full p-4 rounded-2xl bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed border border-zinc-800 focus:outline-none select-all"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
