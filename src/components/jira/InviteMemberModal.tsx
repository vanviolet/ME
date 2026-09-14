import React, { useState } from 'react';
import { useJira } from './JiraContext';
import { X, UserPlus, Mail, Shield, AlertCircle, CheckCircle2, Crown } from 'lucide-react';
import { UserRole } from './types';

export const InviteMemberModal: React.FC = () => {
  const {
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviteMember,
    canManageRoles,
    currentUser,
    activeProject,
  } = useJira();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isInviteModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!canManageRoles) {
      setStatusMessage({
        type: 'error',
        text: 'Access Denied: Only the Project Creator / Workspace Admin can invite members and configure roles.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await inviteMember(name.trim(), email.trim(), role, title.trim());
      setStatusMessage({
        type: 'success',
        text: `Invitation successfully sent to ${email.trim()} with role "${role.toUpperCase()}".`,
      });
      setTimeout(() => {
        setEmail('');
        setName('');
        setTitle('');
        setRole('member');
        setStatusMessage(null);
        setIsInviteModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to send invite.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                Invite Team Member
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                Project: <span className="font-semibold text-stone-800 dark:text-zinc-200">{activeProject.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Creator RBAC Info */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 flex items-start gap-2.5 text-xs text-stone-700 dark:text-zinc-300">
            <Crown size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Project Creator Authorization:</span>{' '}
              {canManageRoles ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  You are authorized to assign roles and invite collaborators.
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Read-only: You do not have permission to invite or set roles.
                </span>
              )}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                disabled={!canManageRoles || isSubmitting}
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled={!canManageRoles || isSubmitting}
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                disabled={!canManageRoles || isSubmitting}
                placeholder="e.g. Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Role Setting (Configured by Project Creator) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Assigned RBAC Role</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                Configured by Creator
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'member', name: 'Member', desc: 'Create, edit issues & log work' },
                { id: 'lead', name: 'Lead', desc: 'Start sprints, release versions' },
                { id: 'admin', name: 'Admin', desc: 'Full workspace administration' },
                { id: 'viewer', name: 'Viewer', desc: 'Read-only board & dashboard' },
              ].map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={!canManageRoles || isSubmitting}
                    onClick={() => setRole(r.id as UserRole)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-500'
                        : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-stone-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                      {r.name}
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-zinc-400 leading-tight mt-0.5">
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canManageRoles || isSubmitting || !email.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={14} />
              <span>{isSubmitting ? 'Sending...' : 'Send Invite'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
