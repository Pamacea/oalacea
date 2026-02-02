// API route for exporting analytics as CSV

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsExport } from '@/actions/analytics';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') as 'day' | 'week' | 'month' | 'year' | 'all') ?? 'month';

  try {
    const csv = await getAnalyticsExport(period);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${period}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 });
  }
}
