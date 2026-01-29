// Server Actions for Analytics

'use server';

import { prisma } from '@/lib/prisma';
import type { TimePeriod } from '@/lib/contentMetrics';
import { getPopularContent, getViewsOverTime, getReferrerStats, getEngagementMetrics } from '@/lib/contentMetrics';

export interface AnalyticsOverview {
  totalViews: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number }>;
}

export interface ContentAnalytics {
  popularPosts: Array<{ id: string; title: string; slug: string; views: number }>;
  popularProjects: Array<{ id: string; title: string; slug: string; views: number }>;
}

export interface DashboardData {
  overview: AnalyticsOverview;
  content: ContentAnalytics;
  viewsOverTime: Array<{ date: string; views: number }>;
  referrers: Array<{ referrer: string; visits: number }>;
  engagement: { totalViews: number; totalEvents: number; avgDuration: number };
}

export async function getAnalyticsOverview(period: TimePeriod = 'month'): Promise<AnalyticsOverview> {
  const startDate = getDateForPeriod(period);

  const [totalViews, totalSessions, sessions, topPages] = await Promise.all([
    prisma.pageView.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.analyticsSession.count({
      where: { startTime: { gte: startDate } },
    }),
    prisma.analyticsSession.findMany({
      where: { startTime: { gte: startDate }, duration: { not: null } },
      select: { duration: true },
    }),
    prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ]);

  const avgSessionDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0) / sessions.length)
    : 0;

  const bounceSessions = await prisma.analyticsSession.count({
    where: { startTime: { gte: startDate }, bounce: true },
  });

  const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;

  return {
    totalViews,
    totalSessions,
    avgSessionDuration,
    bounceRate,
    topPages: topPages.map((p) => ({ path: p.path, views: p._count.id })),
  };
}

export async function getContentAnalytics(period: TimePeriod = 'month'): Promise<ContentAnalytics> {
  const [popularPosts, popularProjects] = await Promise.all([
    getPopularContent('post', 5, period),
    getPopularContent('project', 5, period),
  ]);

  return {
    popularPosts,
    popularProjects,
  };
}

export async function getViewsOverTimeData(period: TimePeriod = 'month'): Promise<Array<{ date: string; views: number }>> {
  const data = await getViewsOverTime(undefined, undefined, period);
  return data.map((d) => ({ date: d.date, views: d.views }));
}

export async function getReferrerData(period: TimePeriod = 'month'): Promise<Array<{ referrer: string; visits: number }>> {
  const data = await getReferrerStats(10, period);
  return data.map((d) => ({ referrer: d.referrer, visits: d.visits }));
}

export async function getEngagementData(period: TimePeriod = 'month') {
  return getEngagementMetrics(period);
}

export async function getDashboardData(period: TimePeriod = 'month'): Promise<DashboardData> {
  const [overview, content, viewsOverTime, referrers, engagement] = await Promise.all([
    getAnalyticsOverview(period),
    getContentAnalytics(period),
    getViewsOverTimeData(period),
    getReferrerData(period),
    getEngagementData(period),
  ]);

  return {
    overview,
    content,
    viewsOverTime,
    referrers,
    engagement,
  };
}

export async function getAnalyticsExport(period: TimePeriod = 'month'): Promise<string> {
  const data = await getDashboardData(period);

  const headers = [
    'Date Range',
    'Total Views',
    'Total Sessions',
    'Avg Session Duration',
    'Bounce Rate (%)',
  ];

  const rows = [
    [
      period,
      data.overview.totalViews.toString(),
      data.overview.totalSessions.toString(),
      data.overview.avgSessionDuration.toString(),
      data.overview.bounceRate.toFixed(2),
    ],
  ];

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

// 3D Interaction Analytics
export async function get3DInteractionStats(period: TimePeriod = 'month') {
  const startDate = getDateForPeriod(period);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      type: 'interaction3D',
      createdAt: { gte: startDate },
    },
  });

  // Aggregate by interaction type
  const byType = new Map<string, number>();
  const byWorld = new Map<'dev' | 'art', number>();

  events.forEach((event) => {
    const props = event.properties as Record<string, unknown> | null;
    const type = props?.interactionType as string | undefined;
    const world = props?.worldType as 'dev' | 'art' | undefined;

    if (type) {
      byType.set(type, (byType.get(type) ?? 0) + 1);
    }
    if (world) {
      byWorld.set(world, (byWorld.get(world) ?? 0) + 1);
    }
  });

  return {
    totalInteractions: events.length,
    byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })),
    byWorld: [
      { world: 'dev', count: byWorld.get('dev') ?? 0 },
      { world: 'art', count: byWorld.get('art') ?? 0 },
    ],
  };
}

// Goal conversions
export async function getGoalConversions(period: TimePeriod = 'month') {
  const startDate = getDateForPeriod(period);

  const conversions = await prisma.goalConversion.findMany({
    where: { createdAt: { gte: startDate } },
  });

  const byType = new Map<string, { total: number; completed: number }>();

  conversions.forEach((conversion) => {
    const existing = byType.get(conversion.goalType) ?? { total: 0, completed: 0 };
    existing.total++;
    if (conversion.completed) {
      existing.completed++;
    }
    byType.set(conversion.goalType, existing);
  });

  return Array.from(byType.entries()).map(([goalType, stats]) => ({
    goalType,
    total: stats.total,
    completed: stats.completed,
    conversionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
  }));
}

function getDateForPeriod(period: TimePeriod): Date {
  const now = new Date();

  switch (period) {
    case 'day':
      now.setDate(now.getDate() - 1);
      break;
    case 'week':
      now.setDate(now.getDate() - 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      now.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      return new Date(0);
  }

  return now;
}
