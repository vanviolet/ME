import React, { useState } from 'react';
import {
  Bot,
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
      color: 'hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20',
      icon: Sparkles,
    },
    {
      name: 'ChatGPT (GPT-4o)',
      url: promptData.chatGptUrl,
      badge: 'OpenAI',
      color: 'hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
      icon: Bot,
    },
    {
      name: 'Claude 3.7 Sonnet',
      url: promptData.claudeUrl,
      badge: 'Anthropic',
      color: 'hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20',
      icon: Cpu,
    },
    {
      name: 'V0 (UI Prototype)',
      url: promptData.v0Url,
      badge: 'Vercel',
      color: 'hover:border-stone-500/50 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60',
      icon: Code,
    },
    {
      name: 'Scira AI Search',
      url: promptData.sciraUrl,
      badge: 'Research',
      color: 'hover:border-purple-500/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20',
      icon: Globe,
    },
    {
      name: 'GLM-4 (ChatGLM)',
      url: promptData.glmUrl,
      badge: 'Zhipu',
      color: 'hover:border-rose-500/50 hover:bg-rose-50/40 dark:hover:bg-rose-950/20',
      icon: Bot,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <span>
                  {mode === 'article'
                    ? 'Firebase AI Logic (Gemini Writer)'
                    : 'Firebase AI Logic (Vanpedia Lexicographer)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-semibold">
                  AI Logic
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                Generate draf otomatis in-app atau ekspor prompt ke model AI lainnya.
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

        {/* Mode Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-950/20 px-6 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Wand2 size={13} />
            <span>⚡ Generate Langsung (In-App)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompts')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'prompts'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Bot size={13} />
            <span>Salin Prompt Eksternal</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
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
                    ? 'Contoh: Arsitektur Transformer, Attention Mechanism, atau Backpropagation'
                    : 'Contoh: Backpropagation Algorithm atau IEEE 754 Floating-Point'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-rose-500/30 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
                >
                  <option value="Learning (AI)">Learning (AI)</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Security">Security</option>
                  <option value="Fakta Unik">Fakta Unik</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Engine AI
                </label>
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950/60 text-stone-800 dark:text-zinc-200 text-xs flex items-center gap-2">
                  <Sparkles size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="font-semibold">Gemini 3.8 Flash (Server-Side)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                Poin Kunci / Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={keyPoints}
                onChange={e => setKeyPoints(e.target.value)}
                placeholder="Contoh: Sertakan formula matematis, contoh kode implementasi TypeScript, dan tautkan ke istilah [[backpropagation]]..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          {/* TAB 1: Direct Generation */}
          {activeTab === 'direct' && (
            <div className="space-y-4 pt-2">
              {generationError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Generate Trigger Button */}
              {!generatedArticle && !generatedVanpedia && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-950/50 border border-stone-200 dark:border-zinc-800 text-center space-y-3">
                  <p className="text-stone-600 dark:text-zinc-400">
                    Firebase AI Logic akan secara otomatis menghasilkan draf lengkap dengan judul multibahasa, ringkasan, tag, dan konten Markdown berstandar engineering.
                  </p>
                  <button
                    type="button"
                    onClick={handleDirectGeneration}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Firebase AI Logic sedang bekerja...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Hasilkan dengan Firebase AI Logic (Gemini 3.8 Flash)</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Generated Result Preview (Article) */}
              {generatedArticle && mode === 'article' && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 size={16} />
                      <span>Artikel Berhasil Digenerate!</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-mono">
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
                        className="px-2 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 text-[10px]"
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
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check size={14} />
                      <span>Terapkan ke Form Editor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Generated Result Preview (Vanpedia) */}
              {generatedVanpedia && mode === 'vanpedia' && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 size={16} />
                      <span>Entri Vanpedia Berhasil Digenerate!</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-mono">
                      {generatedVanpedia.phonetic}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm">
                      {generatedVanpedia.termId} ({generatedVanpedia.termEn})
                    </h4>
                    <p className="text-stone-600 dark:text-zinc-400 mt-1">
                      {generatedVanpedia.definitionId}
                    </p>
                    {generatedVanpedia.formula && (
                      <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400 mt-1">
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
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check size={14} />
                      <span>Terapkan ke Form Editor</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: External Prompts */}
          {activeTab === 'prompts' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Target Model AI Eksternal
                </label>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
                >
                  <option value="Gemini 3.8 Flash">Gemini 3.8 Flash</option>
                  <option value="ChatGPT (GPT-4o)">ChatGPT (GPT-4o)</option>
                  <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
                  <option value="V0 (v0.dev)">V0 by Vercel</option>
                  <option value="Scira AI">Scira AI</option>
                  <option value="GLM-4 (Zhipu)">GLM-4 (ChatGLM)</option>
                </select>
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
                    <Download size={11} />
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
                        className={`p-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/60 dark:bg-zinc-950/40 text-stone-800 dark:text-zinc-200 transition-all flex flex-col justify-between gap-1.5 ${dest.color}`}
                      >
                        <div className="flex items-center justify-between">
                          <IconComponent size={14} className="text-rose-600 dark:text-rose-400" />
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                            {dest.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-[11px] truncate">{dest.name}</span>
                          <ExternalLink size={10} className="text-stone-400 shrink-0" />
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
                    className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Prompt'}</span>
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-3.5 rounded-xl bg-stone-900 text-zinc-100 text-[11px] leading-relaxed overflow-x-auto max-h-40 font-mono border border-stone-800">
                    {promptData.prompt}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/40">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Prompt'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
            {activeTab === 'direct' ? (
              <button
                type="button"
                onClick={handleDirectGeneration}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{isGenerating ? 'Memproses...' : 'Generate AI'}</span>
              </button>
            ) : (
              <a
                href={promptData.geminiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Sparkles size={14} />
                <span>Buka di Gemini Web</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
