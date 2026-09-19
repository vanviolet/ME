import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { projectsData } from '../data/portfolioData';
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
  Sparkles,
  Briefcase,
  Layers,
  Terminal,
  ZoomIn,
  ZoomOut,
  Eye,
  FileCheck,
  ShieldCheck,
  Award,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const CvPage: React.FC = () => {
  const { language, setLanguage } = usePortfolio();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const [cvVariant, setCvVariant] = useState<'executive' | 'ats'>('executive');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const singleAtsRef = useRef<HTMLDivElement>(null);

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

  // Direct browser print handler
  const handlePrint = () => {
    window.print();
  };

  // High-Fidelity Multi-Page PDF generator using jsPDF & html2canvas
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      // Standard A4 dimensions in mm
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      if (cvVariant === 'executive') {
        if (!page1Ref.current || !page2Ref.current) {
          throw new Error('Halaman CV tidak ditemukan');
        }

        // 1. Render Page 1
        setPdfProgressText(isEn ? 'Rendering Page 1 of 2...' : 'Menyiapkan Halaman 1 dari 2...');
        const canvas1 = await html2canvas(page1Ref.current, {
          scale: 2.2, // 2.2x scale ensures 300 DPI retina sharpness
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 850,
          onclone: (clonedDoc) => {
            clonedDoc.documentElement.classList.remove('dark');
            const el = clonedDoc.getElementById('cv-sheet-page-1');
            if (el) {
              el.style.transform = 'none';
              el.style.boxShadow = 'none';
              el.style.width = '794px';
              el.style.margin = '0';
            }
          }
        });

        const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        // 2. Render Page 2
        setPdfProgressText(isEn ? 'Rendering Page 2 of 2...' : 'Menyiapkan Halaman 2 dari 2...');
        const canvas2 = await html2canvas(page2Ref.current, {
          scale: 2.2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 850,
          onclone: (clonedDoc) => {
            clonedDoc.documentElement.classList.remove('dark');
            const el = clonedDoc.getElementById('cv-sheet-page-2');
            if (el) {
              el.style.transform = 'none';
              el.style.boxShadow = 'none';
              el.style.width = '794px';
              el.style.margin = '0';
            }
          }
        });

        const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);
        pdf.addPage();
        pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      } else {
        // ATS Single Page Mode
        if (!singleAtsRef.current) {
          throw new Error('Halaman ATS tidak ditemukan');
        }

        setPdfProgressText(isEn ? 'Rendering ATS Clean Document...' : 'Menyiapkan Dokumen ATS...');
        const canvasAts = await html2canvas(singleAtsRef.current, {
          scale: 2.2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 850,
          onclone: (clonedDoc) => {
            clonedDoc.documentElement.classList.remove('dark');
            const el = clonedDoc.getElementById('cv-sheet-ats');
            if (el) {
              el.style.transform = 'none';
              el.style.boxShadow = 'none';
              el.style.width = '794px';
              el.style.margin = '0';
            }
          }
        });

        const imgDataAts = canvasAts.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgDataAts, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      setPdfProgressText(isEn ? 'Finalizing PDF...' : 'Menyimpan Berkas PDF...');
      const fileName = isEn
        ? `Muchamad-Irvan-Software-Engineer-${cvVariant === 'executive' ? 'CV' : 'ATS'}.pdf`
        : `Muchamad-Irvan-Curriculum-Vitae-${cvVariant === 'executive' ? 'Resmi' : 'ATS'}.pdf`;

      pdf.save(fileName);
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 3500);
    } catch (error) {
      console.warn('Gagal memproses PDF via html2canvas, menggunakan fallback browser print:', error);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 pt-24 sm:pt-28 pb-16 px-3 sm:px-6">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Check size={16} />
          <span>{isEn ? 'PDF Document successfully downloaded!' : 'Dokumen PDF berhasil diunduh!'}</span>
        </div>
      )}

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

          {/* Center: Controls (Format, Language, Photo, Zoom) */}
          <div className="flex items-center gap-2">
            {/* Format Toggle: Executive (2 Pages) vs ATS Clean (1 Page) */}
            <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => setCvVariant('executive')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cvVariant === 'executive'
                    ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
                title="Format Eksekutif 2 Halaman (Lengkap & Desain Terstruktur)"
              >
                {isEn ? 'Executive (2 Pages)' : 'Eksekutif (2 Hal)'}
              </button>
              <button
                type="button"
                onClick={() => setCvVariant('ats')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  cvVariant === 'ats'
                    ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
                title="Format ATS Ringkas 1 Halaman (Teks Padat)"
              >
                ATS Clean (1 Hal)
              </button>
            </div>

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

            {/* Photo Toggle */}
            {cvVariant === 'executive' && (
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
            )}

            {/* Zoom Controls */}
            <div className="hidden xl:flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(75, prev - 10))}
                className="p-1 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded text-stone-600 dark:text-zinc-300"
                title="Perkecil Tampilan"
              >
                <ZoomOut size={13} />
              </button>
              <span className="px-1 text-[11px] font-mono text-stone-500">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(125, prev + 10))}
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
              title={isEn ? 'Print / Browser PDF' : 'Cetak / Simpan Browser'}
            >
              <Printer size={14} />
              <span className="hidden sm:inline">{isEn ? 'Print' : 'Cetak'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-75 cursor-pointer"
              title={isEn ? 'Download Formatted PDF' : 'Unduh Dokumen PDF Rapi'}
            >
              {isGeneratingPdf ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>
                {isGeneratingPdf
                  ? (pdfProgressText || (isEn ? 'Rendering PDF...' : 'Menyiapkan PDF...'))
                  : (isEn ? 'Download PDF' : 'Unduh PDF')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* CV Paper Container */}
      <div className="flex flex-col items-center gap-8 pb-16 overflow-x-auto">
        <div
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="w-full max-w-[820px] flex flex-col items-center gap-8"
        >
          {cvVariant === 'executive' ? (
            <>
              {/* =========================================================================
                  PAGE 1: HEADER, SUMMARY, TECHNICAL COMPETENCIES, CORE EXPERIENCES
                  ========================================================================= */}
              <div className="w-full relative">
                {/* Page Indicator Tag */}
                <div className="print:hidden text-center mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 font-mono text-[11px] font-semibold">
                    {isEn ? 'Page 1 of 2 • Executive Profile & Core Platforms' : 'Halaman 1 dari 2 • Profil Eksekutif & Platform Utama'}
                  </span>
                </div>

                <div
                  ref={page1Ref}
                  id="cv-sheet-page-1"
                  className="cv-a4-sheet cv-page-break bg-white text-stone-900 shadow-2xl rounded-sm sm:rounded-md border border-stone-200/90 print:border-none print:shadow-none print:rounded-none overflow-hidden"
                  style={{
                    width: '100%',
                    maxWidth: '820px',
                    minHeight: '1125px', // Exact A4 proportional height
                    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {/* Top Accent Strip */}
                  <div className="h-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-stone-900" />

                  {/* Document Body Padding */}
                  <div className="p-7 sm:p-10 space-y-5">
                    {/* Header */}
                    <header className="border-b border-stone-200 pb-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="space-y-1.5 flex-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-bold tracking-wide">
                            <Sparkles size={11} className="text-rose-500" />
                            <span>{isEn ? '5+ Years Production Delivery' : '5+ Tahun Rekayasa Produksi'}</span>
                          </div>

                          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight leading-none">
                            Muchamad Irvan
                          </h1>

                          <p className="text-base font-bold text-rose-600">
                            {isEn
                              ? 'Fullstack Software Engineer & Systems Architect'
                              : 'Fullstack Software Engineer & Arsitek Sistem'}
                          </p>

                          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed pt-0.5">
                            {isEn
                              ? 'Specialized in scalable enterprise web platforms, high-concurrency academic LMS systems, Kubernetes microservices, and reactive fullstack engineering.'
                              : 'Spesialis perancangan sistem enterprise scalable, platform LMS akademik konkurensi tinggi, orkestrasi kontainer Kubernetes, dan microservices modern.'}
                          </p>
                        </div>

                        {/* Photo & Quick Status */}
                        {showPhoto && (
                          <div className="shrink-0 flex sm:flex-col items-center gap-2">
                            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-stone-200 shadow-xs bg-stone-100">
                              <img
                                src="/images/irvan_photo_portrait.jpg"
                                alt="Muchamad Irvan"
                                className="w-full h-full object-cover object-top"
                                crossOrigin="anonymous"
                              />
                            </div>
                            <div className="text-center">
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {isEn ? 'Available' : 'Tersedia'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contact Details */}
                      <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-700 font-medium">
                        <a href="mailto:vanviolet.js@gmail.com" className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
                          <Mail size={13} className="text-rose-500 shrink-0" />
                          <span className="truncate">vanviolet.js@gmail.com</span>
                        </a>

                        <a href="https://vanviolet.my.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
                          <Globe size={13} className="text-rose-500 shrink-0" />
                          <span className="truncate">vanviolet.my.id</span>
                        </a>

                        <a href="https://github.com/vanviolet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-rose-600 transition-colors">
                          <Github size={13} className="text-rose-500 shrink-0" />
                          <span className="truncate">github.com/vanviolet</span>
                        </a>

                        <div className="flex items-center gap-1.5 text-stone-600">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span>Indonesia (GMT+7)</span>
                        </div>
                      </div>
                    </header>

                    {/* Professional Summary */}
                    <section className="space-y-1.5">
                      <h2 className="text-xs uppercase tracking-wider font-mono font-bold text-stone-500 border-b border-stone-200 pb-1 flex items-center gap-2">
                        <FileCheck size={13} className="text-rose-500" />
                        <span>{isEn ? 'Professional Summary' : 'Ringkasan Profesional'}</span>
                      </h2>
                      <p className="text-[12px] sm:text-[12.5px] text-stone-700 leading-relaxed text-justify">
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

                    {/* Technical Competencies (2x2 Grid) */}
                    <section className="space-y-2">
                      <h2 className="text-xs uppercase tracking-wider font-mono font-bold text-stone-500 border-b border-stone-200 pb-1 flex items-center gap-2">
                        <Terminal size={13} className="text-rose-500" />
                        <span>{isEn ? 'Technical Competencies & Stack' : 'Kompetensi Teknis & Stack'}</span>
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                        {/* Languages & Frontend */}
                        <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1">
                          <div className="font-bold text-stone-900 flex items-center justify-between text-[11px]">
                            <span>{isEn ? 'Languages & Frontend' : 'Bahasa & Frontend'}</span>
                            <span className="font-mono text-rose-600 font-semibold">Client Tier</span>
                          </div>
                          <p className="text-stone-700 leading-snug">
                            <strong>Languages:</strong> TypeScript, JavaScript (ESNext), Go, Python, SQL, PHP
                          </p>
                          <p className="text-stone-700 leading-snug">
                            <strong>Frameworks:</strong> React 19, Next.js, Vue.js, Tailwind CSS, Web Audio API, Canvas
                          </p>
                        </div>

                        {/* Backend & Architecture */}
                        <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1">
                          <div className="font-bold text-stone-900 flex items-center justify-between text-[11px]">
                            <span>{isEn ? 'Backend & Architecture' : 'Backend & Arsitektur'}</span>
                            <span className="font-mono text-rose-600 font-semibold">Server Tier</span>
                          </div>
                          <p className="text-stone-700 leading-snug">
                            <strong>Runtimes & Stacks:</strong> Node.js, NestJS, Express, RESTful APIs, Microservices
                          </p>
                          <p className="text-stone-700 leading-snug">
                            <strong>Data & Storage:</strong> PostgreSQL (Index & Query Tuning), Redis Caching, Prisma ORM
                          </p>
                        </div>

                        {/* DevOps & Infrastructure */}
                        <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1">
                          <div className="font-bold text-stone-900 flex items-center justify-between text-[11px]">
                            <span>{isEn ? 'DevOps & Cloud' : 'DevOps & Infrastruktur'}</span>
                            <span className="font-mono text-rose-600 font-semibold">DevOps</span>
                          </div>
                          <p className="text-stone-700 leading-snug">
                            <strong>Containers & Cloud:</strong> Kubernetes (Clusters, HPA, Ingress), Docker, Docker Compose
                          </p>
                          <p className="text-stone-700 leading-snug">
                            <strong>Operations:</strong> CI/CD Pipelines, Nginx Reverse Proxy, Linux Administration
                          </p>
                        </div>

                        {/* AI & Systems */}
                        <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1">
                          <div className="font-bold text-stone-900 flex items-center justify-between text-[11px]">
                            <span>{isEn ? 'AI & Systems' : 'Sistem Cerdas & AI'}</span>
                            <span className="font-mono text-rose-600 font-semibold">AI / Systems</span>
                          </div>
                          <p className="text-stone-700 leading-snug">
                            <strong>AI Engineering:</strong> LLM Integration, RAG Architectures, Computer Vision Liveness
                          </p>
                          <p className="text-stone-700 leading-snug">
                            <strong>Patterns:</strong> Clean Architecture, Modular Monoliths, Event-Driven, DAG Graphs
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Work Experience: University & Remote Enterprise */}
                    <section className="space-y-3 pt-1">
                      <h2 className="text-xs uppercase tracking-wider font-mono font-bold text-stone-500 border-b border-stone-200 pb-1 flex items-center gap-2">
                        <Briefcase size={13} className="text-rose-500" />
                        <span>{isEn ? 'Professional Work Experience (Core Platforms)' : 'Pengalaman Kerja Profesional (Platform Utama)'}</span>
                      </h2>

                      <div className="space-y-3.5 text-xs">
                        {/* Experience 1: University */}
                        <div className="relative pl-3.5 border-l-2 border-rose-500 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                            <div>
                              <h3 className="text-[13px] font-bold text-stone-950">
                                Fullstack Developer & Systems Architect
                              </h3>
                              <div className="text-rose-700 font-semibold text-[11.5px]">
                                University Academic Technology Center • Higher Education
                              </div>
                            </div>
                            <div className="text-[10.5px] font-mono font-semibold text-stone-500 shrink-0">
                              2022 — {isEn ? 'Present (Active)' : 'Sekarang (Aktif)'}
                            </div>
                          </div>

                          <p className="text-stone-600 italic text-[11px]">
                            {isEn
                              ? 'Architecting, modernizing, and engineering core university enterprise platforms across campus.'
                              : 'Merancang arsitektur, modernisasi, dan rekayasa platform enterprise akademik universitas berskala kampus.'}
                          </p>

                          <ul className="list-disc list-outside pl-3 space-y-0.5 text-[11.5px] text-stone-700 leading-normal">
                            <li>
                              <strong>{isEn ? 'Next-Gen University LMS (2024)' : 'LMS Universitas Generasi Baru (2024)'}:</strong>{' '}
                              {isEn
                                ? 'Built the campus primary daily system serving 15,000+ students & faculty with 99.9% uptime on Kubernetes HPA, reducing page load latency by 65%.'
                                : 'Merancang sistem kampus utama melayani 15.000+ mahasiswa & dosen dengan ketersediaan 99.9% di atas Kubernetes HPA, memangkas latensi akses 65%.'}
                            </li>
                            <li>
                              <strong>{isEn ? 'Integrated Curriculum OBE System (2026)' : 'Sistem Kurikulum Terintegrasi OBE (2026)'}:</strong>{' '}
                              {isEn
                                ? 'Engineered Outcome-Based Education platform with DAG prerequisite graph validation and automated accreditation dossiers across 30+ faculties.'
                                : 'Membangun platform kurikulum Outcome-Based Education (OBE) dengan graf dependensi mata kuliah dan otomasi borang akreditasi di 30+ fakultas.'}
                            </li>
                            <li>
                              <strong>{isEn ? 'Doctoral Scholarship System (Beasiswa S3)' : 'Sistem Beasiswa S3 Lanjutan'}:</strong>{' '}
                              {isEn
                                ? 'Full lifecycle scholarship workflow with bi-directional integration into central campus HRMS.'
                                : 'Sistem beasiswa lanjutan dosen dengan integrasi dua arah langsung ke HRMS kepegawaian kampus.'}
                            </li>
                            <li>
                              <strong>{isEn ? 'Graduation Convocation Logistics' : 'Sistem Manajemen Wisuda'}:</strong>{' '}
                              {isEn
                                ? 'Coordinated ceremonies for 2,000+ graduates and 4,000+ guests per session with real-time barcode stage queuing.'
                                : 'Mengkoordinasikan prosesi wisuda 2.000+ lulusan per sesi dengan antrean barcode panggung dan telemetri siaran langsung.'}
                            </li>
                          </ul>
                        </div>

                        {/* Experience 2: Remote Enterprise */}
                        <div className="relative pl-3.5 border-l-2 border-stone-400 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                            <div>
                              <h3 className="text-[13px] font-bold text-stone-950">
                                Senior Fullstack Software Engineer (Remote)
                              </h3>
                              <div className="text-stone-700 font-semibold text-[11.5px]">
                                External Enterprise Company • Private Enterprise Client
                              </div>
                            </div>
                            <div className="text-[10.5px] font-mono font-semibold text-stone-500 shrink-0">
                              2023 — {isEn ? 'Present (Active)' : 'Sekarang (Aktif)'}
                            </div>
                          </div>

                          <p className="text-stone-600 italic text-[11px]">
                            {isEn
                              ? 'Collaborating asynchronously with engineering teams to build resilient SaaS platforms and high-load microservices.'
                              : 'Berkolaborasi secara remote merancang sistem SaaS perusahaan, backend microservices, dan sistem berkinerja tinggi.'}
                          </p>

                          <ul className="list-disc list-outside pl-3 space-y-0.5 text-[11.5px] text-stone-700 leading-normal">
                            <li>
                              <strong>{isEn ? 'Biometric Attendance System (2026)' : 'Sistem Presensi Biometrik Wajah Pegawai (2026)'}:</strong>{' '}
                              {isEn
                                ? 'Enterprise workforce app with anti-spoofing computer vision validation and GPS polygon geofencing eliminating clock-in fraud.'
                                : 'Aplikasi presensi dengan validasi computer vision anti-spoofing dan poligon GPS akurat yang menekan kecurangan hingga 0%.'}
                            </li>
                            <li>
                              <strong>{isEn ? 'Enterprise Inventory & Asset Tracking (2026)' : 'Sistem Manajemen Inventaris & Aset (2026)'}:</strong>{' '}
                              {isEn
                                ? 'Multi-warehouse asset management with barcode/QR scanning and immutable audit ledger trails across 12 facilities.'
                                : 'Sistem inventaris multi-gudang dengan pemindaian barcode/QR dan log audit investigasi perpindahan barang.'}
                            </li>
                            <li>
                              <strong>{isEn ? 'Database Optimization & Performance' : 'Optimasi Database & Performa'}:</strong>{' '}
                              {isEn
                                ? 'Optimized complex PostgreSQL schemas and Redis caching, improving throughput by up to 400% on high-traffic endpoints.'
                                : 'Mengoptimasi skema PostgreSQL dan cache Redis, menghasilkan peningkatan throughput hingga 400%.'}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Page 1 Footer */}
                    <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span>vanviolet.my.id/cv</span>
                      <span>{isEn ? 'Curriculum Vitae • Page 1 of 2' : 'Curriculum Vitae • Halaman 1 dari 2'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  PAGE 2: FREELANCE EXPERIENCE, PRODUCTION SYSTEMS TABLE, PRINCIPLES & FOOTER
                  ========================================================================= */}
              <div className="w-full relative">
                {/* Page Indicator Tag */}
                <div className="print:hidden text-center mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 font-mono text-[11px] font-semibold">
                    {isEn ? 'Page 2 of 2 • Client Solutions, Systems Matrix & Philosophy' : 'Halaman 2 dari 2 • Proyek Klien, Matriks Sistem & Filosofi'}
                  </span>
                </div>

                <div
                  ref={page2Ref}
                  id="cv-sheet-page-2"
                  className="cv-a4-sheet bg-white text-stone-900 shadow-2xl rounded-sm sm:rounded-md border border-stone-200/90 print:border-none print:shadow-none print:rounded-none overflow-hidden"
                  style={{
                    width: '100%',
                    maxWidth: '820px',
                    minHeight: '1125px', // Exact A4 proportional height
                    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {/* Top Accent Strip */}
                  <div className="h-2 bg-gradient-to-r from-stone-900 via-rose-600 to-rose-500" />

                  {/* Document Body Padding */}
                  <div className="p-7 sm:p-10 space-y-5">
                    {/* Header Page 2 Compact Strip */}
                    <div className="border-b border-stone-200 pb-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-stone-950 text-sm">Muchamad Irvan</span>
                        <span className="text-stone-400 mx-2">•</span>
                        <span className="text-rose-600 font-semibold">Fullstack Software Engineer</span>
                      </div>
                      <div className="text-[10.5px] font-mono text-stone-400">
                        {isEn ? 'Curriculum Vitae — Page 2 of 2' : 'Curriculum Vitae — Halaman 2 dari 2'}
                      </div>
                    </div>

                    {/* Experience 3: Freelance & Bespoke Solutions */}
                    <section className="space-y-2">
                      <h2 className="text-xs uppercase tracking-wider font-mono font-bold text-stone-500 border-b border-stone-200 pb-1 flex items-center gap-2">
                        <Briefcase size={13} className="text-rose-500" />
                        <span>{isEn ? 'Independent Engineering & Bespoke Client Work' : 'Rekayasa Mandiri & Solusi Klien Independen'}</span>
                      </h2>

                      <div className="relative pl-3.5 border-l-2 border-stone-300 space-y-1.5 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                          <div>
                            <h3 className="text-[13px] font-bold text-stone-950">
                              Freelance Fullstack Developer
                            </h3>
                            <div className="text-stone-700 font-semibold text-[11.5px]">
                              Independent Engineering & Custom Software Solutions
                            </div>
                          </div>
                          <div className="text-[10.5px] font-mono font-semibold text-stone-500 shrink-0">
                            2022 — {isEn ? 'Present (Active)' : 'Sekarang (Aktif)'}
                          </div>
                        </div>

                        <ul className="list-disc list-outside pl-3 space-y-1 text-[11.5px] text-stone-700 leading-normal">
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
                              ? 'Delivered zero-tampering internal corporate election platform with single-use cryptographic tokens and verifiable audit ballots.'
                              : 'Merancang platform pemilihan kepemimpinan perusahaan dengan token kriptografis sekali pakai dan audit trail anti-manipulasi.'}
                          </li>
                          <li>
                            <strong>{isEn ? 'E-Letter Digital Correspondence System' : 'Sistem Administrasi Persuratan & Disposisi Digital'}:</strong>{' '}
                            {isEn
                              ? 'Accelerated official letter routing and administrative document approvals from 7 days to under 4 hours with digital QR authentication.'
                              : 'Memangkas alur persuratan resmi dan disposisi berkas dari 7 hari menjadi kurang dari 4 jam dengan verifikasi QR digital.'}
                          </li>
                        </ul>
                      </div>
                    </section>

                    {/* Selected Key Production Systems Matrix */}
                    <section className="space-y-2">
                      <h2 className="text-xs uppercase tracking-wider font-mono font-bold text-stone-500 border-b border-stone-200 pb-1 flex items-center gap-2">
                        <Layers size={13} className="text-rose-500" />
                        <span>{isEn ? 'Flagship Production Systems Matrix' : 'Matriks Sistem & Produk Unggulan'}</span>
                      </h2>

                      <div className="border border-stone-200 rounded-lg overflow-hidden text-[11px]">
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
                              <td className="py-2 px-3 text-stone-600">{isEn ? 'System Architect' : 'Arsitek Sistem'}</td>
                              <td className="py-2 px-3 font-mono text-[10px] text-rose-700">Next.js, NestJS, Postgres, K8s</td>
                              <td className="py-2 px-3 text-stone-700">{isEn ? '15,000+ daily users • 99.9% uptime' : '15.000+ pengguna/hari • 99.9% uptime'}</td>
                            </tr>
                            <tr className="hover:bg-stone-50/75">
                              <td className="py-2 px-3 font-semibold text-stone-950">Biometric Attendance</td>
                              <td className="py-2 px-3 text-stone-600">{isEn ? 'Senior Fullstack' : 'Senior Fullstack'}</td>
                              <td className="py-2 px-3 font-mono text-[10px] text-rose-700">TypeScript, NestJS, CV API, Redis</td>
                              <td className="py-2 px-3 text-stone-700">{isEn ? 'Zero fraud liveness detection' : 'Liveness detection tanpa manipulasi'}</td>
                            </tr>
                            <tr className="hover:bg-stone-50/75">
                              <td className="py-2 px-3 font-semibold text-stone-950">Integrated Curriculum OBE</td>
                              <td className="py-2 px-3 text-stone-600">{isEn ? 'Core Developer' : 'Pengembang Utama'}</td>
                              <td className="py-2 px-3 font-mono text-[10px] text-rose-700">Vue.js, NestJS, Postgres, DAG</td>
                              <td className="py-2 px-3 text-stone-700">{isEn ? '30+ faculties accreditation sync' : 'Sinkronisasi akreditasi 30+ fakultas'}</td>
                            </tr>
                            <tr className="hover:bg-stone-50/75">
                              <td className="py-2 px-3 font-semibold text-stone-950">Inventory & Asset Tracker</td>
                              <td className="py-2 px-3 text-stone-600">{isEn ? 'Fullstack Engineer' : 'Fullstack Engineer'}</td>
                              <td className="py-2 px-3 font-mono text-[10px] text-rose-700">React, NestJS, Barcode, Docker</td>
                              <td className="py-2 px-3 text-stone-700">{isEn ? 'Multi-facility lifecycle tracking' : 'Pelacakan aset di 12 gedung'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Languages, Principles & Work Availability (NO FORMAL EDUCATION) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      {/* Languages */}
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                        <div className="font-bold text-stone-950 flex items-center gap-1.5 text-[11.5px]">
                          <Award size={13} className="text-rose-500" />
                          <span>{isEn ? 'Working Languages' : 'Kemampuan Bahasa'}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed text-[11px]">
                          <strong>Bahasa Indonesia:</strong> {isEn ? 'Native / Mother Tongue' : 'Penutur Asli (Native)'}
                        </p>
                        <p className="text-stone-700 leading-relaxed text-[11px]">
                          <strong>English:</strong> {isEn ? 'Professional Technical Working Proficiency' : 'Kemampuan Teknis Kerja Profesional (Dokumentasi, Diskusi & Kode)'}
                        </p>
                      </div>

                      {/* Work Modes & Collaboration */}
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                        <div className="font-bold text-stone-950 flex items-center gap-1.5 text-[11.5px]">
                          <SlidersHorizontal size={13} className="text-rose-500" />
                          <span>{isEn ? 'Availability & Engagement' : 'Ketersediaan & Kerjasama'}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed text-[11px]">
                          <strong>{isEn ? 'Arrangement:' : 'Bentuk Kerja:'}</strong>{' '}
                          {isEn ? 'Remote (Global) • Hybrid • Contract • Direct Consulting' : 'Kerja Remote • Hybrid • Kontrak Rekayasa • Konsultasi Sistem'}
                        </p>
                        <p className="text-stone-700 leading-relaxed text-[11px]">
                          <strong>{isEn ? 'Timezone:' : 'Zona Waktu:'}</strong> GMT+7 (Western Indonesia Time / Flexible overlap)
                        </p>
                      </div>
                    </div>

                    {/* Core Engineering Principles Card */}
                    <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                      <div className="font-bold text-rose-950 flex items-center gap-1.5 text-[11.5px]">
                        <Sparkles size={13} className="text-rose-600" />
                        <span>{isEn ? 'Core Engineering Philosophy' : 'Filosofi Rekayasa Perangkat Lunak'}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed text-[11px]">
                        {isEn
                          ? 'Simplicity Over Cleverness • Performance as a Feature • Reliability First • Modular Maintainability • Craftsmanship & Empathy'
                          : 'Kesederhanaan di Atas Kerumitan • Performa Sebagai Fitur Utama • Keandalan Tanpa Kompromi • Kemudahan Pemeliharaan • Dedikasi & Empati Pengguna'}
                      </p>
                    </div>

                    {/* Official Verification Footer */}
                    <footer className="mt-8 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-stone-500 font-mono">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>
                          {isEn
                            ? 'Verified Curriculum Vitae • Muchamad Irvan'
                            : 'Curriculum Vitae Terverifikasi • Muchamad Irvan'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span>vanviolet.my.id/cv</span>
                        <span>•</span>
                        <span>{new Date().getFullYear()}</span>
                      </div>
                    </footer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* =========================================================================
               ATS CLEAN SINGLE-PAGE FORMAT (CONDENSED 1 PAGE FOR ATS PARSERS)
               ========================================================================= */
            <div className="w-full relative">
              <div className="print:hidden text-center mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 font-mono text-[11px] font-semibold">
                  {isEn ? 'ATS Clean Mode • Single Page Format' : 'Mode ATS Bersih • Format 1 Halaman Ringkas'}
                </span>
              </div>

              <div
                ref={singleAtsRef}
                id="cv-sheet-ats"
                className="cv-a4-sheet bg-white text-stone-900 shadow-2xl rounded-sm border border-stone-300 print:border-none print:shadow-none overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '820px',
                  minHeight: '1125px',
                  fontFamily: '"Plus Jakarta Sans", Arial, sans-serif',
                }}
              >
                <div className="p-8 space-y-4">
                  {/* ATS Header */}
                  <header className="border-b border-stone-300 pb-3 space-y-1">
                    <h1 className="text-2xl font-bold text-stone-950">MUCHAMAD IRVAN</h1>
                    <p className="text-xs font-semibold text-stone-800">
                      Fullstack Software Engineer & Systems Architect
                    </p>
                    <div className="text-[11px] text-stone-600 flex flex-wrap gap-3 font-mono">
                      <span>vanviolet.js@gmail.com</span>
                      <span>•</span>
                      <span>https://vanviolet.my.id</span>
                      <span>•</span>
                      <span>https://github.com/vanviolet</span>
                      <span>•</span>
                      <span>Indonesia (GMT+7)</span>
                    </div>
                  </header>

                  {/* Summary */}
                  <section className="space-y-1">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-stone-900 border-b border-stone-200 pb-0.5">
                      Professional Summary
                    </h2>
                    <p className="text-[11px] text-stone-800 leading-normal">
                      Experienced Fullstack Software Engineer with 5+ years building production enterprise platforms, high-concurrency academic LMS systems, Kubernetes clusters, and reactive microservices. Proven expertise in TypeScript, React, Next.js, NestJS, Node.js, PostgreSQL, Redis, and container orchestration.
                    </p>
                  </section>

                  {/* Skills */}
                  <section className="space-y-1">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-stone-900 border-b border-stone-200 pb-0.5">
                      Technical Skills
                    </h2>
                    <p className="text-[11px] text-stone-800 leading-normal">
                      <strong>Languages & Frontend:</strong> TypeScript, JavaScript, Go, Python, SQL, React, Next.js, Vue.js, Tailwind CSS<br />
                      <strong>Backend & Storage:</strong> Node.js, NestJS, Express, REST APIs, PostgreSQL, Redis, Prisma ORM, Microservices<br />
                      <strong>DevOps & Systems:</strong> Kubernetes, Docker, Docker Compose, CI/CD, Nginx, Linux Administration, Clean Architecture
                    </p>
                  </section>

                  {/* Experience */}
                  <section className="space-y-3">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-stone-900 border-b border-stone-200 pb-0.5">
                      Work Experience
                    </h2>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-stone-950">
                        <span>Fullstack Developer & Systems Architect — University Technology Center</span>
                        <span>2022 — Present</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 text-[10.5px] text-stone-800 space-y-0.5">
                        <li>Built next-generation University LMS (2024) serving 15,000+ students and faculty with 99.9% uptime on Kubernetes HPA.</li>
                        <li>Architected Integrated Curriculum System (2026) connecting course prerequisites and Outcome-Based Education (OBE) accreditation across 30+ faculties.</li>
                        <li>Delivered Doctoral Scholarship System and Convocation Logistics platform handling 2,000+ graduates per session.</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-stone-950">
                        <span>Senior Fullstack Software Engineer (Remote) — External Enterprise</span>
                        <span>2023 — Present</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 text-[10.5px] text-stone-800 space-y-0.5">
                        <li>Engineered Biometric Attendance System (2026) with anti-spoofing computer vision liveness checks and GPS polygon geofencing.</li>
                        <li>Built enterprise multi-facility inventory asset tracking platform with barcode telemetry and immutable audit trails.</li>
                        <li>Optimized PostgreSQL database schemas and Redis caching, delivering 400% throughput gain on heavy traffic.</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-stone-950">
                        <span>Freelance Fullstack Developer — Independent Engineering</span>
                        <span>2022 — Present</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 text-[10.5px] text-stone-800 space-y-0.5">
                        <li>Delivered Hotel Room Management & Reservation System with interactive room occupancy matrices.</li>
                        <li>Created Kost Rental & Lease Invoicing SaaS with automated WhatsApp bill notifications reducing delays by 80%.</li>
                        <li>Engineered Cryptographic Corporate Voting Platform with single-use tamper-proof tokens.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Languages & Principles */}
                  <section className="space-y-1 pt-1 border-t border-stone-200">
                    <h2 className="text-[11px] uppercase tracking-wider font-bold text-stone-900 border-b border-stone-200 pb-0.5">
                      Languages & Philosophy
                    </h2>
                    <p className="text-[10.5px] text-stone-800">
                      <strong>Languages:</strong> Bahasa Indonesia (Native), English (Professional Technical Working Proficiency)<br />
                      <strong>Core Philosophy:</strong> Simplicity Over Cleverness • Performance as a Feature • Reliability Without Compromise
                    </p>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
