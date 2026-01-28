import { getProjectBySlug } from '@/actions/projects';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Github, ExternalLink, Code2 } from 'lucide-react';
import Link from 'next/link';
import { ThemeBackground, ThemeSurface } from '@/components/shared';
import { Comments } from '@/components/blog/Comments';
import { ShareButtons } from '@/components/shared';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-static';
export const revalidate = 300;

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  WEB: { label: 'Web', emoji: '' },
  MOBILE: { label: 'Mobile', emoji: '' },
  THREE_D: { label: '3D', emoji: '' },
  AI: { label: 'Intelligence Artificielle', emoji: '' },
  OTHER: { label: 'Autre', emoji: '' },
};

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Projet non trouvé',
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.thumbnail ? [project.thumbnail] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const categoryInfo = categoryLabels[project.category] || { label: project.category, emoji: '' };

  return (
    <ThemeBackground className="min-h-screen">
      <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back Button */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline mb-8"
          style={{ color: 'var(--world-primary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au portfolio
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <span
            className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full mb-4"
            style={{
              backgroundColor: 'var(--world-secondary)',
              color: '#fff',
            }}
          >
            {categoryInfo.emoji} {categoryInfo.label}
          </span>

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'var(--world-text-primary)' }}
          >
            {project.title}
          </h1>

          {/* Description */}
          <p
            className="mt-4 text-lg leading-relaxed"
            style={{ color: 'var(--world-text-secondary)' }}
          >
            {project.description}
          </p>

          {/* Meta */}
          <div
            className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-sm"
            style={{ color: 'var(--world-text-muted)' }}
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {project.year}
            </span>
          </div>

          {/* Action Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--world-surface)',
                  border: `1px solid var(--world-border)`,
                  color: 'var(--world-text-primary)',
                }}
              >
                <Github className="h-4 w-4" />
                Code source
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--world-primary)',
                  color: 'var(--world-primary-foreground)',
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Voir en ligne
              </a>
            )}
          </div>
        </header>

        {/* Thumbnail / Featured Image */}
        {project.thumbnail && (
          <ThemeSurface className="rounded-xl overflow-hidden border mb-8">
            <div className="aspect-video">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            </div>
          </ThemeSurface>
        )}

        {/* Share Buttons */}
        <div className="mb-8 pb-8 border-b" style={{ borderColor: 'var(--world-border)' }}>
          <ShareButtons title={project.title} />
        </div>

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-8">
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--world-text-primary)' }}
            >
              <Code2 className="h-5 w-5" style={{ color: 'var(--world-primary)' }} />
              Technologies utilisées
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-sm rounded-lg"
                  style={{
                    backgroundColor: 'var(--world-surface)',
                    border: `1px solid var(--world-border)`,
                    color: 'var(--world-text-secondary)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Long Description */}
        {project.longDescription && (
          <div className="mb-8">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--world-text-primary)' }}
            >
              À propos du projet
            </h2>
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              style={{ color: 'var(--world-text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: project.longDescription }}
            />
          </div>
        )}

        {/* Share Buttons (Bottom) */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--world-border)' }}>
          <ShareButtons title={project.title} />
        </div>

        {/* Comments */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--world-border)' }}>
          <Comments projectId={project.id} />
        </div>
      </article>
    </ThemeBackground>
  );
}
