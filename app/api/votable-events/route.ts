import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('Fetching votable events');
    
    const events = await prisma.event.findMany({
      where: {
        status: 'approved',
        resolutionDateTime: {
          gt: new Date(), // Only get events that haven't ended
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${events.length} votable events`);
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching votable events:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 