import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log('Fetching all events for approval...');
    const allEvents = await prisma.event.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        votes: true
      }
    });

    console.log(`Found ${allEvents.length} events`);

    return NextResponse.json({
      success: true,
      data: allEvents,
      total: allEvents.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { eventId, status } = await req.json()

    if (!eventId || !status) {
      return NextResponse.json(
        { error: 'Missing eventId or status' },
        { status: 400 }
      )
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status },
    })

    return NextResponse.json({ 
      success: true,
      event,
      message: `Event ${status} successfully`
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update event' 
      },
      { status: 500 }
    )
  }
} 
