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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add this to explicitly allow public access
export const config = {
  api: {
    bodyParser: true,
  },
};

export async function GET(request: Request) {
  try {
    // Get the status from URL query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    console.log('GET /api/events - Status:', status);

    // For approved events, no authentication needed
    if (status === 'approved') {
      console.log('Fetching approved events');
      try {
        const events = await prisma.event.findMany({
          where: {
            status: 'approved'
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            votes: true,
            user: {
              select: {
                displayName: true,
                image: true
              }
            }
          }
        });

        console.log('Found approved events:', events.length);
        return new NextResponse(JSON.stringify({ 
          success: true, 
          events,
          total: events.length
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        return new NextResponse(JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch approved events',
          details: dbError instanceof Error ? dbError.message : 'Database error'
        }), { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    }

    // For other operations, require authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: 'Authentication required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    const token = authHeader.replace('Bearer ', '')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'karansingh')

    let payload;
    try {
      const verified = await jose.jwtVerify(token, secret)
      payload = verified.payload
    } catch (error) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: 'Invalid token'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    // Get user and check role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string }
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: 'User not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }

    // Build where clause based on user role
    let where: any = {};

    // Different filtering logic for admin vs other users
    if (user.role === 'ADMIN') {
      // Admin can see all events with optional status filter
      if (status && status !== 'all') {
        where.status = status.toLowerCase();
      }
      console.log('Admin query - showing all events with filter:', where);
    } else {
      // Regular users can only see their own events
      where = {
        userId: user.id
      };

      // If status filter is provided
      if (status && status !== 'all') {
        where.status = status.toLowerCase();
      }
      console.log('Regular user query - showing user events only:', where);
    }

    console.log('Final query where clause:', where);

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

    console.log(`Found ${events.length} events for user ${user.id} (role: ${user.role})`);

    return new NextResponse(JSON.stringify({
      success: true,
      events,
      total: events.length,
      isAdmin: user.role === 'ADMIN',
      userRole: user.role
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return new NextResponse(JSON.stringify({ 
      success: false,
      error: "Failed to fetch events",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    // Get and verify token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'karansingh')

    let payload;
    try {
      const verified = await jose.jwtVerify(token, secret)
      payload = verified.payload
    } catch (error) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string }
    })

    if (!user) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate event data
    const body = await req.json()
    
    // Convert category to proper case
    const formattedCategory = body.category.charAt(0).toUpperCase() + 
                           body.category.slice(1).toLowerCase();

    // Validate category
    if (!VALID_CATEGORIES.includes(formattedCategory)) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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

    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Event created successfully',
      event
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Event creation error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NextResponse(JSON.stringify({
          success: false,
          error: 'An event with this title and category already exists.'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new NextResponse(JSON.stringify({ 
      success: false,
      error: 'Failed to create event. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
