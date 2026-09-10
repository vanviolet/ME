import React from 'react';
import { marked } from 'marked';
import { vanpediaTermsData } from '../data/articlesData';
import { usePortfolio } from '../context/PortfolioContext';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

/**
 * Renders article markdown content with:
 * - [[slug]] vanpedia term markers → clickable <Link> to /vanpedia/:slug
 * - Proper markdown via `marked` (headers, lists, code blocks, tables, emphasis)
 * - A "Related Vanpedia Terms" aside at the bottom.
 */
interface ArticleContentProps {
  content: string;
  vanpediaSlugs?: string[];
}

// Returns a term object if a slug matches, otherwise null.
function findVanpediaTerm(slug: string) {
  return vanpediaTermsData.find(t => t.slug === slug);
}

// Pre-render inline [[slug]] markers into an HTML-comment sentinel that marked
// won't touch (unlike double-underscore tokens which get parsed as bold),
// then post-process the rendered HTML to wrap sentinels in <Link> elements.
// Sentinel format: <!--VP|<encodedSlug>|<label>-->
const SENTINEL_PREFIX = '<!--VP|';
const SENTINEL_SUFFIX = '-->';

function placeholderFor(slug: string, label: string) {
  const safeSlug = encodeURIComponent(slug);
  // Escape pipe so label with pipes stays valid in the comment format
  const safeLabel = label.replace(/\|/g, '&#124;');
  return `${SENTINEL_PREFIX}${safeSlug}|${safeLabel}${SENTINEL_SUFFIX}`;
}

function parseSentinels(html: string): React.ReactNode[] {
  // Splits HTML string on sentinel HTML comments, returning React nodes.
  // Sentinel format: <!--VP|<encodedSlug>|<label>-->
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
      <Link
        key={`link-${keyCounter++}`}
        to={`/vanpedia/${slug}`}
        className="text-rose-600 dark:text-rose-400 font-medium underline decoration-rose-500/40 underline-offset-2 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
        aria-label={`Buka vanpedia ${label}`}
      >
        {label}
      </Link>,
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

  // Collect unique valid slugs referenced in content + explicit prop
  const referencedSlugs: string[] = [];
  const slugRegex = /\[\[([^\]]+)\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = slugRegex.exec(content)) !== null) {
    if (!referencedSlugs.includes(match[1])) referencedSlugs.push(match[1]);
  }
  vanpediaSlugs.forEach(s => {
    if (!referencedSlugs.includes(s)) referencedSlugs.push(s);
  });

  // Replace [[slug]] markers with sentinel placeholders (label derived from term data)
  const withPlaceholders = content.replace(/\[\[([^\]]+)\]\]/g, (_m, slug: string) => {
    const term = findVanpediaTerm(slug);
    const label = term ? t(term.title) : slug;
    return placeholderFor(slug, label);
  });

  // Render markdown to HTML using marked, then split into React nodes so
  // <Link> placeholders don't get mangled by the markdown parser.
  const html = marked.parse(withPlaceholders, {
    gfm: true,
    breaks: true,
    async: false,
  });
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
              {language === 'en' ? 'Related Vanpedia Terms' : 'Istilah Vanpedia Terkait'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {relatedTerms.map(term => (
              <Link
                key={term.slug}
                to={`/vanpedia/${term.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors group"
              >
                <span className="font-medium text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  {t(term.title)}
                </span>
                {term.category && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
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
