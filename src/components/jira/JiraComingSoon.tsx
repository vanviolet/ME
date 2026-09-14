import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { Link } from 'react-router-dom';
import {
  Kanban,
  Clock,
  Wrench,
  Sparkles,
  Layers,
  GitBranch,
  ShieldCheck,
  Zap,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Construction,
  Cpu,
} from 'lucide-react';

export const JiraComingSoon: React.FC = () => {
  const { language } = usePortfolio();

  const plannedFeatures = [
    {
      icon: Kanban,
      title: language === 'en' ? 'Agile Kanban & Scrum Boards' : 'Papan Interaktif Kanban & Scrum',
      description:
        language === 'en'
          ? 'Fluid drag-and-drop issue cards, customizable status columns, story point estimations, and quick filters.'
          : 'Kartu tiket drag-and-drop mulus, kustomisasi kolom status alur kerja, estimasi story point, dan filter cepat.',
    },
    {
      icon: Zap,
      title: language === 'en' ? 'Sprint Planning & Backlog' : 'Perencanaan Sprint & Backlog',
      description:
        language === 'en'
          ? 'Structured product backlogs, sprint cycles management, velocity tracking, and automated rollover.'
          : 'Manajemen backlog bertingkat, siklus sprint iteratif, pelacakan velocity tim, dan pemindahan tiket otomatis.',
    },
    {
      icon: Layers,
      title: language === 'en' ? 'Gantt Roadmap & Timeline' : 'Roadmap Gantt & Timeline Proyek',
      description:
        language === 'en'
          ? 'Interactive Gantt milestones, epic progress bars, dependencies tracking, and quarterly release schedules.'
          : 'Milestone Gantt visual, progress epic, pelacakan ketergantungan antar tiket, dan jadwal rilis berkala.',
    },
    {
      icon: ShieldCheck,
      title: language === 'en' ? 'RBAC & Multi-Role Permissions' : 'Izin Akses Tim & RBAC Berlapis',
      description:
        language === 'en'
          ? 'Enterprise permissions for Admins, Project Leads, Assignees, and Viewers with audit trail logging.'
          : 'Hak akses bertingkat untuk Admin, Project Lead, Pengembang, dan Viewer dengan log audit aktivitas.',
    },
    {
      icon: Sparkles,
      title: language === 'en' ? 'AI Story & Issue Generator' : 'Asisten AI Generator Cerita & Tiket',
      description:
        language === 'en'
          ? 'Smart acceptance criteria generation, automated bug report synthesis, and technical task breakdowns.'
          : 'Pembuatan kriteria penerimaan otomatis, sintesis laporan bug mendalam, dan pemecahan task teknis via AI.',
    },
    {
      icon: Cpu,
      title: language === 'en' ? 'Ultra-Fast Real-Time Sync' : 'Sinkronisasi Cloud Real-Time Stabil',
      description:
        language === 'en'
          ? 'Resilient zero-latency multi-device state synchronization with offline fallback handling.'
          : 'Sinkronisasi data cloud multi-perangkat berkecepatan tinggi dengan penanganan status offline yang aman.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center space-y-12">
      <Seo
        title={
          language === 'en'
            ? 'Jira Cloud Project Management (Coming Soon) — Muchamad Irvan'
            : 'Jira Cloud Project Management (Segera Hadir) — Muchamad Irvan'
        }
        description={
          language === 'en'
            ? 'Enterprise-grade Agile project management tool inspired by Jira. Currently under development and performance optimization.'
            : 'Perkakas manajemen proyek Agile enterprise terinspirasi Jira. Sedang dalam tahap optimalisasi dan penyempurnaan sistem.'
        }
        url="/tools/jira"
      />

      {/* Main Status Hero */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/20 shadow-xs animate-pulse">
          <Construction size={14} className="text-amber-600 dark:text-amber-400" />
          <span>{language === 'en' ? 'Under Reconstruction & Polish' : 'Sedang Dalam Penyempurnaan & Rekonstruksi'}</span>
        </div>

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Kanban size={36} className="sm:w-10 sm:h-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100">
          Jira Cloud PM{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-rose-600">
            {language === 'en' ? 'Coming Soon' : 'Segera Hadir'}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          {language === 'en'
            ? 'We are currently refactoring and polishing the Jira Cloud Project Management engine to deliver an ultra-reliable, bug-free Agile experience with robust cloud persistence and seamless team collaboration.'
            : 'Kami sedang merekonstruksi dan memoles arsitektur Jira Cloud PM agar menghadirkan pengalaman Agile yang sangat stabil, bebas keanehan state, dengan sinkronisasi database cloud instan dan kolaborasi tim yang mulus.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Wrench size={16} />
            <span>{language === 'en' ? 'Explore Other Tools' : 'Jelajahi Perkakas Lainnya'}</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-200/80 dark:bg-zinc-800/90 hover:bg-stone-300 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-all"
          >
            <ArrowLeft size={16} />
            <span>{language === 'en' ? 'Back to Portfolio' : 'Kembali ke Portofolio'}</span>
          </Link>
        </div>
      </div>

      {/* Progress & Milestone Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs max-w-3xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-amber-500" />
            {language === 'en' ? 'Refactoring Roadmap Status' : 'Status Rekonstruksi & Polish'}
          </span>
          <span className="font-mono text-blue-600 dark:text-blue-400">Phase 2 / In Progress</span>
        </div>

        <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-full rounded-full w-2/3 transition-all duration-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span>{language === 'en' ? 'UI System Design' : 'Desain Sistem Antarmuka'}</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>{language === 'en' ? 'Cloud Sync & State Stabilization' : 'Stabilisasi State & Sinkronisasi'}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400 dark:text-zinc-600">
            <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-zinc-700" />
            <span>{language === 'en' ? 'Public Release' : 'Peluncuran Publik'}</span>
          </div>
        </div>
      </div>

      {/* Planned Feature Blueprint Grid */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Upcoming Features in the Next Release' : 'Fitur yang Sedang Dipersiapkan'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            {language === 'en'
              ? 'Complete toolset for modern software engineering teams and individual developers.'
              : 'Perkakas lengkap untuk tim rekayasa perangkat lunak modern dan pengembang individu.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {plannedFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-800/60 transition-colors space-y-3"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">{feat.title}</h3>
                <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
