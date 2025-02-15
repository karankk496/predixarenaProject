import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return empty votes since we're not tracking user-specific votes for now
    const votes: Record<string, string> = {};

    return NextResponse.json({ 
      success: true,
      votes,
      message: 'Authorization disabled'
    });
  } catch (error) {
    console.error('Error fetching user votes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    )
  }
} 
