import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Enable dynamic API route
export const dynamic = 'force-dynamic';

// Handle PATCH requests
export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    if (!params.eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const { status } = await request.json();

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be "approved" or "rejected"' 
      }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: params.eventId
      },
      data: {
        status: status
      }
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent
    });

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update event status' 
    }, { status: 500 });
  }
} 