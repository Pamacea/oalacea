'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, FileText, FolderKanban, Folder, Shield, Skull } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useInWorldAdminStore } from '@/features/admin/store';
import { useModalStore } from '@/store/modal-store';
import { GlitchText, ChaoticOverlay, ScanlineBeam } from '@/components/ui/imperium';
import { useUISound } from '@/hooks/use-ui-sound';
import { DashboardTab } from './DashboardTab';
import { PostsTab } from './PostsTab';
import { ProjectsTab } from './ProjectsTab';
import { CategoriesTab } from './CategoriesTab';
import { BlogPostForm } from './BlogPostForm';
import { ProjectForm } from './ProjectForm';
import { BlogPostReader } from './BlogPostReader';

const tabs = [
  { id: 'dashboard' as const, label: 'Command', icon: LayoutDashboard },
  { id: 'posts' as const, label: 'Archives', icon: FileText },
  { id: 'projects' as const, label: 'Forge', icon: FolderKanban },
  { id: 'categories' as const, label: 'Index', icon: Folder },
];

export function InWorldAdminModal() {
  const { isOpen, view, selectedId, closeAdmin, setView } = useInWorldAdminStore();
  const { close: closeModalStore } = useModalStore();
  const { playHover, playClick, playOpen, playClose } = useUISound();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin === true;

  const isEditingForm = view === 'edit-post' || view === 'edit-project';
  const isCreatingForm = view === 'create-post' || view === 'create-project';
  const isReadingPost = view === 'read-post';
  const isFormView = isEditingForm || isCreatingForm || isReadingPost;

  const handleClose = () => {
    playClose();
    closeAdmin();
    closeModalStore();
  };

  useEffect(() => {
    if (isOpen) {
      playOpen();
    }
  }, [isOpen, playOpen]);

  if (!isAdmin && isOpen) {
    closeAdmin();
    closeModalStore();
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-imperium-black-deep/90 backdrop-blur-sm"
            onClick={handleClose}
          >
            <ChaoticOverlay type="all" opacity={0.3} />
            <ScanlineBeam color="#9a1115" duration={2.5} />
          </motion.div>

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotateX: 10, y: 30 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotateX: -10, y: 30 }}
            transition={{ type: 'spring', damping: 18, stiffness: 180 }}
            className="fixed left-1/2 top-1/2 z-[10000] w-[90vw] max-w-6xl h-[88vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden border-2 border-imperium-crimson bg-imperium-black-raise shadow-[0_0_80px_rgba(154,17,21,0.5),_10px_10px_0_rgba(154,17,21,0.3)] rounded-none flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative skull */}
            <div className="absolute top-4 right-16 opacity-5 pointer-events-none">
              <Skull className="w-16 h-16 text-imperium-crimson" />
            </div>

            {/* Header with brutalist style */}
            <div className="relative border-b-2 border-imperium-crimson bg-imperium-black-deep/80 px-4 py-4 shrink-0">
              {/* Scanlines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(154,17,21,0.3)_1px,rgba(154,17,21,0.3)_2px)]" />
              </div>

              {/* Top accent line */}
              <div className="absolute left-0 top-0 right-0 h-1 bg-imperium-crimson">
                <motion.div
                  className="h-full bg-imperium-gold"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '25%' }}
                />
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-imperium-crimson" />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-imperium-crimson" />

              <div className="relative flex items-center justify-between">
                {/* Left side - Tabs or title */}
                {!isFormView ? (
                  <div className="flex gap-1">
                    {tabs.map((tab, index) => {
                      const Icon = tab.icon;
                      const isActive = view === tab.id;
                      return (
                        <motion.button
                          key={tab.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onMouseEnter={playHover}
                          onClick={() => {
                            setView(tab.id);
                            playClick();
                          }}
                          className={`relative flex items-center gap-2 px-4 py-2.5 font-display text-sm uppercase tracking-wider transition-all border-2 ${
                            isActive
                              ? 'bg-imperium-crimson/20 border-imperium-crimson text-imperium-bone'
                              : 'border-transparent text-imperium-steel hover:text-imperium-crimson hover:border-imperium-steel-dark'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-imperium-crimson/10"
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="border-2 border-imperium-gold bg-imperium-gold/10 p-2">
                      <Shield className="h-5 w-5 text-imperium-gold" />
                    </div>
                    <span className="font-display text-sm uppercase tracking-wider text-imperium-bone">
                      <GlitchText intensity="medium">
                        {view === 'edit-post' ? 'MODIFY ARCHIVE' :
                         view === 'create-post' ? 'NEW ARCHIVE ENTRY' :
                         view === 'edit-project' ? 'MODIFY BLUEPRINT' :
                         view === 'create-project' ? 'NEW BLUEPRINT' :
                         view === 'read-post' ? 'DATA TERMINAL' :
                         'ADMIN PANEL'}
                      </GlitchText>
                    </span>
                  </div>
                )}

                {/* Close button */}
                <motion.button
                  onClick={handleClose}
                  onMouseEnter={playHover}
                  className="group relative p-2 text-imperium-steel hover:text-imperium-crimson transition-colors"
                  aria-label="Fermer"
                >
                  <motion.div
                    className="absolute inset-0 bg-imperium-crimson/10"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  />
                  <X className="h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-200" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="relative overflow-y-auto flex-1">
              {/* Noise overlay */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              <div className="p-6 relative z-10">
                {view === 'dashboard' && <DashboardTab />}
                {view === 'posts' && <PostsTab />}
                {view === 'projects' && <ProjectsTab />}
                {view === 'categories' && <CategoriesTab />}
                {view === 'edit-post' && <BlogPostForm postId={selectedId ?? undefined} />}
                {view === 'create-post' && <BlogPostForm />}
                {view === 'edit-project' && <ProjectForm projectId={selectedId ?? undefined} />}
                {view === 'create-project' && <ProjectForm />}
                {view === 'read-post' && selectedId && <BlogPostReader postSlug={selectedId} />}
              </div>
            </div>

            {/* Footer */}
            {!isFormView && (
              <div className="flex items-center justify-between border-t-2 border-imperium-steel-dark bg-imperium-black-deep/50 px-6 py-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Skull className="h-4 w-4 text-imperium-crimson opacity-50" />
                  <p className="font-terminal text-xs text-imperium-steel-dark">
                    IMPERIUM ADMINISTRATION CONSOLE
                  </p>
                </div>
                <p className="font-terminal text-xs text-imperium-steel-dark">[ESC] TERMINATE</p>
              </div>
            )}

            {/* Bottom scanline */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 z-20">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-imperium-crimson to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ width: '40%' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
