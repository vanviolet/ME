import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  ESLINT_RULES,
  ESLINT_CATEGORIES,
  ESLINT_PRESETS,
  EslintRuleDefinition,
  RuleCategory,
  RuleSeverity,
} from '../../data/eslintRulesData';
import {
  ShieldAlert,
  Sliders,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Code2,
  Wrench,
  Play,
  FileCode,
  FileJson,
  Layers,
  HelpCircle,
  ArrowRight,
  Filter,
  Eye,
  Info,
  CheckCheck,
  ChevronDown,
  Terminal,
  Settings2,
  Maximize2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VsCodePlayground } from './eslint/VsCodePlayground';

type ConfigFormat = 'flat-js' | 'flat-ts' | 'legacy-json' | 'legacy-js' | 'package-json' | 'cli';

export const EslintRulesGeneratorPage: React.FC = () => {
  const { language } = usePortfolio();

  // Selected format
  const [format, setFormat] = useState<ConfigFormat>('flat-js');
  // Environment options
  const [includeTypescript, setIncludeTypescript] = useState(true);
  const [includeReact, setIncludeReact] = useState(true);
  const [targetEnv, setTargetEnv] = useState<{ browser: boolean; node: boolean; es2024: boolean }>({
    browser: true,
    node: true,
    es2024: true,
  });

  // Active rules state: map of ruleName -> severity | [severity, options]
  const [ruleStates, setRuleStates] = useState<Record<string, { severity: RuleSeverity; options?: any }>>(() => {
    const initial: Record<string, { severity: RuleSeverity; options?: any }> = {};
    // Default to ESLint recommended
    const recommendedPreset = ESLINT_PRESETS.find((p) => p.id === 'recommended');
    if (recommendedPreset) {
      Object.entries(recommendedPreset.rules).forEach(([name, val]) => {
        if (Array.isArray(val)) {
          initial[name] = { severity: val[0], options: val[1] };
        } else {
          initial[name] = { severity: val };
        }
      });
    }
    return initial;
  });

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'active' | 'error' | 'warn' | 'off' | 'recommended' | 'fixable'>('all');
  const [activePreset, setActivePreset] = useState<string>('recommended');

  // Interactive Hover & Inspection Modal
  const [hoveredRule, setHoveredRule] = useState<EslintRuleDefinition | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [inspectedRule, setInspectedRule] = useState<EslintRuleDefinition | null>(null);
  const [editingOptionsRule, setEditingOptionsRule] = useState<EslintRuleDefinition | null>(null);

  // Playground Code
  const [playgroundCode, setPlaygroundCode] = useState<string>(`// 🧪 ESLint Live Playground Sandbox
// Coba ubah kode di bawah ini untuk melihat evaluasi rules secara real-time!

var oldTitle = "Interactive ESLint Studio"; // Trigger 'no-var' & 'quotes'
let unusedCounter = 100; // Trigger 'no-unused-vars'

function getUserRole(user) {
  if (user.role = 'admin') { // Trigger 'no-cond-assign'
    console.log("Welcome Admin: " + user.name); // Trigger 'no-console' & 'prefer-template'
  }
  
  if (user.age == 18) { // Trigger 'eqeqeq'
    debugger; // Trigger 'no-debugger'
  }
  
  return; // Trigger 'no-useless-return'
}

const config = {
  theme: 'dark',
  theme: 'light', // Trigger 'no-dupe-keys'
};
`);

  // Active view tab: 'rules' | 'config' | 'playground'
  const [activeTab, setActiveTab] = useState<'rules' | 'config' | 'playground'>('rules');

  // Copy feedback
  const [copied, setCopied] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  // Hover delay timer
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterCard = (rule: EslintRuleDefinition, e: React.MouseEvent<HTMLElement>) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setHoveredRule(rule);
  };

  const handleMouseLeaveCard = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRule(null);
    }, 120);
  };

  // Rule severity toggle helper
  const setRuleSeverity = (ruleName: string, severity: RuleSeverity) => {
    setRuleStates((prev) => {
      const existing = prev[ruleName];
      if (severity === 'off') {
        const next = { ...prev };
        delete next[ruleName];
        return next;
      }
      return {
        ...prev,
        [ruleName]: {
          severity,
          options: existing?.options,
        },
      };
    });
    setActivePreset('custom');
  };

  // Apply preset
  const applyPreset = (presetId: string) => {
    const preset = ESLINT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const next: Record<string, { severity: RuleSeverity; options?: any }> = {};
    Object.entries(preset.rules).forEach(([name, val]) => {
      if (Array.isArray(val)) {
        next[name] = { severity: val[0], options: val[1] };
      } else {
        next[name] = { severity: val };
      }
    });
    setRuleStates(next);
    setActivePreset(presetId);
  };

  // Filter rules
  const filteredRules = useMemo(() => {
    return ESLINT_RULES.filter((rule) => {
      // Category filter
      if (selectedCategory !== 'all' && rule.category !== selectedCategory) {
        return false;
      }

      // Severity / Filter status
      const state = ruleStates[rule.name];
      const currentSeverity = state?.severity || 'off';

      if (filterSeverity === 'active' && currentSeverity === 'off') return false;
      if (filterSeverity === 'error' && currentSeverity !== 'error') return false;
      if (filterSeverity === 'warn' && currentSeverity !== 'warn') return false;
      if (filterSeverity === 'off' && currentSeverity !== 'off') return false;
      if (filterSeverity === 'recommended' && !rule.recommended) return false;
      if (filterSeverity === 'fixable' && !rule.fixable) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rule.name.toLowerCase().includes(q);
        const matchDescEn = rule.descriptionEn.toLowerCase().includes(q);
        const matchDescId = rule.descriptionId.toLowerCase().includes(q);
        const matchTags = rule.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDescEn && !matchDescId && !matchTags) return false;
      }

      return true;
    });
  }, [selectedCategory, filterSeverity, searchQuery, ruleStates]);

  // Statistics
  const stats = useMemo(() => {
    let errorCount = 0;
    let warnCount = 0;
    Object.values(ruleStates).forEach((item: { severity: RuleSeverity; options?: any }) => {
      if (item.severity === 'error') errorCount++;
      if (item.severity === 'warn') warnCount++;
    });
    return {
      totalRules: ESLINT_RULES.length,
      activeCount: errorCount + warnCount,
      errorCount,
      warnCount,
      offCount: ESLINT_RULES.length - (errorCount + warnCount),
    };
  }, [ruleStates]);

  // Batch actions
  const setBatchSeverity = (severity: RuleSeverity) => {
    setRuleStates((prev) => {
      const next = { ...prev };
      filteredRules.forEach((rule) => {
        if (severity === 'off') {
          delete next[rule.name];
        } else {
          next[rule.name] = {
            severity,
            options: prev[rule.name]?.options,
          };
        }
      });
      return next;
    });
    setActivePreset('custom');
  };

  // Generate configuration code
  const generatedConfig = useMemo(() => {
    const rulesObj: Record<string, any> = {};
    (Object.entries(ruleStates) as [string, { severity: RuleSeverity; options?: any }][]).forEach(([name, config]) => {
      if (config.severity && config.severity !== 'off') {
        if (config.options !== undefined) {
          rulesObj[name] = [config.severity, config.options];
        } else {
          rulesObj[name] = config.severity;
        }
      }
    });

    if (format === 'flat-js') {
      return `import js from '@eslint/js';
import globals from 'globals';
${includeTypescript ? "import tseslint from 'typescript-eslint';\n" : ''}${includeReact ? "import reactPlugin from 'eslint-plugin-react';\nimport reactHooksPlugin from 'eslint-plugin-react-hooks';\n" : ''}
export default [
  {
    ignores: ['dist', 'build', 'node_modules', '.next', 'coverage'],
  },
  js.configs.recommended,
  ${includeTypescript ? '...tseslint.configs.recommended,\n  ' : ''}{
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ${targetEnv.browser ? '...globals.browser,\n        ' : ''}${targetEnv.node ? '...globals.node,\n        ' : ''}${targetEnv.es2024 ? '...globals.es2024,\n        ' : ''}
      },
    },
    ${includeReact ? `plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },` : ''}
    rules: ${JSON.stringify(rulesObj, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")},
  },
];`;
    }

    if (format === 'flat-ts') {
      return `import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
${includeReact ? "import reactPlugin from 'eslint-plugin-react';\nimport reactHooksPlugin from 'eslint-plugin-react-hooks';\n" : ''}
export default tseslint.config(
  {
    ignores: ['dist', 'build', 'node_modules', '.next', 'coverage'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ${targetEnv.browser ? '...globals.browser,\n        ' : ''}${targetEnv.node ? '...globals.node,\n        ' : ''}
      },
    },
    ${includeReact ? `plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },` : ''}
    rules: ${JSON.stringify(rulesObj, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")},
  },
);`;
    }

    if (format === 'legacy-json') {
      const config = {
        root: true,
        env: {
          browser: targetEnv.browser,
          node: targetEnv.node,
          es2024: targetEnv.es2024,
        },
        extends: [
          'eslint:recommended',
          ...(includeTypescript ? ['plugin:@typescript-eslint/recommended'] : []),
          ...(includeReact ? ['plugin:react/recommended', 'plugin:react-hooks/recommended'] : []),
        ],
        parser: includeTypescript ? '@typescript-eslint/parser' : undefined,
        plugins: [
          ...(includeTypescript ? ['@typescript-eslint'] : []),
          ...(includeReact ? ['react', 'react-hooks'] : []),
        ],
        rules: rulesObj,
      };
      return JSON.stringify(config, null, 2);
    }

    if (format === 'legacy-js') {
      return `module.exports = {
  root: true,
  env: {
    browser: ${targetEnv.browser},
    node: ${targetEnv.node},
    es2024: ${targetEnv.es2024},
  },
  extends: [
    'eslint:recommended',
    ${includeTypescript ? "'plugin:@typescript-eslint/recommended',\n    " : ''}${includeReact ? "'plugin:react/recommended',\n    'plugin:react-hooks/recommended',\n    " : ''}
  ],
  ${includeTypescript ? "parser: '@typescript-eslint/parser',\n  " : ''}plugins: [
    ${includeTypescript ? "'@typescript-eslint',\n    " : ''}${includeReact ? "'react',\n    'react-hooks',\n    " : ''}
  ],
  rules: ${JSON.stringify(rulesObj, null, 4)},
};`;
    }

    if (format === 'package-json') {
      const snippet = {
        eslintConfig: {
          root: true,
          env: {
            browser: targetEnv.browser,
            node: targetEnv.node,
          },
          extends: ['eslint:recommended'],
          rules: rulesObj,
        },
      };
      return JSON.stringify(snippet, null, 2);
    }

    if (format === 'cli') {
      const ruleFlags = Object.entries(rulesObj)
        .map(([k, v]) => `--rule '${k}: ${JSON.stringify(v)}'`)
        .join(' \\\n  ');
      return `npx eslint src/ \\\n  ${ruleFlags}`;
    }

    return '';
  }, [format, ruleStates, includeTypescript, includeReact, targetEnv]);

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download handler
  const handleDownload = () => {
    let filename = 'eslint.config.js';
    let mime = 'application/javascript';
    if (format === 'flat-ts') {
      filename = 'eslint.config.ts';
      mime = 'text/typescript';
    } else if (format === 'legacy-json') {
      filename = '.eslintrc.json';
      mime = 'application/json';
    } else if (format === 'legacy-js') {
      filename = '.eslintrc.js';
      mime = 'application/javascript';
    } else if (format === 'package-json') {
      filename = 'package.json';
      mime = 'application/json';
    } else if (format === 'cli') {
      filename = 'lint.sh';
      mime = 'text/x-shellscript';
    }

    const blob = new Blob([generatedConfig], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import configuration parser
  const handleImportConfig = () => {
    try {
      setImportError('');
      // Try parsing JSON or extracted rules object
      let parsed: any = null;
      try {
        parsed = JSON.parse(importText);
      } catch {
        // Try extracting rules: { ... } regex
        const match = importText.match(/rules\s*:\s*({[\s\S]*?})/);
        if (match) {
          // evaluate loose JS object safely
          const looseJson = match[1]
            .replace(/(['"])?([a-zA-Z0-9_@\-\/]+)(['"])?:/g, '"$2":')
            .replace(/'/g, '"');
          parsed = { rules: JSON.parse(looseJson) };
        } else {
          throw new Error('Could not parse valid JSON or ESLint rules object');
        }
      }

      const extractedRules = parsed.rules || parsed;
      if (typeof extractedRules !== 'object') {
        throw new Error('No valid rules dictionary found in import');
      }

      const next: Record<string, { severity: RuleSeverity; options?: any }> = {};
      Object.entries(extractedRules).forEach(([name, val]: [string, any]) => {
        if (Array.isArray(val)) {
          const sev = val[0] === 2 || val[0] === 'error' ? 'error' : val[0] === 1 || val[0] === 'warn' ? 'warn' : 'off';
          if (sev !== 'off') next[name] = { severity: sev, options: val[1] };
        } else if (val === 2 || val === 'error') {
          next[name] = { severity: 'error' };
        } else if (val === 1 || val === 'warn') {
          next[name] = { severity: 'warn' };
        }
      });

      setRuleStates(next);
      setActivePreset('custom');
      setImportModalOpen(false);
      setImportText('');
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse configuration');
    }
  };

  // Live Playground Diagnostic Evaluator
  const playgroundDiagnostics = useMemo(() => {
    const lines = playgroundCode.split('\n');
    const issues: {
      line: number;
      rule: EslintRuleDefinition;
      severity: RuleSeverity;
      message: string;
      codeSnippet: string;
    }[] = [];

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;

      // check 'no-var'
      if (ruleStates['no-var']?.severity && /\bvar\s+[a-zA-Z_$]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-var');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['no-var'].severity,
            message: 'Unexpected var, use let or const instead (no-var)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'quotes'
      if (ruleStates['quotes']?.severity && /"([^"\\]|\\.)*"/.test(lineText) && !lineText.trim().startsWith('//')) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'quotes');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['quotes'].severity,
            message: 'Strings must use singlequote (quotes)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'no-cond-assign'
      if (ruleStates['no-cond-assign']?.severity && /if\s*\([^=]*=[^=]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-cond-assign');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['no-cond-assign'].severity,
            message: 'Expected a conditional expression and instead saw an assignment (no-cond-assign)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'eqeqeq'
      if (ruleStates['eqeqeq']?.severity && /[^\!=]==[^\!=]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'eqeqeq');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['eqeqeq'].severity,
            message: 'Expected "===" and instead saw "==" (eqeqeq)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'no-console'
      if (ruleStates['no-console']?.severity && /console\.log\(/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-console');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['no-console'].severity,
            message: 'Unexpected console statement (no-console)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'no-debugger'
      if (ruleStates['no-debugger']?.severity && /\bdebugger;?/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-debugger');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['no-debugger'].severity,
            message: 'Unexpected "debugger" statement (no-debugger)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'no-dupe-keys'
      if (ruleStates['no-dupe-keys']?.severity && /theme\s*:\s*['"]light['"]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-dupe-keys');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['no-dupe-keys'].severity,
            message: 'Duplicate key "theme" in object literal (no-dupe-keys)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'no-useless-return'
      if (ruleStates['no-useless-return']?.severity && /return;/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-useless-return');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['no-useless-return'].severity,
            message: 'Unnecessary return statement (no-useless-return)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'prefer-template'
      if (ruleStates['prefer-template']?.severity && /['"][^'"]*['"]\s*\+\s*[a-zA-Z]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'prefer-template');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['prefer-template'].severity,
            message: 'Unexpected string concatenation, use template literals (prefer-template)',
            codeSnippet: lineText.trim(),
          });
        }
      }

      // check 'no-unused-vars'
      if (ruleStates['no-unused-vars']?.severity && /unusedCounter/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-unused-vars');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            rule: ruleDef,
            severity: ruleStates['no-unused-vars'].severity,
            message: '"unusedCounter" is defined but never used (no-unused-vars)',
            codeSnippet: lineText.trim(),
          });
        }
      }
    });

    return issues;
  }, [playgroundCode, ruleStates]);

  // Auto fix playground sample
  const handleAutoFixPlayground = () => {
    let fixed = playgroundCode;
    // fix var -> const
    fixed = fixed.replace(/\bvar oldTitle =/g, 'const oldTitle =');
    // fix double quotes to single quotes
    fixed = fixed.replace(/"Interactive ESLint Studio"/g, "'Interactive ESLint Studio'");
    // fix == to ===
    fixed = fixed.replace(/user\.age == 18/g, 'user.age === 18');
    // fix string concat to template literal
    fixed = fixed.replace(
      /console\.log\("Welcome Admin: " \+ user\.name\);/g,
      "console.log(`Welcome Admin: ${user.name}`);"
    );
    // fix debugger
    fixed = fixed.replace(/\s*debugger;/g, '');
    // fix redundant return
    fixed = fixed.replace(/\s*return;\s*}/g, '\n}');
    // fix assignment in if
    fixed = fixed.replace(/if \(user\.role = 'admin'\)/g, "if (user.role === 'admin')");
    // remove duplicate key
    fixed = fixed.replace(/\s*theme: 'light',/g, '');

    setPlaygroundCode(fixed);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title={
          language === 'en'
            ? 'ESLint Rules Generator & Interactive Guide | Developer Tools'
            : 'Generator ESLint Rules & Panduan Interaktif | Developer Tools'
        }
        description={
          language === 'en'
            ? 'Interactive visual ESLint configuration generator with rule error hover previews, explanations, presets, and live code sandbox.'
            : 'Generator konfigurasi ESLint visual interaktif dengan pratinjau error saat di-hover, penjelasan lengkap, preset instan, dan playground kode live.'
        }
        keywords="eslint rules generator, eslint config generator, eslint flat config, eslint hover examples, javascript linter, typescript eslint rules"
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              {language === 'en' ? 'Back to Tools' : 'Kembali ke Tools'}
            </Link>
            <span className="text-stone-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {language === 'en' ? 'Interactive Guide' : 'Panduan Interaktif'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://eslint.org/docs/latest/rules/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 bg-stone-200/60 dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-stone-300/50 dark:border-zinc-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              eslint.org/rules
            </a>
          </div>
        </div>

        {/* Hero Header Section */}
        <div className="border border-stone-200 dark:border-zinc-800 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>ESLint v9+ & Legacy Config Builder</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 dark:text-zinc-50">
                {language === 'en'
                  ? 'Interactive ESLint Rules Generator'
                  : 'Generator Aturan ESLint Interaktif'}
              </h1>
              <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-400 leading-relaxed">
                {language === 'en'
                  ? 'Explore ESLint rules with interactive explanations. Hover over any rule card to see instant incorrect code error examples vs valid solutions, tweak severities, and generate production-ready configs.'
                  : 'Jelajahi aturan ESLint dengan penjelasan lengkap. Arahkan kursor (hover) pada kartu aturan untuk melihat contoh kode error vs solusi yang benar, sesuaikan level keparahan, dan ekspor konfigurasi instan.'}
              </p>
            </div>

            {/* Live Stats Pill Group */}
            <div className="grid grid-cols-3 gap-3 shrink-0 bg-stone-100/80 dark:bg-zinc-800/50 p-3 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 text-center">
              <div className="px-3 py-1">
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{stats.errorCount}</div>
                <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Errors</div>
              </div>
              <div className="px-3 py-1 border-x border-stone-200 dark:border-zinc-700">
                <div className="text-xl font-bold text-amber-500 dark:text-amber-400">{stats.warnCount}</div>
                <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Warnings</div>
              </div>
              <div className="px-3 py-1">
                <div className="text-xl font-bold text-stone-700 dark:text-zinc-300">{stats.totalRules}</div>
                <div className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">Indexed</div>
              </div>
            </div>
          </div>

          {/* Navigation Main Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-stone-200/70 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('rules')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'rules'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              {language === 'en' ? 'Rules Catalog & Visual Explorer' : 'Katalog Aturan & Visual Explorer'}
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-white/20">
                {filteredRules.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'config'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
              }`}
            >
              <FileCode className="w-4 h-4" />
              {language === 'en' ? 'Generated Config Code' : 'Kode Konfigurasi Siap Pakai'}
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono">
                {format === 'flat-js' ? 'eslint.config.js' : format}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('playground')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'playground'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Play className="w-4 h-4" />
              {language === 'en' ? 'Live Rule Sandbox' : 'Playground Evaluasi Live'}
              {playgroundDiagnostics.length > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                  {playgroundDiagnostics.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: RULES CATALOG EXPLORER */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Presets & Quick Action Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Presets Selector */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    {language === 'en' ? 'Presets:' : 'Preset Cepat:'}
                  </span>
                  {ESLINT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activePreset === preset.id
                          ? 'bg-rose-500 text-white shadow-xs font-semibold'
                          : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
                      }`}
                      title={language === 'en' ? preset.descriptionEn : preset.descriptionId}
                    >
                      {language === 'en' ? preset.name : preset.nameId}
                    </button>
                  ))}
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <button
                    onClick={() => setBatchSeverity('error')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    {language === 'en' ? 'Set All Visible to Error' : 'Semua Jadi Error'}
                  </button>
                  <button
                    onClick={() => setBatchSeverity('warn')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    {language === 'en' ? 'Set All to Warn' : 'Semua Jadi Warn'}
                  </button>
                  <button
                    onClick={() => setBatchSeverity('off')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-300 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {language === 'en' ? 'Turn Visible Off' : 'Matikan Yang Tampil'}
                  </button>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="lg:col-span-6 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'Search rule by name (e.g. eqeqeq, no-unused-vars, quotes)...'
                        : 'Cari aturan berdasarkan nama (contoh: eqeqeq, no-var, quotes)...'
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 transition-shadow"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="lg:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-xs font-medium text-stone-400 dark:text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Status:
                  </span>
                  {[
                    { id: 'all', label: language === 'en' ? 'All' : 'Semua' },
                    { id: 'active', label: language === 'en' ? 'Active' : 'Aktif' },
                    { id: 'error', label: 'Error' },
                    { id: 'warn', label: 'Warn' },
                    { id: 'recommended', label: '⭐ Recommended' },
                    { id: 'fixable', label: '🔧 Fixable' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterSeverity(filter.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        filterSeverity === filter.id
                          ? 'bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                          : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-rose-500 text-white shadow-xs font-semibold'
                      : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-300 border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {language === 'en' ? 'All Categories' : 'Semua Kategori'} ({ESLINT_RULES.length})
                </button>
                {ESLINT_CATEGORIES.map((cat) => {
                  const count = ESLINT_RULES.filter((r) => r.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-rose-500 text-white shadow-xs font-semibold'
                          : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-300 border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {language === 'en' ? cat.labelEn : cat.labelId} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction Banner about Hover Preview */}
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  <strong>{language === 'en' ? 'Interactive Hover Tip:' : 'Tip Interaktif Hover:'}</strong>{' '}
                  {language === 'en'
                    ? 'Hover your mouse over any rule card below to instantly view code examples of the error (incorrect) vs fix (correct). Click any card for full details.'
                    : 'Arahkan kursor Anda ke kartu aturan manapun di bawah untuk melihat contoh kode yang memicu error (salah) vs solusi perbaikan (benar). Klik kartu untuk detail lengkap.'}
                </span>
              </div>
              <span className="text-[11px] font-mono uppercase bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 shrink-0 hidden sm:inline-block">
                Hover Preview Ready
              </span>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRules.map((rule) => {
                const currentSeverity = ruleStates[rule.name]?.severity || 'off';
                const hasCustomOptions = ruleStates[rule.name]?.options !== undefined;

                return (
                  <div
                    key={rule.name}
                    onClick={() => setInspectedRule(rule)}
                    className={`group relative bg-white dark:bg-zinc-900 border rounded-xl p-5 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-rose-400 dark:hover:border-rose-500/60 flex flex-col justify-between ${
                      currentSeverity === 'error'
                        ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
                        : currentSeverity === 'warn'
                        ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'
                        : 'border-stone-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges & Category */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {rule.recommended && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              title="Recommended by ESLint Team"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Recommended
                            </span>
                          )}
                          {rule.fixable && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                              title="Automatically fixable by ESLint --fix"
                            >
                              <Wrench className="w-3 h-3" />
                              Fixable
                            </span>
                          )}
                          {rule.hasOptions && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700"
                              title="Rule supports customizable options"
                            >
                              <Settings2 className="w-3 h-3" />
                              Options
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-medium text-stone-400 dark:text-zinc-500 capitalize">
                          {rule.category.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Rule Name with Hover Trigger specifically on the text name */}
                      <div>
                        <h3 className="font-mono text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center justify-between">
                          <span
                            onMouseEnter={(e) => handleMouseEnterCard(rule, e)}
                            onMouseLeave={handleMouseLeaveCard}
                            className="inline-block py-0.5 text-stone-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 cursor-help underline decoration-dotted decoration-stone-400 dark:decoration-zinc-600 hover:decoration-rose-500 underline-offset-4 transition-colors"
                            title={language === 'en' ? 'Hover to see error example' : 'Arahkan kursor untuk melihat contoh error'}
                          >
                            {rule.name}
                          </span>
                          <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 text-stone-400 transition-opacity" />
                        </h3>
                        <p className="mt-1 text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {language === 'en' ? rule.descriptionEn : rule.descriptionId}
                        </p>
                      </div>

                      {/* Quick Code Preview Teaser */}
                      <div className="p-2.5 rounded-lg bg-stone-900 dark:bg-black text-stone-300 font-mono text-[11px] overflow-hidden relative border border-stone-800">
                        <div className="text-rose-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {language === 'en' ? 'Trigger Example' : 'Contoh Salah'}:
                        </div>
                        <div className="text-stone-300 truncate opacity-90">
                          {rule.incorrectExample.split('\n')[1] || rule.incorrectExample.split('\n')[0]}
                        </div>
                        <div className="absolute right-2 bottom-1.5 text-[9px] text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded">
                          hover name for popover
                        </div>
                      </div>
                    </div>

                    {/* Rule Severity Controller */}
                    <div
                      className="mt-4 pt-3 border-t border-stone-200/80 dark:border-zinc-800 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700">
                        <button
                          onClick={() => setRuleSeverity(rule.name, 'off')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            currentSeverity === 'off'
                              ? 'bg-stone-300 dark:bg-zinc-600 text-stone-900 dark:text-zinc-100 shadow-xs'
                              : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          Off
                        </button>
                        <button
                          onClick={() => setRuleSeverity(rule.name, 'warn')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            currentSeverity === 'warn'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-stone-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400'
                          }`}
                        >
                          Warn
                        </button>
                        <button
                          onClick={() => setRuleSeverity(rule.name, 'error')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            currentSeverity === 'error'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-stone-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400'
                          }`}
                        >
                          Error
                        </button>
                      </div>

                      {rule.hasOptions && (
                        <button
                          onClick={() => setEditingOptionsRule(rule)}
                          className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                            hasCustomOptions
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                              : 'bg-stone-100 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 hover:bg-stone-200'
                          }`}
                          title="Configure Rule Options"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRules.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-8 space-y-3">
                <Search className="w-8 h-8 mx-auto text-stone-400 dark:text-zinc-500" />
                <h3 className="text-base font-semibold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'No rules matching your filter' : 'Tidak ada aturan yang sesuai'}
                </h3>
                <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {language === 'en'
                    ? 'Try clearing your search query or selecting "All Categories".'
                    : 'Coba bersihkan kata kunci pencarian atau pilih kategori Semua.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setFilterSeverity('all');
                  }}
                  className="px-4 py-2 bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold"
                >
                  {language === 'en' ? 'Reset Filters' : 'Reset Filter'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GENERATED CONFIG CODE & EXPORT */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls & Settings */}
            <div className="lg:col-span-4 space-y-6">
              {/* Format Switcher */}
              <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-rose-500" />
                  {language === 'en' ? 'Configuration Format' : 'Format Konfigurasi'}
                </h3>

                <div className="space-y-2">
                  {[
                    { id: 'flat-js', name: 'eslint.config.js (ESLint 9+ Flat)', desc: 'Modern ECMAScript Standard' },
                    { id: 'flat-ts', name: 'eslint.config.ts (TypeScript Flat)', desc: 'Native TypeScript Config' },
                    { id: 'legacy-json', name: '.eslintrc.json (Legacy)', desc: 'Standard JSON Config' },
                    { id: 'legacy-js', name: '.eslintrc.js (CommonJS)', desc: 'module.exports style' },
                    { id: 'package-json', name: 'package.json "eslintConfig"', desc: 'Embedded inside package.json' },
                    { id: 'cli', name: 'CLI Command Flag', desc: 'npx eslint --rule ...' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id as ConfigFormat)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        format === fmt.id
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                          : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/60 text-stone-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="font-mono text-xs sm:text-sm">{fmt.name}</div>
                      <div className="text-[11px] text-stone-500 dark:text-zinc-400 font-sans mt-0.5">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plugins & Environment Options */}
              <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-500" />
                  {language === 'en' ? 'Integrations & Environments' : 'Integrasi & Lingkungan'}
                </h3>

                <div className="space-y-3 text-sm">
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800">
                    <div>
                      <div className="font-medium">TypeScript Plugin</div>
                      <div className="text-xs text-stone-500">typescript-eslint support</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeTypescript}
                      onChange={(e) => setIncludeTypescript(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800">
                    <div>
                      <div className="font-medium">React & Hooks Plugin</div>
                      <div className="text-xs text-stone-500">eslint-plugin-react-hooks</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeReact}
                      onChange={(e) => setIncludeReact(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-500"
                    />
                  </label>

                  <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 space-y-2">
                    <span className="text-xs font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
                      Globals / Target Envs:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={targetEnv.browser}
                          onChange={(e) => setTargetEnv({ ...targetEnv, browser: e.target.checked })}
                          className="w-3.5 h-3.5 accent-rose-500"
                        />
                        Browser (window)
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={targetEnv.node}
                          onChange={(e) => setTargetEnv({ ...targetEnv, node: e.target.checked })}
                          className="w-3.5 h-3.5 accent-rose-500"
                        />
                        Node.js (process)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import Existing Config */}
              <div className="bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-zinc-100">
                    {language === 'en' ? 'Have an existing config?' : 'Punya file ESLint lama?'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {language === 'en' ? 'Import .eslintrc or rules object' : 'Impor konfigurasi untuk diedit'}
                  </div>
                </div>
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Import' : 'Impor'}
                </button>
              </div>
            </div>

            {/* Right: Code Viewer & Actions */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[550px]">
                {/* Code Header Bar */}
                <div className="bg-stone-950/80 px-5 py-3.5 border-b border-stone-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="ml-2 font-mono text-xs text-stone-400 font-semibold">
                      {format === 'flat-js'
                        ? 'eslint.config.js'
                        : format === 'flat-ts'
                        ? 'eslint.config.ts'
                        : format === 'legacy-json'
                        ? '.eslintrc.json'
                        : format === 'legacy-js'
                        ? '.eslintrc.js'
                        : 'package.json'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-medium text-white transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Code Content */}
                <div className="p-5 font-mono text-xs sm:text-sm text-stone-200 overflow-auto flex-1 leading-relaxed selection:bg-rose-500 selection:text-white">
                  <pre>{generatedConfig}</pre>
                </div>

                {/* Footer Tips */}
                <div className="bg-stone-950/60 px-5 py-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                  <span>✨ {stats.activeCount} rules active in this configuration</span>
                  <span className="font-mono">ESLint 9.x Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE RULE SANDBOX & PLAYGROUND */}
        {activeTab === 'playground' && (
          <div className="space-y-4">
            <VsCodePlayground
              ruleStates={ruleStates}
              language={language}
              onInspectRule={(rule) => setInspectedRule(rule)}
            />
          </div>
        )}

        {/* FLOATING HOVER PREVIEW POPOVER (Interactive Example Error) */}
        {hoveredRule && hoverPosition && (
          <div
            className="fixed z-50 w-96 -translate-x-1/2 bg-stone-950 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 p-4 space-y-3 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${Math.min(Math.max(hoverPosition.x, 200), window.innerWidth - 200)}px`,
              top: `${Math.min(hoverPosition.y, window.innerHeight - 380)}px`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
              <div className="font-mono text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {hoveredRule.name}
              </div>
              <div className="flex items-center gap-1">
                {hoveredRule.recommended && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Recommended
                  </span>
                )}
                {hoveredRule.fixable && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">
                    🔧 Fixable
                  </span>
                )}
              </div>
            </div>

            {/* Explanation */}
            <p className="text-xs text-stone-300 leading-snug">
              {language === 'en' ? hoveredRule.errorExplanationEn : hoveredRule.errorExplanationId}
            </p>

            {/* Error Code Example */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {language === 'en' ? 'Incorrect (Triggers Error):' : 'Contoh Kode Error (Salah):'}
              </div>
              <pre className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-[11px] font-mono text-rose-200 overflow-x-auto">
                {hoveredRule.incorrectExample}
              </pre>
            </div>

            {/* Valid Code Example */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'en' ? 'Correct (Valid Code):' : 'Solusi Benar (Valid):'}
              </div>
              <pre className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-[11px] font-mono text-emerald-200 overflow-x-auto">
                {hoveredRule.correctExample}
              </pre>
            </div>

            <div className="text-[10px] text-stone-500 text-center pt-1 border-t border-stone-800/80">
              💡 {language === 'en' ? 'Click card for deep inspection & docs' : 'Klik kartu untuk inspeksi lengkap & dokumentasi'}
            </div>
          </div>
        )}

        {/* FULL INSPECTION MODAL / DRAWER */}
        {inspectedRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setInspectedRule(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 bg-stone-100 dark:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Badges */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 capitalize">
                    {inspectedRule.category.replace('-', ' ')}
                  </span>
                  {inspectedRule.recommended && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ⭐ Recommended
                    </span>
                  )}
                  {inspectedRule.fixable && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      🔧 Auto-Fixable
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-zinc-100">
                  {inspectedRule.name}
                </h2>
                <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">
                  {language === 'en' ? inspectedRule.descriptionEn : inspectedRule.descriptionId}
                </p>
              </div>

              {/* Severity Control Inside Modal */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                    {language === 'en' ? 'Current Rule Severity' : 'Level Keparahan Saat Ini'}
                  </div>
                  <div className="text-sm font-semibold capitalize mt-0.5 text-stone-900 dark:text-zinc-100">
                    {ruleStates[inspectedRule.name]?.severity || 'off'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['off', 'warn', 'error'] as RuleSeverity[]).map((sev) => {
                    const active = (ruleStates[inspectedRule.name]?.severity || 'off') === sev;
                    return (
                      <button
                        key={sev}
                        onClick={() => setRuleSeverity(inspectedRule.name, sev)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          active
                            ? sev === 'error'
                              ? 'bg-rose-600 text-white'
                              : sev === 'warn'
                              ? 'bg-amber-500 text-white'
                              : 'bg-stone-600 text-white'
                            : 'bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-300'
                        }`}
                      >
                        {sev}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deep Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
                  {language === 'en' ? 'Why this rule matters:' : 'Mengapa aturan ini penting:'}
                </h4>
                <p className="text-sm text-stone-700 dark:text-zinc-300 leading-relaxed">
                  {language === 'en' ? inspectedRule.errorExplanationEn : inspectedRule.errorExplanationId}
                </p>
              </div>

              {/* Code Examples Comparison - 1 Wide Grid Layout */}
              <div className="grid grid-cols-1 gap-5">
                {/* Incorrect */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    {language === 'en' ? 'Incorrect Code (Fails ESLint)' : 'Kode Salah (Memicu Error)'}
                  </div>
                  <pre className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-950 dark:text-rose-200 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
                    {inspectedRule.incorrectExample}
                  </pre>
                </div>

                {/* Correct */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {language === 'en' ? 'Correct Code (Passes ESLint)' : 'Kode Benar (Sesuai Aturan)'}
                  </div>
                  <pre className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
                    {inspectedRule.correctExample}
                  </pre>
                </div>
              </div>

              {/* Footer Links */}
              <div className="pt-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
                <a
                  href={inspectedRule.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {language === 'en' ? 'View Official ESLint Documentation' : 'Buka Dokumentasi Resmi ESLint'}
                </a>

                <button
                  onClick={() => setInspectedRule(null)}
                  className="px-4 py-2 bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  {language === 'en' ? 'Close' : 'Tutup'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RULE OPTIONS EDITOR MODAL */}
        {editingOptionsRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setEditingOptionsRule(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 bg-stone-100 dark:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-base font-bold font-mono text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-500" />
                  {editingOptionsRule.name} Options
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'en' ? 'Configure schema arguments for this rule' : 'Atur argumen skema untuk aturan ini'}
                </p>
              </div>

              <div className="space-y-4">
                {editingOptionsRule.optionsSchema?.map((opt) => (
                  <div key={opt.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                      {opt.label}
                    </label>
                    {opt.type === 'select' && (
                      <select
                        value={ruleStates[editingOptionsRule.name]?.options || opt.default}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRuleStates((prev) => ({
                            ...prev,
                            [editingOptionsRule.name]: {
                              severity: prev[editingOptionsRule.name]?.severity || 'error',
                              options: val,
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-rose-500"
                      >
                        {opt.options?.map((o) => (
                          <option key={String(o.value)} value={String(o.value)}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {opt.type === 'boolean' && (
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(ruleStates[editingOptionsRule.name]?.options ?? opt.default)}
                          onChange={(e) => {
                            setRuleStates((prev) => ({
                              ...prev,
                              [editingOptionsRule.name]: {
                                severity: prev[editingOptionsRule.name]?.severity || 'error',
                                options: e.target.checked,
                              },
                            }));
                          }}
                          className="w-4 h-4 text-rose-600 rounded accent-rose-500"
                        />
                        <span>Enable {opt.name}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  onClick={() => setEditingOptionsRule(null)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500"
                >
                  {language === 'en' ? 'Done' : 'Selesai'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMPORT CONFIG MODAL */}
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setImportModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 bg-stone-100 dark:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-rose-500" />
                  {language === 'en' ? 'Import ESLint Configuration' : 'Impor Konfigurasi ESLint'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'en'
                    ? 'Paste your existing .eslintrc JSON or rules dictionary below to populate the editor.'
                    : 'Tempel JSON .eslintrc atau objek rules Anda di bawah ini untuk memuat aturan ke generator.'}
                </p>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`{\n  "rules": {\n    "no-unused-vars": "error",\n    "eqeqeq": ["error", "always"],\n    "quotes": ["warn", "single"]\n  }\n}`}
                rows={8}
                className="w-full p-3 bg-stone-950 font-mono text-xs text-stone-100 rounded-xl border border-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />

              {importError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  {importError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
                <button
                  onClick={handleImportConfig}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                >
                  {language === 'en' ? 'Parse & Load Rules' : 'Proses & Muat Aturan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
