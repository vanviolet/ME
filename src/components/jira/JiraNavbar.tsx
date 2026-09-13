import React, { useState } from 'react';
import { useJira } from './JiraContext';
import {
  Kanban,
  Plus,
  Search,
  Bell,
  ChevronDown,
  Layers,
  ArrowLeft,
  Check,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const JiraNavbar: React.FC = () => {
  const {
    workspace,
    projects,
    activeProject,
    setActiveProjectId,
    currentUser,
    setCurrentUser,
    setIsCreateModalOpen,
    setIsQuickSearchOpen,
    filter,
    setFilter,
    quickFilter,
    setQuickFilter,
    notifications,
    markNotificationsAsRead,
  } = useJira();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 sticky top-16 z-30 px-3 sm:px-6 py-2.5 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Logo & Workspace / Project Selector */}
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="Back to Tools Hub"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2 border-r border-stone-200 dark:border-zinc-800 pr-3 mr-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Kanban size={18} />
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 leading-none">
                Enterprise
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-zinc-100 leading-tight">
                Jira Cloud
              </div>
            </div>
          </div>

          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/60 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs sm:text-sm font-medium transition-colors"
            >
              <span className="text-base leading-none">{activeProject.avatar}</span>
              <span className="font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                {activeProject.name}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {activeProject.key}
              </span>
              <ChevronDown size={14} className="text-stone-400" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1 text-xs">
                <div className="px-3 py-1.5 font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  Projects ({projects.length})
                </div>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-zinc-100">{p.name}</div>
                        <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
                          Key: {p.key} • {p.template}
                        </div>
                      </div>
                    </div>
                    {p.id === activeProject.id && <Check size={14} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Create Issue Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>

        {/* Center: Search & Filter Chips */}
        <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search issues, keys (e.g. NEX-101)..."
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              onFocus={() => setIsQuickSearchOpen(true)}
              className="w-full pl-8 pr-12 py-1.5 text-xs bg-stone-100 dark:bg-zinc-800/80 border border-transparent focus:border-blue-500 rounded-lg text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-hidden"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 rounded text-stone-500 dark:text-zinc-300">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Side: Quick Filter Chips, Notifications, User Persona */}
        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <div className="hidden xl:flex items-center gap-1 bg-stone-100 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                quickFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setQuickFilter('my')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                quickFilter === 'my'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              My Issues
            </button>
            <button
              onClick={() => setQuickFilter('bugs')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                quickFilter === 'bugs'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              Bugs
            </button>
            <button
              onClick={() => setQuickFilter('epics')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                quickFilter === 'epics'
                  ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              Epics
            </button>
          </div>

          {/* Search trigger on mobile */}
          <button
            onClick={() => setIsQuickSearchOpen(true)}
            className="lg:hidden p-2 rounded-lg text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
            title="Search"
          >
            <Search size={16} />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
                if (!isNotifDropdownOpen) markNotificationsAsRead();
              }}
              className="relative p-2 rounded-lg text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            {isNotifDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-2 text-xs">
                <div className="px-2 py-1.5 font-bold text-stone-900 dark:text-zinc-100 flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 mb-1">
                  <span>Project Activity & Alerts</span>
                  <span className="text-[10px] font-normal text-stone-400">Real-time</span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="font-medium text-stone-800 dark:text-zinc-200">{n.title}</div>
                      <div className="text-[10px] text-stone-400 dark:text-zinc-500 mt-0.5">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Persona Switcher (RBAC testing) */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-300 dark:ring-zinc-700"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold leading-none text-stone-900 dark:text-zinc-100">
                  {currentUser.name}
                </span>
                <span className="text-[10px] uppercase font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown size={12} className="text-stone-400" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1 text-xs">
                <div className="px-3 py-2 border-b border-stone-100 dark:border-zinc-800">
                  <div className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                    Testing RBAC Persona
                  </div>
                  <div className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">
                    Switch role to test permissions & views:
                  </div>
                </div>
                {workspace.members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setCurrentUser(member);
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-zinc-100">{member.name}</div>
                        <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
                          {member.title} ({member.role})
                        </div>
                      </div>
                    </div>
                    {member.id === currentUser.id && <Check size={14} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
