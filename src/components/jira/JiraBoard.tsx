import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Plus,
  MoreHorizontal,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  User,
  Filter,
} from 'lucide-react';
import { JiraIssue, IssueStatus } from './types';
import {
  getIssueTypeIcon,
  getPriorityIcon,
  getStatusName,
} from './jiraUtils';

export const JiraBoard: React.FC = () => {
  const {
    activeProject,
    activeSprint,
    filteredIssues,
    issues,
    members,
    moveIssueStatus,
    setSelectedIssue,
    setIsCreateModalOpen,
    completeSprint,
  } = useJira();

  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(null);
  const [swimlaneBy, setSwimlaneBy] = useState<'none' | 'epic' | 'assignee'>('none');
  const [isCompleteSprintModalOpen, setIsCompleteSprintModalOpen] = useState(false);

  const isDraggingRef = React.useRef(false);
  const dragSourceIdRef = React.useRef<string | null>(null);

  const columns = activeProject.columns || [
    { status: 'todo', name: 'To Do', color: '' },
    { status: 'in_progress', name: 'In Progress', limit: 4, color: '' },
    { status: 'in_review', name: 'Code Review', limit: 3, color: '' },
    { status: 'qa', name: 'QA', limit: 3, color: '' },
    { status: 'done', name: 'Done', color: '' },
  ];

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    isDraggingRef.current = true;
    dragSourceIdRef.current = issueId;
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIssueId(issueId);
  };

  const handleDragEnd = () => {
    setDraggedIssueId(null);
    setDragOverColumn(null);
    setTimeout(() => {
      isDraggingRef.current = false;
      dragSourceIdRef.current = null;
    }, 250);
  };

  const handleDragOver = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    e.stopPropagation();
    const issueId = e.dataTransfer.getData('text/plain') || dragSourceIdRef.current || draggedIssueId;
    if (issueId) {
      moveIssueStatus(issueId, targetStatus);
    }
    setDraggedIssueId(null);
    setDragOverColumn(null);
    dragSourceIdRef.current = null;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 250);
  };

  // Grouping / Swimlane definitions
  const epics = issues.filter((i) => i.projectId === activeProject.id && i.type === 'epic');

  const renderIssueCard = (issue: JiraIssue) => {
    const assignee = members.find((m) => m.id === issue.assigneeId);
    const epic = issue.epicId ? epics.find((e) => e.id === issue.epicId) : null;
    const completedSubtasks = (issue.subtasks || []).filter((s) => s.completed).length;
    const totalSubtasks = (issue.subtasks || []).length;
    const isBlocked = (issue.linkedIssues || []).some((l) => l.type === 'is_blocked_by');

    return (
      <div
        key={issue.id}
        draggable
        onDragStart={(e) => handleDragStart(e, issue.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(e, issue.status);
        }}
        onClick={() => {
          if (isDraggingRef.current || draggedIssueId) return;
          setSelectedIssue(issue);
        }}
        className={`group p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800/90 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-grab active:cursor-grabbing select-none space-y-2.5 ${
          draggedIssueId === issue.id ? 'opacity-40 scale-95 pointer-events-none' : ''
        }`}
      >
        {/* Top meta: Key, Epic badge, Priority */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-400 dark:text-zinc-500">
              {getIssueTypeIcon(issue.type, 14)}
            </span>
            <span className="text-[11px] font-mono font-bold text-stone-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {issue.key}
            </span>
            {epic && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 truncate max-w-[110px]">
                {epic.title}
              </span>
            )}
          </div>
          <div title={`Priority: ${issue.priority}`}>
            {getPriorityIcon(issue.priority, 14)}
          </div>
        </div>

        {/* Issue Title */}
        <h4 className="text-xs sm:text-sm font-medium text-stone-900 dark:text-zinc-100 leading-snug line-clamp-2">
          {issue.title}
        </h4>

        {/* Blocked alert */}
        {isBlocked && (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle size={10} />
            <span>Blocked</span>
          </div>
        )}

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {issue.labels.slice(0, 3).map((l) => (
              <span
                key={l}
                className="px-1.5 py-0.2 rounded text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400"
              >
                #{l}
              </span>
            ))}
          </div>
        )}

        {/* Bottom bar: Subtasks, Points, Assignee */}
        <div className="pt-2 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
            {totalSubtasks > 0 && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded ${
                  completedSubtasks === totalSubtasks
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-stone-100 dark:bg-zinc-800'
                }`}
              >
                <CheckCircle2 size={11} />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
            {issue.storyPoints !== undefined && (
              <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold font-mono text-stone-700 dark:text-zinc-300">
                {issue.storyPoints}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {assignee ? (
              <img
                src={assignee.avatar}
                alt={assignee.name}
                title={`Assignee: ${assignee.name}`}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-stone-200 dark:ring-zinc-700"
              />
            ) : (
              <div
                title="Unassigned"
                className="w-6 h-6 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400"
              >
                <User size={12} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 h-full flex flex-col overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              {activeSprint ? activeSprint.name : `${activeProject.name} Kanban Board`}
            </h2>
            {activeSprint && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Active Sprint
              </span>
            )}
          </div>
          {activeSprint?.goal && (
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              Goal: {activeSprint.goal}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Swimlane control */}
          <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5">
            <Layers size={14} className="text-stone-400" />
            <span className="text-stone-500 dark:text-zinc-400 hidden sm:inline">Swimlane:</span>
            <select
              value={swimlaneBy}
              onChange={(e) => setSwimlaneBy(e.target.value as any)}
              className="bg-transparent font-medium text-stone-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
            >
              <option value="none" className="dark:bg-zinc-900">None</option>
              <option value="epic" className="dark:bg-zinc-900">Group by Epic</option>
              <option value="assignee" className="dark:bg-zinc-900">Group by Assignee</option>
            </select>
          </div>

          {/* Complete sprint button if active sprint exists */}
          {activeSprint && (
            <button
              onClick={() => setIsCompleteSprintModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Complete Sprint
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true, activeSprint?.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex-1 overflow-x-auto pb-4">
        {swimlaneBy === 'none' ? (
          <div className="flex gap-4 min-w-[1100px] h-full items-start">
            {columns.map((col) => {
              const colIssues = filteredIssues.filter((i) => i.status === col.status);
              const totalColPoints = colIssues.reduce((s, i) => s + (i.storyPoints || 0), 0);
              const isOverWip = col.limit && colIssues.length > col.limit;

              return (
                <div
                  key={col.status}
                  onDragOver={(e) => handleDragOver(e, col.status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.status)}
                  className={`w-72 sm:w-80 shrink-0 rounded-2xl flex flex-col max-h-full transition-all ${
                    dragOverColumn === col.status
                      ? 'bg-blue-50/80 dark:bg-blue-950/20 ring-2 ring-blue-500'
                      : 'bg-stone-100/70 dark:bg-zinc-900/50 border border-stone-200/80 dark:border-zinc-800/80'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-stone-200/60 dark:border-zinc-800/60 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 font-mono">
                        {col.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isOverWip
                            ? 'bg-rose-500 text-white'
                            : 'bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                        }`}
                        title={col.limit ? `WIP Limit: ${col.limit}` : undefined}
                      >
                        {colIssues.length}
                        {col.limit ? `/${col.limit}` : ''}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono font-semibold text-stone-400 dark:text-zinc-500">
                      {totalColPoints} pts
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 min-h-[140px]">
                    {colIssues.map((issue) => renderIssueCard(issue))}

                    {colIssues.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-stone-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-xs text-stone-400 dark:text-zinc-500 select-none">
                        Drop issues here
                      </div>
                    )}
                  </div>

                  {/* Quick Add Issue in Column */}
                  <div className="p-2 border-t border-stone-200/50 dark:border-zinc-800/50 shrink-0">
                    <button
                      onClick={() => setIsCreateModalOpen(true, activeSprint?.id)}
                      className="w-full py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800/60 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Issue</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Swimlane grouped view */
          <div className="space-y-6 min-w-[1100px]">
            {(swimlaneBy === 'epic' ? epics : members).map((groupItem: any) => {
              const groupTitle = groupItem.title || groupItem.name;
              const groupIssues = filteredIssues.filter((i) =>
                swimlaneBy === 'epic' ? i.epicId === groupItem.id : i.assigneeId === groupItem.id
              );

              return (
                <div
                  key={groupItem.id}
                  className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 p-3"
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 dark:border-zinc-800">
                    <span className="font-bold text-sm text-stone-900 dark:text-zinc-100">
                      {groupTitle}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      ({groupIssues.length} issues)
                    </span>
                  </div>

                  <div className="flex gap-4 items-start">
                    {columns.map((col) => {
                      const colIssues = groupIssues.filter((i) => i.status === col.status);
                      return (
                        <div
                          key={col.status}
                          onDragOver={(e) => handleDragOver(e, col.status)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, col.status)}
                          className="w-72 sm:w-80 shrink-0 rounded-xl bg-stone-100/50 dark:bg-zinc-900/50 p-2 space-y-2 min-h-[90px]"
                        >
                          <div className="text-[10px] font-mono uppercase font-bold text-stone-400">
                            {col.name} ({colIssues.length})
                          </div>
                          {colIssues.map((issue) => renderIssueCard(issue))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Sprint Modal */}
      {isCompleteSprintModalOpen && activeSprint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              Complete {activeSprint.name}?
            </h3>
            <p className="text-xs text-stone-600 dark:text-zinc-400">
              This sprint contains{' '}
              <strong className="text-emerald-600">
                {filteredIssues.filter((i) => i.status === 'done').length} completed issues
              </strong>{' '}
              and{' '}
              <strong className="text-amber-600">
                {filteredIssues.filter((i) => i.status !== 'done').length} open issues
              </strong>.
            </p>

            <div className="p-3 bg-stone-50 dark:bg-zinc-800/60 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-stone-700 dark:text-zinc-300">
                What should happen to open issues?
              </div>
              <div className="text-stone-500 dark:text-zinc-400">
                Open issues will be moved automatically to the Backlog or next upcoming sprint.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCompleteSprintModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  completeSprint(activeSprint.id);
                  setIsCompleteSprintModalOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
