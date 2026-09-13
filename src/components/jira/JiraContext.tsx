import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  JiraWorkspace,
  JiraProject,
  JiraIssue,
  JiraSprint,
  JiraUser,
  JiraTab,
  JiraFilterState,
  IssueStatus,
  IssueComment,
  WorklogEntry,
  ProjectVersion,
  AutomationRule,
  JiraAuditLog,
} from './types';
import {
  JiraFullState,
  fetchJiraState,
  persistJiraState,
  resetJiraServerData,
  exportJiraToJson,
  exportIssuesToCsv,
} from './jiraApi';
import { useAuth } from '../../context/AuthContext';
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

interface JiraContextType {
  workspace: JiraWorkspace;
  projects: JiraProject[];
  activeProject: JiraProject;
  issues: JiraIssue[];
  filteredIssues: JiraIssue[];
  sprints: JiraSprint[];
  activeSprint: JiraSprint | undefined;
  members: JiraUser[];
  currentUser: JiraUser;
  currentTab: JiraTab;
  selectedIssue: JiraIssue | null;
  filter: JiraFilterState;
  quickFilter: 'all' | 'my' | 'recent' | 'bugs' | 'epics';
  comments: IssueComment[];
  worklogs: WorklogEntry[];
  versions: ProjectVersion[];
  automations: AutomationRule[];
  auditLogs: JiraAuditLog[];
  notifications: { id: string; title: string; time: string; read: boolean }[];
  isCreateModalOpen: boolean;
  isQuickSearchOpen: boolean;
  createIssueDefaultSprintId?: string;

  // Setters
  setCurrentTab: (tab: JiraTab) => void;
  setActiveProjectId: (projectId: string) => void;
  setSelectedIssue: (issue: JiraIssue | null) => void;
  setCurrentUser: (user: JiraUser) => void;
  setFilter: React.Dispatch<React.SetStateAction<JiraFilterState>>;
  setQuickFilter: (qf: 'all' | 'my' | 'recent' | 'bugs' | 'epics') => void;
  setIsCreateModalOpen: (open: boolean, defaultSprintId?: string) => void;
  setIsQuickSearchOpen: (open: boolean) => void;
  markNotificationsAsRead: () => void;

  // Issue CRUD & Actions
  createIssue: (data: Partial<JiraIssue>) => Promise<JiraIssue>;
  updateIssue: (issueId: string, updates: Partial<JiraIssue>) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  moveIssueSprint: (issueId: string, sprintId: string | null) => Promise<void>;
  toggleSubTask: (issueId: string, subtaskId: string) => Promise<void>;
  addSubTask: (issueId: string, title: string) => Promise<void>;

  // Sprint Actions
  createSprint: (name: string, goal: string, startDate: string, endDate: string) => Promise<JiraSprint>;
  startSprint: (sprintId: string) => Promise<void>;
  completeSprint: (sprintId: string, targetSprintId?: string) => Promise<void>;

  // Comment & Worklog
  addComment: (issueId: string, content: string) => Promise<void>;
  addWorklog: (issueId: string, minutes: number, description: string) => Promise<void>;

  // Versions & Releases
  createVersion: (name: string, description: string, releaseDate: string) => Promise<void>;
  releaseVersion: (versionId: string) => Promise<void>;

  // Automations & Team
  toggleAutomation: (ruleId: string) => Promise<void>;
  inviteMember: (name: string, email: string, role: JiraUser['role'], title: string) => Promise<void>;
  createProject: (data: Partial<JiraProject>) => Promise<JiraProject>;
  updateProject: (data: Partial<JiraProject>) => Promise<void>;

  // Data management
  resetToDemo: () => Promise<void>;
  exportStateJson: () => string;
  exportCsv: () => string;
  importStateJson: (jsonString: string) => Promise<boolean>;
}

const JiraContext = createContext<JiraContextType | undefined>(undefined);

export const JiraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspace] = useState<JiraWorkspace>(INITIAL_WORKSPACE);
  const [projects, setProjects] = useState<JiraProject[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-nex');
  const [issues, setIssues] = useState<JiraIssue[]>(INITIAL_ISSUES);
  const [sprints, setSprints] = useState<JiraSprint[]>(INITIAL_SPRINTS);
  const [comments, setComments] = useState<IssueComment[]>(INITIAL_COMMENTS);
  const [worklogs, setWorklogs] = useState<WorklogEntry[]>(INITIAL_WORKLOGS);
  const [versions, setVersions] = useState<ProjectVersion[]>(INITIAL_VERSIONS);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [auditLogs, setAuditLogs] = useState<JiraAuditLog[]>(INITIAL_AUDIT_LOGS);

  const [currentUser, setCurrentUser] = useState<JiraUser>(INITIAL_WORKSPACE.members[0]);
  const [currentTab, setCurrentTab] = useState<JiraTab>('board');
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpenState] = useState(false);
  const [createIssueDefaultSprintId, setCreateIssueDefaultSprintId] = useState<string | undefined>(undefined);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'NEX-104 assigned to Code Review', time: '10m ago', read: false },
    { id: 'notif-2', title: 'Sprint 14 has 3 days remaining', time: '2h ago', read: false },
    { id: 'notif-3', title: 'Muchamad Irvan mentioned you on NEX-101', time: '1d ago', read: true },
  ]);

  const [quickFilter, setQuickFilter] = useState<'all' | 'my' | 'recent' | 'bugs' | 'epics'>('all');
  const [filter, setFilter] = useState<JiraFilterState>({
    searchQuery: '',
    type: 'all',
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
    sprintId: 'all',
    epicId: 'all',
    label: 'all',
  });

  const setIsCreateModalOpen = (open: boolean, defaultSprintId?: string) => {
    setCreateIssueDefaultSprintId(defaultSprintId);
    setIsCreateModalOpenState(open);
  };

  const auth = useAuth();
  const authUser = auth?.user;

  // Sync authenticated user into Jira member list & default currentUser
  useEffect(() => {
    if (authUser && authUser.email) {
      const existingMember = workspace.members?.find(
        (m) => m.email.toLowerCase() === authUser.email?.toLowerCase()
      );
      if (existingMember) {
        setCurrentUser(existingMember);
      } else {
        const newMember: JiraUser = {
          id: authUser.uid,
          name: authUser.displayName || authUser.email.split('@')[0],
          email: authUser.email,
          avatar:
            authUser.photoURL ||
            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
          role: authUser.isAdmin ? 'admin' : 'member',
          title: authUser.isAdmin ? 'Lead Architect / Workspace Admin' : 'Full-Stack Developer',
        };
        setWorkspace((prev) => ({
          ...prev,
          members: [...(prev.members || []), newMember],
        }));
        setCurrentUser(newMember);
      }
    }
  }, [authUser]);

  // Load state on mount
  useEffect(() => {
    fetchJiraState().then((state) => {
      if (state) {
        setWorkspace(state.workspace || INITIAL_WORKSPACE);
        setProjects(state.projects?.length ? state.projects : INITIAL_PROJECTS);
        setIssues(state.issues || INITIAL_ISSUES);
        setSprints(state.sprints || INITIAL_SPRINTS);
        setComments(state.comments || INITIAL_COMMENTS);
        setWorklogs(state.worklogs || INITIAL_WORKLOGS);
        setVersions(state.versions || INITIAL_VERSIONS);
        setAutomations(state.automations || INITIAL_AUTOMATIONS);
        setAuditLogs(state.auditLogs || INITIAL_AUDIT_LOGS);
      }
    });
  }, []);

  // Sync state to storage
  const syncStorage = (updates?: Partial<JiraFullState>) => {
    const currentState: JiraFullState = {
      workspace,
      projects,
      issues,
      sprints,
      comments,
      worklogs,
      versions,
      automations,
      auditLogs,
      ...updates,
    };
    persistJiraState(currentState);
  };

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];
  }, [projects, activeProjectId]);

  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.projectId === activeProject.id && s.status === 'active');
  }, [sprints, activeProject.id]);

  const members = useMemo(() => workspace.members || [], [workspace]);

  // Keep selectedIssue synced with issues array
  useEffect(() => {
    if (selectedIssue) {
      const fresh = issues.find((i) => i.id === selectedIssue.id);
      if (fresh && fresh !== selectedIssue) {
        setSelectedIssue(fresh);
      }
    }
  }, [issues, selectedIssue]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Must belong to active project
      if (issue.projectId !== activeProject.id) return false;

      // Quick filters
      if (quickFilter === 'my') {
        if (issue.assigneeId !== currentUser.id) return false;
      } else if (quickFilter === 'bugs') {
        if (issue.type !== 'bug') return false;
      } else if (quickFilter === 'epics') {
        if (issue.type !== 'epic') return false;
      }

      // Detailed filters
      if (filter.type !== 'all' && issue.type !== filter.type) return false;
      if (filter.status !== 'all' && issue.status !== filter.status) return false;
      if (filter.priority !== 'all' && issue.priority !== filter.priority) return false;
      if (filter.epicId !== 'all' && issue.epicId !== filter.epicId) return false;
      if (filter.label !== 'all' && !issue.labels.includes(filter.label)) return false;

      if (filter.assigneeId === 'unassigned') {
        if (issue.assigneeId) return false;
      } else if (filter.assigneeId === 'me') {
        if (issue.assigneeId !== currentUser.id) return false;
      } else if (filter.assigneeId !== 'all' && issue.assigneeId !== filter.assigneeId) {
        return false;
      }

      if (filter.sprintId === 'backlog') {
        if (issue.sprintId) return false;
      } else if (filter.sprintId !== 'all' && issue.sprintId !== filter.sprintId) {
        return false;
      }

      // Text search
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchKey = issue.key.toLowerCase().includes(q);
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchDesc = (issue.description || '').toLowerCase().includes(q);
        const matchLabel = issue.labels.some((l) => l.toLowerCase().includes(q));
        if (!matchKey && !matchTitle && !matchDesc && !matchLabel) return false;
      }

      return true;
    });
  }, [issues, activeProject.id, quickFilter, filter, currentUser.id]);

  const addAuditLog = (action: string, details: string, issueKey?: string) => {
    const newLog: JiraAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: activeProject.id,
      issueKey,
      actorName: currentUser.name,
      actorAvatar: currentUser.avatar,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...auditLogs.slice(0, 49)];
    setAuditLogs(updated);
    syncStorage({ auditLogs: updated });
  };

  const createIssue = async (data: Partial<JiraIssue>): Promise<JiraIssue> => {
    // Generate next key based on active project prefix
    const projIssues = issues.filter((i) => i.projectId === activeProject.id);
    const existingNumbers = projIssues.map((i) => {
      const parts = i.key.split('-');
      return parseInt(parts[1] || '0', 10);
    });
    const nextNum = (existingNumbers.length ? Math.max(...existingNumbers) : 100) + 1;
    const key = `${activeProject.key}-${nextNum}`;

    const newIssue: JiraIssue = {
      id: `issue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key,
      projectId: activeProject.id,
      title: data.title || 'Untitled Issue',
      description: data.description || '',
      type: data.type || 'task',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId,
      reporterId: currentUser.id,
      epicId: data.epicId,
      sprintId: data.sprintId || activeSprint?.id,
      storyPoints: data.storyPoints || 3,
      originalEstimateMinutes: (data.storyPoints || 3) * 60,
      remainingEstimateMinutes: (data.storyPoints || 3) * 60,
      timeSpentMinutes: 0,
      labels: data.labels || [],
      components: data.components || ['General'],
      dueDate: data.dueDate,
      startDate: data.startDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      linkedIssues: [],
      attachments: [],
      commentsCount: 0,
      order: projIssues.length + 1,
    };

    const updated = [newIssue, ...issues];
    setIssues(updated);
    syncStorage({ issues: updated });
    addAuditLog(`Created issue ${key}`, `"${newIssue.title}" as ${newIssue.type}`, key);

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Issue ${key} created by ${currentUser.name}`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return newIssue;
  };

  const updateIssue = async (issueId: string, updates: Partial<JiraIssue>) => {
    const updated = issues.map((i) => {
      if (i.id === issueId) {
        return {
          ...i,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return i;
    });
    setIssues(updated);
    syncStorage({ issues: updated });

    const target = issues.find((i) => i.id === issueId);
    if (target) {
      addAuditLog(`Updated issue ${target.key}`, 'Fields updated', target.key);
    }
  };

  const deleteIssue = async (issueId: string) => {
    const target = issues.find((i) => i.id === issueId);
    const updated = issues.filter((i) => i.id !== issueId);
    setIssues(updated);
    syncStorage({ issues: updated });
    if (selectedIssue?.id === issueId) setSelectedIssue(null);
    if (target) {
      addAuditLog(`Deleted issue ${target.key}`, `Removed "${target.title}"`, target.key);
    }
  };

  const moveIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    const oldStatus = target.status;
    const isDone = newStatus === 'done';

    const updated = issues.map((i) => {
      if (i.id === issueId) {
        return {
          ...i,
          status: newStatus,
          resolvedAt: isDone ? new Date().toISOString() : undefined,
          resolution: isDone ? 'Done' : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return i;
    });

    setIssues(updated);
    syncStorage({ issues: updated });
    addAuditLog(
      `Transitioned ${target.key}`,
      `Changed status from ${oldStatus} to ${newStatus}`,
      target.key
    );

    // Trigger automations: If status moved to Done, run rule 3
    setAutomations((prev) =>
      prev.map((rule) => {
        if (rule.trigger === 'status_changed' && isDone) {
          return {
            ...rule,
            executionCount: rule.executionCount + 1,
            lastExecutedAt: new Date().toISOString(),
          };
        }
        return rule;
      })
    );
  };

  const moveIssueSprint = async (issueId: string, sprintId: string | null) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    const updated = issues.map((i) => {
      if (i.id === issueId) {
        return {
          ...i,
          sprintId: sprintId || undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return i;
    });

    setIssues(updated);
    syncStorage({ issues: updated });
    addAuditLog(
      `Moved ${target.key}`,
      sprintId ? `Assigned to sprint` : `Moved to Backlog`,
      target.key
    );
  };

  const toggleSubTask = async (issueId: string, subtaskId: string) => {
    let allCompleted = false;
    const updated = issues.map((issue) => {
      if (issue.id === issueId) {
        const subtasks = issue.subtasks.map((st) => {
          if (st.id === subtaskId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });
        allCompleted = subtasks.length > 0 && subtasks.every((st) => st.completed);
        return {
          ...issue,
          subtasks,
          // Automation: if all subtasks complete, optionally suggest or move to In Review
          status: allCompleted && issue.status === 'in_progress' ? 'in_review' : issue.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    setIssues(updated);
    syncStorage({ issues: updated });
  };

  const addSubTask = async (issueId: string, title: string) => {
    const updated = issues.map((issue) => {
      if (issue.id === issueId) {
        const nextSubNum = (issue.subtasks.length || 0) + 1;
        const newSubTask = {
          id: `sub-${Date.now()}-${nextSubNum}`,
          key: `${issue.key}-${nextSubNum}`,
          title,
          completed: false,
          assigneeId: issue.assigneeId,
        };
        return {
          ...issue,
          subtasks: [...issue.subtasks, newSubTask],
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    setIssues(updated);
    syncStorage({ issues: updated });
  };

  const createSprint = async (
    name: string,
    goal: string,
    startDate: string,
    endDate: string
  ): Promise<JiraSprint> => {
    const newSprint: JiraSprint = {
      id: `sprint-${Date.now()}`,
      projectId: activeProject.id,
      name,
      goal,
      startDate,
      endDate,
      status: 'future',
      committedPoints: 0,
      completedPoints: 0,
      velocityPoints: 20,
    };
    const updated = [...sprints, newSprint];
    setSprints(updated);
    syncStorage({ sprints: updated });
    addAuditLog(`Created Sprint`, `Created "${name}"`);
    return newSprint;
  };

  const startSprint = async (sprintId: string) => {
    const sprintIssues = issues.filter((i) => i.sprintId === sprintId);
    const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

    const updatedSprints = sprints.map((s) => {
      if (s.id === sprintId) {
        return {
          ...s,
          status: 'active' as const,
          committedPoints: totalPoints,
        };
      }
      // If another sprint was active in the same project, keep or let user manage
      return s;
    });

    setSprints(updatedSprints);
    syncStorage({ sprints: updatedSprints });
    addAuditLog(`Started Sprint`, `Active with ${totalPoints} committed story points`);
  };

  const completeSprint = async (sprintId: string, targetSprintId?: string) => {
    const sprintIssues = issues.filter((i) => i.sprintId === sprintId);
    const completedPoints = sprintIssues
      .filter((i) => i.status === 'done')
      .reduce((sum, i) => sum + (i.storyPoints || 0), 0);

    // Incomplete issues move to target sprint or backlog
    const updatedIssues = issues.map((i) => {
      if (i.sprintId === sprintId && i.status !== 'done') {
        return {
          ...i,
          sprintId: targetSprintId || undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return i;
    });

    const updatedSprints = sprints.map((s) => {
      if (s.id === sprintId) {
        return {
          ...s,
          status: 'closed' as const,
          completedAt: new Date().toISOString(),
          completedPoints,
        };
      }
      return s;
    });

    setIssues(updatedIssues);
    setSprints(updatedSprints);
    syncStorage({ issues: updatedIssues, sprints: updatedSprints });
    addAuditLog(
      `Completed Sprint`,
      `Finished with ${completedPoints} points completed.`
    );
  };

  const addComment = async (issueId: string, content: string) => {
    const newComment: IssueComment = {
      id: `comm-${Date.now()}`,
      issueId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    // Increment commentsCount on issue
    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        return { ...i, commentsCount: (i.commentsCount || 0) + 1 };
      }
      return i;
    });
    setIssues(updatedIssues);
    syncStorage({ comments: updatedComments, issues: updatedIssues });
  };

  const addWorklog = async (issueId: string, minutes: number, description: string) => {
    const newEntry: WorklogEntry = {
      id: `wl-${Date.now()}`,
      issueId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      timeSpentMinutes: minutes,
      description,
      loggedAt: new Date().toISOString(),
    };

    const updatedWorklogs = [newEntry, ...worklogs];
    setWorklogs(updatedWorklogs);

    // Update issue timeSpent & remainingEstimate
    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        const spent = (i.timeSpentMinutes || 0) + minutes;
        const remaining = Math.max(0, (i.remainingEstimateMinutes ?? i.originalEstimateMinutes ?? 0) - minutes);
        return {
          ...i,
          timeSpentMinutes: spent,
          remainingEstimateMinutes: remaining,
        };
      }
      return i;
    });
    setIssues(updatedIssues);
    syncStorage({ worklogs: updatedWorklogs, issues: updatedIssues });
    addAuditLog(`Logged work`, `${Math.round(minutes / 60)}h spent: "${description}"`);
  };

  const createVersion = async (name: string, description: string, releaseDate: string) => {
    const newVer: ProjectVersion = {
      id: `ver-${Date.now()}`,
      projectId: activeProject.id,
      name,
      description,
      releaseDate,
      status: 'unreleased',
      featuresCount: 0,
      bugsFixedCount: 0,
    };
    const updated = [newVer, ...versions];
    setVersions(updated);
    syncStorage({ versions: updated });
  };

  const releaseVersion = async (versionId: string) => {
    const updated = versions.map((v) => {
      if (v.id === versionId) {
        return { ...v, status: 'released' as const };
      }
      return v;
    });
    setVersions(updated);
    syncStorage({ versions: updated });
    addAuditLog(`Released Version`, `Version marked as live release`);
  };

  const toggleAutomation = async (ruleId: string) => {
    const updated = automations.map((r) => {
      if (r.id === ruleId) {
        return { ...r, enabled: !r.enabled };
      }
      return r;
    });
    setAutomations(updated);
    syncStorage({ automations: updated });
  };

  const inviteMember = async (
    name: string,
    email: string,
    role: JiraUser['role'],
    title: string
  ) => {
    const newMember: JiraUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      role,
      title,
    };
    const updatedMembers = [...workspace.members, newMember];
    const updatedWorkspace = { ...workspace, members: updatedMembers };
    setWorkspace(updatedWorkspace);
    syncStorage({ workspace: updatedWorkspace });
    addAuditLog(`Added team member`, `${name} joined as ${role}`);
  };

  const createProject = async (data: Partial<JiraProject>): Promise<JiraProject> => {
    const key = (data.key || 'PRJ').toUpperCase().slice(0, 5);
    const newProject: JiraProject = {
      id: `proj-${Date.now()}`,
      key,
      name: data.name || 'New Project',
      description: data.description || '',
      leadId: currentUser.id,
      template: data.template || 'scrum',
      category: data.category || 'Software Development',
      avatar: data.avatar || '🚀',
      createdAt: new Date().toISOString(),
      customFields: [],
      columns: [
        { status: 'todo', name: 'To Do', color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300' },
        { status: 'in_progress', name: 'In Progress', limit: 4, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
        { status: 'in_review', name: 'Review', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
        { status: 'done', name: 'Done', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
      ],
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    setActiveProjectId(newProject.id);
    syncStorage({ projects: updated });
    addAuditLog(`Created project ${key}`, `Project "${newProject.name}" initialized`);
    return newProject;
  };

  const updateProject = async (data: Partial<JiraProject>) => {
    const updated = projects.map((p) => {
      if (p.id === activeProject.id) {
        return { ...p, ...data };
      }
      return p;
    });
    setProjects(updated);
    syncStorage({ projects: updated });
  };

  const resetToDemo = async () => {
    try {
      await resetJiraServerData();
    } catch {}
    setWorkspace(INITIAL_WORKSPACE);
    setProjects(INITIAL_PROJECTS);
    setIssues(INITIAL_ISSUES);
    setSprints(INITIAL_SPRINTS);
    setComments(INITIAL_COMMENTS);
    setWorklogs(INITIAL_WORKLOGS);
    setVersions(INITIAL_VERSIONS);
    setAutomations(INITIAL_AUTOMATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveProjectId('proj-nex');
    setCurrentUser(INITIAL_WORKSPACE.members[0]);

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
    persistJiraState(defaultState);
  };

  const exportStateJson = () => {
    return exportJiraToJson({
      workspace,
      projects,
      issues,
      sprints,
      comments,
      worklogs,
      versions,
      automations,
      auditLogs,
    });
  };

  const exportCsv = () => {
    return exportIssuesToCsv(issues.filter((i) => i.projectId === activeProject.id));
  };

  const importStateJson = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.projects && parsed.issues) {
        setWorkspace(parsed.workspace || INITIAL_WORKSPACE);
        setProjects(parsed.projects);
        setIssues(parsed.issues);
        setSprints(parsed.sprints || []);
        setComments(parsed.comments || []);
        setWorklogs(parsed.worklogs || []);
        setVersions(parsed.versions || []);
        setAutomations(parsed.automations || []);
        setAuditLogs(parsed.auditLogs || []);
        persistJiraState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <JiraContext.Provider
      value={{
        workspace,
        projects,
        activeProject,
        issues,
        filteredIssues,
        sprints,
        activeSprint,
        members,
        currentUser,
        currentTab,
        selectedIssue,
        filter,
        quickFilter,
        comments,
        worklogs,
        versions,
        automations,
        auditLogs,
        notifications,
        isCreateModalOpen,
        isQuickSearchOpen,
        createIssueDefaultSprintId,

        setCurrentTab,
        setActiveProjectId,
        setSelectedIssue,
        setCurrentUser,
        setFilter,
        setQuickFilter,
        setIsCreateModalOpen,
        setIsQuickSearchOpen,
        markNotificationsAsRead,

        createIssue,
        updateIssue,
        deleteIssue,
        moveIssueStatus,
        moveIssueSprint,
        toggleSubTask,
        addSubTask,

        createSprint,
        startSprint,
        completeSprint,

        addComment,
        addWorklog,

        createVersion,
        releaseVersion,

        toggleAutomation,
        inviteMember,
        createProject,
        updateProject,

        resetToDemo,
        exportStateJson,
        exportCsv,
        importStateJson,
      }}
    >
      {children}
    </JiraContext.Provider>
  );
};

export const useJira = () => {
  const context = useContext(JiraContext);
  if (!context) {
    throw new Error('useJira must be used within a JiraProvider');
  }
  return context;
};
