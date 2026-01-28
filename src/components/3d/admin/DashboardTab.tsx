'use client';

import { useState, useEffect } from 'react';
import { FileText, FolderKanban, TrendingUp, Calendar } from 'lucide-react';
import { getPosts } from '@/actions/blog';
import { getProjects } from '@/actions/projects';
import type { Post } from '@/generated/prisma/client';
import type { Project } from '@/generated/prisma/client';

export function DashboardTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsData, projectsData] = await Promise.all([
          getPosts({}),
          getProjects(),
        ]);
        setPosts(postsData.posts);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Blog',
      count: posts.length,
      icon: FileText,
    },
    {
      title: 'Projets',
      count: projects.length,
      icon: FolderKanban,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Tableau de bord</h2>
        <p className="text-zinc-500 text-sm mt-1">Vue d'ensemble de votre contenu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="border border-zinc-800 rounded-xl bg-zinc-900/30 p-6 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-zinc-100">{stat.count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Posts */}
      {posts.length > 0 && (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <Calendar className="h-4 w-4" />
            Articles récents
          </h3>
          <div className="space-y-2">
            {posts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-zinc-200 text-sm">{post.title}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    post.published
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {post.published ? 'Publié' : 'Brouillon'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
