'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    ownedProjects: number
    assignedTasks: number
  }
  ownedProjects: Array<{
    id: string
    title: string
    createdAt: string
    _count: {
      tasks: number
    }
  }>
  assignedTasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
    project: {
      id: string
      title: string
    }
  }>
}

export default function UserDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const data = await response.json()
      setUserData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      router.push('/users')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle user status')
      }

      setUserData(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'status-todo'
      case 'IN_PROGRESS': return 'status-progress'
      case 'COMPLETED': return 'status-completed'
      case 'CANCELLED': return 'status-cancelled'
      default: return 'status-todo'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'priority-low'
      case 'MEDIUM': return 'priority-medium'
      case 'HIGH': return 'priority-high'
      case 'URGENT': return 'priority-urgent'
      default: return 'priority-low'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
      case 'USER': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColorUser = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading user details...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !userData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Not Found</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{error || 'The user you are looking for does not exist.'}</p>
              <Link href="/users" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                ← Back to Users
              </Link>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/users" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                  ← Back to Users
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                  User Profile
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Detailed information about {userData.name}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    userData.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                  }`}
                >
                  {userData.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <Link
                  href={`/users/${userData.id}/edit`}
                  className="btn-primary"
                >
                  Edit User
                </Link>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="btn-danger"
                >
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Basic Info */}
            <div className="card p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userData.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{userData.email}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Role:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                    {userData.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorUser(userData.isActive)}`}>
                    {userData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member since:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last updated:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(userData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Statistics</h3>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {userData._count.ownedProjects}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Owned Projects</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {userData._count.assignedTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Assigned Tasks</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  href={`/projects/new?ownerId=${userData.id}`}
                  className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  Create Project for User
                </Link>
                <Link
                  href={`/tasks/new?assigneeId=${userData.id}`}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  Assign Task to User
                </Link>
                <Link
                  href={`/users/${userData.id}/edit`}
                  className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  Edit User Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Projects and Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
                <Link href="/projects" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                  View all
                </Link>
              </div>
              
              {userData.ownedProjects.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This user hasn't created any projects.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.ownedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {project._count.tasks} tasks • Created {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Tasks */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
                <Link href="/tasks" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                  View all
                </Link>
              </div>
              
              {userData.assignedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This user hasn't been assigned any tasks.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userData.assignedTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.project.title} • Created {new Date(task.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`status-badge ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
