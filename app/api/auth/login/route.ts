import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    console.log('Login attempt for:', email)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('Login successful for user:', email)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        displayName: user.displayName 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error during login' },
      { status: 500 }
    )
  }
} 