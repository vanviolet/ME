import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { articlesData, initialCommentsData } from '../data/articlesData';
import { Article, ArticleComment } from '../types';
import {
  fetchArticleBySlugFromFirestore,
  fetchCommentsForArticle,
  addArticleCommentInFirestore,
  updateArticleStatusInFirestore,
} from '../services/firestoreService';
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  Check,
  Download,
  Menu,
  ExternalLink,
  FileText,
  Bot,
  Code,
  Heart,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  LogIn,
  Type,
} from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import { Seo } from './Seo';
import { marked } from 'marked';
import { exportToPdf } from '../utils/pdfExport';
import { buildAiDiscussionLinks } from '../utils/aiPrompts';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language, t } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

  const [copied, setCopied] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reading experience preferences
  const [fontMode, setFontMode] = useState<'serif' | 'sans'>(() => {
    return (localStorage.getItem('article_reader_font') as 'serif' | 'sans') || 'serif';
  });
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>(() => {
    return (localStorage.getItem('article_reader_size') as 'sm' | 'base' | 'lg') || 'base';
  });

  const handleFontModeChange = (mode: 'serif' | 'sans') => {
    setFontMode(mode);
    localStorage.setItem('article_reader_font', mode);
  };

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg') => {
    setFontSize(size);
    localStorage.setItem('article_reader_size', size);
  };

  // Article data (with dynamic Firestore fallback to static articlesData)
  const [post, setPost] = useState<Article | null>(() => {
    return articlesData.find(a => a.slug === slug) || null;
  });
  const [loadingArticle, setLoadingArticle] = useState(true);

  // Likes state persisted in localStorage
  const [likes, setLikes] = useState<number>(() => {
    if (!slug) return 12;
    const saved = localStorage.getItem(`article_likes_${slug}`);
    return saved ? parseInt(saved, 10) : 12;
  });
  const [hasLiked, setHasLiked] = useState(false);

  // Comments state
  const [comments, setComments] = useState<ArticleComment[]>(() => {
    if (!slug) return [];
    const saved = localStorage.getItem(`article_comments_${slug}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local comments', e);
      }
    }
    return initialCommentsData.filter(c => c.articleSlug === slug);
  });

  // New comment input form
  const [commenterName, setCommenterName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Load article and comments from Firestore
  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      try {
        const [firestorePost, firestoreComments] = await Promise.all([
          fetchArticleBySlugFromFirestore(slug),
          fetchCommentsForArticle(slug),
        ]);

        if (firestorePost) {
          setPost(firestorePost);
        }

        if (firestoreComments && firestoreComments.length > 0) {
          setComments(firestoreComments);
          localStorage.setItem(`article_comments_${slug}`, JSON.stringify(firestoreComments));
        }
      } catch (err) {
        console.error('Error loading article from Firestore:', err);
      } finally {
        setLoadingArticle(false);
      }
    };
    loadData();
  }, [slug]);

  // Persist comments when updated
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`article_comments_${slug}`, JSON.stringify(comments));
    }
  }, [comments, slug]);

  const handleApproveArticle = async () => {
    if (!post) return;
    setActionLoading(true);
    try {
      await updateArticleStatusInFirestore(post.id, 'approved', adminEmail);
      setPost(prev => (prev ? { ...prev, status: 'approved' } : null));
      setFeedback(
        language === 'en'
          ? 'Article approved and published!'
          : 'Artikel berhasil diverifikasi dan dipublikasikan!'
      );
    } catch (err: any) {
      alert('Error approving article: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!post) {
    return (
      <section className="py-24 px-6 sm:px-8 max-w-4xl mx-auto min-h-screen">
        <Seo
          title={language === 'en' ? 'Article Not Found | Muchamad Irvan' : 'Artikel Tidak Ditemukan | Muchamad Irvan'}
          description={language === 'en' ? 'The requested article could not be found.' : 'Artikel yang diminta tidak ditemukan.'}
          type="website"
        />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mb-4">
            {language === 'en' ? 'Article Not Found' : 'Artikel Tidak Ditemukan'}
          </h2>
          <p className="text-stone-600 dark:text-zinc-400 mb-6">
            {language === 'en'
              ? 'The article you are looking for does not exist.'
              : 'Artikel yang Anda cari tidak tersedia.'}
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {language === 'en' ? 'Back to Articles' : 'Kembali ke Artikel'}
          </Link>
        </div>
      </section>
    );
  }

  // Raw markdown content and intelligent AI discussion prompts
  const rawMarkdown = (post.content[language] || post.content.en) as string;
  const articleUrl = `https://vanviolet.my.id/articles/${post.slug}`;
  
  const aiLinks = useMemo(() => {
    return buildAiDiscussionLinks({
      title: t(post.title),
      summary: t(post.summary),
      category: post.category,
      language,
      isVanpedia: false,
      url: articleUrl,
    });
  }, [post, language, t, articleUrl]);

  const handleCopyAiPrompt = () => {
    navigator.clipboard.writeText(aiLinks.chatGptPrompt);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2500);
  };

  // Related articles
  const relatedArticles = (post.relatedArticleSlugs || [])
    .map(s => articlesData.find(a => a.slug === s))
    .filter(Boolean) as typeof articlesData;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!hasLiked && slug) {
      const nextLikes = likes + 1;
      setLikes(nextLikes);
      setHasLiked(true);
      localStorage.setItem(`article_likes_${slug}`, nextLikes.toString());
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;

    setSubmittingComment(true);
    const authorDisplayName =
      commenterName.trim() ||
      user?.displayName ||
      (language === 'en' ? 'Guest Reader' : 'Pembaca Tamu');

    const newComment: ArticleComment = {
      id: `comment-${Date.now()}`,
      articleSlug: post.slug,
      authorName: authorDisplayName,
      authorAvatar: user?.photoURL || '',
      authorEmail: user?.email || undefined,
      authorId: user?.uid || undefined,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText('');
    setCommenterName('');

    try {
      await addArticleCommentInFirestore(newComment);
    } catch (err) {
      console.warn('Comment saved locally only:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c)),
    );
  };

  const handleViewMarkdown = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleOpenIn = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const markdownContent = t(post.content);
      const htmlContent = marked.parse(markdownContent, { gfm: true, breaks: true, async: false }) as string;
      await exportToPdf({
        title: t(post.title),
        category: post.category,
        date: post.date,
        readTime: post.readTime,
        authorName: post.author?.name || 'Muchamad Irvan',
        summary: t(post.summary),
        htmlContent,
        filename: `${post.slug}.pdf`,
        sourceUrl: articleUrl,
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Seo
        title={`${t(post.title)} | Muchamad Irvan`}
        description={t(post.summary)}
        url={articleUrl}
        type="article"
        image="https://vanviolet.my.id/og-image.png"
        article={{
          publishedTime: post.date,
          author: 'Muchamad Irvan',
          tags: post.tags,
        }}
      />

      <article className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
        {/* Pending Verification Banner */}
        {post.status === 'pending' && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Clock3 size={16} className="text-amber-600 shrink-0 animate-pulse" />
              <span>
                {language === 'en'
                  ? `Pending review & approval by administrator (${adminEmail}).`
                  : `Artikel ini sedang menunggu verifikasi dan persetujuan oleh (${adminEmail}).`}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={handleApproveArticle}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
              >
                <CheckCircle2 size={13} />
                <span>{language === 'en' ? 'Approve & Publish' : 'Setujui & Terbitkan'}</span>
              </button>
            )}
          </div>
        )}

        {feedback && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-zinc-400 mb-8">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-100">
            {language === 'en' ? 'Home' : 'Beranda'}
          </Link>
          <ChevronRight size={12} />
          <Link to="/articles" className="hover:text-stone-900 dark:hover:text-zinc-100">
            {language === 'en' ? 'Articles' : 'Artikel'}
          </Link>
          <ChevronRight size={12} />
          <span className="text-rose-600 dark:text-rose-400 font-semibold truncate max-w-[200px]">
            {t(post.title)}
          </span>
        </nav>

        {/* Article Header */}
        <header className="mb-10 border-b border-stone-200 dark:border-zinc-800 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider border border-rose-500/20">
                {post.category}
              </span>
              <span className="text-stone-400 dark:text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 text-stone-500 dark:text-zinc-400">
                <Calendar size={13} />
                <span>{post.date}</span>
              </span>
              <span className="text-stone-400 dark:text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 text-stone-500 dark:text-zinc-400">
                <Clock size={13} />
                <span>{post.readTime}</span>
              </span>
            </div>

            {/* Quick Action Tools */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Reading Font & Size Controls */}
              <div className="hidden sm:flex items-center rounded-lg border border-stone-200 dark:border-zinc-800 p-0.5 bg-stone-100/60 dark:bg-zinc-800/60 text-xs font-mono">
                <button
                  onClick={() => handleFontModeChange('serif')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    fontMode === 'serif'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                      : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                  }`}
                  title="Font Serif (Newsreader Editorial)"
                >
                  Serif
                </button>
                <button
                  onClick={() => handleFontModeChange('sans')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    fontMode === 'sans'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                      : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                  }`}
                  title="Font Sans (Plus Jakarta Sans Modern)"
                >
                  Sans
                </button>
              </div>

              <div className="hidden sm:flex items-center rounded-lg border border-stone-200 dark:border-zinc-800 p-0.5 bg-stone-100/60 dark:bg-zinc-800/60 text-xs font-mono">
                <button
                  onClick={() => handleFontSizeChange('sm')}
                  className={`px-1.5 py-1 rounded-md text-[11px] transition-all ${
                    fontSize === 'sm'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                  title="Teks Lebih Kecil"
                >
                  A-
                </button>
                <button
                  onClick={() => handleFontSizeChange('base')}
                  className={`px-1.5 py-1 rounded-md text-xs transition-all ${
                    fontSize === 'base'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                  title="Teks Standar"
                >
                  A
                </button>
                <button
                  onClick={() => handleFontSizeChange('lg')}
                  className={`px-1.5 py-1 rounded-md text-sm transition-all ${
                    fontSize === 'lg'
                      ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                      : 'text-stone-500 dark:text-zinc-400'
                  }`}
                  title="Teks Lebih Besar"
                >
                  A+
                </button>
              </div>

              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                  hasLiked
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                    : 'border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-rose-600 hover:border-rose-500/30'
                }`}
              >
                <Heart size={13} className={hasLiked ? 'fill-current' : ''} />
                <span>{likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
                <span>{copied ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Share' : 'Bagikan')}</span>
              </button>

              {/* More Actions Dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center justify-center w-8 h-8 text-xs rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Export tools"
                >
                  <Menu size={14} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-56 origin-top-right rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1.5 text-xs font-mono">
                      <button
                        onClick={() => {
                          handleViewMarkdown();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <FileText size={13} />
                        <span>{language === 'en' ? 'View as Markdown' : 'Lihat sebagai Markdown'}</span>
                      </button>
                      <button
                        onClick={() => {
                          handleOpenIn(aiLinks.chatGptUrl);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <Bot size={13} />
                        <span>Diskusikan di ChatGPT</span>
                      </button>
                      <button
                        onClick={() => {
                          handleOpenIn(aiLinks.claudeUrl);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <Bot size={13} />
                        <span>Diskusikan di Claude</span>
                      </button>
                      <button
                        onClick={() => {
                          handleOpenIn(aiLinks.v0Url);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <Code size={13} />
                        <span>Buat UI Prototype (V0)</span>
                      </button>
                      <button
                        onClick={() => {
                          handleOpenIn(aiLinks.sciraUrl);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <ExternalLink size={13} />
                        <span>Riset Web di Scira</span>
                      </button>
                      <button
                        onClick={handleCopyAiPrompt}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-semibold"
                      >
                        {aiCopied ? <Check size={13} className="text-emerald-500" /> : <Bot size={13} />}
                        <span>{aiCopied ? 'Prompt AI Tersalin!' : 'Salin Pertanyaan AI'}</span>
                      </button>
                      <div className="h-px bg-stone-200 dark:bg-zinc-800 my-1" />
                      <button
                        onClick={() => {
                          handleDownloadPdf();
                          setDropdownOpen(false);
                        }}
                        disabled={downloading}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left disabled:opacity-50"
                      >
                        <Download size={13} />
                        <span>{language === 'en' ? 'Download PDF' : 'Unduh Dokumen PDF'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-reading-sans text-stone-900 dark:text-zinc-100 mb-5 leading-tight">
            {t(post.title)}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-zinc-300 leading-relaxed font-normal border-l-2 border-rose-500 pl-4 py-1 font-reading-sans">
            {t(post.summary)}
          </p>
        </header>

        {/* Article Body with interactive Vanpedia sentinel links & comfortable typography */}
        <div 
          ref={contentRef}
          className={`${fontMode === 'serif' ? 'font-reading-serif' : 'font-reading-sans'} ${
            fontSize === 'sm' ? 'text-[15px]' : fontSize === 'lg' ? 'text-[18px]' : 'text-[16.5px]'
          } transition-all duration-200`}
        >
          <ArticleContent
            content={t(post.content)}
            vanpediaSlugs={post.vanpediaTerms || post.vanpediaSlugs || []}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 my-10 pt-6 border-t border-stone-200 dark:border-zinc-800">
          <Tag size={14} className="text-stone-400 dark:text-zinc-500" />
          {post.tags.map(tg => (
            <span
              key={tg}
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400 border border-stone-200/60 dark:border-zinc-700/60"
            >
              #{tg}
            </span>
          ))}
        </div>

        {/* Author Bio Card */}
        <div className="my-10 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-lg shrink-0 shadow-md">
            MI
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                {post.author ? post.author.name : 'Muchamad Irvan'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400">
                Author
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
              {post.author
                ? post.author.bio[language]
                : 'Software Engineer specializing in distributed web systems, algorithmic optimization, and modern UI engineering.'}
            </p>
          </div>
          <Link
            to="/#contact"
            className="self-start sm:self-center px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-zinc-700 text-xs font-mono text-stone-800 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {language === 'en' ? 'Get in Touch' : 'Kontak'}
          </Link>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="my-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen size={20} className="text-rose-500" />
              <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                {language === 'en' ? 'Related Articles' : 'Artikel Terkait'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map(rel => (
                <Link
                  key={rel.slug}
                  to={`/articles/${rel.slug}`}
                  className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/30 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">{rel.category}</span>
                      <span>{rel.readTime}</span>
                    </div>
                    <h4 className="font-semibold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {t(rel.title)}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {t(rel.summary)}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800/80 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                    <span>{language === 'en' ? 'Read' : 'Baca'}</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Interactive Discussion & Comments Section */}
        <section className="my-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-rose-500" />
              <h3 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
                {language === 'en' ? 'Discussion & Comments' : 'Komentar & Diskusi'}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                {comments.length}
              </span>
            </div>
          </div>

          {/* Architecture notice */}
          <div className="mb-6 p-3 rounded-xl border border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/10 text-xs text-stone-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-start gap-2">
              <ShieldCheck size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <p>
                {language === 'en'
                  ? 'Real-time comments synced with Firebase Firestore database.'
                  : 'Komentar tersinkronisasi real-time dengan database Firebase Firestore.'}
              </p>
            </div>

            {!user && (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-[11px] font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto shrink-0"
              >
                <LogIn size={12} />
                <span>{language === 'en' ? 'Sign in with Google' : 'Masuk dengan Google'}</span>
              </button>
            )}
          </div>

          {/* Comment Form */}
          <form
            onSubmit={handleAddComment}
            className="mb-8 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-4 font-mono"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                {language === 'en' ? 'Leave a Comment' : 'Tulis Komentar'}
              </h4>
              {user && (
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
                  )}
                  <span>{user.displayName || user.email}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={user?.displayName || (language === 'en' ? 'Your Name or Alias' : 'Nama atau Panggilan Anda')}
                value={commenterName}
                onChange={e => setCommenterName(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <textarea
              rows={3}
              required
              placeholder={
                language === 'en'
                  ? 'Share your thoughts, questions, or alternative approaches...'
                  : 'Tuliskan tanggapan, pertanyaan, atau saran Anda mengenai artikel ini...'
              }
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 font-medium text-xs hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-xs disabled:opacity-50"
              >
                <Send size={13} />
                <span>
                  {submittingComment
                    ? (language === 'en' ? 'Submitting...' : 'Mengirim...')
                    : (language === 'en' ? 'Submit Comment' : 'Kirim Komentar')}
                </span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map(c => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold flex items-center justify-center">
                      {c.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-900 dark:text-zinc-100">
                        {c.authorName}
                      </span>
                      <span className="block text-[10px] font-mono text-stone-400">
                        {new Date(c.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLikeComment(c.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500 dark:text-zinc-400 hover:text-rose-600 transition-colors p-1"
                    title="Like comment"
                  >
                    <Heart size={12} />
                    <span>{c.likes}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300 leading-relaxed pl-9">
                  {c.content}
                </p>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="py-10 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl">
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  {language === 'en'
                    ? 'No comments yet. Start the conversation!'
                    : 'Belum ada komentar. Jadilah yang pertama berkomentar!'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-8 border-t border-stone-200 dark:border-zinc-800">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline"
          >
            <ArrowLeft size={14} />
            <span>{language === 'en' ? 'Back to All Articles' : 'Kembali ke Semua Artikel'}</span>
          </Link>
        </div>
      </article>
    </>
  );
};
