import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { action } = await request.json()
    const { userId } = params

    if (action === 'delete') {
      await prisma.user.delete({
        where: { id: userId },
      })
      return NextResponse.json({ message: 'User deleted successfully' })
    }

    if (action === 'promote_admin') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          isSuperUser: true,
          role: 'ADMIN'
        },
      })
      return NextResponse.json(updatedUser)
    }

    if (action === 'promote_ops') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: 'OPS' },
      })
      return NextResponse.json(updatedUser)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
} 