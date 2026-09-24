import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Layers,
  MoreHorizontal,
  MoveRight,
  ArrowRight,
  User,
  GripVertical,
} from 'lucide-react';
import { JiraIssue, JiraSprint } from './types';
import {
  getIssueTypeIcon,
  getPriorityIcon,
  getStatusBadgeClass,
  getStatusName,
} from './jiraUtils';
import { ShadcnSelect } from '../ui/select';

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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const targetSprintId = destination.droppableId === 'backlog' ? null : destination.droppableId;
    moveIssueSprint(draggableId, targetSprintId);
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

  const renderIssueRow = (issue: JiraIssue, index: number) => {
    const assignee = members.find((m) => m.id === issue.assigneeId);

    return (
      <Draggable draggableId={issue.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
            onClick={() => setSelectedIssue(issue)}
            className={`group px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border transition-all flex items-center justify-between gap-3 select-none cursor-grab active:cursor-grabbing ${
              snapshot.isDragging
                ? 'shadow-xl border-blue-500 ring-2 ring-blue-500/30 scale-[1.01] z-50 bg-white dark:bg-zinc-800'
                : 'border-stone-200/80 dark:border-zinc-800/80 hover:border-blue-400 dark:hover:border-blue-700 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <GripVertical
                size={13}
                className="text-stone-300 dark:text-zinc-600 group-hover:text-stone-500 shrink-0"
              />
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
                assignee.avatar ? (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    title={assignee.name}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    title={assignee.name}
                    className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center"
                  >
                    {(assignee.name || 'U')[0].toUpperCase()}
                  </div>
                )
              ) : (
                <div className="w-5 h-5 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400">
                  <User size={10} />
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const renderSprintContainer = (sprint: JiraSprint) => {
    const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
    const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

    return (
      <div
        key={sprint.id}
        className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-900/50 p-4 space-y-3"
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
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 cursor-pointer"
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

        {/* Droppable Sprint Issues List */}
        <Droppable droppableId={sprint.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-2 min-h-[50px] p-1.5 rounded-xl transition-colors ${
                snapshot.isDraggingOver
                  ? 'bg-blue-50/90 dark:bg-blue-950/40 ring-2 ring-blue-500/50'
                  : ''
              }`}
            >
              {sprintIssues.map((issue, index) => (
                <React.Fragment key={issue.id}>
                  {renderIssueRow(issue, index)}
                </React.Fragment>
              ))}
              {provided.placeholder}

              {sprintIssues.length === 0 && !snapshot.isDraggingOver && (
                <div className="p-4 border border-dashed border-stone-300 dark:border-zinc-800 rounded-xl text-center text-xs text-stone-400 dark:text-zinc-500">
                  Drag issues here to plan this sprint.
                </div>
              )}
            </div>
          )}
        </Droppable>
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
            Prioritize issues, allocate story points, and drag issues between sprints.
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

      {/* Drag Drop Context for Sprints & Backlog */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Sprints Section */}
        <div className="space-y-4">
          {activeSprint && renderSprintContainer(activeSprint)}
          {futureSprints.map((s) => renderSprintContainer(s))}
        </div>

        {/* Backlog Section */}
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
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
            <ShadcnSelect
              value={quickType}
              onChange={(val) => setQuickType(val as any)}
              size="sm"
              className="w-28 shrink-0"
              options={[
                { value: 'story', label: 'Story' },
                { value: 'task', label: 'Task' },
                { value: 'bug', label: 'Bug' },
              ]}
            />
            <input
              type="text"
              placeholder="+ Create issue in backlog (Press Enter to save)..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/80 text-stone-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Add
            </button>
          </form>

          {/* Droppable Backlog Container */}
          <Droppable droppableId="backlog">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 min-h-[70px] p-1.5 rounded-xl transition-colors ${
                  snapshot.isDraggingOver
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 ring-2 ring-blue-500/50'
                    : ''
                }`}
              >
                {backlogIssues.map((issue, index) => (
                  <React.Fragment key={issue.id}>
                    {renderIssueRow(issue, index)}
                  </React.Fragment>
                ))}
                {provided.placeholder}

                {backlogIssues.length === 0 && !snapshot.isDraggingOver && (
                  <div className="p-8 border border-dashed border-stone-200 dark:border-zinc-800 rounded-xl text-center text-xs text-stone-400 dark:text-zinc-500">
                    Your backlog is currently empty. Use the input above to quickly add issues.
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Create Sprint Modal */}
      {isNewSprintModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              Create New Sprint
            </h3>

            <form onSubmit={handleCreateSprintSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Sprint Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Sprint Goal
                </label>
                <textarea
                  rows={2}
                  value={newSprintGoal}
                  onChange={(e) => setNewSprintGoal(e.target.value)}
                  placeholder="e.g. Ship OAuth 2.0 PKCE authentication and rate limiter"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newSprintStart}
                    onChange={(e) => setNewSprintStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newSprintEnd}
                    onChange={(e) => setNewSprintEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewSprintModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
