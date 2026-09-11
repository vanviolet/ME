import React, { useState } from 'react';
import { vanpediaTermsData } from '../data/articlesData';
import { usePortfolio } from '../context/PortfolioContext';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { renderMarkdownWithMath, renderInlineFormula } from '../lib/renderMath';

interface ArticleContentProps {
  content: string;
  vanpediaSlugs?: string[];
}

function findVanpediaTerm(slug: string) {
  return vanpediaTermsData.find(t => t.slug === slug);
}

// Sentinel format: <!--VP|<encodedSlug>|<label>-->
const SENTINEL_PREFIX = '<!--VP|';
const SENTINEL_SUFFIX = '-->';

function placeholderFor(slug: string, label: string) {
  const safeSlug = encodeURIComponent(slug);
  const safeLabel = label.replace(/\|/g, '&#124;');
  return `${SENTINEL_PREFIX}${safeSlug}|${safeLabel}${SENTINEL_SUFFIX}`;
}

const VanpediaInteractiveLink: React.FC<{ slug: string; label: string }> = ({ slug, label }) => {
  const { t } = usePortfolio();
  const [showTooltip, setShowTooltip] = useState(false);
  const term = findVanpediaTerm(slug);

  // If label contains math notation (like $\sigma$ or \sigma or \nabla), render with KaTeX
  const isMathLabel = label.includes('$') || label.includes('\\');
  const renderedLabelHtml = isMathLabel ? renderInlineFormula(label) : null;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link
        to={`/vanpedia/${slug}`}
        className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-semibold underline decoration-rose-500/40 decoration-2 underline-offset-2 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 px-1 py-0.5 rounded transition-all"
        aria-label={`Buka vanpedia: ${label}`}
      >
        {renderedLabelHtml ? (
          <span dangerouslySetInnerHTML={{ __html: renderedLabelHtml }} />
        ) : (
          <span>{label}</span>
        )}
      </Link>

      {/* Floating preview tooltip on hover */}
      {showTooltip && term && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 rounded-xl bg-stone-900 text-stone-100 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xl border border-stone-700 dark:border-zinc-700 text-xs z-50 pointer-events-none block animate-in fade-in zoom-in-95 duration-150">
          <span className="flex items-center justify-between gap-1 mb-1 font-mono text-[10px] text-rose-400 font-bold uppercase tracking-wider">
            <span>{term.category}</span>
            <span className="text-stone-400 flex items-center gap-0.5">
              <Sparkles size={10} />
              <span>Vanpedia</span>
            </span>
          </span>

          <span className="font-semibold block text-stone-100 dark:text-white mb-1 text-sm font-reading-sans">
            {t(term.title)}
          </span>

          {term.formula && (
            <span 
              className="block my-1.5 p-1.5 rounded-lg bg-stone-950/70 dark:bg-zinc-900/80 border border-stone-800 dark:border-zinc-700 text-rose-300 dark:text-rose-400 text-center font-mono text-xs overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderInlineFormula(term.formula) }}
            />
          )}

          <span className="text-[11px] text-stone-300 dark:text-zinc-300 block line-clamp-3 leading-relaxed font-reading-sans">
            {t(term.definition)}
          </span>

          <span className="mt-2 pt-1.5 border-t border-stone-800 dark:border-zinc-700 flex items-center justify-between text-[9px] font-mono text-stone-400">
            <span>Klik untuk ensiklopedia lengkap</span>
            <ExternalLink size={10} />
          </span>
        </span>
      )}
    </span>
  );
};

function parseSentinels(html: string): React.ReactNode[] {
  const regex = /<!--VP\|([^|]+)\|([^-->]+)-->/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const before = html.slice(lastIndex, match.index);
      parts.push(<span key={`before-${keyCounter++}`} dangerouslySetInnerHTML={{ __html: before }} />);
    }
    const slug = decodeURIComponent(match[1]);
    const label = match[2].replace(/&#124;/g, '|');
    parts.push(
      <VanpediaInteractiveLink
        key={`link-${keyCounter++}-${slug}`}
        slug={slug}
        label={label}
      />,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    parts.push(<span key={`after-${keyCounter++}`} dangerouslySetInnerHTML={{ __html: html.slice(lastIndex) }} />);
  }

  return parts.length ? parts : [<span key="empty" dangerouslySetInnerHTML={{ __html: html }} />];
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content, vanpediaSlugs = [] }) => {
  const { language, t } = usePortfolio();

  // Collect unique valid slugs referenced in content (supports [[slug]] and [[slug|label]])
  const referencedSlugs: string[] = [];
  const slugRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = slugRegex.exec(content)) !== null) {
    const slug = match[1].trim();
    if (!referencedSlugs.includes(slug)) referencedSlugs.push(slug);
  }

  vanpediaSlugs.forEach(s => {
    if (!referencedSlugs.includes(s)) referencedSlugs.push(s);
  });

  // Replace [[slug]] and [[slug|label]] markers with sentinel placeholders
  const withPlaceholders = content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, slugRaw: string, labelRaw?: string) => {
    const slug = slugRaw.trim();
    const term = findVanpediaTerm(slug);
    const label = labelRaw ? labelRaw.trim() : (term ? t(term.title) : slug);
    return placeholderFor(slug, label);
  });

  // Render markdown with KaTeX math to HTML, then split into React nodes
  const html = renderMarkdownWithMath(withPlaceholders);
  const contentNodes = parseSentinels(html);

  const relatedTerms = referencedSlugs
    .map(slug => findVanpediaTerm(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof findVanpediaTerm>>[];

  return (
    <>
      <div
        className="max-w-none text-sm sm:text-base leading-relaxed space-y-4 mb-4"
        data-article-content
      >
        {contentNodes}
      </div>

      {relatedTerms.length > 0 && (
        <aside className="mt-12 pt-6 border-t border-stone-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-rose-500 dark:text-rose-400" />
            <h3 className="text-base font-semibold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Related Vanpedia Terms in this Article' : 'Istilah Vanpedia Terkait dalam Artikel Ini'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {relatedTerms.map(term => (
              <Link
                key={term.slug}
                to={`/vanpedia/${term.slug}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all group"
              >
                <span className="font-medium text-xs sm:text-sm text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  {t(term.title)}
                </span>
                {term.category && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    {term.category}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </aside>
      )}
    </>
  );
};
