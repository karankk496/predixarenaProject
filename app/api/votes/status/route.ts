import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId" },
        { status: 400 }
      )
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        eventId: eventId,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      hasVoted: !!existingVote,
      vote: existingVote
    })

  } catch (error) {
    console.error('Vote status check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to check vote status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0 