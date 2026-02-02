// Content Metrics Library
// Server-side utilities for tracking and aggregating content metrics

import { prisma } from './prisma';
import type { ContentMetrics } from '@/generated/prisma/client';

export type EntityType = 'post' | 'project';
export type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'all';

interface ContentStats {
  entityType: EntityType;
  entityId: string;
  views: number;
  uniqueViews: number;
  avgDuration: number | null;
  avgScrollDepth: number | null;
  bounceRate: number | null;
  totalShares: number;
  totalComments: number;
  lastViewedAt: Date | null;
}

interface PopularContent {
  id: string;
  title: string;
  slug: string;
  views: number;
  avgDuration: number | null;
  entityType: EntityType;
}

interface TimeSeriesData {
  date: string;
  views: number;
  uniqueVisitors: number;
  avgDuration: number;
}

interface ReferrerData {
  referrer: string;
  visits: number;
  uniqueVisits: number;
  bounceRate: number | null;
}

// Record a page view for content
export async function recordContentView(options: {
  entityType: EntityType;
  entityId: string;
  sessionId: string;
  duration?: number;
  scrollDepth?: number;
  referrer?: string;
}): Promise<void> {
  const { entityType, entityId, sessionId, duration, scrollDepth, referrer } = options;

  // Update content metrics
  await prisma.contentMetrics.upsert({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
    create: {
      entityType,
      entityId,
      views: 1,
      uniqueViews: 1,
      avgDuration: duration,
      avgScrollDepth: scrollDepth,
      lastViewedAt: new Date(),
    },
    update: {
      views: { increment: 1 },
      lastViewedAt: new Date(),
      ...(duration && {
        avgDuration: {
          // Simple moving average
          increment: duration,
        },
      }),
      ...(scrollDepth && {
        avgScrollDepth: scrollDepth,
      }),
    },
  });

  // Record page view
  await prisma.pageView.create({
    data: {
      path: `/${entityType}/${entityId}`,
      sessionId,
      referrer,
      duration,
      scrollDepth,
    },
  });
}

// Get content metrics
export async function getContentMetrics(
  entityType: EntityType,
  entityId: string
): Promise<ContentStats | null> {
  const metrics = await prisma.contentMetrics.findUnique({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
  });

  if (!metrics) return null;

  return {
    entityType: metrics.entityType as EntityType,
    entityId: metrics.entityId,
    views: metrics.views,
    uniqueViews: metrics.uniqueViews,
    avgDuration: metrics.avgDuration,
    avgScrollDepth: metrics.avgScrollDepth,
    bounceRate: metrics.bounceRate,
    totalShares: metrics.totalShares,
    totalComments: metrics.totalComments,
    lastViewedAt: metrics.lastViewedAt,
  };
}

// Get popular content
export async function getPopularContent(
  entityType?: EntityType,
  limit = 10,
  timePeriod: TimePeriod = 'all'
): Promise<PopularContent[]> {
  const startDate = getDateForPeriod(timePeriod);

  // Get content metrics ordered by views
  const metrics = await prisma.contentMetrics.findMany({
    where: {
      ...(entityType && { entityType }),
      createdAt: { gte: startDate },
    },
    orderBy: { views: 'desc' },
    take: limit,
  });

  // Fetch actual content data
  const result: PopularContent[] = [];

  for (const metric of metrics) {
    if (metric.entityType === 'post') {
      const post = await prisma.post.findUnique({
        where: { id: metric.entityId },
        select: { title: true, slug: true },
      });
      if (post) {
        result.push({
          id: metric.entityId,
          title: post.title,
          slug: post.slug,
          views: metric.views,
          avgDuration: metric.avgDuration,
          entityType: 'post',
        });
      }
    } else if (metric.entityType === 'project') {
      const project = await prisma.project.findUnique({
        where: { id: metric.entityId },
        select: { title: true, slug: true },
      });
      if (project) {
        result.push({
          id: metric.entityId,
          title: project.title,
          slug: project.slug,
          views: metric.views,
          avgDuration: metric.avgDuration,
          entityType: 'project',
        });
      }
    }
  }

  return result;
}

// Get views over time (time series data)
export async function getViewsOverTime(
  entityType?: EntityType,
  entityId?: string,
  period: TimePeriod = 'month'
): Promise<TimeSeriesData[]> {
  const startDate = getDateForPeriod(period);

  const metrics = await prisma.contentMetrics.findMany({
    where: {
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const grouped = new Map<string, TimeSeriesData>();

  metrics.forEach((metric) => {
    const date = formatDateByPeriod(metric.createdAt, period);
    const existing = grouped.get(date);

    if (existing) {
      existing.views += metric.views;
      existing.uniqueVisitors += metric.uniqueViews;
    } else {
      grouped.set(date, {
        date,
        views: metric.views,
        uniqueVisitors: metric.uniqueViews,
        avgDuration: metric.avgDuration ?? 0,
      });
    }
  });

  return Array.from(grouped.values());
}

// Get referrer statistics
export async function getReferrerStats(
  limit = 10,
  timePeriod: TimePeriod = 'month'
): Promise<ReferrerData[]> {
  const startDate = getDateForPeriod(timePeriod);

  const referrers = await prisma.referrerStats.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    orderBy: { visits: 'desc' },
    take: limit,
  });

  return referrers.map((r) => ({
    referrer: r.referrer || '(direct)',
    visits: r.visits,
    uniqueVisits: r.uniqueVisits,
    bounceRate: r.bounceRate,
  }));
}

// Calculate bounce rate
export async function calculateBounceRate(
  entityType?: EntityType,
  entityId?: string,
  timePeriod: TimePeriod = 'month'
): Promise<number> {
  const startDate = getDateForPeriod(timePeriod);

  const sessions = await prisma.analyticsSession.findMany({
    where: {
      startTime: { gte: startDate },
      bounce: true,
    },
  });

  const totalSessions = await prisma.analyticsSession.count({
    where: {
      startTime: { gte: startDate },
    },
  });

  if (totalSessions === 0) return 0;

  return (sessions.length / totalSessions) * 100;
}

// Get engagement metrics
export async function getEngagementMetrics(timePeriod: TimePeriod = 'month') {
  const startDate = getDateForPeriod(timePeriod);

  const [totalViews, totalEvents, avgDuration] = await Promise.all([
    prisma.pageView.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.analyticsEvent.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.pageView.aggregate({
      where: { createdAt: { gte: startDate }, duration: { not: null } },
      _avg: { duration: true },
    }),
  ]);

  return {
    totalViews,
    totalEvents,
    avgDuration: avgDuration._avg.duration ?? 0,
  };
}

// Aggregate daily metrics
export async function getDailyMetrics(days = 30): Promise<TimeSeriesData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pageViews = await prisma.pageView.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate },
    },
    _count: { id: true },
  });

  const grouped = new Map<string, TimeSeriesData>();

  pageViews.forEach((pv) => {
    const date = pv.createdAt.toISOString().split('T')[0];
    const existing = grouped.get(date);

    if (existing) {
      existing.views += pv._count.id;
    } else {
      grouped.set(date, {
        date,
        views: pv._count.id,
        uniqueVisitors: 0, // Would need session data for accurate count
        avgDuration: 0,
      });
    }
  });

  return Array.from(grouped.values());
}

// Update content metrics with new data
export async function updateContentMetrics(options: {
  entityType: EntityType;
  entityId: string;
  views?: number;
  avgDuration?: number;
  avgScrollDepth?: number;
  totalShares?: number;
  totalComments?: number;
}): Promise<ContentMetrics> {
  const { entityType, entityId, ...data } = options;

  return prisma.contentMetrics.upsert({
    where: {
      entityType_entityId: {
        entityType,
        entityId,
      },
    },
    create: {
      entityType,
      entityId,
      ...data,
    },
    update: data,
  });
}

// Record referrer
export async function recordReferrer(referrer: string): Promise<void> {
  await prisma.referrerStats.upsert({
    where: { referrer },
    create: {
      referrer,
      visits: 1,
      uniqueVisits: 1,
      lastVisitAt: new Date(),
    },
    update: {
      visits: { increment: 1 },
      lastVisitAt: new Date(),
    },
  });
}

// Helper functions
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

function formatDateByPeriod(date: Date, period: TimePeriod): string {
  switch (period) {
    case 'day':
      return date.toISOString().slice(0, 13) + ':00';
    case 'week':
    case 'month':
      return date.toISOString().split('T')[0];
    case 'year':
      return date.toISOString().slice(0, 7);
    default:
      return date.toISOString().split('T')[0];
  }
}

// Export data as CSV
export async function exportMetricsAsCsv(
  entityType: EntityType,
  entityId: string
): Promise<string> {
  const metrics = await getContentMetrics(entityType, entityId);

  if (!metrics) {
    throw new Error('Metrics not found');
  }

  const headers = ['Metric', 'Value'];
  const rows = [
    ['Content Type', metrics.entityType],
    ['Content ID', metrics.entityId],
    ['Total Views', metrics.views.toString()],
    ['Unique Views', metrics.uniqueViews.toString()],
    ['Avg Duration (s)', metrics.avgDuration?.toString() ?? 'N/A'],
    ['Avg Scroll Depth (%)', metrics.avgScrollDepth?.toString() ?? 'N/A'],
    ['Bounce Rate (%)', metrics.bounceRate?.toString() ?? 'N/A'],
    ['Total Shares', metrics.totalShares.toString()],
    ['Total Comments', metrics.totalComments.toString()],
    ['Last Viewed', metrics.lastViewedAt?.toISOString() ?? 'N/A'],
  ];

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}
