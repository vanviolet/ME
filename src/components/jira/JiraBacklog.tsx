import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  MoveRight,
  ArrowRight,
  User,
} from 'lucide-react';
import { JiraIssue, JiraSprint } from './types';
import {
  getIssueTypeIcon,
  getPriorityIcon,
  getStatusBadgeClass,
  getStatusName,
} from './jiraUtils';

export const JiraBacklog: React.FC = () => {
  const {
    activeProject,
    sprints,
    issues,
    members,
    createSprint,
    startSprint,
    completeSprint,
    moveIssueSprint,
    createIssue,
    setSelectedIssue,
    setIsCreateModalOpen,
  } = useJira();

  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverSprintId, setDragOverSprintId] = useState<string | 'backlog' | null>(null);

  // New Sprint Modal State
  const [isNewSprintModalOpen, setIsNewSprintModalOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [newSprintStart, setNewSprintStart] = useState('');
  const [newSprintEnd, setNewSprintEnd] = useState('');

  // Inline quick create in backlog
  const [quickTitle, setQuickTitle] = useState('');
  const [quickType, setQuickType] = useState<'story' | 'task' | 'bug'>('story');

  const projectSprints = sprints.filter((s) => s.projectId === activeProject.id);
  const activeSprint = projectSprints.find((s) => s.status === 'active');
  const futureSprints = projectSprints.filter((s) => s.status === 'future');
  const backlogIssues = issues.filter(
    (i) => i.projectId === activeProject.id && (!i.sprintId || i.sprintId === '')
  );

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('text/plain', issueId);
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e: React.DragEvent, sprintTarget: string | 'backlog') => {
    e.preventDefault();
    if (dragOverSprintId !== sprintTarget) {
      setDragOverSprintId(sprintTarget);
    }
  };

  const handleDrop = (e: React.DragEvent, sprintTarget: string | 'backlog') => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      moveIssueSprint(issueId, sprintTarget === 'backlog' ? null : sprintTarget);
    }
    setDraggedIssueId(null);
    setDragOverSprintId(null);
  };

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    await createIssue({
      title: quickTitle.trim(),
      type: quickType,
      sprintId: undefined, // in backlog
      storyPoints: 3,
    });
    setQuickTitle('');
  };

  const handleCreateSprintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    await createSprint(
      newSprintName.trim(),
      newSprintGoal.trim(),
      newSprintStart || new Date().toISOString(),
      newSprintEnd || new Date(Date.now() + 14 * 86400000).toISOString()
    );
    setIsNewSprintModalOpen(false);
    setNewSprintName('');
    setNewSprintGoal('');
  };

  const renderIssueRow = (issue: JiraIssue) => {
    const assignee = members.find((m) => m.id === issue.assigneeId);

    return (
      <div
        key={issue.id}
        draggable
        onDragStart={(e) => handleDragStart(e, issue.id)}
        onClick={() => setSelectedIssue(issue)}
        className="group px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 hover:border-blue-400 dark:hover:border-blue-700 shadow-xs flex items-center justify-between gap-3 cursor-pointer select-none transition-all"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0">{getIssueTypeIcon(issue.type, 15)}</span>
          <span className="font-mono text-xs font-bold text-stone-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0">
            {issue.key}
          </span>
          <span className="text-xs sm:text-sm text-stone-900 dark:text-zinc-100 truncate font-medium">
            {issue.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${getStatusBadgeClass(
              issue.status
            )}`}
          >
            {getStatusName(issue.status)}
          </span>

          {/* Priority */}
          <div title={issue.priority}>{getPriorityIcon(issue.priority, 13)}</div>

          {/* Story Points */}
          <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold font-mono text-stone-700 dark:text-zinc-300">
            {issue.storyPoints ?? '-'}
          </span>

          {/* Assignee */}
          {assignee ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              title={assignee.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400">
              <User size={10} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSprintContainer = (sprint: JiraSprint) => {
    const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
    const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
    const doneCount = sprintIssues.filter((i) => i.status === 'done').length;

    return (
      <div
        key={sprint.id}
        onDragOver={(e) => handleDragOver(e, sprint.id)}
        onDragLeave={() => setDragOverSprintId(null)}
        onDrop={(e) => handleDrop(e, sprint.id)}
        className={`rounded-2xl border transition-all p-4 space-y-3 ${
          dragOverSprintId === sprint.id
            ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-500'
            : 'bg-stone-50/80 dark:bg-zinc-900/50 border-stone-200 dark:border-zinc-800'
        }`}
      >
        {/* Sprint Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100">
              {sprint.name}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                sprint.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
              }`}
            >
              {sprint.status}
            </span>
            <span className="text-xs text-stone-500 dark:text-zinc-400 font-mono">
              ({sprintIssues.length} issues • {totalPoints} story points)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {sprint.status === 'future' ? (
              <button
                onClick={() => startSprint(sprint.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Play size={12} fill="currentColor" />
                <span>Start Sprint</span>
              </button>
            ) : sprint.status === 'active' ? (
              <button
                onClick={() => completeSprint(sprint.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Complete Sprint</span>
              </button>
            ) : null}

            <button
              onClick={() => setIsCreateModalOpen(true, sprint.id)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800"
              title="Add Issue to this Sprint"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {sprint.goal && (
          <p className="text-xs text-stone-600 dark:text-zinc-400">
            <strong>Goal:</strong> {sprint.goal}
          </p>
        )}

        {/* Sprint Issues List */}
        <div className="space-y-2">
          {sprintIssues.map((issue) => renderIssueRow(issue))}
          {sprintIssues.length === 0 && (
            <div className="p-4 border border-dashed border-stone-300 dark:border-zinc-800 rounded-xl text-center text-xs text-stone-400 dark:text-zinc-500">
              Drag issues here to plan this sprint.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
            Backlog & Sprint Planning
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Prioritize issues, allocate story points, and organize iterations.
          </p>
        </div>

        <button
          onClick={() => {
            const nextNum = projectSprints.length + 1;
            setNewSprintName(`${activeProject.key} Sprint ${nextNum}`);
            setIsNewSprintModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={15} />
          <span>Create Sprint</span>
        </button>
      </div>

      {/* Sprints Section */}
      <div className="space-y-4">
        {activeSprint && renderSprintContainer(activeSprint)}
        {futureSprints.map((s) => renderSprintContainer(s))}
      </div>

      {/* Backlog Section */}
      <div
        onDragOver={(e) => handleDragOver(e, 'backlog')}
        onDragLeave={() => setDragOverSprintId(null)}
        onDrop={(e) => handleDrop(e, 'backlog')}
        className={`rounded-2xl border transition-all p-4 space-y-3 ${
          dragOverSprintId === 'backlog'
            ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-500'
            : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Backlog</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
              {backlogIssues.length} issues
            </span>
          </div>

          <span className="text-xs font-mono text-stone-400">
            {backlogIssues.reduce((s, i) => s + (i.storyPoints || 0), 0)} pts total
          </span>
        </div>

        {/* Quick inline create */}
        <form onSubmit={handleQuickCreate} className="flex items-center gap-2">
          <select
            value={quickType}
            onChange={(e) => setQuickType(e.target.value as any)}
            className="text-xs px-2 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/80 text-stone-800 dark:text-zinc-200 focus:outline-hidden"
          >
            <option value="story">Story</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
          </select>
          <input
            type="text"
            placeholder="+ Create issue in backlog (Press Enter to save)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:border-blue-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Backlog items list */}
        <div className="space-y-2 pt-1">
          {backlogIssues.map((issue) => renderIssueRow(issue))}
          {backlogIssues.length === 0 && (
            <div className="p-6 text-center text-xs text-stone-400 dark:text-zinc-500 border border-dashed border-stone-200 dark:border-zinc-800 rounded-xl">
              Backlog is clear! All issues have been scheduled into active or upcoming sprints.
            </div>
          )}
        </div>
      </div>

      {/* Create Sprint Modal */}
      {isNewSprintModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSprintSubmit}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              Create New Sprint
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Sprint Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Sprint Goal
                </label>
                <textarea
                  rows={2}
                  value={newSprintGoal}
                  onChange={(e) => setNewSprintGoal(e.target.value)}
                  placeholder="What is the objective of this sprint?"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newSprintStart}
                    onChange={(e) => setNewSprintStart(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newSprintEnd}
                    onChange={(e) => setNewSprintEnd(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsNewSprintModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Create Sprint
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
