import React, { useState, useEffect } from 'react';
import {
  X,
  Settings2,
  Save,
  Globe,
  Tag,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import { WorkspaceProject, SwaggerInfo } from './types';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceProject;
  onSaveWorkspace: (updated: WorkspaceProject) => void;
}

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
  workspace,
  onSaveWorkspace,
}) => {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.info?.description || workspace.description || '');
  const [version, setVersion] = useState(workspace.info?.version || '1.0.0');
  const [host, setHost] = useState(workspace.host || '');
  const [basePath, setBasePath] = useState(workspace.basePath || '/');
  const [schemes, setSchemes] = useState<('http' | 'https' | 'ws' | 'wss')[]>(
    workspace.schemes || ['https']
  );
  const [tags, setTags] = useState<{ name: string; description?: string }[]>(
    workspace.tags || []
  );
  const [newTagName, setNewTagName] = useState('');
  const [newTagDesc, setNewTagDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(workspace.name);
      setDescription(workspace.info?.description || workspace.description || '');
      setVersion(workspace.info?.version || '1.0.0');
      setHost(workspace.host || '');
      setBasePath(workspace.basePath || '/');
      setSchemes(workspace.schemes || ['https']);
      setTags(workspace.tags || []);
    }
  }, [isOpen, workspace]);

  if (!isOpen) return null;

  const handleToggleScheme = (s: 'http' | 'https' | 'ws' | 'wss') => {
    if (schemes.includes(s)) {
      if (schemes.length > 1) {
        setSchemes(schemes.filter(x => x !== s));
      }
    } else {
      setSchemes([...schemes, s]);
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    if (tags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase())) return;
    setTags([...tags, { name: newTagName.trim(), description: newTagDesc.trim() }]);
    setNewTagName('');
    setNewTagDesc('');
  };

  const handleDeleteTag = (tagName: string) => {
    setTags(tags.filter(t => t.name !== tagName));
  };

  const handleSave = () => {
    const updatedInfo: SwaggerInfo = {
      title: name.trim(),
      version: version.trim() || '1.0.0',
      description: description.trim(),
      termsOfService: workspace.info?.termsOfService,
      contact: workspace.info?.contact,
      license: workspace.info?.license,
    };

    const updatedWorkspace: WorkspaceProject = {
      ...workspace,
      name: name.trim(),
      description: description.trim(),
      info: updatedInfo,
      host: host.trim().replace(/^https?:\/\//i, ''),
      basePath: basePath.trim().startsWith('/') ? basePath.trim() : '/' + basePath.trim(),
      schemes,
      tags,
      updatedAt: Date.now(),
    };

    onSaveWorkspace(updatedWorkspace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
              <Settings2 size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Pengaturan Workspace & Spesifikasi Swagger
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Informasi dasar API, host server, basePath, dan kategori tag
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title and Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                Nama Workspace / Judul API
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="contoh: E-Commerce REST API"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-medium text-stone-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                Versi API
              </label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="contoh: 1.0.0"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Deskripsi API (Mendukung Teks / Markdown)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Deskripsi dokumentasi API..."
              className="w-full p-3 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white leading-relaxed resize-y"
            />
          </div>

          {/* Host & BasePath */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                Host / Domain Server API (Swagger <code className="font-mono text-rose-600">host</code>)
              </label>
              <input
                type="text"
                value={host}
                onChange={e => setHost(e.target.value)}
                placeholder="contoh: api.myserver.com atau dummyjson.com"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                Base Path (Swagger <code className="font-mono text-rose-600">basePath</code>)
              </label>
              <input
                type="text"
                value={basePath}
                onChange={e => setBasePath(e.target.value)}
                placeholder="contoh: /v1 atau /"
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-white"
              />
            </div>
          </div>

          {/* Transfer Protocols (Schemes) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Protokol Transfer (Schemes)
            </label>
            <div className="flex items-center gap-2">
              {(['https', 'http', 'wss', 'ws'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleToggleScheme(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer border ${
                    schemes.includes(s)
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 border-transparent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tags / Categories Management */}
          <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Tag size={13} />
              <span>Daftar Kategori Tag (Swagger Tags)</span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span
                  key={t.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs border border-stone-200 dark:border-zinc-700"
                >
                  <strong>{t.name}</strong>
                  {t.description && <span className="text-[10px] text-stone-400">({t.description})</span>}
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(t.name)}
                    className="text-stone-400 hover:text-rose-600 cursor-pointer ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 items-center pt-1">
              <input
                type="text"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="Nama Tag (contoh: Users)"
                className="w-1/3 px-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500"
              />
              <input
                type="text"
                value={newTagDesc}
                onChange={e => setNewTagDesc(e.target.value)}
                placeholder="Deskripsi kategori..."
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                + Tambah Tag
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Save size={14} />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
