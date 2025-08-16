import { NextRequest, NextResponse } from 'next/server'
import { requireUser, AuthenticatedRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/stats - Get dashboard statistics
async function getDashboardStats(request: NextRequest) {
  try {
    const user = (request as AuthenticatedRequest).user!
    
    // Get user's projects and tasks
    const [projects, tasks] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { tasks: { some: { assigneeId: user.id } } }
          ]
        },
        include: {
          _count: {
            select: {
              tasks: true
            }
          },
          tasks: {
            where: {
              assigneeId: user.id
            },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      prisma.task.findMany({
        where: {
          assigneeId: user.id
        },
        include: {
          project: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ])

    // Calculate statistics
    const totalProjects = projects.length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
    const pendingTasks = totalTasks - completedTasks

    // Format recent projects
    const recentProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      taskCount: project._count.tasks
    }))

    // Format recent tasks
    const recentTasks = tasks.slice(0, 5).map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      projectTitle: task.project.title
    }))

    const stats = {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      recentProjects,
      recentTasks
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

export const GET = requireUser(getDashboardStats)
