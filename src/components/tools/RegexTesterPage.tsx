import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Code,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Search,
  BookOpen,
  Replace,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Sparkles,
  GraduationCap,
  ListFilter,
  PlayCircle,
  Trophy,
  Layers,
  FileCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegexTemplate {
  name: string;
  nameId: string;
  pattern: string;
  flags: string;
  sample: string;
  description: string;
  category: string;
}

const REGEX_TEMPLATES: RegexTemplate[] = [
  {
    name: 'Email Address (RFC 5322)',
    nameId: 'Format Alamat Email',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    sample: 'Contact us at vanviolet.js@gmail.com or support@company.co.id for queries.',
    description: 'Matches standard internet email addresses.',
    category: 'Validation',
  },
  {
    name: 'Indonesian Phone Number',
    nameId: 'Nomor HP Indonesia (+62 / 08)',
    pattern: '(\\+62|62|0)8[1-9][0-9]{6,10}',
    flags: 'g',
    sample: 'Hubungi CS: +6281234567890 atau kantor di 085712345678 untuk info.',
    description: 'Matches Indonesian mobile numbers starting with +62, 62, or 08.',
    category: 'Regional',
  },
  {
    name: 'URL & Web Links',
    nameId: 'Tautan URL Website',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    sample: 'Visit https://github.com/MuchamadIrvan or http://localhost:3000/tools for info.',
    description: 'Matches HTTP/HTTPS web links and URLs.',
    category: 'Extraction',
  },
  {
    name: 'IPv4 Address',
    nameId: 'Alamat IP IPv4',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Router IP is 192.168.1.1 and DNS is 8.8.8.8 while 999.123.4.1 is invalid.',
    description: 'Matches valid IPv4 addresses (0.0.0.0 to 255.255.255.255).',
    category: 'Validation',
  },
  {
    name: 'HEX Color Code',
    nameId: 'Kode Warna HEX',
    pattern: '#(?:[0-9a-fA-F]{3,4}){1,2}\\b',
    flags: 'gi',
    sample: 'Colors used: #F43F5E (rose), #10B981 (emerald), #FFF (white) and #33333380.',
    description: 'Matches 3, 6, or 8 digit hex color codes with hash prefix.',
    category: 'Design',
  },
  {
    name: 'Date (YYYY-MM-DD / ISO)',
    nameId: 'Format Tanggal ISO',
    pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    sample: 'The project started on 2026-01-15 and milestone finished 2026-09-12.',
    description: 'Matches ISO standard dates in YYYY-MM-DD format.',
    category: 'Data',
  },
  {
    name: 'Social Hashtags',
    nameId: 'Tagar Media Sosial (#hashtag)',
    pattern: '#[a-zA-Z0-9_]+',
    flags: 'g',
    sample: 'Excited for the new release! #react #typescript #webdev #engineering',
    description: 'Matches hashtags in social media posts.',
    category: 'Social',
  },
];

// Interactive Practice Challenges for Learning
interface Challenge {
  id: number;
  title: string;
  titleId: string;
  goal: string;
  goalId: string;
  testString: string;
  expectedMatches: string[];
  hint: string;
  defaultPattern: string;
}

const PRACTICE_CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Match a 4-Digit Security PIN',
    titleId: 'Cocokkan 4 Digit PIN Keamanan',
    goal: 'Match only 4 consecutive digits (e.g. 1234 or 9021)',
    goalId: 'Cocokkan tepat 4 angka berurutan',
    testString: 'PIN Anda adalah 4892, jangan masukkan 123 atau 123456.',
    expectedMatches: ['4892'],
    hint: 'Use \\b\\d{4}\\b to match exactly 4 digits with word boundaries.',
    defaultPattern: '\\b\\d{4}\\b',
  },
  {
    id: 2,
    title: 'Extract Hashtags',
    titleId: 'Ekstrak Tagar (#hashtag)',
    goal: 'Find all hashtags starting with # followed by letters or digits',
    goalId: 'Temukan semua kata yang diawali simbol #',
    testString: 'Posting karya terbaru #coding #javascript dan belajar #regex_pemula!',
    expectedMatches: ['#coding', '#javascript', '#regex_pemula'],
    hint: 'Use #[a-zA-Z0-9_]+ to capture words after the hash mark.',
    defaultPattern: '#[a-zA-Z0-9_]+',
  },
  {
    id: 3,
    title: 'Match Indonesian Mobile (+62 / 08)',
    titleId: 'Nomor Ponsel Indonesia',
    goal: 'Match Indonesian phone numbers starting with +628 or 08',
    goalId: 'Cocokkan nomor telepon seluler Indonesia',
    testString: 'Kontak WhatsApp: +628123456789 atau hubungi nomor 085711223344.',
    expectedMatches: ['+628123456789', '085711223344'],
    hint: 'Use (?:\\+62|0)8[0-9]{8,11} with optional prefix.',
    defaultPattern: '(?:\\+62|0)8[0-9]{8,11}',
  },
];

// Token breakdown helper to make Regex easy to learn
function explainRegexPattern(pat: string): { token: string; explanationEn: string; explanationId: string }[] {
  if (!pat) return [];
  const explanations: { token: string; explanationEn: string; explanationId: string }[] = [];

  // Match common regex tokens
  const tokenRegex = /(\\d\+?|\\w\+?|\\s\+?|\\b|\^|\$|\[\^?[a-zA-Z0-9._%+-]+\]\+?|\(\?:|\(|\)|\+|_|\*|\?|\\\.|\/|https?|@|[a-zA-Z0-9]+)/g;
  let match;

  while ((match = tokenRegex.exec(pat)) !== null) {
    const t = match[0];
    let en = 'Matches character or sequence literal';
    let id = 'Mencocokkan karakter atau urutan harfiah';

    if (t === '^') {
      en = 'Start of string or line anchor';
      id = 'Awal teks atau baris';
    } else if (t === '$') {
      en = 'End of string or line anchor';
      id = 'Akhir teks atau baris';
    } else if (t.startsWith('\\d')) {
      en = 'Any digit (0-9)' + (t.includes('+') ? ' (one or more)' : '');
      id = 'Semua angka (0-9)' + (t.includes('+') ? ' (satu atau lebih)' : '');
    } else if (t.startsWith('\\w')) {
      en = 'Any word character (letter, digit, underscore)' + (t.includes('+') ? ' (one or more)' : '');
      id = 'Semua karakter kata (huruf, angka, garis bawah)' + (t.includes('+') ? ' (satu atau lebih)' : '');
    } else if (t.startsWith('\\s')) {
      en = 'Whitespace character (space, tab, newline)';
      id = 'Karakter spasi kosong (spasi, tab, baris baru)';
    } else if (t === '\\b') {
      en = 'Word boundary (start or end of a word)';
      id = 'Batas kata (awal atau akhir sebuah kata)';
    } else if (t.startsWith('[')) {
      en = `Character set matching: ${t}`;
      id = `Kumpulan karakter yang diizinkan: ${t}`;
    } else if (t === '(?:') {
      en = 'Start of non-capturing group (groups without memory saving)';
      id = 'Awal grup non-capturing (mengelompokkan tanpa memori)';
    } else if (t === '(') {
      en = 'Start of capture group (saves matched substring)';
      id = 'Awal grup penangkap (menyimpan hasil kecocokan)';
    } else if (t === ')') {
      en = 'End of group';
      id = 'Akhir grup penangkap';
    } else if (t === '+') {
      en = 'Quantifier: matches 1 or more times (greedy)';
      id = 'Kuantifier: cocok 1 kali atau lebih';
    } else if (t === '*') {
      en = 'Quantifier: matches 0 or more times (optional repeat)';
      id = 'Kuantifier: cocok 0 kali atau lebih';
    } else if (t === '?') {
      en = 'Quantifier: matches 0 or 1 time (optional)';
      id = 'Kuantifier: cocok 0 atau 1 kali (opsional)';
    } else if (t === '\\.') {
      en = 'Literal dot character (.)';
      id = 'Karakter titik harfiah (.)';
    } else if (t === '@') {
      en = 'Literal email "@" sign';
      id = 'Simbol "@" email harfiah';
    }

    explanations.push({ token: t, explanationEn: en, explanationId: id });
    if (explanations.length >= 12) break; // Avoid visual overflow
  }

  return explanations;
}

export const RegexTesterPage: React.FC = () => {
  const { language } = usePortfolio();

  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState<{ [key: string]: boolean }>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  });
  const [testText, setTestText] = useState<string>(
    'Hello! Reach out to vanviolet.js@gmail.com or test.user@example.org for engineering updates.'
  );
  const [replacePattern, setReplacePattern] = useState<string>('[email-hidden]');
  const [showReplace, setShowReplace] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matches' | 'replace' | 'learn' | 'challenges'>('matches');
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(null);

  const flagString = useMemo(() => {
    return Object.keys(flags)
      .filter(k => flags[k])
      .join('');
  }, [flags]);

  // Execute regex & gather matches
  const matchResult = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: null, timeMs: 0 };
    }

    const startTime = performance.now();
    try {
      const regex = new RegExp(pattern, flagString);
      const matches: { text: string; index: number; groups: string[] }[] = [];

      if (flags.g) {
        let match;
        let iterationCount = 0;
        while ((match = regex.exec(testText)) !== null) {
          iterationCount++;
          if (iterationCount > 500) break; // Infinite loop safety
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      const timeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return { matches, error: null, timeMs };
    } catch (err: any) {
      return { matches: [], error: err.message, timeMs: 0 };
    }
  }, [pattern, flagString, testText, flags.g]);

  // Replacement Result
  const substitutedText = useMemo(() => {
    if (!pattern || matchResult.error) return testText;
    try {
      const regex = new RegExp(pattern, flagString);
      return testText.replace(regex, replacePattern);
    } catch {
      return testText;
    }
  }, [pattern, flagString, testText, replacePattern, matchResult.error]);

  // Pattern explanation tokens
  const tokenExplanations = useMemo(() => {
    return explainRegexPattern(pattern);
  }, [pattern]);

  // Challenge evaluation
  const activeChallenge = useMemo(() => {
    if (!activeChallengeId) return null;
    return PRACTICE_CHALLENGES.find(c => c.id === activeChallengeId) || null;
  }, [activeChallengeId]);

  const challengePassed = useMemo(() => {
    if (!activeChallenge || matchResult.error) return false;
    const found = matchResult.matches.map(m => m.text);
    if (found.length !== activeChallenge.expectedMatches.length) return false;
    return activeChallenge.expectedMatches.every(exp => found.includes(exp));
  }, [activeChallenge, matchResult]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectTemplate = (t: RegexTemplate) => {
    setPattern(t.pattern);
    setTestText(t.sample);
    const newFlags: { [key: string]: boolean } = { g: false, i: false, m: false, s: false, u: false };
    t.flags.split('').forEach(f => {
      if (newFlags[f] !== undefined) newFlags[f] = true;
    });
    setFlags(newFlags);
  };

  const handleLoadChallenge = (ch: Challenge) => {
    setActiveChallengeId(ch.id);
    setTestText(ch.testString);
    setPattern(ch.defaultPattern);
    setFlags({ g: true, i: false, m: false, s: false, u: false });
    setActiveTab('challenges');
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'Interactive Regex Tester, Visualizer & Learning Academy — Tools'
            : 'Penguji Regex, Visualisasi & Panduan Belajar Interaktif — Tools'
        }
        description={
          language === 'en'
            ? 'Test regular expressions in real-time, inspect capture groups, learn regex with step-by-step token explanations, and solve interactive regex challenges.'
            : 'Uji regex secara real-time, analisis grup penangkap, pelajari makna token langkah-demi-langkah, dan selesaikan kuis latihan regex interaktif.'
        }
        url="/tools/regex-tester"
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-500 font-mono">
        <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
          {language === 'en' ? 'Home' : 'Beranda'}
        </Link>
        <span>/</span>
        <Link to="/tools" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
          {language === 'en' ? 'Tools' : 'Perkakas'}
        </Link>
        <span>/</span>
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">Regex Studio & Academy</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <GraduationCap size={14} />
            <span>{language === 'en' ? 'Regex Tester & Interactive Academy' : 'Penguji & Panduan Belajar Regex'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            Regex Tester & Pattern Visualizer
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Test regular expressions in real-time with capture group highlighting, breakdown token explanations so anyone can learn regex, and solve interactive practice challenges.'
              : 'Uji pola regex secara real-time dengan visualisasi grup penangkap, uraian token langkah-demi-langkah agar mudah dipelajari siapa pun, serta tantangan interaktif.'}
          </p>
        </div>

        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors shadow-xs self-start md:self-auto"
        >
          <ArrowLeft size={13} />
          <span>{language === 'en' ? 'All Tools' : 'Semua Perkakas'}</span>
        </Link>
      </div>

      {/* Pattern Templates Quick Bar */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono mr-1 shrink-0">
            {language === 'en' ? 'Preset Library:' : 'Pustaka Pola:'}
          </span>
          {REGEX_TEMPLATES.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectTemplate(t)}
              className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-900/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300"
            >
              {language === 'en' ? t.name : t.nameId}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveTab('challenges')}
          className="w-full sm:w-auto justify-center px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors shrink-0"
        >
          <Trophy size={13} />
          <span>{language === 'en' ? 'Practice Challenges' : 'Kuis Latihan Regex'}</span>
        </button>
      </div>

      {/* Regex Input Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Delimiter / */}
          <span className="hidden sm:inline text-xl font-mono text-stone-400">/</span>

          {/* Pattern Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern (e.g. [a-z0-9]+)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 font-mono text-sm text-stone-900 dark:text-zinc-100 border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 font-semibold"
            />
          </div>

          {/* Delimiter / and Flags */}
          <span className="hidden sm:inline text-xl font-mono text-stone-400">/</span>

          {/* Flag toggles and copy button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none flex items-center justify-between sm:justify-start gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-mono">
              {(['g', 'i', 'm', 's', 'u'] as const).map(flag => (
                <button
                  key={flag}
                  onClick={() => setFlags({ ...flags, [flag]: !flags[flag] })}
                  className={`flex-1 sm:flex-none text-center px-2 sm:px-2.5 py-1 rounded-lg font-bold transition-all ${
                    flags[flag]
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                  title={`Toggle flag: ${flag}`}
                >
                  {flag}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCopy(`/${pattern}/${flagString}`)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Regex Token Explainer ("Mudah Dipelajari") */}
        {tokenExplanations.length > 0 && !matchResult.error && (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <BookOpen size={12} className="text-rose-500" />
                <span>{language === 'en' ? 'Step-by-Step Pattern Breakdown (Easy Learning):' : 'Penjelasan Pola Regex (Mudah Dipelajari):'}</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {language === 'en' ? 'Decoded from regex syntax' : 'Diterjemahkan secara otomatis'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tokenExplanations.map((exp, i) => (
                <div
                  key={i}
                  className="group relative inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs shadow-2xs hover:border-rose-300 dark:hover:border-rose-900 transition-colors cursor-help"
                >
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {exp.token}
                  </span>
                  <span className="text-stone-600 dark:text-zinc-400 text-[11px]">
                    {language === 'en' ? exp.explanationEn : exp.explanationId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error notification if regex is invalid */}
        {matchResult.error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-mono">{matchResult.error}</span>
          </div>
        )}
      </div>

      {/* Main Dual Area: Test String & Matches Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Test String Input (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileCode size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Test Text Corpus' : 'Teks Pengujian'}</span>
            </label>
            <span className="text-[11px] text-stone-500 font-mono">
              {testText.length} chars
            </span>
          </div>

          <textarea
            value={testText}
            onChange={e => setTestText(e.target.value)}
            placeholder="Enter or paste text to test regex matches..."
            className="w-full p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 font-mono text-xs leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 text-stone-900 dark:text-zinc-100 resize-none h-48 sm:h-80"
          />

          {/* Quick Clear */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setTestText('')}
              className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200 transition-colors"
            >
              {language === 'en' ? 'Clear Text' : 'Kosongkan Teks'}
            </button>
            <button
              onClick={() => setTestText(REGEX_TEMPLATES[0].sample)}
              className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline"
            >
              {language === 'en' ? 'Reset Sample' : 'Muat Ulang Sampel'}
            </button>
          </div>
        </div>

        {/* Right: Matches, Replace, Learn & Challenges (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-200 dark:border-zinc-800 pb-3">
            <div className="w-full sm:w-auto overflow-x-auto scrollbar-none flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('matches')}
                className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'matches'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Search size={13} />
                <span>
                  {language === 'en' ? 'Matches' : 'Hasil Cocok'} ({matchResult.matches.length})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('replace')}
                className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'replace'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Replace size={13} />
                <span>{language === 'en' ? 'Substitution' : 'Pengganti'}</span>
              </button>

              <button
                onClick={() => setActiveTab('challenges')}
                className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'challenges'
                    ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Trophy size={13} />
                <span>{language === 'en' ? 'Quiz' : 'Kuis'}</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-stone-500 self-end sm:self-auto">
              {matchResult.timeMs}ms
            </div>
          </div>

          {/* Tab 1: Matches List */}
          {activeTab === 'matches' && (
            <div className="space-y-3">
              {matchResult.matches.length === 0 ? (
                <div className="p-10 text-center text-stone-400 space-y-1">
                  <Search size={24} className="mx-auto text-stone-300 dark:text-zinc-700" />
                  <p className="text-xs font-semibold text-stone-600 dark:text-zinc-400">
                    {language === 'en' ? 'No Matches Found' : 'Tidak Ada Kecocokan Ditemukan'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {language === 'en'
                      ? 'Adjust your regex pattern or test text above.'
                      : 'Sesuaikan pola ekspresi reguler atau teks pengujian Anda.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {matchResult.matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                          Match #{idx + 1}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          Index [{m.index} .. {m.index + m.text.length}]
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 font-bold break-all">
                        {m.text}
                      </div>

                      {/* Captured Groups */}
                      {m.groups.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5 text-[11px]">
                          <span className="text-stone-400 text-[10px] self-center">Groups:</span>
                          {m.groups.map((grp, gIdx) => (
                            <span
                              key={gIdx}
                              className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                            >
                              ${gIdx + 1}: "{grp}"
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Substitution & Replace */}
          {activeTab === 'replace' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 font-mono">
                  {language === 'en' ? 'Replacement Pattern' : 'Pola Pengganti'}
                </label>
                <input
                  type="text"
                  value={replacePattern}
                  onChange={e => setReplacePattern(e.target.value)}
                  placeholder="e.g. [REDACTED] or $1-$2"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 font-mono">
                    {language === 'en' ? 'Resulting Text' : 'Hasil Teks Setelah Penggantian'}
                  </label>
                  <button
                    onClick={() => handleCopy(substitutedText)}
                    className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium"
                  >
                    <Copy size={11} />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100 whitespace-pre-wrap min-h-[160px] max-h-[300px] overflow-y-auto">
                  {substitutedText}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Interactive Practice Challenges ("Mudah Dipelajari") */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 font-mono flex items-center gap-1.5">
                  <Trophy size={14} className="text-amber-500" />
                  <span>{language === 'en' ? 'Interactive Regex Quizzes' : 'Kuis Latihan Regex Mandiri'}</span>
                </h4>
                <p className="text-[11px] text-stone-500 leading-normal">
                  {language === 'en'
                    ? 'Pick a challenge below. The tool will evaluate your regex pattern against the test sentence in real time!'
                    : 'Pilih salah satu tantangan. Sistem akan menguji pola regex Anda langsung terhadap kalimat latihan!'}
                </p>
              </div>

              <div className="space-y-2">
                {PRACTICE_CHALLENGES.map(ch => {
                  const isSelected = activeChallengeId === ch.id;
                  const isPassed = isSelected && challengePassed;

                  return (
                    <div
                      key={ch.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-stone-50 dark:bg-zinc-950 border-rose-500/30'
                          : 'bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                              {language === 'en' ? ch.title : ch.titleId}
                            </span>
                            {isSelected && (
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                  isPassed
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                }`}
                              >
                                {isPassed
                                  ? language === 'en'
                                    ? 'Passed!'
                                    : 'Berhasil!'
                                  : language === 'en'
                                  ? 'In Progress'
                                  : 'Sedang Diuji'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            {language === 'en' ? ch.goal : ch.goalId}
                          </p>
                        </div>

                        <button
                          onClick={() => handleLoadChallenge(ch)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:border-rose-500 text-xs font-semibold text-stone-700 dark:text-zinc-300 transition-colors shrink-0"
                        >
                          {isSelected
                            ? language === 'en'
                              ? 'Active'
                              : 'Aktif'
                            : language === 'en'
                            ? 'Start'
                            : 'Mulai'}
                        </button>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-zinc-800/80 text-xs space-y-1.5">
                          <div className="text-[11px] text-stone-600 dark:text-zinc-400">
                            <span className="font-bold text-stone-700 dark:text-zinc-300">
                              Target Matches:
                            </span>{' '}
                            {ch.expectedMatches.map((em, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-800 font-mono text-[10px] mr-1"
                              >
                                {em}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <HelpCircle size={12} />
                            <span>Hint: {ch.hint}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
