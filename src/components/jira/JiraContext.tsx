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
  subscribeJiraFirestore,
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
  automationRules: AutomationRule[];
  setAutomationRules: React.Dispatch<React.SetStateAction<AutomationRule[]>>;
  auditLogs: JiraAuditLog[];
  notifications: { id: string; title: string; time: string; read: boolean }[];
  isCreateModalOpen: boolean;
  isCreateProjectModalOpen: boolean;
  isInviteModalOpen: boolean;
  isQuickSearchOpen: boolean;
  createIssueDefaultSprintId?: string;
  canManageRoles: boolean;
  isProjectCreator: boolean;
  isLoading: boolean;

  // Setters
  setCurrentTab: (tab: JiraTab) => void;
  setActiveProjectId: (projectId: string) => void;
  setSelectedIssue: (issue: JiraIssue | null) => void;
  setCurrentUser: (user: JiraUser) => void;
  setFilter: React.Dispatch<React.SetStateAction<JiraFilterState>>;
  setQuickFilter: (qf: 'all' | 'my' | 'recent' | 'bugs' | 'epics') => void;
  setIsCreateModalOpen: (open: boolean, defaultSprintId?: string) => void;
  setIsCreateProjectModalOpen: (open: boolean) => void;
  setIsInviteModalOpen: (open: boolean) => void;
  setIsQuickSearchOpen: (open: boolean) => void;
  markNotificationsAsRead: () => void;

  // Issue CRUD & Actions
  createIssue: (data: Partial<JiraIssue>) => Promise<JiraIssue>;
  updateIssue: (issueId: string, updates: Partial<JiraIssue>) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  reorderIssuesInColumn: (issueId: string, sourceIndex: number, destinationIndex: number, columnStatus: IssueStatus) => Promise<void>;
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

  // Automations & Team RBAC
  toggleAutomation: (ruleId: string) => Promise<void>;
  inviteMember: (name: string, email: string, role: JiraUser['role'], title?: string) => Promise<void>;
  updateMemberRole: (userId: string, newRole: JiraUser['role']) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  createProject: (data: Partial<JiraProject>) => Promise<JiraProject>;
  updateProject: (data: Partial<JiraProject>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;

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
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectedIssue = useMemo(() => {
    if (!selectedIssueId) return null;
    return issues.find((i) => i.id === selectedIssueId) || null;
  }, [issues, selectedIssueId]);

  const setSelectedIssue = (issue: JiraIssue | null) => {
    setSelectedIssueId(issue ? issue.id : null);
  };

  const [isCreateModalOpen, setIsCreateModalOpenState] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [createIssueDefaultSprintId, setCreateIssueDefaultSprintId] = useState<string | undefined>(undefined);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState<{ id: string; title: string; time: string; read: boolean }[]>([]);

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

  // Sync authenticated Google user directly into Jira member list & currentUser without clearing invited members
  useEffect(() => {
    if (authUser && authUser.email) {
      const googleMember: JiraUser = {
        id: authUser.uid,
        name: authUser.displayName || authUser.email.split('@')[0],
        email: authUser.email,
        avatar: authUser.photoURL || '',
        role: 'admin',
        title: authUser.isAdmin ? 'Lead Architect / Workspace Owner' : 'Lead Software Engineer',
      };

      setWorkspace((prev) => {
        const existingMembers = prev.members || [];
        const otherMembers = existingMembers.filter(
          (m) => m.id !== googleMember.id && m.email.toLowerCase() !== googleMember.email.toLowerCase()
        );
        return {
          ...prev,
          ownerEmail: prev.ownerEmail || authUser.email || '',
          members: [googleMember, ...otherMembers],
        };
      });
      setCurrentUser(googleMember);
    } else {
      const guestMember: JiraUser = {
        id: 'user-guest',
        name: 'Guest Developer',
        email: 'guest@cloudjira.io',
        avatar: '',
        role: 'admin',
        title: 'Guest Contributor',
      };
      setCurrentUser(guestMember);
    }
  }, [authUser]);

  // Load state on mount and attach real-time Firebase Firestore listener
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchJiraState()
      .then((state) => {
        if (!isMounted) return;
        if (state) {
          if (state.workspace) {
            setWorkspace((prev) => {
              const rawMembers = state.workspace.members || [];
              if (authUser && authUser.email) {
                const googleMember: JiraUser = {
                  id: authUser.uid,
                  name: authUser.displayName || authUser.email.split('@')[0],
                  email: authUser.email,
                  avatar: authUser.photoURL || '',
                  role: 'admin',
                  title: authUser.isAdmin ? 'Lead Architect / Workspace Owner' : 'Lead Software Engineer',
                };
                const filtered = rawMembers.filter(
                  (m) => m.id !== googleMember.id && m.email.toLowerCase() !== googleMember.email.toLowerCase()
                );
                return {
                  ...state.workspace,
                  ownerEmail: state.workspace.ownerEmail || authUser.email || '',
                  members: [googleMember, ...filtered],
                };
              }
              return state.workspace;
            });
          }
          setProjects(state.projects?.length ? state.projects : INITIAL_PROJECTS);
          setIssues(state.issues || INITIAL_ISSUES);
          setSprints(state.sprints || INITIAL_SPRINTS);
          setComments(state.comments || INITIAL_COMMENTS);
          setWorklogs(state.worklogs || INITIAL_WORKLOGS);
          setVersions(state.versions || INITIAL_VERSIONS);
          setAutomations(state.automations || INITIAL_AUTOMATIONS);
          setAuditLogs(state.auditLogs || INITIAL_AUDIT_LOGS);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching initial Jira state:', err);
        if (isMounted) setIsLoading(false);
      });

    const unsubscribe = subscribeJiraFirestore((cloudState) => {
      if (!isMounted) return;
      setIsLoading(false);
      if (cloudState && cloudState.issues) {
        setIssues(cloudState.issues);
        if (cloudState.sprints) setSprints(cloudState.sprints);
        if (cloudState.projects) setProjects(cloudState.projects);
        if (cloudState.workspace) {
          setWorkspace((prev) => {
            const rawMembers = cloudState.workspace.members || [];
            if (authUser && authUser.email) {
              const googleMember: JiraUser = {
                id: authUser.uid,
                name: authUser.displayName || authUser.email.split('@')[0],
                email: authUser.email,
                avatar: authUser.photoURL || '',
                role: 'admin',
                title: authUser.isAdmin ? 'Lead Architect / Workspace Owner' : 'Lead Software Engineer',
              };
              const filtered = rawMembers.filter(
                (m) => m.id !== googleMember.id && m.email.toLowerCase() !== googleMember.email.toLowerCase()
              );
              return {
                ...cloudState.workspace,
                ownerEmail: cloudState.workspace.ownerEmail || authUser.email || '',
                members: [googleMember, ...filtered],
              };
            }
            return cloudState.workspace;
          });
        }
        if (cloudState.comments) setComments(cloudState.comments);
        if (cloudState.worklogs) setWorklogs(cloudState.worklogs);
        if (cloudState.automations) setAutomations(cloudState.automations);
        if (cloudState.auditLogs) setAuditLogs(cloudState.auditLogs);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authUser]);

  // Sync state to cloud storage
  const syncStorage = async (updates?: Partial<JiraFullState>) => {
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
    try {
      await persistJiraState(currentState);
    } catch (err) {
      console.warn('Sync to Firebase Firestore failed:', err);
    }
  };

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];
  }, [projects, activeProjectId]);

  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.projectId === activeProject.id && s.status === 'active');
  }, [sprints, activeProject.id]);

  const members = useMemo(() => workspace.members || [], [workspace]);

  // Check if current user is the creator / lead of the project or workspace admin
  const isProjectCreator = useMemo(() => {
    if (!activeProject) return true;
    if (activeProject.leadId === currentUser.id || activeProject.leadId === currentUser.email) return true;
    if (workspace.ownerEmail && currentUser.email && workspace.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.role === 'admin') return true;
    return false;
  }, [activeProject, currentUser, workspace.ownerEmail]);

  const canManageRoles = isProjectCreator;

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
      if (filter.label !== 'all' && !(issue.labels || []).includes(filter.label)) return false;

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
        const matchKey = (issue.key || '').toLowerCase().includes(q);
        const matchTitle = (issue.title || '').toLowerCase().includes(q);
        const matchDesc = (issue.description || '').toLowerCase().includes(q);
        const matchLabel = (issue.labels || []).some((l) => l.toLowerCase().includes(q));
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
    await syncStorage({ issues: updated });
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
    await syncStorage({ issues: updated });

    const target = issues.find((i) => i.id === issueId);
    if (target) {
      addAuditLog(`Updated issue ${target.key}`, 'Fields updated', target.key);
    }
  };

  const deleteIssue = async (issueId: string) => {
    const target = issues.find((i) => i.id === issueId);
    const updated = issues.filter((i) => i.id !== issueId);
    setIssues(updated);
    await syncStorage({ issues: updated });
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
    await syncStorage({ issues: updated });
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

  const reorderIssuesInColumn = async (
    issueId: string,
    sourceIndex: number,
    destinationIndex: number,
    columnStatus: IssueStatus
  ) => {
    const colIssues = issues.filter(
      (i) => i.projectId === activeProject.id && i.status === columnStatus
    );
    if (!colIssues.length || sourceIndex === destinationIndex) return;

    const reorderedCol: JiraIssue[] = Array.from(colIssues);
    const [moved] = reorderedCol.splice(sourceIndex, 1);
    if (!moved) return;
    reorderedCol.splice(destinationIndex, 0, moved);

    const updatedColIssuesMap = new Map<string, number>(
      reorderedCol.map((item: JiraIssue, idx: number) => [item.id, idx + 1])
    );

    const updated = issues.map((issue) => {
      if (updatedColIssuesMap.has(issue.id)) {
        return {
          ...issue,
          order: updatedColIssuesMap.get(issue.id)!,
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    setIssues(updated);
    await syncStorage({ issues: updated });
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
    await syncStorage({ issues: updated });
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
    await syncStorage({ sprints: updated });
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
    await syncStorage({ sprints: updatedSprints });
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
    await syncStorage({ issues: updatedIssues, sprints: updatedSprints });
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
    title?: string
  ) => {
    if (!canManageRoles) {
      throw new Error('Only the Project Creator / Workspace Admin can invite members and configure roles.');
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    const existingIndex = workspace.members.findIndex((m) => m.email.toLowerCase() === cleanEmail);
    let updatedMembers: JiraUser[];

    if (existingIndex >= 0) {
      updatedMembers = workspace.members.map((m, idx) => {
        if (idx === existingIndex) {
          return { ...m, name: cleanName, role, title: title || m.title };
        }
        return m;
      });
    } else {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;
      const newMember: JiraUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        email: cleanEmail,
        avatar: avatarUrl,
        role,
        title: title || 'Team Contributor',
      };
      updatedMembers = [...workspace.members, newMember];
    }

    const updatedWorkspace = { ...workspace, members: updatedMembers };
    setWorkspace(updatedWorkspace);
    syncStorage({ workspace: updatedWorkspace });
    addAuditLog(`Invited Member`, `${cleanName} (${cleanEmail}) invited as ${role.toUpperCase()}`);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Invitation sent to ${cleanEmail} (${role})`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const updateMemberRole = async (userId: string, newRole: JiraUser['role']) => {
    if (!canManageRoles) {
      throw new Error('Only the Project Creator / Workspace Admin can change roles.');
    }
    const updatedMembers = workspace.members.map((m) => {
      if (m.id === userId || m.email === userId) {
        return { ...m, role: newRole };
      }
      return m;
    });
    const updatedWorkspace = { ...workspace, members: updatedMembers };
    setWorkspace(updatedWorkspace);
    syncStorage({ workspace: updatedWorkspace });
    const target = workspace.members.find((m) => m.id === userId || m.email === userId);
    addAuditLog(`Updated Role`, `Changed role for ${target?.name || userId} to ${newRole.toUpperCase()}`);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Role for ${target?.name || userId} updated to ${newRole}`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  };

  const removeMember = async (userId: string) => {
    if (!canManageRoles) {
      throw new Error('Only the Project Creator / Workspace Admin can remove members.');
    }
    const target = workspace.members.find((m) => m.id === userId || m.email === userId);
    const updatedMembers = workspace.members.filter((m) => m.id !== userId && m.email !== userId);
    const updatedWorkspace = { ...workspace, members: updatedMembers };
    setWorkspace(updatedWorkspace);
    syncStorage({ workspace: updatedWorkspace });
    addAuditLog(`Removed Member`, `Removed ${target?.name || userId} from workspace`);
  };

  const createProject = async (data: Partial<JiraProject>): Promise<JiraProject> => {
    const cleanName = data.name?.trim() || 'New Project';
    let generatedKey = data.key?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
    if (!generatedKey) {
      const words = cleanName.split(' ');
      generatedKey = words.map((w) => w[0]).join('').toUpperCase().slice(0, 5);
      if (generatedKey.length < 2) generatedKey = 'PRJ';
    }

    const template = data.template || 'scrum';
    let columns = [
      { status: 'todo' as IssueStatus, name: 'To Do', color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300' },
      { status: 'in_progress' as IssueStatus, name: 'In Progress', limit: 4, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
      { status: 'in_review' as IssueStatus, name: 'Code Review', limit: 3, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
      { status: 'qa' as IssueStatus, name: 'QA & Testing', limit: 3, color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
      { status: 'done' as IssueStatus, name: 'Done', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    ];

    if (template === 'kanban') {
      columns = [
        { status: 'todo' as IssueStatus, name: 'Backlog', color: 'bg-stone-500/10 text-stone-700 dark:text-stone-300' },
        { status: 'in_progress' as IssueStatus, name: 'In Progress', limit: 4, color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
        { status: 'done' as IssueStatus, name: 'Done', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
      ];
    } else if (template === 'bug_tracking') {
      columns = [
        { status: 'todo' as IssueStatus, name: 'Triage / Reported', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
        { status: 'in_progress' as IssueStatus, name: 'Investigating', limit: 4, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
        { status: 'in_review' as IssueStatus, name: 'Fix In Review', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
        { status: 'qa' as IssueStatus, name: 'Verified Fixed', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
        { status: 'done' as IssueStatus, name: 'Closed', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
      ];
    }

    const newProject: JiraProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      key: generatedKey,
      name: cleanName,
      description: data.description || '',
      leadId: currentUser.id, // Current creator is set as lead
      template,
      category: data.category || 'Software Development',
      avatar: data.avatar || '⚡',
      createdAt: new Date().toISOString(),
      customFields: [],
      columns,
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setActiveProjectId(newProject.id);
    syncStorage({ projects: updatedProjects });
    addAuditLog(`Created Project ${newProject.key}`, `Project "${newProject.name}" created by ${currentUser.name}`);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Project "${newProject.name}" (${newProject.key}) created`,
        time: 'Just now',
        read: false,
      },
      ...prev,
    ]);

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

  const deleteProject = async (projectId: string) => {
    if (projects.length <= 1) {
      throw new Error('Cannot delete the only remaining project in workspace.');
    }
    const target = projects.find((p) => p.id === projectId);
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    const updatedIssues = issues.filter((i) => i.projectId !== projectId);
    const updatedSprints = sprints.filter((s) => s.projectId !== projectId);

    setProjects(updatedProjects);
    setIssues(updatedIssues);
    setSprints(updatedSprints);
    if (activeProjectId === projectId) {
      setActiveProjectId(updatedProjects[0].id);
    }
    syncStorage({
      projects: updatedProjects,
      issues: updatedIssues,
      sprints: updatedSprints,
    });
    addAuditLog(`Deleted Project`, `Removed project ${target?.name || projectId}`);
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
        isCreateProjectModalOpen,
        isInviteModalOpen,
        isQuickSearchOpen,
        createIssueDefaultSprintId,
        canManageRoles,
        isProjectCreator,
        isLoading,

        setCurrentTab,
        setActiveProjectId,
        setSelectedIssue,
        setCurrentUser,
        setFilter,
        setQuickFilter,
        setIsCreateModalOpen,
        setIsCreateProjectModalOpen,
        setIsInviteModalOpen,
        setIsQuickSearchOpen,
        markNotificationsAsRead,

        createIssue,
        updateIssue,
        deleteIssue,
        moveIssueStatus,
        reorderIssuesInColumn,
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

        automationRules: automations,
        setAutomationRules: setAutomations,
        toggleAutomation,
        inviteMember,
        updateMemberRole,
        removeMember,
        createProject,
        updateProject,
        deleteProject,

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
