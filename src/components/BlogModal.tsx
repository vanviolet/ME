import React, { useEffect } from 'react';
import { BlogPost } from '../types';
import { usePortfolio } from '../context/PortfolioContext';
import { X, Calendar, Clock, Tag, Share2, Check } from 'lucide-react';

interface BlogModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ post, onClose }) => {
  const { language, t } = usePortfolio();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (post) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [post, onClose]);

  if (!post) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rawContent = t(post.content);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-10 space-y-6 text-stone-900 dark:text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header & Close button */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500 dark:text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold uppercase">
                {post.category}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{post.date}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span>{post.readTime}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-50 leading-snug">
              {t(post.title)}
            </h2>

            <div className="text-xs text-stone-500 dark:text-zinc-400 font-mono">
              By Muchamad Irvan · Software Engineer
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close article"
            className="w-9 h-9 rounded-lg border border-stone-200 dark:border-zinc-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Article Summary Lead */}
        <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-zinc-950/60 border-l-4 border-rose-500 text-sm font-medium text-stone-700 dark:text-zinc-300 italic">
          {t(post.summary)}
        </div>

        {/* Article Body Content */}
        <div className="prose prose-stone dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4 text-stone-800 dark:text-zinc-200">
          {rawContent.split('\n\n').map((block, idx) => {
            if (block.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-bold text-stone-900 dark:text-zinc-100 pt-4">
                  {block.replace('### ', '')}
                </h3>
              );
            }
            if (block.startsWith('#### ')) {
              return (
                <h4 key={idx} className="text-base font-semibold text-stone-900 dark:text-zinc-200 pt-2">
                  {block.replace('#### ', '')}
                </h4>
              );
            }
            if (block.startsWith('- ')) {
              const items = block.split('\n').map(line => line.replace('- ', ''));
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1.5 text-stone-700 dark:text-zinc-300">
                  {items.map((it, iIdx) => (
                    <li key={iIdx}>{it}</li>
                  ))}
                </ul>
              );
            }
            if (block.startsWith('```')) {
              const codeClean = block.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
              return (
                <pre key={idx} className="p-4 rounded-xl bg-stone-900 text-stone-100 dark:bg-zinc-950 font-mono text-xs overflow-x-auto border border-stone-800">
                  <code>{codeClean}</code>
                </pre>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {block}
              </p>
            );
          })}
        </div>

        {/* Tags & Share Footer */}
        <div className="pt-6 border-t border-stone-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag size={13} className="text-stone-400 mr-1" />
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
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              <span>{copied ? (language === 'en' ? 'Link Copied' : 'Tersalin') : (language === 'en' ? 'Share' : 'Bagikan')}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {language === 'en' ? 'Close Article' : 'Tutup Artikel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
