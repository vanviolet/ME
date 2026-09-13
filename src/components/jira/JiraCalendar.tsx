import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { JiraIssue } from './types';
import { getIssueTypeIcon, getPriorityIcon } from './jiraUtils';

export const JiraCalendar: React.FC = () => {
  const { activeProject, issues, setSelectedIssue, setIsCreateModalOpen } = useJira();

  // Current view: September 2026 (matching project timeline)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);

  const getIssuesForDay = (day: number) => {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return projectIssues.filter((i) => {
      if (!i.dueDate) return false;
      return i.dueDate.startsWith(dayStr);
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Project Schedule & Deadlines
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Calendar View
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Track due dates, release milestones, and scheduled deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-stone-900 dark:text-zinc-100 min-w-[120px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus size={14} />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-stone-200 dark:border-zinc-800 text-center text-xs font-mono font-bold text-stone-500 dark:text-zinc-400 bg-stone-50 dark:bg-zinc-800/40 py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-200 dark:divide-zinc-800">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[100px] p-2 bg-stone-50/40 dark:bg-zinc-950/20 text-stone-300 dark:text-zinc-700"
            />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dayIssues = getIssuesForDay(day);
            const isToday = day === 13 && currentMonth === 8 && currentYear === 2026;

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-stone-50/60 dark:hover:bg-zinc-800/30 ${
                  isToday ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center'
                        : 'text-stone-700 dark:text-zinc-300'
                    }`}
                  >
                    {day}
                  </span>
                  {dayIssues.length > 0 && (
                    <span className="text-[10px] font-mono text-stone-400">
                      {dayIssues.length} due
                    </span>
                  )}
                </div>

                {/* Day issues cards */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[90px]">
                  {dayIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 truncate cursor-pointer flex items-center justify-between gap-1 shadow-2xs"
                    >
                      <div className="flex items-center gap-1 truncate">
                        {getIssueTypeIcon(issue.type, 11)}
                        <span className="font-mono font-bold text-[10px] text-stone-500">
                          {issue.key}
                        </span>
                        <span className="truncate">{issue.title}</span>
                      </div>
                      {getPriorityIcon(issue.priority, 11)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
