import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'karansingh'

async function getUserFromToken(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.replace('Bearer ', '')
    const secret = new TextEncoder().encode(JWT_SECRET)

    let payload;
    try {
      const verified = await jose.jwtVerify(token, secret)
      payload = verified.payload
    } catch (error) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if we're fetching all user votes
    const { searchParams } = new URL(request.url)
    if (searchParams.has('all')) {
      // Get all votes for this user
      const votes = await prisma.vote.findMany({
        where: {
          userId: user.userId as string
        },
        include: {
          event: true
        }
      })

      return NextResponse.json({
        success: true,
        votes
      })
    }

    // Otherwise, check vote status for a specific event
    const eventId = searchParams.get('eventId')
    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId" },
        { status: 400 }
      )
    }

    const vote = await prisma.vote.findFirst({
      where: {
        eventId,
        userId: user.userId as string
      }
    })

    return NextResponse.json({
      success: true,
      hasVoted: !!vote,
      vote
    })
  } catch (error) {
    console.error('Vote status error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to check vote status"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { eventId, outcomeIndex } = await request.json()

    if (!eventId || typeof outcomeIndex !== 'number') {
      return NextResponse.json(
        { error: "Missing eventId or invalid outcomeIndex" },
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

    // Validate outcome index
    if (outcomeIndex < 0 || outcomeIndex >= event.outcomes.length) {
      return NextResponse.json(
        { error: "Invalid outcome index" },
        { status: 400 }
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
        userId: user.userId as string
      }
    })

    let vote;
    if (existingVote) {
      // Update existing vote
      const currentVotes = [...event.outcomeVotes];
      currentVotes[parseInt(existingVote.outcomeIndex)]--; // Decrement old vote
      currentVotes[outcomeIndex]++; // Increment new vote

      vote = await prisma.$transaction([
        prisma.vote.update({
          where: { id: existingVote.id },
          data: { outcomeIndex }
        }),
        prisma.event.update({
          where: { id: eventId },
          data: {
            outcomeVotes: currentVotes
          }
        })
      ])
    } else {
      // Create new vote
      const currentVotes = [...event.outcomeVotes];
      currentVotes[outcomeIndex]++; // Increment new vote

      vote = await prisma.$transaction([
        prisma.vote.create({
          data: {
            eventId,
            outcomeIndex,
            userId: user.userId as string
          }
        }),
        prisma.event.update({
          where: { id: eventId },
          data: {
            outcomeVotes: currentVotes
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
        error: "Failed to record vote",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0