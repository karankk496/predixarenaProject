import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { 
      email, 
      password,
      firstName,
      lastName,
      displayName,
      phoneNumber,
      dateOfBirth,
      gender 
    } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'GENERAL',
        isSuperUser: false,
        firstName: firstName || null,
        lastName: lastName || null,
        displayName: displayName || null,
        phoneNumber: phoneNumber || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
      }
    })

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        isSuperUser: user.isSuperUser
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword,
      token
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
} 