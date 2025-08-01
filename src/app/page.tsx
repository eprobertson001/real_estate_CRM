'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import NewTransactionModal from '@/components/NewTransactionModal';

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

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch dashboard data directly without React Query
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🔍 Fetching dashboard data...');
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        console.log('📡 Dashboard API response:', response.status, response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const dashboardData = await response.json();
        console.log('✅ Dashboard data loaded:', dashboardData);
        
        setData(dashboardData);
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Getting your latest data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Real Estate CRM
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to your comprehensive real estate business management system.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/transactions')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Transactions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.activeTransactions || 0}</p>
            <p className="text-sm text-gray-500">Click to view all</p>
          </div>
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/tasks')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.pendingTasks || 0}</p>
            <p className="text-sm text-gray-500">{stats?.tasksThisWeek || 0} due this week</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
            <p className={`text-sm ${(stats?.revenueChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(stats?.revenueChange || 0) >= 0 ? '+' : ''}{stats?.revenueChange || 0}% from last month
            </p>
          </div>
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/calendar')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Closings</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.upcomingClosings || 0}</p>
            <p className="text-sm text-gray-500">Next 30 days</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + New Transaction
            </Button>
            <Button 
              onClick={() => router.push('/tasks/new')}
              className="bg-green-600 hover:bg-green-700"
            >
              + Add Task
            </Button>
            <Button 
              onClick={() => router.push('/email')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              📧 Send Email
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {activity.type === 'transaction' ? '🏠' : 
                         activity.type === 'task' ? '✅' : 
                         activity.type === 'document' ? '📄' : '📝'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user?.name || activity.user?.email} • {formatDate(activity.createdAt)}
                    </p>
                    {activity.transaction && (
                      <p className="text-xs text-blue-600">
                        {activity.transaction.propertyAddress} • {formatCurrency(activity.transaction.price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No recent activity. Start by creating a new transaction or task.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>🏠 Your Real Estate CRM is ready for development!</p>
          <p className="text-sm mt-2">
            ✅ Database configured • ✅ Authentication ready • ✅ API integrations prepared
          </p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}

      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        redirectToTransactions={true}
      />
    </div>
  );
}
