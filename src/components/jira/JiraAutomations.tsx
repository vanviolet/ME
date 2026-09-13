import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Cpu,
  Plus,
  Play,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  Zap,
  Activity,
} from 'lucide-react';
import { AutomationRule } from './types';

export const JiraAutomations: React.FC = () => {
  const { automationRules, setAutomationRules, activeProject } = useJira();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('ISSUE_STATUS_CHANGED');
  const [condition, setCondition] = useState('All subtasks completed');
  const [action, setAction] = useState('Move parent issue to Code Review');

  const toggleRule = (id: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      projectId: activeProject.id,
      name: name.trim(),
      description: `Rule triggered on ${trigger}`,
      enabled: true,
      trigger: trigger as any,
      condition: condition.trim(),
      action: action.trim(),
      executionCount: 0,
      lastExecutedAt: new Date().toISOString(),
    };

    setAutomationRules((prev) => [...prev, newRule]);
    setIsCreateOpen(false);
    setName('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Jira Automation Engine
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              No-Code Workflows
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Automate routine transitions, assignments, alerts, and field synchronizations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Automation Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {automationRules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl border transition-all bg-white dark:bg-zinc-900 shadow-xs space-y-3 ${
              rule.enabled
                ? 'border-stone-200 dark:border-zinc-800'
                : 'border-stone-200/50 dark:border-zinc-800/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    rule.enabled
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-400'
                  }`}
                >
                  <Zap size={18} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                      {rule.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                      Triggered {rule.executionCount}x
                    </span>
                  </div>

                  {/* Flow Steps Visual */}
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-mono text-[10px] font-semibold">
                      WHEN: {rule.trigger.replace(/_/g, ' ')}
                    </span>
                    <ArrowRight size={12} className="text-stone-400" />
                    <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-mono text-[10px]">
                      IF: {rule.condition}
                    </span>
                    <ArrowRight size={12} className="text-stone-400" />
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono text-[10px] font-semibold">
                      THEN: {rule.action}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleRule(rule.id)}
                className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
                title={rule.enabled ? 'Disable rule' : 'Enable rule'}
              >
                {rule.enabled ? (
                  <ToggleRight size={28} className="text-blue-600" />
                ) : (
                  <ToggleLeft size={28} className="text-stone-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              Create New Automation Rule
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auto-close resolved subtasks"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Trigger
                </label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                >
                  <option value="ISSUE_STATUS_CHANGED">Issue Status Changed</option>
                  <option value="SUBTASK_ALL_DONE">All Subtasks Done</option>
                  <option value="ISSUE_CREATED">Issue Created</option>
                  <option value="PRIORITY_SET_HIGHEST">Priority Set to Highest</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Condition
                </label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Issue type is Bug"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Action
                </label>
                <input
                  type="text"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="e.g. Notify Lead Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Save Automation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
