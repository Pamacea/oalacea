'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { GlitchText } from '@/components/ui/imperium'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Projects page error:', error)
  }, [error])

  return (
    <div className="w-full max-w-4xl mx-auto px-4 text-center py-12">
      <div className="inline-block border-2 border-imperium-gold bg-imperium-black-raise px-8 py-6">
        <h1 className="font-display text-4xl uppercase tracking-widest text-imperium-gold mb-4">
          <GlitchText>Forge</GlitchText>
        </h1>
        <div className="flex items-center justify-center gap-2 text-imperium-gold mb-4">
          <AlertCircle className="h-5 w-5" />
          <p className="font-terminal text-imperium-gold">
            Failed to load blueprints
          </p>
        </div>
        <p className="font-terminal text-imperium-steel-dark mb-6">
          {error.message || 'Database connection error'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 border border-imperium-gold bg-imperium-gold/20 text-imperium-gold font-terminal text-sm uppercase hover:bg-imperium-gold/40 transition-colors"
        >
          {'>'} Retry connection
        </button>
      </div>
    </div>
  )
}
