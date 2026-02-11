'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Github, Mail, ExternalLink, FileText, FolderKanban, Code2, Globe, Shield } from 'lucide-react'
import { GlitchText } from '@/components/ui/imperium'
import { BrutalCard } from '@/components/navigation/BrutalBackground'

// Tech stack - simple badges
const techStack = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'Three.js',
  'R3F',
  'Prisma',
  'Tailwind CSS',
  'Framer Motion',
  'Zustand',
  'TanStack Query',
  'Node.js',
  'PostgreSQL',
  'Supabase',
  'NextAuth.js v5',
]

export default function AboutPage() {
  return (
    <div className="w-full max-w-4/5 mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="inline-block border-2 border-imperium-crimson bg-imperium-black-raise px-6 py-4 relative">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-imperium-crimson">
            <motion.div
              className="h-full bg-imperium-gold"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ width: '20%' }}
            />
          </div>

          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-widest text-imperium-crimson">
            <GlitchText>About</GlitchText>
          </h1>
          <p className="font-terminal text-sm text-imperium-steel mt-2">
            {'>'} Servant of the Omnissiah
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        {/* Identity Card - Spans 2 columns */}
        <BrutalCard hovered className="p-8 lg:col-span-2 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Name */}
            <motion.div
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              className="mb-6"
            >
              <h2 className="font-display text-5xl md:text-6xl uppercase tracking-widest text-imperium-crimson">
                OALACEA
              </h2>
            </motion.div>

            {/* Tagline */}
            <p className="font-terminal text-imperium-steel mb-6">
              [FULL_STACK_BROTHER] // [FORGE_WORLD_FRANCE]
            </p>

            {/* Description */}
            <p className="font-terminal text-sm text-imperium-steel max-w-xl mx-auto leading-relaxed">
              Digital domain forged in innovation. Immersive 3D experiences combining technical
              creativity with modern design principles. Every line of code is written with purpose.
            </p>

            {/* Stats - Simple */}
            <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-imperium-steel-dark/50">
              <div className="text-center">
                <div className="font-display text-2xl text-imperium-gold">12+</div>
                <div className="font-terminal text-xs text-imperium-steel">Projects</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl text-imperium-crimson">25+</div>
                <div className="font-terminal text-xs text-imperium-steel">Articles</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl text-imperium-teal">500+</div>
                <div className="font-terminal text-xs text-imperium-steel">Commits</div>
              </div>
            </div>
          </motion.div>
        </BrutalCard>

        {/* Decorative Icon */}
        <BrutalCard hovered className="p-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-imperium-crimson/10"
          >
            <Shield className="h-32 w-32" />
          </motion.div>
        </BrutalCard>
      </div>

      {/* Tech Stack */}
      <BrutalCard hovered className="p-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="font-display text-sm uppercase tracking-wider text-imperium-gold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-imperium-gold" />
            Arsenal
          </h3>

          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.03 }}
                className="px-3 py-1.5 font-terminal text-xs border border-imperium-steel-dark bg-imperium-black text-imperium-bone hover:border-imperium-crimson hover:text-imperium-crimson transition-colors cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </BrutalCard>

      {/* Navigation Links */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link href="/projets">
            <BrutalCard hovered className="p-6 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-imperium-gold/20 border border-imperium-gold group-hover:bg-imperium-gold/30 transition-colors">
                  <FolderKanban className="h-6 w-6 text-imperium-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display uppercase tracking-wider text-imperium-bone mb-1">
                    Project Forge
                  </h4>
                  <p className="font-terminal text-xs text-imperium-steel">
                    {'>'} View the blueprints
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-imperium-steel opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </BrutalCard>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link href="/blogs">
            <BrutalCard hovered className="p-6 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-imperium-crimson/20 border border-imperium-crimson group-hover:bg-imperium-crimson/30 transition-colors">
                  <FileText className="h-6 w-6 text-imperium-crimson" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display uppercase tracking-wider text-imperium-bone mb-1">
                    Archives
                  </h4>
                  <p className="font-terminal text-xs text-imperium-steel">
                    {'>'} Read the logs
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-imperium-steel opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </BrutalCard>
          </Link>
        </motion.div>
      </div>

      {/* Contact */}
      <BrutalCard hovered className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="font-display text-sm uppercase tracking-wider text-imperium-steel mb-6 text-center">
            Establish CommLink
          </h3>

          <div className="flex items-center justify-center gap-4">
            <motion.a
              href="https://github.com/oalacea"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group p-4 border-2 border-imperium-steel-dark bg-imperium-black/30 text-imperium-steel hover:text-imperium-bone hover:border-imperium-crimson hover:bg-imperium-crimson/10 transition-all"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </motion.a>

            <motion.a
              href="mailto:oalacea@oalacea.fr"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group p-4 border-2 border-imperium-steel-dark bg-imperium-black/30 text-imperium-steel hover:text-imperium-bone hover:border-imperium-crimson hover:bg-imperium-crimson/10 transition-all"
              aria-label="Email"
            >
              <Mail className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </motion.a>
          </div>
        </motion.div>
      </BrutalCard>

      {/* Version Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center"
      >
        <p className="font-terminal text-xs text-imperium-steel-dark">
          v1.0.1 // Data Slate
        </p>
      </motion.div>
    </div>
  )
}
