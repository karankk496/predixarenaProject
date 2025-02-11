import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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

    console.log('Attempting database operations...')

    try {
      // Test connection first
      await prisma.$connect()
      console.log('Database connected successfully')

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        console.log('User already exists:', email)
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      console.log('Creating user with data:', {
        email,
        firstName,
        lastName,
        displayName,
        phoneNumber,
        dateOfBirth,
        gender
      })

      // Create user with optional fields
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(displayName && { displayName }),
          ...(phoneNumber && { phoneNumber }),
          ...(dateOfBirth && { dateOfBirth }),
          ...(gender && { gender })
        }
      })

      console.log('User created successfully:', user.id)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return NextResponse.json({
        message: 'User registered successfully',
        user: userWithoutPassword
      })
    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      throw new Error(`Database operation failed: ${dbError.message}`)
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Error creating user', 
        message: error.message,
        details: error
      },
      { status: 500 }
    )
  }
} 