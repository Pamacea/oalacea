/**
 * Simple HTML sanitizer for comments - strips all HTML tags for security.
 * Comments only need plain text, no HTML support.
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized plain text string
 */
export function sanitizeHtml(html: string): string {
  // Remove all HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  // Decode basic HTML entities
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}

// DOMPurify lazy-loaded for rich content features
let DOMPurify: {
  sanitize: (html: string, config: unknown) => string;
} | null = null;

function getDOMPurify() {
  if (!DOMPurify) {
    // Dynamic import that works with Turbopack
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const dompurifyModule = require('dompurify');
      DOMPurify = dompurifyModule.default || dompurifyModule;
    } catch {
      // Fallback if require fails, try ESM import
      // This shouldn't happen but provides a safety net
      return null;
    }
  }
  return DOMPurify;
}

/**
 * Sanitize HTML for inline content (like in modals).
 * Uses DOMPurify for proper HTML sanitization.
 */
export function sanitizeInlineHtml(html: string): string {
  const purify = getDOMPurify();
  if (!purify) {
    // Fallback to plain text if DOMPurify not available
    return sanitizeHtml(html);
  }
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'b', 'em', 'i', 'u', 's', 'strike', 'code', 'a', 'span', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize rich content from TipTap editor.
 * Uses DOMPurify for full HTML sanitization including code blocks.
 */
export function sanitizeRichContent(html: string): string {
  const purify = getDOMPurify();
  if (!purify) {
    // Fallback to plain text if DOMPurify not available
    return sanitizeHtml(html);
  }
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
      'code', 'pre', 'blockquote',
      'ul', 'ol', 'li',
      'a',
      'br', 'hr',
      'span', 'div',
      'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'sub', 'sup',
      // Code block syntax highlighting
      'style',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title', 'alt',
      'src', 'width', 'height', 'class',
      'id', 'name', 'style',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}
