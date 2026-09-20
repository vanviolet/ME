import React, { useState } from 'react';
import { ApiRequestState, Environment } from './types';
import { generateCodeSnippet, generateCurl } from './utils';
import {
  X,
  Copy,
  Check,
  Code2,
  Terminal,
  Upload,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface CurlModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRequest: ApiRequestState;
  activeEnvironment: Environment | null;
  onImportCurl: (parsed: Partial<ApiRequestState>) => void;
}

export const CurlModal: React.FC<CurlModalProps> = ({
  isOpen,
  onClose,
  activeRequest,
  activeEnvironment,
  onImportCurl,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedLang, setSelectedLang] = useState<'curl' | 'fetch' | 'axios' | 'python' | 'go' | 'php'>('curl');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCode =
    selectedLang === 'curl'
      ? generateCurl(activeRequest, activeEnvironment)
      : generateCodeSnippet(selectedLang, activeRequest, activeEnvironment);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Robust cURL Parser
  const handleParseCurl = () => {
    setImportError(null);
    const raw = importText.trim();
    if (!raw.startsWith('curl')) {
      setImportError('Perintah harus diawali dengan "curl"');
      return;
    }

    try {
      let method: any = 'GET';
      let url = '';
      const headers: { id: string; key: string; value: string; enabled: boolean }[] = [];
      let body = '';
      let bodyType: any = 'none';

      // Match URL (quoted or unquoted)
      // Usually either after curl or with -X METHOD url
      const tokens = raw.replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ');

      // Look for method -X POST or --request POST
      const methodMatch = tokens.match(/(?:-X|--request)\s+([A-Z]+)/i);
      if (methodMatch) {
        method = methodMatch[1].toUpperCase();
      }

      // Look for URL
      // Search for http/https url inside single/double quotes or standalone
      const urlMatch = tokens.match(/['"](https?:\/\/[^'"]+)['"]/) || tokens.match(/\s(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        url = urlMatch[1];
      }

      // Look for headers -H "Key: Value" or --header 'Key: Value'
      const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
      let hMatch: RegExpExecArray | null;
      while ((hMatch = headerRegex.exec(tokens)) !== null) {
        const headerStr = hMatch[1];
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx !== -1) {
          const key = headerStr.substring(0, colonIdx).trim();
          const value = headerStr.substring(colonIdx + 1).trim();
          headers.push({
            id: 'h_' + Math.random().toString(36).substring(2, 9),
            key,
            value,
            enabled: true,
          });
        }
      }

      // Look for body -d "data" or --data 'data' or --data-raw 'data'
      const dataMatch =
        tokens.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"](?=\s+(?:-[A-Za-z]|--|$))/);

      if (dataMatch) {
        body = dataMatch[1];
        if (method === 'GET') method = 'POST';
        try {
          JSON.parse(body);
          bodyType = 'json';
        } catch {
          bodyType = 'raw';
        }
      }

      if (!url) {
        setImportError('Tidak dapat menemukan URL target di dalam perintah cURL.');
        return;
      }

      onImportCurl({
        method,
        url,
        headers: headers.length > 0 ? headers : undefined,
        bodyType,
        rawBody: body,
      });

      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Gagal mem-parsing perintah cURL.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
              <Terminal size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                cURL & Kode Generator
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Ekspor request ke bahasa pemrograman atau impor cURL dari browser DevTools.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/30 dark:bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'export'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            Ekspor Kode
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'import'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            Impor dari cURL
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'export' ? (
            <div className="space-y-3">
              {/* Language Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'curl', label: 'cURL' },
                  { id: 'fetch', label: 'JavaScript (Fetch)' },
                  { id: 'axios', label: 'JavaScript (Axios)' },
                  { id: 'python', label: 'Python (requests)' },
                  { id: 'go', label: 'Go (net/http)' },
                  { id: 'php', label: 'PHP (cURL)' },
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id as any)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                      selectedLang === lang.id
                        ? 'bg-rose-600 text-white font-semibold shadow-xs'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="relative group">
                <pre className="p-4 bg-stone-900 text-stone-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-72 select-all border border-stone-800">
                  <code>{currentCode}</code>
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                Tempelkan perintah <code className="font-mono text-rose-600 dark:text-rose-400 font-bold">curl</code> yang disalin dari Network Tab browser (Klik kanan permintaan &gt; Copy &gt; Copy as cURL), Postman, atau dokumentasi API:
              </div>

              <textarea
                rows={7}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={'curl --location --request POST \'https://api.example.com/data\' \\\n--header \'Content-Type: application/json\' \\\n--data-raw \'{"key": "value"}\''}
                className="w-full p-3 font-mono text-xs bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100 resize-none"
              />

              {importError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleParseCurl}
                  disabled={!importText.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Upload size={14} />
                  <span>Impor ke Request Editor</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-end bg-stone-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
