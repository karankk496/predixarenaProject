import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await prisma.event.update({
      where: {
        id: params.eventId,
      },
      data: {
        status: "rejected",
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reject event" },
      { status: 500 }
    )
  }
} 