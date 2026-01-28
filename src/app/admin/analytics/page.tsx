// Admin Analytics Page

import { getDashboardData } from '@/actions/analytics';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = (searchParams.period as 'day' | 'week' | 'month' | 'year' | 'all') ?? 'month';
  const data = await getDashboardData(period);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="mt-2 text-slate-400">
          Suivi des performances et du comportement des visiteurs
        </p>
      </div>

      <AnalyticsDashboard initialData={data} period={period} />
    </div>
  );
}
