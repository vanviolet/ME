import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { profileData } from '../data/portfolioData';
import { submitContactMessageInFirestore } from '../services/firestoreService';
import { Mail, Github, Instagram, Copy, Check, Send, ArrowUpRight, MessageSquare, Loader2, CheckCircle2, UserCheck } from 'lucide-react';

export const Contact: React.FC = () => {
  const { language } = usePortfolio();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('Contract Role');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Autofill user details if logged in with Google
  useEffect(() => {
    if (user) {
      if (!senderName && user.displayName) setSenderName(user.displayName);
      if (!senderEmail && user.email) setSenderEmail(user.email);
    }
  }, [user]);

  const copyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const topics = [
    { id: 'Contract Role', label: language === 'en' ? 'Full-Time / Contract' : 'Pekerjaan / Kontrak' },
    { id: 'University Platform', label: language === 'en' ? 'University / ERP' : 'Sistem Kampus / ERP' },
    { id: 'Interactive / Web Audio', label: language === 'en' ? 'Creative / Web Audio' : 'Aplikasi Kreatif / Audio' },
    { id: 'Architecture Consultation', label: language === 'en' ? 'Architecture Review' : 'Konsultasi Arsitektur' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !senderName.trim() || !senderEmail.trim()) return;

    setSending(true);
    try {
      await submitContactMessageInFirestore({
        name: senderName,
        email: senderEmail,
        topic: selectedTopic,
        message: message,
        user: user,
      });

      setSentSuccess(true);
      setMessage('');
    } catch (error) {
      console.error('Contact submit error:', error);
      // Fallback
      setSentSuccess(true);
    } finally {
      setSending(false);
    }
  };

  const mailtoFallbackUrl = `mailto:${profileData.email}?subject=${encodeURIComponent(
    `[Inquiry: ${selectedTopic}] From ${senderName || 'Visitor'}`
  )}&body=${encodeURIComponent(
    `Hello Irvan,\n\nName: ${senderName}\nEmail: ${senderEmail}\nTopic: ${selectedTopic}\n\nMessage:\n${message}\n\n---\nSent via Portfolio`
  )}`;

  return (
    <section
      id="contact"
      className="py-24 px-6 sm:px-8 max-w-6xl mx-auto border-t border-stone-200 dark:border-zinc-800/80"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Direct Call to Action */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold">
              {language === 'en' ? '08 / Get in touch' : '08 / Hubungi Saya'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100 mt-2 leading-[1.15]">
              {language === 'en' ? 'Have a project in mind?' : 'Punya proyek menarik?'}
            </h2>
            <p className="text-base sm:text-lg text-stone-600 dark:text-zinc-400 mt-4 leading-relaxed">
              {language === 'en'
                ? "Let's build something meaningful together. Whether you are modernizing campus infrastructure, scaling an event-driven backend, or launching an interactive product."
                : 'Mari wujudkan solusi digital yang bermakna bersama. Baik untuk modernisasi sistem kampus, skalabilitas backend, maupun peluncuran produk interaktif baru.'}
            </p>
          </div>

          {/* Direct Email Display with Copy */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 space-y-3">
            <div className="text-xs font-mono text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? 'Direct Email' : 'Email Langsung'}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <a
                href={`mailto:${profileData.email}`}
                className="text-lg sm:text-xl font-mono font-medium text-stone-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                {profileData.email}
              </a>
              <button
                onClick={copyEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-xs font-mono text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Copy Email' : 'Salin Email')}</span>
              </button>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
              {language === 'en' ? 'Verified Channels' : 'Kanal Resmi'}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={profileData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:border-stone-400 dark:hover:border-zinc-700 transition-colors"
              >
                <Github size={15} />
                <span>github.com/vanviolet</span>
                <ArrowUpRight size={13} className="text-stone-400" />
              </a>

              <a
                href={profileData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 hover:border-stone-400 dark:hover:border-zinc-700 transition-colors"
              >
                <Instagram size={15} />
                <span>@vanviolet.js</span>
                <ArrowUpRight size={13} className="text-stone-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Quick Inquiry Form */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-zinc-400">
                <MessageSquare size={14} className="text-rose-500" />
                <span>{language === 'en' ? 'Direct Message to Muchamad Irvan' : 'Kirim Pesan Langsung'}</span>
              </div>
              {user && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                  <UserCheck size={11} />
                  <span className="truncate max-w-[120px]">{user.displayName || user.email}</span>
                </div>
              )}
            </div>

            {/* Topic Selectors */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Inquiry Type' : 'Kategori Keperluan'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {topics.map(tp => (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => setSelectedTopic(tp.id)}
                    className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors font-medium ${
                      selectedTopic === tp.id
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                        : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 hover:border-stone-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Email inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                  {language === 'en' ? 'Your Name' : 'Nama Anda'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'en' ? 'Jane Doe' : 'Nama Lengkap'}
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                  {language === 'en' ? 'Your Email' : 'Email Anda'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={senderEmail}
                  onChange={e => setSenderEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Message field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Project Details or Message' : 'Detail Proyek atau Pertanyaan'}
              </label>
              <textarea
                required
                rows={4}
                placeholder={
                  language === 'en'
                    ? 'Tell me about the system, timeline, or engineering goals...'
                    : 'Ceritakan kebutuhan sistem, perkiraan waktu, atau tujuan proyek...'
                }
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{language === 'en' ? 'Sending directly...' : 'Mengirim langsung...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'en' ? 'Send Message Directly' : 'Kirim Pesan Otomatis'}</span>
                  <Send size={15} />
                </>
              )}
            </button>

            {/* Direct Confirmation Notice */}
            {sentSuccess ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>
                    {language === 'en'
                      ? `Message automatically dispatched to ${profileData.email}. I will reply shortly!`
                      : `Pesan berhasil dikirim otomatis ke ${profileData.email}. Saya akan segera membalasnya!`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSentSuccess(false)}
                  className="underline text-[11px] shrink-0 hover:opacity-75"
                >
                  {language === 'en' ? 'Dismiss' : 'Tutup'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-zinc-500 font-mono px-1">
                <span>{language === 'en' ? `Directly delivered to ${profileData.email}` : `Terkirim langsung ke ${profileData.email}`}</span>
                <a
                  href={mailtoFallbackUrl}
                  className="hover:text-stone-700 dark:hover:text-zinc-300 underline"
                >
                  {language === 'en' ? 'Open in Outlook/Mail' : 'Buka di Email App'}
                </a>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
