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
  PlusCircle,
  Loader2,
  Languages,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { renderMarkdownWithMath } from '../lib/renderMath';
import { AI_MODELS_LIST } from '../lib/models';
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

  // Modal & View State
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

  // Speech to Text (STT) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechLanguage, setSpeechLanguage] = useState<'id' | 'en'>(language === 'en' ? 'en' : 'id');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechDuration, setSpeechDuration] = useState<number>(0);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

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
  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Active selected model object
  const activeModel = AI_MODELS_LIST.find((m) => m.id === selectedModelId) || AI_MODELS_LIST[0];

  // Sync language selection when main language changes
  useEffect(() => {
    setSpeechLanguage(language === 'en' ? 'en' : 'id');
  }, [language]);

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Save model selection
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

  // Web Speech Synthesis (Text-to-Speech)
  const handleToggleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#`_\[\]]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speechLanguage === 'en' ? 'en-US' : 'id-ID';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop all active voice capture methods
  const stopAllListening = () => {
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsListening(false);
    setInterimTranscript('');
    setSpeechDuration(0);
  };

  // Clean up listening on unmount
  useEffect(() => {
    return () => {
      stopAllListening();
    };
  }, []);

  // Gemini Multimodal Audio Transcription fallback
  const transcribeAudioWithGemini = async (audioBlob: Blob) => {
    try {
      setIsTranscribingAudio(true);
      setSpeechError(null);

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        try {
          const res = await fetch('/api/ai/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: audioBlob.type || 'audio/webm',
              language: speechLanguage,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Transcribe failed: ${res.status}`);
          }

          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            const newText = data.transcript.trim();
            setInputMessage((prev) => (prev ? `${prev} ${newText}` : newText));
            setTimeout(() => inputRef.current?.focus(), 150);
          } else {
            setSpeechError(
              speechLanguage === 'en'
                ? 'No clear speech detected. Please speak closer to your microphone.'
                : 'Tidak ada suara yang terdeteksi jelas. Silakan coba bicara lebih dekat ke mikrofon.'
            );
          }
        } catch (err: any) {
          console.error('Audio transcribe error:', err);
          setSpeechError(err.message || 'Gagal mentranskripsi rekaman suara.');
        } finally {
          setIsTranscribingAudio(false);
        }
      };
    } catch (err: any) {
      console.error('FileReader error:', err);
      setIsTranscribingAudio(false);
      setSpeechError('Gagal memproses file rekaman.');
    }
  };

  // Fallback Audio Recording via MediaRecorder
  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1000) {
          transcribeAudioWithGemini(audioBlob);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setIsListening(true);
      setSpeechDuration(0);
      setSpeechError(null);

      speechTimerRef.current = setInterval(() => {
        setSpeechDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setIsListening(false);
      setSpeechError(
        speechLanguage === 'en'
          ? 'Microphone permission denied. Please enable mic access in your browser settings.'
          : 'Izin mikrofon tidak diberikan. Silakan aktifkan izin mikrofon pada browser Anda.'
      );
    }
  };

  // Main Speech to Text Toggle Handler
  const handleToggleVoice = () => {
    setSpeechError(null);

    if (isListening) {
      stopAllListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // If Web Speech API is supported in this browser
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = speechLanguage === 'en' ? 'en-US' : 'id-ID';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechDuration(0);
          setSpeechError(null);

          if (speechTimerRef.current) clearInterval(speechTimerRef.current);
          speechTimerRef.current = setInterval(() => {
            setSpeechDuration((prev) => prev + 1);
          }, 1000);
        };

        recognition.onresult = (event: any) => {
          let interimStr = '';
          let finalStr = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalStr += transcript;
            } else {
              interimStr += transcript;
            }
          }

          if (finalStr.trim()) {
            setInputMessage((prev) => (prev ? `${prev.trim()} ${finalStr.trim()}` : finalStr.trim()));
            setInterimTranscript('');
          } else {
            setInterimTranscript(interimStr);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event error:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError(
              speechLanguage === 'en'
                ? 'Microphone access was blocked. Please click the lock/settings icon in the browser URL bar to allow microphone.'
                : 'Akses mikrofon diblokir. Silakan klik ikon gembok di bilah alamat browser untuk mengizinkan mikrofon.'
            );
            stopAllListening();
          } else if (event.error === 'network') {
            stopAllListening();
            startMediaRecorderFallback();
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
          if (speechTimerRef.current) {
            clearInterval(speechTimerRef.current);
            speechTimerRef.current = null;
          }
        };

        speechRecognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.warn('SpeechRecognition start failed, trying fallback...', err);
        startMediaRecorderFallback();
      }
    } else {
      // Browser does not have Web Speech API -> Use MediaRecorder + Gemini Audio
      startMediaRecorderFallback();
    }
  };

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle immediate send on speech completion
  const handleVoiceSendNow = () => {
    const combined = (inputMessage + (interimTranscript ? ` ${interimTranscript}` : '')).trim();
    stopAllListening();
    if (combined) {
      handleSendMessage(combined);
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

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Add response directly into Vanpedia create form
  const handleAddToVanpedia = (msg: ChatMessage) => {
    let termName = msg.termName || '';
    if (!termName) {
      const boldMatch = msg.content.match(/\*\*([^*]+)\*\*/);
      if (boldMatch) {
        termName = boldMatch[1].trim();
      } else {
        const firstLine = msg.content.split('\n')[0].replace(/[*#`_]/g, '').trim();
        termName = firstLine && firstLine.length < 50 ? firstLine : 'Istilah Baru';
      }
    }

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
    setInterimTranscript('');
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
              <span className="font-semibold text-xs tracking-wide">Vanviolet AI</span>
            </div>
          )}

          {hasNewUnread && !isOpen && (
            <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Main Chat Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="vanbot-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-22 right-4 sm:right-6 z-50 flex flex-col bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[94vw] sm:w-[680px] md:w-[760px] h-[86vh] max-h-[900px]'
                : 'w-[92vw] sm:w-[420px] md:w-[460px] h-[580px] max-h-[82vh]'
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-stone-50/80 dark:bg-zinc-900/60 border-b border-stone-100 dark:border-zinc-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-xs text-stone-900 dark:text-zinc-100">
                      Vanviolet AI
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-200/60 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 rounded-md">
                      v2.5
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-zinc-400 truncate max-w-[200px]">
                    {language === 'en' ? 'Live Voice & Multi-Tier AI' : 'Suara Langsung & Multi-Tier AI'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-stone-400 dark:text-zinc-500">
                <button
                  onClick={handleClearChat}
                  title={language === 'en' ? 'Clear conversation' : 'Hapus percakapan'}
                  className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-zinc-800 hover:text-stone-700 dark:hover:text-zinc-300 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  title={isExpanded ? 'Minimize' : 'Maximize'}
                  className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-zinc-800 hover:text-stone-700 dark:hover:text-zinc-300 transition"
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title={language === 'en' ? 'Close' : 'Tutup'}
                  className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-zinc-800 hover:text-stone-700 dark:hover:text-zinc-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Notification Banner if any */}
            {speechError && (
              <div className="px-3.5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2 animate-fadeIn shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] leading-relaxed">{speechError}</div>
                <button
                  onClick={() => setSpeechError(null)}
                  className="text-amber-500 hover:text-amber-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Messages Container */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm text-stone-800 dark:text-zinc-200"
              onClick={handleMessageClick}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center px-4 py-8 space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 flex items-center justify-center text-stone-900 dark:text-zinc-100 shadow-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-[280px]">
                    <h4 className="font-semibold text-stone-900 dark:text-zinc-100 text-sm">
                      {language === 'en' ? 'How can I assist you today?' : 'Ada yang bisa saya bantu hari ini?'}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-relaxed">
                      {language === 'en'
                        ? 'Type or speak via voice microphone to ask about Van, tech stack, Vanpedia, or code.'
                        : 'Ketik atau bicara langsung lewat mikrofon untuk bertanya tentang proyek Van, stack teknologi, Vanpedia, atau kode.'}
                    </p>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="w-full grid grid-cols-1 gap-2 pt-2 text-left">
                    {SUGGESTED_PROMPTS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.prompt)}
                        className="p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800/80 hover:border-stone-400 dark:hover:border-zinc-600 bg-stone-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition flex items-center justify-between group cursor-pointer text-[11px]"
                      >
                        <span className="font-medium text-stone-700 dark:text-zinc-300 group-hover:text-stone-900 dark:group-hover:text-white">
                          {language === 'en' ? item.labelEn : item.labelId}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isThinkingExpanded = Boolean(expandedThinkingIds[msg.id]);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`relative max-w-[85%] rounded-2xl p-3 shadow-xs ${
                          isUser
                            ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'bg-stone-100/90 dark:bg-zinc-900/90 border border-stone-200/60 dark:border-zinc-800 text-stone-800 dark:text-zinc-200'
                        }`}
                      >
                        {/* Thinking Accordion for AI Assistant */}
                        {!isUser && msg.thinking && msg.thinking.steps && msg.thinking.steps.length > 0 && (
                          <div className="mb-2.5 pb-2 border-b border-stone-200/60 dark:border-zinc-800">
                            <button
                              onClick={() => toggleThinking(msg.id)}
                              className="w-full flex items-center justify-between text-[10px] font-medium text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 transition cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <Brain className="w-3 h-3 text-amber-500" />
                                <span>
                                  {language === 'en' ? 'Reasoning Process' : 'Proses Berpikir Model'}
                                </span>
                              </span>
                              {isThinkingExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>

                            <AnimatePresence>
                              {isThinkingExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 space-y-1 text-[10px] text-stone-600 dark:text-zinc-400 bg-white/60 dark:bg-zinc-950/60 p-2 rounded-lg border border-stone-200/40 dark:border-zinc-800/60 font-mono"
                                >
                                  {msg.thinking.steps.map((step, sIdx) => (
                                    <div key={sIdx} className="flex items-start gap-1.5">
                                      <span className="text-emerald-500">✓</span>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                  {msg.thinking.executionPath && (
                                    <div className="pt-1 text-[9px] text-stone-400 dark:text-zinc-500 border-t border-stone-200/40 dark:border-zinc-800/40">
                                      Path: {msg.thinking.executionPath.join(' → ')}
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Content */}
                        <div
                          className={`prose prose-sm max-w-none text-xs sm:text-sm leading-relaxed break-words ${
                            isUser
                              ? 'prose-invert text-white dark:text-zinc-900 [&_p]:text-white dark:[&_p]:text-zinc-900'
                              : 'dark:prose-invert text-stone-800 dark:text-zinc-200'
                          } [&>p]:mb-2 [&>p:last-child]:mb-0 [&>h1]:text-base [&>h1]:font-bold [&>h1]:my-2 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:my-2 [&>h3]:text-xs [&>h3]:font-bold [&>h3]:my-1.5 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:my-2 [&>li]:my-0.5 [&_strong]:font-semibold [&_hr]:my-2 [&_hr]:border-stone-200/60 dark:[&_hr]:border-zinc-800 [&_blockquote]:border-l-2 [&_blockquote]:border-stone-300 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_pre]:bg-stone-900 dark:[&_pre]:bg-black [&_pre]:text-stone-100 [&_pre]:p-2.5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:text-[11px] [&_pre]:my-2 [&_code]:font-mono [&_code]:text-[11px] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded ${
                            isUser
                              ? '[&_code]:bg-white/20 dark:[&_code]:bg-black/15'
                              : '[&_code]:bg-stone-200/70 dark:[&_code]:bg-zinc-800 text-stone-900 dark:text-zinc-100'
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdownWithMath(msg.content, { language }),
                          }}
                        />

                        {/* Footer toolbar inside message */}
                        <div
                          className={`flex items-center justify-between gap-2 mt-2 pt-1.5 text-[9px] border-t ${
                            isUser
                              ? 'border-white/10 text-white/60 dark:border-black/10 dark:text-zinc-500'
                              : 'border-stone-200/40 dark:border-zinc-800 text-stone-400 dark:text-zinc-500'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {!isUser && msg.model && (
                              <span className="font-mono font-medium px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400">
                                {msg.model}
                              </span>
                            )}
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* TTS Listen Button */}
                            {!isUser && (
                              <button
                                onClick={() => handleToggleSpeak(msg.content)}
                                title={isSpeaking ? 'Stop voice' : 'Listen with TTS'}
                                className="p-1 hover:text-stone-900 dark:hover:text-zinc-100 transition cursor-pointer"
                              >
                                {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                              </button>
                            )}

                            {/* Add to Vanpedia Button */}
                            {!isUser && (
                              <button
                                onClick={() => handleAddToVanpedia(msg)}
                                title={language === 'en' ? 'Add as Vanpedia term' : 'Tambahkan ke Vanpedia'}
                                className="p-1 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer flex items-center gap-0.5"
                              >
                                <PlusCircle className="w-3 h-3" />
                              </button>
                            )}

                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              title="Copy"
                              className="p-1 hover:text-stone-900 dark:hover:text-zinc-100 transition cursor-pointer"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Loading & Thinking Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start animate-fadeIn">
                  <div className="w-6 h-6 rounded-lg bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <Bot className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-3 text-xs space-y-2 max-w-[80%]">
                    <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400 font-mono text-[10px]">
                      <Brain className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span>
                        {currentThinkingStep === 0
                          ? language === 'en'
                            ? 'Analyzing query & context...'
                            : 'Menganalisis pertanyaan & konteks...'
                          : currentThinkingStep === 1
                          ? language === 'en'
                            ? 'Routing model & formulating answer...'
                            : `Menghubungkan ke ${activeModel.name}...`
                          : language === 'en'
                          ? 'Rendering structured response...'
                          : 'Menyusun respon berstandar produksi...'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Live Speech to Text (STT) Recording Bar (Pops up when mic is active or transcribing) */}
            <AnimatePresence>
              {(isListening || isTranscribingAudio) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  className="px-3.5 py-2.5 bg-rose-500/10 dark:bg-rose-950/40 border-t border-rose-500/20 flex flex-col gap-2 shrink-0 select-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center">
                        <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping absolute" />
                        <span className="w-2.5 h-2.5 bg-rose-600 rounded-full relative" />
                      </div>

                      <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        {isTranscribingAudio ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{language === 'en' ? 'Transcribing audio...' : 'Mentranskripsikan audio...'}</span>
                          </>
                        ) : (
                          <>
                            <span>{language === 'en' ? 'Listening...' : 'Mendengarkan...'}</span>
                            <span className="font-mono font-normal opacity-80">({formatTimer(speechDuration)})</span>
                          </>
                        )}
                      </span>

                      {/* Equalizer Visualizer Bars */}
                      {!isTranscribingAudio && (
                        <div className="flex items-center gap-0.5 ml-1 h-3.5">
                          {[40, 80, 50, 100, 60, 90, 40].map((height, i) => (
                            <motion.span
                              key={i}
                              animate={{
                                height: ['20%', `${height}%`, '30%'],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6 + (i % 3) * 0.2,
                                ease: 'easeInOut',
                              }}
                              className="w-0.5 bg-rose-500 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Language Switcher & Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSpeechLanguage((prev) => (prev === 'id' ? 'en' : 'id'))}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                        title={language === 'en' ? 'Switch speech language' : 'Ganti bahasa input suara'}
                      >
                        <Languages className="w-3 h-3" />
                        <span>{speechLanguage === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
                      </button>

                      <button
                        onClick={stopAllListening}
                        className="p-1 rounded-md text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-rose-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        title={language === 'en' ? 'Stop & Keep Text' : 'Selesai & Simpan Teks'}
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </button>

                      <button
                        onClick={handleVoiceSendNow}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-600 text-white hover:bg-rose-500 transition shadow-xs flex items-center gap-1 cursor-pointer"
                        title={language === 'en' ? 'Send immediately' : 'Kirim Sekarang'}
                      >
                        <Send className="w-3 h-3" />
                        <span>{language === 'en' ? 'Send' : 'Kirim'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Interim Live Transcript Display */}
                  {interimTranscript && (
                    <div className="text-[11px] italic text-stone-600 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/70 p-2 rounded-xl border border-rose-200/50 dark:border-rose-900/30 truncate">
                      "{interimTranscript}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Composer & Controls Toolbar */}
            <div className="p-3 border-t border-stone-100 dark:border-zinc-900 bg-stone-50/70 dark:bg-zinc-900/40 shrink-0 space-y-2">
              {/* Text Input Box */}
              <div className="relative flex items-end gap-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-1.5 focus-within:border-stone-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-stone-400/10 transition shadow-xs">
                {/* Voice Input Button (Speech to Text) */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  title={
                    isListening
                      ? language === 'en'
                        ? 'Stop listening'
                        : 'Hentikan rekaman suara'
                      : language === 'en'
                      ? 'Speech-to-Text (Voice input)'
                      : 'Bicara lewat suara (Speech-to-Text)'
                  }
                  className={`relative p-2 rounded-xl transition cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                      : isTranscribingAudio
                      ? 'bg-amber-500 text-white'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {isTranscribingAudio ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isListening ? (
                    <Radio className="w-4 h-4 animate-pulse text-white" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}

                  {isListening && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                  )}
                </button>

                {/* Textarea */}
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening
                      ? language === 'en'
                        ? 'Listening to your voice...'
                        : 'Mendengarkan suara Anda...'
                      : language === 'en'
                      ? 'Ask Vanviolet AI or click the mic to speak...'
                      : 'Tanya apa saja ke Vanviolet AI atau klik mikrofon...'
                  }
                  rows={1}
                  className="flex-1 bg-transparent resize-none border-none outline-none text-xs sm:text-sm text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-500 max-h-24 py-1 px-1"
                />

                {/* Send Button */}
                <button
                  disabled={!inputMessage.trim() || isLoading}
                  onClick={() => handleSendMessage()}
                  className={`p-2 rounded-xl flex items-center justify-center transition shrink-0 ${
                    inputMessage.trim() && !isLoading
                      ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 cursor-pointer shadow-xs'
                      : 'bg-stone-100 dark:bg-zinc-800 text-stone-300 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Toolbar: MODEL SELECTOR & STATUS AT THE BOTTOM */}
              <div className="flex items-center justify-between px-1 text-[11px]" ref={modelMenuRef}>
                {/* Model Selector Pill (Bottom Left/Center) */}
                <div className="relative">
                  <button
                    onClick={() => setShowModelMenu((prev) => !prev)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 dark:text-zinc-300 bg-stone-100 hover:bg-stone-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-stone-200/60 dark:border-zinc-700/60 transition cursor-pointer"
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
                                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition cursor-pointer ${
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
                <div className="flex items-center gap-2 text-[10px] text-stone-400 dark:text-zinc-500">
                  <span className="hidden sm:inline">🎙️ Speech-to-Text siap</span>
                  <span>Enter ↵ kirim</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
