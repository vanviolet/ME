import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Tag,
  Plus,
  CheckCircle2,
  Calendar,
  FileText,
  Copy,
  Check,
  Rocket,
} from 'lucide-react';
import { ProjectVersion } from './types';

export const JiraReleases: React.FC = () => {
  const { activeProject, versions, issues, createVersion, releaseVersion } = useJira();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [verName, setVerName] = useState('');
  const [verDesc, setVerDesc] = useState('');
  const [verDate, setVerDate] = useState('');

  const [activeChangelogVersion, setActiveChangelogVersion] = useState<ProjectVersion | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const projectVersions = versions.filter((v) => v.projectId === activeProject.id);
  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verName.trim()) return;
    await createVersion(verName.trim(), verDesc.trim(), verDate || new Date().toISOString());
    setIsCreateOpen(false);
    setVerName('');
    setVerDesc('');
  };

  const generateChangelogMarkdown = (version: ProjectVersion) => {
    const versionIssues = projectIssues.filter((i) => i.versionId === version.id || i.status === 'done');
    const features = versionIssues.filter((i) => i.type === 'story' || i.type === 'epic');
    const fixes = versionIssues.filter((i) => i.type === 'bug');
    const tasks = versionIssues.filter((i) => i.type === 'task');

    return `# Changelog - ${version.name} (${version.releaseDate.slice(0, 10)})
${version.description}

### 🚀 New Features & Enhancements
${features.map((f) => `- **[${f.key}]** ${f.title}`).join('\n') || '- Minor enhancements and performance tuning'}

### 🐛 Bug Fixes & Stability
${fixes.map((b) => `- **[${b.key}]** ${b.title}`).join('\n') || '- Zero reported regressions'}

### 🛠️ Infrastructure & Maintenance
${tasks.map((t) => `- **[${t.key}]** ${t.title}`).join('\n') || '- Automated dependency upgrades'}
`;
  };

  const handleCopyChangelog = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Releases, Milestones & Changelog
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Versioning
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Organize software releases, track milestone progress, and generate changelogs.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <Plus size={14} />
          <span>New Version</span>
        </button>
      </div>

      {/* Versions List */}
      <div className="space-y-4">
        {projectVersions.map((version) => {
          const versionIssues = projectIssues.filter((i) => i.versionId === version.id);
          const doneIssues = versionIssues.filter((i) => i.status === 'done');
          const progress = versionIssues.length > 0 ? Math.round((doneIssues.length / versionIssues.length) * 100) : 100;

          return (
            <div
              key={version.id}
              className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Tag size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                        {version.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          version.status === 'released'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {version.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                      {version.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveChangelogVersion(version)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 text-xs font-semibold text-stone-700 dark:text-zinc-300"
                  >
                    <FileText size={13} />
                    <span>View Changelog</span>
                  </button>

                  {version.status === 'unreleased' && (
                    <button
                      onClick={() => releaseVersion(version.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <Rocket size={13} />
                      <span>Release Version</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 font-mono">
                  <span>
                    Release Date:{' '}
                    <strong className="text-stone-800 dark:text-zinc-200">
                      {new Date(version.releaseDate).toLocaleDateString()}
                    </strong>
                  </span>
                  <span>{progress}% completed ({doneIssues.length}/{versionIssues.length || doneIssues.length} issues)</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Changelog Modal */}
      {activeChangelogVersion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                Changelog for {activeChangelogVersion.name}
              </h3>
              <button
                onClick={() =>
                  handleCopyChangelog(generateChangelogMarkdown(activeChangelogVersion))
                }
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-xs font-semibold text-stone-700 dark:text-zinc-300"
              >
                {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{isCopied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 font-mono text-xs text-stone-800 dark:text-zinc-200 whitespace-pre-wrap max-h-80 overflow-y-auto border border-stone-200 dark:border-zinc-800">
              {generateChangelogMarkdown(activeChangelogVersion)}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveChangelogVersion(null)}
                className="px-4 py-1.5 rounded-lg bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Version Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              Create New Release Version
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Version Name (e.g. v2.5.0) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="v2.5.0"
                  value={verName}
                  onChange={(e) => setVerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Description / Theme
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of deliverables in this milestone"
                  value={verDesc}
                  onChange={(e) => setVerDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Target Release Date
                </label>
                <input
                  type="date"
                  value={verDate}
                  onChange={(e) => setVerDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Create Version
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
