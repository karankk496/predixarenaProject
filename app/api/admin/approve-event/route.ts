import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { eventId, status } = await req.json()

    if (!eventId || !status) {
      return NextResponse.json(
        { error: 'Missing eventId or status' },
        { status: 400 }
      )
    }

    const event = await db.event.update({
      where: { id: eventId },
      data: { status },
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
} 