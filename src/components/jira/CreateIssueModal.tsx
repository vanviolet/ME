import React, { useState } from 'react';
import { useJira } from './JiraContext';
import { X, Plus, Zap } from 'lucide-react';
import { IssueType, IssuePriority } from './types';
import { getIssueTypeIcon, parseJiraTimeToMinutes } from './jiraUtils';

export const CreateIssueModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createIssueModalSprintId,
    activeProject,
    sprints,
    issues,
    members,
    createIssue,
    currentUser,
  } = useJira();

  if (!isCreateModalOpen) return null;

  const [type, setType] = useState<IssueType>('story');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [sprintId, setSprintId] = useState(createIssueModalSprintId || '');
  const [epicId, setEpicId] = useState('');
  const [storyPoints, setStoryPoints] = useState<string>('3');
  const [originalEstimate, setOriginalEstimate] = useState('2h');
  const [labels, setLabels] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [createAnother, setCreateAnother] = useState(false);

  const epics = issues.filter((i) => i.projectId === activeProject.id && i.type === 'epic');
  const projectSprints = sprints.filter((s) => s.projectId === activeProject.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const labelArray = labels
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);

    await createIssue({
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      assigneeId: assigneeId || undefined,
      sprintId: sprintId || undefined,
      epicId: epicId || undefined,
      storyPoints: storyPoints ? parseInt(storyPoints, 10) : undefined,
      originalEstimateMinutes: parseJiraTimeToMinutes(originalEstimate),
      labels: labelArray,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    if (createAnother) {
      setTitle('');
      setDescription('');
    } else {
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/70 dark:bg-zinc-950/40">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100">
              Create Issue
            </h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Project:{' '}
              <strong className="text-stone-800 dark:text-zinc-200">
                {activeProject.name} ({activeProject.key})
              </strong>
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Issue Type */}
          <div>
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Issue Type *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['story', 'task', 'bug', 'epic'] as IssueType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-semibold capitalize transition-all ${
                    type === t
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100'
                  }`}
                >
                  {getIssueTypeIcon(t, 14)}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Summary / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth 2.0 PKCE Authorization Code Grant"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:border-blue-500 focus:outline-hidden text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide user story, acceptance criteria, or logs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Grid: Priority, Story Points, Estimate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              >
                <option value="highest">🔴 Highest</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
                <option value="lowest">⚪ Lowest</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Story Points
              </label>
              <input
                type="number"
                min={0}
                max={40}
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Original Estimate
              </label>
              <input
                type="text"
                placeholder="e.g. 2h, 1d"
                value={originalEstimate}
                onChange={(e) => setOriginalEstimate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          {/* Grid: Assignee, Sprint, Epic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Sprint
              </label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              >
                <option value="">Backlog</option>
                {projectSprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Parent Epic
              </label>
              <select
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              >
                <option value="">None</option>
                {epics.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.key} - {ep.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Labels & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Labels (comma separated)
              </label>
              <input
                type="text"
                placeholder="auth, security, backend"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none text-stone-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="rounded border-stone-300 dark:border-zinc-700 text-blue-600"
              />
              <span>Create another</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
