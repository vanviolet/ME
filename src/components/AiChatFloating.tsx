import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
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
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Cpu,
  ChevronDown,
  ChevronUp,
  Brain,
  Layers,
  ArrowRight,
  ExternalLink,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { renderMarkdownWithMath } from '../lib/renderMath';
import { ALL_ALLOWED_FREE_MODELS } from '../lib/serverAiRouter';
import { usePortfolio } from '../context/PortfolioContext';
import { useNavigate } from 'react-router-dom';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  model?: string;
  provider?: string;
  thinking?: {
    steps: string[];
    executionPath?: string[];
    model?: string;
    provider?: string;
  };
}

const STORAGE_KEY = 'vanbot_chat_history_v1';
const MODEL_STORAGE_KEY = 'vanbot_selected_model_v1';

const SUGGESTED_PROMPTS = [
  {
    icon: '⚡',
    labelId: 'Keahlian & Stack Van',
    labelEn: "Van's Tech Stack & Skills",
    prompt: 'Apa saja keahlian utama, teknologi yang dikuasai, dan latar belakang pengalaman Van?',
  },
  {
    icon: '🚀',
    labelId: 'Rekomendasi Proyek Unggulan',
    labelEn: 'Featured Projects',
    prompt: 'Bisa jelaskan proyek-proyek teknologi dan AI terbaik yang ada di portofolio ini?',
  },
  {
    icon: '📖',
    labelId: 'Apa itu Vanpedia?',
    labelEn: 'What is Vanpedia?',
    prompt: 'Jelaskan apa itu fitur Vanpedia di website ini dan bagaimana konsep istilah teknologinya disusun?',
  },
  {
    icon: '🧠',
    labelId: 'Konsep AI & Arsitektur',
    labelEn: 'AI Concepts & Architecture',
    prompt: 'Bagaimana arsitektur sistem routing AI multi-tier bekerja di website ini?',
  },
];

export const AiChatFloating: React.FC = () => {
  const { language } = usePortfolio();
  const navigate = useNavigate();

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showThinkingToggle, setShowThinkingToggle] = useState<boolean>(true);
  const [showModelMenu, setShowModelMenu] = useState<boolean>(false);
  
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(MODEL_STORAGE_KEY) || 'gemini-3.8-flash';
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentThinkingStep, setCurrentThinkingStep] = useState<number>(0);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Record<string, boolean>>({});

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasNewUnread, setHasNewUnread] = useState<boolean>(false);
  const [showTeaser, setShowTeaser] = useState<boolean>(true);

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

  // Save messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Save model
  useEffect(() => {
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    } catch {}
  }, [selectedModel]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewUnread(false);
      setShowTeaser(false);
    }
  }, [isOpen, messages, isLoading]);

  // Animated thinking steps while loading
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setCurrentThinkingStep(0);
      interval = setInterval(() => {
        setCurrentThinkingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1400);
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

    // Strip markdown formatting for cleaner speech
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
      alert(language === 'en' ? 'Speech recognition is not supported in your browser.' : 'Browser tidak mendukung input suara (Speech Recognition).');
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

  // Copy message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Gather current context
      const currentPath = window.location.pathname;
      const context = `Halaman aktif: ${currentPath}. Bahasa pengguna: ${language}.`;

      const payload = {
        messages: newHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: selectedModel,
        context,
        includeThinking: showThinkingToggle,
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
        model: json.data.message.model || selectedModel,
        provider: json.data.message.provider || 'Google Gemini Free Tier',
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
        content: `⚠️ **Maaf, terjadi kendala saat menghubungi AI:**\n${err.message || 'Koneksi terputus'}.\n\n*Tips: Anda dapat memilih model lain seperti Google Gemini 3.8 Flash atau DeepSeek R1 melalui menu model di atas.*`,
        createdAt: new Date().toISOString(),
        model: selectedModel,
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

  // Handle Vanpedia and Link clicks inside rendered markdown
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
      {/* Floating Action Button & Initial Teaser */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Teaser Bubble for first-time / greeting */}
        <AnimatePresence>
          {showTeaser && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="relative max-w-xs p-3.5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-stone-900/10 dark:shadow-black/40 text-xs text-stone-700 dark:text-zinc-200"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="absolute -top-2 -right-2 p-1 bg-stone-100 dark:bg-zinc-800 text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 rounded-full border border-stone-200 dark:border-zinc-700 transition"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900 dark:text-zinc-100 mb-0.5">
                    {language === 'en' ? 'Chat with VanBot AI' : 'Tanya VanBot AI'}
                  </p>
                  <p className="text-stone-500 dark:text-zinc-400 leading-relaxed">
                    {language === 'en'
                      ? 'Ask about projects, technical articles, or Vanpedia tech glossary!'
                      : 'Diskusikan proyek, artikel teknis, dan ensiklopedia Vanpedia secara langsung.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <motion.button
          id="vanbot-floating-trigger"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setShowTeaser(false);
          }}
          className={`relative group flex items-center gap-2.5 px-4 py-3.5 rounded-full font-medium text-sm transition-all duration-300 shadow-xl ${
            isOpen
              ? 'bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-stone-900/20 dark:shadow-white/10'
              : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-rose-500/30 hover:shadow-rose-500/40 ring-4 ring-rose-500/20'
          }`}
        >
          {/* Glowing pulse ring if unopened */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 opacity-40 blur-sm group-hover:opacity-75 transition duration-500 animate-pulse -z-10" />
          )}

          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-rose-600 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-rose-600 rounded-full" />
            </div>
          )}

          <span className="hidden sm:inline font-semibold tracking-wide">
            {isOpen ? (language === 'en' ? 'Close Chat' : 'Tutup') : 'VanBot AI'}
          </span>

          {/* Unread badge */}
          {hasNewUnread && !isOpen && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 border-2 border-rose-600 animate-bounce" />
          )}
        </motion.button>
      </div>

      {/* Floating Chat Window Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl shadow-stone-900/20 dark:shadow-black/60 overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[calc(100vw-2rem)] sm:w-[680px] h-[calc(100vh-8rem)] max-h-[780px]'
                : 'w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[calc(100vh-8rem)]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-900/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-stone-900 dark:text-zinc-100">
                      VanBot AI
                    </h3>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {language === 'en' ? 'Smart AI Assistant' : 'Asisten Cerdas Portofolio'}
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1">
                {/* Model Selector Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelMenu((prev) => !prev)}
                    title="Pilih Model AI"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-stone-600 dark:text-zinc-300 bg-stone-200/60 dark:bg-zinc-800/60 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-lg transition"
                  >
                    <Cpu className="w-3 h-3 text-rose-500" />
                    <span className="max-w-[90px] truncate">{selectedModel.replace('opencode/', '').replace(':free', '')}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {/* Dropdown Menu */}
                  {showModelMenu && (
                    <div className="absolute top-full right-0 mt-1.5 w-60 p-1.5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 text-xs">
                      <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 mb-1">
                        Pilih Model Inferensi
                      </div>
                      <div className="max-h-52 overflow-y-auto space-y-0.5">
                        {ALL_ALLOWED_FREE_MODELS.map((modelName) => (
                          <button
                            key={modelName}
                            onClick={() => {
                              setSelectedModel(modelName);
                              setShowModelMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition ${
                              selectedModel === modelName
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium'
                                : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span className="truncate">{modelName}</span>
                            {selectedModel === modelName && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clear Chat */}
                <button
                  onClick={handleClearChat}
                  title="Hapus Percakapan"
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-200/50 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  title={isExpanded ? 'Kecilkan' : 'Perbesar'}
                  className="hidden sm:block p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-200/50 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Tutup Chat"
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-200/50 dark:hover:bg-zinc-800 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Feed Container */}
            <div
              onClick={handleMessageClick}
              className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm selection:bg-rose-500/20"
            >
              {/* Empty / Welcome State */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col justify-center items-center text-center p-4">
                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3 shadow-inner">
                    <Brain className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-base text-stone-900 dark:text-zinc-100 mb-1">
                    {language === 'en' ? 'Welcome to VanBot AI' : 'Selamat Datang di VanBot AI'}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-xs mb-5 leading-relaxed">
                    {language === 'en'
                      ? 'Your intelligent companion to explore Van’s portfolio, system architecture, research articles, and Vanpedia glossary.'
                      : 'Asisten cerdas untuk mengeksplorasi portofolio Van, arsitektur sistem, artikel riset AI, serta ensiklopedia Vanpedia.'}
                  </p>

                  {/* Suggestion Chips */}
                  <div className="w-full space-y-2 text-left">
                    <p className="text-[11px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                      {language === 'en' ? 'Suggested Topics:' : 'Topik yang Bisa Ditanyakan:'}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {SUGGESTED_PROMPTS.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(item.prompt)}
                          className="w-full p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-800/30 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-900/60 text-left transition flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.icon}</span>
                            <span className="text-xs text-stone-700 dark:text-zinc-300 font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400">
                              {language === 'en' ? item.labelEn : item.labelId}
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const hasThinking = Boolean(msg.thinking && msg.thinking.steps?.length);
                const isThinkingExpanded = expandedThinkingIds[msg.id];

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-sm ${
                        isUser
                          ? 'bg-stone-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
                          : 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-none shadow-md'
                          : 'bg-stone-100/90 dark:bg-zinc-800/80 border border-stone-200/80 dark:border-zinc-700/60 text-stone-800 dark:text-zinc-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {/* Thought Process Disclosure (if available) */}
                      {hasThinking && (
                        <div className="mb-2.5 pb-2 border-b border-stone-200/70 dark:border-zinc-700/60">
                          <button
                            onClick={() => toggleThinking(msg.id)}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 transition"
                          >
                            <Brain className="w-3 h-3 text-rose-500" />
                            <span>
                              {language === 'en' ? 'Thinking Process' : 'Proses Berpikir AI'} ({msg.thinking?.steps.length} langkah)
                            </span>
                            {isThinkingExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {isThinkingExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-2 p-2 rounded-lg bg-stone-200/50 dark:bg-zinc-900/60 text-[11px] space-y-1 font-mono text-stone-600 dark:text-zinc-400"
                            >
                              {msg.thinking?.steps.map((step, sIdx) => (
                                <div key={sIdx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-500">✓</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                              {msg.thinking?.provider && (
                                <div className="text-[10px] text-stone-400 dark:text-zinc-500 pt-1 border-t border-stone-300/40 dark:border-zinc-800">
                                  Provider: {msg.thinking.provider} ({msg.thinking.model})
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Message Body */}
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div
                          className="prose prose-stone dark:prose-invert prose-xs max-w-none break-words [&>p]:mb-2 [&>ul]:mb-2 [&>pre]:my-2 [&>pre]:p-2.5 [&>pre]:bg-zinc-900 [&>pre]:text-zinc-100 [&>pre]:rounded-xl [&>pre]:overflow-x-auto"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownWithMath(msg.content, { language }),
                          }}
                        />
                      )}

                      {/* Message Footer Actions (for Assistant) */}
                      {!isUser && (
                        <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-stone-200/50 dark:border-zinc-700/40 text-[10px] text-stone-400 dark:text-zinc-500">
                          <span className="font-mono">{msg.model || selectedModel}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              title="Salin Pesan"
                              className="p-1 hover:text-stone-700 dark:hover:text-zinc-200 transition rounded"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleToggleSpeak(msg.content)}
                              title="Bacakan Pesan (TTS)"
                              className="p-1 hover:text-stone-700 dark:hover:text-zinc-200 transition rounded"
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-3 h-3 text-rose-500" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Live "Sedang Berpikir" (Thinking State) Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>

                  <div className="max-w-[85%] rounded-2xl p-4 bg-stone-100 dark:bg-zinc-800/90 border border-rose-200/80 dark:border-rose-900/40 text-stone-800 dark:text-zinc-200 rounded-tl-none shadow-sm space-y-3">
                    {/* Header with Brain Icon & Glow */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <div className="relative">
                        <Brain className="w-4 h-4 animate-bounce" />
                        <span className="absolute inset-0 bg-rose-400/40 rounded-full blur-sm -z-10 animate-ping" />
                      </div>
                      <span>
                        {language === 'en'
                          ? 'VanBot is thinking & reasoning...'
                          : 'VanBot sedang menganalisis & menyusun jawaban...'}
                      </span>
                    </div>

                    {/* Step-by-step progress visual */}
                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div
                        className={`flex items-center gap-2 transition duration-300 ${
                          currentThinkingStep >= 0
                            ? 'text-stone-700 dark:text-zinc-200 font-medium'
                            : 'text-stone-400 dark:text-zinc-500'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[9px] shrink-0 font-bold">
                          ✓
                        </span>
                        <span>Menganalisis maksud pertanyaan & konteks teknis...</span>
                      </div>

                      <div
                        className={`flex items-center gap-2 transition duration-300 ${
                          currentThinkingStep >= 1
                            ? 'text-stone-700 dark:text-zinc-200 font-medium'
                            : 'text-stone-400 dark:text-zinc-500'
                        }`}
                      >
                        {currentThinkingStep >= 1 ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[9px] shrink-0 font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-[9px] shrink-0 animate-spin">
                            ◌
                          </span>
                        )}
                        <span>Menghubungkan ke basis pengetahuan portofolio & Vanpedia...</span>
                      </div>

                      <div
                        className={`flex items-center gap-2 transition duration-300 ${
                          currentThinkingStep >= 2
                            ? 'text-stone-700 dark:text-zinc-200 font-medium'
                            : 'text-stone-400 dark:text-zinc-500'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[9px] shrink-0 animate-pulse">
                          ⏳
                        </span>
                        <span>Menyusun formulasi teks presisi dengan model {selectedModel}...</span>
                      </div>
                    </div>

                    {/* Shimmer loading bar */}
                    <div className="w-full h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 rounded-full animate-[shimmer_1.5s_infinite]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input & Footer Controls */}
            <div className="p-3 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-900/70 shrink-0 space-y-2">
              <div className="relative flex items-center gap-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl p-1.5 focus-within:border-rose-500 dark:focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 transition shadow-inner">
                {/* Voice Input Button */}
                <button
                  onClick={handleToggleVoice}
                  title={isListening ? 'Hentikan Mendengarkan' : 'Input Suara'}
                  className={`p-2 rounded-xl transition ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Textarea Input */}
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    language === 'en'
                      ? 'Ask VanBot anything... (Enter to send)'
                      : 'Tanya apa saja seputar portofolio & tech... (Enter kirim)'
                  }
                  rows={1}
                  className="flex-1 bg-transparent resize-none border-none outline-none text-xs sm:text-sm text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 max-h-24 py-1"
                />

                {/* Send Button */}
                <button
                  disabled={!inputMessage.trim() || isLoading}
                  onClick={() => handleSendMessage()}
                  className={`p-2 rounded-xl flex items-center justify-center transition shadow-sm ${
                    inputMessage.trim() && !isLoading
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:opacity-90 cursor-pointer shadow-rose-500/20'
                      : 'bg-stone-200 dark:bg-zinc-700 text-stone-400 dark:text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Micro Controls */}
              <div className="flex items-center justify-between px-1 text-[10px] text-stone-400 dark:text-zinc-500">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showThinkingToggle}
                      onChange={(e) => setShowThinkingToggle(e.target.checked)}
                      className="rounded border-stone-300 text-rose-500 focus:ring-0 w-3 h-3"
                    />
                    <span>{language === 'en' ? 'Show Thinking Process' : 'Tampilkan Proses Mikir'}</span>
                  </label>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <Zap className="w-2.5 h-2.5 text-amber-500" />
                  <span>Free Cascade • Multi-Model</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
