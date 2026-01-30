'use client';

import { useState, useEffect } from 'react';
import { Search, X, Trash2, Image as ImageIcon, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: Date;
  alt?: string;
}

interface MediaLibraryProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
  trigger?: React.ReactNode;
  items?: MediaItem[];
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export function MediaLibrary({
  open,
  onOpenChange,
  onSelect,
  trigger,
  items = [],
  onDelete,
  isLoading = false,
}: MediaLibraryProps) {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.alt?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: MediaItem) => {
    onSelect(item);
    onOpenChange?.(false);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    if (deleteItem && onDelete) {
      await onDelete(deleteItem.id);
      setDeleteItem(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(80vh-140px)]">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search images..."
                className="pl-9"
              />
            </div>
            {selectedItem && (
              <Button
                size="sm"
                onClick={() => handleSelect(selectedItem)}
                className="bg-zinc-600 hover:bg-zinc-500"
              >
                Select Image
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-zinc-500">Loading media...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                <p>No images found</p>
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearch('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'relative group aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all',
                      selectedItem?.id === item.id
                        ? 'border-zinc-500 ring-2 ring-zinc-500/50'
                        : 'border-zinc-800 hover:border-zinc-700'
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <img
                      src={item.url}
                      alt={item.alt || item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button
                            size="icon-xs"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem(item);
                            }}
                          >
                            <ImageIcon className="h-3 w-3" />
                          </Button>
                          {onDelete && (
                            <Button
                              size="icon-xs"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteItem(item);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="absolute top-2 right-2 bg-zinc-600 rounded-full p-1">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedItem && (
            <div className="border-t border-zinc-800 p-4 bg-zinc-900/30">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded overflow-hidden border border-zinc-800 flex-shrink-0">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.alt || selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {selectedItem.name}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {formatFileSize(selectedItem.size)}
                    </span>
                    {selectedItem.width && selectedItem.height && (
                      <span>
                        {selectedItem.width} x {selectedItem.height}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(selectedItem.uploadedAt)}
                    </span>
                  </div>
                  {selectedItem.alt && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                      Alt: {selectedItem.alt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <AlertDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-zinc-950 rounded-lg p-4">
            <img
              src={previewItem?.url}
              alt={previewItem?.alt || previewItem?.name}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
