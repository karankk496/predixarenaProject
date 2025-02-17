import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // Check if user is an admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const { eventId } = await req.json();

    // Approve the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        approvedBy: decoded.userId, // Set approvedBy to the ID of the user approving the event
        approvedDate: new Date(), // Set approvedDate to the current date
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error approving event:', error);
    return NextResponse.json({ error: 'Failed to approve event' }, { status: 500 });
  }
} 