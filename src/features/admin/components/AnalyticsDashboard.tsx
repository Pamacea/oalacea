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

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

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
          <h2 className="text-2xl font-bold text-zinc-100">Analytics</h2>
          {realtimeIndicator && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Activity className="mr-1 h-3 w-3 animate-pulse" />
              Live
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => handlePeriodChange(v as TimePeriod)}>
            <SelectTrigger className="w-32 bg-zinc-800 border-zinc-800 text-zinc-100">
              <Calendar className="mr-2 h-4 w-4 text-zinc-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-800">
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
            className="border-zinc-800 text-zinc-100 hover:bg-white/5"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Vues totales</p>
              <p className="mt-2 text-3xl font-bold text-zinc-100">{data.overview.totalViews.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-500/10">
              <Eye className="h-6 w-6 text-zinc-400" />
            </div>
          </div>
          <p className="mt-4 flex items-center text-sm text-zinc-500">
            <TrendingUp className="mr-1 h-4 w-4 text-green-400" />
            <span className="text-green-400">+12%</span> vs période précédente
          </p>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Sessions</p>
              <p className="mt-2 text-3xl font-bold text-zinc-100">{data.overview.totalSessions.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Durée moyenne: {formatDuration(data.overview.avgSessionDuration)}
          </p>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Taux de rebond</p>
              <p className="mt-2 text-3xl font-bold text-zinc-100">{data.overview.bounceRate.toFixed(1)}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
              <MousePointer className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            {data.overview.bounceRate < 50 ? 'Excellent' : data.overview.bounceRate < 70 ? 'Bon' : 'À améliorer'}
          </p>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Événements</p>
              <p className="mt-2 text-3xl font-bold text-zinc-100">{data.engagement.totalEvents.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Durée moyenne: {formatDuration(data.engagement.avgDuration)}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="views" className="space-y-4">
        <TabsList className="bg-zinc-800/50 border-zinc-800">
          <TabsTrigger value="views" className="data-[state=active]:bg-zinc-500/20">
            Vues dans le temps
          </TabsTrigger>
          <TabsTrigger value="referrers" className="data-[state=active]:bg-zinc-500/20">
            Sources de trafic
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-zinc-500/20">
            Contenu populaire
          </TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <Card className="border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-6 text-lg font-semibold text-zinc-100">Vues au fil du temps</h3>
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
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="referrers">
          <Card className="border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-6 text-lg font-semibold text-zinc-100">Sources de trafic</h3>
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
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="visits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Articles populaires</h3>
              <div className="space-y-3">
                {data.content.popularPosts.map((post, index) => (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-800/30 px-4 py-3 transition-colors hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-500/20 text-xs font-semibold text-zinc-400">
                        {index + 1}
                      </span>
                      <span className="text-sm text-zinc-100">{post.title}</span>
                    </div>
                    <span className="text-sm text-zinc-400">{post.views} vues</span>
                  </a>
                ))}
              </div>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Projets populaires</h3>
              <div className="space-y-3">
                {data.content.popularProjects.map((project, index) => (
                  <a
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-800/30 px-4 py-3 transition-colors hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
                        {index + 1}
                      </span>
                      <span className="text-sm text-zinc-100">{project.title}</span>
                    </div>
                    <span className="text-sm text-zinc-400">{project.views} vues</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top Pages */}
      <Card className="border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Pages les plus visitées</h3>
        <div className="space-y-2">
          {data.overview.topPages.map((page, index) => (
            <div
              key={page.path}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-800/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-300">
                  {index + 1}
                </span>
                <span className="text-sm text-zinc-300">{page.path}</span>
              </div>
              <span className="text-sm text-zinc-400">{page.views} vues</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
