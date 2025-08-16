'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  deadline: string | null
  createdAt: string
  assignee: {
    id: string
    name: string
    email: string
  } | null
}

interface Project {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  tasks?: Task[]
  _count?: {
    tasks: number
  }
}

export default function ProjectDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch project')
      }

      const data = await response.json()
      setProject(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading project...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
              <p className="text-gray-600 mt-2">{error || 'The project you are looking for does not exist.'}</p>
              <Link href="/projects" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
                ← Back to Projects
              </Link>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/projects" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  ← Back to Projects
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{project.title}</h1>
                <p className="text-gray-600 mt-1">Project Details</p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Project
                </Link>
                <Link
                  href={`/tasks/new?projectId=${project.id}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Task
                </Link>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
                {project.description && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{project.description}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner</label>
                    <p className="mt-1 text-sm text-gray-900">{project.owner.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{project._count?.tasks || 0}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {project.tasks?.filter(t => t.status === 'COMPLETED').length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {project.tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0}
                      </div>
                      <div className="text-xs text-gray-600">In Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Tasks</h3>
                <Link
                  href={`/tasks/new?projectId=${project.id}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  Add Task
                </Link>
              </div>
            </div>
            
            {!project.tasks || project.tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                  <div className="mt-6">
                    <Link
                      href={`/tasks/new?projectId=${project.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Add Task
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {project.tasks?.map((task) => (
                  <li key={task.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 truncate">
                              <Link href={`/tasks/${task.id}`} className="hover:text-indigo-600">
                                {task.title}
                              </Link>
                            </h4>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              {task.assignee && (
                                <>
                                  <span>Assigned to: {task.assignee.name}</span>
                                  <span>•</span>
                                </>
                              )}
                              {task.deadline && (
                                <>
                                  <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <Link
                              href={`/tasks/${task.id}`}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
