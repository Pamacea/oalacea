// API route for analytics events
// Privacy-first: No personal data stored without consent

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sessionId, referrer, utm, properties } = body;

    if (!type || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get client info (no IP stored for privacy)
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');

    // Get or create session
    let session = await prisma.analyticsSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      session = await prisma.analyticsSession.create({
        data: {
          sessionId,
          referrer,
          utmSource: utm?.utm_source,
          utmMedium: utm?.utm_medium,
          utmCampaign: utm?.utm_campaign,
          utmTerm: utm?.utm_term,
          utmContent: utm?.utm_content,
        },
      });
    }

    // Update session page views
    if (type === 'pageView') {
      await prisma.analyticsSession.update({
        where: { id: session.id },
        data: {
          pageViews: { increment: 1 },
          bounce: false, // Not a bounce if more than one page view
        },
      });
    }

    // Create event
    const event = await prisma.analyticsEvent.create({
      data: {
        sessionId: session.sessionId,
        type,
        path: properties?.path as string | null,
        properties,
        referrer,
        utmSource: utm?.utm_source,
        utmMedium: utm?.utm_medium,
        utmCampaign: utm?.utm_campaign,
        utmTerm: utm?.utm_term,
        utmContent: utm?.utm_content,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch {
    return NextResponse.json({ success: true }); // Always return success to not break the app
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const session = await prisma.analyticsSession.findUnique({
    where: { sessionId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  });

  return NextResponse.json(session);
}
