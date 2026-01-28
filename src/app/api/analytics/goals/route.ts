// API route for analytics goals

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGoalConversions } from '@/actions/analytics';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') as 'day' | 'week' | 'month' | 'year' | 'all') ?? 'month';

  try {
    const goals = await getGoalConversions(period);
    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type } = body;

    // Create a custom goal (in a real app, you'd have a separate Goal model)
    const goal = await prisma.goalConversion.create({
      data: {
        goalType: type,
        sessionId: 'custom',
        steps: [name],
        completed: false,
        metadata: { name },
      },
    });

    return NextResponse.json(goal);
  } catch {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
