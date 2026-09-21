import React, { useState, useMemo } from 'react';
import { ApiResponseState } from './types';
import { formatBytes, formatTime, getStatusColorClass } from './utils';
import {
  Copy,
  Check,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  ShieldCheck,
  Layers,
  FileCode2,
  Eye,
  Globe,
  Cookie,
} from 'lucide-react';

interface ResponseViewerProps {
  response: ApiResponseState | null;
  isLoading: boolean;
  onAbort?: () => void;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  isLoading,
  onAbort,
}) => {
  const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'preview' | 'headers' | 'cookies'>('pretty');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [headersSearch, setHeadersSearch] = useState('');

  // Extract cookies from Set-Cookie headers if any
  const cookiesList = useMemo(() => {
    if (!response || !response.headersList) return [];
    return response.headersList
      .filter(h => h.key.toLowerCase() === 'set-cookie')
      .map(h => {
        const parts = h.value.split(';');
        const [k, v] = parts[0].split('=');
        return {
          name: k ? k.trim() : '',
          value: v ? v.trim() : '',
          attributes: parts.slice(1).map(p => p.trim()).join('; '),
        };
      });
  }, [response]);

  // Pretty formatted JSON string
  const formattedJson = useMemo(() => {
    if (!response) return '';
    if (response.isJson && response.data !== null && response.data !== undefined) {
      try {
        return JSON.stringify(response.data, null, 2);
      } catch {
        return String(response.data);
      }
    }
    return response.rawText || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)) || '';
  }, [response]);

  // Syntax highlighting for JSON
  const renderHighlightedJson = (text: string, query: string) => {
    if (!text) return null;

    // Fast tokenizer regex for JSON
    const jsonRegex =
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

    const lines = text.split('\n');

    return (
      <div className="font-mono text-xs leading-relaxed space-y-0.5">
        {lines.map((line, idx) => {
          const isMatch = query && line.toLowerCase().includes(query.toLowerCase());

          return (
            <div
              key={idx}
              className={`flex items-start hover:bg-stone-100/50 dark:hover:bg-zinc-800/50 px-2 py-0.5 rounded transition-colors ${
                isMatch ? 'bg-yellow-400/20 dark:bg-yellow-500/20' : ''
              }`}
            >
              <span className="w-10 select-none text-[10px] text-stone-400 dark:text-zinc-600 text-right pr-3 font-mono opacity-80 shrink-0">
                {idx + 1}
              </span>
              <span
                className="flex-1 whitespace-pre-wrap break-all text-stone-800 dark:text-zinc-200"
                dangerouslySetInnerHTML={{
                  __html: line.replace(jsonRegex, match => {
                    let cls = 'text-stone-700 dark:text-zinc-300';
                    if (/^"/.test(match)) {
                      if (/:$/.test(match)) {
                        cls = 'text-indigo-600 dark:text-indigo-400 font-semibold'; // Key
                      } else {
                        cls = 'text-emerald-600 dark:text-emerald-400'; // String
                      }
                    } else if (/true|false/.test(match)) {
                      cls = 'text-purple-600 dark:text-purple-400 font-semibold'; // Boolean
                    } else if (/null/.test(match)) {
                      cls = 'text-stone-400 dark:text-zinc-500 italic'; // Null
                    } else if (/[0-9]/.test(match)) {
                      cls = 'text-amber-600 dark:text-amber-400'; // Number
                    }
                    return `<span class="${cls}">${match}</span>`;
                  }),
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const handleCopy = () => {
    if (!formattedJson) return;
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!response) return;
    const isJson = response.isJson;
    const blob = new Blob([formattedJson], {
      type: isJson ? 'application/json' : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.${isJson ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter headers
  const filteredHeaders = useMemo(() => {
    if (!response || !response.headersList) return [];
    if (!headersSearch.trim()) return response.headersList;
    const q = headersSearch.toLowerCase();
    return response.headersList.filter(
      h => h.key.toLowerCase().includes(q) || h.value.toLowerCase().includes(q)
    );
  }, [response, headersSearch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full min-h-[380px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-3 border-rose-500/20 border-t-rose-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe size={18} className="text-rose-600 animate-pulse" />
          </div>
        </div>
        <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-1">
          Mengirim Permintaan HTTP...
        </h4>
        <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-sm mb-4">
          Memproses via server backend proxy untuk memotong batasan CORS browser secara aman.
        </p>
        {onAbort && (
          <button
            onClick={onAbort}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl cursor-pointer transition-colors"
          >
            Batalkan Permintaan
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (!response) {
    return (
      <div className="h-full min-h-[380px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400 dark:text-zinc-500 mb-3 border border-stone-200 dark:border-zinc-700">
          <Globe size={24} />
        </div>
        <h4 className="text-sm font-bold text-stone-800 dark:text-zinc-200 mb-1">
          Belum Ada Permintaan Terkirim
        </h4>
        <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-sm mb-3">
          Ketikkan URL target di atas atau pilih koleksi sampel di bilah samping, lalu tekan tombol{' '}
          <strong className="text-rose-600 dark:text-rose-400">Kirim / Send</strong> (atau tekan <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded">Ctrl+Enter</kbd>).
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <ShieldCheck size={14} />
          <span>Bebas CORS 100% Aktif secara Bawaan</span>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColorClass(response.status);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Response Status Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3 bg-stone-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
            <span>
              {response.status} {response.statusText}
            </span>
          </div>

          {/* Time Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-xs font-mono font-medium">
            <Clock size={12} className="text-stone-400" />
            <span>{formatTime(response.timeMs)}</span>
          </div>

          {/* Size Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-xs font-mono font-medium">
            <HardDrive size={12} className="text-stone-400" />
            <span>{formatBytes(response.sizeBytes)}</span>
          </div>

          {/* CORS Proxy Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
            <ShieldCheck size={12} />
            <span>Proxy Server (No CORS)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1 font-medium"
            title="Salin Isi Response"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1 font-medium"
            title="Unduh File Response"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Unduh</span>
          </button>
        </div>
      </div>

      {/* Response Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 sm:px-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/30 dark:bg-zinc-900/30 gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch] py-0.5">
          <button
            onClick={() => setActiveTab('pretty')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'pretty'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            <FileCode2 size={13} />
            <span>Pretty</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'raw'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>Raw</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'preview'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'headers'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            <Layers size={13} />
            <span>Headers ({response.headersList?.length || 0})</span>
          </button>

          {cookiesList.length > 0 && (
            <button
              onClick={() => setActiveTab('cookies')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'cookies'
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              <Cookie size={13} />
              <span>Cookies ({cookiesList.length})</span>
            </button>
          )}
        </div>

        {/* Quick Search inside Pretty response */}
        {activeTab === 'pretty' && (
          <div className="relative py-1 pb-1.5 sm:pb-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari dalam response..."
              className="pl-7 pr-2 py-1 text-[11px] bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-800 dark:text-zinc-200 w-full sm:w-48"
            />
          </div>
        )}
      </div>

      {/* Response Tab Content */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
        {/* Network Error Alert */}
        {response.error && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Galat Jaringan / Permintaan Gagal:</p>
              <p className="mt-0.5">{response.error}</p>
            </div>
          </div>
        )}

        {activeTab === 'pretty' && (
          <div>
            {response.isBinary && response.contentType.startsWith('image/') ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-3">
                <img
                  src={`data:${response.contentType};base64,${response.data}`}
                  alt="API Response Preview"
                  className="max-h-72 object-contain rounded-xl border border-stone-200 dark:border-zinc-800 shadow-md"
                />
                <span className="text-xs text-stone-500 dark:text-zinc-400">
                  {response.contentType} ({formatBytes(response.sizeBytes)})
                </span>
              </div>
            ) : response.isJson ? (
              renderHighlightedJson(formattedJson, searchQuery)
            ) : (
              <pre className="font-mono text-xs text-stone-800 dark:text-zinc-200 whitespace-pre-wrap break-all leading-relaxed">
                {formattedJson}
              </pre>
            )}
          </div>
        )}

        {activeTab === 'raw' && (
          <pre className="font-mono text-xs text-stone-800 dark:text-zinc-200 whitespace-pre-wrap break-all leading-relaxed select-all">
            {response.rawText || formattedJson}
          </pre>
        )}

        {activeTab === 'preview' && (
          <div className="w-full">
            {response.contentType.includes('html') ? (
              <iframe
                title="Response HTML Preview"
                srcDoc={response.rawText || formattedJson}
                className="w-full h-96 border border-stone-200 dark:border-zinc-800 rounded-xl bg-white"
                sandbox="allow-same-origin"
              />
            ) : response.contentType.startsWith('image/') ? (
              <div className="flex items-center justify-center p-6">
                <img
                  src={`data:${response.contentType};base64,${response.data}`}
                  alt="Response preview"
                  className="max-h-80 object-contain rounded-xl border border-stone-200 dark:border-zinc-800 shadow-md"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 dark:text-zinc-500">
                Pratinjau visual hanya tersedia untuk respon format HTML dan Gambar. Silakan lihat tab 'Pretty' atau 'Raw'.
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={headersSearch}
                onChange={e => setHeadersSearch(e.target.value)}
                placeholder="Filter header response..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white"
              />
            </div>

            <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold">
                    <th className="py-2 px-3 w-1/3">Header Key</th>
                    <th className="py-2 px-3">Header Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-mono">
                  {filteredHeaders.map((h, i) => (
                    <tr
                      key={i}
                      className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-2 px-3 font-semibold text-rose-600 dark:text-rose-400 break-all select-all">
                        {h.key}
                      </td>
                      <td className="py-2 px-3 text-stone-700 dark:text-zinc-300 break-all select-all">
                        {h.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cookies' && (
          <div className="space-y-3">
            <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold">
                    <th className="py-2 px-3">Cookie Name</th>
                    <th className="py-2 px-3">Value</th>
                    <th className="py-2 px-3">Attributes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-mono">
                  {cookiesList.map((c, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                        {c.name}
                      </td>
                      <td className="py-2 px-3 text-stone-800 dark:text-zinc-200 break-all">
                        {c.value}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-stone-500 dark:text-zinc-400">
                        {c.attributes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
