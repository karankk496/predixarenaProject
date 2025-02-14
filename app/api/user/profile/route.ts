import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface JwtPayload {
  userId: string;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header:', authHeader); // Debugging line
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token); // Debugging line
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        role: true,
        isSuperUser: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
} 