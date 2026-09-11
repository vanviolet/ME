import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { fetchArticlesFromFirestore, updateArticleStatusInFirestore, fetchVanpediaTermsFromFirestore, updateVanpediaStatusInFirestore, seedAllToFirestore } from '../services/firestoreService';
import { Article, VanpediaTerm } from '../types';
import { ShieldCheck, CheckCircle2, XCircle, Clock, FileText, Compass, ExternalLink, AlertCircle, RefreshCw, UserCheck, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from './Seo';

export const AdminVerificationPage: React.FC = () => {
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();
  const { language, t } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'articles' | 'vanpedia'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [vanpediaTerms, setVanpediaTerms] = useState<VanpediaTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSeedFirestore = async () => {
    if (!confirm(language === 'en' ? 'Upload all initial Articles and Vanpedia terms to Firestore?' : 'Upload semua data awal Artikel & Vanpedia ke Firestore?')) return;
    setSeedLoading(true);
    try {
      const result = await seedAllToFirestore(user);
      setFeedbackMessage(
        language === 'en'
          ? `Successfully synced ${result.articlesInserted} articles & ${result.vanpediaInserted} Vanpedia terms to Firestore!`
          : `Berhasil mengunggah ${result.articlesInserted} artikel & ${result.vanpediaInserted} istilah Vanpedia ke Firestore!`
      );
      await loadData();
    } catch (e: any) {
      alert('Seeding error: ' + e.message);
    } finally {
      setSeedLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [artList, vanList] = await Promise.all([
        fetchArticlesFromFirestore(true),
        fetchVanpediaTermsFromFirestore(true)
      ]);
      setArticles(artList);
      setVanpediaTerms(vanList);
    } catch (e) {
      console.error('Error loading admin verification data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleApproveArticle = async (articleId: string) => {
    setActionLoading(articleId);
    try {
      await updateArticleStatusInFirestore(articleId, 'approved', adminEmail);
      setFeedbackMessage(language === 'en' ? 'Article successfully approved and published!' : 'Artikel berhasil disetujui dan dipublikasikan!');
      await loadData();
    } catch (err: any) {
      alert('Error approving article: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectArticle = async (articleId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to reject this article?' : 'Yakin ingin menolak artikel ini?')) return;
    setActionLoading(articleId);
    try {
      await updateArticleStatusInFirestore(articleId, 'rejected', adminEmail);
      setFeedbackMessage(language === 'en' ? 'Article rejected.' : 'Artikel ditolak.');
      await loadData();
    } catch (err: any) {
      alert('Error rejecting article: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveVanpedia = async (termId: string) => {
    setActionLoading(termId);
    try {
      await updateVanpediaStatusInFirestore(termId, 'approved', adminEmail);
      setFeedbackMessage(language === 'en' ? 'Term successfully approved and added to Vanpedia!' : 'Istilah berhasil disetujui dan ditambahkan ke Vanpedia!');
      await loadData();
    } catch (err: any) {
      alert('Error approving term: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVanpedia = async (termId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to reject this term?' : 'Yakin ingin menolak istilah ini?')) return;
    setActionLoading(termId);
    try {
      await updateVanpediaStatusInFirestore(termId, 'rejected', adminEmail);
      setFeedbackMessage(language === 'en' ? 'Term rejected.' : 'Istilah ditolak.');
      await loadData();
    } catch (err: any) {
      alert('Error rejecting term: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingArticles = articles.filter(a => a.status === 'pending');
  const approvedArticles = articles.filter(a => a.status === 'approved');
  const pendingTerms = vanpediaTerms.filter(t => t.status === 'pending');
  const approvedTerms = vanpediaTerms.filter(t => t.status === 'approved');

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Seo title="Admin Verification Center" description="Restricted verification dashboard for content moderation." />
        <div className="max-w-md w-full p-8 rounded-3xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Admin Verification Center' : 'Pusat Verifikasi Moderator'}
            </h1>
            <p className="mt-2 text-xs text-stone-500 dark:text-zinc-400">
              {language === 'en'
                ? `Restricted to administrator (${adminEmail}). Please log in with Google to review submissions.`
                : `Khusus administrator (${adminEmail}). Silakan masuk dengan Google untuk meninjau pengajuan artikel & kamus.`}
            </p>
          </div>

          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-mono text-xs font-semibold hover:bg-stone-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck size={16} />
              <span>{language === 'en' ? 'Sign in with Google' : 'Masuk dengan Google'}</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <p>
                {language === 'en'
                  ? `Signed in as ${user.email}. You need to be logged in as ${adminEmail} to access verification controls.`
                  : `Anda masuk sebagai ${user.email}. Hak verifikasi hanya diberikan kepada akun ${adminEmail}.`}
              </p>
            </div>
          )}

          <div className="pt-2">
            <Link to="/" className="text-xs font-mono text-rose-500 hover:underline">
              ← {language === 'en' ? 'Back to Home' : 'Kembali ke Beranda'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <Seo title="Admin Verification Portal" description="Review and approve submitted articles and Vanpedia terms." />

      {/* Header */}
      <div className="border-b border-stone-200 dark:border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck size={16} />
            <span>{language === 'en' ? 'Moderation Dashboard' : 'Dashboard Moderasi'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-stone-900 dark:text-zinc-100 mt-1">
            {language === 'en' ? 'Content Verification Hub' : 'Pusat Verifikasi Konten'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 font-mono">
            {language === 'en'
              ? `Logged in as Admin (${adminEmail}). Review pending contributions before they are published.`
              : `Masuk sebagai Admin (${adminEmail}). Tinjau kiriman sebelum tayang untuk publik.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSeedFirestore}
            disabled={seedLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold transition-colors shadow-xs"
            title="Upload data awal Artikel & Vanpedia ke Firestore"
          >
            <Database size={14} className={seedLoading ? 'animate-bounce' : ''} />
            <span>{seedLoading ? (language === 'en' ? 'Uploading...' : 'Mengunggah...') : (language === 'en' ? 'Sync All to Firestore' : 'Sync Semua Data ke Firestore')}</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{language === 'en' ? 'Refresh Submissions' : 'Muat Ulang Data'}</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-zinc-800 gap-6 text-xs font-mono">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 flex items-center gap-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'articles'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <FileText size={16} />
          <span>{language === 'en' ? 'Articles' : 'Artikel'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold">
            {pendingArticles.length} {language === 'en' ? 'pending' : 'menunggu'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vanpedia')}
          className={`pb-3 flex items-center gap-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'vanpedia'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Compass size={16} />
          <span>Vanpedia</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
            {pendingTerms.length} {language === 'en' ? 'pending' : 'menunggu'}
          </span>
        </button>
      </div>

      {/* Articles Moderation Tab */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-zinc-200">
              {language === 'en' ? 'Pending Articles Waiting for Verification' : 'Artikel Menunggu Verifikasi Anda'} ({pendingArticles.length})
            </h2>
          </div>

          {pendingArticles.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800 text-center text-xs text-stone-500 dark:text-zinc-400 font-mono">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p>{language === 'en' ? 'All article submissions are up to date! No pending approvals.' : 'Semua pengajuan artikel telah diverifikasi! Tidak ada antrean.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingArticles.map(article => (
                <div
                  key={article.id}
                  className="p-6 rounded-2xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Clock size={11} />
                          <span>PENDING</span>
                        </span>
                        <span className="text-xs font-mono text-stone-400 dark:text-zinc-500">{article.category}</span>
                        <span className="text-stone-300 dark:text-zinc-700">•</span>
                        <span className="text-xs font-mono text-stone-500">{article.date}</span>
                      </div>
                      <h3 className="text-lg font-bold font-mono text-stone-900 dark:text-zinc-100 mt-1">
                        {t(article.title)}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-zinc-400 mt-1 font-mono">
                        Author: <span className="font-semibold text-stone-800 dark:text-zinc-200">{article.author?.name || 'Unknown'}</span> ({article.authorEmail || 'No email'})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveArticle(article.id)}
                        disabled={actionLoading === article.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        <span>{language === 'en' ? 'Approve & Publish' : 'Setujui & Terbitkan'}</span>
                      </button>

                      <button
                        onClick={() => handleRejectArticle(article.id)}
                        disabled={actionLoading === article.id}
                        className="px-3.5 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-600 dark:text-rose-400 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        <span>{language === 'en' ? 'Reject' : 'Tolak'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-stone-200 dark:border-zinc-800">
                    {t(article.summary)}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                    <span>Slug: /{article.slug}</span>
                    <Link
                      to={`/articles/${article.slug}`}
                      className="text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <span>{language === 'en' ? 'Full Preview' : 'Pratinjau Lengkap'}</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Already Approved Articles List */}
          <div className="pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h3 className="text-xs font-mono font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
              {language === 'en' ? 'Live / Approved Articles' : 'Artikel Aktif / Disetujui'} ({approvedArticles.length})
            </h3>
            <div className="divide-y divide-stone-100 dark:divide-zinc-800/60">
              {approvedArticles.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="font-semibold text-stone-800 dark:text-zinc-200">{t(a.title)}</span>
                    <span className="text-stone-400 text-[10px]">({a.category})</span>
                  </div>
                  <Link to={`/articles/${a.slug}`} className="text-rose-500 hover:underline">
                    Lihat →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vanpedia Moderation Tab */}
      {activeTab === 'vanpedia' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-zinc-200">
              {language === 'en' ? 'Pending Vanpedia Terms' : 'Istilah Kamus Menunggu Verifikasi Anda'} ({pendingTerms.length})
            </h2>
          </div>

          {pendingTerms.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800 text-center text-xs text-stone-500 dark:text-zinc-400 font-mono">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p>{language === 'en' ? 'All Vanpedia terms are verified! No pending items.' : 'Semua istilah kamus sudah diverifikasi.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTerms.map(term => (
                <div
                  key={term.id}
                  className="p-6 rounded-2xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Clock size={11} />
                          <span>PENDING</span>
                        </span>
                        <span className="text-xs font-mono text-stone-400 dark:text-zinc-500">{term.category}</span>
                      </div>
                      <h3 className="text-lg font-bold font-mono text-stone-900 dark:text-zinc-100 mt-1">
                        {t(term.title)}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-zinc-400 mt-1 font-mono">
                        Submitted by: <span className="font-semibold text-stone-800 dark:text-zinc-200">{term.authorName || 'Contributor'}</span> ({term.authorEmail || 'No email'})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveVanpedia(term.id)}
                        disabled={actionLoading === term.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        <span>{language === 'en' ? 'Approve Term' : 'Setujui Istilah'}</span>
                      </button>

                      <button
                        onClick={() => handleRejectVanpedia(term.id)}
                        disabled={actionLoading === term.id}
                        className="px-3.5 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-600 dark:text-rose-400 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        <span>{language === 'en' ? 'Reject' : 'Tolak'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-stone-200 dark:border-zinc-800">
                    {t(term.definition)}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                    <span>Slug: [[{term.slug}]]</span>
                    <Link
                      to={`/vanpedia/${term.slug}`}
                      className="text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <span>{language === 'en' ? 'Preview Term' : 'Pratinjau Istilah'}</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Already Approved Vanpedia Terms List */}
          <div className="pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h3 className="text-xs font-mono font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
              {language === 'en' ? 'Live / Approved Terms' : 'Istilah Aktif di Vanpedia'} ({approvedTerms.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {approvedTerms.map(trm => (
                <div key={trm.id} className="p-3 rounded-xl border border-stone-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-zinc-200">{t(trm.title)}</span>
                    <span className="block text-[10px] text-stone-400">{trm.category}</span>
                  </div>
                  <Link to={`/vanpedia/${trm.slug}`} className="text-rose-500 hover:underline text-[11px]">
                    Buka →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
