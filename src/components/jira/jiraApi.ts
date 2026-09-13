import {
  JiraWorkspace,
  JiraProject,
  JiraIssue,
  JiraSprint,
  ProjectVersion,
  AutomationRule,
  JiraAuditLog,
  IssueComment,
  WorklogEntry,
} from './types';
import {
  INITIAL_WORKSPACE,
  INITIAL_PROJECTS,
  INITIAL_SPRINTS,
  INITIAL_ISSUES,
  INITIAL_COMMENTS,
  INITIAL_WORKLOGS,
  INITIAL_VERSIONS,
  INITIAL_AUTOMATIONS,
  INITIAL_AUDIT_LOGS,
} from './initialData';

export interface JiraFullState {
  workspace: JiraWorkspace;
  projects: JiraProject[];
  issues: JiraIssue[];
  sprints: JiraSprint[];
  comments: IssueComment[];
  worklogs: WorklogEntry[];
  versions: ProjectVersion[];
  automations: AutomationRule[];
  auditLogs: JiraAuditLog[];
}

const STORAGE_KEY = 'jira_enterprise_store_v1';

export async function fetchJiraState(): Promise<JiraFullState> {
  // Try server endpoint first
  try {
    const res = await fetch('/api/jira/data');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
        return data.state;
      }
    }
  } catch {
    // Network or offline fallback
  }

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.issues && parsed.projects) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading Jira local storage:', err);
  }

  // Fallback to default initial dataset
  const defaultState: JiraFullState = {
    workspace: INITIAL_WORKSPACE,
    projects: INITIAL_PROJECTS,
    issues: INITIAL_ISSUES,
    sprints: INITIAL_SPRINTS,
    comments: INITIAL_COMMENTS,
    worklogs: INITIAL_WORKLOGS,
    versions: INITIAL_VERSIONS,
    automations: INITIAL_AUTOMATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  } catch {}

  return defaultState;
}

export async function persistJiraState(state: JiraFullState): Promise<void> {
  // Always save to localStorage immediately (optimistic resilience)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Error writing Jira local storage:', err);
  }

  // Sync to server backend
  try {
    await fetch('/api/jira/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  } catch {
    // Non-blocking background sync
  }
}

export function exportJiraToJson(state: JiraFullState): string {
  return JSON.stringify(state, null, 2);
}

export function exportIssuesToCsv(issues: JiraIssue[]): string {
  const headers = ['Key', 'Type', 'Summary', 'Status', 'Priority', 'Assignee', 'StoryPoints', 'DueDate', 'Created'];
  const rows = issues.map((i) => [
    i.key,
    i.type,
    `"${(i.title || '').replace(/"/g, '""')}"`,
    i.status,
    i.priority,
    i.assigneeId || 'Unassigned',
    i.storyPoints || 0,
    i.dueDate || '',
    i.createdAt,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
