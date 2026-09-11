import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { initialIssuesData } from '../data/articlesData';
import { CommunityIssue } from '../types';
import { Seo } from './Seo';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  HelpCircle,
  Search,
  Plus,
  Tag,
  Filter,
  ArrowLeft,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'vanpedia_community_issues';

export const IssuesPage: React.FC = () => {
  const { language } = usePortfolio();
  const [issues, setIssues] = useState<CommunityIssue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local issues', e);
      }
    }
    return initialIssuesData;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'solved'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // New Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newTags, setNewTags] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [authorName, setAuthorName] = useState('');

  // Answer Input State
  const [newAnswerText, setNewAnswerText] = useState('');
  const [answerAuthorName, setAnswerAuthorName] = useState('');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  const allTags = useMemo(() => {
    return Array.from(new Set(issues.flatMap(i => i.tags))).sort();
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.tags.some(t => t.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'solved' && issue.status === 'solved') ||
        (statusFilter === 'open' && issue.status === 'open');

      const matchesTag = selectedTag === '' || issue.tags.includes(selectedTag);

      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [issues, searchQuery, statusFilter, selectedTag]);

  const selectedIssue = useMemo(() => {
    return issues.find(i => i.id === selectedIssueId);
  }, [issues, selectedIssueId]);

  const handleVoteIssue = (issueId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          return { ...item, votes: item.votes + 1 };
        }
        return item;
      }),
    );
  };

  const handleVoteAnswer = (issueId: string, answerId: string) => {
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId && item.answers) {
          return {
            ...item,
            answers: item.answers.map(ans =>
              ans.id === answerId ? { ...ans, votes: ans.votes + 1 } : ans,
            ),
          };
        }
        return item;
      }),
    );
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newIssueItem: CommunityIssue = {
      id: `issue-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      tags: parsedTags.length > 0 ? parsedTags : ['General'],
      authorName: authorName.trim() || (language === 'en' ? 'Anonymous Developer' : 'Developer Tamu'),
      createdAt: new Date().toISOString(),
      votes: 1,
      answersCount: 0,
      status: 'open',
      answers: [],
    };

    setIssues(prev => [newIssueItem, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewTags('');
    setAuthorName('');
    setSelectedIssueId(newIssueItem.id);
  };

  const handleAddAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || !newAnswerText.trim()) return;

    const newAnswer = {
      id: `ans-${Date.now()}`,
      authorName: answerAuthorName.trim() || (language === 'en' ? 'Community Contributor' : 'Kontributor Komunitas'),
      content: newAnswerText.trim(),
      createdAt: new Date().toISOString(),
      votes: 0,
      isAccepted: false,
    };

    setIssues(prev =>
      prev.map(item => {
        if (item.id === selectedIssueId) {
          const currentAnswers = item.answers || [];
          return {
            ...item,
            answersCount: item.answersCount + 1,
            answers: [...currentAnswers, newAnswer],
          };
        }
        return item;
      }),
    );

    setNewAnswerText('');
    setAnswerAuthorName('');
  };

  return (
    <>
      <Seo
        title={language === 'en' ? 'Community Q&A & Issues | Muchamad Irvan' : 'Diskusi & Q&A Komunitas | Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Interactive technical Q&A, software architectural discussions, and developer issue troubleshooting.'
            : 'Forum tanya-jawab teknis, diskusi arsitektur perangkat lunak, dan pemecahan masalah ala Stack Overflow.'
        }
        url="https://vanviolet.my.id/issues"
        type="website"
      />

      <section className="py-24 px-6 sm:px-8 max-w-6xl mx-auto min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-stone-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
                {language === 'en' ? 'Community & Discussions' : 'Komunitas & Tanya Jawab'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Sparkles size={11} />
                <span>Stack Overflow Style</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Questions & Issues' : 'Tanya & Diskusi Teknis'}
            </h1>
            <p className="text-sm text-stone-600 dark:text-zinc-400 mt-2 max-w-xl">
              {language === 'en'
                ? 'Ask questions about system design, AI algorithms, database concurrency, and music theory. Answered by developers & open for community feedback.'
                : 'Ajukan pertanyaan tentang arsitektur sistem, algoritma AI, konkurensi database, dan teori musik. Dibuka untuk diskusi komunitas.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm shrink-0"
            >
              <Plus size={16} />
              <span>{language === 'en' ? 'Ask a Question' : 'Ajukan Pertanyaan'}</span>
            </button>
          </div>
        </div>

        {/* Future Architecture Notice */}
        <div className="mb-8 p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 text-xs text-stone-600 dark:text-zinc-400 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-rose-500 shrink-0 mt-0.5" />
          <p>
            {language === 'en'
              ? 'Local Persistence Active: Questions and votes are saved locally in your browser. Architecture is fully prepared for future Firebase Firestore sync and Google OAuth authentication.'
              : 'Penyimpanan Lokal Aktif: Pertanyaan dan voting tersimpan di browser. Struktur data sudah siap disinkronkan ke Firebase Firestore dan otentikasi Google OAuth.'}
          </p>
        </div>

        {/* If an issue is selected, show detail view */}
        {selectedIssue ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedIssueId(null)}
              className="inline-flex items-center gap-2 text-xs font-mono text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{language === 'en' ? 'Back to All Questions' : 'Kembali ke Semua Pertanyaan'}</span>
            </button>

            {/* Question Details Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-xs">
              <div className="flex items-start gap-4">
                {/* Voting Column */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 bg-stone-100 dark:bg-zinc-800/80 p-2 rounded-xl">
                  <button
                    onClick={() => handleVoteIssue(selectedIssue.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Upvote"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <span className="font-mono text-sm font-bold text-stone-900 dark:text-zinc-100">
                    {selectedIssue.votes}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-zinc-400 uppercase font-mono">
                    votes
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${
                        selectedIssue.status === 'solved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {selectedIssue.status === 'solved'
                        ? language === 'en'
                          ? 'Solved'
                          : 'Terjawab'
                        : language === 'en'
                        ? 'Open Question'
                        : 'Belum Terjawab'}
                    </span>
                    <span className="text-xs font-mono text-stone-400 dark:text-zinc-500">•</span>
                    <span className="text-xs font-mono text-stone-500 dark:text-zinc-400">
                      {selectedIssue.category}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-100">
                    {selectedIssue.title}
                  </h2>

                  <p className="text-stone-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {selectedIssue.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-zinc-800 text-xs font-mono">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIssue.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <div className="text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <User size={13} />
                      <span>{selectedIssue.authorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare size={18} className="text-rose-500" />
                <span>
                  {selectedIssue.answers?.length || 0}{' '}
                  {language === 'en' ? 'Answers' : 'Jawaban'}
                </span>
              </h3>

              {selectedIssue.answers && selectedIssue.answers.length > 0 ? (
                selectedIssue.answers.map(ans => (
                  <div
                    key={ans.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      ans.isAccepted
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Upvote Answer */}
                      <div className="flex flex-col items-center gap-1 shrink-0 bg-stone-100 dark:bg-zinc-800/60 p-2 rounded-xl">
                        <button
                          onClick={() => handleVoteAnswer(selectedIssue.id, ans.id)}
                          className="p-1 rounded hover:bg-rose-500/10 text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Upvote Answer"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <span className="font-mono text-xs font-bold text-stone-900 dark:text-zinc-100">
                          {ans.votes}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-stone-900 dark:text-zinc-100">
                              {ans.authorName}
                            </span>
                            {ans.isAccepted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20">
                                <CheckCircle2 size={11} />
                                <span>Accepted Answer</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                          {ans.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs text-stone-500 dark:text-zinc-400">
                    {language === 'en'
                      ? 'No answers yet. Be the first to share your perspective!'
                      : 'Belum ada jawaban. Jadilah yang pertama memberikan solusi!'}
                  </p>
                </div>
              )}

              {/* Submit Answer Box */}
              <form
                onSubmit={handleAddAnswer}
                className="mt-6 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-4"
              >
                <h4 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'Your Answer' : 'Jawaban Anda'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Your name / handle' : 'Nama Anda'}
                    value={answerAuthorName}
                    onChange={e => setAnswerAuthorName(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder={
                    language === 'en'
                      ? 'Provide detailed code snippets, architectural trade-offs, or explanations...'
                      : 'Tuliskan penjelasan teknis, potongan kode, atau solusi yang Anda sarankan...'
                  }
                  value={newAnswerText}
                  onChange={e => setNewAnswerText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-medium text-xs hover:bg-stone-800 dark:hover:bg-white transition-colors"
                >
                  <Send size={13} />
                  <span>{language === 'en' ? 'Post Answer' : 'Kirim Jawaban'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Issues Listing */
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="space-y-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'Search questions by keyword or topic...'
                      : 'Cari pertanyaan berdasarkan topik atau kata kunci...'
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-colors"
                />
              </div>

              {/* Status & Tag Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-rose-600 text-white font-medium'
                        : 'bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {language === 'en' ? 'All' : 'Semua'} ({issues.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('solved')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'solved'
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {language === 'en' ? 'Solved' : 'Terjawab'}
                  </button>
                  <button
                    onClick={() => setStatusFilter('open')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      statusFilter === 'open'
                        ? 'bg-amber-600 text-white font-medium'
                        : 'bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {language === 'en' ? 'Open' : 'Belum Terjawab'}
                  </button>
                </div>

                {allTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-stone-400 dark:text-zinc-500">Tag:</span>
                    {selectedTag && (
                      <button
                        onClick={() => setSelectedTag('')}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1"
                      >
                        #{selectedTag} <X size={10} />
                      </button>
                    )}
                    {allTags.slice(0, 5).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                        className={`px-2 py-0.5 rounded ${
                          selectedTag === tag
                            ? 'bg-rose-600 text-white'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredIssues.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedIssueId(item.id)}
                  className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/30 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Stats pills */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      <div className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 text-center min-w-[50px]">
                        <span className="font-mono text-xs font-bold text-stone-900 dark:text-zinc-100">
                          {item.votes}
                        </span>
                        <span className="block text-[9px] font-mono text-stone-500 dark:text-zinc-400 uppercase">
                          votes
                        </span>
                      </div>
                      <div
                        className={`px-2.5 py-1 rounded-lg text-center min-w-[50px] border ${
                          item.status === 'solved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-stone-100 dark:bg-zinc-800/60 border-transparent text-stone-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="font-mono text-xs font-bold">
                          {item.answersCount}
                        </span>
                        <span className="block text-[9px] font-mono uppercase">
                          ans
                        </span>
                      </div>
                    </div>

                    {/* Question summary */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
                          {item.category}
                        </span>
                        {item.status === 'solved' && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>Solved</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 text-xs font-mono text-stone-400 dark:text-zinc-500">
                    <span>{item.authorName}</span>
                  </div>
                </div>
              ))}

              {filteredIssues.length === 0 && (
                <div className="py-16 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl">
                  <HelpCircle size={32} className="mx-auto text-stone-400 mb-3" />
                  <p className="text-stone-600 dark:text-zinc-400 text-sm">
                    {language === 'en'
                      ? 'No questions matched your search.'
                      : 'Tidak ada pertanyaan yang sesuai.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSelectedTag('');
                    }}
                    className="mt-3 text-xs font-mono text-rose-600 dark:text-rose-400 underline"
                  >
                    {language === 'en' ? 'Reset Filters' : 'Reset Filter'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Ask a Question */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'Ask a Technical Question' : 'Ajukan Pertanyaan Teknis'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-stone-600 dark:text-zinc-400 mb-1">
                    {language === 'en' ? 'Your Name / Handle' : 'Nama Anda'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe / @dev"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-600 dark:text-zinc-400 mb-1">
                    {language === 'en' ? 'Question Title' : 'Judul Pertanyaan'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      language === 'en'
                        ? 'e.g. How to prevent memory leak in Web Audio oscillators?'
                        : 'Contoh: Bagaimana mencegah memory leak pada oscillator Web Audio?'
                    }
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-stone-600 dark:text-zinc-400 mb-1">
                      {language === 'en' ? 'Category' : 'Kategori'}
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    >
                      <option value="General">General / Umum</option>
                      <option value="Artificial Intelligence">AI & Machine Learning</option>
                      <option value="Backend & Database">Backend & Database</option>
                      <option value="Music Theory & Audio">Music Theory & Web Audio</option>
                      <option value="Architecture">System Architecture</option>
                      <option value="Security">Security & Biometrics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-600 dark:text-zinc-400 mb-1">
                      {language === 'en' ? 'Tags (comma separated)' : 'Tag (pisahkan koma)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next.js, Redis, Concurrency"
                      value={newTags}
                      onChange={e => setNewTags(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-600 dark:text-zinc-400 mb-1">
                    {language === 'en' ? 'Problem Description' : 'Penjelasan Masalah'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      language === 'en'
                        ? 'Describe what you are trying to achieve, what happens, and what errors you receive...'
                        : 'Jelaskan apa yang ingin dicapai, kendala yang dialami, serta konteks masalah...'
                    }
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-xl text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
                  >
                    {language === 'en' ? 'Cancel' : 'Batal'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {language === 'en' ? 'Publish Question' : 'Terbitkan Pertanyaan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
};
