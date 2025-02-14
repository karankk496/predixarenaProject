import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const events = await db.event.findMany({
      where: {
        status: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching pending events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending events' },
      { status: 500 }
    )
  }
} 