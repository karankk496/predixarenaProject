import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    console.log(user)

    

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        isSuperUser: user.isSuperUser,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    // Remove password from user data
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    });

    // Set authorization header
    response.headers.set('Authorization', `Bearer ${token}`);

    return response;

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
} 