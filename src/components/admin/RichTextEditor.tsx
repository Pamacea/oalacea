'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
  Pilcrow,
  WrapText,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Register all languages from lowlight
Object.keys(common).forEach((lang) => {
  lowlight.register(lang as any, common[lang as any] as any);
});

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write your content here...',
  editable = true,
  className,
  onImageUpload,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageOpen, setImageOpen] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-zinc-400 hover:text-zinc-300 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-zinc-900 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] px-4 py-3',
          'prose-headings:text-white prose-headings:font-semibold',
          'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
          'prose-p:text-zinc-300 prose-p:leading-relaxed',
          'prose-strong:text-white prose-strong:font-semibold',
          'prose-code:text-zinc-400 prose-code:bg-zinc-400/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm',
          'prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800',
          'prose-blockquote:border-l-2 prose-blockquote:border-zinc-500 prose-blockquote:text-zinc-400 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-ul:list-disc prose-ul:pl-6 prose-ul:text-zinc-300',
          'prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-zinc-300',
          'prose-li:marker:text-zinc-500',
          'prose-a:text-zinc-400 prose-a:no-underline hover:prose-a:underline',
          'prose-hr:border-zinc-800 prose-hr:my-6',
          'prose-img:rounded-lg prose-img:my-4',
          'is-editor-empty:after:content-[attr(data-placeholder)] is-editor-empty:after:text-zinc-500 is-editor-empty:after:pointer-events-none is-editor-empty:after:h-full is-editor-empty:after:float-left'
        ),
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
    }
    setLinkOpen(false);
  };

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
    setLinkOpen(false);
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl('');
      setImageAlt('');
    }
    setImageOpen(false);
  };

  const insertImage = async (file: File) => {
    if (onImageUpload) {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    }
  };

  const toolbarButtons = [
    {
      name: 'heading1',
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
      tooltip: 'Heading 1',
    },
    {
      name: 'heading2',
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
      tooltip: 'Heading 2',
    },
    {
      name: 'heading3',
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
      tooltip: 'Heading 3',
    },
    {
      name: 'paragraph',
      icon: Pilcrow,
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editor.isActive('paragraph'),
      tooltip: 'Paragraph',
    },
  ];

  const formatButtons = [
    {
      name: 'bold',
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
      tooltip: 'Bold',
    },
    {
      name: 'italic',
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
      tooltip: 'Italic',
    },
    {
      name: 'code',
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
      tooltip: 'Inline Code',
    },
  ];

  const listButtons = [
    {
      name: 'bulletList',
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
      tooltip: 'Bullet List',
    },
    {
      name: 'orderedList',
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
      tooltip: 'Numbered List',
    },
    {
      name: 'codeBlock',
      icon: WrapText,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
      tooltip: 'Code Block',
    },
  ];

  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden',
        className
      )}
    >
      {editable && !isMarkdownMode && (
        <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 bg-zinc-900/50 p-2">
          <div className="flex items-center gap-1 pr-2">
            {toolbarButtons.map((button) => (
              <Toggle
                key={button.name}
                size="sm"
                pressed={button.isActive()}
                onPressedChange={button.action}
                aria-label={button.tooltip}
                title={button.tooltip}
              >
                <button.icon className="h-4 w-4" />
              </Toggle>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1 px-2">
            {formatButtons.map((button) => (
              <Toggle
                key={button.name}
                size="sm"
                pressed={button.isActive()}
                onPressedChange={button.action}
                aria-label={button.tooltip}
                title={button.tooltip}
              >
                <button.icon className="h-4 w-4" />
              </Toggle>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1 px-2">
            {listButtons.map((button) => (
              <Toggle
                key={button.name}
                size="sm"
                pressed={button.isActive()}
                onPressedChange={button.action}
                aria-label={button.tooltip}
                title={button.tooltip}
              >
                <button.icon className="h-4 w-4" />
              </Toggle>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1 px-2">
            <Popover open={linkOpen} onOpenChange={setLinkOpen}>
              <PopoverTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive('link')}
                  aria-label="Add link"
                  title="Add link"
                >
                  <Link2 className="h-4 w-4" />
                </Toggle>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-200">Add link</p>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-8"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setLink();
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    {editor.isActive('link') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={unsetLink}
                        type="button"
                      >
                        Remove
                      </Button>
                    )}
                    <Button size="sm" onClick={setLink} type="button">
                      Add
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={imageOpen} onOpenChange={setImageOpen}>
              <PopoverTrigger asChild>
                <Toggle
                  size="sm"
                  aria-label="Add image"
                  title="Add image"
                  onClick={() => setImageOpen(true)}
                >
                  <ImageIcon className="h-4 w-4" />
                </Toggle>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="start">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-zinc-200">Add image</p>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL"
                    className="h-8"
                  />
                  <Input
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Alt text"
                    className="h-8"
                  />
                  {onImageUpload && (
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Or upload a file:</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            insertImage(file);
                            setImageOpen(false);
                          }
                        }}
                        className="block w-full text-xs text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-xs file:text-zinc-300 hover:file:bg-zinc-700"
                      />
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button size="sm" onClick={addImage} type="button">
                      Insert
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-1 pl-2">
            <Toggle
              size="sm"
              aria-label="Undo"
              title="Undo"
              onPressedChange={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              aria-label="Redo"
              title="Redo"
              onPressedChange={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Toggle>
          </div>

          <div className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMarkdownMode(!isMarkdownMode)}
              className="gap-1.5"
              type="button"
            >
              <Type className="h-4 w-4" />
              {isMarkdownMode ? 'Rich Text' : 'Markdown'}
            </Button>
          </div>
        </div>
      )}

      {isMarkdownMode ? (
        <textarea
          value={editor.getText()}
          onChange={(e) => {
            const lines = e.target.value.split('\n');
            let html = '';
            lines.forEach((line) => {
              if (line.startsWith('# ')) {
                html += `<h1>${line.slice(2)}</h1>`;
              } else if (line.startsWith('## ')) {
                html += `<h2>${line.slice(3)}</h2>`;
              } else if (line.startsWith('### ')) {
                html += `<h3>${line.slice(4)}</h3>`;
              } else if (line.startsWith('- ')) {
                html += `<ul><li>${line.slice(2)}</li></ul>`;
              } else if (line.match(/^\d+\. /)) {
                html += `<ol><li>${line.replace(/^\d+\. /, '')}</li></ol>`;
              } else if (line) {
                html += `<p>${line}</p>`;
              }
            });
            editor.commands.setContent(html || '<p></p>');
          }}
          className="w-full min-h-[300px] bg-transparent p-4 text-zinc-300 font-mono text-sm focus:outline-none resize-none"
          placeholder="Write in Markdown..."
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
