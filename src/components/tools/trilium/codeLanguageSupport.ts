/**
 * Trilium Notes - Code Snippet Language Engine & VS Code Dark Modern Definitions
 * Provides syntax tokenization, static analysis/diagnostics (with error checking for all languages),
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
      <span class="badge">Trilium</span>
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
- **Code Snippet**: Editor kode lengkap dengan syntax highlighting dan diagnostik

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

const RUST_KEYWORDS_PURPLE = new Set([
  'use',
  'return',
  'if',
  'else',
  'match',
  'for',
  'while',
  'loop',
  'in',
  'break',
  'continue',
  'yield',
  'await',
]);

const RUST_KEYWORDS_BLUE = new Set([
  'fn',
  'let',
  'mut',
  'pub',
  'struct',
  'enum',
  'trait',
  'impl',
  'type',
  'const',
  'static',
  'mod',
  'as',
  'where',
  'self',
  'Self',
  'unsafe',
  'async',
]);

const RUST_TYPES = new Set([
  'u8',
  'u16',
  'u32',
  'u64',
  'u128',
  'usize',
  'i8',
  'i16',
  'i32',
  'i64',
  'i128',
  'isize',
  'f32',
  'f64',
  'bool',
  'char',
  'str',
  'String',
  'Option',
  'Result',
  'Vec',
  'HashMap',
  'HashSet',
  'Box',
  'Arc',
  'Rc',
]);

const GO_KEYWORDS_PURPLE = new Set([
  'import',
  'package',
  'return',
  'if',
  'else',
  'switch',
  'case',
  'default',
  'for',
  'range',
  'break',
  'continue',
  'fallthrough',
  'defer',
  'go',
  'select',
]);

const GO_KEYWORDS_BLUE = new Set([
  'func',
  'var',
  'const',
  'type',
  'struct',
  'interface',
  'map',
  'chan',
]);

const GO_TYPES = new Set([
  'string',
  'int',
  'int8',
  'int16',
  'int32',
  'int64',
  'uint',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uintptr',
  'float32',
  'float64',
  'complex64',
  'complex128',
  'byte',
  'rune',
  'bool',
  'error',
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
      language === 'go' ||
      language === 'css') &&
    line.trimStart().startsWith('//')
  ) {
    return [{ text: line, type: 'comment', color: VSCODE_COLORS.comment }];
  }
  if (language === 'sql' && line.trimStart().startsWith('--')) {
    return [{ text: line, type: 'comment', color: VSCODE_COLORS.comment }];
  }
  if (language === 'html' && line.trimStart().startsWith('<!--')) {
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

    if (char === '/' && line[i + 1] === '*') {
      const endComment = line.indexOf('*/', i + 2);
      if (endComment !== -1) {
        tokens.push({
          text: line.slice(i, endComment + 2),
          type: 'comment',
          color: VSCODE_COLORS.comment,
        });
        i = endComment + 2;
        continue;
      } else {
        tokens.push({
          text: line.slice(i),
          type: 'comment',
          color: VSCODE_COLORS.comment,
        });
        break;
      }
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
      while (i < len && /[a-zA-Z0-9_$-]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Check if followed by open parenthesis -> Function invocation
      let lookahead = i;
      while (lookahead < len && line[lookahead] === ' ') {
        lookahead++;
      }
      const isCall = (lookahead < len && line[lookahead] === '(') || (language === 'rust' && line[lookahead] === '!');

      // Check if preceded by dot -> Property access
      const isProp = tokens.length > 0 && tokens[tokens.length - 1].text.trimEnd().endsWith('.');

      // TypeScript / JavaScript
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

      // Python
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

      // SQL
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

      // Rust
      if (language === 'rust') {
        if (RUST_KEYWORDS_PURPLE.has(word)) {
          tokens.push({ text: word, type: 'keyword-purple', color: VSCODE_COLORS['keyword-purple'] });
        } else if (RUST_KEYWORDS_BLUE.has(word)) {
          tokens.push({ text: word, type: 'keyword-blue', color: VSCODE_COLORS['keyword-blue'] });
        } else if (RUST_TYPES.has(word)) {
          tokens.push({ text: word, type: 'type', color: VSCODE_COLORS.type });
        } else if (isCall) {
          tokens.push({ text: word, type: 'function', color: VSCODE_COLORS.function });
        } else {
          tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
        }
        continue;
      }

      // Go
      if (language === 'go') {
        if (GO_KEYWORDS_PURPLE.has(word)) {
          tokens.push({ text: word, type: 'keyword-purple', color: VSCODE_COLORS['keyword-purple'] });
        } else if (GO_KEYWORDS_BLUE.has(word)) {
          tokens.push({ text: word, type: 'keyword-blue', color: VSCODE_COLORS['keyword-blue'] });
        } else if (GO_TYPES.has(word)) {
          tokens.push({ text: word, type: 'type', color: VSCODE_COLORS.type });
        } else if (isCall) {
          tokens.push({ text: word, type: 'function', color: VSCODE_COLORS.function });
        } else {
          tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
        }
        continue;
      }

      // CSS / HTML
      if (language === 'css') {
        if (isProp) {
          tokens.push({ text: word, type: 'property', color: VSCODE_COLORS.property });
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
// Static Diagnostics Engine (All Languages)
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
 * Perform realistic static analysis with error diagnostics across all 10 supported languages
 */
export function analyzeCode(code: string, language: CodeLanguage): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = code.split('\n');

  // 1. JSON Strict Validation
  if (language === 'json') {
    // Check for trailing commas in JSON (illegal in JSON specification)
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trailingCommaMatch = lineText.match(/,\s*([}\]])/);
      if (trailingCommaMatch) {
        const col = lineText.indexOf(',') + 1;
        diagnostics.push({
          line: lineNum,
          column: col,
          severity: 'error',
          code: 'json(trailing-comma)',
          source: 'JSON',
          message: 'Trailing comma is not allowed in JSON.',
          highlightWord: ',',
          quickFix: {
            label: 'Hapus koma berlebih (trailing comma)',
            applyFix: (src) => {
              const lns = src.split('\n');
              lns[idx] = lns[idx].replace(/,\s*([}\]])/, '$1');
              return lns.join('\n');
            },
          },
        });
      }

      // Check single quotes in JSON
      const singleQuoteMatch = lineText.match(/'([^']*)'/);
      if (singleQuoteMatch) {
        const col = lineText.indexOf("'") + 1;
        diagnostics.push({
          line: lineNum,
          column: col,
          severity: 'error',
          code: 'json(single-quote)',
          source: 'JSON',
          message: 'JSON strings must use double quotes (").',
          highlightWord: singleQuoteMatch[0],
          quickFix: {
            label: 'Ganti dengan tanda petik ganda (")',
            applyFix: (src) => {
              const lns = src.split('\n');
              lns[idx] = lns[idx].replace(/'([^']*)'/g, '"$1"');
              return lns.join('\n');
            },
          },
        });
      }
    });

    try {
      JSON.parse(code);
    } catch (err: any) {
      const msg = err.message || 'Format JSON tidak valid';
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
      if (diagnostics.length === 0) {
        diagnostics.push({
          line: lineNum,
          column: colNum,
          severity: 'error',
          code: 'json(parse)',
          source: 'JSON',
          message: msg,
        });
      }
    }
    return diagnostics;
  }

  // 2. TypeScript / JavaScript Analysis
  if (language === 'typescript' || language === 'javascript') {
    let braceBalance = 0;
    let parenBalance = 0;
    let bracketBalance = 0;
    let lastOpenBraceLine = 1;
    let lastOpenParenLine = 1;
    const constVariables = new Set<string>();

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      const constMatch = lineText.match(/\bconst\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/);
      if (constMatch) {
        constVariables.add(constMatch[1]);
      }

      // Check const reassignment
      constVariables.forEach((constName) => {
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

      // Type Mismatch Checks in TypeScript
      if (language === 'typescript') {
        const numMismatch = lineText.match(/:\s*number\s*=\s*(["'`][^"'`]*["'`])/);
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

        const strMismatch = lineText.match(/:\s*string\s*=\s*(\d+|true|false)\b/);
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

        // Common typos in TypeScript types
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

      // Console typos
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

      // Assignment in if conditional
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
        message: "Unexpected '}'. Terdapat tanda kurung tutup kurawal berlebih.",
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

  // 3. Python Analysis
  if (language === 'python') {
    let parenBalance = 0;
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      // Check missing colon on def, class, if, elif, else, for, while, try, except, finally, with
      const needsColon = /^(def\s+[a-zA-Z0-9_]+\s*\(.*?\)|class\s+[a-zA-Z0-9_]+(\(.*?\))?|if\s+.+|elif\s+.+|else|for\s+.+\s+in\s+.+|while\s+.+|try|except.*|finally|with\s+.+)$/;
      if (needsColon.test(trimmed) && !trimmed.endsWith(':')) {
        diagnostics.push({
          line: lineNum,
          column: lineText.length + 1,
          severity: 'error',
          code: 'py(syntax-colon)',
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

      // Check JS strict equality in Python (=== or !==)
      if (lineText.includes('===') || lineText.includes('!==')) {
        const typoOp = lineText.includes('===') ? '===' : '!==';
        const fixOp = typoOp === '===' ? '==' : '!=';
        const col = lineText.indexOf(typoOp) + 1;
        diagnostics.push({
          line: lineNum,
          column: col,
          severity: 'error',
          code: 'py(invalid-operator)',
          source: 'Python',
          message: `SyntaxError: '${typoOp}' is not a valid Python operator. Use '${fixOp}' for comparison.`,
          highlightWord: typoOp,
          quickFix: {
            label: `Ganti '${typoOp}' menjadi '${fixOp}'`,
            applyFix: (src) => src.replace(typoOp, fixOp),
          },
        });
      }

      // Track parenthesis balance
      for (const char of lineText) {
        if (char === '(' || char === '[' || char === '{') parenBalance++;
        if (char === ')' || char === ']' || char === '}') parenBalance--;
      }
    });

    if (parenBalance > 0) {
      diagnostics.push({
        line: lines.length,
        column: 1,
        severity: 'error',
        code: 'py(unclosed-bracket)',
        source: 'Python',
        message: 'SyntaxError: unexpected EOF while parsing (unclosed bracket or parenthesis).',
      });
    }
  }

  // 4. HTML Analysis
  if (language === 'html') {
    const openTags: { tag: string; line: number }[] = [];
    const selfClosing = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype']);

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const tagRegex = /<\/?([a-zA-Z0-9!-]+)(\s+[^>]*)?>/g;
      let match;
      while ((match = tagRegex.exec(lineText)) !== null) {
        const fullMatch = match[0];
        const tagName = match[1].toLowerCase();
        if (tagName.startsWith('!--') || selfClosing.has(tagName) || fullMatch.endsWith('/>')) {
          continue;
        }
        if (fullMatch.startsWith('</')) {
          // Closing tag
          if (openTags.length > 0 && openTags[openTags.length - 1].tag === tagName) {
            openTags.pop();
          } else {
            diagnostics.push({
              line: lineNum,
              column: match.index + 1,
              severity: 'warning',
              code: 'html(mismatched-closing)',
              source: 'HTML',
              message: `Mismatched or unexpected closing tag '</${tagName}>'.`,
              highlightWord: fullMatch,
            });
          }
        } else {
          // Opening tag
          openTags.push({ tag: tagName, line: lineNum });
        }
      }

      // Check unclosed attribute quotes
      const attrMatch = lineText.match(/<[^>]*\b[a-zA-Z-]+="[^"]*$/);
      if (attrMatch) {
        diagnostics.push({
          line: lineNum,
          column: lineText.length,
          severity: 'error',
          code: 'html(unclosed-attribute)',
          source: 'HTML',
          message: 'Unterminated attribute string quote.',
        });
      }
    });

    if (openTags.length > 0) {
      const unclosed = openTags[openTags.length - 1];
      diagnostics.push({
        line: unclosed.line,
        column: 1,
        severity: 'warning',
        code: 'html(unclosed-tag)',
        source: 'HTML',
        message: `Tag '<${unclosed.tag}>' does not appear to be closed. Missing '</${unclosed.tag}>'.`,
        quickFix: {
          label: `Tambahkan '</${unclosed.tag}>'`,
          applyFix: (src) => src + `\n</${unclosed.tag}>`,
        },
      });
    }
  }

  // 5. CSS Analysis
  if (language === 'css') {
    let braceCount = 0;
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('//') || trimmed.startsWith('@import')) return;

      for (const char of trimmed) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }

      // Check missing semicolon inside rule block
      if (
        braceCount > 0 &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(',') &&
        trimmed.includes(':')
      ) {
        diagnostics.push({
          line: lineNum,
          column: lineText.length + 1,
          severity: 'error',
          code: 'css(missing-semicolon)',
          source: 'CSS',
          message: "CSS property declaration is missing a trailing semicolon ';'.",
          quickFix: {
            label: "Tambahkan ';' di akhir deklarasi",
            applyFix: (src) => {
              const lns = src.split('\n');
              lns[idx] = lns[idx] + ';';
              return lns.join('\n');
            },
          },
        });
      }

      // Common typo in CSS properties
      const cssTypoMap: Record<string, string> = {
        colr: 'color',
        pading: 'padding',
        margn: 'margin',
        backgroud: 'background',
        heigth: 'height',
        widht: 'width',
        fontwieght: 'font-weight',
      };
      for (const [typo, correct] of Object.entries(cssTypoMap)) {
        if (trimmed.startsWith(`${typo}:`)) {
          diagnostics.push({
            line: lineNum,
            column: lineText.indexOf(typo) + 1,
            severity: 'error',
            code: 'css(unknown-property)',
            source: 'CSS',
            message: `Unknown property '${typo}'. Did you mean '${correct}'?`,
            highlightWord: typo,
            quickFix: {
              label: `Ganti '${typo}' menjadi '${correct}'`,
              applyFix: (src) => src.replace(new RegExp(`\\b${typo}:`), `${correct}:`),
            },
          });
        }
      }
    });

    if (braceCount !== 0) {
      diagnostics.push({
        line: lines.length,
        column: 1,
        severity: 'error',
        code: 'css(unbalanced-braces)',
        source: 'CSS',
        message: braceCount > 0 ? "Unclosed '{' curly brace in CSS." : "Unexpected extra '}' curly brace in CSS.",
      });
    }
  }

  // 6. SQL Analysis
  if (language === 'sql') {
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const upper = lineText.toUpperCase();

      // Check trailing comma before FROM: e.g. "SELECT id, name, FROM table"
      if (/,\s*FROM\b/i.test(lineText)) {
        const col = lineText.indexOf(',') + 1;
        diagnostics.push({
          line: lineNum,
          column: col,
          severity: 'error',
          code: 'sql(syntax-trailing-comma)',
          source: 'SQL',
          message: "Syntax error: trailing comma before 'FROM' clause.",
          highlightWord: ',',
          quickFix: {
            label: "Hapus koma sebelum 'FROM'",
            applyFix: (src) => src.replace(/,\s*(FROM\b)/i, ' $1'),
          },
        });
      }

      // SELECT with column missing FROM
      if (upper.trim().startsWith('SELECT') && !upper.includes('FROM') && upper.length > 30) {
        diagnostics.push({
          line: lineNum,
          column: 1,
          severity: 'info',
          code: 'sql(missing-from)',
          source: 'SQL',
          message: "Periksa klausa 'FROM' untuk tabel yang ditargetkan pada kueri SELECT ini.",
        });
      }
    });
  }

  // 7. Rust Analysis
  if (language === 'rust') {
    let braceCount = 0;
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      for (const char of trimmed) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }

      // Check macro missing ! (e.g. println("...") instead of println!("..."))
      const macroMissingBang = trimmed.match(/\b(println|print|eprintln|eprint|vec|format)\s*\(/);
      if (macroMissingBang) {
        const mName = macroMissingBang[1];
        const col = lineText.indexOf(mName) + 1;
        diagnostics.push({
          line: lineNum,
          column: col,
          severity: 'error',
          code: 'rs(missing-macro-bang)',
          source: 'Rust',
          message: `Macro '${mName}' must be invoked with an exclamation mark: '${mName}!(...)'.`,
          highlightWord: mName,
          quickFix: {
            label: `Ganti dengan '${mName}!'`,
            applyFix: (src) => src.replace(new RegExp(`\\b${mName}\\s*\\(`), `${mName}!(`),
          },
        });
      }

      // Check missing semicolon on let statements
      if (trimmed.startsWith('let ') && !trimmed.endsWith(';') && !trimmed.endsWith('{')) {
        diagnostics.push({
          line: lineNum,
          column: lineText.length + 1,
          severity: 'error',
          code: 'rs(missing-semicolon)',
          source: 'Rust',
          message: "Statement 'let' requires a closing semicolon ';'.",
          quickFix: {
            label: "Tambahkan ';' di akhir",
            applyFix: (src) => {
              const lns = src.split('\n');
              lns[idx] = lns[idx] + ';';
              return lns.join('\n');
            },
          },
        });
      }
    });

    if (braceCount !== 0) {
      diagnostics.push({
        line: lines.length,
        column: 1,
        severity: 'error',
        code: 'rs(unbalanced-braces)',
        source: 'Rust',
        message: braceCount > 0 ? "Unclosed '{' in Rust block." : "Unexpected extra '}' in Rust block.",
      });
    }
  }

  // 8. Go Analysis
  if (language === 'go') {
    let braceCount = 0;
    const hasPackage = lines.some((l) => l.trim().startsWith('package '));
    if (!hasPackage && code.trim().length > 10) {
      diagnostics.push({
        line: 1,
        column: 1,
        severity: 'error',
        code: 'go(missing-package)',
        source: 'Go',
        message: "Expected 'package' clause at top of file (e.g. 'package main').",
        quickFix: {
          label: "Tambahkan 'package main'",
          applyFix: (src) => 'package main\n\n' + src,
        },
      });
    }

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      for (const char of trimmed) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }

      // Check JS operator === in Go
      if (lineText.includes('===')) {
        const col = lineText.indexOf('===') + 1;
        diagnostics.push({
          line: lineNum,
          column: col,
          severity: 'error',
          code: 'go(invalid-operator)',
          source: 'Go',
          message: "Operator '===' does not exist in Go. Use '==' for equality comparison.",
          highlightWord: '===',
          quickFix: {
            label: "Ganti '===' dengan '=='",
            applyFix: (src) => src.replace('===', '=='),
          },
        });
      }
    });

    if (braceCount !== 0) {
      diagnostics.push({
        line: lines.length,
        column: 1,
        severity: 'error',
        code: 'go(unbalanced-braces)',
        source: 'Go',
        message: braceCount > 0 ? "Unclosed '{' in Go function/block." : "Unexpected extra '}' in Go.",
      });
    }
  }

  // 9. Markdown Analysis
  if (language === 'markdown') {
    let fenceCount = 0;
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      if (lineText.trim().startsWith('```')) {
        fenceCount++;
      }
      // Check broken link syntax: [text]( without closing )
      if (/\[[^\]]+\]\([^\)]*$/.test(lineText.trim())) {
        diagnostics.push({
          line: lineNum,
          column: lineText.length,
          severity: 'warning',
          code: 'md(broken-link)',
          source: 'Markdown',
          message: "Unclosed markdown link. Missing closing ')' parenthesis.",
        });
      }
    });

    if (fenceCount % 2 !== 0) {
      diagnostics.push({
        line: lines.length,
        column: 1,
        severity: 'warning',
        code: 'md(unclosed-code-fence)',
        source: 'Markdown',
        message: "Unclosed code fence block. Missing closing '```'.",
        quickFix: {
          label: "Tutup blok kode dengan '```'",
          applyFix: (src) => src + '\n```',
        },
      });
    }
  }

  return diagnostics;
}

// ==========================================
// IntelliSense Autocomplete Engine (All Languages)
// ==========================================
export interface CompletionItem {
  label: string;
  kind: 'snippet' | 'keyword' | 'function' | 'type' | 'variable' | 'property';
  detail: string;
  insertText: string;
  documentation: string;
  cursorOffset?: number;
}

export const TS_COMPLETIONS: CompletionItem[] = [
  {
    label: 'export function',
    kind: 'snippet',
    detail: 'Snippet: Fungsi ekspor',
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
  {
    label: 'map',
    kind: 'function',
    detail: '(method) Array.map<U>(callbackfn): U[]',
    insertText: 'map((item) => item)',
    documentation: 'Mentransformasi setiap elemen array ke dalam array baru.',
  },
  {
    label: 'filter',
    kind: 'function',
    detail: '(method) Array.filter(predicate): T[]',
    insertText: 'filter((item) => Boolean(item))',
    documentation: 'Menyaring elemen array yang memenuhi syarat pengujian fungsi.',
  },
  {
    label: 'reduce',
    kind: 'function',
    detail: '(method) Array.reduce<U>(callbackfn, initialValue): U',
    insertText: 'reduce((acc, curr) => acc + curr, 0)',
    documentation: 'Mengakumulasi semua elemen array menjadi satu nilai keluaran.',
  },
  {
    label: 'Object.keys',
    kind: 'function',
    detail: '(method) Object.keys(obj: object): string[]',
    insertText: 'Object.keys()',
    documentation: 'Mengembalikan array berisi semua kunci properti objek.',
  },
  {
    label: 'Object.values',
    kind: 'function',
    detail: '(method) Object.values(obj: object): any[]',
    insertText: 'Object.values()',
    documentation: 'Mengembalikan array berisi semua nilai properti objek.',
  },
  {
    label: 'Promise.all',
    kind: 'function',
    detail: '(method) Promise.all(iterable): Promise<any[]>',
    insertText: 'Promise.all([])',
    documentation: 'Menjalankan serangkaian promise secara paralel.',
  },
  {
    label: 'fetch',
    kind: 'function',
    detail: '(method) fetch(input: RequestInfo, init?: RequestInit): Promise<Response>',
    insertText: "fetch('https://api.example.com/data')",
    documentation: 'Mengirim HTTP request asinkronus ke server web.',
  },
  {
    label: 'useState',
    kind: 'function',
    detail: 'React Hook: const [state, setState] = useState(initial)',
    insertText: 'const [value, setValue] = useState(null);',
    documentation: 'Menyimpan state lokal di dalam komponen fungsi React.',
  },
  {
    label: 'useEffect',
    kind: 'function',
    detail: 'React Hook: useEffect(effect, deps)',
    insertText: `useEffect(() => {\n  \n  return () => {};\n}, []);`,
    documentation: 'Menjalankan efek samping sinkronisasi dalam komponen React.',
  },
  {
    label: 'export',
    kind: 'keyword',
    detail: 'keyword',
    insertText: 'export ',
    documentation: 'Mengekspor variabel, fungsi, atau modul.',
  },
  {
    label: 'import',
    kind: 'keyword',
    detail: 'keyword',
    insertText: "import {  } from '';",
    documentation: 'Mengimpor modul atau entitas dari berkas lain.',
  },
  {
    label: 'const',
    kind: 'keyword',
    detail: 'keyword',
    insertText: 'const ',
    documentation: 'Mendeklarasikan variabel konstan.',
  },
  {
    label: 'let',
    kind: 'keyword',
    detail: 'keyword',
    insertText: 'let ',
    documentation: 'Mendeklarasikan variabel yang dapat diubah nilainya.',
  },
  {
    label: 'string',
    kind: 'type',
    detail: 'primitive type',
    insertText: 'string',
    documentation: 'Tipe data teks / karakter primitif TypeScript.',
  },
  {
    label: 'number',
    kind: 'type',
    detail: 'primitive type',
    insertText: 'number',
    documentation: 'Tipe data angka integer atau floating-point.',
  },
  {
    label: 'boolean',
    kind: 'type',
    detail: 'primitive type',
    insertText: 'boolean',
    documentation: 'Tipe data logika bernilai true atau false.',
  },
  {
    label: 'Record<string, any>',
    kind: 'type',
    detail: 'utility type',
    insertText: 'Record<string, any>',
    documentation: 'Membangun tipe objek dengan kunci bertipe string.',
  },
  {
    label: 'console.log',
    kind: 'function',
    detail: '(method) Console.log(...data: any[]): void',
    insertText: 'console.log()',
    documentation: 'Mencetak data log ke standar output terminal.',
    cursorOffset: 12,
  },
  {
    label: 'JSON.stringify',
    kind: 'function',
    detail: '(method) JSON.stringify(value: any, replacer?, space?): string',
    insertText: 'JSON.stringify(, null, 2)',
    documentation: 'Mengonversi objek ke representasi string JSON rapi.',
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
];

export const PY_COMPLETIONS: CompletionItem[] = [
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
    label: 'len',
    kind: 'function',
    detail: 'len(obj: Sized) -> int',
    insertText: 'len()',
    documentation: 'Mengembalikan panjang atau jumlah elemen dari koleksi.',
  },
  {
    label: 'range',
    kind: 'function',
    detail: 'range(stop) or range(start, stop, step)',
    insertText: 'range(10)',
    documentation: 'Menghasilkan deret angka berurutan.',
  },
  {
    label: 'enumerate',
    kind: 'function',
    detail: 'enumerate(iterable, start=0)',
    insertText: 'enumerate()',
    documentation: 'Mengembalikan pasangan indeks dan elemen dari iterable.',
  },
  {
    label: 'if __name__ == "__main__"',
    kind: 'snippet',
    detail: 'Main entry point',
    insertText: `if __name__ == "__main__":\n    main()`,
    documentation: 'Menjalankan skrip saat dipanggil secara langsung.',
  },
  {
    label: 'list comprehension',
    kind: 'snippet',
    detail: '[expr for item in iterable]',
    insertText: `[x for x in data if x is not None]`,
    documentation: 'Membuat list baru dengan ekspresi ringkas satu baris.',
  },
  {
    label: 'try except',
    kind: 'snippet',
    detail: 'Penanganan galat',
    insertText: `try:\n    pass\nexcept Exception as e:\n    print(f"Error: {e}")`,
    documentation: 'Menangkap eksepsi kesalahan saat runtime.',
  },
  {
    label: 'import',
    kind: 'keyword',
    detail: 'import module',
    insertText: 'import ',
    documentation: 'Mengimpor modul Python.',
  },
  {
    label: 'from ... import',
    kind: 'keyword',
    detail: 'from module import name',
    insertText: 'from  import ',
    documentation: 'Mengimpor fungsi atau kelas spesifik dari modul.',
  },
];

export const HTML_COMPLETIONS: CompletionItem[] = [
  {
    label: '!DOCTYPE html',
    kind: 'snippet',
    detail: 'HTML5 Boilerplate Template',
    insertText: `<!DOCTYPE html>\n<html lang="id">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>`,
    documentation: 'Template dasar dokumen standar HTML5.',
  },
  {
    label: 'div',
    kind: 'snippet',
    detail: '<div>...</div>',
    insertText: `<div class="">\n  \n</div>`,
    documentation: 'Elemen kontainer generik pembagi layout.',
  },
  {
    label: 'section',
    kind: 'snippet',
    detail: '<section>...</section>',
    insertText: `<section class="">\n  \n</section>`,
    documentation: 'Bagian tematik mandiri dari sebuah dokumen.',
  },
  {
    label: 'button',
    kind: 'snippet',
    detail: '<button type="button">...</button>',
    insertText: `<button type="button" class="btn">\n  Klik Saya\n</button>`,
    documentation: 'Tombol interaktif pengguna.',
  },
  {
    label: 'input',
    kind: 'snippet',
    detail: '<input type="text" ... />',
    insertText: `<input type="text" placeholder="Masukkan teks..." class="input" />`,
    documentation: 'Field input teks untuk form.',
  },
  {
    label: 'table',
    kind: 'snippet',
    detail: '<table> thead & tbody',
    insertText: `<table>\n  <thead>\n    <tr>\n      <th>Nama</th>\n      <th>Peran</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Irvan</td>\n      <td>Developer</td>\n    </tr>\n  </tbody>\n</table>`,
    documentation: 'Tabel data tabular terstruktur.',
  },
  {
    label: 'a (link)',
    kind: 'snippet',
    detail: '<a href="...">...</a>',
    insertText: `<a href="#" target="_blank" rel="noopener noreferrer">Tautan</a>`,
    documentation: 'Hyperlink navigasi ke halaman web lain.',
  },
  {
    label: 'img',
    kind: 'snippet',
    detail: '<img src="..." alt="..." />',
    insertText: `<img src="gambar.jpg" alt="Deskripsi gambar" loading="lazy" />`,
    documentation: 'Menyisipkan media gambar.',
  },
  {
    label: 'class',
    kind: 'property',
    detail: 'class="..."',
    insertText: 'class=""',
    documentation: 'Menentukan satu atau lebih nama kelas CSS.',
  },
  {
    label: 'id',
    kind: 'property',
    detail: 'id="..."',
    insertText: 'id=""',
    documentation: 'Identifier unik elemen HTML di dalam dokumen.',
  },
];

export const CSS_COMPLETIONS: CompletionItem[] = [
  {
    label: 'display: flex',
    kind: 'snippet',
    detail: 'Flexbox Layout Container',
    insertText: `display: flex;\nalign-items: center;\njustify-content: center;\ngap: 1rem;`,
    documentation: 'Mengaktifkan kontainer flexbox dengan centering vertikal dan horizontal.',
  },
  {
    label: 'display: grid',
    kind: 'snippet',
    detail: 'CSS Grid Layout',
    insertText: `display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\ngap: 1.5rem;`,
    documentation: 'Layout grid responsif dengan repeat auto-fit.',
  },
  {
    label: 'display',
    kind: 'property',
    detail: 'display: flex | grid | block | none',
    insertText: 'display: ;',
    documentation: 'Menentukan tipe rendering kotak elemen.',
  },
  {
    label: 'background-color',
    kind: 'property',
    detail: 'background-color: #color',
    insertText: 'background-color: ;',
    documentation: 'Mengatur warna latar belakang elemen.',
  },
  {
    label: 'color',
    kind: 'property',
    detail: 'color: #color',
    insertText: 'color: ;',
    documentation: 'Mengatur warna teks tipografi elemen.',
  },
  {
    label: 'padding',
    kind: 'property',
    detail: 'padding: 1rem',
    insertText: 'padding: ;',
    documentation: 'Ruang bantalan bagian dalam elemen.',
  },
  {
    label: 'margin',
    kind: 'property',
    detail: 'margin: 0 auto',
    insertText: 'margin: ;',
    documentation: 'Ruang jarak luar di sekitar elemen.',
  },
  {
    label: 'border-radius',
    kind: 'property',
    detail: 'border-radius: 0.5rem',
    insertText: 'border-radius: ;',
    documentation: 'Membuat sudut membulat pada border elemen.',
  },
  {
    label: 'box-shadow',
    kind: 'property',
    detail: 'box-shadow: 0 4px 6px -1px rgba(...)',
    insertText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);',
    documentation: 'Menambahkan efek bayangan pada kotak elemen.',
  },
  {
    label: 'transition',
    kind: 'property',
    detail: 'transition: all 0.2s ease',
    insertText: 'transition: all 0.2s ease-in-out;',
    documentation: 'Menganimasikan perubahan properti CSS dengan halus.',
  },
  {
    label: '@media (max-width)',
    kind: 'snippet',
    detail: 'Media Query Responsif',
    insertText: `@media (max-width: 768px) {\n  \n}`,
    documentation: 'Menerapkan gaya CSS khusus untuk layar perangkat mobile / tablet.',
  },
];

export const SQL_COMPLETIONS: CompletionItem[] = [
  {
    label: 'SELECT * FROM',
    kind: 'snippet',
    detail: 'Kueri SELECT Dasar',
    insertText: `SELECT * FROM nama_tabel\nWHERE aktif = TRUE\nORDER BY id DESC\nLIMIT 20;`,
    documentation: 'Mengambil baris data dari tabel basis data.',
  },
  {
    label: 'INNER JOIN',
    kind: 'snippet',
    detail: 'INNER JOIN tabel ON ...',
    insertText: `INNER JOIN tabel_b ON tabel_b.id = tabel_a.b_id`,
    documentation: 'Menggabungkan baris dari dua tabel yang memiliki nilai kunci cocok.',
  },
  {
    label: 'LEFT JOIN',
    kind: 'snippet',
    detail: 'LEFT JOIN tabel ON ...',
    insertText: `LEFT JOIN tabel_b ON tabel_b.id = tabel_a.b_id`,
    documentation: 'Mengambil semua baris tabel kiri beserta baris cocok dari tabel kanan.',
  },
  {
    label: 'COUNT(*)',
    kind: 'function',
    detail: 'COUNT(col) AS total',
    insertText: 'COUNT(*) AS total',
    documentation: 'Fungsi agregat menghitung jumlah baris data.',
  },
  {
    label: 'INSERT INTO',
    kind: 'snippet',
    detail: 'INSERT INTO tabel (cols) VALUES (...)',
    insertText: `INSERT INTO nama_tabel (nama, email, dibuat_pada)\nVALUES ('Irvan', 'irvan@example.com', NOW());`,
    documentation: 'Menyisipkan baris rekaman baru ke tabel.',
  },
  {
    label: 'UPDATE ... SET',
    kind: 'snippet',
    detail: 'UPDATE tabel SET col = val WHERE ...',
    insertText: `UPDATE nama_tabel\nSET status = 'aktif', diperbarui_pada = NOW()\nWHERE id = 1;`,
    documentation: 'Memperbarui data baris yang sudah ada.',
  },
  {
    label: 'CREATE TABLE',
    kind: 'snippet',
    detail: 'CREATE TABLE dengan primary key',
    insertText: `CREATE TABLE IF NOT EXISTS pengguna (\n  id BIGSERIAL PRIMARY KEY,\n  nama VARCHAR(150) NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);`,
    documentation: 'Membuat skema tabel relasional baru.',
  },
  {
    label: 'GROUP BY',
    kind: 'keyword',
    detail: 'GROUP BY kolom',
    insertText: 'GROUP BY ',
    documentation: 'Mengelompokkan baris hasil menurut nilai kolom yang sama.',
  },
];

export const RUST_COMPLETIONS: CompletionItem[] = [
  {
    label: 'fn main',
    kind: 'snippet',
    detail: 'Entry point fungsi main',
    insertText: `fn main() {\n    println!("Halo dari Rust!");\n}`,
    documentation: 'Fungsi titik masuk utama program biner Rust.',
  },
  {
    label: 'println!',
    kind: 'function',
    detail: 'println!("format {}", val)',
    insertText: 'println!("{}", );',
    documentation: 'Mencetak output teks berformat ke stdout.',
    cursorOffset: 15,
  },
  {
    label: 'struct',
    kind: 'snippet',
    detail: '#[derive(Debug)] struct Name',
    insertText: `#[derive(Debug, Clone)]\npub struct ItemBaru {\n    pub id: u64,\n    pub nama: String,\n}`,
    documentation: 'Mendefinisikan struktur data komposit kustom.',
  },
  {
    label: 'impl',
    kind: 'snippet',
    detail: 'impl StructName { pub fn new() }',
    insertText: `impl ItemBaru {\n    pub fn new(id: u64, nama: &str) -> Self {\n        Self {\n            id,\n            nama: nama.to_string(),\n        }\n    }\n}`,
    documentation: 'Mengimplementasikan metode dan fungsi terasosiasi untuk struct.',
  },
  {
    label: 'match',
    kind: 'snippet',
    detail: 'Pattern matching ekspresi',
    insertText: `match hasil {\n    Ok(nilai) => println!("Berhasil: {:?}", nilai),\n    Err(err) => eprintln!("Galat: {}", err),\n}`,
    documentation: 'Mencocokkan pola varian data secara menyeluruh dan aman.',
  },
  {
    label: 'Option<T>',
    kind: 'type',
    detail: 'Some(val) | None',
    insertText: 'Option<String>',
    documentation: 'Tipe nilai opsional di Rust yang aman dari null pointer exception.',
  },
  {
    label: 'Result<T, E>',
    kind: 'type',
    detail: 'Ok(val) | Err(err)',
    insertText: 'Result<(), Box<dyn std::error::Error>>',
    documentation: 'Tipe representasi penanganan hasil atau galat.',
  },
];

export const GO_COMPLETIONS: CompletionItem[] = [
  {
    label: 'main',
    kind: 'snippet',
    detail: 'package main & func main()',
    insertText: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Halo dari Go!")\n}`,
    documentation: 'Paket dan fungsi utama untuk menjalankan executable Go.',
  },
  {
    label: 'fmt.Println',
    kind: 'function',
    detail: 'fmt.Println(...a any) (n int, err error)',
    insertText: 'fmt.Println()',
    documentation: 'Mencetak format ke konsol terminal standar.',
    cursorOffset: 12,
  },
  {
    label: 'if err != nil',
    kind: 'snippet',
    detail: 'Go Error Handling Idiom',
    insertText: `if err != nil {\n\treturn fmt.Errorf("operasi gagal: %w", err)\n}`,
    documentation: 'Penanganan galat idiomatik standar dalam bahasa pemrograman Go.',
  },
  {
    label: 'struct',
    kind: 'snippet',
    detail: 'type Name struct',
    insertText: `type Pengguna struct {\n\tID   int64  \`json:"id"\`\n\tNama string \`json:"nama"\`\n}`,
    documentation: 'Mendefinisikan tipe struct objek dengan tag JSON serialisasi.',
  },
  {
    label: 'http.HandleFunc',
    kind: 'snippet',
    detail: 'HTTP Handler Endpoint',
    insertText: `http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tw.Write([]byte(\`{"status":"ok"}\`))\n})`,
    documentation: 'Mendaftarkan endpoint router server HTTP REST API.',
  },
  {
    label: 'goroutine',
    kind: 'snippet',
    detail: 'go func() concurrency',
    insertText: `go func() {\n\t// Eksekusi thread ringan konkurensi\n}()`,
    documentation: 'Menjalankan fungsi asinkron secara konkuren menggunakan Goroutine.',
  },
];

export const MARKDOWN_COMPLETIONS: CompletionItem[] = [
  {
    label: '# Heading 1',
    kind: 'snippet',
    detail: '# Judul Utama',
    insertText: '# ',
    documentation: 'Judul tingkat pertama Markdown.',
  },
  {
    label: '## Heading 2',
    kind: 'snippet',
    detail: '## Subjudul Seksi',
    insertText: '## ',
    documentation: 'Subjudul bagian kedua Markdown.',
  },
  {
    label: '### Heading 3',
    kind: 'snippet',
    detail: '### Poin Subseksi',
    insertText: '### ',
    documentation: 'Subjudul bagian ketiga Markdown.',
  },
  {
    label: 'code block',
    kind: 'snippet',
    detail: '```typescript...```',
    insertText: "```typescript\n// Kode di sini\n```",
    documentation: 'Blok kode dengan syntax highlighting terformat.',
  },
  {
    label: 'table',
    kind: 'snippet',
    detail: 'Tabel Markdown GFM',
    insertText: "| Kolom 1 | Kolom 2 | Status |\n| :--- | :--- | :---: |\n| Data A | Keterangan | Aktif |\n| Data B | Keterangan | Selesai |",
    documentation: 'Tabel rapi Markdown standar GitHub Flavored Markdown.',
  },
  {
    label: 'task list',
    kind: 'snippet',
    detail: '- [ ] Checklist Tugas',
    insertText: "- [ ] Tugas 1\n- [x] Tugas selesai\n- [ ] Tugas berikutnya",
    documentation: 'Daftar periksa checklist interaktif.',
  },
];

export const JSON_COMPLETIONS: CompletionItem[] = [
  {
    label: 'object',
    kind: 'snippet',
    detail: '{ "key": "value" }',
    insertText: `{\n  "id": 1,\n  "name": "sample",\n  "active": true\n}`,
    documentation: 'Objek JSON terstruktur.',
  },
  {
    label: 'package.json template',
    kind: 'snippet',
    detail: 'Konfigurasi node package',
    insertText: `{\n  "name": "proyek-saya",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}`,
    documentation: 'Template berkas package.json standar Node.js.',
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
  const textBefore = code.slice(0, cursorPosition);
  const match = textBefore.match(/([a-zA-Z0-9_$.:-]+)$/);
  const prefix = match ? match[1] : '';

  let list: CompletionItem[] = [];
  switch (language) {
    case 'typescript':
    case 'javascript':
      list = TS_COMPLETIONS;
      break;
    case 'python':
      list = PY_COMPLETIONS;
      break;
    case 'html':
      list = HTML_COMPLETIONS;
      break;
    case 'css':
      list = CSS_COMPLETIONS;
      break;
    case 'sql':
      list = SQL_COMPLETIONS;
      break;
    case 'rust':
      list = RUST_COMPLETIONS;
      break;
    case 'go':
      list = GO_COMPLETIONS;
      break;
    case 'markdown':
      list = MARKDOWN_COMPLETIONS;
      break;
    case 'json':
      list = JSON_COMPLETIONS;
      break;
    default:
      list = TS_COMPLETIONS;
  }

  // Scan current file for user-defined symbols (variables, functions, interfaces, structs, tags)
  const userSymbols: CompletionItem[] = [];
  const symbolRegex = /\b(const|let|var|function|interface|type|class|def|fn|func|struct)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let sMatch;
  const seen = new Set<string>();
  while ((sMatch = symbolRegex.exec(code)) !== null) {
    const kind = sMatch[1];
    const name = sMatch[2];
    if (!seen.has(name)) {
      seen.add(name);
      userSymbols.push({
        label: name,
        kind:
          kind === 'function' || kind === 'def' || kind === 'fn' || kind === 'func'
            ? 'function'
            : kind === 'interface' || kind === 'type' || kind === 'struct'
            ? 'type'
            : 'variable',
        detail: `(${kind}) ${name}`,
        insertText: name,
        documentation: `Simbol lokal dideklarasikan di berkas ini.`,
      });
    }
  }

  const allItems = [...userSymbols, ...list];

  if (!prefix) {
    return allItems.slice(0, 10);
  }

  const lowerPrefix = prefix.toLowerCase();
  return allItems
    .filter((item) => item.label.toLowerCase().includes(lowerPrefix))
    .slice(0, 12);
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

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push('');
      continue;
    }

    if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formatted.push('  '.repeat(indentLevel) + trimmed);

    const openBraces = (trimmed.match(/[{(\[]/g) || []).length;
    const closeBraces = (trimmed.match(/[})\]]/g) || []).length;
    indentLevel = Math.max(0, indentLevel + (openBraces - closeBraces));
  }

  return formatted.join('\n');
}
