import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    return NextResponse.json({ 
      status: 'Connected to database successfully',
      databaseUrl: process.env.DATABASE_URL?.split('@')[1] // Only show host/db part
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 