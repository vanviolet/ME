import React, { useState, useEffect } from 'react';
import { useJira } from './JiraContext';
import { Search, X, ArrowRight, Layers } from 'lucide-react';
import { getIssueTypeIcon, getStatusBadgeClass, getStatusName } from './jiraUtils';

export const QuickSearchModal: React.FC = () => {
  const { isQuickSearchOpen, setIsQuickSearchOpen, issues, setSelectedIssue } = useJira();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsQuickSearchOpen]);

  if (!isQuickSearchOpen) return null;

  const results = query.trim()
    ? issues.filter(
        (i) =>
          i.key.toLowerCase().includes(query.toLowerCase()) ||
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.description?.toLowerCase().includes(query.toLowerCase()) ||
          i.labels?.some((l) => l.toLowerCase().includes(query.toLowerCase()))
      )
    : issues.slice(0, 8);

  const handleSelect = (issue: any) => {
    setSelectedIssue(issue);
    setIsQuickSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="p-3.5 border-b border-stone-200 dark:border-zinc-800 flex items-center gap-3">
          <Search size={18} className="text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by issue key, summary, description, or label..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-hidden"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded text-stone-500">
            ESC
          </kbd>
          <button
            onClick={() => setIsQuickSearchOpen(false)}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono">
            {query.trim() ? `Search Results (${results.length})` : 'Recent Issues'}
          </div>

          {results.map((issue) => (
            <button
              key={issue.id}
              onClick={() => handleSelect(issue)}
              className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center justify-between gap-3 text-xs transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="shrink-0">{getIssueTypeIcon(issue.type, 14)}</span>
                <span className="font-mono font-bold text-stone-500 group-hover:text-blue-600 shrink-0">
                  {issue.key}
                </span>
                <span className="font-medium text-stone-900 dark:text-zinc-100 truncate">
                  {issue.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${getStatusBadgeClass(
                    issue.status
                  )}`}
                >
                  {getStatusName(issue.status)}
                </span>
                <ArrowRight size={13} className="text-stone-300 group-hover:text-blue-500" />
              </div>
            </button>
          ))}

          {results.length === 0 && (
            <div className="p-8 text-center text-xs text-stone-400">
              No matching issues found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
