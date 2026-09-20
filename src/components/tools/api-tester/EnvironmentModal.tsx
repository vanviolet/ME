import React, { useState } from 'react';
import { Environment, EnvironmentVariable } from './types';
import {
  X,
  Plus,
  Trash2,
  Check,
  Globe,
  Sliders,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  environments: Environment[];
  activeEnvironmentId: string | null;
  onSaveEnvironments: (envs: Environment[], activeId: string | null) => void;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  onClose,
  environments,
  activeEnvironmentId,
  onSaveEnvironments,
}) => {
  const [localEnvs, setLocalEnvs] = useState<Environment[]>(() => {
    if (environments.length === 0) {
      return [
        {
          id: 'env_default',
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
    }
    return environments;
  });

  const [selectedEnvId, setSelectedEnvId] = useState<string>(() => {
    return activeEnvironmentId || (environments[0]?.id ?? 'env_default');
  });

  if (!isOpen) return null;

  const currentEnv = localEnvs.find(e => e.id === selectedEnvId) || localEnvs[0];

  const handleAddEnvironment = () => {
    const newId = 'env_' + Math.random().toString(36).substring(2, 9);
    const newEnv: Environment = {
      id: newId,
      name: `Environment #${localEnvs.length + 1}`,
      variables: [
        {
          id: 'var_' + Math.random().toString(36).substring(2, 9),
          key: 'baseUrl',
          value: 'https://api.example.com',
          enabled: true,
        },
      ],
    };
    setLocalEnvs([...localEnvs, newEnv]);
    setSelectedEnvId(newId);
  };

  const handleDeleteEnvironment = (id: string) => {
    if (localEnvs.length <= 1) return;
    const filtered = localEnvs.filter(e => e.id !== id);
    setLocalEnvs(filtered);
    if (selectedEnvId === id) {
      setSelectedEnvId(filtered[0].id);
    }
  };

  const handleUpdateEnvName = (name: string) => {
    setLocalEnvs(
      localEnvs.map(e => (e.id === selectedEnvId ? { ...e, name } : e))
    );
  };

  const handleAddVariable = () => {
    if (!currentEnv) return;
    const newVar: EnvironmentVariable = {
      id: 'var_' + Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
    };
    const updated = {
      ...currentEnv,
      variables: [...currentEnv.variables, newVar],
    };
    setLocalEnvs(localEnvs.map(e => (e.id === selectedEnvId ? updated : e)));
  };

  const handleUpdateVariable = (
    varId: string,
    field: 'key' | 'value' | 'enabled',
    val: any
  ) => {
    if (!currentEnv) return;
    const updatedVars = currentEnv.variables.map(v =>
      v.id === varId ? { ...v, [field]: val } : v
    );
    const updated = { ...currentEnv, variables: updatedVars };
    setLocalEnvs(localEnvs.map(e => (e.id === selectedEnvId ? updated : e)));
  };

  const handleDeleteVariable = (varId: string) => {
    if (!currentEnv) return;
    const updated = {
      ...currentEnv,
      variables: currentEnv.variables.filter(v => v.id !== varId),
    };
    setLocalEnvs(localEnvs.map(e => (e.id === selectedEnvId ? updated : e)));
  };

  const handleSaveAndClose = () => {
    onSaveEnvironments(localEnvs, selectedEnvId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 dark:bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Manajemen Environment & Variabel
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Gunakan variabel dalam URL, header, atau body dengan sintaks{' '}
                <code className="text-rose-600 dark:text-rose-400 font-mono font-semibold">
                  &#123;&#123;namaVariabel&#125;&#125;
                </code>
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

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Environments Sidebar */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/40 p-3 flex flex-col gap-1.5 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-stone-200 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                Environments
              </span>
              <button
                onClick={handleAddEnvironment}
                className="p-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-md flex items-center gap-1 font-semibold cursor-pointer"
                title="Tambah Environment Baru"
              >
                <Plus size={14} />
                <span>Baru</span>
              </button>
            </div>

            {localEnvs.map(env => {
              const isSelected = env.id === selectedEnvId;
              return (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`group px-3 py-2 rounded-xl text-xs font-medium cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs border border-stone-200 dark:border-zinc-700 font-semibold'
                      : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-200/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="truncate">{env.name}</span>
                  {localEnvs.length > 1 && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteEnvironment(env.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-opacity cursor-pointer"
                      title="Hapus Environment"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Variables Table */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {currentEnv && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                    Nama Environment
                  </label>
                  <input
                    type="text"
                    value={currentEnv.name}
                    onChange={e => handleUpdateEnvName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl outline-none focus:border-rose-500 font-semibold text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-zinc-300">
                      Daftar Variabel ({currentEnv.variables.length})
                    </span>
                    <button
                      onClick={handleAddVariable}
                      className="px-2.5 py-1 text-xs bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200 dark:border-zinc-700 rounded-lg flex items-center gap-1 font-medium cursor-pointer transition-colors"
                    >
                      <Plus size={13} />
                      <span>Tambah Variabel</span>
                    </button>
                  </div>

                  <div className="border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold">
                          <th className="py-2 px-3 w-10 text-center">Aktif</th>
                          <th className="py-2 px-3">Nama Variabel (Key)</th>
                          <th className="py-2 px-3">Nilai (Value)</th>
                          <th className="py-2 px-2 w-10 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                        {currentEnv.variables.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-6 text-center text-xs text-stone-400 dark:text-zinc-500"
                            >
                              Belum ada variabel. Klik "Tambah Variabel" di atas.
                            </td>
                          </tr>
                        ) : (
                          currentEnv.variables.map(v => (
                            <tr
                              key={v.id}
                              className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                            >
                              <td className="py-1.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={v.enabled}
                                  onChange={e =>
                                    handleUpdateVariable(v.id, 'enabled', e.target.checked)
                                  }
                                  className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={v.key}
                                  placeholder="contoh: baseUrl"
                                  onChange={e =>
                                    handleUpdateVariable(v.id, 'key', e.target.value)
                                  }
                                  className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg font-mono outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                                />
                              </td>
                              <td className="py-1.5 px-3">
                                <input
                                  type="text"
                                  value={v.value}
                                  placeholder="contoh: https://api.mysite.com"
                                  onChange={e =>
                                    handleUpdateVariable(v.id, 'value', e.target.value)
                                  }
                                  className="w-full px-2 py-1 text-xs bg-transparent border border-stone-200 dark:border-zinc-700 rounded-lg font-mono outline-none focus:border-rose-500 text-stone-900 dark:text-zinc-100"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <button
                                  onClick={() => handleDeleteVariable(v.id)}
                                  className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md cursor-pointer"
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

                  <div className="flex items-start gap-2 p-3 bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-800 rounded-xl text-xs text-stone-600 dark:text-zinc-400">
                    <AlertCircle size={15} className="shrink-0 text-stone-400 mt-0.5" />
                    <span>
                      Contoh penggunaan: Masukkan{' '}
                      <code className="px-1 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 font-mono text-rose-600 dark:text-rose-400">
                        &#123;&#123;baseUrl&#125;&#125;/posts
                      </code>{' '}
                      di kolom URL untuk otomatis menyisipkan alamat API.
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-end gap-2 bg-stone-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Check size={14} />
            <span>Simpan & Terapkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
