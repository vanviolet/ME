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
      'I am a Fullstack Software Engineer based in Indonesia with practical experience delivering resilient, production-grade applications. Since 2022, I have served as a core Fullstack Developer at a prominent university, while simultaneously working as a remote engineer for external enterprise companies since 2023 and accepting bespoke client contracts as a freelancer.',
      
    ],
    id: [
      'Saya adalah seorang Fullstack Software Engineer yang berbasis di Indonesia dengan pengalaman nyata membangun aplikasi berskala produksi yang tangguh. Sejak tahun 2022, saya aktif sebagai Fullstack Developer di sebuah Universitas ternama, sekaligus merangkap kerja remote untuk perusahaan eksternal sejak 2023 dan aktif menerima proyek perorangan sebagai freelancer.',
    
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
    id: 'university-lms',
    title: 'Next-Gen University LMS',
    subtitle: {
      en: 'Most Widely Used Campus Learning Platform (2024)',
      id: 'Sistem Kampus Paling Banyak Digunakan (2024)',
    },
    description: {
      en: 'The university’s most widely used daily system (built in 2024), serving 15,000+ active students and faculty with high-speed reactive interfaces, automated exam anti-cheat engines, and gradebooks.',
      id: 'Sistem kampus yang paling banyak digunakan setiap hari (dibuat tahun 2024), melayani 15.000+ mahasiswa dan dosen aktif dengan antarmuka reaktif berkecepatan tinggi, ujian online, dan sinkronisasi nilai otomatis.',
    },
    longDescription: {
      en: 'The university’s primary production application, built in 2024 and serving over 15,000 students and hundreds of faculty members daily. Replaced legacy Moodle infrastructure with a modern reactive Next.js and NestJS architecture deployed on Kubernetes with Horizontal Pod Autoscaling (HPA) to comfortably absorb massive concurrent midterm and final exam surges.',
      id: 'Aplikasi produksi utama universitas yang dibangun pada tahun 2024 dengan penggunaan harian tertinggi, melayani lebih dari 15.000 mahasiswa dan ratusan dosen. Menggantikan instalasi Moodle lama dengan arsitektur reaktif Next.js dan NestJS yang dideploy pada klaster Kubernetes dengan Horizontal Pod Autoscaling (HPA) agar kebal terhadap lonjakan ujian serentak.',
    },
    category: 'academic',
    year: '2024',
    isMostUsed: true,
    statusBadge: {
      en: 'Most Widely Used Platform (2024)',
      id: 'Paling Banyak Digunakan (2024)',
    },
    technologies: ['React', 'Next.js', 'NestJS', 'PostgreSQL', 'Redis', 'Kubernetes', 'Docker', 'Tailwind CSS'],
    highlights: {
      en: [
        'The most heavily utilized university platform, running continuously with 99.9% production uptime.',
        'Orchestrated on Kubernetes with Horizontal Pod Autoscaling (HPA) to effortlessly handle 12,000+ simultaneous exam submissions.',
        '65% reduction in page load latency compared to the legacy university Moodle server.',
        'Integrated with central university Single Sign-On (SSO) and student academic records database.',
      ],
      id: [
        'Sistem kampus dengan intensitas penggunaan tertinggi setiap hari, beroperasi stabil dengan uptime produksi 99.9%.',
        'Dikelola di atas klaster Kubernetes dengan Horizontal Pod Autoscaling (HPA) untuk menyerap 12.000+ submisi ujian serentak.',
        'Penurunan latensi loading halaman sebesar 65% dibandingkan instalasi Moodle sebelumnya.',
        'Terintegrasi penuh dengan Single Sign-On (SSO) kampus dan pangkalan data akademik universitas.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: true,
    stats: [
      { label: { en: 'Daily Active Users', id: 'Pengguna Harian' }, value: '15,000+' },
      { label: { en: 'Courses Managed', id: 'Mata Kuliah' }, value: '1,200+' },
      { label: { en: 'Speed Improvement', id: 'Peningkatan Kecepatan' }, value: '3.2x' },
    ],
  },
  {
    id: 'biometric-attendance',
    title: 'Biometric Attendance System',
    subtitle: {
      en: 'Remote Project • External Enterprise / PT Luar (2026): Facial & Geofence Verification',
      id: 'Aplikasi Remote • PT Luar (2026): Presensi Biometrik Wajah & Geofence',
    },
    description: {
      en: 'Remote enterprise application engineered for an external client company (PT Luar) in 2026, featuring anti-spoofing facial recognition, high-precision GPS polygon verification, and shift scheduling across Kubernetes microservices.',
      id: 'Aplikasi enterprise remote yang dibangun untuk perusahaan eksternal / PT luar di tahun 2026, menghadirkan verifikasi wajah anti-spoofing, validasi poligon GPS presisi tinggi, dan penjadwalan shift kerja di atas klaster Kubernetes.',
    },
    longDescription: {
      en: 'Engineered in 2026 as a remote enterprise workforce platform for an external corporate client (PT Luar). Features computer vision liveness detection algorithms to eliminate photo/screen spoofing, dynamic 2D polygon geofencing, multi-shift calculations, and automated monthly payroll deductions.',
      id: 'Diluncurkan pada tahun 2026 sebagai platform presensi enterprise untuk perusahaan klien eksternal (PT Luar). Dilengkapi algoritma liveness detection berbasis computer vision guna mencegah kecurangan foto/video, validasi geofence poligon akurat, dan integrasi rekapitulasi gaji otomatis.',
    },
    category: 'enterprise',
    year: '2026',
    isNewest: true,
    statusBadge: {
      en: 'Remote Project • External Client (2026)',
      id: 'Proyek Remote • PT Luar (2026)',
    },
    technologies: ['TypeScript', 'NestJS', 'PostgreSQL', 'Redis', 'Kubernetes', 'Docker', 'Computer Vision API'],
    highlights: {
      en: [
        'Built for an external enterprise client (PT Luar) in 2026, completely eliminating fraudulent clock-in incidents with biometric liveness validation.',
        'Deployed on Kubernetes with health probes and automatic failover, handling 3,500+ daily clock-ins during peak 15-minute morning rushes.',
        'Sub-second query response times for historical monthly attendance records via Redis caching and PostgreSQL indexes.',
      ],
      id: [
        'Aplikasi untuk perusahaan mitra eksternal (PT Luar) tahun 2026 yang berhasil menekan kecurangan absensi hingga 0% berkat validasi biometrik real-time.',
        'Dideploy pada klaster Kubernetes dengan health probe dan failover otomatis, melayani 3.500+ absensi pada jam sibuk pagi hari.',
        'Waktu respon kueri sub-detik untuk rekap bulanan berkat optimasi indeks Redis dan PostgreSQL.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: true,
    stats: [
      { label: { en: 'Active Employees', id: 'Pegawai Aktif' }, value: '3,500+' },
      { label: { en: 'Daily Clock-Ins', id: 'Absensi / Hari' }, value: '7,000+' },
      { label: { en: 'Fraud Reduction', id: 'Reduksi Fraud' }, value: '100%' },
    ],
  },
   {
    id: 'notelogic',
    title: 'NoteLogic',
    subtitle: {
      en: 'Personal Hobby Project (2024) Solving Music Learning Challenges',
      id: 'Proyek Hobi Pribadi (2024) Pemecahan Masalah Pembelajaran Musik',
    },
    description: {
      en: 'Created as a personal hobby project for self-learning in 2024, NoteLogic solves music theory and ear training hurdles with 954+ chord visualizations, interactive Web Audio synthesis, fretboard mapping, and a real-time digital Tab Studio score editor.',
      id: 'Dibuat murni sebagai proyek hobi untuk diri sendiri pada tahun 2024, NoteLogic memecahkan masalah pembelajaran musik dengan 954+ chord interaktif, sintesis Web Audio API real-time, visualisasi fretboard gitar & piano, serta studio tablatur digital.',
    },
    longDescription: {
      en: 'NoteLogic originated in 2024 as an independent hobby project built purely for self-exploration and passion for music. It solves the friction of learning music theory by transforming abstract mathematical intervals into tangible, interactive software. Featuring comprehensive Chord Explorers across 954+ chord formulas, dual guitar fretboard and piano keyboard mappings, zero-sample Web Audio tone generation, and a complete Tab Studio sequencer.',
      id: 'NoteLogic lahir pada tahun 2024 sebagai proyek hobi pribadi yang dikembangkan untuk diri sendiri atas dasar kecintaan pada musik. Aplikasi ini memecahkan kesulitan belajar teori musik dengan mengubah interval matematis yang rumit menjadi perangkat lunak interaktif yang menyenangkan. Dilengkapi Chord Explorer untuk 954+ chord, peta fretboard gitar dan tuts piano, sintesis suara murni dengan Web Audio API, serta sequencer Tab Studio.',
    },
    category: 'edtech',
    year: '2024',
    isHobby: true,
    statusBadge: {
      en: 'Hobby Project: Solving Music Learning',
      id: 'Karya Berdasarkan Hobi: Solusi Belajar Musik',
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Web Audio API', 'Vite', 'Fretboard Math Engine'],
    highlights: {
      en: [
        'Built in 2024 as a personal hobby project designed to solve music theory and guitar fretboard learning hurdles.',
        'Interactive Chord Explorer covering 954+ chords with root notes, voicing formulas, and dual guitar/piano sound synthesis.',
        'Tab Studio Draft: In-browser guitar tablature sequencer with measure grids, tempo controls, and live staff notation.',
        'Zero-sample audio engine powered by Web Audio API synthesizers, generating pure harmonic frequencies on demand.',
      ],
      id: [
        'Dibuat pada tahun 2024 sebagai proyek hobi pribadi untuk diri sendiri dalam memecahkan hambatan belajar teori musik dan gitar.',
        'Chord Explorer interaktif mencakup 954+ chord dengan formula interval, voicing, serta audio playback gitar & piano.',
        'Tab Studio: Sequencer tablatur gitar in-browser dengan grid birama, kontrol tempo, dan rendering not balok.',
        'Mesin suara Web Audio API ringan yang menghasilkan frekuensi nada murni tanpa beban download sample berat.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    gallery: [
      '/images/notelogic-landing.jpg',
      '/images/notelogic-chords.jpg',
      '/images/notelogic-tab.jpg',
    ],
    liveUrl: 'https://music.vanviolet.my.id/',
    githubUrl: 'https://github.com/vanviolet',
    featured: true,
    stats: [
      { label: { en: 'Musical Chords', id: 'Chord Musik' }, value: '954+' },
      { label: { en: 'Interactive Modules', id: 'Modul Interaktif' }, value: '8' },
      { label: { en: 'Audio Latency', id: 'Latensi Audio' }, value: '< 15ms' },
    ],
  },
  {
    id: 'integrated-curriculum',
    title: 'Integrated Curriculum System',
    subtitle: {
      en: 'University Academic Platform (2026): Outcome-Based Education (OBE) Syllabus Engine',
      id: 'Sistem Universitas (2026): Kurikulum Terintegrasi & Akreditasi OBE',
    },
    description: {
      en: 'Core university academic system (built in 2026), connecting faculty course outcomes (OBE/KKNI), department syllabi, prerequisite dependency graphs, and automated accreditation metrics.',
      id: 'Sistem akademik inti universitas (dibuat tahun 2026) yang menghubungkan Capaian Pembelajaran Lulusan (CPL/CPMK), pohon dependensi prasyarat mata kuliah, dan pelaporan akreditasi otomatis.',
    },
    longDescription: {
      en: 'Engineered and launched in 2026 as the university’s academic planning platform. Solves complex inter-departmental curriculum overlaps and Outcome-Based Education (OBE) compliance using directed acyclic graph (DAG) models, automated syllabus revision histories, and direct student study card (KRS) syncing.',
      id: 'Dibangun dan diluncurkan pada tahun 2026 sebagai sistem akademik universitas. Mengatasi kerumitan pemetaan kurikulum OBE dengan model graf berarah (DAG), penyusunan RPS interaktif dosen, dan sinkronisasi langsung ke sistem KRS mahasiswa.',
    },
    category: 'academic',
    year: '2026',
    isNewest: true,
    statusBadge: {
      en: 'University System (2026)',
      id: 'Sistem Universitas (2026)',
    },
    technologies: ['TypeScript', 'Vue.js', 'NestJS / Node.js', 'PostgreSQL', 'Kubernetes', 'Docker', 'Tailwind CSS'],
    highlights: {
      en: [
        'University academic platform (2026) coordinating syllabus matrices across 30+ faculties and hundreds of lecturers.',
        'Interactive prerequisite dependency DAG graph preventing graduation roadblock anomalies for students.',
        'Automated generation of national and international accreditation dossiers (BAN-PT / LAM-INFOKOM compliant).',
        'Deployed with containerized microservices on Kubernetes for high reliability.',
      ],
      id: [
        'Sistem kurikulum universitas (2026) yang mengkoordinasikan matriks silabus dan RPS di 30+ program studi universitas.',
        'Graf dependensi prasyarat mata kuliah interaktif (DAG) untuk mencegah kebuntuan jalur kelulusan mahasiswa.',
        'Otomasi pembuatan dokumen borang akreditasi kurikulum standar BAN-PT dan LAM-INFOKOM.',
        'Berjalan di atas kontainer Kubernetes untuk menjamin ketersediaan dan keandalan sistem.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: true,
  },
  {
    id: 'doctoral-scholarship-hrms',
    title: 'Doctoral Scholarship & HRMS Integration',
    subtitle: {
      en: 'University Academic Platform: Faculty S3 Scholarship & HRMS Integration',
      id: 'Sistem Universitas: Beasiswa S3 & Integrasi Aplikasi HRMS',
    },
    description: {
      en: 'Core university faculty development platform managing doctoral (S3) study scholarship applications, funding contracts, and real-time syncing with the campus Human Resource Management System (HRMS).',
      id: 'Sistem akademik universitas yang mengelola seleksi beasiswa studi lanjut S3 dosen, izin belajar, ikatan dinas, dan sinkronisasi data kepegawaian langsung ke aplikasi HRMS kampus.',
    },
    longDescription: {
      en: 'Engineered as an integral university administrative system connecting faculty doctoral qualification programs with the central campus HRMS database. Handles multi-tier approvals (Dean, Senate, Rectorate), academic milestone monitoring, and direct syncing of employment status and promotion credits.',
      id: 'Dibangun sebagai sistem inti universitas yang menghubungkan program beasiswa doktoral dosen dengan pangkalan data HRMS kampus. Mengelola alur persetujuan berjenjang (Dekan, Senat, Rektorat), pemantauan progres studi S3, serta pembaruan riwayat kepegawaian secara otomatis.',
    },
    category: 'academic',
    year: '2023 — 2024',
    statusBadge: {
      en: 'University System',
      id: 'Sistem Universitas',
    },
    technologies: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', 'HRMS API', 'Docker', 'Tailwind CSS'],
    highlights: {
      en: [
        'Official university system automating doctoral (S3) scholarship qualification and study permit workflows.',
        'Direct bi-directional integration with the central campus HRMS database, syncing faculty status, study permits, and compensation.',
        'Multi-level verification flow with digital clearance across Faculty Dean, Senate, and University Rectorate.',
      ],
      id: [
        'Sistem resmi universitas untuk otomasi seleksi beasiswa studi lanjut S3 dosen dan penerbitan izin belajar.',
        'Integrasi dua arah langsung dengan aplikasi HRMS kampus, menyinkronkan data status kepegawaian, tunjangan dinas belajar, dan kepangkatan.',
        'Jejak audit dan persetujuan digital berjenjang dari tingkat Fakultas, Senat, hingga Rektorat.',
      ],
    },
    image: '/images/notelogic-landing.jpg',
    featured: false,
    stats: [
      { label: { en: 'S3 Scholars Managed', id: 'Dosen S3 Dikelola' }, value: '250+' },
      { label: { en: 'HRMS Sync Latency', id: 'Sinkronisasi HRMS' }, value: '< 200ms' },
      { label: { en: 'Approval Speedup', id: 'Efisiensi Waktu' }, value: '4x' },
    ],
  },
  {
    id: 'e-letter-correspondence',
    title: 'E-Letter Digital Correspondence',
    subtitle: {
      en: 'Enterprise & Administrative Document Workflow: Digital Letter & Archival Platform',
      id: 'Sistem Administrasi Dokumen Enterprise: Persuratan & Disposisi Digital',
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
      en: 'University Convocation & Seating Telemetry Engine (2024)',
      id: 'Sistem Universitas: Manajemen Wisuda & Antrian Panggung (2024)',
    },
    description: {
      en: 'End-to-end university convocation logistics platform managing seat layouts, student administrative clearance, regalia distribution, live stage RFID/barcode queues, and parents broadcast.',
      id: 'Platform operasional wisuda universitas yang mengelola validasi yudisium, distribusi toga, alokasi kursi pintar, antrian panggung berbasis barcode, dan integrasi layar siaran langsung.',
    },
    longDescription: {
      en: 'Designed to eliminate graduation day chaos for the university. Provides real-time stage pacing dashboards for marshals, automated photo tagging, graduate cueing upon stage approach, and digital certificate distribution.',
      id: 'Mencegah kekacauan antrean pada upacara wisuda ribuan sarjana universitas. Menyediakan dashboard pemanggilan wisudawan secara presisi saat naik panggung, penomoran kursi terstruktur, dan pembagian ijazah digital.',
    },
    category: 'academic',
    year: '2024',
    statusBadge: {
      en: 'University System (2024)',
      id: 'Sistem Universitas (2024)',
    },
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'WebSockets'],
    highlights: {
      en: [
        'Successfully coordinated university ceremonies for 2,000+ graduates and 4,000+ attendees per session.',
        'Sub-second stage telemetry ensuring live displays matched each walking graduate accurately.',
        'Zero registration bottlenecks with automated barcode-based check-in gates.',
      ],
      id: [
        'Mengkoordinasikan upacara wisuda universitas untuk 2.000+ wisudawan dan 4.000+ tamu secara tertib per sesi.',
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
      en: 'Enterprise Asset & Consumable Lifecycle Tracking (2026)',
      id: 'Sistem Manajemen Inventaris & Aset Perusahaan (2026)',
    },
    description: {
      en: 'Comprehensive inventory solution built in 2026 handling multi-warehouse procurement, barcode/QR asset labeling, maintenance schedules, depreciation valuation, and audit tracking.',
      id: 'Solusi pelacakan aset dan stok gudang terpadu yang dibangun pada tahun 2026 dengan label barcode/QR, pengadaan barang, depresiasi nilai buku, mutasi antar ruangan, dan log audit investigasi.',
    },
    longDescription: {
      en: 'Built in 2026 to manage tens of thousands of physical assets across facilities and offices. Differentiates between consumable supplies and capitalized machinery with real-time stock alert thresholds.',
      id: 'Mendukung pemantauan puluhan ribu aset fisik institusi pada fasilitas dan kantor (rilis 2026). Membedakan barang habis pakai dengan aset tetap berwujud dengan perhitungan depresiasi berkala.',
    },
    category: 'enterprise',
    year: '2026',
    isNewest: true,
    statusBadge: {
      en: 'Enterprise System (2026)',
      id: 'Sistem Enterprise (2026)',
    },
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
    title: 'Corporate Position Voting System',
    subtitle: {
      en: 'Internal Corporate Position & Leadership Election Platform',
      id: 'Sistem Voting & Pemilihan Jabatan di Perusahaan',
    },
    description: {
      en: 'Secure digital voting platform engineered for electing internal corporate leadership and structural positions, featuring single-use cryptographic tokens and real-time audited tallies.',
      id: 'Aplikasi e-voting aman yang dirancang untuk pemilihan jabatan dan posisi struktural di sebuah perusahaan, dilengkapi token kriptografis sekali pakai, kerahasiaan suara, dan rekapitulasi real-time.',
    },
    longDescription: {
      en: 'Engineered specifically for corporate governance to elect internal leadership, executive roles, and departmental heads. Guarantees ballot integrity, prevents duplicate voting, and provides an auditable verification trail for election committees.',
      id: 'Dirancang untuk tata kelola perusahaan dalam pemilihan jabatan struktural, ketua tim, dan jajaran eksekutif. Menjamin kerahasiaan pilihan karyawan, mencegah pemungutan ganda, serta menyajikan audit trail hasil penghitungan suara yang transparan.',
    },
    category: 'management',
    year: '2023',
    statusBadge: {
      en: 'Corporate System',
      id: 'Sistem Perusahaan',
    },
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Crypto API', 'Tailwind CSS'],
    highlights: {
      en: [
        'Tailored corporate election workflow for electing structural positions and department leads.',
        'Cryptographic single-use voting tokens ensuring 100% voter anonymity and zero ballot tampering.',
        'Real-time voter turnout monitoring and automated official election certificate generation.',
      ],
      id: [
        'Alur pemilihan khusus untuk pemilihan jabatan dan pimpinan struktural di internal perusahaan.',
        'Token voting unik sekali pakai berenkripsi yang menjamin kerahasiaan suara serta mencegah manipulasi.',
        'Pemantauan partisipasi hak suara secara real-time dan penerbitan berita acara pemilihan otomatis.',
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
      en: 'Lead Fullstack Developer & Systems Architect',
      id: 'Lead Fullstack Developer & Systems Architect',
    },
    period: '2022 — Present',
    location: {
      en: 'Indonesia (Hybrid / On-site)',
      id: 'Indonesia (Hybrid / On-site)',
    },
    description: {
      en: 'Directing the architecture and development of critical campus enterprise platforms since 2022, modernizing infrastructure into scalable, containerized Kubernetes microservices.',
      id: 'Arsitektur dan pengembangan sistem teknologi informasi kampus sejak 2022, memodernisasi infrastruktur menjadi microservice berbasis kontainer Kubernetes yang tangguh.',
    },
    achievements: {
      en: [
        'Spearheaded the development and campus-wide deployment of the custom University LMS in 2024 (the institution’s most widely used platform), serving 15,000+ students and faculty members daily with 99.9% uptime on Kubernetes.',
        'Architected the Integrated Curriculum Management Platform (2026 release) coordinating course syllabus matrices and Outcome-Based Education (OBE) accreditation across 30+ faculties.',
        'Engineered the Doctoral Scholarship System (Beasiswa S3) with direct, bi-directional integration into the central campus HRMS application.',
        'Developed the University Graduation Management System coordinating ceremonies and stage queues for thousands of graduates.',
      ],
      id: [
        'Pengembangan dan implementasi LMS universitas mandiri pada tahun 2024 (aplikasi kampus paling banyak digunakan) yang melayani 15.000+ mahasiswa dan dosen dengan uptime 99.9% di atas klaster Kubernetes.',
        'Membangun Sistem Kurikulum Terintegrasi (rilis 2026) untuk mengkoordinasikan silabus dan akreditasi kurikulum OBE di 30+ program studi universitas.',
        'Merancang Sistem Beasiswa S3 dengan integrasi langsung dua arah ke aplikasi HRMS kepegawaian kampus.',
        'Mengembangkan Sistem Manajemen Wisuda Universitas yang mengkoordinasikan upacara dan telemetri antrean panggung ribuan wisudawan.',
      ],
    },
    technologies: ['Kubernetes', 'Docker', 'TypeScript', 'React', 'NestJS', 'PostgreSQL', 'Redis', 'Tailwind CSS'],
  },
  {
    id: 'exp-remote',
    company: 'Distributed Tech Companies & Remote Enterprise Client (PT Luar)',
    companyType: {
      en: 'Remote Software Consultancy & Product Teams',
      id: 'Tim Produk & Konsultansi Remote Perusahaan Luar',
    },
    role: {
      en: 'Senior Fullstack Software Engineer (Remote)',
      id: 'Senior Fullstack Software Engineer (Remote)',
    },
    period: '2023 — Present',
    location: {
      en: 'Remote',
      id: 'Remote',
    },
    description: {
      en: 'Collaborating asynchronously with remote engineering teams since 2023 to build resilient SaaS products, distributed backend services, and high-load enterprise microservices.',
      id: 'Bekerja secara remote dalam tim rekayasa software terdistribusi sejak 2023 untuk merancang produk SaaS, backend microservices, dan sistem enterprise perusahaan eksternal.',
    },
    achievements: {
      en: [
        'Engineered the Biometric Employee Attendance System (2026 release) for an external client company (PT Luar) featuring computer vision liveness verification, geofencing, and zero-fraud validation.',
        'Built enterprise inventory and asset tracking platforms (2026 release) with real-time barcode telemetry, automated audit trails, and sub-second querying.',
        'Optimized complex PostgreSQL relational schemas and query plans, improving throughput by up to 400% on high-traffic endpoints.',
        'Maintained containerized microservices and automated CI/CD deployment pipelines on Kubernetes.',
      ],
      id: [
        'Merancang Sistem Absensi Biometrik Pegawai (rilis 2026) untuk perusahaan mitra eksternal (PT Luar) dengan verifikasi wajah anti-spoofing dan validasi poligon GPS radius kantor.',
        'Membangun platform manajemen inventaris dan aset enterprise (rilis 2026) dengan integrasi barcode scanner dan audit ledger lengkap.',
        'Mengoptimasi kueri PostgreSQL dan arsitektur database relasional, meningkatkan throughput hingga 400% pada endpoint bertrafik tinggi.',
        'Menjaga standar kualitas kode yang ketat, pipeline pengujian otomatis, dan workflow deployment microservices di Kubernetes.',
      ],
    },
    technologies: ['TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    id: 'exp-freelance',
    company: 'Independent Software Engineering / Freelancer',
    companyType: {
      en: 'Freelance & Bespoke Client Projects',
      id: 'Freelance & Proyek Perorangan',
    },
    role: {
      en: 'Freelance Fullstack Developer',
      id: 'Freelance Fullstack Developer',
    },
    period: '2022 — Present',
    location: {
      en: 'Indonesia / Remote',
      id: 'Indonesia / Remote',
    },
    description: {
      en: 'Accepting and delivering end-to-end bespoke digital projects and custom software systems for individual clients and private businesses as an independent freelancer alongside university and remote work.',
      id: 'Menerima dan mengeksekusi proyek perorangan dan solusi perangkat lunak kustom sebagai freelancer independen, mencakup aplikasi manajemen bisnis, SaaS rental kos-kosan, sistem reservasi hotel, sistem voting jabatan perusahaan, dan platform interaktif.',
    },
    achievements: {
      en: [
        'Engineered commercial operational software including Hotel Room Management & Reservation System with real-time room matrices and automated billing.',
        'Built the Boarding House (Kost) Rental & Invoicing SaaS platform, streamlining recurring lease payments via automated WhatsApp reminders.',
        'Developed a Cryptographically Verified Corporate Voting Platform for internal position and leadership elections with zero tampering and single-use tokens.',
        'Delivered custom web applications, administrative dashboards, and responsive client tools with clean architecture and robust TypeScript codebases.',
      ],
      id: [
        'Membangun perangkat lunak operasional komersial seperti Sistem Manajemen Kamar & Reservasi Hotel dengan matriks kamar visual dan faktur tagihan otomatis.',
        'Mengembangkan platform SaaS Manajemen Kos-Kosan & Tagihan Sewa dengan notifikasi jatuh tempo otomatis via WhatsApp.',
        'Merancang Sistem Voting & Pemilihan Jabatan di Perusahaan dengan token kriptografis sekali pakai, kerahasiaan suara pemilih, dan audit trail transparan.',
        'Mengeksekusi proyek-proyek perorangan dan utilitas digital kustom dengan standar arsitektur bersih, performa tinggi, dan antarmuka responsif.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Node.js', 'NestJS', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
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
      en: 'Deploying, containerizing, and orchestrating mission-critical applications on Kubernetes and cloud infrastructure.',
      id: 'Deploy, kontainerisasi, dan orkestrasi aplikasi berskala produksi menggunakan Kubernetes dan infrastruktur modern.',
    },
    skills: [
      { name: 'Kubernetes (K8s)', highlight: true, note: 'Production cluster orchestration, Ingress controllers, Helm charts, HPA (Horizontal Pod Autoscaling), zero-downtime rolling deployments, automated failover' },
      { name: 'Docker & Microservices', highlight: true, note: 'Multi-stage builds, Container security hardening, Alpine optimization, Docker Compose' },
      { name: 'Linux System Administration', highlight: true, note: 'Ubuntu/Debian server environments, Systemd daemon management, Nginx reverse proxy, SSL/TLS certificates' },
      { name: 'CI/CD Automation', highlight: true, note: 'GitHub Actions, automated test workflows, container registry publishing, automated staging & production deployments' },
      { name: 'Git & Version Control', highlight: true, note: 'Trunk-based development, semantic versioning, interactive rebase, pull request reviews' },
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

Music theory is deeply logical and mathematical, yet most educational software feels either clunky, text-heavy, or gated behind paywalls. I wanted to build **NoteLogic** (live at [music.vanviolet.my.id](https://music.vanviolet.my.id/)) as an intuitive, fast, and visually stunning digital instrument for guitarists and composers.

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

Teori musik pada dasarnya sangat matematis dan logis. Namun, banyak software edukasi musik yang lambat, penuh teks membosankan, atau terpasang paywall. Saya menciptakan **NoteLogic** ([music.vanviolet.my.id](https://music.vanviolet.my.id/)) sebagai studio musik interaktif yang ringan, indah, dan mendidik bagi musisi dan gitaris.

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
