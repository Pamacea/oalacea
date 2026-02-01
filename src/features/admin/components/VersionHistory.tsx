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
import { formatRelativeTime } from '@/shared/utils/format';

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
    changes.push(`Title: "${oldVersion.title}" → "${newVersion.title}"`);
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
    <div className="grid grid-cols-2 gap-4 font-terminal text-sm">
      <div>
        <p className="font-display uppercase text-imperium-crimson text-xs mb-2">{'>'} Previous</p>
        <div className="bg-imperium-crimson/10 border-2 border-imperium-crimson/30 rounded-none p-3 max-h-64 overflow-y-auto">
          {oldWords.slice(0, maxWords).join(' ')}
          {oldWords.length > maxWords && '...'}
        </div>
      </div>
      <div>
        <p className="font-display uppercase text-imperium-gold text-xs mb-2">{'>'} Current</p>
        <div className="bg-imperium-gold/10 border-2 border-imperium-gold/30 rounded-none p-3 max-h-64 overflow-y-auto">
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
          <Button variant="outline" size="sm" className="gap-2 font-terminal">
            <History className="h-4 w-4" />
            Version History
            {hasVersions && (
              <span className="bg-imperium-steel text-imperium-bone font-terminal text-xs px-1.5 rounded-none border-2 border-imperium-steel-dark">
                {sortedVersions.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden rounded-none border-2 border-imperium-steel-dark bg-imperium-black">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider text-imperium-crimson">
              [ Version History ]
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(80vh-140px)] pr-4">
            {!hasVersions ? (
              <div className="flex flex-col items-center justify-center py-12 text-imperium-steel-dark">
                <History className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-terminal">No version history yet</p>
                <p className="text-xs mt-1">
                  {'>'} Versions are created automatically when you update a post
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
                        'rounded-none border-2 transition-all',
                        version.version === currentVersion
                          ? 'border-imperium-gold bg-imperium-gold/10 shadow-[4px_4px_0_rgba(184,166,70,0.3)]'
                          : 'border-imperium-steel-dark bg-imperium-black'
                      )}
                    >
                      <div className="flex items-start gap-3 p-4">
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              'flex items-center justify-center w-10 h-10 rounded-none border-2 font-terminal text-sm font-bold',
                              version.version === currentVersion
                                ? 'border-imperium-gold bg-imperium-gold text-imperium-black'
                                : 'border-imperium-steel-dark bg-imperium-black text-imperium-steel'
                            )}
                          >
                            {`v${version.version}`}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display uppercase text-imperium-bone">
                                {version.title}
                                {version.version === currentVersion && (
                                  <span className="ml-2 bg-imperium-gold text-imperium-black font-terminal text-xs px-2 py-0.5 rounded-none border-2 border-imperium-gold-dark">
                                    Current
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-3 mt-1 font-terminal text-xs text-imperium-steel-dark">
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
                                <p className="text-imperium-steel mt-2">
                                  {version.changeNote}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
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
                                  size="icon"
                                  onClick={() => setRestoreVersion(version)}
                                  className="text-imperium-steel hover:text-imperium-crimson hover:bg-imperium-crimson/10"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 space-y-3">
                              <div>
                                <p className="font-display uppercase text-imperium-gold text-xs mb-2">
                                  {'>'} Changes
                                </p>
                                <ul className="space-y-1">
                                  {changes.map((change, i) => (
                                    <li
                                      key={i}
                                      className="font-terminal text-xs text-imperium-steel-dark flex items-start gap-2"
                                    >
                                      <span className="text-imperium-steel">{'>'}</span>
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
                                    className="w-full gap-2 font-terminal"
                                  >
                                    <Diff className="h-3 w-3" />
                                    Show Content Diff
                                  </Button>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 font-terminal text-xs">
                                <div>
                                  <span className="text-imperium-steel-dark">Tags:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {version.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="bg-imperium-iron text-imperium-steel px-1.5 py-0.5 rounded-none border border-imperium-iron-dark"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-imperium-steel-dark">Content:</span>
                                  <p className="text-imperium-steel mt-1">
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
        <AlertDialogContent className="rounded-none border-2 border-imperium-crimson bg-imperium-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase text-imperium-crimson">
              Restore version?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-terminal text-imperium-steel-dark">
              Are you sure you want to restore version {restoreVersion?.version} of
              &quot;{restoreVersion?.title}&quot;? This will replace the current
              content with the selected version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none font-terminal">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring} className="rounded-none font-display uppercase bg-imperium-crimson text-imperium-bone hover:bg-imperium-crimson-bright">
              {isRestoring ? 'Restoring...' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!selectedVersions}
        onOpenChange={(open) => !open && setSelectedVersions(null)}
      >
        <DialogContent className="max-w-4xl rounded-none border-2 border-imperium-steel-dark bg-imperium-black">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wider text-imperium-crimson">
              Version Comparison: v{selectedVersions?.[0]?.version} → v
              {selectedVersions?.[1]?.version}
            </DialogTitle>
          </DialogHeader>
          {selectedVersions && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-display uppercase text-imperium-bone">
                    {selectedVersions[0].title}
                  </p>
                  <p className="font-terminal text-xs text-imperium-steel-dark">
                    {new Date(selectedVersions[0].createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-display uppercase text-imperium-bone">
                    {selectedVersions[1].title}
                  </p>
                  <p className="font-terminal text-xs text-imperium-steel-dark">
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
