import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Database,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Download,
  FileCode,
  Sparkles,
  Minimize2,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_SQL = `SELECT u.id, u.name, u.email, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS total_spent, MAX(o.created_at) AS last_order_date FROM users u LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed' WHERE u.is_active = TRUE AND u.country IN ('ID', 'SG', 'MY') GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 2 ORDER BY total_spent DESC LIMIT 50;`;

const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'JOIN',
  'ON',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION ALL',
  'UNION',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'DELETE',
  'CREATE TABLE',
  'ALTER TABLE',
  'DROP TABLE',
  'WITH',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'BETWEEN',
  'LIKE',
  'IS NULL',
  'IS NOT NULL',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'DISTINCT',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'OVER',
  'PARTITION BY',
  'ROW_NUMBER',
  'COALESCE',
];

function formatSql(sql: string, uppercaseKeywords: boolean, indentSpaces: number): string {
  if (!sql.trim()) return '';

  let cleaned = sql
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  // Major clause keywords that break into new lines
  const majorClauses = [
    'SELECT',
    'FROM',
    'WHERE',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'FULL JOIN',
    'CROSS JOIN',
    'JOIN',
    'GROUP BY',
    'HAVING',
    'ORDER BY',
    'LIMIT',
    'OFFSET',
    'UNION ALL',
    'UNION',
    'INSERT INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE FROM',
    'WITH',
  ];

  // Uppercase keywords pass
  if (uppercaseKeywords) {
    SQL_KEYWORDS.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      cleaned = cleaned.replace(regex, kw);
    });
  }

  // Split clauses
  const indent = ' '.repeat(indentSpaces);
  let formatted = cleaned;

  majorClauses.forEach(clause => {
    const regex = new RegExp(`\\b(${clause})\\b`, 'gi');
    formatted = formatted.replace(regex, `\n$1`);
  });

  // Indent lines that don't start with major clauses
  const lines = formatted
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const finalLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isMajor = majorClauses.some(mc => line.toUpperCase().startsWith(mc));

    if (isMajor) {
      finalLines.push(line);
    } else {
      finalLines.push(`${indent}${line}`);
    }
  }

  return finalLines.join('\n');
}

function minifySql(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // remove comments
    .replace(/\s+/g, ' ') // collapse whitespaces
    .trim();
}

export const SqlFormatterPage: React.FC = () => {
  const { language } = usePortfolio();

  const [inputSql, setInputSql] = useState<string>(SAMPLE_SQL);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const formattedResult = useMemo(() => {
    return formatSql(inputSql, uppercase, indentSize);
  }, [inputSql, uppercase, indentSize]);

  const handleMinify = () => {
    setInputSql(minifySql(inputSql));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedResult], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'query.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'SQL Query Formatter & Minifier — Muchamad Irvan' : 'SQL Formatter & Minifier'}
        description={
          language === 'en'
            ? 'Format, beautify, and minify SQL queries for PostgreSQL, MySQL, and SQLite with keyword capitalizing and indentation controls.'
            : 'Format, percantik, dan minifikasi kueri SQL (PostgreSQL, MySQL, SQLite) dengan huruf kapital otomatis dan indentasi rapi.'
        }
        url="/tools/sql-formatter"
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
          <Database size={14} />
          <span>{language === 'en' ? 'Database & Backend Tool' : 'Tool Database & Backend'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          {language === 'en' ? 'SQL Query Formatter & Minifier' : 'SQL Query Formatter & Minifier'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Beautify unformatted SQL queries, capitalize standard dialect keywords, manage indentation, or minify queries for inline code execution.'
            : 'Rapikan sintaks kueri SQL, buat huruf kapital pada kata kunci standar (SELECT, JOIN, WHERE), atur indentasi, atau minifikasi kueri untuk string kode ringkas.'}
        </p>
      </div>

      {/* Main Grid: Input and Formatted Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input Column */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-2">
              <FileCode size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Raw SQL Query' : 'Kueri SQL Mentah'}</span>
            </label>
            <button
              onClick={() => setInputSql(SAMPLE_SQL)}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>{language === 'en' ? 'Load Sample' : 'Muat Contoh'}</span>
            </button>
          </div>

          <textarea
            value={inputSql}
            onChange={e => setInputSql(e.target.value)}
            rows={14}
            placeholder="SELECT * FROM users WHERE..."
            className="w-full font-mono text-xs p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 text-stone-900 dark:text-zinc-100 resize-none leading-relaxed"
          />

          {/* Quick Minify Action */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleMinify}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Minimize2 size={13} />
              <span>{language === 'en' ? 'Minify SQL' : 'Minifikasi SQL'}</span>
            </button>
            <button
              onClick={() => setInputSql('')}
              className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              {language === 'en' ? 'Clear' : 'Hapus'}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-2">
                <Sparkles size={14} className="text-rose-500" />
                <span>{language === 'en' ? 'Formatted SQL' : 'Hasil Terformat'}</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-stone-700 dark:text-zinc-300 cursor-pointer"
              >
                <Download size={12} />
                <span>.sql</span>
              </button>
            </div>
          </div>

          {/* Settings Bar */}
          <div className="flex flex-wrap items-center gap-4 p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercase(e.target.checked)}
                className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
              />
              <span>{language === 'en' ? 'UPPERCASE Keywords' : 'Huruf Kapital Kata Kunci'}</span>
            </label>

            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-stone-500 text-[11px]">Indent:</span>
              {[2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setIndentSize(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors ${
                    indentSize === s
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                  }`}
                >
                  {s} spaces
                </button>
              ))}
            </div>
          </div>

          <pre className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100 overflow-x-auto min-h-[290px] max-h-[380px] overflow-y-auto leading-relaxed">
            {formattedResult || '// Formatted SQL will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
