import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Log environment variables for debugging
    console.log('DATABASE_URL:', process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)

    await prisma.$connect()
    
    // Test query to verify database access
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection successful',
      details: {
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        environment: process.env.NODE_ENV,
        userCount,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to connect to database',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 