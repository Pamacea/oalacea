// Admin types
export interface StatCard {
  label: string;
  value: number;
  href: string;
  icon: 'pen-tool' | 'folder-open' | 'bar-chart' | 'users' | 'activity';
  color?: string;
  bgColor?: string;
  borderColor?: string;
}

export interface QuickAction {
  href: string;
  title: string;
  description: string;
  icon?: 'skull' | 'zap' | 'plus';
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
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// Admin dashboard data
export interface AdminDashboardData {
  stats: StatCard[];
  recentPosts: DashboardPostItem[];
  recentProjects: DashboardProjectItem[];
}
