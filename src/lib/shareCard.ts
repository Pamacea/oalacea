import { IMPERIUM, UNDERGROUND } from '@/config/theme/imperium';

export interface ShareCardOptions {
  type: 'blog' | 'project' | 'profile';
  title: string;
  description?: string;
  imageUrl?: string;
  theme?: 'imperium' | 'underground';
  author?: string;
  date?: string;
}

const colors = {
  imperium: IMPERIUM,
  underground: UNDERGROUND,
};

function hexToNumber(hex: number): number {
  return hex;
}

function hexToString(hex: number): string {
  return hex.toString(16).padStart(6, '0');
}

export async function generateShareCardSVG(options: ShareCardOptions): Promise<string> {
  const theme = options.theme || 'imperium';
  const palette = colors[theme];

  const backgroundColor = hexToNumber((palette as typeof IMPERIUM).background.hex);
  const primaryColor = hexToNumber(
    theme === 'imperium'
      ? (palette as typeof IMPERIUM).gold.hex
      : (palette as typeof UNDERGROUND).teal.hex
  );
  const secondaryColor = hexToNumber(
    theme === 'imperium'
      ? (palette as typeof IMPERIUM).crimson.hex
      : (palette as typeof UNDERGROUND).pink.hex
  );

  const width = 1200;
  const height = 630;

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#${hexToString(backgroundColor)}" />
      <stop offset="100%" stop-color="#${hexToString(Math.min(0xffffff, backgroundColor * 1.2))}" />
    </linearGradient>
    <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#${hexToString(primaryColor)}" />
      <stop offset="100%" stop-color="#${hexToString(secondaryColor)}" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg-gradient)" />

  <rect x="0" y="${height - 8}" width="${width}" height="8" fill="url(#accent-gradient)" />

  ${options.imageUrl ? `
  <foreignObject x="${width - 320}" y="40" width="280" height="280">
    <img xmlns="http://www.w3.org/1999/xhtml" src="${options.imageUrl}" style="width: 280px; height: 280px; object-fit: cover; border-radius: 8px;" />
  </foreignObject>
  ` : ''}

  <text x="60" y="${options.imageUrl ? 120 : 100}" font-family="system-ui, -apple-system, sans-serif" font-size="${options.type === 'profile' ? 48 : 56}" font-weight="bold" fill="#ffffff">
    ${escapeXml(truncateText(options.title, options.imageUrl ? 25 : 30))}
  </text>

  ${options.type !== 'profile' ? `
  <rect x="60" y="${options.imageUrl ? 145 : 120}" width="60" height="4" fill="url(#accent-gradient)" filter="url(#glow)" />
  ` : ''}

  ${options.description ? `
  <text x="60" y="${options.imageUrl ? 200 : 180}" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#94a3b8" max-width="${options.imageUrl ? 700 : 1080}">
    ${escapeXml(truncateText(options.description, options.imageUrl ? 80 : 120))}
  </text>
  ` : ''}

  ${options.author ? `
  <text x="60" y="${height - 80}" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#64748b">
    By ${escapeXml(options.author)}
  </text>
  ` : ''}

  ${options.date ? `
  <text x="60" y="${height - 50}" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#475569">
    ${escapeXml(options.date)}
  </text>
  ` : ''}

  <text x="${width - 60}" y="${height - 50}" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#475569" text-anchor="end">
    oalacea.com
  </text>
</svg>
`.trim();

  return svg;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export async function svgToPng(svg: string): Promise<Buffer> {
  if (typeof window !== 'undefined') {
    throw new Error('svgToPng can only be used on the server side');
  }

  // @ts-ignore - canvas is an optional dependency
  const { createCanvas } = await import('canvas');
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  ctx.drawImage(img, 0, 0);

  return canvas.toBuffer('image/png');
}

export function getShareUrl(type: 'blog' | 'project', slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oalacea.com';
  return `${baseUrl}/${type === 'blog' ? 'blog' : 'projects'}/${slug}`;
}

export function getShareCardUrl(type: 'blog' | 'project' | 'profile', slug?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oalacea.com';
  if (type === 'profile') {
    return `${baseUrl}/api/share-card?type=profile`;
  }
  return `${baseUrl}/api/share-card?type=${type}&slug=${slug}`;
}
