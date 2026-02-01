'use client';

import { useState } from 'react';
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
import { formatFileSize, formatDate } from '@/shared/utils/format';

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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden rounded-none border-2 border-imperium-crimson bg-imperium-black shadow-[8px_8px_0_rgba(154,17,21,0.3)]">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wider text-imperium-crimson">
            [ Media Library ]
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(80vh-140px)]">
          <div className="flex items-center gap-2 pb-4 border-b-2 border-imperium-steel-dark">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-imperium-steel-dark" />
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
                variant="primary"
                onClick={() => handleSelect(selectedItem)}
              >
                Select Image
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="font-terminal text-imperium-steel">{'>'} Loading media...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-imperium-steel-dark">
                <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                <p className="font-terminal">No images found</p>
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearch('')}
                    className="mt-2 font-terminal uppercase text-xs"
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
                      'relative group aspect-square rounded-none overflow-hidden border-2 cursor-pointer transition-all',
                      selectedItem?.id === item.id
                        ? 'border-imperium-crimson shadow-[0_0_10px_rgba(154,17,21,0.4)]'
                        : 'border-imperium-steel-dark hover:border-imperium-steel'
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
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem(item);
                            }}
                            className="rounded-none"
                          >
                            <ImageIcon className="h-3 w-3" />
                          </Button>
                          {onDelete && (
                            <Button
                              size="icon"
                              variant="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteItem(item);
                              }}
                              className="rounded-none"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="absolute top-2 right-2 bg-imperium-crimson rounded-none p-1 border-2 border-imperium-bone">
                        <div className="w-2 h-2 bg-imperium-bone" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedItem && (
            <div className="border-t-2 border-imperium-steel-dark p-4 bg-imperium-black">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-none overflow-hidden border-2 border-imperium-steel-dark flex-shrink-0">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.alt || selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm uppercase tracking-wider text-imperium-bone truncate">
                    {selectedItem.name}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-terminal text-xs text-imperium-steel">
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
                    <p className="font-terminal text-xs text-imperium-steel-dark mt-1 line-clamp-1">
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
        <AlertDialogContent className="rounded-none border-2 border-imperium-crimson">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-wider text-imperium-crimson">
              Delete image?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-terminal text-imperium-steel">
              Are you sure you want to delete "{deleteItem?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none font-terminal uppercase text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-none font-terminal uppercase text-xs">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent className="max-w-3xl rounded-none border-2 border-imperium-crimson">
          <DialogHeader>
            <DialogTitle className="font-terminal text-imperium-bone">{previewItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-imperium-black-deep rounded-none p-4 border-2 border-imperium-steel-dark">
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
