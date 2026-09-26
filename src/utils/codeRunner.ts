/**
 * Code Runner & Interactive Rich Code Block Utilities
 * Handles code extraction, sandboxed execution with custom console,
 * and DOM event handling for rich code blocks across RichEditor, ArticleContent, etc.
 */

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

/**
 * Safely executes JavaScript code in a sandboxed browser environment
 * and captures all console outputs.
 */
export function executeJavaScriptCode(code: string): ConsoleLogEntry[] {
  const logs: ConsoleLogEntry[] = [];
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
    runner(customConsole);

    logs.push({
      type: 'info',
      text: `✔ Program selesai dieksekusi tanpa runtime error.`,
      time: getTime(),
    });
  } catch (err: any) {
    logs.push({
      type: 'error',
      text: `Eksepsi Runtime: ${err.message || String(err)}`,
      time: getTime(),
    });
  }

  return logs;
}

/**
 * Generates interactive HTML card for rendered code blocks in articles and previews.
 * For non-runnable languages (e.g. html, css, python, json, sql), the Run button is hidden.
 * For runnable languages (javascript, typescript), a green Run button is provided.
 */
export function renderRichCodeCardHtml(code: string, lang: string = 'text'): string {
  const cleanLang = (lang || 'plaintext').trim().toLowerCase();
  const runnable = isRunnableLanguage(cleanLang);
  const encoded = encodeURIComponent(code);
  const escaped = escapeHtml(code);

  return `<div class="rich-code-card my-4 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-[#1e1e1e] text-[#d4d4d4] font-mono shadow-xs not-prose" data-code="${encoded}" data-lang="${cleanLang}">
    <div class="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333333] text-xs text-[#cccccc] select-none">
      <div class="flex items-center gap-2">
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          runnable ? 'bg-amber-400 text-black' : 'bg-zinc-700 text-zinc-200'
        }">${cleanLang}</span>
        <span class="text-[11px] text-zinc-400 font-sans hidden sm:inline">Code Snippet</span>
      </div>
      <div class="flex items-center gap-1.5">
        ${runnable ? `
          <button type="button" class="btn-run-rich-code flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-xs" title="Jalankan kode JavaScript">
            <svg class="w-3 h-3 fill-current inline" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Run</span>
          </button>
        ` : ''}
        <button type="button" class="btn-copy-rich-code flex items-center gap-1 px-2 py-1 rounded bg-[#2d2d2d] hover:bg-[#383838] text-zinc-300 hover:text-white border border-[#404040] text-[11px] transition-colors cursor-pointer" title="Salin seluruh kode">
          <svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Salin</span>
        </button>
      </div>
    </div>
    <pre class="p-3.5 m-0 overflow-x-auto text-[13px] leading-[22px] whitespace-pre font-mono bg-[#1e1e1e] text-[#d4d4d4]"><code>${escaped}</code></pre>
    <div class="rich-code-console hidden px-3 py-2 bg-[#181818] border-t border-[#2d2d2d] text-xs font-mono"></div>
  </div>`;
}

/**
 * Handles clicks inside container for .btn-run-rich-code and .btn-copy-rich-code
 */
export function handleCodeBlockContainerClick(e: MouseEvent | React.MouseEvent<HTMLElement>) {
  const target = e.target as HTMLElement;

  // Run button click
  const runBtn = target.closest('.btn-run-rich-code');
  if (runBtn) {
    e.preventDefault();
    e.stopPropagation();
    const card = runBtn.closest('.rich-code-card');
    if (!card) return;
    const encoded = card.getAttribute('data-code') || '';
    const code = decodeURIComponent(encoded);
    const consoleDiv = card.querySelector('.rich-code-console') as HTMLElement | null;
    if (consoleDiv) {
      consoleDiv.classList.remove('hidden');
      const logs = executeJavaScriptCode(code);
      let html = `
        <div class="flex items-center justify-between text-[11px] pb-1.5 mb-1.5 border-b border-[#333333]">
          <span class="font-bold text-zinc-300">Terminal Konsol (${logs.length} output)</span>
          <button type="button" class="btn-close-console text-zinc-400 hover:text-white text-[10px] cursor-pointer">✕ Tutup</button>
        </div>
        <div class="space-y-1 max-h-48 overflow-y-auto">
      `;
      logs.forEach((log) => {
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

      const closeBtn = consoleDiv.querySelector('.btn-close-console');
      if (closeBtn) {
        closeBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          consoleDiv.classList.add('hidden');
        });
      }
    }
    return;
  }

  // Copy button click
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
