import React from 'react';
import { Plus, Trash2, Layers, AlertCircle } from 'lucide-react';
import { KeyValueParam, SwaggerParamType } from './types';

interface ParamsEditorProps {
  queryParams: KeyValueParam[];
  pathParams: KeyValueParam[];
  detectedPathKeys: string[];
  onUpdateQueryParam: (id: string, field: keyof KeyValueParam, value: any) => void;
  onAddQueryParam: () => void;
  onDeleteQueryParam: (id: string) => void;
  onUpdatePathParam: (key: string, field: keyof KeyValueParam, value: any) => void;
}

const SWAGGER_TYPES: SwaggerParamType[] = ['string', 'integer', 'number', 'boolean', 'array'];

export const ParamsEditor: React.FC<ParamsEditorProps> = ({
  queryParams,
  pathParams,
  detectedPathKeys,
  onUpdateQueryParam,
  onAddQueryParam,
  onDeleteQueryParam,
  onUpdatePathParam,
}) => {
  return (
    <div className="space-y-6">
      {/* SECTION 1: Path Parameters (Swagger in: "path") */}
      {detectedPathKeys.length > 0 && (
        <div className="space-y-2 p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Layers size={13} />
                <span>Path Parameters (Terdeteksi dari URL Template)</span>
              </span>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                Nilai parameter ini akan otomatis menggantikan placeholder seperti <code className="font-mono text-purple-600 font-bold">{'{param}'}</code> saat request dikirim.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono">
              in: path (wajib)
            </span>
          </div>

          <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-x-auto font-mono text-xs bg-white dark:bg-zinc-900 scrollbar-thin">
            <table className="w-full min-w-[540px] text-left border-collapse">
              <thead>
                <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold font-sans">
                  <th className="py-2 px-3">Nama (Placeholder)</th>
                  <th className="py-2 px-3">Nilai Uji (Test Value)</th>
                  <th className="py-2 px-3">Tipe Data</th>
                  <th className="py-2 px-3 font-sans">Deskripsi Swagger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {detectedPathKeys.map(key => {
                  const param = pathParams.find(p => p.key === key) || {
                    id: 'pp_' + key,
                    key,
                    value: '',
                    enabled: true,
                    type: 'string',
                    required: true,
                  };

                  return (
                    <tr key={key} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-2 px-3 font-bold text-purple-600 dark:text-purple-400">
                        {'{' + key + '}'}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={param.value || ''}
                          placeholder={`Nilai untuk ${key}`}
                          onChange={e => onUpdatePathParam(key, 'value', e.target.value)}
                          className="w-full px-2 py-1 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-purple-500 text-stone-900 dark:text-zinc-100 font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={param.type || 'string'}
                          onChange={e => onUpdatePathParam(key, 'type', e.target.value)}
                          className="px-2 py-1 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none cursor-pointer text-stone-800 dark:text-zinc-200 font-sans"
                        >
                          {SWAGGER_TYPES.map(t => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={param.description || ''}
                          placeholder={`Deskripsi parameter ${key}...`}
                          onChange={e => onUpdatePathParam(key, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-purple-500 text-stone-700 dark:text-zinc-300 font-sans text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: Query Parameters (Swagger in: "query") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
              Query Parameters (in: query)
            </span>
            <p className="text-[11px] text-stone-400">
              Parameter query HTTP yang ditambahkan setelah tanda tanya <code className="font-mono">?key=value</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onAddQueryParam}
            className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg flex items-center gap-1 font-semibold cursor-pointer transition-colors"
          >
            <Plus size={13} />
            <span>Tambah Parameter</span>
          </button>
        </div>

        <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-x-auto font-mono text-xs bg-white dark:bg-zinc-900 scrollbar-thin">
          <table className="w-full min-w-[620px] text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold font-sans">
                <th className="py-2 px-2 w-8 text-center">Aktif</th>
                <th className="py-2 px-3">Nama Key</th>
                <th className="py-2 px-3">Nilai (Value)</th>
                <th className="py-2 px-3 w-28">Tipe Data</th>
                <th className="py-2 px-2 w-16 text-center font-sans">Wajib?</th>
                <th className="py-2 px-3 font-sans">Deskripsi Swagger</th>
                <th className="py-2 px-2 w-10 text-center font-sans">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {queryParams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-stone-400 font-sans">
                    Belum ada query parameter. Klik "+ Tambah Parameter" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                queryParams.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={e => onUpdateQueryParam(p.id, 'enabled', e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={p.key}
                        placeholder="contoh: limit"
                        onChange={e => onUpdateQueryParam(p.id, 'key', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100 font-bold"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={p.value}
                        placeholder="contoh: 10"
                        onChange={e => onUpdateQueryParam(p.id, 'value', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-700 dark:text-zinc-300"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <select
                        value={p.type || 'string'}
                        onChange={e => onUpdateQueryParam(p.id, 'type', e.target.value)}
                        className="w-full px-1.5 py-1 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none font-sans cursor-pointer text-stone-800 dark:text-zinc-200"
                      >
                        {SWAGGER_TYPES.map(t => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(p.required)}
                        onChange={e => onUpdateQueryParam(p.id, 'required', e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        title="Tandai sebagai parameter wajib di Swagger"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={p.description || ''}
                        placeholder="Deskripsi parameter..."
                        onChange={e => onUpdateQueryParam(p.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-600 dark:text-zinc-400 font-sans"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteQueryParam(p.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                        title="Hapus Parameter"
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
    </div>
  );
};
