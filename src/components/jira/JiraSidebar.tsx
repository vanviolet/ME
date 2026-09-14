import React from 'react';
import { useJira } from './JiraContext';
import {
  LayoutDashboard,
  Kanban,
  ListOrdered,
  CalendarRange,
  Calendar,
  BarChart3,
  Tag,
  Cpu,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { JiraTab } from './types';

export const JiraSidebar: React.FC<{
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}> = ({ isCollapsed, setIsCollapsed }) => {
  const {
    currentTab,
    setCurrentTab,
    activeProject,
    issues,
    activeSprint,
  } = useJira();

  const projectIssues = issues.filter((i) => i.projectId === activeProject.id);
  const totalPoints = projectIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = projectIssues
    .filter((i) => i.status === 'done')
    .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const completionPercentage = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const navItems: {
    section: string;
    items: { id: JiraTab; label: string; icon: React.FC<{ size: number; className?: string }>; count?: number }[];
  }[] = [
    {
      section: 'Planning',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'board', label: 'Active Board', icon: Kanban, count: projectIssues.length },
        { id: 'backlog', label: 'Backlog & Sprints', icon: ListOrdered },
        { id: 'roadmap', label: 'Roadmap (Gantt)', icon: CalendarRange },
      ],
    },
    {
      section: 'Tracking',
      items: [
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'reports', label: 'Reports & Burndown', icon: BarChart3 },
        { id: 'releases', label: 'Releases & Versions', icon: Tag },
      ],
    },
    {
      section: 'Configuration',
      items: [
        { id: 'automations', label: 'Automations', icon: Cpu },
        { id: 'team', label: 'Team & RBAC', icon: Users },
        { id: 'settings', label: 'Project Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-20 bg-stone-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-r border-stone-200 dark:border-zinc-800 transition-all duration-300 flex flex-col justify-between shrink-0 select-none ${
        isCollapsed ? 'w-14 sm:w-16' : 'w-56 sm:w-64'
      }`}
    >
      {/* Top Project Badge */}
      <div className="p-3 border-b border-stone-200/70 dark:border-zinc-800/70 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
              {activeProject.avatar}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-stone-900 dark:text-zinc-100 truncate">
                {activeProject.name}
              </h2>
              <div className="text-[10px] text-stone-500 dark:text-zinc-400 uppercase font-mono">
                {activeProject.template} Project
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-200/50 dark:hover:bg-zinc-800 transition-colors mx-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navItems.map((group) => (
          <div key={group.section} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 font-mono">
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-800/80 hover:text-stone-900 dark:hover:text-zinc-100'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-stone-500 dark:text-zinc-400'} />
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between truncate text-left">
                      <span>{item.label}</span>
                      {item.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Mini Progress Status */}
      {!isCollapsed && activeSprint && (
        <div className="p-3 m-2 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[11px] text-stone-800 dark:text-zinc-200 truncate">
              {activeSprint.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
            <span>{donePoints} pts done</span>
            <span>{totalPoints} total pts</span>
          </div>
        </div>
      )}
    </aside>
  );
};
