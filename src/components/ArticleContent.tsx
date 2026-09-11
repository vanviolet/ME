import React, { useMemo } from 'react';
import { vanpediaTermsData } from '../data/articlesData';
import { usePortfolio } from '../context/PortfolioContext';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { renderMarkdownWithMath } from '../lib/renderMath';

interface ArticleContentProps {
  content: string;
  vanpediaSlugs?: string[];
}

function findVanpediaTerm(slug: string) {
  return vanpediaTermsData.find(t => t.slug === slug);
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content, vanpediaSlugs = [] }) => {
  const { language, t } = usePortfolio();
  const navigate = useNavigate();

  // Collect unique valid slugs referenced in content (supports [[slug]] and [[slug|label]])
  const referencedSlugs = useMemo(() => {
    const slugs: string[] = [];
    const slugRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let match: RegExpExecArray | null;

    while ((match = slugRegex.exec(content)) !== null) {
      const slug = match[1].trim();
      if (!slugs.includes(slug)) slugs.push(slug);
    }

    vanpediaSlugs.forEach(s => {
      if (!slugs.includes(s)) slugs.push(s);
    });

    return slugs;
  }, [content, vanpediaSlugs]);

  // Render markdown with KaTeX math and fluid inline Vanpedia links in a single unified HTML pass
  const html = useMemo(() => {
    return renderMarkdownWithMath(content, {
      getTerm: (slug: string) => findVanpediaTerm(slug),
      language,
    });
  }, [content, language]);

  // Event delegation to capture clicks on Vanpedia links inside the rendered HTML and route smoothly
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a[data-vp-link="true"]');
    if (target) {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/vanpedia/')) {
        e.preventDefault();
        navigate(href);
      }
    }
  };

  const relatedTerms = referencedSlugs
    .map(slug => findVanpediaTerm(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof findVanpediaTerm>>[];

  return (
    <>
      <div
        className="max-w-none text-sm sm:text-base leading-relaxed space-y-4 mb-4 select-text"
        data-article-content
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />

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
