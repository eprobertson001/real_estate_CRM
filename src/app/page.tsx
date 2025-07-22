'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import NewTransactionModal from '@/components/NewTransactionModal';

export default function HomePage() {
  const { data, isLoading, error } = useDashboardData();
  const router = useRouter();
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error loading dashboard
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
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
    </div>
  );
}
