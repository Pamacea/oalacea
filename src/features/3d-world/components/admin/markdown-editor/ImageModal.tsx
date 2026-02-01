'use client';

import { useState } from 'react';
import { X, ImageIcon } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
  initialUrl?: string;
}

export function ImageModal({ isOpen, onClose, onInsert, initialUrl = '' }: ImageModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [alt, setAlt] = useState('');

  if (!isOpen) return null;

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim());
      setUrl('');
      setAlt('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-sm border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h3 className="text-lg font-medium text-zinc-100">Insert Image</h3>
          <button
            onClick={onClose}
            className="rounded-sm p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Image URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            />
            <p className="mt-1 text-xs text-zinc-500">
              Enter a URL for an image (https:// or http://)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Alt Text (optional)
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="A brief description of the image"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          {/* Preview */}
          {url && (
            <div className="rounded-sm border border-zinc-700 bg-zinc-900 p-3">
              <p className="text-xs text-zinc-500 mb-2">Preview:</p>
              <img
                src={url}
                alt={alt || 'Preview'}
                className="max-w-full max-h-48 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="12"%3EFailed to load%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-zinc-800 px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!url.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
}
