/**
 * Code Completion / IntelliSense Engine
 * Provides context-aware keyword, function, method, API, and snippet suggestions
 * with rich docs, type signatures, and keyboard navigation.
 */

export interface CompletionItem {
  label: string; // e.g., "console.log"
  insertText: string; // text inserted into editor
  kind: 'keyword' | 'function' | 'snippet' | 'variable' | 'property' | 'type';
  detail?: string; // short type signature or category
  doc?: string; // explanatory documentation
  cursorOffset?: number; // relative cursor position after insertion
}

export const JS_TS_COMPLETIONS: CompletionItem[] = [
  // Snippets
  {
    label: 'log',
    insertText: 'console.log();',
    kind: 'snippet',
    detail: 'console.log(...)',
    doc: 'Prints a message or value to the console',
    cursorOffset: -2,
  },
  {
    label: 'warn',
    insertText: 'console.warn();',
    kind: 'snippet',
    detail: 'console.warn(...)',
    doc: 'Prints a warning message to the console',
    cursorOffset: -2,
  },
  {
    label: 'error',
    insertText: 'console.error();',
    kind: 'snippet',
    detail: 'console.error(...)',
    doc: 'Prints an error message to the console',
    cursorOffset: -2,
  },
  {
    label: 'trycatch',
    insertText: 'try {\n  \n} catch (error) {\n  console.error(error);\n}',
    kind: 'snippet',
    detail: 'try / catch block',
    doc: 'Standard error handling block',
    cursorOffset: -35,
  },
  {
    label: 'afn (arrow function)',
    insertText: 'const  = () => {\n  \n};',
    kind: 'snippet',
    detail: 'const fn = () => {}',
    doc: 'Arrow function expression',
    cursorOffset: -18,
  },
  {
    label: 'asyncfn',
    insertText: 'async function () {\n  \n}',
    kind: 'snippet',
    detail: 'async function name() {}',
    doc: 'Asynchronous function declaration',
    cursorOffset: -8,
  },
  {
    label: 'promise',
    insertText: 'new Promise((resolve, reject) => {\n  resolve();\n});',
    kind: 'snippet',
    detail: 'new Promise(...)',
    doc: 'Creates a new Promise instance',
    cursorOffset: -7,
  },
  {
    label: 'fetch',
    insertText: 'const res = await fetch("");\nconst data = await res.json();',
    kind: 'snippet',
    detail: 'fetch async request',
    doc: 'Performs an asynchronous HTTP fetch request',
    cursorOffset: -34,
  },
  {
    label: 'useState',
    insertText: 'const [state, setState] = useState();',
    kind: 'snippet',
    detail: 'React useState hook',
    doc: 'Declares state variable in React',
    cursorOffset: -2,
  },
  {
    label: 'useEffect',
    insertText: 'useEffect(() => {\n  \n}, []);',
    kind: 'snippet',
    detail: 'React useEffect hook',
    doc: 'Runs side effects on component render/update',
    cursorOffset: -10,
  },
  {
    label: 'forof',
    insertText: 'for (const item of ) {\n  \n}',
    kind: 'snippet',
    detail: 'for (const x of iterable)',
    doc: 'Iterates through elements of an iterable',
    cursorOffset: -7,
  },

  // Common Methods & APIs
  {
    label: 'map',
    insertText: '.map((item, index) => )',
    kind: 'function',
    detail: 'Array.prototype.map()',
    doc: 'Creates a new array populated with the results of calling a provided function',
    cursorOffset: -1,
  },
  {
    label: 'filter',
    insertText: '.filter((item) => )',
    kind: 'function',
    detail: 'Array.prototype.filter()',
    doc: 'Creates a shallow copy of a portion of a given array filtered down to elements that pass the test',
    cursorOffset: -1,
  },
  {
    label: 'reduce',
    insertText: '.reduce((acc, curr) => acc + curr, 0)',
    kind: 'function',
    detail: 'Array.prototype.reduce()',
    doc: 'Executes a user-supplied reducer callback function on each element of the array',
  },
  {
    label: 'find',
    insertText: '.find((item) => )',
    kind: 'function',
    detail: 'Array.prototype.find()',
    doc: 'Returns the first element in the provided array that satisfies the testing function',
    cursorOffset: -1,
  },
  {
    label: 'forEach',
    insertText: '.forEach((item) => {\n  \n});',
    kind: 'function',
    detail: 'Array.prototype.forEach()',
    doc: 'Executes a provided function once for each array element',
    cursorOffset: -5,
  },
  {
    label: 'includes',
    insertText: '.includes()',
    kind: 'function',
    detail: 'Array.prototype.includes()',
    doc: 'Determines whether an array includes a certain value',
    cursorOffset: -1,
  },
  {
    label: 'JSON.stringify',
    insertText: 'JSON.stringify(, null, 2)',
    kind: 'function',
    detail: 'JSON.stringify(value, replacer, space)',
    doc: 'Converts a JavaScript value to a JSON string formatted with indentation',
    cursorOffset: -10,
  },
  {
    label: 'JSON.parse',
    insertText: 'JSON.parse()',
    kind: 'function',
    detail: 'JSON.parse(text)',
    doc: 'Parses a JSON string into a JavaScript value or object',
    cursorOffset: -1,
  },
  {
    label: 'Math.max',
    insertText: 'Math.max()',
    kind: 'function',
    detail: 'Math.max(...values)',
    doc: 'Returns the largest of zero or more numbers',
    cursorOffset: -1,
  },
  {
    label: 'Math.min',
    insertText: 'Math.min()',
    kind: 'function',
    detail: 'Math.min(...values)',
    doc: 'Returns the lowest-valued number passed into it',
    cursorOffset: -1,
  },
  {
    label: 'Math.floor',
    insertText: 'Math.floor()',
    kind: 'function',
    detail: 'Math.floor(x)',
    doc: 'Returns the largest integer less than or equal to a given number',
    cursorOffset: -1,
  },
  {
    label: 'Math.random',
    insertText: 'Math.random()',
    kind: 'function',
    detail: 'Math.random()',
    doc: 'Returns a floating-point, pseudo-random number between 0 and 1',
  },
  {
    label: 'Object.keys',
    insertText: 'Object.keys()',
    kind: 'function',
    detail: 'Object.keys(obj)',
    doc: 'Returns an array of a given object\'s own enumerable property names',
    cursorOffset: -1,
  },
  {
    label: 'Object.entries',
    insertText: 'Object.entries()',
    kind: 'function',
    detail: 'Object.entries(obj)',
    doc: 'Returns an array of a given object\'s own enumerable string-keyed key-value pairs',
    cursorOffset: -1,
  },
  {
    label: 'Object.values',
    insertText: 'Object.values()',
    kind: 'function',
    detail: 'Object.values(obj)',
    doc: 'Returns an array of a given object\'s own enumerable property values',
    cursorOffset: -1,
  },
  {
    label: 'setTimeout',
    insertText: 'setTimeout(() => {\n  \n}, 1000);',
    kind: 'function',
    detail: 'setTimeout(callback, delay)',
    doc: 'Sets a timer which executes a function or specified piece of code once the timer expires',
    cursorOffset: -12,
  },
  {
    label: 'setInterval',
    insertText: 'setInterval(() => {\n  \n}, 1000);',
    kind: 'function',
    detail: 'setInterval(callback, delay)',
    doc: 'Repeatedly calls a function or executes a code snippet, with a fixed time delay between each call',
    cursorOffset: -12,
  },

  // Keywords
  { label: 'const', insertText: 'const ', kind: 'keyword', detail: 'keyword', doc: 'Declares block-scoped constants' },
  { label: 'let', insertText: 'let ', kind: 'keyword', detail: 'keyword', doc: 'Declares block-scoped mutable variables' },
  { label: 'var', insertText: 'var ', kind: 'keyword', detail: 'keyword', doc: 'Declares function-scoped variable' },
  { label: 'function', insertText: 'function () {\n  \n}', kind: 'keyword', detail: 'keyword', doc: 'Declares a function', cursorOffset: -8 },
  { label: 'return', insertText: 'return ', kind: 'keyword', detail: 'keyword', doc: 'Specifies the return value of a function' },
  { label: 'async', insertText: 'async ', kind: 'keyword', detail: 'keyword', doc: 'Marks a function as asynchronous' },
  { label: 'await', insertText: 'await ', kind: 'keyword', detail: 'keyword', doc: 'Pauses execution until Promise settles' },
  { label: 'import', insertText: 'import  from "";', kind: 'keyword', detail: 'keyword', doc: 'Imports bindings exported by another module', cursorOffset: -11 },
  { label: 'export', insertText: 'export ', kind: 'keyword', detail: 'keyword', doc: 'Exports functions, objects, or values' },
  { label: 'interface', insertText: 'interface  {\n  \n}', kind: 'type', detail: 'type definition', doc: 'TypeScript interface declaration', cursorOffset: -6 },
  { label: 'type', insertText: 'type  = ;', kind: 'type', detail: 'type alias', doc: 'TypeScript type alias', cursorOffset: -3 },
  { label: 'if', insertText: 'if () {\n  \n}', kind: 'keyword', detail: 'keyword', doc: 'Conditional statement', cursorOffset: -6 },
  { label: 'else', insertText: 'else {\n  \n}', kind: 'keyword', detail: 'keyword', doc: 'Else statement', cursorOffset: -2 },
  { label: 'switch', insertText: 'switch () {\n  case :\n    break;\n  default:\n    break;\n}', kind: 'keyword', detail: 'keyword', doc: 'Switch conditional', cursorOffset: -34 },
];

export const PYTHON_COMPLETIONS: CompletionItem[] = [
  { label: 'def', insertText: 'def (): \n    pass', kind: 'keyword', detail: 'function def', doc: 'Defines a Python function', cursorOffset: -12 },
  { label: 'class', insertText: 'class :\n    def __init__(self):\n        pass', kind: 'keyword', detail: 'class definition', doc: 'Defines a Python class', cursorOffset: -37 },
  { label: 'print', insertText: 'print()', kind: 'function', detail: 'print(...)', doc: 'Prints values to standard output', cursorOffset: -1 },
  { label: 'len', insertText: 'len()', kind: 'function', detail: 'len(s)', doc: 'Returns the length of an object', cursorOffset: -1 },
  { label: 'range', insertText: 'range()', kind: 'function', detail: 'range(stop)', doc: 'Generates a sequence of numbers', cursorOffset: -1 },
  { label: 'import', insertText: 'import ', kind: 'keyword', detail: 'keyword', doc: 'Imports a Python module' },
  { label: 'from', insertText: 'from  import ', kind: 'keyword', detail: 'keyword', doc: 'Imports specific attributes from a module', cursorOffset: -8 },
  { label: 'try', insertText: 'try:\n    \nexcept Exception as e:\n    print(e)', kind: 'snippet', detail: 'try/except block', doc: 'Exception handling in Python', cursorOffset: -35 },
  { label: 'forin', insertText: 'for item in :\n    pass', kind: 'snippet', detail: 'for ... in loop', doc: 'Iterates through iterable', cursorOffset: -10 },
  { label: 'ifmain', insertText: 'if __name__ == "__main__":\n    main()', kind: 'snippet', detail: '__main__ guard', doc: 'Runs script when executed directly' },
];

export const JSON_COMPLETIONS: CompletionItem[] = [
  { label: 'key-value', insertText: '"key": "value"', kind: 'snippet', detail: 'JSON key-value string' },
  { label: 'array', insertText: '"items": [\n  \n]', kind: 'snippet', detail: 'JSON array', cursorOffset: -2 },
  { label: 'object', insertText: '"data": {\n  \n}', kind: 'snippet', detail: 'JSON object', cursorOffset: -2 },
  { label: 'boolean-true', insertText: '"active": true', kind: 'snippet', detail: 'JSON boolean' },
  { label: 'number', insertText: '"count": 0', kind: 'snippet', detail: 'JSON number' },
];

export const HTML_COMPLETIONS: CompletionItem[] = [
  { label: 'div', insertText: '<div className=""></div>', kind: 'snippet', detail: '<div> container', cursorOffset: -8 },
  { label: 'button', insertText: '<button type="button" onClick={() => {}}></button>', kind: 'snippet', detail: '<button> element', cursorOffset: -9 },
  { label: 'span', insertText: '<span></span>', kind: 'snippet', detail: '<span> inline', cursorOffset: -7 },
  { label: 'input', insertText: '<input type="text" value={} onChange={(e) => {}} placeholder="" />', kind: 'snippet', detail: '<input> form field', cursorOffset: -38 },
  { label: 'h1', insertText: '<h1 className="text-2xl font-bold"></h1>', kind: 'snippet', detail: '<h1> heading', cursorOffset: -5 },
  { label: 'p', insertText: '<p className="text-sm"></p>', kind: 'snippet', detail: '<p> paragraph', cursorOffset: -4 },
];

/**
 * Retrieves matching completions based on current query prefix and language
 */
export function getCompletionsForContext(
  textBeforeCursor: string,
  lang: string = 'javascript'
): CompletionItem[] {
  const cleanLang = (lang || 'javascript').trim().toLowerCase();

  // Extract last word/token typed
  const match = textBeforeCursor.match(/([a-zA-Z0-9_$.]+)$/);
  const query = match ? match[1].toLowerCase() : '';

  let list: CompletionItem[] = [];

  if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(cleanLang)) {
    list = JS_TS_COMPLETIONS;
  } else if (['python', 'py'].includes(cleanLang)) {
    list = PYTHON_COMPLETIONS;
  } else if (cleanLang === 'json') {
    list = JSON_COMPLETIONS;
  } else if (['html', 'xml', 'svg'].includes(cleanLang)) {
    list = HTML_COMPLETIONS;
  } else {
    list = JS_TS_COMPLETIONS;
  }

  if (!query) {
    return list.slice(0, 8);
  }

  return list
    .filter((item) => {
      const labelLow = item.label.toLowerCase();
      const insertLow = item.insertText.toLowerCase();
      return labelLow.includes(query) || insertLow.includes(query);
    })
    .slice(0, 10);
}
