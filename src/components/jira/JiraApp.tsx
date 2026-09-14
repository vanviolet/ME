import React, { useState } from 'react';
import { useJira } from './JiraContext';
import { JiraSidebar } from './JiraSidebar';
import { JiraBoard } from './JiraBoard';
import { JiraBacklog } from './JiraBacklog';
import { JiraDashboard } from './JiraDashboard';
import { JiraRoadmap } from './JiraRoadmap';
import { JiraCalendar } from './JiraCalendar';
import { JiraReports } from './JiraReports';
import { JiraReleases } from './JiraReleases';
import { JiraAutomations } from './JiraAutomations';
import { JiraTeam } from './JiraTeam';
import { JiraSettings } from './JiraSettings';
import { IssueDetailModal } from './IssueDetailModal';
import { CreateIssueModal } from './CreateIssueModal';
import { QuickSearchModal } from './QuickSearchModal';
import { CreateProjectModal } from './CreateProjectModal';
import { InviteMemberModal } from './InviteMemberModal';
import { Cloud, Loader2 } from 'lucide-react';

export const JiraApp: React.FC = () => {
  const { currentTab, isLoading } = useJira();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen pt-14 bg-stone-100/60 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-sans">
      {/* Fixed Sidebar */}
      <JiraSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Workspace View with dynamic margin for fixed sidebar */}
      <main
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-14 sm:ml-16' : 'ml-56 sm:ml-64'
        } min-h-[calc(100vh-3.5rem)] overflow-y-auto relative p-4 sm:p-6`}
      >
        {isLoading ? (
          <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
            {/* Cloud Sync Status Notification */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/60 rounded-xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Cloud size={22} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                      Mengambil Data dari Cloud Firestore
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                      <Loader2 size={11} className="animate-spin" /> Live Sync
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                    Menyinkronkan proyek, tiket Kanban, backlog, dan anggota tim langsung dari server database...
                  </p>
                </div>
              </div>
            </div>

            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-zinc-800">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-stone-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-7 w-64 bg-stone-300 dark:bg-zinc-700 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 bg-stone-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-9 w-32 bg-stone-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Filter Bar Skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-48 bg-stone-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-stone-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-stone-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-stone-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            </div>

            {/* Kanban Columns Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((col) => (
                <div
                  key={col}
                  className="bg-stone-200/50 dark:bg-zinc-900/60 rounded-xl p-3 border border-stone-200 dark:border-zinc-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-zinc-800">
                    <div className="h-4 w-20 bg-stone-300 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-4 w-6 bg-stone-300 dark:bg-zinc-700 rounded-full animate-pulse" />
                  </div>
                  {[1, 2, 3].map((card) => (
                    <div
                      key={card}
                      className="bg-white dark:bg-zinc-800 p-3.5 rounded-lg border border-stone-200 dark:border-zinc-700 space-y-2.5 shadow-xs"
                    >
                      <div className="h-4 w-3/4 bg-stone-200 dark:bg-zinc-700 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-stone-100 dark:bg-zinc-700/60 rounded animate-pulse" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-4 w-12 bg-stone-200 dark:bg-zinc-700 rounded animate-pulse" />
                        <div className="h-5 w-5 bg-stone-200 dark:bg-zinc-700 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && <JiraDashboard />}
            {currentTab === 'board' && <JiraBoard />}
            {currentTab === 'backlog' && <JiraBacklog />}
            {currentTab === 'roadmap' && <JiraRoadmap />}
            {currentTab === 'calendar' && <JiraCalendar />}
            {currentTab === 'reports' && <JiraReports />}
            {currentTab === 'releases' && <JiraReleases />}
            {currentTab === 'automations' && <JiraAutomations />}
            {currentTab === 'team' && <JiraTeam />}
            {currentTab === 'settings' && <JiraSettings />}
          </>
        )}
      </main>

      {/* Global Modals */}
      <IssueDetailModal />
      <CreateIssueModal />
      <QuickSearchModal />
      <CreateProjectModal />
      <InviteMemberModal />
    </div>
  );
};

export default JiraApp;
