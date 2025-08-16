import { NextRequest, NextResponse } from 'next/server'
import { requireUser, AuthenticatedRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id] - Get specific project (Authenticated users)
async function getProject(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update project (Project owner or Admin)
async function updateProject(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description } = body
    const user = request.user!

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is project owner or admin
    if (existingProject.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only project owners and admins can update projects.' },
        { status: 403 }
      )
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        title,
        description
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete project (Project owner or Admin)
async function deleteProject(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const user = request.user!

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is project owner or admin
    if (existingProject.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Only project owners and admins can delete projects.' },
        { status: 403 }
      )
    }

    // Delete project (tasks will be cascaded due to schema)
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

export const GET = requireUser(getProject)
export const PUT = requireUser(updateProject)
export const DELETE = requireUser(deleteProject)
