// Goal Tracking Component

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import type { TimePeriod } from '@/actions/analytics';

export type GoalType = 'contactSubmit' | 'newsletterSignup' | 'projectClick' | 'blogReadComplete' | 'custom';

interface GoalData {
  goalType: string;
  total: number;
  completed: number;
  conversionRate: number;
}

interface FunnelStep {
  name: string;
  value: number;
  conversion?: number;
}

interface GoalTrackingProps {
  initialGoals?: GoalData[];
  period?: TimePeriod;
}

const PREDEFINED_GOALS: Record<string, {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  contactSubmit: {
    name: 'Formulaire de contact',
    description: 'Visiteurs ayant soumis le formulaire de contact',
    icon: Target,
    color: 'bg-violet-500',
  },
  newsletterSignup: {
    name: 'Inscription newsletter',
    description: 'Visiteurs inscrits à la newsletter',
    icon: Users,
    color: 'bg-blue-500',
  },
  projectClick: {
    name: 'Clics sur projets',
    description: 'Visiteurs ayant cliqué sur un projet',
    icon: TrendingUp,
    color: 'bg-cyan-500',
  },
  blogReadComplete: {
    name: 'Articles lus complètement',
    description: 'Visiteurs ayant lu 75%+ d\'un article',
    icon: CheckCircle2,
    color: 'bg-emerald-500',
  },
  custom: {
    name: 'Personnalisé',
    description: 'Objectif personnalisé',
    icon: AlertCircle,
    color: 'bg-slate-500',
  },
};

export function GoalTracking({ initialGoals = [], period = 'month' }: GoalTrackingProps) {
  const [goals, setGoals] = useState<GoalData[]>(initialGoals);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [customGoalName, setCustomGoalName] = useState('');
  const [customGoalType, setCustomGoalType] = useState<string>('pageView');

  useEffect(() => {
    fetchGoals();
  }, [period]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/analytics/goals?period=${period}`);
      const data = await response.json();
      setGoals(data);
    } catch {
      // Error handling
    }
  };

  // Calculate funnel data based on selected goal
  const getFunnelData = (): FunnelStep[] => {
    const totalViews = 1000; // This would come from actual data

    switch (selectedGoal) {
      case 'contactSubmit':
        return [
          { name: 'Visiteurs', value: totalViews },
          { name: 'Vu page contact', value: Math.round(totalViews * 0.3), conversion: 30 },
          { name: 'Commencé formulaire', value: Math.round(totalViews * 0.15), conversion: 50 },
          { name: 'Soumis', value: Math.round(totalViews * 0.05), conversion: 33 },
        ];
      case 'newsletterSignup':
        return [
          { name: 'Visiteurs', value: totalViews },
          { name: 'Vu formulaire', value: Math.round(totalViews * 0.4), conversion: 40 },
          { name: 'Email saisi', value: Math.round(totalViews * 0.25), conversion: 62 },
          { name: 'Inscrit', value: Math.round(totalViews * 0.08), conversion: 32 },
        ];
      case 'projectClick':
        return [
          { name: 'Visiteurs', value: totalViews },
          { name: 'Vu page projets', value: Math.round(totalViews * 0.5), conversion: 50 },
          { name: 'Clic sur projet', value: Math.round(totalViews * 0.3), conversion: 60 },
        ];
      case 'blogReadComplete':
        return [
          { name: 'Visiteurs article', value: totalViews },
          { name: 'Scroll 25%', value: Math.round(totalViews * 0.7), conversion: 70 },
          { name: 'Scroll 50%', value: Math.round(totalViews * 0.5), conversion: 71 },
          { name: 'Scroll 75%', value: Math.round(totalViews * 0.35), conversion: 70 },
          { name: 'Lu complètement', value: Math.round(totalViews * 0.2), conversion: 57 },
        ];
      default:
        return [
          { name: 'Visiteurs', value: totalViews },
          { name: 'Engagés', value: Math.round(totalViews * 0.5), conversion: 50 },
        ];
    }
  };

  // Get goal progress over time
  const getGoalProgressData = () => {
    // Mock data - in production this would come from the API
    return [
      { period: 'Lun 1', objectifs: 5, complétés: 2 },
      { period: 'Lun 2', objectifs: 8, complétés: 4 },
      { period: 'Lun 3', objectifs: 6, complétés: 3 },
      { period: 'Lun 4', objectifs: 10, complétés: 6 },
      { period: 'Lun 5', objectifs: 12, complétés: 8 },
      { period: 'Lun 6', objectifs: 9, complétés: 5 },
      { period: 'Lun 7', objectifs: 15, complétés: 10 },
    ];
  };

  // Get attribution data
  const getAttributionData = () => {
    return [
      { source: 'Organic', conversions: 45 },
      { source: 'Direct', conversions: 32 },
      { source: 'Social', conversions: 28 },
      { source: 'Referral', conversions: 15 },
      { source: 'Email', conversions: 12 },
    ];
  };

  const handleCreateGoal = async () => {
    try {
      const response = await fetch('/api/analytics/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customGoalName,
          type: customGoalType,
        }),
      });

      if (response.ok) {
        setIsCreatingGoal(false);
        setCustomGoalName('');
        fetchGoals();
      }
    } catch {
      // Error handling
    }
  };

  const getOverallConversionRate = () => {
    if (goals.length === 0) return 0;
    const totalRate = goals.reduce((sum, g) => sum + g.conversionRate, 0);
    return totalRate / goals.length;
  };

  const funnelData = getFunnelData();
  const progressData = getGoalProgressData();
  const attributionData = getAttributionData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Suivi des objectifs</h2>
          <p className="mt-1 text-sm text-slate-400">Suivez vos taux de conversion et entonnoirs</p>
        </div>

        <Dialog open={isCreatingGoal} onOpenChange={setIsCreatingGoal}>
          <DialogTrigger asChild>
            <Button className="bg-violet-500 text-white hover:bg-violet-600">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel objectif
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Créer un objectif personnalisé</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-name" className="text-slate-300">Nom de l'objectif</Label>
                <Input
                  id="goal-name"
                  value={customGoalName}
                  onChange={(e) => setCustomGoalName(e.target.value)}
                  placeholder="Ex: Téléchargement ebook"
                  className="mt-2 bg-slate-800 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="goal-type" className="text-slate-300">Type d'événement</Label>
                <Select value={customGoalType} onValueChange={setCustomGoalType}>
                  <SelectTrigger className="mt-2 bg-slate-800 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="pageView">Page vue</SelectItem>
                    <SelectItem value="click">Clic</SelectItem>
                    <SelectItem value="formSubmit">Soumission formulaire</SelectItem>
                    <SelectItem value="custom">Événement personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateGoal}
                disabled={!customGoalName}
                className="w-full bg-violet-500 text-white hover:bg-violet-600"
              >
                Créer l'objectif
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
              <Target className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Taux de conversion global</p>
              <p className="mt-1 text-2xl font-bold text-white">{getOverallConversionRate().toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Objectifs complétés</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {goals.reduce((sum, g) => sum + g.completed, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total conversions</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {goals.reduce((sum, g) => sum + g.total, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <TrendingUp className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Objectifs actifs</p>
              <p className="mt-1 text-2xl font-bold text-white">{goals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PREDEFINED_GOALS).map(([key, goal]) => {
          const Icon = goal.icon;
          const goalData = goals.find((g) => g.goalType === key);
          const rate = goalData?.conversionRate ?? 0;

          return (
            <button
              key={key}
              onClick={() => setSelectedGoal(key as GoalType)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedGoal === key
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-slate-900/50 hover:border-white/20'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${goal.color}/20`}>
                  <Icon className={`h-5 w-5 ${goal.color.replace('bg-', 'text-')}`} />
                </div>
                <Badge variant="outline" className="bg-slate-800 text-slate-300">
                  {rate.toFixed(1)}%
                </Badge>
              </div>
              <h3 className="font-medium text-white">{goal.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{goal.description}</p>
            </button>
          );
        })}
      </div>

      {/* Detailed Analysis */}
      {selectedGoal && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-slate-900/50 p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Entonnoir de conversion - {PREDEFINED_GOALS[selectedGoal]?.name}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string, props: any) => [
                value,
                name,
                props.payload.conversion ? `(${props.payload.conversion}% conversion)` : '',
              ]}
                />
                <Funnel
                  data={funnelData}
                  dataKey="value"
                  isAnimationActive
                >
                  <LabelList
                    dataKey="name"
                    position="center"
                    fill="#fff"
                    fontSize={12}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-white/10 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Progression sur 7 jours</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="period" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="objectifs" fill="#8b5cf6" name="Objectifs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="complétés" fill="#10b981" name="Complétés" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="border-white/10 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Attribution par source</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attributionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="source" type="category" width={80} stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="conversions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {/* All Goals Table */}
      <Card className="border-white/10 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Tous les objectifs</h3>
        <div className="space-y-3">
          {goals.map((goal) => {
            const predefined = Object.entries(PREDEFINED_GOALS).find(([key]) => key === goal.goalType);
            const name = predefined?.[1].name ?? goal.goalType;

            return (
              <div
                key={goal.goalType}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-800/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{name}</span>
                  <Badge variant="outline" className="bg-slate-700 text-slate-300">
                    {goal.goalType}
                  </Badge>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">{goal.completed}</p>
                    <p className="text-xs text-slate-500">Complétés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">{goal.total}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">{goal.conversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500">Taux</p>
                  </div>
                  <div className="h-8 w-24">
                    <div className="h-full rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ width: `${Math.min(goal.conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
