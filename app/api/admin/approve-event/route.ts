import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    console.log('Fetching all events for approval...');
    const allEvents = await prisma.event.findMany({
      where: {
        status: "pending"
      },
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

    // Verify the event exists first
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    console.log('Existing event:', existingEvent)

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Update the event
    const event = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    })

    console.log(`Successfully ${status} event:`, event)
    
    return NextResponse.json({ 
      success: true,
      event,
      message: `Event ${status} successfully`
    })
  } catch (error) {
    // Enhanced error logging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      error,
    })

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code)
      return NextResponse.json(
        { 
          error: "Database error", 
          code: error.code,
          message: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update event",
        details: error instanceof Error ? error.message : "Unknown error",
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 