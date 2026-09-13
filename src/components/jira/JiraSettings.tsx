import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Settings,
  Save,
  Download,
  Upload,
  FileText,
  RotateCcw,
  Plus,
  Trash2,
  Sliders,
  Database,
  Check,
} from 'lucide-react';
import { initialJiraState } from './initialData';

export const JiraSettings: React.FC = () => {
  const {
    activeProject,
    updateProject,
    exportStateJson,
    exportCsv,
    importStateJson,
    resetToDemo,
    members,
  } = useJira();

  const [name, setName] = useState(activeProject.name);
  const [description, setDescription] = useState(activeProject.description);
  const [leadId, setLeadId] = useState(activeProject.leadId);
  const [avatar, setAvatar] = useState(activeProject.avatar);
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Custom fields
  const [customFields, setCustomFields] = useState(activeProject.customFields || []);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'select'>('text');

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProject({
      name,
      description,
      leadId,
      avatar,
      customFields,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const newField = {
      id: `cf-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      required: false,
    };
    const updated = [...customFields, newField];
    setCustomFields(updated);
    updateProject({ customFields: updated });
    setNewFieldName('');
  };

  const handleDeleteField = (id: string) => {
    const updated = customFields.filter((f) => f.id !== id);
    setCustomFields(updated);
    updateProject({ customFields: updated });
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportStateJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jira-workspace-${activeProject.key}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csvStr = exportCsv();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jira-issues-${activeProject.key}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = await importStateJson(content);
        if (success) {
          setImportStatus('Import successful! Workspace restored.');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid JSON backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all Jira project data to fresh enterprise seed state? All issues and sprints will be reset to default.')) {
      await resetToDemo();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Project Settings & Custom Fields
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {activeProject.key}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Configure project details, workflow columns, and custom attributes.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold shadow-xs animate-fade-in">
            <Check size={14} />
            <span>Changes Saved</span>
          </div>
        )}
      </div>

      {/* General Settings Form */}
      <form
        onSubmit={handleSaveGeneral}
        className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4"
      >
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
          <Settings size={16} className="text-blue-500" />
          <span>General Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Project Key (Read-only)
            </label>
            <input
              type="text"
              disabled
              value={activeProject.key}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800/50 text-stone-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Project Lead
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Project Icon Emoji
            </label>
            <input
              type="text"
              maxLength={2}
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 text-lg"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Save size={14} />
            <span>Save Details</span>
          </button>
        </div>
      </form>

      {/* Custom Fields Management */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
          <Sliders size={16} className="text-purple-500" />
          <span>Custom Fields Schema</span>
        </h3>

        <div className="space-y-2">
          {customFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/50 text-xs border border-stone-100 dark:border-zinc-800"
            >
              <div>
                <span className="font-bold text-stone-900 dark:text-zinc-100">{field.name}</span>
                <span className="ml-2 font-mono text-[10px] text-stone-400 uppercase">
                  Type: {field.type}
                </span>
              </div>
              <button
                onClick={() => handleDeleteField(field.id)}
                className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors"
                title="Remove Field"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom field form */}
        <form onSubmit={handleAddCustomField} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Field Name (e.g. Customer Tier)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
          />
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as any)}
            className="text-xs px-2 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Dropdown</option>
          </select>
          <button
            type="submit"
            disabled={!newFieldName.trim()}
            className="px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold disabled:opacity-40"
          >
            Add Field
          </button>
        </form>
      </div>

      {/* Backup & Reset Database */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
          <Database size={16} className="text-emerald-500" />
          <span>Data Export & Storage Management</span>
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          All changes are synchronized across Server API, Firestore cloud database, and local browser cache in real-time. You can export a snapshot, export spreadsheet CSVs, or restore from a backup file.
        </p>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-900 flex items-center gap-2">
            <Check size={14} />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Export Workspace JSON</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <FileText size={14} />
            <span>Export Issues CSV</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer">
            <Upload size={14} />
            <span>Restore Backup JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors ml-auto"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
