import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] - Get specific user (Admin only)
async function getUser(request: NextRequest, context: any) {
  try {
    const { id } = context.params
    
    const user = await prisma.user.findUnique({
      where: { id },
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
        },
        ownedProjects: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                tasks: true
              }
            }
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                title: true
              }
            }
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user (Admin only)
async function updateUser(request: NextRequest, context: any) {
  try {
    const { id } = context.params
    const body = await request.json()
    const { name, email, role, isActive, password } = body
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    
    // Hash password if provided
    if (password) {
      const bcrypt = await import('bcryptjs')
      const saltRounds = 12
      updateData.password = await bcrypt.hash(password, saltRounds)
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
async function deleteUser(request: NextRequest, context: any) {
  try {
    const { id } = context.params
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ownedProjects: true,
            assignedTasks: true
          }
        }
      }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user has associated data
    if (existingUser._count.ownedProjects > 0 || existingUser._count.assignedTasks > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete user with associated projects or tasks. Please reassign or delete them first.',
          details: {
            ownedProjects: existingUser._count.ownedProjects,
            assignedTasks: existingUser._count.assignedTasks
          }
        },
        { status: 400 }
      )
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - Toggle user status (Admin only)
async function toggleUserStatus(request: NextRequest, context: any) {
  try {
    const { id } = context.params
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Toggle the isActive status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !existingUser.isActive
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
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    )
  }
}

export const GET = requireAdmin(getUser)
export const PUT = requireAdmin(updateUser)
export const DELETE = requireAdmin(deleteUser)
export const PATCH = requireAdmin(toggleUserStatus)
