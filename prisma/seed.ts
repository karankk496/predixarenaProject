import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test event
  const testEvent = await prisma.event.create({
    data: {
      title: 'Test Event',
      description: 'This is a test event',
      category: 'test',
      outcome1: 'Yes',
      outcome2: 'No',
      resolutionSource: 'Test Source',
      resolutionDateTime: new Date('2025-01-01'),
      status: 'pending'
    },
  });

  console.log('Created test event:', testEvent);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 