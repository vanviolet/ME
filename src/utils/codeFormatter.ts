import * as prettier from 'prettier';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree';
import * as tsPlugin from 'prettier/plugins/typescript';
import * as htmlPlugin from 'prettier/plugins/html';
import * as postcssPlugin from 'prettier/plugins/postcss';
import * as markdownPlugin from 'prettier/plugins/markdown';

export interface FormatResult {
  code: string;
  formatted: boolean;
  error?: string;
}

/**
 * Format code using Prettier with graceful fallbacks
 */
export async function formatCodeWithPrettier(
  code: string,
  lang: string = 'javascript'
): Promise<FormatResult> {
  const cleanLang = (lang || 'javascript').trim().toLowerCase();

  let parser = 'babel';
  const plugins = [babelPlugin, estreePlugin, tsPlugin, htmlPlugin, postcssPlugin, markdownPlugin];

  if (cleanLang === 'typescript' || cleanLang === 'ts' || cleanLang === 'tsx') {
    parser = 'typescript';
  } else if (cleanLang === 'javascript' || cleanLang === 'js' || cleanLang === 'jsx') {
    parser = 'babel';
  } else if (cleanLang === 'json') {
    parser = 'json';
  } else if (cleanLang === 'html' || cleanLang === 'xml') {
    parser = 'html';
  } else if (cleanLang === 'css' || cleanLang === 'scss' || cleanLang === 'less') {
    parser = 'css';
  } else if (cleanLang === 'markdown' || cleanLang === 'md') {
    parser = 'markdown';
  } else {
    // For Python, SQL, Bash, etc. provide smart beautifier fallback
    return fallbackFormat(code, cleanLang);
  }

  try {
    const formatted = await prettier.format(code, {
      parser,
      plugins,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 80,
      bracketSpacing: true,
      arrowParens: 'always',
    });

    return {
      code: formatted,
      formatted: true,
    };
  } catch (err: any) {
    // If Prettier threw syntax error, fallback or return error message
    const fallback = fallbackFormat(code, cleanLang);
    return {
      code: fallback.code,
      formatted: fallback.formatted,
      error: err?.message || 'Prettier formatting syntax notice',
    };
  }
}

/**
 * Lightweight smart beautifier fallback for JSON, Python, SQL, or when parser fails
 */
function fallbackFormat(code: string, lang: string): FormatResult {
  try {
    if (lang === 'json') {
      const parsed = JSON.parse(code);
      return {
        code: JSON.stringify(parsed, null, 2),
        formatted: true,
      };
    }

    // Generic indentation cleanup
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease indent if closing bracket
      if (/^[}\]\)]/.test(trimmed)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indent = '  '.repeat(indentLevel);
      const res = indent + trimmed;

      // Increase indent if opening bracket
      if (/[{\[\(]$/.test(trimmed)) {
        indentLevel++;
      }

      return res;
    });

    return {
      code: formattedLines.join('\n'),
      formatted: true,
    };
  } catch (e: any) {
    return {
      code,
      formatted: false,
      error: e?.message || 'Formatting failed',
    };
  }
}
