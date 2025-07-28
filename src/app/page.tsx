'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState, useEffect } from 'react';
import NewTransactionModal from '@/components/NewTransactionModal';
import { ScrollManager } from '@/lib/scrollManager';

export default function HomePage() {
  const { data, isLoading, error } = useDashboardData();
  const router = useRouter();
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  console.log('🏠 HomePage render - isLoading:', isLoading, 'error:', error, 'data:', data);

  // Add a timeout fallback for debugging
  const [showFallback, setShowFallback] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Loading taking too long, showing fallback...');
        setShowFallback(true);
      }
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (error || showFallback) {
    console.log('🔧 Showing fallback due to error or timeout');
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
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error instanceof Error ? error.message : 'Something went wrong'}
              </div>
            )}
            {showFallback && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                Dashboard is taking longer than expected to load. Showing fallback view.
              </div>
            )}
          </div>

          {/* Status Cards - Default Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/transactions')}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Transactions</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">Click to view all</p>
            </div>
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/tasks')}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h3>
              <p className="text-3xl font-bold text-orange-600">0</p>
              <p className="text-sm text-gray-500">0 due this week</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-green-600">$0</p>
              <p className="text-sm text-green-500">+0% from last month</p>
            </div>
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/calendar')}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Closings</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
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
            <p className="text-gray-500 text-center py-8">
              No recent activity. Start by creating a new transaction or task.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500">
            <p>🏠 Your Real Estate CRM is ready for development!</p>
            <p className="text-sm mt-2">
              ✅ Database configured • ✅ Authentication ready • ✅ API integrations prepared
            </p>
          </div>
        </div>

        {/* New Transaction Modal */}
        <NewTransactionModal
          isOpen={isNewTransactionModalOpen}
          onClose={() => setIsNewTransactionModalOpen(false)}
          redirectToTransactions={true}
        />
      </div>
    );
  }

  if (isLoading) {
    console.log('⏳ Showing loading spinner...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </p>
            <p className={`text-sm ${
              (stats?.revenueChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
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
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {activity.user?.name || activity.user?.email}
                      </span>{' '}
                      {activity.description}
                      {activity.transaction && (
                        <span className="text-gray-600">
                          {' '}for {activity.transaction.propertyAddress}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity.createdAt)}
                    </p>
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

      {/* New Transaction Modal */}
      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        redirectToTransactions={true}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => ScrollManager.scrollToTop()}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
