import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Download,
  Sparkles,
  X,
  Code,
  Globe,
  Cpu,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronDown,
} from 'lucide-react';
import {
  generateChatGptArticlePrompt,
  generateChatGptVanpediaPrompt,
  downloadArticleTemplate,
  downloadVanpediaTemplate,
} from '../utils/fileParser';
import {
  generateArticleWithAi,
  generateVanpediaWithAi,
  GeneratedArticleResult,
  GeneratedVanpediaResult,
} from '../services/aiService';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'article' | 'vanpedia';
  defaultCategory?: string;
  onApplyArticle?: (article: GeneratedArticleResult) => void;
  onApplyVanpedia?: (vanpedia: GeneratedVanpediaResult) => void;
  onApplyDirectly?: (content: string) => void;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({
  isOpen,
  onClose,
  mode,
  defaultCategory = 'Learning (AI)',
  onApplyArticle,
  onApplyVanpedia,
  onApplyDirectly,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'prompts'>('direct');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [keyPoints, setKeyPoints] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini 3.8 Flash');
  const [copied, setCopied] = useState(false);

  // Direct AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticleResult | null>(null);
  const [generatedVanpedia, setGeneratedVanpedia] = useState<GeneratedVanpediaResult | null>(null);

  if (!isOpen) return null;

  const promptData =
    mode === 'article'
      ? generateChatGptArticlePrompt({
          outlineTitle: topic || 'Arsitektur dan Prinsip Kerja Sistem',
          category,
          keyPoints: keyPoints || undefined,
          targetModel: selectedModel,
        })
      : generateChatGptVanpediaPrompt({
          termName: topic || 'Istilah Teknis',
          category,
          details: keyPoints || undefined,
          targetModel: selectedModel,
        });

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptData.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTemplate = () => {
    if (mode === 'article') {
      downloadArticleTemplate();
    } else {
      downloadVanpediaTemplate();
    }
  };

  const handleDirectGeneration = async () => {
    if (!topic.trim()) {
      setGenerationError(
        mode === 'article'
          ? 'Mohon masukkan judul atau topik artikel terlebih dahulu.'
          : 'Mohon masukkan nama istilah teknis terlebih dahulu.'
      );
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      if (mode === 'article') {
        const result = await generateArticleWithAi({
          topic: topic.trim(),
          category,
          keyPoints: keyPoints.trim() || undefined,
        });
        setGeneratedArticle(result);
      } else {
        const result = await generateVanpediaWithAi({
          termName: topic.trim(),
          category,
          details: keyPoints.trim() || undefined,
        });
        setGeneratedVanpedia(result);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerationError(err.message || 'Gagal menghasilkan konten dengan Firebase AI Logic.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyResult = () => {
    if (mode === 'article' && generatedArticle) {
      if (onApplyArticle) {
        onApplyArticle(generatedArticle);
      } else if (onApplyDirectly) {
        onApplyDirectly(generatedArticle.content);
      }
      onClose();
    } else if (mode === 'vanpedia' && generatedVanpedia) {
      if (onApplyVanpedia) {
        onApplyVanpedia(generatedVanpedia);
      } else if (onApplyDirectly) {
        onApplyDirectly(generatedVanpedia.content);
      }
      onClose();
    }
  };

  const aiDestinations = [
    {
      name: 'Gemini 3.8 Flash',
      url: promptData.geminiUrl,
      badge: 'Google',
      icon: Sparkles,
    },
    {
      name: 'ChatGPT (GPT-4o)',
      url: promptData.chatGptUrl,
      badge: 'OpenAI',
      icon: Cpu,
    },
    {
      name: 'Claude 3.7 Sonnet',
      url: promptData.claudeUrl,
      badge: 'Anthropic',
      icon: Cpu,
    },
    {
      name: 'V0 (v0.dev)',
      url: promptData.v0Url,
      badge: 'Vercel',
      icon: Code,
    },
    {
      name: 'Scira AI Search',
      url: promptData.sciraUrl,
      badge: 'Research',
      icon: Globe,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <span>
                  {mode === 'article'
                    ? 'AI Writer Assistant'
                    : 'Vanpedia AI Assistant'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-[10px] font-semibold border border-stone-300 dark:border-zinc-700">
                  Gemini
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                {mode === 'article'
                  ? 'Generate draf artikel teknis atau salin template prompt.'
                  : 'Generate entri kamus teknis yang ringkas dan jelas.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 px-4 sm:px-6 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'border-stone-900 dark:border-zinc-100 text-stone-900 dark:text-zinc-100'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate In-App</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompts')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'prompts'
                ? 'border-stone-900 dark:border-zinc-100 text-stone-900 dark:text-zinc-100'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Prompt Eksternal</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Inputs Section */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                {mode === 'article' ? 'Judul / Topik Artikel *' : 'Nama Istilah / Konsep *'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={
                  mode === 'article'
                    ? 'Contoh: Arsitektur Transformer, Sistem Cache Terdistribusi'
                    : 'Contoh: Gradient Descent, Rate Limiting, Raft Consensus'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600 focus:outline-none"
                  >
                    <option value="Learning (AI)">Learning (AI)</option>
                    <option value="Computer Systems">Computer Systems</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Biometric Security">Biometric Security</option>
                    <option value="Software Architecture">Software Architecture</option>
                    <option value="General">General</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-500 dark:text-zinc-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Model Engine
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 text-xs flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-stone-600 dark:text-zinc-300 shrink-0" />
                  <span className="font-medium">Gemini 3.8 Flash (Server-Side)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                {mode === 'article'
                  ? 'Poin Kunci / Pembahasan Tambahan (Opsional)'
                  : 'Catatan Khusus (Opsional - Dibuat Padat & Jelas)'}
              </label>
              <textarea
                rows={2}
                value={keyPoints}
                onChange={e => setKeyPoints(e.target.value)}
                placeholder={
                  mode === 'article'
                    ? 'Contoh: Sertakan formula matematis, contoh kode TypeScript, dan tautkan ke istilah [[backpropagation]]'
                    : 'Contoh: Jelaskan mekanisme kerja secara ringkas beserta 2 contoh penerapan di industri'
                }
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* TAB 1: Direct Generation */}
          {activeTab === 'direct' && (
            <div className="space-y-4 pt-1">
              {generationError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Generate Trigger Button */}
              {!generatedArticle && !generatedVanpedia && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-center space-y-3">
                  <p className="text-stone-600 dark:text-zinc-400 text-xs leading-relaxed">
                    {mode === 'article'
                      ? 'AI akan menyusun draf artikel lengkap berstandar engineering dengan judul multibahasa, ringkasan, dan implementasi kode.'
                      : 'AI akan menyusun entri kamus teknis yang ringkas, akurat, dan jelas tanpa penjelasan bertele-tele.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleDirectGeneration}
                    disabled={isGenerating}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 disabled:opacity-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sedang Menghasilkan Konten...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Hasilkan dengan AI (Gemini)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Generated Result Preview (Article) */}
              {generatedArticle && mode === 'article' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Artikel Berhasil Digenerate!</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      {generatedArticle.readTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm">
                      {generatedArticle.titleId}
                    </h4>
                    <p className="text-stone-600 dark:text-zinc-400 mt-1 line-clamp-2">
                      {generatedArticle.summaryId}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {generatedArticle.tags.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setGeneratedArticle(null)}
                      className="text-stone-500 hover:text-stone-800 dark:text-zinc-400 text-xs underline"
                    >
                      Generate Ulang
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyResult}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan ke Form</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Generated Result Preview (Vanpedia) */}
              {generatedVanpedia && mode === 'vanpedia' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Entri Vanpedia Berhasil Digenerate!</span>
                    </div>
                    {generatedVanpedia.phonetic && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        {generatedVanpedia.phonetic}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm">
                      {generatedVanpedia.termId} ({generatedVanpedia.termEn})
                    </h4>
                    <p className="text-stone-600 dark:text-zinc-400 mt-1">
                      {generatedVanpedia.definitionId}
                    </p>
                    {generatedVanpedia.formula && (
                      <p className="text-[11px] text-stone-700 dark:text-zinc-300 mt-1 font-medium">
                        Formula: {generatedVanpedia.formula}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setGeneratedVanpedia(null)}
                      className="text-stone-500 hover:text-stone-800 dark:text-zinc-400 text-xs underline"
                    >
                      Generate Ulang
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyResult}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan ke Form</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: External Prompts */}
          {activeTab === 'prompts' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Target Model AI Eksternal
                </label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-stone-400 dark:focus:ring-zinc-600 focus:outline-none"
                  >
                    <option value="Gemini 3.8 Flash">Gemini 3.8 Flash</option>
                    <option value="ChatGPT (GPT-4o)">ChatGPT (GPT-4o)</option>
                    <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
                    <option value="V0 (v0.dev)">V0 by Vercel</option>
                    <option value="Scira AI">Scira AI</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-500 dark:text-zinc-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* AI Destination Launch Grid */}
              <div>
                <div className="text-stone-700 dark:text-zinc-300 font-semibold mb-2 flex items-center justify-between">
                  <span>Buka di Platform Eksternal:</span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[11px] text-stone-500 hover:text-stone-700 dark:text-zinc-400 dark:hover:text-zinc-200 underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh Template .md</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {aiDestinations.map(dest => {
                    const IconComponent = dest.icon;
                    return (
                      <a
                        key={dest.name}
                        href={dest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 text-stone-800 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors flex flex-col justify-between gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <IconComponent className="w-3.5 h-3.5 text-stone-600 dark:text-zinc-400" />
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                            {dest.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-[11px] truncate">{dest.name}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Generated Prompt Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-stone-700 dark:text-zinc-300">
                    Prompt Otomatis (Termasuk Metadata):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-700 dark:text-zinc-300 hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-3 rounded-xl bg-stone-900 text-zinc-200 text-[11px] leading-relaxed overflow-x-auto max-h-40 border border-stone-800">
                    {promptData.prompt}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Prompt'}</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
            {activeTab === 'direct' ? (
              <button
                type="button"
                onClick={handleDirectGeneration}
                disabled={isGenerating}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isGenerating ? 'Memproses...' : 'Generate AI'}</span>
              </button>
            ) : (
              <a
                href={promptData.geminiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka di Gemini</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

