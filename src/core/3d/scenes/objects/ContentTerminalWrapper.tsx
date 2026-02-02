'use client';

import { useEffect, useState } from 'react';
import { ContentTerminal } from './ContentTerminal';
import { getPosts } from '@/actions/blog';
import { getProjects, type ProjectListItem } from '@/actions/projects';
import type { PostListItem } from '@/actions/blog/query';

export function BlogContentTerminal({ position, world }: { position: [number, number, number]; world: 'DEV' | 'ART' }) {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPosts({ published: true, limit: 100 }).then((result) => {
      setPosts(result.posts || []);
      setIsLoading(false);
    }).catch(() => {
      setPosts([]);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return null;
  if (posts.length === 0) return null;

  const mappedPosts = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    publishDate: p.publishDate ?? undefined,
  }));

  return (
    <ContentTerminal
      position={position}
      world={world}
      defaultMode="blog"
      blogPosts={mappedPosts}
      projects={[]}
    />
  );
}

export function ProjectContentTerminal({ position, world }: { position: [number, number, number]; world: 'DEV' | 'ART' }) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProjects().then((result) => {
      setProjects(result || []);
      setIsLoading(false);
    }).catch(() => {
      setProjects([]);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return null;
  if (projects.length === 0) return null;

  return (
    <ContentTerminal
      position={position}
      world={world}
      defaultMode="project"
      blogPosts={[]}
      projects={projects}
    />
  );
}

export function CombinedContentTerminal({ position, world }: { position: [number, number, number]; world: 'DEV' | 'ART' }) {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPosts({ published: true, limit: 100 }),
      getProjects(),
    ]).then(([blogResult, projectResult]) => {
      setPosts(blogResult.posts || []);
      setProjects(projectResult || []);
      setIsLoading(false);
    }).catch(() => {
      setPosts([]);
      setProjects([]);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return null;
  if (posts.length === 0 && projects.length === 0) return null;

  const mappedPosts = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    publishDate: p.publishDate ?? undefined,
  }));

  return (
    <ContentTerminal
      position={position}
      world={world}
      defaultMode="blog"
      blogPosts={mappedPosts}
      projects={projects}
    />
  );
}
