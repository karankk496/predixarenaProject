import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { Prisma } from "@prisma/client"

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { outcome, previousVote } = await request.json()
    const eventId = params.eventId

    console.log('Vote attempt:', { eventId, outcome, previousVote })

    // Validate outcome
    if (outcome !== 'outcome1' && outcome !== 'outcome2') {
      return NextResponse.json(
        { error: "Invalid outcome" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const voteCookie = cookieStore.get(`voted_${eventId}`)

    // Remove the block for existing votes
    // Instead, use the cookie to determine the previous vote if not provided
    const actualPreviousVote = previousVote || voteCookie?.value as ('outcome1' | 'outcome2' | undefined)

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    console.log('Found event:', event) // Debug log

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Check if event has ended
    if (new Date(event.resolutionDateTime) <= new Date()) {
      return NextResponse.json(
        { error: "This event has ended" },
        { status: 400 }
      )
    }

    try {
      // Update vote counts
      const updateData: any = {
        [`${outcome}Votes`]: {
          increment: 1
        }
      }

      // If changing vote, decrement the previous vote count
      if (actualPreviousVote && actualPreviousVote !== outcome) {
        updateData[`${actualPreviousVote}Votes`] = {
          decrement: 1
        }
      }

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: updateData
      })

      // Set cookie with the new vote
      const response = NextResponse.json({ 
        success: true, 
        event: updatedEvent,
        votedFor: outcome,
        previousVote: actualPreviousVote
      })

      // Update the cookie with the new vote
      response.cookies.set(`voted_${eventId}`, outcome, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })

      return response
    } catch (error) {
      console.error('Database error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      })

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { 
            error: "Database error", 
            code: error.code,
            message: error.message,
            meta: error.meta
          },
          { status: 500 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error recording vote:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { 
        error: "Failed to record vote", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 