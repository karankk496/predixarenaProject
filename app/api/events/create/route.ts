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

    const eventData = await req.json();

    // Validate event data
    if (!eventData.title || !eventData.description || !eventData.resolutionSource || !eventData.resolutionDate || !eventData.outcomeOptions) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Create event in the database
    const newEvent = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        resolutionSource: eventData.resolutionSource,
        resolutionDate: new Date(eventData.resolutionDate),
        outcomeOptions: eventData.outcomeOptions,
        createdBy: decoded.userId,
        createdDate: new Date(),
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
} 