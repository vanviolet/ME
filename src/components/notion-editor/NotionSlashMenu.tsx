import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Table as TableIcon,
  Minus,
  Sigma,
  BookOpen,
  FileText,
  Search,
} from 'lucide-react';

interface NotionSlashMenuProps {
  editor: Editor | null;
  vanpediaTerms?: { slug: string; title: string }[];
}

export const NotionSlashMenu: React.FC<NotionSlashMenuProps> = ({
  editor,
  vanpediaTerms = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const SLASH_COMMANDS = [
    {
      id: 'text',
      title: 'Teks Biasa',
      description: 'Mulai menulis paragraf teks biasa',
      icon: FileText,
      action: () => editor?.chain().focus().setParagraph().run(),
    },
    {
      id: 'h1',
      title: 'Heading 1',
      description: 'Judul seksi utama besar',
      icon: Heading1,
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      description: 'Subjudul bagian menengah',
      icon: Heading2,
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'h3',
      title: 'Heading 3',
      description: 'Subjudul sub-seksi kecil',
      icon: Heading3,
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      id: 'bullet',
      title: 'Daftar Poin (Bullet List)',
      description: 'Buat daftar tidak bernomor dengan poin',
      icon: List,
      action: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'ordered',
      title: 'Daftar Bernomor (Numbered List)',
      description: 'Daftar langkah urutan bernomor',
      icon: ListOrdered,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'task',
      title: 'Daftar Tugas (Task List)',
      description: 'Checklist tugas dengan kotak centang',
      icon: ListTodo,
      action: () => editor?.chain().focus().toggleTaskList().run(),
    },
    {
      id: 'quote',
      title: 'Kutipan (Quote)',
      description: 'Tangkap kutipan penting atau referensi',
      icon: Quote,
      action: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'code',
      title: 'Blok Kode (Code Block)',
      description: 'Blok kode dengan syntax highlight, Error Lens & Prettier',
      icon: Code2,
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'code-js',
      title: 'JavaScript Code Snippet',
      description: 'Blok kode JS interaktif dengan runner & Error Lens',
      icon: Code2,
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent(
            '```javascript\n// JavaScript Snippet\nfunction main() {\n  console.log("Hello from code runner!");\n}\nmain();\n```\n'
          )
          .run(),
    },
    {
      id: 'code-ts',
      title: 'TypeScript Code Snippet',
      description: 'Blok kode TS dengan type annotations & Error Lens',
      icon: Code2,
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent(
            '```typescript\ninterface Config {\n  appName: string;\n  version: number;\n}\nconst appConfig: Config = {\n  appName: "Van Studio",\n  version: 2.0,\n};\n```\n'
          )
          .run(),
    },
    {
      id: 'code-json',
      title: 'JSON Data Snippet',
      description: 'Struktur JSON dengan validasi sintaks & formatting',
      icon: Code2,
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertContent('```json\n{\n  "name": "data",\n  "status": "active"\n}\n```\n')
          .run(),
    },
    {
      id: 'table',
      title: 'Tabel (Table)',
      description: 'Sisipkan tabel 3x3 dengan header',
      icon: TableIcon,
      action: () =>
        editor
          ?.chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      id: 'divider',
      title: 'Garis Pemisah (Divider)',
      description: 'Garis batas visual antar seksi',
      icon: Minus,
      action: () => editor?.chain().focus().setHorizontalRule().run(),
    },
  ];

  const filteredCommands = SLASH_COMMANDS.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const { selection } = editor.state;
      const { $from } = selection;

      // Check text in current node before cursor
      const textBefore = $from.parent.textBetween(0, $from.parentOffset, ' ', ' ');

      // Trigger on '/' or '/query'
      const match = textBefore.match(/\/([a-zA-Z0-9_-]*)$/);

      if (match) {
        const q = match[1];
        setQuery(q);
        setSelectedIndex(0);

        try {
          const { view } = editor;
          const coordsAtCursor = view.coordsAtPos($from.pos);
          const top = Math.min(window.innerHeight - 320, coordsAtCursor.bottom + 8);
          const left = Math.min(window.innerWidth - 300, Math.max(16, coordsAtCursor.left));

          setCoords({ top, left });
          setIsOpen(true);
        } catch {
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  // Handle keyboard navigation for slash menu
  useEffect(() => {
    if (!isOpen || !editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          applyCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredCommands, selectedIndex, editor]);

  const applyCommand = (cmd: typeof SLASH_COMMANDS[0]) => {
    if (!editor) return;

    // Delete the slash trigger text
    const { selection } = editor.state;
    const { $from } = selection;
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, ' ', ' ');
    const match = textBefore.match(/\/([a-zA-Z0-9_-]*)$/);

    if (match) {
      const matchLen = match[0].length;
      editor.chain().focus().deleteRange({ from: $from.pos - matchLen, to: $from.pos }).run();
    }

    cmd.action();
    setIsOpen(false);
  };

  if (!isOpen || !coords) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 w-72 max-h-80 overflow-y-auto text-xs text-stone-800 dark:text-zinc-100 font-sans space-y-0.5 animate-in fade-in"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
    >
      <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
        <span>Perintah Blok (Slash /)</span>
        <span>Enter untuk pilih</span>
      </div>

      <div className="py-1 space-y-0.5">
        {filteredCommands.map((cmd, idx) => {
          const Icon = cmd.icon;
          const isSelected = selectedIndex === idx;

          return (
            <div
              key={cmd.id}
              onClick={() => applyCommand(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium'
                  : 'hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${
                  isSelected
                    ? 'border-rose-300 dark:border-rose-700 bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400'
                    : 'border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/60 text-stone-500 dark:text-zinc-400'
                }`}
              >
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs leading-none mb-0.5 truncate">{cmd.title}</div>
                <div className="text-[10px] text-stone-400 dark:text-zinc-500 leading-tight truncate">
                  {cmd.description}
                </div>
              </div>
            </div>
          );
        })}

        {filteredCommands.length === 0 && (
          <div className="p-3 text-center text-stone-400 text-xs">
            Tidak ada perintah yang cocok dengan "{query}"
          </div>
        )}
      </div>
    </div>
  );
};
