import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Layers,
  Check,
  Trash2,
  Copy,
  Download,
  FileCode2,
  Calendar,
  ExternalLink,
  Plus,
  Sparkles,
} from 'lucide-react';
import { WorkspaceProject } from './types';
import { generateSwaggerJson } from './swaggerGenerator';

interface WorkspaceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: WorkspaceProject[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (newWs: WorkspaceProject) => void;
  onDuplicateWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
}

export const WorkspaceListModal: React.FC<WorkspaceListModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDuplicateWorkspace,
  onDeleteWorkspace,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHost, setNewHost] = useState('');
  const [newBasePath, setNewBasePath] = useState('/');
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!newTitle.trim()) return;

    const newWs: WorkspaceProject = {
      id: 'ws_' + Date.now(),
      name: newTitle.trim(),
      description: newDesc.trim() || 'Workspace API baru',
      swaggerVersion: '2.0',
      info: {
        title: newTitle.trim(),
        version: '1.0.0',
        description: newDesc.trim() || 'API Documentation',
      },
      host: newHost.trim().replace(/^https?:\/\//i, '') || 'api.example.com',
      basePath: newBasePath.trim().startsWith('/') ? newBasePath.trim() : '/' + newBasePath.trim(),
      schemes: ['https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [],
      endpoints: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateWorkspace(newWs);
    setIsCreating(false);
    setNewTitle('');
    setNewHost('');
    setNewBasePath('/');
    setNewDesc('');
  };

  const handleDownloadSwagger = (ws: WorkspaceProject) => {
    const doc = generateSwaggerJson(ws);
    const jsonStr = JSON.stringify(doc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_swagger.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Daftar Workspace & Proyek API
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Kelola berbagai dokumentasi API Swagger 2.0 dan pengujian endpoint terpisah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus size={14} />
                <span>Buat Workspace Baru</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Create New Workspace Form Drawer */}
          {isCreating && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <FolderPlus size={15} />
                  <span>Buat Workspace API Baru</span>
                </span>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Tutup Form
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-zinc-300">
                    Nama Workspace / Judul API *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="misal: Payment Gateway API"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-medium text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-zinc-300">
                    Host Server (Swagger host)
                  </label>
                  <input
                    type="text"
                    value={newHost}
                    onChange={e => setNewHost(e.target.value)}
                    placeholder="misal: api.mypayment.com"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-zinc-300">
                    Base Path
                  </label>
                  <input
                    type="text"
                    value={newBasePath}
                    onChange={e => setNewBasePath(e.target.value)}
                    placeholder="/v1"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-mono text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-zinc-300">
                    Deskripsi Ringkas
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Dokumentasi dan pengujian transaksi..."
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 dark:text-zinc-400 hover:bg-stone-200/50 rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Simpan & Buat Workspace
                </button>
              </div>
            </div>
          )}

          {/* Workspaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map(ws => {
              const isActive = ws.id === activeWorkspaceId;

              return (
                <div
                  key={ws.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'border-rose-500 dark:border-rose-500/70 bg-rose-500/5 dark:bg-rose-500/10 shadow-sm'
                      : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                            {ws.name}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {ws.info?.description || ws.description || 'Tidak ada deskripsi.'}
                        </p>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 font-mono">
                        v{ws.info?.version || '1.0.0'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-stone-500">
                      <span>Host: <strong className="text-stone-700 dark:text-zinc-300">{ws.host || 'api.example.com'}</strong></span>
                      <span>•</span>
                      <span>Endpoints: <strong className="text-stone-700 dark:text-zinc-300">{ws.endpoints.length}</strong></span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadSwagger(ws)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                        title="Unduh swagger.json"
                      >
                        <Download size={14} />
                      </button>

                      <button
                        onClick={() => onDuplicateWorkspace(ws.id)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                        title="Duplikat Workspace"
                      >
                        <Copy size={14} />
                      </button>

                      {workspaces.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus workspace "${ws.name}"?`)) {
                              onDeleteWorkspace(ws.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Hapus Workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {isActive ? (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Check size={14} />
                        <span>Sedang Dibuka</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectWorkspace(ws.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Buka Workspace
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/80 flex items-center justify-between text-xs text-stone-500">
          <span>Total: {workspaces.length} Workspace API</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 font-semibold rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
