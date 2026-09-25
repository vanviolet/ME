import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CodeLanguage,
  SUPPORTED_LANGUAGES,
  tokenizeLine,
  analyzeCode,
  getCompletions,
  formatCode,
  Diagnostic,
  CompletionItem,
} from './codeLanguageSupport';
import {
  Copy,
  Check,
  Wrench,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import { ShadcnSelect } from '../../ui/select';

interface TriliumCodeEditorProps {
  content: string;
  language: string;
  noteTitle: string;
  parentFolderTitle?: string;
  onChangeContent: (newContent: string) => void;
  onChangeLanguage: (newLanguage: string) => void;
}

export const TriliumCodeEditor: React.FC<TriliumCodeEditorProps> = ({
  content,
  language,
  noteTitle,
  onChangeContent,
  onChangeLanguage,
}) => {
  const currentLang = (language as CodeLanguage) || 'typescript';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // States
  const [copied, setCopied] = useState(false);
  const [activeLine, setActiveLine] = useState<number>(1);
  const [activeCol, setActiveCol] = useState<number>(1);
  const [cursorIndex, setCursorIndex] = useState<number>(0);

  // Diagnostics & Hover
  const [hoveredIssue, setHoveredIssue] = useState<Diagnostic | null>(null);
  const [hoverWidgetPos, setHoverWidgetPos] = useState<{ top: number; left: number } | null>(null);

  // IntelliSense Completion
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [selectedCompletionIndex, setSelectedCompletionIndex] = useState<number>(0);
  const [completionPos, setCompletionPos] = useState<{ top: number; left: number }>({ top: 40, left: 80 });

  // Terminal / Run Output Drawer (clean drawer only when run)
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: 'log' | 'warn' | 'error' | 'info'; text: string; time: string }[]>([]);

  // Active language meta
  const langMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.id === currentLang) || SUPPORTED_LANGUAGES[0];
  }, [currentLang]);

  // Real-time static analysis & error diagnostics across all supported languages
  const diagnostics = useMemo(() => {
    return analyzeCode(content, currentLang);
  }, [content, currentLang]);

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warnCount = diagnostics.filter((d) => d.severity === 'warning').length;

  // Split lines
  const codeLines = useMemo(() => {
    return content.split('\n');
  }, [content]);

  // Autocomplete items
  const completionItems = useMemo(() => {
    if (!showCompletion) return [];
    return getCompletions(content, cursorIndex, currentLang);
  }, [showCompletion, content, cursorIndex, currentLang]);

  // Synchronize textarea & pre scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Cursor position tracking
  const updateCursorPosition = (target: HTMLTextAreaElement) => {
    const pos = target.selectionStart || 0;
    setCursorIndex(pos);
    const before = target.value.slice(0, pos);
    const lines = before.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length + 1;
    setActiveLine(lineNum);
    setActiveCol(colNum);

    const top = Math.min((lineNum - 1) * 24 + 32, 380);
    const left = Math.min(colNum * 8 + 60, 420);
    setCompletionPos({ top, left });
  };

  // Textarea input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChangeContent(val);
    updateCursorPosition(e.target);

    // Auto-trigger completion on typing letters or dot
    const pos = e.target.selectionStart;
    const charBefore = val[pos - 1];
    if (charBefore && /[a-zA-Z0-9_$.:]/.test(charBefore)) {
      setShowCompletion(true);
      setSelectedCompletionIndex(0);
    } else {
      setShowCompletion(false);
    }
  };

  // Keyboard navigation inside editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IntelliSense navigation
    if (showCompletion && completionItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCompletionIndex((prev) => (prev + 1) % completionItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCompletionIndex((prev) => (prev - 1 + completionItems.length) % completionItems.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyCompletion(completionItems[selectedCompletionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCompletion(false);
        return;
      }
    }

    // Trigger completion on Ctrl+Space
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault();
      setShowCompletion(true);
      setSelectedCompletionIndex(0);
      return;
    }

    // Run code shortcut: Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRunCode();
      return;
    }

    // Handle Tab key (indent 2 spaces)
    if (e.key === 'Tab' && !showCompletion) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      if (e.shiftKey) {
        const before = content.slice(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        if (content.slice(lineStart, lineStart + 2) === '  ') {
          const newCode = content.slice(0, lineStart) + content.slice(lineStart + 2);
          onChangeContent(newCode);
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = Math.max(0, start - 2);
          }, 0);
        }
      } else {
        const newCode = content.substring(0, start) + '  ' + content.substring(end);
        onChangeContent(newCode);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2;
          updateCursorPosition(target);
        }, 0);
      }
      return;
    }

    // Auto-close brackets & quotes
    const pairs: Record<string, string> = {
      '{': '}',
      '(': ')',
      '[': ']',
      "'": "'",
      '"': '"',
      '`': '`',
    };

    if (pairs[e.key]) {
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const closing = pairs[e.key];

      if (start !== end) {
        e.preventDefault();
        const selected = content.slice(start, end);
        const newCode = content.slice(0, start) + e.key + selected + closing + content.slice(end);
        onChangeContent(newCode);
        setTimeout(() => {
          target.selectionStart = start + 1;
          target.selectionEnd = end + 1;
        }, 0);
        return;
      }
    }
  };

  // Apply chosen autocomplete item
  const applyCompletion = (item: CompletionItem) => {
    if (!textareaRef.current) return;
    const textBefore = content.slice(0, cursorIndex);
    const match = textBefore.match(/([a-zA-Z0-9_$.:-]+)$/);
    const replaceLen = match ? match[1].length : 0;
    const start = cursorIndex - replaceLen;

    const newCode = content.slice(0, start) + item.insertText + content.slice(cursorIndex);
    onChangeContent(newCode);
    setShowCompletion(false);

    const newCursor = start + item.insertText.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
        updateCursorPosition(textareaRef.current);
      }
    }, 0);
  };

  // Quick Format
  const handleFormatCode = () => {
    const formatted = formatCode(content, currentLang);
    onChangeContent(formatted);
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetSnippet = () => {
    if (confirm(`Kembalikan kode ke contoh bawaan ${langMeta.name}?`)) {
      onChangeContent(langMeta.sampleCode);
    }
  };

  // Safe run code in sandboxed context
  const handleRunCode = () => {
    setShowConsole(true);
    const logs: { type: 'log' | 'warn' | 'error' | 'info'; text: string; time: string }[] = [];

    const getTime = () => {
      const now = new Date();
      return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    };

    logs.push({
      type: 'info',
      text: `▶ Menjalankan kode (${langMeta.name})...`,
      time: getTime(),
    });

    if (currentLang !== 'typescript' && currentLang !== 'javascript') {
      logs.push({
        type: 'warn',
        text: `Bahasa ${langMeta.name} membutuhkan runtime compiler eksternal. Sintaks & diagnostik telah divalidasi.`,
        time: getTime(),
      });
      setConsoleLogs(logs);
      return;
    }

    try {
      let executable = content
        .replace(/import\s+type\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '// [simulated import]')
        .replace(/export\s+interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
        .replace(/interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
        .replace(/export\s+type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
        .replace(/type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
        .replace(/:\s*[a-zA-Z0-9_$<>\[\], |&]+(\s*=|\s*\)|\s*,|\s*;)/g, '$1')
        .replace(/export\s+/g, '');

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

      const runner = new Function('console', executable);
      runner(customConsole);

      logs.push({
        type: 'info',
        text: `✔ Program selesai dieksekusi tanpa error.`,
        time: getTime(),
      });
    } catch (err: any) {
      logs.push({
        type: 'error',
        text: `Eksepsi Runtime: ${err.message || String(err)}`,
        time: getTime(),
      });
    }

    setConsoleLogs(logs);
  };

  // Jump cursor to diagnostic line
  const handleJumpToIssue = (issue: Diagnostic) => {
    if (!textareaRef.current) return;
    const lines = content.split('\n');
    let charCount = 0;
    for (let i = 0; i < issue.line - 1 && i < lines.length; i++) {
      charCount += lines[i].length + 1;
    }
    charCount += Math.max(0, issue.column - 1);

    textareaRef.current.focus();
    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = charCount;
    updateCursorPosition(textareaRef.current);
    setHoveredIssue(issue);
    setHoverWidgetPos({
      top: Math.min((issue.line - 1) * 24 + 35, 300),
      left: 70,
    });
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-[500px] bg-[#1e1e1e] text-[#d4d4d4] rounded-2xl overflow-hidden border border-zinc-800 shadow-xl font-mono select-none">
      
      {/* MINIMAL EDITOR TOOLBAR (Clean: only Language selector, Diagnostics badge & Quick Actions) */}
      <div className="bg-[#252526] px-4 py-2 border-b border-[#333333] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
        
        {/* Left: Language Selection & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: langMeta.iconBg, color: langMeta.iconColor }}
            >
              {langMeta.iconText}
            </span>
            <div className="w-40">
              <ShadcnSelect
                value={currentLang}
                onChange={(val) => {
                  onChangeLanguage(String(val));
                  if (content.trim().length <= 35) {
                    const nextMeta = SUPPORTED_LANGUAGES.find((l) => l.id === val);
                    if (nextMeta) onChangeContent(nextMeta.sampleCode);
                  }
                }}
                size="sm"
                options={SUPPORTED_LANGUAGES.map((l) => ({
                  value: l.id,
                  label: `${l.name} (${l.extension})`,
                  badge: l.iconText,
                }))}
              />
            </div>
          </div>

          {/* Diagnostic Indicator Pill */}
          {diagnostics.length > 0 ? (
            <div
              onClick={() => {
                if (diagnostics[0]) handleJumpToIssue(diagnostics[0]);
              }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-sans font-medium cursor-pointer hover:bg-rose-500/25 transition-colors"
              title="Klik untuk melompat ke baris yang bermasalah"
            >
              <AlertTriangle size={12} className="text-rose-400 shrink-0" />
              <span>
                {errorCount} error{errorCount !== 1 ? 's' : ''}
                {warnCount > 0 ? `, ${warnCount} warning${warnCount !== 1 ? 's' : ''}` : ''}
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sintaks Valid</span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons (Format, Run, Copy, Reset) */}
        <div className="flex items-center gap-2">
          {/* Format */}
          <button
            type="button"
            onClick={handleFormatCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2d2d2d] hover:bg-[#383838] text-[#cccccc] hover:text-white border border-[#404040] text-xs cursor-pointer transition-colors"
            title="Rapikan Indentasi Kode"
          >
            <Wrench size={12} />
            <span>Format</span>
          </button>

          {/* Run */}
          <button
            type="button"
            onClick={handleRunCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs cursor-pointer transition-colors shadow-xs"
            title="Jalankan kode (Ctrl+Enter)"
          >
            <Play size={12} className="fill-current" />
            <span>Run</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2d2d2d] hover:bg-[#383838] text-[#cccccc] hover:text-white border border-[#404040] text-xs cursor-pointer transition-colors"
            title="Salin seluruh kode"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Reset Template */}
          <button
            type="button"
            onClick={handleResetSnippet}
            className="p-1.5 rounded-lg hover:bg-[#383838] text-[#858585] hover:text-[#cccccc] cursor-pointer transition-colors"
            title="Kembalikan ke template awal bahasa"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* PURE EDITOR CANVAS (Gutter + Syntax Highlighting Underlay + Editable Textarea) */}
      <div className="flex-1 flex overflow-hidden relative bg-[#1e1e1e]">
        
        {/* Gutter Line Numbers */}
        <div className="w-12 sm:w-14 bg-[#1e1e1e] text-[#858585] py-3 select-none text-right pr-2.5 border-r border-[#2d2d2d] flex flex-col text-xs leading-[24px] font-mono shrink-0">
          {codeLines.map((_, idx) => {
            const lineNum = idx + 1;
            const lineIssues = diagnostics.filter((d) => d.line === lineNum);
            const hasError = lineIssues.some((d) => d.severity === 'error');
            const hasWarn = lineIssues.some((d) => d.severity === 'warning');

            return (
              <div
                key={lineNum}
                className={`h-[24px] flex items-center justify-end gap-1.5 relative ${
                  activeLine === lineNum ? 'text-[#ffffff] font-bold' : ''
                }`}
              >
                {hasError ? (
                  <span
                    onClick={() => handleJumpToIssue(lineIssues[0])}
                    className="w-2 h-2 rounded-full bg-rose-500 hover:scale-125 inline-block shrink-0 cursor-pointer shadow-xs"
                    title={lineIssues[0]?.message}
                  />
                ) : hasWarn ? (
                  <span
                    onClick={() => handleJumpToIssue(lineIssues[0])}
                    className="w-2 h-2 rounded-full bg-amber-400 hover:scale-125 inline-block shrink-0 cursor-pointer shadow-xs"
                    title={lineIssues[0]?.message}
                  />
                ) : null}
                <span className={hasError ? 'text-rose-400 font-bold' : hasWarn ? 'text-amber-400' : ''}>
                  {lineNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Code Writing Surface */}
        <div className="flex-1 relative overflow-auto bg-[#1e1e1e]">
          
          {/* Active Line Highlight Band */}
          <div
            className="absolute left-0 right-0 pointer-events-none bg-[#282828] border-y border-[#333333]/40 transition-all duration-75"
            style={{
              top: `${(activeLine - 1) * 24 + 12}px`,
              height: '24px',
            }}
          />

          {/* Layer 1: Synchronized Syntax Highlighted Underlay */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 p-3 pt-3 m-0 font-mono text-[13px] leading-[24px] whitespace-pre pointer-events-none overflow-hidden"
            style={{
              tabSize: 2,
              fontFamily: `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`,
            }}
          >
            <code>
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const lineIssues = diagnostics.filter((d) => d.line === lineNum);
                const tokens = tokenizeLine(line, currentLang);

                return (
                  <div key={idx} className="h-[24px] relative">
                    {tokens.map((token, tIdx) => {
                      const isErrToken = lineIssues.some(
                        (iss) =>
                          iss.highlightWord &&
                          token.text.trim() === iss.highlightWord.trim()
                      );

                      return (
                        <span
                          key={tIdx}
                          style={{ color: token.color }}
                          className={
                            isErrToken
                              ? 'border-b-2 border-rose-500 border-dashed pb-[1px] font-bold'
                              : token.type === 'comment'
                              ? 'italic'
                              : ''
                          }
                        >
                          {token.text}
                        </span>
                      );
                    })}
                    {lineIssues.length > 0 && !lineIssues[0].highlightWord && (
                      <span className="absolute bottom-0 left-0 right-0 border-b border-rose-500 border-dashed" />
                    )}
                  </div>
                );
              })}
            </code>
          </pre>

          {/* Layer 2: Live Editable Textarea (Transparent text overlay) */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onClick={(e) => updateCursorPosition(e.currentTarget)}
            onKeyUp={(e) => updateCursorPosition(e.currentTarget)}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="absolute inset-0 w-full h-full p-3 pt-3 m-0 bg-transparent text-transparent caret-[#ffffff] font-mono text-[13px] leading-[24px] whitespace-pre resize-none focus:outline-hidden selection:bg-[#264f78] selection:text-white"
            style={{
              tabSize: 2,
              fontFamily: `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`,
              minHeight: `${Math.max(codeLines.length * 24 + 100, 400)}px`,
            }}
          />

          {/* Diagnostic Hover Popup */}
          {hoveredIssue && hoverWidgetPos && (
            <div
              className="absolute z-30 bg-[#252526] text-[#cccccc] border border-[#454545] rounded-xl shadow-2xl p-3 space-y-2 max-w-md animate-in fade-in"
              style={{
                top: `${hoverWidgetPos.top}px`,
                left: `${hoverWidgetPos.left}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#333333] pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono">
                  <XCircle size={14} />
                  <span>[{hoveredIssue.source}] {hoveredIssue.code}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHoveredIssue(null)}
                  className="text-[#858585] hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#e1e1e1] leading-relaxed">
                {hoveredIssue.message}
              </p>

              {hoveredIssue.quickFix && (
                <div className="pt-1 border-t border-[#333333] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (hoveredIssue.quickFix) {
                        const fixed = hoveredIssue.quickFix.applyFix(content);
                        onChangeContent(fixed);
                        setHoveredIssue(null);
                      }
                    }}
                    className="px-2.5 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Wrench size={12} />
                    <span>Perbaiki: {hoveredIssue.quickFix.label}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Autocomplete IntelliSense Popup */}
          {showCompletion && completionItems.length > 0 && (
            <div
              className="absolute z-40 bg-[#252526] border border-[#454545] rounded-xl shadow-2xl overflow-hidden flex flex-col w-80 text-xs animate-in fade-in font-mono"
              style={{
                top: `${completionPos.top}px`,
                left: `${completionPos.left}px`,
              }}
            >
              <div className="px-2.5 py-1 bg-[#1e1e1e] border-b border-[#333333] flex items-center justify-between text-[10px] text-[#858585] uppercase tracking-wider">
                <span>Autocomplete ({langMeta.name})</span>
                <button
                  type="button"
                  onClick={() => setShowCompletion(false)}
                  className="hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-[#303030]">
                {completionItems.map((item, idx) => {
                  const isSelected = idx === selectedCompletionIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => applyCompletion(item)}
                      className={`px-2.5 py-1.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#04395e] text-white font-semibold'
                          : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {item.kind === 'snippet' ? (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-[#68217a] text-purple-200 font-bold shrink-0">
                            ▤
                          </span>
                        ) : item.kind === 'keyword' ? (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-[#007acc] text-white font-bold shrink-0">
                            ⌘
                          </span>
                        ) : item.kind === 'type' ? (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-[#008080] text-cyan-200 font-bold shrink-0">
                            ❖
                          </span>
                        ) : (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-[#b8860b] text-yellow-100 font-bold shrink-0">
                            ƒ
                          </span>
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-[#858585] truncate max-w-[100px] ml-2">
                        {item.detail}
                      </span>
                    </div>
                  );
                })}
              </div>

              {completionItems[selectedCompletionIndex] && (
                <div className="p-2.5 bg-[#1f1f1f] border-t border-[#333333] text-[11px] text-[#a0a0a0] leading-relaxed">
                  <div className="font-bold text-[#4ec9b0] mb-0.5">
                    {completionItems[selectedCompletionIndex].detail}
                  </div>
                  <p>{completionItems[selectedCompletionIndex].documentation}</p>
                  <div className="mt-1 text-[10px] text-[#666666] flex items-center justify-between">
                    <span>Tekan Tab / Enter untuk menyisipkan</span>
                    <span>Esc untuk tutup</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Output Console (Collapsible, shown when Run is pressed) */}
      {showConsole && (
        <div className="h-44 bg-[#181818] border-t border-[#333333] flex flex-col shrink-0">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#222222] border-b border-[#333333] text-xs">
            <span className="font-semibold text-zinc-300">Terminal / Hasil Eksekusi</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="text-[11px] text-[#858585] hover:text-white cursor-pointer"
              >
                Bersihkan
              </button>
              <button
                type="button"
                onClick={() => setShowConsole(false)}
                className="p-1 hover:text-white text-[#858585] cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2.5 overflow-y-auto text-xs font-mono space-y-1">
            {consoleLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[#666666] text-[10px] shrink-0 select-none">
                  [{log.time}]
                </span>
                <span
                  className={
                    log.type === 'error'
                      ? 'text-rose-400 font-bold'
                      : log.type === 'warn'
                      ? 'text-amber-300'
                      : log.type === 'info'
                      ? 'text-sky-400'
                      : 'text-[#d4d4d4]'
                  }
                >
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Minimal Footer: Line, Col, and Language indicator */}
      <div className="bg-[#181818] text-[#858585] px-4 py-1.5 flex items-center justify-between text-xs border-t border-[#2d2d2d] select-none shrink-0">
        <div className="flex items-center gap-3">
          <span>Baris {activeLine}, Kolom {activeCol}</span>
          <span>•</span>
          <span>Tab: 2 spasi</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{langMeta.name}</span>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">(Ctrl+Space Autocomplete)</span>
        </div>
      </div>

    </div>
  );
};
