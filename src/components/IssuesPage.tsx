import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { CommunityIssue, IssueAnswer } from '../types';
import { initialIssuesData } from '../data/articlesData';
import {
  fetchQuestionsFromFirestore,
  createQuestionInFirestore,
  addAnswerInFirestore,
  upvoteQuestionInFirestore,
  markAnswerAcceptedInFirestore,
} from '../services/firestoreService';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Plus,
  Search,
  Tag,
  ArrowLeft,
  Send,
  User,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  X,
  ShieldCheck,
  Check,
  LogIn,
} from 'lucide-react';
import { Seo } from './Seo';

const STORAGE_KEY = 'muchamad_irvan_issues_store';

export const IssuesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { language } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

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

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'solved'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(id || null);

  // New Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newTags, setNewTags] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Answer Input State
  const [newAnswerText, setNewAnswerText] = useState('');
  const [answerAuthorName, setAnswerAuthorName] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Sync selectedIssueId with route param :id
  useEffect(() => {
    if (id) {
      setSelectedIssueId(id);
    }
  }, [id]);

  // Load questions from Firestore
  const loadFirestoreQuestions = async () => {
    try {
      const data = await fetchQuestionsFromFirestore();
      if (data && data.length > 0) {
        setIssues(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Error fetching questions from Firestore:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFirestoreQuestions();
  }, []);

  // Save to localStorage as backup
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

  const handleVoteIssue = async (issueId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // Optimistic UI update
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          return { ...item, votes: item.votes + 1 };
        }
        return item;
      }),
    );
    try {
      await upvoteQuestionInFirestore(issueId);
    } catch (err) {
      console.warn('Voting saved locally only:', err);
    }
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

  const handleMarkAccepted = async (issueId: string, answerId: string) => {
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          return {
            ...item,
            status: 'solved',
            answers: (item.answers || []).map(ans => ({
              ...ans,
              isAccepted: ans.id === answerId,
            })),
          };
        }
        return item;
      }),
    );
    try {
      await markAnswerAcceptedInFirestore(issueId, answerId);
    } catch (e) {
      console.error('Error marking answer accepted:', e);
    }
  };

  const handleOpenAskModal = () => {
    if (user) {
      setAuthorName(user.displayName || user.email || '');
    }
    setIsModalOpen(true);
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setSubmitting(true);
    const parsedTags = newTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const effectiveAuthorName =
      authorName.trim() ||
      user?.displayName ||
      (language === 'en' ? 'Community Developer' : 'Developer Komunitas');

    try {
      const savedIssue = await createQuestionInFirestore(
        {
          title: newTitle.trim(),
          description: newDescription.trim(),
          category: newCategory,
          tags: parsedTags.length > 0 ? parsedTags : ['General'],
          authorName: effectiveAuthorName,
          authorEmail: user?.email || undefined,
          authorAvatar: user?.photoURL || undefined,
          authorId: user?.uid || undefined,
          votes: 1,
          answersCount: 0,
          status: 'open',
          answers: [],
        },
        user?.email || undefined,
        user?.uid || undefined
      );

      setIssues(prev => [savedIssue, ...prev]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewTags('');
      setAuthorName('');
      setSelectedIssueId(savedIssue.id);

      setFeedback(
        language === 'en'
          ? `Question published! Email notification dispatched to administrator (${adminEmail}).`
          : `Pertanyaan dipublikasikan! Notifikasi email otomatis telah dikirim ke admin (${adminEmail}).`
      );
    } catch (err: any) {
      alert('Error creating issue: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || !newAnswerText.trim()) return;

    setSubmittingAnswer(true);
    const effectiveAuthorName =
      answerAuthorName.trim() ||
      user?.displayName ||
      (language === 'en' ? 'Community Contributor' : 'Kontributor Komunitas');

    const newAnswer: IssueAnswer = {
      id: `ans-${Date.now()}`,
      authorName: effectiveAuthorName,
      authorEmail: user?.email || undefined,
      authorAvatar: user?.photoURL || undefined,
      authorId: user?.uid || undefined,
      content: newAnswerText.trim(),
      createdAt: new Date().toISOString(),
      votes: 0,
      isAccepted: false,
    };

    // Optimistic UI update
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

    try {
      await addAnswerInFirestore(selectedIssueId, newAnswer);
      setNewAnswerText('');
      setAnswerAuthorName('');
    } catch (err: any) {
      console.warn('Answer saved locally:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <>
      <Seo
        title={language === 'en' ? 'Community Q&A & Technical Issues | Muchamad Irvan' : 'Diskusi & Q&A Komunitas | Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Interactive technical Q&A, software architectural discussions, and developer issue troubleshooting.'
            : 'Forum tanya-jawab teknis, diskusi arsitektur perangkat lunak, dan pemecahan masalah ala Stack Overflow.'
        }
        url="https://vanviolet.my.id/issues"
        type="website"
        keywords="issues, forum, qna, stackoverflow, questions, muchamad irvan, community"
      />

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-stone-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
                {language === 'en' ? 'Community & Discussions' : 'Komunitas & Tanya Jawab'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-bold">
                <Sparkles size={11} />
                <span>Q&A Stack Overflow Style</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Questions & Issues' : 'Tanya & Diskusi Teknis'}
            </h1>
            <p className="text-sm text-stone-600 dark:text-zinc-400 mt-2 max-w-xl font-mono">
              {language === 'en'
                ? 'Ask questions about system design, AI algorithms, database concurrency, and music theory. Answered by developers & open for community feedback.'
                : 'Ajukan pertanyaan tentang arsitektur sistem, algoritma AI, konkurensi database, dan teori musik. Dibuka untuk diskusi komunitas.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAskModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm transition-all shadow-xs shrink-0 font-mono font-semibold"
            >
              <Plus size={16} />
              <span>{language === 'en' ? 'Ask a Question' : 'Ajukan Pertanyaan'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* User Auth Banner */}
        <div className="mb-8 p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 text-xs text-stone-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <p>
              {language === 'en'
                ? `Firebase Firestore sync active. Every question automatically notifies ${adminEmail} via email.`
                : `Sinkronisasi Firebase Firestore aktif. Setiap pertanyaan otomatis mengirimkan notifikasi email ke ${adminEmail}.`}
            </p>
          </div>

          {!user && (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-[11px] font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              <LogIn size={13} />
              <span>{language === 'en' ? 'Sign In with Google' : 'Masuk Akun Google'}</span>
            </button>
          )}
        </div>

        {/* If an issue is selected, show detail view */}
        {selectedIssue ? (
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedIssueId(null);
                navigate('/issues');
              }}
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

                  <h2 className="text-xl sm:text-2xl font-bold font-reading-sans text-stone-900 dark:text-zinc-100 leading-snug">
                    {selectedIssue.title}
                  </h2>

                  <p className="text-stone-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-reading-sans">
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
                    <div className="text-stone-500 dark:text-zinc-400 flex items-center gap-2">
                      {selectedIssue.authorAvatar ? (
                        <img src={selectedIssue.authorAvatar} alt="" className="w-5 h-5 rounded-full" />
                      ) : (
                        <User size={13} />
                      )}
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
                            {ans.authorAvatar && (
                              <img src={ans.authorAvatar} alt="" className="w-5 h-5 rounded-full" />
                            )}
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

                          {(isAdmin || user?.uid === selectedIssue.authorId) && !ans.isAccepted && (
                            <button
                              onClick={() => handleMarkAccepted(selectedIssue.id, ans.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-emerald-600 border border-stone-200 text-[11px] font-mono transition-colors"
                            >
                              <Check size={12} />
                              <span>{language === 'en' ? 'Accept Solution' : 'Tandai Solusi'}</span>
                            </button>
                          )}
                        </div>

                        <p className="text-sm sm:text-base text-stone-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-reading-sans">
                          {ans.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs text-stone-500 dark:text-zinc-400 font-mono">
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
                <h4 className="text-sm font-semibold text-stone-900 dark:text-zinc-100 font-mono">
                  {language === 'en' ? 'Your Answer' : 'Jawaban Anda'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Your name / handle' : 'Nama Anda'}
                    value={answerAuthorName || (user?.displayName || '')}
                    onChange={e => setAnswerAuthorName(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-mono"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-mono"
                  required
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-stone-400">
                    {user ? `Posting as ${user.displayName || user.email}` : (language === 'en' ? 'Posting as guest contributor' : 'Posting sebagai kontributor')}
                  </span>
                  <button
                    type="submit"
                    disabled={submittingAnswer}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-medium text-xs hover:bg-stone-800 dark:hover:bg-white transition-colors disabled:opacity-50 font-mono"
                  >
                    <Send size={13} />
                    <span>{submittingAnswer ? (language === 'en' ? 'Posting...' : 'Mengirim...') : (language === 'en' ? 'Post Answer' : 'Kirim Jawaban')}</span>
                  </button>
                </div>
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-colors font-mono"
                />
              </div>

              {/* Status & Tag Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 dark:text-zinc-400">Status:</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {language === 'en' ? 'All' : 'Semua'} ({issues.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('open')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      statusFilter === 'open'
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {language === 'en' ? 'Open' : 'Belum Selesai'} (
                    {issues.filter(i => i.status === 'open').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('solved')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      statusFilter === 'solved'
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                    }`}
                  >
                    {language === 'en' ? 'Solved' : 'Terjawab'} (
                    {issues.filter(i => i.status === 'solved').length})
                  </button>
                </div>

                {allTags.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                    <span className="text-stone-500 dark:text-zinc-400 shrink-0">Tags:</span>
                    {selectedTag && (
                      <button
                        onClick={() => setSelectedTag('')}
                        className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/30 text-[11px]"
                      >
                        ✕ Clear ({selectedTag})
                      </button>
                    )}
                    {allTags.slice(0, 6).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          selectedTag === tag
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400'
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
              {filteredIssues.map(issue => (
                <div
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssueId(issue.id);
                    navigate(`/issues/${issue.id}`);
                  }}
                  className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    {/* Stat Badges */}
                    <div className="flex sm:flex-col items-center gap-3 shrink-0 text-center font-mono">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">
                          {issue.votes}
                        </span>
                        <span className="text-[10px] text-stone-400 uppercase">votes</span>
                      </div>

                      <div
                        className={`flex flex-col items-center px-2 py-1 rounded-lg border text-[11px] ${
                          issue.status === 'solved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700'
                        }`}
                      >
                        <span className="font-bold">{issue.answersCount}</span>
                        <span className="text-[9px] uppercase">ans</span>
                      </div>
                    </div>

                    {/* Question Summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
                          {issue.category}
                        </span>
                        <span className="text-stone-400 dark:text-zinc-600 text-xs">•</span>
                        <span className="text-[11px] font-mono text-stone-400">
                          {new Date(issue.createdAt).toLocaleDateString(
                            language === 'en' ? 'en-US' : 'id-ID',
                            { month: 'short', day: 'numeric', year: 'numeric' },
                          )}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                        {issue.title}
                      </h3>

                      <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800/80 text-[11px] font-mono">
                        <div className="flex flex-wrap gap-1.5">
                          {issue.tags.map(t => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 text-[10px]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        <div className="text-stone-400 flex items-center gap-1.5">
                          {issue.authorAvatar ? (
                            <img src={issue.authorAvatar} alt="" className="w-4 h-4 rounded-full" />
                          ) : (
                            <User size={12} />
                          )}
                          <span>{issue.authorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredIssues.length === 0 && (
                <div className="py-16 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl font-mono text-xs">
                  <p className="text-stone-600 dark:text-zinc-400 mb-3">
                    {language === 'en'
                      ? 'No questions found matching your criteria.'
                      : 'Tidak ditemukan pertanyaan yang cocok dengan pencarian Anda.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSelectedTag('');
                    }}
                    className="text-xs font-mono text-rose-600 dark:text-rose-400 underline"
                  >
                    {language === 'en' ? 'Reset Filters' : 'Reset Filter'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Ask Question */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold font-mono text-stone-900 dark:text-zinc-100">
                    {language === 'en' ? 'Ask a Technical Question' : 'Ajukan Pertanyaan Teknis'}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 font-mono mt-0.5">
                    {language === 'en'
                      ? `Questions are published immediately and notify ${adminEmail}.`
                      : `Pertanyaan langsung dipublikasikan dan mengirimkan email ke ${adminEmail}.`}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateIssue} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Title *' : 'Judul Pertanyaan *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'e.g. How to prevent race condition in distributed PostgreSQL lock?'
                        : 'Contoh: Bagaimana mencegah race condition pada PostgreSQL advisory lock?'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                      {language === 'en' ? 'Category' : 'Kategori'}
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                    >
                      <option value="AI & Math">AI & Math</option>
                      <option value="Theory Music">Theory Music</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Database">Database</option>
                      <option value="Security">Security</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                      {language === 'en' ? 'Tags (comma separated)' : 'Tags (pisahkan dengan koma)'}
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={e => setNewTags(e.target.value)}
                      placeholder="database, postgresql, lock"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Your Name or Handle' : 'Nama atau Identitas Anda'}
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder={user?.displayName || (language === 'en' ? 'e.g. Alex Tech' : 'Contoh: Budi Coder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Description & Details *' : 'Deskripsi & Penjelasan Teknis *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'Describe what you are trying to achieve, code behavior, and specific questions...'
                        : 'Jelaskan masalah, konteks kode, dan pertanyaan spesifik yang ingin dipecahkan...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'Batal'}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{submitting ? (language === 'en' ? 'Publishing...' : 'Menerbitkan...') : (language === 'en' ? 'Submit Question' : 'Terbitkan Pertanyaan')}</span>
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
