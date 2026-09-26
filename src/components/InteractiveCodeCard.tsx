import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Copy,
  Check,
  Wand2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Terminal,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings2,
  WrapText,
  FileCode,
  Info,
} from 'lucide-react';
import { analyzeCodeSnippet, CodeDiagnostic } from '../utils/codeAnalysis';
import { formatCodeWithPrettier } from '../utils/codeFormatter';
import { executeJavaScriptCode, isRunnableLanguage, ConsoleLogEntry } from '../utils/codeRunner';
import { getCompletionsForContext, CompletionItem } from '../utils/codeCompletion';

interface InteractiveCodeCardProps {
  initialCode: string;
  language?: string;
  onChange?: (newCode: string) => void;
  readOnly?: boolean;
  title?: string;
}

export const InteractiveCodeCard: React.FC<InteractiveCodeCardProps> = ({
  initialCode,
  language = 'javascript',
  onChange,
  readOnly = false,
  title,
}) => {
  const [code, setCode] = useState(initialCode);
  const [currentLang, setCurrentLang] = useState(language);
  const [copied, setCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [runtimeErrorLine, setRuntimeErrorLine] = useState<number | undefined>(undefined);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showErrorLens, setShowErrorLens] = useState(true);

  // Completion State
  const [completions, setCompletions] = useState<CompletionItem[]>([]);
  const [activeCompletionIdx, setActiveCompletionIdx] = useState(0);
  const [showCompletionMenu, setShowCompletionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync when initialCode changes externally
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const analysis = useMemo(() => {
    return analyzeCodeSnippet(code, currentLang);
  }, [code, currentLang]);

  const runnable = isRunnableLanguage(currentLang);

  // Handle Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Prettier Formatting
  const handleFormat = async () => {
    setIsFormatting(true);
    try {
      const res = await formatCodeWithPrettier(code, currentLang);
      if (res.code) {
        setCode(res.code);
        onChange?.(res.code);
        setFormatSuccess(true);
        setTimeout(() => setFormatSuccess(false), 2000);
      }
    } finally {
      setIsFormatting(false);
    }
  };

  // Handle Code Execution
  const handleRun = () => {
    setShowConsole(true);
    const result = executeJavaScriptCode(code);
    setLogs(result.logs);
    setExecutionTime(result.executionTimeMs);
    setRuntimeErrorLine(result.runtimeErrorLine);
  };

  // Reset to initial
  const handleReset = () => {
    setCode(initialCode);
    onChange?.(initialCode);
    setLogs([]);
    setShowConsole(false);
    setRuntimeErrorLine(undefined);
  };

  // Handle Textarea Input and Autocompletion triggering
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onChange?.(newCode);

    const cursor = e.target.selectionStart;
    const textBefore = newCode.slice(0, cursor);
    const suggestions = getCompletionsForContext(textBefore, currentLang);

    if (suggestions.length > 0 && cursor > 0) {
      // Calculate cursor position for popup
      const lines = textBefore.split('\n');
      const currentLineIdx = lines.length - 1;
      const currentLineText = lines[currentLineIdx];
      const charWidth = 8;
      const lineHeight = 24;

      setMenuPosition({
        top: Math.min(300, (currentLineIdx + 1) * lineHeight + 10),
        left: Math.min(350, Math.max(40, currentLineText.length * charWidth + 20)),
      });
      setCompletions(suggestions);
      setActiveCompletionIdx(0);
      setShowCompletionMenu(true);
    } else {
      setShowCompletionMenu(false);
    }
  };

  // Insert Completion
  const insertCompletion = (item: CompletionItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const textBefore = code.slice(0, cursor);
    const textAfter = code.slice(cursor);

    const match = textBefore.match(/([a-zA-Z0-9_$.]+)$/);
    const replaceLength = match ? match[1].length : 0;
    const prefix = textBefore.slice(0, textBefore.length - replaceLength);

    const newCode = prefix + item.insertText + textAfter;
    setCode(newCode);
    onChange?.(newCode);
    setShowCompletionMenu(false);

    setTimeout(() => {
      textarea.focus();
      const newCursor = prefix.length + item.insertText.length + (item.cursorOffset || 0);
      textarea.setSelectionRange(newCursor, newCursor);
    }, 20);
  };

  // Keyboard Navigation for Autocompletion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCompletionMenu && completions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveCompletionIdx((prev) => (prev + 1) % completions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCompletionIdx((prev) => (prev - 1 + completions.length) % completions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertCompletion(completions[activeCompletionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        setShowCompletionMenu(false);
        return;
      }
    }

    // Tab key inside code block for indentation
    if (e.key === 'Tab' && !showCompletionMenu) {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      onChange?.(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 10);
      return;
    }

    // Prettier Shortcut: Shift + Alt + F or Ctrl + Alt + F
    if (e.shiftKey && (e.altKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      handleFormat();
      return;
    }
  };

  // Group diagnostics by line
  const diagByLine = useMemo(() => {
    const map = new Map<number, CodeDiagnostic[]>();
    analysis.diagnostics.forEach((d) => {
      const arr = map.get(d.line) || [];
      arr.push(d);
      map.set(d.line, arr);
    });
    return map;
  }, [analysis.diagnostics]);

  const lines = code.split('\n');

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-stone-300 dark:border-zinc-800 bg-[#181a1f] text-zinc-200 font-mono shadow-md select-text">
      {/* HEADER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#202228] border-b border-[#2d3139] text-xs select-none">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value)}
            disabled={readOnly}
            className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-amber-400 border border-zinc-700 focus:outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
          </select>

          {title && <span className="text-zinc-400 font-sans text-xs hidden sm:inline">{title}</span>}

          {/* Error Lens Indicator Badge */}
          {showErrorLens && (
            <>
              {analysis.errorCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors cursor-pointer"
                  title="Klik untuk melihat detail error"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>{analysis.errorCount} Error</span>
                  {showDiagnostics ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              ) : analysis.warningCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer"
                  title="Klik untuk melihat peringatan"
                >
                  <AlertTriangle size={10} />
                  <span>{analysis.warningCount} Peringatan</span>
                  {showDiagnostics ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={10} />
                  <span>Valid</span>
                </span>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Prettier Formatter */}
          <button
            type="button"
            onClick={handleFormat}
            disabled={isFormatting}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer shadow-xs ${
              formatSuccess
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-[#2b2d35] hover:bg-[#383a45] text-amber-300 hover:text-amber-200 border-amber-500/30'
            }`}
            title="Rapikan kode dengan Prettier (Shift+Alt+F)"
          >
            <Wand2 size={12} className={isFormatting ? 'animate-spin' : 'text-amber-400'} />
            <span>{formatSuccess ? 'Diformat ✨' : 'Prettier'}</span>
          </button>

          {/* Run Code Sandbox */}
          {runnable && (
            <button
              type="button"
              onClick={handleRun}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-xs"
              title="Jalankan kode JavaScript & tampilkan konsol"
            >
              <Play size={11} className="fill-current" />
              <span>Run</span>
            </button>
          )}

          {/* Reset button */}
          {code !== initialCode && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-colors"
              title="Kembalikan ke kode awal"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2b2d35] hover:bg-[#383a45] text-zinc-300 hover:text-white border border-[#3e424c] text-[11px] transition-colors cursor-pointer"
            title="Salin seluruh kode"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>
        </div>
      </div>

      {/* CODE EDITOR / DISPLAY WITH ERROR LENS RIBBONS */}
      <div className="relative py-2 bg-[#181a1f] min-h-[120px] overflow-hidden">
        {/* Lines with Error Lens view */}
        <div className="overflow-x-auto">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const lineDiags = diagByLine.get(lineNum) || [];
            const hasError = lineDiags.some((d) => d.severity === 'error') || runtimeErrorLine === lineNum;
            const hasWarning = lineDiags.some((d) => d.severity === 'warning');

            const bgClass = hasError
              ? 'bg-rose-500/10 border-l-2 border-rose-500'
              : hasWarning
              ? 'bg-amber-500/10 border-l-2 border-amber-500'
              : 'border-l-2 border-transparent';

            return (
              <div
                key={lineNum}
                className={`flex items-baseline px-3 py-0.5 font-mono text-[13px] leading-6 ${bgClass}`}
              >
                {showLineNumbers && (
                  <span className="line-num select-none w-8 shrink-0 text-right pr-3.5 text-zinc-600 text-xs font-mono">
                    {lineNum}
                  </span>
                )}

                <span
                  className={`line-content flex-1 whitespace-pre font-mono text-zinc-200 ${
                    hasError ? 'underline decoration-wavy decoration-rose-500/80' : ''
                  }`}
                >
                  {lineText || ' '}
                </span>

                {/* ERROR LENS INLINE BADGE */}
                {showErrorLens && lineDiags.length > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 ml-3 px-2 py-0.5 rounded text-[11px] font-sans font-medium border shadow-xs select-none animate-in fade-in duration-200 ${
                      lineDiags[0].severity === 'error'
                        ? 'bg-rose-950/90 text-rose-300 border-rose-700/60'
                        : 'bg-amber-950/90 text-amber-300 border-amber-700/60'
                    }`}
                  >
                    <AlertTriangle size={11} className="text-rose-400 shrink-0" />
                    <span className="truncate max-w-[280px] sm:max-w-md">{lineDiags[0].message}</span>
                  </span>
                )}

                {showErrorLens && runtimeErrorLine === lineNum && lineDiags.length === 0 && (
                  <span className="inline-flex items-center gap-1 ml-3 px-2 py-0.5 rounded text-[11px] font-sans font-medium border bg-rose-950/90 text-rose-200 border-rose-600 select-none">
                    <XCircle size={11} className="text-rose-400 shrink-0" />
                    <span>Runtime Error Terjadi di Baris Ini</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Code Input Layer (Active when editing) */}
        {!readOnly && (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="absolute inset-0 w-full h-full p-2 pl-12 bg-transparent text-transparent caret-rose-400 font-mono text-[13px] leading-6 resize-none focus:outline-none overflow-y-auto"
            style={{ tabSize: 2 }}
          />
        )}

        {/* AUTOCOMPLETION INTELLISENSE POPUP */}
        {showCompletionMenu && completions.length > 0 && !readOnly && (
          <div
            className="absolute z-50 w-72 max-h-60 overflow-y-auto bg-[#252830] border border-zinc-700 rounded-xl shadow-2xl p-1 font-sans text-xs select-none animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>IntelliSense Suggestions</span>
              </span>
              <span className="text-zinc-500 font-mono text-[9px]">Tab / Enter</span>
            </div>
            <div className="py-1 space-y-0.5">
              {completions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertCompletion(item)}
                  onMouseEnter={() => setActiveCompletionIdx(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    idx === activeCompletionIdx
                      ? 'bg-rose-600 text-white font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`text-[9px] font-mono px-1 py-0.5 rounded uppercase font-bold shrink-0 ${
                        item.kind === 'function'
                          ? 'bg-blue-500/20 text-blue-300'
                          : item.kind === 'snippet'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : item.kind === 'keyword'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {item.kind.slice(0, 4)}
                    </span>
                    <span className="truncate font-mono text-xs">{item.label}</span>
                  </div>
                  {item.detail && (
                    <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">{item.detail}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DIAGNOSTICS DRAWER */}
      {showDiagnostics && analysis.diagnostics.length > 0 && (
        <div className="px-3.5 py-3 bg-[#1f1519] border-t border-rose-950 text-xs font-sans">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-900/40 text-[11px]">
            <span className="font-bold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-rose-400" />
              <span>Error Lens Diagnostics ({analysis.diagnostics.length} Temuan)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDiagnostics(false)}
              className="text-rose-400 hover:text-white text-[10px] cursor-pointer"
            >
              ✕ Tutup
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {analysis.diagnostics.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-200"
              >
                <span className="px-1.5 py-0.5 rounded bg-rose-900 text-[10px] font-mono font-bold text-rose-300 shrink-0">
                  L{d.line}
                </span>
                <div className="flex-1 text-xs leading-relaxed">
                  <p className="font-semibold text-rose-100">{d.message}</p>
                  {d.suggestedFix && (
                    <p className="text-[11px] text-rose-300/80 font-mono mt-0.5">💡 Saran: {d.suggestedFix}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RUNTIME CONSOLE OUTPUT */}
      {showConsole && (
        <div className="px-3.5 py-3 bg-[#141518] border-t border-[#2d3139] text-xs font-mono">
          <div className="flex items-center justify-between text-[11px] pb-2 mb-2 border-b border-[#333333]">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
              <Terminal size={12} className="text-emerald-400" />
              <span>
                Terminal Konsol ({logs.length} Output, {executionTime}ms)
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-zinc-400 hover:text-white text-[10px] cursor-pointer"
              >
                Bersihkan
              </button>
              <button
                type="button"
                onClick={() => setShowConsole(false)}
                className="text-zinc-400 hover:text-white text-[10px] cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-zinc-500 italic text-[11px]">Tidak ada log output...</p>
            ) : (
              logs.map((log, idx) => {
                const colorClass =
                  log.type === 'error'
                    ? 'text-rose-400 bg-rose-500/10'
                    : log.type === 'warn'
                    ? 'text-amber-300 bg-amber-500/10'
                    : log.type === 'info'
                    ? 'text-emerald-400'
                    : 'text-zinc-200';
                return (
                  <div key={idx} className={`flex items-start gap-2 p-1.5 rounded ${colorClass}`}>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">{log.time}</span>
                    <pre className="whitespace-pre-wrap font-mono text-xs m-0 flex-1">{log.text}</pre>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
