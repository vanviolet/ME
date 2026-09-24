import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { ShadcnSelect } from '../ui/select';
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
  History,
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
  Upload,
  BookOpen,
  FileCode2,
  Tag,
  Server,
  Wand2,
  Columns2,
  Rows2,
  PanelLeftClose,
  PanelLeftOpen,
  FolderGit2,
  MoreVertical,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ApiRequestState,
  ApiResponseState,
  Environment,
  HistoryItem,
  HttpMethod,
  KeyValueParam,
  WorkspaceProject,
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
  resolveUrlPathParams,
} from './api-tester/utils';
import { SAMPLE_WORKSPACES } from './api-tester/sampleWorkspaces';
import { EnvironmentModal } from './api-tester/EnvironmentModal';
import { CurlModal } from './api-tester/CurlModal';
import { ResponseViewer } from './api-tester/ResponseViewer';
import { SwaggerModal } from './api-tester/SwaggerModal';
import { SwaggerImportModal } from './api-tester/SwaggerImportModal';
import { WorkspaceListModal } from './api-tester/WorkspaceListModal';
import { WorkspaceSettingsModal } from './api-tester/WorkspaceSettingsModal';
import { RequestEditorPanel } from './api-tester/RequestEditorPanel';

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

export const ApiTesterPage: React.FC = () => {
  const { language } = usePortfolio();

  // --- WORKSPACE & PROJECT STATE ---
  const [workspaces, setWorkspaces] = useState<WorkspaceProject[]>(() => {
    const saved = localStorage.getItem('van_api_tester_workspaces');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    return SAMPLE_WORKSPACES;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    const savedId = localStorage.getItem('van_api_tester_active_workspace_id');
    return savedId || (workspaces[0]?.id || 'ws_jsonplaceholder');
  });

  const activeWorkspace = useMemo(() => {
    return workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId]);

  // --- ENVIRONMENTS STATE ---
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

  // Active Environment Object
  const activeEnvironment = useMemo(() => {
    return environments.find(e => e.id === activeEnvId) || null;
  }, [environments, activeEnvId]);

  // --- ACTIVE REQUEST (ENDPOINT UNDER TEST) ---
  const [request, setRequest] = useState<ApiRequestState>(() => {
    const saved = localStorage.getItem('van_api_tester_active_req');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Default to first endpoint of active workspace
    const firstEp = workspaces[0]?.endpoints?.[0];
    if (firstEp) {
      return JSON.parse(JSON.stringify(firstEp));
    }
    return {
      id: 'req_init',
      name: 'Ambil Data Postingan',
      summary: 'Mendapatkan data post berdasarkan ID',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/{id}',
      path: '/posts/{id}',
      tag: 'Posts',
      params: [],
      pathParams: [{ id: 'pp_1', key: 'id', value: '1', type: 'integer', required: true, enabled: true }],
      headers: [{ id: 'h_accept', key: 'Accept', value: 'application/json', enabled: true }],
      auth: { type: 'none' },
      bodyType: 'none',
      rawBody: '',
      formData: [],
      urlEncodedData: [],
      responses: {
        '200': {
          statusCode: '200',
          description: 'Berhasil memuat post',
          schema: {
            type: 'object',
            properties: [
              { id: 'p1', name: 'id', type: 'integer', example: 1 },
              { id: 'p2', name: 'title', type: 'string', example: 'Judul' },
            ],
          },
        },
      },
      settings: {
        bypassCors: true,
        timeoutMs: 30000,
        followRedirects: true,
      },
    };
  });

  // --- HISTORY STATE ---
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('van_api_tester_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // --- UI STATE ---
  const [activeReqTab, setActiveReqTab] = useState<'params' | 'auth' | 'headers' | 'body' | 'responses' | 'settings'>('params');
  const [sidebarTab, setSidebarTab] = useState<'endpoints' | 'history'>('endpoints');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [showEndpointDesc, setShowEndpointDesc] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'response'>('editor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'split' | 'stacked'>(() => {
    const saved = localStorage.getItem('van_api_tester_layout_mode');
    if (saved === 'split' || saved === 'stacked') return saved;
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      return 'stacked';
    }
    return 'split';
  });

  useEffect(() => {
    localStorage.setItem('van_api_tester_layout_mode', layoutMode);
  }, [layoutMode]);

  // Modals state
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isCurlModalOpen, setIsCurlModalOpen] = useState(false);
  const [isSwaggerModalOpen, setIsSwaggerModalOpen] = useState(false);
  const [isSwaggerImportModalOpen, setIsSwaggerImportModalOpen] = useState(false);
  const [isWorkspaceListModalOpen, setIsWorkspaceListModalOpen] = useState(false);
  const [isWorkspaceSettingsModalOpen, setIsWorkspaceSettingsModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Password visibility in auth
  const [showBasicPass, setShowBasicPass] = useState(false);
  const [showBearerToken, setShowBearerToken] = useState(false);

  // Response & Execution state
  const [response, setResponse] = useState<ApiResponseState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Detected Path Parameter keys from URL string (e.g. /posts/{id} -> ['id'])
  const detectedPathKeys = useMemo(() => {
    const matches = request.url.match(/\{([a-zA-Z0-9_-]+)\}/g);
    if (!matches) return [];
    const keys: string[] = [];
    matches.forEach(m => {
      const key = m.replace(/[{}]/g, '').trim();
      if (key && !keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, [request.url]);

  // Auto ensure pathParams array has entries for all detected path keys
  useEffect(() => {
    if (detectedPathKeys.length === 0) return;
    const currentPathParams = request.pathParams || [];
    let changed = false;
    const updated = [...currentPathParams];

    detectedPathKeys.forEach(k => {
      if (!updated.some(p => p.key === k)) {
        updated.push({
          id: 'pp_' + k,
          key: k,
          value: '',
          type: 'string',
          required: true,
          enabled: true,
          description: `Parameter path untuk ${k}`,
        });
        changed = true;
      }
    });

    if (changed) {
      setRequest(prev => ({
        ...prev,
        pathParams: updated,
      }));
    }
  }, [detectedPathKeys]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('van_api_tester_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem('van_api_tester_active_workspace_id', activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

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

  // Sync URL query string when typing URL directly
  const handleUrlChange = (newUrl: string) => {
    const { params } = parseQueryFromUrl(newUrl);
    if (params.length > 0) {
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

  // --- EXECUTE HTTP REQUEST ---
  const handleSendRequest = async () => {
    if (!request.url.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);
    setMobileActiveTab('response');

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    const finalUrl = buildUrlWithParams(
      request.url,
      request.params,
      activeEnvironment,
      request.pathParams
    );
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
        // Mode 1: Node.js Backend Server Proxy (No CORS restriction)
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
        addToHistory(request, apiRes.status, apiRes.statusText, apiRes.timeMs);
      } else {
        // Mode 2: Direct Browser Fetch
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

  const handleLoadEndpoint = (item: ApiRequestState) => {
    setRequest(JSON.parse(JSON.stringify(item)));
    setResponse(null);
    setMobileActiveTab('editor');
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // --- SAVE ENDPOINT TO ACTIVE WORKSPACE ---
  const handleSaveEndpointToWorkspace = () => {
    if (!activeWorkspace) return;

    // Derive relative path for swagger
    let relPath = request.path;
    if (!relPath) {
      try {
        const u = new URL(request.url);
        relPath = u.pathname;
      } catch {
        relPath = request.url.replace(/^https?:\/\/[^/]+/i, '') || '/';
      }
    }

    const endpointToSave: ApiRequestState = {
      ...JSON.parse(JSON.stringify(request)),
      path: relPath,
      summary: request.summary || request.name,
    };

    const existingIndex = activeWorkspace.endpoints.findIndex(ep => ep.id === request.id);
    let updatedEndpoints = [...activeWorkspace.endpoints];

    if (existingIndex >= 0) {
      updatedEndpoints[existingIndex] = endpointToSave;
    } else {
      updatedEndpoints.push(endpointToSave);
    }

    const updatedWs: WorkspaceProject = {
      ...activeWorkspace,
      endpoints: updatedEndpoints,
      updatedAt: Date.now(),
    };

    setWorkspaces(workspaces.map(w => (w.id === updatedWs.id ? updatedWs : w)));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // --- CREATE NEW ENDPOINT IN WORKSPACE ---
  const handleCreateNewEndpoint = () => {
    const newId = 'ep_' + Date.now();
    const host = activeWorkspace?.host || 'api.example.com';
    const basePath = activeWorkspace?.basePath || '/';
    const cleanBase = basePath.endsWith('/') ? basePath : basePath + '/';

    const newEp: ApiRequestState = {
      id: newId,
      name: 'Endpoint Baru',
      summary: 'Deskripsi singkat endpoint baru',
      method: 'GET',
      url: `https://${host}${cleanBase}items`,
      path: `${cleanBase}items`,
      tag: activeWorkspace?.tags?.[0]?.name || 'General',
      params: [],
      pathParams: [],
      headers: [{ id: 'h_' + Date.now(), key: 'Accept', value: 'application/json', enabled: true }],
      auth: { type: 'none' },
      bodyType: 'none',
      rawBody: '',
      formData: [],
      urlEncodedData: [],
      responses: {
        '200': {
          statusCode: '200',
          description: 'Sukses',
          schema: {
            type: 'object',
            properties: [{ id: 'f1', name: 'id', type: 'integer', example: '1' }],
          },
        },
      },
      settings: {
        bypassCors: true,
        timeoutMs: 30000,
        followRedirects: true,
      },
    };

    if (activeWorkspace) {
      const updatedWs: WorkspaceProject = {
        ...activeWorkspace,
        endpoints: [...activeWorkspace.endpoints, newEp],
        updatedAt: Date.now(),
      };
      setWorkspaces(workspaces.map(w => (w.id === updatedWs.id ? updatedWs : w)));
    }

    setRequest(newEp);
    setResponse(null);
  };

  // Delete Endpoint from workspace
  const handleDeleteEndpoint = (epId: string) => {
    if (!activeWorkspace) return;
    const filtered = activeWorkspace.endpoints.filter(ep => ep.id !== epId);
    const updatedWs: WorkspaceProject = {
      ...activeWorkspace,
      endpoints: filtered,
      updatedAt: Date.now(),
    };
    setWorkspaces(workspaces.map(w => (w.id === updatedWs.id ? updatedWs : w)));
    if (request.id === epId && filtered.length > 0) {
      setRequest(filtered[0]);
    }
  };

  // Duplicate Endpoint
  const handleDuplicateEndpoint = (ep: ApiRequestState) => {
    if (!activeWorkspace) return;
    const duplicated: ApiRequestState = {
      ...JSON.parse(JSON.stringify(ep)),
      id: 'ep_' + Date.now(),
      name: ep.name + ' (Salinan)',
      summary: (ep.summary || '') + ' (Salinan)',
    };
    const updatedWs: WorkspaceProject = {
      ...activeWorkspace,
      endpoints: [...activeWorkspace.endpoints, duplicated],
      updatedAt: Date.now(),
    };
    setWorkspaces(workspaces.map(w => (w.id === updatedWs.id ? updatedWs : w)));
    setRequest(duplicated);
  };

  // --- SWAGGER IMPORT HANDLER ---
  const handleImportWorkspace = (imported: WorkspaceProject, mode: 'new' | 'merge') => {
    if (mode === 'new') {
      setWorkspaces(prev => [imported, ...prev]);
      setActiveWorkspaceId(imported.id);
      if (imported.endpoints.length > 0) {
        setRequest(imported.endpoints[0]);
      }
    } else {
      // Merge into active
      if (!activeWorkspace) return;
      const mergedEndpoints = [...activeWorkspace.endpoints];
      imported.endpoints.forEach(impEp => {
        if (!mergedEndpoints.some(e => e.path === impEp.path && e.method === impEp.method)) {
          mergedEndpoints.push(impEp);
        }
      });
      const updatedWs: WorkspaceProject = {
        ...activeWorkspace,
        endpoints: mergedEndpoints,
        tags: Array.from(new Set([...(activeWorkspace.tags || []), ...(imported.tags || [])])),
        updatedAt: Date.now(),
      };
      setWorkspaces(workspaces.map(w => (w.id === updatedWs.id ? updatedWs : w)));
      if (imported.endpoints.length > 0) {
        setRequest(imported.endpoints[0]);
      }
    }
  };

  // Group active workspace endpoints by tag
  const groupedEndpoints = useMemo(() => {
    if (!activeWorkspace) return {};
    const groups: Record<string, ApiRequestState[]> = {};
    activeWorkspace.endpoints.forEach(ep => {
      const tag = ep.tag && ep.tag.trim() ? ep.tag.trim() : 'General';
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(ep);
    });
    return groups;
  }, [activeWorkspace]);

  return (
    <div className="h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 flex flex-col font-sans overflow-hidden">
      <Seo
        title="API Testing Studio & Swagger 2.0 Studio - Muchamad Irvan"
        description="Alat pengujian REST API canggih mirip Postman yang menghasilkan Swagger 2.0, spesifikasi response & param type, serta impor swagger.json/yaml tanpa hambatan CORS."
        url="/tools/api-tester"
      />

      {/* TOP NAVIGATION BAR */}
      <header className="h-14 shrink-0 border-b border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 z-30 relative">
        {/* Left Section: Back, Brand & Workspace Picker */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <Link
            to="/tools"
            className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Kembali ke Daftar Tools"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 shrink-0 hidden sm:block" />

          {/* Brand Icon & Name */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Globe size={14} />
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white tracking-tight">
                API Studio
              </h1>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[9px] font-extrabold tracking-wider border border-rose-500/20 uppercase">
                Swagger 2.0
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 shrink-0 hidden lg:block" />

          {/* Workspace Pill & Manager Button */}
          <div className="flex items-center gap-1 min-w-0">
            <button
              onClick={() => setIsWorkspaceListModalOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-800 dark:text-zinc-200 cursor-pointer transition-colors max-w-[125px] sm:max-w-[190px] truncate group"
              title="Ganti atau Kelola Semua Workspace Project"
            >
              <FolderGit2 size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate font-bold">{activeWorkspace?.name || 'Workspace'}</span>
              <span className="text-[10px] text-stone-400 font-mono shrink-0 hidden sm:inline">
                ({activeWorkspace?.endpoints.length || 0})
              </span>
              <ChevronDown size={12} className="text-stone-400 group-hover:text-stone-700 dark:group-hover:text-zinc-200 shrink-0" />
            </button>

            <button
              onClick={() => setIsWorkspaceSettingsModalOpen(true)}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors shrink-0 hidden sm:flex"
              title="Pengaturan Spesifikasi Workspace (Host, BasePath & Tags)"
            >
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        {/* Right Section: Environment, View Mode, Code, Import, Docs, Sidebar Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Environment Switcher Pill (desktop) */}
          <button
            onClick={() => setIsEnvModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 text-xs text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
            title="Kelola Environment & Variabel (Localhost, Staging, Production)"
          >
            <Server size={13} className={activeEnvironment ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'} />
            <span className="font-semibold truncate max-w-[80px] lg:max-w-[100px]">
              {activeEnvironment ? activeEnvironment.name : 'No Env'}
            </span>
            <Sliders size={12} className="text-stone-400 shrink-0" />
          </button>

          {/* Layout Mode Segmented Control (Split vs Stacked) */}
          <div className="hidden lg:flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-zinc-800/90 border border-stone-200 dark:border-zinc-700">
            <button
              onClick={() => setLayoutMode('split')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                layoutMode === 'split'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              title="Tampilan Split: Editor & Hasil Uji Berdampingan"
            >
              <Columns2 size={12} />
              <span className="text-[11px]">Split</span>
            </button>
            <button
              onClick={() => setLayoutMode('stacked')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                layoutMode === 'stacked'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
              title="Tampilan Stacked: Editor & Hasil Uji Menumpuk Penuh"
            >
              <Rows2 size={12} />
              <span className="text-[11px]">Stacked</span>
            </button>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 shrink-0 hidden lg:block" />

          {/* cURL / Code Snippet */}
          <button
            onClick={() => setIsCurlModalOpen(true)}
            className="hidden md:flex p-1.5 sm:px-2.5 sm:py-1.5 text-xs bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-xl font-semibold border border-stone-200 dark:border-zinc-700 cursor-pointer items-center gap-1.5 transition-colors"
            title="cURL & Code Snippets Generator (fetch, axios, python, php, go)"
          >
            <Terminal size={13} className="text-stone-500 dark:text-zinc-400" />
            <span className="hidden xl:inline">cURL / Kode</span>
          </button>

          {/* Import Swagger */}
          <button
            onClick={() => setIsSwaggerImportModalOpen(true)}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 text-xs bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-xl font-semibold border border-stone-200 dark:border-zinc-700 cursor-pointer items-center gap-1.5 transition-colors"
            title="Import berkas swagger.json atau .yaml"
          >
            <Upload size={13} className="text-stone-500 dark:text-zinc-400" />
            <span className="hidden xl:inline">Import</span>
          </button>

          {/* Swagger 2.0 Docs & Export Button */}
          <button
            onClick={() => setIsSwaggerModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
            title="Buka Dokumentasi Swagger UI interaktif & Unduh swagger.json / yaml"
          >
            <BookOpen size={13} />
            <span className="hidden sm:inline">Swagger Docs</span>
            <span className="sm:hidden text-[11px]">Swagger</span>
          </button>

          {/* Mobile Overflow Menu Button (visible on < sm screens) */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1.5 rounded-xl border cursor-pointer transition-colors text-xs flex items-center justify-center ${
                isMobileMenuOpen
                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700'
              }`}
              title="Menu Lainnya"
            >
              <MoreVertical size={15} />
            </button>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 w-56 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setIsEnvModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Server size={14} className={activeEnvironment ? 'text-emerald-500' : 'text-stone-400'} />
                        <span>Environment</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 truncate max-w-[70px]">
                        {activeEnvironment ? activeEnvironment.name : 'No Env'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsCurlModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left"
                    >
                      <Terminal size={14} className="text-stone-400" />
                      <span>cURL / Generator Kode</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSwaggerImportModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left"
                    >
                      <Upload size={14} className="text-stone-400" />
                      <span>Import Swagger (.json/.yaml)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsWorkspaceSettingsModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left"
                    >
                      <Settings2 size={14} className="text-stone-400" />
                      <span>Pengaturan Workspace</span>
                    </button>

                    <div className="h-px bg-stone-200 dark:bg-zinc-800 my-1" />

                    <div className="px-3 py-1.5 flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Tata Letak:</span>
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                        <button
                          onClick={() => {
                            setLayoutMode('split');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            layoutMode === 'split'
                              ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                              : 'text-stone-500'
                          }`}
                        >
                          Split
                        </button>
                        <button
                          onClick={() => {
                            setLayoutMode('stacked');
                            setIsMobileMenuOpen(false);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            layoutMode === 'stacked'
                              ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                              : 'text-stone-500'
                          }`}
                        >
                          Stacked
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 shrink-0" />

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-xl border cursor-pointer transition-colors text-xs flex items-center justify-center ${
              isSidebarOpen
                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700'
            }`}
            title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
          >
            {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-2xs z-40 md:hidden animate-in fade-in duration-200"
          />
        )}

        {/* LEFT SIDEBAR: WORKSPACE & ENDPOINTS */}
        {isSidebarOpen && (
          <aside className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 md:static md:z-0 border-r border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-hidden shadow-2xl md:shadow-none animate-in slide-in-from-left duration-200">
            {/* Mobile Close Bar */}
            <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-stone-200 dark:border-zinc-800 bg-stone-100/80 dark:bg-zinc-800/80">
              <span className="text-xs font-bold text-stone-900 dark:text-white">Workspace & Endpoints</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
            {/* Active Workspace Header Card in Sidebar */}
            <div className="p-3 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-900/70 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      {activeWorkspace?.name || 'Workspace'}
                    </h2>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-mono">
                      v{activeWorkspace?.info?.version || '1.0.0'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-stone-400 truncate mt-0.5">
                    {activeWorkspace?.host || 'api.example.com'}{activeWorkspace?.basePath || '/'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsWorkspaceSettingsModalOpen(true)}
                    className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg cursor-pointer"
                    title="Pengaturan Workspace & Spesifikasi Swagger"
                  >
                    <Settings2 size={14} />
                  </button>
                  <button
                    onClick={() => setIsWorkspaceListModalOpen(true)}
                    className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
                    title="Daftar Semua Workspace"
                  >
                    <Layers size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 pt-1">
                <button
                  onClick={handleCreateNewEndpoint}
                  className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1 shadow-xs transition-colors"
                >
                  <Plus size={13} />
                  <span>Endpoint Baru</span>
                </button>
                <button
                  onClick={() => setIsSwaggerModalOpen(true)}
                  className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 transition-colors"
                  title="Lihat Swagger"
                >
                  <FileCode2 size={13} />
                  <span>Swagger</span>
                </button>
              </div>
            </div>

            {/* Sidebar Tabs: Endpoints vs History */}
            <div className="flex items-center border-b border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-900/40">
              <button
                onClick={() => setSidebarTab('endpoints')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  sidebarTab === 'endpoints'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
                }`}
              >
                <Globe size={13} />
                <span>Endpoints ({activeWorkspace?.endpoints.length || 0})</span>
              </button>
              <button
                onClick={() => setSidebarTab('history')}
                className={`flex-1 py-2 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
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
              {sidebarTab === 'endpoints' ? (
                <div className="space-y-4">
                  {Object.keys(groupedEndpoints).length === 0 ? (
                    <div className="py-12 text-center text-xs text-stone-400 space-y-2">
                      <p>Workspace ini belum memiliki endpoint.</p>
                      <button
                        onClick={handleCreateNewEndpoint}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        + Tambah Endpoint Pertama
                      </button>
                    </div>
                  ) : (
                    (Object.entries(groupedEndpoints) as [string, ApiRequestState[]][]).map(([tagName, endpoints]) => (
                      <div key={tagName} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-zinc-400 px-1">
                          <span className="flex items-center gap-1">
                            <Tag size={12} />
                            <span>{tagName}</span>
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            {endpoints.length}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {endpoints.map(ep => {
                            const isSelected = ep.id === request.id;
                            const pathDisplay = ep.path || ep.url.replace(/^https?:\/\/[^/]+/i, '');

                            return (
                              <div
                                key={ep.id}
                                onClick={() => handleLoadEndpoint(ep)}
                                className={`px-2.5 py-2 rounded-xl text-xs cursor-pointer flex items-center justify-between group transition-all duration-150 border ${
                                  isSelected
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 shadow-xs'
                                    : 'border-transparent hover:bg-stone-100 dark:hover:bg-zinc-800/60 text-stone-700 dark:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate min-w-0">
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono tracking-wider border shrink-0 ${getMethodBadgeClass(
                                      ep.method
                                    )}`}
                                  >
                                    {ep.method}
                                  </span>
                                  <div className="truncate min-w-0">
                                    <div className="font-mono text-[11px] font-semibold truncate">
                                      {pathDisplay}
                                    </div>
                                    <div className="text-[10px] text-stone-400 truncate">
                                      {ep.summary || ep.name}
                                    </div>
                                  </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDuplicateEndpoint(ep);
                                    }}
                                    className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded"
                                    title="Duplikat Endpoint"
                                  >
                                    <Copy size={11} />
                                  </button>
                                  {activeWorkspace && activeWorkspace.endpoints.length > 1 && (
                                    <button
                                      onClick={e => {
                                        e.stopPropagation();
                                        if (window.confirm(`Hapus endpoint "${ep.name}"?`)) {
                                          handleDeleteEndpoint(ep.id);
                                        }
                                      }}
                                      className="p-1 text-stone-400 hover:text-rose-600 rounded"
                                      title="Hapus Endpoint"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* History Tab */
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Daftar Eksekusi Terkini
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
                        onClick={() => handleLoadEndpoint(h.request)}
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
                          <span>
                            {new Date(h.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* MAIN WORK AREA */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden bg-stone-100/50 dark:bg-zinc-950">
          {/* TOP OPERATION BAR & COMMAND CENTER */}
          <div className="shrink-0 p-3 sm:p-4 pb-2.5 space-y-2.5 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 shadow-2xs">
            {/* Endpoint Name, Summary, Tag, and Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <input
                  type="text"
                  value={request.summary || request.name}
                  onChange={e =>
                    setRequest({
                      ...request,
                      name: e.target.value,
                      summary: e.target.value,
                    })
                  }
                  placeholder="Nama / Ringkasan Endpoint"
                  className="w-full text-xs sm:text-sm font-bold bg-transparent outline-none border-b border-transparent hover:border-stone-300 dark:hover:border-zinc-700 focus:border-rose-500 text-stone-900 dark:text-white transition-colors pb-0.5 truncate"
                />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
                {/* Tag Selection */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                  <Tag size={11} className="text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={request.tag || 'General'}
                    onChange={e => setRequest({ ...request, tag: e.target.value })}
                    placeholder="Tag"
                    className="bg-transparent text-xs font-semibold text-stone-700 dark:text-zinc-300 outline-none w-16 sm:w-20"
                  />
                </div>

                {/* Toggle Description */}
                <button
                  type="button"
                  onClick={() => setShowEndpointDesc(!showEndpointDesc)}
                  className="hidden sm:inline-block px-2 py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 cursor-pointer font-medium transition-colors"
                >
                  {showEndpointDesc ? 'Tutup Deskripsi' : '+ Deskripsi'}
                </button>

                {/* Save to Workspace Button */}
                <button
                  onClick={handleSaveEndpointToWorkspace}
                  className="px-2.5 sm:px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Simpan perubahan spesifikasi endpoint ini ke Workspace aktif"
                >
                  <Save size={13} />
                  <span className="hidden sm:inline">Simpan</span>
                </button>
              </div>
            </div>

            {/* Optional Description textarea */}
            {showEndpointDesc && (
              <div className="pt-0.5">
                <textarea
                  rows={2}
                  value={request.description || ''}
                  onChange={e => setRequest({ ...request, description: e.target.value })}
                  placeholder="Deskripsi rinci operasi API untuk spesifikasi Swagger..."
                  className="w-full p-2.5 text-xs bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white resize-y"
                />
              </div>
            )}

            {/* Toast Notification on Save */}
            {saveToast && (
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20 animate-in fade-in duration-200">
                <CheckCircle2 size={14} />
                <span>Spesifikasi endpoint berhasil disimpan ke Workspace "{activeWorkspace?.name}"!</span>
              </div>
            )}

            {/* METHOD & URL COMMAND BAR */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Method Dropdown */}
              <div className="shrink-0 w-28 sm:w-32">
                <ShadcnSelect
                  value={request.method}
                  onChange={val => setRequest({ ...request, method: val as HttpMethod })}
                  options={[
                    { value: 'GET', label: 'GET', badge: 'GET' },
                    { value: 'POST', label: 'POST', badge: 'POST' },
                    { value: 'PUT', label: 'PUT', badge: 'PUT' },
                    { value: 'PATCH', label: 'PATCH', badge: 'PATCH' },
                    { value: 'DELETE', label: 'DELETE', badge: 'DEL' },
                    { value: 'HEAD', label: 'HEAD', badge: 'HEAD' },
                    { value: 'OPTIONS', label: 'OPTIONS', badge: 'OPT' },
                  ]}
                  size="md"
                  triggerClassName={`font-extrabold ${getMethodBadgeClass(request.method)}`}
                />
              </div>

              {/* URL Input */}
              <div className="flex-1 min-w-0 relative">
                <input
                  type="text"
                  value={request.url}
                  onChange={e => handleUrlChange(e.target.value)}
                  placeholder="https://api.example.com/posts/{id} atau {{baseUrl}}..."
                  className="w-full px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 truncate"
                />
              </div>

              {/* Send Button */}
              <div className="shrink-0">
                <button
                  onClick={handleSendRequest}
                  disabled={isLoading || !request.url.trim()}
                  className="px-3 sm:px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>Kirim</span>
                  <span className="hidden xl:inline text-[10px] font-normal opacity-80 font-mono">(Ctrl+Enter)</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Workspace Info & CORS Status */}
            <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px] sm:text-[11px]">
              <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 dark:text-zinc-400 font-mono truncate">
                <span className="truncate max-w-[110px] sm:max-w-[200px]">
                  {activeWorkspace?.name}
                </span>
                <span>•</span>
                {detectedPathKeys.length > 0 && (
                  <>
                    <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">
                      Path: {detectedPathKeys.length}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span className="shrink-0">
                  Query: <strong className="text-stone-800 dark:text-zinc-200">{request.params.filter(p => p.enabled).length}</strong>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">
                  Resp: <strong className="text-stone-800 dark:text-zinc-200">{Object.keys(request.responses || {}).length}</strong>
                </span>
              </div>

              {/* Bypass CORS Switch Pill */}
              <div className="flex items-center gap-2 shrink-0">
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
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold cursor-pointer border transition-colors ${
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
                      <ShieldCheck size={12} />
                      <span>Proxy CORS</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={12} />
                      <span>Direct</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE VIEW SWITCHER (< lg screens) */}
          {layoutMode === 'split' && (
            <div className="lg:hidden flex items-center p-1 bg-stone-200/60 dark:bg-zinc-800/80 rounded-xl border border-stone-200 dark:border-zinc-700/60 mx-2.5 sm:mx-4 mt-2 shrink-0">
              <button
                onClick={() => setMobileActiveTab('editor')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  mobileActiveTab === 'editor'
                    ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                }`}
              >
                <FileCode2 size={13} />
                <span>Request Editor</span>
                <span className="text-[10px] opacity-70 font-mono">
                  ({detectedPathKeys.length + request.params.length + request.headers.length})
                </span>
              </button>
              <button
                onClick={() => setMobileActiveTab('response')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                  mobileActiveTab === 'response'
                    ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:text-zinc-400'
                }`}
              >
                <Globe size={13} />
                <span>Response</span>
                {isLoading && (
                  <div className="w-2.5 h-2.5 rounded-full border border-rose-500 border-t-transparent animate-spin" />
                )}
                {response && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {response.status}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* DUAL PANE OR STACKED WORKSPACE */}
          {layoutMode === 'split' ? (
            <>
              {/* Mobile (< lg) View: show the active tab full-size */}
              <div className="lg:hidden flex-1 min-h-0 p-2.5 sm:p-4 overflow-hidden">
                {mobileActiveTab === 'editor' ? (
                  <div className="h-full flex flex-col min-h-0">
                    <RequestEditorPanel
                      request={request}
                      setRequest={setRequest}
                      activeReqTab={activeReqTab}
                      setActiveReqTab={setActiveReqTab}
                      detectedPathKeys={detectedPathKeys}
                      response={response}
                      showBasicPass={showBasicPass}
                      setShowBasicPass={setShowBasicPass}
                      showBearerToken={showBearerToken}
                      setShowBearerToken={setShowBearerToken}
                      isSplit={true}
                    />
                  </div>
                ) : (
                  <div className="h-full flex flex-col min-h-0">
                    <ResponseViewer
                      response={response}
                      isLoading={isLoading}
                      onAbort={handleAbortRequest}
                    />
                  </div>
                )}
              </div>

              {/* Desktop (>= lg) View: side-by-side 50:50 */}
              <div className="hidden lg:flex flex-1 min-h-0 p-3 sm:p-4 flex-row gap-3 sm:gap-4 overflow-hidden">
                {/* Left Pane: Request & Schema Editor */}
                <div className="w-1/2 h-full flex flex-col min-h-0">
                  <RequestEditorPanel
                    request={request}
                    setRequest={setRequest}
                    activeReqTab={activeReqTab}
                    setActiveReqTab={setActiveReqTab}
                    detectedPathKeys={detectedPathKeys}
                    response={response}
                    showBasicPass={showBasicPass}
                    setShowBasicPass={setShowBasicPass}
                    showBearerToken={showBearerToken}
                    setShowBearerToken={setShowBearerToken}
                    isSplit={true}
                  />
                </div>

                {/* Right Pane: Live Response & Testing Viewer */}
                <div className="w-1/2 h-full flex flex-col min-h-0">
                  <ResponseViewer
                    response={response}
                    isLoading={isLoading}
                    onAbort={handleAbortRequest}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-4 space-y-4">
              {/* Request & Schema Editor */}
              <div>
                <RequestEditorPanel
                  request={request}
                  setRequest={setRequest}
                  activeReqTab={activeReqTab}
                  setActiveReqTab={setActiveReqTab}
                  detectedPathKeys={detectedPathKeys}
                  response={response}
                  showBasicPass={showBasicPass}
                  setShowBasicPass={setShowBasicPass}
                  showBearerToken={showBearerToken}
                  setShowBearerToken={setShowBearerToken}
                  isSplit={false}
                />
              </div>

              {/* Live Response & Testing Viewer */}
              <div className="min-h-[420px]">
                <ResponseViewer
                  response={response}
                  isLoading={isLoading}
                  onAbort={handleAbortRequest}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SWAGGER DOCUMENTATION & EXPORT MODAL */}
      {isSwaggerModalOpen && activeWorkspace && (
        <SwaggerModal
          isOpen={isSwaggerModalOpen}
          onClose={() => setIsSwaggerModalOpen(false)}
          workspace={activeWorkspace}
          onSelectEndpoint={ep => {
            handleLoadEndpoint(ep);
          }}
        />
      )}

      {/* SWAGGER IMPORT MODAL */}
      {isSwaggerImportModalOpen && (
        <SwaggerImportModal
          isOpen={isSwaggerImportModalOpen}
          onClose={() => setIsSwaggerImportModalOpen(false)}
          activeWorkspace={activeWorkspace}
          onImportWorkspace={handleImportWorkspace}
        />
      )}

      {/* WORKSPACE LIST & MANAGER MODAL */}
      {isWorkspaceListModalOpen && (
        <WorkspaceListModal
          isOpen={isWorkspaceListModalOpen}
          onClose={() => setIsWorkspaceListModalOpen(false)}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={id => {
            setActiveWorkspaceId(id);
            const target = workspaces.find(w => w.id === id);
            if (target && target.endpoints.length > 0) {
              setRequest(target.endpoints[0]);
            }
          }}
          onCreateWorkspace={newWs => {
            setWorkspaces(prev => [newWs, ...prev]);
            setActiveWorkspaceId(newWs.id);
          }}
          onDuplicateWorkspace={id => {
            const target = workspaces.find(w => w.id === id);
            if (!target) return;
            const dupl: WorkspaceProject = {
              ...JSON.parse(JSON.stringify(target)),
              id: 'ws_' + Date.now(),
              name: target.name + ' (Salinan)',
              info: {
                ...target.info,
                title: target.name + ' (Salinan)',
              },
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            setWorkspaces(prev => [dupl, ...prev]);
            setActiveWorkspaceId(dupl.id);
          }}
          onDeleteWorkspace={id => {
            const remaining = workspaces.filter(w => w.id !== id);
            setWorkspaces(remaining);
            if (remaining.length > 0) {
              setActiveWorkspaceId(remaining[0].id);
            }
          }}
        />
      )}

      {/* WORKSPACE SETTINGS MODAL */}
      {isWorkspaceSettingsModalOpen && activeWorkspace && (
        <WorkspaceSettingsModal
          isOpen={isWorkspaceSettingsModalOpen}
          onClose={() => setIsWorkspaceSettingsModalOpen(false)}
          workspace={activeWorkspace}
          onSaveWorkspace={updatedWs => {
            setWorkspaces(workspaces.map(w => (w.id === updatedWs.id ? updatedWs : w)));
          }}
        />
      )}

      {/* ENVIRONMENT MODAL */}
      {isEnvModalOpen && (
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
      )}

      {/* cURL MODAL */}
      {isCurlModalOpen && (
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
      )}
    </div>
  );
};
