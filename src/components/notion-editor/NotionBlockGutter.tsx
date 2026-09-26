import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  FileText,
  X,
} from 'lucide-react';

interface NotionBlockGutterProps {
  editor: Editor | null;
  editorContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const NotionBlockGutter: React.FC<NotionBlockGutterProps> = ({
  editor,
  editorContainerRef,
}) => {
  const [handlePos, setHandlePos] = useState<{ top: number; left: number } | null>(null);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{ top: number; left: number; width: number } | null>(null);

  const draggedElementRef = useRef<HTMLElement | null>(null);
  const draggedPosRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Track active block on mouse move
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container || !editor) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) return;

      const prosemirror = container.querySelector('.ProseMirror');
      if (!prosemirror) return;

      // Check if mouse is hovering over the gutter handle itself
      if (handleRef.current && handleRef.current.contains(e.target as Node)) {
        return; // Keep existing active handle
      }

      // Check if mouse is in the left margin area of the container
      const containerRect = container.getBoundingClientRect();
      const isLeftGutterArea =
        e.clientX >= containerRect.left &&
        e.clientX <= containerRect.left + 55 &&
        e.clientY >= containerRect.top &&
        e.clientY <= containerRect.bottom;

      if (isLeftGutterArea && activeElement) {
        // User is moving towards the handle in the left gutter, keep it alive
        return;
      }

      const target = e.target as HTMLElement;
      if (!prosemirror.contains(target)) {
        return;
      }

      // Find direct child block of .ProseMirror
      let block: HTMLElement | null = target;
      while (block && block.parentElement && block.parentElement !== prosemirror) {
        block = block.parentElement;
      }

      if (block && block.parentElement === prosemirror) {
        const blockRect = block.getBoundingClientRect();
        const top = blockRect.top - containerRect.top + container.scrollTop + 2;
        // Position handle in left gutter
        const left = Math.max(6, blockRect.left - containerRect.left - 42);

        setHandlePos({ top, left });
        setActiveElement(block);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [editor, editorContainerRef, isDragging, activeElement]);

  // Drag and Drop reordering handlers attached to container
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container || !editor) return;

    const handleDragOver = (e: DragEvent) => {
      if (!draggedElementRef.current) return;
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';

      const prosemirror = container.querySelector('.ProseMirror');
      if (!prosemirror) return;

      const target = e.target as HTMLElement;
      let targetBlock: HTMLElement | null = target;
      while (targetBlock && targetBlock.parentElement && targetBlock.parentElement !== prosemirror) {
        targetBlock = targetBlock.parentElement;
      }

      if (targetBlock && targetBlock.parentElement === prosemirror && targetBlock !== draggedElementRef.current) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetBlock.getBoundingClientRect();
        const isBottomHalf = e.clientY > targetRect.top + targetRect.height / 2;

        const indicatorY = isBottomHalf
          ? targetRect.bottom - containerRect.top + container.scrollTop
          : targetRect.top - containerRect.top + container.scrollTop;

        setDropIndicator({
          top: indicatorY,
          left: targetRect.left - containerRect.left,
          width: targetRect.width,
        });
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!draggedElementRef.current || !editor) return;
      e.preventDefault();

      const prosemirror = container.querySelector('.ProseMirror');
      if (!prosemirror) return;

      const target = e.target as HTMLElement;
      let targetBlock: HTMLElement | null = target;
      while (targetBlock && targetBlock.parentElement && targetBlock.parentElement !== prosemirror) {
        targetBlock = targetBlock.parentElement;
      }

      if (targetBlock && targetBlock.parentElement === prosemirror && targetBlock !== draggedElementRef.current) {
        try {
          const sourcePos = editor.view.posAtDOM(draggedElementRef.current, 0);
          const targetPos = editor.view.posAtDOM(targetBlock, 0);

          const sourceNode = editor.state.doc.nodeAt(sourcePos);
          const targetNode = editor.state.doc.nodeAt(targetPos);

          if (sourceNode && targetNode) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = targetBlock.getBoundingClientRect();
            const isBottomHalf = e.clientY > targetRect.top + targetRect.height / 2;

            const insertPos = isBottomHalf ? targetPos + targetNode.nodeSize : targetPos;
            const sourceJson = sourceNode.toJSON();

            if (sourcePos < insertPos) {
              editor
                .chain()
                .focus()
                .insertContentAt(insertPos, sourceJson)
                .deleteRange({ from: sourcePos, to: sourcePos + sourceNode.nodeSize })
                .run();
            } else {
              editor
                .chain()
                .focus()
                .deleteRange({ from: sourcePos, to: sourcePos + sourceNode.nodeSize })
                .insertContentAt(insertPos, sourceJson)
                .run();
            }
          }
        } catch (err) {
          console.warn('Block drop reorder error:', err);
        }
      }

      setIsDragging(false);
      setDropIndicator(null);
      draggedElementRef.current = null;
      draggedPosRef.current = null;
    };

    const handleDragLeave = (e: DragEvent) => {
      if (e.relatedTarget && !container.contains(e.relatedTarget as Node)) {
        setDropIndicator(null);
      }
    };

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragleave', handleDragLeave);

    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragleave', handleDragLeave);
    };
  }, [editor, editorContainerRef]);

  // Click outside to close menu
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowBlockMenu(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  if (!editor || !handlePos || !activeElement) return null;

  // Insert empty block below
  const handleInsertBelow = () => {
    if (!activeElement || !editor) return;
    try {
      const pos = editor.view.posAtDOM(activeElement, 0);
      const node = editor.state.doc.nodeAt(pos);
      const insertPos = pos + (node ? node.nodeSize : activeElement.textContent?.length || 0);

      editor.chain().focus().insertContentAt(insertPos, { type: 'paragraph' }).run();
      setShowBlockMenu(false);
    } catch {
      editor.chain().focus().createParagraphNear().run();
    }
  };

  // Delete current block
  const handleDeleteBlock = () => {
    if (!activeElement || !editor) return;
    try {
      const pos = editor.view.posAtDOM(activeElement, 0);
      const node = editor.state.doc.nodeAt(pos);
      if (node) {
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      }
    } catch {
      activeElement.remove();
    }
    setShowBlockMenu(false);
    setHandlePos(null);
  };

  // Duplicate current block
  const handleDuplicateBlock = () => {
    if (!activeElement || !editor) return;
    try {
      const pos = editor.view.posAtDOM(activeElement, 0);
      const node = editor.state.doc.nodeAt(pos);
      if (node) {
        editor
          .chain()
          .focus()
          .insertContentAt(pos + node.nodeSize, node.toJSON())
          .run();
      }
    } catch (e) {
      console.warn('Duplicate fallback:', e);
    }
    setShowBlockMenu(false);
  };

  // Turn into specific node type
  const handleTurnInto = (type: string, level?: number) => {
    if (!activeElement || !editor) return;
    try {
      const pos = editor.view.posAtDOM(activeElement, 0);
      editor.commands.setTextSelection(pos + 1);

      if (type === 'paragraph') editor.chain().focus().setParagraph().run();
      if (type === 'heading') editor.chain().focus().toggleHeading({ level: (level as any) || 1 }).run();
      if (type === 'bulletList') editor.chain().focus().toggleBulletList().run();
      if (type === 'orderedList') editor.chain().focus().toggleOrderedList().run();
      if (type === 'taskList') editor.chain().focus().toggleTaskList().run();
      if (type === 'blockquote') editor.chain().focus().toggleBlockquote().run();
      if (type === 'codeBlock') editor.chain().focus().toggleCodeBlock().run();
    } catch (e) {
      console.warn('Turn into failed:', e);
    }
    setShowBlockMenu(false);
  };

  // Move block up or down
  const handleMoveBlock = (direction: 'up' | 'down') => {
    if (!activeElement || !editor) return;
    try {
      const pos = editor.view.posAtDOM(activeElement, 0);
      const node = editor.state.doc.nodeAt(pos);
      if (!node) return;

      const nodeSize = node.nodeSize;
      const json = node.toJSON();

      if (direction === 'up') {
        const resolved = editor.state.doc.resolve(pos);
        const prevPos = resolved.before(1);
        if (prevPos >= 0) {
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + nodeSize })
            .insertContentAt(prevPos, json)
            .run();
        }
      } else {
        const nextPos = pos + nodeSize;
        if (nextPos < editor.state.doc.content.size) {
          const nextNode = editor.state.doc.nodeAt(nextPos);
          if (nextNode) {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + nodeSize })
              .insertContentAt(nextPos + nextNode.nodeSize - nodeSize, json)
              .run();
          }
        }
      }
    } catch (e) {
      console.warn('Move block failed:', e);
    }
    setShowBlockMenu(false);
  };

  // Native HTML5 Drag Start
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    draggedElementRef.current = activeElement;
    try {
      draggedPosRef.current = editor.view.posAtDOM(activeElement, 0);
    } catch {
      draggedPosRef.current = null;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', activeElement.innerText || '');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropIndicator(null);
    draggedElementRef.current = null;
    draggedPosRef.current = null;
  };

  return (
    <>
      {/* Drop Indicator Line between blocks during drag */}
      {isDragging && dropIndicator && (
        <div
          className="absolute z-50 h-1 bg-gradient-to-r from-purple-500 via-rose-500 to-indigo-500 rounded-full shadow-md pointer-events-none transition-all duration-75 animate-pulse"
          style={{
            top: `${dropIndicator.top - 2}px`,
            left: `${dropIndicator.left}px`,
            width: `${dropIndicator.width}px`,
          }}
        />
      )}

      {/* Notion Gutter Handle on Left Margin */}
      <div
        ref={handleRef}
        className="absolute z-30 flex items-center gap-0.5 select-none transition-opacity duration-150 animate-in fade-in"
        style={{
          top: `${handlePos.top}px`,
          left: `${handlePos.left}px`,
        }}
      >
        {/* + Add Block Below */}
        <button
          type="button"
          onClick={handleInsertBelow}
          className="w-5 h-5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
          title="Klik untuk tambah baris baru di bawah (+)"
        >
          <Plus size={13} />
        </button>

        {/* ::: Drag Handle & Context Menu */}
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={(e) => {
            e.stopPropagation();
            setShowBlockMenu(!showBlockMenu);
          }}
          className="w-5 h-5 rounded hover:bg-stone-200 dark:hover:bg-zinc-800 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors shadow-2xs group"
          title="Tahan untuk drag & drop susunan blok, atau klik untuk menu aksi blok"
        >
          <GripVertical size={14} className="group-hover:text-rose-500 transition-colors" />
        </div>
      </div>

      {/* Block Action Popover Menu */}
      {showBlockMenu && (
        <div
          ref={menuRef}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute z-40 bg-white dark:bg-[#1a1d23] border border-stone-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 w-56 text-xs text-stone-800 dark:text-zinc-100 font-sans space-y-0.5 animate-in fade-in"
          style={{
            top: `${handlePos.top + 24}px`,
            left: `${handlePos.left + 24}px`,
          }}
        >
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider border-b border-stone-100 dark:border-zinc-800">
            <span>Aksi Blok</span>
            <button
              type="button"
              onClick={() => setShowBlockMenu(false)}
              className="hover:text-stone-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={11} />
            </button>
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDeleteBlock}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 size={13} />
            <span>Hapus Blok</span>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={handleDuplicateBlock}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-200 cursor-pointer transition-colors"
          >
            <Copy size={13} />
            <span>Duplikasi Blok</span>
          </button>

          {/* Move Up / Down */}
          <div className="flex items-center gap-1 px-1 py-0.5">
            <button
              type="button"
              onClick={() => handleMoveBlock('up')}
              className="flex-1 py-1 px-2 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1 text-stone-700 dark:text-zinc-300 cursor-pointer"
            >
              <ArrowUp size={12} />
              <span>Ke Atas</span>
            </button>
            <button
              type="button"
              onClick={() => handleMoveBlock('down')}
              className="flex-1 py-1 px-2 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-1 text-stone-700 dark:text-zinc-300 cursor-pointer"
            >
              <ArrowDown size={12} />
              <span>Ke Bawah</span>
            </button>
          </div>

          <div className="my-1 border-t border-stone-100 dark:border-zinc-800" />

          <div className="px-2 py-0.5 text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
            Ubah Menjadi...
          </div>

          <button
            type="button"
            onClick={() => handleTurnInto('paragraph')}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer"
          >
            <FileText size={12} className="text-stone-400" />
            <span>Teks Biasa</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('heading', 1)}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer font-bold"
          >
            <Heading1 size={12} />
            <span>Heading 1</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('heading', 2)}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer font-semibold"
          >
            <Heading2 size={12} />
            <span>Heading 2</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('heading', 3)}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer"
          >
            <Heading3 size={12} />
            <span>Heading 3</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('bulletList')}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer"
          >
            <List size={12} />
            <span>Daftar Poin</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('orderedList')}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer"
          >
            <ListOrdered size={12} />
            <span>Daftar Nomor</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('taskList')}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer"
          >
            <ListTodo size={12} />
            <span>Checklist Tugas</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('blockquote')}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer"
          >
            <Quote size={12} />
            <span>Kutipan (Quote)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTurnInto('codeBlock')}
            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-stone-700 dark:text-zinc-300 cursor-pointer font-mono"
          >
            <Code2 size={12} />
            <span>Blok Kode (Code Block)</span>
          </button>
        </div>
      )}
    </>
  );
};
