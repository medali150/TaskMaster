import { NextRequest, NextResponse } from 'next/server'
import { requireUser, AuthenticatedRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id] - Get specific task (Authenticated users)
async function getTask(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Failed to fetch task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id] - Update task (Task assignee, Project owner, or Admin)
async function updateTask(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description, status, priority, deadline, assigneeId } = body
    const user = request.user!

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            ownerId: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update this task
    const canUpdate = 
      existingTask.assigneeId === user.userId || // Task assignee
      existingTask.project.ownerId === user.userId || // Project owner
      user.role === 'ADMIN' // Admin

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Access denied. Only task assignees, project owners, and admins can update tasks.' },
        { status: 403 }
      )
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId, isActive: true }
      })
      
      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee not found or inactive' },
          { status: 404 }
        )
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        assigneeId: assigneeId || null
      },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete task (Project owner or Admin)
async function deleteTask(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const user = request.user!

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            ownerId: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user is project owner or admin
    if (existingTask.project.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only project owners and admins can delete tasks.' },
        { status: 403 }
      )
    }

    // Delete task
    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks/[id] - Update task status only (Task assignee, Project owner, or Admin)
async function updateTaskStatus(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body
    const user = request.user!

    // Validate status
    if (!status || !['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      )
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            ownerId: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update this task
    const canUpdate = 
      existingTask.assigneeId === user.userId || // Task assignee
      existingTask.project.ownerId === user.userId || // Project owner
      user.role === 'ADMIN' // Admin

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Access denied. Only task assignees, project owners, and admins can update tasks.' },
        { status: 403 }
      )
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { status },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Failed to update task status:', error)
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    )
  }
}

export const GET = requireUser(getTask)
export const PUT = requireUser(updateTask)
export const PATCH = requireUser(updateTaskStatus)
export const DELETE = requireUser(deleteTask)
