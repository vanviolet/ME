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
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

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

/**
 * Real-time subscription to Firebase Firestore for Jira enterprise state.
 * Any updates from any client or tab will immediately synchronize the active board.
 */
export function subscribeJiraFirestore(onUpdate: (state: JiraFullState) => void): () => void {
  try {
    const docRef = doc(db, 'jira_state', 'current');
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const cloudData = snap.data() as { state: JiraFullState };
          if (cloudData && cloudData.state && cloudData.state.issues && cloudData.state.projects) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData.state));
            onUpdate(cloudData.state);
          }
        }
      },
      (err) => {
        console.warn('Firestore real-time subscription error:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore snapshot listener:', err);
    return () => {};
  }
}

export async function fetchJiraState(): Promise<JiraFullState> {
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

  // 1. Prioritize Firebase Firestore cloud database
  try {
    const docRef = doc(db, 'jira_state', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cloudData = snap.data() as { state: JiraFullState };
      if (cloudData && cloudData.state && cloudData.state.issues && cloudData.state.projects) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData.state));
        return cloudData.state;
      }
    } else {
      // Seed Firestore with initial state on first run
      await setDoc(docRef, { state: defaultState, updatedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
  } catch (err) {
    console.warn('Firebase Firestore read error, falling back:', err);
  }

  // 2. Try server endpoint (/api/jira/data)
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  } catch {}

  // Auto-seed to server and firestore in background
  persistJiraState(defaultState).catch(() => {});

  return defaultState;
}

export async function persistJiraState(state: JiraFullState): Promise<void> {
  // 1. Immediately persist to localStorage for instant UI response
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Error writing Jira local storage:', err);
  }

  // 2. Persist to Firebase Firestore immediately
  try {
    const docRef = doc(db, 'jira_state', 'current');
    setDoc(docRef, { state, updatedAt: new Date().toISOString() }, { merge: true }).catch((err) => {
      console.warn('Firestore setDoc error:', err);
    });
  } catch (err) {
    console.warn('Firestore write exception:', err);
  }

  // 3. Sync to server backend asynchronously
  try {
    fetch('/api/jira/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    }).catch(() => {});
  } catch {
    // Non-blocking background sync
  }
}

export async function resetJiraServerData(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
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
    const docRef = doc(db, 'jira_state', 'current');
    await setDoc(docRef, { state: defaultState, updatedAt: new Date().toISOString() });
  } catch {}
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

