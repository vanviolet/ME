/**
 * Code Analysis & Error Lens Diagnostic Engine
 * Analyzes code for syntax errors, structural defects, and best practice warnings
 * with precise line numbers, columns, and Error Lens ribbons.
 */

export interface CodeDiagnostic {
  id: string;
  line: number; // 1-based line number
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source: 'syntax' | 'linter' | 'runtime' | 'format';
  suggestedFix?: string;
  codeSnippet?: string;
}

export interface AnalysisResult {
  diagnostics: CodeDiagnostic[];
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

/**
 * Validates JavaScript and TypeScript code
 */
function analyzeJavaScript(code: string): CodeDiagnostic[] {
  const diagnostics: CodeDiagnostic[] = [];
  const lines = code.split('\n');

  // 1. Bracket & Quote Matching Check
  const stack: { char: string; line: number; col: number }[] = [];
  const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  let inString: string | null = null;
  let stringStartLine = 0;
  let inLineComment = false;
  let inBlockComment = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    inLineComment = false;

    for (let colIdx = 0; colIdx < line.length; colIdx++) {
      const char = line[colIdx];
      const prevChar = colIdx > 0 ? line[colIdx - 1] : '';
      const nextChar = colIdx < line.length - 1 ? line[colIdx + 1] : '';

      // Comments handling
      if (!inString) {
        if (!inBlockComment && char === '/' && nextChar === '/') {
          inLineComment = true;
          break;
        }
        if (!inBlockComment && char === '/' && nextChar === '*') {
          inBlockComment = true;
          colIdx++;
          continue;
        }
        if (inBlockComment && char === '*' && nextChar === '/') {
          inBlockComment = false;
          colIdx++;
          continue;
        }
      }

      if (inLineComment || inBlockComment) continue;

      // String literal handling
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (inString === char) {
          inString = null;
        } else if (!inString) {
          inString = char;
          stringStartLine = lineIdx + 1;
        }
        continue;
      }

      if (inString) continue;

      // Brackets handling
      if (char === '(' || char === '{' || char === '[') {
        stack.push({ char, line: lineIdx + 1, col: colIdx + 1 });
      } else if (char === ')' || char === '}' || char === ']') {
        const expected = pairs[char];
        if (stack.length === 0) {
          diagnostics.push({
            id: `unmatched-closing-${lineIdx}-${colIdx}`,
            line: lineIdx + 1,
            column: colIdx + 1,
            message: `Tanda kurung penutup tidak terduga '${char}' tanpa pasangan pembuka`,
            severity: 'error',
            source: 'syntax',
            suggestedFix: `Hapus atau sesuaikan '${char}'`,
          });
        } else {
          const top = stack.pop()!;
          if (top.char !== expected) {
            diagnostics.push({
              id: `mismatched-bracket-${lineIdx}-${colIdx}`,
              line: lineIdx + 1,
              column: colIdx + 1,
              message: `Tanda kurung tidak cocok: diharapkan '${top.char === '(' ? ')' : top.char === '{' ? '}' : ']'}' untuk '${top.char}' di baris ${top.line}, tetapi ditemukan '${char}'`,
              severity: 'error',
              source: 'syntax',
              suggestedFix: `Ganti '${char}' dengan pasangan yang sesuai`,
            });
          }
        }
      }
    }

    // Check for common JavaScript linter notices
    const trimmed = line.trim();
    if (trimmed.includes('==') && !trimmed.includes('===') && !trimmed.includes('!==') && !trimmed.includes('===')) {
      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        diagnostics.push({
          id: `loose-equality-${lineIdx}`,
          line: lineIdx + 1,
          message: `Gunakan perbandingan ketat '===' daripada '==' untuk menghindari type coercion tak terduga`,
          severity: 'warning',
          source: 'linter',
          suggestedFix: `Ganti '==' dengan '==='`,
        });
      }
    }

    if (trimmed.startsWith('console.log(') || trimmed.startsWith('console.debug(')) {
      diagnostics.push({
        id: `console-statement-${lineIdx}`,
        line: lineIdx + 1,
        message: `Pernyataan debugging konsol aktif terdeteksi`,
        severity: 'info',
        source: 'linter',
      });
    }

    // Check for missing async on await
    if (/\bawait\b/.test(trimmed) && !trimmed.startsWith('//')) {
      // Check if inside async
      const codeUpToHere = lines.slice(0, lineIdx + 1).join('\n');
      if (!/\basync\b/.test(codeUpToHere)) {
        diagnostics.push({
          id: `top-level-await-notice-${lineIdx}`,
          line: lineIdx + 1,
          message: `'await' digunakan; pastikan berada di dalam 'async function' atau modul tingkat atas`,
          severity: 'warning',
          source: 'syntax',
          suggestedFix: `Tambahkan keyword 'async' pada fungsi pembungkus`,
        });
      }
    }
  }

  // Check unclosed string
  if (inString) {
    diagnostics.push({
      id: `unclosed-string-${stringStartLine}`,
      line: stringStartLine,
      message: `String literal dengan tanda '${inString}' belum ditutup`,
      severity: 'error',
      source: 'syntax',
      suggestedFix: `Tambahkan tanda penutup '${inString}'`,
    });
  }

  // Check unclosed brackets
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    diagnostics.push({
      id: `unclosed-bracket-${unclosed.line}-${unclosed.col}`,
      line: unclosed.line,
      column: unclosed.col,
      message: `Tanda '${unclosed.char}' dibuka di baris ini tetapi belum pernah ditutup`,
      severity: 'error',
      source: 'syntax',
      suggestedFix: `Tambahkan tanda penutup '${unclosed.char === '(' ? ')' : unclosed.char === '{' ? '}' : ']'}'`,
    });
  }

  // 2. Syntax validation via JS Function parser
  try {
    // Strip simple TS types for parsing check
    const sanitized = code
      .replace(/import\s+type\s+.*?from\s+['"].*?['"];?/g, '')
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '// [import]')
      .replace(/export\s+interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
      .replace(/interface\s+[a-zA-Z0-9_$]+\s*\{[\s\S]*?\}/g, '')
      .replace(/export\s+type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
      .replace(/type\s+[a-zA-Z0-9_$]+\s*=.*?;/g, '')
      .replace(/:\s*[a-zA-Z0-9_$<>\[\], |&]+(\s*=|\s*\)|\s*,|\s*;)/g, '$1')
      .replace(/export\s+/g, '');

    new Function(sanitized);
  } catch (err: any) {
    const msg = err?.message || String(err);
    let errorLine = 1;

    // Try parsing line number from error stack or message
    const lineMatch = msg.match(/(?:line|baris)\s*(\d+)/i) || err.stack?.match(/<anonymous>:(\d+):(\d+)/);
    if (lineMatch && lineMatch[1]) {
      errorLine = Math.min(lines.length, Math.max(1, parseInt(lineMatch[1], 10)));
    } else {
      // Find line with last syntax issue
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().length > 0) {
          errorLine = i + 1;
          break;
        }
      }
    }

    // Only add if not duplicate
    if (!diagnostics.some((d) => d.line === errorLine && d.severity === 'error')) {
      diagnostics.push({
        id: `js-syntax-error-${errorLine}`,
        line: errorLine,
        message: `Syntax Error: ${msg}`,
        severity: 'error',
        source: 'syntax',
        suggestedFix: `Periksa sintaks pada baris ini atau format ulang dengan Prettier`,
      });
    }
  }

  return diagnostics;
}

/**
 * Validates JSON syntax with exact line and column
 */
function analyzeJson(code: string): CodeDiagnostic[] {
  const diagnostics: CodeDiagnostic[] = [];
  const lines = code.split('\n');

  if (!code.trim()) {
    diagnostics.push({
      id: 'empty-json',
      line: 1,
      message: 'JSON tidak boleh kosong',
      severity: 'error',
      source: 'syntax',
    });
    return diagnostics;
  }

  // Check for trailing commas in JSON (a very common error)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/,\s*[}\]]/.test(line)) {
      diagnostics.push({
        id: `trailing-comma-${i}`,
        line: i + 1,
        message: 'Koma berlebih (trailing comma) tidak diizinkan dalam format JSON standar',
        severity: 'error',
        source: 'syntax',
        suggestedFix: 'Hapus koma sebelum kurung penutup',
      });
    }

    // Check for single quotes
    if (/'[^']*'/.test(line) && !line.includes('"')) {
      diagnostics.push({
        id: `single-quotes-json-${i}`,
        line: i + 1,
        message: 'JSON mengharuskan tanda kutip ganda (") bukan tanda kutip tunggal (\')',
        severity: 'error',
        source: 'syntax',
        suggestedFix: 'Ganti tanda kutip tunggal dengan tanda kutip ganda',
      });
    }
  }

  try {
    JSON.parse(code);
  } catch (err: any) {
    const msg = err.message || 'JSON Parse Error';
    let lineNum = 1;
    let colNum = 1;

    // Pattern: "at position 123"
    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      let count = 0;
      for (let i = 0; i < lines.length; i++) {
        if (count + lines[i].length >= pos) {
          lineNum = i + 1;
          colNum = pos - count + 1;
          break;
        }
        count += lines[i].length + 1; // +1 for newline
      }
    }

    diagnostics.push({
      id: `json-parse-err-${lineNum}`,
      line: lineNum,
      column: colNum,
      message: `Invalid JSON: ${msg}`,
      severity: 'error',
      source: 'syntax',
      suggestedFix: 'Format dengan Prettier untuk memperbaiki struktur JSON',
    });
  }

  return diagnostics;
}

/**
 * Validates Python syntax and structure
 */
function analyzePython(code: string): CodeDiagnostic[] {
  const diagnostics: CodeDiagnostic[] = [];
  const lines = code.split('\n');

  const colonKeywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check missing colon after keyword
    for (const kw of colonKeywords) {
      const regex = new RegExp(`^${kw}\\b.*[^:]$`);
      if (regex.test(trimmed)) {
        diagnostics.push({
          id: `missing-colon-${i}`,
          line: i + 1,
          message: `Baris diawali dengan '${kw}' tetapi belum diakhiri dengan tanda titik dua ':'`,
          severity: 'error',
          source: 'syntax',
          suggestedFix: "Tambahkan tanda ':' di akhir baris",
        });
        break;
      }
    }

    // Check semicolon at end of line (Python best practice)
    if (trimmed.endsWith(';') && !trimmed.startsWith('#')) {
      diagnostics.push({
        id: `semicolon-python-${i}`,
        line: i + 1,
        message: `Titik koma ';' tidak diperlukan di akhir baris Python (PEP 8)`,
        severity: 'info',
        source: 'linter',
        suggestedFix: 'Hapus titik koma di akhir baris',
      });
    }
  }

  return diagnostics;
}

/**
 * Validates HTML / XML
 */
function analyzeHtml(code: string): CodeDiagnostic[] {
  const diagnostics: CodeDiagnostic[] = [];
  const lines = code.split('\n');
  const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'];
  const tagStack: { tag: string; line: number }[] = [];

  const tagRegex = /<\/?([a-zA-Z0-9_-]+)(?:\s+[^>]*?)?(\/?)>/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(line)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();
      const isClosing = fullTag.startsWith('</');
      const isSelfClosing = fullTag.endsWith('/>') || selfClosing.includes(tagName);

      if (isSelfClosing) continue;

      if (isClosing) {
        if (tagStack.length === 0) {
          diagnostics.push({
            id: `unexpected-closing-tag-${i}`,
            line: i + 1,
            message: `Tag penutup '</${tagName}>' tidak terduga tanpa tag pembuka yang sesuai`,
            severity: 'error',
            source: 'syntax',
          });
        } else {
          const top = tagStack.pop()!;
          if (top.tag !== tagName) {
            diagnostics.push({
              id: `mismatched-tag-${i}`,
              line: i + 1,
              message: `Tag tidak cocok: diharapkan '</${top.tag}>' yang dibuka di baris ${top.line}, tetapi ditemukan '</${tagName}>'`,
              severity: 'error',
              source: 'syntax',
            });
          }
        }
      } else {
        tagStack.push({ tag: tagName, line: i + 1 });
      }
    }
  }

  while (tagStack.length > 0) {
    const unclosed = tagStack.pop()!;
    diagnostics.push({
      id: `unclosed-tag-${unclosed.line}`,
      line: unclosed.line,
      message: `Tag '<${unclosed.tag}>' di baris ini belum ditutup`,
      severity: 'error',
      source: 'syntax',
      suggestedFix: `Tambahkan tag penutup '</${unclosed.tag}>'`,
    });
  }

  return diagnostics;
}

/**
 * Main Analyzer entry point
 */
export function analyzeCodeSnippet(code: string, lang: string = 'javascript'): AnalysisResult {
  const cleanLang = (lang || 'javascript').trim().toLowerCase();
  let diagnostics: CodeDiagnostic[] = [];

  if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(cleanLang)) {
    diagnostics = analyzeJavaScript(code);
  } else if (cleanLang === 'json') {
    diagnostics = analyzeJson(code);
  } else if (['python', 'py'].includes(cleanLang)) {
    diagnostics = analyzePython(code);
  } else if (['html', 'xml', 'svg'].includes(cleanLang)) {
    diagnostics = analyzeHtml(code);
  }

  // Sort by line ascending
  diagnostics.sort((a, b) => a.line - b.line);

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const infoCount = diagnostics.filter((d) => d.severity === 'info').length;

  return {
    diagnostics,
    isValid: errorCount === 0,
    errorCount,
    warningCount,
    infoCount,
  };
}
