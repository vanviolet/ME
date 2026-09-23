import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
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
  codeLanguage?: string; // For code notes: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'sql' | 'json'
  bookmarkUrl?: string; // For bookmark notes
  attributes: TriliumAttribute[];
  isPinned?: boolean;
  isProtected?: boolean;
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
<h3>Fitur Utama yang Siap Digunakan:</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">Hierarki pohon catatan tanpa batas kedalaman (<em>infinite nested tree</em>)</li>
  <li data-type="taskItem" data-checked="true">Editor visual WYSIWYG lengkap: teks tebal, miring, stabilo, heading, tabel, dan to-do list</li>
  <li data-type="taskItem" data-checked="true">Tipe Catatan Fleksibel: Rich Text, Code Note (Monospace), Checklist Tugas, dan Bookmark</li>
  <li data-type="taskItem" data-checked="true">Sistem Label & Atribut ala Trilium (misal: <code>#status=active</code>, <code>#priority=high</code>)</li>
  <li data-type="taskItem" data-checked="false">Tab navigasi multi-catatan di bagian atas</li>
</ul>
<blockquote><p>💡 <strong>Tip Cepat:</strong> Anda dapat membuat sub-catatan di bawah catatan apa pun dengan menekan tombol <strong>+</strong> di samping nama catatan pada pohon sebelah kiri.</p></blockquote>`,
    attributes: [
      { id: 'attr-1', name: 'status', value: 'active', type: 'label' },
      { id: 'attr-2', name: 'workspace', value: 'knowledge-base', type: 'label' },
    ],
    isPinned: true,
    isExpanded: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'folder-engineering',
    parentId: null,
    title: 'Rekayasa Perangkat Lunak & Backend',
    type: 'folder',
    content: `<h2>Koleksi Catatan Arsitektur & Rekayasa</h2><p>Folder ini mengelompokkan catatan teknis seputar arsitektur database, desain sistem, dan cuplikan kode backend.</p>`,
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
    title: 'Desain RESTful API & Error Envelope',
    type: 'text',
    content: `<h2>Panduan Standar Desain API</h2>
<p>Setiap endpoint HTTP harus menggunakan format respons JSON seragam untuk memudahkan integrasi front-end:</p>
<table style="border-collapse: collapse; width: 100%; margin: 1rem 0; border: 1px solid #cbd5e1;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left;">Field</th>
      <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left;">Tipe</th>
      <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left;">Keterangan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;"><code>success</code></td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">boolean</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Status keberhasilan eksekusi</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;"><code>data</code></td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">object / array</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Payload hasil query</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;"><code>error</code></td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">string / null</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Pesan kesalahan jika gagal</td>
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
    title: 'Cuplikan Kode: Rate Limiter Middleware',
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
    title: 'Rencana Proyek & Tugas',
    type: 'tasklist',
    content: `<h2>Daftar Prioritas Pengembangan Q3</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">Riset arsitektur database terdistribusi</li>
  <li data-type="taskItem" data-checked="true">Migrasi editor catatan ke TipTap WYSIWYG murni</li>
  <li data-type="taskItem" data-checked="false">Integrasi ekspor cadangan JSON & impor catatan</li>
  <li data-type="taskItem" data-checked="false">Penyempurnaan tema gelap Trilium yang nyaman di mata</li>
</ul>`,
    attributes: [
      { id: 'attr-8', name: 'priority', value: 'high', type: 'label' },
    ],
    isExpanded: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 8,
  },
];

export const NotesNotebookPage: React.FC = () => {
  const { language } = usePortfolio();

  // State: Notes Tree
  const [notes, setNotes] = useState<TriliumNote[]>(() => {
    try {
      const saved = localStorage.getItem('trilium_notes_store_v1');
      return saved ? JSON.parse(saved) : DEFAULT_TRILIUM_NOTES;
    } catch {
      return DEFAULT_TRILIUM_NOTES;
    }
  });

  // Active Note & Open Tabs
  const [activeNoteId, setActiveNoteId] = useState<string>(DEFAULT_TRILIUM_NOTES[0].id);
  const [openTabIds, setOpenTabIds] = useState<string[]>([
    DEFAULT_TRILIUM_NOTES[0].id,
    DEFAULT_TRILIUM_NOTES[2].id,
  ]);

  // UI Panels state
  const [isTreeSidebarOpen, setIsTreeSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string | null>(null);

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
      localStorage.setItem('trilium_notes_store_v1', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Current Active Note
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // Initialize TipTap Rich Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      LinkExtension.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder:
          language === 'en'
            ? 'Start typing freely with headings, bold text, tables, task lists, and quotes...'
            : 'Mulai mengetik bebas dengan heading, teks tebal, tabel, checklist tugas, dan kutipan...',
      }),
    ],
    content: activeNote?.type === 'text' || activeNote?.type === 'tasklist' || activeNote?.type === 'folder'
      ? activeNote?.content || ''
      : '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (activeNote) {
        setNotes((prev) =>
          prev.map((n) => (n.id === activeNote.id ? { ...n, content: html, updatedAt: Date.now() } : n))
        );
      }
    },
  });

  // Sync editor content when active note changes
  useEffect(() => {
    if (!editor || !activeNote) return;
    if (activeNote.type === 'text' || activeNote.type === 'tasklist' || activeNote.type === 'folder') {
      const currentHTML = editor.getHTML();
      if (currentHTML !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '', { emitUpdate: false });
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
      defaultContent = `<ul data-type="taskList"><li data-type="taskItem" data-checked="false">Tugas pertama...</li></ul>`;
    } else if (newNoteType === 'code') {
      defaultContent = `// Tulis kode di sini\nconsole.log("Hello Trilium");`;
    } else if (newNoteType === 'folder') {
      defaultContent = `<h2>Folder: ${newNoteTitle}</h2><p>Deskripsi kumpulan catatan...</p>`;
    }

    const newNote: TriliumNote = {
      id: 'note-' + Date.now(),
      parentId: newNoteParentId,
      title: newNoteTitle.trim(),
      type: newNoteType,
      content: defaultContent,
      codeLanguage: newNoteType === 'code' ? 'javascript' : undefined,
      attributes: [],
      isExpanded: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // If parent exists, ensure it is expanded
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
    if (!confirm(language === 'en' ? 'Delete this note and its sub-notes?' : 'Hapus catatan ini beserta semua sub-catatannya?')) return;

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
        if (Array.isArray(imported)) {
          setNotes(imported);
          alert(language === 'en' ? 'Notes imported successfully!' : 'Catatan berhasil dipulihkan!');
          if (imported.length > 0) setActiveNoteId(imported[0].id);
        }
      } catch {
        alert('File JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Tree rendering recursive component
  const renderTreeNodes = (parentId: string | null, depth: number = 0) => {
    const childNotes = notes.filter((n) => n.parentId === parentId);

    // Apply search or label filter
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

      // Icon by note type
      const getNoteIcon = () => {
        if (note.type === 'folder') {
          return isExpanded ? (
            <FolderOpen size={14} className="text-amber-500 shrink-0" />
          ) : (
            <Folder size={14} className="text-amber-500 shrink-0" />
          );
        }
        if (note.type === 'code') {
          return <Code size={14} className="text-cyan-500 shrink-0" />;
        }
        if (note.type === 'tasklist') {
          return <CheckSquare size={14} className="text-emerald-500 shrink-0" />;
        }
        if (note.type === 'bookmark') {
          return <Bookmark size={14} className="text-indigo-500 shrink-0" />;
        }
        return <FileText size={14} className="text-stone-400 dark:text-zinc-400 shrink-0" />;
      };

      return (
        <div key={note.id} className="select-none">
          <div
            onClick={() => handleSelectNote(note.id)}
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
            className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs transition-colors cursor-pointer ${
              isSelected
                ? 'bg-teal-600/15 text-teal-700 dark:text-teal-300 font-semibold border-l-2 border-teal-500'
                : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-200/60 dark:hover:bg-zinc-800/60'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* Expand / Collapse Chevron */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => handleToggleExpand(note.id, e)}
                  className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded shrink-0 cursor-pointer"
                >
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
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
                className="p-1 rounded hover:bg-stone-300 dark:hover:bg-zinc-700 text-stone-400 hover:text-teal-600 cursor-pointer"
                title="Tambah Sub-catatan di bawah ini"
              >
                <Plus size={11} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.id);
                }}
                className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 cursor-pointer"
                title="Hapus Catatan"
              >
                <Trash2 size={11} />
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
    <div className="min-h-screen pt-18 pb-12 px-2 sm:px-4 max-w-[1780px] mx-auto space-y-2 font-sans antialiased text-stone-900 dark:text-zinc-100">
      <Seo
        title={
          language === 'en'
            ? 'Trilium Notes: Hierarchical Personal Knowledge Base & Rich WYSIWYG Editor'
            : 'Trilium Notes: Basis Pengetahuan Hierarkis & Editor Visual WYSIWYG'
        }
        description={
          language === 'en'
            ? 'Trilium Notes recreation with unlimited nested tree hierarchy, true WYSIWYG rich text editor, task lists, code snippets, tabs, and Trilium label attributes.'
            : 'Aplikasi catatan hierarkis ala Trilium Notes dengan struktur pohon tak terbatas, editor visual murni tanpa kode markdown, tab catatan, cuplikan kode, dan label atribut.'
        }
        url="/tools/notes"
      />

      {/* Trilium Main Window Container */}
      <div className="bg-[#f8fafc] dark:bg-[#1e2124] rounded-2xl border border-stone-300/80 dark:border-[#2f3136] shadow-xl overflow-hidden flex flex-col h-[calc(100vh-6.5rem)] min-h-[720px]">
        {/* TOP TRILIUM SYSTEM TOOLBAR */}
        <div className="h-10 bg-[#e2e8f0] dark:bg-[#282b30] border-b border-stone-300/80 dark:border-[#202225] flex items-center justify-between px-3 shrink-0 text-xs select-none">
          {/* Left: App Title & Toggle Tree */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-teal-600 flex items-center justify-center text-white font-bold text-[11px] shadow-2xs">
                T
              </div>
              <span className="font-bold tracking-tight text-stone-800 dark:text-zinc-200">Trilium Notes</span>
            </div>

            <button
              type="button"
              onClick={() => setIsTreeSidebarOpen(!isTreeSidebarOpen)}
              className="p-1 rounded hover:bg-stone-300/70 dark:hover:bg-[#36393f] text-stone-600 dark:text-zinc-400 cursor-pointer"
              title={isTreeSidebarOpen ? 'Tutup Pohon Catatan' : 'Buka Pohon Catatan'}
            >
              <Columns size={14} />
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreateModal(null)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold text-[11px] cursor-pointer shadow-2xs transition-colors"
            >
              <Plus size={12} />
              <span>{language === 'en' ? 'New Note' : 'Catatan Baru'}</span>
            </button>
          </div>

          {/* Center: Trilium Breadcrumb Bar */}
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-white/70 dark:bg-[#1e2124]/70 border border-stone-300/60 dark:border-[#36393f] text-[11px] text-stone-600 dark:text-zinc-400 max-w-lg overflow-x-auto truncate">
            <span className="text-stone-400">root</span>
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
          </div>

          {/* Right: Actions (Backup, Restore, Info, Print) */}
          <div className="flex items-center gap-1 text-stone-600 dark:text-zinc-400">
            <label
              className="p-1 rounded hover:bg-stone-300/70 dark:hover:bg-[#36393f] cursor-pointer"
              title="Pulihkan Cadangan (Import JSON)"
            >
              <FileUp size={14} />
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleExportJSON}
              className="p-1 rounded hover:bg-stone-300/70 dark:hover:bg-[#36393f] cursor-pointer"
              title="Unduh Cadangan (Export JSON)"
            >
              <FileDown size={14} />
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="p-1 rounded hover:bg-stone-300/70 dark:hover:bg-[#36393f] cursor-pointer"
              title="Cetak Catatan / PDF"
            >
              <Printer size={14} />
            </button>

            <button
              type="button"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className={`p-1 rounded cursor-pointer ${
                isRightSidebarOpen
                  ? 'bg-teal-600 text-white'
                  : 'hover:bg-stone-300/70 dark:hover:bg-[#36393f]'
              }`}
              title="Panel Atribut & Metadata"
            >
              <Sliders size={14} />
            </button>
          </div>
        </div>

        {/* TRILIUM TABBED BROWSING BAR */}
        <div className="h-8 bg-[#f1f5f9] dark:bg-[#202225] border-b border-stone-300/80 dark:border-[#2f3136] flex items-center px-2 gap-1 overflow-x-auto shrink-0 select-none">
          {openTabIds.map((tabId) => {
            const note = notes.find((n) => n.id === tabId);
            if (!note) return null;
            const isActiveTab = activeNoteId === tabId;

            return (
              <div
                key={tabId}
                onClick={() => setActiveNoteId(tabId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-t-md text-xs transition-colors cursor-pointer border-t border-x ${
                  isActiveTab
                    ? 'bg-white dark:bg-[#1e2124] border-stone-300/80 dark:border-[#2f3136] text-stone-900 dark:text-zinc-100 font-semibold shadow-2xs'
                    : 'bg-stone-200/50 dark:bg-[#282b30]/50 border-transparent text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-[#282b30]'
                }`}
              >
                {note.type === 'code' ? (
                  <Code size={12} className="text-cyan-500" />
                ) : note.type === 'tasklist' ? (
                  <CheckSquare size={12} className="text-emerald-500" />
                ) : note.type === 'folder' ? (
                  <Folder size={12} className="text-amber-500" />
                ) : (
                  <FileText size={12} className="text-stone-400" />
                )}
                <span className="truncate max-w-[130px]">{note.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleCloseTab(tabId, e)}
                  className="hover:text-rose-500 rounded p-0.5 ml-1 cursor-pointer"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>

        {/* TRILIUM BODY: 3 PANE WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          {/* PANE 1: HIERARCHICAL NOTE TREE (LEFT SIDEBAR) */}
          {isTreeSidebarOpen && (
            <div className="w-64 sm:w-72 bg-[#f8fafc] dark:bg-[#282b30] border-r border-stone-300/80 dark:border-[#202225] flex flex-col shrink-0">
              {/* Tree Header & Search */}
              <div className="p-2 space-y-2 border-b border-stone-300/60 dark:border-[#202225]">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'en' ? 'Search note tree...' : 'Cari di pohon catatan...'}
                    className="w-full pl-7 pr-3 py-1 rounded bg-white dark:bg-[#1e2124] border border-stone-300 dark:border-[#36393f] text-xs text-stone-900 dark:text-zinc-100 placeholder-stone-400 focus:outline-teal-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-stone-400 hover:text-stone-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Label filter chips if any */}
                {allLabels.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[10px]">
                    <span className="text-stone-400 uppercase font-bold shrink-0">Label:</span>
                    {allLabels.slice(0, 4).map(({ label, count }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          setSelectedLabelFilter(selectedLabelFilter === label ? null : label)
                        }
                        className={`px-1.5 py-0.5 rounded border whitespace-nowrap cursor-pointer transition-colors ${
                          selectedLabelFilter === label
                            ? 'bg-teal-600 text-white border-teal-600 font-bold'
                            : 'bg-white dark:bg-[#1e2124] text-stone-600 dark:text-zinc-400 border-stone-300 dark:border-[#36393f]'
                        }`}
                      >
                        #{label} ({count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tree Nodes List */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {renderTreeNodes(null)}
              </div>

              {/* Tree Bottom Action */}
              <div className="p-2 border-t border-stone-300/60 dark:border-[#202225] flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400">
                <span>{notes.length} Total Catatan</span>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                >
                  + Tambah Root
                </button>
              </div>
            </div>
          )}

          {/* PANE 2: MAIN NOTE WORKSPACE (CENTER) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#1e2124] overflow-hidden">
            {activeNote ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Note Title & Type Selector Header */}
                <div className="px-6 pt-4 pb-2 border-b border-stone-200 dark:border-[#282b30] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                      placeholder="Judul Catatan..."
                      className="w-full text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-100 bg-transparent border-none focus:outline-none placeholder-stone-300 dark:placeholder-zinc-600"
                    />

                    {/* Active Labels Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {activeNote.attributes
                        .filter((a) => a.type === 'label')
                        .map((attr) => (
                          <span
                            key={attr.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-mono"
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
                        + Label
                      </button>
                    </div>
                  </div>

                  {/* Note Type Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={activeNote.type}
                      onChange={(e) =>
                        updateNote(activeNote.id, { type: e.target.value as TriliumNoteType })
                      }
                      className="text-xs font-semibold px-2 py-1 rounded bg-stone-100 dark:bg-[#282b30] border border-stone-300 dark:border-[#36393f] text-stone-700 dark:text-zinc-300 focus:outline-teal-500 cursor-pointer"
                    >
                      <option value="text">📝 Rich Text (WYSIWYG)</option>
                      <option value="code">💻 Code Snippet</option>
                      <option value="tasklist">☑️ Task List (To-Do)</option>
                      <option value="folder">🗂️ Folder Container</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 cursor-pointer"
                      title="Hapus Catatan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* RICH TEXT FORMATTING TOOLBAR (TipTap WYSIWYG) */}
                {activeNote.type !== 'code' && editor && (
                  <div className="px-4 py-1.5 bg-[#f8fafc] dark:bg-[#282b30] border-b border-stone-200 dark:border-[#2f3136] flex flex-wrap items-center gap-1 text-stone-700 dark:text-zinc-300 text-xs shrink-0 select-none">
                    {/* Headings */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('heading', { level: 1 }) ? 'bg-teal-600 text-white font-bold' : ''
                      }`}
                      title="Heading 1"
                    >
                      <Heading1 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('heading', { level: 2 }) ? 'bg-teal-600 text-white font-bold' : ''
                      }`}
                      title="Heading 2"
                    >
                      <Heading2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('heading', { level: 3 }) ? 'bg-teal-600 text-white font-bold' : ''
                      }`}
                      title="Heading 3"
                    >
                      <Heading3 size={15} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Basic Styling */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('bold') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Tebal (Ctrl+B)"
                    >
                      <Bold size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('italic') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Miring (Ctrl+I)"
                    >
                      <Italic size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('strike') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Coretan"
                    >
                      <Strikethrough size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleHighlight().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer text-amber-500 ${
                        editor.isActive('highlight') ? 'bg-amber-500 text-white' : ''
                      }`}
                      title="Stabilo Sorot"
                    >
                      <Highlighter size={15} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Lists */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('bulletList') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Daftar Poin"
                    >
                      <List size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('orderedList') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Daftar Nomor"
                    >
                      <ListOrdered size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleTaskList().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('taskList') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Checklist Tugas"
                    >
                      <CheckSquare size={15} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Quotes & Tables */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      className={`p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer ${
                        editor.isActive('blockquote') ? 'bg-teal-600 text-white' : ''
                      }`}
                      title="Kutipan"
                    >
                      <Quote size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                          .run()
                      }
                      className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer"
                      title="Sisipkan Tabel (3x3)"
                    >
                      <TableIcon size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().setHorizontalRule().run()}
                      className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] cursor-pointer"
                      title="Garis Pemisah"
                    >
                      <Minus size={15} />
                    </button>

                    <div className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-1" />

                    {/* Undo / Redo */}
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                      className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] disabled:opacity-30 cursor-pointer"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                      className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-[#36393f] disabled:opacity-30 cursor-pointer"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo size={14} />
                    </button>
                  </div>
                )}

                {/* EDITOR CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeNote.type === 'code' ? (
                    /* CODE NOTE EDITOR */
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span>Bahasa Pemrograman:</span>
                          <select
                            value={activeNote.codeLanguage || 'javascript'}
                            onChange={(e) =>
                              updateNote(activeNote.id, { codeLanguage: e.target.value })
                            }
                            className="px-2 py-0.5 rounded bg-stone-100 dark:bg-[#282b30] border border-stone-300 dark:border-[#36393f] font-mono text-xs focus:outline-teal-500"
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
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
                            alert('Kode berhasil disalin!');
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 dark:bg-[#282b30] hover:bg-stone-200 text-stone-700 dark:text-zinc-300 cursor-pointer"
                        >
                          <Copy size={12} />
                          <span>Salin Kode</span>
                        </button>
                      </div>

                      <textarea
                        value={activeNote.content}
                        onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                        placeholder="// Tulis kode di sini..."
                        className="flex-1 w-full p-4 rounded-xl font-mono text-xs leading-relaxed bg-[#f8fafc] dark:bg-[#0f1115] text-stone-900 dark:text-emerald-400 border border-stone-300 dark:border-[#2f3136] resize-none focus:outline-teal-500"
                      />
                    </div>
                  ) : (
                    /* WYSIWYG TIPTAP EDITOR */
                    <div className="prose dark:prose-invert prose-stone max-w-none min-h-[420px] focus:outline-none">
                      <EditorContent
                        editor={editor}
                        className="min-h-[420px] focus:outline-none text-stone-800 dark:text-zinc-200 leading-relaxed text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* NOTE BOTTOM METRICS BAR */}
                <div className="h-7 bg-[#f8fafc] dark:bg-[#202225] border-t border-stone-200 dark:border-[#2f3136] px-4 flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400 select-none shrink-0">
                  <div className="flex items-center gap-3 font-mono">
                    <span>ID: {activeNote.id}</span>
                    <span>•</span>
                    <span>Tipe: {activeNote.type}</span>
                    <span>•</span>
                    <span>
                      Diperbarui:{' '}
                      {new Date(activeNote.updatedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                    <Check size={12} />
                    <span>Tersimpan Otomatis</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-stone-400 space-y-2">
                <FileText size={36} className="opacity-30" />
                <p className="text-sm font-semibold">Pilih atau buat catatan di panel pohon sebelah kiri</p>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="px-3 py-1 rounded bg-teal-600 text-white text-xs font-semibold cursor-pointer hover:bg-teal-500"
                >
                  + Catatan Baru
                </button>
              </div>
            )}
          </div>

          {/* PANE 3: NOTE ATTRIBUTES & METADATA (RIGHT SIDEBAR) */}
          {isRightSidebarOpen && activeNote && (
            <div className="w-72 bg-[#f8fafc] dark:bg-[#282b30] border-l border-stone-300/80 dark:border-[#202225] p-4 flex flex-col space-y-4 overflow-y-auto shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-stone-300/60 dark:border-[#36393f]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
                  Atribut & Properti
                </h4>
                <button
                  type="button"
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Attributes / Labels Manager */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 uppercase">
                  Label Catatan ({activeNote.attributes.length})
                </div>

                <div className="space-y-1.5">
                  {activeNote.attributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#1e2124] border border-stone-300/80 dark:border-[#36393f] text-xs font-mono"
                    >
                      <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 truncate">
                        <Tag size={11} />
                        <span className="font-bold">{attr.name}</span>
                        {attr.value && <span className="text-stone-400">={attr.value}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(attr.id)}
                        className="text-stone-400 hover:text-rose-500 p-0.5 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new attribute input */}
                <div className="pt-2 space-y-1.5">
                  <input
                    type="text"
                    value={newAttrName}
                    onChange={(e) => setNewAttrName(e.target.value)}
                    placeholder="Nama label (e.g. status)"
                    className="w-full px-2 py-1 rounded bg-white dark:bg-[#1e2124] border border-stone-300 dark:border-[#36393f] text-xs focus:outline-teal-500"
                  />
                  <input
                    type="text"
                    value={newAttrValue}
                    onChange={(e) => setNewAttrValue(e.target.value)}
                    placeholder="Nilai (opsional, e.g. active)"
                    className="w-full px-2 py-1 rounded bg-white dark:bg-[#1e2124] border border-stone-300 dark:border-[#36393f] text-xs focus:outline-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    disabled={!newAttrName.trim()}
                    className="w-full py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-2xs"
                  >
                    + Tambah Label
                  </button>
                </div>
              </div>

              <div className="h-px bg-stone-300/60 dark:bg-[#36393f]" />

              {/* Sub-notes Summary */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-500 dark:text-zinc-400 uppercase">
                  Sub-catatan ({notes.filter((n) => n.parentId === activeNote.id).length})
                </div>
                <div className="space-y-1">
                  {notes
                    .filter((n) => n.parentId === activeNote.id)
                    .map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelectNote(child.id)}
                        className="w-full text-left p-1.5 rounded bg-white dark:bg-[#1e2124] hover:border-teal-500 border border-stone-300/80 dark:border-[#36393f] text-xs truncate cursor-pointer block"
                      >
                        {child.title}
                      </button>
                    ))}
                  {notes.filter((n) => n.parentId === activeNote.id).length === 0 && (
                    <div className="text-stone-400 text-xs italic">Tidak ada sub-catatan</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(activeNote.id)}
                  className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer block pt-1"
                >
                  + Tambah Sub-catatan
                </button>
              </div>

              <div className="h-px bg-stone-300/60 dark:bg-[#36393f]" />

              {/* Note Metadata */}
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-zinc-400">
                <div className="text-[11px] font-bold uppercase text-stone-500">Metadata</div>
                <div className="flex justify-between">
                  <span>Dibuat:</span>
                  <span className="font-mono">{new Date(activeNote.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimodifikasi:</span>
                  <span className="font-mono">{new Date(activeNote.updatedAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Karakter:</span>
                  <span className="font-mono">{activeNote.content.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE NEW TRILIUM NOTE */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#282b30] p-6 rounded-2xl border border-stone-300 dark:border-[#36393f] max-w-md w-full space-y-4 shadow-2xl text-stone-900 dark:text-zinc-100">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-[#36393f]">
              <h3 className="text-base font-bold">
                {newNoteParentId ? 'Tambah Sub-catatan' : 'Tambah Catatan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewNoteModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-zinc-300">
                  Judul Catatan
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNoteConfirm()}
                  placeholder="e.g. Arsitektur Microservices / Daftar Belanja"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-[#1e2124] border border-stone-300 dark:border-[#36393f] text-stone-900 dark:text-zinc-100 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-zinc-300">
                  Tipe Catatan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'text' as const, label: '📝 Rich Text', desc: 'Editor visual kaya fitur' },
                    { type: 'code' as const, label: '💻 Code Snippet', desc: 'Cuplikan kode monospace' },
                    { type: 'tasklist' as const, label: '☑️ Task List', desc: 'Daftar to-do interaktif' },
                    { type: 'folder' as const, label: '🗂️ Folder', desc: 'Wadah kumpulan catatan' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setNewNoteType(item.type)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        newNoteType === item.type
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-bold'
                          : 'border-stone-200 dark:border-[#36393f] bg-stone-50/50 dark:bg-[#1e2124]'
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-[10px] text-stone-500 dark:text-zinc-400 font-normal">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {newNoteParentId && (
                <div className="text-[11px] text-stone-500 dark:text-zinc-400 p-2 rounded bg-stone-100 dark:bg-[#1e2124]">
                  Induk Catatan: <strong>{notes.find((n) => n.id === newNoteParentId)?.title}</strong>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewNoteModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateNoteConfirm}
                disabled={!newNoteTitle.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer shadow-2xs disabled:opacity-40"
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
