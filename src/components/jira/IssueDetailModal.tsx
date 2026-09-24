import React, { useState, useEffect } from 'react';
import { useJira } from './JiraContext';
import {
  X,
  Share2,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  History,
  Link as LinkIcon,
  Tag,
  AlertTriangle,
  Send,
  Eye,
  Calendar,
  Layers,
  ChevronDown,
  User,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  JiraIssue,
  IssueStatus,
  IssuePriority,
  IssueType,
  IssueLinkType,
} from './types';
import {
  getIssueTypeIcon,
  getPriorityIcon,
  getStatusBadgeClass,
  getStatusName,
  formatMinutesToJira,
  parseJiraTimeToMinutes,
} from './jiraUtils';
import { callJiraAiAssist } from './jiraApi';
import { ShadcnSelect } from '../ui/select';
import { ShadcnCombobox } from '../ui/combobox';

export const IssueDetailModal: React.FC = () => {
  const {
    selectedIssue,
    setSelectedIssue,
    updateIssue,
    deleteIssue,
    addComment,
    addWorklog,
    members,
    sprints,
    issues,
    activeProject,
    currentUser,
    comments,
    worklogs,
  } = useJira();

  const [activeTab, setActiveTab] = useState<'comments' | 'worklog' | 'history'>('comments');
  const [commentText, setCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Worklog form state
  const [isLoggingWork, setIsLoggingWork] = useState(false);
  const [timeSpentInput, setTimeSpentInput] = useState('1h 30m');
  const [worklogDesc, setWorklogDesc] = useState('');

  // Linking issues state
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [linkType, setLinkType] = useState<IssueLinkType>('relates_to');
  const [targetIssueId, setTargetIssueId] = useState('');

  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  // Reset transient modal state when issue selection changes
  useEffect(() => {
    setCommentText('');
    setNewSubtaskTitle('');
    setIsLoggingWork(false);
    setIsLinkingOpen(false);
    setActiveTab('comments');
  }, [selectedIssue?.id]);

  const assignee = selectedIssue ? members.find((m) => m.id === selectedIssue.assigneeId) : null;
  const reporter = selectedIssue ? members.find((m) => m.id === selectedIssue.reporterId) : null;
  const epics = issues.filter((i) => i.projectId === activeProject.id && i.type === 'epic');
  const otherIssues = selectedIssue
    ? issues.filter((i) => i.projectId === activeProject.id && i.id !== selectedIssue.id)
    : [];

  const issueComments = (comments || []).filter((c) => c.issueId === selectedIssue?.id);
  const issueWorklogs = (worklogs || []).filter((w) => w.issueId === selectedIssue?.id);
  const issueSubtasks = selectedIssue?.subtasks || [];
  const issueLinks = selectedIssue?.linkedIssues || [];

  const handleAiGenerateSubtasks = async () => {
    if (!selectedIssue) return;
    setIsGeneratingSubtasks(true);
    try {
      const resultText = await callJiraAiAssist(
        'generate_subtasks',
        selectedIssue.title,
        selectedIssue.description
      );
      let taskTitles: string[] = [];
      try {
        const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed.subtasks)) {
          taskTitles = parsed.subtasks;
        } else if (Array.isArray(parsed)) {
          taskTitles = parsed;
        }
      } catch {
        taskTitles = resultText
          .split('\n')
          .map((l) => l.replace(/^[-*•0-9.)\s]+/, '').trim())
          .filter((l) => l.length > 2 && !l.toLowerCase().startsWith('subtask'));
      }

      if (taskTitles.length > 0) {
        const newItems = taskTitles.slice(0, 6).map((t, idx) => ({
          id: `st-${Date.now()}-${idx}`,
          title: t,
          completed: false,
        }));
        updateIssue(selectedIssue.id, {
          subtasks: [...issueSubtasks, ...newItems],
        });
      }
    } catch (e) {
      console.warn('AI subtask error:', e);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleStatusChange = (newStatus: IssueStatus) => {
    if (!selectedIssue) return;
    updateIssue(selectedIssue.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority: IssuePriority) => {
    if (!selectedIssue) return;
    updateIssue(selectedIssue.id, { priority: newPriority });
  };

  const handleAssigneeChange = (userId: string) => {
    if (!selectedIssue) return;
    updateIssue(selectedIssue.id, { assigneeId: userId || undefined });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (!selectedIssue) return;
    const updated = issueSubtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateIssue(selectedIssue.id, { subtasks: updated });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !newSubtaskTitle.trim()) return;
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    updateIssue(selectedIssue.id, {
      subtasks: [...issueSubtasks, newSt],
    });
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!selectedIssue) return;
    const updated = issueSubtasks.filter((st) => st.id !== subtaskId);
    updateIssue(selectedIssue.id, { subtasks: updated });
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !commentText.trim()) return;
    addComment(selectedIssue.id, commentText.trim());
    setCommentText('');
  };

  const handleLogWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    const minutes = parseJiraTimeToMinutes(timeSpentInput);
    if (minutes > 0) {
      addWorklog(selectedIssue.id, minutes, worklogDesc.trim() || 'Work logged');
      setIsLoggingWork(false);
      setTimeSpentInput('');
      setWorklogDesc('');
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !targetIssueId) return;
    const target = issues.find((i) => i.id === targetIssueId);
    if (!target) return;

    const newLink = {
      type: linkType,
      targetIssueId: target.id,
      targetIssueKey: target.key,
      targetTitle: target.title,
    };

    const currentLinks = selectedIssue.linkedIssues || [];
    updateIssue(selectedIssue.id, { linkedIssues: [...currentLinks, newLink] });
    setIsLinkingOpen(false);
    setTargetIssueId('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDeleteIssueConfirm = () => {
    if (!selectedIssue) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedIssue.key}?`)) {
      deleteIssue(selectedIssue.id);
    }
  };

  if (!selectedIssue) return null;

  // Progress of logged work
  const originalEstimate = selectedIssue.originalEstimateMinutes || 120;
  const timeSpent = selectedIssue.timeSpentMinutes || 0;
  const timeProgressPct = Math.min(100, Math.round((timeSpent / originalEstimate) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Bar */}
        <div className="px-5 py-3 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-stone-50/70 dark:bg-zinc-950/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="shrink-0">{getIssueTypeIcon(selectedIssue.type, 18)}</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-stone-700 dark:text-zinc-300">
              {selectedIssue.key}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 transition-colors"
              title="Copy issue link"
            >
              {isCopied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteIssueConfirm}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Issue"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setSelectedIssue(null)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-200/50 dark:hover:bg-zinc-800 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Column (2 spans): Title, Description, Subtasks, Links, Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title (editable) */}
            <div>
              <input
                type="text"
                value={selectedIssue.title}
                onChange={(e) => updateIssue(selectedIssue.id, { title: e.target.value })}
                className="w-full text-lg sm:text-xl font-bold text-stone-900 dark:text-zinc-100 bg-transparent border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 focus:border-blue-500 rounded-lg p-1.5 transition-colors focus:outline-hidden"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono">
                Description
              </label>
              <textarea
                rows={4}
                value={selectedIssue.description}
                onChange={(e) => updateIssue(selectedIssue.id, { description: e.target.value })}
                placeholder="Add a detailed description, acceptance criteria, or reproduction steps..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/40 text-stone-800 dark:text-zinc-200 placeholder-stone-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Subtasks */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono">
                  Subtasks ({issueSubtasks.filter((s) => s.completed).length}/
                  {issueSubtasks.length})
                </label>
                <button
                  type="button"
                  onClick={handleAiGenerateSubtasks}
                  disabled={isGeneratingSubtasks}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                  title="Auto-breakdown issue into actionable engineering tasks using Gemini AI"
                >
                  {isGeneratingSubtasks ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} />
                      AI Subtasks
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                {issueSubtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-stone-50 dark:bg-zinc-800/50 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs transition-colors"
                  >
                    <button
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {st.completed ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-stone-400 shrink-0" />
                      )}
                      <span
                        className={
                          st.completed
                            ? 'line-through text-stone-400 dark:text-zinc-500'
                            : 'text-stone-800 dark:text-zinc-200'
                        }
                      >
                        {st.title}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="text-stone-400 hover:text-rose-500 p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask form */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="+ Add a subtask (Press Enter)..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-transparent text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-xs font-semibold disabled:opacity-40"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Linked Issues & Dependencies */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono">
                  Linked Issues & Blockers
                </label>
                <button
                  onClick={() => setIsLinkingOpen(!isLinkingOpen)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Link Issue</span>
                </button>
              </div>

              {/* Existing links */}
              {issueLinks && issueLinks.length > 0 ? (
                <div className="space-y-1.5">
                  {issueLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-stone-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300">
                          {link.type.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono font-bold text-blue-600">{link.targetIssueKey}</span>
                        <span className="text-stone-700 dark:text-zinc-300 truncate">
                          {link.targetTitle}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-stone-400 dark:text-zinc-500 italic">
                  No issue dependencies linked.
                </div>
              )}

              {/* Add Link Form */}
              {isLinkingOpen && (
                <form
                  onSubmit={handleAddLink}
                  className="p-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 space-y-2 text-xs"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <ShadcnSelect
                      value={linkType}
                      onChange={(val) => setLinkType(val as any)}
                      size="sm"
                      options={[
                        { value: 'blocks', label: 'Blocks' },
                        { value: 'is_blocked_by', label: 'Is blocked by' },
                        { value: 'relates_to', label: 'Relates to' },
                        { value: 'duplicates', label: 'Duplicates' },
                      ]}
                    />

                    <ShadcnCombobox
                      value={targetIssueId}
                      onChange={(val) => setTargetIssueId(val)}
                      size="sm"
                      placeholder="Select target issue..."
                      searchPlaceholder="Search issue..."
                      options={otherIssues.map((oi) => ({
                        value: oi.id,
                        label: `${oi.key} - ${oi.title}`,
                        badge: oi.key,
                      }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLinkingOpen(false)}
                      className="px-2.5 py-1 rounded text-stone-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!targetIssueId}
                      className="px-3 py-1 rounded bg-blue-600 text-white font-semibold disabled:opacity-40"
                    >
                      Link
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Activity Stream Tabs (Comments, Worklog) */}
            <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-4 border-b border-stone-200 dark:border-zinc-800 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'comments'
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Comments ({issueComments.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('worklog')}
                  className={`pb-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'worklog'
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Clock size={14} />
                  <span>Worklogs ({issueWorklogs.length})</span>
                </button>
              </div>

              {/* Comments Stream */}
              {activeTab === 'comments' && (
                <div className="space-y-3">
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {issueComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/40 text-xs"
                      >
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 dark:text-zinc-100">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-stone-700 dark:text-zinc-300">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {issueComments.length === 0 && (
                      <div className="text-xs text-stone-400 dark:text-zinc-500 italic py-2">
                        No comments yet. Be the first to comment.
                      </div>
                    )}
                  </div>

                  {/* Add comment box */}
                  <form onSubmit={handleAddCommentSubmit} className="flex items-center gap-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="Add a comment... (use @mention for team members)"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
                    >
                      <Send size={12} />
                      <span>Post</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Worklog Stream */}
              {activeTab === 'worklog' && (
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span>Time Spent: {formatMinutesToJira(timeSpent)}</span>
                      <span>Estimate: {formatMinutesToJira(originalEstimate)}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${timeProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* List of worklogs */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {issueWorklogs.map((wl) => (
                      <div
                        key={wl.id}
                        className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={wl.authorAvatar}
                            alt={wl.authorName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-stone-900 dark:text-zinc-100">
                              {wl.authorName}
                            </span>{' '}
                            <span className="text-stone-500">logged</span>{' '}
                            <span className="font-mono font-bold text-blue-600">
                              {formatMinutesToJira(wl.timeSpentMinutes)}
                            </span>
                            <div className="text-[11px] text-stone-500">{wl.description}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(wl.loggedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {issueWorklogs.length === 0 && (
                      <div className="text-xs text-stone-400 dark:text-zinc-500 italic py-2">
                        No work logged yet.
                      </div>
                    )}
                  </div>

                  {/* Log work trigger & form */}
                  {!isLoggingWork ? (
                    <button
                      onClick={() => setIsLoggingWork(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-xs font-semibold text-stone-800 dark:text-zinc-200"
                    >
                      <Plus size={13} />
                      <span>Log Work Time</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={handleLogWorkSubmit}
                      className="p-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 space-y-2 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                            Time Spent (e.g. 2h 30m)
                          </label>
                          <input
                            type="text"
                            required
                            value={timeSpentInput}
                            onChange={(e) => setTimeSpentInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                            Work Description
                          </label>
                          <input
                            type="text"
                            placeholder="What was completed?"
                            value={worklogDesc}
                            onChange={(e) => setWorklogDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsLoggingWork(false)}
                          className="px-2.5 py-1 rounded text-stone-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded bg-blue-600 text-white font-semibold"
                        >
                          Save Worklog
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Column (1 span): Metadata & Attributes */}
          <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-stone-100 dark:border-zinc-800 lg:pl-6 text-xs">
            {/* Status Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono mb-1">
                Status
              </label>
              <ShadcnSelect
                value={selectedIssue.status}
                onChange={(val) => handleStatusChange(val as IssueStatus)}
                options={[
                  { value: 'todo', label: 'To Do' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'in_review', label: 'Code Review' },
                  { value: 'qa', label: 'QA Testing' },
                  { value: 'done', label: 'Done' },
                ]}
                size="sm"
              />
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono mb-1">
                Assignee
              </label>
              <ShadcnSelect
                value={selectedIssue.assigneeId || ''}
                onChange={(val) => handleAssigneeChange(val as string)}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...members.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.title})`,
                  })),
                ]}
                size="sm"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono mb-1">
                Priority
              </label>
              <ShadcnSelect
                value={selectedIssue.priority}
                onChange={(val) => handlePriorityChange(val as IssuePriority)}
                options={[
                  { value: 'highest', label: '🔴 Highest' },
                  { value: 'high', label: '🟠 High' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'low', label: '🔵 Low' },
                  { value: 'lowest', label: '⚪ Lowest' },
                ]}
                size="sm"
              />
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono mb-1">
                Story Points
              </label>
              <input
                type="number"
                min={0}
                max={40}
                value={selectedIssue.storyPoints || ''}
                onChange={(e) =>
                  updateIssue(selectedIssue.id, {
                    storyPoints: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/70 text-stone-900 dark:text-zinc-100 font-mono"
              />
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono mb-1">
                Sprint
              </label>
              <ShadcnSelect
                value={selectedIssue.sprintId || ''}
                onChange={(val) =>
                  updateIssue(selectedIssue.id, {
                    sprintId: (val as string) || undefined,
                  })
                }
                options={[
                  { value: '', label: 'Backlog (No Sprint)' },
                  ...sprints
                    .filter((s) => s.projectId === activeProject.id)
                    .map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.status})`,
                    })),
                ]}
                size="sm"
              />
            </div>

            {/* Epic Link */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono mb-1">
                Epic
              </label>
              <ShadcnSelect
                value={selectedIssue.epicId || ''}
                onChange={(val) =>
                  updateIssue(selectedIssue.id, {
                    epicId: (val as string) || undefined,
                  })
                }
                options={[
                  { value: '', label: 'No Epic' },
                  ...epics.map((ep) => ({
                    value: ep.id,
                    label: `${ep.key} - ${ep.title}`,
                  })),
                ]}
                size="sm"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={selectedIssue.dueDate ? selectedIssue.dueDate.slice(0, 10) : ''}
                onChange={(e) =>
                  updateIssue(selectedIssue.id, {
                    dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/70 text-stone-900 dark:text-zinc-100"
              />
            </div>

            {/* Reporter & Dates */}
            <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-stone-400 space-y-1 font-mono">
              <div>Reporter: {reporter?.name || 'System'}</div>
              <div>Created: {new Date(selectedIssue.createdAt).toLocaleDateString()}</div>
              <div>Updated: {new Date(selectedIssue.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
