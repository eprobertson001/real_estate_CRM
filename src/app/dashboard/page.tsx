'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalTransactions: number;
  activeTransactions: number;
  pendingTasks: number;
  tasksThisWeek: number;
  upcomingClosings: number;
  monthlyRevenue: number;
  revenueChange: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        console.log('📊 Fetching dashboard data directly...');
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Dashboard data loaded:', data);
        setStats(data.stats);
        setLoading(false);
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Fetching your real estate data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Real Estate CRM Dashboard</h1>
          <p className="text-gray-600">Manage your real estate business efficiently</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalTransactions || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Deals</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.activeTransactions || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingTasks || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue) : '$0'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => router.push('/transactions')}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              📋 View Transactions
            </Button>
            <Button 
              onClick={() => router.push('/tasks')}
              variant="outline"
              className="w-full"
            >
              ✅ Manage Tasks  
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              🔄 Refresh Data
            </Button>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tasks Due:</span>
                <span className="font-semibold">{stats?.tasksThisWeek || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upcoming Closings:</span>
                <span className="font-semibold">{stats?.upcomingClosings || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Change:</span>
                <span className={`font-semibold ${(stats?.revenueChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.revenueChange || 0) >= 0 ? '+' : ''}{stats?.revenueChange || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>🏠 Real Estate CRM Dashboard</p>
          <p className="text-sm mt-2">
            ✅ Database Active • ✅ API Connected • ✅ Ready for Business
          </p>
        </div>
      </div>
    </div>
  );
}
