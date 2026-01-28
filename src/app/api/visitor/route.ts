import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const consentSchema = z.object({
  visitorId: z.string(),
  sessionId: z.string(),
  consent: z.boolean(),
});

const conversationSchema = z.object({
  visitorId: z.string(),
  sessionId: z.string(),
  npcId: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
  })),
  summary: z.string().optional(),
  topic: z.string().optional(),
  sentiment: z.string().optional(),
});

const preferencesSchema = z.object({
  visitorId: z.string(),
  npcId: z.string(),
  preferences: z.record(z.string(), z.unknown()),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId');
    const npcId = searchParams.get('npcId');

    if (!visitorId || !npcId) {
      return NextResponse.json(
        { error: 'visitorId and npcId are required' },
        { status: 400 }
      );
    }

    const visitorMemory = await prisma.visitorMemory.findUnique({
      where: {
        visitorId_npcId: {
          visitorId,
          npcId,
        },
      },
      include: {
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!visitorMemory) {
      return NextResponse.json({
        exists: false,
        greeting: null,
        preferences: {},
      });
    }

    const lastVisit = visitorMemory.lastInteractionAt;
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    let personalizedGreeting = null;
    if (visitorMemory.totalInteractions > 0) {
      if (daysSinceLastVisit !== null && daysSinceLastVisit < 1) {
        personalizedGreeting = 'Welcome back! Good to see you again so soon.';
      } else if (daysSinceLastVisit !== null && daysSinceLastVisit < 7) {
        personalizedGreeting = 'Welcome back! It\'s great to see you again.';
      } else if (visitorMemory.totalInteractions > 5) {
        personalizedGreeting = 'Welcome back, dear friend. It has been a while.';
      } else {
        personalizedGreeting = 'Welcome back!';
      }
    }

    return NextResponse.json({
      exists: true,
      greeting: personalizedGreeting,
      preferences: visitorMemory.preferences,
      totalInteractions: visitorMemory.totalInteractions,
      lastInteractionAt: visitorMemory.lastInteractionAt,
      dataConsent: visitorMemory.dataConsent,
    });
  } catch (error) {
    console.error('Visitor GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'consent') {
      const result = consentSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid consent data' },
          { status: 400 }
        );
      }

      const { visitorId, sessionId, consent } = result.data;

      await prisma.visitorMemory.upsert({
        where: {
          visitorId_npcId: {
            visitorId,
            npcId: 'general',
          },
        },
        create: {
          visitorId,
          sessionId,
          npcId: 'general',
          dataConsent: consent,
          consentDate: consent ? new Date() : null,
        },
        update: {
          dataConsent: consent,
          consentDate: consent ? new Date() : null,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'saveConversation') {
      const result = conversationSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid conversation data' },
          { status: 400 }
        );
      }

      const { visitorId, sessionId, npcId, messages, summary, topic, sentiment } = result.data;

      const memory = await prisma.visitorMemory.upsert({
        where: {
          visitorId_npcId: { visitorId, npcId },
        },
        create: {
          visitorId,
          sessionId,
          npcId,
          totalInteractions: 1,
          lastInteractionAt: new Date(),
        },
        update: {
          totalInteractions: { increment: 1 },
          lastInteractionAt: new Date(),
        },
      });

      await prisma.conversation.create({
        data: {
          visitorMemoryId: memory.id,
          messages: messages as any,
          summary,
          topic,
          sentiment,
        },
      });

      return NextResponse.json({ success: true, memoryId: memory.id });
    }

    if (action === 'updatePreferences') {
      const result = preferencesSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid preferences data' },
          { status: 400 }
        );
      }

      const { visitorId, npcId, preferences } = result.data;

      await prisma.visitorMemory.upsert({
        where: {
          visitorId_npcId: { visitorId, npcId },
        },
        create: {
          visitorId,
          sessionId: 'unknown',
          npcId,
          preferences: preferences as any,
        },
        update: {
          preferences: preferences as any,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Visitor POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process visitor request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
      return NextResponse.json(
        { error: 'visitorId is required' },
        { status: 400 }
      );
    }

    await prisma.visitorMemory.updateMany({
      where: { visitorId },
      data: {
        isAnonymous: true,
        anonymizedAt: new Date(),
        preferences: {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Visitor DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to anonymize visitor data' },
      { status: 500 }
    );
  }
}
