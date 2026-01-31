'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, FileText, FolderKanban } from 'lucide-react';
import { useInWorldAdminStore } from '@/features/admin/store';
import { useModalStore } from '@/store/modal-store';
import { useWorldStore } from '@/features/3d-world/store';
import { DashboardTab } from './DashboardTab';
import { PostsTab } from './PostsTab';
import { ProjectsTab } from './ProjectsTab';
import { BlogPostForm } from './BlogPostForm';
import { ProjectForm } from './ProjectForm';
import { BlogPostReader } from './BlogPostReader';

const tabs = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'posts' as const, label: 'Blog', icon: FileText },
  { id: 'projects' as const, label: 'Projects', icon: FolderKanban },
];

export function InWorldAdminModal() {
  const { isOpen, view, selectedId, closeAdmin, setView } = useInWorldAdminStore();
  const { close: closeModalStore } = useModalStore();
  const world = useWorldStore((s) => s.currentWorld);
  const isEditingForm = view === 'edit-post' || view === 'edit-project';
  const isReadingPost = view === 'read-post';

  const handleClose = () => {
    closeAdmin();
    closeModalStore();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[51] w-[85vw] max-w-5xl h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 shrink-0">
              {!isEditingForm && !isReadingPost ? (
                <div className="flex gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = view === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-zinc-800 text-zinc-100'
                            : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span className="text-sm font-medium text-zinc-300">
                  {view === 'edit-post' && 'Modifier l\'article'}
                  {view === 'edit-project' && 'Modifier le projet'}
                  {view === 'read-post' && 'Lire l\'article'}
                </span>
              )}
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {view === 'dashboard' && <DashboardTab />}
              {view === 'posts' && <PostsTab />}
              {view === 'projects' && <ProjectsTab />}
              {view === 'edit-post' && <BlogPostForm postId={selectedId ?? undefined} world={world} />}
              {view === 'edit-project' && <ProjectForm projectId={selectedId ?? undefined} world={world} />}
              {view === 'read-post' && selectedId && <BlogPostReader postSlug={selectedId} />}
            </div>

            {!isEditingForm && !isReadingPost && (
              <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 bg-zinc-900/30 shrink-0">
                <p className="text-xs text-zinc-600">
                  Admin Panel
                </p>
                <p className="text-xs text-zinc-600">ESC pour fermer</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
