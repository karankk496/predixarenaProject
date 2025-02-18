import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Comment out authorization checks for now
    /*
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    */

    const { eventId, outcome, userId = 'anonymous' } = await request.json()

    if (!eventId || !outcome) {
      return NextResponse.json(
        { error: "Missing eventId or outcome" },
        { status: 400 }
      )
    }

    // Check if event exists, is approved, and hasn't ended
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        status: "approved"
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or not approved" },
        { status: 404 }
      )
    }

    // Check if event has ended
    if (new Date(event.resolutionDateTime) < new Date()) {
      return NextResponse.json(
        { error: "Event has ended. Voting is closed." },
        { status: 400 }
      )
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        eventId,
        userId
      }
    })

    let vote;
    if (existingVote) {
      // Update existing vote
      vote = await prisma.$transaction([
        prisma.vote.update({
          where: { id: existingVote.id },
          data: { outcome }
        }),
        // Decrement old outcome count
        prisma.event.update({
          where: { id: eventId },
          data: {
            [existingVote.outcome === 'outcome1' ? 'outcome1Votes' : 'outcome2Votes']: {
              decrement: 1
            }
          }
        }),
        // Increment new outcome count
        prisma.event.update({
          where: { id: eventId },
          data: {
            [outcome === 'outcome1' ? 'outcome1Votes' : 'outcome2Votes']: {
              increment: 1
            }
          }
        })
      ])
    } else {
      // Create new vote
      vote = await prisma.$transaction([
        prisma.vote.create({
          data: {
            eventId,
            outcome,
            userId
          }
        }),
        prisma.event.update({
          where: { id: eventId },
          data: {
            [outcome === 'outcome1' ? 'outcome1Votes' : 'outcome2Votes']: {
              increment: 1
            }
          }
        })
      ])
    }

    return NextResponse.json({
      success: true,
      message: existingVote ? "Vote updated successfully" : "Vote recorded successfully",
      vote: vote[0]
    })

  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process vote",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0 