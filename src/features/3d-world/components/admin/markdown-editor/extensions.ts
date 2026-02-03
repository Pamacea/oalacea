import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { MarkdownLink, getBaseExtensions } from '@/shared/lib/tiptap-extensions';

const lowlight = createLowlight(common);

export const getTiptapExtensions = (placeholder = 'Start writing...') => [
  ...getBaseExtensions(placeholder),
  MarkdownLink,
  Image.configure({
    HTMLAttributes: {
      class: 'max-w-full h-auto rounded-sm',
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: 'bg-zinc-900 rounded-sm p-4 my-4 overflow-x-auto',
    },
  }),
  Placeholder.configure({
    placeholder,
    emptyEditorClass: 'is-editor-empty',
  }),
];
