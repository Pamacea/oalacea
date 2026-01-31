import StarterKit from '@tiptap/starter-kit';
import { Extension } from '@tiptap/core';
import { common, createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';

const lowlight = createLowlight(common);

export const getTiptapExtensions = (placeholder = 'Start writing...') => [
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
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-400 underline hover:text-blue-300 cursor-pointer',
    },
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
  Placeholder.configure({
    placeholder,
    emptyEditorClass: 'is-editor-empty',
  }),
  Extension.create({
    name: 'customCommands',
    addCommands() {
      return {
        setHorizontalRule: () => ({ commands }) => {
          return commands.setHorizontalRule();
        },
      };
    },
  }),
];
