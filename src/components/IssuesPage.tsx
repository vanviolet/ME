import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { CommunityIssue, IssueAnswer } from '../types';
import { initialIssuesData } from '../data/articlesData';
import {
  fetchQuestionsFromFirestore,
  createQuestionInFirestore,
  addAnswerInFirestore,
  toggleQuestionVoteInFirestore,
  toggleAnswerVoteInFirestore,
  acceptAnswerInFirestore,
} from '../services/firestoreService';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Plus,
  Search,
  ArrowLeft,
  Send,
  User,
  Sparkles,
  X,
  ShieldCheck,
  Check,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react';
import { Seo } from './Seo';
import { EmojiPicker } from './EmojiPicker';

const STORAGE_KEY = 'muchamad_irvan_issues_store';
const ITEMS_PER_PAGE = 6;

export const IssuesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { language } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

  const [issues, setIssues] = useState<CommunityIssue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const questionsListRef = useRef<HTMLDivElement>(null);

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
  const answerInputRef = useRef<HTMLTextAreaElement>(null);

  // Persistent User ID for 1-vote-per-account
  const currentUserId = useMemo(() => {
    if (user?.uid) return user.uid;
    let anon = localStorage.getItem('user_reaction_uid');
    if (!anon) {
      anon = 'guest_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('user_reaction_uid', anon);
    }
    return anon;
  }, [user?.uid]);

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
      if (data && data.length >= 0) {
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
    return Array.from(new Set(issues.flatMap(i => i.tags || []))).sort();
  }, [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        (issue.tags || []).some(t => t.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'solved' && issue.status === 'solved') ||
        (statusFilter === 'open' && issue.status === 'open');

      const matchesTag = selectedTag === '' || (issue.tags || []).includes(selectedTag);

      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [issues, searchQuery, statusFilter, selectedTag]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedTag]);

  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIssues.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIssues, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (questionsListRef.current) {
      questionsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selectedIssue = useMemo(() => {
    return issues.find(i => i.id === selectedIssueId);
  }, [issues, selectedIssueId]);

  // 1 Vote per account for Questions
  const handleVoteIssue = async (issueId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // Optimistic local update
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          const votedBy = Array.isArray(item.votedBy) ? [...item.votedBy] : [];
          const alreadyVoted = votedBy.includes(currentUserId);
          const newVotedBy = alreadyVoted
            ? votedBy.filter(id => id !== currentUserId)
            : [...votedBy, currentUserId];
          const newVotes = alreadyVoted
            ? Math.max(0, (item.votes || 1) - 1)
            : (item.votes || 0) + 1;
          return {
            ...item,
            votes: newVotes,
            votedBy: newVotedBy,
          };
        }
        return item;
      })
    );

    try {
      const res = await toggleQuestionVoteInFirestore(issueId, currentUserId);
      setIssues(prev =>
        prev.map(item => {
          if (item.id === issueId) {
            const votedBy = Array.isArray(item.votedBy) ? [...item.votedBy] : [];
            const newVotedBy = res.hasVoted
              ? Array.from(new Set([...votedBy, currentUserId]))
              : votedBy.filter(id => id !== currentUserId);
            return {
              ...item,
              votes: res.votes,
              votedBy: newVotedBy,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.warn('Voting error:', err);
    }
  };

  // 1 Vote per account for Answers
  const handleVoteAnswer = async (issueId: string, answerId: string) => {
    // Optimistic local update
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId && item.answers) {
          const updatedAnswers = item.answers.map(ans => {
            if (ans.id === answerId) {
              const votedBy = Array.isArray(ans.votedBy) ? [...ans.votedBy] : [];
              const alreadyVoted = votedBy.includes(currentUserId);
              const newVotedBy = alreadyVoted
                ? votedBy.filter(id => id !== currentUserId)
                : [...votedBy, currentUserId];
              const newVotes = alreadyVoted
                ? Math.max(0, (ans.votes || 1) - 1)
                : (ans.votes || 0) + 1;
              return {
                ...ans,
                votes: newVotes,
                votedBy: newVotedBy,
              };
            }
            return ans;
          });
          return { ...item, answers: updatedAnswers };
        }
        return item;
      })
    );

    try {
      const res = await toggleAnswerVoteInFirestore(issueId, answerId, currentUserId);
      if (res.answers && res.answers.length > 0) {
        setIssues(prev =>
          prev.map(item => (item.id === issueId ? { ...item, answers: res.answers } : item))
        );
      }
    } catch (err) {
      console.warn('Answer voting error:', err);
    }
  };

  // Only Question Author or Admin can mark as accepted solution
  const isCurrentQuestionAuthor = useMemo(() => {
    if (!selectedIssue) return false;
    if (isAdmin) return true;
    if (user?.uid && selectedIssue.authorId && user.uid === selectedIssue.authorId) return true;
    if (user?.email && selectedIssue.authorEmail && user.email.toLowerCase() === selectedIssue.authorEmail.toLowerCase()) return true;
    return false;
  }, [selectedIssue, user, isAdmin]);

  const handleMarkAccepted = async (issueId: string, answerId: string) => {
    if (!isCurrentQuestionAuthor) {
      alert(
        language === 'en'
          ? 'Only the author of this question can mark an answer as the accepted solution.'
          : 'Hanya pembuat pertanyaan yang dapat menandai jawaban sebagai solusi.'
      );
      return;
    }

    const isCurrentlyAccepted = selectedIssue?.solvedAnswerId === answerId;
    const newStatus: 'open' | 'solved' = isCurrentlyAccepted ? 'open' : 'solved';
    const newSolvedId = isCurrentlyAccepted ? undefined : answerId;

    // Optimistic UI update
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          return {
            ...item,
            status: newStatus,
            solvedAnswerId: newSolvedId,
            answers: (item.answers || []).map(ans => ({
              ...ans,
              isAccepted: isCurrentlyAccepted ? false : ans.id === answerId,
            })),
          };
        }
        return item;
      })
    );

    try {
      const res = await acceptAnswerInFirestore(
        issueId,
        answerId,
        user?.uid,
        user?.email,
        isAdmin
      );
      if (!res.success && res.message) {
        alert(res.message);
        loadFirestoreQuestions();
      }
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
          authorId: user?.uid || currentUserId,
          votes: 1,
          votedBy: [currentUserId],
          answersCount: 0,
          status: 'open',
          answers: [],
        },
        user?.email || undefined,
        user?.uid || currentUserId
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
      authorId: user?.uid || currentUserId,
      content: newAnswerText.trim(),
      createdAt: new Date().toISOString(),
      votes: 0,
      votedBy: [],
      isAccepted: false,
    };

    // Optimistic UI update
    setIssues(prev =>
      prev.map(item => {
        if (item.id === selectedIssueId) {
          const currentAnswers = item.answers || [];
          return {
            ...item,
            answersCount: (item.answersCount || 0) + 1,
            answers: [...currentAnswers, newAnswer],
          };
        }
        return item;
      })
    );

    try {
      const saved = await addAnswerInFirestore(selectedIssueId, newAnswer);
      if (saved && saved.id) {
        setIssues(prev =>
          prev.map(item => {
            if (item.id === selectedIssueId) {
              const currentAnswers = item.answers || [];
              return {
                ...item,
                answers: currentAnswers.map(ans => (ans.id === newAnswer.id ? saved : ans)),
              };
            }
            return item;
          })
        );
      }
      setNewAnswerText('');
      setAnswerAuthorName('');
    } catch (err: any) {
      console.warn('Answer saved locally:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleInsertEmojiAnswer = (emoji: string) => {
    setNewAnswerText(prev => prev + emoji);
    answerInputRef.current?.focus();
  };

  const handleInsertEmojiQuestion = (emoji: string) => {
    setNewDescription(prev => prev + emoji);
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
              <span className="text-xs uppercase tracking-widest text-rose-500 font-semibold">
                {language === 'en' ? 'Community & Discussions' : 'Komunitas & Tanya Jawab'}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-bold">
                <Sparkles size={11} />
                <span>Q&A Stack Overflow Style</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Questions & Issues' : 'Tanya & Diskusi Teknis'}
            </h1>
            <p className="text-sm text-stone-600 dark:text-zinc-400 mt-2 max-w-xl">
              {language === 'en'
                ? 'Ask questions about system design, AI algorithms, database concurrency, and web engineering. Open for community answers.'
                : 'Ajukan pertanyaan tentang arsitektur sistem, algoritma AI, konkurensi database, dan rekayasa web. Dibuka untuk diskusi komunitas.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAskModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs shrink-0"
            >
              <Plus size={16} />
              <span>{language === 'en' ? 'Ask a Question' : 'Ajukan Pertanyaan'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* User Auth Banner */}
        <div className="mb-8 p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 text-xs text-stone-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <p>
              {language === 'en'
                ? `1-vote per account enabled. Only the question author can mark answers as accepted solution.`
                : `Sistem 1 vote per akun aktif. Hanya pembuat pertanyaan yang berhak menandai jawaban sebagai solusi.`}
            </p>
          </div>

          {!user && (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-[11px] font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-xs"
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
              className="inline-flex items-center gap-2 text-xs text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              <span>{language === 'en' ? 'Back to All Questions' : 'Kembali ke Semua Pertanyaan'}</span>
            </button>

            {/* Question Details Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-xs">
              <div className="flex items-start gap-4">
                {/* Voting Column (1 Vote per Account) */}
                {(() => {
                  const votedBy = Array.isArray(selectedIssue.votedBy) ? selectedIssue.votedBy : [];
                  const userHasVoted = votedBy.includes(currentUserId);
                  const votesCount = typeof selectedIssue.votes === 'number' ? selectedIssue.votes : votedBy.length;

                  return (
                    <div className="flex flex-col items-center gap-1 shrink-0 bg-stone-100 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-stone-200 dark:border-zinc-700">
                      <button
                        type="button"
                        onClick={(e) => handleVoteIssue(selectedIssue.id, e)}
                        className={`p-2 rounded-xl transition-all ${
                          userHasVoted
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold scale-110'
                            : 'hover:bg-rose-500/10 text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400'
                        }`}
                        title={userHasVoted ? 'Batalkan Vote' : 'Vote Pertanyaan ini (1x per akun)'}
                      >
                        <ThumbsUp size={18} className={userHasVoted ? 'fill-rose-500 text-rose-500' : ''} />
                      </button>
                      <span className="text-base font-bold text-stone-900 dark:text-zinc-100">
                        {votesCount}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400 uppercase font-semibold">
                        votes
                      </span>
                    </div>
                  );
                })()}

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-semibold border ${
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
                    <span className="text-xs text-stone-400 dark:text-zinc-500">•</span>
                    <span className="text-xs text-stone-500 dark:text-zinc-400">
                      {selectedIssue.category}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-reading-sans text-stone-900 dark:text-zinc-100 leading-snug">
                    {selectedIssue.title}
                  </h2>

                  <p className="text-stone-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-reading-sans">
                    {selectedIssue.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-zinc-800 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedIssue.tags || []).map(t => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700"
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
                      <span className="font-semibold">{selectedIssue.authorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers / Comments List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                  <MessageSquare size={18} className="text-rose-500" />
                  <span>
                    {selectedIssue.answers?.length || 0}{' '}
                    {language === 'en' ? 'Answers & Solutions' : 'Jawaban & Diskusi Solusi'}
                  </span>
                </h3>

                {isCurrentQuestionAuthor && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold">
                    {language === 'en' ? 'You are the Author (Can mark solution)' : 'Anda Pembuat Pertanyaan (Bisa tandai solusi)'}
                  </span>
                )}
              </div>

              {selectedIssue.answers && selectedIssue.answers.length > 0 ? (
                selectedIssue.answers.map(ans => {
                  const ansVotedBy = Array.isArray(ans.votedBy) ? ans.votedBy : [];
                  const userHasVotedAns = ansVotedBy.includes(currentUserId);
                  const ansVotes = typeof ans.votes === 'number' ? ans.votes : ansVotedBy.length;
                  const isAnswerByAuthor = ans.authorId === selectedIssue.authorId || (ans.authorEmail && ans.authorEmail === selectedIssue.authorEmail);

                  return (
                    <div
                      key={ans.id}
                      className={`p-6 rounded-2xl border transition-all ${
                        ans.isAccepted
                          ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Vote Answer Column (1 Vote per Account) */}
                        <div className="flex flex-col items-center gap-1 shrink-0 bg-stone-100 dark:bg-zinc-800/80 p-2 rounded-xl border border-stone-200 dark:border-zinc-700">
                          <button
                            type="button"
                            onClick={() => handleVoteAnswer(selectedIssue.id, ans.id)}
                            className={`p-1.5 rounded-lg transition-all ${
                              userHasVotedAns
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold scale-110'
                                : 'hover:bg-rose-500/10 text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400'
                            }`}
                            title={userHasVotedAns ? 'Batalkan Vote' : 'Vote Jawaban ini (1x per akun)'}
                          >
                            <ThumbsUp size={15} className={userHasVotedAns ? 'fill-rose-500 text-rose-500' : ''} />
                          </button>
                          <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                            {ansVotes}
                          </span>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {ans.authorAvatar ? (
                                <img src={ans.authorAvatar} alt="" className="w-6 h-6 rounded-full" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center text-[10px] font-bold">
                                  {ans.authorName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                                {ans.authorName}
                              </span>

                              {isAnswerByAuthor && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                                  Question Author
                                </span>
                              )}

                              {ans.isAccepted && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                  <CheckCircle2 size={12} />
                                  <span>{language === 'en' ? 'Accepted Solution' : 'Solusi Terpilih'}</span>
                                </span>
                              )}
                            </div>

                            {/* Solution Button ONLY for Question Author or Admin */}
                            {isCurrentQuestionAuthor && (
                              <button
                                type="button"
                                onClick={() => handleMarkAccepted(selectedIssue.id, ans.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shadow-xs ${
                                  ans.isAccepted
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-stone-100 dark:bg-zinc-800 hover:bg-emerald-500/10 text-stone-700 dark:text-zinc-300 hover:text-emerald-600 border border-stone-200 dark:border-zinc-700'
                                }`}
                                title={
                                  ans.isAccepted
                                    ? 'Klik untuk membatalkan tanda solusi'
                                    : 'Tandai jawaban ini sebagai solusi resmi pertanyaan Anda'
                                }
                              >
                                <Check size={13} />
                                <span>
                                  {ans.isAccepted
                                    ? (language === 'en' ? 'Solution Marked' : 'Solusi Terpilih (Batalkan)')
                                    : (language === 'en' ? 'Mark as Solution' : 'Tandai sebagai Solusi')}
                                </span>
                              </button>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-stone-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-reading-sans">
                            {ans.content}
                          </p>

                          <div className="text-[10px] text-stone-400">
                            {new Date(ans.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl bg-stone-50/50 dark:bg-zinc-900/30">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={18} />
                  </div>
                  <p className="text-xs text-stone-600 dark:text-zinc-400">
                    {language === 'en'
                      ? 'No answers yet. Be the first to share your perspective!'
                      : 'Belum ada jawaban. Jadilah yang pertama memberikan solusi atau tanggapan!'}
                  </p>
                </div>
              )}

              {/* Submit Answer Box */}
              <form
                onSubmit={handleAddAnswer}
                className="mt-6 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CornerDownRight size={15} className="text-rose-500" />
                    <span>{language === 'en' ? 'Write Your Answer / Comment' : 'Tuliskan Jawaban / Komentar Anda'}</span>
                  </h4>

                  {user && (
                    <span className="text-xs text-stone-500">
                      {user.displayName || user.email}
                    </span>
                  )}
                </div>

                {!user && (
                  <div>
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Your Name or Handle (optional)' : 'Nama Anda (opsional)'}
                      value={answerAuthorName}
                      onChange={e => setAnswerAuthorName(e.target.value)}
                      className="w-full sm:w-72 px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                )}

                <textarea
                  ref={answerInputRef}
                  rows={4}
                  placeholder={
                    language === 'en'
                      ? 'Provide detailed explanations, code snippets, or troubleshooting steps...'
                      : 'Tuliskan penjelasan teknis, langkah pemecahan masalah, atau kode yang disarankan...'
                  }
                  value={newAnswerText}
                  onChange={e => setNewAnswerText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 leading-relaxed"
                  required
                />

                {/* Quick Emoji Bar & Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <EmojiPicker onSelectEmoji={handleInsertEmojiAnswer} buttonLabel="Emoticon" />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAnswer || !newAnswerText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>
                      {submittingAnswer
                        ? (language === 'en' ? 'Posting...' : 'Mengirim...')
                        : (language === 'en' ? 'Post Answer' : 'Kirim Jawaban')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Issues Listing */
          <div className="space-y-6" ref={questionsListRef}>
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
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
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
              {paginatedIssues.map(issue => {
                const votedBy = Array.isArray(issue.votedBy) ? issue.votedBy : [];
                const userHasVoted = votedBy.includes(currentUserId);
                const votesCount = typeof issue.votes === 'number' ? issue.votes : votedBy.length;

                return (
                  <div
                    key={issue.id}
                    onClick={() => {
                      setSelectedIssueId(issue.id);
                      navigate(`/issues/${issue.id}`);
                    }}
                    className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/30 transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-start gap-4">
                      {/* Stat Badges */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleVoteIssue(issue.id, e)}
                          className={`flex flex-col items-center px-2 py-1 rounded-xl border transition-all ${
                            userHasVoted
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold'
                              : 'bg-stone-50 dark:bg-zinc-800/60 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:text-rose-600'
                          }`}
                          title="Vote Pertanyaan"
                        >
                          <ThumbsUp size={13} className={userHasVoted ? 'fill-rose-500 text-rose-500' : ''} />
                          <span className="text-xs font-bold mt-0.5">{votesCount}</span>
                          <span className="text-[9px] uppercase text-stone-400">votes</span>
                        </button>

                        <div
                          className={`flex flex-col items-center px-2 py-1 rounded-xl border text-[11px] ${
                            issue.status === 'solved'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold'
                              : 'bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700'
                          }`}
                        >
                          <span className="font-bold">{issue.answersCount || issue.answers?.length || 0}</span>
                          <span className="text-[9px] uppercase">ans</span>
                        </div>
                      </div>

                      {/* Question Summary */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
                            {issue.category}
                          </span>
                          <span className="text-stone-400 dark:text-zinc-600 text-xs">•</span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(issue.createdAt).toLocaleDateString(
                              language === 'en' ? 'en-US' : 'id-ID',
                              { month: 'short', day: 'numeric', year: 'numeric' },
                            )}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                          {issue.title}
                        </h3>

                        <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed font-reading-sans">
                          {issue.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800/80 text-[11px]">
                          <div className="flex flex-wrap gap-1.5">
                            {(issue.tags || []).map(t => (
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
                            <span className="font-semibold">{issue.authorName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredIssues.length === 0 && (
                <div className="py-16 px-4 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl text-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                    <HelpCircle size={22} />
                  </div>
                  <p className="text-stone-600 dark:text-zinc-400">
                    {language === 'en'
                      ? 'No questions posted yet. Be the first to ask!'
                      : 'Belum ada pertanyaan yang diajukan. Jadilah yang pertama bertanya!'}
                  </p>
                  <button
                    onClick={handleOpenAskModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
                  >
                    <Plus size={14} />
                    <span>{language === 'en' ? 'Ask a Question' : 'Buat Pertanyaan Pertama'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Q&A PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="text-stone-500 dark:text-zinc-400">
                  {language === 'en' ? 'Showing' : 'Menampilkan'}{' '}
                  <span className="font-bold text-stone-900 dark:text-zinc-100">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{' '}
                  -{' '}
                  <span className="font-bold text-stone-900 dark:text-zinc-100">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredIssues.length)}
                  </span>{' '}
                  {language === 'en' ? 'of' : 'dari'}{' '}
                  <span className="font-bold text-stone-900 dark:text-zinc-100">
                    {filteredIssues.length}
                  </span>{' '}
                  {language === 'en' ? 'questions' : 'pertanyaan'}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-stone-700 dark:text-zinc-300 hover:border-rose-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    <span>{language === 'en' ? 'Prev' : 'Sebelumnya'}</span>
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                          currentPage === page
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-stone-700 dark:text-zinc-300 hover:border-rose-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span>{language === 'en' ? 'Next' : 'Berikutnya'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Ask Question */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                    {language === 'en' ? 'Ask a Technical Question' : 'Ajukan Pertanyaan Teknis'}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
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

              <form onSubmit={handleCreateIssue} className="space-y-4 text-xs">
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
                    <div className="relative">
                      <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs cursor-pointer shadow-xs"
                      >
                        <option value="General">General</option>
                        <option value="AI & Math">AI & Math</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Database">Database</option>
                        <option value="Security">Security</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-stone-400 dark:text-zinc-500 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-700 dark:text-zinc-300 font-semibold">
                      {language === 'en' ? 'Description & Details *' : 'Deskripsi & Penjelasan Teknis *'}
                    </label>
                    <EmojiPicker onSelectEmoji={handleInsertEmojiQuestion} buttonLabel="Tambah Emoji" />
                  </div>
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

