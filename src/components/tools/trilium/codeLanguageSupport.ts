/**
 * Trilium Notes - Code Snippet Language Engine & VS Code Dark Modern Definitions
 * Provides syntax tokenization, static analysis/diagnostics (with error checking for all 10 languages),
 * IntelliSense autocompletions for all languages, and code formatting.
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
</head>
<body class="bg-dark">
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
  font-family: 'JetBrains Mono', monospace;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
  | 'keyword-purple'
  | 'keyword-blue'
  | 'type'
  | 'function'
  | 'string'
  | 'number'
  | 'boolean'
  | 'comment'
  | 'variable'
  | 'property'
  | 'tag'
  | 'attribute'
  | 'bracket-1'
  | 'bracket-2'
  | 'bracket-3'
  | 'operator'
  | 'default';

export interface CodeToken {
  text: string;
  type: TokenType;
  color: string;
  isError?: boolean;
  errorMessage?: string;
}

export const VSCODE_COLORS: Record<TokenType, string> = {
  'keyword-purple': '#c586c0',
  'keyword-blue': '#569cd6',
  type: '#4ec9b0',
  function: '#dcdcaa',
  string: '#ce9178',
  number: '#b5cea8',
  boolean: '#569cd6',
  comment: '#6a9955',
  variable: '#9cdcfe',
  property: '#9cdcfe',
  tag: '#569cd6',
  attribute: '#9cdcfe',
  'bracket-1': '#ffd700',
  'bracket-2': '#da70d6',
  'bracket-3': '#179fff',
  operator: '#d4d4d4',
  default: '#d4d4d4',
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

    // Strings
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

      let lookahead = i;
      while (lookahead < len && line[lookahead] === ' ') {
        lookahead++;
      }
      const isCall = (lookahead < len && line[lookahead] === '(') || (language === 'rust' && line[lookahead] === '!');
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

      // CSS
      if (language === 'css') {
        if (isProp) {
          tokens.push({ text: word, type: 'property', color: VSCODE_COLORS.property });
        } else {
          tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
        }
        continue;
      }

      if (isCall) {
        tokens.push({ text: word, type: 'function', color: VSCODE_COLORS.function });
      } else {
        tokens.push({ text: word, type: 'variable', color: VSCODE_COLORS.variable });
      }
      continue;
    }

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

export function analyzeCode(code: string, language: CodeLanguage): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = code.split('\n');

  // 1. JSON Strict Validation
  if (language === 'json') {
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
          message: `SyntaxError: '${typoOp}' is not a valid Python operator. Use '${fixOp}'.`,
          highlightWord: typoOp,
          quickFix: {
            label: `Ganti '${typoOp}' menjadi '${fixOp}'`,
            applyFix: (src) => src.replace(typoOp, fixOp),
          },
        });
      }

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
          if (openTags.length > 0 && openTags[openTags.length - 1].tag === tagName) {
            openTags.pop();
          } else {
            diagnostics.push({
              line: lineNum,
              column: match.index + 1,
              severity: 'warning',
              code: 'html(mismatched-closing)',
              source: 'HTML',
              message: `Mismatched closing tag '</${tagName}>'.`,
              highlightWord: fullMatch,
            });
          }
        } else {
          openTags.push({ tag: tagName, line: lineNum });
        }
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
        code: 'css(unbalanced-braces)',
        source: 'CSS',
        message: braceCount > 0 ? "Unclosed '{' curly brace in CSS." : "Unexpected extra '}' in CSS.",
      });
    }
  }

  // 6. SQL Analysis
  if (language === 'sql') {
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
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
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const trimmed = lineText.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      for (const char of trimmed) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }

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
    lines.forEach((lineText) => {
      if (lineText.trim().startsWith('```')) fenceCount++;
    });

    if (fenceCount % 2 !== 0) {
      diagnostics.push({
        line: lines.length,
        column: 1,
        severity: 'warning',
        code: 'md(unclosed-code-fence)',
        source: 'Markdown',
        message: "Unclosed code fence block. Missing closing '```'.",
      });
    }
  }

  return diagnostics;
}

// ==========================================
// Autocomplete Suggestions for ALL Languages
// ==========================================
export interface CompletionItem {
  label: string;
  kind: 'snippet' | 'keyword' | 'function' | 'type' | 'variable' | 'property';
  detail: string;
  insertText: string;
  documentation: string;
  cursorOffset?: number;
}

const TS_COMPLETIONS: CompletionItem[] = [
  {
    label: 'export function',
    kind: 'snippet',
    detail: 'Snippet: Export Function',
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
    detail: 'Array.prototype.map()',
    insertText: `map((item) => item)`,
    documentation: 'Membuat array baru dengan hasil pemanggilan fungsi pada setiap elemen.',
  },
  {
    label: 'filter',
    kind: 'function',
    detail: 'Array.prototype.filter()',
    insertText: `filter((item) => Boolean(item))`,
    documentation: 'Menyaring elemen array yang memenuhi kondisi boolean.',
  },
  {
    label: 'reduce',
    kind: 'function',
    detail: 'Array.prototype.reduce()',
    insertText: `reduce((acc, curr) => acc + curr, 0)`,
    documentation: 'Mereduksi array menjadi satu nilai akumulasi.',
  },
  {
    label: 'useState',
    kind: 'snippet',
    detail: 'React useState Hook',
    insertText: `const [state, setState] = useState(initialValue);`,
    documentation: 'Hook status reaktif lokal React.',
  },
  {
    label: 'useEffect',
    kind: 'snippet',
    detail: 'React useEffect Hook',
    insertText: `useEffect(() => {\n  \n  return () => {};\n}, []);`,
    documentation: 'Hook efek samping siklus hidup React.',
  },
  {
    label: 'export',
    kind: 'keyword',
    detail: 'keyword (purple)',
    insertText: 'export ',
    documentation: 'Mengekspor variabel atau fungsi ke modul lain.',
  },
  {
    label: 'import',
    kind: 'keyword',
    detail: 'keyword (purple)',
    insertText: "import {  } from '';",
    documentation: 'Mengimpor entitas dari berkas lain.',
  },
  {
    label: 'const',
    kind: 'keyword',
    detail: 'keyword (blue)',
    insertText: 'const ',
    documentation: 'Mendeklarasikan variabel konstan.',
  },
  {
    label: 'let',
    kind: 'keyword',
    detail: 'keyword (blue)',
    insertText: 'let ',
    documentation: 'Mendeklarasikan variabel mutable.',
  },
  {
    label: 'string',
    kind: 'type',
    detail: 'primitive type (cyan)',
    insertText: 'string',
    documentation: 'Tipe data teks TypeScript.',
  },
  {
    label: 'number',
    kind: 'type',
    detail: 'primitive type (cyan)',
    insertText: 'number',
    documentation: 'Tipe data numerik integer/float.',
  },
  {
    label: 'boolean',
    kind: 'type',
    detail: 'primitive type (cyan)',
    insertText: 'boolean',
    documentation: 'Tipe data boolean true/false.',
  },
  {
    label: 'Record',
    kind: 'type',
    detail: 'Record<K, T>',
    insertText: 'Record<string, any>',
    documentation: 'Tipe objek asosiatif fleksibel.',
  },
  {
    label: 'Promise',
    kind: 'type',
    detail: 'Promise<T>',
    insertText: 'Promise<void>',
    documentation: 'Tipe data operasi asinkron.',
  },
  {
    label: 'console.log',
    kind: 'function',
    detail: 'Console.log(...data)',
    insertText: 'console.log()',
    documentation: 'Mencetak data log ke terminal.',
    cursorOffset: 12,
  },
  {
    label: 'JSON.stringify',
    kind: 'function',
    detail: 'JSON.stringify(val, null, 2)',
    insertText: 'JSON.stringify(, null, 2)',
    documentation: 'Mengonversi objek ke string JSON.',
    cursorOffset: 15,
  },
  {
    label: 'JSON.parse',
    kind: 'function',
    detail: 'JSON.parse(str)',
    insertText: 'JSON.parse()',
    documentation: 'Memparsing string JSON.',
    cursorOffset: 11,
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
    detail: 'print(*values)',
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
  {
    label: 'try except',
    kind: 'snippet',
    detail: 'try...except block',
    insertText: `try:\n    pass\nexcept Exception as e:\n    print(f"Error: {e}")`,
    documentation: 'Blok penanganan eksepsi Python.',
  },
  {
    label: 'list comprehension',
    kind: 'snippet',
    detail: '[x for x in iterable if condition]',
    insertText: `[item for item in items if item]`,
    documentation: 'Membuat list baru dengan ekspresi ringkas.',
  },
  {
    label: 'len',
    kind: 'function',
    detail: 'len(s: Sized) -> int',
    insertText: `len()`,
    documentation: 'Mengembalikan jumlah item pada container.',
  },
  {
    label: 'range',
    kind: 'function',
    detail: 'range(stop) or range(start, stop[, step])',
    insertText: `range(10)`,
    documentation: 'Menghasilkan urutan angka integer.',
  },
];

const HTML_COMPLETIONS: CompletionItem[] = [
  {
    label: 'div',
    kind: 'snippet',
    detail: '<div class=""></div>',
    insertText: `<div class="">\n  \n</div>`,
    documentation: 'Elemen kontainer generik HTML5.',
  },
  {
    label: 'button',
    kind: 'snippet',
    detail: '<button type="button"></button>',
    insertText: `<button type="button" class="btn">\n  Klik\n</button>`,
    documentation: 'Elemen tombol interaktif.',
  },
  {
    label: 'input',
    kind: 'snippet',
    detail: '<input type="text" placeholder="" />',
    insertText: `<input type="text" name="" placeholder="" class="input" />`,
    documentation: 'Elemen input form teks.',
  },
  {
    label: 'section',
    kind: 'snippet',
    detail: '<section class=""></section>',
    insertText: `<section class="my-4">\n  <h2>Judul</h2>\n</section>`,
    documentation: 'Elemen seksi semantik dokumen HTML5.',
  },
  {
    label: 'a',
    kind: 'snippet',
    detail: '<a href=""></a>',
    insertText: `<a href="#" target="_blank" rel="noopener noreferrer">Tautan</a>`,
    documentation: 'Elemen jangkar anchor hipertaut.',
  },
];

const CSS_COMPLETIONS: CompletionItem[] = [
  {
    label: 'display: flex',
    kind: 'snippet',
    detail: 'Flexbox Layout Container',
    insertText: `display: flex;\nalign-items: center;\njustify-content: space-between;`,
    documentation: 'Menata container dalam sistem fleksibel 1 dimensi.',
  },
  {
    label: 'display: grid',
    kind: 'snippet',
    detail: 'CSS Grid Layout',
    insertText: `display: grid;\ngrid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\ngap: 1rem;`,
    documentation: 'Menata elemen dalam sistem kisi 2 dimensi yang responsif.',
  },
  {
    label: 'center-flex',
    kind: 'snippet',
    detail: 'Center both horizontally & vertically',
    insertText: `display: flex;\nalign-items: center;\njustify-content: center;`,
    documentation: 'Menengahkan konten vertikal dan horizontal dengan flexbox.',
  },
  {
    label: 'media-query',
    kind: 'snippet',
    detail: '@media (min-width: 768px)',
    insertText: `@media (min-width: 768px) {\n  \n}`,
    documentation: 'Query media responsif untuk breakpoint layar.',
  },
  {
    label: 'border-radius',
    kind: 'property',
    detail: 'border-radius: 8px;',
    insertText: `border-radius: 8px;`,
    documentation: 'Membulatkan sudut tepi elemen.',
  },
  {
    label: 'transition',
    kind: 'property',
    detail: 'transition: all 0.2s ease;',
    insertText: `transition: all 0.2s ease;`,
    documentation: 'Animasi transisi halus pada perubahan properti CSS.',
  },
];

const SQL_COMPLETIONS: CompletionItem[] = [
  {
    label: 'SELECT * FROM',
    kind: 'snippet',
    detail: 'Kueri pengambilan data dasar',
    insertText: `SELECT * FROM nama_tabel WHERE id = 1;`,
    documentation: 'Mengambil rekaman data dari tabel dengan filter kondisi.',
  },
  {
    label: 'SELECT JOIN',
    kind: 'snippet',
    detail: 'Kueri penggabungan tabel',
    insertText: `SELECT \n    t1.id,\n    t2.nama\nFROM tabel_satu t1\nLEFT JOIN tabel_dua t2 ON t2.tabel_satu_id = t1.id\nWHERE t1.is_active = TRUE;`,
    documentation: 'Menggabungkan beberapa tabel berelasi (LEFT JOIN).',
  },
  {
    label: 'INSERT INTO',
    kind: 'snippet',
    detail: 'Menyisipkan baris baru',
    insertText: `INSERT INTO nama_tabel (kolom1, kolom2)\nVALUES ('nilai1', 'nilai2');`,
    documentation: 'Memasukkan data rekaman baru ke tabel.',
  },
  {
    label: 'UPDATE SET',
    kind: 'snippet',
    detail: 'Memperbarui rekaman',
    insertText: `UPDATE nama_tabel\nSET status = 'aktif', updated_at = NOW()\nWHERE id = 1;`,
    documentation: 'Memperbarui nilai kolom pada baris tertentu.',
  },
  {
    label: 'GROUP BY HAVING',
    kind: 'snippet',
    detail: 'Agregasi grup data',
    insertText: `GROUP BY kategori\nHAVING COUNT(*) > 5\nORDER BY total DESC;`,
    documentation: 'Mengelompokkan data agregat dengan filter having.',
  },
];

const RUST_COMPLETIONS: CompletionItem[] = [
  {
    label: 'fn main',
    kind: 'snippet',
    detail: 'fn main() { ... }',
    insertText: `fn main() {\n    println!("Halo Dunia!");\n}`,
    documentation: 'Titik masuk utama aplikasi Rust.',
  },
  {
    label: 'println!',
    kind: 'function',
    detail: 'println!("{}", val)',
    insertText: `println!();`,
    documentation: 'Macro pencetak baris ke stdout.',
  },
  {
    label: 'struct',
    kind: 'snippet',
    detail: 'pub struct Model { ... }',
    insertText: `#[derive(Debug, Clone)]\npub struct Model {\n    pub id: u64,\n    pub name: String,\n}`,
    documentation: 'Struktur data kustom di Rust.',
  },
  {
    label: 'match',
    kind: 'snippet',
    detail: 'Pattern matching',
    insertText: `match result {\n    Ok(val) => val,\n    Err(err) => panic!("{}", err),\n}`,
    documentation: 'Mencocokkan pola enum Result atau Option.',
  },
];

const GO_COMPLETIONS: CompletionItem[] = [
  {
    label: 'func main',
    kind: 'snippet',
    detail: 'package main / func main()',
    insertText: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Halo Go!")\n}`,
    documentation: 'Titik masuk aplikasi bahasa Go.',
  },
  {
    label: 'if err != nil',
    kind: 'snippet',
    detail: 'Go standard error handling',
    insertText: `if err != nil {\n\treturn err\n}`,
    documentation: 'Pola standar penanganan galat fungsi di Go.',
  },
  {
    label: 'type struct',
    kind: 'snippet',
    detail: 'type Model struct',
    insertText: `type Model struct {\n\tID   string \`json:"id"\`\n\tName string \`json:"name"\`\n}`,
    documentation: 'Mendefinisikan struct dengan tag JSON.',
  },
];

const JSON_COMPLETIONS: CompletionItem[] = [
  {
    label: 'object',
    kind: 'snippet',
    detail: 'JSON object pair',
    insertText: `{\n  "key": "value"\n}`,
    documentation: 'Struktur objek JSON standar.',
  },
  {
    label: 'array',
    kind: 'snippet',
    detail: 'JSON array',
    insertText: `[\n  "item1",\n  "item2"\n]`,
    documentation: 'Daftar larik array JSON.',
  },
];

const MARKDOWN_COMPLETIONS: CompletionItem[] = [
  {
    label: 'code-block',
    kind: 'snippet',
    detail: '```language ... ```',
    insertText: "```typescript\nconsole.log('Halo');\n```",
    documentation: 'Blok cuplikan kode Markdown dengan syntax highlighting.',
  },
  {
    label: 'table',
    kind: 'snippet',
    detail: 'Markdown table',
    insertText: `| Kolom 1 | Kolom 2 |\n| :--- | :--- |\n| Data A | Keterangan |`,
    documentation: 'Format tabel Markdown dengan perataan kolom.',
  },
];

export function getCompletions(
  code: string,
  cursorPosition: number,
  language: CodeLanguage
): CompletionItem[] {
  const textBefore = code.slice(0, cursorPosition);
  const match = textBefore.match(/([a-zA-Z0-9_$.:-]+)$/);
  const prefix = match ? match[1] : '';

  let list: CompletionItem[] = [];
  if (language === 'typescript' || language === 'javascript') {
    list = TS_COMPLETIONS;
  } else if (language === 'python') {
    list = PY_COMPLETIONS;
  } else if (language === 'html') {
    list = HTML_COMPLETIONS;
  } else if (language === 'css') {
    list = CSS_COMPLETIONS;
  } else if (language === 'sql') {
    list = SQL_COMPLETIONS;
  } else if (language === 'rust') {
    list = RUST_COMPLETIONS;
  } else if (language === 'go') {
    list = GO_COMPLETIONS;
  } else if (language === 'json') {
    list = JSON_COMPLETIONS;
  } else if (language === 'markdown') {
    list = MARKDOWN_COMPLETIONS;
  } else {
    list = TS_COMPLETIONS;
  }

  // User declared symbols in document
  const userSymbols: CompletionItem[] = [];
  const symbolRegex = /\b(const|let|var|function|interface|type|class|def|fn|func)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let sMatch;
  const seen = new Set<string>();
  while ((sMatch = symbolRegex.exec(code)) !== null) {
    const kind = sMatch[1];
    const name = sMatch[2];
    if (!seen.has(name)) {
      seen.add(name);
      userSymbols.push({
        label: name,
        kind: kind === 'function' || kind === 'def' || kind === 'fn' || kind === 'func' ? 'function' : 'variable',
        detail: `(${kind}) ${name}`,
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
