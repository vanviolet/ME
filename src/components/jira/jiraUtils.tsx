import React from 'react';
import {
  Bookmark,
  CheckSquare,
  AlertCircle,
  Zap,
  GitCommit,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { IssueType, IssuePriority, IssueStatus } from './types';

export const getIssueTypeIcon = (type: IssueType, size = 16) => {
  switch (type) {
    case 'epic':
      return <Zap size={size} className="text-purple-600 dark:text-purple-400" />;
    case 'story':
      return <Bookmark size={size} className="text-emerald-600 dark:text-emerald-400 fill-emerald-600/20" />;
    case 'bug':
      return <AlertCircle size={size} className="text-rose-600 dark:text-rose-400" />;
    case 'subtask':
      return <GitCommit size={size} className="text-teal-600 dark:text-teal-400" />;
    case 'task':
    default:
      return <CheckSquare size={size} className="text-blue-600 dark:text-blue-400" />;
  }
};

export const getIssueTypeLabel = (type: IssueType): string => {
  switch (type) {
    case 'epic':
      return 'Epic';
    case 'story':
      return 'Story';
    case 'bug':
      return 'Bug';
    case 'subtask':
      return 'Sub-task';
    case 'task':
    default:
      return 'Task';
  }
};

export const getPriorityIcon = (priority: IssuePriority, size = 14) => {
  switch (priority) {
    case 'highest':
      return <ChevronsUp size={size} className="text-rose-600 dark:text-rose-400" />;
    case 'high':
      return <ArrowUp size={size} className="text-orange-500" />;
    case 'medium':
      return <Minus size={size} className="text-amber-500" />;
    case 'low':
      return <ArrowDown size={size} className="text-blue-500" />;
    case 'lowest':
      return <ChevronsDown size={size} className="text-stone-400" />;
    default:
      return <Minus size={size} className="text-stone-400" />;
  }
};

export const getStatusBadgeClass = (status: IssueStatus): string => {
  switch (status) {
    case 'todo':
      return 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 border-stone-200 dark:border-zinc-700';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'in_review':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'qa':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'done':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    default:
      return 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 border-stone-200 dark:border-zinc-700';
  }
};

export const getStatusName = (status: IssueStatus): string => {
  switch (status) {
    case 'todo':
      return 'To Do';
    case 'in_progress':
      return 'In Progress';
    case 'in_review':
      return 'In Review';
    case 'qa':
      return 'QA';
    case 'done':
      return 'Done';
    default:
      return status;
  }
};

export const formatMinutesToHours = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0h';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) return `${hours}h ${remainingMinutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${remainingMinutes}m`;
};

export const formatMinutesToJira = (minutes?: number): string => {
  if (!minutes || minutes <= 0) return '0h';
  const days = Math.floor(minutes / (8 * 60));
  const remainingAfterDays = minutes % (8 * 60);
  const hours = Math.floor(remainingAfterDays / 60);
  const remMinutes = remainingAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (remMinutes > 0) parts.push(`${remMinutes}m`);
  return parts.join(' ') || '0m';
};

export const parseJiraTimeToMinutes = (input: string): number => {
  if (!input) return 0;
  const str = input.toLowerCase().trim();
  let totalMinutes = 0;

  const dMatch = str.match(/(\d+(?:\.\d+)?)\s*d/);
  if (dMatch) totalMinutes += parseFloat(dMatch[1]) * 8 * 60;

  const hMatch = str.match(/(\d+(?:\.\d+)?)\s*h/);
  if (hMatch) totalMinutes += parseFloat(hMatch[1]) * 60;

  const mMatch = str.match(/(\d+(?:\.\d+)?)\s*m/);
  if (mMatch) totalMinutes += parseFloat(mMatch[1]);

  if (!dMatch && !hMatch && !mMatch) {
    const rawNum = parseFloat(str);
    if (!isNaN(rawNum)) totalMinutes += rawNum * 60;
  }

  return Math.round(totalMinutes);
};

