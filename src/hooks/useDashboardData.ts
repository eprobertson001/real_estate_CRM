'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalTransactions: number;
  activeTransactions: number;
  pendingTasks: number;
  tasksThisWeek: number;
  upcomingClosings: number;
  monthlyRevenue: number;
  revenueChange: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  } | null;
  transaction: {
    propertyAddress: string;
    price: number;
  } | null;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}
