import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Only allows safe HTML tags and attributes.
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
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
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title', 'alt',
      'src', 'width', 'height', 'class',
      'id', 'name',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize HTML for inline content (like in modals).
 * More restrictive - only inline elements allowed.
 */
export function sanitizeInlineHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'code', 'a', 'span', 'br',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}
