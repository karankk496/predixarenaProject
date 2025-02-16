import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"

export async function PATCH(request: Request) {
  try {
    // Comment out authorization checks for now
    /*
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Must be logged in" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }
    */

    const { eventId, status } = await request.json()

    if (!eventId || !status) {
      return NextResponse.json(
        { error: "Event ID and status are required" },
        { status: 400 }
      )
    }

    // Validate status value
    if (!['approved', 'rejected', 'pending'].includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        status: status.toLowerCase(),
        updatedAt: new Date(),
      },
    })

    console.log('Updated event status:', updatedEvent);

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: `Event status updated to ${status} successfully`
    })

  } catch (error) {
    console.error('Error updating event status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update event status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0 