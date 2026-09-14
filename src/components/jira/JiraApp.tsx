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

export const JiraApp: React.FC = () => {
  const { currentTab } = useJira();
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
