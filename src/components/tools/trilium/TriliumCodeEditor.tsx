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
  VSCODE_COLORS,
} from './codeLanguageSupport';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Wrench,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Terminal,
  Settings,
  Sparkles,
  FileCode,
  FolderTree,
  Search,
  Bug,
  HelpCircle,
  ExternalLink,
  Layers,
  CheckCircle2,
  Sliders,
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
  parentFolderTitle = 'Rekayasa Perangkat Lunak',
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

  // Bottom drawer state
  const [activeDrawerTab, setActiveDrawerTab] = useState<'problems' | 'terminal' | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<
    { id: string; type: 'log' | 'warn' | 'error' | 'info'; text: string; time: string }[]
  >([]);

  // Diagnostics & Hover
  const [hoveredIssue, setHoveredIssue] = useState<Diagnostic | null>(null);
  const [hoverWidgetPos, setHoverWidgetPos] = useState<{ top: number; left: number } | null>(null);

  // IntelliSense Completion
  const [showCompletion, setShowCompletion] = useState<boolean>(false);
  const [selectedCompletionIndex, setSelectedCompletionIndex] = useState<number>(0);
  const [completionPos, setCompletionPos] = useState<{ top: number; left: number }>({ top: 40, left: 80 });

  // Get active language meta
  const langMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.id === currentLang) || SUPPORTED_LANGUAGES[0];
  }, [currentLang]);

  // Derived file name
  const fileName = useMemo(() => {
    const sanitized = (noteTitle || 'snippet')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    return (sanitized || 'snippet') + langMeta.extension;
  }, [noteTitle, langMeta]);

  // Real-time static analysis & error diagnostics
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

    // Compute visual top/left for autocomplete
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
        // Shift+Tab: Unindent current line
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
        // Tab: Insert 2 spaces
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
        // Wrap selected text
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

  // Apply selected completion item
  const applyCompletion = (item: CompletionItem) => {
    if (!textareaRef.current) return;
    const pos = cursorIndex;
    const before = content.slice(0, pos);
    const after = content.slice(pos);

    // Find current word prefix to replace
    const match = before.match(/([a-zA-Z0-9_$.:]+)$/);
    const prefixLen = match ? match[1].length : 0;
    const cleanBefore = before.slice(0, before.length - prefixLen);

    const newCode = cleanBefore + item.insertText + after;
    onChangeContent(newCode);
    setShowCompletion(false);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = cleanBefore.length + (item.cursorOffset ?? item.insertText.length);
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
        updateCursorPosition(textareaRef.current);
      }
    }, 0);
  };

  // Copy code with feedback
  const handleCopyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format code
  const handleFormatCode = () => {
    const formatted = formatCode(content, currentLang);
    onChangeContent(formatted);
  };

  // Reset to sample snippet
  const handleResetSnippet = () => {
    if (confirm(`Kembalikan kode ke contoh bawaan ${langMeta.name}?`)) {
      onChangeContent(langMeta.sampleCode);
    }
  };

  // Safe run code in sandboxed context
  const handleRunCode = () => {
    setActiveDrawerTab('terminal');
    const logs: { id: string; type: 'log' | 'warn' | 'error' | 'info'; text: string; time: string }[] = [];

    const getTime = () => {
      const now = new Date();
      return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    };

    logs.push({
      id: 'init-' + Date.now(),
      type: 'info',
      text: `▶ Menjalankan ${fileName} (${langMeta.name})...`,
      time: getTime(),
    });

    if (currentLang !== 'typescript' && currentLang !== 'javascript') {
      logs.push({
        id: 'warn-' + Date.now(),
        type: 'warn',
        text: `Bahasa ${langMeta.name} membutuhkan runtime eksternal (compiler/interpreter). Sintaks & diagnostik telah divalidasi.`,
        time: getTime(),
      });
      setTerminalLogs(logs);
      return;
    }

    try {
      // Clean TypeScript types for execution (simple regex strip for interfaces, types, and annotations)
      let executable = content
        .replace(/import\s+type\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '// [simulated import]')
        .replace(/export\s+interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
        .replace(/interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
        .replace(/export\s+type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
        .replace(/type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
        .replace(/:\s*[a-zA-Z0-9_$<>\[\], |&]+(\s*=|\s*\)|\s*,|\s*;)/g, '$1')
        .replace(/export\s+/g, '');

      // Intercept console calls
      const customConsole = {
        log: (...args: any[]) => {
          logs.push({
            id: 'log-' + Math.random(),
            type: 'log',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
            time: getTime(),
          });
        },
        warn: (...args: any[]) => {
          logs.push({
            id: 'warn-' + Math.random(),
            type: 'warn',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
            time: getTime(),
          });
        },
        error: (...args: any[]) => {
          logs.push({
            id: 'error-' + Math.random(),
            type: 'error',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
            time: getTime(),
          });
        },
        info: (...args: any[]) => {
          logs.push({
            id: 'info-' + Math.random(),
            type: 'info',
            text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '),
            time: getTime(),
          });
        },
      };

      const runner = new Function('console', executable);
      runner(customConsole);

      logs.push({
        id: 'done-' + Date.now(),
        type: 'info',
        text: `✔ Program selesai dieksekusi dengan kode keluar 0.`,
        time: getTime(),
      });
    } catch (err: any) {
      logs.push({
        id: 'err-' + Date.now(),
        type: 'error',
        text: `Eksepsi Runtime: ${err.message || String(err)}`,
        time: getTime(),
      });
    }

    setTerminalLogs(logs);
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
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] rounded-2xl overflow-hidden border border-stone-300 dark:border-zinc-800 shadow-2xl font-mono select-none">
      {/* 1. TOP WINDOW CHROME (VS Code Title Bar) */}
      <div className="bg-[#181818] border-b border-[#2d2d2d] px-3 py-2 flex items-center justify-between text-xs gap-3">
        {/* Traffic Light Dots */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-2xs cursor-pointer hover:opacity-80" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-2xs cursor-pointer hover:opacity-80" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-2xs cursor-pointer hover:opacity-80" />
          </div>

          <div className="h-4 w-px bg-[#333333] hidden sm:block" />

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#858585]">
            <span>Trilium Notes</span>
            <ChevronRight size={12} className="text-[#555555]" />
            <span className="text-[#a0a0a0] truncate max-w-[120px]">{parentFolderTitle}</span>
            <ChevronRight size={12} className="text-[#555555]" />
            <span className="text-[#ffffff] font-semibold flex items-center gap-1">
              <span
                className="w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ backgroundColor: langMeta.iconBg, color: langMeta.iconColor }}
              >
                {langMeta.iconText}
              </span>
              <span>{fileName}</span>
            </span>
          </div>
        </div>

        {/* Center / Right Controls: Language Picker & Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-[#252526] px-2 py-0.5 rounded-lg border border-[#3c3c3c]">
            <span className="text-[10px] text-[#858585] uppercase tracking-wider hidden sm:inline">
              Bahasa:
            </span>
            <div className="w-36">
              <ShadcnSelect
                value={currentLang}
                onChange={(val) => {
                  onChangeLanguage(String(val));
                  // If content is empty or short, suggest template
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

          {/* Action: Format Code */}
          <button
            type="button"
            onClick={handleFormatCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#252526] hover:bg-[#323233] text-[#cccccc] hover:text-white border border-[#3c3c3c] text-[11px] cursor-pointer transition-colors"
            title="Rapikan Format Kode (Auto-Indent)"
          >
            <Wrench size={12} />
            <span className="hidden sm:inline">Format</span>
          </button>

          {/* Action: Run / Execute */}
          <button
            type="button"
            onClick={handleRunCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] cursor-pointer shadow-xs transition-colors"
            title="Jalankan Kode & Buka Output Terminal (Ctrl+Enter)"
          >
            <Play size={12} className="fill-current" />
            <span>Run</span>
          </button>

          {/* Action: Copy */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#252526] hover:bg-[#323233] text-[#cccccc] hover:text-white border border-[#3c3c3c] text-[11px] cursor-pointer transition-colors"
            title="Salin Kode ke Clipboard"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Action: Reset */}
          <button
            type="button"
            onClick={handleResetSnippet}
            className="p-1 rounded-lg hover:bg-[#323233] text-[#858585] hover:text-[#cccccc] cursor-pointer transition-colors"
            title="Kembalikan Template Awal"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 2. VS CODE TAB BAR */}
      <div className="bg-[#252526] flex items-center border-b border-[#181818] overflow-x-auto text-xs shrink-0">
        <div className="px-3.5 py-1.5 bg-[#1e1e1e] text-[#ffffff] font-mono flex items-center gap-2 border-t-2 border-[#007acc] border-r border-[#181818] cursor-pointer select-none">
          <span
            className="w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
            style={{ backgroundColor: langMeta.iconBg, color: langMeta.iconColor }}
          >
            {langMeta.iconText}
          </span>
          <span className="font-semibold">{fileName}</span>
          {diagnostics.length > 0 && (
            <span
              className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5"
              title={`${diagnostics.length} masalah terdeteksi pada berkas ini`}
            />
          )}
        </div>

        {/* Secondary Info & Hint */}
        <div className="ml-auto pr-3 hidden sm:flex items-center gap-2 text-[11px] text-[#858585]">
          <span>Dark Modern</span>
          <span>•</span>
          <span>Ctrl+Space untuk IntelliSense</span>
        </div>
      </div>

      {/* 3. WORKSPACE CONTAINER (Activity Bar + Editor + Gutter) */}
      <div className="flex-1 flex min-h-[440px] relative overflow-hidden bg-[#1e1e1e]">
        {/* Left Thin Activity Bar */}
        <div className="w-11 bg-[#181818] border-r border-[#2d2d2d] hidden sm:flex flex-col items-center py-3 gap-4 text-[#858585] shrink-0">
          <div className="p-1 text-[#ffffff] border-l-2 border-[#007acc] cursor-pointer" title="Explorer">
            <FolderTree size={16} />
          </div>
          <div className="p-1 hover:text-[#cccccc] cursor-pointer" title="Search">
            <Search size={16} />
          </div>
          <div
            className={`p-1 hover:text-[#cccccc] cursor-pointer relative ${
              diagnostics.length > 0 ? 'text-rose-400' : ''
            }`}
            onClick={() => setActiveDrawerTab(activeDrawerTab === 'problems' ? null : 'problems')}
            title="Diagnostik & Masalah (Problems)"
          >
            <Sparkles size={16} />
            {diagnostics.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">
                {diagnostics.length}
              </span>
            )}
          </div>
          <div
            className="p-1 hover:text-[#cccccc] cursor-pointer"
            onClick={handleRunCode}
            title="Jalankan & Debug"
          >
            <Bug size={16} />
          </div>
          <div className="mt-auto p-1 hover:text-[#cccccc] cursor-pointer" title="Pengaturan">
            <Settings size={16} />
          </div>
        </div>

        {/* Editor Main Canvas (Gutter + Highlight Underlay + Textarea Overlay) */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 flex overflow-hidden relative">
            {/* Gutter (Line Numbers & Error Glyphs) */}
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
                        className="w-2.5 h-2.5 rounded-full bg-rose-500 hover:scale-125 inline-block shrink-0 cursor-pointer shadow-xs"
                        title={lineIssues[0]?.message}
                      />
                    ) : hasWarn ? (
                      <span
                        onClick={() => handleJumpToIssue(lineIssues[0])}
                        className="w-2.5 h-2.5 rounded-full bg-amber-400 hover:scale-125 inline-block shrink-0 cursor-pointer shadow-xs"
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

            {/* Code Canvas Area */}
            <div className="flex-1 relative overflow-auto bg-[#1e1e1e]">
              {/* Active Line Highlight Band */}
              <div
                className="absolute left-0 right-0 pointer-events-none bg-[#282828] border-y border-[#333333]/50 transition-all duration-75"
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
                          // Check if token matches an issue to apply red wavy squiggles
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
                        {/* Fallback squiggle under full line if entire line has error and no specific token */}
                        {lineIssues.length > 0 && !lineIssues[0].highlightWord && (
                          <span className="absolute bottom-0 left-0 right-0 border-b border-rose-500 border-dashed" />
                        )}
                      </div>
                    );
                  })}
                </code>
              </pre>

              {/* Layer 2: Live Editable Textarea (Transparent text with authentic caret) */}
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

              {/* 4. VS Code Diagnostic Hover Popup */}
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
                        <span>Quick Fix: {hoveredIssue.quickFix.label}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 5. VS Code IntelliSense Autocomplete Popover */}
              {showCompletion && completionItems.length > 0 && (
                <div
                  className="absolute z-40 bg-[#252526] border border-[#454545] rounded-xl shadow-2xl overflow-hidden flex flex-col w-80 text-xs animate-in fade-in"
                  style={{
                    top: `${completionPos.top}px`,
                    left: `${completionPos.left}px`,
                  }}
                >
                  {/* IntelliSense Header */}
                  <div className="px-2.5 py-1 bg-[#1e1e1e] border-b border-[#333333] flex items-center justify-between text-[10px] text-[#858585] uppercase tracking-wider">
                    <span>IntelliSense ({langMeta.name})</span>
                    <button
                      type="button"
                      onClick={() => setShowCompletion(false)}
                      className="hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* List of Suggestions */}
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
                            {/* Kind Icon Badge */}
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

                  {/* Active Item Documentation Drawer */}
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

          {/* 6. COLLAPSIBLE BOTTOM DRAWER (Problems / Terminal Output) */}
          {activeDrawerTab && (
            <div className="h-44 bg-[#181818] border-t border-[#2d2d2d] flex flex-col shrink-0">
              {/* Drawer Header Tabs */}
              <div className="flex items-center justify-between px-3 bg-[#1e1e1e] border-b border-[#2d2d2d] text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab('problems')}
                    className={`px-3 py-1.5 flex items-center gap-1.5 border-b-2 font-semibold cursor-pointer ${
                      activeDrawerTab === 'problems'
                        ? 'border-[#007acc] text-white'
                        : 'border-transparent text-[#858585] hover:text-[#cccccc]'
                    }`}
                  >
                    <span>PROBLEMS</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        errorCount > 0
                          ? 'bg-rose-500 text-white'
                          : 'bg-[#333333] text-[#aaaaaa]'
                      }`}
                    >
                      {diagnostics.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab('terminal')}
                    className={`px-3 py-1.5 flex items-center gap-1.5 border-b-2 font-semibold cursor-pointer ${
                      activeDrawerTab === 'terminal'
                        ? 'border-[#007acc] text-white'
                        : 'border-transparent text-[#858585] hover:text-[#cccccc]'
                    }`}
                  >
                    <Terminal size={12} />
                    <span>TERMINAL / OUTPUT</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeDrawerTab === 'terminal' && (
                    <button
                      type="button"
                      onClick={() => setTerminalLogs([])}
                      className="text-[11px] text-[#858585] hover:text-white cursor-pointer"
                    >
                      Bersihkan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveDrawerTab(null)}
                    className="p-1 hover:text-white text-[#858585] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 p-2.5 overflow-y-auto text-xs font-mono">
                {activeDrawerTab === 'problems' ? (
                  diagnostics.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400 py-3 px-2">
                      <CheckCircle2 size={16} />
                      <span>Tidak ada masalah sintaks atau tipe pada berkas {fileName}.</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {diagnostics.map((diag, i) => (
                        <div
                          key={i}
                          onClick={() => handleJumpToIssue(diag)}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#252526] cursor-pointer text-[#cccccc] group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {diag.severity === 'error' ? (
                              <XCircle size={14} className="text-rose-500 shrink-0" />
                            ) : (
                              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                            )}
                            <span className="text-[#ffffff] font-semibold">
                              {diag.message}
                            </span>
                            <span className="text-[10px] text-[#858585]">
                              [{diag.source} {diag.code}]
                            </span>
                          </div>
                          <span className="text-[11px] text-[#858585] group-hover:text-[#007acc] shrink-0 ml-3">
                            Ln {diag.line}, Col {diag.column}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* Terminal Output */
                  terminalLogs.length === 0 ? (
                    <div className="text-[#666666] py-3 px-2">
                      Klik tombol "Run" di atas untuk menjalankan kode dan melihat keluaran console.log.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {terminalLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2 leading-relaxed">
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
                                ? 'text-[#007acc]'
                                : 'text-[#d4d4d4]'
                            }
                          >
                            {log.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. VS CODE BOTTOM STATUS BAR */}
      <div className="bg-[#007acc] text-white px-3 py-1 flex items-center justify-between text-[11px] select-none shrink-0">
        {/* Left: Problems count indicator */}
        <div
          onClick={() => setActiveDrawerTab(activeDrawerTab === 'problems' ? null : 'problems')}
          className="flex items-center gap-3 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
        >
          <div className="flex items-center gap-1 font-semibold">
            <XCircle size={12} />
            <span>{errorCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle size={12} />
            <span>{warnCount}</span>
          </div>
        </div>

        {/* Right: Line, Column, Tab Size, UTF-8, Language Badge */}
        <div className="flex items-center gap-3 ml-auto">
          <span>Ln {activeLine}, Col {activeCol}</span>
          <span className="hidden sm:inline">Spasi: 2</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">LF</span>
          <div className="flex items-center gap-1.5 font-bold bg-black/20 px-2 py-0.5 rounded">
            <span>{langMeta.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
