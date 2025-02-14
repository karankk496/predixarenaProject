import { db } from "@/lib/db"
import { cookies } from 'next/headers'
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ votes: {} })
    }

    const votes = await db.vote.findMany({
      where: {
        userId,
      },
      select: {
        eventId: true,
        outcome: true,
      },
    })

    // Convert to a map of eventId -> outcome
    const voteMap = votes.reduce((acc, vote) => ({
      ...acc,
      [vote.eventId]: vote.outcome,
    }), {})

    return NextResponse.json({ votes: voteMap })
  } catch (error) {
    console.error('Error fetching user votes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    )
  }
} 