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
  Sliders,
  Table as TableIcon,
  Layers,
  Activity,
  GitBranch,
  ShieldAlert,
  Play,
  Terminal,
  Code2,
  ListTree,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SQL_TEMPLATES = [
  {
    name: 'E-Commerce Analytics Query',
    nameId: 'Analisis Penjualan E-Commerce',
    sql: `SELECT u.id AS user_id, u.name, u.email, COUNT(o.id) AS total_orders, COALESCE(SUM(o.total_amount), 0) AS total_spent, MAX(o.created_at) AS last_order_date FROM users u LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed' WHERE u.is_active = TRUE AND u.country IN ('ID', 'SG', 'MY') GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 1 ORDER BY total_spent DESC LIMIT 50;`,
  },
  {
    name: 'CTE & Window Ranking (PostgreSQL)',
    nameId: 'CTE & Peringkat Window (PostgreSQL)',
    sql: `WITH regional_sales AS (SELECT region, product_category, SUM(revenue) AS total_revenue, ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(revenue) DESC) AS rank_in_region FROM sales_records WHERE sale_date >= '2026-01-01' GROUP BY region, product_category) SELECT region, product_category, total_revenue FROM regional_sales WHERE rank_in_region <= 3 ORDER BY region, rank_in_region;`,
  },
  {
    name: 'PostgreSQL Upsert (ON CONFLICT)',
    nameId: 'Upsert PostgreSQL (ON CONFLICT)',
    sql: `INSERT INTO user_settings (user_id, theme, language, notifications_enabled, updated_at) VALUES ('usr_1092', 'dark', 'id', TRUE, NOW()) ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, language = EXCLUDED.language, updated_at = NOW();`,
  },
  {
    name: 'DDL: Relational Table Schema',
    nameId: 'DDL Skema Tabel Relasional',
    sql: `CREATE TABLE IF NOT EXISTS customer_invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, invoice_number VARCHAR(50) UNIQUE NOT NULL, amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`,
  },
];

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
  'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE FROM', 'DELETE', 'CREATE TABLE IF NOT EXISTS', 'CREATE TABLE', 'ALTER TABLE',
  'DROP TABLE', 'WITH', 'AS', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'OVER',
  'PARTITION BY', 'ROW_NUMBER', 'COALESCE', 'NOW()', 'ON CONFLICT', 'DO UPDATE', 'DO NOTHING', 'RETURNING',
  'REFERENCES', 'PRIMARY KEY', 'DEFAULT', 'CASCADE', 'NUMERIC', 'VARCHAR', 'TIMESTAMP', 'UUID', 'BOOLEAN'
];

function formatSql(sql: string, uppercaseKeywords: boolean, indentSpaces: number): string {
  if (!sql.trim()) return '';

  let cleaned = sql
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  // Major clause keywords that break into new lines
  const majorClauses = [
    'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN',
    'JOIN', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO',
    'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH', 'ON CONFLICT', 'DO UPDATE'
  ];

  if (uppercaseKeywords) {
    SQL_KEYWORDS.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      cleaned = cleaned.replace(regex, kw);
    });
  }

  const indent = ' '.repeat(indentSpaces);
  let formatted = cleaned;

  majorClauses.forEach(clause => {
    const regex = new RegExp(`\\b(${clause})\\b`, 'gi');
    formatted = formatted.replace(regex, `\n$1`);
  });

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
    .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const SqlFormatterPage: React.FC = () => {
  const { language } = usePortfolio();

  const [inputSql, setInputSql] = useState<string>(SQL_TEMPLATES[0].sql);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [dialect, setDialect] = useState<'PostgreSQL' | 'MySQL' | 'SQLite' | 'T-SQL'>('PostgreSQL');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'analysis' | 'plan'>('formatted');

  // Format query
  const formattedResult = useMemo(() => {
    return formatSql(inputSql, uppercase, indentSize);
  }, [inputSql, uppercase, indentSize]);

  // Query Analyzer & AST Metrics
  const analysis = useMemo(() => {
    const text = inputSql.trim();
    if (!text) {
      return {
        queryType: 'UNKNOWN',
        tables: [],
        columns: [],
        joins: [],
        hasSubquery: false,
        hasAggregation: false,
        complexityScore: 0,
        complexityLabel: 'Empty',
      };
    }

    const upper = text.toUpperCase();

    // Query Type
    let queryType = 'SELECT';
    if (upper.startsWith('INSERT')) queryType = 'INSERT';
    else if (upper.startsWith('UPDATE')) queryType = 'UPDATE';
    else if (upper.startsWith('DELETE')) queryType = 'DELETE';
    else if (upper.startsWith('CREATE TABLE')) queryType = 'CREATE TABLE (DDL)';
    else if (upper.startsWith('ALTER TABLE')) queryType = 'ALTER TABLE (DDL)';
    else if (upper.startsWith('WITH')) queryType = 'CTE / WITH';

    // Extract Tables (simple regex heuristic)
    const tables: string[] = [];
    const fromMatches = text.matchAll(/\bFROM\s+([a-zA-Z0-9_]+)/gi);
    for (const m of fromMatches) {
      if (m[1] && !tables.includes(m[1].toLowerCase())) tables.push(m[1].toLowerCase());
    }
    const joinMatches = text.matchAll(/\b(?:LEFT|RIGHT|INNER|FULL|CROSS)?\s*JOIN\s+([a-zA-Z0-9_]+)/gi);
    for (const m of joinMatches) {
      if (m[1] && !tables.includes(m[1].toLowerCase())) tables.push(m[1].toLowerCase());
    }

    // Joins
    const joins: string[] = [];
    const joinClauses = text.matchAll(/\b(LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL JOIN|JOIN)\s+([a-zA-Z0-9_]+)\s*(?:AS\s+)?([a-zA-Z0-9_]+)?\s*ON\s+([^,\n;]+)/gi);
    for (const j of joinClauses) {
      joins.push(`${j[1].toUpperCase()} ${j[2]} ON ${j[4].trim()}`);
    }

    // Aggregation & Subqueries
    const hasAggregation = /\b(COUNT|SUM|AVG|MIN|MAX|GROUP BY)\b/i.test(text);
    const hasSubquery = /\(\s*SELECT\b/i.test(text);
    const hasHaving = /\bHAVING\b/i.test(text);
    const hasOrderBy = /\bORDER BY\b/i.test(text);

    // Complexity Score Calculation
    let score = 1;
    score += tables.length * 1.5;
    score += joins.length * 2;
    if (hasAggregation) score += 2;
    if (hasHaving) score += 1.5;
    if (hasSubquery) score += 3;
    if (upper.includes('OVER (PARTITION BY')) score += 2.5;

    const roundedScore = Math.min(10, Math.round(score));
    let complexityLabel = language === 'en' ? 'Simple Query' : 'Kueri Sederhana';
    if (roundedScore >= 7) {
      complexityLabel = language === 'en' ? 'High Complexity' : 'Kompleksitas Tinggi';
    } else if (roundedScore >= 4) {
      complexityLabel = language === 'en' ? 'Moderate Query' : 'Kompleksitas Menengah';
    }

    return {
      queryType,
      tables,
      joins,
      hasSubquery,
      hasAggregation,
      hasHaving,
      hasOrderBy,
      complexityScore: roundedScore,
      complexityLabel,
    };
  }, [inputSql, language]);

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

  // Editor line numbers for raw SQL
  const inputLines = inputSql.split('\n');

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'Interactive SQL Editor, Formatter & Query Analyzer — Tools'
            : 'Editor SQL, Formatter & Analisis Kueri Interaktif — Tools'
        }
        description={
          language === 'en'
            ? 'Format, beautify, and analyze SQL queries with line numbers, code editor experience, table extraction, join inspector, and execution plan visualization.'
            : 'Rapikan dan analisis kueri SQL dengan pengalaman editor kode lengkap (nomor baris, ekstraksi tabel & JOIN, skor kompleksitas, dan simulasi rencana eksekusi).'
        }
        url="/tools/sql-formatter"
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
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">SQL Studio & Formatter</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Database size={14} />
            <span>{language === 'en' ? 'Database & Backend SQL Studio' : 'Studio Kueri Database & SQL'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            SQL Query Formatter & Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'An interactive SQL code editor with gutter line numbers, keyword capitalization, table & join extraction, query complexity scoring, and execution flow diagram.'
              : 'Editor kode SQL interaktif dengan penomoran baris, perapian sintaks otomatis, ekstraksi tabel dan JOIN, penilaian kompleksitas, dan diagram rencana eksekusi.'}
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

      {/* Dialect & Templates Quick Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Templates */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider font-mono mr-1">
            {language === 'en' ? 'Query Templates:' : 'Pola Kueri:'}
          </span>
          {SQL_TEMPLATES.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setInputSql(t.sql)}
              className="px-2.5 py-1 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-900/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300"
            >
              {language === 'en' ? t.name : t.nameId}
            </button>
          ))}
        </div>

        {/* Dialect Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-mono">
          <span className="px-2 text-stone-500 text-[11px]">Dialect:</span>
          {(['PostgreSQL', 'MySQL', 'SQLite', 'T-SQL'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDialect(d)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                dialect === d
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual Area: Interactive Code Editor vs Formatted/Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Code Editor (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-rose-500" />
              <label className="text-xs font-bold text-stone-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
                {language === 'en' ? 'SQL Code Editor' : 'Editor Kode SQL'}
              </label>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
              <span>{inputLines.length} lines</span>
              <span>•</span>
              <span>{inputSql.length} chars</span>
            </div>
          </div>

          {/* Editor Container with Line Numbers Gutter */}
          <div className="rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 flex overflow-hidden min-h-[380px] max-h-[460px]">
            {/* Line Numbers Gutter */}
            <div className="select-none py-3.5 px-2 bg-stone-100/70 dark:bg-zinc-900 border-r border-stone-200 dark:border-zinc-800/80 text-right font-mono text-xs text-stone-400 dark:text-zinc-600 space-y-0 leading-relaxed min-w-[36px]">
              {inputLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Input */}
            <textarea
              value={inputSql}
              onChange={e => setInputSql(e.target.value)}
              placeholder="Enter raw SQL statement..."
              className="flex-1 p-3.5 bg-transparent font-mono text-xs leading-relaxed border-none focus:outline-hidden text-stone-900 dark:text-zinc-100 resize-none overflow-y-auto"
            />
          </div>

          {/* Action Footer for Editor */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinify}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <Minimize2 size={13} />
                <span>{language === 'en' ? 'Minify SQL' : 'Minifikasi SQL'}</span>
              </button>
              <button
                onClick={() => setInputSql('')}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200 transition-colors"
              >
                {language === 'en' ? 'Clear' : 'Hapus'}
              </button>
            </div>

            <button
              onClick={() => setInputSql(formattedResult)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-xs"
            >
              {language === 'en' ? 'Apply Format to Editor' : 'Terapkan ke Editor'}
            </button>
          </div>
        </div>

        {/* Right: Formatted Output & Query Analyzer (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          {/* Tabs: Formatted / Analysis / Execution Flow */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('formatted')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'formatted'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Code2 size={13} />
                <span>{language === 'en' ? 'Formatted SQL' : 'Hasil Format'}</span>
              </button>

              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'analysis'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Activity size={13} />
                <span>{language === 'en' ? 'Query Metrics' : 'Analisis Kueri'}</span>
              </button>

              <button
                onClick={() => setActiveTab('plan')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'plan'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <GitBranch size={13} />
                <span>{language === 'en' ? 'Execution Tree' : 'Pohon Eksekusi'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                title="Download .sql"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          {/* Tab 1: Formatted Code */}
          {activeTab === 'formatted' && (
            <div className="space-y-3">
              {/* Formatter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={e => setUppercase(e.target.checked)}
                    className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{language === 'en' ? 'UPPERCASE Keywords' : 'Kapitalisasi Kata Kunci'}</span>
                </label>

                <div className="flex items-center gap-1.5">
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

              {/* Formatted Code Display with Line Numbers */}
              <div className="rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 flex overflow-hidden min-h-[310px] max-h-[380px]">
                <div className="select-none py-3 px-2 bg-stone-100/70 dark:bg-zinc-900 border-r border-stone-200 dark:border-zinc-800/80 text-right font-mono text-xs text-stone-400 dark:text-zinc-600 min-w-[32px]">
                  {formattedResult.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="p-3 font-mono text-xs text-stone-900 dark:text-zinc-100 overflow-auto flex-1 leading-relaxed whitespace-pre">
                  {formattedResult || '// Formatted SQL will appear here...'}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: Query Metrics & Deep Analyzer */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              {/* Query Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
                  <span className="text-[11px] text-stone-500 block font-medium">Query Type</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {analysis.queryType}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
                  <span className="text-[11px] text-stone-500 block font-medium">Complexity</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {analysis.complexityScore}/10 ({analysis.complexityLabel})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
                  <span className="text-[11px] text-stone-500 block font-medium">Tables Involved</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {analysis.tables.length} tables
                  </span>
                </div>
              </div>

              {/* Detected Tables */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-stone-700 dark:text-zinc-300 font-mono text-[11px] uppercase tracking-wider block">
                  {language === 'en' ? 'Detected Table References:' : 'Tabel yang Digunakan:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.tables.length > 0 ? (
                    analysis.tables.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono font-semibold"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-400 italic">No explicit tables detected</span>
                  )}
                </div>
              </div>

              {/* JOIN Inspector */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-stone-700 dark:text-zinc-300 font-mono text-[11px] uppercase tracking-wider block">
                  {language === 'en' ? 'JOIN Relationships & Keys:' : 'Relasi JOIN & Kunci Penghubung:'}
                </span>
                {analysis.joins.length > 0 ? (
                  <div className="space-y-1.5">
                    {analysis.joins.map((j, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 font-mono text-[11px] text-indigo-600 dark:text-indigo-400"
                      >
                        {j}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-stone-400 italic text-xs">Single table query (No JOINs)</span>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Execution Plan Flow Mock */}
          {activeTab === 'plan' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="font-bold text-stone-700 dark:text-zinc-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch size={13} className="text-rose-500" />
                  <span>{language === 'en' ? 'Visual Execution Pipeline Simulation:' : 'Simulasi Alur Eksekusi Kueri:'}</span>
                </span>
                <p className="text-[11px] text-stone-500">
                  {language === 'en'
                    ? 'Logical pipeline representation showing how the relational database engine parses and executes this statement.'
                    : 'Representasi alur logis eksekusi mesin database dalam memproses pernyataan kueri ini.'}
                </p>
              </div>

              {/* Step by step pipeline nodes */}
              <div className="space-y-2 p-3 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-zinc-100">
                      Sequential / Index Scan
                    </span>
                    <span className="text-stone-400 block text-[10px]">
                      Target: {analysis.tables[0] || 'primary table'}
                    </span>
                  </div>
                </div>

                {analysis.joins.length > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-stone-900 dark:text-zinc-100">
                        Hash Join Resolution
                      </span>
                      <span className="text-stone-400 block text-[10px]">
                        Evaluating {analysis.joins.length} join condition(s)
                      </span>
                    </div>
                  </div>
                )}

                {analysis.hasAggregation && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-stone-900 dark:text-zinc-100">
                        HashAggregate & Grouping
                      </span>
                      <span className="text-stone-400 block text-[10px]">
                        Computes aggregates & HAVING filters
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                    {analysis.hasAggregation ? (analysis.joins.length > 0 ? '4' : '3') : '2'}
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 dark:text-zinc-100">
                      Sort & Limit Projection
                    </span>
                    <span className="text-stone-400 block text-[10px]">
                      Streams top records to client
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
