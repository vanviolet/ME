import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  FileDiff,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  ArrowRightLeft,
  Upload,
  Download,
  FileCode,
  Sparkles,
  Columns,
  List,
  CheckCircle2,
  Plus,
  Minus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLES = [
  {
    name: 'React Hook Refactoring',
    nameId: 'Refaktorisasi React Hook',
    original: `import React, { useState } from 'react';

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function fetchUserData() {
    fetch('/api/users/' + userId)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }

  return (
    <div className="profile">
      {loading ? <p>Loading...</p> : <h1>{user.name}</h1>}
    </div>
  );
}`,
    modified: `import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(\`/api/users/\${userId}\`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load user profile');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile p-4">
      {loading ? <p>Loading profile...</p> : <h1>{user?.name}</h1>}
    </div>
  );
}`,
  },
  {
    name: 'Config JSON Environment',
    nameId: 'Konfigurasi JSON Lingkungan',
    original: `{
  "app": {
    "name": "DevPortal",
    "version": "1.0.0",
    "debug": true,
    "port": 3000
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "poolSize": 5,
    "ssl": false
  },
  "features": {
    "betaTesting": false,
    "analytics": false
  }
}`,
    modified: `{
  "app": {
    "name": "DevPortal",
    "version": "1.2.0",
    "debug": false,
    "port": 8080
  },
  "database": {
    "host": "postgres-cluster.internal",
    "port": 5432,
    "poolSize": 25,
    "ssl": true,
    "replica": "postgres-ro.internal"
  },
  "features": {
    "betaTesting": true,
    "analytics": true,
    "aiInsights": true
  }
}`,
  },
];

interface DiffLine {
  type: 'added' | 'deleted' | 'unchanged' | 'modified';
  leftLineNum?: number;
  rightLineNum?: number;
  leftText?: string;
  rightText?: string;
}

// Compute simple line-based diff using Longest Common Subsequence (LCS)
function computeDiff(original: string, modified: string): { lines: DiffLine[]; additions: number; deletions: number; unchanged: number } {
  const left = original.split(/\r?\n/);
  const right = modified.split(/\r?\n/);

  const n = left.length;
  const m = right.length;

  // Build matrix for LCS
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to assemble diff lines
  const lines: DiffLine[] = [];
  let i = n;
  let j = m;
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
      stack.push({
        type: 'unchanged',
        leftLineNum: i,
        rightLineNum: j,
        leftText: left[i - 1],
        rightText: right[j - 1],
      });
      unchanged++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: 'added',
        rightLineNum: j,
        rightText: right[j - 1],
      });
      additions++;
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      stack.push({
        type: 'deleted',
        leftLineNum: i,
        leftText: left[i - 1],
      });
      deletions++;
      i--;
    }
  }

  stack.reverse();

  return { lines: stack, additions, deletions, unchanged };
}

export const DiffCheckerPage: React.FC = () => {
  const { language } = usePortfolio();

  const [originalText, setOriginalText] = useState<string>(SAMPLES[0].original);
  const [modifiedText, setModifiedText] = useState<string>(SAMPLES[0].modified);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'diff'>('editor');

  const diffResult = useMemo(() => {
    return computeDiff(originalText, modifiedText);
  }, [originalText, modifiedText]);

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'original' | 'modified') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        if (target === 'original') setOriginalText(text);
        else setModifiedText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleCopySummary = () => {
    const report = `Diff Report Summary:
+ Additions: ${diffResult.additions} lines
- Deletions: ${diffResult.deletions} lines
= Unchanged: ${diffResult.unchanged} lines
Total lines evaluated: ${diffResult.lines.length}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'Code & Text Diff Checker Studio — Muchamad Irvan' : 'Pemeriksa Perbedaan Kode & Teks (Diff Checker) — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Compare differences between two code or text snippets side-by-side or unified with syntax change tracking and statistics.'
            : 'Bandingkan perbedaan antara dua kode atau teks secara side-by-side maupun satu kolom dengan penghitung penambahan dan penghapusan.'
        }
        url="/tools/diff-checker"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/tools"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Tools"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <FileDiff size={13} />
              <span>Diff Studio</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Code & Text Diff Checker' : 'Pemeriksa Perbedaan Kode & Teks'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Detect additions, removals, and changes between two files or code snippets instantly.'
              : 'Deteksi penambahan, pengurangan, dan modifikasi baris antara dua file atau cuplikan kode secara akurat.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleSwap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
            title="Swap Original and Modified"
          >
            <ArrowRightLeft size={14} />
            <span>{language === 'en' ? 'Swap' : 'Tukar'}</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy Summary' : 'Salin Ringkasan')}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <FileCode size={13} /> {language === 'en' ? 'Presets:' : 'Contoh:'}
        </span>
        {SAMPLES.map(sample => (
          <button
            key={sample.name}
            onClick={() => {
              setOriginalText(sample.original);
              setModifiedText(sample.modified);
            }}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 text-stone-700 dark:text-zinc-300 whitespace-nowrap transition-colors"
          >
            {language === 'en' ? sample.name : sample.nameId}
          </button>
        ))}
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 p-3 rounded-2xl bg-stone-100 dark:bg-zinc-900/70 border border-stone-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-stone-600 dark:text-zinc-400 font-medium">
            +{diffResult.additions} {language === 'en' ? 'Added' : 'Tambah'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-stone-600 dark:text-zinc-400 font-medium">
            -{diffResult.deletions} {language === 'en' ? 'Removed' : 'Hapus'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-600" />
          <span className="text-stone-600 dark:text-zinc-400 font-medium">
            {diffResult.unchanged} {language === 'en' ? 'Unchanged' : 'Sama'}
          </span>
        </div>
        <div className="hidden sm:flex items-center justify-end text-stone-500 dark:text-zinc-400">
          <span>{diffResult.lines.length} total lines</span>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden rounded-xl bg-stone-100 dark:bg-zinc-800 p-1">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'editor'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'Edit Snippets' : 'Edit Teks'}
        </button>
        <button
          onClick={() => setMobileTab('diff')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'diff'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'View Diff' : 'Lihat Hasil'}
        </button>
      </div>

      {/* Editors Area */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${
          mobileTab === 'diff' ? 'hidden sm:grid' : 'grid'
        }`}
      >
        {/* Original Input */}
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              {language === 'en' ? 'Original (Before)' : 'Teks Asli (Sebelum)'}
            </span>
            <div className="flex items-center gap-1.5">
              <label className="cursor-pointer text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 p-1">
                <Upload size={13} />
                <input
                  type="file"
                  className="hidden"
                  onChange={e => handleFileUpload(e, 'original')}
                />
              </label>
              <button
                onClick={() => setOriginalText('')}
                className="text-stone-400 hover:text-rose-500 p-1"
                title="Clear"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
          <textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            placeholder="Paste original snippet..."
            className="w-full h-56 sm:h-72 p-4 font-mono text-xs bg-transparent text-stone-900 dark:text-zinc-100 resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Modified Input */}
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              {language === 'en' ? 'Modified (After)' : 'Teks Baru (Sesudah)'}
            </span>
            <div className="flex items-center gap-1.5">
              <label className="cursor-pointer text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 p-1">
                <Upload size={13} />
                <input
                  type="file"
                  className="hidden"
                  onChange={e => handleFileUpload(e, 'modified')}
                />
              </label>
              <button
                onClick={() => setModifiedText('')}
                className="text-stone-400 hover:text-rose-500 p-1"
                title="Clear"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
          <textarea
            value={modifiedText}
            onChange={e => setModifiedText(e.target.value)}
            placeholder="Paste modified snippet..."
            className="w-full h-56 sm:h-72 p-4 font-mono text-xs bg-transparent text-stone-900 dark:text-zinc-100 resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Visual Diff Output */}
      <div
        className={`rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden ${
          mobileTab === 'editor' ? 'hidden sm:block' : 'block'
        }`}
      >
        <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-zinc-300">
            <FileDiff size={14} className="text-indigo-500" />
            <span>{language === 'en' ? 'Visual Diff Inspection' : 'Inspeksi Visual Perbedaan'}</span>
          </div>

          <div className="flex items-center gap-1 bg-stone-200 dark:bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400'
              }`}
            >
              <Columns size={12} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400'
              }`}
            >
              <List size={12} />
              <span className="hidden sm:inline">Unified</span>
            </button>
          </div>
        </div>

        {/* Diff Viewer Container */}
        <div className="overflow-x-auto max-h-[500px] font-mono text-xs leading-relaxed divide-y divide-stone-100 dark:divide-zinc-800/50">
          {diffResult.lines.length === 0 ? (
            <div className="p-8 text-center text-stone-400 dark:text-zinc-500">
              {language === 'en' ? 'Enter text above to start comparison.' : 'Masukkan teks di atas untuk mulai membandingkan.'}
            </div>
          ) : viewMode === 'unified' ? (
            /* Unified view */
            diffResult.lines.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-start px-3 py-1 ${
                  line.type === 'added'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : line.type === 'deleted'
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                    : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <span className="w-6 shrink-0 text-center select-none font-bold">
                  {line.type === 'added' ? '+' : line.type === 'deleted' ? '-' : ' '}
                </span>
                <span className="w-10 shrink-0 text-right pr-3 select-none text-stone-400 dark:text-zinc-500 text-[11px]">
                  {line.rightLineNum || line.leftLineNum || ''}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-all">
                  {line.rightText !== undefined ? line.rightText : line.leftText}
                </span>
              </div>
            ))
          ) : (
            /* Split / Side-by-side view */
            <div className="divide-y divide-stone-100 dark:divide-zinc-800/50">
              {diffResult.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-2 divide-x divide-stone-200 dark:divide-zinc-800">
                  {/* Left Column */}
                  <div
                    className={`flex items-start px-2 py-0.5 ${
                      line.type === 'deleted'
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                        : line.type === 'added'
                        ? 'bg-stone-50/50 dark:bg-zinc-900/30 text-stone-300 dark:text-zinc-700'
                        : 'text-stone-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-right pr-2 select-none text-stone-400 dark:text-zinc-600 text-[10px]">
                      {line.leftLineNum || ''}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {line.leftText !== undefined ? line.leftText : ' '}
                    </span>
                  </div>

                  {/* Right Column */}
                  <div
                    className={`flex items-start px-2 py-0.5 ${
                      line.type === 'added'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : line.type === 'deleted'
                        ? 'bg-stone-50/50 dark:bg-zinc-900/30 text-stone-300 dark:text-zinc-700'
                        : 'text-stone-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-right pr-2 select-none text-stone-400 dark:text-zinc-600 text-[10px]">
                      {line.rightLineNum || ''}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {line.rightText !== undefined ? line.rightText : ' '}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
