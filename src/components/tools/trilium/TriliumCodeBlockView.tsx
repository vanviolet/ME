import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { Play, Copy, Check, Terminal, X, RotateCcw, Code2 } from 'lucide-react';
import { executeJavaScriptCode, isRunnableLanguage, ConsoleLogEntry } from '../../../utils/codeRunner';
import { RICH_CODE_LANGUAGES } from '../NotesNotebookPage';

export const TriliumCodeBlockView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
}) => {
  const language = node.attrs.language || 'typescript';
  const [logs, setLogs] = useState<ConsoleLogEntry[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const isRunnable = isRunnableLanguage(language);

  const handleRun = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRunning(true);

    try {
      const code = node.textContent || '';
      if (!code.trim()) {
        setLogs([
          {
            type: 'warn',
            text: 'Blok kode masih kosong. Tulis kode JavaScript/TypeScript untuk dijalankan.',
            time: new Date().toLocaleTimeString(),
          },
        ]);
        return;
      }
      const output = executeJavaScriptCode(code);
      setLogs(output.logs);
    } catch (err: any) {
      setLogs([
        {
          type: 'error',
          text: err.message || String(err),
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const code = node.textContent || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="trilium-code-block-node relative my-4 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-[#1e1e1e] text-zinc-100 shadow-sm not-prose">
      {/* Code Block Header with Language Selector & Action Buttons */}
      <div
        className="flex items-center justify-between px-3.5 py-1.5 bg-[#252526] border-b border-[#333333] text-xs select-none"
        contentEditable={false}
      >
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-amber-400 shrink-0" />
          <select
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="bg-[#1a1a1a] text-amber-300 font-mono text-[11px] font-semibold uppercase px-2 py-0.5 rounded border border-[#3e3e3e] cursor-pointer hover:border-amber-500/50 focus:outline-none"
          >
            {RICH_CODE_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#252526] text-zinc-200">
                {l.name}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-zinc-400 font-sans hidden sm:inline">
            {isRunnable ? '• Runnable JS/TS' : '• Syntax Highlighting'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Run Button ON EACH CODE BLOCK */}
          {isRunnable ? (
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-[11px] cursor-pointer transition-all shadow-xs"
              title="Jalankan kode JavaScript/TypeScript di blok ini"
            >
              <Play size={10} fill="currentColor" />
              <span>{isRunning ? 'Menjalankan...' : 'Run'}</span>
            </button>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-zinc-800 hidden md:inline">
              Static Code
            </span>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#333333] hover:bg-[#3f3f3f] text-zinc-300 hover:text-white text-[11px] cursor-pointer transition-colors"
            title="Salin kode ke papan klip"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editable Code Content */}
      <pre className="p-4 m-0 overflow-x-auto text-[13px] leading-relaxed font-mono bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none selection:bg-rose-900/50">
        <NodeViewContent as={'code' as any} className={`language-${language}`} />
      </pre>

      {/* Embedded Terminal Output for this Code Block */}
      {logs !== null && (
        <div
          className="border-t border-[#333333] bg-[#161616] p-3 text-xs font-mono"
          contentEditable={false}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2a2a2a] text-zinc-400">
            <div className="flex items-center gap-1.5 font-bold text-zinc-300 text-[11px]">
              <Terminal size={12} className="text-emerald-400" />
              <span>Output Konsol ({logs.length} output)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded cursor-pointer"
                title="Bersihkan log"
              >
                <RotateCcw size={11} />
              </button>
              <button
                type="button"
                onClick={() => setLogs(null)}
                className="hover:text-white text-zinc-400 p-0.5 rounded cursor-pointer"
                title="Tutup output"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-zinc-500 italic text-[11px]">Konsol kosong.</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 leading-relaxed p-1 rounded ${
                    log.type === 'error'
                      ? 'text-rose-400 bg-rose-950/20'
                      : log.type === 'warn'
                      ? 'text-amber-300 bg-amber-950/20'
                      : log.type === 'info'
                      ? 'text-sky-300'
                      : 'text-zinc-200'
                  }`}
                >
                  <span className="text-zinc-600 text-[10px] shrink-0 font-mono">
                    [{log.time}]
                  </span>
                  <span className="font-semibold uppercase text-[10px] shrink-0 opacity-70">
                    {log.type}:
                  </span>
                  <pre className="font-mono whitespace-pre-wrap break-all flex-1 m-0 p-0 bg-transparent border-none">
                    {log.text}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};
