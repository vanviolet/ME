export type RuleSeverity = 'off' | 'warn' | 'error' | 0 | 1 | 2;
export type RuleCategory = 'possible-errors' | 'suggestions' | 'layout' | 'typescript' | 'react';

export interface RuleOptionField {
  name: string;
  label: string;
  type: 'select' | 'boolean' | 'number' | 'multi-select' | 'text';
  options?: { value: string | number | boolean; label: string }[];
  default: any;
  description?: string;
}

export interface EslintRuleDefinition {
  name: string;
  category: RuleCategory;
  descriptionEn: string;
  descriptionId: string;
  recommended: boolean;
  fixable: boolean;
  hasOptions?: boolean;
  optionsSchema?: RuleOptionField[];
  defaultSeverity?: 'off' | 'warn' | 'error';
  defaultOptions?: any;
  incorrectExample: string;
  correctExample: string;
  errorExplanationEn: string;
  errorExplanationId: string;
  docsUrl: string;
  tags: string[];
}

export const ESLINT_CATEGORIES: { id: RuleCategory; labelEn: string; labelId: string; iconName: string; color: string }[] = [
  {
    id: 'possible-errors',
    labelEn: 'Possible Problems',
    labelId: 'Masalah Potensial (Errors)',
    iconName: 'AlertTriangle',
    color: 'rose',
  },
  {
    id: 'suggestions',
    labelEn: 'Suggestions & Best Practices',
    labelId: 'Saran & Praktik Terbaik',
    iconName: 'Sparkles',
    color: 'amber',
  },
  {
    id: 'layout',
    labelEn: 'Layout & Formatting',
    labelId: 'Tata Letak & Format Kode',
    iconName: 'LayoutGrid',
    color: 'sky',
  },
  {
    id: 'typescript',
    labelEn: 'TypeScript Rules',
    labelId: 'Aturan TypeScript (@typescript-eslint)',
    iconName: 'Code2',
    color: 'blue',
  },
  {
    id: 'react',
    labelEn: 'React & Hooks',
    labelId: 'Aturan React & React Hooks',
    iconName: 'Atom',
    color: 'teal',
  },
];

export const ESLINT_RULES: EslintRuleDefinition[] = [
  // ================= POSSIBLE PROBLEMS =================
  {
    name: 'array-callback-return',
    category: 'possible-errors',
    descriptionEn: 'Enforce return statements in callbacks of array methods (map, filter, reduce, etc.).',
    descriptionId: 'Memastikan callback pada method array (map, filter, reduce) selalu mengembalikan nilai.',
    recommended: false,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'allowImplicit',
        label: 'Allow Implicit Return',
        type: 'boolean',
        default: false,
      },
    ],
    incorrectExample: `// ❌ map callback lupa return nilai
const doubled = [1, 2, 3].map((num) => {
  num * 2; // lupa "return"!
});`,
    correctExample: `// ✅ Callback mengembalikan nilai dengan benar
const doubled = [1, 2, 3].map((num) => {
  return num * 2;
});`,
    errorExplanationEn: 'Array methods like .map(), .filter(), and .reduce() expect callback functions to return values; omitting return results in unexpected undefined arrays.',
    errorExplanationId: 'Method array seperti map() atau filter() membutuhkan callback yang mengembalikan nilai; jika lupa return, array hasil akan berisi undefined.',
    docsUrl: 'https://eslint.org/docs/latest/rules/array-callback-return',
    tags: ['array', 'callback', 'map', 'filter'],
  },
  {
    name: 'constructor-super',
    category: 'possible-errors',
    descriptionEn: 'Require "super()" calls in constructors of derived classes.',
    descriptionId: 'Mewajibkan pemanggilan "super()" pada konstruktor kelas turunan sebelum mengakses "this".',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Lupa memanggil super() pada derived class
class Dog extends Animal {
  constructor(name) {
    this.name = name; // ReferenceError! super() belum dipanggil
  }
}`,
    correctExample: `// ✅ Panggil super() sebelum mengakses this
class Dog extends Animal {
  constructor(name) {
    super();
    this.name = name;
  }
}`,
    errorExplanationEn: 'Constructors of derived classes must call super() before accessing this, otherwise JavaScript throws a runtime ReferenceError.',
    errorExplanationId: 'Konstruktor kelas turunan wajib memanggil super() sebelum menggunakan "this", jika tidak JS akan melempar ReferenceError saat runtime.',
    docsUrl: 'https://eslint.org/docs/latest/rules/constructor-super',
    tags: ['classes', 'oop', 'constructor'],
  },
  {
    name: 'for-direction',
    category: 'possible-errors',
    descriptionEn: 'Enforce "for" loop update clause moving the counter in the right direction.',
    descriptionId: 'Memastikan klausa pembaruan loop "for" menggerakkan counter ke arah yang benar (mencegah infinite loop).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Loop bergerak ke arah sebaliknya (Infinite Loop!)
for (let i = 0; i < 10; i--) {
  console.log(i);
}`,
    correctExample: `// ✅ Loop counter dinaikkan dengan benar
for (let i = 0; i < 10; i++) {
  console.log(i);
}`,
    errorExplanationEn: 'The loop condition tests whether i < 10, but i is decremented each step, creating an infinite loop.',
    errorExplanationId: 'Kondisi loop memeriksa i < 10, namun variabel i malah dikurangi (i--) sehingga loop tidak pernah berhenti.',
    docsUrl: 'https://eslint.org/docs/latest/rules/for-direction',
    tags: ['loop', 'infinite-loop', 'core', 'logic'],
  },
  {
    name: 'getter-return',
    category: 'possible-errors',
    descriptionEn: 'Enforce "return" statements in getters.',
    descriptionId: 'Memastikan fungsi getter pada objek atau kelas selalu mengembalikan (return) nilai.',
    recommended: true,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'allowImplicit',
        label: 'Allow Implicit Return (return;)',
        type: 'boolean',
        default: false,
      },
    ],
    incorrectExample: `// ❌ Getter tidak mengembalikan nilai
const user = {
  get fullName() {
    console.log(this.first + ' ' + this.last);
  }
};`,
    correctExample: `// ✅ Getter mengembalikan nilai yang valid
const user = {
  get fullName() {
    return \`\${this.first} \${this.last}\`;
  }
};`,
    errorExplanationEn: 'Getters must return a value; omitting a return value will return undefined unexpectedly.',
    errorExplanationId: 'Getter wajib mengembalikan nilai; jika tidak ada return, nilai properti akan menjadi undefined tanpa sengaja.',
    docsUrl: 'https://eslint.org/docs/latest/rules/getter-return',
    tags: ['objects', 'classes', 'getters'],
  },
  {
    name: 'no-async-promise-executor',
    category: 'possible-errors',
    descriptionEn: 'Disallow using an async function as a Promise executor.',
    descriptionId: 'Melarang penggunaan fungsi async sebagai executor Promise (karena error tidak tertangkap oleh promise).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Async executor bisa menyebabkan unhandled rejection
new Promise(async (resolve, reject) => {
  const data = await fetchData();
  resolve(data);
});`,
    correctExample: `// ✅ Gunakan async function biasa atau non-async executor
async function getData() {
  const data = await fetchData();
  return data;
}`,
    errorExplanationEn: 'If an async executor function throws an error, the Promise constructor will not catch it, resulting in an unhandled rejection.',
    errorExplanationId: 'Jika async function di dalam Promise melempar error, error tersebut tidak dapat ditangkap oleh Promise dan menyebabkan unhandled rejection.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-async-promise-executor',
    tags: ['async', 'promises', 'concurrency'],
  },
  {
    name: 'no-await-in-loop',
    category: 'possible-errors',
    descriptionEn: 'Disallow "await" inside loops where concurrent execution with Promise.all is preferred.',
    descriptionId: 'Melarang penggunaan "await" di dalam loop jika operasi asinkron dapat dijalankan secara paralel.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Setiap request menunggu request sebelumnya selesai secara serial
for (const id of userIds) {
  const user = await fetchUser(id);
  users.push(user);
}`,
    correctExample: `// ✅ Request dijalankan bersamaan secara paralel dengan Promise.all
const users = await Promise.all(userIds.map(id => fetchUser(id)));`,
    errorExplanationEn: 'Performing await in each loop iteration causes slow serial requests when operations could run concurrently with Promise.all.',
    errorExplanationId: 'Melakukan await di setiap iterasi perulangan membuat proses berjalan lambat secara serial, padahal bisa diparalelkan.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-await-in-loop',
    tags: ['async', 'performance', 'loops'],
  },
  {
    name: 'no-compare-neg-zero',
    category: 'possible-errors',
    descriptionEn: 'Disallow comparing against -0 (minus zero) which is equivalent to +0 in JavaScript.',
    descriptionId: 'Melarang perbandingan terhadap nilai -0 karena -0 === +0 selalu bernilai true.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ x === -0 tidak bisa membedakan -0 dan +0
if (x === -0) {
  handleNegativeZero();
}`,
    correctExample: `// ✅ Gunakan Object.is untuk mendeteksi -0 secara akurat
if (Object.is(x, -0)) {
  handleNegativeZero();
}`,
    errorExplanationEn: 'In JavaScript, x === -0 evaluates to true even if x is +0. Use Object.is(x, -0) instead.',
    errorExplanationId: 'Di JavaScript, x === -0 tetap bernilai true meskipun x bernilai +0. Gunakan Object.is(x, -0).',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-compare-neg-zero',
    tags: ['math', 'equality', 'numbers'],
  },
  {
    name: 'no-cond-assign',
    category: 'possible-errors',
    descriptionEn: 'Disallow assignment operators in conditional expressions (e.g. if (x = 10)).',
    descriptionId: 'Melarang penugasan variabel (=) di dalam kondisi (if/while) yang sering terjadi akibat typo persamaan (==).',
    recommended: true,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'select',
        options: [
          { value: 'always', label: 'Disallow all assignments (Always)' },
          { value: 'except-parens', label: 'Allow if wrapped in parentheses' },
        ],
        default: 'except-parens',
      },
    ],
    incorrectExample: `// ❌ Typo penugasan "=" bukan perbandingan "==="
if (user.role = 'admin') {
  grantAccess();
}`,
    correctExample: `// ✅ Gunakan operator perbandingan "==="
if (user.role === 'admin') {
  grantAccess();
}`,
    errorExplanationEn: 'Using a single "=" in a condition assigns the variable rather than testing equality, which is almost always a bug.',
    errorExplanationId: 'Penggunaan tanda "=" tunggal di dalam kondisi if akan mengubah isi variabel, bukan membandingkan kesetaraan.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-cond-assign',
    tags: ['conditionals', 'typo', 'assignment'],
  },
  {
    name: 'no-const-assign',
    category: 'possible-errors',
    descriptionEn: 'Disallow reassigning "const" variables.',
    descriptionId: 'Melarang penugasan ulang pada variabel yang dideklarasikan dengan "const".',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Mengubah nilai konstanta
const MAX_LIMIT = 100;
MAX_LIMIT = 200; // TypeError runtime!`,
    correctExample: `// ✅ Gunakan "let" jika variabel perlu diubah nilainya
let maxLimit = 100;
maxLimit = 200;`,
    errorExplanationEn: 'Reassigning a const variable throws a runtime TypeError in JavaScript.',
    errorExplanationId: 'Mengubah nilai variabel const akan melempar TypeError saat program dijalankan.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-const-assign',
    tags: ['variables', 'const', 'es6'],
  },
  {
    name: 'no-constant-binary-expression',
    category: 'possible-errors',
    descriptionEn: 'Disallow expressions where the operation doesn\'t affect the value (e.g. constant comparisons).',
    descriptionId: 'Melarang ekspresi biner yang hasilnya konstan atau selalu sama (contoh: komparasi objek baru atau nullish coalescing sia-sia).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Object literal baru tidak akan pernah sama
const isMatch = [] === []; // Selalu false!
const value = {} ?? 'fallback'; // Selalu {}`,
    correctExample: `// ✅ Bandingkan isi array atau evaluasi ekspresi yang dinamis
const isMatch = arr1.length === arr2.length;
const value = existingObj ?? 'fallback';`,
    errorExplanationEn: 'Binary expressions with constant outcomes (like [] === []) are dead logic or indicate developer misunderstandings.',
    errorExplanationId: 'Ekspresi yang hasilnya selalu bernilai konstan (seperti [] === []) menandakan logika mati atau bug tersembunyi.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-constant-binary-expression',
    tags: ['logic', 'binary', 'constants'],
  },
  {
    name: 'no-constant-condition',
    category: 'possible-errors',
    descriptionEn: 'Disallow constant expressions in conditions (e.g. if (true), while (1)).',
    descriptionId: 'Melarang kondisi konstan pada pernyataan if atau loop (contoh: if (true) atau if (1)).',
    recommended: true,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'checkLoops',
        label: 'Check while / for loops',
        type: 'boolean',
        default: true,
      },
    ],
    incorrectExample: `// ❌ Kondisi selalu benar (dead code)
if (true) {
  doSomething();
}`,
    correctExample: `// ✅ Gunakan variabel atau kondisi dinamis
if (isReady) {
  doSomething();
}`,
    errorExplanationEn: 'A constant condition like `if (true)` renders conditional branches useless and is often left over from debugging.',
    errorExplanationId: 'Kondisi konstan seperti if (true) membuat cabang pengkondisian menjadi sia-sia dan biasanya sisa debugging.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-constant-condition',
    tags: ['control-flow', 'debugging', 'conditions'],
  },
  {
    name: 'no-constructor-return',
    category: 'possible-errors',
    descriptionEn: 'Disallow returning values from constructors.',
    descriptionId: 'Melarang pengembalian nilai (return) secara eksplisit dari dalam konstruktor kelas.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Return eksplisit di konstruktor
class User {
  constructor(name) {
    this.name = name;
    return { fake: true }; // Menimpa objek instansi!
  }
}`,
    correctExample: `// ✅ Konstruktor hanya menginisialisasi properti
class User {
  constructor(name) {
    this.name = name;
  }
}`,
    errorExplanationEn: 'Returning a value from a constructor silently overwrites the newly created instance object.',
    errorExplanationId: 'Mengembalikan nilai dari konstruktor akan menimpa objek instance baru yang sedang dibuat.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-constructor-return',
    tags: ['classes', 'constructor', 'oop'],
  },
  {
    name: 'no-debugger',
    category: 'possible-errors',
    descriptionEn: 'Disallow the use of "debugger" in production code.',
    descriptionId: 'Melarang pernyataan "debugger" yang tertinggal di dalam kode produksi.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Pernyataan debugger tertinggal
function calculateTax(amount) {
  debugger; // Menghentikan browser user!
  return amount * 0.11;
}`,
    correctExample: `// ✅ Hapus debugger sebelum deploy
function calculateTax(amount) {
  return amount * 0.11;
}`,
    errorExplanationEn: 'The `debugger` statement halts JavaScript execution in DevTools, freezing the user experience in production.',
    errorExplanationId: 'Pernyataan debugger akan menghentikan eksekusi browser pengguna saat DevTools terbuka.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-debugger',
    tags: ['debugging', 'clean-code', 'production'],
  },
  {
    name: 'no-dupe-args',
    category: 'possible-errors',
    descriptionEn: 'Disallow duplicate parameter names in function declarations.',
    descriptionId: 'Melarang nama parameter ganda pada deklarasi fungsi (parameter kedua akan menimpa parameter pertama).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Parameter kedua 'a' menutupi parameter pertama 'a'
function calculate(a, b, a) {
  console.log(a);
}`,
    correctExample: `// ✅ Berikan nama unik untuk setiap parameter
function calculate(a, b, c) {
  console.log(a, b, c);
}`,
    errorExplanationEn: 'Duplicate parameter names shadow earlier parameters, making previous arguments inaccessible.',
    errorExplanationId: 'Nama parameter ganda akan menimpa parameter sebelumnya sehingga nilai argumen awal tidak bisa diakses.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-dupe-args',
    tags: ['functions', 'parameters', 'syntax'],
  },
  {
    name: 'no-dupe-class-members',
    category: 'possible-errors',
    descriptionEn: 'Disallow duplicate class members (methods or properties).',
    descriptionId: 'Melarang deklarasi nama method atau properti ganda dalam satu class.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Method foo dideklarasikan dua kali
class Store {
  foo() { return 1; }
  foo() { return 2; } // Menimpa method sebelumnya
}`,
    correctExample: `// ✅ Beri nama yang berbeda sesuai fungsi
class Store {
  foo() { return 1; }
  bar() { return 2; }
}`,
    errorExplanationEn: 'Duplicate class members silently overwrite earlier definitions without warning.',
    errorExplanationId: 'Nama member class yang duplikat akan menimpa method sebelumnya secara diam-diam.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-dupe-class-members',
    tags: ['classes', 'methods', 'oop'],
  },
  {
    name: 'no-dupe-else-if',
    category: 'possible-errors',
    descriptionEn: 'Disallow duplicate conditions in if-else-if chains.',
    descriptionId: 'Melarang kondisi yang sama berulang pada rantai percabangan if-else-if.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Kondisi 'x === 1' berulang dua kali
if (x === 1) {
  firstAction();
} else if (x === 1) {
  secondAction(); // Tidak akan pernah dieksekusi!
}`,
    correctExample: `// ✅ Gunakan kondisi yang berbeda pada setiap cabang
if (x === 1) {
  firstAction();
} else if (x === 2) {
  secondAction();
}`,
    errorExplanationEn: 'Duplicate if-else-if branches create unreachable dead code because the first match always intercepts execution.',
    errorExplanationId: 'Kondisi else-if yang sama tidak akan pernah dieksekusi karena sudah tertangkap pada percabangan sebelumnya.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-dupe-else-if',
    tags: ['logic', 'conditions', 'dead-code'],
  },
  {
    name: 'no-dupe-keys',
    category: 'possible-errors',
    descriptionEn: 'Disallow duplicate keys in object literals.',
    descriptionId: 'Melarang penulisan kunci properti ganda di dalam satu objek literal.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Kunci 'theme' ditulis dua kali
const settings = {
  theme: 'dark',
  fontSize: 14,
  theme: 'light', // Menimpa 'dark'
};`,
    correctExample: `// ✅ Kunci objek harus unik
const settings = {
  theme: 'light',
  fontSize: 14,
};`,
    errorExplanationEn: 'Duplicate object keys cause later properties to overwrite earlier ones, indicating copy-paste mistakes.',
    errorExplanationId: 'Kunci properti duplikat akan menimpa nilai properti sebelumnya, umumnya akibat salah copy-paste.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-dupe-keys',
    tags: ['objects', 'keys', 'syntax'],
  },
  {
    name: 'no-duplicate-case',
    category: 'possible-errors',
    descriptionEn: 'Disallow duplicate case labels in switch statements.',
    descriptionId: 'Melarang label case yang sama berulang di dalam pernyataan switch.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Case 1 muncul dua kali
switch (statusCode) {
  case 1:
    handleOne();
    break;
  case 1: // Tidak akan pernah tersentuh
    handleDuplicate();
    break;
}`,
    correctExample: `// ✅ Setiap case memiliki nilai unik
switch (statusCode) {
  case 1:
    handleOne();
    break;
  case 2:
    handleTwo();
    break;
}`,
    errorExplanationEn: 'Duplicate switch cases result in dead code because JavaScript only matches the first instance.',
    errorExplanationId: 'Label case duplikat menghasilkan kode mati karena JavaScript hanya mencocokkan case pertama.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-duplicate-case',
    tags: ['switch', 'logic', 'control-flow'],
  },
  {
    name: 'no-duplicate-imports',
    category: 'possible-errors',
    descriptionEn: 'Disallow duplicate module imports from the same file/package.',
    descriptionId: 'Melarang pengimporan modul berulang dari berkas atau paket library yang sama.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Mengimpor modul yang sama pada dua baris terpisah
import { useState } from 'react';
import { useEffect } from 'react';`,
    correctExample: `// ✅ Gabungkan impor dari paket yang sama
import { useState, useEffect } from 'react';`,
    errorExplanationEn: 'Importing multiple times from the same module creates clutter and can confuse bundlers and tree-shaking.',
    errorExplanationId: 'Mengimpor berkas yang sama berulang kali membuat kode berantakan dan menyulitkan tree-shaking.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-duplicate-imports',
    tags: ['modules', 'imports', 'clean-code'],
  },
  {
    name: 'no-empty-pattern',
    category: 'possible-errors',
    descriptionEn: 'Disallow empty destructuring patterns (e.g. const {} = obj).',
    descriptionId: 'Melarang pola destructuring kosong yang tidak mengekstrak variabel apa pun.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Pola destructuring kosong tidak membuat variabel apa pun
const {} = user;
const [] = list;`,
    correctExample: `// ✅ Ekstrak variabel yang dibutuhkan secara eksplisit
const { id, name } = user;
const [firstItem] = list;`,
    errorExplanationEn: 'Empty destructuring patterns look like variable assignments but create zero variables, masking bugs.',
    errorExplanationId: 'Destructuring kosong tidak menghasilkan variabel apapun dan sering terjadi akibat salah ketik.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-empty-pattern',
    tags: ['destructuring', 'es6', 'syntax'],
  },
  {
    name: 'no-fallthrough',
    category: 'possible-errors',
    descriptionEn: 'Disallow fallthrough of switch cases without explicit "break" or comment.',
    descriptionId: 'Melarang perpindahan eksekusi case (fallthrough) tanpa kata kunci "break" atau komentar penjelasan.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Lupa break menyebabkan eksekusi case 2 ikut berjalan
switch (step) {
  case 1:
    initStepOne();
    // Lupa "break"!
  case 2:
    initStepTwo();
    break;
}`,
    correctExample: `// ✅ Akhiri setiap case dengan break
switch (step) {
  case 1:
    initStepOne();
    break;
  case 2:
    initStepTwo();
    break;
}`,
    errorExplanationEn: 'Omitting a break in a switch case causes execution to unintentionally cascade into the next case.',
    errorExplanationId: 'Lupa menuliskan kata kunci break menyebabkan kode pada case berikutnya ikut tereksekusi tanpa disengaja.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-fallthrough',
    tags: ['switch', 'control-flow', 'break'],
  },
  {
    name: 'no-func-assign',
    category: 'possible-errors',
    descriptionEn: 'Disallow reassigning function declarations.',
    descriptionId: 'Melarang penugasan ulang nilai pada nama deklarasi fungsi.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Menimpa fungsi dengan nilai lain
function calculateTotal() { return 100; }
calculateTotal = 50; // Menghancurkan fungsi!`,
    correctExample: `// ✅ Gunakan nama variabel terpisah
function calculateTotal() { return 100; }
let total = 50;`,
    errorExplanationEn: 'Overwriting a function identifier destroys the original function definition and triggers runtime errors.',
    errorExplanationId: 'Menimpa variabel fungsi dengan nilai skalar akan merusak fungsi asli dan memicu error runtime saat dipanggil.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-func-assign',
    tags: ['functions', 'assignment', 'scope'],
  },
  {
    name: 'no-import-assign',
    category: 'possible-errors',
    descriptionEn: 'Disallow assigning to imported bindings (read-only in ES modules).',
    descriptionId: 'Melarang penugasan ulang pada binding hasil import (import bersifat read-only pada ES Module).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Mengubah nilai hasil import (TypeError runtime)
import { API_URL } from './config';
API_URL = 'https://new-api.com';`,
    correctExample: `// ✅ Perlakukan import sebagai immutable / read-only
import { API_URL } from './config';
console.log('Current URL:', API_URL);`,
    errorExplanationEn: 'ES Module imports create live read-only bindings; mutating them throws a runtime TypeError.',
    errorExplanationId: 'Modul ES menganggap semua hasil import sebagai read-only, mengubahnya akan menyebabkan error runtime.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-import-assign',
    tags: ['modules', 'import', 'esm'],
  },
  {
    name: 'no-inner-declarations',
    category: 'possible-errors',
    descriptionEn: 'Disallow variable or function declarations in nested blocks (e.g. inside if statements).',
    descriptionId: 'Melarang deklarasi fungsi atau var di dalam blok bersarang (seperti di dalam blok if).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Deklarasi fungsi di dalam blok if
if (test) {
  function doWork() { } // Hoisting behavior tidak konsisten
}`,
    correctExample: `// ✅ Gunakan function expression atau deklarasikan di level atas
let doWork;
if (test) {
  doWork = () => { };
}`,
    errorExplanationEn: 'Function declarations inside blocks have inconsistent hoisting behavior across older JavaScript runtimes.',
    errorExplanationId: 'Deklarasi fungsi di dalam blok memiliki perilaku hoisting yang tidak konsisten di berbagai mesin JS.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-inner-declarations',
    tags: ['functions', 'hoisting', 'blocks'],
  },
  {
    name: 'no-loss-of-precision',
    category: 'possible-errors',
    descriptionEn: 'Disallow literal numbers that lose precision at runtime due to 64-bit float limitations.',
    descriptionId: 'Melarang angka literal yang kehilangan presisi akibat keterbatasan floating-point 64-bit.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Angka melebihi Number.MAX_SAFE_INTEGER
const bigNumber = 9007199254740993; // Kehilangan presisi!`,
    correctExample: `// ✅ Gunakan BigInt untuk angka yang sangat besar
const bigNumber = 9007199254740993n;`,
    errorExplanationEn: 'JavaScript numbers greater than 2^53 - 1 lose precision and round automatically. Use BigInt literals instead.',
    errorExplanationId: 'Angka di atas batas aman 2^53 - 1 akan dibulatkan otomatis dan kehilangan presisi. Gunakan BigInt.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-loss-of-precision',
    tags: ['numbers', 'precision', 'math', 'bigint'],
  },
  {
    name: 'no-obj-calls',
    category: 'possible-errors',
    descriptionEn: 'Disallow calling global object properties as functions (Math(), JSON(), Reflect(), Atomics()).',
    descriptionId: 'Melarang pemanggilan objek global bawaan sebagai fungsi (seperti Math(), JSON(), Reflect()).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Math dan JSON bukan fungsi yang dapat dipanggil
const m = Math();
const j = JSON();`,
    correctExample: `// ✅ Panggil method di dalam objek Math atau JSON
const m = Math.floor(4.5);
const j = JSON.parse('{"a": 1}');`,
    errorExplanationEn: 'Math, JSON, Reflect, and Atomics are namespaces, not constructors or callable functions.',
    errorExplanationId: 'Math dan JSON adalah namespace objek, bukan konstruktor fungsi yang bisa dipanggil langsung.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-obj-calls',
    tags: ['globals', 'math', 'json', 'runtime'],
  },
  {
    name: 'no-prototype-builtins',
    category: 'possible-errors',
    descriptionEn: 'Disallow calling Object.prototype methods directly on objects (e.g. obj.hasOwnProperty()).',
    descriptionId: 'Melarang pemanggilan langsung method Object.prototype seperti hasOwnProperty pada objek instansi.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ obj.hasOwnProperty() bisa gagal jika obj dibuat dengan Object.create(null)
if (user.hasOwnProperty('email')) {
  sendEmail();
}`,
    correctExample: `// ✅ Gunakan Object.hasOwn atau Object.prototype.hasOwnProperty.call
if (Object.hasOwn(user, 'email')) {
  sendEmail();
}`,
    errorExplanationEn: 'Calling obj.hasOwnProperty directly fails if the object was created with Object.create(null) or shadows the property.',
    errorExplanationId: 'Memanggil obj.hasOwnProperty() secara langsung akan error jika objek dibuat via Object.create(null).',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-prototype-builtins',
    tags: ['objects', 'prototype', 'hasown'],
  },
  {
    name: 'no-self-assign',
    category: 'possible-errors',
    descriptionEn: 'Disallow assignments where both sides are exactly the same (e.g. a = a).',
    descriptionId: 'Melarang penugasan variabel ke dirinya sendiri (contoh: a = a) yang tidak memiliki efek apa pun.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Penugasan variabel ke dirinya sendiri
user.name = user.name;
[a, b] = [a, b];`,
    correctExample: `// ✅ Tugaskan nilai baru yang valid
user.name = newName;
[a, b] = [b, a]; // Swap variabel`,
    errorExplanationEn: 'Self-assignment has no effect and usually indicates an incomplete refactoring or typo.',
    errorExplanationId: 'Penugasan ke diri sendiri tidak mengubah nilai apa pun dan umumnya terjadi akibat salah ketik.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-self-assign',
    tags: ['assignment', 'typo', 'logic'],
  },
  {
    name: 'no-self-compare',
    category: 'possible-errors',
    descriptionEn: 'Disallow comparisons where both sides are exactly the same (e.g. x === x).',
    descriptionId: 'Melarang perbandingan variabel terhadap dirinya sendiri (contoh: x === x).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Perbandingan sia-sia yang selalu menghasilkan nilai tetap
if (score === score) {
  displayScore();
}`,
    correctExample: `// ✅ Untuk mengecek NaN, gunakan Number.isNaN()
if (!Number.isNaN(score)) {
  displayScore();
}`,
    errorExplanationEn: 'Comparing a variable to itself is redundant and always evaluates to true (except for NaN, where Number.isNaN should be used).',
    errorExplanationId: 'Membandingkan variabel dengan dirinya sendiri selalu bernilai true (gunakan Number.isNaN jika ingin mengecek NaN).',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-self-compare',
    tags: ['equality', 'comparison', 'nan'],
  },
  {
    name: 'no-setter-return',
    category: 'possible-errors',
    descriptionEn: 'Disallow returning values from setters.',
    descriptionId: 'Melarang pengembalian nilai (return) dari dalam fungsi setter.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Setter tidak boleh mengembalikan nilai
const user = {
  set age(val) {
    this._age = val;
    return this._age; // Nilai kembalian setter selalu diabaikan JS
  }
};`,
    correctExample: `// ✅ Setter hanya menetapkan nilai properti
const user = {
  set age(val) {
    this._age = val;
  }
};`,
    errorExplanationEn: 'The return value of a setter function is completely ignored by JavaScript.',
    errorExplanationId: 'Nilai kembalian dari fungsi setter selalu diabaikan oleh JavaScript dan tidak memiliki fungsi apa pun.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-setter-return',
    tags: ['classes', 'setters', 'objects'],
  },
  {
    name: 'no-sparse-arrays',
    category: 'possible-errors',
    descriptionEn: 'Disallow sparse arrays with empty comma slots (e.g. [1, , 3]).',
    descriptionId: 'Melarang penulisan array renggang dengan koma kosong (contoh: [1, , 3]).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Array memiliki slot kosong akibat koma ekstra
const items = ['apple', , 'banana'];`,
    correctExample: `// ✅ Array padat tanpa koma kosong
const items = ['apple', 'orange', 'banana'];`,
    errorExplanationEn: 'Sparse arrays contain "empty holes" which behave unpredictably with iteration methods like .forEach() or .map().',
    errorExplanationId: 'Array renggang dengan slot kosong menyebabkan perilaku tidak terduga saat diiterasi dengan forEach atau map.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-sparse-arrays',
    tags: ['arrays', 'holes', 'syntax'],
  },
  {
    name: 'no-template-curly-in-string',
    category: 'possible-errors',
    descriptionEn: 'Disallow template literal placeholder syntax inside regular strings (e.g. "Hello ${name}").',
    descriptionId: 'Melarang sintaks placeholder template literal "${var}" di dalam string petik biasa (" atau \').',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Variabel tidak terinterpolasi karena menggunakan tanda kutip biasa
const greeting = "Hello \${user.name}";`,
    correctExample: `// ✅ Gunakan backtick (\`) untuk template literal
const greeting = \`Hello \${user.name}\`;`,
    errorExplanationEn: 'Developers often intend to use template literals (backticks) but mistakenly use regular quotes, leaving the `${...}` un-evaluated.',
    errorExplanationId: 'Placeholder ${...} tidak akan dievaluasi jika menggunakan petik biasa (" atau \'). Gunakan backtick (`).',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-template-curly-in-string',
    tags: ['strings', 'templates', 'interpolation'],
  },
  {
    name: 'no-undef',
    category: 'possible-errors',
    descriptionEn: 'Disallow the use of undeclared variables unless mentioned in /*global ...*/ comments.',
    descriptionId: 'Melarang penggunaan variabel yang belum dideklarasikan (mencegah typo nama variabel global).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Variabel 'username' belum dideklarasikan
function printUser() {
  console.log(username); // ReferenceError!
}`,
    correctExample: `// ✅ Deklarasikan variabel terlebih dahulu
function printUser() {
  const username = 'Alice';
  console.log(username);
}`,
    errorExplanationEn: 'Using undeclared variables creates accidental globals or throws a runtime ReferenceError.',
    errorExplanationId: 'Menggunakan variabel yang belum dideklarasikan dapat memicu ReferenceError runtime atau polusi global.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-undef',
    tags: ['variables', 'scope', 'reference-error'],
  },
  {
    name: 'no-unexpected-multiline',
    category: 'possible-errors',
    descriptionEn: 'Disallow confusing multiline expressions that can be misparsed as function calls.',
    descriptionId: 'Melarang ekspresi multi-baris membingungkan yang dapat disalahartikan sebagai pemanggilan fungsi tanpa titik koma.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Baris kedua dianggap sebagai argumen fungsi baris pertama
const fn = getFunction()
(1, 2, 3).forEach(x => console.log(x))`,
    correctExample: `// ✅ Pisahkan dengan titik koma (semicolon) secara jelas
const fn = getFunction();
[1, 2, 3].forEach(x => console.log(x));`,
    errorExplanationEn: 'Without semicolons, a bracket or parenthesis on the next line is parsed as calling or indexing the previous line.',
    errorExplanationId: 'Tanpa titik koma, tanda kurung di baris berikutnya akan diartikan sebagai pemanggilan fungsi dari baris sebelumnya.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unexpected-multiline',
    tags: ['semicolon', 'multiline', 'asi'],
  },
  {
    name: 'no-unreachable',
    category: 'possible-errors',
    descriptionEn: 'Disallow unreachable code after "return", "throw", "continue", and "break" statements.',
    descriptionId: 'Melarang penulisan kode setelah pernyataan return, throw, continue, atau break (kode mati yang tidak pernah tereksekusi).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Baris kode setelah return tidak akan pernah dijalankan
function calculateTotal(price) {
  return price * 1.1;
  console.log('Done'); // Unreachable code!
}`,
    correctExample: `// ✅ Pindahkan statement penting sebelum return
function calculateTotal(price) {
  console.log('Calculating total...');
  return price * 1.1;
}`,
    errorExplanationEn: 'Statements following a return or throw can never be executed, causing dead code clutter.',
    errorExplanationId: 'Perintah setelah kata kunci return atau throw tidak akan pernah dieksekusi dan menjadi kode mati yang membingungkan.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unreachable',
    tags: ['dead-code', 'control-flow', 'return'],
  },
  {
    name: 'no-unreachable-loop',
    category: 'possible-errors',
    descriptionEn: 'Disallow loops with a body that allows only one iteration (e.g. unconditional break).',
    descriptionId: 'Melarang perulangan yang hanya bisa berjalan satu kali iterasi karena terdapat break/return tanpa syarat.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Loop langsung berhenti di iterasi pertama
while (hasData) {
  processData();
  break; // Loop hanya berjalan 1x!
}`,
    correctExample: `// ✅ Gunakan if statement biasa jika hanya butuh 1x eksekusi
if (hasData) {
  processData();
}`,
    errorExplanationEn: 'A loop that unconditionally exits on its first iteration should be an `if` block instead of a misleading loop.',
    errorExplanationId: 'Perulangan yang langsung berhenti pada iterasi pertama seharusnya diganti dengan percabangan `if` biasa.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unreachable-loop',
    tags: ['loops', 'control-flow', 'dead-code'],
  },
  {
    name: 'no-unsafe-finally',
    category: 'possible-errors',
    descriptionEn: 'Disallow control flow statements in "finally" blocks (e.g. return inside finally).',
    descriptionId: 'Melarang pernyataan pengontrol alur (seperti return atau throw) di dalam blok finally (dapat menimpa error dari try/catch).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Return di dalam finally menimpa error di blok catch
try {
  throw new Error('Database connection failed');
} finally {
  return true; // Error lenyap tanpa jejak!
}`,
    correctExample: `// ✅ Biarkan blok finally hanya membersihkan resource
try {
  throw new Error('Database connection failed');
} finally {
  closeDatabaseConnection();
}`,
    errorExplanationEn: 'Using return or throw inside a `finally` block silently swallows exceptions from the try/catch blocks.',
    errorExplanationId: 'Menuliskan return di dalam blok finally akan menghapus error yang terjadi di try/catch tanpa meninggalkan jejak.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unsafe-finally',
    tags: ['try-catch', 'finally', 'error-handling'],
  },
  {
    name: 'no-unsafe-negation',
    category: 'possible-errors',
    descriptionEn: 'Disallow negating the left operand of relational operators (e.g. !key in object).',
    descriptionId: 'Melarang negasi operand kiri pada operator relasional (contoh: !key in obj padahal maksudnya !(key in obj)).',
    recommended: true,
    fixable: true,
    incorrectExample: `// ❌ Negasi dievaluasi sebelum operator 'in'
if (!key in object) {
  // Mengecek apakah (!key) ada di object!
}`,
    correctExample: `// ✅ Bungkus operasi relasional dengan tanda kurung
if (!(key in object)) {
  handleMissingKey();
}`,
    errorExplanationEn: 'The `!` operator has higher precedence than `in` or `instanceof`, resulting in unintended boolean checks.',
    errorExplanationId: 'Operator `!` memiliki prioritas lebih tinggi daripada `in` sehingga boolean hasil negasi yang diperiksa di dalam object.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unsafe-negation',
    tags: ['operators', 'precedence', 'negation'],
  },
  {
    name: 'no-unsafe-optional-chaining',
    category: 'possible-errors',
    descriptionEn: 'Disallow use of optional chaining in contexts where "undefined" value is not allowed.',
    descriptionId: 'Melarang penggunaan optional chaining (?.) di tempat yang tidak memperbolehkan nilai undefined.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Objek undefined tidak bisa diekspansi atau dipanggil konstruktornya
const obj = { ...(user?.profile) };
class MyClass extends (BaseClass?.prototype) { }`,
    correctExample: `// ✅ Pastikan objek valid sebelum operasi ekspansi atau pewarisan
const profile = user?.profile ?? {};
const obj = { ...profile };`,
    errorExplanationEn: 'Using optional chaining in places like `(obj?.foo)()` or inheritance causes a TypeError if undefined.',
    errorExplanationId: 'Menggunakan optional chaining pada konteks tertentu dapat menyebabkan TypeError jika nilai yang dikembalikan undefined.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unsafe-optional-chaining',
    tags: ['optional-chaining', 'safety', 'es2020'],
  },
  {
    name: 'no-unused-vars',
    category: 'possible-errors',
    descriptionEn: 'Disallow unused variables, functions, and function parameters.',
    descriptionId: 'Melarang variabel, fungsi, atau parameter yang dideklarasikan namun tidak pernah digunakan.',
    recommended: true,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'argsIgnorePattern',
        label: 'Ignore Args Pattern (e.g. ^_)',
        type: 'text',
        default: '^_',
      },
    ],
    incorrectExample: `// ❌ Variabel 'totalAmount' dibuat tapi tidak pernah dipakai
const taxRate = 0.1;
const totalAmount = 50000;
console.log('Tax:', taxRate);`,
    correctExample: `// ✅ Hapus atau gunakan variabel yang sudah dideklarasikan
const taxRate = 0.1;
const totalAmount = 50000;
console.log('Total + Tax:', totalAmount * (1 + taxRate));`,
    errorExplanationEn: 'Unused variables consume memory, clutter code, and often indicate incomplete logic or abandoned refactorings.',
    errorExplanationId: 'Variabel yang tidak digunakan mengotori basis kode, membuang memori, dan mengindikasikan refaktorisasi yang belum tuntas.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unused-vars',
    tags: ['variables', 'clean-code', 'memory'],
  },
  {
    name: 'no-use-before-define',
    category: 'possible-errors',
    descriptionEn: 'Disallow the use of variables, functions, and classes before they are defined.',
    descriptionId: 'Melarang penggunaan variabel, fungsi, atau kelas sebelum baris deklarasinya.',
    recommended: false,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'functions',
        label: 'Check Function Declarations',
        type: 'boolean',
        default: false,
      },
      {
        name: 'classes',
        label: 'Check Classes',
        type: 'boolean',
        default: true,
      },
      {
        name: 'variables',
        label: 'Check Variables',
        type: 'boolean',
        default: true,
      },
    ],
    incorrectExample: `// ❌ Variabel digunakan sebelum baris deklarasinya (TDZ Error)
console.log(userName);
const userName = 'Bob';`,
    correctExample: `// ✅ Deklarasikan variabel sebelum menggunakannya
const userName = 'Bob';
console.log(userName);`,
    errorExplanationEn: 'Accessing `let` or `const` variables before declaration triggers a Temporal Dead Zone ReferenceError.',
    errorExplanationId: 'Mengakses variabel let atau const sebelum baris deklarasinya akan melempar ReferenceError (Temporal Dead Zone).',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-use-before-define',
    tags: ['hoisting', 'scope', 'tdz'],
  },
  {
    name: 'use-isnan',
    category: 'possible-errors',
    descriptionEn: 'Require calls to isNaN() or Number.isNaN() when checking for NaN.',
    descriptionId: 'Mewajibkan penggunaan Number.isNaN() untuk memeriksa nilai NaN (karena NaN === NaN selalu false).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ NaN === NaN selalu menghasilkan false di JavaScript!
if (input === NaN) {
  console.log('Nilai tidak valid');
}`,
    correctExample: `// ✅ Gunakan Number.isNaN() untuk mendeteksi NaN
if (Number.isNaN(input)) {
  console.log('Nilai tidak valid');
}`,
    errorExplanationEn: 'In JavaScript, NaN is not equal to anything, including itself (NaN === NaN is false). Always use Number.isNaN().',
    errorExplanationId: 'Di JavaScript, NaN tidak sama dengan apapun termasuk dirinya sendiri (NaN === NaN selalu bernilai false).',
    docsUrl: 'https://eslint.org/docs/latest/rules/use-isnan',
    tags: ['math', 'numbers', 'nan', 'equality'],
  },
  {
    name: 'valid-typeof',
    category: 'possible-errors',
    descriptionEn: 'Enforce comparing typeof expressions against valid strings.',
    descriptionId: 'Memastikan perbandingan ekspresi "typeof" hanya dengan string tipe data yang valid.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Typo pada string pengecekan typeof
if (typeof value === 'strng') {
  handleString();
}`,
    correctExample: `// ✅ Gunakan nama tipe data yang valid
if (typeof value === 'string') {
  handleString();
}`,
    errorExplanationEn: 'Typoing typeof comparison strings (like "strng" or "undefimed") ensures the condition will never match.',
    errorExplanationId: 'Salah mengetik string tipe typeof (seperti "strng") membuat kondisi tidak akan pernah bernilai true.',
    docsUrl: 'https://eslint.org/docs/latest/rules/valid-typeof',
    tags: ['typeof', 'types', 'typo'],
  },

  // ================= SUGGESTIONS & BEST PRACTICES =================
  {
    name: 'curly',
    category: 'suggestions',
    descriptionEn: 'Enforce consistent brace style for all control statements (if, else, for, while).',
    descriptionId: 'Mewajibkan penggunaan kurung kurawal ({}) pada seluruh pernyataan kontrol alur (mencegah bug Apple goto-fail).',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'style',
        label: 'Brace Policy',
        type: 'select',
        options: [
          { value: 'all', label: 'Require braces for all blocks (Strict)' },
          { value: 'multi-line', label: 'Require braces only for multi-line' },
          { value: 'multi-or-nest', label: 'Require braces for nested blocks' },
        ],
        default: 'all',
      },
    ],
    incorrectExample: `// ❌ Tidak menggunakan kurung kurawal {}
if (isAuthorized)
  grantAccess();
  auditLog(); // Bahaya! Baris ini selalu jalan tanpa terpengaruh if!`,
    correctExample: `// ✅ Selalu gunakan kurung kurawal {}
if (isAuthorized) {
  grantAccess();
  auditLog();
}`,
    errorExplanationEn: 'Omitting braces can cause dangerous logic bugs when new lines are added to single-line conditionals.',
    errorExplanationId: 'Tidak menggunakan kurung kurawal dapat menyebabkan bug keamanan fatal ketika baris baru ditambahkan di bawahnya.',
    docsUrl: 'https://eslint.org/docs/latest/rules/curly',
    tags: ['brackets', 'style', 'security'],
  },
  {
    name: 'default-case',
    category: 'suggestions',
    descriptionEn: 'Require "default" case in switch statements.',
    descriptionId: 'Mewajibkan adanya klausa "default" pada setiap pernyataan switch untuk menangani nilai tak terduga.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Switch tanpa penanganan default
switch (theme) {
  case 'dark':
    applyDarkTheme();
    break;
  case 'light':
    applyLightTheme();
    break;
}`,
    correctExample: `// ✅ Sediakan fallback default yang aman
switch (theme) {
  case 'dark':
    applyDarkTheme();
    break;
  case 'light':
    applyLightTheme();
    break;
  default:
    applySystemDefaultTheme();
    break;
}`,
    errorExplanationEn: 'Switch statements without a default case can silently fail when unexpected inputs are received.',
    errorExplanationId: 'Pernyataan switch tanpa case default dapat gagal secara diam-diam saat menerima nilai yang belum terdaftar.',
    docsUrl: 'https://eslint.org/docs/latest/rules/default-case',
    tags: ['switch', 'fallback', 'control-flow'],
  },
  {
    name: 'dot-notation',
    category: 'suggestions',
    descriptionEn: 'Enforce dot notation whenever possible instead of bracket notation (obj.prop instead of obj["prop"]).',
    descriptionId: 'Mewajibkan penggunaan dot notation (obj.prop) dibanding bracket notation (obj["prop"]) untuk properti statis.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Menggunakan bracket notation untuk properti statis
const name = user["name"];
const email = user["email"];`,
    correctExample: `// ✅ Gunakan dot notation yang lebih bersih
const name = user.name;
const email = user.email;`,
    errorExplanationEn: 'Dot notation is cleaner, faster to read, and better supported by IDE autocompletion.',
    errorExplanationId: 'Dot notation lebih rapi, mudah dibaca, dan didukung penuh oleh fitur autocomplete IDE.',
    docsUrl: 'https://eslint.org/docs/latest/rules/dot-notation',
    tags: ['objects', 'style', 'clean-code'],
  },
  {
    name: 'eqeqeq',
    category: 'suggestions',
    descriptionEn: 'Require the use of === and !== over == and != (Strict Equality).',
    descriptionId: 'Mewajibkan penggunaan operator kesetaraan ketat (=== dan !==) untuk menghindari type coercion tak terduga.',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'rule',
        label: 'Enforcement Level',
        type: 'select',
        options: [
          { value: 'always', label: 'Always use === and !==' },
          { value: 'smart', label: 'Smart (allow == null)' },
        ],
        default: 'always',
      },
    ],
    incorrectExample: `// ❌ Menggunakan == yang melakukan type conversion diam-diam
if (status == 1) { // true untuk "1", true, atau [1]!
  proceed();
}`,
    correctExample: `// ✅ Gunakan === yang mengecek tipe data & nilai
if (status === 1) {
  proceed();
}`,
    errorExplanationEn: 'The loose equality operator `==` converts types unpredictably (`0 == ""` is true, `[] == false` is true).',
    errorExplanationId: 'Operator `==` melakukan konversi tipe data otomatis yang berbahaya (misal: 0 == "" bernilai true).',
    docsUrl: 'https://eslint.org/docs/latest/rules/eqeqeq',
    tags: ['equality', 'coercion', 'types', 'safety'],
  },
  {
    name: 'no-alert',
    category: 'suggestions',
    descriptionEn: 'Disallow the use of alert, confirm, and prompt.',
    descriptionId: 'Melarang penggunaan dialog bawaan browser seperti alert, confirm, dan prompt.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Menggunakan alert dialog bawaan yang memblokir browser
alert('Data berhasil disimpan!');`,
    correctExample: `// ✅ Gunakan custom modal UI atau toast notification
toast.success('Data berhasil disimpan!');`,
    errorExplanationEn: 'Native alerts freeze the UI thread and provide poor user experience compared to modern dialog components.',
    errorExplanationId: 'Dialog alert bawaan membekukan thread browser dan memberikan pengalaman pengguna (UX) yang buruk.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-alert',
    tags: ['ui', 'dialogs', 'browser'],
  },
  {
    name: 'no-console',
    category: 'suggestions',
    descriptionEn: 'Disallow the use of console methods (console.log, console.debug, etc.) in production.',
    descriptionId: 'Melarang pemanggilan console.log di kode produksi (mencegah kebocoran data sensitif ke console pengguna).',
    recommended: false,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'allow',
        label: 'Allowed Methods (e.g. warn, error)',
        type: 'select',
        options: [
          { value: 'warn,error', label: 'Allow warn and error' },
          { value: 'error', label: 'Allow error only' },
          { value: 'none', label: 'Disallow all console methods' },
        ],
        default: 'warn,error',
      },
    ],
    incorrectExample: `// ❌ console.log mencetak data sensitif ke browser user
console.log('User password hash:', user.passwordHash);`,
    correctExample: `// ✅ Gunakan logger khusus atau batasi pada console.warn/error
logger.info('User authentication event recorded');`,
    errorExplanationEn: 'Console logs pollute browser consoles, degrade performance, and risk leaking private information.',
    errorExplanationId: 'console.log mengotori konsol pengguna, memperlambat rendering, dan berisiko membocorkan data rahasia.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-console',
    tags: ['debugging', 'security', 'production'],
  },
  {
    name: 'no-else-return',
    category: 'suggestions',
    descriptionEn: 'Disallow "else" blocks after an "if" that ends with a return statement.',
    descriptionId: 'Melarang blok "else" jika cabang "if" sebelumnya sudah diakhiri dengan pernyataan return (mengurangi nesting).',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Blok else tidak diperlukan karena if sudah mengembalikan nilai
function getRole(isAdmin) {
  if (isAdmin) {
    return 'Administrator';
  } else {
    return 'Standard User';
  }
}`,
    correctExample: `// ✅ Hapus else untuk meratakan kedalaman kode (early return)
function getRole(isAdmin) {
  if (isAdmin) {
    return 'Administrator';
  }
  return 'Standard User';
}`,
    errorExplanationEn: 'When an if block returns, the else block is redundant and adds unnecessary indentation nesting.',
    errorExplanationId: 'Jika blok if sudah melakukan return, blok else menjadi redundan dan menambah tingkat lekukan yang tidak perlu.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-else-return',
    tags: ['clean-code', 'nesting', 'refactoring'],
  },
  {
    name: 'no-empty-function',
    category: 'suggestions',
    descriptionEn: 'Disallow empty function bodies.',
    descriptionId: 'Melarang fungsi kosong tanpa implementasi apapun.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Fungsi kosong tanpa keterangan
function onButtonClick() {
  // kosong
}`,
    correctExample: `// ✅ Berikan implementasi atau komentar alasan fungsi kosong
function onButtonClick() {
  // No-op: event di-handle oleh parent container
}`,
    errorExplanationEn: 'Empty functions often indicate forgotten implementations or useless callbacks.',
    errorExplanationId: 'Fungsi kosong sering kali menandakan implementasi yang terlupakan atau callback yang tidak terpakai.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-empty-function',
    tags: ['functions', 'clean-code'],
  },
  {
    name: 'no-eval',
    category: 'suggestions',
    descriptionEn: 'Disallow the use of eval().',
    descriptionId: 'Melarang keras penggunaan fungsi eval() karena celah keamanan eksekusi kode acak (RCE).',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Bahaya XSS & Remote Code Execution fatal
const result = eval(userProvidedExpression);`,
    correctExample: `// ✅ Gunakan parser matematika atau JSON.parse
const data = JSON.parse(jsonString);`,
    errorExplanationEn: 'eval() executes arbitrary strings as code, opening massive security vulnerabilities and crippling engine optimizations.',
    errorExplanationId: 'eval() dapat mengeksekusi string sembarang sebagai kode program, membuka celah injeksi kode fatal.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-eval',
    tags: ['security', 'vulnerability', 'xss'],
  },
  {
    name: 'no-nested-ternary',
    category: 'suggestions',
    descriptionEn: 'Disallow nested ternary expressions.',
    descriptionId: 'Melarang operator ternary bersarang (a ? b : c ? d : e) karena sangat sulit dibaca dan dirawat.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Ternary bersarang yang membingungkan
const status = isPending ? 'wait' : isSuccess ? 'done' : isFailed ? 'retry' : 'unknown';`,
    correctExample: `// ✅ Gunakan if/else, switch, atau dictionary mapping
function getStatus() {
  if (isPending) return 'wait';
  if (isSuccess) return 'done';
  if (isFailed) return 'retry';
  return 'unknown';
}`,
    errorExplanationEn: 'Nested ternary operators make code difficult to read, understand, and debug.',
    errorExplanationId: 'Ternary bersarang membuat alur logika sangat sulit dibaca dan rawan salah interpretasi saat debugging.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-nested-ternary',
    tags: ['ternary', 'readability', 'clean-code'],
  },
  {
    name: 'no-param-reassign',
    category: 'suggestions',
    descriptionEn: 'Disallow reassigning function parameters or mutating their properties.',
    descriptionId: 'Melarang penugasan ulang parameter fungsi atau memodifikasi propertinya (mencegah side-effect).',
    recommended: false,
    fixable: false,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'props',
        label: 'Disallow mutating parameter properties (e.g. user.name = ...)',
        type: 'boolean',
        default: true,
      },
    ],
    incorrectExample: `// ❌ Mengubah parameter fungsi secara langsung
function calculateTotal(price, discount) {
  if (!discount) discount = 0; // Mutasi parameter!
  return price - discount;
}`,
    correctExample: `// ✅ Gunakan default parameter atau buat variabel lokal baru
function calculateTotal(price, discount = 0) {
  return price - discount;
}`,
    errorExplanationEn: 'Mutating parameters can cause confusing side-effects and bugs across calling functions.',
    errorExplanationId: 'Mengubah isi parameter dapat menyebabkan efek samping tak terduga pada fungsi pemanggil.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-param-reassign',
    tags: ['functions', 'immutability', 'side-effects'],
  },
  {
    name: 'no-return-assign',
    category: 'suggestions',
    descriptionEn: 'Disallow assignment operators in return statements.',
    descriptionId: 'Melarang penugasan nilai variabel di dalam pernyataan return (contoh: return a = b).',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Penugasan di dalam baris return
function sum(a, b) {
  return result = a + b;
}`,
    correctExample: `// ✅ Pisahkan penugasan dan pengembalian nilai
function sum(a, b) {
  const result = a + b;
  return result;
}`,
    errorExplanationEn: 'Assignments inside return statements are confusing and often indicate accidental single equals (`=`) instead of `===`.',
    errorExplanationId: 'Penugasan di dalam baris return membingungkan dan sering kali merupakan typo dari operator kesetaraan `===`.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-return-assign',
    tags: ['return', 'assignment', 'clarity'],
  },
  {
    name: 'no-shadow',
    category: 'suggestions',
    descriptionEn: 'Disallow variable declarations from shadowing variables declared in the outer scope.',
    descriptionId: 'Melarang pendeklarasian variabel yang memiliki nama sama dengan variabel di scope luar (shadowing).',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Variabel 'userId' di dalam fungsi menutupi 'userId' di scope luar
const userId = 'ADMIN_99';
function getUserData(userId) {
  console.log(userId);
}`,
    correctExample: `// ✅ Gunakan nama yang lebih spesifik untuk parameter
const userId = 'ADMIN_99';
function getUserData(targetUserId) {
  console.log(targetUserId);
}`,
    errorExplanationEn: 'Variable shadowing creates confusion about which variable is currently in scope, leading to subtle logic errors.',
    errorExplanationId: 'Penamaan variabel yang sama di dalam scope berbeda membuat bingung variabel mana yang sedang diakses.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-shadow',
    tags: ['scope', 'shadowing', 'variables'],
  },
  {
    name: 'no-unneeded-ternary',
    category: 'suggestions',
    descriptionEn: 'Disallow ternary operators when simpler alternatives exist (e.g. x ? true : false).',
    descriptionId: 'Melarang penggunaan operator ternary yang tidak perlu (contoh: x ? true : false yang bisa diganti Boolean(x)).',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Ternary redundan yang mengembalikan boolean
const hasAccess = user.isAdmin ? true : false;`,
    correctExample: `// ✅ Gunakan konversi boolean atau ekspresi langsung
const hasAccess = Boolean(user.isAdmin);
// atau: const hasAccess = !!user.isAdmin;`,
    errorExplanationEn: 'Ternary statements returning literal `true` or `false` can be written much cleaner as boolean expressions.',
    errorExplanationId: 'Ternary yang hanya mengembalikan nilai true/false dapat disederhanakan langsung menjadi ekspresi boolean.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unneeded-ternary',
    tags: ['ternary', 'boolean', 'clean-code'],
  },
  {
    name: 'no-unused-expressions',
    category: 'suggestions',
    descriptionEn: 'Disallow unused expressions that have no effect on state.',
    descriptionId: 'Melarang ekspresi yang tidak memiliki efek apa pun pada eksekusi program.',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Ekspresi tanpa penugasan atau pemanggilan fungsi
i + 1;
user.name;`,
    correctExample: `// ✅ Tugaskan nilai atau panggil method
i += 1;
console.log(user.name);`,
    errorExplanationEn: 'Standalone expressions that neither assign values nor trigger functions are dead operations.',
    errorExplanationId: 'Ekspresi yang berdiri sendiri tanpa penugasan atau efek samping adalah operasi mati.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-unused-expressions',
    tags: ['expressions', 'dead-code', 'logic'],
  },
  {
    name: 'no-useless-catch',
    category: 'suggestions',
    descriptionEn: 'Disallow unnecessary catch clauses that just rethrow the original error.',
    descriptionId: 'Melarang blok catch yang hanya melempar kembali (re-throw) error tanpa memprosesnya.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Blok try/catch tidak berguna karena hanya melempar error asli
try {
  doRiskyOperation();
} catch (err) {
  throw err;
}`,
    correctExample: `// ✅ Tangani error atau biarkan error meluap secara natural tanpa catch
try {
  doRiskyOperation();
} catch (err) {
  logger.error('Failed risky operation:', err);
  throw new CustomError('Operation failed', err);
}`,
    errorExplanationEn: 'Catch blocks that only rethrow the caught error add boilerplate without adding any value.',
    errorExplanationId: 'Blok catch yang hanya melempar kembali error tanpa logging atau wrapping hanya menambah kode yang tidak berguna.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-useless-catch',
    tags: ['try-catch', 'error-handling', 'boilerplate'],
  },
  {
    name: 'no-useless-concat',
    category: 'suggestions',
    descriptionEn: 'Disallow unnecessary concatenation of literals or template literals (e.g. "a" + "b").',
    descriptionId: 'Melarang penggabungan string literal yang tidak perlu (contoh: "a" + "b").',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Menggabungkan dua string literal konstan
const title = "Hello " + "World";`,
    correctExample: `// ✅ Satukan menjadi satu string utuh
const title = "Hello World";`,
    errorExplanationEn: 'Concatenating string constants at authoring time adds pointless overhead and reduces readability.',
    errorExplanationId: 'Menggabungkan string konstan dengan operator + memperlambat pembacaan kode tanpa tujuan nyata.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-useless-concat',
    tags: ['strings', 'concatenation', 'clean-code'],
  },
  {
    name: 'no-useless-return',
    category: 'suggestions',
    descriptionEn: 'Disallow redundant return statements at the end of functions.',
    descriptionId: 'Melarang pernyataan "return;" yang tidak berguna di baris akhir fungsi.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ return; di akhir fungsi tidak memiliki efek apa pun
function logUser(user) {
  console.log(user.name);
  return; // Redundan!
}`,
    correctExample: `// ✅ Hapus return di baris terakhir
function logUser(user) {
  console.log(user.name);
}`,
    errorExplanationEn: 'An empty `return;` at the very end of a function body does nothing and should be omitted.',
    errorExplanationId: 'Pernyataan return kosong di baris paling akhir fungsi tidak memiliki efek dan sebaiknya dihapus.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-useless-return',
    tags: ['return', 'clean-code', 'refactoring'],
  },
  {
    name: 'no-var',
    category: 'suggestions',
    descriptionEn: 'Require "let" or "const" instead of "var" (Modern ES6 scope).',
    descriptionId: 'Mewajibkan penggunaan "const" atau "let" alih-alih kata kunci jadul "var".',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Menggunakan 'var' yang memiliki function-scope & hoisting berbahaya
var count = 10;
var title = 'My Project';`,
    correctExample: `// ✅ Gunakan 'const' untuk nilai tetap atau 'let' untuk nilai dinamis
const title = 'My Project';
let count = 10;`,
    errorExplanationEn: '`var` has function scope and confusing hoisting behaviors that cause scope leaks. Modern code uses block-scoped `const` and `let`.',
    errorExplanationId: '`var` memiliki cakupan function-scope yang dapat bocor ke luar blok loop/if. Gunakan `const` atau `let`.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-var',
    tags: ['es6', 'variables', 'var', 'scope'],
  },
  {
    name: 'object-shorthand',
    category: 'suggestions',
    descriptionEn: 'Require ES6 method and property shorthand syntax for object literals.',
    descriptionId: 'Mewajibkan penulisan ringkas properti objek ES6 (contoh: { name } bukan { name: name }).',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Menulis nama properti dan variabel dua kali
const user = {
  name: name,
  age: age,
  greet: function() { console.log('Hello'); }
};`,
    correctExample: `// ✅ Gunakan ES6 property shorthand
const user = {
  name,
  age,
  greet() { console.log('Hello'); }
};`,
    errorExplanationEn: 'Object shorthand notation is more concise and idiomatic in modern JavaScript.',
    errorExplanationId: 'Sintaks object shorthand lebih ringkas dan merupakan standar modern JavaScript.',
    docsUrl: 'https://eslint.org/docs/latest/rules/object-shorthand',
    tags: ['objects', 'es6', 'shorthand'],
  },
  {
    name: 'prefer-arrow-callback',
    category: 'suggestions',
    descriptionEn: 'Require using arrow functions for callbacks.',
    descriptionId: 'Menyarankan penggunaan arrow function (() => {}) sebagai callback fungsi.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ function callback biasa yang mengikat 'this' baru
const doubled = [1, 2, 3].map(function(n) {
  return n * 2;
});`,
    correctExample: `// ✅ Gunakan arrow function yang bersih
const doubled = [1, 2, 3].map(n => n * 2);`,
    errorExplanationEn: 'Arrow functions have concise syntax and preserve lexical `this` context without manual binding.',
    errorExplanationId: 'Arrow function lebih ringkas dan menjaga konteks lexical `this` tanpa perlu binding manual.',
    docsUrl: 'https://eslint.org/docs/latest/rules/prefer-arrow-callback',
    tags: ['arrow-functions', 'callbacks', 'es6'],
  },
  {
    name: 'prefer-const',
    category: 'suggestions',
    descriptionEn: 'Require "const" declarations for variables that are never reassigned after declaration.',
    descriptionId: 'Mewajibkan "const" untuk variabel yang nilainya tidak pernah diubah setelah inisialisasi.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ 'let' digunakan padahal nilai tidak pernah diubah
let apiUrl = 'https://api.example.com';
fetch(apiUrl);`,
    correctExample: `// ✅ Gunakan 'const' untuk menandakan nilai tidak berubah
const apiUrl = 'https://api.example.com';
fetch(apiUrl);`,
    errorExplanationEn: 'Using `const` makes code intent clearer by guaranteeing the variable binding will not be reassigned.',
    errorExplanationId: 'Menggunakan `const` mempertegas niat kode bahwa nilai variabel tersebut bersifat konstan dan aman.',
    docsUrl: 'https://eslint.org/docs/latest/rules/prefer-const',
    tags: ['variables', 'const', 'immutability'],
  },
  {
    name: 'prefer-destructuring',
    category: 'suggestions',
    descriptionEn: 'Require destructuring from arrays and/or objects.',
    descriptionId: 'Menyarankan penggunaan destructuring untuk mengekstrak properti objek atau elemen array.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Mengakses properti satu per satu secara manual
const firstName = user.firstName;
const lastName = user.lastName;`,
    correctExample: `// ✅ Gunakan destructuring yang elegan
const { firstName, lastName } = user;`,
    errorExplanationEn: 'Destructuring syntax reduces repetitive property access and improves readability.',
    errorExplanationId: 'Destructuring mengurangi penulisan nama objek berulang kali dan membuat kode lebih ekspresif.',
    docsUrl: 'https://eslint.org/docs/latest/rules/prefer-destructuring',
    tags: ['destructuring', 'objects', 'es6'],
  },
  {
    name: 'prefer-spread',
    category: 'suggestions',
    descriptionEn: 'Require spread operators instead of .apply() for passing arguments.',
    descriptionId: 'Mewajibkan penggunaan spread operator (...) dibanding pemanggilan .apply().',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Menggunakan Function.prototype.apply()
const max = Math.max.apply(Math, numbers);`,
    correctExample: `// ✅ Gunakan spread operator (...)
const max = Math.max(...numbers);`,
    errorExplanationEn: 'The spread operator `...` is standard, readable, and avoids confusing `null`/`this` arguments in .apply().',
    errorExplanationId: 'Spread operator (...) jauh lebih mudah dipahami dibanding .apply() gaya lama.',
    docsUrl: 'https://eslint.org/docs/latest/rules/prefer-spread',
    tags: ['spread', 'es6', 'apply'],
  },
  {
    name: 'prefer-template',
    category: 'suggestions',
    descriptionEn: 'Require template literals instead of string concatenation with (+).',
    descriptionId: 'Mewajibkan template literal (\`\${var}\`) dibanding penggabungan string menggunakan tanda tambah (+).',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Penggabungan string dengan tanda '+' yang berantakan
const greeting = 'Halo ' + user.firstName + ' ' + user.lastName + '!';`,
    correctExample: `// ✅ Gunakan template literal (\`...\`) yang bersih
const greeting = \`Halo \${user.firstName} \${user.lastName}!\`;`,
    errorExplanationEn: 'Template literals are much easier to read and maintain than complex string concatenations.',
    errorExplanationId: 'Template literal jauh lebih mudah dibaca dan dirawat dibanding penggabungan string dengan operator +.',
    docsUrl: 'https://eslint.org/docs/latest/rules/prefer-template',
    tags: ['strings', 'template-literals', 'es6'],
  },
  {
    name: 'radix',
    category: 'suggestions',
    descriptionEn: 'Enforce the consistent use of the radix argument to parseInt().',
    descriptionId: 'Mewajibkan pemberian argumen radix (basis bilangan 10) saat memanggil parseInt().',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ parseInt tanpa radix bisa salah parse string berawalan "0"
const count = parseInt('08');`,
    correctExample: `// ✅ Selalu sertakan radix 10 secara eksplisit
const count = parseInt('08', 10);`,
    errorExplanationEn: 'Omitting the radix argument in parseInt() can cause octal or hexadecimal parsing bugs in older environments.',
    errorExplanationId: 'Tidak menyertakan radix pada parseInt() dapat memicu kesalahan parsing angka di beberapa lingkungan JavaScript.',
    docsUrl: 'https://eslint.org/docs/latest/rules/radix',
    tags: ['parsing', 'numbers', 'parseInt'],
  },
  {
    name: 'require-await',
    category: 'suggestions',
    descriptionEn: 'Disallow async functions which have no "await" expression.',
    descriptionId: 'Melarang fungsi async yang di dalamnya sama sekali tidak menggunakan ekspresi "await".',
    recommended: false,
    fixable: false,
    incorrectExample: `// ❌ Fungsi async tanpa await memperlambat eksekusi dan membungkus return value sia-sia
async function calculate(a, b) {
  return a + b;
}`,
    correctExample: `// ✅ Gunakan fungsi sinkron biasa
function calculate(a, b) {
  return a + b;
}`,
    errorExplanationEn: 'Marking a function as async when it contains no await expressions creates unnecessary microtask Promise overhead.',
    errorExplanationId: 'Menandai fungsi dengan async padahal tidak ada await akan menambah overhead Promise yang tidak diperlukan.',
    docsUrl: 'https://eslint.org/docs/latest/rules/require-await',
    tags: ['async', 'performance', 'promises'],
  },
  {
    name: 'yoda',
    category: 'suggestions',
    descriptionEn: 'Require or disallow "Yoda" conditions (e.g. if ("red" === color)).',
    descriptionId: 'Melarang kondisi perbandingan terbalik gaya "Yoda" (contoh: if (42 === count) alih-alih if (count === 42)).',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'mode',
        label: 'Policy',
        type: 'select',
        options: [
          { value: 'never', label: 'Disallow Yoda conditions (Natural: color === "red")' },
          { value: 'always', label: 'Require Yoda conditions ("red" === color)' },
        ],
        default: 'never',
      },
    ],
    incorrectExample: `// ❌ Gaya perbandingan Yoda terbalik yang tidak alami
if ('admin' === user.role) {
  grantAccess();
}`,
    correctExample: `// ✅ Alur baca natural dari kiri ke kanan
if (user.role === 'admin') {
  grantAccess();
}`,
    errorExplanationEn: 'Natural order (`variable === literal`) is much easier to read than inverted Yoda syntax.',
    errorExplanationId: 'Urutan perbandingan alami (`variabel === nilai`) jauh lebih mudah dibaca dan dipahami.',
    docsUrl: 'https://eslint.org/docs/latest/rules/yoda',
    tags: ['conditions', 'style', 'readability'],
  },

  // ================= LAYOUT & FORMATTING =================
  {
    name: 'comma-dangle',
    category: 'layout',
    descriptionEn: 'Require or disallow trailing commas in multiline objects and arrays.',
    descriptionId: 'Mengatur aturan koma di akhir (trailing comma) pada objek dan array multi-baris untuk git diff yang bersih.',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'style',
        label: 'Comma Style',
        type: 'select',
        options: [
          { value: 'always-multiline', label: 'Always on multiline (Clean Git Diff)' },
          { value: 'never', label: 'Never allow trailing commas' },
          { value: 'always', label: 'Always' },
        ],
        default: 'always-multiline',
      },
    ],
    incorrectExample: `// ❌ Lupa koma penutup di baris terakhir objek multi-baris
const user = {
  id: 1,
  name: 'Alice' // Menambah baris baru akan memicu git diff 2 baris!
};`,
    correctExample: `// ✅ Gunakan trailing comma pada multi-baris
const user = {
  id: 1,
  name: 'Alice',
};`,
    errorExplanationEn: 'Trailing commas on multiline items reduce git diff noise when adding new properties later.',
    errorExplanationId: 'Trailing comma pada baris bertingkat membuat riwayat Git diff sangat bersih ketika menambah baris baru.',
    docsUrl: 'https://eslint.org/docs/latest/rules/comma-dangle',
    tags: ['git', 'formatting', 'commas'],
  },
  {
    name: 'indent',
    category: 'layout',
    descriptionEn: 'Enforce consistent indentation (spaces or tabs).',
    descriptionId: 'Memastikan konsistensi indentasi spasi pada seluruh baris kode.',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'spaces',
        label: 'Indent Width',
        type: 'select',
        options: [
          { value: 2, label: '2 Spaces (Standard)' },
          { value: 4, label: '4 Spaces' },
          { value: 'tab', label: 'Tabs' },
        ],
        default: 2,
      },
    ],
    incorrectExample: `// ❌ Indentasi tidak konsisten (campuran 4 spasi dan 2 spasi)
function greet() {
    const msg = 'Halo';
  console.log(msg);
}`,
    correctExample: `// ✅ Indentasi rapi dan seragam 2 spasi
function greet() {
  const msg = 'Halo';
  console.log(msg);
}`,
    errorExplanationEn: 'Inconsistent indentation makes code messy, distracting, and harder to visually parse.',
    errorExplanationId: 'Indentasi yang tidak konsisten membuat struktur blok kode sulit dibaca secara visual.',
    docsUrl: 'https://eslint.org/docs/latest/rules/indent',
    tags: ['spacing', 'indentation', 'formatting'],
  },
  {
    name: 'no-multi-spaces',
    category: 'layout',
    descriptionEn: 'Disallow multiple spaces around expressions.',
    descriptionId: 'Melarang penggunaan spasi ganda yang berlebihan di dalam baris kode.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Spasi berlebihan di antara kata
const x   =   10;
const y  =   20;`,
    correctExample: `// ✅ Spasi tunggal yang rapi
const x = 10;
const y = 20;`,
    errorExplanationEn: 'Multiple unnecessary spaces create visual clutter and inconsistent code styling.',
    errorExplanationId: 'Spasi ganda yang tidak teratur membuat gaya penulisan kode terlihat berantakan.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-multi-spaces',
    tags: ['formatting', 'spaces', 'clean-code'],
  },
  {
    name: 'no-multiple-empty-lines',
    category: 'layout',
    descriptionEn: 'Disallow multiple empty lines consecutively.',
    descriptionId: 'Melarang baris kosong berturut-turut yang berlebihan.',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'max',
        label: 'Maximum Consecutive Empty Lines',
        type: 'number',
        default: 1,
      },
    ],
    incorrectExample: `// ❌ Banyak baris kosong berlebihan


function start() { }`,
    correctExample: `// ✅ Maksimal 1 baris kosong pemisah
function start() { }`,
    errorExplanationEn: 'Excessive empty lines waste screen real estate and break reading flow.',
    errorExplanationId: 'Terlalu banyak baris kosong membuang ruang layar dan memecah fokus pembacaan kode.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-multiple-empty-lines',
    tags: ['whitespace', 'formatting', 'lines'],
  },
  {
    name: 'no-trailing-spaces',
    category: 'layout',
    descriptionEn: 'Disallow trailing whitespace at the end of lines.',
    descriptionId: 'Melarang spasi sisa di ujung akhir baris kode.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Terdapat spasi tak terlihat di ujung baris
const user = 'John';    `,
    correctExample: `// ✅ Bersihkan spasi di ujung baris
const user = 'John';`,
    errorExplanationEn: 'Trailing spaces are invisible artifacts that cause noisy git diffs.',
    errorExplanationId: 'Spasi di ujung baris tidak terlihat namun mengotori riwayat commit Git.',
    docsUrl: 'https://eslint.org/docs/latest/rules/no-trailing-spaces',
    tags: ['git', 'whitespace', 'formatting'],
  },
  {
    name: 'object-curly-spacing',
    category: 'layout',
    descriptionEn: 'Enforce consistent spacing inside object literal braces ({ a: 1 } vs {a: 1}).',
    descriptionId: 'Memastikan spasi konsisten di dalam kurung kurawal objek literal ({ foo: bar }).',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'style',
        label: 'Spacing Style',
        type: 'select',
        options: [
          { value: 'always', label: 'Always include space ({ foo })' },
          { value: 'never', label: 'Never include space ({foo})' },
        ],
        default: 'always',
      },
    ],
    incorrectExample: `// ❌ Kurung kurawal menempel tanpa spasi
const point = {x: 10, y: 20};`,
    correctExample: `// ✅ Berikan spasi di dalam kurung kurawal
const point = { x: 10, y: 20 };`,
    errorExplanationEn: 'Consistent spacing inside object braces improves readability and avoids cramped syntax.',
    errorExplanationId: 'Spasi di dalam kurung kurawal objek membuat kode lebih nyaman dibaca dan tidak sesak.',
    docsUrl: 'https://eslint.org/docs/latest/rules/object-curly-spacing',
    tags: ['objects', 'brackets', 'formatting'],
  },
  {
    name: 'quotes',
    category: 'layout',
    descriptionEn: 'Enforce the consistent use of either backticks, double, or single quotes.',
    descriptionId: 'Memastikan konsistensi jenis tanda petik string (single quote, double quote, atau backticks).',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'quoteType',
        label: 'Quote Type',
        type: 'select',
        options: [
          { value: 'single', label: 'Single Quotes (\'example\')' },
          { value: 'double', label: 'Double Quotes ("example")' },
          { value: 'backtick', label: 'Backticks (`example`)' },
        ],
        default: 'single',
      },
    ],
    incorrectExample: `// ❌ Menggunakan tanda petik ganda padahal standarnya single-quote
const appName = "My Application";
const version = "1.0.0";`,
    correctExample: `// ✅ Gunakan tanda petik tunggal secara konsisten
const appName = 'My Application';
const version = '1.0.0';`,
    errorExplanationEn: 'Mixing single and double quotes inconsistently degrades codebase aesthetic uniformity.',
    errorExplanationId: 'Mencampur tanda kutip ganda dan tunggal secara acak merusak kerapian standar kode tim.',
    docsUrl: 'https://eslint.org/docs/latest/rules/quotes',
    tags: ['strings', 'quotes', 'formatting'],
  },
  {
    name: 'semi',
    category: 'layout',
    descriptionEn: 'Require or disallow semicolons instead of relying on ASI (Automatic Semicolon Insertion).',
    descriptionId: 'Mewajibkan atau melarang penggunaan titik koma (semicolon) secara konsisten pada akhir baris.',
    recommended: false,
    fixable: true,
    hasOptions: true,
    optionsSchema: [
      {
        name: 'style',
        label: 'Semicolon Policy',
        type: 'select',
        options: [
          { value: 'always', label: 'Always require semicolons (;)' },
          { value: 'never', label: 'Never use semicolons (StandardJS)' },
        ],
        default: 'always',
      },
    ],
    incorrectExample: `// ❌ Lupa titik koma penutup statement
const x = 10
const y = 20
console.log(x + y)`,
    correctExample: `// ✅ Selalu akhiri baris dengan titik koma
const x = 10;
const y = 20;
console.log(x + y);`,
    errorExplanationEn: 'Relying on Automatic Semicolon Insertion (ASI) can introduce subtle parsing ambiguities.',
    errorExplanationId: 'Mengandalkan ASI (penyisipan titik koma otomatis) dapat memicu bug parsing JavaScript.',
    docsUrl: 'https://eslint.org/docs/latest/rules/semi',
    tags: ['semicolons', 'asi', 'formatting'],
  },
  {
    name: 'space-before-blocks',
    category: 'layout',
    descriptionEn: 'Enforce consistent spacing before blocks (e.g. if (test) {).',
    descriptionId: 'Memastikan spasi sebelum pembuka blok kurung kurawal (contoh: if (test) {).',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Blok kurung kurawal menempel tanpa spasi
if (isValid){
  save();
}`,
    correctExample: `// ✅ Berikan 1 spasi sebelum kurung kurawal buka
if (isValid) {
  save();
}`,
    errorExplanationEn: 'Missing space before blocks looks cramped and violates standard styling conventions.',
    errorExplanationId: 'Kurang spasi sebelum kurung kurawal terlihat padat dan menyalahi konvensi format kode.',
    docsUrl: 'https://eslint.org/docs/latest/rules/space-before-blocks',
    tags: ['formatting', 'spacing', 'blocks'],
  },
  {
    name: 'spaced-comment',
    category: 'layout',
    descriptionEn: 'Enforce consistent spacing after // or /* in comments.',
    descriptionId: 'Memastikan adanya spasi setelah tanda komentar // atau /* (contoh: // Komentar).',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Teks komentar menempel langsung dengan garis miring
//Komentar tanpa spasi`,
    correctExample: `// ✅ Selalu beri spasi setelah garis miring komentar
// Komentar dengan spasi yang rapi`,
    errorExplanationEn: 'Comments starting immediately without space look messy and are harder to skim.',
    errorExplanationId: 'Komentar yang menempel langsung tanpa spasi lebih sulit dipindai oleh mata programmer.',
    docsUrl: 'https://eslint.org/docs/latest/rules/spaced-comment',
    tags: ['comments', 'formatting', 'clean-code'],
  },

  // ================= TYPESCRIPT RULES =================
  {
    name: '@typescript-eslint/no-explicit-any',
    category: 'typescript',
    descriptionEn: 'Disallow usage of the "any" type (Enforce type safety).',
    descriptionId: 'Melarang penggunaan tipe data "any" untuk menjaga keamanan tipe statis TypeScript.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Menggunakan 'any' yang mematikan pengecekan tipe data
function processData(payload: any) {
  console.log(payload.nonExistentProperty.deep); // Runtime Crash!
}`,
    correctExample: `// ✅ Gunakan 'unknown' atau interface yang jelas
interface UserPayload {
  id: string;
  name: string;
}
function processData(payload: UserPayload) {
  console.log(payload.name);
}`,
    errorExplanationEn: 'Using `any` turns off TypeScript type checking completely, forfeiting all type-safety guarantees.',
    errorExplanationId: 'Tipe `any` mematikan sistem proteksi TypeScript sehingga bug fatal tidak terdeteksi saat kompilasi.',
    docsUrl: 'https://typescript-eslint.io/rules/no-explicit-any/',
    tags: ['typescript', 'types', 'type-safety'],
  },
  {
    name: '@typescript-eslint/consistent-type-imports',
    category: 'typescript',
    descriptionEn: 'Enforce consistent usage of type-only imports (import type { User }).',
    descriptionId: 'Mewajibkan penggunaan "import type" untuk impor tipe data murni demi efisiensi bundling.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Mengimpor type sebagai nilai biasa
import { User, Role } from './types';`,
    correctExample: `// ✅ Gunakan 'import type' eksplisit
import type { User, Role } from './types';`,
    errorExplanationEn: 'Type-only imports are completely stripped at compile time, reducing bundle bloat and avoiding circular dependency issues.',
    errorExplanationId: '`import type` dihapus saat kompilasi sehingga bundler lebih cepat dan mencegah siklus dependensi sirkular.',
    docsUrl: 'https://typescript-eslint.io/rules/consistent-type-imports/',
    tags: ['typescript', 'imports', 'performance'],
  },
  {
    name: '@typescript-eslint/no-non-null-assertion',
    category: 'typescript',
    descriptionEn: 'Disallow non-null assertions using the "!" postfix operator.',
    descriptionId: 'Melarang pemaksaan non-null assertion dengan operator "!" (contoh: user!.name).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Memaksa TypeScript mengabaikan kemungkinan null/undefined
const user = findUserById(id);
console.log(user!.name); // Berisiko runtime crash jika user bernilai null!`,
    correctExample: `// ✅ Gunakan optional chaining atau validasi eksplisit
const user = findUserById(id);
if (user) {
  console.log(user.name);
}`,
    errorExplanationEn: 'The `!` operator suppresses type errors without doing actual runtime validation, leading to Uncaught TypeError crashes.',
    errorExplanationId: 'Operator `!` menipu compiler tanpa ada validasi runtime sesungguhnya, memicu crash jika nilai null.',
    docsUrl: 'https://typescript-eslint.io/rules/no-non-null-assertion/',
    tags: ['typescript', 'safety', 'null-safety'],
  },
  {
    name: '@typescript-eslint/prefer-nullish-coalescing',
    category: 'typescript',
    descriptionEn: 'Enforce using the nullish coalescing operator (??) instead of logical OR (||).',
    descriptionId: 'Menyarankan penggunaan nullish coalescing (??) dibanding logical OR (||) untuk fallback nilai.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Operator || menimpa angka 0 atau string kosong ""
const timeout = config.timeout || 5000; // Jika timeout = 0, malah jadi 5000!`,
    correctExample: `// ✅ Operator ?? hanya mengecek null dan undefined
const timeout = config.timeout ?? 5000;`,
    errorExplanationEn: '`||` checks for any falsy value (treating `0`, `false`, and `""` as empty), while `??` specifically checks for null or undefined.',
    errorExplanationId: 'Operator `||` menganggap 0 atau string kosong sebagai false, sedangkan `??` hanya aktif jika null/undefined.',
    docsUrl: 'https://typescript-eslint.io/rules/prefer-nullish-coalescing/',
    tags: ['typescript', 'nullish', 'logic'],
  },
  {
    name: '@typescript-eslint/await-thenable',
    category: 'typescript',
    descriptionEn: 'Disallow awaiting a value that is not a Thenable/Promise.',
    descriptionId: 'Melarang penggunaan await pada nilai yang bukan merupakan Promise/Thenable.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Melakukan await pada nilai biasa yang bukan Promise
const result = await (10 + 20);`,
    correctExample: `// ✅ Hanya panggil await pada fungsi Promise
const result = await fetchUserData();`,
    errorExplanationEn: 'Awaiting non-promise values is unnecessary and can hide logic errors where an asynchronous call was intended.',
    errorExplanationId: 'Melakukan await pada nilai biasa tidak memiliki efek dan menandakan kesalahpahaman alur asinkron.',
    docsUrl: 'https://typescript-eslint.io/rules/await-thenable/',
    tags: ['typescript', 'async', 'promises'],
  },
  {
    name: '@typescript-eslint/no-floating-promises',
    category: 'typescript',
    descriptionEn: 'Require Promise-like statements to be handled appropriately with await, then, or catch.',
    descriptionId: 'Mewajibkan penanganan Promise dengan await atau catch agar error tidak terabaikan.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Promise dijalankan tanpa await atau catch (unhandled error!)
async function sync() {
  saveDataToServer(); // Jika gagal, error tidak tertangkap!
}`,
    correctExample: `// ✅ Tangani dengan await atau catch
async function sync() {
  await saveDataToServer();
}`,
    errorExplanationEn: 'Floating promises that reject without handlers cause unhandled promise rejections in Node.js and browsers.',
    errorExplanationId: 'Promise yang tidak di-await atau di-catch akan memicu Unhandled Promise Rejection saat terjadi error.',
    docsUrl: 'https://typescript-eslint.io/rules/no-floating-promises/',
    tags: ['typescript', 'promises', 'async', 'error-handling'],
  },

  // ================= REACT & HOOKS =================
  {
    name: 'react-hooks/rules-of-hooks',
    category: 'react',
    descriptionEn: 'Enforce Rules of Hooks (only call Hooks at the top level, never inside conditions/loops).',
    descriptionId: 'Menegakkan Aturan Dasar React Hooks (hanya panggil Hook di top level komponen, tidak boleh di dalam if/loop).',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Memanggil hook di dalam percabangan if (Crash React!)
function UserProfile({ isLoggedIn }) {
  if (isLoggedIn) {
    useEffect(() => {
      loadProfile();
    }, []);
  }
  return <div>Profile</div>;
}`,
    correctExample: `// ✅ Selalu panggil Hook di tingkat teratas komponen
function UserProfile({ isLoggedIn }) {
  useEffect(() => {
    if (isLoggedIn) {
      loadProfile();
    }
  }, [isLoggedIn]);
  return <div>Profile</div>;
}`,
    errorExplanationEn: 'React relies on hook call order being identical on every render. Calling hooks inside conditions breaks internal state.',
    errorExplanationId: 'React mengandalkan urutan pemanggilan hook yang konsisten di setiap render. Pemanggilan di dalam `if` merusak internal state React.',
    docsUrl: 'https://react.dev/reference/rules/rules-of-hooks',
    tags: ['react', 'hooks', 'react-hooks'],
  },
  {
    name: 'react-hooks/exhaustive-deps',
    category: 'react',
    descriptionEn: 'Verify the list of dependencies for Hooks like useEffect and useCallback.',
    descriptionId: 'Memverifikasi kelengkapan array dependensi pada useEffect, useMemo, dan useCallback untuk mencegah stale closure.',
    recommended: true,
    fixable: true,
    incorrectExample: `// ❌ Lupa memasukkan 'userId' ke dependency array (Stale Data!)
useEffect(() => {
  fetchUser(userId);
}, []); // Warning: 'userId' hilang!`,
    correctExample: `// ✅ Masukkan semua variabel reaktif ke dependency array
useEffect(() => {
  fetchUser(userId);
}, [userId]);`,
    errorExplanationEn: 'Missing dependencies inside useEffect causes stale closure bugs where the effect retains outdated variables.',
    errorExplanationId: 'Dependensi yang hilang pada useEffect menyebabkan bug data usang (stale closure) yang sulit dilacak.',
    docsUrl: 'https://react.dev/reference/react/useEffect#specifying-reactive-dependencies',
    tags: ['react', 'hooks', 'useeffect', 'dependencies'],
  },
  {
    name: 'react/jsx-key',
    category: 'react',
    descriptionEn: 'Disallow missing "key" props in JSX iterators/arrays.',
    descriptionId: 'Melarang rendering elemen array JSX tanpa properti "key" unik.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Render list tanpa properti 'key' unik
return (
  <ul>
    {items.map(item => (
      <li>{item.name}</li>
    ))}
  </ul>
);`,
    correctExample: `// ✅ Berikan properti 'key' yang stabil dan unik
return (
  <ul>
    {items.map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
);`,
    errorExplanationEn: 'React uses `key` props to identify which items have changed, moved, or been deleted during reconciliation.',
    errorExplanationId: 'React membutuhkan `key` unik untuk mencocokkan elemen DOM virtual saat re-render daftar array.',
    docsUrl: 'https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md',
    tags: ['react', 'jsx', 'keys', 'rendering'],
  },
  {
    name: 'react/self-closing-comp',
    category: 'react',
    descriptionEn: 'Enforce self-closing tags for JSX components without children (e.g. <Card />).',
    descriptionId: 'Mewajibkan penulisan self-closing tag (<Component />) untuk komponen tanpa anak/children.',
    recommended: false,
    fixable: true,
    incorrectExample: `// ❌ Menulis tag penutup terpisah padahal tidak ada children
<Avatar src="/user.png"></Avatar>`,
    correctExample: `// ✅ Gunakan self-closing tag yang rapi
<Avatar src="/user.png" />`,
    errorExplanationEn: 'Components with no children should self-close to keep JSX syntax clean and compact.',
    errorExplanationId: 'Komponen tanpa elemen anak sebaiknya menggunakan self-closing tag agar JSX lebih ringkas.',
    docsUrl: 'https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md',
    tags: ['react', 'jsx', 'formatting'],
  },
  {
    name: 'react/no-unescaped-entities',
    category: 'react',
    descriptionEn: 'Disallow unescaped HTML entities (like >, ", \', }) in JSX.',
    descriptionId: 'Melarang karakter entitas HTML tanpa escape (seperti tanda petik \' atau kutip ") langsung di dalam teks JSX.',
    recommended: true,
    fixable: false,
    incorrectExample: `// ❌ Tanda kutip unescaped bisa membingungkan parser JSX
return <div>Don't forget to submit!</div>;`,
    correctExample: `// ✅ Gunakan HTML entity atau string escape
return <div>Don&apos;t forget to submit!</div>;
// atau: return <div>{"Don't forget to submit!"}</div>;`,
    errorExplanationEn: 'Unescaped quotes or angle brackets inside JSX text can confuse the JSX parser and create syntax ambiguities.',
    errorExplanationId: 'Karakter tanda petik di dalam JSX dapat merusak parsing JSX. Gunakan `&apos;` atau `{"..."}`.',
    docsUrl: 'https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md',
    tags: ['react', 'jsx', 'html-entities'],
  },
  {
    name: 'react/jsx-no-target-blank',
    category: 'react',
    descriptionEn: 'Disallow target="_blank" on links without rel="noreferrer".',
    descriptionId: 'Melarang atribut target="_blank" pada tautan <a> tanpa rel="noreferrer" demi keamanan tab-napping.',
    recommended: true,
    fixable: true,
    incorrectExample: `// ❌ Link eksternal tanpa rel="noreferrer" rawan serangan window.opener
<a href="https://external.com" target="_blank">
  Kunjungi Web
</a>`,
    correctExample: `// ✅ Selalu sertakan rel="noopener noreferrer"
<a href="https://external.com" target="_blank" rel="noopener noreferrer">
  Kunjungi Web
</a>`,
    errorExplanationEn: 'Opening links with target="_blank" without `rel="noreferrer"` allows the target page to manipulate your tab via window.opener.',
    errorExplanationId: 'Membuka link target="_blank" tanpa rel="noreferrer" memungkinkan halaman tujuan mengakses objek window.opener.',
    docsUrl: 'https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md',
    tags: ['react', 'security', 'links', 'tabnapping'],
  },
];

export interface EslintPreset {
  id: string;
  name: string;
  nameId: string;
  descriptionEn: string;
  descriptionId: string;
  rules: Record<string, RuleSeverity | [RuleSeverity, any]>;
}

export const ESLINT_PRESETS: EslintPreset[] = [
  {
    id: 'recommended',
    name: 'ESLint Recommended',
    nameId: 'Standar Resmi (ESLint Recommended)',
    descriptionEn: 'Core rules recommended by the official ESLint team to catch common logic bugs and fatal syntax errors.',
    descriptionId: 'Kumpulan aturan inti rekomendasi resmi dari tim ESLint untuk mencegah bug logika dan runtime error fatal.',
    rules: {
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-const-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-debugger': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty-pattern': 'error',
      'no-fallthrough': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-inner-declarations': 'error',
      'no-loss-of-precision': 'error',
      'no-obj-calls': 'error',
      'no-prototype-builtins': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-setter-return': 'error',
      'no-sparse-arrays': 'error',
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': 'error',
      'no-useless-catch': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-key': 'error',
      'react/no-unescaped-entities': 'error',
      'react/jsx-no-target-blank': 'error',
    },
  },
  {
    id: 'strict',
    name: 'Strict / Zero-Tolerance (Enterprise)',
    nameId: 'Super Ketat (Zero-Tolerance Enterprise)',
    descriptionEn: 'Maximum code safety, strict equality, modern syntax, and strong typing.',
    descriptionId: 'Keamanan kode maksimal dengan strict equality, pelarangan console di produksi, dan tipe data ketat.',
    rules: {
      'array-callback-return': 'error',
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',
      'no-cond-assign': 'error',
      'no-constant-binary-expression': 'error',
      'no-constant-condition': 'error',
      'no-debugger': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty-pattern': 'error',
      'no-fallthrough': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-unreachable': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-vars': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-eval': 'error',
      'no-param-reassign': 'error',
      'prefer-template': 'error',
      'no-shadow': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-catch': 'error',
      'no-useless-return': 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-no-target-blank': 'error',
    },
  },
  {
    id: 'airbnb-style',
    name: 'Airbnb Style Guide',
    nameId: 'Standar Komunitas (Airbnb Style)',
    descriptionEn: 'Popular community convention emphasizing clarity, single quotes, and semicolons.',
    descriptionId: 'Konvensi komunitas populer yang menekankan keterbacaan, tanda petik tunggal, dan titik koma.',
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'prefer-spread': 'error',
      'prefer-destructuring': 'warn',
      'object-shorthand': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-param-reassign': 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/self-closing-comp': 'error',
    },
  },
  {
    id: 'clean-minimal',
    name: 'Clean & Minimalist',
    nameId: 'Bersih & Minimalis (Fast DX)',
    descriptionEn: 'Non-intrusive setup that only warns for critical bugs without restricting code style.',
    descriptionId: 'Konfigurasi santai yang hanya memperingatkan bug fatal tanpa membatasi gaya penulisan pribadi.',
    rules: {
      'no-debugger': 'error',
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'warn',
      'no-unused-vars': 'warn',
      'use-isnan': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-key': 'error',
    },
  },
];
