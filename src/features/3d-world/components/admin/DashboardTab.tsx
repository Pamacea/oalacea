'use client';

import { Calendar, Scroll, Hammer } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePosts } from '@/features/blog/queries';
import { useProjects } from '@/features/portfolio/queries/useProjects';
import { GlitchText } from '@/components/ui/imperium';

export function DashboardTab() {
  const { posts } = usePosts({ published: false, page: 1, limit: 100 });
  const { projects } = useProjects();

  const stats = [
    {
      title: 'Archives',
      count: posts.length,
      icon: Scroll,
      color: 'border-imperium-crimson text-imperium-crimson bg-imperium-crimson/10',
    },
    {
      title: 'Blueprints',
      count: projects.length,
      icon: Hammer,
      color: 'border-imperium-gold text-imperium-gold bg-imperium-gold/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-2 border-imperium-steel-dark pb-6">
        <h2 className="font-display text-3xl uppercase tracking-widest text-imperium-bone">
          <GlitchText intensity="medium">
            Command Center
          </GlitchText>
        </h2>
        <p className="font-terminal text-sm text-imperium-steel mt-2">
          {'>'} Imperial Administration Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative border-2 border-imperium-steel-dark bg-imperium-black/50 p-6 hover:border-imperium-steel transition-all group"
            >
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-imperium-crimson opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center border-2 ${stat.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-terminal text-xs text-imperium-steel-dark uppercase tracking-wider">
                    {'['}{stat.title}{']'}
                  </p>
                  <p className="font-display text-4xl font-bold text-imperium-bone">
                    {stat.count}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div className="border-2 border-imperium-steel-dark bg-imperium-black/50 p-6">
          <h3 className="mb-5 flex items-center gap-3 font-display text-sm uppercase tracking-wider text-imperium-steel">
            <Calendar className="h-5 w-5 text-imperium-crimson" />
            Recent Archives
          </h3>
          <div className="space-y-2">
            {posts.slice(0, 5).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between border border-imperium-steel-dark bg-imperium-black/30 px-4 py-3 hover:border-imperium-steel hover:bg-imperium-black/50 transition-all"
              >
                <div className="flex-1">
                  <p className="font-display text-sm text-imperium-bone">{post.title}</p>
                  <p className="font-terminal text-xs text-imperium-steel-dark">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span
                  className={`border px-3 py-1 font-terminal text-xs uppercase ${
                    post.published
                      ? 'border-imperium-crimson text-imperium-crimson bg-imperium-crimson/10'
                      : 'border-imperium-steel-dark text-imperium-steel-dark bg-imperium-steel'
                  }`}
                >
                  {post.published ? '[PUBLISHED]' : '[DRAFT]'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
