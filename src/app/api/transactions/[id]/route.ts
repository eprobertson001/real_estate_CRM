import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { createdAt, updatedAt, primaryAgent, tasks, ...updateData } = body;

    // Convert date strings to Date objects if they exist
    if (updateData.closingDate) {
      updateData.closingDate = new Date(updateData.closingDate);
    }
    if (updateData.contractDate) {
      updateData.contractDate = new Date(updateData.contractDate);
    }
    if (updateData.listingDate) {
      updateData.listingDate = new Date(updateData.listingDate);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
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
      }
    });

    return NextResponse.json({ transaction: updatedTransaction });

  } catch (error) {
    console.error('Transaction Update API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        primaryAgent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            priority: true,
            status: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });

  } catch (error) {
    console.error('Transaction Get API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}
