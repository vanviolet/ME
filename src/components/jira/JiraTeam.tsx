import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Users,
  ShieldCheck,
  Plus,
  Mail,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import { JiraUser, UserRole } from './types';

export const JiraTeam: React.FC = () => {
  const { workspace, members, setWorkspace, currentUser, setCurrentUser } = useJira();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<UserRole>('member');

  const permissionsMatrix = [
    { perm: 'Create & Edit Issues', admin: true, lead: true, member: true, viewer: false },
    { perm: 'Transition Workflow Status', admin: true, lead: true, member: true, viewer: false },
    { perm: 'Start & Complete Sprints', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Manage Versions & Releases', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Configure Automations & Rules', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Manage Team & Permissions (RBAC)', admin: true, lead: false, member: false, viewer: false },
    { perm: 'Delete Issues & Worklogs', admin: true, lead: true, member: false, viewer: false },
  ];

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: JiraUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      role,
      title: title.trim() || 'Software Engineer',
    };

    setWorkspace((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));

    setIsInviteOpen(false);
    setName('');
    setEmail('');
    setTitle('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Team, RBAC & Permissions
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Role-Based Access Control
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Manage organization members, assign roles, and inspect permission boundaries.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <Plus size={14} />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members List */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
          <Users size={16} className="text-blue-500" />
          <span>Workspace Members ({members.length})</span>
        </h3>

        <div className="divide-y divide-stone-100 dark:divide-zinc-800">
          {members.map((member) => (
            <div
              key={member.id}
              className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-stone-200 dark:ring-zinc-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                      {member.name}
                    </span>
                    {member.id === currentUser.id && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Current User
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-zinc-400 flex items-center gap-2">
                    <span>{member.title}</span>
                    <span>•</span>
                    <span className="font-mono">{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    member.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : member.role === 'lead'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      : member.role === 'member'
                      ? 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {member.role}
                </span>

                {member.id !== currentUser.id && (
                  <button
                    onClick={() => setCurrentUser(member)}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400"
                  >
                    Act As
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Role Permissions Matrix (RBAC)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 dark:border-zinc-800 text-stone-400 font-mono text-[10px] uppercase">
                <th className="pb-2 font-bold">Permission Scope</th>
                <th className="pb-2 font-bold text-center">Admin</th>
                <th className="pb-2 font-bold text-center">Lead</th>
                <th className="pb-2 font-bold text-center">Member</th>
                <th className="pb-2 font-bold text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
              {permissionsMatrix.map((row) => (
                <tr key={row.perm} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30">
                  <td className="py-2.5 font-medium text-stone-800 dark:text-zinc-200">
                    {row.perm}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.admin ? (
                      <Check size={14} className="text-emerald-600 mx-auto" />
                    ) : (
                      <X size={14} className="text-stone-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.lead ? (
                      <Check size={14} className="text-emerald-600 mx-auto" />
                    ) : (
                      <X size={14} className="text-stone-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.member ? (
                      <Check size={14} className="text-emerald-600 mx-auto" />
                    ) : (
                      <X size={14} className="text-stone-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.viewer ? (
                      <Check size={14} className="text-emerald-600 mx-auto" />
                    ) : (
                      <X size={14} className="text-stone-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleInviteSubmit}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
              Invite Team Member
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Zhao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="david@nexus.corp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 dark:text-zinc-300 block mb-1">
                  Assigned RBAC Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
                >
                  <option value="member">Member (Create & Edit issues, log work)</option>
                  <option value="lead">Lead (Start/Complete sprints, release versions)</option>
                  <option value="admin">Admin (Full system access & settings)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
