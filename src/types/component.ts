// Admin types
export interface StatCard {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
}

export interface QuickAction {
  href: string;
  title: string;
  description: string;
}

// Dashboard list items (simplified versions for dashboard display)
export interface DashboardPostItem {
  id: string;
  title: string;
  createdAt: Date;
}

export interface DashboardProjectItem {
  id: string;
  title: string;
  year: number;
  category: string;
}

// Admin dashboard data
export interface AdminDashboardData {
  stats: StatCard[];
  recentPosts: DashboardPostItem[];
  recentProjects: DashboardProjectItem[];
}
