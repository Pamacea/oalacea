// API route for tracking time spent on page

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duration, path } = body;

    // Find the most recent page view for this path
    const pageView = await prisma.pageView.findFirst({
      where: { path },
      orderBy: { createdAt: 'desc' },
    });

    if (pageView) {
      await prisma.pageView.update({
        where: { id: pageView.id },
        data: { duration },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
