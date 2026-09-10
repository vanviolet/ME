import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { articlesData } from '../data/articlesData';
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
} from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import { Seo } from './Seo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { marked } from 'marked';

/**
 * Individual article page — each article has its own URL for SEO.
 */
export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language, t } = usePortfolio();
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const post = articlesData.find(a => a.slug === slug);

  // Build the full markdown raw content for "View as Markdown" and external opens
  const rawMarkdown = (post.content[language] || post.content.en) as string;
  const articleUrl = `https://vanviolet.my.id/articles/${post.slug}`;
  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(rawMarkdown)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(rawMarkdown)}`;
  const v0Url = `https://v0.dev?q=${encodeURIComponent(rawMarkdown)}`;
  const sciraUrl = `https://scira.ai/?q=${encodeURIComponent(rawMarkdown)}`;

  const handleViewMarkdown = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleOpenIn = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      // Build a clean standalone HTML for the article content using marked
      // directly (NOT the React-rendered element which inherits Tailwind v4
      // oklch() stylesheets that html2canvas cannot parse).
      const markdownContent = t(post.content);
      const htmlContent = marked.parse(markdownContent, { gfm: true, breaks: true, async: false });

      // Inject only hex-only CSS (no oklch) so html2canvas can parse everything.
      // NOTE: `body` tags are stripped by innerHTML, so all styles must target
      // the actual rendered elements (.article-pdf-root, etc.).
      const printStyles = `
        .article-pdf-root {
          background: #ffffff;
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e293b;
          line-height: 1.75;
          font-size: 15px;
          margin: 0;
          padding: 40px;
          box-sizing: border-box;
        }
        .article-pdf-root * {
          box-sizing: border-box;
        }
        .article-title {
          font-size: 2em;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1em 0;
        }
        .article-summary {
          font-style: italic;
          color: #6b7280;
          border-left: 4px solid #dc2626;
          padding-left: 16px;
          margin: 0 0 2em 0;
        }
        .article-meta {
          font-size: 0.85em;
          color: #9ca3af;
          margin-bottom: 2em;
          padding-bottom: 1em;
          border-bottom: 1px solid #e5e7eb;
        }
        .article-meta span { margin-right: 1em; }
        .article-meta .category {
          display: inline-block;
          padding: 2px 8px;
          background: #fecaca;
          color: #991b1b;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75em;
        }
        .article-content h1 { font-size: 2em; margin: 1.5em 0 0.75em; color: #111827; border-bottom: none; }
        .article-content h2 { font-size: 1.5em; margin: 1.5em 0 0.75em; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
        .article-content h3 { font-size: 1.25em; margin: 1.5em 0 0.75em; color: #111827; }
        .article-content h4 { font-size: 1.1em; margin: 1.25em 0 0.6em; color: #1f2937; }
        .article-content h5 { font-size: 1em; margin: 1em 0 0.5em; color: #1f2937; }
        .article-content h6 { font-size: 0.9em; margin: 1em 0 0.5em; color: #374151; }
        .article-content p { margin: 0 0 1em 0; }
        .article-content ul, .article-content ol { margin: 0 0 1em 0; padding-left: 1.5em; }
        .article-content li { margin: 0.25em 0; }
        .article-content a { color: #dc2626; text-decoration: underline; }
        .article-content strong { font-weight: 700; }
        .article-content em { font-style: italic; }
        .article-content del { text-decoration: line-through; }
        .article-content code {
          font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.85em;
          background: #f1f5f9;
          border-radius: 0.3em;
          padding: 0.1em 0.35em;
          color: #dc2626;
        }
        .article-content pre {
          background: #1f2937;
          border-radius: 0.75em;
          padding: 1em;
          overflow-x: auto;
          border: 1px solid #374151;
          margin: 1em 0;
        }
        .article-content pre code {
          background: transparent;
          padding: 0;
          font-size: 0.8em;
          color: #f8fafc;
          border-radius: 0;
        }
        .article-content blockquote {
          border-left: 3px solid #dc2626;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
        }
        .article-content table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        .article-content th, .article-content td { border: 1px solid #d1d5db; padding: 0.5em 0.75em; text-align: left; }
        .article-content th { background: #f3f4f6; }
        .article-content hr { border: 0; border-top: 1px solid #e5e7eb; margin: 2em 0; }
        .tags { margin-top: 2em; padding-top: 1em; border-top: 1px solid #e5e7eb; }
        .tags span {
          display: inline-block;
          font-size: 0.8em;
          margin-right: 0.5em;
          color: #6b7280;
        }
      `;

      // Create a detached DOM element with the article HTML.
      // Use a flat div structure (no html/head/body) because setting innerHTML
      // with those tags inside a div causes the browser to strip them.
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.innerHTML = `
        <div class="article-pdf-root">
          <style>${printStyles}</style>
          <div class="article-meta">
            <span class="category">${post.category}</span>
            <span>${post.date}</span>
            <span>${post.readTime}</span>
          </div>
          <h1 class="article-title">${t(post.title)}</h1>
          <p class="article-summary">${t(post.summary)}</p>
          <div class="article-content">${htmlContent}</div>
          <div class="tags">${post.tags.map(tag => `<span>#${tag}</span>`).join('')}</div>
        </div>
      `;
      document.body.appendChild(container);

      // Wait for any images to load
      const images = container.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }));

      // Capture the root content div
      const captureEl = container.querySelector('.article-pdf-root') as HTMLElement;
      const canvas = await html2canvas(captureEl, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: captureEl.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 595.28; // A4 width in pt at 72dpi
      const pdfHeight = 841.89; // A4 height in pt at 72dpi
      const pageHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF('p', 'pt', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pageHeight);

      let remainingHeight = pageHeight - pdfHeight;
      let position = -pdfHeight;

      while (remainingHeight > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight);
        remainingHeight -= pdfHeight;
      }

      pdf.save(`${post.slug}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      // Always clean up the temporary container
      const temp = document.querySelector('.article-pdf-root');
      if (temp && temp.parentNode) {
        temp.parentNode.removeChild(temp);
      }
      setDownloading(false);
    }
  };

  const articleImage = '/images/irvan_photo_portrait.jpg';

  return (
    <>
      <Seo
        title={`${t(post.title)} | Muchamad Irvan`}
        description={t(post.summary)}
        image={articleImage}
        url={articleUrl}
        type="article"
        keywords={post.tags.join(', ')}
      />

      <article className="py-24 px-6 sm:px-8 max-w-4xl mx-auto min-h-screen">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-mono text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 transition-colors"
          aria-label={language === 'en' ? 'Go back' : 'Kembali'}
        >
          <ArrowLeft size={16} />
          <span>{language === 'en' ? 'Back' : 'Kembali'}</span>
        </button>

        {/* Header */}
        <header className="mb-12 border-b border-stone-200 dark:border-zinc-800 pb-8">
          <div className="flex flex-wrap items-center gap-2 pb-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider border border-rose-500/20">
              {post.category}
            </span>
            <span className="text-stone-400 dark:text-zinc-500">•</span>
            <span className="flex items-center gap-1 text-stone-500 dark:text-zinc-400">
              <Calendar size={12} />
              <span>{post.date}</span>
            </span>
            <span className="text-stone-300 dark:text-zinc-700">•</span>
            <span className="flex items-center gap-1 text-stone-500 dark:text-zinc-400">
              <Clock size={12} />
              <span>{post.readTime}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mt-4 mb-2">
            {t(post.title)}
          </h1>

          <p className="text-stone-600 dark:text-zinc-400 leading-relaxed mt-4 italic border-l-4 border-rose-500 pl-4 py-2 bg-stone-100/40 dark:bg-zinc-950/40 rounded-r-lg">
            {t(post.summary)}
          </p>
        </header>

        {/* Content with [[term]] linking */}
        <div className="mb-16" ref={contentRef}>
          <ArticleContent
            content={t(post.content)}
            vanpediaSlugs={post.vanpediaTerms}
          />
        </div>

        {/* Tags & Share Footer */}
        <footer className="pt-8 border-t border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag size={14} className="text-stone-400" />
            {post.tags.map(tg => (
              <span
                key={tg}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400"
              >
                #{tg}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={language === 'en' ? 'Share article' : 'Bagikan artikel'}
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span>
                {copied
                  ? language === 'en'
                    ? 'Link Copied'
                    : 'Tersalin'
                  : language === 'en'
                    ? 'Share'
                    : 'Bagikan'}
              </span>
            </button>

            {/* Dropdown Menu */}
            <div className="relative inline-block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center justify-center w-8 h-8 text-xs font-mono rounded-md border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label={language === 'en' ? 'More actions' : 'Aksi lainnya'}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <Menu size={14} className="text-stone-600 dark:text-zinc-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute z-20 mt-1 w-52 origin-top-right rounded-md border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg py-1">
                    <button
                      onClick={() => {
                        handleViewMarkdown();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <FileText size={13} />
                      <span>{language === 'en' ? 'View as Markdown' : 'Lihat sebagai Markdown'}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleOpenIn(chatGptUrl);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <Bot size={13} />
                      <span>Open in ChatGPT</span>
                    </button>
                    <button
                      onClick={() => {
                        handleOpenIn(claudeUrl);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <Bot size={13} />
                      <span>Open in Claude</span>
                    </button>
                    <button
                      onClick={() => {
                        handleOpenIn(v0Url);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <Code size={13} />
                      <span>Open in V0</span>
                    </button>
                    <button
                      onClick={() => {
                        handleOpenIn(sciraUrl);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <ExternalLink size={13} />
                      <span>Open in Scira</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadPdf();
                        setDropdownOpen(false);
                      }}
                      disabled={downloading}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-left disabled:opacity-50"
                    >
                      <Download size={13} />
                      <span>{language === 'en' ? 'Download PDF' : 'Unduh PDF'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </footer>
      </article>
    </>
  );
};
