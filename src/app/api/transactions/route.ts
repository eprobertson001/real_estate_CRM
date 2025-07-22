import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        primaryAgent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED']
            }
          },
          select: {
            id: true,
            title: true,
            dueDate: true,
            priority: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Transactions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get the first user as primary agent (for demo purposes)
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      return NextResponse.json(
        { error: 'No users found in the system' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        propertyAddress: `${body.address}, ${body.city}, ${body.state} ${body.zipCode}`,
        price: body.listPrice || body.salePrice || 0,
        commissionPercent: 2.5, // Default commission percentage
        propertyType: body.propertyType || 'Residential',
        status: body.status?.toUpperCase() || 'ACTIVE',
        closingDate: body.closingDate ? new Date(body.closingDate) : null,
        primaryAgentId: firstUser.id,
      },
      include: {
        primaryAgent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: true
      }
    });

    return NextResponse.json({ transaction });

  } catch (error) {
    console.error('Create Transaction API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
