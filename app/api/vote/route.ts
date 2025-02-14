import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received vote request:', body);

    const { eventId, outcome } = body;

    // Validate input
    if (!eventId || !outcome) {
      console.log('Missing required fields:', { eventId, outcome });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      console.log('Event not found:', eventId);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    console.log('Found event:', existingEvent);

    // Update the event with the new vote
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(outcome === 'outcome1' 
          ? { outcome1Votes: { increment: 1 } }
          : { outcome2Votes: { increment: 1 } }
        )
      },
      include: {
        votes: true
      }
    });

    console.log('Updated event:', updatedEvent);

    return NextResponse.json({ 
      success: true, 
      event: updatedEvent 
    });

  } catch (error) {
    console.error('Detailed vote error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to vote' },
      { status: 500 }
    );
  }
}

// Add a route to check if user has voted
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!eventId || !userId) {
    return NextResponse.json({ hasVoted: false });
  }

  try {
    const vote = await db.vote.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    return NextResponse.json({
      hasVoted: !!vote,
      votedFor: vote?.outcome
    });
  } catch (error) {
    return NextResponse.json({ hasVoted: false });
  }
} 