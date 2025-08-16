import { NextRequest, NextResponse } from 'next/server'
import { requireUser, AuthenticatedRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Types for AI insights
interface TaskInsight {
  taskId: string
  reason: string
}

interface AIInsights {
  suggested_priorities: TaskInsight[]
  weekly_summary: string
  predicted_overdue: TaskInsight[]
}

// GET /api/ai/insights - Get AI-powered insights for user's tasks
async function getAIInsights(request: NextRequest) {
  const user = (request as AuthenticatedRequest).user!
  
  // Fetch user's tasks with related data
  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: user.id
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
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // If no tasks, return empty insights
  if (tasks.length === 0) {
    return NextResponse.json({
      suggested_priorities: [],
      weekly_summary: "No tasks found. Create your first task to get AI insights!",
      predicted_overdue: []
    })
  }

  try {

    // Prepare task data for AI analysis
    const taskData = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      createdAt: task.createdAt,
      projectTitle: task.project.title,
      assigneeName: task.assignee?.name || 'Unassigned'
    }))

    // Get current date for analysis
    const currentDate = new Date()
    const oneWeekFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Create AI prompt
    const prompt = `
You are an AI productivity coach analyzing task management data. Analyze the following tasks and provide insights in JSON format.

Current date: ${currentDate.toISOString().split('T')[0]}

Tasks data:
${JSON.stringify(taskData, null, 2)}

Instructions:
1. Analyze task deadlines, priorities, and statuses
2. Consider workload distribution and time constraints
3. Identify patterns and potential risks

Return ONLY valid JSON with this exact structure:
{
  "suggested_priorities": [
    {"taskId": "task_id_here", "reason": "Clear explanation of why this should be prioritized"}
  ],
  "weekly_summary": "2-3 sentence summary of overall progress and productivity patterns",
  "predicted_overdue": [
    {"taskId": "task_id_here", "reason": "Explanation of why this task is at risk of being overdue"}
  ]
}

Rules:
- suggested_priorities: Top 3 tasks that should be prioritized (consider deadlines, importance, and current status)
- weekly_summary: Natural language summary of progress and patterns (2-3 sentences max)
- predicted_overdue: Tasks at risk of being overdue (consider deadlines, current status, and workload)
- Always return valid JSON that can be parsed by a computer
- Provide specific, actionable reasons for each recommendation
- Consider task dependencies and project context
- Be realistic about workload and time constraints
`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a productivity coach that analyzes task data and provides actionable insights. Always return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent JSON output
      max_tokens: 1000
    })

    // Extract and parse AI response
    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI service')
    }

    // Clean the response and parse JSON
    let cleanedResponse = aiResponse.trim()
    
    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```/, '')
    }

    // Parse the JSON response
    let insights: AIInsights
    try {
      insights = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw response:', aiResponse)
      
      // Fallback to basic insights if parsing fails
      insights = {
        suggested_priorities: [],
        weekly_summary: "AI analysis temporarily unavailable. Please check back later.",
        predicted_overdue: []
      }
    }

    // Validate and sanitize the response
    const validatedInsights: AIInsights = {
      suggested_priorities: Array.isArray(insights.suggested_priorities) 
        ? insights.suggested_priorities.slice(0, 3).map(item => ({
            taskId: String(item.taskId || ''),
            reason: String(item.reason || 'No reason provided')
          }))
        : [],
      weekly_summary: String(insights.weekly_summary || 'No summary available'),
      predicted_overdue: Array.isArray(insights.predicted_overdue)
        ? insights.predicted_overdue.map(item => ({
            taskId: String(item.taskId || ''),
            reason: String(item.reason || 'No reason provided')
          }))
        : []
    }

    return NextResponse.json(validatedInsights)

  } catch (error: any) {
    console.error('AI Insights API Error:', error)
    
    // Check if it's a quota/API key issue
    const isQuotaError = error?.message?.includes('quota') || error?.message?.includes('429')
    const isApiKeyError = !process.env.OPENAI_API_KEY || error?.message?.includes('401')
    
    if (isQuotaError || isApiKeyError) {
      // Return fallback insights based on basic task analysis
      return NextResponse.json(generateFallbackInsights(tasks))
    }
    
    // Return fallback response on other errors
    return NextResponse.json(
      {
        suggested_priorities: [],
        weekly_summary: "Unable to generate AI insights at the moment. Please try again later.",
        predicted_overdue: []
      },
      { status: 500 }
    )
  }
}

// Generate fallback insights when AI is unavailable
function generateFallbackInsights(tasks: any[]): AIInsights {
  const currentDate = new Date()
  
  // Sort tasks by priority and deadline
  const sortedTasks = tasks.sort((a, b) => {
    const priorityOrder: { [key: string]: number } = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
    const aPriority = priorityOrder[a.priority] || 1
    const bPriority = priorityOrder[b.priority] || 1
    
    if (aPriority !== bPriority) return bPriority - aPriority
    
    // If same priority, sort by deadline
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    
    return 0
  })

  // Get suggested priorities (top 3)
  const suggested_priorities = sortedTasks
    .filter(task => task.status !== 'COMPLETED')
    .slice(0, 3)
    .map(task => ({
      taskId: task.id,
      reason: `High priority task${task.deadline ? ` due ${new Date(task.deadline).toLocaleDateString()}` : ''}`
    }))

  // Generate weekly summary
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED')
  const pendingTasks = tasks.filter(task => task.status !== 'COMPLETED')
  const urgentTasks = pendingTasks.filter(task => task.priority === 'URGENT' || task.priority === 'HIGH')
  
  const weekly_summary = `You have ${pendingTasks.length} pending tasks with ${urgentTasks.length} high-priority items. ${completedTasks.length > 0 ? `Great job completing ${completedTasks.length} tasks!` : 'Keep up the good work!'}`

  // Find tasks at risk of being overdue
  const predicted_overdue = pendingTasks
    .filter(task => {
      if (!task.deadline) return false
      const deadline = new Date(task.deadline)
      const daysUntilDeadline = (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysUntilDeadline <= 3 && daysUntilDeadline > 0
    })
    .slice(0, 3)
    .map(task => ({
      taskId: task.id,
      reason: `Due soon on ${new Date(task.deadline).toLocaleDateString()}`
    }))

  return {
    suggested_priorities,
    weekly_summary,
    predicted_overdue
  }
}

export const GET = requireUser(getAIInsights)
