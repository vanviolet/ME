import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode2,
  BookOpen,
  Code2,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronRight,
  Play,
  Shield,
  Tag,
  Globe,
  Server,
  Sparkles,
  Info,
} from 'lucide-react';
import { WorkspaceProject, ApiRequestState, HttpMethod, SwaggerResponseDef } from './types';
import { generateSwaggerJson, generateSwaggerYaml } from './swaggerGenerator';
import { getMethodBadgeClass } from './utils';

interface SwaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceProject;
  onSelectEndpoint?: (endpoint: ApiRequestState) => void;
}

export const SwaggerModal: React.FC<SwaggerModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onSelectEndpoint,
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'json' | 'yaml'>('docs');
  const [copied, setCopied] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});

  const swaggerJsonObj = useMemo(() => {
    return generateSwaggerJson(workspace);
  }, [workspace]);

  const swaggerJsonString = useMemo(() => {
    return JSON.stringify(swaggerJsonObj, null, 2);
  }, [swaggerJsonObj]);

  const swaggerYamlString = useMemo(() => {
    return generateSwaggerYaml(workspace);
  }, [workspace]);

  // Group endpoints by tag
  const tagsList = useMemo(() => {
    const set = new Set<string>();
    workspace.endpoints.forEach(ep => {
      if (ep.tag && ep.tag.trim()) {
        set.add(ep.tag.trim());
      } else {
        set.add('General');
      }
    });
    return Array.from(set);
  }, [workspace.endpoints]);

  const filteredEndpoints = useMemo(() => {
    if (selectedTag === 'all') return workspace.endpoints;
    return workspace.endpoints.filter(ep => {
      const tag = ep.tag && ep.tag.trim() ? ep.tag.trim() : 'General';
      return tag === selectedTag;
    });
  }, [workspace.endpoints, selectedTag]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleEndpointExpand = (id: string) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    workspace.endpoints.forEach(ep => {
      all[ep.id] = true;
    });
    setExpandedEndpoints(all);
  };

  const collapseAll = () => {
    setExpandedEndpoints({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-5xl h-[92vh] bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shrink-0">
                <FileCode2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-xs sm:text-base font-bold text-stone-900 dark:text-white truncate">
                    Swagger 2.0 Studio
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono shrink-0">
                    swagger: 2.0
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
                  {workspace.info?.title || workspace.name} • v{workspace.info?.version || '1.0.0'}
                </p>
              </div>
            </div>

            {/* Close button (visible on mobile in row) */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-zinc-800 p-1 rounded-xl overflow-x-auto scrollbar-none flex-1 sm:flex-none">
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'docs'
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <BookOpen size={13} />
                <span>Swagger UI</span>
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'json'
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Code2 size={13} />
                <span>JSON</span>
              </button>
              <button
                onClick={() => setActiveTab('yaml')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'yaml'
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <span>YAML</span>
              </button>
            </div>

            {/* Close button (desktop) */}
            <button
              onClick={onClose}
              className="hidden sm:block p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Sub-Bar */}
        <div className="px-5 py-2 border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-stone-500 dark:text-zinc-400 font-mono text-[11px]">
            <span>Host: <strong className="text-stone-800 dark:text-zinc-200">{workspace.host || 'api.example.com'}</strong></span>
            <span>•</span>
            <span>BasePath: <strong className="text-stone-800 dark:text-zinc-200">{workspace.basePath || '/'}</strong></span>
            <span>•</span>
            <span>Total Endpoints: <strong className="text-stone-800 dark:text-zinc-200">{workspace.endpoints.length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'docs' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAll}
                  className="px-2 py-1 text-[11px] text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer font-medium"
                >
                  Buka Semua
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2 py-1 text-[11px] text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer font-medium"
                >
                  Tutup Semua
                </button>
                <button
                  onClick={() => handleDownload(swaggerJsonString, `${workspace.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_swagger.json`, 'application/json')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download size={13} />
                  <span>Unduh swagger.json</span>
                </button>
              </div>
            ) : activeTab === 'json' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(swaggerJsonString)}
                  className="px-2.5 py-1 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? 'Tersalin!' : 'Salin JSON'}</span>
                </button>
                <button
                  onClick={() => handleDownload(swaggerJsonString, 'swagger.json', 'application/json')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Unduh .json</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(swaggerYamlString)}
                  className="px-2.5 py-1 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? 'Tersalin!' : 'Salin YAML'}</span>
                </button>
                <button
                  onClick={() => handleDownload(swaggerYamlString, 'swagger.yaml', 'text/yaml')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Unduh .yaml</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50 dark:bg-zinc-950/50">
          {/* TAB 1: INTERACTIVE SWAGGER UI DOCS */}
          {activeTab === 'docs' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Project Hero / Info Card */}
              <div className="p-5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-extrabold text-stone-900 dark:text-white">
                        {workspace.info?.title || workspace.name}
                      </h1>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-mono">
                        v{workspace.info?.version || '1.0.0'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {workspace.info?.description || workspace.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>

                  {/* Schemes & Base URL pill */}
                  <div className="flex flex-col items-end gap-1 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      {(workspace.schemes || ['https']).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                    <span className="text-stone-500 dark:text-zinc-400 text-[11px]">
                      [ Base URL: {workspace.host || 'api.example.com'}{workspace.basePath || '/'} ]
                    </span>
                  </div>
                </div>

                {/* Contact & License metadata */}
                {(workspace.info?.contact || workspace.info?.license) && (
                  <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap gap-4 text-xs text-stone-500">
                    {workspace.info.contact?.name && (
                      <span>Kontak: <strong className="text-stone-700 dark:text-zinc-300">{workspace.info.contact.name}</strong></span>
                    )}
                    {workspace.info.contact?.email && (
                      <span>Email: <a href={`mailto:${workspace.info.contact.email}`} className="text-rose-600 hover:underline">{workspace.info.contact.email}</a></span>
                    )}
                    {workspace.info.license?.name && (
                      <span>Lisensi: <strong className="text-stone-700 dark:text-zinc-300">{workspace.info.license.name}</strong></span>
                    )}
                  </div>
                )}
              </div>

              {/* Tag Filters */}
              {tagsList.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
                    <Tag size={13} />
                    <span>Kategori:</span>
                  </span>
                  <button
                    onClick={() => setSelectedTag('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedTag === 'all'
                        ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                        : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    Semua ({workspace.endpoints.length})
                  </button>
                  {tagsList.map(t => {
                    const count = workspace.endpoints.filter(ep => (ep.tag?.trim() || 'General') === t).length;
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedTag(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          selectedTag === t
                            ? 'bg-rose-600 text-white'
                            : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {t} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Endpoints Operations List */}
              <div className="space-y-3">
                {filteredEndpoints.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-400 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800">
                    Belum ada endpoint di kategori ini.
                  </div>
                ) : (
                  filteredEndpoints.map(ep => {
                    const isExpanded = Boolean(expandedEndpoints[ep.id]);
                    const method = ep.method;
                    const pathDisplay = ep.path || ep.url.replace(/^https?:\/\/[^/]+/i, '');

                    return (
                      <div
                        key={ep.id}
                        className={`border rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-200 ${
                          isExpanded
                            ? 'border-rose-400 dark:border-rose-500/50 shadow-md'
                            : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {/* Operation Summary Header Bar */}
                        <div
                          onClick={() => toggleEndpointExpand(ep.id)}
                          className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none bg-stone-50/50 dark:bg-zinc-900/50 hover:bg-stone-100/50 dark:hover:bg-zinc-800/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold border font-mono tracking-wider ${getMethodBadgeClass(
                                method
                              )}`}
                            >
                              {method}
                            </span>
                            <span className="font-mono text-xs sm:text-sm font-bold text-stone-900 dark:text-zinc-100 truncate">
                              {pathDisplay}
                            </span>
                            <span className="hidden md:inline text-xs text-stone-500 dark:text-zinc-400 truncate max-w-sm">
                              {ep.summary || ep.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onSelectEndpoint && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onSelectEndpoint(ep);
                                  onClose();
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-900/40 cursor-pointer flex items-center gap-1 transition-colors"
                                title="Buka dan uji endpoint ini di API Testing Studio"
                              >
                                <Play size={11} fill="currentColor" />
                                <span className="hidden sm:inline">Uji di Studio</span>
                              </button>
                            )}

                            <div className="text-stone-400 p-1">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Operation Body */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-zinc-800 space-y-5 text-xs">
                            {/* Summary & Description */}
                            <div className="space-y-1">
                              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                                {ep.summary || ep.name}
                              </h3>
                              {ep.description && (
                                <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                                  {ep.description}
                                </p>
                              )}
                              {ep.operationId && (
                                <div className="text-[11px] font-mono text-stone-400 pt-0.5">
                                  operationId: <span className="text-stone-600 dark:text-zinc-300 font-semibold">{ep.operationId}</span>
                                </div>
                              )}
                            </div>

                            {/* Section 1: Parameters (Path, Query, Header) */}
                            {((ep.pathParams && ep.pathParams.length > 0) || ep.params.length > 0 || ep.headers.length > 0) && (
                              <div className="space-y-2">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                                  <Layers size={13} />
                                  <span>Parameter Permintaan ({((ep.pathParams?.length || 0) + ep.params.length + ep.headers.length)})</span>
                                </h4>

                                <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden font-mono text-xs">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-stone-100/80 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 border-b border-stone-200 dark:border-zinc-800 font-sans">
                                        <th className="py-2 px-3">Nama</th>
                                        <th className="py-2 px-3">Lokasi (in)</th>
                                        <th className="py-2 px-3">Tipe / Format</th>
                                        <th className="py-2 px-3">Wajib?</th>
                                        <th className="py-2 px-3 font-sans">Deskripsi</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                      {/* Path params */}
                                      {ep.pathParams?.map(p => (
                                        <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                                          <td className="py-2 px-3 font-bold text-rose-600 dark:text-rose-400">{p.key}</td>
                                          <td className="py-2 px-3"><span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-semibold text-[10px]">path</span></td>
                                          <td className="py-2 px-3 text-stone-700 dark:text-zinc-300">{p.type || 'string'} {p.format ? `(${p.format})` : ''}</td>
                                          <td className="py-2 px-3 text-red-500 font-bold">Wajib</td>
                                          <td className="py-2 px-3 font-sans text-stone-600 dark:text-zinc-400">{p.description || '-'}</td>
                                        </tr>
                                      ))}

                                      {/* Query params */}
                                      {ep.params.map(p => (
                                        <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                                          <td className="py-2 px-3 font-bold text-stone-800 dark:text-zinc-200">{p.key}</td>
                                          <td className="py-2 px-3"><span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-semibold text-[10px]">query</span></td>
                                          <td className="py-2 px-3 text-stone-700 dark:text-zinc-300">{p.type || 'string'} {p.format ? `(${p.format})` : ''}</td>
                                          <td className="py-2 px-3">{p.required ? <span className="text-red-500 font-bold">Wajib</span> : <span className="text-stone-400">Opsional</span>}</td>
                                          <td className="py-2 px-3 font-sans text-stone-600 dark:text-zinc-400">{p.description || (p.value ? `Default: ${p.value}` : '-')}</td>
                                        </tr>
                                      ))}

                                      {/* Header params */}
                                      {ep.headers.map(h => (
                                        <tr key={h.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                                          <td className="py-2 px-3 font-bold text-stone-800 dark:text-zinc-200">{h.key}</td>
                                          <td className="py-2 px-3"><span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold text-[10px]">header</span></td>
                                          <td className="py-2 px-3 text-stone-700 dark:text-zinc-300">{h.type || 'string'}</td>
                                          <td className="py-2 px-3">{h.required ? <span className="text-red-500 font-bold">Wajib</span> : <span className="text-stone-400">Opsional</span>}</td>
                                          <td className="py-2 px-3 font-sans text-stone-600 dark:text-zinc-400">{h.description || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Section 2: Request Body Schema (If POST/PUT/PATCH) */}
                            {['POST', 'PUT', 'PATCH'].includes(ep.method) && (
                              <div className="space-y-2">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                                  <Code2 size={13} />
                                  <span>Body Payload Schema (application/json)</span>
                                </h4>

                                {ep.bodySchema?.properties && ep.bodySchema.properties.length > 0 ? (
                                  <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden font-mono text-xs">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-stone-100/80 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 border-b border-stone-200 dark:border-zinc-800 font-sans">
                                          <th className="py-2 px-3">Field</th>
                                          <th className="py-2 px-3">Tipe Data</th>
                                          <th className="py-2 px-3">Wajib</th>
                                          <th className="py-2 px-3 font-sans">Deskripsi & Contoh</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                                        {ep.bodySchema.properties.map(prop => (
                                          <tr key={prop.id}>
                                            <td className="py-2 px-3 font-bold text-rose-600 dark:text-rose-400">{prop.name}</td>
                                            <td className="py-2 px-3 text-stone-700 dark:text-zinc-300">{prop.type} {prop.format ? `(${prop.format})` : ''}</td>
                                            <td className="py-2 px-3">{prop.required ? <span className="text-red-500 font-bold">Ya</span> : <span className="text-stone-400">Tidak</span>}</td>
                                            <td className="py-2 px-3 font-sans text-stone-600 dark:text-zinc-400">
                                              {prop.description}
                                              {prop.example && <span className="block font-mono text-[10px] text-stone-400">Contoh: {prop.example}</span>}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : ep.rawBody ? (
                                  <div className="p-3 bg-stone-900 text-stone-100 rounded-xl font-mono text-xs overflow-x-auto">
                                    <pre>{ep.rawBody}</pre>
                                  </div>
                                ) : (
                                  <p className="text-stone-400 italic">Tidak ada payload body spesifik.</p>
                                )}
                              </div>
                            )}

                            {/* Section 3: Responses (Status Codes, Schemas, Examples) */}
                            <div className="space-y-2">
                              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                                <Server size={13} />
                                <span>Definisi Respon (Responses)</span>
                              </h4>

                              <div className="space-y-2">
                                {ep.responses && Object.keys(ep.responses).length > 0 ? (
                                  (Object.entries(ep.responses) as [string, SwaggerResponseDef][]).map(([code, resp]) => (
                                    <div
                                      key={code}
                                      className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/60 space-y-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                            code.startsWith('2')
                                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                              : code.startsWith('4')
                                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                              : 'bg-red-500/10 text-red-700 dark:text-red-400'
                                          }`}
                                        >
                                          {code}
                                        </span>
                                        <span className="font-semibold text-stone-800 dark:text-zinc-200">
                                          {resp.description}
                                        </span>
                                      </div>

                                      {/* Response Schema Properties */}
                                      {resp.schema?.properties && resp.schema.properties.length > 0 && (
                                        <div className="pt-2">
                                          <div className="text-[11px] font-bold text-stone-500 mb-1">Skema Properti:</div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                                            {resp.schema.properties.map(p => (
                                              <div key={p.id} className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-stone-200/60 dark:border-zinc-700">
                                                <div className="flex items-center justify-between">
                                                  <strong className="text-rose-600 dark:text-rose-400">{p.name}</strong>
                                                  <span className="text-stone-400 text-[10px]">{p.type} {p.format ? `(${p.format})` : ''}</span>
                                                </div>
                                                {p.description && <div className="text-stone-500 text-[10px] font-sans mt-0.5">{p.description}</div>}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Array item schema */}
                                      {resp.schema?.type === 'array' && resp.schema.itemsProperties && resp.schema.itemsProperties.length > 0 && (
                                        <div className="pt-2">
                                          <div className="text-[11px] font-bold text-stone-500 mb-1">Array of Objects Schema:</div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                                            {resp.schema.itemsProperties.map(p => (
                                              <div key={p.id} className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-stone-200/60 dark:border-zinc-700">
                                                <div className="flex items-center justify-between">
                                                  <strong className="text-rose-600 dark:text-rose-400">{p.name}</strong>
                                                  <span className="text-stone-400 text-[10px]">{p.type} {p.format ? `(${p.format})` : ''}</span>
                                                </div>
                                                {p.description && <div className="text-stone-500 text-[10px] font-sans mt-0.5">{p.description}</div>}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Example JSON body */}
                                      {resp.exampleBody && (
                                        <details className="mt-2 text-[11px]">
                                          <summary className="cursor-pointer text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 font-semibold select-none">
                                            Lihat Contoh Respon JSON
                                          </summary>
                                          <pre className="mt-1.5 p-3 bg-stone-900 text-stone-100 rounded-xl overflow-x-auto font-mono text-xs">
                                            {resp.exampleBody}
                                          </pre>
                                        </details>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 bg-stone-100 dark:bg-zinc-800 rounded-xl text-stone-500">
                                    Respon default: 200 OK
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RAW SWAGGER.JSON */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Format: Swagger 2.0 (OpenAPI 2.0) Specification JSON</span>
                <span className="font-mono">{(new Blob([swaggerJsonString]).size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="relative">
                <pre className="p-4 bg-stone-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto border border-stone-800 leading-relaxed max-h-[68vh]">
                  {swaggerJsonString}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: RAW YAML */}
          {activeTab === 'yaml' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Format: Swagger 2.0 Specification YAML</span>
                <span className="font-mono">{(new Blob([swaggerYamlString]).size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="relative">
                <pre className="p-4 bg-stone-900 text-sky-400 rounded-2xl font-mono text-xs overflow-x-auto border border-stone-800 leading-relaxed max-h-[68vh]">
                  {swaggerYamlString}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
