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
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegexTemplate {
  name: string;
  nameId: string;
  pattern: string;
  flags: string;
  sample: string;
  description: string;
}

const REGEX_TEMPLATES: RegexTemplate[] = [
  {
    name: 'Email Address (RFC 5322)',
    nameId: 'Format Alamat Email',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    sample: 'Contact us at vanviolet.js@gmail.com or support@example.co.id for queries.',
    description: 'Matches standard internet email addresses.',
  },
  {
    name: 'Indonesian Phone Number',
    nameId: 'Nomor HP Indonesia (+62 / 08)',
    pattern: '(\\+62|62|0)8[1-9][0-9]{6,10}',
    flags: 'g',
    sample: 'Hubungi CS: +6281234567890 atau kantor di 085712345678 untuk info.',
    description: 'Matches Indonesian mobile numbers starting with +62, 62, or 08.',
  },
  {
    name: 'URL & Web Links',
    nameId: 'Tautan URL Website',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    sample: 'Visit https://github.com/MuchamadIrvan or http://localhost:3000/tools for info.',
    description: 'Matches HTTP/HTTPS web links and URLs.',
  },
  {
    name: 'IPv4 Address',
    nameId: 'Alamat IP IPv4',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Router IP is 192.168.1.1 and DNS is 8.8.8.8 while 999.123.4.1 is invalid.',
    description: 'Matches valid IPv4 addresses (0.0.0.0 to 255.255.255.255).',
  },
  {
    name: 'HEX Color Code',
    nameId: 'Kode Warna HEX',
    pattern: '#(?:[0-9a-fA-F]{3,4}){1,2}\\b',
    flags: 'gi',
    sample: 'Colors used: #F43F5E (rose), #10B981 (emerald), #FFF (white) and #33333380.',
    description: 'Matches 3, 6, or 8 digit hex color codes with hash prefix.',
  },
  {
    name: 'Date (YYYY-MM-DD / ISO)',
    nameId: 'Format Tanggal ISO',
    pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    sample: 'The project started on 2026-01-15 and milestone finished 2026-09-12.',
    description: 'Matches ISO standard dates in YYYY-MM-DD format.',
  },
];

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

  const flagString = useMemo(() => {
    return Object.keys(flags)
      .filter(k => flags[k])
      .join('');
  }, [flags]);

  const toggleFlag = (flag: string) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  // Compile Regex & Evaluate Matches
  const regexResult = useMemo(() => {
    if (!pattern) {
      return { isValid: true, regex: null, matches: [], replacedText: testText, error: null };
    }

    try {
      const rx = new RegExp(pattern, flagString);
      const matches: Array<{
        match: string;
        index: number;
        groups: string[];
      }> = [];

      if (flags.g) {
        let matchItem;
        const globalRx = new RegExp(pattern, flagString);
        let safetyCounter = 0;
        while ((matchItem = globalRx.exec(testText)) !== null && safetyCounter < 500) {
          safetyCounter++;
          matches.push({
            match: matchItem[0],
            index: matchItem.index,
            groups: matchItem.slice(1),
          });
          if (matchItem.index === globalRx.lastIndex) {
            globalRx.lastIndex++;
          }
        }
      } else {
        const singleMatch = rx.exec(testText);
        if (singleMatch) {
          matches.push({
            match: singleMatch[0],
            index: singleMatch.index,
            groups: singleMatch.slice(1),
          });
        }
      }

      let replacedText = '';
      try {
        replacedText = testText.replace(rx, replacePattern);
      } catch {
        replacedText = testText;
      }

      return {
        isValid: true,
        regex: rx,
        matches,
        replacedText,
        error: null,
      };
    } catch (err: any) {
      return {
        isValid: false,
        regex: null,
        matches: [],
        replacedText: testText,
        error: err.message || 'Invalid Regular Expression syntax',
      };
    }
  }, [pattern, flagString, testText, replacePattern, flags.g]);

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flagString}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyTemplate = (tmpl: RegexTemplate) => {
    setPattern(tmpl.pattern);
    setTestText(tmpl.sample);
    const newFlags: { [key: string]: boolean } = { g: false, i: false, m: false, s: false, u: false };
    for (const char of tmpl.flags) {
      if (newFlags[char] !== undefined) newFlags[char] = true;
    }
    setFlags(newFlags);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'Regex Tester & Explainer — Muchamad Irvan' : 'Regex Tester & Explainer'}
        description={
          language === 'en'
            ? 'Interactive real-time regular expression tester, match visualizer, flag toggles, cheat sheet, and template library.'
            : 'Penguji ekspresi reguler (Regex) interaktif dengan penyorotan kecocokan visual, template pola, dan cheat sheet lengkap.'
        }
        url="/tools/regex-tester"
      />

      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{language === 'en' ? 'Back to Tools Hub' : 'Kembali ke Tools'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
          <Code size={14} />
          <span>{language === 'en' ? 'Developer Pattern Tool' : 'Tool Pola Regex Dev'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          {language === 'en' ? 'Regex Tester & Pattern Visualizer' : 'Regex Tester & Visualizer Pola'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Test, debug, and optimize regular expressions in real-time. Features syntax error validation, match indices, capture groups breakdown, and replacement testing.'
            : 'Uji, periksa kesalahan sintaks, dan optimalkan ekspresi reguler (Regex) secara real-time dengan penghitung kecocokan, grup penangkapan, dan pratinjau penggantian teks.'}
        </p>
      </div>

      {/* Regex Input Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-2">
            <Search size={14} className="text-rose-500" />
            <span>{language === 'en' ? 'Regular Expression' : 'Pola Regex'}</span>
          </label>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-stone-500 dark:text-zinc-400 mr-1">Flags:</span>
            {[
              { key: 'g', label: 'global', desc: 'Global search' },
              { key: 'i', label: 'case insensitive', desc: 'Ignore casing' },
              { key: 'm', label: 'multiline', desc: '^ and $ match line boundaries' },
              { key: 's', label: 'dotAll', desc: '. matches newlines' },
              { key: 'u', label: 'unicode', desc: 'Unicode support' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => toggleFlag(f.key)}
                title={f.desc}
                className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border transition-colors ${
                  flags[f.key]
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:border-rose-400'
                }`}
              >
                {f.key}
              </button>
            ))}

            <button
              onClick={handleCopyPattern}
              className="ml-2 px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-stone-700 dark:text-zinc-300"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Pattern Input Box */}
        <div className="flex items-center rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 px-3.5 py-2 font-mono text-sm focus-within:ring-2 focus-within:ring-rose-500/30">
          <span className="text-rose-500 font-bold text-base select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            placeholder="[a-zA-Z0-9]+..."
            className="flex-1 bg-transparent px-2 text-stone-900 dark:text-zinc-100 focus:outline-hidden"
          />
          <span className="text-rose-500 font-bold text-base select-none">/</span>
          <span className="text-stone-400 dark:text-zinc-500 text-xs font-bold ml-1 select-none font-mono">
            {flagString || '-'}
          </span>
        </div>

        {/* Syntax Error / Validity Alert */}
        {!regexResult.isValid ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{regexResult.error}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={13} />
                <span>{language === 'en' ? 'Valid Regex Pattern' : 'Sintaks Regex Valid'}</span>
              </span>
              <span>•</span>
              <span>
                {language === 'en'
                  ? `${regexResult.matches.length} match(es) found`
                  : `${regexResult.matches.length} kecocokan ditemukan`}
              </span>
            </div>
            <button
              onClick={() => setShowReplace(!showReplace)}
              className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Replace size={13} />
              <span>{showReplace ? (language === 'en' ? 'Hide Replace' : 'Sembunyikan Ganti') : (language === 'en' ? 'Test Replacement' : 'Uji Penggantian Teks')}</span>
            </button>
          </div>
        )}

        {/* Optional Replace Bar */}
        {showReplace && (
          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 space-y-2">
            <label className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400 uppercase tracking-wider block">
              {language === 'en' ? 'Substitution / Replacement String' : 'String Pengganti'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replacePattern}
                onChange={e => setReplacePattern(e.target.value)}
                placeholder="replacement..."
                className="flex-1 font-mono text-xs px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Testing Area & Match List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Test String Area (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Test Text Input' : 'Teks Yang Diuji'}
              </label>
              <span className="text-[11px] font-mono text-stone-400">
                {testText.length} {language === 'en' ? 'chars' : 'karakter'}
              </span>
            </div>

            <textarea
              value={testText}
              onChange={e => setTestText(e.target.value)}
              rows={8}
              placeholder="Type or paste sample text here to test your regular expression..."
              className="w-full font-mono text-xs p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 text-stone-900 dark:text-zinc-100 resize-none leading-relaxed"
            />

            {/* Replacement Result Preview */}
            {showReplace && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider block">
                  {language === 'en' ? 'Replacement Preview Output' : 'Hasil Penggantian'}
                </span>
                <pre className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-stone-800 dark:text-zinc-200 overflow-x-auto whitespace-pre-wrap">
                  {regexResult.replacedText}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Library Templates */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-2">
              <BookOpen size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Common Regex Library' : 'Pustaka Template Regex Populer'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {REGEX_TEMPLATES.map(t => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="p-3 text-left rounded-xl border border-stone-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-rose-600 bg-stone-50 dark:bg-zinc-950/70 hover:bg-rose-500/5 transition-all space-y-1 group"
                >
                  <span className="text-xs font-bold text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 block">
                    {language === 'en' ? t.name : t.nameId}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-zinc-400 font-mono block truncate">
                    /{t.pattern}/
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matches & Group Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Matched Items' : 'Daftar Kecocokan'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {regexResult.matches.length}
              </span>
            </div>

            {regexResult.matches.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs text-stone-500 dark:text-zinc-400">
                {language === 'en'
                  ? 'No matches found with current pattern and text.'
                  : 'Tidak ada kecocokan yang ditemukan dengan pola dan teks saat ini.'}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {regexResult.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                        Match #{idx + 1}
                      </span>
                      <span className="text-stone-400 dark:text-zinc-500 font-mono">
                        index: {m.index}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100 break-all font-semibold">
                      {m.match}
                    </div>
                    {m.groups.length > 0 && (
                      <div className="pt-1.5 border-t border-stone-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                          Captured Groups:
                        </span>
                        {m.groups.map((g, gIdx) => (
                          <div
                            key={gIdx}
                            className="text-[11px] font-mono text-purple-600 dark:text-purple-400 flex items-center justify-between px-1.5 py-0.5 rounded bg-purple-500/5"
                          >
                            <span>Group {gIdx + 1}:</span>
                            <span className="font-bold">{g || '(empty)'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
