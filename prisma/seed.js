const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      name: 'John Agent',
      role: 'AGENT'
    }
  });

  console.log('✅ Created user:', user.name);

  // Create sample transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        propertyAddress: '123 Main Street, Anytown, CA 90210',
        status: 'ACTIVE',
        price: 750000,
        commissionPercent: 3.0,
        primaryAgentId: user.id,
        propertyType: 'Single Family Home',
        bedrooms: 4,
        bathrooms: 2.5,
        squareFootage: 2200,
        closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        contractDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        propertyAddress: '456 Oak Avenue, Somewhere, CA 90211',
        status: 'UNDER_CONTRACT',
        price: 950000,
        commissionPercent: 2.5,
        primaryAgentId: user.id,
        propertyType: 'Condo',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1800,
        closingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        contractDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      }
    }),
    prisma.transaction.create({
      data: {
        propertyAddress: '789 Pine Street, Elsewhere, CA 90212',
        status: 'CLOSED',
        price: 680000,
        commissionPercent: 3.0,
        primaryAgentId: user.id,
        propertyType: 'Townhouse',
        bedrooms: 3,
        bathrooms: 3,
        squareFootage: 1950,
        closingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        contractDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      }
    })
  ]);

  console.log('✅ Created transactions:', transactions.length);

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Schedule Home Inspection',
        description: 'Coordinate with inspector and buyers for property inspection',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        category: 'Inspection',
        transactionId: transactions[0].id,
        assignedToId: user.id,
        createdById: user.id,
      }
    }),
    prisma.task.create({
      data: {
        title: 'Review Purchase Agreement',
        description: 'Check all terms and conditions in the purchase agreement',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        category: 'Legal',
        transactionId: transactions[1].id,
        assignedToId: user.id,
        createdById: user.id,
      }
    }),
    prisma.task.create({
      data: {
        title: 'Prepare Closing Documents',
        description: 'Gather all required documents for closing',
        status: 'COMPLETED',
        priority: 'HIGH',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        category: 'Closing',
        transactionId: transactions[2].id,
        assignedToId: user.id,
        createdById: user.id,
      }
    }),
    prisma.task.create({
      data: {
        title: 'Follow up with mortgage lender',
        description: 'Check on loan approval status',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        category: 'Financing',
        transactionId: transactions[1].id,
        assignedToId: user.id,
        createdById: user.id,
      }
    })
  ]);

  console.log('✅ Created tasks:', tasks.length);

  // Create sample activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        type: 'CONTRACT_SIGNED',
        description: 'signed the purchase agreement',
        userId: user.id,
        transactionId: transactions[0].id,
      }
    }),
    prisma.activity.create({
      data: {
        type: 'INSPECTION_COMPLETED',
        description: 'completed the home inspection',
        userId: user.id,
        transactionId: transactions[1].id,
      }
    }),
    prisma.activity.create({
      data: {
        type: 'CLOSING_COMPLETED',
        description: 'successfully closed the transaction',
        userId: user.id,
        transactionId: transactions[2].id,
      }
    })
  ]);

  console.log('✅ Created activities:', activities.length);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
