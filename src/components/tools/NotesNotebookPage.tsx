import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { Link } from 'react-router-dom';
import { ShadcnSelect } from '../ui/select';
import { TriliumCodeEditor } from './trilium/TriliumCodeEditor';
import { DesktopOnlyNotice } from './common/DesktopOnlyNotice';
import {
  Folder,
  FolderOpen,
  FileText,
  Code,
  CheckSquare,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
  Copy,
  Check,
  Printer,
  Calendar,
  Clock,
  Tag,
  Hash,
  Sliders,
  X,
  Edit3,
  List,
  ListOrdered,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  Minus,
  Highlighter,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  FileUp,
  FileDown,
  RotateCcw,
  Columns,
  ArrowLeft,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Compass,
  BookOpen,
  Sun,
  Moon,
  Globe,
  Grid,
  Rows,
} from 'lucide-react';

// TipTap Rich Editor Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link as LinkExtension } from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

const lowlightInstance = createLowlight(common);

export const RICH_CODE_LANGUAGES = [
  { id: 'typescript', name: 'TypeScript', ext: '.ts' },
  { id: 'javascript', name: 'JavaScript', ext: '.js' },
  { id: 'python', name: 'Python', ext: '.py' },
  { id: 'html', name: 'HTML', ext: '.html' },
  { id: 'css', name: 'CSS', ext: '.css' },
  { id: 'json', name: 'JSON', ext: '.json' },
  { id: 'sql', name: 'SQL', ext: '.sql' },
  { id: 'rust', name: 'Rust', ext: '.rs' },
  { id: 'go', name: 'Go', ext: '.go' },
  { id: 'markdown', name: 'Markdown', ext: '.md' },
  { id: 'bash', name: 'Bash / Shell', ext: '.sh' },
];

// Trilium Note Model
export type TriliumNoteType = 'text' | 'code' | 'tasklist' | 'folder' | 'bookmark';

export interface TriliumAttribute {
  id: string;
  name: string;
  value: string;
  type: 'label' | 'relation';
}

export interface TriliumNote {
  id: string;
  parentId: string | null; // null means top-level root child
  title: string;
  type: TriliumNoteType;
  content: string; // Rich HTML content or code string
  codeLanguage?: string;
  bookmarkUrl?: string;
  attributes: TriliumAttribute[];
  isPinned?: boolean;
  isExpanded?: boolean;
  createdAt: number;
  updatedAt: number;
}

// Initial Trilium Tree Sample Data with clean, rich structure
const DEFAULT_TRILIUM_NOTES: TriliumNote[] = [
  {
    id: 'root-welcome',
    parentId: null,
    title: 'Selamat Datang di Trilium Notes',
    type: 'text',
    content: `<h1>Panduan Personal Knowledge Base & Rekayasa Sistem</h1>
<p>Trilium Notes adalah sistem pencatatan hierarkis (<em>hierarchical note-taking</em>) yang dirancang untuk mengorganisasi basis pengetahuan pribadi tanpa batas kedalaman folder.</p>

<h2>Hierarki Judul & Tipografi (H1, H2, H3)</h2>
<p>Sistem tipografi telah disesuaikan dengan hierarki visual yang kontras dan jelas:</p>
<h3>Sub-Bab Teknis: Fitur Unggulan Siap Pakai</h3>

<p><strong>Contoh Daftar Poin (Bullet List):</strong></p>
<ul>
  <li>Hierarki pohon catatan tanpa batas kedalaman (<em>infinite nested tree</em>)</li>
  <li>Editor visual WYSIWYG murni (teks tebal, garis bawah, stabilo, heading, tabel rapi)</li>
  <li>Toolbar tabel interaktif: tambah/hapus baris & kolom dengan 1 klik</li>
  <li>Tipe Catatan Fleksibel: Rich Text, Code Snippet, Checklist Tugas, dan Folder</li>
</ul>

<p><strong>Contoh Daftar Nomor Berurutan (Ordered List):</strong></p>
<ol>
  <li>Langkah pertama: Pilih atau buat catatan baru di panel kiri</li>
  <li>Langkah kedua: Tulis konten dengan toolbar format (H1, H2, H3, Bold, List, Kode)</li>
  <li>Langkah ketiga: Sisipkan blok kode dengan syntax highlighting otomatis</li>
  <li>Langkah keempat: Ekspor atau simpan catatan secara lokal</li>
</ol>

<h3>Blok Kode dengan Syntax Highlighting & Bahasa Pilihan</h3>
<p>Anda sekarang dapat menyisipkan cuplikan kode dengan pilihan bahasa di dalam Rich Text:</p>

<pre><code class="language-typescript">import type { Request, Response } from 'express';

export interface ApiResponse&lt;T&gt; {
  success: boolean;
  data: T;
  timestamp: number;
}

export function createSuccessResponse&lt;T&gt;(data: T): ApiResponse&lt;T&gt; {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  };
}</code></pre>

<h3>Contoh Checklist Tugas Interaktif:</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><div>Hierarki visual H1, H2, H3 dengan pembeda ukuran yang tegas</div></li>
  <li data-type="taskItem" data-checked="true"><div>Daftar poin (bullet list) & nomor (ordered list) tampil rapi</div></li>
  <li data-type="taskItem" data-checked="true"><div>Blok kode kaya dengan pemilih bahasa & tema VS Code Dark Modern</div></li>
  <li data-type="taskItem" data-checked="true"><div>Editor Code Snippet murni tanpa chrome VS Code</div></li>
</ul>

<h3>Contoh Tabel Data Terstruktur:</h3>
<table>
  <thead>
    <tr>
      <th>Fitur</th>
      <th>Status</th>
      <th>Keterangan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Editor WYSIWYG</strong></td>
      <td><mark>Aktif</mark></td>
      <td>Tanpa perlu mengetik sintaks kode Markdown manual</td>
    </tr>
    <tr>
      <td><strong>Blok Kode Berbahasa</strong></td>
      <td><mark>Aktif</mark></td>
      <td>Syntax highlighting otomatis dengan Lowlight</td>
    </tr>
    <tr>
      <td><strong>Tabel Interaktif</strong></td>
      <td><mark>Aktif</mark></td>
      <td>Mendukung manipulasi baris dan kolom instan</td>
    </tr>
  </tbody>
</table>

<blockquote><p>💡 <strong>Tip Cepat:</strong> Klik tombol <strong>Kode</strong> di toolbar untuk menyisipkan blok kode baru dengan bahasa favorit Anda (TypeScript, Python, SQL, Rust, Go, dll).</p></blockquote>`,
    attributes: [
      { id: 'attr-1', name: 'status', value: 'active', type: 'label' },
      { id: 'attr-2', name: 'workspace', value: 'knowledge-base', type: 'label' },
    ],
    isPinned: true,
    isExpanded: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'folder-engineering',
    parentId: null,
    title: 'Rekayasa Perangkat Lunak & Sistem',
    type: 'folder',
    content: `<h2>Koleksi Catatan Arsitektur & Rekayasa</h2>
<p>Folder ini mengelompokkan catatan teknis seputar arsitektur database, desain sistem RESTful, dan cuplikan kode backend.</p>`,
    attributes: [
      { id: 'attr-3', name: 'category', value: 'engineering', type: 'label' },
    ],
    isExpanded: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'note-api-design',
    parentId: 'folder-engineering',
    title: 'Desain RESTful API & Standar HTTP',
    type: 'text',
    content: `<h2>Panduan Standar Desain API</h2>
<p>Setiap endpoint HTTP harus menggunakan format respons JSON seragam untuk memudahkan integrasi front-end:</p>
<table>
  <thead>
    <tr>
      <th>Field</th>
      <th>Tipe</th>
      <th>Keterangan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>success</code></td>
      <td>boolean</td>
      <td>Status keberhasilan eksekusi request</td>
    </tr>
    <tr>
      <td><code>data</code></td>
      <td>object / array</td>
      <td>Payload hasil query yang dikembalikan</td>
    </tr>
    <tr>
      <td><code>error</code></td>
      <td>string / null</td>
      <td>Pesan kesalahan jika gagal</td>
    </tr>
  </tbody>
</table>
<p>Gunakan status code HTTP yang sesuai: <code>200 OK</code>, <code>201 Created</code>, <code>400 Bad Request</code>, <code>401 Unauthorized</code>, dan <code>404 Not Found</code>.</p>`,
    attributes: [
      { id: 'attr-4', name: 'tag', value: 'api', type: 'label' },
      { id: 'attr-5', name: 'reviewed', value: 'yes', type: 'label' },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
    updatedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 'note-code-snippet',
    parentId: 'folder-engineering',
    title: 'Cuplikan: Rate Limiter Middleware',
    type: 'code',
    codeLanguage: 'typescript',
    content: `import type { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function createRateLimiter(limit: number = 60, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(ip);

    if (!entry || now > entry.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please slow down.'
      });
    }

    entry.count++;
    return next();
  };
}`,
    attributes: [
      { id: 'attr-6', name: 'lang', value: 'typescript', type: 'label' },
      { id: 'attr-7', name: 'type', value: 'middleware', type: 'label' },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'folder-projects',
    parentId: null,
    title: 'Rencana Proyek & Prioritas Tugas',
    type: 'tasklist',
    content: `<h2>Daftar Prioritas Pengembangan Q3</h2>
<p>Checklist tugas utama yang sedang dikerjakan:</p>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><div>Riset arsitektur database terdistribusi</div></li>
  <li data-type="taskItem" data-checked="true"><div>Migrasi editor catatan ke TipTap WYSIWYG murni</div></li>
  <li data-type="taskItem" data-checked="true"><div>Penyempurnaan toolbar tabel interaktif & aksi baris/kolom</div></li>
  <li data-type="taskItem" data-checked="false"><div>Integrasi ekspor cadangan JSON & impor catatan</div></li>
  <li data-type="taskItem" data-checked="false"><div>Sinkronisasi tema portfolio rose & dark mode</div></li>
</ul>`,
    attributes: [
      { id: 'attr-8', name: 'priority', value: 'high', type: 'label' },
    ],
    isExpanded: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 8,
  },
];

export const NotesNotebookPage: React.FC = () => {
  const { language, toggleLanguage, theme, toggleTheme } = usePortfolio();

  // State: Notes Tree
  const [notes, setNotes] = useState<TriliumNote[]>(() => {
    try {
      const saved = localStorage.getItem('trilium_notes_store_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_TRILIUM_NOTES;
    } catch {
      return DEFAULT_TRILIUM_NOTES;
    }
  });

  // Active Note & Open Tabs
  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    return notes[0]?.id || 'root-welcome';
  });
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    return notes.slice(0, 3).map((n) => n.id);
  });

  // Hoisted Note (Trilium feature: isolate and focus subtree)
  const [hoistedNoteId, setHoistedNoteId] = useState<string | null>(null);

  // UI Panels state
  const [isTreeSidebarOpen, setIsTreeSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Table Dropdown Popover
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  // Code Block Language Dropdown Popover
  const [isCodeMenuOpen, setIsCodeMenuOpen] = useState(false);
  const codeMenuRef = useRef<HTMLDivElement>(null);

  // New Note Modal
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [newNoteParentId, setNewNoteParentId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteType, setNewNoteType] = useState<TriliumNoteType>('text');

  // Attribute Editor State
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trilium_notes_store_v3', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Close table and code menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target as Node)) {
        setIsTableMenuOpen(false);
      }
      if (codeMenuRef.current && !codeMenuRef.current.contains(e.target as Node)) {
        setIsCodeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Current Active Note
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // TipTap Rich Editor Setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight: lowlightInstance,
        defaultLanguage: 'typescript',
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'trilium-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-rose-600 dark:text-rose-400 underline font-medium hover:opacity-80',
        },
      }),
      Placeholder.configure({
        placeholder:
          language === 'en'
            ? 'Write effortlessly... Add headings, bold text, tables, checklists, and notes.'
            : 'Tulis dengan leluasa... Tambahkan heading, teks tebal, tabel, checklist tugas, dan kutipan.',
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'tiptap-content outline-none focus:outline-none min-h-[480px] p-6 text-stone-900 dark:text-zinc-100 font-sans leading-relaxed text-sm sm:text-base',
      },
    },
    content: activeNote?.content || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (activeNote) {
        setNotes((prev) =>
          prev.map((n) => (n.id === activeNote.id ? { ...n, content: html, updatedAt: Date.now() } : n))
        );
      }
    },
  });

  // Sync editor content when active note switches
  useEffect(() => {
    if (!editor || !activeNote) return;
    if (activeNote.type !== 'code') {
      const currentHTML = editor.getHTML();
      if (currentHTML !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '<p></p>', { emitUpdate: false });
      }
    }
  }, [activeNote?.id, editor]);

  // Breadcrumbs Hierarchy Path
  const breadcrumbPath = useMemo(() => {
    if (!activeNote) return [];
    const path: TriliumNote[] = [];
    let curr: TriliumNote | undefined = activeNote;

    while (curr) {
      path.unshift(curr);
      if (curr.parentId) {
        curr = notes.find((n) => n.id === curr!.parentId);
      } else {
        break;
      }
    }
    return path;
  }, [activeNote, notes]);

  // All distinct labels across all notes
  const allLabels = useMemo(() => {
    const map = new Map<string, number>();
    notes.forEach((n) => {
      n.attributes.forEach((attr) => {
        if (attr.type === 'label') {
          const key = attr.value ? `${attr.name}=${attr.value}` : attr.name;
          map.set(key, (map.get(key) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  }, [notes]);

  // Sub-notes of active note
  const childNotesOfActive = useMemo(() => {
    if (!activeNote) return [];
    return notes.filter((n) => n.parentId === activeNote.id);
  }, [activeNote, notes]);

  // Words & Character Count
  const stats = useMemo(() => {
    if (!activeNote) return { words: 0, chars: 0, minutes: 1 };
    const plainText = activeNote.content.replace(/<[^>]+>/g, ' ').trim();
    const words = plainText ? plainText.split(/\s+/).length : 0;
    const chars = plainText.length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, minutes };
  }, [activeNote?.content]);

  // Update Note Helper
  const updateNote = (id: string, updates: Partial<TriliumNote>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    );
  };

  // Open note in tab
  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    if (!openTabIds.includes(id)) {
      setOpenTabIds([...openTabIds, id]);
    }
  };

  // Close tab
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTabs = openTabIds.filter((t) => t !== id);
    setOpenTabIds(nextTabs);
    if (activeNoteId === id) {
      if (nextTabs.length > 0) {
        setActiveNoteId(nextTabs[nextTabs.length - 1]);
      } else if (notes.length > 0) {
        setActiveNoteId(notes[0].id);
        setOpenTabIds([notes[0].id]);
      }
    }
  };

  // Add child or sibling note
  const handleOpenCreateModal = (parentId: string | null) => {
    setNewNoteParentId(parentId);
    setNewNoteTitle('');
    setNewNoteType('text');
    setIsNewNoteModalOpen(true);
  };

  const handleCreateNoteConfirm = () => {
    if (!newNoteTitle.trim()) return;

    let defaultContent = '<p></p>';
    if (newNoteType === 'tasklist') {
      defaultContent = `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><div>${newNoteTitle.trim()}</div></li></ul>`;
    } else if (newNoteType === 'code') {
      defaultContent = `// Tulis kode di sini\nconsole.log("Hello Trilium");`;
    } else if (newNoteType === 'folder') {
      defaultContent = `<h2>Folder: ${newNoteTitle.trim()}</h2><p>Deskripsi kumpulan sub-catatan...</p>`;
    } else if (newNoteType === 'bookmark') {
      defaultContent = `<h2>Tautan Web: ${newNoteTitle.trim()}</h2><p>Catatan referensi tautan web penting.</p>`;
    }

    const newNote: TriliumNote = {
      id: 'note-' + Date.now(),
      parentId: newNoteParentId,
      title: newNoteTitle.trim(),
      type: newNoteType,
      content: defaultContent,
      codeLanguage: newNoteType === 'code' ? 'typescript' : undefined,
      attributes: [],
      isExpanded: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (newNoteParentId) {
      setNotes((prev) =>
        prev.map((n) => (n.id === newNoteParentId ? { ...n, isExpanded: true } : n)).concat(newNote)
      );
    } else {
      setNotes((prev) => [newNote, ...prev]);
    }

    setIsNewNoteModalOpen(false);
    handleSelectNote(newNote.id);
  };

  // Delete note (and recursively delete children)
  const handleDeleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    if (
      !confirm(
        language === 'en'
          ? `Delete "${target.title}" and all its sub-notes?`
          : `Hapus "${target.title}" beserta seluruh sub-catatannya?`
      )
    )
      return;

    const idsToDelete = new Set<string>();
    const gatherIds = (targetId: string) => {
      idsToDelete.add(targetId);
      notes.filter((n) => n.parentId === targetId).forEach((child) => gatherIds(child.id));
    };
    gatherIds(id);

    const remaining = notes.filter((n) => !idsToDelete.has(n.id));
    setNotes(remaining);
    setOpenTabIds((prev) => prev.filter((t) => !idsToDelete.has(t)));

    if (idsToDelete.has(activeNoteId)) {
      if (remaining.length > 0) setActiveNoteId(remaining[0].id);
    }
  };

  // Duplicate Note
  const handleDuplicateNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const duplicated: TriliumNote = {
      ...target,
      id: 'note-' + Date.now(),
      title: target.title + ' (Salinan)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [duplicated, ...prev]);
    handleSelectNote(duplicated.id);
  };

  // Toggle tree node expansion
  const handleToggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote(id, { isExpanded: !notes.find((n) => n.id === id)?.isExpanded });
  };

  // Add Attribute / Label to active note
  const handleAddAttribute = () => {
    if (!activeNote || !newAttrName.trim()) return;
    const newAttr: TriliumAttribute = {
      id: 'attr-' + Date.now(),
      name: newAttrName.trim().toLowerCase(),
      value: newAttrValue.trim(),
      type: 'label',
    };
    updateNote(activeNote.id, {
      attributes: [...activeNote.attributes, newAttr],
    });
    setNewAttrName('');
    setNewAttrValue('');
  };

  const handleRemoveAttribute = (attrId: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, {
      attributes: activeNote.attributes.filter((a) => a.id !== attrId),
    });
  };

  // Export & Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `trilium-notes-backup-${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          setNotes(imported);
          alert(language === 'en' ? 'Notes restored successfully!' : 'Catatan berhasil dipulihkan!');
          setActiveNoteId(imported[0].id);
        } else {
          alert('Format cadangan JSON tidak cocok.');
        }
      } catch {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Demo Data
  const handleResetToDemo = () => {
    if (
      confirm(
        language === 'en'
          ? 'Reset all notes to sample knowledge base?'
          : 'Kembalikan catatan ke contoh awal Trilium?'
      )
    ) {
      setNotes(DEFAULT_TRILIUM_NOTES);
      setActiveNoteId(DEFAULT_TRILIUM_NOTES[0].id);
      setOpenTabIds([DEFAULT_TRILIUM_NOTES[0].id]);
    }
  };

  // Insert Table via TipTap
  const handleInsertTable = (rows: number, cols: number) => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setIsTableMenuOpen(false);
  };

  // Check if cursor is inside a table
  const isInsideTable = editor?.isActive('table');

  // Tree rendering recursive component
  const renderTreeNodes = (parentId: string | null, depth: number = 0) => {
    const childNotes = notes.filter((n) => n.parentId === parentId);

    const visibleChildren = childNotes.filter((note) => {
      if (selectedLabelFilter) {
        const hasLabel = note.attributes.some((a) => {
          const key = a.value ? `${a.name}=${a.value}` : a.name;
          return key === selectedLabelFilter;
        });
        if (!hasLabel) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesThis = note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
        const hasMatchingChild = (targetId: string): boolean => {
          return notes
            .filter((c) => c.parentId === targetId)
            .some(
              (c) =>
                c.title.toLowerCase().includes(q) ||
                c.content.toLowerCase().includes(q) ||
                hasMatchingChild(c.id)
            );
        };
        return matchesThis || hasMatchingChild(note.id);
      }
      return true;
    });

    if (visibleChildren.length === 0 && childNotes.length > 0 && (searchQuery || selectedLabelFilter)) {
      return null;
    }

    return visibleChildren.map((note) => {
      const hasChildren = notes.some((n) => n.parentId === note.id);
      const isSelected = activeNoteId === note.id;
      const isExpanded = note.isExpanded ?? true;

      const getNoteIcon = () => {
        if (note.type === 'folder') {
          return isExpanded ? (
            <FolderOpen size={14} className="text-amber-500 shrink-0" />
          ) : (
            <Folder size={14} className="text-amber-500 shrink-0" />
          );
        }
        if (note.type === 'code') {
          return <Code size={14} className="text-rose-500 shrink-0" />;
        }
        if (note.type === 'tasklist') {
          return <CheckSquare size={14} className="text-emerald-500 shrink-0" />;
        }
        if (note.type === 'bookmark') {
          return <Bookmark size={14} className="text-indigo-500 shrink-0" />;
        }
        return <FileText size={14} className="text-stone-400 dark:text-zinc-500 shrink-0" />;
      };

      return (
        <div key={note.id} className="select-none">
          <div
            onClick={() => handleSelectNote(note.id)}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
            className={`group flex items-center justify-between py-1.5 pr-2 rounded-xl text-xs transition-all cursor-pointer ${
              isSelected
                ? 'bg-rose-500/10 text-rose-900 dark:text-rose-200 font-semibold border-l-3 border-rose-600 shadow-2xs'
                : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-200/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => handleToggleExpand(note.id, e)}
                  className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded shrink-0 cursor-pointer"
                >
                  {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              ) : (
                <div className="w-4 shrink-0" />
              )}

              {getNoteIcon()}

              <span className="truncate text-left flex-1">{note.title || 'Tanpa Judul'}</span>
            </div>

            {/* Quick Action buttons on hover */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCreateModal(note.id);
                }}
                className="p-1 rounded-lg hover:bg-stone-300 dark:hover:bg-zinc-700 text-stone-400 hover:text-rose-600 cursor-pointer"
                title="Tambah Sub-catatan di bawah ini"
              >
                <Plus size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.id);
                }}
                className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 cursor-pointer"
                title="Hapus Catatan"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Render Children if expanded */}
          {hasChildren && isExpanded && renderTreeNodes(note.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <DesktopOnlyNotice
      toolName="Trilium Notes"
      badgeText="Desktop Knowledge Base"
      description="dirancang khusus untuk pengalaman layar lebar. Struktur pohon folder tanpa batas, editor visual WYSIWYG, tabel interaktif, multi-tab dokumen, dan editor kode VS Code memerlukan ruang layar desktop agar optimal dan nyaman digunakan."
      icon={BookOpen}
      accentColor="rose"
    >
      <div className={`h-screen bg-stone-50 dark:bg-[#0f1013] text-stone-900 dark:text-zinc-100 flex flex-col font-sans overflow-hidden antialiased ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <Seo
        title={
          language === 'en'
            ? 'Trilium Notes: Hierarchical Personal Knowledge Base & Rich WYSIWYG Editor'
            : 'Trilium Notes: Basis Pengetahuan Hierarkis & Editor Visual WYSIWYG'
        }
        description={
          language === 'en'
            ? 'Desktop-grade hierarchical note-taking inspired by Trilium Notes: unlimited nested tree structure, pure WYSIWYG rich text editor with interactive tables, task lists, code snippets, tabs, and Trilium label attributes.'
            : 'Aplikasi catatan hierarkis ala Trilium Notes dengan struktur pohon tak terbatas, editor visual murni (WYSIWYG) tanpa kode markdown, tabel interaktif, checklist tugas, tab multi-catatan, dan label atribut.'
        }
        url="/tools/notes"
      />

      {/* TOP UNIFIED APP HEADER (No collision with global navbar) */}
      <header className="h-14 shrink-0 border-b border-stone-200 dark:border-zinc-800 bg-white/95 dark:bg-[#18191d]/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-3 z-30 relative select-none">
        
        {/* Left: Back to tools + Brand badge */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <Link
            to="/tools"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0 font-medium text-xs"
            title="Kembali ke Daftar Tools & Portofolio"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Portofolio</span>
          </Link>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 shrink-0" />

          {/* Brand Icon & Name with Portfolio Main Rose Color */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen size={16} />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tracking-tight">
                Trilium Notes
              </h1>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[9px] font-extrabold tracking-wider border border-rose-500/20 uppercase hidden sm:inline-block">
                Knowledge Base
              </span>
            </div>
          </div>
        </div>

        {/* Center: Hoisted view alert if active */}
        {hoistedNoteId ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs truncate">
            <Compass size={13} className="shrink-0 animate-spin" />
            <span className="truncate">
              Fokus: <strong>{notes.find((n) => n.id === hoistedNoteId)?.title}</strong>
            </span>
            <button
              type="button"
              onClick={() => setHoistedNoteId(null)}
              className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-bold cursor-pointer shrink-0"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center text-xs text-stone-400 dark:text-zinc-500 font-medium">
            <span>Editor visual hierarkis & catatan terstruktur</span>
          </div>
        )}

        {/* Right: Actions with portfolio main color buttons */}
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-300 text-xs">
          
          {/* New Note Button (Rose Accent) */}
          <button
            type="button"
            onClick={() => handleOpenCreateModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Catatan Baru</span>
          </button>

          {/* Import JSON */}
          <label
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors"
            title="Pulihkan Cadangan (Import JSON)"
          >
            <FileUp size={15} />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors"
            title="Unduh Cadangan Lengkap (Export JSON)"
          >
            <FileDown size={15} />
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Kembalikan catatan ke contoh bawaan lengkap (dengan contoh H1-H3, list, dan blok kode)?')) {
                setNotes(DEFAULT_TRILIUM_NOTES);
                setActiveNoteId(DEFAULT_TRILIUM_NOTES[0].id);
                setOpenTabIds(DEFAULT_TRILIUM_NOTES.slice(0, 3).map((n) => n.id));
                localStorage.setItem('trilium_notes_store_v3', JSON.stringify(DEFAULT_TRILIUM_NOTES));
              }
            }}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors"
            title="Kembalikan Catatan Contoh Bawaan"
          >
            <RotateCcw size={15} />
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors hidden sm:flex"
            title="Cetak Catatan / Simpan PDF"
          >
            <Printer size={15} />
          </button>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 shrink-0 mx-0.5" />

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300 font-bold text-[11px] cursor-pointer transition-colors"
            title="Ganti Bahasa (EN / ID)"
          >
            {language.toUpperCase()}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* BREADCRUMB & NOTE TABS STRIP */}
      <div className="h-10 bg-stone-100/80 dark:bg-[#1a1c21] border-b border-stone-200 dark:border-zinc-800/90 flex items-center justify-between px-2 sm:px-3 gap-2 select-none shrink-0 overflow-x-auto">
        
        {/* Left: Sidebar Toggle + Open Tabs */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setIsTreeSidebarOpen(!isTreeSidebarOpen)}
            className={`p-1.5 rounded-lg border text-stone-500 dark:text-zinc-400 cursor-pointer transition-colors shrink-0 ${
              isTreeSidebarOpen
                ? 'bg-stone-200/70 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700'
                : 'hover:bg-stone-200/50 dark:hover:bg-zinc-800/50 border-transparent'
            }`}
            title={isTreeSidebarOpen ? 'Tutup Panel Pohon Catatan' : 'Buka Panel Pohon Catatan'}
          >
            <Columns size={13} />
          </button>

          {/* Note Tabs with Rose Active Accent */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {openTabIds.map((tabId) => {
              const note = notes.find((n) => n.id === tabId);
              if (!note) return null;
              const isActiveTab = activeNoteId === tabId;

              return (
                <div
                  key={tabId}
                  onClick={() => handleSelectNote(tabId)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer border ${
                    isActiveTab
                      ? 'bg-white dark:bg-[#15171b] border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-zinc-100 font-semibold border-t-2 border-t-rose-600 shadow-2xs'
                      : 'bg-transparent border-transparent text-stone-500 dark:text-zinc-400 hover:bg-stone-200/50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {note.type === 'code' ? (
                    <Code size={13} className="text-rose-500 shrink-0" />
                  ) : note.type === 'tasklist' ? (
                    <CheckSquare size={13} className="text-emerald-500 shrink-0" />
                  ) : note.type === 'folder' ? (
                    <Folder size={13} className="text-amber-500 shrink-0" />
                  ) : (
                    <FileText size={13} className="text-stone-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[140px]">{note.title || 'Tanpa Judul'}</span>
                  <button
                    type="button"
                    onClick={(e) => handleCloseTab(tabId, e)}
                    className="hover:text-rose-500 rounded p-0.5 ml-1 text-stone-400 cursor-pointer"
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Breadcrumb Trail & Inspector Toggle */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-stone-500 dark:text-zinc-400 truncate shrink-0">
          <span className="text-stone-400 font-mono">root</span>
          {breadcrumbPath.map((item, idx) => (
            <React.Fragment key={item.id}>
              <ChevronRight size={11} className="text-stone-400 shrink-0" />
              <button
                type="button"
                onClick={() => handleSelectNote(item.id)}
                className={`hover:underline truncate cursor-pointer ${
                  idx === breadcrumbPath.length - 1 ? 'font-bold text-rose-600 dark:text-rose-400' : ''
                }`}
              >
                {item.title}
              </button>
            </React.Fragment>
          ))}

          <div className="h-3 w-px bg-stone-300 dark:bg-zinc-700 mx-1 shrink-0" />

          <button
            type="button"
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors shrink-0 ${
              isRightSidebarOpen
                ? 'bg-rose-600 text-white border-rose-600'
                : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-800 border-transparent'
            }`}
            title="Panel Metadata & Atribut Catatan"
          >
            <Sliders size={13} />
          </button>
        </div>
      </div>

      {/* 3-PANE WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANE 1: HIERARCHICAL TREE SIDEBAR */}
        {isTreeSidebarOpen && (
          <div className="w-64 sm:w-72 bg-stone-50/70 dark:bg-[#16171b] border-r border-stone-200 dark:border-zinc-800/90 flex flex-col shrink-0">
            
            {/* Tree Search & Quick Filter */}
            <div className="p-2.5 space-y-2 border-b border-stone-200 dark:border-zinc-800/80">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search note tree...' : 'Cari di hierarki catatan...'}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-[#141518] border border-stone-200 dark:border-zinc-800 text-xs text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-rose-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter by Trilium Label Chips */}
              {allLabels.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[10px]">
                  <span className="text-stone-400 font-bold uppercase shrink-0">Label:</span>
                  {allLabels.slice(0, 4).map(({ label, count }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setSelectedLabelFilter(selectedLabelFilter === label ? null : label)
                      }
                      className={`px-1.5 py-0.5 rounded-md border whitespace-nowrap cursor-pointer transition-colors ${
                        selectedLabelFilter === label
                          ? 'bg-rose-600 text-white border-rose-600 font-bold'
                          : 'bg-white dark:bg-[#141518] text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800'
                      }`}
                    >
                      #{label} ({count})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tree Notes List Container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {renderTreeNodes(hoistedNoteId || null)}
            </div>

            {/* Tree Bottom Info & Controls */}
            <div className="p-2.5 border-t border-stone-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
              <span>{notes.length} Total Catatan</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDemo}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 cursor-pointer"
                  title="Muat ulang contoh catatan"
                >
                  <RotateCcw size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
                >
                  + Tambah Root
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PANE 2: MAIN EDITOR WORKSPACE */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#15171b] overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Note Header (Title, Type & Label Badges) */}
              <div className="px-6 pt-4 pb-3 border-b border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    placeholder="Judul Catatan..."
                    className="w-full text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-100 bg-transparent border-none focus:outline-none placeholder-stone-300 dark:placeholder-zinc-600 tracking-tight"
                  />

                  {/* Trilium Label Badges (Rose Accent) */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {activeNote.attributes
                      .filter((a) => a.type === 'label')
                      .map((attr) => (
                        <span
                          key={attr.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20 font-mono text-[11px]"
                        >
                          <Hash size={10} />
                          <span>
                            {attr.name}
                            {attr.value ? `=${attr.value}` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attr.id)}
                            className="hover:text-rose-600 cursor-pointer ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                    <button
                      type="button"
                      onClick={() => setIsRightSidebarOpen(true)}
                      className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer font-medium"
                    >
                      + Tambah Label
                    </button>
                  </div>
                </div>

                {/* Actions & Note Type Selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-48">
                    <ShadcnSelect
                      value={activeNote.type}
                      onChange={(val) =>
                        updateNote(activeNote.id, { type: val as TriliumNoteType })
                      }
                      options={[
                        { value: 'text', label: '📝 Rich Text' },
                        { value: 'code', label: '💻 Code Snippet' },
                        { value: 'tasklist', label: '☑️ Task Checklist' },
                        { value: 'folder', label: '🗂️ Folder Overview' },
                      ]}
                      size="sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setHoistedNoteId(hoistedNoteId === activeNote.id ? null : activeNote.id)}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      hoistedNoteId === activeNote.id
                        ? 'bg-amber-500 text-white border-amber-500 font-bold'
                        : 'hover:bg-stone-100 dark:hover:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-500'
                    }`}
                    title={hoistedNoteId === activeNote.id ? 'Keluar dari Fokus Sub-Pohon' : 'Fokuskan Sub-Pohon Catatan Ini (Hoist)'}
                  >
                    <Compass size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicateNote(activeNote.id)}
                    className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200 cursor-pointer"
                    title="Gandakan Catatan"
                  >
                    <Copy size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-stone-200 dark:border-zinc-700 text-stone-400 hover:text-rose-600 cursor-pointer"
                    title="Hapus Catatan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* WYSIWYG FORMATTING TOOLBAR */}
              {activeNote.type !== 'code' && editor && (
                <div className="px-4 py-2 bg-stone-50/80 dark:bg-[#181a1f] border-b border-stone-200 dark:border-zinc-800 flex flex-wrap items-center gap-1 text-stone-700 dark:text-zinc-300 text-xs shrink-0 select-none">
                  
                  {/* Headings */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('heading', { level: 1 }) ? 'bg-rose-600 text-white font-bold' : ''
                    }`}
                    title="Heading 1"
                  >
                    <Heading1 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('heading', { level: 2 }) ? 'bg-rose-600 text-white font-bold' : ''
                    }`}
                    title="Heading 2"
                  >
                    <Heading2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('heading', { level: 3 }) ? 'bg-rose-600 text-white font-bold' : ''
                    }`}
                    title="Heading 3"
                  >
                    <Heading3 size={15} />
                  </button>

                  <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                  {/* Bold, Italic, Underline, Strikethrough, Highlight */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('bold') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Tebal (Ctrl+B)"
                  >
                    <Bold size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('italic') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Miring (Ctrl+I)"
                  >
                    <Italic size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('underline') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Garis Bawah (Ctrl+U)"
                  >
                    <UnderlineIcon size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('strike') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Coretan (Strikethrough)"
                  >
                    <Strikethrough size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('highlight') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Stabilo Sorot (Highlight)"
                  >
                    <Highlighter size={15} />
                  </button>

                  <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                  {/* Alignment */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive({ textAlign: 'left' }) ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Rata Kiri"
                  >
                    <AlignLeft size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive({ textAlign: 'center' }) ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Rata Tengah"
                  >
                    <AlignCenter size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive({ textAlign: 'right' }) ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Rata Kanan"
                  >
                    <AlignRight size={15} />
                  </button>

                  <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                  {/* Lists & Tasks */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('bulletList') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Daftar Poin (Bullet List)"
                  >
                    <List size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('orderedList') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Daftar Nomor (Ordered List)"
                  >
                    <ListOrdered size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('taskList') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Checklist Tugas Interaktif"
                  >
                    <CheckSquare size={15} />
                  </button>

                  <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                  {/* Quote & Horizontal Rule */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors ${
                      editor.isActive('blockquote') ? 'bg-rose-600 text-white' : ''
                    }`}
                    title="Kutipan (Blockquote)"
                  >
                    <Quote size={15} />
                  </button>

                  {/* Code Block with Language Selector */}
                  <div className="relative" ref={codeMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsCodeMenuOpen(!isCodeMenuOpen)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        editor.isActive('codeBlock')
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'hover:bg-stone-200 dark:hover:bg-zinc-800 border-stone-200 dark:border-zinc-700'
                      }`}
                      title="Sisipkan Blok Kode Berbahasa (Syntax Highlighting)"
                    >
                      <Code size={14} className={editor.isActive('codeBlock') ? 'text-white' : 'text-rose-600 dark:text-rose-400'} />
                      <span>Kode</span>
                      <ChevronDown size={11} />
                    </button>

                    {isCodeMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#1a1c21] rounded-xl shadow-xl border border-stone-200 dark:border-zinc-800 p-2 z-40 space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Pilih Bahasa Kode
                        </div>
                        <div className="max-h-56 overflow-y-auto space-y-0.5">
                          {RICH_CODE_LANGUAGES.map((lang) => (
                            <button
                              key={lang.id}
                              type="button"
                              onClick={() => {
                                editor.chain().focus().toggleCodeBlock({ language: lang.id }).run();
                                setIsCodeMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer transition-colors"
                            >
                              <span className="font-medium">{lang.name}</span>
                              <span className="text-[10px] font-mono text-stone-400 dark:text-zinc-500">
                                {lang.ext}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                    title="Garis Pemisah (Horizontal Rule)"
                  >
                    <Minus size={15} />
                  </button>

                  <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                  {/* TABLE DROPDOWN MENU */}
                  <div className="relative" ref={tableMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        isInsideTable
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300 dark:border-rose-800'
                          : 'hover:bg-stone-200 dark:hover:bg-zinc-800 border-stone-200 dark:border-zinc-700'
                      }`}
                      title="Sisipkan atau Kelola Tabel"
                    >
                      <TableIcon size={14} className="text-rose-600 dark:text-rose-400" />
                      <span>Tabel</span>
                      <ChevronDown size={11} />
                    </button>

                    {isTableMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-[#1a1c21] rounded-xl shadow-xl border border-stone-200 dark:border-zinc-800 p-2 z-40 space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Sisipkan Tabel Baru
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInsertTable(2, 2)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                        >
                          <span>Tabel Mini (2 × 2)</span>
                          <Grid size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTable(3, 3)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                        >
                          <span>Tabel Standar (3 × 3)</span>
                          <Grid size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTable(4, 3)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                        >
                          <span>Tabel Komparasi (4 × 3)</span>
                          <Grid size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertTable(5, 4)}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-700 dark:text-zinc-300 hover:text-rose-600 cursor-pointer"
                        >
                          <span>Tabel Data Besar (5 × 4)</span>
                          <Grid size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contextual Table Controls when inside table */}
                  {isInsideTable && (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg px-2 py-0.5 ml-1 text-[11px] animate-fadeIn">
                      <span className="font-bold text-rose-700 dark:text-rose-400 mr-1">Tabel:</span>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                        className="px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer font-medium"
                        title="Tambah Baris di Bawah"
                      >
                        + Baris
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                        className="px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer font-medium"
                        title="Tambah Kolom di Kanan"
                      >
                        + Kolom
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        className="px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer font-medium"
                        title="Hapus Baris Ini"
                      >
                        - Baris
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                        className="px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 cursor-pointer font-medium"
                        title="Hapus Kolom Ini"
                      >
                        - Kolom
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        className="px-1.5 py-0.5 rounded hover:bg-rose-200 dark:hover:bg-rose-800/60 text-rose-800 dark:text-rose-200 cursor-pointer font-bold"
                        title="Hapus Tabel Seluruhnya"
                      >
                        Hapus Tabel
                      </button>
                    </div>
                  )}

                  <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1 ml-auto" />

                  {/* Undo & Redo */}
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer transition-colors"
                    title="Urungkan (Ctrl+Z)"
                  >
                    <Undo size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer transition-colors"
                    title="Ulangi (Ctrl+Y)"
                  >
                    <Redo size={15} />
                  </button>
                </div>
              )}

              {/* EDITOR MAIN AREA */}
              <div className="flex-1 overflow-y-auto">
                {activeNote.type === 'code' ? (
                  <div className="p-4 sm:p-6 min-h-full flex flex-col">
                    <TriliumCodeEditor
                      content={activeNote.content || ''}
                      language={activeNote.codeLanguage || 'typescript'}
                      noteTitle={activeNote.title}
                      parentFolderTitle={
                        breadcrumbPath.length > 1
                          ? breadcrumbPath[breadcrumbPath.length - 2].title
                          : undefined
                      }
                      onChangeContent={(newContent) =>
                        updateNote(activeNote.id, { content: newContent })
                      }
                      onChangeLanguage={(newLang) =>
                        updateNote(activeNote.id, { codeLanguage: newLang })
                      }
                    />
                  </div>
                ) : activeNote.type === 'folder' ? (
                  <div className="p-6 space-y-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <EditorContent editor={editor} />
                    </div>

                    {/* Sub-notes list inside Folder view */}
                    <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          Sub-Catatan di dalam Folder Ini ({childNotesOfActive.length})
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleOpenCreateModal(activeNote.id)}
                          className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
                        >
                          + Tambah Sub-Catatan
                        </button>
                      </div>

                      {childNotesOfActive.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {childNotesOfActive.map((child) => (
                            <div
                              key={child.id}
                              onClick={() => handleSelectNote(child.id)}
                              className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-900 bg-stone-50/50 dark:bg-zinc-900/40 cursor-pointer transition-all hover:shadow-xs group"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                {child.type === 'folder' ? (
                                  <Folder size={14} className="text-amber-500 shrink-0" />
                                ) : child.type === 'code' ? (
                                  <Code size={14} className="text-rose-500 shrink-0" />
                                ) : child.type === 'tasklist' ? (
                                  <CheckSquare size={14} className="text-emerald-500 shrink-0" />
                                ) : (
                                  <FileText size={14} className="text-stone-400 shrink-0" />
                                )}
                                <span className="font-semibold text-xs text-stone-800 dark:text-zinc-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 truncate">
                                  {child.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400 dark:text-zinc-500 line-clamp-2">
                                {child.content.replace(/<[^>]+>/g, ' ') || 'Belum ada konten...'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center rounded-xl border border-dashed border-stone-200 dark:border-zinc-800 text-xs text-stone-400">
                          Belum ada sub-catatan di folder ini.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-6 min-h-[500px]">
                    <EditorContent editor={editor} className="min-h-[450px]" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <BookOpen size={40} className="text-stone-300 dark:text-zinc-700 mb-3" />
              <h3 className="text-base font-bold text-stone-700 dark:text-zinc-300 mb-1">
                Pilih atau Buat Catatan Baru
              </h3>
              <p className="text-xs max-w-sm mb-4">
                Pilih catatan di panel pohon sebelah kiri atau buat cabang catatan baru untuk mulai menyusun pengetahuan Anda.
              </p>
              <button
                type="button"
                onClick={() => handleOpenCreateModal(null)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-xs"
              >
                + Buat Catatan Pertama
              </button>
            </div>
          )}
        </div>

        {/* PANE 3: RIGHT INSPECTOR (METADATA & TRILIUM ATTRIBUTES) */}
        {isRightSidebarOpen && activeNote && (
          <div className="w-72 bg-stone-50/80 dark:bg-[#16171b] border-l border-stone-200 dark:border-zinc-800/90 flex flex-col shrink-0 overflow-y-auto">
            
            {/* Inspector Header */}
            <div className="p-3 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800 dark:text-zinc-200">
                <Sliders size={13} className="text-rose-600 dark:text-rose-400" />
                <span>Atribut & Info Catatan</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRightSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>

            {/* Note Metadata */}
            <div className="p-4 space-y-3 border-b border-stone-200 dark:border-zinc-800 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase text-stone-400">ID Catatan</div>
                <div className="font-mono text-[11px] text-stone-600 dark:text-zinc-400 break-all bg-white dark:bg-[#111215] p-1.5 rounded-lg border border-stone-200 dark:border-zinc-800">
                  {activeNote.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-600 dark:text-zinc-400">
                <div>
                  <div className="text-[10px] font-bold uppercase text-stone-400">Dibuat</div>
                  <div>{new Date(activeNote.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-stone-400">Diperbarui</div>
                  <div>{new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-stone-200 dark:border-zinc-800/80 text-center">
                <div className="p-2 bg-white dark:bg-[#111215] rounded-lg border border-stone-200 dark:border-zinc-800">
                  <div className="text-sm font-bold text-stone-800 dark:text-zinc-200">{stats.words}</div>
                  <div className="text-[9px] text-stone-400 uppercase">Kata</div>
                </div>
                <div className="p-2 bg-white dark:bg-[#111215] rounded-lg border border-stone-200 dark:border-zinc-800">
                  <div className="text-sm font-bold text-stone-800 dark:text-zinc-200">{stats.chars}</div>
                  <div className="text-[9px] text-stone-400 uppercase">Karakter</div>
                </div>
                <div className="p-2 bg-white dark:bg-[#111215] rounded-lg border border-stone-200 dark:border-zinc-800">
                  <div className="text-sm font-bold text-stone-800 dark:text-zinc-200">{stats.minutes}m</div>
                  <div className="text-[9px] text-stone-400 uppercase">Baca</div>
                </div>
              </div>
            </div>

            {/* Trilium Label Attributes Manager */}
            <div className="p-4 space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Tag size={12} className="text-rose-600 dark:text-rose-400" />
                  <span>Label Trilium ({activeNote.attributes.length})</span>
                </div>
              </div>

              <div className="space-y-1.5">
                {activeNote.attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#111215] border border-stone-200 dark:border-zinc-800 text-xs"
                  >
                    <div className="font-mono text-rose-700 dark:text-rose-400 truncate">
                      #{attr.name}
                      {attr.value ? (
                        <span className="text-stone-500 dark:text-zinc-400">={attr.value}</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(attr.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Attribute Form */}
              <div className="pt-2 border-t border-stone-200 dark:border-zinc-800 space-y-2">
                <div className="text-[11px] font-bold text-stone-600 dark:text-zinc-400">
                  Tambah Label Baru
                </div>
                <input
                  type="text"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  placeholder="Nama label (misal: status, priority)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#111215] border border-stone-200 dark:border-zinc-800 text-xs focus:outline-rose-500"
                />
                <input
                  type="text"
                  value={newAttrValue}
                  onChange={(e) => setNewAttrValue(e.target.value)}
                  placeholder="Nilai label opsional (misal: active, high)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#111215] border border-stone-200 dark:border-zinc-800 text-xs focus:outline-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  disabled={!newAttrName.trim()}
                  className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer transition-colors"
                >
                  + Tambahkan Label
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE NOTE MODAL */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#181a1f] rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                {newNoteParentId ? 'Tambah Sub-Catatan' : 'Buat Catatan Root Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewNoteModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block mb-1">
                  Judul Catatan
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNoteConfirm();
                  }}
                  placeholder="Contoh: Arsitektur Microservices, Daftar Todo..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#111215] border border-stone-200 dark:border-zinc-800 text-sm focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block mb-1">
                  Tipe Catatan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNoteType('text')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left cursor-pointer transition-colors ${
                      newNoteType === 'text'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <FileText size={15} className="text-stone-500" />
                    <div>
                      <div>Rich Text</div>
                      <div className="text-[10px] text-stone-400 font-normal">WYSIWYG visual</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewNoteType('code')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left cursor-pointer transition-colors ${
                      newNoteType === 'code'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Code size={15} className="text-rose-500" />
                    <div>
                      <div>Code Snippet</div>
                      <div className="text-[10px] text-stone-400 font-normal">Cuplikan kode</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewNoteType('tasklist')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left cursor-pointer transition-colors ${
                      newNoteType === 'tasklist'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <CheckSquare size={15} className="text-emerald-500" />
                    <div>
                      <div>Task Checklist</div>
                      <div className="text-[10px] text-stone-400 font-normal">Daftar to-do</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewNoteType('folder')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left cursor-pointer transition-colors ${
                      newNoteType === 'folder'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Folder size={15} className="text-amber-500" />
                    <div>
                      <div>Folder Group</div>
                      <div className="text-[10px] text-stone-400 font-normal">Wadah hierarki</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsNewNoteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateNoteConfirm}
                disabled={!newNoteTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Buat Catatan
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DesktopOnlyNotice>
  );
};
