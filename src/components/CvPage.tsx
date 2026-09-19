import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { profileData, experienceData, skillGroupsData, projectsData } from '../data/portfolioData';
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Check,
  Mail,
  Github,
  Globe,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Layers,
  Award,
  Terminal,
  ZoomIn,
  ZoomOut,
  Eye,
  FileCheck,
  Code2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const CvPage: React.FC = () => {
  const { language, setLanguage, theme } = usePortfolio();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const [cvVariant, setCvVariant] = useState<'modern' | 'ats'>('modern');
  const cvDocumentRef = useRef<HTMLDivElement>(null);

  const isEn = language === 'en';

  // Copy link handler
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Direct print handler
  const handlePrint = () => {
    window.print();
  };

  // High-fidelity PDF export handler
  const handleDownloadPdf = async () => {
    if (!cvDocumentRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = cvDocumentRef.current;
      
      // Temporarily ensure high-fidelity styling for capture
      const canvas = await html2canvas(element, {
        scale: 2.2, // 2.2x scale ensures retina-grade vector-like text clarity
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 820,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add page 1
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add subsequent pages if content spans across multiple A4 pages
      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const fileName = isEn
        ? 'Muchamad-Irvan-Fullstack-Software-Engineer-CV.pdf'
        : 'Muchamad-Irvan-Curriculum-Vitae.pdf';

      pdf.save(fileName);
    } catch (error) {
      console.warn('html2canvas rendering fell back to native browser print:', error);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Key stats highlights for the CV
  const featuredProjects = projectsData.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 pt-24 sm:pt-28 pb-16 px-3 sm:px-6">
      {/* Top Floating Action Bar (Hidden during Print) */}
      <div className="print:hidden max-w-5xl mx-auto mb-6 sm:mb-8 sticky top-20 sm:top-24 z-30">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-stone-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back to Portfolio */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{isEn ? 'Portfolio' : 'Portofolio'}</span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-stone-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-stone-500 dark:text-zinc-400">
                {isEn ? 'Official Verified CV' : 'CV Resmi Terverifikasi'}
              </span>
            </div>
          </div>

          {/* Center: Controls (Language & Variant) */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'id'
                    ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* Layout Variant Toggle: Modern Executive vs ATS */}
            <div className="hidden sm:flex items-center bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => setCvVariant('modern')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cvVariant === 'modern'
                    ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                {isEn ? 'Executive' : 'Eksekutif'}
              </button>
              <button
                type="button"
                onClick={() => setCvVariant('ats')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cvVariant === 'ats'
                    ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                ATS Clean
              </button>
            </div>

            {/* Photo Toggle */}
            <button
              type="button"
              onClick={() => setShowPhoto(!showPhoto)}
              className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs transition-colors ${
                showPhoto
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60 font-semibold'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400'
              }`}
              title={showPhoto ? 'Sembunyikan Foto' : 'Tampilkan Foto'}
            >
              <Eye size={12} />
              <span>{showPhoto ? (isEn ? 'Photo: On' : 'Foto: Ada') : (isEn ? 'Photo: Off' : 'Foto: Tutup')}</span>
            </button>

            {/* Zoom Controls */}
            <div className="hidden xl:flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(80, prev - 10))}
                className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded text-stone-600 dark:text-zinc-300"
                title="Perkecil Tampilan"
              >
                <ZoomOut size={13} />
              </button>
              <span className="px-1 text-[11px] font-mono text-stone-500">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(120, prev + 10))}
                className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded text-stone-600 dark:text-zinc-300"
                title="Perbesar Tampilan"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>

          {/* Right: Actions (Download PDF, Print, Share) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
              title={isEn ? 'Copy CV Link' : 'Salin Tautan CV'}
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? (isEn ? 'Copied!' : 'Disalin!') : (isEn ? 'Share' : 'Bagikan')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
              title={isEn ? 'Print / Save via Browser' : 'Cetak / Simpan PDF Browser'}
            >
              <Printer size={14} />
              <span className="hidden sm:inline">{isEn ? 'Print' : 'Cetak'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-75 cursor-pointer"
              title={isEn ? 'Download A4 PDF Document' : 'Unduh Berkas Dokumen PDF A4'}
            >
              <Download size={14} className={isGeneratingPdf ? 'animate-bounce' : ''} />
              <span>{isGeneratingPdf ? (isEn ? 'Rendering PDF...' : 'Menyiapkan PDF...') : (isEn ? 'Download PDF' : 'Unduh PDF')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CV Paper Container with Real-World A4 Paper Styling */}
      <div className="flex justify-center overflow-x-auto pb-16">
        <div
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="w-full max-w-[820px]"
        >
          <div
            ref={cvDocumentRef}
            id="cv-printable-document"
            className="cv-a4-sheet bg-white text-stone-900 shadow-2xl rounded-sm sm:rounded-md border border-stone-200/90 print:border-none print:shadow-none print:rounded-none overflow-hidden"
            style={{
              minHeight: '1130px', // Standard A4 proportional height at ~820px width
              fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* Top Accent Strip */}
            <div className="h-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-stone-900" />

            {/* Document Body Padding */}
            <div className="p-8 sm:p-12 space-y-7">
              {/* ===================== HEADER SECTION ===================== */}
              <header className="border-b border-stone-200 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-mono font-bold tracking-wide">
                      <Sparkles size={12} className="text-rose-500" />
                      <span>{isEn ? '5+ Years Production Experience' : '5+ Tahun Pengalaman Produksi'}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
                      Muchamad Irvan
                    </h1>

                    <p className="text-base sm:text-lg font-semibold text-rose-600">
                      {isEn
                        ? 'Lead Fullstack Developer & Systems Architect'
                        : 'Lead Fullstack Developer & Arsitek Sistem'}
                    </p>

                    <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed pt-1">
                      {isEn
                        ? 'Specialized in scalable enterprise web applications, high-concurrency academic LMS platforms, Kubernetes container orchestration, and robust microservices.'
                        : 'Spesialis perancangan sistem enterprise scalable, platform LMS akademik konkurensi tinggi, orkestrasi kontainer Kubernetes, dan microservices modern.'}
                    </p>
                  </div>

                  {/* Photo & Quick Badge */}
                  {showPhoto && (
                    <div className="shrink-0 flex sm:flex-col items-center gap-3">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-sm bg-stone-100">
                        <img
                          src="/images/irvan_photo_portrait.jpg"
                          alt="Muchamad Irvan"
                          className="w-full h-full object-cover object-top"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {isEn ? 'Available' : 'Tersedia'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact & Professional Coordinates Strip */}
                <div className="mt-5 pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-stone-700 font-medium">
                  <a
                    href="mailto:vanviolet.js@gmail.com"
                    className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
                  >
                    <Mail size={13} className="text-rose-500 shrink-0" />
                    <span className="truncate">vanviolet.js@gmail.com</span>
                  </a>

                  <a
                    href="https://vanviolet.my.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
                  >
                    <Globe size={13} className="text-rose-500 shrink-0" />
                    <span className="truncate">vanviolet.my.id</span>
                  </a>

                  <a
                    href="https://github.com/vanviolet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
                  >
                    <Github size={13} className="text-rose-500 shrink-0" />
                    <span className="truncate">github.com/vanviolet</span>
                  </a>

                  <div className="flex items-center gap-1.5 text-stone-600">
                    <MapPin size={13} className="text-rose-500 shrink-0" />
                    <span>Indonesia (GMT+7)</span>
                  </div>
                </div>
              </header>

              {/* ===================== PROFESSIONAL SUMMARY ===================== */}
              <section className="space-y-2">
                <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-stone-400 border-b border-stone-200 pb-1 flex items-center gap-2">
                  <FileCheck size={13} className="text-rose-500" />
                  <span>{isEn ? 'Professional Summary' : 'Ringkasan Profesional'}</span>
                </h2>
                <p className="text-xs sm:text-[13px] text-stone-700 leading-relaxed text-justify">
                  {isEn ? (
                    <>
                      Experienced <strong>Fullstack Software Engineer and Systems Architect</strong> with over 5 years of practical production delivery. Since 2022, serves as core Fullstack Developer at a prominent University, architecting and maintaining mission-critical platforms including the high-concurrency <strong>University LMS (serving 15,000+ active students & faculty with 99.9% uptime on Kubernetes)</strong> and the 2026 Outcome-Based Education Curriculum Engine. Simultaneously operates as a Senior Remote Engineer for external enterprise companies delivering <strong>biometric computer vision solutions and asset tracking platforms</strong>, while completing bespoke commercial software systems as an independent freelancer. Proven mastery in TypeScript, React, Next.js, NestJS, PostgreSQL, Redis, and cloud-native container infrastructure.
                    </>
                  ) : (
                    <>
                      <strong>Fullstack Software Engineer dan Systems Architect</strong> berpengalaman lebih dari 5 tahun dalam rekayasa aplikasi berskala produksi. Sejak tahun 2022, dipercaya sebagai Fullstack Developer di Universitas terkemuka, merancang serta memelihara sistem akademik vital termasuk <strong>LMS Universitas mandiri (melayani 15.000+ mahasiswa & dosen aktif dengan ketersediaan 99.9% di atas Kubernetes)</strong> dan Sistem Kurikulum OBE 2026. Beriringan dengan itu, aktif sebagai Senior Remote Engineer untuk perusahaan swasta eksternal dalam merancang <strong>sistem presensi biometrik wajah anti-spoofing dan pelacakan inventaris enterprise</strong>, serta mengeksekusi sistem komersial kustom sebagai freelancer independen. Menguasai arsitektur TypeScript, React, Next.js, NestJS, PostgreSQL, Redis, dan infrastruktur kontainer cloud-native.
                    </>
                  )}
                </p>
              </section>

              {/* ===================== CORE COMPETENCIES & TECH STACK ===================== */}
              <section className="space-y-3">
                <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-stone-400 border-b border-stone-200 pb-1 flex items-center gap-2">
                  <Terminal size={13} className="text-rose-500" />
                  <span>{isEn ? 'Technical Competencies' : 'Kompetensi Teknis & Stack'}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Languages & Frontend */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center justify-between">
                      <span>{isEn ? 'Languages & Frontend' : 'Bahasa & Frontend'}</span>
                      <span className="text-[10px] font-mono text-rose-600 font-semibold">Client Tier</span>
                    </div>
                    <p className="text-stone-700 leading-normal">
                      <strong>Languages:</strong> TypeScript, JavaScript (ESNext), Go, Python, PHP, SQL, C++
                    </p>
                    <p className="text-stone-700 leading-normal">
                      <strong>Frameworks:</strong> React 19, Next.js (App Router), Vue.js, Tailwind CSS, Web Audio API, HTML5 Canvas
                    </p>
                  </div>

                  {/* Backend & Microservices */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center justify-between">
                      <span>{isEn ? 'Backend & Architecture' : 'Backend & Arsitektur'}</span>
                      <span className="text-[10px] font-mono text-rose-600 font-semibold">Server Tier</span>
                    </div>
                    <p className="text-stone-700 leading-normal">
                      <strong>Runtimes & Stacks:</strong> Node.js, NestJS, Express, RESTful APIs, GraphQL, Microservices Architecture
                    </p>
                    <p className="text-stone-700 leading-normal">
                      <strong>Data & Storage:</strong> PostgreSQL (Complex Queries & Index Tuning), Redis (In-memory Caching), MongoDB, Prisma ORM
                    </p>
                  </div>

                  {/* DevOps & Infrastructure */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center justify-between">
                      <span>{isEn ? 'DevOps & Infrastructure' : 'Infrastruktur & Cloud'}</span>
                      <span className="text-[10px] font-mono text-rose-600 font-semibold">DevOps</span>
                    </div>
                    <p className="text-stone-700 leading-normal">
                      <strong>Containers & Cloud:</strong> Kubernetes (K8s Clusters, HPA, Ingress, Rolling Deployments), Docker, Docker Compose
                    </p>
                    <p className="text-stone-700 leading-normal">
                      <strong>Operations:</strong> CI/CD Pipelines (GitHub Actions), Nginx Reverse Proxy, Linux (Ubuntu/Debian Administration), SSL/TLS
                    </p>
                  </div>

                  {/* AI & Systems */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center justify-between">
                      <span>{isEn ? 'AI & Applied Systems' : 'Sistem Cerdas & Rekayasa'}</span>
                      <span className="text-[10px] font-mono text-rose-600 font-semibold">AI / Systems</span>
                    </div>
                    <p className="text-stone-700 leading-normal">
                      <strong>AI Engineering:</strong> LLM Integration, RAG Architectures, Vector Search & Embeddings, Computer Vision Liveness Detection
                    </p>
                    <p className="text-stone-700 leading-normal">
                      <strong>Architecture:</strong> Clean Architecture, Modular Monoliths, Event-Driven Patterns, DAG Dependency Graphs
                    </p>
                  </div>
                </div>
              </section>

              {/* ===================== WORK EXPERIENCE ===================== */}
              <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-stone-400 border-b border-stone-200 pb-1 flex items-center gap-2">
                  <Briefcase size={13} className="text-rose-500" />
                  <span>{isEn ? 'Work Experience' : 'Pengalaman Kerja'}</span>
                </h2>

                <div className="space-y-4 text-xs">
                  {/* Experience 1: University */}
                  <div className="relative pl-4 border-l-2 border-rose-500 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h3 className="text-sm font-bold text-stone-950">
                          Lead Fullstack Developer & Systems Architect
                        </h3>
                        <div className="text-rose-700 font-semibold">
                          University Academic Technology Center • Higher Education
                        </div>
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-stone-500 shrink-0">
                        2022 — {isEn ? 'Present (Active)' : 'Sekarang (Aktif)'}
                      </div>
                    </div>

                    <p className="text-stone-600 italic">
                      {isEn
                        ? 'Leading the architecture, modernization, and development of core university enterprise platforms across campus.'
                        : 'Memimpin arsitektur, modernisasi, dan rekayasa platform enterprise akademik universitas berskala kampus.'}
                    </p>

                    <ul className="list-disc list-outside pl-3.5 space-y-1 text-stone-700 leading-relaxed">
                      <li>
                        <strong>{isEn ? 'Next-Gen University LMS (2024)' : 'LMS Universitas Generasi Baru (2024)'}:</strong>{' '}
                        {isEn
                          ? 'Built the institution’s most widely used daily platform serving 15,000+ active students & faculty with 99.9% uptime on Kubernetes with Horizontal Pod Autoscaling (HPA), reducing page load latency by 65% compared to legacy Moodle.'
                          : 'Merancang sistem kampus paling banyak digunakan melayani 15.000+ mahasiswa & dosen dengan ketersediaan 99.9% di atas Kubernetes HPA, memangkas latensi akses hingga 65% dibanding Moodle lama.'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Integrated Curriculum System (2026)' : 'Sistem Kurikulum Terintegrasi (2026)'}:</strong>{' '}
                        {isEn
                          ? 'Engineered Outcome-Based Education (OBE) platform connecting syllabus matrices, DAG prerequisite dependency graphs, and automated accreditation generation across 30+ faculties.'
                          : 'Membangun platform kurikulum Outcome-Based Education (OBE) yang mengintegrasikan RPS, graf dependensi mata kuliah, dan otomasi borang akreditasi di 30+ fakultas.'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Doctoral Scholarship System (Beasiswa S3)' : 'Sistem Beasiswa S3'}:</strong>{' '}
                        {isEn
                          ? 'Constructed full lifecycle scholarship management with direct two-way integration into the central campus Human Resource Management System (HRMS).'
                          : 'Membangun sistem beasiswa lanjutan dosen dengan integrasi dua arah langsung ke HRMS kepegawaian kampus.'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Convocation & Graduation Management' : 'Sistem Manajemen Wisuda'}:</strong>{' '}
                        {isEn
                          ? 'Coordinated ceremonies for 2,000+ graduates and 4,000+ guests per session with real-time barcode stage queuing and sub-second display telemetry.'
                          : 'Mengkoordinasikan prosesi wisuda 2.000+ lulusan per sesi dengan antrean barcode panggung dan telemetri layar siaran langsung.'}
                      </li>
                    </ul>
                  </div>

                  {/* Experience 2: Remote Enterprise */}
                  <div className="relative pl-4 border-l-2 border-stone-400 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h3 className="text-sm font-bold text-stone-950">
                          Senior Fullstack Software Engineer (Remote)
                        </h3>
                        <div className="text-stone-700 font-semibold">
                          External Enterprise Company • Private Enterprise Client
                        </div>
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-stone-500 shrink-0">
                        2023 — {isEn ? 'Present (Active)' : 'Sekarang (Aktif)'}
                      </div>
                    </div>

                    <p className="text-stone-600 italic">
                      {isEn
                        ? 'Collaborating asynchronously with engineering teams to build resilient SaaS platforms and high-load microservices.'
                        : 'Berkolaborasi secara remote merancang sistem SaaS perusahaan, backend microservices, dan sistem berkinerja tinggi.'}
                    </p>

                    <ul className="list-disc list-outside pl-3.5 space-y-1 text-stone-700 leading-relaxed">
                      <li>
                        <strong>{isEn ? 'Biometric Employee Attendance System (2026)' : 'Sistem Presensi Biometrik Wajah Pegawai (2026)'}:</strong>{' '}
                        {isEn
                          ? 'Built enterprise workforce platform with anti-spoofing computer vision liveness validation, GPS polygon geofencing, and automated payroll integration, eliminating clock-in fraud.'
                          : 'Membangun aplikasi presensi enterprise dengan validasi computer vision anti-spoofing, poligon GPS kantor akurat, dan integrasi payroll yang menekan kecurangan presensi hingga 0%.'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Enterprise Inventory & Asset Tracking (2026)' : 'Sistem Manajemen Inventaris & Aset (2026)'}:</strong>{' '}
                        {isEn
                          ? 'Delivered multi-warehouse asset tracker with barcode/QR scanning, depreciation valuation, and immutable ledger audit trails across 12 campus facilities.'
                          : 'Merancang sistem inventaris multi-gudang dengan pemindaian barcode/QR, depresiasi aset, dan log audit investigasi perpindahan barang.'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Database Optimization & Performance' : 'Optimasi Database & Performa'}:</strong>{' '}
                        {isEn
                          ? 'Optimized complex PostgreSQL schemas, foreign key indexes, and Redis caching layers, achieving up to 400% throughput gain on high-traffic endpoints.'
                          : 'Mengoptimasi skema relasional PostgreSQL, indeks kueri, dan cache Redis, menghasilkan kenaikan throughput hingga 400% pada endpoint bertrafik padat.'}
                      </li>
                    </ul>
                  </div>

                  {/* Experience 3: Freelance & Bespoke */}
                  <div className="relative pl-4 border-l-2 border-stone-300 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h3 className="text-sm font-bold text-stone-950">
                          Freelance Fullstack Developer
                        </h3>
                        <div className="text-stone-700 font-semibold">
                          Independent Engineering & Bespoke Client Solutions
                        </div>
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-stone-500 shrink-0">
                        2022 — {isEn ? 'Present (Active)' : 'Sekarang (Aktif)'}
                      </div>
                    </div>

                    <ul className="list-disc list-outside pl-3.5 space-y-1 text-stone-700 leading-relaxed">
                      <li>
                        <strong>{isEn ? 'Hotel Room Management & Reservation System' : 'Sistem Manajemen Kamar & Reservasi Hotel'}:</strong>{' '}
                        {isEn
                          ? 'Engineered visual interactive occupancy grid, housekeeping status synchronization, and automated itemized billing invoices.'
                          : 'Membangun matriks visual okupansi kamar hotel, sinkronisasi housekeeping, dan faktur tagihan tamu otomatis.'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Boarding House (Kost) Rental SaaS' : 'SaaS Manajemen Kos-Kosan & Tagihan Sewa'}:</strong>{' '}
                        {isEn
                          ? 'Implemented recurring tenant lease management, sub-meter utility billing, and automated WhatsApp reminder triggers reducing late payments by 80%.'
                          : 'Mengembangkan sistem sewa kamar dengan penagihan otomatis via WhatsApp yang menurunkan keterlambatan pembayaran sewa hingga 80%.'}
                      </li>
                      <li>
                        <strong>{isEn ? 'Cryptographic Corporate Voting Platform' : 'Sistem Voting Kriptografis Perusahaan'}:</strong>{' '}
                        {isEn
                          ? 'Delivered zero-tampering internal leadership election platform with single-use cryptographic tokens and verifiable audit ballots.'
                          : 'Merancang platform voting pemilihan kepemimpinan perusahaan dengan token kriptografis sekali pakai dan audit trail anti-manipulasi.'}
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* ===================== SELECTED KEY SYSTEMS MATRIX ===================== */}
              <section className="space-y-2.5">
                <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-stone-400 border-b border-stone-200 pb-1 flex items-center gap-2">
                  <Layers size={13} className="text-rose-500" />
                  <span>{isEn ? 'Selected Key Production Systems' : 'Daftar Sistem & Produk Unggulan'}</span>
                </h2>

                <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-stone-100 text-stone-900 border-b border-stone-200 font-bold">
                        <th className="py-2 px-3">{isEn ? 'System Name' : 'Nama Sistem'}</th>
                        <th className="py-2 px-3">{isEn ? 'Role / Scope' : 'Peran / Lingkup'}</th>
                        <th className="py-2 px-3">{isEn ? 'Primary Tech Stack' : 'Stack Utama'}</th>
                        <th className="py-2 px-3">{isEn ? 'Production Impact' : 'Dampak Produksi'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      <tr className="hover:bg-stone-50/75">
                        <td className="py-2 px-3 font-semibold text-stone-950">Next-Gen University LMS</td>
                        <td className="py-2 px-3 text-stone-600">{isEn ? 'Lead Architect' : 'Arsitek Utama'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-rose-700">Next.js, NestJS, Postgres, K8s</td>
                        <td className="py-2 px-3 text-stone-700">{isEn ? '15,000+ daily users • 99.9% uptime' : '15.000+ pengguna/hari • 99.9% uptime'}</td>
                      </tr>
                      <tr className="hover:bg-stone-50/75">
                        <td className="py-2 px-3 font-semibold text-stone-950">Biometric Attendance</td>
                        <td className="py-2 px-3 text-stone-600">{isEn ? 'Senior Fullstack' : 'Senior Fullstack'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-rose-700">TypeScript, NestJS, CV API, Redis</td>
                        <td className="py-2 px-3 text-stone-700">{isEn ? 'Zero fraud liveness detection' : 'Liveness detection tanpa manipulasi'}</td>
                      </tr>
                      <tr className="hover:bg-stone-50/75">
                        <td className="py-2 px-3 font-semibold text-stone-950">Integrated Curriculum OBE</td>
                        <td className="py-2 px-3 text-stone-600">{isEn ? 'Lead Developer' : 'Lead Developer'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-rose-700">Vue.js, NestJS, Postgres, DAG</td>
                        <td className="py-2 px-3 text-stone-700">{isEn ? '30+ faculties accreditation sync' : 'Sinkronisasi akreditasi 30+ fakultas'}</td>
                      </tr>
                      <tr className="hover:bg-stone-50/75">
                        <td className="py-2 px-3 font-semibold text-stone-950">Inventory & Asset Tracker</td>
                        <td className="py-2 px-3 text-stone-600">{isEn ? 'Fullstack Engineer' : 'Fullstack Engineer'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-rose-700">React, NestJS, Barcode, Docker</td>
                        <td className="py-2 px-3 text-stone-700">{isEn ? 'Multi-facility lifecycle tracking' : 'Pelacakan aset di 12 gedung'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ===================== EDUCATION, CERTIFICATIONS & LANGUAGES ===================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Education */}
                <section className="space-y-2">
                  <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-stone-400 border-b border-stone-200 pb-1 flex items-center gap-2">
                    <GraduationCap size={13} className="text-rose-500" />
                    <span>{isEn ? 'Education' : 'Pendidikan Formal'}</span>
                  </h2>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-stone-950">
                      {isEn ? 'Bachelor of Computer Science (S.Kom.)' : 'Sarjana Komputer (S.Kom. / Teknik Informatika)'}
                    </div>
                    <div className="text-rose-700 font-semibold">
                      {isEn ? 'Department of Informatics Engineering' : 'Program Studi Teknik Informatika'}
                    </div>
                    <p className="text-stone-600 text-[11px] leading-normal">
                      {isEn
                        ? 'Focused on Software Architecture, Distributed Computing, Algorithm Analysis, and Database Systems.'
                        : 'Fokus pada Arsitektur Perangkat Lunak, Komputasi Terdistribusi, Analisis Algoritma, dan Sistem Basis Data.'}
                    </p>
                  </div>
                </section>

                {/* Languages & Principles */}
                <section className="space-y-2">
                  <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-stone-400 border-b border-stone-200 pb-1 flex items-center gap-2">
                    <Award size={13} className="text-rose-500" />
                    <span>{isEn ? 'Languages & Principles' : 'Bahasa & Prinsip Kerja'}</span>
                  </h2>
                  <div className="text-xs space-y-1.5">
                    <div className="text-stone-700">
                      <strong>{isEn ? 'Languages:' : 'Kemampuan Bahasa:'}</strong>{' '}
                      Bahasa Indonesia (Native/Anak Bangsa), English (Professional Technical Working Proficiency)
                    </div>
                    <div className="text-stone-700">
                      <strong>{isEn ? 'Engineering Philosophy:' : 'Filosofi Rekayasa:'}</strong>{' '}
                      {isEn
                        ? 'Simplicity Over Cleverness • Performance as a Feature • Built to Evolve • Craftsmanship & Empathy'
                        : 'Kesederhanaan di Atas Kerumitan • Performa Sebagai Fitur • Dibuat untuk Berkembang • Dedikasi & Empati'}
                    </div>
                  </div>
                </section>
              </div>

              {/* ===================== FOOTER VERIFICATION ===================== */}
              <footer className="mt-8 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>
                    {isEn
                      ? 'Verified Curriculum Vitae • Muchamad Irvan'
                      : 'Curriculum Vitae Terverifikasi • Muchamad Irvan'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>vanviolet.my.id/cv</span>
                  <span>•</span>
                  <span>{new Date().getFullYear()}</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
