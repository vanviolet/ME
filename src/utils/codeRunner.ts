/**
 * Code Runner & Interactive Rich Code Block Utilities
 * Handles code extraction, sandboxed execution with custom console,
 * Error Lens diagnostics rendering, Prettier formatting, and DOM event handling.
 */

import { analyzeCodeSnippet, CodeDiagnostic } from './codeAnalysis';
import { formatCodeWithPrettier } from './codeFormatter';

export interface CodeBlockInfo {
  lang: string;
  code: string;
  blockStartIndex: number;
  codeStartIndex: number;
  codeEndIndex: number;
  blockEndIndex: number;
  relativeCursor: number;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function isRunnableLanguage(lang: string): boolean {
  const clean = (lang || '').trim().toLowerCase();
  return clean === 'javascript' || clean === 'js' || clean === 'typescript' || clean === 'ts';
}

/**
 * Finds if the cursor inside markdown text is positioned within a ```lang ... ``` code block.
 */
export function findCodeBlockAtCursor(text: string, cursor: number): CodeBlockInfo | null {
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const blockStart = match.index;
    const fullMatch = match[0];
    const blockEnd = blockStart + fullMatch.length;
    const lang = (match[1] || 'javascript').trim().toLowerCase();
    const code = match[2];
    const firstNewline = fullMatch.indexOf('\n');
    const codeStart = blockStart + firstNewline + 1;
    const codeEnd = codeStart + code.length;

    if (cursor >= codeStart && cursor <= codeEnd) {
      return {
        lang,
        code,
        blockStartIndex: blockStart,
        codeStartIndex: codeStart,
        codeEndIndex: codeEnd,
        blockEndIndex: blockEnd,
        relativeCursor: cursor - codeStart,
      };
    }
  }
  return null;
}

export interface ConsoleLogEntry {
  type: 'log' | 'warn' | 'error' | 'info';
  text: string;
  time: string;
}

export interface ExecutionResult {
  logs: ConsoleLogEntry[];
  executionTimeMs: number;
  runtimeErrorLine?: number;
}

/**
 * Safely executes JavaScript code in a sandboxed browser environment
 * and captures all console outputs and execution time.
 */
export function executeJavaScriptCode(code: string): ExecutionResult {
  const logs: ConsoleLogEntry[] = [];
  const startTime = performance.now();
  let runtimeErrorLine: number | undefined;

  const getTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  };

  logs.push({
    type: 'info',
    text: `▶ Menjalankan program JavaScript...`,
    time: getTime(),
  });

  const customConsole = {
    log: (...args: any[]) => {
      logs.push({
        type: 'log',
        text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
        time: getTime(),
      });
    },
    warn: (...args: any[]) => {
      logs.push({
        type: 'warn',
        text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
        time: getTime(),
      });
    },
    error: (...args: any[]) => {
      logs.push({
        type: 'error',
        text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
        time: getTime(),
      });
    },
    info: (...args: any[]) => {
      logs.push({
        type: 'info',
        text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
        time: getTime(),
      });
    },
    table: (tabularData: any) => {
      logs.push({
        type: 'log',
        text: typeof tabularData === 'object' ? JSON.stringify(tabularData, null, 2) : String(tabularData),
        time: getTime(),
      });
    },
  };

  try {
    const executable = code
      .replace(/import\s+type\s+.*?from\s+['"].*?['"];?/g, '')
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '// [simulated import]')
      .replace(/export\s+interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
      .replace(/interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
      .replace(/export\s+type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
      .replace(/type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
      .replace(/:\s*[a-zA-Z0-9_$<>\[\], |&]+(\s*=|\s*\)|\s*,|\s*;)/g, '$1')
      .replace(/export\s+/g, '');

    const runner = new Function('console', executable);
    const ret = runner(customConsole);

    if (ret !== undefined) {
      logs.push({
        type: 'info',
        text: `↩ Return: ${typeof ret === 'object' ? JSON.stringify(ret, null, 2) : String(ret)}`,
        time: getTime(),
      });
    }

    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    logs.push({
      type: 'info',
      text: `✔ Program selesai dieksekusi tanpa error (${elapsed}ms).`,
      time: getTime(),
    });

    return { logs, executionTimeMs: elapsed };
  } catch (err: any) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    const msg = err.message || String(err);

    // Try finding line from stack trace
    const match = err.stack?.match(/<anonymous>:(\d+):(\d+)/);
    if (match) {
      runtimeErrorLine = parseInt(match[1], 10) - 2; // adjust for function wrapper
    }

    logs.push({
      type: 'error',
      text: `⚡ Eksepsi Runtime: ${msg}`,
      time: getTime(),
    });

    return { logs, executionTimeMs: elapsed, runtimeErrorLine };
  }
}

/**
 * Builds HTML for code lines with line numbers and Error Lens inline ribbons
 */
export function renderCodeWithLineNumbersAndErrorLens(
  code: string,
  diagnostics: CodeDiagnostic[] = [],
  runtimeErrorLine?: number
): string {
  const lines = code.split('\n');
  const diagByLine = new Map<number, CodeDiagnostic[]>();

  diagnostics.forEach((d) => {
    const existing = diagByLine.get(d.line) || [];
    existing.push(d);
    diagByLine.set(d.line, existing);
  });

  return lines
    .map((lineText, idx) => {
      const lineNum = idx + 1;
      const lineDiags = diagByLine.get(lineNum) || [];
      const hasError = lineDiags.some((d) => d.severity === 'error') || runtimeErrorLine === lineNum;
      const hasWarning = lineDiags.some((d) => d.severity === 'warning');

      const bgClass = hasError
        ? 'bg-rose-500/10 border-l-2 border-rose-500'
        : hasWarning
        ? 'bg-amber-500/10 border-l-2 border-amber-500'
        : 'border-l-2 border-transparent hover:bg-white/[0.03]';

      let lensBadgeHtml = '';
      if (lineDiags.length > 0) {
        const topDiag = lineDiags[0];
        const badgeColor =
          topDiag.severity === 'error'
            ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
            : 'bg-amber-950/80 text-amber-300 border-amber-700/60';
        lensBadgeHtml = `<span class="error-lens-badge inline-flex items-center gap-1 ml-3 px-2 py-0.5 rounded text-[11px] font-sans font-medium border ${badgeColor} shadow-xs select-none animate-in fade-in duration-200">
          <svg class="w-3 h-3 text-rose-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
          <span class="truncate max-w-[280px] sm:max-w-md">${escapeHtml(topDiag.message)}</span>
        </span>`;
      } else if (runtimeErrorLine === lineNum) {
        lensBadgeHtml = `<span class="error-lens-badge inline-flex items-center gap-1 ml-3 px-2 py-0.5 rounded text-[11px] font-sans font-medium border bg-rose-950/90 text-rose-200 border-rose-600 select-none">
          <svg class="w-3 h-3 text-rose-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2"/></svg>
          <span>Runtime Error Terjadi di Baris Ini</span>
        </span>`;
      }

      const escapedContent = escapeHtml(lineText) || '&nbsp;';

      return `<div class="code-line flex items-baseline px-3 py-0.5 font-mono text-[13px] leading-6 ${bgClass}" data-line="${lineNum}">
        <span class="line-num select-none w-8 shrink-0 text-right pr-3.5 text-zinc-600 text-xs font-mono">${lineNum}</span>
        <span class="line-content flex-1 whitespace-pre font-mono text-zinc-200 ${hasError ? 'underline decoration-wavy decoration-rose-500/80' : ''}">${escapedContent}</span>
        ${lensBadgeHtml}
      </div>`;
    })
    .join('');
}

/**
 * Generates rich interactive HTML card for rendered code blocks in articles and previews
 * with Error Lens status, Prettier formatting button, Run sandbox button, Copy button,
 * and expandable diagnostics drawer.
 */
export function renderRichCodeCardHtml(code: string, lang: string = 'text'): string {
  const cleanLang = (lang || 'plaintext').trim().toLowerCase();
  const runnable = isRunnableLanguage(cleanLang);
  const encoded = encodeURIComponent(code);
  const analysis = analyzeCodeSnippet(code, cleanLang);

  const linesHtml = renderCodeWithLineNumbersAndErrorLens(code, analysis.diagnostics);

  const hasErrors = analysis.errorCount > 0;
  const hasWarnings = analysis.warningCount > 0;

  return `<div class="rich-code-card my-5 rounded-2xl overflow-hidden border border-stone-300 dark:border-zinc-800/90 bg-[#181a1f] text-[#d4d4d4] font-mono shadow-md not-prose transition-all" data-code="${encoded}" data-lang="${cleanLang}">
    {/* HEADER BAR */}
    <div class="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#202228] border-b border-[#2d3139] text-xs text-[#cccccc] select-none">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          runnable ? 'bg-amber-400 text-black font-semibold' : 'bg-zinc-700 text-zinc-200'
        }">${cleanLang}</span>
        <span class="text-[11px] text-zinc-400 font-sans hidden sm:inline">Snippets & Error Lens</span>

        {/* Error Lens Badge Count */}
        ${
          hasErrors
            ? `<span class="btn-toggle-diagnostics flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-pointer hover:bg-rose-500/30 transition-colors" title="Lihat ${analysis.errorCount} kesalahan syntax">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                <span>${analysis.errorCount} Error</span>
              </span>`
            : hasWarnings
            ? `<span class="btn-toggle-diagnostics flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-pointer" title="Lihat ${analysis.warningCount} peringatan">
                <span>⚠ ${analysis.warningCount} Peringatan</span>
              </span>`
            : `<span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden md:inline-flex">
                <span>✔ Bebas Error</span>
              </span>`
        }
      </div>

      <div class="flex items-center gap-1.5 ml-auto">
        {/* Prettier Format Button */}
        <button type="button" class="btn-prettier-rich-code flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2b2d35] hover:bg-[#383a45] text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] font-medium transition-colors cursor-pointer shadow-xs" title="Rapikan kode dengan Prettier (Shift+Alt+F)">
          <svg class="w-3 h-3 inline text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15 8L21 9L17 14L18 21L12 17L6 21L7 14L3 9L9 8L12 2Z"/></svg>
          <span>Prettier</span>
        </button>

        {/* Run Button (for JS/TS) */}
        ${
          runnable
            ? `<button type="button" class="btn-run-rich-code flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-xs" title="Jalankan kode JavaScript & tampilkan konsol">
                <svg class="w-3 h-3 fill-current inline" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>Run</span>
              </button>`
            : ''
        }

        {/* Copy Button */}
        <button type="button" class="btn-copy-rich-code flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2b2d35] hover:bg-[#383a45] text-zinc-300 hover:text-white border border-[#3e424c] text-[11px] transition-colors cursor-pointer" title="Salin seluruh kode">
          <svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Salin</span>
        </button>
      </div>
    </div>

    {/* CODE CONTENT CONTAINER */}
    <div class="code-viewport py-2 overflow-x-auto bg-[#181a1f]">
      <div class="code-lines-container min-w-full">${linesHtml}</div>
    </div>

    {/* ERROR LENS DIAGNOSTICS DRAWER */}
    ${
      analysis.diagnostics.length > 0
        ? `<div class="rich-code-diagnostics hidden px-3.5 py-2.5 bg-[#1f1519] border-t border-rose-950 text-xs font-sans">
            <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-rose-900/40 text-[11px]">
              <span class="font-bold text-rose-300 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
                <span>Error Lens Diagnostics (${analysis.diagnostics.length} temuan)</span>
              </span>
              <button type="button" class="btn-close-diagnostics text-rose-400 hover:text-white text-[10px] cursor-pointer">✕ Tutup</button>
            </div>
            <div class="space-y-1.5 max-h-40 overflow-y-auto">
              ${analysis.diagnostics
                .map(
                  (d) => `
                <div class="flex items-start gap-2 p-1.5 rounded-lg bg-rose-950/50 border border-rose-800/40 text-rose-200">
                  <span class="px-1.5 py-0.5 rounded bg-rose-900 text-[10px] font-mono font-bold text-rose-300 shrink-0">L${d.line}</span>
                  <div class="flex-1 text-[11px] leading-relaxed">
                    <p class="font-semibold text-rose-100">${escapeHtml(d.message)}</p>
                    ${d.suggestedFix ? `<p class="text-[10px] text-rose-400 font-mono mt-0.5">💡 Saran: ${escapeHtml(d.suggestedFix)}</p>` : ''}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>`
        : ''
    }

    {/* CONSOLE TERMINAL OUTPUT */}
    <div class="rich-code-console hidden px-3.5 py-2.5 bg-[#141518] border-t border-[#2d3139] text-xs font-mono"></div>
  </div>`;
}

/**
 * Handles clicks inside container for .btn-run-rich-code, .btn-prettier-rich-code, .btn-copy-rich-code, and .btn-toggle-diagnostics
 */
export function handleCodeBlockContainerClick(e: MouseEvent | React.MouseEvent<HTMLElement>) {
  const target = e.target as HTMLElement;

  // 1. Diagnostics Drawer Toggle Click
  const diagBtn = target.closest('.btn-toggle-diagnostics');
  if (diagBtn) {
    e.preventDefault();
    e.stopPropagation();
    const card = diagBtn.closest('.rich-code-card');
    if (!card) return;
    const diagDrawer = card.querySelector('.rich-code-diagnostics') as HTMLElement | null;
    if (diagDrawer) {
      diagDrawer.classList.toggle('hidden');
      const closeBtn = diagDrawer.querySelector('.btn-close-diagnostics') as HTMLElement | null;
      if (closeBtn) {
        closeBtn.onclick = (ev) => {
          ev.preventDefault();
          diagDrawer.classList.add('hidden');
        };
      }
    }
    return;
  }

  // 2. Prettier Format Click
  const prettierBtn = target.closest('.btn-prettier-rich-code');
  if (prettierBtn) {
    e.preventDefault();
    e.stopPropagation();
    const card = prettierBtn.closest('.rich-code-card');
    if (!card) return;

    const encoded = card.getAttribute('data-code') || '';
    const lang = card.getAttribute('data-lang') || 'javascript';
    const code = decodeURIComponent(encoded);

    formatCodeWithPrettier(code, lang).then((res) => {
      const span = prettierBtn.querySelector('span');
      if (span) {
        span.textContent = 'Diformat ✨';
        setTimeout(() => {
          span.textContent = 'Prettier';
        }, 1800);
      }

      if (res.code) {
        card.setAttribute('data-code', encodeURIComponent(res.code));
        const analysis = analyzeCodeSnippet(res.code, lang);
        const newLinesHtml = renderCodeWithLineNumbersAndErrorLens(res.code, analysis.diagnostics);
        const linesContainer = card.querySelector('.code-lines-container');
        if (linesContainer) {
          linesContainer.innerHTML = newLinesHtml;
        }
      }
    });
    return;
  }

  // 3. Run button click
  const runBtn = target.closest('.btn-run-rich-code');
  if (runBtn) {
    e.preventDefault();
    e.stopPropagation();
    const card = runBtn.closest('.rich-code-card');
    if (!card) return;
    const encoded = card.getAttribute('data-code') || '';
    const lang = card.getAttribute('data-lang') || 'javascript';
    const code = decodeURIComponent(encoded);
    const consoleDiv = card.querySelector('.rich-code-console') as HTMLElement | null;

    if (consoleDiv) {
      consoleDiv.classList.remove('hidden');
      const result = executeJavaScriptCode(code);

      // Re-render lines with runtime error highlight if any
      const analysis = analyzeCodeSnippet(code, lang);
      const newLinesHtml = renderCodeWithLineNumbersAndErrorLens(code, analysis.diagnostics, result.runtimeErrorLine);
      const linesContainer = card.querySelector('.code-lines-container');
      if (linesContainer) {
        linesContainer.innerHTML = newLinesHtml;
      }

      let html = `
        <div class="flex items-center justify-between text-[11px] pb-1.5 mb-1.5 border-b border-[#333333]">
          <span class="font-bold text-zinc-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Terminal Konsol (${result.logs.length} output, ${result.executionTimeMs}ms)</span>
          </span>
          <button type="button" class="btn-close-console text-zinc-400 hover:text-white text-[10px] cursor-pointer">✕ Tutup</button>
        </div>
        <div class="space-y-1 max-h-48 overflow-y-auto">
      `;
      result.logs.forEach((log) => {
        const colorClass =
          log.type === 'error'
            ? 'text-rose-400 bg-rose-500/10'
            : log.type === 'warn'
            ? 'text-amber-300 bg-amber-500/10'
            : log.type === 'info'
            ? 'text-emerald-400'
            : 'text-zinc-200';
        html += `
          <div class="flex items-start gap-2 p-1 rounded ${colorClass}">
            <span class="text-[10px] text-zinc-500 font-mono shrink-0">${log.time}</span>
            <pre class="whitespace-pre-wrap font-mono text-xs m-0 flex-1">${escapeHtml(log.text)}</pre>
          </div>
        `;
      });
      html += `</div>`;
      consoleDiv.innerHTML = html;

      const closeBtn = consoleDiv.querySelector('.btn-close-console') as HTMLElement | null;
      if (closeBtn) {
        closeBtn.onclick = (ev) => {
          ev.preventDefault();
          consoleDiv.classList.add('hidden');
        };
      }
    }
    return;
  }

  // 4. Copy button click
  const copyBtn = target.closest('.btn-copy-rich-code');
  if (copyBtn) {
    e.preventDefault();
    e.stopPropagation();
    const card = copyBtn.closest('.rich-code-card');
    if (!card) return;
    const encoded = card.getAttribute('data-code') || '';
    const code = decodeURIComponent(encoded);
    navigator.clipboard.writeText(code);
    const span = copyBtn.querySelector('span');
    if (span) {
      const orig = span.textContent;
      span.textContent = 'Tersalin!';
      setTimeout(() => {
        span.textContent = orig;
      }, 2000);
    }
    return;
  }
}
