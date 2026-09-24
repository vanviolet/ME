import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Users,
  ShieldCheck,
  Plus,
  Mail,
  Check,
  X,
  Crown,
  Trash2,
  AlertCircle,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from './types';
import { ShadcnSelect } from '../ui/select';

export const JiraTeam: React.FC = () => {
  const {
    workspace,
    members,
    activeProject,
    currentUser,
    setCurrentUser,
    canManageRoles,
    isProjectCreator,
    updateMemberRole,
    removeMember,
    setIsInviteModalOpen,
  } = useJira();

  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const permissionsMatrix = [
    { perm: 'Create, Edit & Assign Issues', admin: true, lead: true, member: true, viewer: false },
    { perm: 'Transition Workflow Board Status', admin: true, lead: true, member: true, viewer: false },
    { perm: 'Start, Complete & Plan Sprints', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Create Projects & Workspaces', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Manage Versions & Release Notes', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Configure Automations & Rules', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Invite Members via Email (RBAC)', admin: true, lead: true, member: false, viewer: false },
    { perm: 'Configure Roles & Permissions', admin: true, lead: true, member: false, viewer: false },
  ];

  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    try {
      await updateMemberRole(userId, targetRole);
      setActionNotice({
        type: 'success',
        text: `Role successfully updated to "${targetRole.toUpperCase()}".`,
      });
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        text: err?.message || 'Failed to update role.',
      });
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove "${memberName}" from this project workspace?`)) {
      try {
        await removeMember(userId);
        setActionNotice({
          type: 'success',
          text: `Member "${memberName}" has been removed.`,
        });
        setTimeout(() => setActionNotice(null), 3000);
      } catch (err: any) {
        setActionNotice({
          type: 'error',
          text: err?.message || 'Failed to remove member.',
        });
        setTimeout(() => setActionNotice(null), 4000);
      }
    }
  };

  const isMemberOwner = (userId: string, email: string) => {
    return (
      userId === activeProject.leadId ||
      email.toLowerCase() === (workspace.ownerEmail || '').toLowerCase()
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              Team, RBAC & Role Management
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Active Project: {activeProject.key}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
            Role setting and invitations are controlled by the <strong className="text-stone-700 dark:text-zinc-200">Project Creator / Workspace Admin</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          disabled={!canManageRoles}
          title={canManageRoles ? 'Invite member through Email' : 'Only Project Creator / Admin can invite members'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>Invite Member via Email</span>
        </button>
      </div>

      {/* Creator Status Card */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs ${
        canManageRoles
          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-200'
          : 'bg-stone-50 dark:bg-zinc-800/50 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300'
      }`}>
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Crown size={16} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm flex items-center gap-2">
            <span>Project Lead & Creator Access</span>
            {canManageRoles ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                AUTHORIZED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300 font-bold">
                VIEWER / RESTRICTED
              </span>
            )}
          </div>
          <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
            {canManageRoles
              ? `You (${currentUser.name}) are the Project Creator / Lead. You have full authority to invite colleagues by email, adjust role tiers, and configure workspace permissions.`
              : `You are currently viewing this project with member/viewer privileges. Role modifications and invitations can only be performed by the Project Creator (${activeProject.leadId || 'Workspace Admin'}).`}
          </p>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Members List */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <span>Workspace Members ({members.length})</span>
          </h3>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400">
            Real-time persistence active
          </span>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-zinc-800">
          {members.map((member) => {
            const isOwner = isMemberOwner(member.id, member.email);
            const isMe = member.id === currentUser.id;

            return (
              <div
                key={member.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      member.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.email || member.name)}`
                    }
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-stone-100 dark:ring-zinc-800 bg-stone-100 dark:bg-zinc-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                        {member.name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20">
                          You
                        </span>
                      )}
                      {isOwner && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <Crown size={10} />
                          Creator / Lead
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>{member.title || 'Software Engineer'}</span>
                      <span>•</span>
                      <span className="font-mono text-stone-600 dark:text-zinc-300">{member.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  {/* Role Selector: Only enabled for the Project Creator / Admin */}
                  {canManageRoles && !isOwner ? (
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-stone-400 font-mono hidden sm:inline">Role:</label>
                      <ShadcnSelect
                        value={member.role}
                        onChange={(val) => handleRoleChange(member.id, val as UserRole)}
                        size="sm"
                        className="w-28"
                        options={[
                          { value: 'admin', label: 'ADMIN' },
                          { value: 'lead', label: 'LEAD' },
                          { value: 'member', label: 'MEMBER' },
                          { value: 'viewer', label: 'VIEWER' },
                        ]}
                      />
                    </div>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider ${
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
                  )}

                  {/* Switch Act-As for quick preview testing */}
                  {!isMe && (
                    <button
                      onClick={() => setCurrentUser(member)}
                      title={`Switch view to act as ${member.name}`}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      Switch To
                    </button>
                  )}

                  {/* Remove member button: Creator only */}
                  {canManageRoles && !isOwner && !isMe && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      title="Remove member from workspace"
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
    </div>
  );
};
