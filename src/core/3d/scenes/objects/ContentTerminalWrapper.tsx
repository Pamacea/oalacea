'use client';

import { useEffect, useState } from 'react';
import { ContentTerminal } from './ContentTerminal';
import { getPosts } from '@/actions/blog';
import { getProjects } from '@/actions/projects';

export function BlogContentTerminal({ position, world }: { position: [number, number, number]; world: 'DEV' | 'ART' }) {
  const [posts, setPosts] = useState<any[]>([]);
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

  return (
    <ContentTerminal
      position={position}
      world={world}
      defaultMode="blog"
      blogPosts={posts}
      projects={[]}
    />
  );
}

export function ProjectContentTerminal({ position, world }: { position: [number, number, number]; world: 'DEV' | 'ART' }) {
  const [projects, setProjects] = useState<any[]>([]);
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
  const [posts, setPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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

  return (
    <ContentTerminal
      position={position}
      world={world}
      defaultMode="blog"
      blogPosts={posts}
      projects={projects}
    />
  );
}
