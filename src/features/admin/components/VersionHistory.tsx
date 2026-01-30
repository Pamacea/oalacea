'use client';

import { useState } from 'react';
import {
  History,
  RotateCcw,
  FileText,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Diff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime } from '@/lib/formatters';

interface PostVersion {
  id: string;
  version: number;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  changeNote: string | null;
  createdAt: Date;
  createdBy: string | null;
}

interface VersionHistoryProps {
  postId: string;
  versions: PostVersion[];
  onRestore: (version: PostVersion) => Promise<void>;
  currentVersion?: number;
}

const getVersionDiff = (oldVersion: PostVersion, newVersion: PostVersion) => {
  const changes: string[] = [];

  if (oldVersion.title !== newVersion.title) {
    changes.push(`Title: "${oldVersion.title}" &rarr; "${newVersion.title}"`);
  }

  if (oldVersion.excerpt !== newVersion.excerpt) {
    changes.push('Excerpt updated');
  }

  if (oldVersion.content !== newVersion.content) {
    const oldLength = oldVersion.content.length;
    const newLength = newVersion.content.length;
    const diff = newLength - oldLength;
    const sign = diff > 0 ? '+' : '';
    changes.push(`Content: ${sign}${diff} characters`);
  }

  if (oldVersion.coverImage !== newVersion.coverImage) {
    changes.push('Cover image changed');
  }

  if (JSON.stringify(oldVersion.tags) !== JSON.stringify(newVersion.tags)) {
    changes.push('Tags updated');
  }

  return changes;
};

const renderContentDiff = (oldContent: string, newContent: string) => {
  const oldWords = oldContent.split(/\s+/);
  const newWords = newContent.split(/\s+/);
  const maxWords = 50;

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-xs font-semibold text-zinc-400 mb-2">Previous</p>
        <div className="bg-red-950/30 border border-red-900/50 rounded p-3 max-h-64 overflow-y-auto">
          {oldWords.slice(0, maxWords).join(' ')}
          {oldWords.length > maxWords && '...'}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-400 mb-2">Current</p>
        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded p-3 max-h-64 overflow-y-auto">
          {newWords.slice(0, maxWords).join(' ')}
          {newWords.length > maxWords && '...'}
        </div>
      </div>
    </div>
  );
};

export function VersionHistory({
  postId,
  versions,
  onRestore,
  currentVersion,
}: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<[PostVersion, PostVersion] | null>(null);
  const [restoreVersion, setRestoreVersion] = useState<PostVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
  const hasVersions = sortedVersions.length > 0;

  const handleRestore = async () => {
    if (!restoreVersion) return;

    setIsRestoring(true);
    try {
      await onRestore(restoreVersion);
      setOpen(false);
      setRestoreVersion(null);
    } finally {
      setIsRestoring(false);
    }
  };

  const toggleExpand = (version: number) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const showDiff = (version1: PostVersion, version2: PostVersion) => {
    setSelectedVersions([version1, version2]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Version History
            {hasVersions && (
              <span className="bg-zinc-800 text-zinc-300 text-xs px-1.5 rounded-full">
                {sortedVersions.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(80vh-140px)] pr-4">
            {!hasVersions ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <History className="h-12 w-12 mb-3 opacity-50" />
                <p>No version history yet</p>
                <p className="text-xs mt-1">
                  Versions are created automatically when you update a post
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedVersions.map((version, index) => {
                  const prevVersion = sortedVersions[index + 1];
                  const changes = prevVersion
                    ? getVersionDiff(prevVersion, version)
                    : ['Initial version'];
                  const isExpanded = expandedVersions.has(version.version);

                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'rounded-lg border transition-all',
                        version.version === currentVersion
                          ? 'border-zinc-500/50 bg-zinc-500/5'
                          : 'border-zinc-800 bg-zinc-900/30'
                      )}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              'flex items-center justify-center w-10 h-10 rounded-full',
                              version.version === currentVersion
                                ? 'bg-zinc-500/20 text-zinc-400'
                                : 'bg-zinc-800 text-zinc-400'
                            )}
                          >
                            <span className="text-sm font-semibold">
                              v{version.version}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-zinc-100">
                                {version.title}
                                {version.version === currentVersion && (
                                  <span className="ml-2 text-xs bg-zinc-500/20 text-zinc-400 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatRelativeTime(new Date(version.createdAt))}
                                </span>
                                {version.createdBy && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {version.createdBy}
                                  </span>
                                )}
                              </div>
                              {version.changeNote && (
                                <p className="text-sm text-zinc-400 mt-2">
                                  {version.changeNote}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => toggleExpand(version.version)}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </Button>
                              {version.version !== currentVersion && (
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => setRestoreVersion(version)}
                                  className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-500/10"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-zinc-400 mb-2">
                                  Changes
                                </p>
                                <ul className="space-y-1">
                                  {changes.map((change, i) => (
                                    <li
                                      key={i}
                                      className="text-xs text-zinc-500 flex items-start gap-2"
                                    >
                                      <span className="text-zinc-500">•</span>
                                      <span dangerouslySetInnerHTML={{ __html: change }} />
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {prevVersion && (
                                <div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => showDiff(prevVersion, version)}
                                    className="w-full gap-2"
                                  >
                                    <Diff className="h-3 w-3" />
                                    Show Content Diff
                                  </Button>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-zinc-500">Tags:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {version.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Content:</span>
                                  <p className="text-zinc-400 mt-1">
                                    {version.content.length} characters
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!restoreVersion}
        onOpenChange={(open) => !open && setRestoreVersion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore version?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore version {restoreVersion?.version} of
              &quot;{restoreVersion?.title}&quot;? This will replace the current
              content with the selected version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? 'Restoring...' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!selectedVersions}
        onOpenChange={(open) => !open && setSelectedVersions(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Version Comparison: v{selectedVersions?.[0]?.version} &rarr; v
              {selectedVersions?.[1]?.version}
            </DialogTitle>
          </DialogHeader>
          {selectedVersions && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-zinc-100">
                    {selectedVersions[0].title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(selectedVersions[0].createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-100">
                    {selectedVersions[1].title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(selectedVersions[1].createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {renderContentDiff(
                selectedVersions[0].content,
                selectedVersions[1].content
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
