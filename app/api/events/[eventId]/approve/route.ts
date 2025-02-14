import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    // Log the received eventId and params
    console.log('Params:', params)
    console.log('Approving event with ID:', params.eventId)

    // Verify the event exists first
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
    })

    console.log('Existing event:', existingEvent)

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Update the event - remove approvedAt if it's not in your schema
    const event = await prisma.event.update({
      where: {
        id: params.eventId,
      },
      data: {
        status: "approved",
        // Only include approvedAt if it exists in your schema
        // approvedAt: new Date(),
      },
    })

    console.log('Successfully approved event:', event)
    return NextResponse.json(event)
  } catch (error) {
    // Enhanced error logging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      error, // Log the entire error object
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
        error: "Failed to approve event", 
        details: error instanceof Error ? error.message : "Unknown error",
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
} 