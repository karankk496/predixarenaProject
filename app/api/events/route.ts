import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
  'Science'
] as const;

export async function GET(request: Request) {
  try {
    // Get the status from URL query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build the where clause based on status
    const where = status ? { status: status.toLowerCase() } : {};

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        votes: true
      }
    });

    return NextResponse.json({
      success: true,
      events,
      total: events.length
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received event creation request:', body);

    // Convert category to proper case (first letter uppercase, rest lowercase)
    const formattedCategory = body.category.charAt(0).toUpperCase() + 
                            body.category.slice(1).toLowerCase();

    // Validate category
    if (!VALID_CATEGORIES.includes(formattedCategory)) {
      return NextResponse.json({
        success: false,
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      }, { status: 400 });
    }

    // First check if the event already exists to prevent duplicates
    const existingEvent = await prisma.event.findFirst({
      where: {
      title: body.title,
      category: formattedCategory
      }
    });

    if (existingEvent) {
      console.log(`Duplicate event attempt: "${body.title}" in category "${formattedCategory}"`);
      return NextResponse.json(
      {
        success: false,
        error: `Duplicate Event: An event titled "${body.title}" already exists in the "${formattedCategory}" category.`,
        code: 'DUPLICATE_EVENT'
      },
      { status: 409 } // Using 409 Conflict for duplicate resources
      );
    }

    const event = await prisma.event.create({
      data: {
      title: body.title,
      description: body.description,
      category: formattedCategory,
      outcome1: body.outcome1,
      outcome2: body.outcome2,
      resolutionSource: body.resolutionSource,
      resolutionDateTime: new Date(body.resolutionDateTime),
      status: "pending", // Ensure this matches exactly with what we query
      outcome1Votes: 0,
      outcome2Votes: 0
      },
      include: {
      votes: true,
      },
    });

    console.log('Created new event:', event); // Add debug log

    return NextResponse.json({
      success: true,
      data: event,
      message: `Event "${body.title}" created successfully!`
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Duplicate Event: An event with this title and category already exists.',
          code: 'DUPLICATE_EVENT'
        }, { status: 409 }); // Conflict status code
      }
      
      // Handle other Prisma validation errors
      return NextResponse.json({
        success: false,
        error: 'Invalid data provided. Please check your input.',
        code: 'INVALID_DATA'
      }, { status: 400 }); // Bad Request
    }
    
    // Unexpected errors
    console.error('Unexpected server error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create event. Please try again later.',
      code: 'INTERNAL_ERROR'
    }, { status: 500 }); // Internal Server Error
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;


