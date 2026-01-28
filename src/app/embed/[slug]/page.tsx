import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { trackAnalyticsEvent } from '@/lib/analytics';

interface EmbedPageProps {
  params: { slug: string };
  searchParams: Promise<{
    world?: 'dev' | 'art';
    pos?: string;
    branding?: 'true' | 'false';
    controls?: 'true' | 'false';
  }>;
}

async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { worldPosition: true },
  });
  return project;
}

async function trackEmbedView(projectSlug: string, searchParams: Awaited<EmbedPageProps['searchParams']>) {
  try {
    await trackAnalyticsEvent({
      type: 'embedView',
      properties: {
        projectSlug,
        world: searchParams.world,
        hasBranding: searchParams.branding !== 'false',
        hasControls: searchParams.controls !== 'false',
      },
    });
  } catch (error) {
    console.error('Failed to track embed view:', error);
  }
}

function EmbedControls({
  slug,
  world,
  position,
  branding,
}: {
  slug: string;
  world?: string;
  position?: string;
  branding?: boolean;
}) {
  'use client';

  const embedUrl = typeof window !== 'undefined'
    ? new URL(window.location.origin + `/embed/${slug}`)
    : new URL(`/embed/${slug}`, 'http://localhost:3000');

  if (world) embedUrl.searchParams.set('world', world);
  if (position) embedUrl.searchParams.set('pos', position);
  if (branding !== undefined) embedUrl.searchParams.set('branding', branding ? 'true' : 'false');

  const iframeCode = `<iframe
  src="${embedUrl.toString()}"
  width="800"
  height="600"
  frameborder="0"
  allowfullscreen
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/80 p-4 text-white">
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold hover:text-imperium-gold">
          Get Embed Code
        </summary>
        <div className="mt-2 space-y-2">
          <pre className="overflow-auto rounded bg-black/50 p-2 text-xs">
            {iframeCode}
          </pre>
          <button
            onClick={handleCopy}
            className="rounded bg-imperium-gold px-3 py-1 text-sm font-semibold text-black hover:bg-imperium-gold/80"
          >
            Copy Code
          </button>
        </div>
      </details>
    </div>
  );
}

function EmbedScene({
  projectSlug,
  world,
  position,
  showBranding,
  showControls,
}: {
  projectSlug: string;
  world?: 'dev' | 'art';
  position?: string;
  showBranding?: boolean;
  showControls?: boolean;
}) {
  return (
    <div className="relative h-screen w-full bg-slate-950">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">3D</div>
          <h2 className="text-2xl font-bold text-imperium-gold">
            {projectSlug}
          </h2>
          <p className="mt-2 text-slate-400">
            {world ? `World: ${world}` : 'Default World'}
          </p>
          {position && (
            <p className="text-xs text-slate-500">
              Position: {position}
            </p>
          )}
        </div>
      </div>

      {showBranding && (
        <div className="absolute top-4 right-4 rounded-full bg-imperium-gold/10 px-3 py-1 text-xs font-semibold text-imperium-gold border border-imperium-gold/20">
          Oalacea
        </div>
      )}

      {showControls && (
        <EmbedControls
          slug={projectSlug}
          world={world}
          position={position}
          branding={showBranding}
        />
      )}
    </div>
  );
}

export default async function EmbedPage({
  params,
  searchParams,
}: EmbedPageProps) {
  const resolvedSearchParams = await searchParams;
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const world = resolvedSearchParams.world || project.worldPosition?.world?.toLowerCase() as 'dev' | 'art' | undefined;
  const position = resolvedSearchParams.pos;
  const showBranding = resolvedSearchParams.branding !== 'false';
  const showControls = resolvedSearchParams.controls !== 'false';

  await trackEmbedView(project.slug, resolvedSearchParams);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{project.title} - Oalacea 3D Embed</title>
        <meta name="description" content={project.description} />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0a0a0a;
            overflow: hidden;
          }
        `}</style>
      </head>
      <body>
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
            Loading 3D Scene...
          </div>
        }>
          <EmbedScene
            projectSlug={project.slug}
            world={world}
            position={position}
            showBranding={showBranding}
            showControls={showControls}
          />
        </Suspense>
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: EmbedPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} - Embed`,
    description: project.description,
  };
}
