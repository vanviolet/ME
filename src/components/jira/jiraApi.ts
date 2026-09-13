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
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
const FIRESTORE_DOC_PATH = 'jira_state/current';

export async function fetchJiraState(): Promise<JiraFullState> {
  // 1. Try server endpoint first (local persistence in server-data/jira.json)
  try {
    const res = await fetch('/api/jira/data');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.state && data.state.issues && data.state.projects) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
        return data.state;
      }
    }
  } catch {
    // Network or server offline fallback
  }

  // 2. Try Firestore cloud storage
  try {
    const docRef = doc(db, 'jira_state', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cloudData = snap.data() as { state: JiraFullState };
      if (cloudData && cloudData.state && cloudData.state.issues && cloudData.state.projects) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData.state));
        return cloudData.state;
      }
    }
  } catch {
    // Firestore offline fallback
  }

  // 3. Fallback to localStorage
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

  // 4. Fallback to default initial dataset
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

  // Auto-seed to server and firestore in background
  persistJiraState(defaultState).catch(() => {});

  return defaultState;
}

export async function persistJiraState(state: JiraFullState): Promise<void> {
  // 1. Always save to localStorage immediately (optimistic resilience)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Error writing Jira local storage:', err);
  }

  // 2. Sync to server backend asynchronously
  try {
    fetch('/api/jira/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    }).catch(() => {});
  } catch {
    // Non-blocking background sync
  }

  // 3. Sync to Firestore in background
  try {
    const docRef = doc(db, 'jira_state', 'current');
    setDoc(docRef, { state, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

export async function resetJiraServerData(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  try {
    await fetch('/api/jira/reset', { method: 'POST' });
  } catch {}
}

export async function callJiraAiAssist(
  action: 'generate_stories' | 'generate_subtasks' | 'sprint_retrospective',
  prompt: string,
  context?: string
): Promise<string> {
  try {
    const res = await fetch('/api/jira/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, prompt, context }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI assist request failed');
    }
    const data = await res.json();
    return data.text || '';
  } catch (err: any) {
    console.error('Jira AI assist error:', err);
    throw err;
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

