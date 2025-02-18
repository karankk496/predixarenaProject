import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { prisma } from '@/lib/prisma'
import { Prisma, Role } from '@prisma/client'

interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

export async function POST(req: Request) {
  let client;
  try {
    // Initialize Prisma client
    client = prisma;
    await client.$connect();

    const body = await req.json() as RegisterPayload

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const existingUser = await client.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(body.password, 12)

    const user = await client.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: 'GENERAL' as Role,
        isSuperUser: false,
        firstName: body.firstName || null,
        lastName: body.lastName || null,
        displayName: body.displayName || null,
        phoneNumber: body.phoneNumber || null,
        dateOfBirth: body.dateOfBirth || null,
        gender: body.gender || null
      }
    })

    if (!user?.id) {
      throw new Error('Failed to create user')
    }

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
    const alg = 'HS256'
    const jwt = await new jose.SignJWT({
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      isSuperUser: user.isSuperUser
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword,
      token: jwt
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.$disconnect()
    }
  }
} 