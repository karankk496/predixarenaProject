import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const cookieStore = await cookies()
  const voteCookie = cookieStore.get(`voted_${params.eventId}`)

  return NextResponse.json({
    votedFor: voteCookie?.value
  })
} 