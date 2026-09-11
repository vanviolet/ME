import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  Mail,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { submitContentReportInFirestore } from '../services/firestoreService';
import { ADMIN_EMAIL } from '../lib/firebase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'article' | 'vanpedia' | 'question';
  contentSlug: string;
  contentTitle: string;
}

type ReportReasonKey =
  | 'incorrect_info'
  | 'math_error'
  | 'typo'
  | 'copyright'
  | 'inappropriate'
  | 'other';

interface ReasonOption {
  key: ReportReasonKey;
  labelId: string;
  labelEn: string;
  descId: string;
  descEn: string;
}

const REPORT_REASONS: ReasonOption[] = [
  {
    key: 'incorrect_info',
    labelId: 'Informasi Keliru / Tidak Akurat',
    labelEn: 'Inaccurate / Misleading Information',
    descId: 'Ada penjelasan konsep teknis atau fakta yang salah.',
    descEn: 'A technical explanation or factual detail is incorrect.',
  },
  {
    key: 'math_error',
    labelId: 'Kesalahan Formula Matematis / Bug Kode',
    labelEn: 'Mathematical Formula Error / Code Bug',
    descId: 'Rumus matematika LaTeX, simbol, atau snippet kode mengandung eror.',
    descEn: 'LaTeX formula, mathematical symbol, or code snippet has a defect.',
  },
  {
    key: 'typo',
    labelId: 'Typo / Kesalahan Bahasa & Format',
    labelEn: 'Typo / Grammar & Formatting Issue',
    descId: 'Ejaan kata, istilah serapan, atau render simbol bermasalah.',
    descEn: 'Spelling, translation nuance, or visual rendering glitches.',
  },
  {
    key: 'copyright',
    labelId: 'Hak Cipta / Atribusi',
    labelEn: 'Copyright / Attribution Issue',
    descId: 'Konten memerlukan atribusi sumber yang lebih tepat.',
    descEn: 'Content requires proper source credit or attribution.',
  },
  {
    key: 'inappropriate',
    labelId: 'Konten Tidak Sesuai / Kedaluwarsa',
    labelEn: 'Outdated / Inappropriate Content',
    descId: 'Materi sudah tidak relevan dengan standar industri terbaru.',
    descEn: 'Material is obsolete or violates guidelines.',
  },
  {
    key: 'other',
    labelId: 'Lainnya',
    labelEn: 'Other',
    descId: 'Alasan lain yang perlu ditinjau oleh tim kurator.',
    descEn: 'Other issues requiring manual reviewer attention.',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentSlug,
  contentTitle,
}) => {
  const { language } = usePortfolio();
  const { user } = useAuth();

  const [selectedReason, setSelectedReason] = useState<ReportReasonKey>('incorrect_info');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState(user?.displayName || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentReasonObj = REPORT_REASONS.find(r => r.key === selectedReason);
  const currentReasonLabel = language === 'en' ? currentReasonObj?.labelEn : currentReasonObj?.labelId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError(language === 'en' ? 'Please provide details about the issue.' : 'Mohon jelaskan detail masalah yang Anda temukan.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitContentReportInFirestore({
        contentType,
        contentSlug,
        contentTitle,
        reason: selectedReason,
        reasonLabel: currentReasonLabel,
        details: details.trim(),
        reporterName: reporterName.trim() || user?.displayName || 'Anonymous Reader',
        reporterEmail: reporterEmail.trim() || user?.email || undefined,
        reporterId: user?.uid || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setDetails('');
      }, 2500);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setError(language === 'en' ? 'Failed to submit report. Please try again or email directly.' : 'Gagal mengirim laporan. Silakan coba lagi atau kirim email langsung.');
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoUrl = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    `[Report] ${contentType.toUpperCase()}: ${contentTitle}`
  )}&body=${encodeURIComponent(
    `Jenis Masalah: ${currentReasonLabel}\nKonten: ${contentTitle} (${window.location.href})\n\nDetail Masalah:\n${details}\n\nPengirim: ${reporterName} (${reporterEmail})`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{language === 'en' ? 'Report Inaccuracy or Issue' : 'Laporkan Kesalahan atau Ketidaksesuaian'}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5 truncate max-w-sm sm:max-w-md">
                {contentType.toUpperCase()}: <span className="font-semibold text-stone-700 dark:text-zinc-300">{contentTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-base font-bold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Thank you! Report Received' : 'Terima kasih! Laporan Berhasil Dikirim'}
            </h4>
            <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              {language === 'en'
                ? `Your report has been securely saved and dispatched to ${ADMIN_EMAIL} for verification and correction.`
                : `Laporan Anda telah tersimpan dan terkirim otomatis ke ${ADMIN_EMAIL} untuk segera ditinjau dan diperbaiki.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/20 text-stone-700 dark:text-zinc-300 text-[11px] leading-relaxed flex items-start gap-2.5">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span>
                  {language === 'en'
                    ? `Noticed an error in math symbols, conceptual explanation, or code? Submit your report below to notify the maintainer directly at ${ADMIN_EMAIL}.`
                    : `Menemukan kesalahan formula, simbol matematika, atau ketidaktepatan penjelasan? Kirimkan laporan agar langsung masuk ke antrian perbaikan admin di ${ADMIN_EMAIL}.`}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Select Reason */}
            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-2">
                {language === 'en' ? 'Reason for Report *' : 'Kategori Masalah *'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REPORT_REASONS.map(r => {
                  const isSelected = selectedReason === r.key;
                  return (
                    <button
                      type="button"
                      key={r.key}
                      onClick={() => setSelectedReason(r.key)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/40 text-stone-700 dark:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-bold text-xs">{language === 'en' ? r.labelEn : r.labelId}</span>
                      <span className="text-[10px] text-stone-500 dark:text-zinc-400 mt-1 line-clamp-1">
                        {language === 'en' ? r.descEn : r.descId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details Description */}
            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                {language === 'en' ? 'Detailed Explanation of the Issue *' : 'Uraian / Penjelasan Kesalahan *'}
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'E.g., In section 2, the formula uses $W \\cdot x$ but the term definition states a different variable...'
                    : 'Contoh: Pada bagian 2, simbol matematika \\nabla_W L penjelasannya terpotong atau formula kurang presisi...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono text-xs"
              />
            </div>

            {/* Reporter Info (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Your Name (Optional)' : 'Nama Anda (Opsional)'}
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Anonymous Reader"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  {language === 'en' ? 'Your Email (Optional)' : 'Email Anda (Opsional)'}
                </label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={e => setReporterEmail(e.target.value)}
                  placeholder="reader@domain.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-zinc-800">
              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline"
              >
                <Mail size={12} />
                <span>{language === 'en' ? 'Send via Email Client' : 'Kirim via Email Biasa'}</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>{language === 'en' ? 'Sending...' : 'Mengirim...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>{language === 'en' ? 'Submit Report' : 'Kirim Laporan'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
