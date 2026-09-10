import { ProfileInfo, Project, Experience, SkillGroup, BlogPost, PhilosophyItem } from '../types';

export const profileData: ProfileInfo = {
  name: 'Muchamad Irvan',
  title: {
    en: 'Fullstack Developer & Software Engineer',
    id: 'Fullstack Developer & Software Engineer',
  },
  bio: {
    en: 'I design and build high-performance web applications, scalable enterprise systems, and interactive digital experiences with a relentless focus on clean architecture.',
    id: 'Saya merancang dan membangun aplikasi web berkinerja tinggi, sistem enterprise yang scalable, dan pengalaman digital interaktif dengan fokus teguh pada arsitektur bersih.',
  },
  aboutEditorial: {
    en: [
      'I am a Fullstack Software Engineer based in Indonesia with over 5 years of practical experience delivering resilient, production-grade applications. Currently serving as a core Fullstack Developer at a prominent university, while simultaneously contributing as a remote engineer and independent software craftsman.',
      'My technical work spans the entire application spectrum—from architecting biometric facial recognition and university-wide academic ERPs handling thousands of concurrent users, to crafting bespoke creative software like NoteLogic, an interactive music theory workbench.',
      'I treat software development as an engineering craft where simplicity, runtime performance, and maintainability supersede fleeting hype. Whether constructing event-driven backend microservices with NestJS and PostgreSQL or building fluid responsive interfaces in React and TypeScript, I prioritize clarity and measurable user impact.',
    ],
    id: [
      'Saya adalah seorang Fullstack Software Engineer yang berbasis di Indonesia dengan lebih dari 5 tahun pengalaman nyata membangun aplikasi berskala produksi yang tangguh. Saat ini aktif sebagai Fullstack Developer di sebuah Universitas ternama, sekaligus merangkap sebagai remote engineer dan software creator mandiri.',
      'Karya teknis saya mencakup spektrum luas—dari merancang sistem absensi biometrik karyawan dan ERP kurikulum universitas yang melayani ribuan pengguna aktif, hingga membangun produk kreatif seperti NoteLogic, platform teori musik interaktif.',
      'Bagi saya, rekayasa perangkat lunak adalah sebuah seni dan dedikasi di mana kesederhanaan, performa runtime, dan kemudahan perawatan kode menjadi prioritas utama. Baik saat merancang backend microservice dengan NestJS dan PostgreSQL, maupun membangun antarmuka web modern dengan React dan TypeScript.',
    ],
  },
  location: 'Indonesia',
  experienceYears: '5+ Years',
  status: {
    en: 'Available for Select Contracts & Engineering Roles',
    id: 'Tersedia untuk Kontrak Kerja & Peran Rekayasa Pilihan',
  },
  email: 'vanviolet.js@gmail.com',
  github: 'https://github.com/vanviolet',
  instagram: 'https://www.instagram.com/vanviolet.js?stkn=MWRkMmM4ZHA0eTNrcQ==',
  quickStats: [
    {
      label: { en: 'Years Experience', id: 'Tahun Pengalaman' },
      value: '5+',
    },
    {
      label: { en: 'Enterprise Systems Built', id: 'Sistem Enterprise' },
      value: '10+',
    },
    {
      label: { en: 'Production Uptime', id: 'Keandalan Sistem' },
      value: '99.9%',
    },
    {
      label: { en: 'Core Tech Stacks', id: 'Teknologi Utama' },
      value: 'Full-Stack',
    },
  ],
};

export const projectsData: Project[] = [
  {
    id: 'notelogic',
    title: 'NoteLogic',
    subtitle: {
      en: 'Interactive Music Theory & Tablature Studio',
      en_US: 'Interactive Music Theory & Tablature Studio',
      id: 'Platform Belajar Teori Musik & Studio Tablatur Interaktif',
    } as any,
    description: {
      en: 'Comprehensive music education platform featuring 954+ chord visualizations, interactive audio synthesis, fretboard mapping, and a real-time digital Tab Studio score editor.',
      id: 'Platform edukasi teori musik interaktif dengan 954+ chord, sintesis audio real-time, fretboard gitar & piano interaktif, serta editor Tab Studio dan partitur musik.',
    },
    longDescription: {
      en: 'NoteLogic bridges deep music theory with tangible software interaction. It provides students, guitarists, and composers with interactive Chord Explorers, harmonic family graphs, interval visualizers, and a multi-track tablature editor built on Web Audio API and custom canvas/SVG rendering.',
      id: 'NoteLogic menghubungkan teori musik mendalam dengan interaksi software yang intuitif. Menyediakan fitur Chord Explorer, visualisasi interval & tangga nada, fretboard interaktif gitar & piano dengan Web Audio API, serta editor tablatur dan not balok multi-track.',
    },
    category: 'edtech',
    year: '2024 — Present',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Web Audio API', 'Vite', 'Fretboard Math Engine'],
    highlights: {
      en: [
        'Interactive Chord Explorer covering 954+ chords with root notes, voicing formulas, and dual guitar/piano playback.',
        'Tab Studio Draft: In-browser guitar tablature sequencer with measure grids, tempo controls, and live staff notation.',
        'High performance sound engine synthesizing tones on demand without external heavy audio samples.',
      ],
      id: [
        'Chord Explorer interaktif mencakup 954+ chord dengan formula interval, voicing, serta audio playback gitar & piano.',
        'Tab Studio: Sequencer tablatur gitar in-browser dengan grid birama, kontrol tempo, dan rendering not balok.',
        'Mesin audio Web Audio API ringan yang menghasilkan frekuensi nada murni tanpa beban download sample berat.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    gallery: [
      '/images/notelogic-landing.jpg',
      '/images/notelogic-chords.jpg',
      '/images/notelogic-tab.jpg',
    ],
    liveUrl: 'https://van-theory.vercel.app/',
    githubUrl: 'https://github.com/vanviolet',
    featured: true,
    stats: [
      { label: { en: 'Musical Chords', id: 'Chord Musik' }, value: '954+' },
      { label: { en: 'Interactive Modules', id: 'Modul Interaktif' }, value: '8' },
      { label: { en: 'Audio Latency', id: 'Latensi Audio' }, value: '< 15ms' },
    ],
  },
  {
    id: 'biometric-attendance',
    title: 'Biometric Attendance System',
    subtitle: {
      en: 'Enterprise Facial & Fingerprint Workforce System',
      id: 'Sistem Absensi Pegawai Berbasis Biometrik & Geofence',
    },
    description: {
      en: 'High-throughput employee biometric attendance platform featuring anti-spoofing facial recognition, GPS polygon validation, shift scheduling, and live presence analytics.',
      id: 'Platform absensi biometrik karyawan dengan verifikasi wajah anti-spoofing, validasi poligon GPS, penjadwalan shift kerja dinamis, dan analitik kehadiran real-time.',
    },
    longDescription: {
      en: 'Engineered for strict accountability across university campuses and enterprise offices. Features liveness detection algorithms to eliminate photo/video fraud, dynamic geofencing, multi-shift calculations, and automated monthly payroll deductions.',
      id: 'Dirancang untuk akuntabilitas tinggi di lingkungan universitas dan perkantoran. Dilengkapi algoritma liveness detection guna mencegah kecurangan foto/video, validasi lokasi geofence presisi tinggi, dan kalkulasi rekapitulasi gaji.',
    },
    category: 'enterprise',
    year: '2023 — 2024',
    technologies: ['TypeScript', 'NestJS', 'PostgreSQL', 'Redis', 'Computer Vision API', 'Docker'],
    highlights: {
      en: [
        'Reduced fraudulent clock-in incidents to zero with real-time biometric liveness validation.',
        'Supported 3,500+ daily clock-in transactions within peak 15-minute morning windows.',
        'Sub-second query response times for historical monthly attendance records via Redis caching.',
      ],
      id: [
        'Mereduksi tingkat kecurangan absensi hingga 0% dengan validasi liveness biometrik real-time.',
        'Mampu menangani 3.500+ transaksi absensi harian pada jam sibuk pagi hari tanpa kendala.',
        'Waktu respon kueri sub-detik untuk rekap kehadiran bulanan berkat optimasi indeks Redis & PostgreSQL.',
      ],
    },
    image: '/images/notelogic-landing.jpg', // fallback image with stylish overlay
    featured: true,
    stats: [
      { label: { en: 'Active Employees', id: 'Pegawai Aktif' }, value: '3,500+' },
      { label: { en: 'Daily Clock-Ins', id: 'Absensi / Hari' }, value: '7,000+' },
      { label: { en: 'Fraud Reduction', id: 'Reduksi Fraud' }, value: '100%' },
    ],
  },
  {
    id: 'university-lms',
    title: 'Next-Gen University LMS',
    subtitle: {
      en: 'Modern Replacement for Legacy Moodle Infrastructure',
      id: 'Sistem Pembelajaran Digital Kampus Pengganti Moodle',
    },
    description: {
      en: 'Custom-built learning management system designed to replace cumbersome Moodle workflows with a fast, modern reactive interface, gradebooks, and collaborative lecture rooms.',
      id: 'Aplikasi LMS universitas modern yang dibangun khusus untuk menggantikan Moodle, menghadirkan antarmuka reaktif yang cepat, manajemen tugas, ujian online, dan materi kuliah interaktif.',
    },
    longDescription: {
      en: 'Overcame legacy LMS pain points by developing a streamlined platform optimized for Indonesian academic workflows. Features automated plagiarism checks, rubrics-based grading, asynchronous quiz engines, and instant lecture video streaming integration.',
      id: 'Menjawab keluhan performa lambat dan UI usang pada Moodle lama. Platform ini dioptimalkan untuk kebutuhan perkuliahan di Indonesia, dilengkapi sistem ujian online anti-curang, rubrik penilaian dosen, dan sinkronisasi otomatis dengan SIAKAD.',
    },
    category: 'academic',
    year: '2023 — Present',
    technologies: ['React', 'Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'Tailwind CSS', 'Kubernetes'],
    highlights: {
      en: [
        '65% reduction in page load latency compared to the legacy university Moodle server.',
        'Seamlessly handled simultaneous midterm exam concurrency of 12,000+ active students.',
        'Integrated with the central university Single Sign-On (SSO) and academic database.',
      ],
      id: [
        'Penurunan latensi loading halaman sebesar 65% dibandingkan instalasi Moodle sebelumnya.',
        'Mampu melayani ujian tengah semester serentak untuk 12.000+ mahasiswa aktif secara stabil.',
        'Terintegrasi mulus dengan sistem Single Sign-On (SSO) dan pangkalan data akademik universitas.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: true,
    stats: [
      { label: { en: 'Active Students', id: 'Mahasiswa Aktif' }, value: '15,000+' },
      { label: { en: 'Courses Managed', id: 'Mata Kuliah' }, value: '1,200+' },
      { label: { en: 'Speed Improvement', id: 'Peningkatan Kecepatan' }, value: '3.2x' },
    ],
  },
  {
    id: 'integrated-curriculum',
    title: 'Integrated Curriculum System',
    subtitle: {
      en: 'Outcome-Based Academic Syllabus & Accreditation Engine',
      id: 'Sistem Kurikulum Terintegrasi & Akreditasi OBE',
    },
    description: {
      en: 'Enterprise academic planning platform connecting faculty course outcomes (OBE/KKNI), department syllabi, prerequisite dependency trees, and institutional accreditation metrics.',
      id: 'Sistem perencanaan kurikulum terintegrasi yang menghubungkan Capaian Pembelajaran (CPL/CPMK), pohon prasyarat mata kuliah, dan pelaporan akreditasi nasional & internasional.',
    },
    longDescription: {
      en: 'Solves complex inter-departmental curriculum overlaps and grading matrix compliance. Allows deans, study program heads, and lecturers to collaborate on syllabus evolution with historical versioning and direct sync to student study cards (KRS).',
      id: 'Mengatasi tumpang tindih kurikulum antar program studi dan pemenuhan standar OBE (Outcome-Based Education). Memungkinkan kaprodi dan dosen menyusun RPS, memetakan taksonomi Bloom, dan menyinkronkan langsung ke sistem KRS.',
    },
    category: 'academic',
    year: '2023 — 2024',
    technologies: ['TypeScript', 'Vue.js', 'PHP', 'Laravel / Node.js', 'PostgreSQL', 'Docker'],
    highlights: {
      en: [
        'Visual interactive course prerequisite graph allowing students and advisors to audit graduation pathways.',
        'Automated generation of standardized national accreditation curriculum dossiers.',
        'Multi-tenant permissions across 30+ academic departments and hundreds of faculty members.',
      ],
      id: [
        'Grafik prasyarat mata kuliah interaktif untuk simulasi kelulusan mahasiswa dan dosen pembimbing.',
        'Otomasi pembuatan dokumen borang akreditasi kurikulum standar BAN-PT / LAM-INFOKOM.',
        'Hak akses berbasis role untuk 30+ program studi dan ratusan dosen di lingkungan universitas.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
  },
  {
    id: 'e-letter-correspondence',
    title: 'E-Letter Digital Correspondence',
    subtitle: {
      en: 'Paperless Institutional Document & Signature Workflow',
      id: 'Sistem Persuratan & Disposisi Dokumen Digital',
    },
    description: {
      en: 'Secure digital correspondence system providing hierarchical letter tracking, automated official numbering, cryptographic QR code verification, and multi-tier approval chains.',
      id: 'Aplikasi e-office persuratan resmi dengan penomoran otomatis, pelacakan disposisi berjenjang, verifikasi keaslian QR code kriptografis, dan alur tanda tangan digital.',
    },
    longDescription: {
      en: 'Replaced slow physical dispatch with real-time digital routing. Features custom PDF generation, draft annotations, cryptographic tamper-evident barcodes, and automated WhatsApp/email notifications for pending approvals.',
      id: 'Menggantikan alur disposisi berkas fisik yang lambat. Dilengkapi fitur generator PDF resmi, catatan revisi draft, barcode anti-manipulasi yang dapat diverifikasi publik, dan notifikasi persetujuan real-time.',
    },
    category: 'enterprise',
    year: '2022 — 2023',
    technologies: ['Node.js', 'React', 'Express', 'PostgreSQL', 'Redis', 'PDFKit', 'Tailwind CSS'],
    highlights: {
      en: [
        'Cut document turnaround time from 7 business days to under 4 hours.',
        'Processed over 50,000 verified official letters without a single document loss.',
        'Instant verification portal via mobile-friendly QR scans.',
      ],
      id: [
        'Memangkas siklus persetujuan dokumen dari 7 hari kerja menjadi kurang dari 4 jam.',
        'Telah memproses lebih dari 50.000 surat resmi tanpa risiko kehilangan arsip.',
        'Portal verifikasi keabsahan surat instan dengan pemindaian barcode smartphone.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
  },
  {
    id: 'graduation-management',
    title: 'Graduation Management System',
    subtitle: {
      en: 'Digital Convocation & Seating Allocation Engine',
      id: 'Sistem Manajemen Wisuda & Antrian Panggung Digital',
    },
    description: {
      en: 'End-to-end convocation logistics platform managing seat layouts, student administrative clearance, regalia distribution, live stage RFID/barcode queues, and parents broadcast.',
      id: 'Platform operasional wisuda kampus yang mengelola validasi yudisium, distribusi toga, alokasi kursi pintar, antrian panggung berbasis barcode, dan integrasi layar siaran langsung.',
    },
    longDescription: {
      en: 'Designed to eliminate graduation day chaos. Provides real-time stage pacing dashboards for marshals, automated photo tagging, graduate cueing upon stage approach, and digital certificate distribution.',
      id: 'Mencegah kekacauan antrean pada upacara wisuda ribuan sarjana. Menyediakan dashboard pemanggilan wisudawan secara presisi saat naik panggung, penomoran kursi terstruktur, dan pembagian ijazah digital.',
    },
    category: 'academic',
    year: '2024',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'WebSockets'],
    highlights: {
      en: [
        'Successfully coordinated ceremonies for 2,000+ graduates and 4,000+ attendees per session.',
        'Sub-second stage telemetry ensuring live displays matched each walking graduate accurately.',
        'Zero registration bottlenecks with automated barcode-based check-in gates.',
      ],
      id: [
        'Mengkoordinasikan upacara wisuda untuk 2.000+ wisudawan dan 4.000+ tamu secara tertib per sesi.',
        'Telemetri panggung real-time memastikan nama dan gelar di layar proyektor tampil tepat waktu.',
        'Check-in cepat di gerbang aula dengan scanner barcode tanpa antrean menumpuk.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
  },
  {
    id: 'inventory-asset-tracking',
    title: 'Inventory & Asset Tracking System',
    subtitle: {
      en: 'Barcode-Driven Lifecycle Management for Fixed & Consumable Goods',
      id: 'Sistem Manajemen Inventaris, Barcode & Aset Perusahaan',
    },
    description: {
      en: 'Comprehensive inventory solution handling multi-warehouse procurement, barcode/QR asset labeling, maintenance schedules, depreciation valuation, and audit tracking.',
      id: 'Solusi pelacakan aset dan stok gudang terpadu dengan label barcode/QR, pengadaan barang, depresiasi nilai buku, mutasi antar ruangan, dan log audit investigasi.',
    },
    longDescription: {
      en: 'Built to manage tens of thousands of institutional physical assets across labs, offices, and campus buildings. Differentiates between consumable supplies and capitalized machinery with real-time stock alert thresholds.',
      id: 'Mendukung pemantauan puluhan ribu aset fisik institusi pada laboratorium, ruang kuliah, dan kantor. Membedakan barang habis pakai dengan aset tetap berwujud dengan perhitungan depresiasi berkala.',
    },
    category: 'enterprise',
    year: '2023 — 2024',
    technologies: ['TypeScript', 'NestJS', 'React', 'PostgreSQL', 'Barcode Scanner Engine', 'Docker'],
    highlights: {
      en: [
        'Multi-facility tracking across 12 campus buildings with visual floor plan asset placement.',
        'Real-time automated low-stock warnings preventing procurement delays.',
        'Complete ledger audit logs tracking every check-out, transfer, and maintenance ticket.',
      ],
      id: [
        'Pelacakan multi-lokasi di 12 gedung kampus dengan penempatan aset pada denah visual.',
        'Peringatan otomatis saat stok barang consumable menipis di bawah ambang batas aman.',
        'Riwayat audit lengkap mencatat setiap mutasi, peminjaman, dan servis pemeliharaan barang.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
  },
  {
    id: 'voting-management',
    title: 'Secure Voting Management System',
    subtitle: {
      en: 'Cryptographically Verified Digital Election Platform',
      id: 'Sistem Pemilihan Digital & Voting Kampus Aman',
    },
    description: {
      en: 'Tamper-proof digital voting platform for student union elections and institutional ballots, featuring single-use cryptographic tokens and real-time voter turnout monitoring.',
      id: 'Sistem e-voting aman untuk pemilihan ketua organisasi mahasiswa dan dewan universitas dengan token sekali pakai, enkripsi suara, dan transparansi rekapitulasi langsung.',
    },
    longDescription: {
      en: 'Guarantees ballot secrecy and integrity. Voters receive unique cryptographic verification hashes to audit their vote inclusion without exposing their choice, preventing voter intimidation and duplicate balloting.',
      id: 'Menjamin kerahasiaan dan integritas suara pemilih. Setiap pemilih memperoleh token acak terverifikasi sehingga terhindar dari pemalsuan suara, manipulasi data, atau intimidasi.',
    },
    category: 'management',
    year: '2023',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Crypto API', 'Tailwind CSS'],
    highlights: {
      en: [
        '99.4% participation rate enabled by frictionless mobile-responsive voting screens.',
        'Zero downtime and verifiable cryptographic audit trail for election committees.',
      ],
      id: [
        'Partisipasi pemilih mencapai 99.4% berkat akses mobile yang cepat dan responsif.',
        'Audit trail kriptografis transparan yang mempercepat rekapitulasi dari berhari-hari menjadi hitungan menit.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
  },
  {
    id: 'hotel-room-management',
    title: 'Hotel & Room Management System',
    subtitle: {
      en: 'Hospitality Occupancy Grid, Housekeeping & Front-Desk Engine',
      id: 'Sistem Manajemen Kamar & Reservasi Hotel',
    },
    description: {
      en: 'Full-featured front-desk and housekeeping platform featuring interactive room grids, reservation booking calendars, billing invoices, and instant cleaning status toggles.',
      id: 'Aplikasi operasional hotel dengan grid kamar real-time, kalender reservasi cerdas, manajemen housekeeping, check-in/out tamu, dan faktur tagihan otomatis.',
    },
    longDescription: {
      en: 'Empowers boutique hotels and guest houses with modern cloud management. Front-desk staff can reallocate reservations via drag-and-drop, track pending maintenance, and generate daily revenue summaries.',
      id: 'Membantu pengelola hotel butik dan penginapan dalam mengelola okupansi kamar, pembersihan harian, integrasi deposit pembayaran, dan pencatatan pendapatan operasional harian.',
    },
    category: 'management',
    year: '2022',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS'],
    highlights: {
      en: [
        'Real-time color-coded room matrix showing vacant, occupied, dirty, and reserved states.',
        'Automated guest invoicing with itemized minibar, laundry, and room service additions.',
      ],
      id: [
        'Matriks kamar visual real-time dengan status kamar kosong, terisi, kotor, dan dalam perbaikan.',
        'Faktur tagihan tamu otomatis mencakup kamar, laundry, dan layanan tambahan.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
  },
  {
    id: 'kost-rental-management',
    title: 'Boarding House (Kost) Management',
    subtitle: {
      en: 'Tenant Lease Invoicing & Utility Tracker',
      id: 'Sistem Manajemen Kos-Kosan & Tagihan Sewa',
    },
    description: {
      en: 'Property management solution for boarding house owners, handling tenant onboarding, automated monthly rent reminders via WhatsApp, utility sub-metering, and expense tracking.',
      id: 'Aplikasi manajemen kos-kosan yang mengelola data penyewa, pengingat jatuh tempo sewa otomatis via WhatsApp, pencatatan meteran listrik/air, dan pembukuan laba rugi.',
    },
    longDescription: {
      en: 'Eliminates late rental payments and manual notebook accounting. Provides property owners with automated billing notifications, digital payment proof verification, and vacancy rate forecasts.',
      id: 'Menghilangkan kebiasaan pembukuan manual dan keterlambatan bayar sewa. Memberi pemilik kos kemudahan memantau okupansi kamar, bukti transfer bank, dan laporan laba bulanan secara teratur.',
    },
    category: 'management',
    year: '2022',
    technologies: ['Vue.js', 'PHP / Laravel', 'MySQL', 'Tailwind CSS'],
    highlights: {
      en: [
        'Automated billing cycles with tenant WhatsApp notifications.',
        'Reduced unpaid rent delays by over 80% through transparent digital ledger.',
      ],
      id: [
        'Otomasi siklus penagihan bulanan dengan notifikasi WhatsApp langsung ke penghuni kos.',
        'Menurunkan tunggakan sewa hingga lebih dari 80% berkat catatan digital yang transparan.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
  },
];

export const experienceData: Experience[] = [
  {
    id: 'exp-univ',
    company: 'University Academic Technology Center',
    companyType: {
      en: 'Higher Education Institution',
      id: 'Institusi Perguruan Tinggi',
    },
    role: {
      en: 'Lead Fullstack Developer',
      id: 'Lead Fullstack Developer',
    },
    period: '2022 — Present',
    location: {
      en: 'Indonesia (Hybrid / On-site)',
      id: 'Indonesia (Hybrid / On-site)',
    },
    description: {
      en: 'Directing the architecture and development of critical campus enterprise platforms, replacing legacy proprietary systems with modern, reactive, and scalable web solutions.',
      id: 'Memimpin arsitektur dan pengembangan sistem teknologi informasi kampus, memodernisasi infrastruktur lama menjadi aplikasi web reaktif berkinerja tinggi.',
    },
    achievements: {
      en: [
        'Spearheaded the development and campus-wide deployment of the custom University LMS, serving 15,000+ students and faculty members with 99.9% uptime.',
        'Engineered the Biometric Employee Attendance System incorporating computer vision facial verification and GPS geofencing, eliminating attendance fraud.',
        'Architected the Integrated Curriculum Management Platform (OBE) to coordinate course syllabus matrices and accreditation data across 30+ faculties.',
        'Formulated CI/CD pipelines and containerized microservices deploying onto Docker and Kubernetes clusters.',
      ],
      id: [
        'Memimpin pengembangan dan implementasi LMS universitas mandiri yang melayani 15.000+ mahasiswa dan dosen dengan uptime 99.9%.',
        'Merancang Sistem Absensi Biometrik dengan verifikasi wajah anti-spoofing dan validasi radius GPS untuk seluruh pegawai universitas.',
        'Membangun Sistem Kurikulum Terintegrasi (OBE) untuk merestrukturisasi pohon prasyarat dan borang akreditasi di 30+ program studi.',
        'Mengimplementasikan pipeline CI/CD dan kontainerisasi layanan dengan Docker dan Kubernetes.',
      ],
    },
    technologies: ['TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Tailwind CSS'],
  },
  {
    id: 'exp-remote',
    company: 'Distributed Tech Companies & Startups',
    companyType: {
      en: 'Remote Software Consultancy & Product Teams',
      id: 'Tim Produk & Konsultansi Remote',
    },
    role: {
      en: 'Senior Fullstack Software Engineer',
      id: 'Senior Fullstack Software Engineer',
    },
    period: '2021 — Present',
    location: {
      en: 'Remote',
      id: 'Remote',
    },
    description: {
      en: 'Collaborating asynchronously with global and regional engineering teams to build robust SaaS products, developer tools, and high-load backend APIs.',
      id: 'Bekerja secara remote dalam tim rekayasa software terdistribusi untuk merancang produk SaaS, API berkecepatan tinggi, dan automasi bisnis.',
    },
    achievements: {
      en: [
        'Built enterprise inventory and procurement platforms with real-time barcode telemetry and audit trails.',
        'Integrated AI capabilities (LLM workflows, RAG knowledge stores, and Vector Search) into business search applications.',
        'Optimized slow SQL relational queries and schema designs in PostgreSQL, improving throughput by up to 400%.',
        'Maintained clean code standards, automated testing, and comprehensive API contract documentation.',
      ],
      id: [
        'Membangun aplikasi manajemen inventaris dan aset dengan integrasi scanner barcode dan riwayat audit lengkap.',
        'Mengintegrasikan kapabilitas AI (LLM, RAG, dan Vector Search) ke dalam mesin pencarian data internal.',
        'Mengoptimasi kueri PostgreSQL dan arsitektur database relasional, meningkatkan throughput hingga 400%.',
        'Menjaga standar kualitas kode yang ketat, unit testing, dan dokumentasi API yang jelas.',
      ],
    },
    technologies: ['TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Redis', 'LLM & RAG', 'CI/CD'],
  },
  {
    id: 'exp-freelance',
    company: 'Independent Software Craftsmanship',
    companyType: {
      en: 'Product Creator & Open-Source Builder',
      id: 'Kreator Produk & Open Source',
    },
    role: {
      en: 'Fullstack Architect & Creator',
      id: 'Fullstack Architect & Creator',
    },
    period: '2019 — Present',
    location: {
      en: 'Indonesia / Global',
      id: 'Indonesia / Global',
    },
    description: {
      en: 'Creating specialized software solutions, open-source audio/music tools, and commercial management systems for private businesses.',
      id: 'Merancang produk digital inovatif, tools musik interaktif open-source, dan sistem manajemen komersial untuk pelaku usaha.',
    },
    achievements: {
      en: [
        'Created NoteLogic (van-theory.vercel.app), an interactive music theory suite with 954+ chords, in-browser tablature DAW, and real-time audio synthesis.',
        'Developed end-to-end bespoke solutions including Hotel Space Management, Boarding House Rental SaaS, and Digital Voting systems.',
        'Mentored junior engineers and contributed to developer communities on TypeScript, clean architecture, and modern frontend techniques.',
      ],
      id: [
        'Menciptakan NoteLogic (van-theory.vercel.app), platform teori musik interaktif dengan 954+ chord dan editor tablatur audio Web Audio API.',
        'Membangun berbagai solusi komersial termasuk Sistem Hotel, Aplikasi Manajemen Kos-kosan, dan E-Voting aman.',
        'Berbagi wawasan teknis seputar arsitektur TypeScript, performance tuning, dan modern frontend development.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Web Audio API', 'Golang', 'PHP', 'Tailwind CSS', 'Vite'],
  },
];

export const skillGroupsData: SkillGroup[] = [
  {
    category: { en: 'Frontend Engineering', id: 'Frontend Engineering' },
    description: {
      en: 'Crafting responsive, accessible, and ultra-fast client-side interfaces.',
      id: 'Membangun antarmuka web yang reaktif, aksesibel, dan berkinerja tinggi.',
    },
    skills: [
      { name: 'React', highlight: true, note: 'Hooks, Suspense, Server Components, State Architecture' },
      { name: 'TypeScript', highlight: true, note: 'Strict Type Safety, Generics, Utility Types' },
      { name: 'Next.js', highlight: true, note: 'App Router, SSR/SSG, Edge Handlers' },
      { name: 'Tailwind CSS', highlight: true, note: 'Modern Utility Styling, Custom Design Systems' },
      { name: 'Vue.js', highlight: false, note: 'Composition API, Pinia, Single File Components' },
      { name: 'Web Audio API', highlight: true, note: 'Synthesizers, AudioNodes, Real-time Tones' },
      { name: 'HTML5 & Modern CSS', highlight: false, note: 'Semantic markup, Flexbox/Grid, Canvas API' },
    ],
  },
  {
    category: { en: 'Backend Architecture', id: 'Backend Architecture' },
    description: {
      en: 'Building scalable APIs, microservices, and reliable server-side business logic.',
      id: 'Merancang API yang scalable, arsitektur microservices, dan logika server yang handal.',
    },
    skills: [
      { name: 'Node.js', highlight: true, note: 'Asynchronous event loop, Streams, Runtime Optimization' },
      { name: 'NestJS', highlight: true, note: 'Modular Architecture, Dependency Injection, Microservices' },
      { name: 'REST APIs & GraphQL', highlight: true, note: 'Contract-first design, API versioning, Swagger/OpenAPI' },
      { name: 'PHP / Laravel', highlight: false, note: 'MVC Frameworks, Queues, Eloquent ORM' },
      { name: 'Python', highlight: false, note: 'Data Scripting, FastAPI, Automation Workflows' },
      { name: 'Prisma ORM', highlight: true, note: 'Type-safe database queries, Schema migrations' },
    ],
  },
  {
    category: { en: 'Data & Artificial Intelligence', id: 'Data & Kecerdasan Buatan' },
    description: {
      en: 'Managing high-concurrency databases, caching layers, and intelligent AI models.',
      id: 'Mengelola database performa tinggi, lapisan cache, dan integrasi model AI.',
    },
    skills: [
      { name: 'PostgreSQL', highlight: true, note: 'Complex Joins, Window Functions, Index Tuning, Partitioning' },
      { name: 'Redis', highlight: true, note: 'In-memory caching, Pub/Sub messaging, Rate limiting' },
      { name: 'MongoDB', highlight: false, note: 'Document Store, Aggregation pipelines' },
      { name: 'LLM & RAG Systems', highlight: true, note: 'Retrieval Augmented Generation, Prompt Engineering' },
      { name: 'Vector Search', highlight: true, note: 'Embeddings, Similarity Search, Knowledge Graphs' },
    ],
  },
  {
    category: { en: 'Infrastructure & DevOps', id: 'Infrastruktur & DevOps' },
    description: {
      en: 'Deploying, containerizing, and orchestrating mission-critical applications.',
      id: 'Deploy, kontainerisasi, dan orkestrasi aplikasi berskala produksi.',
    },
    skills: [
      { name: 'Kubernetes', highlight: true, note: 'Cluster pods, ingress controllers, rolling deployments' },
      { name: 'Docker', highlight: true, note: 'Multi-stage builds, Container security, Compose' },
      { name: 'Linux System Administration', highlight: true, note: 'Ubuntu/Debian, Systemd services, Nginx reverse proxy' },
      { name: 'Git & GitHub / GitLab', highlight: true, note: 'Trunk-based development, branching, Code reviews' },
      { name: 'CI/CD Pipelines', highlight: true, note: 'GitHub Actions, automated test runners, build automation' },
    ],
  },
  {
    category: { en: 'Programming Languages', id: 'Bahasa Pemrograman' },
    description: {
      en: 'Core polyglot languages applied across systems, services, and interfaces.',
      id: 'Bahasa pemrograman yang dikuasai untuk berbagai kebutuhan komputasi.',
    },
    skills: [
      { name: 'TypeScript', highlight: true, note: 'Primary production language for frontend & backend' },
      { name: 'JavaScript (ESNext)', highlight: true, note: 'Modern ECMAScript standards and runtimes' },
      { name: 'Golang', highlight: true, note: 'High concurrency services, lightweight daemons' },
      { name: 'Python', highlight: false, note: 'AI workflows, data processing, backend services' },
      { name: 'PHP', highlight: false, note: 'Enterprise legacy integration and web solutions' },
      { name: 'C++', highlight: false, note: 'Algorithmic fundamentals, systems programming' },
    ],
  },
  {
    category: { en: 'Design & Developer Tooling', id: 'Desain & Tool Pengembang' },
    description: {
      en: 'Tools that fuel precision, user empathy, and engineering velocity.',
      id: 'Tool yang mendukung presisi desain dan kecepatan pengembangan perangkat lunak.',
    },
    skills: [
      { name: 'Figma', highlight: true, note: 'UI/UX prototyping, design token handoffs, wireframing' },
      { name: 'Postman & Insomnia', highlight: false, note: 'API contract testing and mocking' },
      { name: 'VS Code & Vim', highlight: false, note: 'Power user workflows and custom extensions' },
      { name: 'ESLint & Prettier', highlight: false, note: 'Strict code formatting and static analysis' },
    ],
  },
];

export const philosophyData: PhilosophyItem[] = [
  {
    number: '01',
    title: {
      en: 'Simplicity Over Cleverness',
      id: 'Kesederhanaan di Atas Kerumitan',
    },
    quote: {
      en: 'Good software should be immediately obvious, intuitive, and easy to understand.',
      id: 'Perangkat lunak yang baik harus mudah dipahami, intuitif, dan tidak rumit tanpa alasan.',
    },
    description: {
      en: 'Complexity is the enemy of reliability. I resist over-engineering by choosing clear, self-documenting architectures, pragmatic patterns, and minimal dependencies.',
      id: 'Kompleksitas adalah musuh dari keandalan. Saya selalu mengedepankan arsitektur yang pragmatis, mudah dirawat tim lain, dan minim dependensi yang tidak esensial.',
    },
  },
  {
    number: '02',
    title: {
      en: 'Performance as a Feature',
      id: 'Performa Sebagai Fitur Utama',
    },
    quote: {
      en: 'Fast interfaces and sub-second APIs create respect for the user\'s time.',
      id: 'Antarmuka yang kilat dan API sub-detik adalah bentuk penghormatan terhadap waktu pengguna.',
    },
    description: {
      en: 'Speed is not an afterthought; it is built into the foundation. From database query profiling and Redis caching to lightweight bundles and layout shifts, performance defines quality.',
      id: 'Kecepatan bukan sekadar polesan di akhir, melainkan fondasi awal. Dari profiling kueri database, caching Redis, hingga minimasi bundle JavaScript, performa menentukan kelas produk.',
    },
  },
  {
    number: '03',
    title: {
      en: 'Built to Evolve',
      id: 'Dibuat untuk Terus Berkembang',
    },
    quote: {
      en: 'Codebases should welcome change rather than fight it.',
      id: 'Kode yang baik adalah kode yang siap menyambut perubahan kebutuhan di masa depan.',
    },
    description: {
      en: 'Real products adapt to shifting requirements. Through strict TypeScript typing, clear boundary separation, and modular components, I build systems that can scale and pivot gracefully.',
      id: 'Produk nyata akan terus berkembang. Dengan penerapan TypeScript yang ketat, pemisahan layer logika bisnis, dan modularitas komponen, sistem dapat bertumbuh secara tangguh.',
    },
  },
  {
    number: '04',
    title: {
      en: 'Craftsmanship & Empathy',
      id: 'Dedikasi Karya & Empati Pengguna',
    },
    quote: {
      en: 'Great engineering bridges deep technical rigor with human delight.',
      id: 'Karya teknologi terbaik memadukan ketelitian teknis dengan kenyamanan pengguna.',
    },
    description: {
      en: 'Every detail matters—from keyboard accessibility and subtle micro-interactions to deterministic error handling and zero-data-loss state machines.',
      id: 'Setiap detail memiliki makna—dari aksesibilitas navigasi, interaksi halus, hingga penanganan error yang jelas dan ramah pengguna.',
    },
  },
];

export const blogPostsData: BlogPost[] = [
  {
    id: 'post-moodle-migration',
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

For over a decade, traditional universities heavily relied on monolithic PHP installations of Moodle. While historically useful, scaling Moodle during peak university exam periods—where 5,000+ students submit quizzes in the exact same 5-minute window—frequently caused PHP-FPM pool exhaustion and MySQL deadlocks.

Furthermore, students and lecturers routinely struggled with dense, outdated user interfaces that were not designed for mobile devices.

### Architectural Decisions

We set out to build a bespoke Next-Gen LMS tailored to our university’s real workflows:

1. **Stateless Reactive Frontend**: Built with Next.js and Tailwind CSS, deployed with client caching and edge routing to minimize server-side rendering latency.
2. **Modular Microservice Backend**: Designed in NestJS with strict domain boundaries for authentication, course content, assignment submission, and grading.
3. **High-Concurrency Submission Queues**: Instead of writing submissions synchronously to PostgreSQL, exam answers are ingested into an in-memory Redis stream, acknowledged in under 12ms to the student, and processed asynchronously via background workers.

### The Results

During the first semester midterm deployment:
- **Zero downtime** across 15,000 enrolled students.
- **Page transition speed** jumped from 2.8 seconds to ~300ms.
- **Faculty grading efficiency** increased by 40% thanks to a dedicated keyboard-navigable assessment UI.

True craftsmanship in software engineering isn't about using whatever is trendy—it's about applying the right architectural constraints to eliminate user friction.`,
      id: `### Tantangan Sistem LMS Lama

Selama lebih dari satu dekade, banyak kampus bergantung pada instalasi monolitik Moodle. Meskipun kaya fitur, saat musim ujian serentak—di mana 5.000+ mahasiswa mengumpulkan ujian di jendela waktu 5 menit yang sama—server kerap mengalami kehabisan worker PHP-FPM dan deadlock pada database MySQL.

Selain itu, antarmuka Moodle yang rumit membuat dosen dan mahasiswa kesulitan saat mengaksesnya dari smartphone.

### Keputusan Arsitektur

Kami memutuskan membangun sistem LMS mandiri yang benar-benar cocok dengan ritme perkuliahan kampus:

1. **Frontend Reaktif Modern**: Menggunakan Next.js dan Tailwind CSS dengan optimasi cache client dan layout reaktif yang sangat responsif di perangkat seluler.
2. **Backend Terstruktur dengan NestJS**: Memisahkan modul perkuliahan, penugasan, presensi, dan penilaian ke dalam domain terisolasi dengan prinsip Dependency Injection.
3. **Antrian Ujian Berbasis Redis Stream**: Jawaban kuis mahasiswa tidak langsung dikunci ke baris PostgreSQL, melainkan dicatat cepat ke Redis stream dalam waktu < 12ms, kemudian disimpan secara bertahap oleh worker background.

### Hasil Nyata

Pada peluncuran perdana di Ujian Tengah Semester:
- **0% Downtime** sepanjang pekan ujian untuk 15.000 mahasiswa aktif.
- **Waktu buka halaman** melesat dari 2.8 detik menjadi ~300ms.
- **Efisiensi dosen dalam menilai tugas** naik 40% berkat fitur shortcut keyboard dan pratinjau dokumen instan.`,
    },
    date: 'February 2024',
    readTime: '6 min read',
    category: 'Architecture',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'Performance'],
  },
  {
    id: 'post-biometric-antispoofing',
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
On the client, we query multiple location providers (Cell tower, Wi-Fi BSSID triangulation, and satellite GPS). We cross-reference the reported accuracy radius and verify device integrity flags to detect root/jailbreak environments and mock location mockups.

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
Sistem memeriksa konsistensi koordinat GPS bersama data menara seluler dan Wi-Fi di sekitarnya. Penggunaan Fake GPS langsung ditandai dan ditolak.

#### 3. Geofence Poligon Presisi
Bukan sekadar radius lingkaran statis, kami menerapkan algoritma point-in-polygon yang presisi mengikuti denah batas gedung resmi kampus.

### Hasil
Kini 3.500+ pegawai melakukan absensi harian dengan rata-rata waktu verifikasi 1.4 detik per orang, menghemat jutaan rupiah anggaran dan menciptakan transparansi kerja.`,
    },
    date: 'November 2023',
    readTime: '7 min read',
    category: 'Security & AI',
    tags: ['Biometrics', 'Computer Vision', 'NestJS', 'Security', 'Geofencing'],
  },
  {
    id: 'post-notelogic-audio',
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

Music theory is deeply logical and mathematical, yet most educational software feels either clunky, text-heavy, or gated behind paywalls. I wanted to build **NoteLogic** (live at [van-theory.vercel.app](https://van-theory.vercel.app/)) as an intuitive, fast, and visually stunning digital instrument for guitarists and composers.

### Technical Pillars

#### 1. Pure Mathematical Pitch Representation
Instead of hardcoding hundreds of chord images or mp3 samples, all 954+ chords in NoteLogic are derived dynamically using pitch-class set theory:
- Every note is mapped to an integer modulo 12: $C = 0, C\\# = 1, \\dots, B = 11$.
- Intervals are expressed as integer semitone offsets (Minor Third = 3, Perfect Fifth = 7).
- Chord formulas (e.g. Minor Triad $[0, 3, 7]$) are projected onto dynamic guitar fretboard matrices and piano keyboard SVGs with instant sharp/flat notation adjustments.

#### 2. Lightweight Web Audio Synthesis
Loading hundreds of megabytes of sampled guitar and piano notes kills mobile performance. Instead, NoteLogic synthesizes plucked strings and acoustic piano tones in real-time using polyphonic oscillator nodes and exponential gain envelope decoders:
\`\`\`ts
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();
gain.gain.setValueAtTime(0.3, now);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
\`\`\`

#### 3. Real-time Tab Studio Draft
The Tab Studio allows users to compose guitar tablature on a responsive grid, synchronize with tempo click tracks, and visualize standard musical staff notation simultaneously.

NoteLogic demonstrates that web browsers are fully capable of hosting responsive, studio-grade creative tools when built with clean algorithmic foundations.`,
      id: `### Mengapa Membangun NoteLogic?

Teori musik pada dasarnya sangat matematis dan logis. Namun, banyak software edukasi musik yang lambat, penuh teks membosankan, atau terpasang paywall. Saya menciptakan **NoteLogic** ([van-theory.vercel.app](https://van-theory.vercel.app/)) sebagai studio musik interaktif yang ringan, indah, dan mendidik bagi musisi dan gitaris.

### Fondasi Teknis Utama

#### 1. Pemodelan Matematika Nada
Alih-alih menyimpan ratusan gambar statis atau sample audio MP3 besar, 954+ chord di NoteLogic dihitung secara algoritmik:
- Setiap nada direpresentasikan dalam aritmatika modulo 12 ($C = 0, C\\# = 1, \\dots$).
- Rumus akor (misal Minor Triad $[0, 3, 7]$) diproyeksikan secara real-time ke diagram fretboard gitar dan tuts piano SVG.

#### 2. Sintesis Suara dengan Web Audio API
Alih-alih memaksa pengguna mengunduh puluhan MB file audio, NoteLogic membangkitkan frekuensi nada secara real-time di memori browser menggunakan Web Audio API Oscillator dan Gain Envelope. Hasilnya instan, jernih, dan tanpa jeda loading.

#### 3. Tab Studio Interaktif
Menyediakan sequencer tablatur gitar digital di browser dengan grid birama, tempo, dan pratinjau not balok secara simultan.`,
    },
    date: 'August 2024',
    readTime: '5 min read',
    category: 'Engineering & Creative',
    tags: ['Web Audio API', 'TypeScript', 'Music Theory', 'React', 'Canvas/SVG'],
  },
  {
    id: 'post-curriculum-obe',
    title: {
      en: 'Architecting Outcome-Based Education (OBE) Curriculum Engines in Large Universities',
      id: 'Merancang Sistem Kurikulum Berbasis OBE di Lingkungan Kampus Besar',
    },
    summary: {
      en: 'Designing directed acyclic dependency graphs (DAG) for course prerequisites, Bloom taxonomy mapping, and automated accreditation compliance.',
      id: 'Mendesain graf dependensi prasyarat mata kuliah (DAG), pemetaan taksonomi Bloom, dan otomasi audit borang akreditasi kurikulum.',
    },
    content: {
      en: `### The Challenge of University Curriculum Complexity

When an academic institution enrolls tens of thousands of students across dozens of disciplines, modifying a single prerequisite rule (e.g., *“Advanced Algorithms requires Data Structures and Discrete Math with minimum grade C”*) can have massive ripple effects across degree progress, graduation clearance, and faculty capacity planning.

### Modeling Prerequisites as Directed Acyclic Graphs (DAGs)

We modeled curriculum structures using graph theory:
- Nodes represent courses with credit weightings and learning outcomes.
- Edges represent logical expressions (AND / OR / Concurrent enrollment requirements).
- Cycle detection algorithms run on every syllabus change to prevent impossible graduation traps.

### Outcome
The system allowed study program heads to visualize curriculum flows, calculate student learning assessment scores according to national accreditation bodies, and export compliant accreditation dossiers with one click.`,
      id: `### Kompleksitas Kurikulum Kampus

Ketika sebuah perguruan tinggi memiliki puluhan fakultas dan ribuan mata kuliah, mengubah satu aturan prasyarat dapat berdampak besar pada kelancaran studi mahasiswa dan kapasitas kelas.

### Model Graf Dependensi (DAG)
Kami memodelkan struktur kurikulum menggunakan teori graf terarah:
- Node merepresentasikan mata kuliah beserta bobot SKS dan capaian pembelajaran.
- Edge merepresentasikan relasi prasyarat dengan logika boolean (DAN / ATAU).
- Algoritma pendeteksi siklus memastikan tidak ada 'lingkaran prasyarat' yang menghalangi kelulusan mahasiswa.

### Hasil
Kaprodi dan dekanat dapat memantau pohon kurikulum secara visual dan mengunduh laporan akreditasi secara otomatis dalam sekali klik.`,
    },
    date: 'January 2024',
    readTime: '5 min read',
    category: 'System Design',
    tags: ['Graph Theory', 'Data Modeling', 'Enterprise', 'PostgreSQL'],
  },
];
