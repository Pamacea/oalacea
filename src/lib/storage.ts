export interface UploadResult {
  url: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: Date;
  alt?: string;
}

export type ImageMetadata = Pick<MediaItem, 'width' | 'height' | 'size'>;

export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const generateFileName = (file: File): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  const baseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  return `${baseName}-${timestamp}-${randomString}.${extension}`;
};

export const validateImageFile = (
  file: File,
  maxSize: number = 5 * 1024 * 1024,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
};

export const uploadToVercelBlob = async (
  file: File
): Promise<UploadResult> => {
  try {
    const fileName = generateFileName(file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-upload-name': fileName,
      },
      body: file,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Upload failed');
    }

    const result = await response.json();

    const dimensions = await getImageDimensions(file);

    return {
      url: result.url,
      name: fileName,
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const createPlaceholderImage = (
  width: number = 800,
  height: number = 600,
  backgroundColor: string = '#1a1a1a',
  textColor: string = '#666666'
): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" dy=".3em">
        ${width} x ${height}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const getCachedImages = (): MediaItem[] => {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem('media-library');
  return cached ? JSON.parse(cached) : [];
};

export const setCachedImages = (items: MediaItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('media-library', JSON.stringify(items));
};

export const addCachedImage = (item: MediaItem): void => {
  const images = getCachedImages();
  images.unshift(item);
  setCachedImages(images.slice(0, 100));
};

export const removeCachedImage = (id: string): void => {
  const images = getCachedImages().filter((img) => img.id !== id);
  setCachedImages(images);
};
