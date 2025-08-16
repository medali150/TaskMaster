import { NextRequest, NextResponse } from 'next/server'
import { requireUser, AuthenticatedRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tasks - List all tasks (Authenticated users)
async function getTasks(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build filter conditions
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (assigneeId) where.assigneeId = assigneeId
    if (status) where.status = status
    if (priority) where.priority = priority

    const tasks = await prisma.task.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task (Authenticated users)
async function createTask(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, deadline, projectId, assigneeId } = body
    
    // Validate required fields
    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and projectId are required' },
        { status: 400 }
      )
    }
    
    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true }
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Check if user is project owner or admin
    const user = request.user!
    if (project.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only project owners and admins can create tasks.' },
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
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        projectId,
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
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export const GET = requireUser(getTasks)
export const POST = requireUser(createTask)
