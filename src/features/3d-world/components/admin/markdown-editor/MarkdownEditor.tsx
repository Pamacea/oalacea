'use client';

import { useEffect, useCallback, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { getTiptapExtensions } from './extensions';
import { EditorToolbar } from './EditorToolbar';
import type { MarkdownEditorProps } from './types';

export interface MarkdownEditorRef {
  getMarkdown: () => string;
  setMarkdown: (content: string) => void;
  getEditor: () => Editor | null;
  clearContent: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  ({ content, onChange, placeholder = 'Start writing...', editable = true, readonly = false }, ref) => {
    const [showMarkdown, setShowMarkdown] = useState(false);
    const editorRef = useRef<Editor | null>(null);
    const isUpdatingRef = useRef(false);

    const editor = useEditor({
      extensions: getTiptapExtensions(placeholder),
      content,
      editable: editable && !readonly,
      editorProps: {
        attributes: {
          class: 'prose prose-invert prose-zinc max-w-none focus:outline-none min-h-[300px] px-4 py-3',
        },
      },
      onUpdate: ({ editor }) => {
        if (!isUpdatingRef.current) {
          onChange(editor.getHTML());
        }
      },
      immediatelyRender: false,
    });

    useEffect(() => {
      editorRef.current = editor || null;
    }, [editor]);

    useImperativeHandle(ref, () => ({
      getMarkdown: () => {
        if (!editor) return '';
        return editor.getHTML();
      },
      setMarkdown: (newContent: string) => {
        if (editor) {
          isUpdatingRef.current = true;
          editor.commands.setContent(newContent);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 0);
        }
      },
      getEditor: () => editor,
      clearContent: () => {
        if (editor) {
          editor.commands.clearContent();
        }
      },
    }));

    useEffect(() => {
      if (editor && content !== editor.getHTML() && !isUpdatingRef.current) {
        isUpdatingRef.current = true;
        editor.commands.setContent(content);
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    }, [content, editor]);

    const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    }, [onChange]);

    if (!editor) {
      return (
        <div className="w-full h-64 bg-zinc-900 border border-zinc-700 rounded-sm animate-pulse" />
      );
    }

    if (showMarkdown || readonly) {
      return (
        <div className="relative">
          <textarea
            value={content}
            onChange={handleMarkdownChange}
            readOnly={readonly}
            placeholder={placeholder}
            className="w-full min-h-[300px] bg-zinc-900 border border-zinc-700 rounded-sm px-4 py-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-y"
            style={{ minHeight: '300px' }}
          />
        </div>
      );
    }

    return (
      <div className="w-full border border-zinc-700 rounded-sm overflow-hidden bg-zinc-900">
        {!readonly && <EditorToolbar editor={editor} showMarkdown={showMarkdown} onToggleMarkdown={() => setShowMarkdown(!showMarkdown)} />}
        <EditorContent editor={editor} />
      </div>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';

export { MarkdownEditor };
