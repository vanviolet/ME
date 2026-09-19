import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  X,
  BookOpen,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Play,
  Square,
  Send,
  Loader2,
  ListFilter
} from 'lucide-react';
import { liveConverseWithAi, LiveVoiceResponse } from '../services/aiService';

export interface LiveVoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  audioUrl?: string | null;
  voice?: string;
  model?: string;
}

interface AiLiveVoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
  activeModelName: string;
  onAddToVanpedia: (text: string) => void;
  onAddToArticle: (text: string) => void;
  onSyncTurnsToChat: (newMessages: { role: 'user' | 'assistant'; content: string }[]) => void;
}

const GEMINI_VOICES: { id: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon'; name: string; descEn: string; descId: string }[] = [
  { id: 'Kore', name: 'Kore (Calm & Crisp)', descEn: 'Natural, clear and poised', descId: 'Jernih, tenang dan berwibawa' },
  { id: 'Zephyr', name: 'Zephyr (Fast & Dynamic)', descEn: 'Energetic and swift', descId: 'Cepat, cerdas dan enerjik' },
  { id: 'Puck', name: 'Puck (Warm & Friendly)', descEn: 'Friendly, warm and engaging', descId: 'Hangat, ramah dan santai' },
  { id: 'Fenrir', name: 'Fenrir (Deep & Resonant)', descEn: 'Deep, assertive tone', descId: 'Dalam, tegas dan meyakinkan' },
  { id: 'Charon', name: 'Charon (Smooth & Reflective)', descEn: 'Thoughtful and smooth', descId: 'Halus, bijak dan reflektif' },
];

const THINKING_PHRASES = [
  { en: 'Working... Analysing vocal stream', id: 'Working... Menganalisis gelombang suara' },
  { en: 'Hacking... Decrypting semantic tokens', id: 'Hacking... Menyelaraskan semantik kognitif' },
  { en: 'Triangulation... Connecting neural matrix', id: 'Triangulation... Memetakan matriks data' },
  { en: 'Synthesizing... Calibrating live speech', id: 'Synthesizing... Menyusun sintesis vokal' },
];

export const AiLiveVoiceMode: React.FC<AiLiveVoiceModeProps> = ({
  isOpen,
  onClose,
  language,
  activeModelName,
  onAddToVanpedia,
  onAddToArticle,
  onSyncTurnsToChat,
}) => {
  // Session States
  const [status, setStatus] = useState<'connecting' | 'listening' | 'thinking' | 'speaking' | 'paused'>('connecting');
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon'>('Kore');
  const [isMuted, setIsMuted] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 1 for visualizer reactivity

  // Live messages accumulated during this session
  const [turns, setTurns] = useState<LiveVoiceMessage[]>([]);

  // Refs for audio handling & speech recognition
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedSpeechRef = useRef<string>('');
  const isListeningRef = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  // Session elapsed timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Rotate thinking status text
  useEffect(() => {
    if (status !== 'thinking') return;
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
    }, 900);
    return () => clearInterval(interval);
  }, [status]);

  // Format mm:ss
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stop currently playing audio and speech synthesis
  const stopAllAudioPlayback = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Web Audio Visualizer setup (reads real microphone volume)
  const setupAudioVisualizer = async () => {
    try {
      if (!mediaStreamRef.current) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current && AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current && mediaStreamRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVisualizer = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(avg / 128, 1);
          setAudioLevel(normalized);
          animationFrameRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();
      }
    } catch (err) {
      console.warn('Microphone visualizer initialization notice:', err);
    }
  };

  // Submit speech query to Gemini Live backend
  const handleCommitUserSpeech = useCallback(
    async (spokenPrompt: string) => {
      if (!spokenPrompt || !spokenPrompt.trim()) {
        setStatus('listening');
        return;
      }

      const userText = spokenPrompt.trim();
      setInterimText('');
      accumulatedSpeechRef.current = '';

      const userMessage: LiveVoiceMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: userText,
        timestamp: new Date(),
      };

      setTurns((prev) => [...prev, userMessage]);
      setStatus('thinking');
      stopAllAudioPlayback();

      try {
        const historyPayload = turns.slice(-6).map((t) => ({
          role: t.role === 'assistant' ? 'assistant' : 'user',
          content: t.text,
        }));

        const response: LiveVoiceResponse = await liveConverseWithAi({
          message: userText,
          history: historyPayload,
          language,
          voice: selectedVoice,
          model: 'gemini-3.8-flash',
        });

        const replyText = response.text || (language === 'en' ? 'Understood.' : 'Baik, dimengerti.');
        setLastSpokenText(replyText);

        const assistantMessage: LiveVoiceMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          timestamp: new Date(),
          audioUrl: response.audioUrl,
          voice: response.voice || selectedVoice,
          model: response.model || 'gemini-3.8-flash',
        };

        setTurns((prev) => [...prev, assistantMessage]);
        setStatus('speaking');

        // Play the spoken audio response
        if (response.audioUrl) {
          const audio = new Audio(response.audioUrl);
          audioPlayerRef.current = audio;

          audio.onended = () => {
            audioPlayerRef.current = null;
            if (statusRef.current === 'speaking') {
              // Seamless continuous conversation: automatically resume listening!
              setTimeout(() => {
                if (statusRef.current === 'speaking') {
                  setStatus('listening');
                }
              }, 400);
            }
          };

          audio.onerror = (e) => {
            console.warn('Audio playback issue, falling back to Web Speech synthesis:', e);
            fallbackWebSpeech(replyText);
          };

          await audio.play().catch((playErr) => {
            console.warn('Autoplay prevented, falling back to Web Speech:', playErr);
            fallbackWebSpeech(replyText);
          });
        } else {
          // Fallback to Web Speech API synthesis
          fallbackWebSpeech(replyText);
        }
      } catch (err: any) {
        console.error('Live converse error:', err);
        const errorMsg =
          language === 'en'
            ? 'Sorry, I encountered a temporary connection issue. Please speak again.'
            : 'Maaf, terjadi kendala koneksi vokal sejenak. Silakan ulangi ucapan Anda.';
        setLastSpokenText(errorMsg);
        setStatus('speaking');
        fallbackWebSpeech(errorMsg);
      }
    },
    [language, selectedVoice, turns, stopAllAudioPlayback]
  );

  // Fallback to client-side speech synthesis
  const fallbackWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setTimeout(() => setStatus('listening'), 2000);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#`_\[\]()]/g, ' ').slice(0, 400);
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = language === 'en' ? 'en-US' : 'id-ID';
    utter.rate = 1.05;
    utter.onend = () => {
      setTimeout(() => {
        if (statusRef.current === 'speaking') {
          setStatus('listening');
        }
      }, 400);
    };
    utter.onerror = () => {
      setStatus('listening');
    };
    window.speechSynthesis.speak(utter);
  };

  // Start continuous Web Speech recognition
  const startSpeechRecognition = useCallback(() => {
    if (isMuted) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('Browser does not support SpeechRecognition');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = language === 'en' ? 'en-US' : 'id-ID';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans;
          } else {
            currentInterim += trans;
          }
        }

        // Interrupt AI immediately if user starts speaking while AI is speaking
        if (statusRef.current === 'speaking') {
          stopAllAudioPlayback();
          setStatus('listening');
        }

        if (currentFinal.trim()) {
          accumulatedSpeechRef.current = (
            accumulatedSpeechRef.current +
            ' ' +
            currentFinal.trim()
          ).trim();
          setInterimText(accumulatedSpeechRef.current);
        } else if (currentInterim.trim()) {
          setInterimText(
            (accumulatedSpeechRef.current + ' ' + currentInterim.trim()).trim()
          );
        }

        // Automatic Silence / VAD Detection: If user pauses for 1.3 seconds, send automatically
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const finalPrompt = (
            accumulatedSpeechRef.current +
            ' ' +
            currentInterim
          ).trim();
          if (finalPrompt.length > 1 && statusRef.current === 'listening') {
            handleCommitUserSpeech(finalPrompt);
          }
        }, 1300);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('SpeechRecognition notice:', event.error);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        // Keep listening loop alive while Live session is in 'listening' status
        if (isOpen && statusRef.current === 'listening' && !isMuted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start SpeechRecognition:', err);
    }
  }, [language, isMuted, isOpen, handleCommitUserSpeech, stopAllAudioPlayback]);

  // Stop speech recognition
  const stopSpeechRecognition = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
  }, []);

  // Initialize Live Session when opened
  useEffect(() => {
    if (!isOpen) {
      stopSpeechRecognition();
      stopAllAudioPlayback();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Set initial greeting from assistant
    setStatus('connecting');
    setupAudioVisualizer().then(() => {
      const initialGreeting =
        language === 'en'
          ? "I am listening. What would you like to discuss about Muchamad Irvan's work, systems, or projects?"
          : 'Saya sedang mendengarkan. Ada yang ingin Anda diskusikan seputar sistem, proyek, atau keahlian Muchamad Irvan?';

      setLastSpokenText(initialGreeting);
      setStatus('listening');
      startSpeechRecognition();
    });

    return () => {
      stopSpeechRecognition();
      stopAllAudioPlayback();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isOpen]);

  // React to status changes: start or stop listening
  useEffect(() => {
    if (!isOpen) return;

    if (status === 'listening' && !isMuted) {
      startSpeechRecognition();
    } else if (status === 'thinking' || status === 'speaking' || status === 'paused' || isMuted) {
      stopSpeechRecognition();
    }
  }, [status, isMuted, isOpen, startSpeechRecognition, stopSpeechRecognition]);

  // Handle Mute toggle
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeechRecognition();
        if (status === 'listening') setStatus('paused');
      } else {
        if (status === 'paused') setStatus('listening');
      }
      return next;
    });
  };

  // Manual Send Now button
  const handleManualSend = () => {
    if (interimText.trim()) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      handleCommitUserSpeech(interimText.trim());
    }
  };

  // Interrupt AI speaking
  const handleInterrupt = () => {
    stopAllAudioPlayback();
    setInterimText('');
    accumulatedSpeechRef.current = '';
    setStatus('listening');
  };

  // Replay Last Spoken Turn
  const handleReplayLastTurn = () => {
    if (!lastSpokenText) return;
    setStatus('speaking');
    const lastAiTurn = [...turns].reverse().find((t) => t.role === 'assistant');
    if (lastAiTurn?.audioUrl) {
      const audio = new Audio(lastAiTurn.audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => {
        audioPlayerRef.current = null;
        setStatus('listening');
      };
      audio.play().catch(() => fallbackWebSpeech(lastSpokenText));
    } else {
      fallbackWebSpeech(lastSpokenText);
    }
  };

  // Exit and sync turns back to chat
  const handleExitLive = () => {
    stopAllAudioPlayback();
    stopSpeechRecognition();
    if (turns.length > 0) {
      const messagesToSync = turns.map((t) => ({
        role: t.role,
        content: t.text,
      }));
      onSyncTurnsToChat(messagesToSync);
    }
    onClose();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute inset-0 z-50 bg-stone-950/95 text-stone-100 backdrop-blur-xl flex flex-col justify-between overflow-hidden rounded-3xl"
    >
      {/* Top Header Bar */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-stone-200">
            <span>LIVE</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400 font-normal">{formatTimer(sessionSeconds)}</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {selectedVoice}
          </span>
        </div>

        {/* Controls: Voice Picker, Transcript Drawer, Exit */}
        <div className="flex items-center gap-1.5 text-stone-400">
          {/* Voice Selector Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowVoicePicker((prev) => !prev)}
              title={language === 'en' ? 'Change Gemini Voice' : 'Pilih Suara Gemini'}
              className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-stone-200 transition text-xs flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-300" />
            </button>

            {showVoicePicker && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl z-50 space-y-1">
                <div className="text-[10px] font-semibold text-stone-400 px-2 py-1 uppercase tracking-wider">
                  {language === 'en' ? 'Voice Persona' : 'Karakter Suara'}
                </div>
                {GEMINI_VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoice(v.id);
                      setShowVoicePicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                      selectedVoice === v.id
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'hover:bg-stone-800 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-[10px] text-stone-400">
                        {language === 'en' ? v.descEn : v.descId}
                      </div>
                    </div>
                    {selectedVoice === v.id && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transcript Drawer Toggle */}
          <button
            onClick={() => setShowTranscript((prev) => !prev)}
            title={language === 'en' ? 'Show Live Transcript' : 'Lihat Transkrip Percakapan'}
            className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer ${
              showTranscript
                ? 'bg-stone-800 text-emerald-400'
                : 'hover:bg-stone-800 hover:text-stone-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            {turns.length > 0 && (
              <span className="text-[10px] font-mono font-bold bg-stone-800 px-1 rounded-full text-stone-300">
                {turns.length}
              </span>
            )}
          </button>

          {/* Exit Live */}
          <button
            onClick={handleExitLive}
            title={language === 'en' ? 'End Live Session' : 'Akhiri Sesi Live'}
            className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-rose-400 transition cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Dynamic Visualizer Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {/* Ambient Glow Atmosphere */}
        <div
          className={`absolute w-72 h-72 rounded-full blur-[90px] transition-all duration-700 pointer-events-none ${
            status === 'speaking'
              ? 'bg-gradient-to-tr from-cyan-500/25 to-rose-500/25 scale-125'
              : status === 'thinking'
              ? 'bg-gradient-to-tr from-amber-500/25 to-emerald-500/25 animate-pulse'
              : status === 'listening'
              ? 'bg-gradient-to-tr from-rose-500/20 to-purple-500/20'
              : 'bg-stone-800/30'
          }`}
          style={{
            transform: `scale(${1 + audioLevel * 0.4})`,
          }}
        />

        {/* Central Organic Interactive Voice Orb */}
        <div className="relative my-auto flex flex-col items-center justify-center">
          {/* Animated concentric pulse rings */}
          <div
            className={`absolute rounded-full transition-all duration-300 ${
              status === 'speaking'
                ? 'w-44 h-44 border border-rose-500/40 animate-ping'
                : status === 'listening'
                ? 'w-40 h-40 border border-emerald-500/30'
                : 'w-36 h-36 border border-stone-800'
            }`}
            style={{
              transform: `scale(${1 + (status === 'listening' ? audioLevel * 0.5 : 0)})`,
            }}
          />

          <div
            className={`absolute rounded-full transition-all duration-500 ${
              status === 'speaking'
                ? 'w-36 h-36 border border-cyan-400/40'
                : status === 'thinking'
                ? 'w-36 h-36 border border-amber-400/40 animate-spin'
                : 'w-32 h-32 border border-stone-800/60'
            }`}
          />

          {/* The Orb Core */}
          <motion.div
            animate={{
              scale:
                status === 'speaking'
                  ? [1, 1.08, 1.02, 1.12, 1]
                  : status === 'listening'
                  ? 1 + audioLevel * 0.35
                  : status === 'thinking'
                  ? [1, 1.05, 1]
                  : 1,
            }}
            transition={{
              repeat: Infinity,
              duration: status === 'speaking' ? 1.6 : 1.2,
              ease: 'easeInOut',
            }}
            onClick={status === 'speaking' ? handleInterrupt : undefined}
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
              status === 'speaking'
                ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-amber-500 text-white shadow-rose-500/40'
                : status === 'thinking'
                ? 'bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-500 text-white shadow-amber-500/30'
                : status === 'listening'
                ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-emerald-500/30'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
          >
            {status === 'thinking' ? (
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-8 h-8 animate-pulse text-white" />
            ) : isMuted ? (
              <MicOff className="w-8 h-8 text-stone-500" />
            ) : (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            )}
          </motion.div>

          {/* Status Label */}
          <div className="mt-5 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'speaking'
                    ? 'bg-cyan-400 animate-pulse'
                    : status === 'thinking'
                    ? 'bg-amber-400 animate-ping'
                    : status === 'listening'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-stone-600'
                }`}
              />
              <span className="text-xs font-mono tracking-wider font-semibold text-stone-300 uppercase">
                {status === 'speaking'
                  ? language === 'en'
                    ? 'Vanviolet Speaking'
                    : 'Vanviolet Berbicara'
                  : status === 'thinking'
                  ? THINKING_PHRASES[thinkingIndex][language === 'en' ? 'en' : 'id']
                  : status === 'listening'
                  ? language === 'en'
                    ? 'Listening... Speak naturally'
                    : 'Mendengarkan... Bicara secara alami'
                  : language === 'en'
                  ? 'Session Paused'
                  : 'Sesi Dijeda'}
              </span>
            </div>

            {status === 'speaking' && (
              <button
                onClick={handleInterrupt}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline underline-offset-4 transition cursor-pointer"
              >
                {language === 'en' ? 'Tap orb or speak to interrupt' : 'Ketuk orb atau bicara untuk menyela'}
              </button>
            )}
          </div>
        </div>

        {/* Live Subtitles / Caption Box */}
        <div className="w-full max-w-md mx-auto mt-4 min-h-[72px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {interimText ? (
              <motion.div
                key="interim"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs sm:text-sm text-stone-200 bg-stone-900/80 px-4 py-2.5 rounded-2xl border border-stone-800/80 shadow-lg text-center font-medium max-h-24 overflow-y-auto"
              >
                <span className="text-emerald-400 font-mono text-[11px] mr-1.5">You:</span>
                "{interimText}"
              </motion.div>
            ) : lastSpokenText ? (
              <motion.div
                key="spoken"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs sm:text-sm text-stone-300 bg-stone-900/40 px-4 py-2 rounded-2xl border border-stone-800/40 text-center leading-relaxed line-clamp-3"
              >
                <span className="text-rose-400 font-mono text-[11px] mr-1.5">AI:</span>
                {lastSpokenText}
              </motion.div>
            ) : (
              <div className="text-xs text-stone-500 italic">
                {language === 'en'
                  ? 'Start speaking to begin the live conversation...'
                  : 'Mulai bicara untuk memulai percakapan langsung...'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transcript Sliding Sheet / Overlay */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-x-0 bottom-24 top-14 bg-stone-900/95 backdrop-blur-2xl border-t border-stone-800 flex flex-col z-40 rounded-t-3xl shadow-2xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-stone-200">
                  {language === 'en' ? 'Live Session Transcript' : 'Transkrip Percakapan Langsung'}
                </h4>
              </div>
              <button
                onClick={() => setShowTranscript(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {turns.length === 0 ? (
                <div className="h-full flex items-center justify-center text-stone-500 text-center">
                  {language === 'en'
                    ? 'No spoken exchanges recorded yet.'
                    : 'Belum ada percakapan terekam.'}
                </div>
              ) : (
                turns.map((turn) => (
                  <div
                    key={turn.id}
                    className={`p-3 rounded-2xl border space-y-1.5 ${
                      turn.role === 'user'
                        ? 'bg-stone-800/60 border-stone-700/60 ml-6 text-stone-200'
                        : 'bg-stone-900/80 border-stone-800 mr-6 text-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span className="font-semibold text-stone-300">
                        {turn.role === 'user' ? (language === 'en' ? 'You' : 'Anda') : 'Vanviolet AI'}
                      </span>
                      <span>
                        {turn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{turn.text}</p>

                    {turn.role === 'assistant' && (
                      <div className="flex items-center justify-end gap-1 pt-1.5 border-t border-stone-800/60 text-stone-400">
                        <button
                          onClick={() => handleCopyText(turn.id, turn.text)}
                          title="Copy text"
                          className="p-1 hover:text-stone-200 rounded hover:bg-stone-800"
                        >
                          {copiedId === turn.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => onAddToVanpedia(turn.text)}
                          title={language === 'en' ? 'Add to Vanpedia' : 'Olah ke Vanpedia'}
                          className="p-1 hover:text-rose-400 rounded hover:bg-stone-800"
                        >
                          <BookOpen className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onAddToArticle(turn.text)}
                          title={language === 'en' ? 'Add to Article' : 'Olah ke Article'}
                          className="p-1 hover:text-blue-400 rounded hover:bg-stone-800"
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action Dock */}
      <div className="p-4 sm:p-5 bg-stone-900/80 border-t border-stone-800/80 backdrop-blur-xl shrink-0 flex items-center justify-between gap-3">
        {/* Mute Mic Button */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Center Control / Manual Send Immediate Button */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {interimText.trim() ? (
            <button
              onClick={handleManualSend}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Send Spoken Thought' : 'Kirim Ucapan'}</span>
            </button>
          ) : status === 'speaking' ? (
            <button
              onClick={handleInterrupt}
              className="px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-rose-300 font-medium text-xs border border-rose-500/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-rose-400 fill-current" />
              <span>{language === 'en' ? 'Interrupt / Speak' : 'Sela / Bicara'}</span>
            </button>
          ) : (
            <button
              onClick={handleReplayLastTurn}
              disabled={!lastSpokenText}
              title={language === 'en' ? 'Replay last response' : 'Putar ulang respons'}
              className="px-3.5 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1.5 hover:bg-stone-800/80 transition disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Repeat' : 'Ulangi'}</span>
            </button>
          )}
        </div>

        {/* End Live Session Button */}
        <button
          onClick={handleExitLive}
          className="px-4 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'End Live' : 'Selesai'}</span>
        </button>
      </div>
    </motion.div>
  );
};
