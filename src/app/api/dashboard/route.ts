import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current date for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for better performance
    const [
      totalTransactions,
      activeTransactions,
      pendingTasks,
      upcomingClosings,
      currentMonthTransactions,
      lastMonthTransactions,
      recentActivities
    ] = await Promise.all([
      // Total transactions
      prisma.transaction.count(),

      // Active transactions (not closed, cancelled, or expired)
      prisma.transaction.count({
        where: {
          status: {
            notIn: ['CLOSED', 'CANCELLED', 'EXPIRED']
          }
        }
      }),

      // Pending tasks (not completed or cancelled)
      prisma.task.count({
        where: {
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        }
      }),

      // Upcoming closings (next 30 days)
      prisma.transaction.count({
        where: {
          closingDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          },
          status: {
            notIn: ['CLOSED', 'CANCELLED', 'EXPIRED']
          }
        }
      }),

      // Current month closed transactions for revenue
      prisma.transaction.findMany({
        where: {
          status: 'CLOSED',
          closingDate: {
            gte: startOfMonth,
            lte: now
          }
        },
        select: {
          price: true,
          commissionPercent: true
        }
      }),

      // Last month closed transactions for comparison
      prisma.transaction.findMany({
        where: {
          status: 'CLOSED',
          closingDate: {
            gte: lastMonth,
            lte: endOfLastMonth
          }
        },
        select: {
          price: true,
          commissionPercent: true
        }
      }),

      // Recent activities (last 10)
      prisma.activity.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          transaction: {
            select: {
              propertyAddress: true,
              price: true
            }
          }
        }
      })
    ]);

    // Calculate monthly revenue
    const currentMonthRevenue = currentMonthTransactions.reduce(
      (total, transaction) => total + (transaction.price * transaction.commissionPercent / 100),
      0
    );

    const lastMonthRevenue = lastMonthTransactions.reduce(
      (total, transaction) => total + (transaction.price * transaction.commissionPercent / 100),
      0
    );

    // Calculate percentage change
    const revenueChange = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Get tasks due this week
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tasksThisWeek = await prisma.task.count({
      where: {
        dueDate: {
          gte: now,
          lte: weekFromNow
        },
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalTransactions,
        activeTransactions,
        pendingTasks,
        tasksThisWeek,
        upcomingClosings,
        monthlyRevenue: currentMonthRevenue,
        revenueChange: Math.round(revenueChange * 100) / 100
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        createdAt: activity.createdAt,
        user: activity.user,
        transaction: activity.transaction
      }))
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
