'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ImperiumLink } from '@/shared/lib/tiptap-extensions';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';

// Register all languages from lowlight
Object.keys(common).forEach((lang) => {
  lowlight.register(lang, common[lang]);
});

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const defaultImageUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.url;
};

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
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      ImperiumLink,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-none border-2 border-imperium-steel-dark',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-imperium-black rounded-none border-2 border-imperium-steel-dark p-4 my-4 overflow-x-auto font-terminal',
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
          'prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wider',
          'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-headings:text-imperium-bone',
          'prose-p:text-imperium-steel prose-p:font-terminal prose-p:leading-relaxed prose-p:whitespace-pre-wrap',
          'prose-strong:text-imperium-bone prose-strong:font-display prose-strong:uppercase',
          'prose-code:text-imperium-crimson prose-code:bg-imperium-crimson/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none prose-code:font-mono prose-code:text-sm prose-code:border prose-code:border-imperium-crimson/30',
          'prose-pre:bg-imperium-black prose-pre:border-2 prose-pre:border-imperium-steel-dark',
          'prose-blockquote:border-l-4 prose-blockquote:border-imperium-crimson prose-blockquote:text-imperium-steel-dark prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-ul:list-disc prose-ul:pl-6 prose-ul:text-imperium-steel',
          'prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-imperium-steel',
          'prose-li:marker:text-imperium-gold',
          'prose-a:text-imperium-crimson prose-a:no-underline hover:prose-a:underline prose-a:pb-0.5',
          'prose-hr:border-2 prose-hr:border-imperium-steel-dark prose-hr:my-6',
          'prose-img:rounded-none prose-img:my-4 prose-img:border-2 prose-img:border-imperium-steel-dark',
          'is-editor-empty:after:content-[attr(data-placeholder)] is-editor-empty:after:text-imperium-steel-dark is-editor-empty:after:pointer-events-none is-editor-empty:after:h-full is-editor-empty:after:float-left'
        ),
      },
    },
  });

  const insertImage = useCallback(async (file: File) => {
    const uploadHandler = onImageUpload || defaultImageUpload;
    try {
      setIsUploading(true);
      const url = await uploadHandler(file);
      if (editor) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      }
      setImageOpen(false);
    } catch {
      console.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [editor, onImageUpload]);

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

  // Toolbar button helper - uses button-element for proper styling
  const ToolbarButton = ({
    active,
    onClick,
    children,
    label,
    disabled = false
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    label: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-none border-2 transition-all',
        'border-imperium-steel-dark hover:border-imperium-steel',
        active
          ? 'bg-imperium-crimson/20 text-imperium-crimson border-imperium-crimson'
          : 'text-imperium-steel hover:text-imperium-bone',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );

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
        'rounded-none border-2 border-imperium-steel-dark bg-imperium-black overflow-hidden',
        className
      )}
    >
      {editable && !isMarkdownMode && (
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-imperium-steel-dark bg-imperium-black/50 p-2">
          {/* Headings Group */}
          <div className="flex items-center gap-1 pr-2 border-r border-imperium-steel-dark">
            {toolbarButtons.map((button) => (
              <ToolbarButton
                key={button.name}
                active={button.isActive()}
                onClick={button.action}
                label={button.tooltip}
              >
                <button.icon className="h-4 w-4" />
              </ToolbarButton>
            ))}
          </div>

          {/* Format Group */}
          <div className="flex items-center gap-1 px-2">
            {formatButtons.map((button) => (
              <ToolbarButton
                key={button.name}
                active={button.isActive()}
                onClick={button.action}
                label={button.tooltip}
              >
                <button.icon className="h-4 w-4" />
              </ToolbarButton>
            ))}
          </div>

          {/* Lists Group */}
          <div className="flex items-center gap-1 px-2 border-l border-imperium-steel-dark/50">
            {listButtons.map((button) => (
              <ToolbarButton
                key={button.name}
                active={button.isActive()}
                onClick={button.action}
                label={button.tooltip}
              >
                <button.icon className="h-4 w-4" />
              </ToolbarButton>
            ))}
          </div>

          {/* Insert Group */}
          <div className="flex items-center gap-1 pl-2 border-l border-imperium-steel-dark/50">
            <Popover open={linkOpen} onOpenChange={setLinkOpen}>
              <PopoverTrigger asChild>
                <div>
                  <ToolbarButton
                    active={editor.isActive('link')}
                    onClick={() => setLinkOpen(!linkOpen)}
                    label="Add link"
                  >
                    <Link2 className="h-4 w-4" />
                  </ToolbarButton>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-2">
                  <p className="font-display uppercase text-imperium-bone text-sm">Add link</p>
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
                <div>
                  <ToolbarButton
                    active={false}
                    onClick={() => setImageOpen(true)}
                    label="Add image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </ToolbarButton>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="start">
                <div className="space-y-3">
                  <p className="font-display uppercase text-imperium-bone text-sm">Add image</p>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL"
                    className="h-8"
                    disabled={isUploading}
                  />
                  <Input
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Alt text"
                    className="h-8"
                    disabled={isUploading}
                  />
                  <div className="space-y-1">
                    <p className="font-terminal text-imperium-steel-dark text-xs flex items-center gap-2">
                      Or upload a file:
                      {isUploading && <Loader2 className="h-3 w-3 animate-spin" />}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          insertImage(file);
                        }
                      }}
                      className="block w-full font-terminal text-xs text-imperium-steel file:mr-2 file:rounded-none file:border-2 file:border-imperium-steel-dark file:bg-imperium-black file:px-2 file:py-1 file:text-xs file:text-imperium-steel hover:file:bg-imperium-iron disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={addImage} type="button" disabled={isUploading}>
                      Insert
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Undo/Redo Group */}
          <div className="flex items-center gap-1 pl-2 border-l border-imperium-steel-dark/50 ml-auto">
            <ToolbarButton
              active={false}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              label="Undo"
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              active={false}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              label="Redo"
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Mode Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMarkdownMode(!isMarkdownMode)}
            className="gap-1.5 ml-2 text-imperium-steel hover:text-imperium-bone"
            type="button"
          >
            <Type className="h-4 w-4" />
            {isMarkdownMode ? 'Rich Text' : 'Markdown'}
          </Button>
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
          className="w-full min-h-[300px] bg-imperium-black p-4 font-terminal text-imperium-steel text-sm focus:outline-none resize-none"
          placeholder="Write in Markdown..."
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
