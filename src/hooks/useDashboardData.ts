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
      console.log('🔍 Fetching dashboard data...');
      try {
        const response = await fetch('/api/dashboard');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          console.error('❌ Response not ok:', response.status, response.statusText);
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        console.log('✅ Dashboard data received:', data);
        return data;
      } catch (error) {
        console.error('🚨 Error fetching dashboard data:', error);
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}
