import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Wand2,
  FileCode,
  Layers,
} from 'lucide-react';
import {
  ApiRequestState,
  KeyValueParam,
  SwaggerPropertyType,
  SwaggerSchemaDef,
  SwaggerSchemaProperty,
} from './types';
import { generateSampleJsonFromSchema, inferSchemaFromJson } from './swaggerGenerator';

interface BodySchemaEditorProps {
  bodyType: ApiRequestState['bodyType'];
  rawBody: string;
  bodySchema?: SwaggerSchemaDef;
  formData: KeyValueParam[];
  urlEncodedData: KeyValueParam[];
  onChangeBodyType: (type: ApiRequestState['bodyType']) => void;
  onChangeRawBody: (raw: string) => void;
  onChangeBodySchema: (schema: SwaggerSchemaDef) => void;
  onChangeFormData: (items: KeyValueParam[]) => void;
  onChangeUrlEncodedData: (items: KeyValueParam[]) => void;
}

const PROPERTY_TYPES: SwaggerPropertyType[] = [
  'string',
  'integer',
  'number',
  'boolean',
  'array',
  'object',
];

export const BodySchemaEditor: React.FC<BodySchemaEditorProps> = ({
  bodyType,
  rawBody,
  bodySchema,
  formData,
  urlEncodedData,
  onChangeBodyType,
  onChangeRawBody,
  onChangeBodySchema,
  onChangeFormData,
  onChangeUrlEncodedData,
}) => {
  const [subView, setSubView] = useState<'raw' | 'schema'>('raw');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [inferredNotice, setInferredNotice] = useState(false);

  // Beautify JSON
  const handleBeautify = () => {
    setJsonError(null);
    if (!rawBody.trim()) return;
    try {
      const parsed = JSON.parse(rawBody);
      onChangeRawBody(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setJsonError('Format JSON tidak valid: ' + e.message);
    }
  };

  // Minify JSON
  const handleMinify = () => {
    setJsonError(null);
    if (!rawBody.trim()) return;
    try {
      const parsed = JSON.parse(rawBody);
      onChangeRawBody(JSON.stringify(parsed));
    } catch (e: any) {
      setJsonError('Format JSON tidak valid: ' + e.message);
    }
  };

  // Auto Infer Swagger Schema from JSON Payload
  const handleInferSchema = () => {
    setJsonError(null);
    if (!rawBody.trim()) return;
    try {
      const parsed = JSON.parse(rawBody);
      const inferred = inferSchemaFromJson(parsed);
      onChangeBodySchema(inferred);
      setInferredNotice(true);
      setSubView('schema');
      setTimeout(() => setInferredNotice(false), 3000);
    } catch (e: any) {
      setJsonError('Tidak dapat infer schema. Format JSON tidak valid: ' + e.message);
    }
  };

  // Generate Sample JSON from Schema
  const handleGenerateSampleFromJsonSchema = () => {
    if (!bodySchema) return;
    const sample = generateSampleJsonFromSchema(bodySchema);
    onChangeRawBody(JSON.stringify(sample, null, 2));
    setSubView('raw');
  };

  // Schema Property Helpers
  const currentProps = bodySchema?.properties || [];

  const handleAddSchemaProp = () => {
    const newProp: SwaggerSchemaProperty = {
      id: 'prop_' + Math.random().toString(36).substring(2, 9),
      name: 'newField',
      type: 'string',
      required: false,
      example: '',
      description: '',
    };
    onChangeBodySchema({
      type: bodySchema?.type || 'object',
      properties: [...currentProps, newProp],
    });
  };

  const handleUpdateSchemaProp = (id: string, field: keyof SwaggerSchemaProperty, val: any) => {
    const updated = currentProps.map(p => (p.id === id ? { ...p, [field]: val } : p));
    onChangeBodySchema({
      type: bodySchema?.type || 'object',
      properties: updated,
    });
  };

  const handleDeleteSchemaProp = (id: string) => {
    const updated = currentProps.filter(p => p.id !== id);
    onChangeBodySchema({
      type: bodySchema?.type || 'object',
      properties: updated,
    });
  };

  return (
    <div className="space-y-4">
      {/* Body Type Selection Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'none', label: 'none' },
            { id: 'json', label: 'raw (JSON)' },
            { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
            { id: 'form-data', label: 'form-data' },
            { id: 'raw', label: 'raw (Text)' },
          ].map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => onChangeBodyType(type.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                bodyType === type.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* JSON Submode: Raw vs Swagger Schema */}
        {bodyType === 'json' && (
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSubView('raw')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                subView === 'raw'
                  ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              JSON Payload
            </button>
            <button
              type="button"
              onClick={() => setSubView('schema')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
                subView === 'schema'
                  ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              <Code2 size={12} />
              <span>Swagger Schema Builder ({currentProps.length})</span>
            </button>
          </div>
        )}
      </div>

      {bodyType === 'none' && (
        <div className="py-12 text-center text-xs text-stone-400 dark:text-zinc-500 border border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl">
          Permintaan ini tidak menyertakan payload body.
        </div>
      )}

      {/* SUBVIEW 1: RAW JSON PAYLOAD */}
      {bodyType === 'json' && subView === 'raw' && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Editor Payload JSON (Otomatis dikirim dengan Header <code className="font-mono text-rose-600">Content-Type: application/json</code>)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleInferSchema}
                disabled={!rawBody.trim()}
                className="px-2.5 py-1 text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-lg font-semibold flex items-center gap-1 border border-purple-200 dark:border-purple-800/40 cursor-pointer disabled:opacity-50"
                title="Konversi otomatis struktur JSON ini menjadi tipe data Swagger Schema"
              >
                <Sparkles size={12} />
                <span>Infer Swagger Schema</span>
              </button>
              <button
                type="button"
                onClick={handleBeautify}
                className="px-2 py-1 text-[11px] bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg font-medium cursor-pointer"
              >
                Beautify
              </button>
              <button
                type="button"
                onClick={handleMinify}
                className="px-2 py-1 text-[11px] bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg font-medium cursor-pointer"
              >
                Minify
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={rawBody}
            onChange={e => {
              setJsonError(null);
              onChangeRawBody(e.target.value);
            }}
            placeholder={'{\n  "title": "Judul Baru",\n  "content": "Isi artikel",\n  "status": "published"\n}'}
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

      {/* SUBVIEW 2: SWAGGER SCHEMA PROPERTIES BUILDER */}
      {bodyType === 'json' && subView === 'schema' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                Swagger Body Parameter Schema Definition
              </span>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                Definisikan nama field, tipe data, format, dan apakah wajib diisi untuk spesifikasi Swagger 2.0.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateSampleFromJsonSchema}
                disabled={currentProps.length === 0}
                className="px-2.5 py-1 text-xs bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Buat payload JSON sampel dari definisi schema di bawah"
              >
                <Wand2 size={12} />
                <span>Buat Contoh JSON</span>
              </button>
              <button
                type="button"
                onClick={handleAddSchemaProp}
                className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Tambah Properti</span>
              </button>
            </div>
          </div>

          {inferredNotice && (
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2 border border-purple-500/20">
              <Sparkles size={14} />
              <span>Berhasil mengekstrak {currentProps.length} properti schema dari payload JSON!</span>
            </div>
          )}

          <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden font-mono text-xs bg-white dark:bg-zinc-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold font-sans">
                  <th className="py-2 px-3">Nama Field</th>
                  <th className="py-2 px-3 w-28">Tipe Data</th>
                  <th className="py-2 px-3 w-28">Format</th>
                  <th className="py-2 px-2 w-16 text-center font-sans">Wajib?</th>
                  <th className="py-2 px-3">Contoh Nilai</th>
                  <th className="py-2 px-3 font-sans">Deskripsi</th>
                  <th className="py-2 px-2 w-10 text-center font-sans">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                {currentProps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-stone-400 font-sans">
                      Belum ada definisi schema properti. Klik "+ Tambah Properti" atau "Infer Swagger Schema" dari tab JSON Payload.
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
                          onChange={e => handleUpdateSchemaProp(prop.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 font-bold text-rose-600 dark:text-rose-400"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <select
                          value={prop.type}
                          onChange={e => handleUpdateSchemaProp(prop.id, 'type', e.target.value)}
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
                          placeholder="e.g. int64, email"
                          onChange={e => handleUpdateSchemaProp(prop.id, 'format', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-600 dark:text-zinc-400 text-[11px]"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(prop.required)}
                          onChange={e => handleUpdateSchemaProp(prop.id, 'required', e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={prop.example || ''}
                          placeholder="sample value"
                          onChange={e => handleUpdateSchemaProp(prop.id, 'example', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 text-stone-700 dark:text-zinc-300"
                        />
                      </td>
                      <td className="py-1.5 px-3">
                        <input
                          type="text"
                          value={prop.description || ''}
                          placeholder="Deskripsi field..."
                          onChange={e => handleUpdateSchemaProp(prop.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500 font-sans text-stone-600 dark:text-zinc-400 text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSchemaProp(prop.id)}
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
      )}

      {/* Raw Text */}
      {bodyType === 'raw' && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
            Teks Mentah (Raw Text)
          </span>
          <textarea
            rows={8}
            value={rawBody}
            onChange={e => onChangeRawBody(e.target.value)}
            placeholder="Tuliskan payload teks mentah..."
            className="w-full p-3 font-mono text-xs bg-stone-900 text-stone-100 border border-stone-800 rounded-xl outline-none focus:border-rose-500 leading-relaxed resize-y"
          />
        </div>
      )}

      {/* x-www-form-urlencoded */}
      {bodyType === 'x-www-form-urlencoded' && (
        <div className="space-y-2">
          <p className="text-xs text-stone-500">
            Format form URL-encoded (misal: login form). Header <code className="font-mono text-rose-600">Content-Type: application/x-www-form-urlencoded</code> akan diterapkan otomatis.
          </p>
          <textarea
            rows={4}
            value={rawBody}
            onChange={e => onChangeRawBody(e.target.value)}
            placeholder="grant_type=client_credentials&client_id=xyz&client_secret=123"
            className="w-full p-3 font-mono text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white"
          />
        </div>
      )}
    </div>
  );
};
