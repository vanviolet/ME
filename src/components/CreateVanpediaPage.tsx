import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { createVanpediaTermInFirestore } from '../services/firestoreService';
import { ArrowLeft, Send, Sparkles, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { Seo } from './Seo';
import { RichEditor } from './RichEditor';
import { TemplateUploadZone } from './TemplateUploadZone';
import { AiPromptModal } from './AiPromptModal';
import { ParsedVanpediaFile } from '../utils/fileParser';

export const CreateVanpediaPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = usePortfolio();
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

  const [isAiAssisted, setIsAiAssisted] = useState(false);
  const [aiModel, setAiModel] = useState('ChatGPT (GPT-4o)');
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
          isAiAssisted,
          aiModel: isAiAssisted ? aiModel : undefined,
        },
        user.email || undefined,
        user.uid,
        isSubmittingAdmin
      );

      setFeedback(
        isSubmittingAdmin
          ? (language === 'en' ? 'Term published directly!' : 'Istilah berhasil dipublikasikan!')
          : (language === 'en' ? 'Term submitted! Awaiting verification.' : 'Istilah berhasil diajukan! Menunggu verifikasi admin.')
      );

      setTimeout(() => {
        navigate('/vanpedia');
      }, 1500);
    } catch (err: any) {
      alert('Error saving term: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="py-24 px-6 sm:px-8 max-w-3xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
          <User className="w-8 h-8" />
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
          className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/20"
        >
          <User className="w-4 h-4" />
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
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/vanpedia"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Vanpedia' : 'Kembali ke Vanpedia'}</span>
        </Link>
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors border border-rose-200/60 dark:border-rose-800/60"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Firebase AI Logic' : 'Firebase AI Logic (Gemini)'}</span>
        </button>
      </div>

      <div className="mt-6">
        <div className="border-b border-stone-100 dark:border-zinc-800 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-zinc-100 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-rose-600 dark:text-rose-500 shrink-0" />
            <span>{language === 'en' ? 'Add New Vanpedia Term' : 'Tambah Istilah Vanpedia Baru'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400 mt-1">
            {language === 'en'
              ? 'Contribute technical concepts, mathematical formulas, or architectural definitions.'
              : 'Kontribusikan konsep teknis, rumus matematika, atau definisi arsitektur.'}
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* File Template Upload Dropzone */}
        <div className="mb-8">
          <TemplateUploadZone onVanpediaLoaded={handleTemplateLoaded} type="vanpedia" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Automatic Author Badge */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-sm">
                {(user.displayName || user.email || 'A')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 dark:text-zinc-400 uppercase tracking-wider">
                  {language === 'en' ? 'Author (Auto-Assigned)' : 'Penulis (Otomatis)'}
                </p>
                <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {user.displayName || user.email?.split('@')[0]}
                  {isAdmin && (
                    <span className="ml-2 text-[10px] bg-rose-500 text-white font-mono px-2 py-0.5 rounded-full">
                      ADMIN
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-stone-500 dark:text-zinc-400">{user.email}</span>
          </div>

          {/* Title Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Term Name (Indonesian)' : 'Nama Istilah (Bahasa Indonesia)'} *
              </label>
              <input
                type="text"
                value={titleId}
                onChange={e => setTitleId(e.target.value)}
                placeholder="misal: Backpropagation"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Term Name (English - Optional)' : 'Nama Istilah (Bahasa Inggris)'}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                placeholder="e.g. Backpropagation Algorithm"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
          </div>

          {/* Category & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Category' : 'Kategori'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                <option value="Learning (AI)">Learning (AI)</option>
                <option value="Computer Systems">Computer Systems</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Biometric Security">Biometric Security</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Phonetic (Optional)' : 'Pengucapan / Fonetik'}
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={e => setPhonetic(e.target.value)}
                placeholder="e.g. /ˈtraɪtoʊn/"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
                {language === 'en' ? 'Custom Slug' : 'Slug URL Kustom'}
              </label>
              <input
                type="text"
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                placeholder="e.g. backpropagation"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-mono"
              />
            </div>
          </div>

          {/* Definition with RichEditor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              {language === 'en' ? 'Definition / Content (Markdown supported)' : 'Definisi & Penjelasan (Mendukung Markdown)'} *
            </label>
            <RichEditor
              value={definitionId}
              onChange={setDefinitionId}
              placeholder="Jelaskan definisi istilah ini secara komprehensif..."
              minHeight="250px"
            />
          </div>

          {/* Formula */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              {language === 'en' ? 'Mathematical Formula (LaTeX - Optional)' : 'Rumus Matematika / Formula (LaTeX - Opsional)'}
            </label>
            <input
              type="text"
              value={formula}
              onChange={e => setFormula(e.target.value)}
              placeholder="e.g. f(x) = \sigma(W \cdot x + b)"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-mono"
            />
          </div>

          {/* Real-World Examples */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400 mb-1">
              {language === 'en' ? 'Real-World Examples (1 per line)' : 'Contoh Penerapan Nyata (1 per baris)'}
            </label>
            <textarea
              value={examples}
              onChange={e => setExamples(e.target.value)}
              rows={3}
              placeholder={'Misal:\nPenggunaan backpropagation pada jaringan saraf tiruan\nPenerapan load balancer pada microservices'}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* AI Assistance Toggle */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-700/50 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aiAssistedTermCheck"
                checked={isAiAssisted}
                onChange={e => setIsAiAssisted(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-stone-300 dark:border-zinc-700 focus:ring-rose-500"
              />
              <label htmlFor="aiAssistedTermCheck" className="text-sm font-semibold text-stone-900 dark:text-zinc-100 cursor-pointer flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'en' ? 'Researched with AI Assistance' : 'Diriset dengan Bantuan AI'}</span>
              </label>
            </div>

            {isAiAssisted && (
              <div className="pl-7">
                <label className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 mb-1">
                  {language === 'en' ? 'AI Model Used' : 'Model AI yang Digunakan'}
                </label>
                <input
                  type="text"
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  placeholder="misal: Gemini 3.7 Flash, ChatGPT (GPT-4o), Claude 3.7 Sonnet"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <Link
              to="/vanpedia"
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'Batal'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/20"
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
              : 'Entri Vanpedia berhasil digenerate dengan Firebase AI Logic! Anda dapat meninjau, mengedit, dan mempublikasikan.'
          );
        }}
      />
    </section>
  );
};
