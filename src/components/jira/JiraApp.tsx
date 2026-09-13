import React, { useState } from 'react';
import { JiraProvider, useJira } from './JiraContext';
import { JiraNavbar } from './JiraNavbar';
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

const JiraContent: React.FC = () => {
  const { currentTab } = useJira();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-stone-100/60 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-sans">
      {/* Top Jira Header */}
      <JiraNavbar />

      {/* Main Workspace Layout: Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden">
        <JiraSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto relative">
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
        </main>
      </div>

      {/* Global Modals */}
      <IssueDetailModal />
      <CreateIssueModal />
      <QuickSearchModal />
    </div>
  );
};

export const JiraApp: React.FC = () => {
  return (
    <JiraProvider>
      <JiraContent />
    </JiraProvider>
  );
};

export default JiraApp;
