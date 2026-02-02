'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);
  const [altText, setAltText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSize) {
      alert(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      return;
    }

    setIsUploading(true);

    try {
      if (onUpload) {
        const url = await onUpload(file);
        setPreview(url);
        onChange(url);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPreview(base64);
          onChange(base64);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setAltText('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label>Image</Label>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-7 text-imperium-crimson hover:text-imperium-crimson font-terminal uppercase text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {!preview ? (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-none border-2 transition-colors cursor-pointer',
            dragActive
              ? 'border-imperium-crimson bg-imperium-crimson/10'
              : 'border-imperium-steel-dark bg-imperium-black hover:border-imperium-steel'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-imperium-crimson" />
              <p className="font-terminal text-sm text-imperium-steel">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-8">
              <div className="rounded-none border-2 border-imperium-steel-dark bg-imperium-iron p-3">
                <ImageIcon className="h-6 w-6 text-imperium-steel" />
              </div>
              <div className="text-center">
                <p className="font-display text-sm uppercase tracking-wider text-imperium-bone">
                  Drop image here or click to upload
                </p>
                <p className="font-terminal text-xs text-imperium-steel-dark mt-1">
                  PNG, JPG, GIF up to {maxSize / 1024 / 1024}MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-none overflow-hidden bg-imperium-black border-2 border-imperium-steel-dark">
            <Image
              src={preview}
              alt="Preview"
              width={800}
              height={450}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <div>
            <Label htmlFor="alt-text" className="font-terminal text-xs text-imperium-steel-dark">
              Alt Text (required for accessibility)
            </Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for screen readers..."
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
