import { jsPDF } from 'jspdf';

export interface CvPdfOptions {
  language?: 'id' | 'en';
  variant?: 'executive' | 'ats';
  includePhoto?: boolean;
  photoBase64?: string;
}

export function generateCvPdf(options: CvPdfOptions = {}): jsPDF {
  const {
    language = 'id',
    variant = 'executive',
    includePhoto = true,
    photoBase64,
  } = options;

  const isEn = language === 'en';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // Colors
  const rosePrimary = [225, 29, 72] as const; // #e11d48
  const roseDark = [190, 18, 60] as const; // #be123c
  const stone950 = [12, 10, 9] as const; // #0c0a09
  const stone800 = [41, 37, 36] as const; // #292524
  const stone700 = [68, 64, 60] as const; // #44403c
  const stone600 = [87, 83, 78] as const; // #57534e
  const stone500 = [120, 113, 108] as const; // #78716c
  const stone200 = [231, 229, 228] as const; // #e7e5e4
  const stone100 = [245, 245, 244] as const; // #f5f5f4

  function drawTopBar(isFirstPage = true) {
    doc.setFillColor(rosePrimary[0], rosePrimary[1], rosePrimary[2]);
    doc.rect(0, 0, pageWidth, 3.5, 'F');
  }

  function drawFooter(currentPage: number, totalPages: number) {
    doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 9, pageWidth - marginX, pageHeight - 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text('Muchamad Irvan • vanviolet.my.id/cv', marginX, pageHeight - 5);

    const pageText = isEn
      ? `Curriculum Vitae • Page ${currentPage} of ${totalPages}`
      : `Curriculum Vitae • Halaman ${currentPage} dari ${totalPages}`;
    doc.text(pageText, pageWidth - marginX, pageHeight - 5, { align: 'right' });
  }

  function drawSectionHeader(title: string, yPos: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(roseDark[0], roseDark[1], roseDark[2]);
    doc.text(title.toUpperCase(), marginX, yPos);

    // Accent horizontal line
    doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
    doc.setLineWidth(0.3);
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    doc.line(marginX + titleWidth + 3, yPos - 0.8, pageWidth - marginX, yPos - 0.8);

    return yPos + 4.5;
  }

  if (variant === 'executive') {
    // ==========================================
    // PAGE 1: EXECUTIVE PROFILE & CORE PLATFORMS
    // ==========================================
    drawTopBar(true);

    let y = 14;

    // Header Area
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('MUCHAMAD IRVAN', marginX, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(rosePrimary[0], rosePrimary[1], rosePrimary[2]);
    doc.text(
      isEn
        ? 'Fullstack Software Engineer & Systems Architect'
        : 'Fullstack Software Engineer & Arsitek Sistem',
      marginX,
      y
    );

    // Embed Photo if available
    if (includePhoto && photoBase64) {
      try {
        doc.setFillColor(stone100[0], stone100[1], stone100[2]);
        doc.roundedRect(pageWidth - marginX - 25, 10, 25, 27, 2, 2, 'F');
        doc.addImage(photoBase64, 'JPEG', pageWidth - marginX - 25, 10, 25, 27);
        doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(pageWidth - marginX - 25, 10, 25, 27, 2, 2, 'D');
      } catch (err) {
        console.warn('Could not add photo to PDF:', err);
      }
    }

    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(stone600[0], stone600[1], stone600[2]);
    const subtitle = isEn
      ? 'Specialized in scalable enterprise web platforms, high-concurrency LMS, and Kubernetes microservices.'
      : 'Spesialis sistem enterprise scalable, platform LMS akademik konkurensi tinggi, dan microservices.';
    doc.text(subtitle, marginX, y);

    // Contact bar
    y += 4;
    doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    const contactText = 'vanviolet.js@gmail.com   |   https://vanviolet.my.id   |   github.com/vanviolet   |   Indonesia (GMT+7)';
    doc.text(contactText, marginX, y);

    y += 7;

    // --- SECTION 1: PROFESSIONAL SUMMARY ---
    y = drawSectionHeader(isEn ? 'Professional Summary' : 'Ringkasan Profesional', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);

    const summaryText = isEn
      ? 'Experienced Fullstack Software Engineer and Systems Architect with over 5 years of practical production delivery. Since 2022, serves as core Fullstack Developer at a prominent University, architecting and maintaining mission-critical platforms including the high-concurrency University LMS (serving 15,000+ active students & faculty with 99.9% uptime on Kubernetes) and the 2026 Outcome-Based Education Curriculum Engine. Simultaneously operates as a Senior Remote Engineer for external enterprise companies delivering biometric computer vision solutions and asset tracking platforms, while completing bespoke commercial software systems as an independent freelancer. Proven mastery in TypeScript, React, Next.js, NestJS, PostgreSQL, Redis, and cloud-native container infrastructure.'
      : 'Fullstack Software Engineer dan Systems Architect berpengalaman lebih dari 5 tahun dalam rekayasa aplikasi berskala produksi. Sejak tahun 2022, dipercaya sebagai Fullstack Developer di Universitas terkemuka, merancang serta memelihara sistem akademik vital termasuk LMS Universitas mandiri (melayani 15.000+ mahasiswa & dosen aktif dengan ketersediaan 99.9% di atas Kubernetes) dan Sistem Kurikulum OBE 2026. Beriringan dengan itu, aktif sebagai Senior Remote Engineer untuk perusahaan swasta eksternal dalam merancang sistem presensi biometrik wajah anti-spoofing dan pelacakan inventaris enterprise, serta mengeksekusi sistem komersial kustom sebagai freelancer independen. Menguasai arsitektur TypeScript, React, Next.js, NestJS, PostgreSQL, Redis, dan infrastruktur kontainer cloud-native.';

    const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(splitSummary, marginX, y);
    y += splitSummary.length * 3.7 + 4;

    // --- SECTION 2: TECHNICAL COMPETENCIES (4 Columns / Boxed) ---
    y = drawSectionHeader(isEn ? 'Technical Competencies & Stack' : 'Kompetensi Teknis & Stack', y);

    const boxWidth = (contentWidth - 4) / 2; // 2 columns
    const boxHeight = 21;

    // Box 1: Client Tier
    doc.setFillColor(stone100[0], stone100[1], stone100[2]);
    doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
    doc.roundedRect(marginX, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(isEn ? 'Client Tier & Languages' : 'Bahasa & Client Tier', marginX + 3, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text('Languages: TypeScript, JavaScript (ESNext), Go, Python, SQL, PHP', marginX + 3, y + 9.5);
    doc.text('Frameworks: React 19, Next.js, Vue.js, Tailwind CSS, Canvas, Web Audio', marginX + 3, y + 14.5);

    // Box 2: Server Tier
    doc.roundedRect(marginX + boxWidth + 4, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(isEn ? 'Backend & Storage' : 'Backend & Penyimpanan Data', marginX + boxWidth + 7, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text('Runtimes: Node.js, NestJS, Express, RESTful APIs, Microservices', marginX + boxWidth + 7, y + 9.5);
    doc.text('Databases: PostgreSQL (Query Optimization), Redis Caching, Prisma', marginX + boxWidth + 7, y + 14.5);

    y += boxHeight + 2.5;

    // Box 3: DevOps & Cloud
    doc.roundedRect(marginX, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(isEn ? 'DevOps & Cloud Infrastructure' : 'DevOps & Infrastruktur Cloud', marginX + 3, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text('Containers: Kubernetes (Clusters, HPA, Ingress), Docker, Compose', marginX + 3, y + 9.5);
    doc.text('Operations: CI/CD Pipelines, Nginx Reverse Proxy, Linux Server Ops', marginX + 3, y + 14.5);

    // Box 4: AI & Systems
    doc.roundedRect(marginX + boxWidth + 4, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(isEn ? 'AI Systems & Architecture' : 'Sistem Cerdas & Arsitektur', marginX + boxWidth + 7, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text('AI Engineering: LLM Integration, RAG Architectures, Computer Vision', marginX + boxWidth + 7, y + 9.5);
    doc.text('Patterns: Clean Architecture, Modular Monoliths, Event-Driven, DAG', marginX + boxWidth + 7, y + 14.5);

    y += boxHeight + 5;

    // --- SECTION 3: WORK EXPERIENCE (University & Remote Enterprise) ---
    y = drawSectionHeader(
      isEn ? 'Professional Work Experience (Core Platforms)' : 'Pengalaman Kerja Profesional (Platform Utama)',
      y
    );

    // Experience 1: University
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('Fullstack Developer & Systems Architect', marginX, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text(`2022 — ${isEn ? 'Present' : 'Sekarang'}`, pageWidth - marginX, y, { align: 'right' });

    y += 3.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(roseDark[0], roseDark[1], roseDark[2]);
    doc.text(
      isEn
        ? 'University Academic Technology Center • Higher Education'
        : 'Pusat Teknologi Akademik Universitas • Institusi Perguruan Tinggi',
      marginX,
      y
    );

    y += 3.5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(stone600[0], stone600[1], stone600[2]);
    doc.text(
      isEn
        ? 'Architecting, modernizing, and engineering core university enterprise platforms across campus.'
        : 'Merancang arsitektur, modernisasi, dan rekayasa platform enterprise akademik universitas berskala kampus.',
      marginX,
      y
    );

    y += 4;
    const uniBullets = [
      isEn
        ? 'Next-Gen University LMS (2024): Built the campus primary daily system serving 15,000+ students & faculty with 99.9% uptime on Kubernetes HPA, reducing page load latency by 65%.'
        : 'LMS Universitas Generasi Baru (2024): Merancang sistem kampus utama melayani 15.000+ mahasiswa & dosen dengan ketersediaan 99.9% di atas Kubernetes HPA, memangkas latensi 65%.',
      isEn
        ? 'Integrated Curriculum OBE System (2026): Engineered Outcome-Based Education platform with DAG prerequisite graph validation and automated accreditation dossiers across 30+ faculties.'
        : 'Sistem Kurikulum Terintegrasi OBE (2026): Membangun platform kurikulum Outcome-Based Education (OBE) dengan graf dependensi mata kuliah dan otomasi borang akreditasi di 30+ fakultas.',
      isEn
        ? 'Doctoral Scholarship System: Full lifecycle faculty scholarship workflow with bi-directional integration into central campus HRMS.'
        : 'Sistem Beasiswa S3 Lanjutan: Sistem beasiswa lanjutan dosen dengan integrasi dua arah langsung ke HRMS kepegawaian kampus.',
      isEn
        ? 'Graduation Convocation Logistics: Coordinated ceremonies for 2,000+ graduates and 4,000+ guests per session with real-time barcode stage queuing.'
        : 'Sistem Manajemen Wisuda: Mengkoordinasikan prosesi wisuda 2.000+ lulusan per sesi dengan antrean barcode panggung dan telemetri siaran langsung.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    for (const b of uniBullets) {
      const split = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
      doc.text(split, marginX + 2, y);
      y += split.length * 3.3 + 1;
    }

    y += 2;

    // Experience 2: Remote Enterprise
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(
      isEn
        ? 'Senior Fullstack Software Engineer (Remote)'
        : 'Senior Fullstack Software Engineer (Remote)',
      marginX,
      y
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text(`2023 — ${isEn ? 'Present' : 'Sekarang'}`, pageWidth - marginX, y, { align: 'right' });

    y += 3.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text(
      isEn
        ? 'External Enterprise Company • Private Enterprise Client'
        : 'Perusahaan Swasta Eksternal • Klien Korporat',
      marginX,
      y
    );

    y += 3.5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(stone600[0], stone600[1], stone600[2]);
    doc.text(
      isEn
        ? 'Collaborating asynchronously with engineering teams to build resilient SaaS platforms and high-load microservices.'
        : 'Berkolaborasi secara remote merancang sistem SaaS perusahaan, backend microservices, dan sistem berkinerja tinggi.',
      marginX,
      y
    );

    y += 4;
    const remoteBullets = [
      isEn
        ? 'Biometric Attendance System (2026): Enterprise workforce app with anti-spoofing computer vision validation and GPS polygon geofencing eliminating clock-in fraud.'
        : 'Sistem Presensi Biometrik Wajah Pegawai (2026): Aplikasi presensi dengan validasi computer vision anti-spoofing dan poligon GPS akurat yang menekan kecurangan hingga 0%.',
      isEn
        ? 'Enterprise Inventory & Asset Tracking (2026): Multi-warehouse asset management with barcode/QR scanning and immutable audit ledger trails across 12 facilities.'
        : 'Sistem Manajemen Inventaris & Aset (2026): Sistem inventaris multi-gudang dengan pemindaian barcode/QR dan log audit investigasi perpindahan barang di 12 gedung.',
      isEn
        ? 'Database Optimization & Performance: Optimized complex PostgreSQL schemas and Redis caching, improving throughput by up to 400% on high-traffic endpoints.'
        : 'Optimasi Database & Performa: Mengoptimasi skema PostgreSQL dan cache Redis, menghasilkan peningkatan throughput hingga 400%.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    for (const b of remoteBullets) {
      const split = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
      doc.text(split, marginX + 2, y);
      y += split.length * 3.3 + 1;
    }

    drawFooter(1, 2);

    // ==========================================
    // PAGE 2: FREELANCE, MATRIX & PHILOSOPHY
    // ==========================================
    doc.addPage();
    drawTopBar(false);

    let y2 = 14;

    // Compact Header Page 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('MUCHAMAD IRVAN', marginX, y2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text(
      isEn ? 'Curriculum Vitae — Page 2 of 2' : 'Curriculum Vitae — Halaman 2 dari 2',
      pageWidth - marginX,
      y2,
      { align: 'right' }
    );

    y2 += 2.5;
    doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, y2, pageWidth - marginX, y2);
    y2 += 5;

    // --- SECTION 4: FREELANCE & BESPOKE CLIENT SYSTEMS ---
    y2 = drawSectionHeader(
      isEn ? 'Independent Engineering & Bespoke Client Work' : 'Rekayasa Mandiri & Solusi Klien Independen',
      y2
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('Freelance Fullstack Developer', marginX, y2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text(`2022 — ${isEn ? 'Present' : 'Sekarang'}`, pageWidth - marginX, y2, { align: 'right' });

    y2 += 3.8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text(
      isEn
        ? 'Independent Engineering & Custom Software Solutions'
        : 'Rekayasa Perangkat Lunak & Solusi Mandiri Kustom',
      marginX,
      y2
    );

    y2 += 4;
    const freelanceBullets = [
      isEn
        ? 'Hotel Room Management & Reservation System: Engineered visual interactive occupancy grid, housekeeping status synchronization, and automated itemized billing invoices.'
        : 'Sistem Manajemen Kamar & Reservasi Hotel: Membangun matriks visual okupansi kamar hotel, sinkronisasi housekeeping, dan faktur tagihan tamu otomatis.',
      isEn
        ? 'Boarding House (Kost) Rental SaaS: Implemented recurring tenant lease management, sub-meter utility billing, and automated WhatsApp reminder triggers reducing late payments by 80%.'
        : 'SaaS Manajemen Kos-Kosan & Tagihan Sewa: Mengembangkan sistem sewa kamar dengan penagihan otomatis via WhatsApp yang menurunkan keterlambatan sewa hingga 80%.',
      isEn
        ? 'Cryptographic Corporate Voting Platform: Delivered zero-tampering internal corporate election platform with single-use cryptographic tokens and verifiable audit ballots.'
        : 'Sistem Voting Kriptografis Perusahaan: Merancang platform pemilihan kepemimpinan perusahaan dengan token kriptografis sekali pakai dan audit trail anti-manipulasi.',
      isEn
        ? 'E-Letter Digital Correspondence System: Accelerated official letter routing and administrative document approvals from 7 days to under 4 hours with digital QR authentication.'
        : 'Sistem Administrasi Persuratan & Disposisi Digital: Memangkas alur persuratan resmi dan disposisi berkas dari 7 hari menjadi kurang dari 4 jam dengan verifikasi QR digital.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    for (const b of freelanceBullets) {
      const split = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
      doc.text(split, marginX + 2, y2);
      y2 += split.length * 3.3 + 1;
    }

    y2 += 4;

    // --- SECTION 5: FLAGSHIP PRODUCTION SYSTEMS MATRIX (Table) ---
    y2 = drawSectionHeader(
      isEn ? 'Flagship Production Systems Matrix' : 'Matriks Sistem & Produk Unggulan',
      y2
    );

    // Table Header
    doc.setFillColor(stone100[0], stone100[1], stone100[2]);
    doc.rect(marginX, y2, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);

    const col1 = marginX + 2;
    const col2 = marginX + 44;
    const col3 = marginX + 80;
    const col4 = marginX + 128;

    doc.text(isEn ? 'System Name' : 'Nama Sistem', col1, y2 + 3.8);
    doc.text(isEn ? 'Role' : 'Peran', col2, y2 + 3.8);
    doc.text(isEn ? 'Tech Stack' : 'Stack Utama', col3, y2 + 3.8);
    doc.text(isEn ? 'Production Impact' : 'Dampak Produksi', col4, y2 + 3.8);

    y2 += 5.5;

    const tableRows = [
      {
        name: 'Next-Gen University LMS',
        role: isEn ? 'System Architect' : 'Arsitek Sistem',
        stack: 'Next.js, NestJS, Postgres, K8s',
        impact: isEn ? '15,000+ daily users • 99.9% uptime' : '15.000+ pengguna/hari • 99.9% uptime',
      },
      {
        name: 'Biometric Attendance',
        role: isEn ? 'Senior Fullstack' : 'Senior Fullstack',
        stack: 'TypeScript, NestJS, CV API, Redis',
        impact: isEn ? 'Zero fraud liveness detection' : 'Liveness detection tanpa manipulasi',
      },
      {
        name: 'Integrated Curriculum OBE',
        role: isEn ? 'Core Developer' : 'Pengembang Utama',
        stack: 'Vue.js, NestJS, Postgres, DAG',
        impact: isEn ? '30+ faculties accreditation sync' : 'Sinkronisasi akreditasi 30+ fakultas',
      },
      {
        name: 'Inventory & Asset Tracker',
        role: isEn ? 'Fullstack Engineer' : 'Fullstack Engineer',
        stack: 'React, NestJS, Barcode, Docker',
        impact: isEn ? 'Multi-facility lifecycle tracking' : 'Pelacakan aset di 12 gedung',
      },
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);

    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      if (i % 2 === 1) {
        doc.setFillColor(250, 250, 249);
        doc.rect(marginX, y2, contentWidth, 5.5, 'F');
      }
      doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
      doc.setLineWidth(0.1);
      doc.line(marginX, y2 + 5.5, pageWidth - marginX, y2 + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(stone950[0], stone950[1], stone950[2]);
      doc.text(row.name, col1, y2 + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(stone600[0], stone600[1], stone600[2]);
      doc.text(row.role, col2, y2 + 3.8);

      doc.setTextColor(roseDark[0], roseDark[1], roseDark[2]);
      doc.text(row.stack, col3, y2 + 3.8);

      doc.setTextColor(stone800[0], stone800[1], stone800[2]);
      doc.text(row.impact, col4, y2 + 3.8);

      y2 += 5.5;
    }

    y2 += 5;

    // --- SECTION 6: LANGUAGES & AVAILABILITY (NO FORMAL EDUCATION) ---
    y2 = drawSectionHeader(
      isEn ? 'Languages & Professional Engagement' : 'Kemampuan Bahasa & Ketersediaan Kerjasama',
      y2
    );

    const halfW = (contentWidth - 4) / 2;
    const cardH = 26;

    // Card 1: Languages
    doc.setFillColor(stone100[0], stone100[1], stone100[2]);
    doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
    doc.roundedRect(marginX, y2, halfW, cardH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(isEn ? 'Working Languages' : 'Kemampuan Bahasa', marginX + 3, y2 + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text(
      isEn ? '• Bahasa Indonesia: Native / Mother Tongue' : '• Bahasa Indonesia: Penutur Asli (Native)',
      marginX + 3,
      y2 + 10.5
    );
    const engText = isEn
      ? '• English: Professional Technical Working Proficiency (Documentation, Code & Collaboration)'
      : '• Bahasa Inggris: Kemampuan Teknis Kerja Profesional (Dokumentasi, Diskusi & Kode)';
    const splitEng = doc.splitTextToSize(engText, halfW - 6);
    doc.text(splitEng, marginX + 3, y2 + 15.5);

    // Card 2: Engagement
    doc.roundedRect(marginX + halfW + 4, y2, halfW, cardH, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(isEn ? 'Availability & Engagement' : 'Ketersediaan & Kerjasama', marginX + halfW + 7, y2 + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text(
      isEn ? '• Arrangements: Remote (Global), Hybrid, Contract' : '• Bentuk Kerja: Remote (Global), Hybrid, Kontrak',
      marginX + halfW + 7,
      y2 + 10.5
    );
    doc.text(
      isEn ? '• Timezone: UTC+7 (Western Indonesia) with overlap' : '• Zona Waktu: UTC+7 (WIB) dengan fleksibilitas overlap',
      marginX + halfW + 7,
      y2 + 15.5
    );
    doc.text(
      isEn ? '• Status: Open for Engineering Roles & Consulting' : '• Status: Terbuka untuk Rekayasa Sistem & Konsultasi',
      marginX + halfW + 7,
      y2 + 20.5
    );

    y2 += cardH + 5;

    // --- SECTION 7: CORE ENGINEERING PRINCIPLES ---
    y2 = drawSectionHeader(
      isEn ? 'Core Engineering Principles' : 'Filosofi Rekayasa Sistem',
      y2
    );

    doc.setFillColor(stone100[0], stone100[1], stone100[2]);
    doc.roundedRect(marginX, y2, contentWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text(
      isEn
        ? 'Pragmatic Architecture, Production Resilience & Maintainability'
        : 'Arsitektur Pragmatis, Ketahanan Produksi & Kemudahan Pemeliharaan',
      marginX + 3,
      y2 + 4.5
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4);
    doc.setTextColor(stone700[0], stone700[1], stone700[2]);
    const principles = isEn
      ? 'Belief in clean separation of concerns, strong typed interfaces, and zero over-engineering. Code written today must be easily readable and safely maintainable by future developers. Architecture should evolve naturally: start simple, decouple at clear boundaries, instrument telemetry early, and automate deployments.'
      : 'Mengedepankan pemisahan tanggung jawab yang jelas, interface bertipe ketat, dan tanpa rekayasa berlebih. Kode yang dibangun hari ini harus mudah dipahami dan dirawat oleh pengembang masa depan. Arsitektur berevolusi secara organik: mulai dari solusi sederhana, pisahkan modul pada batas yang jelas, pasang telemetri sedini mungkin, dan otomatisasi deployment.';

    const splitPrinciples = doc.splitTextToSize(principles, contentWidth - 6);
    doc.text(splitPrinciples, marginX + 3, y2 + 8.5);

    drawFooter(2, 2);

  } else {
    // ==========================================
    // ATS CLEAN SINGLE-PAGE FORMAT
    // ==========================================
    drawTopBar(true);

    let y = 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('MUCHAMAD IRVAN', marginX, y);

    y += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(rosePrimary[0], rosePrimary[1], rosePrimary[2]);
    doc.text('Fullstack Software Engineer & Systems Architect', marginX, y);

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text('Email: vanviolet.js@gmail.com   |   Portfolio: https://vanviolet.my.id   |   GitHub: github.com/vanviolet   |   Indonesia (GMT+7)', marginX, y);

    y += 2.5;
    doc.setDrawColor(stone200[0], stone200[1], stone200[2]);
    doc.setLineWidth(0.2);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 4.5;

    // Summary
    y = drawSectionHeader(isEn ? 'Professional Summary' : 'Ringkasan Profesional', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    const atsSummary = isEn
      ? 'Results-oriented Fullstack Software Engineer and Systems Architect with 5+ years of production experience. Core engineer at prominent University architecting high-concurrency LMS serving 15,000+ users on Kubernetes. Senior Remote Engineer building biometric attendance computer vision and inventory tracking. Independent engineer delivering enterprise voting, reservation, and correspondence systems. Expert in TypeScript, React, Next.js, NestJS, PostgreSQL, Redis, and Docker.'
      : 'Fullstack Software Engineer dan Systems Architect dengan 5+ tahun pengalaman produksi. Rekayasawan inti di Universitas mengelola LMS 15.000+ pengguna di Kubernetes. Senior Remote Engineer membangun presensi biometrik wajah dan inventaris aset. Pengembang independen untuk sistem reservasi, voting kriptografis, dan persuratan digital. Ahli dalam TypeScript, React, Next.js, NestJS, PostgreSQL, Redis, dan Docker.';
    const splitAtsSum = doc.splitTextToSize(atsSummary, contentWidth);
    doc.text(splitAtsSum, marginX, y);
    y += splitAtsSum.length * 3.3 + 3.5;

    // Skills
    y = drawSectionHeader(isEn ? 'Technical Skills' : 'Keahlian Teknis', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text('• Languages: TypeScript, JavaScript (ESNext), Go, Python, SQL, PHP, HTML5/CSS3', marginX, y);
    y += 3.4;
    doc.text('• Frontend: React 19, Next.js, Vue.js, Tailwind CSS, Responsive Web Design, Canvas, Web Audio API', marginX, y);
    y += 3.4;
    doc.text('• Backend & DB: Node.js, NestJS, Express, REST APIs, Microservices, PostgreSQL, Redis, Prisma ORM', marginX, y);
    y += 3.4;
    doc.text('• DevOps & Cloud: Kubernetes (HPA, Ingress), Docker, CI/CD Pipelines, Nginx, Linux Administration', marginX, y);
    y += 5;

    // Experience
    y = drawSectionHeader(isEn ? 'Experience' : 'Pengalaman Kerja', y);

    // Exp 1: Uni
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('Fullstack Developer & Systems Architect — University Academic Technology Center', marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text(`2022 — ${isEn ? 'Present' : 'Sekarang'}`, pageWidth - marginX, y, { align: 'right' });
    y += 3.4;
    const atsUniBullets = [
      isEn
        ? 'Architected Next-Gen University LMS on Kubernetes serving 15,000+ students/faculty with 99.9% uptime and 65% latency reduction.'
        : 'Merancang LMS Universitas mandiri di atas Kubernetes melayani 15.000+ pengguna harian dengan ketersediaan 99.9%.',
      isEn
        ? 'Engineered Outcome-Based Education (OBE) Curriculum platform with DAG dependency verification and accreditation sync.'
        : 'Membangun platform Kurikulum OBE dengan validasi graf dependensi mata kuliah dan sinkronisasi akreditasi.',
      isEn
        ? 'Engineered Doctoral Scholarship System and Graduation Convocation Logistics coordinating 2,000+ attendees per ceremony.'
        : 'Mengembangkan Sistem Beasiswa S3 Lanjutan serta Sistem Wisuda melayani 2.000+ wisudawan dengan antrean barcode.',
    ];
    for (const b of atsUniBullets) {
      const split = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
      doc.text(split, marginX + 2, y);
      y += split.length * 3.2 + 0.8;
    }

    y += 2;

    // Exp 2: Remote
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('Senior Fullstack Software Engineer (Remote) — External Enterprise Client', marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text(`2023 — ${isEn ? 'Present' : 'Sekarang'}`, pageWidth - marginX, y, { align: 'right' });
    y += 3.4;
    const atsRemoteBullets = [
      isEn
        ? 'Built Biometric Attendance with computer vision anti-spoofing and GPS geofencing, eliminating clock-in fraud.'
        : 'Membangun presensi biometrik wajah dengan validasi anti-spoofing dan poligon GPS akurat tanpa kecurangan.',
      isEn
        ? 'Delivered Enterprise Inventory & Asset Tracking across 12 facilities with barcode/QR scanning and audit ledger.'
        : 'Merancang pelacakan inventaris multi-gudang di 12 gedung dengan audit trail dan pemindaian barcode.',
      isEn
        ? 'Optimized high-traffic PostgreSQL queries and Redis caching, boosting endpoint throughput by 400%.'
        : 'Mengoptimasi skema database PostgreSQL dan caching Redis, meningkatkan throughput hingga 400%.',
    ];
    for (const b of atsRemoteBullets) {
      const split = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
      doc.text(split, marginX + 2, y);
      y += split.length * 3.2 + 0.8;
    }

    y += 2;

    // Exp 3: Freelance
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(stone950[0], stone950[1], stone950[2]);
    doc.text('Freelance Fullstack Developer — Independent Client Solutions', marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone500[0], stone500[1], stone500[2]);
    doc.text(`2022 — ${isEn ? 'Present' : 'Sekarang'}`, pageWidth - marginX, y, { align: 'right' });
    y += 3.4;
    const atsFreeBullets = [
      isEn
        ? 'Developed Hotel Room Management & Reservation System with real-time occupancy grid and automated invoices.'
        : 'Mengembangkan sistem reservasi dan okupansi kamar hotel dengan sinkronisasi housekeeping dan faktur.',
      isEn
        ? 'Built Boarding House Rental SaaS with WhatsApp reminder automation, decreasing payment delays by 80%.'
        : 'Membangun SaaS manajemen sewa kos dengan pengingat WhatsApp otomatis menurunkan tunggakan 80%.',
      isEn
        ? 'Created Cryptographically Verified Corporate Voting Platform with zero tampering and single-use audit tokens.'
        : 'Merancang platform voting kepemimpinan perusahaan dengan token kriptografi sekali pakai anti-manipulasi.',
    ];
    for (const b of atsFreeBullets) {
      const split = doc.splitTextToSize(`•  ${b}`, contentWidth - 4);
      doc.text(split, marginX + 2, y);
      y += split.length * 3.2 + 0.8;
    }

    y += 4;
    y = drawSectionHeader(isEn ? 'Languages & Availability' : 'Bahasa & Ketersediaan', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(stone800[0], stone800[1], stone800[2]);
    doc.text('• Languages: Bahasa Indonesia (Native), English (Professional Technical Working Proficiency)', marginX, y);
    y += 3.4;
    doc.text('• Availability: Open for Remote (Global), Hybrid, Contract Engineering, and Systems Architecture Consulting', marginX, y);

    drawFooter(1, 1);
  }

  return doc;
}
