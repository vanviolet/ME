import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Brain,
  ArrowRight,
  Zap,
  BookOpen,
  PlusCircle,
} from 'lucide-react';
import { renderMarkdownWithMath } from '../lib/renderMath';
import { AI_MODELS_LIST, getCleanModelName } from '../lib/models';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigate } from 'react-router-dom';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  model?: string;
  provider?: string;
  termName?: string;
  thinking?: {
    steps: string[];
    executionPath?: string[];
    model?: string;
    provider?: string;
  };
}

const STORAGE_KEY = 'vanbot_chat_history_v2';
const MODEL_STORAGE_KEY = 'vanbot_selected_model_v2';

const SUGGESTED_PROMPTS = [
  {
    labelId: 'Keahlian & Stack Van',
    labelEn: "Van's Tech Stack",
    prompt: 'Apa saja keahlian utama, teknologi yang dikuasai, dan latar belakang pengalaman Van?',
  },
  {
    labelId: 'Rekomendasi Proyek',
    labelEn: 'Featured Projects',
    prompt: 'Bisa jelaskan proyek-proyek teknologi dan AI terbaik yang ada di portofolio ini?',
  },
  {
    labelId: 'Apa itu Vanpedia?',
    labelEn: 'What is Vanpedia?',
    prompt: 'Jelaskan apa itu fitur Vanpedia di website ini dan bagaimana konsep glosarium istilahnya?',
  },
  {
    labelId: 'Arsitektur Multi-Tier AI',
    labelEn: 'AI Architecture',
    prompt: 'Bagaimana arsitektur sistem routing AI multi-tier bekerja di website ini?',
  },
];

export const AiChatFloating: React.FC = () => {
  const { language } = usePortfolio();
  const navigate = useNavigate();

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    return localStorage.getItem(MODEL_STORAGE_KEY) || 'nemotron-3-ultra';
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentThinkingStep, setCurrentThinkingStep] = useState<number>(0);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasNewUnread, setHasNewUnread] = useState<boolean>(false);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speechRef = useRef<any>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Active selected model object
  const activeModel = AI_MODELS_LIST.find((m) => m.id === selectedModelId) || AI_MODELS_LIST[0];

  // Save messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Save model
  useEffect(() => {
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, selectedModelId);
    } catch {}
  }, [selectedModelId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewUnread(false);
    }
  }, [isOpen, messages, isLoading]);

  // Close model menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    if (showModelMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelMenu]);

  // Animated thinking steps while loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setCurrentThinkingStep(0);
      interval = setInterval(() => {
        setCurrentThinkingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1200);
    } else {
      setCurrentThinkingStep(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Web Speech Synthesis (TTS)
  const handleToggleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#`_\[\]]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'en' ? 'en-US' : 'id-ID';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition (Mic Input)
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        language === 'en'
          ? 'Speech recognition is not supported in your browser.'
          : 'Browser Anda tidak mendukung input suara (Speech Recognition).'
      );
      return;
    }

    if (isListening) {
      if (speechRef.current) speechRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'en' ? 'en-US' : 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Handle custom trigger from text selection popover ("Tanyakan ke AI")
  useEffect(() => {
    const handleAskEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string; termName?: string }>;
      if (customEvent.detail?.query) {
        setIsOpen(true);
        const queryText = customEvent.detail.query;
        const targetTerm = customEvent.detail.termName;

        setTimeout(() => {
          handleSendMessage(queryText, targetTerm);
        }, 150);
      }
    };

    window.addEventListener('ask-vanbot', handleAskEvent);
    return () => {
      window.removeEventListener('ask-vanbot', handleAskEvent);
    };
  }, [messages, isLoading, selectedModelId, activeModel]);

  // Copy message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Add response directly into VanPedia create form
  const handleAddToVanpedia = (msg: ChatMessage) => {
    let termName = msg.termName || '';
    if (!termName) {
      // Deduce title/term from first line or bold markdown
      const boldMatch = msg.content.match(/\*\*([^*]+)\*\*/);
      if (boldMatch) {
        termName = boldMatch[1].trim();
      } else {
        const firstLine = msg.content.split('\n')[0].replace(/[*#`_]/g, '').trim();
        termName = firstLine && firstLine.length < 50 ? firstLine : 'Istilah Baru';
      }
    }

    // Extract core definition from first non-header paragraph
    const cleanParagraphs = msg.content
      .split(/\n\s*\n/)
      .map((p) => p.replace(/[*#`_]/g, '').trim())
      .filter((p) => p.length > 10 && !p.startsWith('#'));

    const shortDefinition = cleanParagraphs[0] || msg.content.slice(0, 250);

    navigate('/vanpedia/create', {
      state: {
        prefill: {
          termName,
          definition: shortDefinition,
          content: msg.content,
          aiModel: msg.model || activeModel.name,
          isAiGenerated: true,
        },
      },
    });

    setIsOpen(false);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string, customTermName?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    // Deduce target term if not provided
    let targetTerm = customTermName;
    if (!targetTerm) {
      const termMatch =
        query.match(/istilah(?:\steknis)?:?\s*["']?([^"'\.\?]+)["']?/i) ||
        query.match(/apa itu\s+["']?([^"'\.\?]+)["']?/i);
      if (termMatch && termMatch[1]) {
        targetTerm = termMatch[1].trim();
      }
    }

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
      termName: targetTerm,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const currentPath = window.location.pathname;
      const context = `Halaman aktif: ${currentPath}. Bahasa pengguna: ${language}. Model aktif: ${activeModel.name}.`;

      const payload = {
        messages: newHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: selectedModelId,
        context,
        includeThinking: true,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data?.message) {
        throw new Error('Respon AI tidak valid.');
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: json.data.message.content,
        createdAt: json.data.message.createdAt || new Date().toISOString(),
        model: json.data.message.model || activeModel.name,
        provider: json.data.message.provider,
        termName: targetTerm,
        thinking: json.data.thinking,
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (!isOpen) {
        setHasNewUnread(true);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Terjadi kendala saat memproses jawaban:**\n${err.message || 'Koneksi terputus'}.\n\n*Anda juga dapat mencoba model lain seperti **${AI_MODELS_LIST[0].name}** atau **DeepSeek R1** pada menu model di bawah.*`,
        createdAt: new Date().toISOString(),
        model: activeModel.name,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Clear chat
  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm(language === 'en' ? 'Clear all conversation history?' : 'Hapus semua riwayat percakapan?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Keydown handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle markdown links
  const handleMessageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a');
    if (target) {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        navigate(href);
        setIsOpen(false);
      }
    }
  };

  // Toggle thought accordion
  const toggleThinking = (id: string) => {
    setExpandedThinkingIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* Floating Action Button (Clean Minimalist Pill) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
        <motion.button
          id="vanbot-floating-trigger"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative flex items-center gap-2.5 px-4 py-3 rounded-full text-sm font-medium tracking-tight shadow-xl transition-all duration-300 ${
            isOpen
              ? 'bg-stone-900 text-stone-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-stone-900/20'
              : 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-stone-900/15 border border-stone-800 dark:border-stone-200/40 hover:shadow-2xl'
          }`}
        >
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <span className="font-semibold text-xs tracking-wide">VanBot</span>
            </div>
          )}

          {/* Unread dot */}
          {hasNewUnread && !isOpen && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </motion.button>
      </div>

      {/* Floating Chat Drawer / Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-20 right-4 sm:right-6 z-50 flex flex-col bg-white dark:bg-zinc-950 border border-stone-200/90 dark:border-zinc-800/90 rounded-2xl shadow-2xl shadow-stone-950/20 dark:shadow-black/70 overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[calc(100vw-2rem)] sm:w-[680px] h-[calc(100vh-7rem)] max-h-[780px]'
                : 'w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[calc(100vh-7rem)]'
            }`}
          >
            {/* Header: Minimalist Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-zinc-900 bg-stone-50/50 dark:bg-zinc-900/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs tracking-tight text-stone-900 dark:text-zinc-100">
                      VanBot
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Header Right Action Buttons */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleClearChat}
                  title="Clear Chat"
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-md transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  title={isExpanded ? 'Minimize' : 'Expand'}
                  className="hidden sm:block p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-md transition"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-md transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Feed (Pure Minimalist Typography, No Clunky Cards) */}
            <div
              onClick={handleMessageClick}
              className="flex-1 px-4 py-4 overflow-y-auto space-y-5 text-sm selection:bg-amber-500/20"
            >
              {/* Empty / Welcome State */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col justify-center items-center text-center px-2 py-4">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-center justify-center text-stone-700 dark:text-zinc-200 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className="font-semibold text-sm text-stone-900 dark:text-zinc-100 mb-1">
                    {language === 'en' ? 'How can I assist you today?' : 'Ada yang bisa saya bantu?'}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-xs mb-5 leading-relaxed">
                    {language === 'en'
                      ? 'Discuss portfolio projects, technical deep-dives, or browse the Vanpedia lexicon.'
                      : 'Eksplorasi proyek portofolio, artikel teknis, atau ensiklopedia Vanpedia.'}
                  </p>

                  {/* Suggestion Chips */}
                  <div className="w-full space-y-1.5">
                    {SUGGESTED_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs text-stone-700 dark:text-zinc-300 bg-stone-50 dark:bg-zinc-900/60 hover:bg-stone-100 dark:hover:bg-zinc-800/80 transition flex items-center justify-between group border border-stone-200/50 dark:border-zinc-800/60"
                      >
                        <span className="truncate">{language === 'en' ? item.labelEn : item.labelId}</span>
                        <ArrowRight className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const hasThinking = Boolean(msg.thinking && msg.thinking.steps?.length);
                const isThinkingExpanded = expandedThinkingIds[msg.id];
                const cleanName = getCleanModelName(msg.model || activeModel.name);

                return (
                  <div key={msg.id} className="space-y-1.5">
                    {isUser ? (
                      /* User Message: Clean soft pill aligned right */
                      <div className="flex justify-end">
                        <div className="bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs sm:text-[13px] leading-relaxed max-w-[85%] shadow-sm">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      /* Assistant Message: Borderless, typography-first */
                      <div className="flex flex-col space-y-1 text-stone-800 dark:text-zinc-200">
                        {/* Thinking Accordion (Minimalist inline line, NO Card) */}
                        {hasThinking && (
                          <div className="mb-1">
                            <button
                              onClick={() => toggleThinking(msg.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 transition py-0.5 px-1 rounded hover:bg-stone-100 dark:hover:bg-zinc-900"
                            >
                              <Brain className="w-3 h-3 text-amber-500" />
                              <span>
                                {language === 'en' ? 'Reasoning' : 'Proses Berpikir'} ({msg.thinking?.steps.length} langkah)
                              </span>
                              {isThinkingExpanded ? (
                                <ChevronUp className="w-3 h-3 opacity-60" />
                              ) : (
                                <ChevronDown className="w-3 h-3 opacity-60" />
                              )}
                            </button>

                            {isThinkingExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-1.5 pl-3 border-l-2 border-stone-200 dark:border-zinc-800 space-y-1 text-[11px] font-mono text-stone-500 dark:text-zinc-400"
                              >
                                {msg.thinking?.steps.map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-500 shrink-0">✓</span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Message Text Flow */}
                        <div
                          className="prose prose-stone dark:prose-invert text-xs sm:text-[13px] leading-relaxed max-w-none break-words [&>p]:mb-2.5 [&>p:last-child]:mb-0 [&>ul]:mb-2.5 [&>pre]:my-2 [&>pre]:p-3 [&>pre]:bg-zinc-900 [&>pre]:text-zinc-100 [&>pre]:rounded-xl [&>pre]:overflow-x-auto"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownWithMath(msg.content, { language }),
                          }}
                        />

                        {/* Minimalist Message Footer Actions */}
                        <div className="flex flex-col gap-2 pt-1.5 text-[11px] text-stone-400 dark:text-zinc-500">
                          {/* Dedicated Action Button: Tambahkan ke VanPedia */}
                          <div className="pt-1 border-t border-stone-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddToVanpedia(msg)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-medium transition cursor-pointer shadow-2xs group"
                            >
                              <BookOpen className="w-3 h-3 text-rose-500 group-hover:scale-110 transition-transform" />
                              <span>{language === 'en' ? 'Add to VanPedia' : 'Tambahkan ke VanPedia'}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 mr-1">
                                {cleanName}
                              </span>
                              <button
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                title="Copy response"
                                className="p-1 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded transition"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleToggleSpeak(msg.content)}
                                title="Read aloud"
                                className="p-1 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded transition"
                              >
                                {isSpeaking ? (
                                  <VolumeX className="w-3 h-3 text-rose-500" />
                                ) : (
                                  <Volume2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Minimalist Thinking Indicator (NO Card, Sleek Shimmering Text & Pulse) */}
              {isLoading && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400 font-mono">
                    <div className="relative flex items-center justify-center w-3.5 h-3.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping opacity-75" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                    <span className="shimmer-text">
                      {language === 'en'
                        ? `Reasoning with ${activeModel.name}...`
                        : `Berpikir dengan ${activeModel.name}...`}
                    </span>
                  </div>

                  {/* Clean inline thinking trace (left bordered, no card) */}
                  <div className="pl-3 border-l-2 border-amber-500/40 space-y-1 text-[11px] font-mono text-stone-400 dark:text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span>
                      <span>Menganalisis pertanyaan & konteks teknis...</span>
                    </div>
                    {currentThinkingStep >= 1 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500">✓</span>
                        <span>Menghubungkan basis pengetahuan portofolio & Vanpedia...</span>
                      </div>
                    )}
                    {currentThinkingStep >= 2 && (
                      <div className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-300 animate-pulse">
                        <span className="text-amber-500">⏳</span>
                        <span>Menyusun formulasi teks presisi...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer & Controls Toolbar */}
            <div className="p-3 border-t border-stone-100 dark:border-zinc-900 bg-stone-50/70 dark:bg-zinc-900/40 shrink-0 space-y-2">
              {/* Text Input Box */}
              <div className="relative flex items-end gap-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-1.5 focus-within:border-stone-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-stone-400/10 transition shadow-xs">
                {/* Voice Input */}
                <button
                  onClick={handleToggleVoice}
                  title={isListening ? 'Stop recording' : 'Voice input'}
                  className={`p-2 rounded-xl transition ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Textarea */}
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    language === 'en'
                      ? 'Ask VanBot anything...'
                      : 'Tanya apa saja seputar portofolio & tech...'
                  }
                  rows={1}
                  className="flex-1 bg-transparent resize-none border-none outline-none text-xs sm:text-sm text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 max-h-24 py-1 px-1"
                />

                {/* Send Button */}
                <button
                  disabled={!inputMessage.trim() || isLoading}
                  onClick={() => handleSendMessage()}
                  className={`p-2 rounded-xl flex items-center justify-center transition ${
                    inputMessage.trim() && !isLoading
                      ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 cursor-pointer shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-300 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Toolbar: MODEL SELECTOR AT THE BOTTOM */}
              <div className="flex items-center justify-between px-1 text-[11px]" ref={modelMenuRef}>
                {/* Model Selector Pill (Bottom Left/Center) */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelMenu((prev) => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 dark:text-zinc-300 bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700/60 transition"
                  >
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="font-medium tracking-tight">{activeModel.name}</span>
                    <ChevronUp className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>

                  {/* Upward Dropdown Model Menu */}
                  <AnimatePresence>
                    {showModelMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 w-64 p-1.5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 text-xs"
                      >
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 mb-1">
                          {language === 'en' ? 'Select AI Model' : 'Pilih Model AI'}
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-0.5">
                          {AI_MODELS_LIST.map((model) => {
                            const isSelected = selectedModelId === model.id;
                            return (
                              <button
                                key={model.id}
                                onClick={() => {
                                  setSelectedModelId(model.id);
                                  setShowModelMenu(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition ${
                                  isSelected
                                    ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                                    : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{model.name}</span>
                                  {model.badge && (
                                    <span
                                      className={`text-[9px] ${
                                        isSelected
                                          ? 'text-stone-300 dark:text-zinc-600'
                                          : 'text-stone-400 dark:text-zinc-500'
                                      }`}
                                    >
                                      {model.badge}
                                    </span>
                                  )}
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtitle / Hint */}
                <span className="text-[10px] text-stone-400 dark:text-zinc-500">
                  Enter ↵ to send
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
