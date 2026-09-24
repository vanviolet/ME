/**
 * Trilium Notes - Code Snippet Language Engine & VS Code Dark Modern Definitions
 * Provides syntax tokenization, static analysis/diagnostics (with TypeScript error checking),
 * IntelliSense autocompletions, and code formatting.
 */

export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'json'
  | 'html'
  | 'css'
  | 'sql'
  | 'rust'
  | 'go'
  | 'markdown';

export interface LanguageMeta {
  id: CodeLanguage;
  name: string;
  extension: string;
  iconText: string;
  iconBg: string;
  iconColor: string;
  sampleCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    iconText: 'TS',
    iconBg: '#3178c6',
    iconColor: '#ffffff',
    sampleCode: `import type { Request, Response, NextFunction } from 'express';

// Definisi Interface & Tipe
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export interface ClientRecord {
  count: number;
  resetTime: number;
}

const clientCache = new Map<string, ClientRecord>();

/**
 * Middleware Rate Limiter Express dengan TypeScript
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Terlalu banyak permintaan' } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp: string = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const currentTime: number = Date.now();
    const record = clientCache.get(clientIp);

    if (!record || currentTime > record.resetTime) {
      clientCache.set(clientIp, {
        count: 1,
        resetTime: currentTime + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: message,
        retryAfterMs: record.resetTime - currentTime,
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// Coba eksekusi fungsi
console.log('TypeScript Rate Limiter siap digunakan');`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    iconText: 'JS',
    iconBg: '#f7df1e',
    iconColor: '#000000',
    sampleCode: `// Utilitas Debounce & Throttle
export function debounce(callback, delayMs = 300) {
  let timeoutId = null;

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delayMs);
  };
}

export function calculateAverage(scores = []) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return 0;
  }
  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / scores.length).toFixed(2));
}

const sampleScores = [85, 92, 78, 96, 88];
console.log('Rata-rata nilai:', calculateAverage(sampleScores));`,
  },
  {
    id: 'python',
    name: 'Python',
    extension: '.py',
    iconText: 'PY',
    iconBg: '#3776ab',
    iconColor: '#ffd438',
    sampleCode: `import math
from typing import List, Optional

class DataAnalyzer:
    """Kelas untuk menganalisis data statistik."""

    def __init__(self, data: List[float]):
        self.data = [x for x in data if not math.isnan(x)]

    def calculate_mean(self) -> float:
        if not self.data:
            return 0.0
        return sum(self.data) / len(self.data)

    def calculate_variance(self) -> float:
        mean_val = self.calculate_mean()
        if len(self.data) <= 1:
            return 0.0
        variance = sum((x - mean_val) ** 2 for x in self.data) / len(self.data)
        return round(variance, 4)

# Contoh penggunaan
analyzer = DataAnalyzer([10.5, 23.1, 18.4, 45.2, 32.0])
print(f"Rata-rata: {analyzer.calculate_mean():.2f}")
print(f"Varians: {analyzer.calculate_variance():.2f}")`,
  },
  {
    id: 'json',
    name: 'JSON',
    extension: '.json',
    iconText: '{}',
    iconBg: '#292929',
    iconColor: '#e5a00d',
    sampleCode: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "name": "trilium-notes-project",
  "version": "2.4.0",
  "private": true,
  "config": {
    "theme": "dark-modern",
    "fontSize": 14,
    "tabSize": 2,
    "autoSave": true,
    "diagnostics": {
      "typescript": true,
      "linter": "strict"
    }
  },
  "tags": [
    "knowledge-base",
    "hierarchical",
    "wysiwyg",
    "vscode-snippets"
  ]
}`,
  },
  {
    id: 'html',
    name: 'HTML',
    extension: '.html',
    iconText: '<>',
    iconBg: '#e34f26',
    iconColor: '#ffffff',
    sampleCode: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trilium Code Snippet</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-dark">
  <header class="navbar">
    <div class="logo">
      <span class="badge">VS Code</span>
      <h1>Editor Snippet</h1>
    </div>
  </header>
  <main class="container">
    <section class="card">
      <h2>Catatan Kode Interaktif</h2>
      <p>Dilengkapi syntax highlighting dan diagnostics real-time.</p>
      <button class="btn btn-primary" onclick="alert('Hello!')">Mulai</button>
    </section>
  </main>
</body>
</html>`,
  },
  {
    id: 'css',
    name: 'CSS',
    extension: '.css',
    iconText: '#',
    iconBg: '#1572b6',
    iconColor: '#ffffff',
    sampleCode: `/* VS Code Dark Modern Theme Palette */
:root {
  --vscode-bg: #1e1e1e;
  --vscode-gutter: #1e1e1e;
  --vscode-text: #d4d4d4;
  --vscode-purple: #c586c0;
  --vscode-blue: #569cd6;
  --vscode-cyan: #4ec9b0;
  --vscode-yellow: #dcdcaa;
  --vscode-orange: #ce9178;
  --vscode-green: #6a9955;
  --vscode-lightgreen: #b5cea8;
}

.editor-container {
  display: flex;
  flex-direction: column;
  background-color: var(--vscode-bg);
  color: var(--vscode-text);
  font-family: 'Consolas', 'Courier New', monospace;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.editor-line:hover {
  background-color: rgba(255, 255, 255, 0.04);
}`,
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: '.sql',
    iconText: 'SQL',
    iconBg: '#00758f',
    iconColor: '#ffffff',
    sampleCode: `-- Query Analitik Proyek & Riwayat Sprint
SELECT 
    p.id AS project_id,
    p.name AS project_name,
    COUNT(i.id) AS total_issues,
    SUM(CASE WHEN i.status = 'DONE' THEN 1 ELSE 0 END) AS completed_issues,
    ROUND(
        (SUM(CASE WHEN i.status = 'DONE' THEN 1.0 ELSE 0.0 END) / NULLIF(COUNT(i.id), 0)) * 100, 
        2
    ) AS progress_percentage
FROM projects p
LEFT JOIN issues i ON i.project_id = p.id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name
HAVING COUNT(i.id) > 0
ORDER BY progress_percentage DESC;`,
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    iconText: 'RS',
    iconBg: '#dea584',
    iconColor: '#000000',
    sampleCode: `use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct UserProfile {
    pub id: u64,
    pub username: String,
    pub is_active: bool,
}

impl UserProfile {
    pub fn new(id: u64, username: &str) -> Self {
        Self {
            id,
            username: username.to_string(),
            is_active: true,
        }
    }
}

fn main() {
    let mut users: HashMap<u64, UserProfile> = HashMap::new();
    let admin = UserProfile::new(1, "superadmin");
    users.insert(admin.id, admin);

    println!("Total pengguna terdaftar: {}", users.len());
}`,
  },
  {
    id: 'go',
    name: 'Go',
    extension: '.go',
    iconText: 'GO',
    iconBg: '#00add8',
    iconColor: '#ffffff',
    sampleCode: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ServerStatus struct {
	Status    string    \`json:"status"\`
	Timestamp time.Time \`json:"timestamp"\`
	UptimeSec int64     \`json:"uptime_sec"\`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	status := ServerStatus{
		Status:    "healthy",
		Timestamp: time.Now(),
		UptimeSec: 3600,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func main() {
	http.HandleFunc("/health", healthHandler)
	fmt.Println("Server Go berjalan di port 8080...")
}`,
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extension: '.md',
    iconText: 'MD',
    iconBg: '#083fa1',
    iconColor: '#ffffff',
    sampleCode: `# Trilium Notes: Panduan Dokumentasi

## Fitur Unggulan
- **Struktur Pohon Hierarkis**: Tidak terbatas kedalaman folder
- **Visual WYSIWYG**: Format teks, stabilo, heading, tabel
- **VS Code Code Snippet**: Editor kode lengkap dengan syntax highlighting dan diagnostik

### Contoh Perintah Terminal:
\`\`\`bash
npm run dev
\`\`\`

> Catatan penting selalu tersimpan otomatis dalam basis data lokal.`,
  },
];

// ==========================================
// VS Code Dark Modern Color Tokens
// ==========================================
export type TokenType =
  | 'keyword-purple' // export, import, from, return, if, else, await, etc.
  | 'keyword-blue' // function, class, const, let, var, interface, type, async, etc.
  | 'type' // string, number, boolean, Request, Response, Promise, etc.
  | 'function' // function names & calls: createRateLimiter(, log(, etc.
  | 'string' // '...', "...", `...`
  | 'number' // 123, 45.6
  | 'boolean' // true, false
  | 'comment' // // ..., /* ... */, # ...
  | 'variable' // parameters, identifiers
  | 'property' // .propName
  | 'tag' // <div>, <button>
  | 'attribute' // class="", id=""
  | 'bracket-1' // { } (gold)
  | 'bracket-2' // ( ) (magenta)
  | 'bracket-3' // [ ] (blue)
  | 'operator' // =, +, =>, etc.
  | 'default';

export interface CodeToken {
  text: string;
  type: TokenType;
  color: string;
  isError?: boolean;
  errorMessage?: string;
}

// Exact VS Code Dark Modern hex colors
export const VSCODE_COLORS: Record<TokenType, string> = {
  'keyword-purple': '#c586c0', // Magenta/Purple: export, import, return, from, default, if, else
  'keyword-blue': '#569cd6', // Blue: function, const, let, class, interface, type, async
  type: '#4ec9b0', // Teal/Cyan: string, number, boolean, Request, Promise, CustomType
  function: '#dcdcaa', // Yellow/Gold: function names & method calls
  string: '#ce9178', // Warm Terracotta Orange: "...", '...', `...`
  number: '#b5cea8', // Light Sage Green: 123, 3.14
  boolean: '#569cd6', // Blue/Green
  comment: '#6a9955', // Muted Green (italic): comments
  variable: '#9cdcfe', // Light Sky Blue: variables & parameters
  property: '#9cdcfe', // Object properties
  tag: '#569cd6', // HTML Tag
  attribute: '#9cdcfe', // HTML attribute
  'bracket-1': '#ffd700', // Gold bracket pair
  'bracket-2': '#da70d6', // Purple bracket pair
  'bracket-3': '#179fff', // Blue bracket pair
  operator: '#d4d4d4', // Gray operator
  default: '#d4d4d4', // Default text
};

const TS_KEYWORDS_PURPLE = new Set([
  'export',
  'import',
  'from',
  'as',
  'default',
  'return',
  'throw',
  'yield',
  'await',
  'if',
  'else',
  'switch',
  'case',
  'break',
  'continue',
  'for',
  'while',
  'do',
  'try',
  'catch',
  'finally',
  'with',
]);

const TS_KEYWORDS_BLUE = new Set([
  'function',
  'class',
  'interface',
  'type',
  'enum',
  'namespace',
  'module',
  'const',
  'let',
  'var',
  'async',
  'new',
  'this',
  'super',
  'extends',
  'implements',
  'static',
  'readonly',
  'public',
  'private',
  'protected',
  'override',
  'typeof',
  'instanceof',
  'in',
  'keyof',
  'is',
  'satisfies',
  'declare',
  'abstract',
]);

const TS_TYPES = new Set([
  'string',
  'number',
  'boolean',
  'any',
  'unknown',
  'never',
  'void',
  'null',
  'undefined',
  'symbol',
  'bigint',
  'object',
  'Record',
  'Promise',
  'Array',
  'Partial',
  'Required',
  'Readonly',
  'Pick',
  'Omit',
  'Exclude',
  'Extract',
  'NonNullable',
  'ReturnType',
  'InstanceType',
  'Parameters',
  'Map',
  'Set',
  'Date',
  'Error',
  'RegExp',
  'Request',
  'Response',
  'NextFunction',
  'React',
  'FC',
  'HTMLDivElement',
  'HTMLElement',
]);

const PY_KEYWORDS_PURPLE = new Set([
  'import',
  'from',
  'as',
  'return',
  'yield',
  'if',
  'elif',
  'else',
  'try',
  'except',
  'finally',
  'for',
  'while',
  'break',
  'continue',
  'raise',
  'with',
  'pass',
  'assert',
]);

const PY_KEYWORDS_BLUE = new Set([
  'def',
  'class',
  'lambda',
  'async',
  'await',
  'global',
  'nonlocal',
  'del',
]);

const PY_TYPES = new Set([
  'int',
  'str',
  'float',
  'bool',
  'list',
  'dict',
  'set',
  'tuple',
  'bytes',
  'Any',
  'Optional',
  'Union',
  'List',
  'Dict',
  'Tuple',
  'Set',
]);

const SQL_KEYWORDS_PURPLE = new Set([
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'LEFT',
  'RIGHT',
  'INNER',
  'FULL',
  'OUTER',
  'ON',
  'GROUP',
  'BY',
  'ORDER',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'CREATE',
  'TABLE',
  'ALTER',
  'DROP',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'IS',
  'NULL',
  'TRUE',
  'FALSE',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
]);

/**
 * Tokenize a single line of code into VS Code Dark Modern tokens
 */
export function tokenizeLine(
  line: string,
  language: CodeLanguage,
  bracketDepth: { count: number } = { count: 0 }
): CodeToken[] {
  const tokens: CodeToken[] = [];
  let i = 0;
  const len = line.length;

  // Single-line Comment check
  if (language === 'python' && line.trimStart().startsWith('#')) {
    return [{ text: line, type: 'comment', color: VSCODE_COLORS.comment }];
  }
  if (
    (language === 'typescript' ||
      language === 'javascript' ||
      language === 'rust' ||
      language === 'go') &&
    line.trimStart().startsWith('//')
  ) {
    return [{ text: line, type: 'comment', color: VSCODE_COLORS.comment }];
  }
  if (language === 'sql' && line.trimStart().startsWith('--')) {
    return [{ text: line, type: 'comment', color: VSCODE_COLORS.comment }];
  }

  while (i < len) {
    const char = line[i];

    // Comments check within line
    if (
      (language === 'typescript' ||
        language === 'javascript' ||
        language === 'rust' ||
        language === 'go') &&
      char === '/' &&
      line[i + 1] === '/'
    ) {
      tokens.push({
        text: line.slice(i),
        type: 'comment',
        color: VSCODE_COLORS.comment,
      });
      break;
    }

    if (language === 'python' && char === '#') {
      tokens.push({
        text: line.slice(i),
        type: 'comment',
        color: VSCODE_COLORS.comment,
      });
      break;
    }

    if (language === 'sql' && char === '-' && line[i + 1] === '-') {
      tokens.push({
        text: line.slice(i),
        type: 'comment',
        color: VSCODE_COLORS.comment,
      });
      break;
    }

    // Whitespace
    if (/\s/.test(char)) {
      let spaceStr = '';
      while (i < len && /\s/.test(line[i])) {
        spaceStr += line[i];
        i++;
      }
      tokens.push({ text: spaceStr, type: 'default', color: VSCODE_COLORS.default });
      continue;
    }

    // Strings: single quote, double quote, backtick
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let strVal = quote;
      i++;
      let escaped = false;
      while (i < len) {
        const c = line[i];
        strVal += c;
        if (escaped) {
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === quote) {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ text: strVal, type: 'string', color: VSCODE_COLORS.string });
      continue;
    }

    // Numbers
    if (
      /\d/.test(char) ||
      (char === '.' && i + 1 < len && /\d/.test(line[i + 1]) && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1])))
    ) {
      let numStr = '';
      while (i < len && /[0-9a-fA-FxXoObB._]/.test(line[i])) {
        numStr += line[i];
        i++;
      }
      tokens.push({ text: numStr, type: 'number', color: VSCODE_COLORS.number });
      continue;
    }

    // Bracket pair colorization
    if (char === '{' || char === '(' || char === '[') {
      bracketDepth.count++;
      const mod = (bracketDepth.count % 3) || 3;
      const bType: TokenType = mod === 1 ? 'bracket-1' : mod === 2 ? 'bracket-2' : 'bracket-3';
      tokens.push({ text: char, type: bType, color: VSCODE_COLORS[bType] });
      i++;
      continue;
    }
    if (char === '}' || char === ')' || char === ']') {
      const mod = (bracketDepth.count % 3) || 3;
      const bType: TokenType = mod === 1 ? 'bracket-1' : mod === 2 ? 'bracket-2' : 'bracket-3';
      bracketDepth.count = Math.max(0, bracketDepth.count - 1);
      tokens.push({ text: char, type: bType, color: VSCODE_COLORS[bType] });
      i++;
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(char)) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Check if followed by open parenthesis -> Function invocation
      let lookahead = i;
      while (lookahead < len && line[lookahead] === ' ') {
        lookahead++;
      }
      const isCall = lookahead < len && line[lookahead] === '(';

      // Check if preceded by dot -> Property access
      const isProp = tokens.length > 0 && tokens[tokens.length - 1].text.trimEnd().endsWith('.');

      // Check TypeScript / JavaScript
      if (language === 'typescript' || language === 'javascript') {
        if (TS_KEYWORDS_PURPLE.has(word)) {
          tokens.push({ text: word, type: 'keyword-purple', color: VSCODE_COLORS['keyword-purple'] });
        } else if (TS_KEYWORDS_BLUE.has(word)) {
          tokens.push({ text: word, type: 'keyword-blue', color: VSCODE_COLORS['keyword-blue'] });
        } else if (word === 'true' || word === 'false') {
          tokens.push({ text: word, type: 'boolean', color: VSCODE_COLORS.boolean });
        } else if (word === 'null' || word === 'undefined') {
          tokens.push({ text: word, type: 'keyword-blue', color: VSCODE_COLORS['keyword-blue'] });
        } else if (TS_TYPES.has(word) || (language === 'typescript' && /^[A-Z][a-zA-Z0-9]*$/.test(word) && !isCall)) {
          tokens.push({ text: word, type: 'type', color: VSCODE_COLORS.type });
        } else if (isCall) {
          tokens.push({ text: word, type: 'function', color: VSCODE_COLORS.function });
        } else if (isProp) {
          tokens.push({ text: word, type: 'property', color: VSCODE_COLORS.property });
        } else {
          tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
        }
        continue;
      }

      // Check Python
      if (language === 'python') {
        if (PY_KEYWORDS_PURPLE.has(word)) {
          tokens.push({ text: word, type: 'keyword-purple', color: VSCODE_COLORS['keyword-purple'] });
        } else if (PY_KEYWORDS_BLUE.has(word)) {
          tokens.push({ text: word, type: 'keyword-blue', color: VSCODE_COLORS['keyword-blue'] });
        } else if (word === 'True' || word === 'False' || word === 'None') {
          tokens.push({ text: word, type: 'boolean', color: VSCODE_COLORS.boolean });
        } else if (PY_TYPES.has(word)) {
          tokens.push({ text: word, type: 'type', color: VSCODE_COLORS.type });
        } else if (isCall) {
          tokens.push({ text: word, type: 'function', color: VSCODE_COLORS.function });
        } else {
          tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
        }
        continue;
      }

      // Check SQL
      if (language === 'sql') {
        const upperWord = word.toUpperCase();
        if (SQL_KEYWORDS_PURPLE.has(upperWord)) {
          tokens.push({ text: word, type: 'keyword-purple', color: VSCODE_COLORS['keyword-purple'] });
        } else if (isCall) {
          tokens.push({ text: word, type: 'function', color: VSCODE_COLORS.function });
        } else {
          tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
        }
        continue;
      }

      // Default identifier fallback
      if (isCall) {
        tokens.push({ text: word, type: 'function', color: VSCODE_COLORS.function });
      } else {
        tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
      }
      continue;
    }

    // Operators and punctuation
    let op = char;
    i++;
    // Combine 2-character and 3-character operators
    if (i < len && /[=+\-*/%&|^!<>?:.]/.test(line[i])) {
      op += line[i];
      i++;
      if (i < len && /[=><]/.test(line[i])) {
        op += line[i];
        i++;
      }
    }
    tokens.push({ text: op, type: 'operator', color: VSCODE_COLORS.operator });
  }

  return tokens;
}

// ==========================================
// TypeScript & Static Diagnostics Engine
// ==========================================
export interface Diagnostic {
  line: number;
  column: number;
  endColumn?: number;
  severity: 'error' | 'warning' | 'info';
  code: string;
  source: string;
  message: string;
  quickFix?: {
    label: string;
    applyFix: (currentCode: string) => string;
  };
  highlightWord?: string;
}

/**
 * Perform realistic static analysis with TypeScript error diagnostics
 */
export function analyzeCode(code: string, language: CodeLanguage): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = code.split('\n');

  // JSON strict validation
  if (language === 'json') {
    try {
      JSON.parse(code);
    } catch (err: any) {
      const msg = err.message || 'Format JSON tidak valid';
      // Try extract line and position
      let lineNum = 1;
      let colNum = 1;
      const matchPos = msg.match(/position (\d+)/i);
      if (matchPos) {
        const pos = parseInt(matchPos[1], 10);
        let currentPos = 0;
        for (let l = 0; l < lines.length; l++) {
          if (currentPos + lines[l].length + 1 >= pos) {
            lineNum = l + 1;
            colNum = pos - currentPos + 1;
            break;
          }
          currentPos += lines[l].length + 1;
        }
      }
      diagnostics.push({
        line: lineNum,
        column: colNum,
        severity: 'error',
        code: 'json(parse)',
        source: 'JSON',
        message: msg,
      });
    }
    return diagnostics;
  }

  // TypeScript / JavaScript Analysis
  if (language === 'typescript' || language === 'javascript') {
    // 1. Check bracket balance across entire document
    let braceBalance = 0;
    let parenBalance = 0;
    let bracketBalance = 0;
    let lastOpenBraceLine = 1;
    let lastOpenParenLine = 1;

    // Track const variables to catch reassignment
    const constVariables = new Set<string>();

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();

      // Skip pure comment lines
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      // Register 'const' declarations
      const constMatch = lineText.match(/\bconst\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/);
      if (constMatch) {
        constVariables.add(constMatch[1]);
      }

      // Check for reassigning to const variable: e.g. "myVar = " or "myVar++"
      constVariables.forEach((constName) => {
        // Skip the line where it was declared
        if (!lineText.includes(`const ${constName}`)) {
          const reassignRegex = new RegExp(`\\b${constName}\\s*(=|\\+=|-=|\\*=|\\/=|\\+\\+|--)`);
          if (reassignRegex.test(lineText)) {
            const col = lineText.indexOf(constName) + 1;
            diagnostics.push({
              line: lineNum,
              column: col,
              severity: 'error',
              code: 'ts(2588)',
              source: 'TypeScript',
              message: `Cannot assign to '${constName}' because it is a constant.`,
              highlightWord: constName,
              quickFix: {
                label: `Ubah 'const ${constName}' menjadi 'let ${constName}'`,
                applyFix: (src) => src.replace(new RegExp(`\\bconst\\s+${constName}\\b`), `let ${constName}`),
              },
            });
          }
        }
      });

      // 2. TypeScript Type Mismatch Checks
      if (language === 'typescript') {
        // Check: const x: number = "hello" or 'hello'
        const numMismatch = lineText.match(
          /:\s*number\s*=\s*(["'`][^"'`]*["'`])/
        );
        if (numMismatch) {
          const col = lineText.indexOf(numMismatch[1]) + 1;
          diagnostics.push({
            line: lineNum,
            column: col,
            severity: 'error',
            code: 'ts(2322)',
            source: 'TypeScript',
            message: `Type 'string' is not assignable to type 'number'.`,
            highlightWord: numMismatch[1],
            quickFix: {
              label: `Ganti tipe menjadi 'string'`,
              applyFix: (src) => {
                const lns = src.split('\n');
                lns[idx] = lns[idx].replace(/:\s*number\s*=/, ': string =');
                return lns.join('\n');
              },
            },
          });
        }

        // Check: const x: string = 123 or false
        const strMismatch = lineText.match(
          /:\s*string\s*=\s*(\d+|true|false)\b/
        );
        if (strMismatch) {
          const col = lineText.indexOf(strMismatch[1]) + 1;
          const assignedVal = strMismatch[1];
          diagnostics.push({
            line: lineNum,
            column: col,
            severity: 'error',
            code: 'ts(2322)',
            source: 'TypeScript',
            message: `Type '${assignedVal === 'true' || assignedVal === 'false' ? 'boolean' : 'number'}' is not assignable to type 'string'.`,
            highlightWord: assignedVal,
            quickFix: {
              label: `Bungkus nilai dengan tanda petik "${assignedVal}"`,
              applyFix: (src) => {
                const lns = src.split('\n');
                lns[idx] = lns[idx].replace(new RegExp(`=\\s*${assignedVal}\\b`), `= "${assignedVal}"`);
                return lns.join('\n');
              },
            },
          });
        }

        // Check: const x: boolean = 123 or "true"
        const boolMismatch = lineText.match(
          /:\s*boolean\s*=\s*(["'`][^"'`]*["'`]|\d+)\b/
        );
        if (boolMismatch) {
          const col = lineText.indexOf(boolMismatch[1]) + 1;
          diagnostics.push({
            line: lineNum,
            column: col,
            severity: 'error',
            code: 'ts(2322)',
            source: 'TypeScript',
            message: `Type '${boolMismatch[1].startsWith('"') || boolMismatch[1].startsWith("'") ? 'string' : 'number'}' is not assignable to type 'boolean'.`,
            highlightWord: boolMismatch[1],
          });
        }

        // Typo in common type names
        const typeTypoMap: Record<string, string> = {
          nuber: 'number',
          numbr: 'number',
          strng: 'string',
          sttring: 'string',
          bolean: 'boolean',
          boolen: 'boolean',
          anyy: 'any',
          voide: 'void',
          functon: 'Function',
        };

        for (const [typo, correct] of Object.entries(typeTypoMap)) {
          const typoMatch = lineText.match(new RegExp(`:\\s*(${typo})\\b`));
          if (typoMatch) {
            const col = lineText.indexOf(typo) + 1;
            diagnostics.push({
              line: lineNum,
              column: col,
              severity: 'error',
              code: 'ts(2552)',
              source: 'TypeScript',
              message: `Cannot find name '${typo}'. Did you mean '${correct}'?`,
              highlightWord: typo,
              quickFix: {
                label: `Perbaiki ejaan menjadi '${correct}'`,
                applyFix: (src) => {
                  const lns = src.split('\n');
                  lns[idx] = lns[idx].replace(new RegExp(`:\\s*${typo}\\b`), `: ${correct}`);
                  return lns.join('\n');
                },
              },
            });
          }
        }
      }

      // 3. Typo in common console methods
      const consoleTypoMap: Record<string, string> = {
        logg: 'log',
        prnt: 'log',
        eror: 'error',
        warnn: 'warn',
      };
      for (const [typo, correct] of Object.entries(consoleTypoMap)) {
        if (lineText.includes(`console.${typo}(`)) {
          const col = lineText.indexOf(`console.${typo}`) + 1;
          diagnostics.push({
            line: lineNum,
            column: col,
            severity: 'error',
            code: 'ts(2551)',
            source: 'TypeScript',
            message: `Property '${typo}' does not exist on type 'Console'. Did you mean '${correct}'?`,
            highlightWord: typo,
            quickFix: {
              label: `Ganti dengan 'console.${correct}'`,
              applyFix: (src) => src.replace(`console.${typo}(`, `console.${correct}(`),
            },
          });
        }
      }

      // 4. Assignment inside if conditional (e.g. if (x = 5))
      const ifAssign = lineText.match(/if\s*\([^=]*[^!=<>]=[^=]/);
      if (ifAssign && !lineText.includes('==') && !lineText.includes('===')) {
        const col = lineText.indexOf('=') + 1;
        diagnostics.push({
          line: lineNum,
          column: col,
          severity: 'warning',
          code: 'ts(2695)',
          source: 'TypeScript',
          message: `Left side of '=' is assignment, not comparison. Did you mean '===' or '=='?`,
          highlightWord: '=',
          quickFix: {
            label: `Ganti '=' dengan '==='`,
            applyFix: (src) => {
              const lns = src.split('\n');
              lns[idx] = lns[idx].replace(/if\s*\(([^=]*)=([^=])/, 'if ($1===$2');
              return lns.join('\n');
            },
          },
        });
      }

      // 5. Unterminated string on single line (if unescaped single quote or double quote is odd)
      let inSingle = false;
      let inDouble = false;
      for (let c = 0; c < lineText.length; c++) {
        const char = lineText[c];
        if (char === '\\') {
          c++;
          continue;
        }
        if (char === "'" && !inDouble) inSingle = !inSingle;
        if (char === '"' && !inSingle) inDouble = !inDouble;
      }
      if (inSingle || inDouble) {
        diagnostics.push({
          line: lineNum,
          column: lineText.length,
          severity: 'error',
          code: 'ts(1002)',
          source: 'TypeScript',
          message: 'Unterminated string literal.',
        });
      }

      // Track bracket balances
      for (let c = 0; c < lineText.length; c++) {
        const char = lineText[c];
        if (char === '{') {
          braceBalance++;
          lastOpenBraceLine = lineNum;
        } else if (char === '}') {
          braceBalance--;
        } else if (char === '(') {
          parenBalance++;
          lastOpenParenLine = lineNum;
        } else if (char === ')') {
          parenBalance--;
        } else if (char === '[') {
          bracketBalance++;
        } else if (char === ']') {
          bracketBalance--;
        }
      }
    });

    // Check final balances
    if (braceBalance > 0) {
      diagnostics.push({
        line: lastOpenBraceLine,
        column: 1,
        severity: 'error',
        code: 'ts(1005)',
        source: 'TypeScript',
        message: "'}' expected. Blok kurung kurawal tidak tertutup.",
      });
    } else if (braceBalance < 0) {
      diagnostics.push({
        line: lines.length,
        column: 1,
        severity: 'error',
        code: 'ts(1005)',
        source: 'TypeScript',
        message: "Unexpected '}'. Terdapat tanda kurung tutup berlebih.",
      });
    }

    if (parenBalance > 0) {
      diagnostics.push({
        line: lastOpenParenLine,
        column: 1,
        severity: 'error',
        code: 'ts(1005)',
        source: 'TypeScript',
        message: "')' expected. Tanda kurung buka tidak memiliki pasangan penutup.",
      });
    }
  }

  // Python validation
  if (language === 'python') {
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      // Check missing colon on def, class, if, elif, else, for, while
      const needsColon = /^(def\s+[a-zA-Z0-9_]+\s*\(.*?\)|class\s+[a-zA-Z0-9_]+(\(.*?\))?|if\s+.+|elif\s+.+|else|for\s+.+\s+in\s+.+|while\s+.+|try|except.*|finally)$/;
      if (needsColon.test(trimmed) && !trimmed.endsWith(':')) {
        diagnostics.push({
          line: lineNum,
          column: lineText.length + 1,
          severity: 'error',
          code: 'py(syntax)',
          source: 'Python',
          message: "SyntaxError: expected ':' at end of statement.",
          quickFix: {
            label: "Tambahkan tanda ':' di akhir baris",
            applyFix: (src) => {
              const lns = src.split('\n');
              lns[idx] = lns[idx] + ':';
              return lns.join('\n');
            },
          },
        });
      }
    });
  }

  return diagnostics;
}

// ==========================================
// VS Code IntelliSense Autocomplete Engine
// ==========================================
export interface CompletionItem {
  label: string;
  kind: 'snippet' | 'keyword' | 'function' | 'type' | 'variable' | 'property';
  detail: string;
  insertText: string;
  documentation: string;
  cursorOffset?: number; // Where to place cursor relative to inserted text
}

const TS_COMPLETIONS: CompletionItem[] = [
  // Snippets
  {
    label: 'export function',
    kind: 'snippet',
    detail: 'Snippet: Fungsi yang diekspor',
    insertText: `export function namaFungsi(param: string): void {\n  \n}`,
    documentation: 'Membuat deklarasi fungsi publik dengan ekspor modular.',
    cursorOffset: 53,
  },
  {
    label: 'export interface',
    kind: 'snippet',
    detail: 'Snippet: Interface TypeScript',
    insertText: `export interface ModelBaru {\n  id: string;\n  name: string;\n  createdAt: number;\n}`,
    documentation: 'Mendefinisikan kontrak interface tipe data untuk TypeScript.',
  },
  {
    label: 'export type',
    kind: 'snippet',
    detail: 'Snippet: Type Alias',
    insertText: `export type StatusType = 'idle' | 'loading' | 'success' | 'error';`,
    documentation: 'Mendefinisikan type alias dengan union tipe literal.',
  },
  {
    label: 'try catch',
    kind: 'snippet',
    detail: 'Snippet: Blok try...catch',
    insertText: `try {\n  \n} catch (error) {\n  console.error('Terjadi kesalahan:', error);\n}`,
    documentation: 'Menangkap penanganan galat eksepsi runtime.',
    cursorOffset: 8,
  },
  {
    label: 'clg',
    kind: 'snippet',
    detail: 'Snippet: console.log()',
    insertText: `console.log();`,
    documentation: 'Mencetak output ke konsol debug.',
    cursorOffset: 12,
  },
  {
    label: 'arrow function',
    kind: 'snippet',
    detail: 'Snippet: const fn = () => {}',
    insertText: `const handleAction = () => {\n  \n};`,
    documentation: 'Fungsi panah (Arrow Function) modern ES6.',
  },
  {
    label: 'async function',
    kind: 'snippet',
    detail: 'Snippet: async function',
    insertText: `async function fetchData(): Promise<any> {\n  try {\n    \n  } catch (error) {\n    throw error;\n  }\n}`,
    documentation: 'Fungsi asynchronous dengan Promise typed.',
  },

  // Keywords
  {
    label: 'export',
    kind: 'keyword',
    detail: 'keyword (purple)',
    insertText: 'export ',
    documentation: 'Mengekspor variabel, fungsi, atau modul agar bisa diakses file lain.',
  },
  {
    label: 'import',
    kind: 'keyword',
    detail: 'keyword (purple)',
    insertText: "import {  } from '';",
    documentation: 'Mengimpor modul atau entitas dari berkas lain.',
  },
  {
    label: 'function',
    kind: 'keyword',
    detail: 'keyword (blue)',
    insertText: 'function ',
    documentation: 'Mendeklarasikan sebuah blok fungsi.',
  },
  {
    label: 'const',
    kind: 'keyword',
    detail: 'keyword (blue)',
    insertText: 'const ',
    documentation: 'Mendeklarasikan variabel konstan yang tidak dapat di-reassign.',
  },
  {
    label: 'let',
    kind: 'keyword',
    detail: 'keyword (blue)',
    insertText: 'let ',
    documentation: 'Mendeklarasikan variabel block-scoped yang dapat diubah nilainya.',
  },
  {
    label: 'return',
    kind: 'keyword',
    detail: 'keyword (purple)',
    insertText: 'return ',
    documentation: 'Mengembalikan nilai dari eksekusi fungsi.',
  },
  {
    label: 'interface',
    kind: 'keyword',
    detail: 'keyword (blue)',
    insertText: 'interface ',
    documentation: 'Mendefinisikan kontrak interface tipe objek TypeScript.',
  },
  {
    label: 'type',
    kind: 'keyword',
    detail: 'keyword (blue)',
    insertText: 'type ',
    documentation: 'Mendeklarasikan tipe alias.',
  },

  // Types
  {
    label: 'string',
    kind: 'type',
    detail: 'primitive type (cyan)',
    insertText: 'string',
    documentation: 'Tipe data teks / karakter primitif TypeScript.',
  },
  {
    label: 'number',
    kind: 'type',
    detail: 'primitive type (cyan)',
    insertText: 'number',
    documentation: 'Tipe data angka integer atau floating-point IEEE 754.',
  },
  {
    label: 'boolean',
    kind: 'type',
    detail: 'primitive type (cyan)',
    insertText: 'boolean',
    documentation: 'Tipe data logika bernilai true atau false.',
  },
  {
    label: 'Record<string, any>',
    kind: 'type',
    detail: 'utility type (cyan)',
    insertText: 'Record<string, any>',
    documentation: 'Membangun tipe objek dengan kunci bertipe string dan nilai bertipe any.',
  },
  {
    label: 'Promise<void>',
    kind: 'type',
    detail: 'type (cyan)',
    insertText: 'Promise<void>',
    documentation: 'Tipe asynchronous return objek Promise.',
  },

  // Built-in Methods & Functions
  {
    label: 'console.log',
    kind: 'function',
    detail: '(method) Console.log(...data: any[]): void',
    insertText: 'console.log()',
    documentation: 'Mencetak data log ke standar output terminal.',
    cursorOffset: 12,
  },
  {
    label: 'console.error',
    kind: 'function',
    detail: '(method) Console.error(...data: any[]): void',
    insertText: 'console.error()',
    documentation: 'Mencetak galat ke stderr.',
    cursorOffset: 14,
  },
  {
    label: 'JSON.stringify',
    kind: 'function',
    detail: '(method) JSON.stringify(value: any, replacer?, space?): string',
    insertText: 'JSON.stringify(, null, 2)',
    documentation: 'Mengonversi objek JavaScript ke representasi string JSON rapi.',
    cursorOffset: 15,
  },
  {
    label: 'JSON.parse',
    kind: 'function',
    detail: '(method) JSON.parse(text: string): any',
    insertText: 'JSON.parse()',
    documentation: 'Memparsing string JSON menjadi objek JavaScript valid.',
    cursorOffset: 11,
  },
  {
    label: 'Date.now',
    kind: 'function',
    detail: '(method) Date.now(): number',
    insertText: 'Date.now()',
    documentation: 'Mengembalikan timestamp epoch saat ini dalam milidetik.',
  },
  {
    label: 'setTimeout',
    kind: 'function',
    detail: 'setTimeout(handler: TimerHandler, timeout?: number): number',
    insertText: `setTimeout(() => {\n  \n}, 1000);`,
    documentation: 'Menjadwalkan fungsi untuk dijalankan setelah durasi milidetik.',
  },
];

const PY_COMPLETIONS: CompletionItem[] = [
  {
    label: 'def',
    kind: 'keyword',
    detail: 'def func():',
    insertText: `def nama_fungsi():\n    pass`,
    documentation: 'Mendefinisikan fungsi baru di Python.',
  },
  {
    label: 'class',
    kind: 'keyword',
    detail: 'class MyClass:',
    insertText: `class NamaKelas:\n    def __init__(self):\n        pass`,
    documentation: 'Mendefinisikan struktur kelas berorientasi objek.',
  },
  {
    label: 'print',
    kind: 'function',
    detail: 'print(*values, sep=" ", end="\\n")',
    insertText: `print()`,
    documentation: 'Mencetak output ke konsol standar.',
  },
  {
    label: 'if __name__ == "__main__"',
    kind: 'snippet',
    detail: 'Main entry point',
    insertText: `if __name__ == "__main__":\n    main()`,
    documentation: 'Menjalankan skrip saat dipanggil secara langsung.',
  },
];

/**
 * Get suggestions based on current word prefix and language
 */
export function getCompletions(
  code: string,
  cursorPosition: number,
  language: CodeLanguage
): CompletionItem[] {
  // Extract word leading up to cursor
  const textBefore = code.slice(0, cursorPosition);
  const match = textBefore.match(/([a-zA-Z0-9_$.]+)$/);
  const prefix = match ? match[1] : '';

  let list: CompletionItem[] = [];
  if (language === 'typescript' || language === 'javascript') {
    list = TS_COMPLETIONS;
  } else if (language === 'python') {
    list = PY_COMPLETIONS;
  } else {
    list = TS_COMPLETIONS.slice(0, 10);
  }

  // Scan current file for user-defined symbols (variables, functions, interfaces)
  const userSymbols: CompletionItem[] = [];
  const symbolRegex = /\b(const|let|var|function|interface|type|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let sMatch;
  const seen = new Set<string>();
  while ((sMatch = symbolRegex.exec(code)) !== null) {
    const kind = sMatch[1];
    const name = sMatch[2];
    if (!seen.has(name)) {
      seen.add(name);
      userSymbols.push({
        label: name,
        kind: kind === 'function' ? 'function' : kind === 'interface' || kind === 'type' ? 'type' : 'variable',
        detail: `(user ${kind}) ${name}`,
        insertText: name,
        documentation: `Simbol lokal dideklarasikan di berkas ini.`,
      });
    }
  }

  const allItems = [...userSymbols, ...list];

  if (!prefix) {
    return allItems.slice(0, 8);
  }

  const lowerPrefix = prefix.toLowerCase();
  return allItems
    .filter((item) => item.label.toLowerCase().includes(lowerPrefix))
    .slice(0, 10);
}

/**
 * Basic Code Formatter (indentation, bracket cleanup, semicolons)
 */
export function formatCode(code: string, language: CodeLanguage): string {
  if (language === 'json') {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return code;
    }
  }

  const lines = code.split('\n');
  let indentLevel = 0;
  const formatted: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push('');
      continue;
    }

    // Decrease indent if line starts with closing bracket
    if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push('  '.repeat(indentLevel) + trimmed);

    // Increase indent if line ends with opening bracket
    const openBraces = (trimmed.match(/[{(\[]/g) || []).length;
    const closeBraces = (trimmed.match(/[})\]]/g) || []).length;
    indentLevel = Math.max(0, indentLevel + (openBraces - closeBraces));
  }

  return formatted.join('\n');
}
