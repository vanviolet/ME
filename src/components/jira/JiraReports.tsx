import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  TrendingDown,
  BarChart3,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const JiraReports: React.FC = () => {
  const { activeProject, activeSprint, sprints, issues } = useJira();
  const [activeReport, setActiveReport] = useState<'burndown' | 'velocity' | 'cfd'>('burndown');

  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);
  const sprintIssues = issues.filter((i) => i.sprintId === activeSprint?.id);

  // Burndown chart 14-day mock coordinates for active sprint (Day 1 to 14)
  const committedPoints = activeSprint?.committedPoints || 26;
  const burndownData = [
    { day: 1, date: 'Sep 7', ideal: 26, actual: 26 },
    { day: 2, date: 'Sep 8', ideal: 24, actual: 26 },
    { day: 3, date: 'Sep 9', ideal: 22, actual: 26 },
    { day: 4, date: 'Sep 10', ideal: 20, actual: 23 },
    { day: 5, date: 'Sep 11', ideal: 18, actual: 23 },
    { day: 6, date: 'Sep 12', ideal: 16, actual: 18 },
    { day: 7, date: 'Sep 13', ideal: 14, actual: 15 }, // Today
    { day: 8, date: 'Sep 14', ideal: 12, actual: null },
    { day: 9, date: 'Sep 15', ideal: 10, actual: null },
    { day: 10, date: 'Sep 16', ideal: 8, actual: null },
    { day: 11, date: 'Sep 17', ideal: 6, actual: null },
    { day: 12, date: 'Sep 18', ideal: 4, actual: null },
    { day: 13, date: 'Sep 19', ideal: 2, actual: null },
    { day: 14, date: 'Sep 20', ideal: 0, actual: null },
  ];

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 240;
  const padding = 40;
  const chartW = svgWidth - padding * 2;
  const chartH = svgHeight - padding * 2;

  const maxPoints = 30;

  const getX = (idx: number) => padding + (idx / (burndownData.length - 1)) * chartW;
  const getY = (pts: number) => padding + chartH - (pts / maxPoints) * chartH;

  // Ideal line path
  const idealPath = burndownData.map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(d.ideal)}`).join(' ');

  // Actual line path up to today
  const actualPoints = burndownData.filter((d) => d.actual !== null);
  const actualPath = actualPoints.map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(d.actual!)}`).join(' ');

  // Velocity data across sprints
  const velocitySprints = [
    { name: 'Sprint 11', committed: 22, completed: 20 },
    { name: 'Sprint 12', committed: 24, completed: 22 },
    { name: 'Sprint 13', committed: 24, completed: 24 },
    { name: 'Sprint 14 (Active)', committed: 26, completed: 11 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Agile Reports & Analytics
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Enterprise Metrics
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Sprint velocity, burnup/burndown progression, and lead time metrics.
          </p>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveReport('burndown')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeReport === 'burndown'
                ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            Sprint Burndown
          </button>
          <button
            onClick={() => setActiveReport('velocity')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeReport === 'velocity'
                ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            Velocity Chart
          </button>
          <button
            onClick={() => setActiveReport('cfd')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeReport === 'cfd'
                ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            Cumulative Flow
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-stone-400">Remaining Points</span>
          <div className="text-2xl font-bold text-stone-900 dark:text-zinc-100 font-mono">
            15 <span className="text-xs font-normal text-stone-500">of 26 pts</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            On track with sprint timeline
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-stone-400">Average Velocity</span>
          <div className="text-2xl font-bold text-stone-900 dark:text-zinc-100 font-mono">
            23.2 <span className="text-xs font-normal text-stone-500">pts/sprint</span>
          </div>
          <span className="text-[10px] text-stone-400">Calculated over last 3 sprints</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-stone-400">Mean Lead Time</span>
          <div className="text-2xl font-bold text-stone-900 dark:text-zinc-100 font-mono">
            3.8 <span className="text-xs font-normal text-stone-500">days</span>
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            From creation to resolution
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-stone-400">Mean Cycle Time</span>
          <div className="text-2xl font-bold text-stone-900 dark:text-zinc-100 font-mono">
            1.9 <span className="text-xs font-normal text-stone-500">days</span>
          </div>
          <span className="text-[10px] text-stone-400">From In Progress to Done</span>
        </div>
      </div>

      {/* Main Chart Container */}
      {activeReport === 'burndown' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                Sprint 14 Burndown Chart
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Showing ideal progress trajectory vs actual remaining story points.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-stone-500">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-stone-400" /> Ideal Burndown
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                <span className="w-4 h-1 bg-blue-600 rounded-full" /> Actual Remaining
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full max-w-full h-auto text-xs"
            >
              {/* Horizontal Grid lines */}
              {[0, 10, 20, 30].map((pts) => {
                const y = getY(pts);
                return (
                  <g key={pts}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={svgWidth - padding}
                      y2={y}
                      stroke="currentColor"
                      className="text-stone-200 dark:text-zinc-800"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={padding - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-stone-400 font-mono text-[10px]"
                    >
                      {pts}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels */}
              {burndownData.map((d, idx) => {
                if (idx % 2 !== 0) return null;
                const x = getX(idx);
                return (
                  <text
                    key={d.day}
                    x={x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="fill-stone-400 font-mono text-[10px]"
                  >
                    {d.date}
                  </text>
                );
              })}

              {/* Ideal Burndown Line */}
              <path
                d={idealPath}
                fill="none"
                stroke="currentColor"
                className="text-stone-400 dark:text-zinc-600"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Actual Remaining Line */}
              <path
                d={actualPath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Points for actual data */}
              {actualPoints.map((d, idx) => {
                const x = getX(idx);
                const y = getY(d.actual!);
                return (
                  <circle
                    key={d.day}
                    cx={x}
                    cy={y}
                    r={idx === actualPoints.length - 1 ? 5 : 3.5}
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {activeReport === 'velocity' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
            Historical Sprint Velocity
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Compares story points committed at sprint planning vs completed at sprint end.
          </p>

          <div className="grid grid-cols-4 gap-4 pt-4">
            {velocitySprints.map((s) => (
              <div
                key={s.name}
                className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/70 dark:border-zinc-700/60 space-y-3 text-center"
              >
                <div className="text-xs font-bold text-stone-800 dark:text-zinc-200 truncate">
                  {s.name}
                </div>
                <div className="h-36 flex items-end justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-stone-400 mb-1">{s.committed}</span>
                    <div
                      style={{ height: `${(s.committed / 30) * 110}px` }}
                      className="w-6 rounded-t-md bg-stone-300 dark:bg-zinc-700"
                      title={`Committed: ${s.committed} pts`}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono font-bold text-blue-600 mb-1">{s.completed}</span>
                    <div
                      style={{ height: `${(s.completed / 30) * 110}px` }}
                      className="w-6 rounded-t-md bg-blue-600"
                      title={`Completed: ${s.completed} pts`}
                    />
                  </div>
                </div>
                <div className="text-[10px] font-mono text-stone-500 dark:text-zinc-400">
                  {Math.round((s.completed / s.committed) * 100)}% delivery rate
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === 'cfd' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
            Cumulative Flow Diagram (CFD)
          </h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Monitors queue stability and identifies bottlenecks across workflow stages.
          </p>
          <div className="p-8 text-center border-2 border-dashed border-stone-200 dark:border-zinc-800 rounded-xl space-y-2">
            <Layers size={28} className="mx-auto text-stone-400" />
            <div className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Flow Rate: 4.2 items/week • Stable Work-in-Progress
            </div>
            <div className="text-[11px] text-stone-500 dark:text-zinc-400 max-w-md mx-auto">
              WIP limits on 'In Progress' (4) and 'Code Review' (3) have reduced average cycle time by 28%.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
