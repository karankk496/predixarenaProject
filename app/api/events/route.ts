import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if event already exists
    const existingEvent = await prisma.event.findFirst({
      where: {
        title: body.title,
        category: body.category
      }
    });

    if (existingEvent) {
      return NextResponse.json({
        error: `An event with title "${body.title}" in category "${body.category}" already exists. Please use a different title or category.`
      }, { status: 409 }); // 409 Conflict status code
    }

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        outcome1: body.outcome1,
        outcome2: body.outcome2,
        resolutionSource: body.resolutionSource,
        resolutionDateTime: new Date(body.resolutionDateTime),
        status: 'pending',
        outcome1Votes: 0,
        outcome2Votes: 0
      }
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error('Event creation error:', error);
    
    // Handle Prisma unique constraint error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({
          error: 'An event with this title and category combination already exists. Please use a different title or category.'
        }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to create event. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const events = await prisma.event.findMany({
      where: {
        status: status || undefined
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return events array directly
    return NextResponse.json(events);

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json([], { status: 500 });
  }
}
