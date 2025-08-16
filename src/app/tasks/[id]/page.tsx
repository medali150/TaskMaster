'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  deadline: string | null
  createdAt: string
  updatedAt: string
  project: {
    id: string
    title: string
    owner: {
      id: string
      name: string
    }
  }
  assignee?: {
    id: string
    name: string
    email: string
  } | null
}

export default function TaskDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [newStatus, setNewStatus] = useState<Task['status']>('TODO')

  useEffect(() => {
    if (taskId) {
      fetchTask()
    }
  }, [taskId])

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch task')
      }

      const data = await response.json()
      setTask(data)
      setNewStatus(data.status)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!task || newStatus === task.status) return

    setIsUpdating(true)
    setError('')

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update task status')
      }

      // Refresh task data
      fetchTask()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUpdating(false)
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

  const canEditTask = () => {
    if (!task || !user) return false
    return (
      user.role === 'ADMIN' ||
      task.assignee?.id === user.id ||
      task.project.owner.id === user.id
    )
  }

  const canDeleteTask = () => {
    if (!task || !user) return false
    return user.role === 'ADMIN' || task.project.owner.id === user.id
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading task...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !task) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900">Task Not Found</h1>
              <p className="text-gray-600 mt-2">{error || 'The task you are looking for does not exist.'}</p>
              <Link href="/tasks" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
                ← Back to Tasks
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
        
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/tasks" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  ← Back to Tasks
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{task.title}</h1>
                <p className="text-gray-600 mt-1">Task Details</p>
              </div>
              <div className="flex space-x-3">
                {canEditTask() && (
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Edit Task
                  </Link>
                )}
                {canDeleteTask() && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this task?')) {
                        // Handle delete
                        fetch(`/api/tasks/${task.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        }).then(() => {
                          router.push('/tasks')
                        })
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Delete Task
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Task Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Information</h3>
                {task.description && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{task.description}</p>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project</label>
                    <Link href={`/projects/${task.project.id}`} className="mt-1 text-sm text-indigo-600 hover:text-indigo-500">
                      {task.project.title}
                    </Link>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assignee</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {task.assignee ? task.assignee.name : 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Priority</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.deadline && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deadline</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {canEditTask() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                      <div className="flex space-x-2">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as Task['status'])}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          onClick={handleStatusUpdate}
                          disabled={isUpdating || newStatus === task.status}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Updating...' : 'Update'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Project Owner Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Project Owner:</span>
                <span className="ml-2 text-gray-900">{task.project.owner.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Project:</span>
                <Link href={`/projects/${task.project.id}`} className="ml-2 text-indigo-600 hover:text-indigo-500">
                  {task.project.title}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
