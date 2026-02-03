'use client';

import { useEffect, useState, useTransition } from 'react';
import { sanitizeRichContent } from '@/lib/sanitize';

interface TipTapContentProps {
  content: string;
}

export function TipTapContent({ content }: TipTapContentProps) {
  const [highlightedContent, setHighlightedContent] = useState(content);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Defer code highlighting to non-blocking transition
    startTransition(() => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      const preElements = tempDiv.querySelectorAll('pre');
      preElements.forEach((pre) => {
        const codeElement = pre.querySelector('code');
        if (!codeElement) return;

        const languageClass = Array.from(codeElement.classList).find(c => c.startsWith('language-'));
        const language = languageClass?.replace('language-', '') || 'plaintext';

        codeElement.className = `hljs language-${language}`;
      });

      setHighlightedContent(tempDiv.innerHTML);
      setIsLoaded(true);
    });
  }, [content]);

  // Show placeholder during initial load or transition
  if (!isLoaded || isPending) {
    return <div className="animate-pulse h-64 bg-imperium-black/50" />;
  }

  return (
    <div
      className="tiptap-content"
      dangerouslySetInnerHTML={{ __html: sanitizeRichContent(highlightedContent) }}
    />
  );
}
