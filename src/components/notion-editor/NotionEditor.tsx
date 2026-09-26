import React, { useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link as LinkExtension } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Markdown } from 'tiptap-markdown';
import { common, createLowlight } from 'lowlight';
import { NotionFloatingMenu } from './NotionFloatingMenu';
import { NotionBlockGutter } from './NotionBlockGutter';
import { NotionSlashMenu } from './NotionSlashMenu';
import { handleCodeBlockContainerClick } from '../../utils/codeRunner';

const lowlight = createLowlight(common);

interface NotionEditorProps {
  value: string;
  onChange: (markdownValue: string) => void;
  placeholder?: string;
  minHeight?: string;
  vanpediaTerms?: { slug: string; title: string }[];
}

export const NotionEditor: React.FC<NotionEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis konten, blok teks untuk AI Improve, atau ketik "/" untuk menu...',
  minHeight = '380px',
  vanpediaTerms = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
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
      TextStyle,
      Color,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-rose-600 dark:text-rose-400 underline font-medium cursor-pointer',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Placeholder.configure({
        placeholder,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] text-stone-800 dark:text-zinc-100 font-reading-sans text-base leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      try {
        const md = (editor.storage as any).markdown?.getMarkdown?.() || editor.getHTML();
        onChange(md);
      } catch {
        onChange(editor.getHTML());
      }
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
  });

  // Keep editor content in sync when value changes externally (e.g. from template/draft load)
  useEffect(() => {
    if (!editor || isInternalUpdate.current) return;
    const currentMd = (editor.storage as any).markdown?.getMarkdown?.();
    if (value !== currentMd && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Handle run and copy buttons inside code cards
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleCodeBlockContainerClick(e);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative flex-1 p-6 sm:p-10 bg-white dark:bg-[#15171b] overflow-y-auto min-h-0 select-text notion-like-canvas"
      style={{ minHeight }}
    >
      {/* 1. NOTION SELECTION BUBBLE MENU (✨ Improve, AI Dropdown, Block type, Format) */}
      <NotionFloatingMenu editor={editor} />

      {/* 2. NOTION DRAG & DROP BLOCK GUTTER (::: drag handle and block action menu) */}
      <NotionBlockGutter editor={editor} editorContainerRef={containerRef} />

      {/* 3. NOTION SLASH COMMAND MENU (/ quick inserter) */}
      <NotionSlashMenu editor={editor} vanpediaTerms={vanpediaTerms} />

      {/* 4. MAIN PROSEMIRROR EDITABLE CANVAS */}
      <EditorContent editor={editor} />
    </div>
  );
};
