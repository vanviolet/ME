import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  BookOpen,
  Folder,
  Tag,
  Star,
  Trash2,
  Plus,
  Search,
  Sparkles,
  FileText,
  Edit3,
  Eye,
  CheckSquare,
  Square,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  Highlighter,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  Brain,
  HelpCircle,
  Radio,
  Layers,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Send,
  Sliders,
  X,
  FileDown,
  UploadCloud,
  Bookmark,
  Sparkle,
  Lightbulb,
  Award,
  AlertCircle,
  Table as TableIcon,
  Minus,
  Image as ImageIcon,
  Link2,
  Maximize2,
  Minimize2,
  Shuffle,
  Volume1,
  Info,
} from 'lucide-react';

// Types
export interface NoteItem {
  id: string;
  notebookId: string;
  title: string;
  content: string; // Markdown / Rich text
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  color: string; // Tailwind color class or hex
  createdAt: number;
  updatedAt: number;
  isArchived?: boolean;
  isTrash?: boolean;
  sources?: { title: string; url?: string; snippet?: string }[];
  audioRecordUrl?: string;
  audioRecordDuration?: number;
}

export interface NotebookFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

// Pre-loaded realistic sample data
const DEFAULT_NOTEBOOKS: NotebookFolder[] = [
  {
    id: 'nb-ai-cs',
    name: 'Kecerdasan Buatan & CS',
    icon: 'Brain',
    color: 'from-violet-500 to-indigo-600',
    description: 'Catatan kuliah, riset machine learning, dan arsitektur perangkat lunak.',
  },
  {
    id: 'nb-science',
    name: 'Sains & Biologi Molekuler',
    icon: 'BookOpen',
    color: 'from-emerald-500 to-teal-600',
    description: 'Konsep seluler, genetika, dan fisiologi manusia.',
  },
  {
    id: 'nb-work',
    name: 'Proyek & Arsitektur Sistem',
    icon: 'Folder',
    color: 'from-blue-500 to-cyan-600',
    description: 'Rancangan API, evaluasi performa, dan notula rapat teknis.',
  },
  {
    id: 'nb-general',
    name: 'Catatan Harian & Ide',
    icon: 'Star',
    color: 'from-amber-500 to-orange-600',
    description: 'Ide bebas, ringkasan buku bacaan, dan jurnal refleksi.',
  },
];

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-ml-foundations',
    notebookId: 'nb-ai-cs',
    title: 'Fondasi Deep Learning & Transformer Architecture',
    content: `# Fondasi Deep Learning & Transformer Architecture

## 1. Konsep Dasar Self-Attention Mechanism
Mekanisme **Self-Attention** memungkinkan model memperhitungkan hubungan setiap kata dengan kata lain dalam kalimat, terlepas dari posisinya.

$$Attention(Q, K, V) = softmax\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

- **Query ($Q$)**: Representasi vektor kata saat mencari konteks.
- **Key ($K$)**: Representasi kata lain yang dicocokkan.
- **Value ($V$)**: Kandungan semantik yang akan diagregasi.
- **Skala $\\sqrt{d_k}$**: Mencegah gradien menjadi terlalu kecil saat dot product bernilai sangat besar.

> *"Attention is All You Need"* (Vaswani et al., 2017) merevolusi pemrosesan bahasa alami dengan membuang ketergantungan pada RNN rekursif yang lambat.

## 2. Multi-Head Attention
Dengan membagi dimensi representasi ke dalam $h$ kepala independen:
1. Model dapat memfokuskan perhatian pada aspek sintaksis berbeda (misal: subjek-predikat, rujukan kata ganti).
2. Setiap kepala mempelajari relasi semantik unik secara paralel.

## 3. Komponen Kunci Lainnya
- **Positional Encoding**: Karena tidak ada urutan inheren dalam perhatian, vektor sinusoidal ditambahkan ke token embedding.
- **Layer Normalization & Residual Connections**: Menjamin kestabilan pelatihan jaringan dalam hingga ratusan layer.
- **Feed-Forward Networks (FFN)**: Transformasi non-linear dua lapis dengan aktivasi GeLU / SwiGLU.

### Checklist Review:
- [x] Pahami perbedaan Cross-Attention vs Self-Attention
- [x] Turunkan rumus matematika Scaled Dot-Product
- [ ] Implementasikan toy transformer dari nol dengan PyTorch`,
    tags: ['AI', 'Transformer', 'Machine Learning', 'Deep Learning'],
    isPinned: true,
    isFavorite: true,
    color: 'border-violet-500/40 bg-violet-50/30 dark:bg-violet-950/20',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 15,
    sources: [
      { title: 'Paper: Attention Is All You Need (Vaswani et al.)', url: 'https://arxiv.org/abs/1706.03762' },
      { title: 'The Illustrated Transformer oleh Jay Alammar', url: 'https://jalammar.github.io/illustrated-transformer/' },
    ],
  },
  {
    id: 'note-biology-photosynthesis',
    notebookId: 'nb-science',
    title: 'Fotosintesis: Reaksi Terang & Siklus Calvin-Benson',
    content: `# Fotosintesis: Reaksi Terang & Siklus Calvin-Benson

## Ringkasan Eksekutif
Fotosintesis adalah proses konversi energi foton cahaya matahari menjadi energi kimiawi dalam bentuk glukosa ($C_6H_{12}O_6$). Reaksi terjadi di organel **Kloroplas**.

## Fase 1: Reaksi Terang (Membran Tilakoid)
1. **Fotolisis Air**: $2H_2O \\rightarrow 4H^+ + 4e^- + O_2$
2. **Eksitasi Elektron**: Foton diserap oleh klorofil pada **Fotosistem II (P680)**.
3. **Rantai Transpor Elektron (ETC)**: Aliran elektron memompa proton ($H^+$) ke dalam lumen tilakoid, menghasilkan gradien proton elektrokimia.
4. **Sintesis ATP & NADPH**: 
   - ATP Sintase memanfaatkan aliran kemiosmosis untuk menghasilkan **ATP**.
   - **Fotosistem I (P700)** mentransfer elektron ke $NADP^+$ menghasilkan **NADPH**.

## Fase 2: Siklus Calvin / Reaksi Gelap (Stroma)
Tidak membutuhkan cahaya langsung, namun mutlak memerlukan ATP dan NADPH dari reaksi terang:
- **Fase Karboksilasi**: Enzim **RuBisCO** mengikat $CO_2$ ke Ribulosa-1,5-bisfosfat (RuBP) membentuk 3-PGA.
- **Fase Reduksi**: 3-PGA direduksi menjadi G3P (Gliseraldehida 3-fosfat) menggunakan ATP dan NADPH.
- **Fase Regenerasi**: 5 molekul G3P didaur ulang menjadi RuBP dengan mengonsumsi ATP tambahan.

> **Hafalan Kunci**: 6 putaran siklus Calvin menghasilkan 1 molekul heksosa glukosa bersih.`,
    tags: ['Biologi', 'Fotosintesis', 'Biokimia', 'Metabolisme'],
    isPinned: false,
    isFavorite: true,
    color: 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'note-distributed-systems',
    notebookId: 'nb-work',
    title: 'Teorema CAP & Desain Konsistensi Sistem Terdistribusi',
    content: `# Teorema CAP & Desain Konsistensi Sistem Terdistribusi

## Tiga Sumbu Teorema CAP
Dalam sistem penyimpanan terdistribusi yang mengalami partisi jaringan (**Partition Tolerance - P**), kita hanya dapat menjamin salah satu dari dua sifat:

1. **Consistency (C)**: Setiap operasi pembacaan menerima penulisan data paling mutakhir atau menghasilkan kesalahan (linearizability).
2. **Availability (A)**: Setiap request non-failing node mendapatkan respon sukses tanpa jaminan data paling mutakhir.
3. **Partition Tolerance (P)**: Sistem tetap dapat beroperasi meskipun terjadi pemutusan komunikasi jaringan antar node.

### Pilihan Arsitektur Nyata:
- **Sistem CP (Contoh: etcd, CockroachDB, HBase)**: Memilih kebenaran data mutlak. Jika node partisi tidak dapat quorum, request ditolak/timeout.
- **Sistem AP (Contoh: Apache Cassandra, DynamoDB, CouchDB)**: Mengutamakan uptime 99.999%. Mengadopsi **Eventual Consistency** dengan teknik vector clocks dan CRDTs.

## Strategi Mitigasi Masalah Jaringan:
- **Raft / Paxos Consensus**: Pemilihan pemimpin (leader election) dengan syarat mayoritas quorum $(N/2 + 1)$.
- **Idempotency Keys**: Mencegah duplikasi eksekusi pembayaran atau mutasi data saat request di-retry oleh client.`,
    tags: ['Distributed Systems', 'Arsitektur', 'Database', 'Backend'],
    isPinned: false,
    isFavorite: false,
    color: 'border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/20',
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

export const NotesNotebookPage: React.FC = () => {
  const { language } = usePortfolio();

  // State: Notebooks & Notes
  const [notebooks, setNotebooks] = useState<NotebookFolder[]>(() => {
    try {
      const saved = localStorage.getItem('omninote_notebooks_v1');
      return saved ? JSON.parse(saved) : DEFAULT_NOTEBOOKS;
    } catch {
      return DEFAULT_NOTEBOOKS;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('omninote_notes_v1');
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  // Navigation & Filtering state
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | 'all' | 'favorites' | 'trash'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string>(DEFAULT_NOTES[0].id);

  // Editor mode: 'edit' | 'preview' | 'split'
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('split');
  // Main view: 'notes' | 'study_studio'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'notes' | 'study_studio'>('notes');

  // NotebookLM-style Study Studio Sub-tab
  const [studyTab, setStudyTab] = useState<'guide' | 'flashcards' | 'quiz' | 'chat' | 'audio_overview' | 'cornell'>('guide');

  // AI Generation State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStudyData, setAiStudyData] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Chat with Notebook state
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; citations?: string[]; followUps?: string[] }[]
  >([
    {
      role: 'assistant',
      text:
        language === 'en'
          ? 'Hello! I am your Notebook Learning Assistant. Ask me anything about your current notes, or click any tool on the right to synthesize flashcards, study guides, and quizzes!'
          : 'Halo! Saya Asisten Pembelajaran Notebook Anda. Tanyakan apa saja mengenai catatan Anda, atau gunakan perkakas di sebelah kanan untuk membuat kartu belajar, kuis, dan panduan belajar!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Flashcard interaction state
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardHint, setShowCardHint] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  // Quiz interaction state
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // Audio Podcast / TTS state
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Textarea Ref for rich formatting insertions
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // New Notebook modal state
  const [isNewNotebookModalOpen, setIsNewNotebookModalOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState('from-rose-500 to-pink-600');

  // Voice recording state (Web MediaRecorder)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('omninote_notebooks_v1', JSON.stringify(notebooks));
    } catch {}
  }, [notebooks]);

  useEffect(() => {
    try {
      localStorage.setItem('omninote_notes_v1', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Find active note
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Trash filter
      if (selectedNotebookId === 'trash') {
        return note.isTrash;
      }
      if (note.isTrash) return false;

      // Favorites filter
      if (selectedNotebookId === 'favorites') {
        if (!note.isFavorite) return false;
      } else if (selectedNotebookId !== 'all') {
        if (note.notebookId !== selectedNotebookId) return false;
      }

      // Tag filter
      if (selectedTag && !note.tags.includes(selectedTag)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
      }

      return true;
    });
  }, [notes, selectedNotebookId, selectedTag, searchQuery]);

  // All distinct tags across active notes
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.filter((n) => !n.isTrash).forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Word count and metrics
  const activeNoteMetrics = useMemo(() => {
    if (!activeNote) return { words: 0, chars: 0, readMins: 0 };
    const words = activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0;
    const chars = activeNote.content.length;
    const readMins = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readMins };
  }, [activeNote]);

  // Update active note helper
  const updateActiveNote = (updates: Partial<NoteItem>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNote.id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    );
  };

  // Create new note
  const handleCreateNote = () => {
    const currentNb =
      selectedNotebookId !== 'all' && selectedNotebookId !== 'favorites' && selectedNotebookId !== 'trash'
        ? selectedNotebookId
        : notebooks[0]?.id || 'nb-general';

    const newNote: NoteItem = {
      id: 'note-' + Date.now(),
      notebookId: currentNb,
      title: language === 'en' ? 'Untitled Note' : 'Catatan Baru',
      content: `# ${language === 'en' ? 'Untitled Note' : 'Catatan Baru'}\n\nTulis isi materi atau rangkuman pembelajaran di sini...`,
      tags: [],
      isPinned: false,
      isFavorite: false,
      color: 'border-stone-200/80 dark:border-zinc-800',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setActiveWorkspaceTab('notes');
  };

  // Delete / Trash note
  const handleToggleTrashNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        if (n.isTrash) {
          // Restore
          return { ...n, isTrash: false };
        } else {
          return { ...n, isTrash: true };
        }
      })
    );
  };

  const handlePermanentDeleteNote = (noteId: string) => {
    if (!confirm(language === 'en' ? 'Delete this note permanently?' : 'Hapus catatan ini secara permanen?')) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (activeNoteId === noteId) {
      const remaining = notes.filter((n) => n.id !== noteId);
      if (remaining.length > 0) setActiveNoteId(remaining[0].id);
    }
  };

  // Insert markdown snippet into editor
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea || !activeNote) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote.content;
    const selected = text.substring(start, end) || defaultPlaceholder;

    const newContent = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
    updateActiveNote({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // Voice recording toggle (MediaRecorder)
  const handleToggleVoiceRecording = async () => {
    if (isRecordingVoice) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingVoice(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          updateActiveNote({
            audioRecordUrl: audioUrl,
            audioRecordDuration: recordingSeconds,
          });
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecordingVoice(true);
        setRecordingSeconds(0);
      } catch (err) {
        alert(
          language === 'en'
            ? 'Microphone access was denied or not supported on this browser.'
            : 'Akses mikrofon tidak diizinkan atau tidak didukung oleh peramban ini.'
        );
      }
    }
  };

  // Timer for voice recording
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Trigger AI Study Generation (NotebookLM-style)
  const handleGenerateStudyAsset = async (actionType: 'study-guide' | 'flashcards' | 'quiz' | 'audio-overview' | 'cornell-notes') => {
    if (!activeNote) return;
    setIsAiProcessing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/notebook-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          notesContent: activeNote.content,
          sources: activeNote.sources || [],
          language,
        }),
      });

      if (!res.ok) throw new Error('Gagal menghubungi AI Study Engine');
      const json = await res.json();
      if (!json.success || !json.data) throw new Error(json.error || 'Respons AI tidak valid');

      setAiStudyData(json.data);
      if (actionType === 'flashcards') {
        setActiveFlashcardIndex(0);
        setIsCardFlipped(false);
        setShowCardHint(false);
        setMasteredCards(new Set());
      } else if (actionType === 'quiz') {
        setUserQuizAnswers({});
        setIsQuizSubmitted(false);
      }
    } catch (err: any) {
      setAiError(err.message || 'Terjadi kesalahan pemrosesan');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Trigger Study Chat
  const handleSendStudyChat = async () => {
    if (!chatInput.trim() || !activeNote) return;
    const userQ = chatInput.trim();
    setChatInput('');

    const newHistory = [...chatMessages, { role: 'user' as const, text: userQ }];
    setChatMessages(newHistory);
    setIsAiProcessing(true);

    try {
      const res = await fetch('/api/ai/notebook-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat-notes',
          notesContent: activeNote.content,
          sources: activeNote.sources || [],
          query: userQ,
          language,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setChatMessages([
          ...newHistory,
          {
            role: 'assistant',
            text: json.data.answer,
            citations: json.data.citations,
            followUps: json.data.suggestedFollowUps,
          },
        ]);
      } else {
        setChatMessages([
          ...newHistory,
          {
            role: 'assistant',
            text: 'Maaf, saya tidak dapat menemukan informasi yang cukup di dalam catatan ini untuk menjawab pertanyaan tersebut.',
          },
        ]);
      }
    } catch {
      setChatMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: 'Terjadi gangguan jaringan saat memproses jawaban dari catatan Anda.',
        },
      ]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // TTS Podcast Playback (NotebookLM Audio Overview simulation with Web Speech API)
  const handleTogglePodcastAudio = () => {
    if (!aiStudyData?.dialogue || aiStudyData.dialogue.length === 0) return;

    if (isPodcastPlaying) {
      window.speechSynthesis.cancel();
      setIsPodcastPlaying(false);
    } else {
      setIsPodcastPlaying(true);
      playDialogueStep(0);
    }
  };

  const playDialogueStep = (index: number) => {
    if (!aiStudyData?.dialogue || index >= aiStudyData.dialogue.length) {
      setIsPodcastPlaying(false);
      setActiveSpeakerIndex(0);
      return;
    }

    setActiveSpeakerIndex(index);
    const item = aiStudyData.dialogue[index];
    const utterance = new SpeechSynthesisUtterance(item.text);
    speechUtteranceRef.current = utterance;

    // Indonesian or English voice tuning
    utterance.lang = language === 'en' ? 'en-US' : 'id-ID';
    utterance.rate = item.speaker === 'Alex' ? 1.05 : 0.95;
    utterance.pitch = item.speaker === 'Alex' ? 1.1 : 0.95;

    utterance.onend = () => {
      playDialogueStep(index + 1);
    };

    utterance.onerror = () => {
      setIsPodcastPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Export note as Markdown or HTML
  const handleExportNote = (format: 'md' | 'html' | 'txt') => {
    if (!activeNote) return;
    let content = activeNote.content;
    let mime = 'text/markdown';
    let ext = 'md';

    if (format === 'html') {
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeNote.title}</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;line-height:1.6;color:#333;}</style></head><body><h1>${activeNote.title}</h1><div>${activeNote.content.replace(/\n/g, '<br/>')}</div></body></html>`;
      mime = 'text/html';
      ext = 'html';
    } else if (format === 'txt') {
      mime = 'text/plain';
      ext = 'txt';
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNote.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print / PDF
  const handlePrintNote = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-3 sm:px-6 lg:px-8 max-w-[1700px] mx-auto space-y-4 font-sans antialiased text-stone-900 dark:text-zinc-100">
      <Seo
        title={
          language === 'en'
            ? 'OmniNote: Evernote-Grade Rich Notes & Gemini NotebookLM Study Studio'
            : 'OmniNote: Catatan Lengkap Ala Evernote & Notebook Belajar AI Ala Gemini NotebookLM'
        }
        description={
          language === 'en'
            ? 'Advanced Evernote-style note-taking app with notebooks, voice memos, rich markdown, and a NotebookLM-grade AI Study Studio for auto flashcards, study guides, grounded chat, and podcast audio overviews.'
            : 'Aplikasi catatan lengkap setara Evernote dengan multi-notebook, memo suara, editor markdown kaya, serta Studio Belajar AI ala Gemini NotebookLM untuk membuat flashcard, rangkuman, kuis, dan siniar audio otomatis.'
        }
        url="/tools/notes"
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">OmniNote & AI Study Studio</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Evernote + NotebookLM
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              {language === 'en'
                ? 'Capture thoughts with rich media, and synthesize with Gemini NotebookLM academic engine.'
                : 'Tulis catatan harian kaya fitur, dan ubah materi belajar jadi flashcard, kuis, serta rangkuman otomatis.'}
            </p>
          </div>
        </div>

        {/* Global Action & Workspace Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-stone-100 dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('notes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeWorkspaceTab === 'notes'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <FileText size={14} />
              <span>{language === 'en' ? 'Notes Workspace' : 'Lembar Catatan'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveWorkspaceTab('study_studio');
                if (!aiStudyData) {
                  handleGenerateStudyAsset('study-guide');
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeWorkspaceTab === 'study_studio'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sparkles size={14} className="text-indigo-500 animate-pulse" />
              <span>{language === 'en' ? 'AI Study Studio (NotebookLM)' : 'Studio Belajar AI (NotebookLM)'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCreateNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{language === 'en' ? 'New Note' : 'Catatan Baru'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start min-h-[780px]">
        {/* COLUMN 1: Notebooks & Navigation Sidebar (2.5 cols on lg) */}
        <div className="md:col-span-3 lg:col-span-2 space-y-4 bg-white dark:bg-zinc-900 p-3.5 rounded-3xl border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs">
          {/* Quick Filter Section */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 px-2 py-1">
              {language === 'en' ? 'Views' : 'Navigasi'}
            </div>

            <button
              type="button"
              onClick={() => setSelectedNotebookId('all')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedNotebookId === 'all'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={15} />
                <span>{language === 'en' ? 'All Notes' : 'Semua Catatan'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 font-mono">
                {notes.filter((n) => !n.isTrash).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedNotebookId('favorites')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedNotebookId === 'favorites'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star size={15} className="text-amber-500" />
                <span>{language === 'en' ? 'Favorites' : 'Favorit'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 font-mono">
                {notes.filter((n) => !n.isTrash && n.isFavorite).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedNotebookId('trash')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                selectedNotebookId === 'trash'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 size={15} />
                <span>{language === 'en' ? 'Trash' : 'Tempat Sampah'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 font-mono">
                {notes.filter((n) => n.isTrash).length}
              </span>
            </button>
          </div>

          <div className="h-px bg-stone-100 dark:bg-zinc-800" />

          {/* Notebooks List */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
                Notebooks ({notebooks.length})
              </span>
              <button
                type="button"
                onClick={() => setIsNewNotebookModalOpen(true)}
                className="p-1 rounded-md text-stone-400 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="Tambah Notebook Baru"
              >
                <Plus size={13} />
              </button>
            </div>

            {notebooks.map((nb) => {
              const count = notes.filter((n) => !n.isTrash && n.notebookId === nb.id).length;
              const isSelected = selectedNotebookId === nb.id;
              return (
                <button
                  key={nb.id}
                  type="button"
                  onClick={() => {
                    setSelectedNotebookId(nb.id);
                    setSelectedTag(null);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full bg-linear-to-r ${nb.color} shrink-0`} />
                    <span className="truncate text-left">{nb.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 font-mono shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-stone-100 dark:bg-zinc-800" />

          {/* Tags Chips */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 px-2">
              Tags ({allTags.length})
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-stone-50 dark:bg-zinc-800/70 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:border-emerald-500'
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {allTags.length === 0 && (
                <div className="text-[11px] text-stone-400 italic px-1">Belum ada tag</div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: Notes List Drawer (3.5 cols on lg) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-3 bg-white dark:bg-zinc-900 p-3.5 rounded-3xl border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs h-[780px] flex flex-col">
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search notes, tags...' : 'Cari isi catatan, kata kunci...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span>{filteredNotes.length} Catatan</span>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-rose-500 hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer"
              >
                <span>Hapus filter #{selectedTag}</span>
                <X size={10} />
              </button>
            )}
          </div>

          {/* Notes Scrollable Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredNotes.map((note) => {
              const isActive = note.id === activeNoteId;
              const dateStr = new Date(note.updatedAt).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
              });
              const previewSnippet = note.content
                .replace(/[#*`$\->]/g, '')
                .slice(0, 100)
                .trim();

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    if (activeWorkspaceTab === 'study_studio') {
                      // Trigger refresh when user clicks note in study mode
                      setAiStudyData(null);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left relative group ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/5 shadow-xs'
                      : 'border-stone-200/80 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-100 line-clamp-1">
                      {note.title || 'Tanpa Judul'}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {note.isPinned && <span className="text-[10px]">📌</span>}
                      {note.isFavorite && <Star size={12} className="text-amber-500 fill-amber-500" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {previewSnippet || 'Tidak ada teks tambahan'}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 dark:border-zinc-800/60 text-[10px] text-stone-400">
                    <span>{dateStr}</span>
                    {note.tags.length > 0 && (
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">#{note.tags[0]}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredNotes.length === 0 && (
              <div className="text-center py-12 text-stone-400 text-xs space-y-2">
                <FileText size={28} className="mx-auto opacity-40" />
                <p>{language === 'en' ? 'No notes match your filter.' : 'Tidak ada catatan yang cocok.'}</p>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  + {language === 'en' ? 'Create Note' : 'Buat Catatan Baru'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Work Area: Editor OR NotebookLM Study Studio (7 cols on lg) */}
        <div className="md:col-span-5 lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-stone-200/80 dark:border-zinc-800/80 shadow-2xs min-h-[780px] flex flex-col">
          {activeNote ? (
            activeWorkspaceTab === 'notes' ? (
              /* TAB A: EVERNOTE-GRADE RICH NOTE EDITOR */
              <div className="flex-1 flex flex-col space-y-4">
                {/* Note Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    {/* Notebook selector dropdown */}
                    <select
                      value={activeNote.notebookId}
                      onChange={(e) => updateActiveNote({ notebookId: e.target.value })}
                      className="text-xs font-semibold px-2 py-1 rounded-lg bg-stone-100 dark:bg-zinc-800 border-none text-stone-700 dark:text-zinc-300 focus:outline-emerald-500 cursor-pointer"
                    >
                      {notebooks.map((nb) => (
                        <option key={nb.id} value={nb.id}>
                          📁 {nb.name}
                        </option>
                      ))}
                    </select>

                    {/* Pin button */}
                    <button
                      type="button"
                      onClick={() => updateActiveNote({ isPinned: !activeNote.isPinned })}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeNote.isPinned
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                      }`}
                      title={activeNote.isPinned ? 'Lepas Pin' : 'Sematkan ke Atas'}
                    >
                      📌
                    </button>

                    {/* Favorite button */}
                    <button
                      type="button"
                      onClick={() => updateActiveNote({ isFavorite: !activeNote.isFavorite })}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeNote.isFavorite
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                      }`}
                      title="Favorit"
                    >
                      <Star size={14} className={activeNote.isFavorite ? 'fill-amber-500' : ''} />
                    </button>

                    {/* Voice Memo Record Button */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceRecording}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isRecordingVoice
                          ? 'bg-rose-500 text-white animate-pulse'
                          : activeNote.audioRecordUrl
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800'
                      }`}
                      title="Rekam Voice Memo untuk Catatan Ini"
                    >
                      {isRecordingVoice ? <MicOff size={14} /> : <Mic size={14} />}
                      <span>
                        {isRecordingVoice
                          ? `Merekam (${recordingSeconds}s)...`
                          : activeNote.audioRecordUrl
                          ? 'Voice Memo Ada'
                          : 'Voice Memo'}
                      </span>
                    </button>
                  </div>

                  {/* Actions & View Modes */}
                  <div className="flex items-center gap-1.5">
                    {/* Mode Toggle: Edit / Preview / Split */}
                    <div className="flex items-center p-0.5 bg-stone-100 dark:bg-zinc-800 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setEditorMode('edit')}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          editorMode === 'edit'
                            ? 'bg-white dark:bg-zinc-700 font-bold text-emerald-600 shadow-2xs'
                            : 'text-stone-500'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('split')}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          editorMode === 'split'
                            ? 'bg-white dark:bg-zinc-700 font-bold text-emerald-600 shadow-2xs'
                            : 'text-stone-500'
                        }`}
                      >
                        Split
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('preview')}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          editorMode === 'preview'
                            ? 'bg-white dark:bg-zinc-700 font-bold text-emerald-600 shadow-2xs'
                            : 'text-stone-500'
                        }`}
                      >
                        Preview
                      </button>
                    </div>

                    {/* Export / Print menu */}
                    <button
                      type="button"
                      onClick={() => handleExportNote('md')}
                      className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Unduh Markdown (.md)"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintNote}
                      className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Cetak / Simpan PDF"
                    >
                      <Printer size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleTrashNote(activeNote.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      title={activeNote.isTrash ? 'Pulihkan Catatan' : 'Pindahkan ke Tempat Sampah'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Voice Player Banner if present */}
                {activeNote.audioRecordUrl && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        Voice Memo Terlampir
                      </span>
                      <audio controls src={activeNote.audioRecordUrl} className="h-7 w-52 sm:w-64" />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateActiveNote({ audioRecordUrl: undefined })}
                      className="text-stone-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="Hapus rekaman suara"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Title Input */}
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateActiveNote({ title: e.target.value })}
                  placeholder={language === 'en' ? 'Note Title...' : 'Judul Catatan...'}
                  className="w-full text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-zinc-100 bg-transparent border-none focus:outline-none placeholder-stone-300 dark:placeholder-zinc-600"
                />

                {/* Tags input bar */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <Tag size={13} className="text-stone-400" />
                  {activeNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-[11px] text-stone-700 dark:text-zinc-300 font-mono"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveNote({ tags: activeNote.tags.filter((t) => t !== tag) })
                        }
                        className="hover:text-rose-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="+ Tambah tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim().replace(/^#/, '');
                        if (val && !activeNote.tags.includes(val)) {
                          updateActiveNote({ tags: [...activeNote.tags, val] });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-transparent text-stone-700 dark:text-zinc-300 placeholder-stone-400 focus:outline-none"
                  />
                </div>

                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-stone-200/80 dark:border-zinc-700/80 text-stone-600 dark:text-zinc-300 text-xs">
                  <button
                    type="button"
                    onClick={() => insertFormatting('# ', '', 'Judul Besar')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Heading 1"
                  >
                    <Heading1 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('## ', '', 'Sub-bab')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Heading 2"
                  >
                    <Heading2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('### ', '', 'Poin')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Heading 3"
                  >
                    <Heading3 size={14} />
                  </button>

                  <div className="w-px h-4 bg-stone-200 dark:bg-zinc-700 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**', 'teks tebal')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer font-bold"
                    title="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*', 'teks miring')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer italic"
                    title="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('~~', '~~', 'coret')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Strikethrough"
                  >
                    <Strikethrough size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('==', '==', 'stabilo sorot')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 text-amber-500 cursor-pointer"
                    title="Highlight"
                  >
                    <Highlighter size={14} />
                  </button>

                  <div className="w-px h-4 bg-stone-200 dark:bg-zinc-700 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('- ', '', 'Poin daftar')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Bullet List"
                  >
                    <List size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('1. ', '', 'Langkah pertama')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Numbered List"
                  >
                    <ListOrdered size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('- [ ] ', '', 'Tugas atau target')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Checklist / To-Do"
                  >
                    <CheckSquare size={14} />
                  </button>

                  <div className="w-px h-4 bg-stone-200 dark:bg-zinc-700 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('> ', '', 'Kutipan penting')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Quote"
                  >
                    <Quote size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('```\n', '\n```', 'kode atau formula')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Code Block"
                  >
                    <Code size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertFormatting(
                        '\n| Kolom 1 | Kolom 2 |\n|---------|---------|\n| Data A  | Data B  |\n'
                      )
                    }
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Insert Table"
                  >
                    <TableIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n---\n')}
                    className="p-1 rounded hover:bg-stone-200 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Horizontal Divider"
                  >
                    <Minus size={14} />
                  </button>
                </div>

                {/* Editor & Preview Pane */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-[440px]">
                  {/* Left or Full Editor */}
                  {(editorMode === 'edit' || editorMode === 'split') && (
                    <textarea
                      ref={textareaRef}
                      value={activeNote.content}
                      onChange={(e) => updateActiveNote({ content: e.target.value })}
                      placeholder="Mulai menulis catatan di sini... Dukungan penuh Markdown, checklist, rumus matematika $$...$$, dan tabel."
                      className={`w-full h-full p-4 rounded-2xl bg-stone-50/50 dark:bg-zinc-800/40 border border-stone-200/80 dark:border-zinc-700/80 font-mono text-xs text-stone-900 dark:text-zinc-100 resize-none focus:outline-emerald-500 leading-relaxed ${
                        editorMode === 'edit' ? 'col-span-2' : ''
                      }`}
                    />
                  )}

                  {/* Right or Full Preview */}
                  {(editorMode === 'preview' || editorMode === 'split') && (
                    <div
                      className={`w-full h-full p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800/80 overflow-y-auto prose dark:prose-invert prose-xs max-w-none text-xs leading-relaxed ${
                        editorMode === 'preview' ? 'col-span-2' : ''
                      }`}
                    >
                      {activeNote.content.split('\n').map((line, idx) => {
                        // Checkbox rendering
                        if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
                          const isChecked = line.startsWith('- [x] ');
                          const label = line.replace(/^- \[[ x]\] /, '');
                          return (
                            <div key={idx} className="flex items-center gap-2 py-0.5 font-sans">
                              <button
                                type="button"
                                onClick={() => {
                                  const lines = activeNote.content.split('\n');
                                  lines[idx] = isChecked ? `- [ ] ${label}` : `- [x] ${label}`;
                                  updateActiveNote({ content: lines.join('\n') });
                                }}
                                className="cursor-pointer text-emerald-600"
                              >
                                {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                              </button>
                              <span className={isChecked ? 'line-through text-stone-400' : ''}>
                                {label}
                              </span>
                            </div>
                          );
                        }

                        // Headings
                        if (line.startsWith('# ')) {
                          return (
                            <h1 key={idx} className="text-lg font-bold text-stone-900 dark:text-zinc-100 my-2">
                              {line.replace(/^# /, '')}
                            </h1>
                          );
                        }
                        if (line.startsWith('## ')) {
                          return (
                            <h2 key={idx} className="text-base font-bold text-stone-900 dark:text-zinc-100 my-1.5">
                              {line.replace(/^## /, '')}
                            </h2>
                          );
                        }
                        if (line.startsWith('### ')) {
                          return (
                            <h3 key={idx} className="text-sm font-bold text-stone-900 dark:text-zinc-100 my-1">
                              {line.replace(/^### /, '')}
                            </h3>
                          );
                        }

                        // Quote
                        if (line.startsWith('> ')) {
                          return (
                            <blockquote
                              key={idx}
                              className="border-l-2 border-emerald-500 pl-3 py-1 my-1 italic text-stone-600 dark:text-zinc-300 bg-emerald-500/5 rounded-r-md"
                            >
                              {line.replace(/^> /, '')}
                            </blockquote>
                          );
                        }

                        // Bullet list
                        if (line.startsWith('- ')) {
                          return (
                            <li key={idx} className="ml-4 list-disc my-0.5">
                              {line.replace(/^- /, '')}
                            </li>
                          );
                        }

                        // Divider
                        if (line.trim() === '---') {
                          return <hr key={idx} className="my-2 border-stone-200 dark:border-zinc-800" />;
                        }

                        if (!line.trim()) return <div key={idx} className="h-2" />;

                        return (
                          <p key={idx} className="my-0.5">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Status Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-zinc-800 text-[11px] text-stone-400">
                  <div className="flex items-center gap-3 font-mono">
                    <span>{activeNoteMetrics.words} kata</span>
                    <span>•</span>
                    <span>{activeNoteMetrics.chars} karakter</span>
                    <span>•</span>
                    <span>~{activeNoteMetrics.readMins} menit baca</span>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check size={12} />
                    <span>Tersimpan otomatis di peramban</span>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB B: GEMINI NOTEBOOKLM-GRADE AI STUDY & SYNTHESIS STUDIO */
              <div className="flex-1 flex flex-col space-y-4">
                {/* NotebookLM Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                        {language === 'en' ? 'NotebookLM Study Studio' : 'Studio Pembelajaran NotebookLM'}
                      </h2>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">
                      Materi aktif: <strong className="text-stone-700 dark:text-zinc-200">{activeNote.title}</strong>
                    </p>
                  </div>

                  {/* Study Sub-Tab Buttons */}
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setStudyTab('guide');
                        handleGenerateStudyAsset('study-guide');
                      }}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        studyTab === 'guide'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
                      }`}
                    >
                      <BookOpen size={13} />
                      <span>Study Guide</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStudyTab('flashcards');
                        handleGenerateStudyAsset('flashcards');
                      }}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        studyTab === 'flashcards'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
                      }`}
                    >
                      <Brain size={13} />
                      <span>Flashcards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStudyTab('quiz');
                        handleGenerateStudyAsset('quiz');
                      }}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        studyTab === 'quiz'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
                      }`}
                    >
                      <Award size={13} />
                      <span>Practice Quiz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStudyTab('audio_overview');
                        handleGenerateStudyAsset('audio-overview');
                      }}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        studyTab === 'audio_overview'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
                      }`}
                    >
                      <Radio size={13} />
                      <span>Audio Overview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudyTab('chat')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        studyTab === 'chat'
                          ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
                      }`}
                    >
                      <MessageSquare size={13} />
                      <span>Chat with Notes</span>
                    </button>
                  </div>
                </div>

                {/* Sub-view Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {/* Loading indicator */}
                  {isAiProcessing && (
                    <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 text-center space-y-3">
                      <Sparkles size={28} className="mx-auto text-indigo-600 animate-spin" />
                      <div className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                        {language === 'en'
                          ? 'Synthesizing with Gemini Academic Engine...'
                          : 'Sedang menganalisis catatan dan menyintesis materi pembelajaran...'}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-zinc-400 max-w-md mx-auto">
                        Mengekstrak konsep inti, menyusun peta pengetahuan, dan memastikan akurasi data.
                      </p>
                    </div>
                  )}

                  {/* 1. STUDY GUIDE VIEW */}
                  {studyTab === 'guide' && aiStudyData && !isAiProcessing && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/60">
                        <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                          {aiStudyData.title || 'Panduan Belajar Komprehensif'}
                        </h3>
                        <p className="text-xs text-stone-700 dark:text-zinc-300 leading-relaxed">
                          {aiStudyData.executiveSummary}
                        </p>
                      </div>

                      {/* Core Concepts */}
                      {aiStudyData.coreConcepts && aiStudyData.coreConcepts.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                            Konsep Kunci & Definisi
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {aiStudyData.coreConcepts.map((c: any, i: number) => (
                              <div
                                key={i}
                                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-zinc-700/80 space-y-1.5"
                              >
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  {c.term}
                                </div>
                                <div className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed">
                                  {c.definition}
                                </div>
                                {c.practicalExample && (
                                  <div className="text-[11px] text-stone-500 dark:text-zinc-400 italic pt-1 border-t border-stone-200/50 dark:border-zinc-700/50">
                                    💡 Contoh: {c.practicalExample}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Takeaways */}
                      {aiStudyData.keyTakeaways && aiStudyData.keyTakeaways.length > 0 && (
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                            <Check size={14} />
                            <span>Poin Inti yang Wajib Diingat</span>
                          </h4>
                          <ul className="space-y-1 text-xs text-stone-700 dark:text-zinc-300 list-disc list-inside">
                            {aiStudyData.keyTakeaways.map((point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. FLASHCARDS VIEW (Active Recall) */}
                  {studyTab === 'flashcards' && aiStudyData?.flashcards && !isAiProcessing && (
                    <div className="space-y-4 max-w-xl mx-auto">
                      {/* Score Tracker */}
                      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                        <span>
                          Kartu {activeFlashcardIndex + 1} dari {aiStudyData.flashcards.length}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {masteredCards.size} Dikuasai
                        </span>
                      </div>

                      {/* 3D Flip Card Container */}
                      {aiStudyData.flashcards[activeFlashcardIndex] && (
                        <div
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="min-h-[260px] p-6 rounded-3xl bg-linear-to-b from-stone-50 to-stone-100 dark:from-zinc-800 dark:to-zinc-850 border border-stone-200 dark:border-zinc-700 shadow-md flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-center justify-between text-xs text-stone-400">
                            <span className="uppercase tracking-wider font-bold text-[10px]">
                              {isCardFlipped ? 'Jawaban & Penjelasan' : 'Pertanyaan / Konsep'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-zinc-700 font-mono">
                              {aiStudyData.flashcards[activeFlashcardIndex].category || 'Bab'}
                            </span>
                          </div>

                          <div className="text-center py-6">
                            <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100 leading-snug">
                              {isCardFlipped
                                ? aiStudyData.flashcards[activeFlashcardIndex].back
                                : aiStudyData.flashcards[activeFlashcardIndex].front}
                            </div>

                            {showCardHint && !isCardFlipped && (
                              <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 italic">
                                💡 Petunjuk: {aiStudyData.flashcards[activeFlashcardIndex].hint}
                              </div>
                            )}
                          </div>

                          <div className="text-center text-[11px] text-stone-400 flex items-center justify-center gap-1">
                            <RotateCcw size={12} />
                            <span>Klik kartu untuk membalik</span>
                          </div>
                        </div>
                      )}

                      {/* Flashcard Nav Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <button
                          type="button"
                          disabled={activeFlashcardIndex === 0}
                          onClick={() => {
                            setActiveFlashcardIndex((i) => Math.max(0, i - 1));
                            setIsCardFlipped(false);
                            setShowCardHint(false);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                        >
                          ← Sebelumnya
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowCardHint(!showCardHint)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold cursor-pointer"
                        >
                          {showCardHint ? 'Sembunyikan Petunjuk' : 'Buka Petunjuk'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const cardId = aiStudyData.flashcards[activeFlashcardIndex].id;
                            const nextSet = new Set(masteredCards);
                            if (nextSet.has(cardId)) nextSet.delete(cardId);
                            else nextSet.add(cardId);
                            setMasteredCards(nextSet);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            masteredCards.has(aiStudyData.flashcards[activeFlashcardIndex]?.id)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300'
                          }`}
                        >
                          {masteredCards.has(aiStudyData.flashcards[activeFlashcardIndex]?.id)
                            ? '✓ Dikuasai'
                            : 'Tandai Dikuasai'}
                        </button>

                        <button
                          type="button"
                          disabled={activeFlashcardIndex >= aiStudyData.flashcards.length - 1}
                          onClick={() => {
                            setActiveFlashcardIndex((i) =>
                              Math.min(aiStudyData.flashcards.length - 1, i + 1)
                            );
                            setIsCardFlipped(false);
                            setShowCardHint(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                        >
                          Berikutnya →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. PRACTICE QUIZ VIEW */}
                  {studyTab === 'quiz' && aiStudyData?.questions && !isAiProcessing && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                          {aiStudyData.quizTitle || 'Ujian Latihan Pemahaman'}
                        </h3>
                        {isQuizSubmitted && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                            Skor:{' '}
                            {
                              aiStudyData.questions.filter(
                                (q: any) => userQuizAnswers[q.id] === q.correctIndex
                              ).length
                            }{' '}
                            / {aiStudyData.questions.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        {aiStudyData.questions.map((q: any, qIdx: number) => {
                          const selected = userQuizAnswers[q.id];
                          const isAnswered = selected !== undefined;
                          const isCorrect = isAnswered && selected === q.correctIndex;

                          return (
                            <div
                              key={q.id || qIdx}
                              className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/40 border border-stone-200 dark:border-zinc-700/80 space-y-3"
                            >
                              <div className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                                {qIdx + 1}. {q.question}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt: string, optIdx: number) => {
                                  const isOptionChosen = selected === optIdx;
                                  let optionClass =
                                    'border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-400';

                                  if (isQuizSubmitted) {
                                    if (optIdx === q.correctIndex) {
                                      optionClass =
                                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold';
                                    } else if (isOptionChosen && !isCorrect) {
                                      optionClass =
                                        'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300';
                                    }
                                  } else if (isOptionChosen) {
                                    optionClass =
                                      'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold';
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      disabled={isQuizSubmitted}
                                      onClick={() =>
                                        setUserQuizAnswers({ ...userQuizAnswers, [q.id]: optIdx })
                                      }
                                      className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${optionClass}`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {isQuizSubmitted && (
                                <div className="text-[11px] text-stone-600 dark:text-zinc-400 p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-750 border border-stone-200/60 dark:border-zinc-700/60">
                                  <strong>Penjelasan:</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2">
                        {!isQuizSubmitted ? (
                          <button
                            type="button"
                            onClick={() => setIsQuizSubmitted(true)}
                            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
                          >
                            Kirim Jawaban & Periksa Skor
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setUserQuizAnswers({});
                              setIsQuizSubmitted(false);
                            }}
                            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 transition-all cursor-pointer"
                          >
                            Ulangi Kuis
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. AUDIO OVERVIEW VIEW (Podcast Deep Dive) */}
                  {studyTab === 'audio_overview' && aiStudyData?.dialogue && !isAiProcessing && (
                    <div className="space-y-4">
                      {/* Audio Player Banner */}
                      <div className="p-5 rounded-3xl bg-linear-to-r from-indigo-900 to-violet-900 text-white shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                              NotebookLM Deep Dive Podcast
                            </span>
                            <h3 className="text-sm font-bold">{aiStudyData.episodeTitle || 'Membedah Catatan'}</h3>
                          </div>
                          <span className="text-xs text-indigo-200 font-mono">
                            {aiStudyData.durationEstimate || '5 mnt'}
                          </span>
                        </div>

                        {/* Player Control */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleTogglePodcastAudio}
                            className="w-10 h-10 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
                          >
                            {isPodcastPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                          </button>

                          <div className="flex-1 text-xs">
                            <div className="font-semibold">
                              {isPodcastPlaying ? 'Sedang memutar audio podcast...' : 'Putar Siniar Bersama Host'}
                            </div>
                            <div className="text-[10px] text-indigo-200">
                              {isPodcastPlaying
                                ? `Pembicara: ${aiStudyData.dialogue[activeSpeakerIndex]?.speaker || 'Alex'}`
                                : 'Menggunakan suara browser (Web Speech Synthesizer)'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Script Dialogue Flow */}
                      <div className="space-y-2.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                          Transkrip Percakapan Siniar
                        </div>
                        {aiStudyData.dialogue.map((d: any, idx: number) => {
                          const isAlex = d.speaker === 'Alex';
                          const isCurrent = isPodcastPlaying && activeSpeakerIndex === idx;

                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border text-xs transition-all ${
                                isCurrent
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-xs'
                                  : 'border-stone-200/80 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/30'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`font-bold text-[11px] ${
                                    isAlex ? 'text-indigo-600 dark:text-indigo-400' : 'text-teal-600 dark:text-teal-400'
                                  }`}
                                >
                                  🎙️ {d.speaker} ({d.role})
                                </span>
                              </div>
                              <p className="text-stone-700 dark:text-zinc-300 leading-relaxed">{d.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 5. GROUNDED CHAT WITH NOTES */}
                  {studyTab === 'chat' && (
                    <div className="space-y-3 flex flex-col h-[520px]">
                      {/* Messages Scroll Area */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {chatMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                                msg.role === 'user'
                                  ? 'bg-emerald-600 text-white rounded-br-none'
                                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 rounded-bl-none border border-stone-200/60 dark:border-zinc-700/60'
                              }`}
                            >
                              <div>{msg.text}</div>

                              {/* Grounded Citations */}
                              {msg.citations && msg.citations.length > 0 && (
                                <div className="p-2 rounded-xl bg-stone-200/60 dark:bg-zinc-700/60 text-[10px] space-y-1">
                                  <div className="font-bold text-stone-500 dark:text-zinc-300 flex items-center gap-1">
                                    <span>📌 Kutipan Sumber Catatan:</span>
                                  </div>
                                  {msg.citations.map((c, i) => (
                                    <div key={i} className="italic text-stone-600 dark:text-zinc-300">
                                      "{c}"
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input Bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendStudyChat()}
                          placeholder={
                            language === 'en'
                              ? 'Ask anything strictly about this note...'
                              : 'Tanyakan apa saja khusus mengenai catatan ini...'
                          }
                          className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-zinc-100 focus:outline-emerald-500"
                        />
                        <button
                          type="button"
                          disabled={isAiProcessing || !chatInput.trim()}
                          onClick={handleSendStudyChat}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 cursor-pointer shadow-xs"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-stone-400 space-y-3">
              <FileText size={36} className="opacity-30" />
              <div className="text-sm font-semibold">Pilih atau buat catatan untuk memulai</div>
              <button
                type="button"
                onClick={handleCreateNote}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-500"
              >
                + Catatan Baru
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Notebook */}
      {isNewNotebookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">
              {language === 'en' ? 'Create New Notebook' : 'Buat Notebook Baru'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-1">
                  Nama Notebook
                </label>
                <input
                  type="text"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder="e.g. Matematika Diskrit / Riset Finansial"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-zinc-100 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-1">
                  Warna Label
                </label>
                <div className="flex items-center gap-2">
                  {[
                    'from-rose-500 to-pink-600',
                    'from-amber-500 to-orange-600',
                    'from-emerald-500 to-teal-600',
                    'from-blue-500 to-cyan-600',
                    'from-violet-500 to-indigo-600',
                  ].map((grad) => (
                    <button
                      key={grad}
                      type="button"
                      onClick={() => setNewNotebookColor(grad)}
                      className={`w-6 h-6 rounded-full bg-linear-to-r ${grad} cursor-pointer ${
                        newNotebookColor === grad ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewNotebookModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newNotebookName.trim()) return;
                  const newNb: NotebookFolder = {
                    id: 'nb-' + Date.now(),
                    name: newNotebookName.trim(),
                    icon: 'Folder',
                    color: newNotebookColor,
                  };
                  setNotebooks([...notebooks, newNb]);
                  setSelectedNotebookId(newNb.id);
                  setNewNotebookName('');
                  setIsNewNotebookModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
              >
                Buat Notebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
