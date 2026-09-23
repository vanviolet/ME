import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { Link } from 'react-router-dom';
import {
  Folder,
  FolderOpen,
  FileText,
  Code,
  CheckSquare,
  Square,
  Bookmark,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Search,
  Copy,
  Check,
  Download,
  Upload,
  Printer,
  Calendar,
  Clock,
  Tag,
  Hash,
  Link2,
  ExternalLink,
  Layers,
  FileCode,
  Sliders,
  MoreVertical,
  X,
  Eye,
  Info,
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
  CornerDownRight,
  Maximize2,
  Minimize2,
  FileUp,
  FileDown,
  RotateCcw,
  Palette,
  Columns,
  Pin,
  Lock,
  Unlock,
  Sparkles,
  ArrowLeft,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Compass,
  FolderPlus,
  FilePlus,
  FolderTree,
  Play,
  RotateCw,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  BookOpen,
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

// Initial Trilium Tree Sample Data
const DEFAULT_TRILIUM_NOTES: TriliumNote[] = [
  {
    id: 'root-welcome',
    parentId: null,
    title: 'Selamat Datang di Trilium Notes',
    type: 'text',
    content: `<h2>Selamat Datang di Trilium Notes Personal Knowledge Base</h2>
<p>Trilium Notes adalah sistem pencatatan hierarkis (<em>hierarchical note-taking</em>) yang dirancang untuk membangun basis pengetahuan pribadi berskala besar tanpa batas kedalaman folder.</p>

<h3>Fitur Unggulan Siap Pakai:</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><div>Hierarki pohon catatan tanpa batas kedalaman (<em>infinite nested tree</em>)</div></li>
  <li data-type="taskItem" data-checked="true"><div>Editor visual WYSIWYG murni (teks tebal, garis bawah, stabilo, heading, tabel rapi, to-do list)</div></li>
  <li data-type="taskItem" data-checked="true"><div>Toolbar tabel interaktif: tambah/hapus baris & kolom dengan 1 klik</div></li>
  <li data-type="taskItem" data-checked="true"><div>Tipe Catatan Fleksibel: Rich Text, Code Snippet, Checklist Tugas, dan Folder</div></li>
  <li data-type="taskItem" data-checked="true"><div>Sistem Label & Atribut ala Trilium (misal: <code>#status=active</code>, <code>#priority=high</code>)</div></li>
  <li data-type="taskItem" data-checked="false"><div>Fitur Hoist (fokus pada sub-pohon catatan tertentu sebagai root)</div></li>
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
      <td><strong>Tabel Interaktif</strong></td>
      <td><mark>Aktif</mark></td>
      <td>Mendukung manipulasi baris dan kolom instan</td>
    </tr>
    <tr>
      <td><strong>Cadangan & Ekspor</strong></td>
      <td><mark>Siap</mark></td>
      <td>Unduh cadangan JSON atau ekspor ke HTML & cetak</td>
    </tr>
  </tbody>
</table>

<blockquote><p>💡 <strong>Tip Cepat:</strong> Arahkan kursor ke tombol <strong>Tabel</strong> di toolbar untuk menyisipkan tabel baru, atau gunakan tombol <strong>+</strong> di pohon samping kiri untuk membuat sub-catatan baru.</p></blockquote>`,
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
  <li data-type="taskItem" data-checked="true"><div>Penyempurnaan toolbar tabel interaktif</div></li>
  <li data-type="taskItem" data-checked="false"><div>Integrasi ekspor cadangan JSON & impor catatan</div></li>
  <li data-type="taskItem" data-checked="false"><div>Penyempurnaan tema gelap Trilium yang nyaman di mata</div></li>
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
  const { language } = usePortfolio();

  // State: Notes Tree
  const [notes, setNotes] = useState<TriliumNote[]>(() => {
    try {
      const saved = localStorage.getItem('trilium_notes_store_v2');
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
  const [mobileViewTab, setMobileViewTab] = useState<'tree' | 'editor' | 'info'>('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Table Dropdown Popover
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);

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
      localStorage.setItem('trilium_notes_store_v2', JSON.stringify(notes));
    } catch {}
  }, [notes]);

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
          class: 'text-teal-600 dark:text-teal-400 underline font-medium hover:opacity-80',
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
        class: 'tiptap-content outline-none focus:outline-none min-h-[480px] p-6 text-stone-900 dark:text-zinc-100 font-sans leading-relaxed text-sm sm:text-base',
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
    setMobileViewTab('editor');
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
    if (!confirm(language === 'en' ? `Delete "${target.title}" and all its sub-notes?` : `Hapus "${target.title}" beserta seluruh sub-catatannya?`)) return;

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
    if (confirm(language === 'en' ? 'Reset all notes to sample knowledge base?' : 'Kembalikan catatan ke contoh awal Trilium?')) {
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
            .some((c) => c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q) || hasMatchingChild(c.id));
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
            <FolderOpen size={15} className="text-amber-500 shrink-0" />
          ) : (
            <Folder size={15} className="text-amber-500 shrink-0" />
          );
        }
        if (note.type === 'code') {
          return <Code size={15} className="text-cyan-600 dark:text-cyan-400 shrink-0" />;
        }
        if (note.type === 'tasklist') {
          return <CheckSquare size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />;
        }
        if (note.type === 'bookmark') {
          return <Bookmark size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />;
        }
        return <FileText size={15} className="text-stone-400 dark:text-zinc-500 shrink-0" />;
      };

      return (
        <div key={note.id} className="select-none">
          <div
            onClick={() => handleSelectNote(note.id)}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
            className={`group flex items-center justify-between py-1.5 pr-2 rounded-xl text-xs transition-all cursor-pointer ${
              isSelected
                ? 'bg-teal-500/15 text-teal-900 dark:text-teal-200 font-semibold border-l-3 border-teal-600 shadow-2xs'
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
                className="p-1 rounded-lg hover:bg-stone-300 dark:hover:bg-zinc-700 text-stone-400 hover:text-teal-600 cursor-pointer"
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
    <div className={`min-h-screen bg-stone-50/50 dark:bg-[#0f1013] text-stone-900 dark:text-zinc-100 font-sans antialiased ${isFullscreen ? 'fixed inset-0 z-50 p-0' : 'pt-18 pb-12 px-2 sm:px-4 max-w-[1780px] mx-auto'}`}>
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

      {/* TOP UNIFIED APP HEADER */}
      <div className="mb-2 bg-white/95 dark:bg-[#18191d]/95 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-zinc-800/80 px-3 sm:px-5 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Back to tools + Brand badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="p-2 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Kembali ke Daftar Tools"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="h-4 w-px bg-stone-200 dark:bg-zinc-800 shrink-0 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white tracking-tight">
                  Trilium Notes
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-400 font-mono text-[9px] font-extrabold tracking-wider border border-teal-500/20 uppercase">
                  Personal Knowledge Base
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400 hidden sm:block">
                Pencatatan hierarkis pohon & editor visual WYSIWYG tanpa sintaks markdown
              </p>
            </div>
          </div>
        </div>

        {/* Center: Hoisted view alert if active */}
        {hoistedNoteId && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
            <Compass size={13} className="shrink-0 animate-spin" />
            <span>Fokus Sub-Pohon: <strong>{notes.find((n) => n.id === hoistedNoteId)?.title}</strong></span>
            <button
              type="button"
              onClick={() => setHoistedNoteId(null)}
              className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-bold cursor-pointer"
            >
              Kembalikan ke Root
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-300 text-xs">
          <button
            type="button"
            onClick={() => handleOpenCreateModal(null)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Catatan Baru</span>
          </button>

          <label
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer"
            title="Pulihkan Cadangan (Import JSON)"
          >
            <FileUp size={15} />
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleExportJSON}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer"
            title="Unduh Cadangan Lengkap (Export JSON)"
          >
            <FileDown size={15} />
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer"
            title="Cetak Catatan / Simpan PDF"
          >
            <Printer size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* TRILIUM WORKSPACE CONTAINER CARD */}
      <div className={`bg-white dark:bg-[#15171b] rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col ${isFullscreen ? 'h-full rounded-none border-none' : 'h-[calc(100vh-10.5rem)] min-h-[720px]'}`}>
        
        {/* BREADCRUMB & TAB BAR */}
        <div className="h-10 bg-stone-100/70 dark:bg-[#1a1c21] border-b border-stone-200 dark:border-zinc-800/90 flex items-center justify-between px-2 gap-2 select-none shrink-0 overflow-x-auto">
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

            {/* Note Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {openTabIds.map((tabId) => {
                const note = notes.find((n) => n.id === tabId);
                if (!note) return null;
                const isActiveTab = activeNoteId === tabId;

                return (
                  <div
                    key={tabId}
                    onClick={() => handleSelectNote(tabId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                      isActiveTab
                        ? 'bg-white dark:bg-[#15171b] border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                        : 'bg-transparent border-transparent text-stone-500 dark:text-zinc-400 hover:bg-stone-200/50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {note.type === 'code' ? (
                      <Code size={13} className="text-cyan-500 shrink-0" />
                    ) : note.type === 'tasklist' ? (
                      <CheckSquare size={13} className="text-emerald-500 shrink-0" />
                    ) : note.type === 'folder' ? (
                      <Folder size={13} className="text-amber-500 shrink-0" />
                    ) : (
                      <FileText size={13} className="text-stone-400 shrink-0" />
                    )}
                    <span className="truncate max-w-[130px]">{note.title || 'Tanpa Judul'}</span>
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
                    idx === breadcrumbPath.length - 1 ? 'font-bold text-teal-600 dark:text-teal-400' : ''
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
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-200/60 dark:hover:bg-zinc-800 border-transparent'
              }`}
              title="Panel Metadata & Atribut Catatan"
            >
              <Sliders size={13} />
            </button>
          </div>
        </div>

        {/* 3-PANE TRILIUM BODY */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* PANE 1: HIERARCHICAL TREE SIDEBAR */}
          {isTreeSidebarOpen && (
            <div className="w-64 sm:w-72 bg-stone-50/70 dark:bg-[#181a1f] border-r border-stone-200 dark:border-zinc-800/90 flex flex-col shrink-0">
              {/* Tree Search & Quick Filter */}
              <div className="p-2.5 space-y-2 border-b border-stone-200 dark:border-zinc-800/80">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'en' ? 'Search note tree...' : 'Cari di hierarki catatan...'}
                    className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-[#141518] border border-stone-200 dark:border-zinc-800 text-xs text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-teal-500"
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
                            ? 'bg-teal-600 text-white border-teal-600 font-bold'
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
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
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

                    {/* Trilium Label Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {activeNote.attributes
                        .filter((a) => a.type === 'label')
                        .map((attr) => (
                          <span
                            key={attr.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/20 font-mono text-[11px]"
                          >
                            <Hash size={10} />
                            <span>
                              {attr.name}
                              {attr.value ? `=${attr.value}` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(attr.id)}
                              className="hover:text-rose-500 cursor-pointer ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                      <button
                        type="button"
                        onClick={() => setIsRightSidebarOpen(true)}
                        className="text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer font-medium"
                      >
                        + Tambah Label
                      </button>
                    </div>
                  </div>

                  {/* Actions & Note Type Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={activeNote.type}
                      onChange={(e) =>
                        updateNote(activeNote.id, { type: e.target.value as TriliumNoteType })
                      }
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 focus:outline-teal-500 cursor-pointer"
                    >
                      <option value="text">📝 Rich Text (WYSIWYG)</option>
                      <option value="code">💻 Code Snippet</option>
                      <option value="tasklist">☑️ Task Checklist</option>
                      <option value="folder">🗂️ Folder Overview</option>
                    </select>

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
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('heading', { level: 1 }) ? 'bg-teal-600 text-white font-bold' : ''
                      }`}
                      title="Heading 1"
                    >
                      <Heading1 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('heading', { level: 2 }) ? 'bg-teal-600 text-white font-bold' : ''
                      }`}
                      title="Heading 2"
                    >
                      <Heading2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('heading', { level: 3 }) ? 'bg-teal-600 text-white font-bold' : ''
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
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('bold') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Tebal (Ctrl+B)"
                    >
                      <Bold size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('italic') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Miring (Ctrl+I)"
                    >
                      <Italic size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('underline') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Garis Bawah (Ctrl+U)"
                    >
                      <UnderlineIcon size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('strike') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Coret Teks"
                    >
                      <Strikethrough size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHighlight().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer text-amber-500 ${
                        editor.isActive('highlight') ? 'bg-amber-500 text-white' : ''
                      }`}
                      title="Stabilo Sorot"
                    >
                      <Highlighter size={15} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Text Alignment */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().setTextAlign('left').run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive({ textAlign: 'left' }) ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Rata Kiri"
                    >
                      <AlignLeft size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().setTextAlign('center').run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive({ textAlign: 'center' }) ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Rata Tengah"
                    >
                      <AlignCenter size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().setTextAlign('right').run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive({ textAlign: 'right' }) ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Rata Kanan"
                    >
                      <AlignRight size={14} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Lists */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('bulletList') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Daftar Poin"
                    >
                      <List size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('orderedList') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Daftar Nomor"
                    >
                      <ListOrdered size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleTaskList().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('taskList') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Daftar Checklist Tugas"
                    >
                      <CheckSquare size={15} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Blockquote & Horizontal Rule */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      className={`p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer ${
                        editor.isActive('blockquote') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Kutipan (Quote)"
                    >
                      <Quote size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().setHorizontalRule().run()}
                      className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Garis Pemisah"
                    >
                      <Minus size={15} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* TABLE CONTROLS (POPUP & INSERTION) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isInsideTable || isTableMenuOpen
                            ? 'bg-teal-600 text-white border-teal-600 font-bold'
                            : 'hover:bg-stone-200 dark:hover:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300'
                        }`}
                        title="Manajemen Tabel"
                      >
                        <TableIcon size={14} />
                        <span>Tabel</span>
                        <ChevronDown size={11} />
                      </button>

                      {/* Table Dropdown Menu */}
                      {isTableMenuOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-60 p-2.5 bg-white dark:bg-[#1e2025] rounded-xl border border-stone-200 dark:border-zinc-700 shadow-xl z-50 space-y-2 text-xs">
                          <div className="font-bold text-stone-900 dark:text-zinc-100 flex items-center justify-between pb-1 border-b border-stone-100 dark:border-zinc-800">
                            <span>Sisipkan Tabel Baru</span>
                            <button
                              type="button"
                              onClick={() => setIsTableMenuOpen(false)}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleInsertTable(3, 3)}
                              className="p-2 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 text-center font-medium cursor-pointer"
                            >
                              3 × 3 (Standar)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertTable(4, 4)}
                              className="p-2 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 text-center font-medium cursor-pointer"
                            >
                              4 × 4 (Luas)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertTable(2, 2)}
                              className="p-2 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 text-center font-medium cursor-pointer"
                            >
                              2 × 2 (Ringkas)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertTable(5, 3)}
                              className="p-2 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 text-center font-medium cursor-pointer"
                            >
                              5 × 3 (Data List)
                            </button>
                          </div>

                          {isInsideTable && (
                            <div className="pt-2 border-t border-stone-100 dark:border-zinc-800 space-y-1">
                              <div className="text-[11px] font-bold text-stone-400 uppercase">Aksi Tabel Aktif:</div>
                              <button
                                type="button"
                                onClick={() => editor.chain().focus().addRowAfter().run()}
                                className="w-full text-left px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                              >
                                ➕ Tambah Baris di Bawah
                              </button>
                              <button
                                type="button"
                                onClick={() => editor.chain().focus().addColumnAfter().run()}
                                className="w-full text-left px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                              >
                                ➕ Tambah Kolom di Kanan
                              </button>
                              <button
                                type="button"
                                onClick={() => editor.chain().focus().deleteRow().run()}
                                className="w-full text-left px-2 py-1 rounded hover:bg-rose-50 text-rose-600 cursor-pointer"
                              >
                                ➖ Hapus Baris Terpilih
                              </button>
                              <button
                                type="button"
                                onClick={() => editor.chain().focus().deleteColumn().run()}
                                className="w-full text-left px-2 py-1 rounded hover:bg-rose-50 text-rose-600 cursor-pointer"
                              >
                                ➖ Hapus Kolom Terpilih
                              </button>
                              <button
                                type="button"
                                onClick={() => editor.chain().focus().deleteTable().run()}
                                className="w-full text-left px-2 py-1 rounded hover:bg-rose-100 text-rose-700 font-bold cursor-pointer"
                              >
                                ❌ Hapus Seluruh Tabel
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contextual Table Buttons when cursor is inside a table */}
                    {isInsideTable && (
                      <div className="flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 ml-1">
                        <span className="text-[11px] font-bold">Baris:</span>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().addRowAfter().run()}
                          className="px-1.5 py-0.5 rounded bg-teal-600 text-white font-bold cursor-pointer hover:bg-teal-500"
                          title="Tambah Baris di Bawah"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().deleteRow().run()}
                          className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold cursor-pointer hover:bg-rose-500 ml-0.5"
                          title="Hapus Baris Ini"
                        >
                          -
                        </button>

                        <span className="text-[11px] font-bold ml-1">Kolom:</span>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().addColumnAfter().run()}
                          className="px-1.5 py-0.5 rounded bg-teal-600 text-white font-bold cursor-pointer hover:bg-teal-500"
                          title="Tambah Kolom di Kanan"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().deleteColumn().run()}
                          className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold cursor-pointer hover:bg-rose-500 ml-0.5"
                          title="Hapus Kolom Ini"
                        >
                          -
                        </button>
                      </div>
                    )}

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Undo / Redo */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                      className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                      className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo size={14} />
                    </button>
                  </div>
                )}

                {/* EDITOR CONTENT AREA */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#15171b]">
                  {activeNote.type === 'code' ? (
                    /* CODE NOTE MODE */
                    <div className="p-6 h-full flex flex-col space-y-3">
                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Bahasa Pemrograman:</span>
                          <select
                            value={activeNote.codeLanguage || 'typescript'}
                            onChange={(e) =>
                              updateNote(activeNote.id, { codeLanguage: e.target.value })
                            }
                            className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 font-mono text-xs focus:outline-teal-500 cursor-pointer font-bold"
                          >
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="sql">SQL</option>
                            <option value="json">JSON</option>
                            <option value="rust">Rust</option>
                            <option value="go">Go</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeNote.content);
                            alert('Kode berhasil disalin ke clipboard!');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-teal-500 hover:text-white border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 cursor-pointer transition-colors"
                        >
                          <Copy size={13} />
                          <span>Salin Kode</span>
                        </button>
                      </div>

                      <textarea
                        value={activeNote.content}
                        onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                        placeholder="// Tulis atau tempel cuplikan kode di sini..."
                        className="flex-1 w-full p-4 rounded-xl font-mono text-xs sm:text-sm leading-relaxed bg-[#0b0e14] text-cyan-300 border border-stone-300 dark:border-zinc-800 resize-none focus:outline-teal-500 shadow-inner"
                      />
                    </div>
                  ) : activeNote.type === 'folder' ? (
                    /* FOLDER CONTAINER OVERVIEW */
                    <div className="p-8 space-y-6">
                      <div className="prose dark:prose-invert max-w-none">
                        <EditorContent editor={editor} />
                      </div>

                      {/* Sub-notes Grid */}
                      <div className="space-y-3 pt-6 border-t border-stone-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-2">
                            <FolderTree size={16} className="text-amber-500" />
                            <span>Daftar Sub-Catatan ({childNotesOfActive.length})</span>
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleOpenCreateModal(activeNote.id)}
                            className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                          >
                            + Tambah Sub-Catatan
                          </button>
                        </div>

                        {childNotesOfActive.length === 0 ? (
                          <div className="p-6 rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800 text-center text-xs text-stone-400">
                            Folder ini belum memiliki sub-catatan. Klik tombol tambah di atas untuk membuat catatan baru di dalam folder ini.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {childNotesOfActive.map((child) => (
                              <div
                                key={child.id}
                                onClick={() => handleSelectNote(child.id)}
                                className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 hover:border-teal-500 dark:hover:border-teal-500/60 bg-stone-50/50 dark:bg-[#1a1c22] transition-all cursor-pointer group shadow-2xs hover:shadow-sm"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  {child.type === 'folder' ? (
                                    <Folder size={16} className="text-amber-500" />
                                  ) : child.type === 'code' ? (
                                    <Code size={16} className="text-cyan-500" />
                                  ) : (
                                    <FileText size={16} className="text-teal-600 dark:text-teal-400" />
                                  )}
                                  <h4 className="font-bold text-xs text-stone-900 dark:text-zinc-100 truncate group-hover:text-teal-600 transition-colors">
                                    {child.title}
                                  </h4>
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-zinc-400 line-clamp-2">
                                  {child.content.replace(/<[^>]+>/g, '') || 'Catatan kosong...'}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* WYSIWYG TIPTAP RICH EDITOR */
                    <div className="max-w-4xl mx-auto py-2">
                      <EditorContent editor={editor} />
                    </div>
                  )}
                </div>

                {/* BOTTOM NOTE STATUS BAR */}
                <div className="h-8 bg-stone-100/70 dark:bg-[#181a1f] border-t border-stone-200 dark:border-zinc-800/80 px-4 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400 select-none shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                      <Check size={12} />
                      <span>Tersimpan otomatis</span>
                    </span>
                    <span>•</span>
                    <span>{stats.words} kata</span>
                    <span>•</span>
                    <span>{stats.chars} karakter</span>
                    <span>•</span>
                    <span>~{stats.minutes} mnt baca</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-stone-400">ID: {activeNote.id}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
                <FileText size={48} className="text-stone-300 dark:text-zinc-700 mb-3" />
                <h3 className="text-base font-bold text-stone-700 dark:text-zinc-300">Belum Ada Catatan Dipilih</h3>
                <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4">
                  Pilih salah satu catatan dari pohon hierarki sebelah kiri, atau buat catatan baru.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs shadow-xs hover:bg-teal-500 cursor-pointer"
                >
                  + Buat Catatan Baru
                </button>
              </div>
            )}
          </div>

          {/* PANE 3: INSPECTOR & METADATA (RIGHT SIDEBAR) */}
          {isRightSidebarOpen && activeNote && (
            <div className="w-72 bg-stone-50/70 dark:bg-[#181a1f] border-l border-stone-200 dark:border-zinc-800/90 flex flex-col shrink-0 overflow-y-auto">
              {/* Header */}
              <div className="p-3 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-stone-800 dark:text-zinc-200">
                  <Sliders size={13} className="text-teal-600" />
                  <span>Informasi & Atribut Trilium</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="p-4 space-y-5 text-xs">
                {/* Note Details Box */}
                <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-[#141518] border border-stone-200 dark:border-zinc-800">
                  <div className="font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Info size={13} className="text-teal-600" />
                    <span>Detail Catatan</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-stone-600 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Tipe:</span>
                      <span className="font-mono uppercase font-bold text-teal-600 dark:text-teal-400">{activeNote.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Dibuat:</span>
                      <span>{new Date(activeNote.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Diperbarui:</span>
                      <span>{new Date(activeNote.updatedAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Panjang Teks:</span>
                      <span>{stats.chars} karakter</span>
                    </div>
                  </div>
                </div>

                {/* Trilium Attributes / Labels (#label=value) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1">
                      <Tag size={13} className="text-teal-600" />
                      <span>Label & Atribut (#)</span>
                    </span>
                    <span className="text-[10px] text-stone-400">{activeNote.attributes.length} label</span>
                  </div>

                  {/* List of attributes */}
                  <div className="space-y-1.5">
                    {activeNote.attributes.map((attr) => (
                      <div
                        key={attr.id}
                        className="flex items-center justify-between px-2 py-1 rounded-lg bg-white dark:bg-[#141518] border border-stone-200 dark:border-zinc-800 font-mono text-[11px]"
                      >
                        <span className="truncate">
                          #{attr.name}
                          {attr.value ? <strong className="text-teal-600 dark:text-teal-400">={attr.value}</strong> : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(attr.id)}
                          className="text-stone-400 hover:text-rose-500 cursor-pointer p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Attribute Form */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#141518] border border-stone-200 dark:border-zinc-800 space-y-2">
                    <div className="text-[11px] font-semibold text-stone-700 dark:text-zinc-300">Tambah Label:</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={newAttrName}
                        onChange={(e) => setNewAttrName(e.target.value)}
                        placeholder="Nama (mis: status)"
                        className="px-2 py-1 rounded bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-teal-500 font-mono"
                      />
                      <input
                        type="text"
                        value={newAttrValue}
                        onChange={(e) => setNewAttrValue(e.target.value)}
                        placeholder="Nilai (opsional)"
                        className="px-2 py-1 rounded bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs focus:outline-teal-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAttribute}
                      disabled={!newAttrName.trim()}
                      className="w-full py-1 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer shadow-2xs transition-colors"
                    >
                      + Simpan Label
                    </button>
                  </div>
                </div>

                {/* Sub-notes fast links */}
                <div className="space-y-2">
                  <div className="font-bold text-stone-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>Sub-Catatan Langsung</span>
                    <span className="text-[10px] text-stone-400">{childNotesOfActive.length} item</span>
                  </div>
                  <div className="space-y-1">
                    {childNotesOfActive.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelectNote(child.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#141518] hover:bg-stone-200/60 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 truncate cursor-pointer transition-colors text-[11px]"
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* CREATE NEW NOTE MODAL */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1c21] rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FilePlus size={16} className="text-teal-600" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-zinc-100">
                  {newNoteParentId ? 'Buat Sub-Catatan Baru' : 'Buat Catatan Root Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewNoteModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                  Judul Catatan:
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Misal: Arsitektur Microservices, Daftar Belanja..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNoteConfirm();
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-xs text-stone-900 dark:text-zinc-100 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-zinc-400 mb-1">
                  Tipe Catatan Trilium:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNoteType('text')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newNoteType === 'text'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-300 font-bold'
                        : 'border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText size={14} className="text-teal-600" />
                      <span>Rich Text Note</span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-normal">Editor visual WYSIWYG & tabel</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewNoteType('tasklist')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newNoteType === 'tasklist'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-300 font-bold'
                        : 'border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckSquare size={14} className="text-emerald-600" />
                      <span>Task List</span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-normal">Checklist to-do interaktif</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewNoteType('code')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newNoteType === 'code'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-300 font-bold'
                        : 'border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Code size={14} className="text-cyan-600" />
                      <span>Code Snippet</span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-normal">Monospace kode & copy</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewNoteType('folder')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newNoteType === 'folder'
                        ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-300 font-bold'
                        : 'border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Folder size={14} className="text-amber-500" />
                      <span>Folder Box</span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-normal">Wadah pengelompokan</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsNewNoteModalOpen(false)}
                className="px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateNoteConfirm}
                disabled={!newNoteTitle.trim()}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Buat Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
