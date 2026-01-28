import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateShareCardSVG, svgToPng } from '@/lib/shareCard';
import { formatDate } from '@/lib/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getBlogPostData(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true, author: true },
  });

  if (!post) return null;

  return {
    type: 'blog' as const,
    title: post.title,
    description: post.excerpt || post.metaDescription || '',
    imageUrl: post.coverImage || undefined,
    date: post.publishDate ? formatDate(post.publishDate) : undefined,
    author: post.author?.name || 'Yanis',
  };
}

async function getProjectData(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!project) return null;

  return {
    type: 'project' as const,
    title: project.title,
    description: project.description,
    imageUrl: project.thumbnail || undefined,
    date: project.year?.toString(),
    author: project.author?.name || 'Yanis',
  };
}

function getProfileData() {
  return {
    type: 'profile' as const,
    title: 'Oalacea',
    description: '3D Portfolio & Creative Developer',
    imageUrl: undefined,
    author: 'Yanis',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'blog' | 'project' | 'profile';
  const slug = searchParams.get('slug');
  const theme = (searchParams.get('theme') as 'imperium' | 'underground') || 'imperium';

  if (!type || (type !== 'profile' && !slug)) {
    return NextResponse.json(
      { error: 'Invalid request. Provide type and slug.' },
      { status: 400 }
    );
  }

  try {
    let data: Awaited<ReturnType<typeof getBlogPostData | typeof getProjectData | typeof getProfileData>>;

    switch (type) {
      case 'blog':
        data = await getBlogPostData(slug!);
        break;
      case 'project':
        data = await getProjectData(slug!);
        break;
      case 'profile':
        data = getProfileData();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    const svg = await generateShareCardSVG({
      ...data,
      theme,
    });

    const png = await svgToPng(svg);

    return new NextResponse(png as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': png.length.toString(),
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error generating share card:', error);
    return NextResponse.json(
      { error: 'Failed to generate share card' },
      { status: 500 }
    );
  }
}
