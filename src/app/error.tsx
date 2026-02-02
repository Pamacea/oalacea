'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-imperium-black-deep p-4">
      <div className="max-w-md w-full border-2 border-imperium-crimson bg-imperium-black-raise px-8 py-6">
        <div className="flex items-center justify-center gap-2 text-imperium-crimson mb-4">
          <AlertCircle className="h-6 w-6" />
          <h1 className="font-display text-2xl uppercase tracking-widest text-imperium-crimson">
            Critical Error
          </h1>
        </div>
        <p className="font-terminal text-imperium-steel-dark mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 border border-imperium-crimson bg-imperium-crimson/20 text-imperium-crimson font-terminal text-sm uppercase hover:bg-imperium-crimson/40 transition-colors"
          >
            {'>'} Retry
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-imperium-steel-dark bg-imperium-black text-imperium-steel font-terminal text-sm uppercase hover:bg-imperium-steel/20 transition-colors"
          >
            {'>'} Return Home
          </button>
        </div>
      </div>
    </div>
  )
}
