import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireUser, AuthenticatedRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users - List all users (Admin only)
async function getUsers(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedProjects: true,
            assignedTasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (Admin only)
async function createUser(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'USER' } = body
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Import bcrypt dynamically to avoid build issues
    const bcrypt = await import('bcryptjs')
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export const GET = requireAdmin(getUsers)
export const POST = requireAdmin(createUser)
