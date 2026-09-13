import React from 'react';
import { useJira } from './JiraContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  Users,
  Activity,
  Zap,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { getIssueTypeIcon, getPriorityIcon } from './jiraUtils';

export const JiraDashboard: React.FC = () => {
  const {
    activeProject,
    activeSprint,
    issues,
    members,
    auditLogs,
    setCurrentTab,
    setIsCreateModalOpen,
    setSelectedIssue,
  } = useJira();

  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);
  const totalIssues = projectIssues.length;
  const doneIssues = projectIssues.filter((i) => i.status === 'done');
  const inProgressIssues = projectIssues.filter((i) => i.status === 'in_progress');
  const inReviewIssues = projectIssues.filter((i) => i.status === 'in_review');
  const todoIssues = projectIssues.filter((i) => i.status === 'todo');
  const openBugs = projectIssues.filter((i) => i.type === 'bug' && i.status !== 'done');

  const totalPoints = projectIssues.reduce((s, i) => s + (i.storyPoints || 0), 0);
  const donePoints = doneIssues.reduce((s, i) => s + (i.storyPoints || 0), 0);
  const completionPercent = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Type counts
  const storiesCount = projectIssues.filter((i) => i.type === 'story').length;
  const tasksCount = projectIssues.filter((i) => i.type === 'task').length;
  const bugsCount = projectIssues.filter((i) => i.type === 'bug').length;
  const epicsCount = projectIssues.filter((i) => i.type === 'epic').length;

  // Priority counts
  const highestCount = projectIssues.filter((i) => i.priority === 'highest').length;
  const highCount = projectIssues.filter((i) => i.priority === 'high').length;
  const mediumCount = projectIssues.filter((i) => i.priority === 'medium').length;
  const lowCount = projectIssues.filter((i) => i.priority === 'low' || i.priority === 'lowest').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
            {activeProject.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                {activeProject.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300">
                {activeProject.key}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              {activeProject.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('board')}
            className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-semibold text-stone-800 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors"
          >
            Open Active Board
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            + Create Issue
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Sprint Completion</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-zinc-100">
            {completionPercent}%
          </div>
          <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
            {donePoints} of {totalPoints} story points
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Active Issues</span>
            <Layers size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-zinc-100">
            {totalIssues - doneIssues.length}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
            {totalIssues} total in project
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Open Bugs</span>
            <AlertCircle size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {openBugs.length}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
            {openBugs.filter((b) => b.priority === 'highest').length} critical severity
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-medium">Velocity Estimate</span>
            <Award size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-zinc-100">
            {activeSprint?.velocityPoints || 24} <span className="text-sm font-normal">pts/sprint</span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
            Based on completed sprints
          </div>
        </div>
      </div>

      {/* Charts & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity size={16} className="text-blue-500" />
            <span>Workflow Status Breakdown</span>
          </h3>

          <div className="w-full bg-stone-100 dark:bg-zinc-800 rounded-full h-3 flex overflow-hidden">
            <div
              style={{ width: `${(doneIssues.length / (totalIssues || 1)) * 100}%` }}
              className="bg-emerald-500"
              title={`Done: ${doneIssues.length}`}
            />
            <div
              style={{ width: `${(inReviewIssues.length / (totalIssues || 1)) * 100}%` }}
              className="bg-amber-500"
              title={`Review: ${inReviewIssues.length}`}
            />
            <div
              style={{ width: `${(inProgressIssues.length / (totalIssues || 1)) * 100}%` }}
              className="bg-blue-500"
              title={`In Progress: ${inProgressIssues.length}`}
            />
            <div
              style={{ width: `${(todoIssues.length / (totalIssues || 1)) * 100}%` }}
              className="bg-stone-400"
              title={`To Do: ${todoIssues.length}`}
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                {doneIssues.length} ({totalIssues ? Math.round((doneIssues.length / totalIssues) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Review
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                {inReviewIssues.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Progress
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                {inProgressIssues.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-stone-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-400" /> To Do / Backlog
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                {todoIssues.length}
              </span>
            </div>
          </div>
        </div>

        {/* Priority & Type Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <Zap size={16} className="text-purple-500" />
            <span>Issue Type & Priority</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300">
                {getIssueTypeIcon('story', 14)} Stories
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                {storiesCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300">
                {getIssueTypeIcon('task', 14)} Tasks
              </span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                {tasksCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300">
                {getIssueTypeIcon('bug', 14)} Bugs
              </span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {bugsCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-stone-700 dark:text-zinc-300">
                {getIssueTypeIcon('epic', 14)} Epics
              </span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {epicsCount}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Highest Priority:</span>
              <span className="font-mono font-bold text-rose-600">{highestCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">High Priority:</span>
              <span className="font-mono font-bold text-orange-500">{highCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Medium Priority:</span>
              <span className="font-mono font-bold text-amber-500">{mediumCount}</span>
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <Users size={16} className="text-emerald-500" />
            <span>Team Workload</span>
          </h3>

          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {members.map((member) => {
              const assigned = projectIssues.filter((i) => i.assigneeId === member.id);
              const points = assigned.reduce((s, i) => s + (i.storyPoints || 0), 0);
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-xs text-stone-900 dark:text-zinc-100 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono truncate">{member.title}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {assigned.length} issues
                    </span>
                    <div className="text-[10px] text-stone-400 font-mono">{points} pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Audit & Activity Feed */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
          <Clock size={16} className="text-stone-400" />
          <span>Recent Activity & Audit Trail</span>
        </h3>

        <div className="space-y-2">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-stone-50/60 dark:bg-zinc-800/40 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <img
                  src={log.actorAvatar}
                  alt={log.actorName}
                  className="w-6 h-6 rounded-full object-cover mt-0.5"
                />
                <div>
                  <span className="font-semibold text-stone-900 dark:text-zinc-100">
                    {log.actorName}
                  </span>{' '}
                  <span className="text-stone-600 dark:text-zinc-400">{log.action}</span>
                  {log.issueKey && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      {log.issueKey}
                    </span>
                  )}
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">{log.details}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-stone-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
