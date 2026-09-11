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
} from 'lucide-react';
import {
  generateChatGptArticlePrompt,
  generateChatGptVanpediaPrompt,
  downloadArticleTemplate,
  downloadVanpediaTemplate,
} from '../utils/fileParser';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'article' | 'vanpedia';
  defaultCategory?: string;
  onApplyDirectly?: (content: string) => void;
}

export const AiPromptModal: React.FC<AiPromptModalProps> = ({
  isOpen,
  onClose,
  mode,
  defaultCategory = 'Learning (AI)',
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [keyPoints, setKeyPoints] = useState('');
  const [selectedModel, setSelectedModel] = useState('Gemini 3.7 Flash');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generated =
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

  const handleCopy = () => {
    navigator.clipboard.writeText(generated.prompt);
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

  const aiDestinations = [
    {
      name: 'ChatGPT (GPT-4o)',
      url: generated.chatGptUrl,
      badge: 'OpenAI',
      color: 'hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
      icon: Bot,
    },
    {
      name: 'Claude (3.7 Sonnet)',
      url: generated.claudeUrl,
      badge: 'Anthropic',
      color: 'hover:border-amber-500/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/20',
      icon: Cpu,
    },
    {
      name: 'Gemini (3.7 Flash)',
      url: generated.geminiUrl,
      badge: 'Google',
      color: 'hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20',
      icon: Sparkles,
    },
    {
      name: 'V0 (UI Prototype)',
      url: generated.v0Url,
      badge: 'Vercel',
      color: 'hover:border-stone-500/50 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60',
      icon: Code,
    },
    {
      name: 'Scira AI Search',
      url: generated.sciraUrl,
      badge: 'Research',
      color: 'hover:border-purple-500/50 hover:bg-purple-50/40 dark:hover:bg-purple-950/20',
      icon: Globe,
    },
    {
      name: 'GLM-4 (ChatGLM)',
      url: generated.glmUrl,
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
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{mode === 'article' ? 'Buat Artikel dengan AI (Multi-Model)' : 'Buat Istilah Vanpedia dengan AI'}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px]">
                  AI Co-Author
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                Pilih model AI favorit Anda (Gemini, ChatGPT, Claude, V0, Scira, GLM), hasilkan template artikel dengan metadata otomatis.
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Form Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                {mode === 'article' ? 'Judul / Garis Besar Artikel *' : 'Nama Istilah / Konsep *'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={
                  mode === 'article'
                    ? 'Contoh: Arsitektur Transformer, Attention Mechanism, atau Backpropagation'
                    : 'Contoh: Tritone Interval atau Backpropagation'
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
                  <option value="Theory Music">Theory Music</option>
                  <option value="Hobby (Music)">Hobby (Music)</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Security">Security</option>
                  <option value="Fakta Unik">Fakta Unik</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Target Model AI
                </label>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
                >
                  <option value="Gemini 3.7 Flash">Gemini 3.7 Flash</option>
                  <option value="ChatGPT (GPT-4o)">ChatGPT (GPT-4o)</option>
                  <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
                  <option value="V0 (v0.dev)">V0 by Vercel</option>
                  <option value="Scira AI">Scira AI</option>
                  <option value="GLM-4 (Zhipu)">GLM-4 (ChatGLM)</option>
                  <option value="DeepSeek R1">DeepSeek R1</option>
                </select>
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
                placeholder="Contoh: Sertakan formula matematis, contoh kode implementasi TypeScript, dan tautkan ke istilah [[tritone]]..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          {/* AI Destination Launch Grid */}
          <div>
            <div className="text-stone-700 dark:text-zinc-300 font-semibold mb-2 flex items-center justify-between">
              <span>Buka Langsung di Platform AI:</span>
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
                Prompt Otomatis (Termasuk Metadata AI Model):
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Prompt'}</span>
              </button>
            </div>
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-stone-900 text-zinc-100 text-[11px] leading-relaxed overflow-x-auto max-h-40 font-mono border border-stone-800">
                {generated.prompt}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/40">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Prompt Lengkap'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Tutup
            </button>
            <a
              href={generated.geminiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Sparkles size={14} />
              <span>Buka di Gemini 3.7 Flash</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

