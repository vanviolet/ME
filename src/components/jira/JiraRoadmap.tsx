import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { JiraIssue } from './types';
import { getIssueTypeIcon, getStatusBadgeClass, getStatusName } from './jiraUtils';

export const JiraRoadmap: React.FC = () => {
  const { activeProject, issues, setSelectedIssue, setIsCreateModalOpen } = useJira();

  const [timeScale, setTimeScale] = useState<'months' | 'quarters'>('months');

  // Filter epics and major scheduled tasks
  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);
  const epics = projectIssues.filter((i) => i.type === 'epic');
  const stories = projectIssues.filter((i) => i.type !== 'epic');

  // Timeline reference frame: Sept 2026 to Dec 2026
  const months = [
    { label: 'Aug 2026', start: new Date('2026-08-01').getTime(), end: new Date('2026-08-31').getTime() },
    { label: 'Sep 2026', start: new Date('2026-09-01').getTime(), end: new Date('2026-09-30').getTime() },
    { label: 'Oct 2026', start: new Date('2026-10-01').getTime(), end: new Date('2026-10-31').getTime() },
    { label: 'Nov 2026', start: new Date('2026-11-01').getTime(), end: new Date('2026-11-30').getTime() },
    { label: 'Dec 2026', start: new Date('2026-12-01').getTime(), end: new Date('2026-12-31').getTime() },
  ];

  const timelineStart = months[0].start;
  const timelineEnd = months[months.length - 1].end;
  const totalTimelineDuration = timelineEnd - timelineStart;

  const calculateBarPosition = (startDateStr?: string, dueDateStr?: string) => {
    const start = startDateStr ? new Date(startDateStr).getTime() : timelineStart + 15 * 86400000;
    const end = dueDateStr ? new Date(dueDateStr).getTime() : start + 30 * 86400000;

    const clampedStart = Math.max(timelineStart, Math.min(start, timelineEnd));
    const clampedEnd = Math.max(clampedStart + 86400000 * 5, Math.min(end, timelineEnd));

    const leftPercent = ((clampedStart - timelineStart) / totalTimelineDuration) * 100;
    const widthPercent = Math.max(8, ((clampedEnd - clampedStart) / totalTimelineDuration) * 100);

    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Roadmap & Timeline (Gantt)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Epics & Milestones
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Visualize project trajectory, deliverables, and dependency schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setTimeScale('months')}
              className={`px-3 py-1 rounded-md transition-all ${
                timeScale === 'months'
                  ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              Months
            </button>
            <button
              onClick={() => setTimeScale('quarters')}
              className={`px-3 py-1 rounded-md transition-all ${
                timeScale === 'quarters'
                  ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              Quarters
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={14} />
            <span>Add Epic</span>
          </button>
        </div>
      </div>

      {/* Gantt Matrix */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header row with months */}
          <div className="flex border-b border-stone-200 dark:border-zinc-800 text-xs font-mono font-bold bg-stone-50/70 dark:bg-zinc-800/50">
            <div className="w-80 shrink-0 p-3 border-r border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300">
              Deliverable / Epic
            </div>
            <div className="flex-1 grid grid-cols-5 divide-x divide-stone-200 dark:divide-zinc-800">
              {months.map((m) => (
                <div key={m.label} className="p-3 text-center text-stone-600 dark:text-zinc-400">
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Epics rows */}
          <div className="divide-y divide-stone-100 dark:divide-zinc-800/60">
            {epics.map((epic) => {
              const childStories = stories.filter((s) => s.epicId === epic.id);
              const doneChildStories = childStories.filter((s) => s.status === 'done');
              const progressPct =
                childStories.length > 0
                  ? Math.round((doneChildStories.length / childStories.length) * 100)
                  : epic.status === 'done'
                  ? 100
                  : 40;

              const pos = calculateBarPosition(epic.startDate, epic.dueDate);

              return (
                <div key={epic.id} className="group hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  {/* Epic Main Row */}
                  <div className="flex items-center">
                    <div
                      onClick={() => setSelectedIssue(epic)}
                      className="w-80 shrink-0 p-3 border-r border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Zap size={15} className="text-purple-600 shrink-0" />
                        <span className="font-mono text-xs font-bold text-stone-500 shrink-0">
                          {epic.key}
                        </span>
                        <span className="text-xs font-semibold text-stone-900 dark:text-zinc-100 truncate">
                          {epic.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0">
                        {childStories.length} stories
                      </span>
                    </div>

                    {/* Timeline Gantt Bar Area */}
                    <div className="flex-1 relative h-12 p-2 flex items-center">
                      {/* Grid background lines */}
                      <div className="absolute inset-0 grid grid-cols-5 divide-x divide-stone-100 dark:divide-zinc-800/30 pointer-events-none" />

                      {/* Bar */}
                      <div
                        onClick={() => setSelectedIssue(epic)}
                        style={{ left: pos.left, width: pos.width }}
                        className="absolute h-7 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white flex items-center justify-between px-2.5 shadow-xs cursor-pointer transition-all hover:scale-[1.01] overflow-hidden"
                      >
                        <span className="text-[11px] font-medium truncate drop-shadow-xs">
                          {epic.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold shrink-0 ml-1.5">
                          {progressPct}%
                        </span>
                        {/* Progress fill bar */}
                        <div
                          style={{ width: `${progressPct}%` }}
                          className="absolute inset-0 bg-white/20 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nested child stories */}
                  {childStories.map((child) => {
                    const childPos = calculateBarPosition(child.startDate, child.dueDate);
                    return (
                      <div
                        key={child.id}
                        className="flex items-center bg-stone-50/30 dark:bg-zinc-950/20 text-xs"
                      >
                        <div
                          onClick={() => setSelectedIssue(child)}
                          className="w-80 shrink-0 pl-8 pr-3 py-2 border-r border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {getIssueTypeIcon(child.type, 13)}
                            <span className="font-mono text-[11px] text-stone-400">{child.key}</span>
                            <span className="truncate text-stone-700 dark:text-zinc-300">
                              {child.title}
                            </span>
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${getStatusBadgeClass(
                              child.status
                            )}`}
                          >
                            {getStatusName(child.status)}
                          </span>
                        </div>

                        <div className="flex-1 relative h-9 p-1 flex items-center">
                          <div className="absolute inset-0 grid grid-cols-5 divide-x divide-stone-100 dark:divide-zinc-800/30 pointer-events-none" />
                          <div
                            onClick={() => setSelectedIssue(child)}
                            style={{ left: childPos.left, width: childPos.width }}
                            className={`absolute h-5 rounded-md px-2 flex items-center justify-between text-[10px] font-medium shadow-xs cursor-pointer ${
                              child.status === 'done'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600/80 text-white'
                            }`}
                          >
                            <span className="truncate">{child.title}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
