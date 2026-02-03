import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

const lowlight = createLowlight(common);

// Link extension for admin/imperium theme (red/pink links)
export const ImperiumLink = Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'text-imperium-crimson hover:text-imperium-crimson-b underline border-b-2 border-dashed border-imperium-steel-dark',
  },
});

// Link extension for markdown/3d-world theme (blue links)
export const MarkdownLink = Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'text-blue-400 underline hover:text-blue-300 cursor-pointer',
  },
});

// Common extensions for TipTap editors
export const commonExtensions = {
  StarterKit,
  CodeBlockLowlight,
  Image,
  Placeholder,
  TextStyle,
  Color,
  TaskList,
  TaskItem,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  HorizontalRule,
  lowlight,
};

// Get base extensions for TipTap
export function getBaseExtensions(placeholder = 'Start writing...') {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4],
      },
    }),
    TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: 'task-list',
      },
    }),
    TaskItem.configure({
      HTMLAttributes: {
        class: 'task-item',
      },
    }),
    Table.configure({
      HTMLAttributes: {
        class: 'border-collapse table-auto w-full',
      },
    }),
    TableRow.configure({
      HTMLAttributes: {
        class: 'border-b border-zinc-700',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-zinc-700 px-3 py-2 text-left bg-zinc-800 font-medium',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-zinc-700 px-3 py-2',
      },
    }),
    HorizontalRule.configure({
      HTMLAttributes: {
        class: 'border-t border-zinc-700 my-4',
      },
    }),
  ];
}
