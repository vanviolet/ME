import katex from 'katex';
import { marked } from 'marked';
import { renderRichCodeCardHtml } from '../utils/codeRunner';

/**
 * Parses LaTeX math formulas into KaTeX HTML strings.
 */
export function renderInlineFormula(formula: string): string {
  if (!formula) return '';
  const clean = formula.trim().replace(/^\$+|\$+$/g, '');
  try {
    return katex.renderToString(clean, {
      displayMode: false,
      throwOnError: false,
      output: 'htmlAndMathml',
    });
  } catch {
    return clean;
  }
}

/**
 * Parses mixed text and LaTeX math (e.g. "notasi penjumlahan $\\sum$" or "$\\sigma$" or "\\approx").
 * If the string contains $...$, each formula is replaced with KaTeX output while regular text is preserved.
 * If the string is a pure LaTeX macro (starts with \), it is directly rendered with KaTeX.
 */
export function renderTextWithMath(text: string): string {
  if (!text) return '';

  const trimmed = text.trim();

  // 1. If wrapped in $...$ (e.g., "$W$", "$\\sigma$", "$\\nabla_W L$")
  if (/^\$[^$]+\$$/.test(trimmed)) {
    const formula = trimmed.slice(1, -1);
    try {
      return katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return formula;
    }
  }

  // 2. Pure single LaTeX symbol or command without $ (e.g., "\approx", "\in", "\sigma", "\max", "\sum", "\nabla", "\partial")
  if (/^\\[a-zA-Z]+(\{[^}]*\})*$/.test(trimmed)) {
    try {
      return katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return text;
    }
  }

  // 3. Mixed text containing one or more inline $...$ math expressions (e.g. "notasi penjumlahan $\\sum$" or "turunan parsial $\\frac{\\partial L}{\\partial W}$")
  if (text.includes('$')) {
    return text.replace(/\$([^\$\n]+?)\$/g, (_match, formula: string) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        return formula;
      }
    });
  }

  // 4. If text contains standard LaTeX math macros without $ (e.g. "\frac{\partial L}{\partial W}")
  if (text.startsWith('\\frac') || text.startsWith('\\mathbb') || text.startsWith('\\pmod') || text.startsWith('\\sqrt')) {
    try {
      return katex.renderToString(trimmed, {
        displayMode: false,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return text;
    }
  }

  return text;
}

export interface VanpediaTermLookup {
  category?: string;
  title: { en: string; id: string } | string;
  definition?: { en: string; id: string } | string;
  formula?: string;
}

/**
 * Renders an inline, fluid Vanpedia link with hover preview tooltip.
 * Stays strictly inline so text wraps seamlessly without breaking paragraphs.
 */
export function renderVanpediaLinkHtml(
  slug: string,
  label: string,
  term?: VanpediaTermLookup,
  language: 'en' | 'id' = 'id'
): string {
  const safeSlug = encodeURIComponent(slug);
  const renderedLabel = renderTextWithMath(label);

  if (!term) {
    return `<a href="/vanpedia/${safeSlug}" data-vp-link="true" data-vp-slug="${safeSlug}" class="inline text-rose-600 dark:text-rose-400 font-medium underline decoration-rose-500/40 decoration-1 underline-offset-2 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 hover:decoration-rose-500 rounded px-0.5 transition-colors cursor-pointer">${renderedLabel}</a>`;
  }

  const titleStr = typeof term.title === 'string' ? term.title : (language === 'en' ? term.title.en : term.title.id);
  const defStr = term.definition ? (typeof term.definition === 'string' ? term.definition : (language === 'en' ? term.definition.en : term.definition.id)) : '';
  const cleanTitle = titleStr.replace(/"/g, '&quot;');

  const formulaHtml = term.formula
    ? `<span class="block my-1.5 p-1.5 rounded-lg bg-stone-950/70 dark:bg-zinc-900/80 border border-stone-800 dark:border-zinc-700 text-rose-300 dark:text-rose-400 text-center font-mono text-xs overflow-x-auto">${renderInlineFormula(term.formula)}</span>`
    : '';

  return `<span class="relative inline group/vp font-normal">` +
    `<a href="/vanpedia/${safeSlug}" data-vp-link="true" data-vp-slug="${safeSlug}" class="inline text-rose-600 dark:text-rose-400 font-medium underline decoration-rose-500/40 decoration-1 underline-offset-2 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 hover:decoration-rose-500 rounded px-0.5 transition-colors cursor-pointer" title="${cleanTitle}">${renderedLabel}</a>` +
    `<span class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-72 p-3.5 rounded-xl bg-stone-900 text-stone-100 dark:bg-zinc-800 dark:text-zinc-100 shadow-2xl border border-stone-700 dark:border-zinc-700 text-xs z-50 group-hover/vp:block animate-in fade-in zoom-in-95 duration-150 whitespace-normal text-left font-sans">` +
      `<span class="flex items-center justify-between gap-1 mb-1 font-mono text-[10px] text-rose-400 font-bold uppercase tracking-wider">` +
        `<span>${term.category || 'Vanpedia'}</span>` +
        `<span class="text-stone-400 flex items-center gap-1">` +
          `<svg class="w-2.5 h-2.5 inline text-rose-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>` +
          `<span>Vanpedia</span>` +
        `</span>` +
      `</span>` +
      `<span class="font-semibold block text-stone-100 dark:text-white mb-1 text-sm font-reading-sans">${titleStr}</span>` +
      formulaHtml +
      (defStr ? `<span class="text-[11px] text-stone-300 dark:text-zinc-300 block line-clamp-3 leading-relaxed font-reading-sans">${defStr}</span>` : '') +
      `<span class="mt-2 pt-1.5 border-t border-stone-800 dark:border-zinc-700 flex items-center justify-between text-[9px] font-mono text-stone-400">` +
        `<span>${language === 'en' ? 'Click to open encyclopedic entry' : 'Klik untuk ensiklopedia lengkap'}</span>` +
        `<svg class="w-2.5 h-2.5 inline" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>` +
      `</span>` +
    `</span>` +
  `</span>`;
}

export interface RenderOptions {
  getTerm?: (slug: string) => VanpediaTermLookup | undefined;
  language?: 'en' | 'id';
}

/**
 * Parses markdown with full LaTeX math support (KaTeX) and embedded Vanpedia [[slug|label]] links.
 */
export function renderMarkdownWithMath(markdownContent: string, options?: RenderOptions): string {
  if (!markdownContent) return '';

  const mathTokens: string[] = [];
  const codeBlocks: string[] = [];
  const vpTokens: string[] = [];

  // 1. Extract and replace [[slug]] or [[slug|label]] with tokens
  let processed = markdownContent.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, slugRaw: string, labelRaw?: string) => {
    const slug = slugRaw.trim();
    const term = options?.getTerm ? options.getTerm(slug) : undefined;
    
    let label = labelRaw ? labelRaw.trim() : '';
    if (!label && term) {
      label = typeof term.title === 'string' ? term.title : (options?.language === 'en' ? term.title.en : term.title.id);
    }
    if (!label) {
      label = slug;
    }

    const html = renderVanpediaLinkHtml(slug, label, term, options?.language || 'id');
    vpTokens.push(html);
    return `<!--VP_TOKEN_SLOT_${vpTokens.length - 1}-->`;
  });

  // 2. Also handle legacy <!--VP|slug|label--> sentinels if present
  processed = processed.replace(/<!--VP\|([^|]+)\|([^-->]+)-->/g, (_m, slugRaw: string, labelRaw: string) => {
    const slug = decodeURIComponent(slugRaw.trim());
    const term = options?.getTerm ? options.getTerm(slug) : undefined;
    const label = labelRaw.replace(/&#124;/g, '|').trim();
    const html = renderVanpediaLinkHtml(slug, label, term, options?.language || 'id');
    vpTokens.push(html);
    return `<!--VP_TOKEN_SLOT_${vpTokens.length - 1}-->`;
  });

  // 3. Protect code blocks from being processed for math
  processed = processed.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    codeBlocks.push(match);
    return `<!--CODE_BLOCK_SLOT_${codeBlocks.length - 1}-->`;
  });

  // 4. Extract and render Block Math ($$ ... $$)
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_match, formula: string) => {
    const trimmed = formula.trim();
    if (!trimmed) return '';
    try {
      const rendered = katex.renderToString(trimmed, {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
      const html = `<div class="katex-display-container my-5 py-3 px-4 overflow-x-auto text-center rounded-xl bg-stone-100/70 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-700/60 text-stone-900 dark:text-zinc-100 shadow-xs">${rendered}</div>`;
      mathTokens.push(html);
      return `\n\n<!--KATEX_TOKEN_SLOT_${mathTokens.length - 1}-->\n\n`;
    } catch {
      mathTokens.push(`<div class="katex-error text-rose-500 font-mono text-xs my-2">${formula}</div>`);
      return `\n\n<!--KATEX_TOKEN_SLOT_${mathTokens.length - 1}-->\n\n`;
    }
  });

  // 5. Extract and render Inline Math ($ ... $)
  // Negative lookbehind/lookahead for currency ($100, $20.50)
  processed = processed.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (match, prefix: string, formula: string) => {
    const trimmedFormula = formula.trim();
    // Avoid pure numerical currency like $100 or $5.50
    if (/^\d+(\.\d+)?$/.test(trimmedFormula)) {
      return match;
    }

    try {
      const rendered = katex.renderToString(trimmedFormula, {
        displayMode: false,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
      const html = `<span class="katex-inline-container inline-block px-0.5 align-baseline text-stone-900 dark:text-zinc-100 font-serif">${rendered}</span>`;
      mathTokens.push(html);
      return `${prefix}<!--KATEX_TOKEN_SLOT_${mathTokens.length - 1}-->`;
    } catch {
      mathTokens.push(`<span class="katex-inline-error text-rose-500 font-mono text-xs">${formula}</span>`);
      return `${prefix}<!--KATEX_TOKEN_SLOT_${mathTokens.length - 1}-->`;
    }
  });

  // 6. Restore and render protected code blocks into interactive code cards
  processed = processed.replace(/<!--CODE_BLOCK_SLOT_(\d+)-->/g, (_match, index: string) => {
    const idx = parseInt(index, 10);
    const raw = codeBlocks[idx];
    if (raw === undefined) return _match;

    const fencedMatch = raw.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
    if (fencedMatch) {
      return `\n\n` + renderRichCodeCardHtml(fencedMatch[2], fencedMatch[1]) + `\n\n`;
    }
    return raw;
  });

  // 7. Parse markdown via marked
  let html = marked.parse(processed, {
    gfm: true,
    breaks: true,
    async: false,
  }) as string;

  // 8. Restore rendered KaTeX math tokens
  html = html.replace(/<!--KATEX_TOKEN_SLOT_(\d+)-->/g, (_match, index: string) => {
    const idx = parseInt(index, 10);
    return mathTokens[idx] !== undefined ? mathTokens[idx] : _match;
  });

  // 9. Restore Vanpedia token slots
  html = html.replace(/<!--VP_TOKEN_SLOT_(\d+)-->/g, (_match, index: string) => {
    const idx = parseInt(index, 10);
    return vpTokens[idx] !== undefined ? vpTokens[idx] : _match;
  });

  return html;
}

