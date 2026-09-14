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

// Clean up any legacy localStorage key to remove ambiguity
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('jira_enterprise_clean_v3');
    localStorage.removeItem('jira_enterprise_clean_v2');
    localStorage.removeItem('jira_enterprise_state_v1');
  }
} catch {}

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

  // 1. Fetch from Firebase Firestore cloud database
  try {
    const docRef = doc(db, 'jira_state', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cloudData = snap.data() as { state: JiraFullState };
      if (cloudData && cloudData.state) {
        const sanitized = sanitizeCleanState(cloudData.state, defaultState);
        if (sanitized !== cloudData.state) {
          const safeData = cleanForFirestore(sanitized);
          setDoc(docRef, { state: safeData, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        }
        return sanitized;
      }
    } else {
      // Seed Firestore with clean initial state
      const safeData = cleanForFirestore(defaultState);
      await setDoc(docRef, { state: safeData, updatedAt: new Date().toISOString() });
      return defaultState;
    }
  } catch (err) {
    console.warn('Firebase Firestore read error:', err);
  }

  return defaultState;
}

export async function persistJiraState(state: JiraFullState): Promise<void> {
  // Persist directly to Firebase Firestore with deep sanitization for real-time cloud sync
  try {
    const docRef = doc(db, 'jira_state', 'current');
    const sanitized = cleanForFirestore(state);
    await setDoc(docRef, { state: sanitized, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore write exception:', err);
  }
}

export async function resetJiraServerData(): Promise<void> {
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
      throw new Error(err.error || `AI assist request failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.text || '';
  } catch (err: any) {
    console.warn('Jira AI assist notice:', err);
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

