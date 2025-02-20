import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import * as jose from 'jose';

// Define valid categories array for validation
const VALID_CATEGORIES = [
  'Creators',
  'Sports',
  'GlobalElections',
  'Mentions',
  'Politics',
  'Crypto',
  'PopCulture',
  'Business',
  'Science',
  'Technology',
  'Entertainment',
  'Gaming',
  'Music',
  'Movies',
  'TV Shows',
  'Anime',
  'Education'
] as const;

export async function GET(request: Request) {
  try {
    // Get and verify token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'karansingh')

    let payload;
    try {
      const verified = await jose.jwtVerify(token, secret)
      payload = verified.payload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user and check role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the status from URL query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause based on user role
    let where: any = {};

    // Different filtering logic for admin vs other users
    if (user.role === 'ADMIN') {
      // Admin can see all events with optional status filter
      if (status) {
        where.status = status.toLowerCase();
      }
    } else {
      // Non-admin users: show only their events except for approved events
      if (status === 'approved') {
        // For approved events, show all
        where.status = 'approved';
      } else {
        // For other statuses, show only their own events
        where = {
          userId: user.id,
          ...(status ? { status: status.toLowerCase() } : {})
        };
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        votes: true,
        user: {
          select: {
            displayName: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      events,
      total: events.length,
      isAdmin: user.role === 'ADMIN'
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Get and verify token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'karansingh')

    let payload;
    try {
      const verified = await jose.jwtVerify(token, secret)
      payload = verified.payload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Verify user exists (removed admin check)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse and validate event data
    const body = await req.json()
    
    // Convert category to proper case
    const formattedCategory = body.category.charAt(0).toUpperCase() + 
                           body.category.slice(1).toLowerCase();

    // Validate category
    if (!VALID_CATEGORIES.includes(formattedCategory)) {
      return NextResponse.json({
        success: false,
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      }, { status: 400 });
    }

    // Create event with validated data
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        category: formattedCategory,
        outcome1: body.outcome1,
        outcome2: body.outcome2,
        resolutionSource: body.resolutionSource,
        resolutionDateTime: new Date(body.resolutionDateTime),
        status: "pending", // All events start as pending
        outcome1Votes: 0,
        outcome2Votes: 0,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event
    }, { status: 201 })

  } catch (error) {
    console.error('Event creation error:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'An event with this title and category already exists.'
        }, { status: 409 });
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create event. Please try again.' 
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
