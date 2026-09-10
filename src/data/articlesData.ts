import { Article, VanpediaTerm } from '../types';

export const articlesData: Article[] = [
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
3. **High-Concurrency Submission Queues**: Instead of writing submissions synchronously to PostgreSQL, exam answers are ingested into an in-memory Redis stream, acknowledged in under 12ms to the student, and processed asynchronously via background workers.

### The Results

During the first semester midterm deployment:
- **Zero downtime** across 15,000 enrolled students.
- **Page transition speed** jumped from 2.8 seconds to ~300ms.
- **Faculty grading efficiency** increased by 40% thanks to a dedicated keyboard-navigable assessment UI.

True craftsmanship in software engineering isn't about using whatever is trendy—it's about applying the right [[architectural-constraint]] to eliminate user friction.`,
      id: `### Tantangan Sistem LMS Lama

Selama lebih dari satu dekade, banyak kampus bergantung pada instalasi monolitik Moodle (PHP). Meskipun kaya fitur, saat musim ujian serentak—di mana 5.000+ mahasiswa mengumpulkan ujian di jendela waktu 5 menit yang sama—server kerap mengalami kehaburan worker PHP-FPM dan [[mysql-deadlock]].

Selain itu, antarmuka Moodle yang rumit membuat dosen dan mahasiswa kesulitan saat mengaksesnya dari smartphone.

### Keputusan Arsitektur

Kami memutuskan membangun sistem LMS mandiri yang benar-benar cocok dengan ritme perkuliahan kampus:

1. **Frontend Reaktif Modern**: Menggunakan Next.js dan Tailwind CSS dengan optimasi cache client dan layout reaktif yang sangat responsif di perangkat seluler.
2. **Backend Terstruktur dengan NestJS**: Memisahkan modul perkuliahan, penugasan, presensi, dan penilaian ke dalam domain terisolasi dengan prinsip Dependency Injection.
3. **Antrian Ujian Berbasis Redis Stream**: Jawaban kuis mahasiswa tidak langsung dikunci ke baris PostgreSQL, melainkan dicatat cepat ke Redis stream dalam waktu < 12ms, kemudian disimpan secara bertahap oleh worker background.

### Hasil Nyata

Pada peluncuran perdana di Ujian Tengah Semester:
- **0% Downtime** sepanjang pekulangan ujian untuk 15.000 mahasiswa aktif.
- **Waktu buka halaman** melesat dari 2,8 detik menjadi ~300ms.
- **Efisiensi dosen dalam menilai tugas** naik 40% berkat fitur shortcut keyboard dan pratinjau dokumen instan.`,
    },
    date: 'February 2024',
    readTime: '6 min read',
    category: 'Architecture',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'Performance'],
    vanpediaTerms: ['mysql-deadlock', 'architectural-constraint', 'redis-stream'],
  },
  {
    id: 'article-notelogic-audio',
    slug: 'designing-notelogic-web-audio',
    title: {
      en: 'Designing NoteLogic: In-Browser Music Theory Engine with Web Audio & SVG',
      id: 'Merancang NoteLogic: Mesin Teori Musik In-Browser dengan Web Audio & SVG',
    },
    summary: {
      en: 'How I engineered a zero-dependency interactive chord explorer, harmonic formula mathematical model, and multi-track guitar tab editor in React and TypeScript.',
      id: 'Bagaimana saya membangun chord explorer interaktif tanpa sample audio berat, model matematika formula harmoni musik, dan editor tablatur di React & TypeScript.',
    },
    content: {
      en: `### Why Build NoteLogic?

Music theory is deeply logical and mathematical, yet most educational software feels either clunky, text-heavy, or gated behind paywalls. I wanted to build **NoteLogic** as an intuitive, fast, and visually stunning digital instrument.

### Technical Pillars

#### 1. Pure Mathematical Pitch Representation

Instead of hardcoding hundreds of chord images or mp3 samples, all 954+ chords in NoteLogic are derived dynamically using pitch-class set theory:
- Every note is mapped to an integer modulo 12: C = 0, C# = 1, ..., B = 11.
- Intervals are expressed as integer semitone offsets. A [[tritone]] spans 6 semitones with high dissonance.
- Chord formulas (e.g. Minor Triad [0, 3, 7]) are projected onto dynamic guitar fretboard matrices and piano keyboard SVGs with instant sharp/flat notation adjustments.

#### 2. Lightweight Web Audio Synthesis

Loading hundreds of megabytes of sampled guitar and piano notes kills mobile performance. Instead, NoteLogic synthesizes plucked strings and acoustic piano tones in real-time using polyphonic oscillator nodes and exponential gain envelope decoders:

\`\`\`ts
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();
gain.gain.setValueAtTime(0.3, now);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
\`\`\`

#### 3. SVG Fretboard & Piano Rendering

The chord voicing is rendered as an SVG fretboard grid. Each string can display a specific fret position. For example, a C Major chord on guitar uses the open-position fingering x 3 2 0 1 0.

### Conclusion

By treating music as data—interval vectors, pitch classes, and modular arithmetic—we built an engine that generalizes to any chord, any key, and any instrument voicing.`,
      id: `### Kenapa Membangun NoteLogic?

Teori musik sebenarnya sangat logis dan matematis, namun kebanyakan perangkat lunak edukasi terasa berat dan kaku. Saya ingin membangun **NoteLogic** sebagai alat digital yang intuitif dan cepat.

### Pilar Teknis

#### 1. Representasi Pitch Matematis

Daripada hardcode gambar chord atau sample mp3, semua chord 954+ di NoteLogic dihitung dinamis dengan teori himpunan kelas nada:
- Setiap nada dipetakan ke bilangan bulat mod 12: C = 0, C# = 1, ..., B = 11.
- Interval dinyatakan sebagai offset semitone. [[tritone]] menempuri 6 semitone dengan disonansi tinggi.
- Formula chord (mis. Minor Triad [0, 3, 7]) diproyeksikan ke grid fretboard gitar dan keyboard piano SVG secara dinamis.

#### 2. Sintesis Web Audio Ringan

Memuat ratusan megabyte sample gitar dan piano justru menghambat performa mobile. Sebaliknya, NoteLogic mensintesis nada secara real-time dengan oscillator node dan exponential gain envelope:`,
    },
    date: 'May 2024',
    readTime: '8 min read',
    category: 'AI & Music',
    tags: ['Web Audio API', 'TypeScript', 'SVG', 'Music Theory', 'React'],
    vanpediaTerms: ['tritone', 'pitch-class', 'semitone', 'minor-triad'],
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
- Android Fake GPS / Mock Location mockups fooling native browser geolocation APIs.
- Replaying historical network payload requests.

### Engineering the Defense Layers

To establish foolproof verification while keeping clock-in duration under 3 seconds per employee, we implemented a layered defense strategy:

#### 1. Passive + Active Liveness Verification

Rather than relying on static images, the camera captures a short high-entropy burst. We compute micro-motion vectors and specular light reflections to distinguish between 3D human skin and flat emissive smartphone screens.

#### 2. Cryptographic Device Attestation & GPS Hardening

On the client, we query multiple location providers (Cell tower, Wi-Fi BSSID triangulation, and satellite GPS). We cross-reference the reported accuracy radius and verify device integrity flags to detect root/jailbreak environments and [[mock-location]] mockups.

#### 3. Convex Hull Campus Geofencing

Rather than a simple circular radius (which often leaks into public streets or cafes adjacent to campus), we calculate point-in-polygon checks against pre-mapped 2D boundaries of campus buildings.

### Outcome
Over 3,500 staff members now clock in daily with average verification speeds of 1.4 seconds. False positives dropped to negligible levels, delivering genuine fairness and audit compliance for institutional payroll.`,
      id: `### Masalah: Kecurangan Absensi Pegawai

Pada lingkungan kampus dan kantor berskala besar, sistem absensi berbasis foto biasa kerap kali dicurangi:
- Memotret foto orang lain dari layar HP atau cetakan kertas.
- Penggunaan aplikasi Fake GPS untuk memanipulasi koordinat.
- Pemutaran ulang (replay attack) permintaan HTTP absensi terdahulu.

### Strategi Pertahanan Bertingkat

Kami merancang mekanisme keamanan berlapis yang tetap nyaman digunakan dengan waktu proses di bawah 3 detik:

#### 1. Verifikasi Liveness Wajah

Kamera tidak sekadar mengambil satu frame foto, melainkan menganalisis pantulan cahaya dan kedalaman kontur mikro wajah untuk membedakan wajah asli manusia 3D dengan layar kaca smartphone 2D.

#### 2. Deteksi Mock Location & Poligon Geofence

Sistem memeriksa konsistensi koordinat GPS bersama data menara seluler dan Wi-Fi di sekitarnya. Penggunaan [[mock-location]] langsung ditandai dan ditolak.

#### 3. Geofence Poligon Presisi

Bukan sekadar radius lingkaran statis, kami menerapkan algoritma point-in-polygon yang presisi mengikuti denah batas gedung resmi kampus.

### Hasil
Kini 3.500+ pegawai melakukan absensi harian dengan rata-rata waktu verifikasi 1,4 detik per orang, menghemat jutaan rupiah anggaran dan menciptakan transparansi kerja.`,
    },
    date: 'November 2023',
    readTime: '7 min read',
    category: 'Security & AI',
    tags: ['Biometrics', 'Computer Vision', 'NestJS', 'Security', 'Geofencing'],
    vanpediaTerms: ['mock-location', 'liveness-detection', 'point-in-polygon'],
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
      en: 'An interval spanning 6 semitones with high dissonance. For example, B to F is a tritone (as found in G7).',
      id: 'Interval yang menempuri 6 semitone dengan disonansi tinggi. Misalnya, B ke F adalah tritone (ditemukan dalam G7).',
    },
    category: 'Music Theory',
    examples: {
      en: [
        'B to F = tritone (within G7)',
        'C to F# = tritone (augmented 4th)',
        'The devil in music — historically avoided in medieval composition.',
      ],
      id: [
        'B ke F = tritone (dalam G7)',
        'C ke F# = tritone (augmented 4th)',
        'Diabolus in musica — sejarahnya dihindari dalam komposisi mediterneo.',
      ],
    },
    relatedTerms: ['semitone', 'minor-triad'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Tritone

A **tritone** is an interval spanning three whole tones — or 6 semitones — making it the widest interval in a 12-tone equal temperament scale before inversion.

### Mathematical Foundation

In pitch-class space (mod 12), a tritone is the inversion of itself:

$$\\text{Tritone}(C) = T_6(C) = C + 6 \\pmod{12}$$

This means a tritone divides the octave exactly in half, creating maximum tension.

### Examples in Music

| Interval | Semitones | Type |
|----------|-----------|------|
| C to F# | 6 | Augmented 4th |
| B to F | 6 | Diminished 5th |

The tritone is central to the dominant 7th chord (e.g., G7 = G, B, D, F), where the interval between B and F creates the characteristic "blue note" tension that demands resolution.

### Historical Context

Medieval theorists called it *diabolus in musica* ("the devil in music") due to its dissonant character and tendency to destabilize cadences.`,
      id: `## Tritone

**Tritone** adalah interval yang menempuri tiga nada utuh — atau 6 semitone — menjadikannya interval terlebar dalam skala 12-nada sebelum inversinya.

### Dasar Matematis

Dalam ruang kelas nada (mod 12), tritone adalah invers dari dirinya sendiri:

$$\\text{Tritone}(C) = T_6(C) = C + 6 \\pmod{12}$$

Ini berarti tritone membagi oktav tepat di tengah, menciptakan ketegangan maksimum.

### Contoh dalam Musik

| Interval | Semitone | Tipe |
|----------|-----------|------|
| C ke F# | 6 | Augmented 4th |
| B ke F | 6 | Diminished 5th |

Tritone berada di tengah chord dominan 7 (mis. G7 = G, B, D, F), di mana interval antara B dan F menciptakan ketegangan "blue note" yang khas.

### Konteks Sejarah

Teoretikus mediterneo menyebutnya *diabolus in musica* ("iblis dalam musik") karena sifat disonansinya.`,
    },
  },
  {
    id: 'term-semitone',
    slug: 'semitone',
    title: {
      en: 'Semitone',
      id: 'Semitone',
    },
    definition: {
      en: 'The smallest musical interval in Western music; the distance between two adjacent piano keys (e.g., C to C#).',
      id: 'Interval terkecil dalam musik Barat; jarak antara dua kunci piano yang berdekatan (mis. C ke C#).',
    },
    category: 'Music Theory',
    examples: {
      en: [
        'C to C# = 1 semitone (minor 2nd)',
        'C to D = 2 semitones (major 2nd)',
        'All 12-TET tuning is built from these 12 semitone divisions.',
      ],
      id: [
        'C ke C# = 1 semitone',
        'C ke D = 2 semitone',
        'Seluruh nada 12-TET dibangun dari 12 pembagian semitone ini.',
      ],
    },
    relatedTerms: ['tritone', 'pitch-class'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Semitone

A **semitone** is the smallest interval used in Western music, representing one twelfth of the distance up the frequency ratio of an octave (the ratio 2:1). In 12-tone equal temperament (12-TET), all semitones are equal.

### Frequency Ratio

$$f_{\\text{semitone}} = 2^{1/12} \\approx 1.0595$$

This means each semitone raises the frequency by approximately 5.95%.

### On the Piano

Two notes separated by one semitone are played by adjacent keys on a piano — for example, C and C# (or C and Db), which are enharmonically equivalent.`,
      id: `## Semitone

**Semitone** adalah interval terkecil dalam musik Barat, mewakili satu per dua belas dari jarak oktav (rasio frekuensi 2:1).`,
    },
  },
  {
    id: 'term-pitch-class',
    slug: 'pitch-class',
    title: {
      en: 'Pitch Class',
      id: 'Pitch Class',
    },
    definition: {
      en: 'A set of all notes with the same name but different octave positions; for example, all C notes across octaves belong to pitch class 0.',
      id: 'Himpunan semua nada dengan nama yang sama namun posisi oktav berbeda; misalnya, semua nada C di semua oktav adalah pitch class 0.',
    },
    category: 'Music Theory',
    examples: {
      en: [
        'C3, C4, and C5 all belong to pitch class C (0).',
        'Pitch classes are labeled 0 through 11: C=0, C#=1, D=2, ..., B=11.',
      ],
      id: [
        'C3, C4, dan C5 semuanya adalah pitch class C (0).',
        'Pitch class dilabeli 0 hingga 11: C=0, C#=1, D=2, ..., B=11.',
      ],
    },
    relatedTerms: ['semitone', 'tritone'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Pitch Class

In music theory, a **pitch class** is a set of all pitches that share the same name, regardless of octave. In 12-tone equal temperament, there are exactly 12 pitch classes, often numbered 0 to 11:

- C = 0, C# = 1, D = 2, D# = 3, E = 4, F = 5, F# = 6, G = 7, G# = 8, A = 9, A# = 10, B = 11

This integer notation allows mathematical operations on chords and scales using modular arithmetic.`,
      id: `## Pitch Class

Dalam teori musik, **pitch class** adalah himpunan semua nada yang berbagi nama yang sama, terlepas dari oktavnya.`,
    },
  },
  {
    id: 'term-minor-triad',
    slug: 'minor-triad',
    title: {
      en: 'Minor Triad',
      id: 'Minor Triad',
    },
    definition: {
      en: 'A three-note chord consisting of a root, a minor third, and a perfect fifth (intervals 0, 3, 7 semitones).',
      id: 'Chord tiga nada yang terdiri dari akar, minor ketiga, dan perfect fifth (interval 0, 3, 7 semitone).',
    },
    category: 'Music Theory',
    examples: {
      en: [
        'A minor: A, C, E',
        'D minor: D, F, A',
        'Formula [0, 3, 7] in semitone offsets.',
      ],
      id: [
        'A minor: A, C, E',
        'D minor: D, F, A',
        'Formula [0, 3, 7] dalam offset semitone.',
      ],
    },
    relatedTerms: ['tritone'],
    articleIds: ['article-notelogic-audio'],
    content: {
      en: `## Minor Triad

A **minor triad** is a chord consisting of three notes: the root, a minor third (3 semitones above the root), and a perfect fifth (7 semitones above the root). Its formula in semitone offsets is [0, 3, 7].

The minor triad carries a more somber, introspective quality compared to the major triad [0, 4, 7].`,
      id: `## Minor Triad

**Minor triad** adalah chord yang terdiri dari tiga nada: akar, minor ketiga (3 semitone di atas akar), dan perfect fifth (7 semitone di atas akar).`,
    },
  },
  {
    id: 'term-mysql-deadlock',
    slug: 'mysql-deadlock',
    title: {
      en: 'MySQL Deadlock',
      id: 'MySQL Deadlock',
    },
    definition: {
      en: 'A database concurrency issue where two transactions block each other by holding locks on resources the other needs, causing at least one transaction to fail and be rolled back.',
      id: 'Masalah ketersaingan basis data di mana dua transaksi saling memblokir dengan memegang kunci pada sumber daya yang dibutuhkan transaksi lain, menyebabkan setidaknya satu transaksi gagal dan di-rollback.',
    },
    category: 'Database',
    relatedTerms: ['architectural-constraint'],
    articleIds: ['article-moodle-migration'],
    content: {
      en: `## MySQL Deadlock

A **deadlock** in MySQL occurs when two or more transactions wait for each other to release locks, creating a circular dependency. MySQL detects deadlocks automatically and rolls back the transaction that did the least work.

### Example Scenario

1. Transaction A locks row 1, then tries to lock row 2.
2. Transaction B locks row 2, then tries to lock row 1.
3. Both transactions block forever — a deadlock.

### Prevention Strategies

- Access rows in a consistent ordering across transactions.
- Keep transactions short.
- Use appropriate isolation levels (e.g., READ COMMITTED).`,
      id: `## MySQL Deadlock

**Deadlock** pada MySQL terjadi ketika dua atau lebih transaksi saling menunggu pembuahan kunci.`,
    },
  },
  {
    id: 'term-architectural-constraint',
    slug: 'architectural-constraint',
    title: {
      en: 'Architectural Constraint',
      id: 'Architectural Constraint',
    },
    definition: {
      en: 'A structural limitation imposed on a system to enforce properties like scalability, reliability, or maintainability (e.g., statelessness in REST, circuit breakers in microservices).',
      id: 'Batasan struktural yang diberlakukan pada sistem untuk menegakkan sifat seperti skalabilitas, keandalan, atau kelangsungan pemeliharaan.',
    },
    category: 'Architecture',
    relatedTerms: ['mysql-deadlock'],
    articleIds: ['article-moodle-migration'],
    content: {
      en: `## Architectural Constraint

An **architectural constraint** is a restriction imposed on a software system to achieve specific quality attributes. Common examples:

- **Statelessness** (REST): No client context stored on the server between requests.
- **Circuit Breaker** (Micropersonic): Prevents cascade failures when a dependency is down.
- **Shared-Nothing**: Each node operates independently, improving horizontal scalability.

These constraints simplify design decisions and eliminate entire classes of failure modes.`,
      id: `## Architectural Constraint

**Architectural constraint** adalah pembatasan yang diberlakukan pada sistem perangkat lunak untuk mencapai atribut kualitas tertentu.`,
    },
  },
  {
    id: 'term-redis-stream',
    slug: 'redis-stream',
    title: {
      en: 'Redis Stream',
      id: 'Redis Stream',
    },
    definition: {
      en: 'A Redis data type that persists messages as a log, supporting consumer groups for distributed, fault-tolerant processing of event sequences.',
      id: 'Tipe data Redis yang menyimpan pesan sebagai log, mendukung consumer groups untuk pemrosesan terdistribusi dan toleran kegagalan.',
    },
    category: 'Infrastructure',
    examples: {
      en: [
        'XADD exam_submissions * student_id 12345 answer "..."',
        'XREADGROUP GROUP worker_group consumer_1 COUNT 10 STREAMS exam_submissions >',
      ],
      id: [
        'XADD exam_submissions * student_id 12345 answer "..."',
        'XREADGROUP GROUP worker_group consumer_1 COUNT 10 STREAMS exam_submissions >',
      ],
    },
    relatedTerms: ['architectural-constraint', 'mysql-deadlock'],
    articleIds: ['article-moodle-migration'],
    content: {
      en: `## Redis Stream

**Redis Streams** is a data structure that acts as a persistent, append-only log. It is ideal for event sourcing and message queues where you need durability and replayability.

### Key Commands

- \`XADD key ID * field value\`: Appends an entry.
- \`XREAD STREAMS key ID\`: Reads entries from a stream.
- \`XGROUP CREATE key groupname $~\`: Creates a consumer group for distributed processing.

Streams support consumer groups, allowing multiple workers to compete for messages without duplication.`,
      id: `## Redis Stream

**Redis Streams** adalah struktur data yang bertindak sebagai log persisten.`,
    },
  },
  {
    id: 'term-mock-location',
    slug: 'mock-location',
    title: {
      en: 'Mock Location',
      id: 'Mock Location',
    },
    definition: {
      en: 'A technique to fake GPS coordinates on a device, often used for testing or cheating; detectable via inconsistent sensor data and location provider discrepancies.',
      id: 'Teknik memalsukan koordinat GPS pada perangkat, sering dipakai untuk testing atau memanipulasi absensi; terdeteksi melalui data sensor yang tidak konsisten.',
    },
    category: 'Security',
    examples: {
      en: [
        'Fake GPS apps on Android can inject false coordinates.',
        'Cross-check: GPS vs WiFi vs cell tower triangulation must be consistent.',
      ],
      id: [
        'Aplikasi Fake GPS di Android dapat memasukkan koordinat palsu.',
        'Silang cek: GPS vs WiFi vs triangulasi menara seluler harus konsisten.',
      ],
    },
    relatedTerms: ['liveness-detection', 'point-in-polygon'],
    articleIds: ['article-biometric-antispoofing'],
    content: {
      en: `## Mock Location

**Mock location** refers to the practice of faking a device GPS location. In security-sensitive applications (like attendance or geofencing), mock locations are a critical attack vector.

### Detection Techniques

1. **Multi-provider cross-checking**: Compare coordinates from GPS, WiFi, cell towers, and network providers. A spoofed location will have inconsistent accuracy across providers.
2. **Sensor fusion**: Check accelerometer, gyroscope, and bearing data for plausibility.
3. **Device integrity checks**: Detect rooted/jailbroken devices, mock location apps, or modified system services.
4. **Speed plausibility**: Impossible travel speeds between consecutive readings flag a mock.`,
      id: `## Mock Location

**Mock location** mengacu pada praktik memalsukan lokasi GPS perangkat.`,
    },
  },
  {
    id: 'term-liveness-detection',
    slug: 'liveness-detection',
    title: {
      en: 'Liveness Detection',
      id: 'Liveness Detection',
    },
    definition: {
      en: 'A biometric anti-spoofing technique that verifies the target is a live, three-dimensional human face or finger — not a photo, mask, or video replay.',
      id: 'Teknik anti-pemalsuan biometrik yang memverifikasi subjek adalah wajah manusia hidup tiga dimensi — bukan foto, topeng, atau rekaman video.',
    },
    category: 'Security & AI',
    examples: {
      en: [
        'Specular highlight analysis distinguishes skin from glossy screens.',
        'Micro-motion detection catches the subtle movements of a real face.',
      ],
      id: [
        'Analisis specular highlight membedakan kulit dari layar glossi.',
        'Deteksi mikro-gerakan mencegat gerakan halus wajah asli.',
      ],
    },
    relatedTerms: ['mock-location', 'point-in-polygon'],
    articleIds: ['article-biometric-antispoofing'],
    content: {
      en: `## Liveness Detection

**Liveness detection** is a critical component of biometric security, ensuring the captured face is a real, live human — not a photo, video replay, or mask.

### Types

1. **Passive liveness**: Analyzes a single frame for texture, reflections, and 3D cues without user action.
2. **Active liveness**: Requests specific actions (blink, turn head, smile) to verify responsiveness.
3. **Hybrid**: Combines passive texture analysis with active challenge-response.`,
      id: `## Liveness Detection

**Liveness detection** adalah komponen kritis keamanan biometrik.`,
    },
  },
  {
    id: 'term-point-in-polygon',
    slug: 'point-in-polygon',
    title: {
      en: 'Point-in-Polygon',
      id: 'Point-in-Polygon',
    },
    definition: {
      en: 'A computational geometry algorithm that tests whether a point lies inside, outside, or on the boundary of a polygon. Often solved via ray casting.',
      id: 'Algoritma geometri komputasi yang menguji apakah suatu titik berada di dalam, di luar, atau di batas poligon. Biasanya diselesaikan dengan ray casting.',
    },
    category: 'Algorithms',
    relatedTerms: ['mock-location', 'liveness-detection'],
    articleIds: ['article-biometric-antispoofing'],
    content: {
      en: `## Point-in-Polygon (PIP)

The **Point-in-Polygon** problem asks: given a polygon and a point, does the point lie inside the polygon?

### Ray Casting Algorithm

Cast a ray from the point to infinity and count how many edges it crosses. If the count is odd, the point is inside; if even, it is outside.

### Application in Geofencing

In geofencing, the "point" is the GPS coordinate of a device, and the "polygon" is the pre-mapped boundary of a restricted area (e.g., a campus building).`,
      id: `## Point-in-Polygon (PIP)

Masalah **Point-in-Polygon** adalah: diberikan poligon dan titik, apakah titik berada di dalam poligon?`,
    },
  },
];
