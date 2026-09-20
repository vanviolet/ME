import { Article, VanpediaTerm, Author, ArticleComment, CommunityIssue } from '../types';

export const defaultAuthor: Author = {
  id: 'author-irvan',
  name: 'Muchamad Irvan',
  avatar: '/images/favicon.png',
  role: {
    en: 'Fullstack Software Engineer & System Architect',
    id: 'Fullstack Software Engineer & Arsitek Sistem',
  },
  bio: {
    en: 'Building high-concurrency educational platforms, enterprise web architectures, and audio-visual experiments.',
    id: 'Merancang platform akademik berlatensi rendah, arsitektur web enterprise, serta eksplorasi audio-visual interaktif.',
  },
};

export const articlesData: Article[] = [
  {
    id: 'article-learning-ai-neural-networks',
    slug: 'learning-neural-networks-backpropagation-prompting',
    title: {
      en: 'Demystifying AI: From Perceptrons and Backpropagation to Modern Prompting',
      id: 'Belajar AI dari Nol: Dari Perceptron, Backpropagation hingga Prompt Engineering Modern',
    },
    summary: {
      en: 'A foundational technical guide to neural networks: how weights update via calculus chain rules, activation functions, and why prompt engineering steers latent attention maps.',
      id: 'Panduan teknis mendalam memahami kecerdasan buatan: bagaimana bobot dilatih melalui kalkulus rantai turunan, fungsi aktivasi, serta mengapa prompt engineering memandu ruang laten LLM.',
    },
    content: {
      en: `### 1. The Core Intuition: What is an Artificial Neural Network?

At its most fundamental mathematical abstraction, a [[neural-network]] is a parameterized universal function approximator:

$$f(x; W, b) = \\sigma(W \\cdot x + b)$$

Where $x$ is your input vector, [[matrix-weights|$W$]] represents the [[matrix-weights|matrix of synaptic weights]], [[bias-vector|$b$]] is the [[bias-vector|bias threshold vector]], and [[sigma-symbol|$\\sigma$]] is a non-linear [[activation-function]] such as ReLU ($f(x) = [[max-function|\\max]](0,x)$) or GELU.

Without non-linear activation functions, stacking a hundred layers of matrix multiplications collapses into a single linear transformation ($W_2(W_1 x) = (W_2 W_1)x$). Non-linearities are what allow modern networks to learn intricate topological manifolds — distinguishing between handwritten digits, facial features, or language semantics.

### 2. How Learning Happens: Loss Functions and Gradient Descent

A newly initialized network knows nothing; its weights are random Gaussian noise. When we feed an input $x$, it produces a prediction $\\hat{y}$. We calculate the error using a loss function $L(y, \\hat{y})$ (such as Mean Squared Error with [[summation-sigma|summation $\\Sigma$]] or Cross-Entropy).

To minimize this loss, we utilize [[gradient-descent]]:

$$W \\leftarrow W - \\eta \\nabla_W L$$

Where $\\eta$ is the learning rate (the step size), and [[nabla-gradient|$\\nabla_W L$]] is the [[nabla-gradient|gradient vector]] of [[partial-derivative|partial derivatives]] pointing toward the steepest increase in error. Moving in the negative direction reduces error.

### 3. The Engine of Modern AI: Backpropagation

How do we efficiently compute the [[partial-derivative|partial derivative $\\frac{\\partial L}{\\partial W}$]] for millions — or billions — of parameters across deep layers?

The answer is [[backpropagation]], an elegant application of the chain rule of calculus:

$$\\frac{\\partial L}{\\partial W_{ij}^{(l)}} = \\frac{\\partial L}{\\partial z_j^{(l)}} \\cdot \\frac{\\partial z_j^{(l)}}{\\partial W_{ij}^{(l)}}$$

By propagating error gradients backwards from the final output layer through intermediate hidden layers, we compute all gradients in a single reverse sweep with time complexity proportional to the forward pass.

### 4. The Leap to Modern Generative AI and Prompt Engineering

In modern Transformer architectures (such as GPT-4, Claude, and Gemini), billions of parameters are pre-trained on massive corpora using next-token self-supervised prediction.

This is where [[prompt-engineering]] comes in. Rather than modifying model weights $W$ at runtime, prompting acts as *in-context condition steering*. A well-crafted prompt primes the multi-head self-attention mechanism:
- **Chain-of-Thought (CoT)** forces the model to generate intermediate reasoning tokens, preventing premature convergence to high-probability but incorrect completions.
- **Few-Shot Prompting** activates specific task manifolds within the model's high-dimensional latent space.

Mastering AI requires understanding both sides: the mathematical rigor of backpropagation and the semantic steering of modern prompt architecture.`,
      id: `### 1. Intuisi Dasar: Apa Sebenarnya Neural Network?

Secara matematis, sebuah [[neural-network]] (jaringan saraf tiruan) adalah sebuah aproksimator fungsi universal yang memiliki parameter terbobot:

$$f(x; W, b) = \\sigma(W \\cdot x + b)$$

Di mana $x$ adalah vektor input, [[matrix-weights|$W$]] merepresentasikan [[matrix-weights|matriks bobot sinaptik]], [[bias-vector|$b$]] adalah [[bias-vector|vektor bias offset]], dan [[sigma-symbol|$\\sigma$]] adalah [[activation-function]] non-linear seperti ReLU ($f(x)=[[max-function|\\max]](0,x)$) atau GELU.

Tanpa fungsi aktivasi non-linear, menumpuk seratus lapisan matriks perkalian akan selalu runtuh kembali menjadi satu transformasi linear biasa ($W_2(W_1 x) = (W_2 W_1)x$). Fungsi non-linear inilah yang memungkinkan jaringan saraf mempelajari pola dunia nyata yang kompleks — seperti mengenali wajah, memproses suara, hingga memahami tata bahasa.

### 2. Bagaimana Mesin Belajar: Loss Function dan Gradient Descent

Ketika pertama kali dibuat, jaringan belum tahu apa-apa; bobotnya berupa angka acak. Saat diberikan input $x$, jaringan mengeluarkan prediksi $\\hat{y}$. Kita mengukur seberapa melenceng jawaban ini dengan Loss Function $L(y, \\hat{y})$ (seperti MSE berbasis [[summation-sigma|notasi penjumlahan $\\sum$]] atau Cross-Entropy).

Untuk meminimalkan error tersebut, kita menerapkan algoritma [[gradient-descent]]:

$$W \\leftarrow W - \\eta \\nabla_W L$$

Di mana $\\eta$ adalah laju pembelajaran (*learning rate*), dan [[nabla-gradient|$\\nabla_W L$]] adalah [[nabla-gradient|vektor gradien]] lereng kecuraman error. Kita melangkah ke arah berlawanan untuk menurunkan nilai error.

### 3. Jantung Pembelajaran Mesin: Backpropagation

Bagaimana cara menghitung [[partial-derivative|turunan parsial $\\frac{\\partial L}{\\partial W}$]] untuk jutaan atau miliaran bobot di setiap lapisan tersembunyi (*hidden layer*) secara efisien?

Jawabannya adalah [[backpropagation]], yang memanfaatkan aturan rantai (*chain rule*) kalkulus diferensial:

$$\\frac{\\partial L}{\\partial W_{ij}^{(l)}} = \\frac{\\partial L}{\\partial z_j^{(l)}} \\cdot \\frac{\\partial z_j^{(l)}}{\\partial W_{ij}^{(l)}}$$

Dengan mengalirkan gradien error dari layer output paling belakang mundur ke depan, seluruh turunan bobot dapat dihitung hanya dalam satu siklus balik (*backward pass*).

### 4. Era AI Generatif & Seni Prompt Engineering

Pada model Transformer masa kini (seperti GPT, Claude, atau Gemini), miliaran bobot sudah dilatih terlebih dahulu (*pre-trained*) untuk memprediksi token kata berikutnya.

Di sinilah peran [[prompt-engineering]]. Saat menggunakan LLM, kita tidak mengubah bobot $W$ model, melainkan memandu mekanisme *Self-Attention*:
- **Chain-of-Thought (CoT)**: Memaksa model menuliskan langkah-langkah penalaran secara eksplisit sebelum menyimpulkan jawaban, mencegah halusinasi.
- **Few-Shot Examples**: Memberikan beberapa contoh format input-output untuk mengarahkan ruang laten representasi model ke domain yang spesifik.

Memahami AI sejati berarti menguasai kedua aspek: logika kalkulus di balik backpropagation serta kepiawaian menyusun prompt untuk memandu model tingkat tinggi.`,
    },
    date: 'March 2024',
    readTime: '7 min read',
    category: 'Learning (AI & Deep Learning)',
    tags: ['Artificial Intelligence', 'Neural Networks', 'Backpropagation', 'Prompting', 'Machine Learning'],
    author: defaultAuthor,
    isAiAssisted: true,
    aiModel: 'Gemini 3.7 Flash',
    featured: true,
    vanpediaTerms: ['neural-network', 'backpropagation', 'gradient-descent', 'activation-function', 'prompt-engineering', 'sigma-symbol', 'matrix-weights', 'bias-vector', 'cdot-product', 'nabla-gradient', 'partial-derivative', 'max-function'],
    relatedArticleSlugs: ['tamper-proof-biometric-attendance', 'quirks-facts-computer-science-programming'],
    views: 1420,
    likes: 42,
    commentsCount: 8,
  },
  {
    id: 'article-quirks-computer-science',
    slug: 'quirks-facts-computer-science-programming',
    title: {
      en: 'Fascinating Facts in Programming: Why 0.1 + 0.2 != 0.3, the First Moth Bug, and Architecture Quirks',
      id: 'Fakta Unik Pemrograman: Mengapa 0.1 + 0.2 != 0.3, Serangga Pertama Grace Hopper, dan Misteri Komputasi',
    },
    summary: {
      en: 'From binary floating-point rounding errors and the billion-dollar null pointer mistake to historical software anomalies that still shape modern software systems.',
      id: 'Menyelami keanehan komputasi: mengapa bilangan desimal biner tidak presisi, asal-usul fisik kata "Bug" tahun 1947, bahaya pointer kosong, hingga rahasia perilaku tak terdefinisi.',
    },
    content: {
      en: `### 1. The Peculiar Case of 0.1 + 0.2 = 0.30000000000000004

If you open the browser console or Node.js REPL and type:
\`\`\`javascript
0.1 + 0.2 === 0.3 // returns false!
0.1 + 0.2 // 0.30000000000000004
\`\`\`

Why does this happen? The answer lies in [[floating-point-arithmetic]] standardized by IEEE 754.

In base 10, the fraction $1/3$ cannot be represented with a finite number of decimal digits ($0.333333...$). Similarly, in base 2 (binary), numbers like $1/10$ ($0.1$) and $1/5$ ($0.2$) are infinite repeating fractions:

$$0.1_{10} = 0.000110011001100110011001100..._2$$

Because computers only have 53 bits of mantissa precision in double-precision 64-bit floats, the number is truncated. When adding them together, rounding discrepancies emerge. In financial software, this is why we **never** store monetary currency as floats; we use integer cents or arbitrary-precision decimal libraries!

### 2. The First Real "Bug" Was a Literal Insect

While the term "bug" for technical flaws predated computing (Thomas Edison used it in mechanical engineering), the first documented computer bug was logged on **September 9, 1947**.

Grace Hopper's team at Harvard University was testing the Mark II Aiken Relay Calculator when system performance degraded. Upon opening relay #70 in Panel F, they found a literal moth trapped between the relay contacts. They taped the moth into their daily logbook with the caption: *"First actual case of bug being found."*

### 3. The Billion-Dollar Mistake: The Null Pointer

In 1965, British computer scientist Sir Tony Hoare invented the [[null-pointer]] while designing the ALGOL W language:

> *"I call it my billion-dollar mistake. It was the invention of the null reference in 1965... This has led to innumerable errors, vulnerabilities, and system crashes, which have probably caused a billion dollars of pain and damage in the last forty years."*

Modern languages like Rust, TypeScript (with strict null checks), and Swift actively protect against null dereferences using \`Option<T>\` / nullable types.

### 4. When Speed Kills: Undefined Behavior & Race Conditions

In systems languages like C and C++, the specification intentionally leaves certain operations as [[undefined-behavior]]. For example, signed integer overflow or dereferencing wild pointers tells the compiler: *"You may assume this situation never happens."*

Compilers optimize aggressively based on these assumptions, sometimes stripping entire validation checks out of compiled binaries! Paired with concurrent threads without synchronization, this causes catastrophic [[race-condition]] bugs that are notoriously difficult to reproduce in development.`,
      id: `### 1. Misteri Aritmatika 0.1 + 0.2 = 0.30000000000000004

Jika Anda membuka console browser atau Node.js dan mengetik:
\`\`\`javascript
0.1 + 0.2 === 0.3 // menghasilkan false!
0.1 + 0.2 // 0.30000000000000004
\`\`\`

Mengapa hal ini terjadi? Penyebabnya adalah standar [[floating-point-arithmetic]] (IEEE 754).

Dalam sistem desimal (basis 10), pecahan $1/3$ tidak dapat ditulis secara tuntas ($0.333333...$). Hal serupa terjadi pada komputer yang bekerja dalam basis 2 (biner): angka seperti $1/10$ ($0.1$) dan $1/5$ ($0.2$) berulang tanpa batas dalam biner:

$$0.1_{10} = 0.000110011001100110011001100..._2$$

Karena float 64-bit hanya memiliki 53 bit presisi mantissa, angka tersebut harus dipotong (dibulatkan). Ketika dijumlahkan, muncul sedikit selisih pada digit desimal ke-17. Inilah alasan mengapa aplikasi perbankan **tidak pernah** menyimpan saldo uang dalam tipe data \`float\`, melainkan bilangan bulat satuan sen (integer) atau library \`BigNumber\`.

### 2. Asal-Usul Kata "Bug": Serangga Ngengat Tahun 1947

Istilah "bug" untuk kerusakan teknis sebenarnya sudah dipakai oleh Thomas Edison di bidang mekanik, namun bug komputer pertama yang benar-benar tercatat secara fisik terjadi pada **9 September 1947**.

Tim ilmuwan komputer Grace Hopper di Universitas Harvard sedang menguji kalkulator mekanik relai Mark II ketika mesin mengalami malfungsi. Saat memeriksa relai nomor 70 di Panel F, mereka menemukan seekor ngengat mati yang terselip di antara lempeng relay. Mereka menempelkan ngengat tersebut di buku catatan harian dengan tulisan legendaris: *"First actual case of bug being found."*

### 3. "The Billion-Dollar Mistake": Penemuan Null Pointer

Pada tahun 1965, ilmuwan komputer ternama Sir Tony Hoare menciptakan konsep [[null-pointer]] saat merancang bahasa ALGOL W:

> *"Saya menyebutnya kesalahan bernilai satu miliar dolar. Penemuan referensi null pada tahun 1965 telah memicu kerugian, kerentanan sistem, dan jutaan crash bernilai miliaran dolar selama empat puluh tahun terakhir."*

Bahasa modern seperti Rust, TypeScript (dengan \`strictNullChecks\`), dan Kotlin kini merancang sistem tipe yang mewajibkan pengecekan nilai null secara ketat di masa kompilasi (*compile-time*).

### 4. Perilaku Berbahaya: Undefined Behavior & Race Condition

Dalam bahasa C/C++, ada konsep yang disebut [[undefined-behavior]]. Artinya, pembuat compiler berhak mengasumsikan kode salah tersebut "tidak akan pernah terjadi", sehingga compiler dapat menghapus baris pengecekan keamanan demi optimasi kecepatan.

Jika digabungkan dengan banyak thread yang membaca dan menulis memori tanpa pengunci (*mutex*), timbullah [[race-condition]] — anomali di mana bug hanya muncul sesekali pada beban trafik tertentu dan sangat sulit dilacak.`,
    },
    date: 'April 2024',
    readTime: '6 min read',
    category: 'Fakta Unik (Pemrograman)',
    tags: ['Computer Science', 'History', 'Quirks', 'JavaScript', 'Algorithms'],
    author: defaultAuthor,
    isAiAssisted: true,
    aiModel: 'Gemini 3.7 Flash',
    featured: true,
    vanpediaTerms: ['floating-point-arithmetic', 'null-pointer', 'undefined-behavior', 'race-condition'],
    relatedArticleSlugs: ['learning-neural-networks-backpropagation-prompting', 'replacing-moodle-nextjs-lms'],
    views: 1890,
    likes: 38,
    commentsCount: 12,
  },
  {
    id: 'article-notelogic-audio',
    slug: 'mathematics-of-music-theory-chords',
    title: {
      en: 'The Mathematics of Musical Harmony: Pitch Classes, Modulo 12, Chord Voicings, and Web Audio',
      id: 'Matematika di Balik Harmoni Musik: Ruang Modulo 12, Formula Chord, dan Web Audio',
    },
    summary: {
      en: 'How I engineered a zero-dependency interactive chord explorer, harmonic formula mathematical model, and multi-track guitar tab editor in React and TypeScript.',
      id: 'Bagaimana harmoni nada, pembentukan chord, dan disonansi tritone dimodelkan dengan matematika modulo 12 serta dibunyikan langsung melalui Web Audio API tanpa sampel file berat.',
    },
    content: {
      en: `### 1. Why Music Theory is Pure Discrete Mathematics

Music theory is often taught as an abstract art of memorizing sheet music and Italian terminology. However, beneath the surface, acoustic harmony is pure mathematics: frequency ratios, modular arithmetic, and set theory.

In 12-Tone Equal Temperament (12-TET), an octave is partitioned into 12 logarithmic intervals called [[semitone]] steps. The frequency ratio between any adjacent semitone is:

$$r = 2^{1/12} \\approx 1.059463$$

This [[approx-symbol|approximate]] mathematical constant $2^{1/12} [[approx-symbol|\\approx]] 1.059463$ means that every pitch can be mapped directly into the cyclic group [[integer-set-z|$\\mathbb{Z}_{12}$]] (integers modulo 12), known as the [[pitch-class]] set:

$$C = 0, C\\# = 1, D = 2, \\dots, B = 11$$

### 2. Formulating Chords with Pitch-Class Integer Vectors

Instead of hardcoding static image charts for every chord, we can describe any chord as an integer vector of interval offsets from a tonic root:
- **Major Triad**: $[0, 4, 7]$ (Root, Major Third at 4 semitones, Perfect Fifth at 7 semitones).
- **[[minor-triad]]**: $[0, 3, 7]$ (Root, Minor Third at 3 semitones, Perfect Fifth at 7 semitones).
- **Dominant 7th**: $[0, 4, 7, 10]$ (Features the intense tension of the [[tritone]]).

To transpose any chord to a new root note $k$, we simply perform modular addition where each note $x [[element-of|\\in]] \\text{ChordVector}$:

$$\\text{Voicing}(k) = \\{ (x + k) \\pmod{12} \\mid x \\in \\text{ChordVector} \\}$$

Using the [[modulo-operator|modulo operator $\\pmod{12}$]], note values naturally wrap around the 12-semitone chromatic clock.

### 3. The Devil in Music: The Geometry of the Tritone

The [[tritone]] is an interval spanning exactly 6 semitones (or half an octave: $12 / 2 = 6$). In modular arithmetic:

$$T_6(x) = (x + 6) \\pmod{12}$$

Applying the transformation twice brings you back to the exact starting note:

$$T_6(T_6(x)) = (x + 12) \\equiv x \\pmod{12}$$

Because a tritone bisects the circular clock of 12 notes symmetrically, it lacks an acoustic "center of gravity." This produces maximum dissonance. In dominant chords (like $G7$: $G - B - D - F$), the interval between $B$ (index 11) and $F$ (index 5) is a tritone ($11 - 5 = 6$). It is the urgent need of this tritone to resolve into the consonant root of $C$ Major that drives Western musical cadence!

### 4. Synthesizing Sound with the Web Audio API

Loading hundreds of megabytes of recorded guitar or piano MP3 samples slows down mobile browsers. Instead, in **NoteLogic**, notes are synthesized in real-time using polyphonic Web Audio oscillator nodes with physical exponential decay envelopes:

\`\`\`typescript
const ctx = new AudioContext();
const osc = ctx.createOscillator();
const gain = ctx.createGain();

// Calculate pitch frequency from MIDI pitch class number
const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
osc.frequency.setValueAtTime(frequency, ctx.currentTime);

// Simulating string pluck envelope
gain.gain.setValueAtTime(0.35, ctx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

osc.connect(gain);
gain.connect(ctx.destination);
osc.start();
osc.stop(ctx.currentTime + 1.8);
\`\`\`

By coupling mathematical pitch-class representations with browser-native audio synthesis, we achieve studio-grade music exploration with zero bundle overhead.`,
      id: `### 1. Mengapa Teori Musik Sejatinya adalah Matematika Diskrit

Teori musik kerap diajarkan seolah-olah seni hafalan partitur dan istilah Italia. Padahal di balik itu, harmoni akustik adalah matematika murni: rasio frekuensi gelombang, aritmatika modulo, dan teori himpunan.

Dalam sistem tala standar barat 12-TET (*12-Tone Equal Temperament*), satu rentang oktav dibagi menjadi 12 interval logaritmik yang disebut [[semitone]]. Rasio frekuensi antara dua semitone yang bersebelahan adalah:

$$r = 2^{1/12} \\approx 1.059463$$

Fondasi [[approx-symbol|aproksimasi]] $2^{1/12} [[approx-symbol|\\approx]] 1.059463$ ini memungkinkan kita memetakan setiap nada musik ke dalam grup siklis [[integer-set-z|$\\mathbb{Z}_{12}$]] (bilangan bulat modulo 12) yang disebut [[pitch-class]]:

$$C = 0, C\\# = 1, D = 2, \\dots, B = 11$$

### 2. Memodelkan Chord dengan Vektor Integer

Alih-alih menyimpan ratusan gambar statis diagram kunci gitar, kita dapat mendefinisikan chord apa pun sebagai vektor pergeseran semitone dari nada dasarnya:
- **Major Triad**: $[0, 4, 7]$ (Root, Major Third 4 semitone, Perfect Fifth 7 semitone).
- **[[minor-triad]]**: $[0, 3, 7]$ (Root, Minor Third 3 semitone, Perfect Fifth 7 semitone).
- **Dominant 7th**: $[0, 4, 7, 10]$ (Menghadirkan ketegangan kuat dari [[tritone]]).

Untuk melakukan transposisi chord ke nada dasar $k$, kita hanya perlu menjalankan operasi penjumlahan [[modulo-operator|aritmatika modulo]] di mana setiap elemen nada $x [[element-of|\\in]] \\text{ChordVector}$:

$$\\text{Voicing}(k) = \\{ (x + k) \\pmod{12} \\mid x \\in \\text{ChordVector} \\}$$

Operasi [[modulo-operator|$\\pmod{12}$]] memastikan nilai nada selalu berputar rapi dalam lingkaran 12 kromatik.

### 3. "Iblis dalam Musik": Geometri Interval Tritone

Interval [[tritone]] menempuh tepat 6 semitone (setengah dari satu oktav penuh: $12 / 2 = 6$). Dalam aritmatika modulo:

$$T_6(x) = (x + 6) \\pmod{12}$$

Jika operasi ini diulang dua kali, ia akan kembali persis ke nada asalnya:

$$T_6(T_6(x)) = (x + 12) \\equiv x \\pmod{12}$$

Karena tritone membagi lingkaran 12 nada tepat di tengah secara simetris, telinga manusia tidak menemukan "titik tumpu gravitasi nada" yang stabil. Hasilnya adalah disonansi akustik yang tajam. Pada akor dominan (misalnya $G7$: $G - B - D - F$), jarak antara nada $B$ dan $F$ adalah tepat sebuah tritone ($11 - 5 = 6$). Dorongan alami interval tritone ini untuk bergeser (*resolusi*) ke nada stabil chord $C$ Mayor adalah motor penggerak seluruh harmoni musik pop, jazz, dan klasik!

### 4. Sintesis Suara Ringan dengan Web Audio API

Mengunduh puluhan file rekaman audio MP3 membuat website lemot di smartphone. Pada aplikasi **NoteLogic**, nada dibangkitkan langsung secara real-time di prosesor browser menggunakan Web Audio API:

\`\`\`typescript
const ctx = new AudioContext();
const osc = ctx.createOscillator();
const gain = ctx.createGain();

// Menghitung frekuensi Hertz dari not angka MIDI
const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
osc.frequency.setValueAtTime(frequency, ctx.currentTime);

// Menirukan petikan senar gitar dengan peluruhan eksponensial
gain.gain.setValueAtTime(0.35, ctx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

osc.connect(gain);
gain.connect(ctx.destination);
osc.start();
osc.stop(ctx.currentTime + 1.8);
\`\`\`

Dengan menggabungkan representasi matematika nada dan sintesis Web Audio native, kita bisa membuat software edukasi musik yang instan, akurat, dan sangat ringan.`,
    },
    date: 'May 2024',
    readTime: '8 min read',
    category: 'Hobby & Music (NoteLogic)',
    tags: ['Web Audio API', 'TypeScript', 'Music Theory', 'Mathematics', 'NoteLogic'],
    author: defaultAuthor,
    isAiAssisted: true,
    aiModel: 'Gemini 3.7 Flash',
    featured: true,
    vanpediaTerms: ['tritone', 'semitone', 'pitch-class', 'minor-triad', 'harmonic-series', 'integer-set-z', 'modulo-operator', 'approx-symbol', 'element-of'],
    relatedArticleSlugs: ['quirks-facts-computer-science-programming', 'learning-neural-networks-backpropagation-prompting'],
    views: 2150,
    likes: 67,
    commentsCount: 15,
  },
  {
    id: 'article-moodle-migration',
    slug: 'replacing-moodle-nextjs-lms',
    title: {
      en: 'Replacing Moodle with a Modern Next.js LMS for 15,000 University Students',
      id: 'Menggantikan Moodle dengan LMS Kustom Next.js untuk 15.000 Mahasiswa Kampus',
    },
    summary: {
      en: 'How we overhauled legacy university learning infrastructure, reduced server latency by 65%, and handled concurrent midterm exam spikes without downtime.',
      id: 'Kisah arsitektur di balik perombakan sistem pembelajaran kampus, memangkas latensi 65%, dan mengatasi lonjakan ujian serentak tanpa server down.',
    },
    content: {
      en: `### The Challenge with Legacy Academic LMS

For over a decade, traditional universities heavily relied on monolithic PHP installations of Moodle. While historically useful, scaling Moodle during peak university exam periods—where 5,000+ students submit quizzes in the exact same 5-minute window—frequently caused PHP-FPM pool exhaustion and [[mysql-deadlock]] issues.

Furthermore, students and lecturers routinely struggled with dense, outdated user interfaces that were not designed for mobile devices.

### Architectural Decisions

We set out to build a bespoke Next-Gen LMS tailored to our university's real workflows:

1. **Stateless Reactive Frontend**: Built with Next.js and Tailwind CSS, deployed with client caching and edge routing to minimize server-side rendering latency.
2. **Modular Microservice Backend**: Designed in NestJS with strict domain boundaries for authentication, course content, assignment submission, and grading.
3. **High-Concurrency Submission Queues**: Instead of writing submissions synchronously to PostgreSQL, exam answers are ingested into an in-memory [[redis-stream]], acknowledged in under 12ms to the student, and processed asynchronously via background workers.

### The Results

During the first semester midterm deployment:
- **Zero downtime** across 15,000 enrolled students.
- **Page transition speed** jumped from 2.8 seconds to ~300ms.
- **Faculty grading efficiency** increased by 40% thanks to a dedicated keyboard-navigable assessment UI.

True craftsmanship in software engineering isn't about using whatever is trendy—it's about applying the right [[architectural-constraint]] to eliminate user friction.`,
      id: `### Tantangan Sistem LMS Lama

Selama lebih dari satu dekade, banyak kampus bergantung pada instalasi monolitik Moodle (PHP). Meskipun kaya fitur, saat musim ujian serentak—di mana 5.000+ mahasiswa mengumpulkan ujian di jendela waktu 5 menit yang sama—server kerap mengalami kehabisan worker PHP-FPM dan [[mysql-deadlock]].

Selain itu, antarmuka Moodle yang rumit membuat dosen dan mahasiswa kesulitan saat mengaksesnya dari smartphone.

### Keputusan Arsitektur

Kami memutuskan membangun sistem LMS mandiri yang benar-benar cocok dengan ritme perkuliahan kampus:

1. **Frontend Reaktif Modern**: Menggunakan Next.js dan Tailwind CSS dengan optimasi cache client dan layout reaktif yang sangat responsif di perangkat seluler.
2. **Backend Terstruktur dengan NestJS**: Memisahkan modul perkuliahan, penugasan, presensi, dan penilaian ke dalam domain terisolasi dengan prinsip Dependency Injection.
3. **Antrian Ujian Berbasis [[redis-stream]]**: Jawaban kuis mahasiswa tidak langsung dikunci ke baris PostgreSQL, melainkan dicatat cepat ke Redis stream dalam waktu < 12ms, kemudian disimpan secara bertahap oleh worker background.

### Hasil Nyata

Pada peluncuran perdana di Ujian Tengah Semester:
- **0% Downtime** sepanjang pekan ujian untuk 15.000 mahasiswa aktif.
- **Waktu buka halaman** melesat dari 2,8 detik menjadi ~300ms.
- **Efisiensi dosen dalam menilai tugas** naik 40% berkat fitur shortcut keyboard dan pratinjau dokumen instan.

Rekayasa perangkat lunak sejati bukanlah tentang mengikuti tren, melainkan menerapkan [[architectural-constraint]] yang tepat untuk menghilangkan hambatan pengguna.`,
    },
    date: 'February 2024',
    readTime: '6 min read',
    category: 'Architecture & Systems',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'Performance'],
    author: defaultAuthor,
    isAiAssisted: true,
    aiModel: 'Gemini 3.7 Flash',
    vanpediaTerms: ['mysql-deadlock', 'architectural-constraint', 'redis-stream'],
    relatedArticleSlugs: ['tamper-proof-biometric-attendance', 'quirks-facts-computer-science-programming'],
    views: 3100,
    likes: 54,
    commentsCount: 9,
  },
  {
    id: 'article-biometric-antispoofing',
    slug: 'tamper-proof-biometric-attendance',
    title: {
      en: 'Building a Tamper-Proof Biometric Attendance System with GPS Geofencing',
      id: 'Membangun Sistem Absensi Biometrik Anti-Fraud dengan Validasi Geofence',
    },
    summary: {
      en: 'Technical deep-dive into implementing computer vision liveness detection, polygon coordinates validation, and preventing mock location exploits in enterprise attendance.',
      id: 'Bedah teknis penerapan deteksi liveness wajah, validasi koordinat poligon GPS presisi, dan pencegahan aplikasi Fake GPS pada absensi perusahaan.',
    },
    content: {
      en: `### The Problem: Attendance Fraud in Enterprise Environments

In distributed workforces and university staff monitoring, traditional selfie-based or timestamped attendance systems suffer from widespread abuse:
- Staff holding up photos on secondary phone screens or printouts.
- Android Fake GPS / [[mock-location]] exploits fooling native browser geolocation APIs.
- Replaying historical network payload requests.

### Engineering the Defense Layers

To establish foolproof verification while keeping clock-in duration under 3 seconds per employee, we implemented a layered defense strategy:

#### 1. Passive + Active [[liveness-detection]]

Rather than relying on static images, the camera captures a short high-entropy burst. We compute micro-motion vectors and specular light reflections to distinguish between 3D human skin and flat emissive smartphone screens.

#### 2. Cryptographic Device Attestation & GPS Hardening

On the client, we query multiple location providers (Cell tower, Wi-Fi BSSID triangulation, and satellite GPS). We cross-reference the reported accuracy radius and verify device integrity flags to detect root/jailbreak environments and [[mock-location]] spoofing apps.

#### 3. Convex Hull Campus Geofencing with [[point-in-polygon]]

Rather than a simple circular radius (which often leaks into public streets or cafes adjacent to campus), we calculate [[point-in-polygon]] checks against pre-mapped 2D boundaries of campus buildings.

### Outcome
Over 3,500 staff members now clock in daily with average verification speeds of 1.4 seconds. False positives dropped to negligible levels, delivering genuine fairness and audit compliance for institutional payroll.`,
      id: `### Masalah: Kecurangan Absensi Pegawai

Pada lingkungan kampus dan kantor berskala besar, sistem absensi berbasis foto biasa kerap kali dicurangi:
- Memotret foto orang lain dari layar HP atau cetakan kertas.
- Penggunaan aplikasi [[mock-location|Fake GPS (Mock Location)]] untuk memanipulasi koordinat.
- Pemutaran ulang (*replay attack*) permintaan HTTP absensi terdahulu.

### Strategi Pertahanan Bertingkat

Kami merancang mekanisme keamanan berlapis yang tetap nyaman digunakan dengan waktu proses di bawah 3 detik:

#### 1. Verifikasi [[liveness-detection]] Wajah

Kamera tidak sekadar mengambil satu frame foto, melainkan menganalisis pantulan cahaya dan kedalaman kontur mikro wajah untuk membedakan wajah asli manusia 3D dengan layar kaca smartphone 2D.

#### 2. Deteksi [[mock-location]] & Poligon Geofence

Sistem memeriksa konsistensi koordinat GPS bersama data menara seluler dan Wi-Fi di sekitarnya. Penggunaan [[mock-location]] langsung ditandai dan ditolak.

#### 3. Geofence Poligon Presisi dengan [[point-in-polygon]]

Bukan sekadar radius lingkaran statis yang rentan bocor ke jalan umum atau warung kopi di seberang jalan, kami menerapkan algoritma [[point-in-polygon]] yang presisi mengikuti denah batas gedung resmi kampus.

### Hasil
Kini 3.500+ pegawai melakukan absensi harian dengan rata-rata waktu verifikasi 1,4 detik per orang, menghemat jutaan rupiah anggaran dan menciptakan transparansi kerja.`,
    },
    date: 'November 2023',
    readTime: '7 min read',
    category: 'Security & AI',
    tags: ['Biometrics', 'Computer Vision', 'NestJS', 'Security', 'Geofencing'],
    author: defaultAuthor,
    isAiAssisted: true,
    aiModel: 'Gemini 3.7 Flash',
    vanpediaTerms: ['mock-location', 'liveness-detection', 'point-in-polygon'],
    relatedArticleSlugs: ['replacing-moodle-nextjs-lms', 'learning-neural-networks-backpropagation-prompting'],
    views: 2450,
    likes: 49,
    commentsCount: 6,
  },
];

export const vanpediaTermsData: VanpediaTerm[] = [
  {
    id: 'term-tritone',
    slug: 'tritone',
    title: {
      en: 'Tritone',
      id: 'Tritone',
    },
    definition: {
      en: 'An interval spanning 6 semitones with high acoustic dissonance; divides the octave exactly in half.',
      id: 'Interval yang menempuh 6 semitone dengan disonansi akustik tinggi; membagi oktav tepat di tengah.',
    },
    category: 'Teori Musik',
    formula: 'T_6(x) = (x + 6) mod 12',
    examples: {
      en: [
        'B to F = tritone (found in dominant chord G7: G-B-D-F)',
        'C to F# = tritone (augmented 4th)',
        'C to Gb = tritone (diminished 5th)',
        'Historically called "Diabolus in musica" (the devil in music) due to its unstable dissonance.',
      ],
      id: [
        'B ke F = tritone (ditemukan dalam chord dominan G7: G-B-D-F)',
        'C ke F# = tritone (augmented 4th)',
        'C ke Gb = tritone (diminished 5th)',
        'Secara historis dijuluki "Diabolus in musica" (iblis dalam musik) karena disonansinya yang tajam.',
      ],
    },
    relatedTerms: ['semitone', 'pitch-class', 'minor-triad', 'harmonic-series'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Tritone in Musical Mathematics

A **tritone** is an interval spanning three whole tones — or 6 semitones. In 12-Tone Equal Temperament (12-TET), an octave contains 12 semitones, which means a tritone divides the octave symmetrically in two ($12 / 2 = 6$).

### Mathematical Characteristics

In pitch-class modular space $\\mathbb{Z}_{12}$:
$$T_6(x) = (x + 6) \\pmod{12}$$

Because it divides the circle in half, the tritone is its own inverse:
$$T_6(T_6(x)) = (x + 12) \\equiv x \\pmod{12}$$

### Practical Example in Dominant 7th Chords

In the chord **G7** (composed of notes $G, B, D, F$):
- Note $B$ is pitch class 11
- Note $F$ is pitch class 5
- The difference is $11 - 5 = 6$ semitones (a tritone!)

This dissonance demands resolution: note $B$ pushes upward to $C$, while note $F$ pulls downward to $E$, resolving neatly into the consonant $C$ Major chord.`,
      id: `## Tritone dalam Matematika Musik

**Tritone** adalah interval yang menempuh tiga nada utuh (*whole tone*) atau setara dengan 6 semitone. Dalam sistem 12 nada (12-TET), satu oktav terdiri dari 12 semitone, sehingga tritone membagi oktav tepat di tengah secara simetris ($12 / 2 = 6$).

### Karakteristik Matematis

Dalam ruang modulo kelas nada $\\mathbb{Z}_{12}$:
$$T_6(x) = (x + 6) \\pmod{12}$$

Karena membagi lingkaran nada tepat di tengah, tritone adalah invers dari dirinya sendiri:
$$T_6(T_6(x)) = (x + 12) \\equiv x \\pmod{12}$$

### Contoh Nyata dalam Akor Dominan 7

Dalam chord **G7** (terdiri dari nada $G, B, D, F$):
- Nada $B$ berada di pitch class 11
- Nada $F$ berada di pitch class 5
- Selisih keduanya adalah $11 - 5 = 6$ semitone (sebuah tritone!)

Ketegangan tajam inilah yang menuntut adanya resolusi nada: nada $B$ bergerak naik setengah nada ke $C$, sedangkan nada $F$ bergerak turun ke $E$, menghasilkan chord $C$ Mayor yang stabil dan melegakan telinga.`,
    },
  },
  {
    id: 'term-semitone',
    slug: 'semitone',
    title: {
      en: 'Semitone (Half Step)',
      id: 'Semitone (Setengah Nada)',
    },
    definition: {
      en: 'The smallest standard musical interval in Western 12-TET tuning; the distance between adjacent piano keys.',
      id: 'Interval musikal standar terkecil dalam sistem tala Barat 12-TET; jarak antara dua tuts piano yang bersebelahan.',
    },
    category: 'Teori Musik',
    formula: 'f_2 / f_1 = 2^(1/12) ≈ 1.059463',
    examples: {
      en: [
        'C to C# = 1 semitone',
        'E to F = 1 semitone (adjacent white keys with no black key in between)',
        'B to C = 1 semitone',
      ],
      id: [
        'C ke C# = 1 semitone',
        'E ke F = 1 semitone (tuts putih bersebelahan tanpa tuts hitam)',
        'B ke C = 1 semitone',
      ],
    },
    relatedTerms: ['tritone', 'pitch-class', 'minor-triad'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Semitone

A **semitone** (or half step) represents an exponential frequency ratio of $2^{1/12} \\approx 1.059463$. Stacking 12 semitones produces a frequency ratio of $(2^{1/12})^{12} = 2$, doubling the frequency into an octave.`,
      id: `## Semitone

**Semitone** (setengah nada) mewakili rasio frekuensi eksponensial $2^{1/12} \\approx 1.059463$. Menumpuk 12 semitone menghasilkan rasio $(2^{1/12})^{12} = 2$, melipatgandakan frekuensi menjadi satu oktav penuh.`,
    },
  },
  {
    id: 'term-pitch-class',
    slug: 'pitch-class',
    title: {
      en: 'Pitch Class',
      id: 'Pitch Class (Kelas Nada)',
    },
    definition: {
      en: 'A mathematical set of all pitches that share the same note name regardless of octave register (e.g., all C notes belong to pitch class 0).',
      id: 'Himpunan matematis semua nada yang berbagi nama yang sama terlepas dari tingkatan oktavnya (misal semua nada C adalah kelas 0).',
    },
    category: 'Teori Musik',
    formula: 'PitchClass(note) = midiNumber mod 12',
    examples: {
      en: ['C3, C4, and C5 all belong to pitch class 0', 'A4 (440Hz) belongs to pitch class 9'],
      id: ['C3, C4, dan C5 semuanya termasuk pitch class 0', 'A4 (440Hz) termasuk pitch class 9'],
    },
    relatedTerms: ['semitone', 'tritone', 'minor-triad'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Pitch Class Set Theory

By mapping the 12 chromatic pitches to integers 0 through 11:
- C = 0, C# = 1, D = 2, D# = 3, E = 4, F = 5
- F# = 6, G = 7, G# = 8, A = 9, A# = 10, B = 11

We can analyze musical harmony using discrete mathematics and modular arithmetic.`,
      id: `## Teori Himpunan Pitch Class

Dengan memetakan 12 nada kromatik ke bilangan bulat 0 sampai 11:
- C = 0, C# = 1, D = 2, D# = 3, E = 4, F = 5
- F# = 6, G = 7, G# = 8, A = 9, A# = 10, B = 11

Kita dapat menganalisis dan memproses susunan chord secara komputasi.`,
    },
  },
  {
    id: 'term-minor-triad',
    slug: 'minor-triad',
    title: {
      en: 'Minor Triad',
      id: 'Minor Triad (Akor Minor Tiga Nada)',
    },
    definition: {
      en: 'A chord composed of a root note, a minor third (3 semitones), and a perfect fifth (7 semitones).',
      id: 'Akor yang tersusun dari nada dasar, minor ketiga (3 semitone), dan perfect fifth (7 semitone).',
    },
    category: 'Teori Musik',
    formula: '[0, 3, 7]',
    examples: {
      en: ['A minor = A, C, E', 'D minor = D, F, A', 'C minor = C, Eb, G'],
      id: ['A minor = A, C, E', 'D minor = D, F, A', 'C minor = C, Eb, G'],
    },
    relatedTerms: ['semitone', 'tritone', 'pitch-class'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Minor Triad Formula

The minor triad formula in semitone offsets is $[0, 3, 7]$. Compared to a major triad $[0, 4, 7]$, lowering the third by one semitone gives the minor triad its introspective, contemplative sound character.`,
      id: `## Rumus Minor Triad

Rumus minor triad dalam offset semitone adalah $[0, 3, 7]$. Dibandingkan major triad $[0, 4, 7]$, penurunan sepertiga nada sebanyak 1 semitone memberikan warna suara yang lebih teduh dan melankolis.`,
    },
  },
  {
    id: 'term-harmonic-series',
    slug: 'harmonic-series',
    title: {
      en: 'Harmonic Series (Overtones)',
      id: 'Harmonic Series (Deret Nada Harmonis)',
    },
    definition: {
      en: 'The sequence of frequencies that are integer multiples of a fundamental frequency (f, 2f, 3f, 4f, ...).',
      id: 'Rangkaian frekuensi nada yang merupakan kelipatan bilangan bulat dari frekuensi fundamental (f, 2f, 3f, 4f, ...).',
    },
    category: 'Teori Musik',
    formula: 'f_n = n · f_0',
    examples: {
      en: ['Fundamental 100 Hz -> 2nd harmonic 200 Hz (octave), 3rd harmonic 300 Hz (perfect fifth)'],
      id: ['Nada dasar 100 Hz -> Harmonik ke-2 200 Hz (oktav), harmonik ke-3 300 Hz (fifth)'],
    },
    relatedTerms: ['tritone', 'semitone'],
    articleIds: ['article-notelogic-audio'],
  },
  {
    id: 'term-neural-network',
    slug: 'neural-network',
    title: {
      en: 'Neural Network',
      id: 'Neural Network (Jaringan Saraf Tiruan)',
    },
    definition: {
      en: 'A computational machine learning architecture inspired by biological neurons, organized in layers with parameterized weights and activation functions.',
      id: 'Arsitektur komputasi pembelajaran mesin yang terinspirasi oleh neuron biologis, tersusun atas lapisan-lapisan bobot terparameterisasi dan fungsi aktivasi.',
    },
    category: 'Artificial Intelligence',
    formula: 'y = σ(W · x + b)',
    examples: {
      en: ['Multilayer Perceptron (MLP)', 'Convolutional Neural Network (CNN)', 'Transformer (Self-Attention)'],
      id: ['Multilayer Perceptron (MLP)', 'Convolutional Neural Network (CNN)', 'Transformer (Self-Attention)'],
    },
    relatedTerms: ['backpropagation', 'gradient-descent', 'activation-function', 'prompt-engineering'],
    articleIds: ['article-learning-ai-neural-networks'],
    content: {
      en: `## Neural Networks

A neural network maps input data $x$ to output predictions $\\hat{y}$ through successive non-linear matrix operations. Training adjusts weights $W$ to minimize task loss.`,
      id: `## Jaringan Saraf Tiruan

Neural network memetakan data input $x$ menjadi prediksi output $\\hat{y}$ melalui perkalian matriks bertahap. Proses pelatihan memperbarui bobot $W$ agar kesalahan seminimal mungkin.`,
    },
  },
  {
    id: 'term-backpropagation',
    slug: 'backpropagation',
    title: {
      en: 'Backpropagation',
      id: 'Backpropagation (Perambatan Balik Gradien)',
    },
    definition: {
      en: 'An algorithm that computes the gradient of the loss function with respect to each network weight using the calculus chain rule.',
      id: 'Algoritma yang menghitung gradien parsial fungsi loss terhadap setiap bobot jaringan saraf menggunakan aturan rantai turunan kalkulus.',
    },
    category: 'Artificial Intelligence',
    formula: '∂L/∂w = (∂L/∂y) · (∂y/∂z) · (∂z/∂w)',
    examples: {
      en: ['Reversing from output loss backwards through hidden layers in O(N) time'],
      id: ['Mengalirkan gradien error dari layer output mundur ke layer input dalam kompleksitas O(N)'],
    },
    relatedTerms: ['neural-network', 'gradient-descent', 'activation-function'],
    articleIds: ['article-learning-ai-neural-networks'],
    content: {
      en: `## Backpropagation

Without backpropagation, training deep networks would be computationally intractable. By caching intermediate activation values during the forward pass, gradients can be calculated in a single reverse pass.`,
      id: `## Backpropagation

Tanpa backpropagation, melatih neural network dalam akan sangat lambat. Dengan menyimpan nilai aktivasi saat forward pass, gradien semua bobot dapat dihitung secara instan dalam satu lintasan mundur.`,
    },
  },
  {
    id: 'term-gradient-descent',
    slug: 'gradient-descent',
    title: {
      en: 'Gradient Descent',
      id: 'Gradient Descent (Penurunan Gradien)',
    },
    definition: {
      en: 'A first-order iterative optimization algorithm for finding the local minimum of a differentiable function by stepping in the opposite direction of the gradient.',
      id: 'Algoritma optimasi iteratif untuk mencari titik minimum dari suatu fungsi diferensiabel dengan melangkah berlawanan arah dengan vektor gradien.',
    },
    category: 'Artificial Intelligence',
    formula: 'w ← w - η · ∇L(w)',
    examples: {
      en: ['Stochastic Gradient Descent (SGD)', 'Adam (Adaptive Moment Estimation)', 'RMSprop'],
      id: ['Stochastic Gradient Descent (SGD)', 'Adam (Adaptive Moment Estimation)', 'RMSprop'],
    },
    relatedTerms: ['backpropagation', 'neural-network'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-activation-function',
    slug: 'activation-function',
    title: {
      en: 'Activation Function',
      id: 'Activation Function (Fungsi Aktivasi)',
    },
    definition: {
      en: 'A mathematical non-linear function applied to a neuron output that allows neural networks to learn non-linear decision boundaries.',
      id: 'Fungsi matematika non-linear yang diterapkan pada output neuron agar jaringan saraf mampu mempelajari pola dan batas keputusan non-linear.',
    },
    category: 'Artificial Intelligence',
    formula: 'ReLU(x) = max(0, x), Sigmoid(x) = 1 / (1 + e^-x)',
    examples: {
      en: ['ReLU (Rectified Linear Unit)', 'GELU (Gaussian Error Linear Unit)', 'Sigmoid', 'Softmax'],
      id: ['ReLU (Rectified Linear Unit)', 'GELU (Gaussian Error Linear Unit)', 'Sigmoid', 'Softmax'],
    },
    relatedTerms: ['neural-network', 'backpropagation'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-prompt-engineering',
    slug: 'prompt-engineering',
    title: {
      en: 'Prompt Engineering',
      id: 'Prompt Engineering (Rekayasa Prompt)',
    },
    definition: {
      en: 'The practice of structuring, refining, and designing textual inputs to steer Large Language Models toward precise, robust outputs without retraining weights.',
      id: 'Seni dan disiplin menyusun instruksi teks untuk memandu Large Language Model (LLM) menghasilkan respon akurat tanpa perlu melatih ulang bobot model.',
    },
    category: 'Artificial Intelligence',
    examples: {
      en: [
        'Chain-of-Thought (CoT) prompting: "Think step by step before answering."',
        'Few-Shot prompting: Providing 2-3 input-output exemplar demonstrations.',
        'Role prompting: Framing the persona and operational boundaries of the assistant.',
      ],
      id: [
        'Chain-of-Thought (CoT): "Pikirkan langkah demi langkah sebelum menjawab."',
        'Few-Shot: Memberikan 2-3 contoh pola input dan output yang diinginkan.',
        'Penetapan peran & batasan instruksi sistem (System Instruction).',
      ],
    },
    relatedTerms: ['neural-network'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-floating-point-arithmetic',
    slug: 'floating-point-arithmetic',
    title: {
      en: 'IEEE 754 Floating-Point Arithmetic',
      id: 'Aritmatika Floating-Point IEEE 754',
    },
    definition: {
      en: 'A standard for representing real numbers in binary, where fractions like 0.1 become infinitely repeating decimals and lead to rounding inaccuracies (0.1 + 0.2 = 0.30000000000000004).',
      id: 'Standar representasi bilangan riil dalam biner komputer, di mana angka desimal seperti 0.1 tidak dapat disimpan secara eksak sehingga memicu selisih pembulatan (0.1 + 0.2 = 0.30000000000000004).',
    },
    category: 'Ilmu Komputer',
    formula: '(-1)^sign · (1 + mantissa) · 2^(exponent - bias)',
    examples: {
      en: [
        '0.1 + 0.2 === 0.3 returns false in JavaScript, Python, and C',
        '0.1 + 0.2 evaluates to 0.30000000000000004',
        'Financial applications store amounts in integer cents (e.g., $10.50 as 1050 cents)',
      ],
      id: [
        '0.1 + 0.2 === 0.3 bernilai false di JavaScript, Python, dan C',
        '0.1 + 0.2 bernilai 0.30000000000000004',
        'Aplikasi perbankan menyimpan saldo dalam integer sen (misal Rp 10.500 disimpan sebagai integer)',
      ],
    },
    relatedTerms: ['undefined-behavior', 'null-pointer'],
    articleIds: ['article-quirks-computer-science'],
  },
  {
    id: 'term-undefined-behavior',
    slug: 'undefined-behavior',
    title: {
      en: 'Undefined Behavior (UB)',
      id: 'Undefined Behavior (Perilaku Tak Terdefinisi)',
    },
    definition: {
      en: 'A condition in code execution where the language specification does not impose any requirements, allowing compilers to assume the situation never occurs.',
      id: 'Kondisi eksekusi kode di mana spesifikasi bahasa tidak mendefinisikan apa yang harus terjadi, sehingga compiler dapat membuat asumsi liar demi optimasi.',
    },
    category: 'Ilmu Komputer',
    examples: {
      en: [
        'Dereferencing a null or dangling pointer in C/C++',
        'Signed 32-bit integer overflow (INT_MAX + 1)',
        'Reading uninitialized memory variables',
      ],
      id: [
        'Dereferensi pointer null atau pointer liar di C/C++',
        'Overflow integer bertanda (INT_MAX + 1)',
        'Membaca variabel memori yang belum diinisialisasi',
      ],
    },
    relatedTerms: ['null-pointer', 'race-condition', 'floating-point-arithmetic'],
    articleIds: ['article-quirks-computer-science'],
  },
  {
    id: 'term-race-condition',
    slug: 'race-condition',
    title: {
      en: 'Race Condition',
      id: 'Race Condition (Kondisi Perlombaan)',
    },
    definition: {
      en: 'A flaw in concurrent execution where the final outcome depends on the non-deterministic timing or interleaving of multiple threads or processes.',
      id: 'Cacat dalam sistem konkurensi di mana hasil akhir bergantung pada urutan atau waktu eksekusi thread/proses yang tidak sinkron.',
    },
    category: 'Arsitektur & Konkurensi',
    examples: {
      en: [
        'Two simultaneous bank transfers reading account balance $100 and both writing $50, losing a transaction',
        'Solved with Mutex locks, Atomic CAS operations, or Database Row Locks',
      ],
      id: [
        'Dua penarikan uang serentak membaca saldo Rp 100rb dan keduanya menguranginya menjadi Rp 50rb',
        'Diselesaikan dengan Mutex lock, operasi Atomic, atau transaksi database',
      ],
    },
    relatedTerms: ['undefined-behavior', 'mysql-deadlock'],
    articleIds: ['article-quirks-computer-science', 'article-moodle-migration'],
  },
  {
    id: 'term-null-pointer',
    slug: 'null-pointer',
    title: {
      en: 'Null Pointer ("The Billion-Dollar Mistake")',
      id: 'Null Pointer (Kesalahan Bernilai Satu Miliar Dolar)',
    },
    definition: {
      en: 'A pointer or reference variable that points to no valid memory address; dereferencing it triggers severe runtime exceptions (NullPointerException, Segmentation Fault).',
      id: 'Variabel pointer atau referensi yang tidak menunjuk ke alamat memori yang sah; mengaksesnya memicu runtime crash fatal (NullPointerException, Segfault).',
    },
    category: 'Ilmu Komputer',
    examples: {
      en: [
        'Invented in 1965 by Sir Tony Hoare',
        'Modern remedies: Option<T> in Rust, strictNullChecks in TypeScript, non-nullable types in Kotlin/Swift',
      ],
      id: [
        'Diciptakan tahun 1965 oleh Sir Tony Hoare',
        'Solusi modern: Option<T> di Rust, strictNullChecks di TypeScript, dan null safety di Kotlin',
      ],
    },
    relatedTerms: ['undefined-behavior', 'floating-point-arithmetic'],
    articleIds: ['article-quirks-computer-science'],
  },
  {
    id: 'term-mysql-deadlock',
    slug: 'mysql-deadlock',
    title: {
      en: 'MySQL Deadlock',
      id: 'MySQL Deadlock (Kebuntuan Transaksi)',
    },
    definition: {
      en: 'A database concurrency condition where two or more transactions hold locks on resources the other requires, resulting in circular blocking.',
      id: 'Kondisi kebuntuan transaksi basis data di mana dua transaksi saling menunggu lock baris tabel yang dipegang transaksi lain.',
    },
    category: 'Database & Sistem',
    examples: {
      en: [
        'Transaction 1 locks Row A and wants Row B; Transaction 2 locks Row B and wants Row A',
        'MySQL InnoDB automatically detects the cycle and aborts the transaction with smaller undo logs',
      ],
      id: [
        'Transaksi 1 mengunci Baris A dan butuh Baris B; Transaksi 2 mengunci Baris B dan butuh Baris A',
        'Engine InnoDB mendeteksi siklus dan membatalkan (rollback) transaksi dengan bobot lebih kecil',
      ],
    },
    relatedTerms: ['race-condition', 'architectural-constraint', 'redis-stream'],
    articleIds: ['article-moodle-migration'],
  },
  {
    id: 'term-architectural-constraint',
    slug: 'architectural-constraint',
    title: {
      en: 'Architectural Constraint',
      id: 'Architectural Constraint (Batasan Arsitektur)',
    },
    definition: {
      en: 'A deliberate design boundary placed upon a software system to guarantee non-functional qualities such as scalability, auditability, or fault isolation.',
      id: 'Batasan rancangan yang sengaja diterapkan pada sistem untuk menjamin kualitas non-fungsional seperti skalabilitas, keandalan, atau auditabilitas.',
    },
    category: 'Arsitektur & Rekayasa',
    examples: {
      en: [
        'Stateless API services (enables horizontal pod autoscaling in Kubernetes)',
        'Single Responsibility and Domain Isolation in NestJS microservices',
      ],
      id: [
        'Server API stateless (memungkinkan autoscaling horizontal di Kubernetes)',
        'Isolasi domain dan antrian asinkron untuk melindungi database utama',
      ],
    },
    relatedTerms: ['mysql-deadlock', 'redis-stream'],
    articleIds: ['article-moodle-migration'],
  },
  {
    id: 'term-redis-stream',
    slug: 'redis-stream',
    title: {
      en: 'Redis Stream',
      id: 'Redis Stream (Aliran Pesan Log Persisten)',
    },
    definition: {
      en: 'An append-only log data structure in Redis that supports consumer groups for high-throughput, fault-tolerant message processing.',
      id: 'Struktur data log append-only di Redis yang mendukung consumer groups untuk antrian pesan berkecepatan tinggi dan tahan gangguan.',
    },
    category: 'Infrastruktur & Cache',
    formula: 'XADD stream_key * field value',
    examples: {
      en: [
        'Ingesting 5,000 midterm exam submissions per second in under 12ms before writing to PostgreSQL asynchronously',
      ],
      id: [
        'Mencatat 5.000 jawaban kuis per detik dalam waktu < 12ms sebelum disimpan bertahap ke PostgreSQL',
      ],
    },
    relatedTerms: ['architectural-constraint', 'mysql-deadlock'],
    articleIds: ['article-moodle-migration'],
  },
  {
    id: 'term-mock-location',
    slug: 'mock-location',
    title: {
      en: 'Mock Location (Fake GPS)',
      id: 'Mock Location (Manipulasi GPS Palsu)',
    },
    definition: {
      en: 'A mobile operating system feature or third-party exploit that injects fake coordinate latitude/longitude data into location APIs.',
      id: 'Fitur sistem operasi atau aplikasi pihak ketiga yang menyuntikkan koordinat lintang/bujur palsu ke API lokasi perangkat.',
    },
    category: 'Keamanan & Mobile',
    examples: {
      en: [
        'Detected by cross-referencing cell tower IDs, Wi-Fi BSSID signals, and satellite NMEA sentences',
        'Hardware attestation flags detecting mock location provider settings',
      ],
      id: [
        'Dideteksi melalui perbandingan silang menara seluler BTS, sinyal Wi-Fi sekitar, dan sensor gerak',
        'Pengecekan flag Android isFromMockProvider() dan status root perangkat',
      ],
    },
    relatedTerms: ['liveness-detection', 'point-in-polygon'],
    articleIds: ['article-biometric-antispoofing'],
  },
  {
    id: 'term-liveness-detection',
    slug: 'liveness-detection',
    title: {
      en: 'Biometric Liveness Detection',
      id: 'Liveness Detection Biometrik (Deteksi Manusia Asli)',
    },
    definition: {
      en: 'An anti-spoofing computer vision technique that verifies a biometric sample belongs to a live, physically present human rather than a photograph or video screen.',
      id: 'Teknik computer vision anti-spoofing yang memastikan sampel biometrik berasal dari manusia hidup fisik di tempat, bukan foto cetak atau video layar ponsel.',
    },
    category: 'Keamanan & AI',
    examples: {
      en: [
        'Passive: Specular reflection and micro-texture 3D depth analysis',
        'Active: Challenge-response prompts (e.g. blinking, head turns, random phrase speech)',
      ],
      id: [
        'Pasif: Menganalisis pantulan cahaya mikro dan kontur 3D kulit',
        'Aktif: Meminta pengguna berkedip atau menoleh secara acak',
      ],
    },
    relatedTerms: ['mock-location', 'point-in-polygon'],
    articleIds: ['article-biometric-antispoofing'],
  },
  {
    id: 'term-point-in-polygon',
    slug: 'point-in-polygon',
    title: {
      en: 'Point-in-Polygon (PIP) Algorithm',
      id: 'Algoritma Point-in-Polygon (Uji Titik dalam Poligon)',
    },
    definition: {
      en: 'A computational geometry algorithm (typically Ray Casting) determining whether a given 2D point lies inside, outside, or on the boundary of an arbitrary polygon.',
      id: 'Algoritma geometri komputasi (umumnya metode Ray Casting) untuk menguji apakah suatu koordinat titik 2D berada di dalam, di luar, atau di tepi poligon bangunan.',
    },
    category: 'Algoritma & Geometri',
    examples: {
      en: [
        'Casting a ray to infinity; odd number of edge crossings means inside, even means outside',
        'Used for high-precision geofencing of university building outlines',
      ],
      id: [
        'Menarik garis lurus maya ke tak terhingga; jumlah perpotongan ganjil berarti di dalam, genap berarti di luar',
        'Digunakan untuk membatasi absensi hanya di dalam denah resmi gedung kampus',
      ],
    },
    relatedTerms: ['mock-location', 'liveness-detection'],
    articleIds: ['article-biometric-antispoofing'],
  },
  {
    id: 'term-sigma-symbol',
    slug: 'sigma-symbol',
    title: {
      en: 'Sigma Symbol (σ / Σ)',
      id: 'Simbol Sigma (σ / Σ)',
    },
    definition: {
      en: 'The 18th letter of the Greek alphabet. In machine learning, lowercase σ represents non-linear activation functions (like sigmoid or standard deviation in statistics), while uppercase Σ denotes summation or covariance matrices.',
      id: 'Huruf ke-18 dalam alfabet Yunani. Dalam machine learning, huruf kecil σ melambangkan fungsi aktivasi non-linear (seperti sigmoid atau deviasi standar statistik), sedangkan huruf besar Σ melambangkan operasi penjumlahan beruntun atau matriks kovarians.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\sigma(z) = \\frac{1}{1 + e^{-z}} \\quad \\text{dan} \\quad \\Sigma = \\begin{bmatrix} \\sigma_{11} & \\dots \\\\ \\dots & \\sigma_{nn} \\end{bmatrix}',
    examples: {
      en: [
        '\\sigma(z) is the Sigmoid activation function mapping real numbers to range (0, 1)',
        '\\sigma represents standard deviation in Gaussian / Normal distribution N(\\mu, \\sigma^2)',
        '\\Sigma denotes the covariance matrix in multivariate statistics and PCA',
      ],
      id: [
        '\\sigma(z) adalah fungsi aktivasi Sigmoid yang memetakan nilai input ke rentang probabilitas (0, 1)',
        '\\sigma melambangkan standar deviasi dalam distribusi normal Gauss N(\\mu, \\sigma^2)',
        '\\Sigma melambangkan matriks kovarians dalam analisis multivariat dan Principal Component Analysis (PCA)',
      ],
    },
    content: {
      en: `### Definition & Mathematical Significance

The Greek letter **Sigma** ($\sigma$ lowercase, $\Sigma$ uppercase) has several essential applications in mathematics, artificial intelligence, and statistics:

1. **Activation Functions ($\sigma$)**: In neural networks, $\sigma(z) = \frac{1}{1 + e^{-z}}$ squashes activations into smooth probabilities between 0 and 1.
2. **Standard Deviation ($\sigma$)**: Measures statistical dispersion around the mean $\mu$.
3. **Summation Operator ($\Sigma$)**: Represents series addition across discrete indices $\sum_{i=1}^n x_i$.
4. **Covariance Matrix ($\Sigma$)**: Stores joint variabilities between multiple random vector components.`,
      id: `### Definisi & Peran Matematis

Huruf alfabet Yunani **Sigma** ($\sigma$ kecil, $\Sigma$ besar) memiliki beragam peran krusial dalam matematika, kecerdasan buatan, dan statistika:

1. **Fungsi Aktivasi ($\sigma$)**: Dalam jaringan saraf, $\sigma(z) = \frac{1}{1 + e^{-z}}$ memetakan nilai input ke probabilitas kontinu antara 0 dan 1.
2. **Standar Deviasi ($\sigma$)**: Mengukur sebaran variansi data di sekitar nilai rata-rata $\mu$.
3. **Operator Penjumlahan ($\Sigma$)**: Menjumlahkan deret bilangan $\sum_{i=1}^n x_i$.
4. **Matriks Kovarians ($\Sigma$)**: Menyimpan hubungan kovariansi antar dimensi data multivariat.`,
    },
    relatedTerms: ['activation-function', 'summation-sigma', 'neural-network'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-cdot-product',
    slug: 'cdot-product',
    title: {
      en: 'Dot Product Symbol (·)',
      id: 'Simbol Dot Product (· Perkalian Titik)',
    },
    definition: {
      en: 'An algebraic operator that takes two equal-length vectors and returns a single scalar number. It measures directional alignment, projection, and cosine similarity.',
      id: 'Operator aljabar linear yang mengalikan dua vektor berdimensi sama menghasilkan sebuah skalar tunggal. Mengukur derajat keselarasan arah, proyeksi geometris, dan cosine similarity.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: 'a \\cdot b = \\sum_{i=1}^n a_i b_i = \\|a\\| \\|b\\| \\cos(\\theta)',
    examples: {
      en: [
        'W · x computes weighted sum in artificial neurons: W_1 x_1 + W_2 x_2 + ... + W_n x_n',
        'a · b = 0 implies orthogonality (the two vectors are perpendicular at 90°)',
        'Used in Transformer attention: Attention(Q, K, V) = softmax((Q · Kᵀ) / √d_k) V',
      ],
      id: [
        'W · x menghitung jumlah berbobot pada neuron tiruan: W_1 x_1 + W_2 x_2 + ... + W_n x_n',
        'a · b = 0 menunjukkan ortogonalitas (kedua vektor tegak lurus membentuk sudut 90°)',
        'Digunakan pada rumus Transformer Attention: Attention(Q, K, V) = softmax((Q · Kᵀ) / √d_k) V',
      ],
    },
    content: {
      en: `### Mathematical Property of Dot Product

The dot product (written as $a \\cdot b$ or $\\langle a, b \\rangle$) is foundational to linear algebra:

- **Geometric Interpretation**: $a \\cdot b = \\|a\\| \\|b\\| \\cos(\\theta)$, reflecting how much vector $a$ aligns with vector $b$.
- **Neural Layer Propagation**: In $f(x) = \\sigma(W \\cdot x + b)$, the dot product calculates synaptic excitation before non-linear thresholding.`,
      id: `### Sifat Matematis Dot Product

Perkalian titik (ditulis $a \\cdot b$ atau $\\langle a, b \\rangle$) adalah fondasi aljabar linear:

- **Interpretasi Geometri**: $a \\cdot b = \\|a\\| \\|b\\| \\cos(\\theta)$, mencerminkan proyeksi dan keselarasan sudut dua vektor.
- **Propagasi Jaringan Saraf**: Pada persamaan $f(x) = \\sigma(W \\cdot x + b)$, dot product menghitung eksitasi sinapsis sebelum fungsi aktivasi.`,
    },
    relatedTerms: ['matrix-weights', 'euclidean-norm', 'neural-network'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-nabla-gradient',
    slug: 'nabla-gradient',
    title: {
      en: 'Nabla Operator (∇ Gradient)',
      id: 'Operator Nabla (∇ Vektor Gradien)',
    },
    definition: {
      en: 'A vector differential operator symbolized by an inverted Greek delta (∇). In multivariable calculus and machine learning, ∇f is the vector of all first-order partial derivatives, pointing in the direction of greatest rate of increase.',
      id: 'Operator diferensial vektor bersimbol segitiga terbalik (∇). Dalam kalkulus multivariabel dan AI, ∇f adalah vektor seluruh turunan parsial tingkat pertama yang menunjuk ke arah kenaikan fungsi paling curam.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\nabla f(x_1, \\dots, x_n) = \\left[ \\frac{\\partial f}{\\partial x_1}, \\frac{\\partial f}{\\partial x_2}, \\dots, \\frac{\\partial f}{\\partial x_n} \\right]^T',
    examples: {
      en: [
        'Gradient Descent optimization step: W ← W - η ∇_W L',
        '∇ · F represents divergence of vector field F',
        '∇ × F represents curl (rotational tendency) in physics',
      ],
      id: [
        'Langkah optimasi Gradient Descent: W ← W - η ∇_W L',
        '∇ · F merepresentasikan divergensi medan vektor F',
        '∇ × F merepresentasikan rotasi/curl dalam medan elektromagnetik',
      ],
    },
    content: {
      en: `### The Role of Nabla in Machine Learning

Without the nabla gradient operator $\\nabla$, deep neural networks could not optimize their parameter weights:
1. **Steepest Ascent**: $\\nabla L$ points in the direction where the loss function increases most rapidly.
2. **Negative Gradient**: Moving along $-\\nabla L$ decreases prediction error with optimal efficiency.`,
      id: `### Peran Nabla dalam Optimasi AI

Tanpa operator gradien $\\nabla$, jaringan saraf tiruan tidak akan bisa memperbarui jutaan bobot parameternya:
1. **Arah Kenaikan Tertinggi**: $\\nabla L$ menunjuk ke arah di mana fungsi error bertambah paling cepat.
2. **Gradien Negatif**: Melangkah ke arah sebaliknya ($-\\nabla L$) menjamin penurunan error model menuju titik minimum optimal.`,
    },
    relatedTerms: ['gradient-descent', 'partial-derivative', 'backpropagation'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-partial-derivative',
    slug: 'partial-derivative',
    title: {
      en: 'Partial Derivative Symbol (∂)',
      id: 'Simbol Turunan Parsial (∂)',
    },
    definition: {
      en: 'The stylized Cyrillic/Greek "curly d" (∂) used in calculus to denote the derivative of a multivariable function with respect to one variable while holding all other independent variables constant.',
      id: 'Simbol "d melengkung" (∂) dalam kalkulus diferensial yang menyatakan laju perubahan suatu fungsi multivariabel terhadap satu variabel tertentu dengan menganggap variabel lainnya konstan.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\frac{\\partial f}{\\partial x_i} = \\lim_{h \\to 0} \\frac{f(x_1, \\dots, x_i + h, \\dots, x_n) - f(x_1, \\dots, x_i, \\dots, x_n)}{h}',
    examples: {
      en: [
        'Backpropagation chain rule: ∂L/∂W_ij = (∂L/∂z_j) · (∂z_j/∂W_ij)',
        'Heat and wave partial differential equations: ∂u/∂t = α ∇²u',
        'Jacobian matrix J_ij = ∂f_i / ∂x_j',
      ],
      id: [
        'Aturan rantai Backpropagation: ∂L/∂W_ij = (∂L/∂z_j) · (∂z_j/∂W_ij)',
        'Persamaan diferensial parsial gelombang dan panas: ∂u/∂t = α ∇²u',
        'Matriks Jacobian J_ij = ∂f_i / ∂x_j',
      ],
    },
    content: {
      en: `### Partial Derivative & The Chain Rule

In deep learning backpropagation, each synaptic weight $W_{ij}$ influences the output through a cascade of intermediate matrix layers:

$$\\frac{\\partial L}{\\partial W} = \\frac{\\partial L}{\\partial y} \\cdot \\frac{\\partial y}{\\partial z} \\cdot \\frac{\\partial z}{\\partial W}$$

The partial derivative symbol $\\partial$ clarifies that we isolate the sensitivity of error $L$ to the specific weight $W$ under evaluation.`,
      id: `### Turunan Parsial & Aturan Rantai

Dalam algoritma backpropagation, setiap bobot sinaptik $W_{ij}$ memengaruhi output melalui susunan lapisan tersembunyi berantai:

$$\\frac{\\partial L}{\\partial W} = \\frac{\\partial L}{\\partial y} \\cdot \\frac{\\partial y}{\\partial z} \\cdot \\frac{\\partial z}{\\partial W}$$

Notasi $\\partial$ menegaskan bahwa kita mengisolasi sensitivitas perubahan error $L$ terhadap satu bobot spesifik $W$ yang sedang diuji.`,
    },
    relatedTerms: ['nabla-gradient', 'backpropagation', 'gradient-descent'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-integer-set-z',
    slug: 'integer-set-z',
    title: {
      en: 'Integer Number Set (ℤ)',
      id: 'Himpunan Bilangan Bulat (ℤ)',
    },
    definition: {
      en: 'The blackboard-bold letter ℤ (from German "Zahlen", meaning numbers) denotes the set of all integers {..., -2, -1, 0, 1, 2, ...}. In modular music theory, ℤ_12 represents the cyclic group of 12 chromatic pitch classes.',
      id: 'Huruf tebal ℤ (berasal dari bahasa Jerman "Zahlen", berarti bilangan) melambangkan himpunan semua bilangan bulat {..., -2, -1, 0, 1, 2, ...}. Dalam teori musik modular, ℤ_12 melambangkan grup siklis 12 kelas nada kromatik.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\mathbb{Z} = \\{ \\dots, -2, -1, 0, 1, 2, \\dots \\} \\quad \\text{dan} \\quad \\mathbb{Z}_{12} = \\{ 0, 1, 2, \\dots, 11 \\}',
    examples: {
      en: [
        'ℤ_12 models the 12 chromatic pitches (0=C, 1=C#, 2=D, ..., 11=B)',
        'ℤ_2 represents binary Boolean domain {0, 1}',
        'Modular group addition: (7 + 6) mod 12 = 1 (G + 6 semitones = C# in ℤ_12)',
      ],
      id: [
        'ℤ_12 memodelkan 12 nada kromatik (0=C, 1=C#, 2=D, ..., 11=B)',
        'ℤ_2 melambangkan domain biner logika Boolean {0, 1}',
        'Penjumlahan grup modular: (7 + 6) mod 12 = 1 (Nada G + 6 semitone = C# dalam ℤ_12)',
      ],
    },
    content: {
      en: `### Discrete Mathematics & Modular Groups

The set $\\mathbb{Z}_{n}$ forms a finite abelian group under addition modulo $n$. In music computing (such as **NoteLogic**), $\\mathbb{Z}_{12}$ enables chord voicing and transposition calculations to be executed as simple vector integer additions without static lookup tables.`,
      id: `### Matematika Diskrit & Grup Modular

Himpunan $\\mathbb{Z}_{n}$ membentuk grup abelian hingga di bawah operasi penjumlahan modulo $n$. Dalam aplikasi audio seperti **NoteLogic**, ruang $\\mathbb{Z}_{12}$ memungkinkan transposisi akor dihitung instan sebagai operasi penambahan vektor integer.`,
    },
    relatedTerms: ['modulo-operator', 'pitch-class', 'semitone', 'tritone'],
    articleIds: ['article-notelogic-audio'],
  },
  {
    id: 'term-modulo-operator',
    slug: 'modulo-operator',
    title: {
      en: 'Modulo Congruence Operator (mod / ≡)',
      id: 'Operator Modulo & Kongruensi (mod / ≡)',
    },
    definition: {
      en: 'An arithmetic operation that yields the remainder of division of one number by another. In number theory, a ≡ b (mod n) means that (a - b) is an exact integer multiple of n.',
      id: 'Operasi aritmatika yang menghasilkan sisa pembagian bulat suatu bilangan terhadap bilangan pembagi. Dalam teori bilangan, a ≡ b (mod n) menyatakan bahwa selisih (a - b) habis dibagi oleh n.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: 'a \\pmod{n} = r \\quad \\text{dimana} \\quad a = q \\cdot n + r \\quad (0 \\le r < n)',
    examples: {
      en: [
        '14 mod 12 = 2 (14 semitones above C is note D)',
        'T_6(T_6(x)) = (x + 12) ≡ x (mod 12) (Double tritone returns to origin pitch)',
        'Cryptographic RSA hashing: c = m^e mod N',
      ],
      id: [
        '14 mod 12 = 2 (14 semitone di atas nada C adalah nada D)',
        'T_6(T_6(x)) = (x + 12) ≡ x (mod 12) (Dua kali interval tritone kembali ke nada asal)',
        'Enkripsi RSA: c = m^e mod N',
      ],
    },
    content: {
      en: `### Modulo in Software Engineering & Music

The modulo operator (denoted as \`%\` in programming languages and $\\pmod{n}$ in mathematics) wraps unbounded values into a finite cyclical range:
- **Circular Buffers & Ring Queues**: \`index = (index + 1) % capacity\`
- **Octave Equivalence**: Any pitch value $x + 12k$ sounds acoustically equivalent modulo 12.`,
      id: `### Modulo dalam Rekayasa Perangkat Lunak & Musik

Operator modulo (dilambangkan \`%\` dalam bahasa pemrograman dan $\\pmod{n}$ dalam matematika) melipat nilai kontinu ke dalam siklus terbatas:
- **Circular Buffer**: \`index = (index + 1) % kapasitas\`
- **Ekuivalensi Oktaf**: Semua nada $x + 12k$ memiliki karakter harmonik yang identik secara modulo 12.`,
    },
    relatedTerms: ['integer-set-z', 'pitch-class', 'tritone'],
    articleIds: ['article-notelogic-audio'],
  },
  {
    id: 'term-approx-symbol',
    slug: 'approx-symbol',
    title: {
      en: 'Approximation Symbol (≈)',
      id: 'Simbol Aproksimasi (≈ Mendekati)',
    },
    definition: {
      en: 'A mathematical relation symbol indicating that two values or expressions are nearly equal or asymptotically close, often used when decimal representations are irrational or truncated.',
      id: 'Simbol relasi matematika yang menyatakan bahwa dua nilai atau ekspresi hampir sama nilainya (mendekati), lazim digunakan saat merepresentasikan bilangan irasional atau pembulatan komputasi.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '2^{1/12} \\approx 1.0594631, \\quad \\pi \\approx 3.14159, \\quad e \\approx 2.71828',
    examples: {
      en: [
        '12-TET semitone multiplier: r = 2^(1/12) ≈ 1.059463',
        'Taylor series approximation: sin(x) ≈ x for small angles x',
        '0.1 + 0.2 ≈ 0.3 (in IEEE 754 floating point arithmetic)',
      ],
      id: [
        'Pengali frekuensi semitone 12-TET: r = 2^(1/12) ≈ 1.059463',
        'Aproksimasi deret Taylor: sin(x) ≈ x untuk sudut kecil x',
        '0.1 + 0.2 ≈ 0.3 (dalam standar floating point biner IEEE 754)',
      ],
    },
    content: {
      en: `### Approximation in Computation and Acoustics

Exact analytical formulas often produce irrational numbers that cannot be represented in finite memory bits. We use the approximation sign $\\approx$ to indicate numerical estimates within defined tolerance thresholds.`,
      id: `### Makna Aproksimasi dalam Komputasi

Banyak konstanta fisika dan harmoni bernilai irasional sehingga tidak dapat disimpan sempurna dalam memori berkapasitas terbatas. Simbol $\\approx$ menandakan batas toleransi nilai pendekatan yang presisi.`,
    },
    relatedTerms: ['floating-point-arithmetic', 'semitone', 'pi-constant'],
    articleIds: ['article-notelogic-audio', 'article-quirks-computer-science'],
  },
  {
    id: 'term-max-function',
    slug: 'max-function',
    title: {
      en: 'Maximum Function (max / ReLU)',
      id: 'Fungsi Nilai Maksimum (max / ReLU)',
    },
    definition: {
      en: 'A mathematical function returning the largest value among its arguments. In modern deep learning, f(x) = max(0, x) defines the Rectified Linear Unit (ReLU), the standard activation function preventing vanishing gradients.',
      id: 'Fungsi matematika yang memilih nilai terbesar di antara argumennya. Dalam deep learning modern, f(x) = max(0, x) mendefinisikan Rectified Linear Unit (ReLU), fungsi aktivasi standar yang mencegah vanishing gradient.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\text{ReLU}(x) = \\max(0, x) = \\begin{cases} 0 & \\text{jika } x < 0 \\\\ x & \\text{jika } x \\ge 0 \\end{cases}',
    examples: {
      en: [
        'ReLU(3.5) = 3.5, ReLU(-4.2) = 0',
        'Derivative: d/dx ReLU(x) = 1 if x > 0 else 0 (computationally lightning-fast)',
        'Leaky ReLU: max(0.01x, x) avoids "dead neuron" pathology',
      ],
      id: [
        'ReLU(3.5) = 3.5, ReLU(-4.2) = 0',
        'Turunan: d/dx ReLU(x) = 1 jika x > 0 dan 0 jika x < 0 (sangat cepat dihitung oleh GPU)',
        'Leaky ReLU: max(0.01x, x) mencegah masalah matinya neuron (dying neuron problem)',
      ],
    },
    content: {
      en: `### Why ReLU and max(0, x) Changed Deep Learning

Before ReLU, networks used sigmoid or tanh, whose derivatives saturate at $\\approx 0$ for large inputs, causing backpropagation error signals to vanish in deep layers. By using $\\max(0, x)$, gradients remain consistently $1$ for all positive activations.`,
      id: `### Mengapa max(0, x) / ReLU Merevolusi AI

Sebelum ReLU, jaringan saraf memakai fungsi sigmoid atau tanh yang turunannya mendekati 0 untuk nilai ekstrem, menyebabkan error backpropagation lenyap (vanishing gradient). Dengan $\\max(0, x)$, nilai turunan selalu konstan bernilai 1 untuk semua input positif.`,
    },
    relatedTerms: ['activation-function', 'neural-network', 'backpropagation'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-element-of',
    slug: 'element-of',
    title: {
      en: 'Element-of Set Symbol (∈)',
      id: 'Simbol Keanggotaan Himpunan (∈)',
    },
    definition: {
      en: 'A fundamental set theory symbol denoting that an object x belongs to or is a member of a set S (written x ∈ S).',
      id: 'Simbol fundamental teori himpunan yang menyatakan bahwa suatu elemen x merupakan anggota sah dari sebuah himpunan S (ditulis x ∈ S).',
    },
    category: 'Simbol & Notasi Matematika',
    formula: 'x \\in S \\iff x \\text{ is an element of set } S',
    examples: {
      en: [
        'x ∈ {0, 4, 7} indicates note offset x belongs to the Major Triad set',
        'k ∈ ℤ denotes integer membership',
        'x ∉ S denotes non-membership (x does not belong to set S)',
      ],
      id: [
        'x ∈ {0, 4, 7} menunjukkan interval nada x merupakan bagian dari akor Mayor',
        'k ∈ ℤ menyatakan bahwa k adalah anggota bilangan bulat',
        'x ∉ S menyatakan bukan anggota himpunan',
      ],
    },
    content: {
      en: `### Set Notation in Algorithms

The notation $\\{ f(x) \\mid x \\in S \\}$ describes set comprehension — mapping transformations over member elements, identical to functional \`.map()\` operations in TypeScript and Python!`,
      id: `### Notasi Himpunan dalam Algoritma

Notasi himpunan $\\{ f(x) \\mid x \\in S \\}$ setara dengan operasi fungsional \`.map()\` pada TypeScript dan Python, di mana setiap elemen $x$ dalam koleksi $S$ diproses secara berurutan.`,
    },
    relatedTerms: ['integer-set-z', 'pitch-class'],
    articleIds: ['article-notelogic-audio'],
  },
  {
    id: 'term-matrix-weights',
    slug: 'matrix-weights',
    title: {
      en: 'Synaptic Weight Matrix (W)',
      id: 'Matriks Bobot Sinaptik (W)',
    },
    definition: {
      en: 'A 2D array of real numbers representing the trainable connection strengths between neurons in adjacent neural network layers. During learning, gradient descent modifies matrix W to minimize loss.',
      id: 'Matriks 2 dimensi bilangan riil yang merepresentasikan kekuatan hubungan sinaptik antar neuron pada lapisan jaringan saraf. Selama pelatihan, algoritma gradient descent memodifikasi matriks W ini.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: 'W \\in \\mathbb{R}^{m \\times n}, \\quad z = W x + b = \\begin{bmatrix} w_{11} & \\dots & w_{1n} \\\\ \\vdots & \\ddots & \\vdots \\\\ w_{m1} & \\dots & w_{mn} \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ \\vdots \\\\ x_n \\end{bmatrix} + \\begin{bmatrix} b_1 \\\\ \\vdots \\\\ b_m \\end{bmatrix}',
    examples: {
      en: [
        'In a layer mapping 784 pixels to 128 neurons, W is a 128 × 784 matrix (100,352 parameters)',
        'Updated each batch via W ← W - η ∇_W L',
        'Transposed during backpropagation backward pass: δ^(l-1) = (W^(l))ᵀ δ^(l) ⊙ σ\'(z^(l-1))',
      ],
      id: [
        'Pada lapisan input 784 piksel ke 128 neuron, W adalah matriks 128 × 784 (100.352 parameter bobot)',
        'Diperbarui tiap batch melalui W ← W - η ∇_W L',
        'Diterapkan operasi transpose saat backward pass backpropagation',
      ],
    },
    content: {
      en: `### The Core Storage of Machine Intelligence

All knowledge in a neural network is stored within the numerical values of its weight matrices $W$. Modern LLMs contain hundreds of billions of matrix parameters trained to encode human language concepts.`,
      id: `### Media Penyimpan Kecerdasan Buatan

Seluruh pengetahuan dan memori jaringan saraf tiruan tersimpan dalam angka-angka matriks bobot $W$. Model LLM mutakhir memiliki ratusan miliar bobot matriks yang merepresentasikan konsep bahasa manusia.`,
    },
    relatedTerms: ['neural-network', 'bias-vector', 'gradient-descent', 'backpropagation'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-bias-vector',
    slug: 'bias-vector',
    title: {
      en: 'Bias Vector (b)',
      id: 'Vektor Bias (b)',
    },
    definition: {
      en: 'An additive parameter vector in neural network layers that shifts the activation threshold independently of inputs, enabling neurons to fire even when input vectors are zero.',
      id: 'Vektor parameter penjumlahan pada lapisan jaringan saraf yang menggeser ambang batas fungsi aktivasi secara independen dari input, memungkinkan neuron tetap aktif saat input bernilai nol.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: 'z = W x + b \\quad (b \\in \\mathbb{R}^m)',
    examples: {
      en: [
        'Allows affine transformation lines y = mx + b to not be forced through the origin (0,0)',
        'Updated via b ← b - η ∇_b L during backpropagation',
      ],
      id: [
        'Membuat garis transformasi linier y = mx + b tidak terkunci di titik asal (0,0)',
        'Diperbarui melalui b ← b - η ∇_b L selama proses backpropagation',
      ],
    },
    content: {
      en: `### Geometric Importance of Bias

Without the bias vector $b$, the activation boundary is constrained to pass through the origin $(0, 0)$. Bias provides translational freedom, allowing decision boundaries to position anywhere in latent space.`,
      id: `### Peran Geometri Vektor Bias

Tanpa vektor bias $b$, bidang pemisah klasifikasi terpaksa selalu melewati titik pusat $(0,0)$. Bias memberikan kebebasan translasi sehingga batas keputusan dapat diposisikan optimal di ruang laten.`,
    },
    relatedTerms: ['matrix-weights', 'neural-network', 'activation-function'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-summation-sigma',
    slug: 'summation-sigma',
    title: {
      en: 'Summation Operator (Σ)',
      id: 'Notasi Sigma Penjumlahan (Σ)',
    },
    definition: {
      en: 'A mathematical notation representing the sum of a sequence of numbers indexed from a starting value to an upper limit.',
      id: 'Notasi matematika yang melambangkan operasi penjumlahan beruntun dari sekumpulan suku berindeks dari batas bawah ke batas atas.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\sum_{i=1}^n x_i = x_1 + x_2 + \\dots + x_n',
    examples: {
      en: [
        'Mean Squared Error loss: MSE = (1/n) Σ_{i=1}^n (y_i - ŷ_i)²',
        'Vector dot product: a · b = Σ_{i=1}^n a_i b_i',
        'Softmax normalization: P(y=k|x) = e^(z_k) / Σ_{j=1}^K e^(z_j)',
      ],
      id: [
        'Rumus Mean Squared Error: MSE = (1/n) Σ_{i=1}^n (y_i - ŷ_i)²',
        'Perkalian dot product: a · b = Σ_{i=1}^n a_i b_i',
        'Normalisasi probabilitas Softmax: P(y=k|x) = e^(z_k) / Σ_{j=1}^K e^(z_j)',
      ],
    },
    content: {
      en: `### Summation in Machine Learning

Summation $\\sum$ is ubiquitous across AI algorithms: calculating empirical loss, evaluating softmax denominator normalizations, and aggregating layer activations.`,
      id: `### Penjumlahan Sigma dalam Machine Learning

Notasi $\\sum$ ada di setiap rumus dasar AI: menghitung total kerugian prediksi (loss), normalisasi penyebut Softmax, hingga akumulasi bobot sinaptik.`,
    },
    relatedTerms: ['sigma-symbol', 'cdot-product', 'gradient-descent'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-euclidean-norm',
    slug: 'euclidean-norm',
    title: {
      en: 'Euclidean Norm / Vector Magnitude (||x||)',
      id: 'Norm Euclidean / Panjang Vektor (||x||)',
    },
    definition: {
      en: 'The standard geometric length or magnitude of a vector in Euclidean space, calculated as the square root of the sum of squared vector components (L2 norm).',
      id: 'Panjang geometris standar atau magnitudo suatu vektor dalam ruang Euclidean, dihitung sebagai akar kuadrat dari jumlah kuadrat seluruh komponen vektor (L2 norm).',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\|x\\|_2 = \\sqrt{\\sum_{i=1}^n x_i^2} = \\sqrt{x_1^2 + x_2^2 + \\dots + x_n^2}',
    examples: {
      en: [
        'Cosine similarity: sim(A, B) = (A · B) / (||A|| ||B||)',
        'L2 Weight Regularization (Ridge / Weight Decay): Loss_total = Loss_0 + λ ||W||²',
        'Unit vector normalization: u = v / ||v||',
      ],
      id: [
        'Rumus Cosine Similarity: sim(A, B) = (A · B) / (||A|| ||B||)',
        'Regularisasi L2 (Weight Decay): Loss_total = Loss_0 + λ ||W||²',
        'Normalisasi vektor satuan: u = v / ||v||',
      ],
    },
    content: {
      en: `### Applications in Embeddings & Vector Search

In modern RAG (Retrieval-Augmented Generation) and vector databases, document embeddings are normalized to unit length ($\\|e\\| = 1$) so that dot products directly compute cosine similarities.`,
      id: `### Penerapan dalam Embedding & Pencarian Vektor

Dalam sistem RAG dan basis data vektor AI, representasi embedding dokumen dinormalisasi menjadi vektor satuan ($\\|e\\| = 1$) agar operasi perkalian titik langsung menghasilkan nilai cosine similarity.`,
    },
    relatedTerms: ['cdot-product', 'matrix-weights'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-pi-constant',
    slug: 'pi-constant',
    title: {
      en: 'Pi Constant (π)',
      id: 'Konstanta Pi (π)',
    },
    definition: {
      en: 'The mathematical constant representing the ratio of a circle\'s circumference to its diameter, approximately 3.1415926535... It is transcendental and ubiquitous in geometry, trigonometry, Fourier transforms, and wave audio synthesis.',
      id: 'Konstanta matematika yang menyatakan perbandingan keliling lingkaran terhadap diameternya, bernilai aproksimasi 3,1415926535... Merupakan bilangan transendental yang sangat penting dalam geometri, trigonometri, transformasi Fourier, dan sintesis audio.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\pi = \\frac{C}{d} \\approx 3.141592653589793, \\quad e^{i\\pi} + 1 = 0 \\text{ (Identitas Euler)}',
    examples: {
      en: [
        'Sine wave audio oscillator frequency: y(t) = A · sin(2π · f · t)',
        'Continuous Fourier Transform: F(ω) = ∫ f(t) e^(-i 2π f t) dt',
        'Gaussian distribution normalization factor: 1 / √(2π σ²)',
      ],
      id: [
        'Osilator gelombang sinusoidal Web Audio API: y(t) = A · sin(2π · f · t)',
        'Transformasi Fourier: F(ω) = ∫ f(t) e^(-i 2π f t) dt',
        'Faktor normalisasi kurva Gauss: 1 / √(2π σ²)',
      ],
    },
    content: {
      en: `### Pi in Audio Synthesis and Physics

In **NoteLogic** and Web Audio synthesis, every tone generator uses $2\\pi f t$ to compute angular phase velocity for generating pure sine oscillations.`,
      id: `### Peran Pi dalam Sintesis Audio & Web Audio

Pada aplikasi **NoteLogic**, generator nada memanfaatkan formula $2\\pi f t$ untuk menghitung fase sudut gelombang osilasi sinus pada frekuensi Hertz yang tepat.`,
    },
    relatedTerms: ['approx-symbol', 'pitch-class'],
    articleIds: ['article-notelogic-audio'],
  },
  {
    id: 'term-integral-symbol',
    slug: 'integral-symbol',
    title: {
      en: 'Integral Symbol (∫)',
      id: 'Simbol Integral (∫)',
    },
    definition: {
      en: 'The elongated S symbol (∫, from Latin "summa") representing continuous integration, computing areas under curves, total accumulation, and continuous probability distributions.',
      id: 'Simbol huruf S memanjang (∫, dari bahasa Latin "summa") yang melambangkan operasi integrasi kontinu untuk menghitung luas area di bawah kurva, akumulasi total, dan distribusi probabilitas kontinu.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\int_a^b f(x) \\, dx = \\lim_{\\Delta x \\to 0} \\sum_{i=1}^n f(x_i) \\Delta x',
    examples: {
      en: [
        'Total continuous probability: ∫_{-∞}^{∞} P(x) dx = 1',
        'Fundamental Theorem of Calculus: d/dx ∫_a^x f(t) dt = f(x)',
        'Continuous expectation in statistics: E[X] = ∫ x f(x) dx',
      ],
      id: [
        'Total probabilitas kontinu: ∫_{-∞}^{∞} P(x) dx = 1',
        'Teorema Fundamental Kalkulus: d/dx ∫_a^x f(t) dt = f(x)',
        'Nilai harapan matematika: E[X] = ∫ x f(x) dx',
      ],
    },
    content: {
      en: `### Continuous Counterpart of Summation

While $\\Sigma$ adds discrete points, the integral $\\int$ sums continuous intervals, forming the bedrock of modern statistical mechanics and continuous deep learning models (such as Neural ODEs).`,
      id: `### Mitra Kontinu dari Notasi Sigma

Jika $\\Sigma$ menjumlahkan titik-titik diskrit, simbol integral $\\int$ menjumlahkan kontinuitas tak terhingga, menjadi landasan teori probabilitas dan pemodelan Neural ODE.`,
    },
    relatedTerms: ['summation-sigma', 'partial-derivative'],
    articleIds: ['article-learning-ai-neural-networks'],
  },
  {
    id: 'term-infinity-symbol',
    slug: 'infinity-symbol',
    title: {
      en: 'Infinity Symbol (∞ Lemniscate)',
      id: 'Simbol Tak Hingga (∞ Lemniskat)',
    },
    definition: {
      en: 'The mathematical lemniscate symbol (∞) representing an unbounded quantity larger than any finite real number, crucial for calculus limits, Ray Casting geometry, and asymptotic analysis.',
      id: 'Simbol pita lemniskat (∞) yang menyatakan besaran tanpa batas yang lebih besar daripada bilangan riil mana pun, sangat penting dalam limit kalkulus, algoritma Ray Casting, dan analisis asimtotik algoritma.',
    },
    category: 'Simbol & Notasi Matematika',
    formula: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0, \\quad \\text{Ray Casting: } \\text{ray}(t) = P + t \\cdot \\vec{d} \\quad (0 \\le t < \\infty)',
    examples: {
      en: [
        'Ray Casting in Point-in-Polygon: casting a line segment from point P to x = +∞',
        'Softmax temperature limit: lim_{T→0} softmax(z/T) approaches argmax hard one-hot',
        'Algorithm asymptotic upper bound: O(n log n) as n → ∞',
      ],
      id: [
        'Ray Casting pada Point-in-Polygon: menarik garis sinar dari titik P menuju x = +∞',
        'Limit temperatur Softmax: saat T mendekati 0, probabilitas memusat tajam ke argmax',
        'Batas atas kompleksitas algoritma: O(n log n) saat n → ∞',
      ],
    },
    content: {
      en: `### Infinity in Geometric Algorithms

In the Point-in-Polygon (PIP) geofencing algorithm, ray casting draws a virtual ray from the user's GPS coordinates to $(+\\infty, y)$. By counting how many polygon boundaries this infinite ray crosses (odd vs. even), the algorithm proves containment in $O(V)$ time.`,
      id: `### Peran Tak Hingga dalam Algoritma Geometri

Pada algoritma Point-in-Polygon (PIP) untuk absensi geofencing, metode Ray Casting menarik garis maya dari koordinat GPS ke titik $(+\\infty, y)$. Jumlah perpotongan batas poligon (ganjil = di dalam, genap = di luar) menentukan keabsahan posisi pengguna.`,
    },
    relatedTerms: ['point-in-polygon', 'mock-location'],
    articleIds: ['article-biometric-antispoofing'],
  },
];

export const initialCommentsData: ArticleComment[] = [
  {
    id: 'comment-1',
    articleId: 'article-learning-ai-neural-networks',
    articleSlug: 'neural-networks-backpropagation-math',
    authorName: 'Rian Hidayat',
    authorAvatar: '',
    content: 'Penjelasan kalkulus rantai turunan pada backpropagation sangat gamblang dan mudah dipahami! Terima kasih ulasannya.',
    createdAt: '2024-03-15T10:30:00Z',
    likes: 5,
  },
  {
    id: 'comment-2',
    articleId: 'article-quirks-computer-science',
    articleSlug: 'quirks-facts-computer-science-programming',
    authorName: 'Sarah Jenkins',
    authorAvatar: '',
    content: 'That 0.1 + 0.2 explanation is timeless. Still surprises junior developers every day in JavaScript code reviews!',
    createdAt: '2024-04-02T14:15:00Z',
    likes: 8,
  },
  {
    id: 'comment-3',
    articleId: 'article-notelogic-audio',
    articleSlug: 'mathematics-in-music-theory-chords',
    authorName: 'Dimas Pratama',
    authorAvatar: '',
    content: 'Baru tahu kalau tritone B ke F di chord G7 itu alasan kenapa musik Barat punya rasa "harus selesai" ke C Mayor. Sangat membuka wawasan musik!',
    createdAt: '2024-05-18T09:45:00Z',
    likes: 12,
  },
  {
    id: 'comment-4',
    articleId: 'article-moodle-migration',
    articleSlug: 'moodle-to-custom-lms-migration',
    authorName: 'Arif Wibowo',
    authorAvatar: '',
    content: 'Pendekatan Redis Stream untuk menampung lonjakan ujian UTS ini cerdas sekali. Mengurangi deadlock MySQL secara drastis.',
    createdAt: '2024-02-28T16:20:00Z',
    likes: 7,
  },
];

export const initialIssuesData: CommunityIssue[] = [];
