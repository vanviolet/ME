import katex from 'katex';
import { marked } from 'marked';

/**
 * Parses markdown with full LaTeX math support (KaTeX) and safeguards
 * code fences, inline code, sentinels, and mathematical subscripts/superscripts.
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

export function renderMarkdownWithMath(markdownContent: string): string {
  if (!markdownContent) return '';

  const mathTokens: string[] = [];
  const codeBlocks: string[] = [];
  const sentinels: string[] = [];

  // 1. Protect Vanpedia sentinels (<!--VP|slug|label-->)
  let processed = markdownContent.replace(/<!--VP\|[^>]+-->/g, (match) => {
    sentinels.push(match);
    return `<!--SENTINEL_SLOT_${sentinels.length - 1}-->`;
  });

  // 2. Protect code blocks from being processed for math
  processed = processed.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    codeBlocks.push(match);
    return `<!--CODE_BLOCK_SLOT_${codeBlocks.length - 1}-->`;
  });

  // 3. Extract and render Block Math ($$ ... $$)
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

  // 4. Extract and render Inline Math ($ ... $)
  // Negative lookbehind/lookahead for currency ($100, $20.50) and escaped dollar signs
  processed = processed.replace(/(^|[^\\])\$([^\$\s](?:[^\$]*?[^\$\s])?)\$/g, (match, prefix: string, formula: string) => {
    // Avoid currency like $100 or $5.50
    if (/^\d+(\.\d+)?$/.test(formula)) {
      return match;
    }

    try {
      const rendered = katex.renderToString(formula.trim(), {
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

  // 5. Restore protected code blocks before markdown parsing
  processed = processed.replace(/<!--CODE_BLOCK_SLOT_(\d+)-->/g, (_match, index: string) => {
    const idx = parseInt(index, 10);
    return codeBlocks[idx] !== undefined ? codeBlocks[idx] : _match;
  });

  // 6. Parse markdown via marked
  let html = marked.parse(processed, {
    gfm: true,
    breaks: true,
    async: false,
  }) as string;

  // 7. Restore rendered KaTeX math tokens
  html = html.replace(/<!--KATEX_TOKEN_SLOT_(\d+)-->/g, (_match, index: string) => {
    const idx = parseInt(index, 10);
    return mathTokens[idx] !== undefined ? mathTokens[idx] : _match;
  });

  // 8. Restore Vanpedia sentinels
  html = html.replace(/<!--SENTINEL_SLOT_(\d+)-->/g, (_match, index: string) => {
    const idx = parseInt(index, 10);
    return sentinels[idx] !== undefined ? sentinels[idx] : _match;
  });

  return html;
}

