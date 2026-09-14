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

const STORAGE_KEY = 'jira_enterprise_clean_v3';
const FIRESTORE_DOC_PATH = 'jira_state/current';

/**
 * Strips out `undefined` values and converts them safely to null/omitted fields
 * to guarantee Firestore setDoc and updateDoc never crash with "Unsupported field value: undefined".
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === undefined) return null as unknown as T;
  try {
    return JSON.parse(
      JSON.stringify(data, (_, value) => {
        if (value === undefined) return null;
        return value;
      })
    );
  } catch {
    return data;
  }
}

/**
 * Filter out old dummy users (like Sarah Jenkins, Alex, Maya, David) and old dummy issues.
 * Ensures the workspace starts completely clean without fake data.
 */
function sanitizeCleanState(rawState: JiraFullState, fallback: JiraFullState): JiraFullState {
  if (!rawState) return fallback;

  // Check if it contains old dummy seed data
  const hasDummyUsers = rawState.workspace?.members?.some((m) =>
    ['user-sarah', 'user-alex', 'user-maya', 'user-david'].includes(m.id) ||
    m.name === 'Sarah Jenkins'
  );
  const hasDummyIssues = rawState.issues?.some((i) =>
    i.id === 'issue-nex-1' || i.id === 'issue-nex-101' || i.id === 'issue-nex-2'
  );

  if (hasDummyUsers || hasDummyIssues) {
    return {
      ...fallback,
      projects: rawState.projects?.length ? rawState.projects : fallback.projects,
      issues: [],
      sprints: [],
      comments: [],
      worklogs: [],
      versions: [],
      auditLogs: [],
      workspace: {
        ...fallback.workspace,
        members: INITIAL_WORKSPACE.members,
      },
    };
  }

  return rawState;
}

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
          if (cloudData && cloudData.state) {
            const defaultFallback: JiraFullState = {
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
            const cleaned = sanitizeCleanState(cloudData.state, defaultFallback);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
            } catch {}
            onUpdate(cleaned);
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
      if (cloudData && cloudData.state) {
        const sanitized = sanitizeCleanState(cloudData.state, defaultState);
        // If sanitized removed dummy data, update firestore
        if (sanitized !== cloudData.state) {
          const safeData = cleanForFirestore(sanitized);
          setDoc(docRef, { state: safeData, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch {}
        return sanitized;
      }
    } else {
      // Seed Firestore with clean initial state
      const safeData = cleanForFirestore(defaultState);
      await setDoc(docRef, { state: safeData, updatedAt: new Date().toISOString() });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      } catch {}
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
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
        } catch {}
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

  // 2. Persist to Firebase Firestore with deep sanitization
  try {
    const docRef = doc(db, 'jira_state', 'current');
    const sanitized = cleanForFirestore(state);
    await setDoc(docRef, { state: sanitized, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore write exception:', err);
  }

  // 3. Sync to server backend asynchronously
  try {
    fetch('/api/jira/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: cleanForFirestore(state) }),
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
    await setDoc(docRef, { state: cleanForFirestore(defaultState), updatedAt: new Date().toISOString() });
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

