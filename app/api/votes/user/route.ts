import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const votes = await prisma.vote.findMany({
      where: {
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      votes
    });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch votes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 