'use client';

import { sanitizeHtml } from '@/lib/sanitize';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isTerminal?: boolean;
}

export function MarkdownRenderer({ content, className = '', isTerminal = true }: MarkdownRendererProps) {
  const renderedContent = (() => {
    let html = content;

    html = html
      .replace(/^### (.*$)/gim, '<h3 class="font-display uppercase text-imperium-gold text-lg mt-6 mb-3 tracking-wider">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="font-display uppercase text-imperium-crimson text-xl mt-8 mb-4 tracking-wider">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="font-display uppercase text-imperium-bone text-2xl mt-6 mb-4 tracking-[0.2em]">$1</h1>')

      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-display uppercase text-imperium-bone">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-imperium-steel">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-imperium-crimson/10 text-imperium-crimson border border-imperium-crimson/30 px-1.5 py-0.5 rounded-none text-sm font-mono">$1</code>')

      .replace(/^\- (.*$)/gim, '<li class="ml-6 text-imperium-steel my-1 list-disc font-terminal">> $1</li>')
      .replace(/^\* (.*$)/gim, '<li class="ml-6 text-imperium-steel my-1 list-disc font-terminal">> $1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 text-imperium-steel my-1 list-decimal font-terminal">> $2</li>')

      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-imperium-crimson hover:text-imperium-gold border-b-2 border-imperium-steel-dark border-dashed pb-0.5 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')

      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-imperium-gold pl-4 italic text-imperium-steel my-4 font-terminal">> $1</blockquote>')

      .replace(/---/g, '<hr class="border-imperium-steel-dark my-6 border-t-2 border-dashed" />')

      .replace(/\n\n/g, '</p><p class="text-imperium-steel my-4 leading-relaxed font-terminal">')
      .replace(/^(?!<[hlp])/gm, '<p class="text-imperium-steel my-4 leading-relaxed font-terminal">')
      .replace(/<p><p/g, '<p>')
      .replace(/<\/p><\/p>/g, '</p>')
      .replace(/<p>(<[hlu])/g, '$1')
      .replace(/(<\/[hlu]>)<\/p>/g, '$1');

    // Sanitize HTML to prevent XSS attacks
    return sanitizeHtml(html);
  })();

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

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <pre className="bg-imperium-black border-2 border-imperium-crimson/30 rounded-none p-4 overflow-x-auto my-4 font-terminal text-imperium-gold">
      <code className="text-sm">{code}</code>
    </pre>
  );
}

interface TerminalLineProps {
  children: React.ReactNode;
  type?: 'command' | 'output' | 'error' | 'success';
}

export function TerminalLine({ children, type = 'output' }: TerminalLineProps) {
  const colors = {
    command: 'text-imperium-gold font-bold',
    output: 'text-imperium-steel',
    error: 'text-imperium-crimson',
    success: 'text-imperium-gold',
  };

  return (
    <div className={`py-0.5 ${colors[type]}`}>
      {type === 'command' && <span className="mr-2">{'>'}</span>}
      {children}
    </div>
  );
}
