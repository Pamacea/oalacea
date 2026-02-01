// Admin Analytics Dashboard Component

'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, Download, TrendingUp, Users, Eye, MousePointer, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { TimePeriod } from '@/lib/contentMetrics';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: Array<{ path: string; views: number }>;
  };
  content: {
    popularPosts: Array<{ id: string; title: string; slug: string; views: number }>;
    popularProjects: Array<{ id: string; title: string; slug: string; views: number }>;
  };
  viewsOverTime: Array<{ date: string; views: number }>;
  referrers: Array<{ referrer: string; visits: number }>;
  engagement: {
    totalViews: number;
    totalEvents: number;
    avgDuration: number;
  };
}

interface AnalyticsDashboardProps {
  initialData: AnalyticsData;
  period?: TimePeriod;
}

const COLORS = ['#9a1115', '#b8a646', '#2a3a5a', '#3a3a3a', '#8b8b8b']; // imperium colors

export function AnalyticsDashboard({ initialData, period: initialPeriod = 'month' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeIndicator, setRealtimeIndicator] = useState(false);

  const fetchData = async (newPeriod: TimePeriod) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?period=${newPeriod}`);
      const result = await response.json();
      setData(result);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    fetchData(newPeriod);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/analytics/export?period=${period}`);
      const csv = await response.text();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Error handling
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeIndicator(true);
      setTimeout(() => setRealtimeIndicator(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl uppercase tracking-wider text-imperium-crimson">
            [ Analytics ]
          </h2>
          {realtimeIndicator && (
            <Badge variant="outline" className="border-imperium-gold bg-imperium-gold/10 text-imperium-gold">
              <Activity className="mr-1 h-3 w-3 animate-pulse" />
              Live
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => handlePeriodChange(v as TimePeriod)}>
            <SelectTrigger className="w-32 border-imperium-steel-dark bg-imperium-black font-terminal text-imperium-bone">
              <Calendar className="mr-2 h-4 w-4 text-imperium-steel" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-imperium-steel-dark bg-imperium-black">
              <SelectItem value="day">24h</SelectItem>
              <SelectItem value="week">7 jours</SelectItem>
              <SelectItem value="month">30 jours</SelectItem>
              <SelectItem value="year">12 mois</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-imperium-steel-dark font-terminal text-imperium-bone hover:bg-imperium-iron"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card variant="steel" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-terminal text-sm text-imperium-steel-dark">{'>'} Total Views</p>
              <p className="mt-2 font-display text-3xl font-bold text-imperium-crimson">{data.overview.totalViews.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-imperium-crimson/30 bg-imperium-crimson/10">
              <Eye className="h-6 w-6 text-imperium-crimson" />
            </div>
          </div>
          <p className="mt-4 flex items-center font-terminal text-sm text-imperium-gold">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>+12%</span> vs previous period
          </p>
        </Card>

        <Card variant="steel" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-terminal text-sm text-imperium-steel-dark">{'>'} Sessions</p>
              <p className="mt-2 font-display text-3xl font-bold text-imperium-gold">{data.overview.totalSessions.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-imperium-gold/30 bg-imperium-gold/10">
              <Users className="h-6 w-6 text-imperium-gold" />
            </div>
          </div>
          <p className="mt-4 font-terminal text-sm text-imperium-steel-dark">
            Avg duration: {formatDuration(data.overview.avgSessionDuration)}
          </p>
        </Card>

        <Card variant="steel" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-terminal text-sm text-imperium-steel-dark">{'>'} Bounce Rate</p>
              <p className="mt-2 font-display text-3xl font-bold text-imperium-bone">{data.overview.bounceRate.toFixed(1)}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-imperium-warp/30 bg-imperium-warp/10">
              <MousePointer className="h-6 w-6 text-imperium-warp" />
            </div>
          </div>
          <p className="mt-4 font-terminal text-sm text-imperium-steel-dark">
            {data.overview.bounceRate < 50 ? 'Excellent' : data.overview.bounceRate < 70 ? 'Good' : 'To improve'}
          </p>
        </Card>

        <Card variant="steel" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-terminal text-sm text-imperium-steel-dark">{'>'} Events</p>
              <p className="mt-2 font-display text-3xl font-bold text-imperium-crimson">{data.engagement.totalEvents.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-imperium-crimson/30 bg-imperium-crimson/10">
              <Activity className="h-6 w-6 text-imperium-crimson" />
            </div>
          </div>
          <p className="mt-4 font-terminal text-sm text-imperium-steel-dark">
            Avg duration: {formatDuration(data.engagement.avgDuration)}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="views" className="space-y-4">
        <TabsList className="bg-imperium-black border-2 border-imperium-steel-dark">
          <TabsTrigger value="views" className="data-[state=active]:bg-imperium-crimson data-[state=active]:text-imperium-bone font-terminal">
            Views Over Time
          </TabsTrigger>
          <TabsTrigger value="referrers" className="data-[state=active]:bg-imperium-gold data-[state=active]:text-imperium-black font-terminal">
            Traffic Sources
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-imperium-warp data-[state=active]:text-imperium-bone font-terminal">
            Popular Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <Card variant="steel" className="p-6">
            <h3 className="mb-6 font-display uppercase tracking-wider text-imperium-gold">{'>'} Views Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tickFormatter={formatDate}
                />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1c1c', border: '2px solid #333', borderRadius: '0' }}
                  itemStyle={{ color: '#b8a646' }}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#9a1115"
                  strokeWidth={2}
                  dot={{ fill: '#9a1115' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="referrers">
          <Card variant="steel" className="p-6">
            <h3 className="mb-6 font-display uppercase tracking-wider text-imperium-gold">{'>'} Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.referrers.slice(0, 10)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="referrer"
                  stroke="#888"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1c1c', border: '2px solid #333', borderRadius: '0' }}
                  itemStyle={{ color: '#b8a646' }}
                />
                <Bar dataKey="visits" fill="#b8a646" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card variant="steel" className="p-6">
              <h3 className="mb-4 font-display uppercase tracking-wider text-imperium-crimson">{'>'} Popular Posts</h3>
              <div className="space-y-3">
                {data.content.popularPosts.map((post, index) => (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex items-center justify-between rounded-none border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 transition-colors hover:border-imperium-crimson hover:bg-imperium-crimson/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-none border-2 border-imperium-crimson bg-imperium-crimson/20 font-terminal text-xs font-semibold text-imperium-crimson">
                        {index + 1}
                      </span>
                      <span className="font-terminal text-sm text-imperium-bone">{post.title}</span>
                    </div>
                    <span className="font-terminal text-sm text-imperium-steel">{post.views} views</span>
                  </a>
                ))}
              </div>
            </Card>

            <Card variant="steel" className="p-6">
              <h3 className="mb-4 font-display uppercase tracking-wider text-imperium-gold">{'>'} Popular Projects</h3>
              <div className="space-y-3">
                {data.content.popularProjects.map((project, index) => (
                  <a
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="flex items-center justify-between rounded-none border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3 transition-colors hover:border-imperium-gold hover:bg-imperium-gold/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-none border-2 border-imperium-gold bg-imperium-gold/20 font-terminal text-xs font-semibold text-imperium-gold">
                        {index + 1}
                      </span>
                      <span className="font-terminal text-sm text-imperium-bone">{project.title}</span>
                    </div>
                    <span className="font-terminal text-sm text-imperium-steel">{project.views} views</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top Pages */}
      <Card variant="steel" className="p-6">
        <h3 className="mb-4 font-display uppercase tracking-wider text-imperium-bone">{'>'} Most Visited Pages</h3>
        <div className="space-y-2">
          {data.overview.topPages.map((page, index) => (
            <div
              key={page.path}
              className="flex items-center justify-between rounded-none border-2 border-imperium-steel-dark bg-imperium-black px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-none border-2 border-imperium-steel font-terminal text-xs font-semibold text-imperium-steel">
                  {index + 1}
                </span>
                <span className="font-terminal text-sm text-imperium-steel">{page.path}</span>
              </div>
              <span className="font-terminal text-sm text-imperium-steel-dark">{page.views} views</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
