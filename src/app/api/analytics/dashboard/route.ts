// API route for analytics dashboard data

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/actions/analytics';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') as 'day' | 'week' | 'month' | 'year' | 'all') ?? 'month';

  try {
    const data = await getDashboardData(period);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
