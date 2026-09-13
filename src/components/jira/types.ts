export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'subtask';

export type IssuePriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export type IssueStatus = 'todo' | 'in_progress' | 'in_review' | 'qa' | 'done';

export type UserRole = 'admin' | 'lead' | 'member' | 'viewer';

export interface JiraUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  title: string;
}

export type IssueLinkType = 'blocks' | 'is_blocked_by' | 'relates_to' | 'duplicates';

export interface IssueLink {
  id?: string;
  type: IssueLinkType;
  targetIssueId?: string;
  targetIssueKey: string;
  targetTitle?: string;
  targetIssueTitle?: string;
  targetIssueStatus?: IssueStatus;
}

export interface IssueAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorklogEntry {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  timeSpentMinutes: number;
  description: string;
  loggedAt: string;
}

export interface SubTask {
  id: string;
  key: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  required?: boolean;
}

export interface JiraIssue {
  id: string;
  key: string; // e.g. "PRJ-101"
  projectId: string;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId?: string;
  reporterId: string;
  epicId?: string;
  sprintId?: string; // null or undefined means in Backlog
  storyPoints?: number;
  originalEstimateMinutes?: number;
  remainingEstimateMinutes?: number;
  timeSpentMinutes?: number;
  labels: string[];
  components: string[];
  dueDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  subtasks: SubTask[];
  linkedIssues: IssueLink[];
  attachments: IssueAttachment[];
  commentsCount: number;
  customFields?: Record<string, any>;
  versionId?: string;
  order: number;
}

export interface JiraSprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'future' | 'active' | 'closed';
  completedAt?: string;
  velocityPoints?: number;
  committedPoints?: number;
  completedPoints?: number;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  name: string; // e.g. "v1.2.0"
  description: string;
  releaseDate: string;
  status: 'unreleased' | 'released' | 'archived';
  featuresCount?: number;
  bugsFixedCount?: number;
}

export interface AutomationRule {
  id: string;
  projectId: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: 'status_changed' | 'subtask_completed' | 'priority_changed' | 'issue_created';
  condition: string;
  action: string;
  lastExecutedAt?: string;
  executionCount: number;
}

export interface JiraAuditLog {
  id: string;
  projectId: string;
  issueKey?: string;
  actorName: string;
  actorAvatar: string;
  action: string; // e.g. "Status changed from To Do to In Progress"
  details: string;
  timestamp: string;
}

export interface JiraProject {
  id: string;
  key: string; // e.g. "NEX"
  name: string;
  description: string;
  leadId: string;
  template: 'scrum' | 'kanban' | 'bug_tracking';
  category: string;
  avatar: string;
  createdAt: string;
  customFields: CustomFieldDefinition[];
  columns: {
    status: IssueStatus;
    name: string;
    limit?: number;
    color: string;
  }[];
}

export interface JiraWorkspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerEmail: string;
  createdAt: string;
  members: JiraUser[];
}

export interface JiraFilterState {
  searchQuery: string;
  type: IssueType | 'all';
  status: IssueStatus | 'all';
  priority: IssuePriority | 'all';
  assigneeId: string | 'all' | 'unassigned' | 'me';
  sprintId: string | 'all' | 'backlog';
  epicId: string | 'all';
  label: string | 'all';
}

export type JiraTab =
  | 'dashboard'
  | 'board'
  | 'backlog'
  | 'roadmap'
  | 'calendar'
  | 'reports'
  | 'releases'
  | 'automations'
  | 'team'
  | 'settings';
