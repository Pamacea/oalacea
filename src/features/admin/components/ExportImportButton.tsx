'use client';

import { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { importBlogs } from '@/actions/blog/export-import';
import { importProjects } from '@/actions/projects-export-import';
import { MAX_IMPORT_SIZE as BLOG_MAX_SIZE } from '@/actions/blog/export-import.config';
import { MAX_IMPORT_SIZE as PROJECT_MAX_SIZE } from '@/actions/projects-export-import.config';
import { useQueryClient } from '@tanstack/react-query';
import { useUISound } from '@/hooks/use-ui-sound';
import { ConfirmDialog } from '@/features/3d-world/components/admin/ConfirmDialog';
import { portfolioKeys, blogKeys } from '@/shared/lib/query-keys';

type ExportImportButtonProps = {
  type: 'blog' | 'project';
  exportAction: () => Promise<unknown>;
  exportFileName: string;
};

type ImportResult = { imported: number; skipped: number; errors: string[] };

export function ExportImportButton({
  type,
  exportAction,
  exportFileName,
}: ExportImportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importDialog, setImportDialog] = useState<{ open: boolean; result: ImportResult | null }>({
    open: false,
    result: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { playHover, playClick } = useUISound();

  const maxSize = type === 'blog' ? BLOG_MAX_SIZE : PROJECT_MAX_SIZE;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportAction();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFileName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error && error.message.includes('AuthorizationError')
        ? 'You do not have permission to export'
        : `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    playClick();
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      // Show confirm dialog with import options
      const shouldSkipExisting = confirm(
        `Skip existing ${type}s?\n\nOK = Skip existing\nCancel = Overwrite existing`
      );

      let result: ImportResult;
      if (type === 'blog') {
        result = await importBlogs(rawData, {
          skipExisting: shouldSkipExisting,
          overwrite: !shouldSkipExisting,
        });
      } else {
        result = await importProjects(rawData, {
          skipExisting: shouldSkipExisting,
          overwrite: !shouldSkipExisting,
        });
      }

      // Show result dialog
      setImportDialog({ open: true, result });

      // Refresh queries - use proper query keys
      if (type === 'blog') {
        queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      } else {
        queryClient.invalidateQueries({ queryKey: portfolioKeys.projects() });
      }
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error && error.message.includes('AuthorizationError')
        ? 'You do not have permission to import'
        : `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      alert(errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onMouseEnter={playHover}
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3 py-2 font-terminal text-sm font-medium text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black-deep hover:border-imperium-gold hover:text-imperium-gold hover:shadow-[4px_4px_0_rgba(212,175,55,0.2)] transition-all disabled:opacity-50"
          title={`Export all ${type}s to JSON`}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">EXPORT</span>
        </button>
        <button
          onMouseEnter={playHover}
          onClick={handleImportClick}
          disabled={isImporting}
          className="inline-flex items-center gap-2 px-3 py-2 font-terminal text-sm font-medium text-imperium-steel border-2 border-imperium-steel-dark bg-imperium-black-deep hover:border-imperium-teal hover:text-imperium-teal hover:shadow-[4px_4px_0_rgba(45,212,191,0.2)] transition-all disabled:opacity-50"
          title={`Import ${type}s from JSON`}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">IMPORT</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      <ConfirmDialog
        open={importDialog.open}
        onOpenChange={(open) => setImportDialog({ ...importDialog, open, result: null })}
        title="IMPORT COMPLETE"
        description={
          importDialog.result
            ? `Imported: ${importDialog.result.imported} | Skipped: ${importDialog.result.skipped}${
                importDialog.result.errors.length > 0
                  ? ` | Errors: ${importDialog.result.errors.length}`
                  : ''
              }`
            : ''
        }
        confirmLabel="CLOSE"
        cancelLabel={undefined}
        variant="success"
        onConfirm={() => setImportDialog({ open: false, result: null })}
        isLoading={false}
        isSuccess={true}
      />
    </>
  );
}
