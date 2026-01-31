'use client';

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Table,
  Palette,
  FileCode,
  Eye,
  EyeOff,
} from 'lucide-react';
import { type Editor } from '@tiptap/react';
import { useState, useCallback } from 'react';
import { ColorPicker } from './ColorPicker';
import { LinkModal } from './LinkModal';
import { ImageModal } from './ImageModal';
import { type LinkOption } from './types';

interface EditorToolbarProps {
  editor: Editor | null;
  showMarkdown: boolean;
  onToggleMarkdown: () => void;
}

type ToolbarButton = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  isActive: () => boolean;
  canShow?: () => boolean;
  hasDropdown?: boolean;
};

interface ToolbarGroup {
  buttons: ToolbarButton[];
}

export function EditorToolbar({ editor, showMarkdown, onToggleMarkdown }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleLinkInsert = useCallback((link: LinkOption) => {
    if (!editor) return;
    if (link.url) {
      editor.chain().focus().setLink({ href: link.url }).run();
    }
  }, [editor]);

  const handleColorChange = useCallback((color: string) => {
    if (!editor) return;
    if (color) {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
  }, [editor]);

  if (!editor) return null;

  const toolbarGroups: ToolbarGroup[] = [
    // Text formatting
    {
      buttons: [
        {
          icon: Bold,
          label: 'Bold',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: () => editor.isActive('bold'),
        },
        {
          icon: Italic,
          label: 'Italic',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: () => editor.isActive('italic'),
        },
        {
          icon: Strikethrough,
          label: 'Strikethrough',
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: () => editor.isActive('strike'),
        },
        {
          icon: Code,
          label: 'Code',
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: () => editor.isActive('code'),
        },
      ],
    },
    // Headings
    {
      buttons: [
        {
          icon: Heading1,
          label: 'Heading 1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => editor.isActive('heading', { level: 1 }),
        },
        {
          icon: Heading2,
          label: 'Heading 2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => editor.isActive('heading', { level: 2 }),
        },
        {
          icon: Heading3,
          label: 'Heading 3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: () => editor.isActive('heading', { level: 3 }),
        },
      ],
    },
    // Lists
    {
      buttons: [
        {
          icon: List,
          label: 'Bullet List',
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: () => editor.isActive('bulletList'),
        },
        {
          icon: ListOrdered,
          label: 'Ordered List',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: () => editor.isActive('orderedList'),
        },
        {
          icon: CheckSquare,
          label: 'Task List',
          action: () => editor.chain().focus().toggleTaskList().run(),
          isActive: () => editor.isActive('taskList'),
        },
      ],
    },
    // Blocks
    {
      buttons: [
        {
          icon: Quote,
          label: 'Blockquote',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: () => editor.isActive('blockquote'),
        },
        {
          icon: FileCode,
          label: 'Code Block',
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => editor.isActive('codeBlock'),
        },
        {
          icon: Minus,
          label: 'Horizontal Rule',
          action: () => editor.chain().focus().setHorizontalRule().run(),
          isActive: () => false,
        },
      ],
    },
    // Insert
    {
      buttons: [
        {
          icon: Link2,
          label: 'Link',
          action: () => setShowLinkModal(true),
          isActive: () => editor.isActive('link'),
        },
        {
          icon: ImageIcon,
          label: 'Image',
          action: () => setShowImageModal(true),
          isActive: () => false,
        },
        {
          icon: Table,
          label: 'Table',
          action: () => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          },
          isActive: () => editor.isActive('table'),
        },
      ],
    },
    // Color
    {
      buttons: [
        {
          icon: Palette,
          label: 'Text Color',
          action: () => setShowColorPicker(!showColorPicker),
          isActive: () => false,
          hasDropdown: showColorPicker,
        },
      ],
    },
    // History
    {
      buttons: [
        {
          icon: Undo,
          label: 'Undo',
          action: () => editor.chain().focus().undo().run(),
          isActive: () => false,
          canShow: () => editor.can().undo(),
        },
        {
          icon: Redo,
          label: 'Redo',
          action: () => editor.chain().focus().redo().run(),
          isActive: () => false,
          canShow: () => editor.can().redo(),
        },
      ],
    },
  ];

  return (
    <div className="border-b border-zinc-800 p-2">
      <div className="flex flex-wrap items-center gap-1">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-1 pr-2 mr-2 border-r border-zinc-800 last:border-r-0 last:mr-0 last:pr-0">
            {group.buttons.map((button) => {
              const Icon = button.icon;
              const isActive = button.isActive();
              const canShow = button.canShow?.() ?? true;

              if (!canShow) return null;

              return (
                <div key={button.label} className="relative">
                  <button
                    type="button"
                    onClick={button.action}
                    disabled={button.hasDropdown}
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                    title={button.label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                  {button.hasDropdown && (
                    <ColorPicker
                      currentColor={editor.getAttributes('textStyle').color || ''}
                      onColorChange={handleColorChange}
                      onClose={() => setShowColorPicker(false)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Markdown toggle */}
        <div className="ml-auto pl-2 border-l border-zinc-800">
          <button
            type="button"
            onClick={onToggleMarkdown}
            className={`p-2 rounded-lg transition-colors ${
              showMarkdown
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title={showMarkdown ? 'Hide Markdown' : 'Show Markdown'}
          >
            {showMarkdown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={handleLinkInsert}
        initialUrl={editor.getAttributes('link').href || ''}
      />
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={(url) => editor.chain().focus().setImage({ src: url }).run()}
        initialUrl={editor.getAttributes('image').src || ''}
      />
    </div>
  );
}
