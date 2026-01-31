'use client'

import { HelpModal, InteractionPrompt, AdminButton } from './ui'
import { useModalStore } from '@/store/modal-store'
import {
  BlogListingModal,
  ProjectListingModal,
  AboutListingModal,
  AdminListingModal,
} from './readers'

export function FloatingUI() {
  const { isOpen, type } = useModalStore()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-imperium-crimson focus:text-imperium-bone focus:p-4 focus:rounded-none focus:font-semibold focus:border-2 focus:border-imperium-crimson-bright"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('scene-container')?.focus()
        }}
      >
        Skip to main content
      </a>

      {/* GitHub Link - Brutal Style */}
      <button
        onClick={() => window.open('https://github.com/oalacea', '_blank')}
        className="fixed top-4 right-4 z-30 h-10 w-10 bg-imperium-iron text-imperium-bone border-2 border-imperium-steel-dark hover:bg-imperium-steel hover:border-imperium-crimson backdrop-blur-sm transition-colors flex items-center justify-center text-sm font-bold font-display uppercase"
        aria-label="GitHub repository"
      >
        GH
      </button>

      <HelpModal />
      <AdminButton />
      <InteractionPrompt />

      {isOpen && type === 'blog-listing' && <BlogListingModal />}
      {isOpen && type === 'project-listing' && <ProjectListingModal />}
      {isOpen && type === 'about-listing' && <AboutListingModal />}
      {isOpen && type === 'admin-listing' && <AdminListingModal />}
    </>
  )
}
