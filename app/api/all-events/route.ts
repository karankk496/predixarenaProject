import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        outcome1: true,
        outcome2: true,
        outcome1Votes: true,
        outcome2Votes: true,
        resolutionSource: true,
        resolutionDateTime: true,
        status: true,
        createdAt: true,
      },
    })

    return new NextResponse(JSON.stringify({ events }), {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
} 