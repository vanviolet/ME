import React, { useEffect, useState, useMemo } from 'react';
import { marked } from 'marked';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { vanpediaTermsData, articlesData } from '../data/articlesData';
import {
  fetchVanpediaTermsFromFirestore,
  fetchVanpediaTermBySlugFromFirestore,
  createVanpediaTermInFirestore,
  updateVanpediaStatusInFirestore,
} from '../services/firestoreService';
import { VanpediaTerm } from '../types';
import {
  ArrowLeft,
  Tag,
  BookOpen,
  Link2,
  Search,
  Compass,
  Sparkles,
  Layers,
  Share2,
  Check,
  ChevronRight,
  Filter,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  X,
  Send,
  Download,
  Bot,
  Code,
  ExternalLink,
  Menu,
  FileText,
} from 'lucide-react';
import { Seo } from './Seo';
import { exportToPdf } from '../utils/pdfExport';
import { buildAiDiscussionLinks } from '../utils/aiPrompts';
import { RichEditor } from './RichEditor';
import { TemplateUploadZone } from './TemplateUploadZone';
import { AiPromptModal } from './AiPromptModal';
import { ParsedVanpediaFile } from '../utils/fileParser';

/**
 * Vanpedia term page — each term (e.g. /vanpedia/tritone) gets its own SEO-optimized page.
 */
export const VanpediaPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = usePortfolio();
  const { user, isAdmin, adminEmail } = useAuth();

  const [term, setTerm] = useState<VanpediaTerm | null>(() => {
    return vanpediaTermsData.find(v => v.slug === slug) || null;
  });
  const [allTerms, setAllTerms] = useState<VanpediaTerm[]>(vanpediaTermsData);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const aiLinks = useMemo(() => {
    if (!term) return null;
    return buildAiDiscussionLinks({
      title: t(term.title),
      summary: t(term.definition),
      category: term.category,
      language,
      isVanpedia: true,
      url: window.location.href,
    });
  }, [term, language, t]);

  const handleCopyAiPrompt = () => {
    if (!aiLinks) return;
    navigator.clipboard.writeText(aiLinks.chatGptPrompt);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    if (!term) return;
    setDownloading(true);
    try {
      const htmlContent = marked.parse(t(term.content) || t(term.definition), { gfm: true, breaks: true, async: false }) as string;
      await exportToPdf({
        title: `${t(term.title)} - Vanpedia`,
        category: term.category,
        date: new Date().toLocaleDateString('en-CA'),
        readTime: '3 min read',
        authorName: 'Muchamad Irvan (Vanpedia)',
        summary: t(term.definition),
        htmlContent,
        filename: `vanpedia-${term.slug}.pdf`,
        sourceUrl: `https://vanviolet.my.id/vanpedia/${term.slug}`,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const loadTermData = async () => {
      if (!slug) return;
      try {
        const [termRes, listRes] = await Promise.all([
          fetchVanpediaTermBySlugFromFirestore(slug),
          fetchVanpediaTermsFromFirestore(isAdmin, user?.uid),
        ]);
        if (termRes) {
          setTerm(termRes);
        }
        if (listRes.length > 0) {
          setAllTerms(listRes);
        }
      } catch (e) {
        console.error('Error fetching vanpedia term:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTermData();
  }, [slug, isAdmin, user?.uid]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    if (!term) return;
    setActionLoading(true);
    try {
      await updateVanpediaStatusInFirestore(term.id, 'approved', adminEmail);
      setTerm(prev => (prev ? { ...prev, status: 'approved' } : null));
      setFeedback(language === 'en' ? 'Term approved and published to Vanpedia!' : 'Istilah berhasil disetujui dan ditayangkan di Vanpedia!');
    } catch (err: any) {
      alert('Error approving term: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!term && !loading) {
    return (
      <section className="py-24 px-6 sm:px-8 max-w-4xl mx-auto min-h-screen">
        <Seo
          title={language === 'en' ? 'Term Not Found | Vanpedia' : 'Istilah Tidak Ditemukan | Vanpedia'}
          description={language === 'en' ? 'The requested vanpedia term could not be found.' : 'Istilah vanpedia yang diminta tidak ditemukan.'}
          type="website"
        />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mb-4">
            {language === 'en' ? 'Term Not Found' : 'Istilah Tidak Ditemukan'}
          </h2>
          <p className="text-stone-600 dark:text-zinc-400 mb-6">
            {language === 'en'
              ? `No vanpedia entry found for "${slug}".`
              : `Tidak ditemukan entri vanpedia untuk "${slug}".`}
          </p>
          <Link
            to="/vanpedia"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {language === 'en' ? 'Back to Vanpedia' : 'Kembali ke Vanpedia'}
          </Link>
        </div>
      </section>
    );
  }

  if (!term) return null;

  // Resolve related terms & articles
  const relatedTerms = allTerms.filter(
    v => term.relatedSlugs?.includes(v.slug) && v.slug !== term.slug,
  );

  const referencedArticles = articlesData.filter(
    a => term.articleIds?.includes(a.id) || a.tags.some(tag => tag.toLowerCase() === term.slug.toLowerCase()),
  );

  const isPending = term.status === 'pending';

  return (
    <>
      <Seo
        title={`${t(term.title)} - Definisi & Konsep | Vanpedia`}
        description={t(term.definition)}
        url={`https://vanviolet.my.id/vanpedia/${term.slug}`}
        type="article"
        keywords={`${term.slug}, ${t(term.title)}, vanpedia, glossary, kamus teknis`}
      />

      <article className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
        {/* Pending Verification Notice Banner */}
        {isPending && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Clock3 size={16} className="text-amber-600 shrink-0 animate-pulse" />
              <span>
                {language === 'en'
                  ? `Pending review & approval by administrator (${adminEmail}).`
                  : `Istilah ini sedang menunggu verifikasi dan persetujuan oleh (${adminEmail}).`}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={handleApprove}
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
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)}>✕</button>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-zinc-400 mb-8">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-100">
            {language === 'en' ? 'Home' : 'Beranda'}
          </Link>
          <ChevronRight size={12} />
          <Link to="/vanpedia" className="hover:text-stone-900 dark:hover:text-zinc-100">
            Vanpedia
          </Link>
          <ChevronRight size={12} />
          <span className="text-rose-600 dark:text-rose-400 font-semibold truncate max-w-[200px]">
            {t(term.title)}
          </span>
        </nav>

        {/* Term Header Banner */}
        <header className="mb-10 border-b border-stone-200 dark:border-zinc-800 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider border border-rose-500/20">
                {term.category}
              </span>
              <span className="text-stone-400 dark:text-zinc-600">•</span>
              <span className="text-xs font-mono text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                <Compass size={13} />
                <span>Vanpedia Knowledge Entry</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 text-xs font-mono text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
                <span>{copied ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Share' : 'Bagikan')}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 text-xs font-mono text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <Download size={13} />
                <span>{downloading ? (language === 'en' ? 'Exporting...' : 'Mengunduh...') : 'PDF'}</span>
              </button>

              {/* AI & Export Options Dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center justify-center w-8 h-8 text-xs rounded-lg border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="AI and Export tools"
                >
                  <Menu size={14} />
                </button>

                {dropdownOpen && aiLinks && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-56 origin-top-right rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1.5 text-xs font-mono">
                      <a
                        href={aiLinks.chatGptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <Bot size={13} />
                        <span>Diskusikan di ChatGPT</span>
                      </a>
                      <a
                        href={aiLinks.claudeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <Bot size={13} />
                        <span>Diskusikan di Claude</span>
                      </a>
                      <a
                        href={aiLinks.v0Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <Code size={13} />
                        <span>Buat UI Prototype (V0)</span>
                      </a>
                      <a
                        href={aiLinks.sciraUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-left"
                      >
                        <ExternalLink size={13} />
                        <span>Riset Web di Scira</span>
                      </a>
                      <button
                        onClick={() => {
                          handleCopyAiPrompt();
                          setDropdownOpen(false);
                        }}
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

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mb-4">
            {t(term.title)}
          </h1>

          {/* Core Definition Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500/20 text-stone-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed font-medium">
            {t(term.definition)}
          </div>

          {/* Mathematical / Technical Formula (if present) */}
          {term.formula && (
            <div className="mt-4 p-4 rounded-xl bg-stone-100/80 dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 font-mono text-xs sm:text-sm text-stone-800 dark:text-zinc-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-zinc-500 block mb-0.5">
                  {language === 'en' ? 'Mathematical Formulation / Concept' : 'Formula Matematis / Konsep'}
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">{term.formula}</span>
              </div>
              <Sparkles size={16} className="text-rose-500 shrink-0 opacity-70" />
            </div>
          )}
        </header>

        {/* Detailed Explanation / Markdown Content */}
        {term.content && (
          <div
            className="max-w-none text-sm sm:text-base leading-relaxed space-y-4 text-stone-700 dark:text-zinc-300 mb-12"
            data-article-content
            dangerouslySetInnerHTML={{
              __html: marked.parse(t(term.content) || '', { gfm: true, breaks: true, async: false }),
            }}
          />
        )}

        {/* Examples Section */}
        {term.examples && (
          <div className="mb-12 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-rose-500" />
              <span>{language === 'en' ? 'Real-World Examples & Applications' : 'Contoh Nyata & Penerapan'}</span>
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-zinc-300">
              {(term.examples[language] || term.examples.id || []).map((ex, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">→</span>
                  <span className="leading-relaxed">{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <div className="mb-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Link2 size={18} className="text-rose-500" />
              <span>{language === 'en' ? 'Related Terms in Vanpedia' : 'Istilah Terkait di Vanpedia'}</span>
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {relatedTerms.map(rt => (
                <Link
                  key={rt.slug}
                  to={`/vanpedia/${rt.slug}`}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all group"
                >
                  <span className="font-medium text-xs sm:text-sm text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    {t(rt.title)}
                  </span>
                  <span className="ml-2 text-[10px] font-mono uppercase text-stone-400">
                    {rt.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Referenced in Articles */}
        {referencedArticles.length > 0 && (
          <div className="mb-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-rose-500" />
              <span>{language === 'en' ? 'Articles Exploring this Term' : 'Artikel yang Mengulas Istilah Ini'}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {referencedArticles.map(art => (
                <Link
                  key={art.id}
                  to={`/articles/${art.slug}`}
                  className="p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:border-rose-500/30 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-500">
                      {art.category}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 mt-1 transition-colors">
                      {t(art.title)}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-1.5">
                      {t(art.summary)}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                    <span>{language === 'en' ? 'Read in context' : 'Baca artikel'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-8 border-t border-stone-200 dark:border-zinc-800">
          <Link
            to="/vanpedia"
            className="inline-flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline"
          >
            <ArrowLeft size={14} />
            <span>{language === 'en' ? 'Back to All Vanpedia Terms' : 'Kembali ke Semua Istilah Vanpedia'}</span>
          </Link>
        </div>
      </article>
    </>
  );
};

/**
 * Vanpedia index page — lists all terms with interactive category menu, search,
 * and user contribution modal with automated email notification to vanviolet.js@gmail.com.
 */
export const VanpediaIndexPage: React.FC = () => {
  const { language, t } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

  const [terms, setTerms] = useState<VanpediaTerm[]>(vanpediaTermsData);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // New Term Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [newTitleId, setNewTitleId] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategory, setNewCategory] = useState('Learning (AI)');
  const [newDefinitionId, setNewDefinitionId] = useState('');
  const [newDefinitionEn, setNewDefinitionEn] = useState('');
  const [newExamples, setNewExamples] = useState('');
  const [newFormula, setNewFormula] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVanpediaTemplateLoaded = (parsed: ParsedVanpediaFile) => {
    if (parsed.title) setNewTitleId(parsed.title);
    if (parsed.slug) setNewSlug(parsed.slug);
    if (parsed.category) setNewCategory(parsed.category);
    if (parsed.definition) setNewDefinitionId(parsed.definition);
    if (parsed.formula) setNewFormula(parsed.formula);
    if (parsed.examples && parsed.examples.length > 0) {
      setNewExamples(parsed.examples.join('\n'));
    }
  };

  const loadTerms = async () => {
    try {
      const data = await fetchVanpediaTermsFromFirestore(isAdmin, user?.uid);
      setTerms(data);
    } catch (e) {
      console.error('Error fetching vanpedia terms:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, [isAdmin, user?.uid]);

  const categories = useMemo(() => {
    return Array.from(new Set(terms.map(v => v.category))).sort();
  }, [terms]);

  const filteredTerms = useMemo(() => {
    return terms.filter(term => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        t(term.title).toLowerCase().includes(q) ||
        t(term.definition).toLowerCase().includes(q) ||
        term.category.toLowerCase().includes(q) ||
        term.slug.toLowerCase().includes(q);

      const matchesCategory = activeCategory === 'all' || term.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [terms, searchQuery, activeCategory, t]);

  const handleOpenAddTerm = () => {
    if (!user) {
      if (confirm(language === 'en' ? 'Please sign in with Google to contribute a term.' : 'Silakan masuk dengan Google untuk menambahkan istilah baru.')) {
        signInWithGoogle();
      }
      return;
    }
    setIsModalOpen(true);
  };

  const handleAddTermSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleId.trim()) {
      alert(language === 'en' ? 'Please enter a term name.' : 'Mohon masukkan nama istilah.');
      return;
    }

    setSubmitting(true);
    try {
      const generatedSlug = (newSlug.trim() || newTitleEn.trim() || newTitleId.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const isSubmittingAdmin = user?.email === adminEmail;
      const parsedExamples = newExamples
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await createVanpediaTermInFirestore(
        {
          slug: generatedSlug,
          title: {
            id: newTitleId.trim(),
            en: newTitleEn.trim() || newTitleId.trim(),
          },
          category: newCategory,
          definition: {
            id: newDefinitionId.trim(),
            en: newDefinitionEn.trim() || newDefinitionId.trim(),
          },
          formula: newFormula.trim() || undefined,
          examples: {
            id: parsedExamples.length > 0 ? parsedExamples : ['Contoh penerapan istilah ini.'],
            en: parsedExamples.length > 0 ? parsedExamples : ['Real-world application example.'],
          },
          authorName: user?.displayName || 'Contributor',
          authorEmail: user?.email || undefined,
          authorId: user?.uid || undefined,
        },
        user?.email || undefined,
        user?.uid || undefined,
        isSubmittingAdmin
      );

      setIsModalOpen(false);
      setNewTitleId('');
      setNewTitleEn('');
      setNewSlug('');
      setNewDefinitionId('');
      setNewDefinitionEn('');
      setNewExamples('');
      setNewFormula('');

      if (isSubmittingAdmin) {
        setFeedback(language === 'en' ? 'Term published directly as Administrator!' : 'Istilah langsung dipublikasikan sebagai Administrator!');
      } else {
        setFeedback(
          language === 'en'
            ? `Term submitted! Awaiting verification by ${adminEmail}. Notification email sent.`
            : `Istilah diajukan! Menunggu verifikasi oleh ${adminEmail}. Email pemberitahuan telah dikirim.`
        );
      }

      await loadTerms();
    } catch (err: any) {
      alert('Error saving term: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo
        title={language === 'en' ? 'Vanpedia - Technical Glossary & Knowledge | Muchamad Irvan' : 'Vanpedia - Kamus Istilah Teknis & Pengetahuan | Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Vanpedia — curated technical glossary defining concepts across music theory, AI calculus, computer systems, databases, and biometric security.'
            : 'Vanpedia — kamus istilah teknis terkurasi: teori musik, matematika AI, sistem komputer, database, dan keamanan biometrik.'
        }
        url="https://vanviolet.my.id/vanpedia"
        type="website"
        keywords="vanpedia, glossary, dictionary, technical terms, music theory, artificial intelligence, computer science"
      />

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
                  {language === 'en' ? 'Vanpedia — Technical Glossary' : 'Vanpedia — Kamus Istilah Teknis'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono border border-rose-500/20 font-bold">
                  {terms.length} Istilah
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2">
                {language === 'en' ? 'Concepts and Terms, Defined.' : 'Konsep dan Istilah, Terdefinisi.'}
              </h1>
              <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-2xl mt-2 font-mono">
                {language === 'en'
                  ? 'Click any highlighted term in an article to jump here. Each entry features exact mathematical models, practical examples, and cross-references.'
                  : 'Setiap kata teknis dalam artikel dapat diklik untuk membuka penjelasan di sini. Dilengkapi model matematika, contoh nyata, dan keterkaitan sistem.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                >
                  <ShieldCheck size={15} />
                  <span>Admin Hub</span>
                </Link>
              )}

              <button
                onClick={handleOpenAddTerm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-xs font-mono font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-xs"
              >
                <Plus size={15} />
                <span>{language === 'en' ? 'Contribute Term' : 'Tambah Istilah'}</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)}>✕</button>
            </div>
          )}
        </header>

        {/* Search & Category Filter Menu */}
        <div className="mb-8 space-y-4">
          {/* Search Box */}
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
                  ? 'Search terms (e.g. tritone, backpropagation, floating-point)...'
                  : 'Cari istilah (misal: tritone, backpropagation, floating-point)...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-colors font-mono"
            />
          </div>

          {/* Category Menu Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500 dark:text-zinc-400 mr-1">
              <Filter size={13} />
              <span>{language === 'en' ? 'Categories:' : 'Kategori:'}</span>
            </div>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-all ${
                activeCategory === 'all'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'en' ? 'All Terms' : 'Semua Istilah'} ({terms.length})
            </button>
            {categories.map(cat => {
              const count = terms.filter(v => v.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-all ${
                    activeCategory === cat
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.map(term => {
            const isPending = term.status === 'pending';
            return (
              <Link
                key={term.slug}
                to={`/vanpedia/${term.slug}`}
                className={`p-5 rounded-2xl border transition-all duration-200 group flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-400/60 bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 hover:border-rose-500/40 dark:hover:border-rose-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 font-semibold">
                      {term.category}
                    </span>
                    {isPending && (
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Clock3 size={11} />
                        PENDING
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-base text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {t(term.title)}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {t(term.definition)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-zinc-400">
                  <span className="text-stone-400">/{term.slug}</span>
                  <span className="group-hover:translate-x-1 transition-transform text-rose-600 dark:text-rose-400 font-semibold">
                    Lihat →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTerms.length === 0 && (
          <div className="py-16 text-center border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl font-mono text-xs">
            <p className="text-stone-600 dark:text-zinc-400 mb-3">
              {language === 'en'
                ? 'No terms match your search.'
                : 'Tidak ada istilah yang cocok dengan pencarian Anda.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-xs font-mono text-rose-600 dark:text-rose-400 underline"
            >
              {language === 'en' ? 'Reset Filters' : 'Reset Filter'}
            </button>
          </div>
        )}

        {/* Contribution Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold font-mono text-stone-900 dark:text-zinc-100">
                    {language === 'en' ? 'Contribute Vanpedia Term' : 'Tambah Istilah Vanpedia Baru'}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 font-mono mt-0.5">
                    {user?.email === adminEmail
                      ? (language === 'en' ? 'Publishing with Admin authority.' : 'Dipublikasikan langsung dengan akun Administrator.')
                      : (language === 'en' ? `Will be reviewed by ${adminEmail}. Email notification sent.` : `Akan ditinjau oleh ${adminEmail}. Notifikasi email terkirim otomatis.`)}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                >
                  <X size={18} />
                </button>
              </div>

              <TemplateUploadZone
                mode="vanpedia"
                onVanpediaLoaded={handleVanpediaTemplateLoaded}
                onOpenAiHelper={() => setIsAiModalOpen(true)}
              />

              <form onSubmit={handleAddTermSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Term Name (Indonesian) *' : 'Nama Istilah (Bahasa Indonesia) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitleId}
                    onChange={e => setNewTitleId(e.target.value)}
                    placeholder="Contoh: Interval Tritone"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Term Name (English) [Optional]' : 'Nama Istilah (Bahasa Inggris) [Opsional]'}
                  </label>
                  <input
                    type="text"
                    value={newTitleEn}
                    onChange={e => setNewTitleEn(e.target.value)}
                    placeholder="Example: Tritone Interval"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                      {language === 'en' ? 'URL Slug *' : 'Slug URL (untuk [[kata-kunci]]) *'}
                    </label>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={e => setNewSlug(e.target.value)}
                      placeholder="tritone"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                      {language === 'en' ? 'Category' : 'Kategori'}
                    </label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                    >
                      <option value="Theory Music">Theory Music</option>
                      <option value="Learning (AI)">Learning (AI)</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Security">Security</option>
                      <option value="Fakta Unik">Fakta Unik</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Definition / Content (Rich Markdown) *' : 'Definisi & Konten (Rich Markdown) *'}
                  </label>
                  <p className="text-[10px] text-stone-400 dark:text-zinc-500 mb-2">
                    {language === 'en'
                      ? 'Rich Editor supports headings, code, latex formulas, tables, and [[backlinks]].'
                      : 'Editor kaya mendukung heading, blok kode, rumus matematika, tabel, dan [[backlinks]].'}
                  </p>
                  <RichEditor
                    value={newDefinitionId}
                    onChange={setNewDefinitionId}
                    placeholder="Tulis definisi komprehensif, analogi teknis, atau rincian konsep..."
                    height="280px"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Formula / Mathematical Model' : 'Rumus Matematis / Notasi'}
                  </label>
                  <input
                    type="text"
                    value={newFormula}
                    onChange={e => setNewFormula(e.target.value)}
                    placeholder="f2 = f1 * 2^(6/12)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-zinc-300 font-semibold mb-1">
                    {language === 'en' ? 'Examples (1 per line)' : 'Contoh Nyata (1 per baris)'}
                  </label>
                  <textarea
                    rows={2}
                    value={newExamples}
                    onChange={e => setNewExamples(e.target.value)}
                    placeholder="B ke F = tritone (dalam akor Dominan G7)&#10;Resolusi tritone ke 3rd dan root akor C Major"
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
                    <span>{submitting ? (language === 'en' ? 'Saving...' : 'Menyimpan...') : (language === 'en' ? 'Submit Term' : 'Simpan Istilah')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI ChatGPT Outline Prompt Modal */}
        <AiPromptModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          mode="vanpedia"
          defaultCategory={newCategory}
        />
      </section>
    </>
  );
};
