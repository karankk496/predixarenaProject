import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Just test the connection
    const count = await prisma.user.count()
    
    return NextResponse.json({ 
      status: 'Connected to database successfully',
      userCount: count
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to database', details: error },
      { status: 500 }
    )
  }
} 