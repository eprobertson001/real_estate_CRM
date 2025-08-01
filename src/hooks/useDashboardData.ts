'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

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
  const query = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      console.log('🔍 Starting dashboard fetch...');
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      console.log('📡 Fetch response:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Data parsed successfully:', data);
      return data;
    },
    retry: 1,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Debug logging
  useEffect(() => {
    console.log('🔄 Query state updated:', {
      status: query.status,
      isLoading: query.isLoading,
      isError: query.isError,
      data: !!query.data,
      error: query.error?.message,
    });
  }, [query.status, query.isLoading, query.isError, query.data, query.error]);

  return query;
}
