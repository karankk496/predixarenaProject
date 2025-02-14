import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to vote' },
        { status: 401 }
      );
    }

    const { eventId, outcome } = await request.json();

    if (!eventId || !outcome) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if event exists and hasn't ended
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (new Date(event.resolutionDateTime) < new Date()) {
      return NextResponse.json(
        { error: 'Event has ended' },
        { status: 400 }
      );
    }

    try {
      // Use upsert to handle both create and update cases
      const vote = await prisma.vote.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId: session.user.id,
          },
        },
        update: {
          outcome, // Update the outcome if vote exists
        },
        create: {
          eventId,
          userId: session.user.id,
          outcome,
        },
      });

      // Update event vote counts
      await prisma.event.update({
        where: { id: eventId },
        data: {
          outcome1Votes: await prisma.vote.count({
            where: {
              eventId,
              outcome: 'outcome1',
            },
          }),
          outcome2Votes: await prisma.vote.count({
            where: {
              eventId,
              outcome: 'outcome2',
            },
          }),
        },
      });

      return NextResponse.json({ 
        success: true, 
        vote,
        message: 'Vote recorded successfully' 
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'You have already voted for this event' },
            { status: 409 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process vote' },
      { status: 500 }
    );
  }
} 