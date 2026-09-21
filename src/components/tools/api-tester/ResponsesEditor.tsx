import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Server,
  Code2,
  Check,
  AlertCircle,
  Wand2,
  Download,
} from 'lucide-react';
import {
  ApiResponseState,
  SwaggerPropertyType,
  SwaggerResponseDef,
  SwaggerSchemaDef,
  SwaggerSchemaProperty,
} from './types';
import { generateSampleJsonFromSchema, inferSchemaFromJson } from './swaggerGenerator';

interface ResponsesEditorProps {
  responses: Record<string, SwaggerResponseDef>;
  onChangeResponses: (responses: Record<string, SwaggerResponseDef>) => void;
  liveResponse: ApiResponseState | null;
}

const COMMON_STATUS_CODES = [
  { code: '200', desc: 'OK - Berhasil memuat data' },
  { code: '201', desc: 'Created - Data berhasil dibuat' },
  { code: '204', desc: 'No Content - Berhasil tanpa konten balik' },
  { code: '400', desc: 'Bad Request - Validasi payload gagal' },
  { code: '401', desc: 'Unauthorized - Token autentikasi hilang/tidak valid' },
  { code: '403', desc: 'Forbidden - Hak akses tidak mencukupi' },
  { code: '404', desc: 'Not Found - Data tidak ditemukan' },
  { code: '500', desc: 'Internal Server Error - Terjadi galat pada server' },
];

const PROPERTY_TYPES: SwaggerPropertyType[] = [
  'string',
  'integer',
  'number',
  'boolean',
  'array',
  'object',
];

export const ResponsesEditor: React.FC<ResponsesEditorProps> = ({
  responses,
  onChangeResponses,
  liveResponse,
}) => {
  const statusCodes = Object.keys(responses);
  const [selectedCode, setSelectedCode] = useState<string>(
    statusCodes[0] || '200'
  );

  // If no responses exist, create default 200
  React.useEffect(() => {
    if (statusCodes.length === 0) {
      onChangeResponses({
        '200': {
          statusCode: '200',
          description: 'Successful response',
          schema: {
            type: 'object',
            properties: [
              {
                id: 'p_status',
                name: 'status',
                type: 'string',
                example: 'success',
                description: 'Status operasi',
              },
            ],
          },
        },
      });
      setSelectedCode('200');
    }
  }, []);

  const activeResponse = responses[selectedCode] || {
    statusCode: selectedCode,
    description: 'Response description',
  };

  const handleAddStatusCode = (code: string, defaultDesc: string) => {
    if (responses[code]) {
      setSelectedCode(code);
      return;
    }

    const newResp: SwaggerResponseDef = {
      statusCode: code,
      description: defaultDesc,
      schema: {
        type: 'object',
        properties: [],
      },
    };

    onChangeResponses({
      ...responses,
      [code]: newResp,
    });
    setSelectedCode(code);
  };

  const handleDeleteStatusCode = (code: string) => {
    const updated = { ...responses };
    delete updated[code];
    onChangeResponses(updated);
    const remaining = Object.keys(updated);
    if (remaining.length > 0) {
      setSelectedCode(remaining[0]);
    }
  };

  const handleUpdateActiveDesc = (desc: string) => {
    onChangeResponses({
      ...responses,
      [selectedCode]: {
        ...activeResponse,
        description: desc,
      },
    });
  };

  const handleUpdateActiveSchemaType = (type: SwaggerPropertyType) => {
    onChangeResponses({
      ...responses,
      [selectedCode]: {
        ...activeResponse,
        schema: {
          ...(activeResponse.schema || { properties: [] }),
          type,
        },
      },
    });
  };

  const currentProps = activeResponse.schema?.properties || [];

  const handleAddProp = () => {
    const newProp: SwaggerSchemaProperty = {
      id: 'prop_' + Math.random().toString(36).substring(2, 9),
      name: 'field',
      type: 'string',
      required: false,
      example: '',
      description: '',
    };
    onChangeResponses({
      ...responses,
      [selectedCode]: {
        ...activeResponse,
        schema: {
          ...(activeResponse.schema || { type: 'object' }),
          type: activeResponse.schema?.type || 'object',
          properties: [...currentProps, newProp],
        },
      },
    });
  };

  const handleUpdateProp = (id: string, field: keyof SwaggerSchemaProperty, val: any) => {
    const updated = currentProps.map(p => (p.id === id ? { ...p, [field]: val } : p));
    onChangeResponses({
      ...responses,
      [selectedCode]: {
        ...activeResponse,
        schema: {
          ...(activeResponse.schema || { type: 'object' }),
          type: activeResponse.schema?.type || 'object',
          properties: updated,
        },
      },
    });
  };

  const handleDeleteProp = (id: string) => {
    const updated = currentProps.filter(p => p.id !== id);
    onChangeResponses({
      ...responses,
      [selectedCode]: {
        ...activeResponse,
        schema: {
          ...(activeResponse.schema || { type: 'object' }),
          type: activeResponse.schema?.type || 'object',
          properties: updated,
        },
      },
    });
  };

  // Capture Live Test Response as Schema
  const handleCaptureLiveResponse = () => {
    if (!liveResponse) return;
    const statusCode = String(liveResponse.status || '200');

    let schema: SwaggerSchemaDef | undefined = undefined;
    let exampleBody = '';

    if (liveResponse.isJson && liveResponse.data) {
      schema = inferSchemaFromJson(liveResponse.data);
      exampleBody = JSON.stringify(liveResponse.data, null, 2);
    }

    const capturedResp: SwaggerResponseDef = {
      statusCode,
      description: liveResponse.statusText ? `HTTP ${statusCode} - ${liveResponse.statusText}` : 'Response hasil pengujian studio',
      schema,
      exampleBody,
    };

    onChangeResponses({
      ...responses,
      [statusCode]: capturedResp,
    });
    setSelectedCode(statusCode);
  };

  return (
    <div className="space-y-5">
      {/* Live Response Quick Capture Banner */}
      {liveResponse && liveResponse.status > 0 && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                liveResponse.status < 300
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
              }`}
            >
              Status: {liveResponse.status} {liveResponse.statusText}
            </span>
            <span className="text-xs text-stone-700 dark:text-zinc-300">
              Respon pengujian terkini tersedia ({liveResponse.timeMs}ms, {liveResponse.isJson ? 'JSON' : liveResponse.contentType})
            </span>
          </div>

          <button
            type="button"
            onClick={handleCaptureLiveResponse}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Sparkles size={13} />
            <span>Jadikan Respon Ini sebagai Schema Swagger (Status {liveResponse.status})</span>
          </button>
        </div>
      )}

      {/* Response Status Codes Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Server size={13} />
            <span>Kode Status HTTP (Swagger 2.0 Responses)</span>
          </span>

          <div className="relative group">
            <button
              type="button"
              className="px-2.5 py-1 text-xs bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Tambah Status Code</span>
            </button>
            <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-64 p-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl shadow-xl z-20 space-y-0.5 text-xs">
              {COMMON_STATUS_CODES.map(c => (
                <div
                  key={c.code}
                  onClick={() => handleAddStatusCode(c.code, c.desc)}
                  className="px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-lg cursor-pointer flex items-center justify-between"
                >
                  <strong className="font-mono text-rose-600">{c.code}</strong>
                  <span className="text-stone-500 truncate text-[11px] ml-2">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statusCodes.map(code => {
            const isSelected = code === selectedCode;
            const isSuccess = code.startsWith('2');
            const isClientErr = code.startsWith('4');

            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedCode(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : isSuccess
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    : isClientErr
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-transparent'
                }`}
              >
                <span>{code}</span>
                {statusCodes.length > 1 && (
                  <span
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteStatusCode(code);
                    }}
                    className="hover:text-red-300 ml-1 cursor-pointer"
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Status Code Configuration Card */}
      <div className="p-4 border border-stone-200 dark:border-zinc-800 rounded-2xl bg-stone-50/50 dark:bg-zinc-900/40 space-y-4">
        {/* Description & Schema Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Deskripsi Respon (Swagger <code className="font-mono text-rose-600">description</code>) *
            </label>
            <input
              type="text"
              value={activeResponse.description}
              onChange={e => handleUpdateActiveDesc(e.target.value)}
              placeholder="e.g. Data artikel berhasil didapatkan"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-medium text-stone-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Tipe Schema Respon
            </label>
            <select
              value={activeResponse.schema?.type || 'object'}
              onChange={e => handleUpdateActiveSchemaType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer text-stone-900 dark:text-white font-medium"
            >
              <option value="object">Object (JSON Key-Value)</option>
              <option value="array">Array of Objects</option>
              <option value="string">String (Plain Text / HTML)</option>
              <option value="boolean">Boolean</option>
              <option value="number">Number</option>
            </select>
          </div>
        </div>

        {/* Schema Properties Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
              Properti Schema Respon ({currentProps.length})
            </span>
            <button
              type="button"
              onClick={handleAddProp}
              className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>Tambah Properti</span>
            </button>
          </div>

          <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden font-mono text-xs bg-white dark:bg-zinc-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold font-sans">
                  <th className="py-2 px-3">Nama Field</th>
                  <th className="py-2 px-3 w-28">Tipe Data</th>
                  <th className="py-2 px-3 w-28">Format</th>
                  <th className="py-2 px-3">Contoh Nilai</th>
                  <th className="py-2 px-3 font-sans">Deskripsi</th>
                  <th className="py-2 px-2 w-10 text-center font-sans">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {currentProps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-stone-400 font-sans">
                      Belum ada properti schema. Klik "+ Tambah Properti" untuk mendefinisikan tipe data balasan.
                    </td>
                  </tr>
                ) : (
                  currentProps.map(prop => (
                    <tr key={prop.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={prop.name}
                          placeholder="fieldName"
                          onChange={e => handleUpdateProp(prop.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 font-bold text-rose-600 dark:text-rose-400"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <select
                          value={prop.type}
                          onChange={e => handleUpdateProp(prop.id, 'type', e.target.value)}
                          className="w-full px-1.5 py-1 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none font-sans cursor-pointer text-stone-800 dark:text-zinc-200"
                        >
                          {PROPERTY_TYPES.map(t => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={prop.format || ''}
                          placeholder="int64, email..."
                          onChange={e => handleUpdateProp(prop.id, 'format', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-600 dark:text-zinc-400 text-[11px]"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={prop.example || ''}
                          placeholder="sample value"
                          onChange={e => handleUpdateProp(prop.id, 'example', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-700 dark:text-zinc-300"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={prop.description || ''}
                          placeholder="Deskripsi..."
                          onChange={e => handleUpdateProp(prop.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 font-sans text-stone-600 dark:text-zinc-400 text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteProp(prop.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
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

        {/* Example JSON Response */}
        {activeResponse.exampleBody && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Contoh Respon JSON (Swagger example):
            </span>
            <pre className="p-3 bg-stone-900 text-stone-100 rounded-xl font-mono text-xs overflow-x-auto max-h-48">
              {activeResponse.exampleBody}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
