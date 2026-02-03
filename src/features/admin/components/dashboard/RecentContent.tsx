'use client';

import Link from 'next/link';
import { memo } from 'react';
import { GlitchText } from '@/components/ui/imperium';
import { motion } from 'framer-motion';
import type { DashboardPostItem, DashboardProjectItem } from '@/types/component';

interface RecentContentProps {
  posts: DashboardPostItem[];
  projects: DashboardProjectItem[];
}

export const RecentContent = memo(function RecentContent({ posts, projects }: RecentContentProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="font-display text-xs uppercase tracking-widest text-imperium-crimson mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-imperium-crimson animate-pulse" />
            <GlitchText intensity="low">[ RECENT ARCHIVES ]</GlitchText>
          </h2>
          <div className="relative border-2 border-imperium-steel-dark bg-imperium-black-deep/30 divide-y-2 divide-imperium-steel-dark overflow-hidden">
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-imperium-crimson" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-imperium-crimson" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-imperium-crimson" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-imperium-crimson" />

            {posts.slice(0, 3).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
              >
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="group relative block p-4 hover:bg-imperium-crimson/5 transition-colors border-l-2 border-transparent hover:border-imperium-crimson"
                >
                  <motion.div
                    className="absolute inset-0 bg-imperium-crimson/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: [0, 0.1, 0.05, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="relative flex items-center justify-between">
                    <p className="font-display text-sm uppercase tracking-wider text-imperium-bone group-hover:text-imperium-crimson transition-colors">
                      {post.title}
                    </p>
                    <span className="font-terminal text-xs text-imperium-steel-dark group-hover:text-imperium-crimson transition-colors">
                      {'>>'}
                    </span>
                  </div>
                  <p className="font-terminal text-xs text-imperium-steel-dark mt-2">
                    {'['}
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                    {']'}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h2 className="font-display text-xs uppercase tracking-widest text-imperium-gold mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-imperium-gold animate-pulse" />
            <GlitchText intensity="low">[ RECENT BLUEPRINTS ]</GlitchText>
          </h2>
          <div className="relative border-2 border-imperium-steel-dark bg-imperium-black-deep/30 divide-y-2 divide-imperium-steel-dark overflow-hidden">
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-imperium-gold" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-imperium-gold" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-imperium-gold" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-imperium-gold" />

            {projects.slice(0, 3).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              >
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="group relative block p-4 hover:bg-imperium-gold/5 transition-colors border-l-2 border-transparent hover:border-imperium-gold"
                >
                  <motion.div
                    className="absolute inset-0 bg-imperium-gold/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: [0, 0.1, 0.05, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="relative flex items-center justify-between">
                    <p className="font-display text-sm uppercase tracking-wider text-imperium-bone group-hover:text-imperium-gold transition-colors">
                      {project.title}
                    </p>
                    <span className="font-terminal text-xs text-imperium-steel-dark group-hover:text-imperium-gold transition-colors">
                      {'>>'}
                    </span>
                  </div>
                  <p className="font-terminal text-xs text-imperium-steel-dark mt-2">
                    {'['}
                    {project.year}{/* // */}{typeof project.category === 'string' ? project.category : project.category?.name || 'UNKNOWN'}
                    {']'}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
});
