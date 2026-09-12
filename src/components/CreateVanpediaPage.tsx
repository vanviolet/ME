import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { createVanpediaTermInFirestore } from '../services/firestoreService';
import { ArrowLeft, Send, Sparkles, BookOpen, Globe, Lock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Seo } from './Seo';
import { RichEditor } from './RichEditor';
import { TemplateUploadZone } from './TemplateUploadZone';
import { AiPromptModal } from './AiPromptModal';
import { ParsedVanpediaFile } from '../utils/fileParser';

export const CreateVanpediaPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = usePortfolio();
  const { user, isAdmin, adminEmail, signInWithGoogle } = useAuth();

  const [titleId, setTitleId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [category, setCategory] = useState('Learning (AI)');
  const [phonetic, setPhonetic] = useState('');
  const [definitionId, setDefinitionId] = useState('');
  const [definitionEn, setDefinitionEn] = useState('');
  const [formula, setFormula] = useState('');
  const [examples, setExamples] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const [isAiAssisted, setIsAiAssisted] = useState(false);
  const [aiModel, setAiModel] = useState('Gemini 3.8 Flash');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTemplateLoaded = (parsed: ParsedVanpediaFile) => {
    if (parsed.title || parsed.termId) setTitleId(parsed.title || parsed.termId || '');
    if (parsed.category) setCategory(parsed.category);
    if (parsed.phonetic) setPhonetic(parsed.phonetic);
    if (parsed.definition) setDefinitionId(parsed.definition);
    if (parsed.formula) setFormula(parsed.formula);
    if (parsed.examples && parsed.examples.length > 0) setExamples(parsed.examples.join('\n'));
    if (parsed.isAiAssisted !== undefined) setIsAiAssisted(parsed.isAiAssisted);
    if (parsed.aiModel) {
      setIsAiAssisted(true);
      setAiModel(parsed.aiModel);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (confirm(language === 'en' ? 'Please sign in with Google to submit a term.' : 'Silakan masuk dengan Google terlebih dahulu untuk menambahkan istilah.')) {
        signInWithGoogle();
      }
      return;
    }

    if (!titleId.trim()) {
      alert(language === 'en' ? 'Please enter a term title.' : 'Mohon masukkan nama istilah.');
      return;
    }
    if (!definitionId.trim()) {
      alert(language === 'en' ? 'Please enter a definition.' : 'Mohon isi definisi atau penjelasan istilah.');
      return;
    }

    setSubmitting(true);
    try {
      const generatedSlug = (slugInput.trim() || titleEn.trim() || titleId.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const isSubmittingAdmin = user.email === adminEmail;
      const parsedExamples = examples
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const authorName = user.displayName || user.email?.split('@')[0] || 'Contributor';

      await createVanpediaTermInFirestore(
        {
          slug: generatedSlug,
          title: {
            id: titleId.trim(),
            en: titleEn.trim() || titleId.trim(),
          },
          category,
          phonetic: phonetic.trim() || undefined,
          definition: {
            id: definitionId.trim(),
            en: definitionEn.trim() || definitionId.trim(),
          },
          formula: formula.trim() || undefined,
          examples: {
            id: parsedExamples.length > 0 ? parsedExamples : ['Contoh penerapan istilah ini.'],
            en: parsedExamples.length > 0 ? parsedExamples : ['Real-world application example.'],
          },
          authorName,
          authorEmail: user.email || undefined,
          authorId: user.uid,
          visibility,
          isAiAssisted,
          aiModel: isAiAssisted ? aiModel : undefined,
        },
        user.email || undefined,
        user.uid,
        isSubmittingAdmin
      );

      setFeedback(
        visibility === 'public'
          ? (language === 'en'
              ? 'Public term published! Visible to everyone and visitors.'
              : 'Istilah publik berhasil dipublikasikan! Dapat dilihat oleh semua orang dan pengunjung.')
          : (language === 'en'
              ? 'Private term saved! Only visible in your personal account.'
              : 'Istilah privat berhasil disimpan! Hanya dapat dilihat di akun Anda.')
      );

      setTimeout(() => {
        navigate('/vanpedia');
      }, 1200);
    } catch (err: any) {
      alert('Error saving term: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 flex items-center justify-center mb-6 border border-stone-200 dark:border-zinc-700">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 mb-3">
          {language === 'en' ? 'Authentication Required' : 'Autentikasi Diperlukan'}
        </h1>
        <p className="text-stone-600 dark:text-zinc-400 mb-8 max-w-md text-sm leading-relaxed">
          {language === 'en'
            ? 'You need to sign in with your Google account to add new Vanpedia terms.'
            : 'Anda perlu masuk dengan akun Google untuk menambahkan istilah baru ke Vanpedia.'}
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span>{language === 'en' ? 'Sign In with Google' : 'Masuk dengan Google'}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <Seo
        title={language === 'en' ? 'Add Term | Vanpedia' : 'Tambah Istilah | Vanpedia'}
        description="Add a technical term to Vanpedia knowledge base."
      />

      {/* Header & Back Link */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/vanpedia"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Vanpedia' : 'Kembali ke Vanpedia'}</span>
        </Link>
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-900 dark:text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-stone-200 dark:border-zinc-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-stone-700 dark:text-zinc-300" />
          <span>{language === 'en' ? 'Generate with AI Logic' : 'Buat dengan AI Logic (Gemini)'}</span>
        </button>
      </div>

      <div className="mt-4">
        <div className="border-b border-stone-200 dark:border-zinc-800 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-stone-800 dark:text-zinc-200 shrink-0" />
            <span>{language === 'en' ? 'Add New Vanpedia Term' : 'Tambah Istilah Vanpedia Baru'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-2">
            {language === 'en'
              ? 'Contribute concise, clear technical concepts and formulas to the engineering glossary.'
              : 'Kontribusikan konsep teknis yang ringkas, padat, dan jelas ke dalam kamus rekayasa perangkat lunak.'}
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* File Template Upload Dropzone */}
        <div className="mb-8">
          <TemplateUploadZone onVanpediaLoaded={handleTemplateLoaded} type="vanpedia" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Author Badge & Visibility Settings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-bold flex items-center justify-center text-sm">
                {(user.displayName || user.email || 'A')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-zinc-400 uppercase tracking-wider">
                  {language === 'en' ? 'Author' : 'Penulis'}
                </p>
                <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                  {user.displayName || user.email?.split('@')[0]}
                  {isAdmin && (
                    <span className="text-[10px] bg-stone-800 dark:bg-zinc-700 text-white px-2 py-0.5 rounded-full font-medium">
                      ADMIN
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Visibility Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400">
                {language === 'en' ? 'Visibility:' : 'Visibilitas:'}
              </span>
              <div className="inline-flex rounded-xl bg-stone-200/70 dark:bg-zinc-800 p-1 border border-stone-300/60 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    visibility === 'public'
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Public (All Users & Guests)' : 'Publik (Semua Orang)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    visibility === 'private'
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Private (Only Me)' : 'Privat (Hanya Saya)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Title Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Term Name (Indonesian)' : 'Nama Istilah (Bahasa Indonesia)'} *
              </label>
              <input
                type="text"
                value={titleId}
                onChange={e => setTitleId(e.target.value)}
                placeholder="misal: Gradient Descent"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Term Name (English - Optional)' : 'Nama Istilah (Bahasa Inggris - Opsional)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. Gradient Descent Algorithm"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
              />
            </div>
          </div>

          {/* Category & Slug & Phonetic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Category' : 'Kategori'}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
                >
                  <option value="Learning (AI)">Learning (AI)</option>
                  <option value="Computer Systems">Computer Systems</option>
                  <option value="Database Systems">Database Systems</option>
                  <option value="Biometric Security">Biometric Security</option>
                  <option value="Software Architecture">Software Architecture</option>
                  <option value="General">General</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500 dark:text-zinc-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Phonetic (Optional)' : 'Pengucapan / Fonetik'}
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={e => setPhonetic(e.target.value)}
                placeholder="e.g. /ˈɡreɪdiənt dɪˈsɛnt/"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
                {language === 'en' ? 'Custom URL Slug' : 'Slug URL Kustom'}
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                placeholder="e.g. gradient-descent"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
              />
            </div>
          </div>

          {/* Definition with RichEditor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Definition / Content (Markdown supported)' : 'Definisi & Penjelasan (Mendukung Markdown)'} *
            </label>
            <RichEditor
              value={definitionId}
              onChange={setDefinitionId}
              placeholder="Jelaskan definisi istilah ini secara ringkas, padat, dan jelas..."
              minHeight="250px"
            />
          </div>

          {/* Formula */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Mathematical Formula (LaTeX - Optional)' : 'Rumus Matematika / Formula (LaTeX - Opsional)'}
            </label>
            <input
              type="text"
              value={formula}
              onChange={e => setFormula(e.target.value)}
              placeholder="e.g. \theta_{t+1} = \theta_t - \eta \nabla L(\theta_t)"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
            />
          </div>

          {/* Real-World Examples */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 mb-1.5">
              {language === 'en' ? 'Real-World Examples (1 per line)' : 'Contoh Penerapan Nyata (1 per baris)'}
            </label>
            <textarea
              value={examples}
              onChange={e => setExamples(e.target.value)}
              rows={3}
              placeholder={'Misal:\nOptimasi bobot model deep learning saat proses training\nPenyesuaian parameter regresi linier pada dataset besar'}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
            />
          </div>

          {/* AI Assistance Toggle */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aiAssistedTermCheck"
                checked={isAiAssisted}
                onChange={e => setIsAiAssisted(e.target.checked)}
                className="w-4 h-4 text-stone-900 dark:text-zinc-100 rounded border-stone-300 dark:border-zinc-700 focus:ring-stone-500"
              />
              <label htmlFor="aiAssistedTermCheck" className="text-sm font-semibold text-stone-900 dark:text-zinc-100 cursor-pointer flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-stone-600 dark:text-zinc-400" />
                <span>{language === 'en' ? 'Assisted with AI' : 'Diriset dengan Bantuan AI'}</span>
              </label>
            </div>

            {isAiAssisted && (
              <div className="pl-7">
                <label className="block text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'AI Model Used' : 'Model AI yang Digunakan'}
                </label>
                <input
                  type="text"
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  placeholder="misal: Gemini 3.8 Flash, ChatGPT (GPT-4o), Claude 3.7 Sonnet"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600"
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-stone-200 dark:border-zinc-800">
            <Link
              to="/vanpedia"
              className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 disabled:opacity-50 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? (language === 'en' ? 'Submitting...' : 'Mengajukan...')
                  : (language === 'en' ? 'Add Term' : 'Tambah Istilah')}
              </span>
            </button>
          </div>
        </form>
      </div>

      <AiPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        mode="vanpedia"
        defaultCategory={category}
        onApplyVanpedia={(van) => {
          handleTemplateLoaded({
            title: van.termId,
            termId: van.termId,
            category: van.category,
            phonetic: van.phonetic,
            definition: van.content || van.definitionId,
            formula: van.formula,
            examples: van.examples,
            isAiAssisted: true,
            aiModel: van.aiModel,
          });
          setFeedback(
            language === 'en'
              ? 'Vanpedia entry generated with Firebase AI Logic! You can review, edit, and publish.'
              : 'Entri Vanpedia berhasil dibuat dengan Firebase AI Logic! Anda dapat meninjau, mengedit, dan mempublikasikan.'
          );
        }}
      />
    </section>
  );
};

