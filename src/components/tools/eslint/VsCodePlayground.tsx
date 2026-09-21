import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  EslintRuleDefinition,
  RuleSeverity,
  ESLINT_RULES,
} from '../../../data/eslintRulesData';
import {
  Play,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Code2,
  Sparkles,
  FileCode,
  FolderTree,
  Search,
  Settings,
  Terminal,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  ExternalLink,
  Layers,
  Bug,
} from 'lucide-react';

interface VsCodePlaygroundProps {
  ruleStates: Record<string, { severity: RuleSeverity; options?: any }>;
  language: string;
  onInspectRule: (rule: EslintRuleDefinition) => void;
}

interface CompletionItem {
  label: string;
  kind: 'snippet' | 'keyword' | 'rule' | 'directive';
  detail: string;
  insertText: string;
  documentation: string;
}

const SAMPLE_SNIPPETS = [
  {
    id: 'violations',
    name: 'Common ESLint Violations',
    nameId: 'Contoh Pelanggaran Umum',
    code: `// 🧪 Interactive ESLint Sandbox
// Edit kode di bawah ini untuk melihat diagnostik dan auto-fix seperti di VS Code!

var appTitle = "ESLint Studio v9"; // Trigger 'no-var' & 'quotes'
let unusedCounter = 100; // Trigger 'no-unused-vars'

function verifyUser(user) {
  if (user.role = 'admin') { // Trigger 'no-cond-assign'
    console.log("Welcome Super Admin: " + user.name); // Trigger 'no-console' & 'prefer-template'
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
`,
  },
  {
    id: 'react-hooks',
    name: 'React Component & Hooks',
    nameId: 'Komponen React & Hooks',
    code: `import React, { useState, useEffect } from 'react';

export function UserDashboard({ userId, isVisible }) {
  const [userData, setUserData] = useState(null);

  // Trigger 'react-hooks/rules-of-hooks' jika di dalam if
  if (!isVisible) {
    useEffect(() => {
      console.log('Rendering hidden dashboard');
    }, []);
  }

  // Trigger 'react-hooks/exhaustive-deps' jika userId hilang
  useEffect(() => {
    fetch('/api/user/' + userId)
      .then(res => res.json())
      .then(data => setUserData(data));
  }, []); // Lupa dependensi 'userId'!

  return (
    <div>
      <h1>Don't forget your profile</h1>
      <a href="https://example.com" target="_blank">External Link</a>
    </div>
  );
}
`,
  },
  {
    id: 'clean-code',
    name: 'Clean Code (Zero Violations)',
    nameId: 'Kode Bersih (Lolos ESLint)',
    code: `// ✨ Kode bersih yang mematuhi semua aturan ESLint
export const calculateDiscountedPrice = (price, discountPercent = 0) => {
  if (price <= 0) {
    return 0;
  }
  
  const discountAmount = price * (discountPercent / 100);
  const finalPrice = Math.max(0, price - discountAmount);
  
  return Number(finalPrice.toFixed(2));
};

const product = {
  id: 'PROD-101',
  name: 'Mechanical Keyboard',
  price: 1500000,
};

const result = calculateDiscountedPrice(product.price, 15);
`,
  },
];

const COMPLETION_DATABASE: CompletionItem[] = [
  {
    label: '/* eslint-disable no-console */',
    kind: 'directive',
    detail: 'ESLint File Directive',
    insertText: '/* eslint-disable no-console */\n',
    documentation: 'Disable "no-console" rule for the entire file.',
  },
  {
    label: '// eslint-disable-next-line',
    kind: 'directive',
    detail: 'ESLint Line Directive',
    insertText: '// eslint-disable-next-line ',
    documentation: 'Disable ESLint rule on the immediate next line.',
  },
  {
    label: 'console.log',
    kind: 'snippet',
    detail: 'Log to stdout',
    insertText: 'console.log($1);',
    documentation: 'Print messages and objects to browser or node console.',
  },
  {
    label: 'const',
    kind: 'keyword',
    detail: 'Constant Declaration',
    insertText: 'const name = value;',
    documentation: 'Block-scoped immutable variable binding.',
  },
  {
    label: 'let',
    kind: 'keyword',
    detail: 'Variable Declaration',
    insertText: 'let count = 0;',
    documentation: 'Block-scoped reassignable variable binding.',
  },
  {
    label: 'function',
    kind: 'keyword',
    detail: 'Function Declaration',
    insertText: 'function doAction() {\n  \n}',
    documentation: 'Standard JavaScript function declaration.',
  },
  {
    label: 'async function',
    kind: 'snippet',
    detail: 'Asynchronous Function',
    insertText: 'async function fetchData() {\n  const res = await fetch(url);\n  return res.json();\n}',
    documentation: 'Function returning a Promise with await support.',
  },
  {
    label: 'try...catch',
    kind: 'snippet',
    detail: 'Error Handling Block',
    insertText: 'try {\n  \n} catch (error) {\n  console.error(error);\n}',
    documentation: 'Safe execution with error boundary catching.',
  },
  {
    label: 'if...else',
    kind: 'snippet',
    detail: 'Conditional Branch',
    insertText: 'if (condition) {\n  \n} else {\n  \n}',
    documentation: 'Standard if-else block with braces.',
  },
  {
    label: 'useEffect',
    kind: 'snippet',
    detail: 'React Hook',
    insertText: 'useEffect(() => {\n  \n  return () => {};\n}, []);',
    documentation: 'React side effect hook with cleanup and dependency array.',
  },
  {
    label: 'useState',
    kind: 'snippet',
    detail: 'React State Hook',
    insertText: 'const [state, setState] = useState(initialValue);',
    documentation: 'Declare a reactive local state variable in React.',
  },
];

export const VsCodePlayground: React.FC<VsCodePlaygroundProps> = ({
  ruleStates,
  language,
  onInspectRule,
}) => {
  const [code, setCode] = useState<string>(SAMPLE_SNIPPETS[0].code);
  const [activeBottomTab, setActiveBottomTab] = useState<'problems' | 'output' | 'rules'>('problems');
  const [selectedSnippet, setSelectedSnippet] = useState('violations');
  const [activeLine, setActiveLine] = useState<number>(1);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [hoveredIssue, setHoveredIssue] = useState<{
    line: number;
    rule: EslintRuleDefinition;
    message: string;
    quickFixText?: string;
  } | null>(null);
  const [hoverWidgetPos, setHoverWidgetPos] = useState<{ top: number; left: number } | null>(null);

  // IntelliSense autocompletion state
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionFilter, setCompletionFilter] = useState('');
  const [selectedCompletionIndex, setSelectedCompletionIndex] = useState(0);

  // Copy code feedback
  const [copied, setCopied] = useState(false);
  const [fixFlash, setFixFlash] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeLines = useMemo(() => code.split('\n'), [code]);

  // Evaluate Diagnostics based on current ruleStates
  const diagnostics = useMemo(() => {
    const issues: {
      line: number;
      col: number;
      rule: EslintRuleDefinition;
      severity: RuleSeverity;
      message: string;
      codeSnippet: string;
      quickFixText?: string;
    }[] = [];

    codeLines.forEach((lineText, idx) => {
      const lineNum = idx + 1;

      // 1. no-var
      if (ruleStates['no-var']?.severity && ruleStates['no-var'].severity !== 'off' && /\bvar\s+[a-zA-Z_$]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-var');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('var') + 1,
            rule: ruleDef,
            severity: ruleStates['no-var'].severity,
            message: 'Unexpected var, use let or const instead (no-var)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Replace "var" with "const"',
          });
        }
      }

      // 2. quotes
      if (ruleStates['quotes']?.severity && ruleStates['quotes'].severity !== 'off' && /"([^"\\]|\\.)*"/.test(lineText) && !lineText.trim().startsWith('//')) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'quotes');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('"') + 1,
            rule: ruleDef,
            severity: ruleStates['quotes'].severity,
            message: 'Strings must use singlequote (quotes)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Convert double quotes to single quotes',
          });
        }
      }

      // 3. no-cond-assign
      if (ruleStates['no-cond-assign']?.severity && ruleStates['no-cond-assign'].severity !== 'off' && /if\s*\([^=]*=[^=]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-cond-assign');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('=') + 1,
            rule: ruleDef,
            severity: ruleStates['no-cond-assign'].severity,
            message: 'Expected a conditional expression and instead saw an assignment (no-cond-assign)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Replace "=" with "==="',
          });
        }
      }

      // 4. eqeqeq
      if (ruleStates['eqeqeq']?.severity && ruleStates['eqeqeq'].severity !== 'off' && /[^\!=]==[^\!=]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'eqeqeq');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('==') + 1,
            rule: ruleDef,
            severity: ruleStates['eqeqeq'].severity,
            message: 'Expected "===" and instead saw "==" (eqeqeq)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Replace "==" with "==="',
          });
        }
      }

      // 5. no-console
      if (ruleStates['no-console']?.severity && ruleStates['no-console'].severity !== 'off' && /console\.log\(/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-console');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('console') + 1,
            rule: ruleDef,
            severity: ruleStates['no-console'].severity,
            message: 'Unexpected console statement (no-console)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Remove console.log or add eslint-disable',
          });
        }
      }

      // 6. no-debugger
      if (ruleStates['no-debugger']?.severity && ruleStates['no-debugger'].severity !== 'off' && /\bdebugger;?/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-debugger');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('debugger') + 1,
            rule: ruleDef,
            severity: ruleStates['no-debugger'].severity,
            message: 'Unexpected "debugger" statement in production (no-debugger)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Remove debugger statement',
          });
        }
      }

      // 7. prefer-template
      if (ruleStates['prefer-template']?.severity && ruleStates['prefer-template'].severity !== 'off' && /['"].*\s*\+\s*[a-zA-Z0-9_.]/.test(lineText) && !lineText.trim().startsWith('//')) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'prefer-template');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('+') + 1,
            rule: ruleDef,
            severity: ruleStates['prefer-template'].severity,
            message: 'Unexpected string concatenation, use template literals instead (prefer-template)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Convert concatenation to template literal (`${...}`)',
          });
        }
      }

      // 8. no-dupe-keys
      if (ruleStates['no-dupe-keys']?.severity && ruleStates['no-dupe-keys'].severity !== 'off' && /theme\s*:\s*['"]light['"]/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-dupe-keys');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('theme') + 1,
            rule: ruleDef,
            severity: ruleStates['no-dupe-keys'].severity,
            message: 'Duplicate key "theme" in object literal (no-dupe-keys)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Remove duplicate object property',
          });
        }
      }

      // 9. no-useless-return
      if (ruleStates['no-useless-return']?.severity && ruleStates['no-useless-return'].severity !== 'off' && /return;/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'no-useless-return');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('return') + 1,
            rule: ruleDef,
            severity: ruleStates['no-useless-return'].severity,
            message: 'Unnecessary return statement at end of function (no-useless-return)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Remove redundant return;',
          });
        }
      }

      // 10. react-hooks/rules-of-hooks
      if (ruleStates['react-hooks/rules-of-hooks']?.severity && ruleStates['react-hooks/rules-of-hooks'].severity !== 'off' && /if\s*\(.*isVisible.*\)/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'react-hooks/rules-of-hooks');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: 1,
            rule: ruleDef,
            severity: ruleStates['react-hooks/rules-of-hooks'].severity,
            message: 'React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render. (react-hooks/rules-of-hooks)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Move useEffect to top-level of component',
          });
        }
      }

      // 11. react/no-unescaped-entities
      if (ruleStates['react/no-unescaped-entities']?.severity && ruleStates['react/no-unescaped-entities'].severity !== 'off' && /Don't/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'react/no-unescaped-entities');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf("Don't") + 1,
            rule: ruleDef,
            severity: ruleStates['react/no-unescaped-entities'].severity,
            message: '`\'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`. (react/no-unescaped-entities)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Replace apostrophe with &apos;',
          });
        }
      }

      // 12. react/jsx-no-target-blank
      if (ruleStates['react/jsx-no-target-blank']?.severity && ruleStates['react/jsx-no-target-blank'].severity !== 'off' && /target="_blank"/.test(lineText) && !/rel=/.test(lineText)) {
        const ruleDef = ESLINT_RULES.find((r) => r.name === 'react/jsx-no-target-blank');
        if (ruleDef) {
          issues.push({
            line: lineNum,
            col: lineText.indexOf('target') + 1,
            rule: ruleDef,
            severity: ruleStates['react/jsx-no-target-blank'].severity,
            message: 'Using target="_blank" without rel="noreferrer" is a security risk (react/jsx-no-target-blank)',
            codeSnippet: lineText.trim(),
            quickFixText: 'Add rel="noopener noreferrer"',
          });
        }
      }
    });

    return issues;
  }, [codeLines, ruleStates]);

  const errorCount = useMemo(() => diagnostics.filter((d) => d.severity === 'error').length, [diagnostics]);
  const warnCount = useMemo(() => diagnostics.filter((d) => d.severity === 'warn').length, [diagnostics]);

  // Auto-Fix implementation for entire file
  const handleAutoFixAll = () => {
    let fixed = code;
    // Replace var with const
    fixed = fixed.replace(/\bvar\s+/g, 'const ');
    // Replace double quotes with single quotes
    fixed = fixed.replace(/"([^"\\]*)"/g, "'$1'");
    // Replace = in if with ===
    fixed = fixed.replace(/if\s*\(([^=]*)=\s*([^=][^)]*)\)/g, 'if ($1===$2)');
    // Replace == with ===
    fixed = fixed.replace(/([^\!=])==([^\!=])/g, '$1===$2');
    // Remove debugger
    fixed = fixed.replace(/\bdebugger;\s*\n?/g, '');
    // Remove redundant return
    fixed = fixed.replace(/\s*return;\s*\n/g, '\n');
    // Remove duplicate theme: 'light'
    fixed = fixed.replace(/\s*theme:\s*'light',\s*\n?/g, '\n');
    // Fix target blank
    fixed = fixed.replace(/target="_blank"/g, 'target="_blank" rel="noopener noreferrer"');
    // Fix unescaped apostrophe
    fixed = fixed.replace(/Don't/g, 'Don&apos;t');
    // Fix concatenation to template literal
    fixed = fixed.replace(/'Welcome Super Admin: '\s*\+\s*user\.name/g, '`Welcome Super Admin: ${user.name}`');

    setCode(fixed);
    setFixFlash(true);
    setTimeout(() => setFixFlash(false), 800);
  };

  // Quick fix for single issue
  const handleQuickFixLine = (issue: typeof diagnostics[0]) => {
    const lines = [...codeLines];
    const targetIdx = issue.line - 1;
    let targetLine = lines[targetIdx];

    if (issue.rule.name === 'no-var') {
      targetLine = targetLine.replace(/\bvar\s+/, 'const ');
    } else if (issue.rule.name === 'quotes') {
      targetLine = targetLine.replace(/"([^"\\]*)"/g, "'$1'");
    } else if (issue.rule.name === 'no-cond-assign') {
      targetLine = targetLine.replace(/=\s*([^=])/, '=== $1');
    } else if (issue.rule.name === 'eqeqeq') {
      targetLine = targetLine.replace(/==/, '===');
    } else if (issue.rule.name === 'no-debugger') {
      targetLine = targetLine.replace(/\bdebugger;?/, '// debugger removed');
    } else if (issue.rule.name === 'no-useless-return') {
      targetLine = targetLine.replace(/return;/, '');
    } else if (issue.rule.name === 'react/no-unescaped-entities') {
      targetLine = targetLine.replace(/Don't/, 'Don&apos;t');
    } else if (issue.rule.name === 'react/jsx-no-target-blank') {
      targetLine = targetLine.replace(/target="_blank"/, 'target="_blank" rel="noopener noreferrer"');
    } else if (issue.rule.name === 'prefer-template') {
      targetLine = targetLine.replace(/"([^"]*)"\s*\+\s*([a-zA-Z0-9_.]+)/, '`$1${\$2}`');
    }

    lines[targetIdx] = targetLine;
    setCode(lines.join('\n'));
    setHoveredIssue(null);
  };

  // Handle Textarea change & tracking cursor
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    updateCursorPos(e.target);
  };

  const updateCursorPos = (target: HTMLTextAreaElement) => {
    const textBeforeCursor = target.value.substring(0, target.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });
    setActiveLine(currentLine);
  };

  // Filter completions based on input
  const filteredCompletions = useMemo(() => {
    if (!completionFilter) return COMPLETION_DATABASE;
    return COMPLETION_DATABASE.filter(
      (c) =>
        c.label.toLowerCase().includes(completionFilter.toLowerCase()) ||
        c.detail.toLowerCase().includes(completionFilter.toLowerCase())
    );
  }, [completionFilter]);

  const insertCompletion = (item: CompletionItem) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = code.substring(0, start) + item.insertText + code.substring(end);
    setCode(newText);
    setShowCompletion(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = start + item.insertText.length;
        textareaRef.current.selectionEnd = start + item.insertText.length;
      }
    }, 50);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top VS Code Toolbar Header */}
      <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* VS Code Window Titlebar */}
        <div className="bg-[#252526] px-4 py-2.5 border-b border-[#333333] flex items-center justify-between gap-3 select-none">
          {/* Mac style window buttons */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
            <span className="ml-3 text-xs font-mono text-stone-300 font-medium hidden sm:inline-flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              Visual Studio Code • ESLint Live Sandbox
            </span>
          </div>

          {/* Snippet Preset Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-mono hidden md:inline">Sample:</span>
            <select
              value={selectedSnippet}
              onChange={(e) => {
                const target = SAMPLE_SNIPPETS.find((s) => s.id === e.target.value);
                if (target) {
                  setSelectedSnippet(target.id);
                  setCode(target.code);
                }
              }}
              className="bg-[#333333] text-stone-200 text-xs px-2.5 py-1 rounded-md border border-[#444444] focus:outline-hidden focus:ring-1 focus:ring-sky-500 font-sans"
            >
              {SAMPLE_SNIPPETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {language === 'en' ? s.name : s.nameId}
                </option>
              ))}
            </select>

            {/* Auto Fix Button */}
            <button
              onClick={handleAutoFixAll}
              className={`px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                fixFlash ? 'ring-2 ring-white scale-105 bg-emerald-400' : ''
              }`}
              title="Execute ESLint --fix on code"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'ESLint --fix' : 'Perbaiki Otomatis (--fix)'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="p-1.5 bg-[#333333] hover:bg-[#444444] text-stone-300 rounded-md text-xs transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* VS Code Main Workspace (Activity Bar + Editor + Gutter) */}
        <div className="flex min-h-[460px] bg-[#1e1e1e] relative">
          {/* Left Activity Bar (Dark Thin Bar) */}
          <div className="w-12 bg-[#252526] border-r border-[#333333] hidden sm:flex flex-col items-center py-3 gap-5 text-stone-400 select-none shrink-0">
            <div className="p-1.5 text-stone-100 border-l-2 border-sky-500 cursor-pointer" title="Explorer">
              <FolderTree className="w-5 h-5" />
            </div>
            <div className="p-1.5 hover:text-stone-200 cursor-pointer" title="Search">
              <Search className="w-5 h-5" />
            </div>
            <div className="p-1.5 hover:text-stone-200 cursor-pointer" title="Linter & Rules">
              <Sparkles className="w-5 h-5 text-rose-400" />
            </div>
            <div className="p-1.5 hover:text-stone-200 cursor-pointer" title="Debugging">
              <Bug className="w-5 h-5" />
            </div>
            <div className="mt-auto p-1.5 hover:text-stone-200 cursor-pointer" title="Settings">
              <Settings className="w-5 h-5" />
            </div>
          </div>

          {/* Main Editor Center Container */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Editor Tab Bar */}
            <div className="bg-[#252526] flex items-center border-b border-[#333333] overflow-x-auto text-xs">
              <div className="px-4 py-2 bg-[#1e1e1e] text-stone-200 font-mono flex items-center gap-2 border-t-2 border-sky-500 border-r border-[#333333] cursor-pointer shrink-0">
                <span className="text-amber-400 font-bold">JS</span>
                <span>sandbox.js</span>
                {diagnostics.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" title={`${diagnostics.length} ESLint problems`} />
                )}
              </div>
              <div className="px-4 py-2 text-stone-400 font-mono hover:bg-[#2a2d2e] hover:text-stone-200 flex items-center gap-2 border-r border-[#333333] cursor-pointer shrink-0">
                <span className="text-rose-400 font-bold">{}</span>
                <span>eslint.config.js</span>
              </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-[#1e1e1e] px-4 py-1 border-b border-[#2d2d2d] flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
              <span>src</span>
              <ChevronRight className="w-3 h-3 text-stone-600" />
              <span>playground</span>
              <ChevronRight className="w-3 h-3 text-stone-600" />
              <span className="text-stone-200">sandbox.js</span>
              {diagnostics.length > 0 && (
                <span className="ml-auto text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {diagnostics.length} problems detected
                </span>
              )}
            </div>

            {/* Editor Code Area with Line Numbers & Diagnostic Glyphs */}
            <div className="relative flex flex-1 overflow-hidden font-mono text-xs sm:text-sm leading-6">
              {/* Gutter (Line Numbers + Error Indicators) */}
              <div className="w-12 sm:w-14 bg-[#1e1e1e] text-[#858585] py-3 select-none text-right pr-3 border-r border-[#2d2d2d] flex flex-col font-mono text-xs">
                {codeLines.map((_, idx) => {
                  const lineNum = idx + 1;
                  const lineIssues = diagnostics.filter((d) => d.line === lineNum);
                  const hasError = lineIssues.some((d) => d.severity === 'error');
                  const hasWarn = lineIssues.some((d) => d.severity === 'warn');

                  return (
                    <div
                      key={lineNum}
                      className={`h-6 flex items-center justify-end gap-1.5 relative ${
                        activeLine === lineNum ? 'text-stone-100 font-bold' : ''
                      }`}
                    >
                      {hasError ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0 cursor-pointer"
                          title={lineIssues[0]?.message}
                          onClick={() => {
                            setHoveredIssue(lineIssues[0]);
                            setHoverWidgetPos({ top: (lineNum - 1) * 24 + 30, left: 60 });
                          }}
                        />
                      ) : hasWarn ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shrink-0 cursor-pointer"
                          title={lineIssues[0]?.message}
                        />
                      ) : null}
                      <span className={hasError ? 'text-rose-400 font-bold' : hasWarn ? 'text-amber-400' : ''}>
                        {lineNum}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Editable Text Area + Error Squiggle Overlays */}
              <div className="relative flex-1 bg-[#1e1e1e] overflow-auto">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleTextChange}
                  onClick={(e) => updateCursorPos(e.currentTarget)}
                  onKeyUp={(e) => {
                    updateCursorPos(e.currentTarget);
                    if (e.key === ' ' && e.ctrlKey) {
                      setShowCompletion(true);
                    }
                  }}
                  spellCheck={false}
                  className="w-full h-full p-3 bg-transparent text-stone-100 font-mono text-xs sm:text-sm focus:outline-hidden resize-none leading-6 whitespace-pre tab-size-2 selection:bg-[#264f78]"
                  style={{ minHeight: `${Math.max(codeLines.length * 24 + 60, 360)}px` }}
                />

                {/* Inline Hover Diagnostic Tooltip (VS Code Style) */}
                {hoveredIssue && hoverWidgetPos && (
                  <div
                    className="absolute z-30 bg-[#252526] text-stone-100 border border-[#454545] rounded-lg shadow-2xl p-3 space-y-2.5 max-w-md animate-in fade-in"
                    style={{
                      top: `${Math.min(hoverWidgetPos.top, 280)}px`,
                      left: '20px',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#333333] pb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono">
                        <XCircle className="w-3.5 h-3.5" />
                        [ESLint] {hoveredIssue.rule.name}
                      </div>
                      <button
                        onClick={() => setHoveredIssue(null)}
                        className="text-stone-400 hover:text-stone-200 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-stone-200 leading-relaxed font-sans">
                      {hoveredIssue.message}
                    </p>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#333333]">
                      {hoveredIssue.quickFixText && (
                        <button
                          onClick={() => handleQuickFixLine(hoveredIssue as any)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>Quick Fix: {hoveredIssue.quickFixText}</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onInspectRule(hoveredIssue.rule);
                          setHoveredIssue(null);
                        }}
                        className="px-2 py-1 bg-[#333333] hover:bg-[#444444] text-stone-300 rounded text-[11px] font-sans flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Rule Docs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* IntelliSense Completion Bar / Trigger */}
        <div className="bg-[#252526] px-3 py-1.5 border-t border-[#333333] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompletion(!showCompletion)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                showCompletion
                  ? 'bg-sky-500 text-white'
                  : 'bg-[#333333] hover:bg-[#444444] text-stone-200'
              }`}
            >
              <Lightbulb className="w-3 h-3 text-amber-300" />
              <span>IntelliSense Autocomplete</span>
            </button>
            <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
              (Press Ctrl+Space or click button above)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-rose-400 flex items-center gap-1 font-bold">
              <XCircle className="w-3 h-3" /> {errorCount} errors
            </span>
            <span className="text-amber-400 flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3 h-3" /> {warnCount} warnings
            </span>
          </div>
        </div>

        {/* IntelliSense Dropdown Menu (if opened) */}
        {showCompletion && (
          <div className="bg-[#252526] border-t border-[#333333] p-3 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-stone-300 font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Available Code Snippets & ESLint Directives
              </span>
              <button
                onClick={() => setShowCompletion(false)}
                className="text-stone-400 hover:text-stone-200 text-xs px-2"
              >
                Close (ESC)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pt-1">
              {filteredCompletions.map((item, idx) => (
                <div
                  key={item.label}
                  onClick={() => insertCompletion(item)}
                  className="p-2 bg-[#1e1e1e] hover:bg-[#333333] rounded-lg border border-[#333333] cursor-pointer text-left space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-sky-300 font-semibold truncate">{item.label}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#333333] text-stone-400 uppercase font-sans">
                      {item.kind}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 font-sans truncate">{item.documentation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VS Code Bottom Panel (Problems / Output / Rules) */}
        <div className="bg-[#1e1e1e] border-t border-[#333333] flex flex-col">
          {/* Panel Header Tabs */}
          <div className="bg-[#252526] px-4 flex items-center gap-4 text-xs border-b border-[#333333] select-none">
            <button
              onClick={() => setActiveBottomTab('problems')}
              className={`py-2 px-1 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeBottomTab === 'problems'
                  ? 'border-sky-500 text-stone-100'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Problems</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400">
                {diagnostics.length}
              </span>
            </button>

            <button
              onClick={() => setActiveBottomTab('output')}
              className={`py-2 px-1 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeBottomTab === 'output'
                  ? 'border-sky-500 text-stone-100'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Linter Server Output</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('rules')}
              className={`py-2 px-1 font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeBottomTab === 'rules'
                  ? 'border-sky-500 text-stone-100'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Evaluator Rules</span>
            </button>
          </div>

          {/* Panel Tab Content */}
          <div className="p-3 max-h-56 overflow-y-auto font-mono text-xs text-stone-300">
            {activeBottomTab === 'problems' && (
              <div className="space-y-1.5">
                {diagnostics.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 space-y-1 font-sans">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                    <div className="text-xs font-semibold text-stone-200">
                      {language === 'en' ? 'No problems have been detected in the workspace.' : 'Tidak ada masalah ESLint yang terdeteksi.'}
                    </div>
                  </div>
                ) : (
                  diagnostics.map((diag, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setActiveLine(diag.line);
                        setHoveredIssue(diag);
                        setHoverWidgetPos({ top: (diag.line - 1) * 24 + 30, left: 60 });
                      }}
                      className="p-2 rounded bg-[#252526] hover:bg-[#2d2d2d] border border-[#333333] cursor-pointer flex items-center justify-between gap-2 group transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {diag.severity === 'error' ? (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className="text-stone-200 truncate font-sans text-xs">{diag.message}</span>
                        <span className="text-stone-500 text-[11px] font-mono shrink-0">
                          sandbox.js [{diag.line}, {diag.col}]
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickFixLine(diag);
                          }}
                          className="px-2 py-0.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Wrench className="w-3 h-3" />
                          Fix
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectRule(diag.rule);
                          }}
                          className="px-2 py-0.5 bg-[#333333] hover:bg-[#444444] text-stone-300 rounded text-[10px] font-sans"
                        >
                          Docs
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeBottomTab === 'output' && (
              <div className="space-y-1 text-stone-400 text-[11px] font-mono leading-relaxed">
                <div className="text-stone-300 font-bold">[ESLint Language Server 9.2.0] Initialized in sandbox workspace.</div>
                <div>Loaded config: eslint.config.js (Flat Config)</div>
                <div>Parser: @typescript-eslint/parser / Espree</div>
                <div className="text-emerald-400">✓ Evaluated {codeLines.length} lines of code.</div>
                <div className="text-amber-400">⚡ Diagnostics completed in 4.2ms.</div>
              </div>
            )}

            {activeBottomTab === 'rules' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {ESLINT_RULES.filter((r) => (ruleStates[r.name]?.severity || 'off') !== 'off').map((r) => (
                  <div
                    key={r.name}
                    onClick={() => onInspectRule(r)}
                    className="p-1.5 bg-[#252526] rounded border border-[#333333] hover:border-sky-500 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="text-sky-300 font-mono truncate">{r.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        ruleStates[r.name]?.severity === 'error'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {ruleStates[r.name]?.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VS Code Bottom Blue Status Bar */}
        <div className="bg-[#007acc] text-white px-3 py-1 flex items-center justify-between text-[11px] font-mono select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" /> ESLint: {diagnostics.length === 0 ? 'Passing' : `${diagnostics.length} Issues`}
            </span>
            <span>UTF-8</span>
            <span>Spaces: 2</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
            <span>JavaScript</span>
            <span className="hidden sm:inline">Flat Config (v9)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
