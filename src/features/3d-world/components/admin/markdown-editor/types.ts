export interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  readonly?: boolean;
}

export interface ToolbarButton {
  name: string;
  label: string;
  icon: string;
  action: () => void;
  isActive?: () => boolean;
  canShow?: () => boolean;
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface LinkOption {
  type: 'external' | 'blog' | 'project';
  url?: string;
  title?: string;
  id?: string;
}

export const COLOR_PALETTE = [
  { name: 'Default', value: '#f4f4f5' },  // zinc-100
  { name: 'Red', value: '#f87171' },      // red-400
  { name: 'Orange', value: '#fb923c' },   // orange-400
  { name: 'Yellow', value: '#facc15' },   // yellow-400
  { name: 'Green', value: '#4ade80' },    // green-400
  { name: 'Blue', value: '#60a5fa' },     // blue-400
  { name: 'Purple', value: '#a78bfa' },   // purple-400
  { name: 'Pink', value: '#f472b6' },     // pink-400
  { name: 'Gray', value: '#a1a1aa' },     // zinc-400
] as const;

export type ColorPaletteValue = typeof COLOR_PALETTE[number]['value'];
