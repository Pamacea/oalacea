'use client';

import { AboutListingModal, AdminListingModal, BlogListingModal, ProjectListingModal } from './readers';
import { HelpModal } from './HelpModal';
import { InteractionPrompt } from './InteractionPrompt';
import { useModalStore } from '@/store/modal-store';

export function FloatingUI() {
  const { isOpen, type } = useModalStore();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-amber-500 focus:text-white focus:p-4 focus:rounded-md focus:font-semibold"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('scene-container')?.focus();
        }}
      >
        Skip to main content
      </a>

      <button
        onClick={() => window.open('https://github.com/oalacea', '_blank')}
        className="fixed top-4 right-4 z-30 h-8 w-8 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800 backdrop-blur-sm transition-colors flex items-center justify-center text-sm font-bold"
        aria-label="GitHub repository"
      >
        GH
      </button>

      <HelpModal />
      <InteractionPrompt />

      {isOpen && type === 'blog-listing' && <BlogListingModal />}
      {isOpen && type === 'project-listing' && <ProjectListingModal />}
      {isOpen && type === 'about-listing' && <AboutListingModal />}
      {isOpen && type === 'admin-listing' && <AdminListingModal />}
    </>
  );
}
