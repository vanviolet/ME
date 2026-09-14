import React, { useState } from 'react';
import { useJira } from './JiraContext';
import { X, FolderPlus, Layers, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { JiraProject } from './types';

const TEMPLATES: {
  id: 'scrum' | 'kanban' | 'bug_tracking';
  title: string;
  desc: string;
  badge: string;
}[] = [
  {
    id: 'scrum',
    title: 'Scrum',
    desc: 'Sprint iterations, story points estimation, burndown tracking & backlog grooming.',
    badge: 'Recommended',
  },
  {
    id: 'kanban',
    title: 'Kanban',
    desc: 'Continuous work delivery, WIP limits, cycle-time flow without fixed sprints.',
    badge: 'Agile Flow',
  },
  {
    id: 'bug_tracking',
    title: 'Bug Tracking & QA',
    desc: 'Triage, investigate bugs, verify fixes, and manage defect lifecycles.',
    badge: 'Defect Management',
  },
];

const EMOJI_AVATARS = ['⚡', '🚀', '🛡️', '📱', '🌐', '🎯', '💡', '🎨', '💎', '🛒', '🤖', '📊'];

export const CreateProjectModal: React.FC = () => {
  const { isCreateProjectModalOpen, setIsCreateProjectModalOpen, createProject, currentUser } = useJira();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState<'scrum' | 'kanban' | 'bug_tracking'>('scrum');
  const [category, setCategory] = useState('Software Engineering');
  const [avatar, setAvatar] = useState('🚀');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoKey, setAutoKey] = useState(true);

  if (!isCreateProjectModalOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoKey) {
      const generated = val
        .trim()
        .split(/[\s-_]+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 5);
      setKey(generated || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        key: key.trim().toUpperCase() || 'PRJ',
        description: description.trim(),
        template,
        category,
        avatar,
        leadId: currentUser.id,
      });

      // Reset form
      setName('');
      setKey('');
      setDescription('');
      setIsCreateProjectModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                Create New Project
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                Configure your new agile workspace, templates, and permissions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateProjectModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Creator notice */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/80 flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              You (<strong className="font-semibold">{currentUser.name}</strong>) will be designated as the <strong className="font-semibold">Project Lead & Creator</strong> with full role-management permissions.
            </span>
          </div>

          {/* Project Name & Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nexus Mobile Banking"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="NEX"
                value={key}
                onChange={(e) => {
                  setAutoKey(false);
                  setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                }}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
          </div>

          {/* Avatar Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              Project Icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EMOJI_AVATARS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatar(em)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                    avatar === em
                      ? 'bg-blue-600 text-white ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105'
                      : 'bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
              Project Template & Framework
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const isSelected = template === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplate(tmpl.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500'
                        : 'border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                          {tmpl.title}
                        </span>
                        {isSelected && <Check size={14} className="text-blue-600" />}
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-zinc-400 leading-relaxed">
                        {tmpl.desc}
                      </p>
                    </div>
                    <span className="mt-2 inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 w-fit">
                      {tmpl.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Operations & IT">Operations & IT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Project Lead
              </label>
              <div className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 text-stone-700 dark:text-zinc-300 font-medium flex items-center justify-between">
                <span>{currentUser.name}</span>
                <span className="text-[10px] font-mono text-stone-400">Creator</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide a brief summary of this project's purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus size={14} />
              <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
