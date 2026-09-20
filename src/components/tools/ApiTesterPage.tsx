import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Send,
  Plus,
  Trash2,
  Check,
  Globe,
  Sliders,
  AlertCircle,
  Clock,
  HardDrive,
  Copy,
  Download,
  FolderPlus,
  Bookmark,
  History,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Code2,
  Layers,
  Lock,
  FileText,
  Settings2,
  CheckCircle2,
  X,
  Play,
  Save,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ApiRequestState,
  ApiResponseState,
  Environment,
  HistoryItem,
  HttpMethod,
  KeyValueParam,
  SavedCollection,
} from './api-tester/types';
import {
  buildEffectiveHeaders,
  buildRequestBody,
  buildUrlWithParams,
  formatBytes,
  formatTime,
  getMethodBadgeClass,
  parseQueryFromUrl,
  replaceEnvVars,
} from './api-tester/utils';
import { SAMPLE_COLLECTIONS } from './api-tester/sampleCollections';
import { EnvironmentModal } from './api-tester/EnvironmentModal';
import { CurlModal } from './api-tester/CurlModal';
import { ResponseViewer } from './api-tester/ResponseViewer';

const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    id: 'env_dev',
    name: 'Development (Default)',
    variables: [
      {
        id: 'var_1',
        key: 'baseUrl',
        value: 'https://jsonplaceholder.typicode.com',
        enabled: true,
      },
      {
        id: 'var_2',
        key: 'apiToken',
        value: 'demo_bearer_token_xyz987',
        enabled: true,
      },
    ],
  },
];

const INITIAL_REQUEST: ApiRequestState = {
  id: 'req_init',
  name: 'Contoh Request GET',
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  params: [],
  headers: [
    {
      id: 'h_accept',
      key: 'Accept',
      value: 'application/json',
      enabled: true,
    },
  ],
  auth: {
    type: 'none',
  },
  bodyType: 'none',
  rawBody: '',
  formData: [],
  urlEncodedData: [],
  settings: {
    bypassCors: true,
    timeoutMs: 30000,
    followRedirects: true,
  },
};

export const ApiTesterPage: React.FC = () => {
  const { language } = usePortfolio();

  // Environments state
  const [environments, setEnvironments] = useState<Environment[]>(() => {
    const saved = localStorage.getItem('van_api_tester_envs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_ENVIRONMENTS;
  });

  const [activeEnvId, setActiveEnvId] = useState<string | null>(() => {
    return localStorage.getItem('van_api_tester_active_env') || 'env_dev';
  });

  // Active Request State
  const [request, setRequest] = useState<ApiRequestState>(() => {
    const saved = localStorage.getItem('van_api_tester_active_req');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_REQUEST;
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('van_api_tester_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Custom Collections State
  const [customCollections, setCustomCollections] = useState<SavedCollection[]>(() => {
    const saved = localStorage.getItem('van_api_tester_collections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // UI state
  const [activeReqTab, setActiveReqTab] = useState<'params' | 'auth' | 'headers' | 'body' | 'settings'>('params');
  const [sidebarTab, setSidebarTab] = useState<'collections' | 'history'>('collections');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveReqName, setSaveReqName] = useState('');
  const [selectedColId, setSelectedColId] = useState('');

  // Password visibility in auth
  const [showBasicPass, setShowBasicPass] = useState(false);
  const [showBearerToken, setShowBearerToken] = useState(false);

  // Response & Execution state
  const [response, setResponse] = useState<ApiResponseState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // JSON Body format validation
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Active Environment Object
  const activeEnvironment = useMemo(() => {
    return environments.find(e => e.id === activeEnvId) || null;
  }, [environments, activeEnvId]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('van_api_tester_envs', JSON.stringify(environments));
  }, [environments]);

  useEffect(() => {
    if (activeEnvId) {
      localStorage.setItem('van_api_tester_active_env', activeEnvId);
    } else {
      localStorage.removeItem('van_api_tester_active_env');
    }
  }, [activeEnvId]);

  useEffect(() => {
    localStorage.setItem('van_api_tester_active_req', JSON.stringify(request));
  }, [request]);

  useEffect(() => {
    localStorage.setItem('van_api_tester_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('van_api_tester_collections', JSON.stringify(customCollections));
  }, [customCollections]);

  // Sync URL query string when typing URL directly
  const handleUrlChange = (newUrl: string) => {
    const { params } = parseQueryFromUrl(newUrl);
    if (params.length > 0) {
      // Merge params without duplicating
      setRequest(prev => ({
        ...prev,
        url: newUrl,
        params: params,
      }));
    } else {
      setRequest(prev => ({ ...prev, url: newUrl }));
    }
  };

  // Keyboard shortcut: Ctrl+Enter to Send
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [request, activeEnvironment]);

  // Execute Request (with Proxy or Direct Browser)
  const handleSendRequest = async () => {
    if (!request.url.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    const finalUrl = buildUrlWithParams(request.url, request.params, activeEnvironment);
    const finalHeaders = buildEffectiveHeaders(
      request.headers,
      request.auth,
      request.bodyType,
      activeEnvironment
    );
    const bodyPayload = buildRequestBody(request, activeEnvironment);

    const startTime = performance.now();

    try {
      if (request.settings.bypassCors) {
        // --- MODE 1: Node.js Backend Server Proxy (100% NO CORS RESTRICTION) ---
        const proxyResponse = await fetch('/api/http-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: request.method,
            url: finalUrl,
            headers: finalHeaders,
            body: bodyPayload,
            timeoutMs: request.settings.timeoutMs,
            followRedirects: request.settings.followRedirects,
          }),
          signal: abortCtrl.signal,
        });

        const resJson = await proxyResponse.json();

        const apiRes: ApiResponseState = {
          status: resJson.status,
          statusText: resJson.statusText || (resJson.success ? 'OK' : 'Error'),
          timeMs: resJson.timeMs || Math.round(performance.now() - startTime),
          sizeBytes: resJson.sizeBytes || 0,
          headers: resJson.headers || {},
          headersList: resJson.headersList || [],
          contentType: resJson.contentType || '',
          isJson: Boolean(resJson.isJson),
          isBinary: Boolean(resJson.isBinary),
          data: resJson.data,
          rawText: resJson.rawText,
          error: resJson.error,
          url: resJson.url || finalUrl,
          timestamp: Date.now(),
          corsMode: 'proxy',
        };

        setResponse(apiRes);

        // Add to history
        addToHistory(request, apiRes.status, apiRes.statusText, apiRes.timeMs);
      } else {
        // --- MODE 2: Direct Browser Fetch (Tests target's actual browser CORS configuration) ---
        const fetchOptions: RequestInit = {
          method: request.method,
          headers: finalHeaders,
          signal: abortCtrl.signal,
          redirect: request.settings.followRedirects ? 'follow' : 'manual',
        };

        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && bodyPayload) {
          fetchOptions.body = bodyPayload;
        }

        const directRes = await fetch(finalUrl, fetchOptions);
        const durationMs = Math.round(performance.now() - startTime);

        const resHeaders: Record<string, string> = {};
        const resHeadersList: { key: string; value: string }[] = [];
        directRes.headers.forEach((val, key) => {
          resHeaders[key] = val;
          resHeadersList.push({ key, value: val });
        });

        const contentType = directRes.headers.get('content-type') || '';
        const rawText = await directRes.text();
        const sizeBytes = new Blob([rawText]).size;

        let parsedData: any = rawText;
        let isJson = false;
        try {
          parsedData = JSON.parse(rawText);
          isJson = true;
        } catch {}

        const apiRes: ApiResponseState = {
          status: directRes.status,
          statusText: directRes.statusText || 'OK',
          timeMs: durationMs,
          sizeBytes,
          headers: resHeaders,
          headersList: resHeadersList,
          contentType,
          isJson,
          isBinary: false,
          data: parsedData,
          rawText,
          url: directRes.url || finalUrl,
          timestamp: Date.now(),
          corsMode: 'direct',
        };

        setResponse(apiRes);
        addToHistory(request, apiRes.status, apiRes.statusText, apiRes.timeMs);
      }
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isAbort = err.name === 'AbortError';

      const errorMsg = isAbort
        ? 'Permintaan dibatalkan oleh pengguna.'
        : !request.settings.bypassCors && err.message?.includes('Failed to fetch')
        ? 'Gagal memproses (Terkena batasan CORS Browser!). Aktifkan opsi "Bypass CORS (Proxy)" di atas untuk melewati pembatasan ini secara otomatis.'
        : err.message || 'Gagal mengirim request.';

      const errRes: ApiResponseState = {
        status: 0,
        statusText: isAbort ? 'Aborted' : 'Network Error',
        timeMs: durationMs,
        sizeBytes: 0,
        headers: {},
        headersList: [],
        contentType: 'text/plain',
        isJson: false,
        isBinary: false,
        data: null,
        error: errorMsg,
        timestamp: Date.now(),
        corsMode: request.settings.bypassCors ? 'proxy' : 'direct',
      };

      setResponse(errRes);
      addToHistory(request, 0, 'Error', durationMs);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleAbortRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const addToHistory = (
    req: ApiRequestState,
    status?: number,
    statusText?: string,
    timeMs?: number
  ) => {
    const newItem: HistoryItem = {
      id: 'hist_' + Date.now(),
      timestamp: Date.now(),
      method: req.method,
      url: req.url,
      status,
      statusText,
      timeMs,
      request: JSON.parse(JSON.stringify(req)),
    };
    setHistory(prev => [newItem, ...prev.slice(0, 49)]);
  };

  const handleLoadItem = (item: ApiRequestState) => {
    setRequest(JSON.parse(JSON.stringify(item)));
    setResponse(null);
  };

  // Param Helpers
  const handleAddParam = () => {
    setRequest(prev => ({
      ...prev,
      params: [
        ...prev.params,
        {
          id: 'p_' + Math.random().toString(36).substring(2, 9),
          key: '',
          value: '',
          enabled: true,
        },
      ],
    }));
  };

  const handleUpdateParam = (id: string, field: 'key' | 'value' | 'enabled', val: any) => {
    setRequest(prev => ({
      ...prev,
      params: prev.params.map(p => (p.id === id ? { ...p, [field]: val } : p)),
    }));
  };

  const handleDeleteParam = (id: string) => {
    setRequest(prev => ({
      ...prev,
      params: prev.params.filter(p => p.id !== id),
    }));
  };

  // Header Helpers
  const handleAddHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: [
        ...prev.headers,
        {
          id: 'h_' + Math.random().toString(36).substring(2, 9),
          key: '',
          value: '',
          enabled: true,
        },
      ],
    }));
  };

  const handleUpdateHeader = (id: string, field: 'key' | 'value' | 'enabled', val: any) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.map(h => (h.id === id ? { ...h, [field]: val } : h)),
    }));
  };

  const handleDeleteHeader = (id: string) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.filter(h => h.id !== id),
    }));
  };

  // JSON Body Formatting
  const handleBeautifyJson = () => {
    setJsonError(null);
    if (!request.rawBody.trim()) return;
    try {
      const parsed = JSON.parse(request.rawBody);
      setRequest(prev => ({ ...prev, rawBody: JSON.stringify(parsed, null, 2) }));
    } catch (e: any) {
      setJsonError('Format JSON tidak valid: ' + e.message);
    }
  };

  const handleMinifyJson = () => {
    setJsonError(null);
    if (!request.rawBody.trim()) return;
    try {
      const parsed = JSON.parse(request.rawBody);
      setRequest(prev => ({ ...prev, rawBody: JSON.stringify(parsed) }));
    } catch (e: any) {
      setJsonError('Format JSON tidak valid: ' + e.message);
    }
  };

  // Save request to collection
  const handleSaveToCollection = () => {
    if (!saveReqName.trim()) return;

    let targetCol = customCollections.find(c => c.id === selectedColId);
    let updatedCollections = [...customCollections];

    const reqToSave: ApiRequestState = {
      ...JSON.parse(JSON.stringify(request)),
      id: 'saved_' + Date.now(),
      name: saveReqName.trim(),
    };

    if (!targetCol) {
      // Create new collection
      const newCol: SavedCollection = {
        id: 'col_' + Date.now(),
        name: 'Koleksi Kustom',
        description: 'Dibuat pada ' + new Date().toLocaleDateString('id-ID'),
        items: [reqToSave],
      };
      updatedCollections.push(newCol);
    } else {
      updatedCollections = updatedCollections.map(c =>
        c.id === selectedColId ? { ...c, items: [...c.items, reqToSave] } : c
      );
    }

    setCustomCollections(updatedCollections);
    setIsSaveModalOpen(false);
    setSaveReqName('');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 flex flex-col">
      <Seo
        title="API Testing Studio (Postman Web) - Tanpa Hambatan CORS | Muchamad Irvan"
        description="Tool pengujian REST API, GraphQL, & Webhooks online mirip Postman dengan fitur bypass CORS otomatis melalui server proxy Node.js, manajemen environment, dan generator cURL."
        url="/tools/api-tester"
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="Kembali ke Daftar Tools"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white tracking-tight">
                  API Testing Studio
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  <ShieldCheck size={11} />
                  <span>No CORS Restriction</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Environment Selector */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
            <Globe size={13} className="ml-1 text-stone-400" />
            <select
              value={activeEnvId || ''}
              onChange={e => setActiveEnvId(e.target.value || null)}
              className="bg-transparent text-xs font-semibold text-stone-800 dark:text-zinc-200 outline-none cursor-pointer pr-1"
            >
              <option value="">Tanpa Environment</option>
              {environments.map(env => (
                <option key={env.id} value={env.id}>
                  {env.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsEnvModalOpen(true)}
              className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md cursor-pointer"
              title="Kelola Environment & Variabel"
            >
              <Sliders size={13} />
            </button>
          </div>

          {/* cURL & Code Generator */}
          <button
            onClick={() => setIsCurlModalOpen(true)}
            className="px-2.5 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-xl font-semibold border border-stone-200 dark:border-zinc-700 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Terminal size={14} className="text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">cURL / Kode</span>
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-xl border cursor-pointer transition-colors text-xs flex items-center gap-1 ${
              isSidebarOpen
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700'
            }`}
            title="Buka/Tutup Panel Koleksi & Riwayat"
          >
            <Layers size={15} />
            <span className="hidden md:inline font-semibold">Sidebar</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Collections & History */}
        {isSidebarOpen && (
          <aside className="w-72 sm:w-80 border-r border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 flex flex-col shrink-0 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="flex items-center border-b border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50">
              <button
                onClick={() => setSidebarTab('collections')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  sidebarTab === 'collections'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
                }`}
              >
                <Bookmark size={13} />
                <span>Koleksi ({SAMPLE_COLLECTIONS.length + customCollections.length})</span>
              </button>

              <button
                onClick={() => setSidebarTab('history')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  sidebarTab === 'history'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
                }`}
              >
                <History size={13} />
                <span>Riwayat ({history.length})</span>
              </button>
            </div>

            {/* Sidebar Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {sidebarTab === 'collections' ? (
                <>
                  {/* Preset Demo Collections */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      <span>Sampel API Publik</span>
                      <span className="text-[10px] lowercase text-emerald-600 dark:text-emerald-400 font-semibold">
                        Siap Uji
                      </span>
                    </div>

                    <div className="space-y-2">
                      {SAMPLE_COLLECTIONS.map(col => (
                        <div
                          key={col.id}
                          className="border border-stone-200 dark:border-zinc-800 rounded-xl p-2.5 bg-stone-50/50 dark:bg-zinc-950/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                              {col.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-stone-200 dark:bg-zinc-800 rounded text-stone-600 dark:text-zinc-400 font-mono">
                              {col.items.length} req
                            </span>
                          </div>

                          <div className="space-y-1 pt-1">
                            {col.items.map(it => (
                              <div
                                key={it.id}
                                onClick={() => handleLoadItem(it)}
                                className="px-2 py-1.5 rounded-lg text-xs hover:bg-stone-200/50 dark:hover:bg-zinc-800/60 cursor-pointer flex items-center justify-between group transition-colors"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span
                                    className={`px-1 py-0.2 rounded text-[9px] font-bold border ${getMethodBadgeClass(
                                      it.method
                                    )}`}
                                  >
                                    {it.method}
                                  </span>
                                  <span className="truncate text-stone-700 dark:text-zinc-300 font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400">
                                    {it.name}
                                  </span>
                                </div>
                                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-stone-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Collections */}
                  {customCollections.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                        <span>Koleksi Tersimpan</span>
                      </div>

                      <div className="space-y-2">
                        {customCollections.map(col => (
                          <div
                            key={col.id}
                            className="border border-stone-200 dark:border-zinc-800 rounded-xl p-2.5 bg-stone-50/50 dark:bg-zinc-950/40 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                                {col.name}
                              </span>
                              <button
                                onClick={() => {
                                  setCustomCollections(customCollections.filter(c => c.id !== col.id));
                                }}
                                className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                                title="Hapus Koleksi"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div className="space-y-1">
                              {col.items.map(it => (
                                <div
                                  key={it.id}
                                  onClick={() => handleLoadItem(it)}
                                  className="px-2 py-1.5 rounded-lg text-xs hover:bg-stone-200/50 dark:hover:bg-zinc-800/60 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span
                                      className={`px-1 py-0.2 rounded text-[9px] font-bold border ${getMethodBadgeClass(
                                        it.method
                                      )}`}
                                    >
                                      {it.method}
                                    </span>
                                    <span className="truncate text-stone-700 dark:text-zinc-300 font-medium">
                                      {it.name}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* History Tab */
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                      Daftar Eksekusi
                    </span>
                    {history.length > 0 && (
                      <button
                        onClick={() => setHistory([])}
                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={11} />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400 dark:text-zinc-500">
                      Belum ada riwayat permintaan.
                    </div>
                  ) : (
                    history.map(h => (
                      <div
                        key={h.id}
                        onClick={() => handleLoadItem(h.request)}
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-rose-500/40 bg-stone-50/50 dark:bg-zinc-900/60 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`px-1 py-0.2 rounded text-[9px] font-bold border ${getMethodBadgeClass(
                                h.method
                              )}`}
                            >
                              {h.method}
                            </span>
                            <span className="text-xs font-medium text-stone-800 dark:text-zinc-200 truncate">
                              {h.url}
                            </span>
                          </div>
                          {h.status !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                h.status >= 200 && h.status < 300
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {h.status || 'ERR'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-zinc-500 font-mono">
                          <span>{h.timeMs ? `${h.timeMs}ms` : ''}</span>
                          <span>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Work Area */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 lg:p-6 space-y-4">
          {/* Request Header Bar (Method, URL, Send, Save) */}
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Method Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={request.method}
                  onChange={e => setRequest({ ...request, method: e.target.value as HttpMethod })}
                  className={`w-full sm:w-28 px-3 py-2 text-xs font-bold rounded-xl border outline-none cursor-pointer appearance-none ${getMethodBadgeClass(
                    request.method
                  )}`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                  <option value="OPTIONS">OPTIONS</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>

              {/* URL Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={request.url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://api.example.com/v1/endpoint atau {{baseUrl}}/posts"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-zinc-100"
                />
              </div>

              {/* Send Button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleSendRequest}
                  disabled={isLoading || !request.url.trim()}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>Kirim</span>
                  <span className="hidden lg:inline text-[10px] font-normal opacity-80 font-mono">(Ctrl+Enter)</span>
                </button>

                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="p-2 text-stone-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl border border-stone-200 dark:border-zinc-700 cursor-pointer"
                  title="Simpan Request ke Koleksi"
                >
                  <Bookmark size={15} />
                </button>
              </div>
            </div>

            {/* Quick Status Bar & Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-zinc-800 text-[11px]">
              <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400">
                {/* Active Environment pill */}
                <span>
                  Env:{' '}
                  <strong className="text-stone-800 dark:text-zinc-200">
                    {activeEnvironment ? activeEnvironment.name : 'None'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Params: <strong className="text-stone-800 dark:text-zinc-200">{request.params.filter(p => p.enabled).length}</strong>
                </span>
                <span>•</span>
                <span>
                  Headers: <strong className="text-stone-800 dark:text-zinc-200">{request.headers.filter(h => h.enabled).length}</strong>
                </span>
              </div>

              {/* Bypass CORS Switch Pill */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setRequest({
                      ...request,
                      settings: {
                        ...request.settings,
                        bypassCors: !request.settings.bypassCors,
                      },
                    })
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                    request.settings.bypassCors
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}
                  title={
                    request.settings.bypassCors
                      ? 'Permintaan HTTP dilewatkan melalui Server Proxy Node.js sehingga BEBAS 100% dari batasan CORS browser.'
                      : 'Permintaan dieksekusi langsung dari browser (bisa terkena CORS jika server target tidak mengizinkan).'
                  }
                >
                  {request.settings.bypassCors ? (
                    <>
                      <ShieldCheck size={13} />
                      <span>Bypass CORS: Aktif (Proxy)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={13} />
                      <span>Bypass CORS: Mati (Browser Direct)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Request Configuration Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
            {/* Request Tabs Header */}
            <div className="flex items-center px-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 overflow-x-auto">
              {[
                { id: 'params', label: 'Params', badge: request.params.length },
                { id: 'auth', label: 'Authorization', badge: request.auth.type !== 'none' ? '✓' : undefined },
                { id: 'headers', label: 'Headers', badge: request.headers.length },
                { id: 'body', label: 'Body', badge: request.bodyType !== 'none' ? request.bodyType : undefined },
                { id: 'settings', label: 'Settings' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveReqTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 ${
                    activeReqTab === tab.id
                      ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                      : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-mono font-medium">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Request Tab Body */}
            <div className="p-4">
              {/* TAB 1: Query Params */}
              {activeReqTab === 'params' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                      Query Parameters (Otomatis Tersinkron dengan URL)
                    </span>
                    <button
                      onClick={handleAddParam}
                      className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                    >
                      <Plus size={13} />
                      <span>Tambah Parameter</span>
                    </button>
                  </div>

                  <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold">
                          <th className="py-2 px-3 w-10 text-center">Aktif</th>
                          <th className="py-2 px-3">Key (Kunci)</th>
                          <th className="py-2 px-3">Value (Nilai)</th>
                          <th className="py-2 px-2 w-10 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-mono">
                        {request.params.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-xs text-stone-400 font-sans">
                              Belum ada parameter kueri. Klik "Tambah Parameter" untuk menambahkan.
                            </td>
                          </tr>
                        ) : (
                          request.params.map(p => (
                            <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30">
                              <td className="py-1.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={p.enabled}
                                  onChange={e => handleUpdateParam(p.id, 'enabled', e.target.checked)}
                                  className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={p.key}
                                  placeholder="contoh: limit"
                                  onChange={e => handleUpdateParam(p.id, 'key', e.target.value)}
                                  className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={p.value}
                                  placeholder="contoh: 10"
                                  onChange={e => handleUpdateParam(p.id, 'value', e.target.value)}
                                  className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <button
                                  onClick={() => handleDeleteParam(p.id)}
                                  className="p-1 text-stone-400 hover:text-rose-600 rounded-md cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: Authorization */}
              {activeReqTab === 'auth' && (
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                      Tipe Autentikasi
                    </label>
                    <select
                      value={request.auth.type}
                      onChange={e =>
                        setRequest({
                          ...request,
                          auth: { ...request.auth, type: e.target.value as any },
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-semibold cursor-pointer text-stone-900 dark:text-white"
                    >
                      <option value="none">Tanpa Autentikasi (No Auth)</option>
                      <option value="bearer">Bearer Token (JWT / API Token)</option>
                      <option value="basic">Basic Auth (Username & Password)</option>
                      <option value="apikey">API Key (Header / Query Parameter)</option>
                    </select>
                  </div>

                  {/* Bearer Token */}
                  {request.auth.type === 'bearer' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          Bearer Token
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowBearerToken(!showBearerToken)}
                          className="text-[11px] text-rose-600 dark:text-rose-400 cursor-pointer font-medium"
                        >
                          {showBearerToken ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                      </div>
                      <input
                        type={showBearerToken ? 'text' : 'password'}
                        value={request.auth.bearerToken || ''}
                        onChange={e =>
                          setRequest({
                            ...request,
                            auth: { ...request.auth, bearerToken: e.target.value },
                          })
                        }
                        placeholder="ey..."
                        className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-white"
                      />
                      <p className="text-[11px] text-stone-500">
                        Header <code className="font-mono">Authorization: Bearer &lt;token&gt;</code> akan otomatis ditambahkan ke permintaan.
                      </p>
                    </div>
                  )}

                  {/* Basic Auth */}
                  {request.auth.type === 'basic' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          Username
                        </label>
                        <input
                          type="text"
                          value={request.auth.basicUsername || ''}
                          onChange={e =>
                            setRequest({
                              ...request,
                              auth: { ...request.auth, basicUsername: e.target.value },
                            })
                          }
                          placeholder="admin / user"
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowBasicPass(!showBasicPass)}
                            className="text-[11px] text-rose-600 dark:text-rose-400 cursor-pointer font-medium"
                          >
                            {showBasicPass ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </div>
                        <input
                          type={showBasicPass ? 'text' : 'password'}
                          value={request.auth.basicPassword || ''}
                          onChange={e =>
                            setRequest({
                              ...request,
                              auth: { ...request.auth, basicPassword: e.target.value },
                            })
                          }
                          placeholder="password rahasia"
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* API Key */}
                  {request.auth.type === 'apikey' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          Nama Kunci (Key Name)
                        </label>
                        <input
                          type="text"
                          value={request.auth.apiKeyName || ''}
                          onChange={e =>
                            setRequest({
                              ...request,
                              auth: { ...request.auth, apiKeyName: e.target.value },
                            })
                          }
                          placeholder="X-API-KEY / api_key"
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          Nilai Kunci (Key Value)
                        </label>
                        <input
                          type="text"
                          value={request.auth.apiKeyValue || ''}
                          onChange={e =>
                            setRequest({
                              ...request,
                              auth: { ...request.auth, apiKeyValue: e.target.value },
                            })
                          }
                          placeholder="sk_live_..."
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          Lokasi Penyisipan
                        </label>
                        <select
                          value={request.auth.apiKeyLocation || 'header'}
                          onChange={e =>
                            setRequest({
                              ...request,
                              auth: { ...request.auth, apiKeyLocation: e.target.value as any },
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-semibold cursor-pointer text-stone-900 dark:text-white"
                        >
                          <option value="header">Headers (Header HTTP)</option>
                          <option value="query">Query Params (URL parameter)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Headers */}
              {activeReqTab === 'headers' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                      HTTP Request Headers
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Quick add JSON headers
                          const hasCT = request.headers.some(h => h.key.toLowerCase() === 'content-type');
                          const hasAccept = request.headers.some(h => h.key.toLowerCase() === 'accept');
                          const newHeaders = [...request.headers];
                          if (!hasCT) {
                            newHeaders.push({
                              id: 'h_' + Math.random().toString(36).substring(2, 9),
                              key: 'Content-Type',
                              value: 'application/json',
                              enabled: true,
                            });
                          }
                          if (!hasAccept) {
                            newHeaders.push({
                              id: 'h_' + Math.random().toString(36).substring(2, 9),
                              key: 'Accept',
                              value: 'application/json',
                              enabled: true,
                            });
                          }
                          setRequest(prev => ({ ...prev, headers: newHeaders }));
                        }}
                        className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        + Preset JSON
                      </button>
                      <button
                        onClick={handleAddHeader}
                        className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                      >
                        <Plus size={13} />
                        <span>Tambah Header</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold">
                          <th className="py-2 px-3 w-10 text-center">Aktif</th>
                          <th className="py-2 px-3">Header Key</th>
                          <th className="py-2 px-3">Header Value</th>
                          <th className="py-2 px-2 w-10 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 font-mono">
                        {request.headers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-xs text-stone-400 font-sans">
                              Belum ada custom header. Klik "Tambah Header" di atas.
                            </td>
                          </tr>
                        ) : (
                          request.headers.map(h => (
                            <tr key={h.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30">
                              <td className="py-1.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={h.enabled}
                                  onChange={e => handleUpdateHeader(h.id, 'enabled', e.target.checked)}
                                  className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={h.key}
                                  placeholder="contoh: Authorization"
                                  onChange={e => handleUpdateHeader(h.id, 'key', e.target.value)}
                                  className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={h.value}
                                  placeholder="contoh: application/json"
                                  onChange={e => handleUpdateHeader(h.id, 'value', e.target.value)}
                                  className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <button
                                  onClick={() => handleDeleteHeader(h.id)}
                                  className="p-1 text-stone-400 hover:text-rose-600 rounded-md cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: Body */}
              {activeReqTab === 'body' && (
                <div className="space-y-3">
                  {/* Body Type Selector */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'none', label: 'none' },
                      { id: 'json', label: 'raw (JSON)' },
                      { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
                      { id: 'raw', label: 'raw (Text)' },
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setRequest({ ...request, bodyType: type.id as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          request.bodyType === type.id
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  {request.bodyType === 'none' && (
                    <div className="py-8 text-center text-xs text-stone-400 dark:text-zinc-500">
                      Permintaan ini tidak menyertakan payload body.
                    </div>
                  )}

                  {(request.bodyType === 'json' || request.bodyType === 'raw') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                          Payload Editor ({request.bodyType.toUpperCase()})
                        </span>
                        {request.bodyType === 'json' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handleBeautifyJson}
                              className="px-2 py-0.5 text-[11px] bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded font-medium cursor-pointer"
                            >
                              Rapikan (Beautify)
                            </button>
                            <button
                              onClick={handleMinifyJson}
                              className="px-2 py-0.5 text-[11px] bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded font-medium cursor-pointer"
                            >
                              Minify
                            </button>
                          </div>
                        )}
                      </div>

                      <textarea
                        rows={8}
                        value={request.rawBody}
                        onChange={e => {
                          setJsonError(null);
                          setRequest({ ...request, rawBody: e.target.value });
                        }}
                        placeholder={
                          request.bodyType === 'json'
                            ? '{\n  "title": "Judul Baru",\n  "content": "Isi konten API"\n}'
                            : 'Tuliskan teks payload di sini...'
                        }
                        className="w-full p-3 font-mono text-xs bg-stone-900 text-stone-100 border border-stone-800 rounded-xl outline-none focus:border-rose-500 leading-relaxed resize-y"
                      />

                      {jsonError && (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                          <AlertCircle size={14} />
                          <span>{jsonError}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {request.bodyType === 'x-www-form-urlencoded' && (
                    <div className="space-y-2">
                      <p className="text-xs text-stone-500">
                        Format formulir standar (misal: login form). Header <code className="font-mono">Content-Type: application/x-www-form-urlencoded</code> akan diterapkan otomatis.
                      </p>
                      <textarea
                        rows={4}
                        value={request.rawBody}
                        onChange={e => setRequest({ ...request, rawBody: e.target.value })}
                        placeholder="grant_type=client_credentials&client_id=xyz&client_secret=123"
                        className="w-full p-3 font-mono text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: Settings */}
              {activeReqTab === 'settings' && (
                <div className="space-y-4 max-w-lg">
                  {/* Bypass CORS setting */}
                  <div className="flex items-start justify-between gap-4 p-3 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-800 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                        Bypass CORS melalui Server Proxy
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Mengarahkan permintaan HTTP ke backend server Node.js sehingga Anda dapat menguji endpoint apa pun di internet tanpa dicegat oleh batasan Same-Origin / CORS browser.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={request.settings.bypassCors}
                      onChange={e =>
                        setRequest({
                          ...request,
                          settings: { ...request.settings, bypassCors: e.target.checked },
                        })
                      }
                      className="mt-1 rounded text-rose-600 focus:ring-rose-500 cursor-pointer h-4 w-4"
                    />
                  </div>

                  {/* Follow Redirects */}
                  <div className="flex items-start justify-between gap-4 p-3 bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-800 rounded-xl">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                        Follow HTTP Redirects (301, 302, 307)
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                        Ikuti URL pengalihan secara otomatis saat menerima kode status redirect dari server target.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={request.settings.followRedirects}
                      onChange={e =>
                        setRequest({
                          ...request,
                          settings: { ...request.settings, followRedirects: e.target.checked },
                        })
                      }
                      className="mt-1 rounded text-rose-600 focus:ring-rose-500 cursor-pointer h-4 w-4"
                    />
                  </div>

                  {/* Timeout */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                      Batas Waktu Timeout ({request.settings.timeoutMs / 1000} detik)
                    </label>
                    <input
                      type="range"
                      min="2000"
                      max="60000"
                      step="1000"
                      value={request.settings.timeoutMs}
                      onChange={e =>
                        setRequest({
                          ...request,
                          settings: { ...request.settings, timeoutMs: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response Viewer Panel */}
          <div className="flex-1 min-h-[380px]">
            <ResponseViewer
              response={response}
              isLoading={isLoading}
              onAbort={handleAbortRequest}
            />
          </div>
        </main>
      </div>

      {/* Environment Management Modal */}
      <EnvironmentModal
        isOpen={isEnvModalOpen}
        onClose={() => setIsEnvModalOpen(false)}
        environments={environments}
        activeEnvironmentId={activeEnvId}
        onSaveEnvironments={(envs, activeId) => {
          setEnvironments(envs);
          setActiveEnvId(activeId);
        }}
      />

      {/* cURL & Code Generator Modal */}
      <CurlModal
        isOpen={isCurlModalOpen}
        onClose={() => setIsCurlModalOpen(false)}
        activeRequest={request}
        activeEnvironment={activeEnvironment}
        onImportCurl={parsed => {
          setRequest(prev => ({
            ...prev,
            ...parsed,
          }));
        }}
      />

      {/* Save to Collection Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-stone-900 dark:text-white">
                Simpan Request ke Koleksi
              </span>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-700 dark:text-zinc-300">
                Nama Request
              </label>
              <input
                type="text"
                autoFocus
                value={saveReqName}
                onChange={e => setSaveReqName(e.target.value)}
                placeholder="contoh: Ambil Data Pengguna"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-medium text-stone-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-700 dark:text-zinc-300">
                Pilih Koleksi Tujuan
              </label>
              <select
                value={selectedColId}
                onChange={e => setSelectedColId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white cursor-pointer font-medium"
              >
                <option value="">+ Buat Koleksi Baru</option>
                {customCollections.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveToCollection}
                disabled={!saveReqName.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
