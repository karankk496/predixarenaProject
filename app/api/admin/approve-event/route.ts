import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET

async function verifyAdminAccess() {
  try {
    const headersList = headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET as string) as any

    // Check if user has admin role or is superuser
    return decoded.role === 'ADMIN' || decoded.isSuperUser === true
  } catch (error) {
    console.error('Admin verification error:', error)
    return false
  }
}

export async function GET() {
  try {
    // Verify admin access using token
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    console.log('Fetching all events for approval...')
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
    })

    return NextResponse.json({
      success: true,
      data: allEvents,
      total: allEvents.length
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        data: [],
        total: 0
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verify admin access using token
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { eventId, status } = await request.json()

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

    return NextResponse.json({ 
      success: true,
      event,
      message: `Event ${status} successfully`
    })
  } catch (error) {
    console.error('Error updating event:', error)
    
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma error codes
      switch (error.code) {
        case 'P2025':
          return NextResponse.json(
            { 
              success: false,
              error: 'Record not found',
              message: 'The event you are trying to update does not exist'
            },
            { status: 404 }
          )
        case 'P2002':
          return NextResponse.json(
            { 
              success: false,
              error: 'Unique constraint violation',
              message: 'This event status has already been updated'
            },
            { status: 409 }
          )
        default:
          return NextResponse.json(
            { 
              success: false,
              error: 'Database error',
              message: 'An error occurred while updating the event'
            },
            { status: 500 }
          )
      }
    }

    // Handle other errors
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update event',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0