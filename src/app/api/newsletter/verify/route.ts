import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/?error=missing-token', request.url)
    );
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { verifyToken: token },
  });

  if (!subscriber) {
    return NextResponse.redirect(
      new URL('/?error=invalid-token', request.url)
    );
  }

  if (subscriber.verified) {
    return NextResponse.redirect(
      new URL('/?error=already-verified', request.url)
    );
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      verified: true,
      verifyToken: null,
    },
  });

  return NextResponse.redirect(
    new URL('/?verified=true', request.url)
  );
}
