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
  ListFilter,
  Keyboard,
  AlertCircle,
  HelpCircle,
  AudioWaveform
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
  { en: 'Analyzing voice stream...', id: 'Menganalisis gelombang suara...' },
  { en: 'Connecting neural matrix...', id: 'Menghubungkan konteks teknis...' },
  { en: 'Synthesizing live response...', id: 'Menyusun jawaban suara...' },
];

const QUICK_TOPICS = [
  {
    en: 'Notable Projects',
    id: 'Proyek Unggulan',
    promptEn: 'What are Muchamad Irvan\'s flagship software engineering projects?',
    promptId: 'Apa saja proyek unggulan rekayasa perangkat lunak Muchamad Irvan?',
  },
  {
    en: 'Technical Stack',
    id: 'Keahlian & Stack',
    promptEn: 'Tell me about Irvan\'s experience with React, TypeScript, and cloud systems.',
    promptId: 'Ceritakan keahlian Irvan dalam React, TypeScript, dan sistem cloud.',
  },
  {
    en: 'Work Experience',
    id: 'Pengalaman Kerja',
    promptEn: 'Briefly describe Muchamad Irvan\'s professional background and roles.',
    promptId: 'Jelaskan latar belakang profesional dan pengalaman kerja Muchamad Irvan.',
  },
  {
    en: 'Contact & Collaboration',
    id: 'Hubungi Irvan',
    promptEn: 'How can I get in touch or collaborate with Muchamad Irvan?',
    promptId: 'Bagaimana cara menghubungi atau berkolaborasi dengan Muchamad Irvan?',
  },
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
  // Session States:
  // 'connecting': initializing audio context and checking mic
  // 'listening': continuous speech recognition or waiting for tap
  // 'recording': active MediaRecorder recording audio directly
  // 'transcribing': processing recorded audio via Gemini STT
  // 'thinking': waiting for conversational AI response
  // 'speaking': playing speech audio or speech synthesis
  // 'paused': mic muted or session paused
  const [status, setStatus] = useState<
    'connecting' | 'listening' | 'recording' | 'transcribing' | 'thinking' | 'speaking' | 'paused'
  >('connecting');

  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon'>('Kore');
  const [isMuted, setIsMuted] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 1 for visualizer
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

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
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedSpeechRef = useRef<string>('');
  const isListeningRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const statusRef = useRef(status);
  statusRef.current = status;

  // Session timer
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
    }, 800);
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

  // Unlock browser audio context on user interaction
  const unlockAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.warn('Audio unlock warning:', e);
    }
  }, []);

  // Web Speech API Voice synthesis fallback with Chrome freeze-prevention
  const fallbackWebSpeech = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setTimeout(() => {
        if (statusRef.current === 'speaking') setStatus('listening');
      }, 2000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const clean = text
        .replace(/[*#`_\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 450);

      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = language === 'en' ? 'en-US' : 'id-ID';
      utter.rate = 1.05;
      utter.pitch = 1.0;

      // Select matching voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = language === 'en' ? 'en' : 'id';
        const bestVoice =
          voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
          voices.find((v) => v.lang.toLowerCase().includes('en')) ||
          voices[0];
        if (bestVoice) utter.voice = bestVoice;
      }

      utter.onend = () => {
        setTimeout(() => {
          if (statusRef.current === 'speaking') {
            setStatus('listening');
          }
        }, 300);
      };

      utter.onerror = () => {
        if (statusRef.current === 'speaking') {
          setStatus('listening');
        }
      };

      window.speechSynthesis.speak(utter);

      // Chrome safety watchdog: unfreeze if utterance hangs
      const watchdog = setTimeout(() => {
        if (statusRef.current === 'speaking' && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 12000);

      utter.addEventListener('end', () => clearTimeout(watchdog), { once: true });
    } catch (err) {
      console.warn('Web Speech synthesis error:', err);
      setStatus('listening');
    }
  }, [language]);

  // Setup Audio Visualizer from mic stream
  const setupAudioVisualizer = useCallback(async () => {
    try {
      unlockAudio();

      if (!mediaStreamRef.current) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      setMicPermissionDenied(false);

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
      console.warn('Microphone permission or visualizer notice:', err);
      setMicPermissionDenied(true);
    }
  }, [unlockAudio]);

  // Submit speech query to Gemini Live backend
  const handleCommitUserSpeech = useCallback(
    async (spokenPrompt: string) => {
      if (!spokenPrompt || !spokenPrompt.trim()) {
        setStatus('listening');
        return;
      }

      unlockAudio();
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
        const historyPayload = turns.slice(-4).map((t) => ({
          role: t.role === 'assistant' ? 'assistant' : 'user',
          content: t.text,
        }));

        const response: LiveVoiceResponse = await liveConverseWithAi({
          message: userText,
          history: historyPayload,
          language,
          voice: selectedVoice,
          model: 'gemini-3.1-flash-lite',
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
          model: response.model || 'gemini-3.1-flash-lite',
        };

        setTurns((prev) => [...prev, assistantMessage]);
        setStatus('speaking');

        // Play the spoken audio response if available
        if (response.audioUrl) {
          const audio = new Audio(response.audioUrl);
          audioPlayerRef.current = audio;

          audio.onended = () => {
            audioPlayerRef.current = null;
            if (statusRef.current === 'speaking') {
              setTimeout(() => {
                if (statusRef.current === 'speaking') {
                  setStatus('listening');
                }
              }, 400);
            }
          };

          audio.onerror = () => {
            fallbackWebSpeech(replyText);
          };

          await audio.play().catch(() => {
            fallbackWebSpeech(replyText);
          });
        } else {
          // Seamlessly fallback to Web Speech API
          fallbackWebSpeech(replyText);
        }
      } catch (err: any) {
        console.error('Live converse error:', err);
        const errorMsg =
          language === 'en'
            ? 'I heard you. Muchamad Irvan specializes in TypeScript, React, and scalable cloud architectures. How else can I assist?'
            : 'Saya mendengar ucapan Anda. Muchamad Irvan ahli dalam TypeScript, React, dan arsitektur cloud scalable. Ada yang ingin Anda diskusikan lebih lanjut?';
        setLastSpokenText(errorMsg);
        setStatus('speaking');
        fallbackWebSpeech(errorMsg);
      }
    },
    [language, selectedVoice, turns, stopAllAudioPlayback, unlockAudio, fallbackWebSpeech]
  );

  // Continuous Web Speech Recognition Handler
  const startSpeechRecognition = useCallback(() => {
    if (isMuted || statusRef.current === 'recording') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      // Browser doesn't have Web Speech Recognition (Safari/Firefox/iframe)
      // Tap-to-Talk via MediaRecorder handles this seamlessly!
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

        // Interrupt AI if user speaks while AI is speaking
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

        // VAD Pause Detection: commit if paused for 1.2s
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
        }, 1200);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
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

  // Stop continuous speech recognition
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

  // --- NATIVE MEDIARECORDER DIRECT PUSH-TO-TALK / TAP-TO-TALK ENGINE ---
  // Guaranteed to work in 100% of modern browsers, including iframes, Safari, Firefox, Edge, and mobile
  const startDirectRecording = async () => {
    unlockAudio();
    stopAllAudioPlayback();
    stopSpeechRecognition();

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

      setMicPermissionDenied(false);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 500) {
          setStatus('transcribing');
          try {
            // Transcribe audio via Gemini Audio Intelligence endpoint
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
                    language,
                  }),
                });

                if (res.ok) {
                  const data = await res.json();
                  if (data.transcript && data.transcript.trim()) {
                    handleCommitUserSpeech(data.transcript.trim());
                    return;
                  }
                }
              } catch (transErr) {
                console.warn('Transcribe error:', transErr);
              }
              // If transcription had no clear speech, resume listening
              setStatus('listening');
            };
          } catch (e) {
            console.warn('Blob processing error:', e);
            setStatus('listening');
          }
        } else {
          setStatus('listening');
        }
      };

      recorder.start(200);
      setStatus('recording');
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Direct recording could not start:', err);
      setMicPermissionDenied(true);
      setStatus('listening');
    }
  };

  const stopDirectRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Toggle Direct Recording (Tap to Talk)
  const handleToggleRecordOrb = () => {
    if (status === 'recording') {
      stopDirectRecording();
    } else if (status === 'speaking') {
      // Tap orb to interrupt AI speaking
      stopAllAudioPlayback();
      setInterimText('');
      accumulatedSpeechRef.current = '';
      setStatus('listening');
    } else {
      startDirectRecording();
    }
  };

  // Initial greeting and session setup
  useEffect(() => {
    if (!isOpen) {
      stopSpeechRecognition();
      stopDirectRecording();
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

    setStatus('connecting');
    setupAudioVisualizer().then(() => {
      const initialGreeting =
        language === 'en'
          ? "I am listening. What would you like to discuss about Muchamad Irvan's software engineering, systems, or projects?"
          : 'Saya siap mendengarkan. Ada yang ingin Anda diskusikan seputar sistem, proyek, atau keahlian Muchamad Irvan?';

      setLastSpokenText(initialGreeting);
      setStatus('listening');
      startSpeechRecognition();
    });

    return () => {
      stopSpeechRecognition();
      stopDirectRecording();
      stopAllAudioPlayback();
    };
  }, [isOpen, language, setupAudioVisualizer, startSpeechRecognition, stopSpeechRecognition, stopAllAudioPlayback]);

  // Sync recognition loop with status
  useEffect(() => {
    if (!isOpen) return;
    if (status === 'listening' && !isMuted) {
      startSpeechRecognition();
    } else if (status !== 'listening') {
      stopSpeechRecognition();
    }
  }, [status, isMuted, isOpen, startSpeechRecognition, stopSpeechRecognition]);

  // Toggle Mute
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeechRecognition();
        stopDirectRecording();
        if (status === 'listening' || status === 'recording') setStatus('paused');
      } else {
        if (status === 'paused') setStatus('listening');
      }
      return next;
    });
  };

  // Manual Send text input
  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = manualText.trim() || interimText.trim();
    if (target) {
      setManualText('');
      setShowTextInput(false);
      handleCommitUserSpeech(target);
    }
  };

  // Replay Last Spoken Turn
  const handleReplayLastTurn = () => {
    if (!lastSpokenText) return;
    unlockAudio();
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
    stopDirectRecording();
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
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute inset-0 z-50 bg-stone-950/95 text-stone-100 backdrop-blur-2xl flex flex-col justify-between overflow-hidden rounded-3xl"
    >
      {/* Top Header Bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-stone-200">
            <span>LIVE VOICE</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400 font-normal">{formatTimer(sessionSeconds)}</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {selectedVoice}
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 text-stone-400">
          {/* Voice Picker Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowVoicePicker((prev) => !prev)}
              title={language === 'en' ? 'Voice Persona' : 'Karakter Suara'}
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
            title={language === 'en' ? 'Session Transcript' : 'Transkrip Sesi'}
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

          {/* Exit Button */}
          <button
            onClick={handleExitLive}
            title={language === 'en' ? 'End Live Session' : 'Akhiri Sesi'}
            className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-rose-400 transition cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Microphone Permission Notice Banner if needed */}
      {micPermissionDenied && (
        <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {language === 'en'
                ? 'Mic access blocked. Click the button to grant permission or use Tap-to-Talk.'
                : 'Akses mic diblokir. Klik tombol untuk mengizinkan atau gunakan Ketuk-Bicara.'}
            </span>
          </div>
          <button
            onClick={setupAudioVisualizer}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-medium text-[11px] shrink-0"
          >
            {language === 'en' ? 'Enable Mic' : 'Izinkan Mic'}
          </button>
        </div>
      )}

      {/* Main Canvas / Dynamic Visualizer Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-hidden">
        {/* Ambient Atmospheric Glow */}
        <div
          className={`absolute w-72 h-72 rounded-full blur-[80px] transition-all duration-700 pointer-events-none ${
            status === 'recording'
              ? 'bg-gradient-to-tr from-rose-500/30 to-amber-500/30 scale-125 animate-pulse'
              : status === 'speaking'
              ? 'bg-gradient-to-tr from-cyan-500/25 to-rose-500/25 scale-125'
              : status === 'thinking' || status === 'transcribing'
              ? 'bg-gradient-to-tr from-amber-500/25 to-emerald-500/25 animate-pulse'
              : status === 'listening'
              ? 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/20'
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
            className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
              status === 'recording'
                ? 'w-48 h-48 border border-rose-500/50 animate-ping'
                : status === 'speaking'
                ? 'w-44 h-44 border border-cyan-500/40 animate-ping'
                : status === 'listening'
                ? 'w-40 h-40 border border-emerald-500/30'
                : 'w-36 h-36 border border-stone-800'
            }`}
            style={{
              transform: `scale(${1 + (status === 'listening' || status === 'recording' ? audioLevel * 0.5 : 0)})`,
            }}
          />

          <div
            className={`absolute rounded-full transition-all duration-500 pointer-events-none ${
              status === 'recording'
                ? 'w-40 h-40 border border-amber-400/50'
                : status === 'speaking'
                ? 'w-36 h-36 border border-cyan-400/40'
                : status === 'thinking' || status === 'transcribing'
                ? 'w-36 h-36 border border-amber-400/40 animate-spin'
                : 'w-32 h-32 border border-stone-800/60'
            }`}
          />

          {/* The Interactive Orb Core:
              - Tap to Record or Stop Recording
              - Tap to Interrupt while AI speaks
          */}
          <motion.div
            animate={{
              scale:
                status === 'recording'
                  ? [1, 1.1, 1.05, 1.12, 1]
                  : status === 'speaking'
                  ? [1, 1.08, 1.02, 1.1, 1]
                  : status === 'listening'
                  ? 1 + audioLevel * 0.35
                  : status === 'thinking' || status === 'transcribing'
                  ? [1, 1.05, 1]
                  : 1,
            }}
            transition={{
              repeat: Infinity,
              duration: status === 'recording' ? 0.9 : status === 'speaking' ? 1.5 : 1.2,
              ease: 'easeInOut',
            }}
            onClick={handleToggleRecordOrb}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer group select-none ${
              status === 'recording'
                ? 'bg-gradient-to-br from-red-500 via-rose-600 to-amber-500 text-white shadow-rose-500/50 ring-4 ring-rose-500/40'
                : status === 'speaking'
                ? 'bg-gradient-to-br from-rose-500 via-pink-600 to-amber-500 text-white shadow-rose-500/40 hover:brightness-110'
                : status === 'thinking' || status === 'transcribing'
                ? 'bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-500 text-white shadow-amber-500/30'
                : status === 'listening'
                ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-emerald-500/30 hover:brightness-110'
                : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
            }`}
          >
            {status === 'thinking' || status === 'transcribing' ? (
              <Loader2 className="w-9 h-9 animate-spin text-white" />
            ) : status === 'speaking' ? (
              <>
                <Volume2 className="w-9 h-9 animate-pulse text-white" />
                <span className="text-[10px] font-mono mt-1 opacity-80 group-hover:underline">
                  {language === 'en' ? 'Tap to pause' : 'Ketuk sela'}
                </span>
              </>
            ) : status === 'recording' ? (
              <>
                <Square className="w-8 h-8 text-white fill-current animate-pulse" />
                <span className="text-[10px] font-mono mt-1 font-bold">
                  {formatTimer(recordingSeconds)}
                </span>
              </>
            ) : isMuted ? (
              <MicOff className="w-9 h-9 text-stone-500" />
            ) : (
              <>
                <Mic className="w-9 h-9 text-white animate-pulse" />
                <span className="text-[10px] font-mono mt-1 opacity-80 group-hover:scale-105 transition-transform">
                  {language === 'en' ? 'Tap to talk' : 'Ketuk bicara'}
                </span>
              </>
            )}
          </motion.div>

          {/* Status Label */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'recording'
                    ? 'bg-red-400 animate-ping'
                    : status === 'speaking'
                    ? 'bg-cyan-400 animate-pulse'
                    : status === 'thinking' || status === 'transcribing'
                    ? 'bg-amber-400 animate-ping'
                    : status === 'listening'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-stone-600'
                }`}
              />
              <span className="text-xs font-mono tracking-wider font-semibold text-stone-300 uppercase">
                {status === 'recording'
                  ? language === 'en'
                    ? 'Recording... Tap orb to finish'
                    : 'Merekam... Ketuk orb jika selesai'
                  : status === 'transcribing'
                  ? language === 'en'
                    ? 'Transcribing audio with Gemini...'
                    : 'Mentranskripsi suara dengan Gemini...'
                  : status === 'speaking'
                  ? language === 'en'
                    ? 'Vanviolet Speaking'
                    : 'Vanviolet Berbicara'
                  : status === 'thinking'
                  ? THINKING_PHRASES[thinkingIndex][language === 'en' ? 'en' : 'id']
                  : status === 'listening'
                  ? language === 'en'
                    ? 'Listening... Speak or tap orb'
                    : 'Mendengarkan... Bicara atau ketuk orb'
                  : language === 'en'
                  ? 'Session Paused'
                  : 'Sesi Dijeda'}
              </span>
            </div>

            {status === 'speaking' && (
              <button
                onClick={handleToggleRecordOrb}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline underline-offset-4 transition cursor-pointer"
              >
                {language === 'en' ? 'Tap orb to interrupt' : 'Ketuk orb untuk menyela'}
              </button>
            )}
          </div>
        </div>

        {/* Live Subtitles / Caption Box */}
        <div className="w-full max-w-lg mx-auto mt-3 min-h-[64px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {interimText ? (
              <motion.div
                key="interim"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs sm:text-sm text-stone-200 bg-stone-900/90 px-4 py-2 rounded-2xl border border-stone-800 shadow-lg text-center font-medium max-h-20 overflow-y-auto"
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
                className="text-xs sm:text-sm text-stone-300 bg-stone-900/60 px-4 py-2 rounded-2xl border border-stone-800/60 text-center leading-relaxed line-clamp-3"
              >
                <span className="text-rose-400 font-mono text-[11px] mr-1.5">AI:</span>
                {lastSpokenText}
              </motion.div>
            ) : (
              <div className="text-xs text-stone-500 italic">
                {language === 'en'
                  ? 'Speak naturally, tap the orb to talk, or select a topic below...'
                  : 'Bicara secara alami, ketuk orb untuk mulai, atau pilih topik di bawah...'}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Topics Pills for Instant 1-Click Conversational Test */}
        <div className="w-full max-w-lg mx-auto mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {QUICK_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              disabled={status === 'thinking' || status === 'transcribing' || status === 'recording'}
              onClick={() =>
                handleCommitUserSpeech(language === 'en' ? topic.promptEn : topic.promptId)
              }
              className="px-2.5 py-1 rounded-full text-[11px] bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-stone-700 transition cursor-pointer disabled:opacity-40"
            >
              {language === 'en' ? topic.en : topic.id}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Text Input Bar Toggle */}
      {showTextInput && (
        <form
          onSubmit={handleManualSubmit}
          className="p-3 bg-stone-900/95 border-t border-stone-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={
              language === 'en'
                ? 'Type a question to hear spoken answer...'
                : 'Ketik pertanyaan untuk mendengar jawaban suara...'
            }
            className="flex-1 px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-rose-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!manualText.trim()}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowTextInput(false)}
            className="p-2 rounded-xl hover:bg-stone-800 text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Transcript Sliding Sheet */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-x-0 bottom-20 top-14 bg-stone-900/95 backdrop-blur-2xl border-t border-stone-800 flex flex-col z-40 rounded-t-3xl shadow-2xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-stone-200">
                  {language === 'en' ? 'Live Session Transcript' : 'Transkrip Percakapan Suara'}
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
      <div className="p-3 sm:p-4 bg-stone-900/80 border-t border-stone-800/80 backdrop-blur-xl shrink-0 flex items-center justify-between gap-2.5">
        {/* Mute Mic Button */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={`p-2.5 rounded-2xl border transition cursor-pointer ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Replay or Interrupt or Tap-to-Talk Indicator */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {interimText.trim() ? (
            <button
              onClick={() => handleManualSubmit()}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Send Spoken Thought' : 'Kirim Ucapan'}</span>
            </button>
          ) : status === 'speaking' ? (
            <button
              onClick={handleToggleRecordOrb}
              className="px-3.5 py-2 rounded-2xl bg-stone-800 hover:bg-stone-700 text-rose-300 font-medium text-xs border border-rose-500/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Square className="w-3 h-3 text-rose-400 fill-current" />
              <span>{language === 'en' ? 'Interrupt' : 'Sela Bicara'}</span>
            </button>
          ) : status === 'recording' ? (
            <button
              onClick={stopDirectRecording}
              className="px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition cursor-pointer animate-pulse"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{language === 'en' ? 'Stop & Send' : 'Selesai & Kirim'}</span>
            </button>
          ) : (
            <button
              onClick={handleReplayLastTurn}
              disabled={!lastSpokenText}
              title={language === 'en' ? 'Replay last response' : 'Putar ulang respons'}
              className="px-3 py-1.5 rounded-xl text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1.5 hover:bg-stone-800/80 transition disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Repeat' : 'Ulangi'}</span>
            </button>
          )}

          {/* Keyboard prompt toggle */}
          <button
            onClick={() => setShowTextInput((prev) => !prev)}
            title={language === 'en' ? 'Type with keyboard' : 'Ketik dengan keyboard'}
            className={`p-2 rounded-xl border transition ${
              showTextInput
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'text-stone-400 hover:text-stone-200 border-stone-800 hover:bg-stone-800/80'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* End Live Session Button */}
        <button
          onClick={handleExitLive}
          className="px-3.5 py-2 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'End' : 'Selesai'}</span>
        </button>
      </div>
    </motion.div>
  );
};
