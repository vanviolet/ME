import {
  JiraWorkspace,
  JiraProject,
  JiraUser,
  JiraIssue,
  JiraSprint,
  ProjectVersion,
  AutomationRule,
  JiraAuditLog,
  IssueComment,
  WorklogEntry,
} from './types';

export const INITIAL_USER: JiraUser = {
  id: 'user-default',
  name: 'Workspace Lead',
  email: 'lead@cloudjira.io',
  avatar: '',
  role: 'admin',
  title: 'Lead Architect & Staff Engineer',
};

export const INITIAL_MEMBERS: JiraUser[] = [INITIAL_USER];

export const INITIAL_WORKSPACE: JiraWorkspace = {
  id: 'ws-nexus-eng',
  name: 'Nexus Engineering Core',
  slug: 'nexus-eng',
  description: 'Enterprise Cloud Architecture & Distributed Systems Workspace',
  ownerEmail: '',
  createdAt: '2026-08-01T08:00:00Z',
  members: INITIAL_MEMBERS,
};

export const INITIAL_PROJECTS: JiraProject[] = [
  {
    id: 'proj-nex',
    key: 'NEX',
    name: 'Nexus Cloud Platform',
    description: 'High-throughput microservices platform, OAuth SSO, and low-latency event broker.',
    leadId: 'user-default',
    template: 'scrum',
    category: 'Software Development',
    avatar: '⚡',
    createdAt: '2026-08-05T09:00:00Z',
    customFields: [
      { id: 'cf-env', name: 'Environment', type: 'select', options: ['Development', 'Staging', 'Production'] },
      { id: 'cf-risk', name: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    ],
    columns: [
      { status: 'todo', name: 'To Do', color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300' },
      { status: 'in_progress', name: 'In Progress', limit: 4, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
      { status: 'in_review', name: 'Code Review', limit: 3, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      { status: 'qa', name: 'QA & Testing', limit: 3, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
      { status: 'done', name: 'Done', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    ],
  },
];

// Clean empty arrays - user requested no dummy data because firebase has no data yet
export const INITIAL_SPRINTS: JiraSprint[] = [];
export const INITIAL_VERSIONS: ProjectVersion[] = [];
export const INITIAL_ISSUES: JiraIssue[] = [];
export const INITIAL_COMMENTS: IssueComment[] = [];
export const INITIAL_WORKLOGS: WorklogEntry[] = [];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'rule-auto-close-subtasks',
    projectId: 'proj-nex',
    name: 'Auto-transition parent when all sub-tasks completed',
    description: 'Moves issue status to Code Review once all subtasks are checked off.',
    trigger: 'subtask_completed',
    condition: 'all_subtasks_done',
    action: 'transition_to_in_review',
    enabled: true,
    executionCount: 0,
  },
  {
    id: 'rule-assign-reporter',
    projectId: 'proj-nex',
    name: 'Auto-assign critical issues to Project Lead',
    description: 'Assigns highest priority issues automatically to lead engineer.',
    trigger: 'issue_created',
    condition: 'priority_highest',
    action: 'assign_lead',
    enabled: true,
    executionCount: 0,
  },
];

export const INITIAL_AUDIT_LOGS: JiraAuditLog[] = [];

export const initialJiraState = {
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
