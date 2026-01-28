'use client';

import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isTerminal?: boolean;
}

export function MarkdownRenderer({ content, className = '', isTerminal = true }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    let html = content;

    html = html
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-green-400 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-green-300 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-green-200 mt-6 mb-4">$1</h1>')

      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

      .replace(/^\- (.*$)/gim, '<li class="ml-6 text-slate-300 my-1 list-disc">$1</li>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 text-slate-300 my-1 list-disc">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 text-slate-300 my-1 list-decimal">$2</li>')

      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-green-400 hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')

      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-green-500 pl-4 italic text-slate-400 my-4">$1</blockquote>')

      .replace(/---/g, '<hr class="border-green-500/30 my-6"')

      .replace(/\n\n/g, '</p><p class="text-slate-300 my-4 leading-relaxed">')
      .replace(/^(?!<[hlp])/gm, '<p class="text-slate-300 my-4 leading-relaxed">')
      .replace(/<p><p/g, '<p>')
      .replace(/<\/p><\/p>/g, '</p>')
      .replace(/<p>(<[hlu])/g, '$1')
      .replace(/(<\/[hlu]>)<\/p>/g, '$1');

    return html;
  }, [content]);

  const baseClasses = isTerminal
    ? 'font-mono text-sm'
    : 'prose prose-invert prose-sm max-w-none';

  return (
    <div
      className={`${baseClasses} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  return (
    <pre className="bg-slate-950 border border-green-500/30 rounded-lg p-4 overflow-x-auto my-4">
      <code className="text-green-300 text-sm font-mono">{code}</code>
    </pre>
  );
}

interface TerminalLineProps {
  children: React.ReactNode;
  type?: 'command' | 'output' | 'error' | 'success';
}

export function TerminalLine({ children, type = 'output' }: TerminalLineProps) {
  const colors = {
    command: 'text-green-400 font-bold',
    output: 'text-slate-300',
    error: 'text-red-400',
    success: 'text-green-300',
  };

  return (
    <div className={`py-0.5 ${colors[type]}`}>
      {type === 'command' && <span className="mr-2">$</span>}
      {children}
    </div>
  );
}
