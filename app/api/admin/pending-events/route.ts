import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching pending events...');
    
    const events = await prisma.event.findMany({
      where: {
        status: "pending"  // Only fetch pending events
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found pending events:', events);

    return NextResponse.json({
      success: true,
      events: events
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending events' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 