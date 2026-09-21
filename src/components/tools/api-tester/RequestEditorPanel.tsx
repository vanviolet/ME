import React from 'react';
import {
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ApiRequestState,
  ApiResponseState,
  KeyValueParam,
} from './types';
import { ParamsEditor } from './ParamsEditor';
import { BodySchemaEditor } from './BodySchemaEditor';
import { ResponsesEditor } from './ResponsesEditor';

interface RequestEditorPanelProps {
  request: ApiRequestState;
  setRequest: React.Dispatch<React.SetStateAction<ApiRequestState>>;
  activeReqTab: 'params' | 'auth' | 'headers' | 'body' | 'responses' | 'settings';
  setActiveReqTab: (tab: 'params' | 'auth' | 'headers' | 'body' | 'responses' | 'settings') => void;
  detectedPathKeys: string[];
  response: ApiResponseState | null;
  showBasicPass: boolean;
  setShowBasicPass: (v: boolean) => void;
  showBearerToken: boolean;
  setShowBearerToken: (v: boolean) => void;
  isSplit?: boolean;
}

export const RequestEditorPanel: React.FC<RequestEditorPanelProps> = ({
  request,
  setRequest,
  activeReqTab,
  setActiveReqTab,
  detectedPathKeys,
  response,
  showBasicPass,
  setShowBasicPass,
  showBearerToken,
  setShowBearerToken,
  isSplit = false,
}) => {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden ${
        isSplit ? 'h-full flex flex-col min-h-0' : ''
      }`}
    >
      {/* Tabs Header */}
      <div className="shrink-0 flex items-center px-2 sm:px-3 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 overflow-x-auto scrollbar-none [-webkit-overflow-scrolling:touch]">
        {[
          {
            id: 'params',
            label: 'Params',
            badge: detectedPathKeys.length + request.params.length,
          },
          {
            id: 'body',
            label: 'Body',
            badge: request.bodyType !== 'none' ? request.bodyType : undefined,
          },
          {
            id: 'responses',
            label: 'Responses (Swagger)',
            badge: Object.keys(request.responses || {}).length || '1',
          },
          {
            id: 'headers',
            label: 'Headers',
            badge: request.headers.length,
          },
          {
            id: 'auth',
            label: 'Auth',
            badge: request.auth.type !== 'none' ? '✓' : undefined,
          },
          { id: 'settings', label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReqTab(tab.id as any)}
            className={`px-3 py-2 sm:py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 ${
              activeReqTab === tab.id
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
            }`}
          >
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-mono font-medium">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Body */}
      <div className={`${isSplit ? 'flex-1 min-h-0 overflow-y-auto p-4' : 'p-4'}`}>
        {/* TAB 1: PARAMETERS (QUERY & PATH) */}
        {activeReqTab === 'params' && (
          <ParamsEditor
            queryParams={request.params}
            pathParams={request.pathParams || []}
            detectedPathKeys={detectedPathKeys}
            onAddQueryParam={() => {
              setRequest(prev => ({
                ...prev,
                params: [
                  ...prev.params,
                  {
                    id: 'p_' + Math.random().toString(36).substring(2, 9),
                    key: '',
                    value: '',
                    enabled: true,
                    type: 'string',
                    required: false,
                  },
                ],
              }));
            }}
            onUpdateQueryParam={(id, field, val) => {
              setRequest(prev => ({
                ...prev,
                params: prev.params.map(p => (p.id === id ? { ...p, [field]: val } : p)),
              }));
            }}
            onDeleteQueryParam={id => {
              setRequest(prev => ({
                ...prev,
                params: prev.params.filter(p => p.id !== id),
              }));
            }}
            onUpdatePathParam={(key, field, val) => {
              const current = request.pathParams || [];
              const exists = current.some(p => p.key === key);
              let updated: KeyValueParam[];
              if (exists) {
                updated = current.map(p => (p.key === key ? { ...p, [field]: val } : p));
              } else {
                updated = [
                  ...current,
                  {
                    id: 'pp_' + key,
                    key,
                    value: field === 'value' ? val : '',
                    type: field === 'type' ? val : 'string',
                    required: true,
                    enabled: true,
                    description: field === 'description' ? val : '',
                  },
                ];
              }
              setRequest(prev => ({
                ...prev,
                pathParams: updated,
              }));
            }}
          />
        )}

        {/* TAB 2: BODY PAYLOAD & SWAGGER SCHEMA BUILDER */}
        {activeReqTab === 'body' && (
          <BodySchemaEditor
            bodyType={request.bodyType}
            rawBody={request.rawBody}
            bodySchema={request.bodySchema}
            formData={request.formData}
            urlEncodedData={request.urlEncodedData}
            onChangeBodyType={type => setRequest({ ...request, bodyType: type })}
            onChangeRawBody={raw => setRequest({ ...request, rawBody: raw })}
            onChangeBodySchema={schema => setRequest({ ...request, bodySchema: schema })}
            onChangeFormData={data => setRequest({ ...request, formData: data })}
            onChangeUrlEncodedData={data => setRequest({ ...request, urlEncodedData: data })}
          />
        )}

        {/* TAB 3: RESPONSES SPECIFICATION */}
        {activeReqTab === 'responses' && (
          <ResponsesEditor
            responses={request.responses || {}}
            onChangeResponses={resps => setRequest({ ...request, responses: resps })}
            liveResponse={response}
          />
        )}

        {/* TAB 4: HEADERS */}
        {activeReqTab === 'headers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                HTTP Request Headers
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
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
                  onClick={() => {
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
                  }}
                  className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                >
                  <Plus size={13} />
                  <span>Tambah Header</span>
                </button>
              </div>
            </div>

            <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[420px] text-left border-collapse text-xs">
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
                            onChange={e =>
                              setRequest(prev => ({
                                ...prev,
                                headers: prev.headers.map(x => (x.id === h.id ? { ...x, enabled: e.target.checked } : x)),
                              }))
                            }
                            className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={h.key}
                            placeholder="contoh: Authorization"
                            onChange={e =>
                              setRequest(prev => ({
                                ...prev,
                                headers: prev.headers.map(x => (x.id === h.id ? { ...x, key: e.target.value } : x)),
                              }))
                            }
                            className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={h.value}
                            placeholder="contoh: application/json"
                            onChange={e =>
                              setRequest(prev => ({
                                ...prev,
                                headers: prev.headers.map(x => (x.id === h.id ? { ...x, value: e.target.value } : x)),
                              }))
                            }
                            className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button
                            onClick={() =>
                              setRequest(prev => ({
                                ...prev,
                                headers: prev.headers.filter(x => x.id !== h.id),
                              }))
                            }
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

        {/* TAB 5: AUTHORIZATION */}
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

        {/* TAB 6: SETTINGS */}
        {activeReqTab === 'settings' && (
          <div className="space-y-4 max-w-lg">
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
  );
};
