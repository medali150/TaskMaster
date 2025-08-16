// Types for AI insights
export interface TaskInsight {
  taskId: string
  reason: string
}

export interface AIInsights {
  suggested_priorities: TaskInsight[]
  weekly_summary: string
  predicted_overdue: TaskInsight[]
}

// Cache for AI insights to avoid excessive API calls
let insightsCache: {
  data: AIInsights | null
  timestamp: number
  userId: string | null
} = {
  data: null,
  timestamp: 0,
  userId: null
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch AI insights for the current user
 * @param token - JWT token for authentication
 * @param userId - Current user ID for cache validation
 * @returns Promise<AIInsights>
 */
export async function fetchAIInsights(token: string, userId: string): Promise<AIInsights> {
  // Check cache first
  const now = Date.now()
  if (
    insightsCache.data &&
    insightsCache.userId === userId &&
    (now - insightsCache.timestamp) < CACHE_DURATION
  ) {
    return insightsCache.data
  }

  try {
    const response = await fetch('/api/ai/insights', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const insights: AIInsights = await response.json()

    // Update cache
    insightsCache = {
      data: insights,
      timestamp: now,
      userId: userId
    }

    return insights
  } catch (error) {
    console.error('Failed to fetch AI insights:', error)
    
    // Return fallback data
    return {
      suggested_priorities: [],
      weekly_summary: "Unable to load AI insights. Please check your connection and try again.",
      predicted_overdue: []
    }
  }
}

/**
 * Clear the AI insights cache
 */
export function clearAIInsightsCache(): void {
  insightsCache = {
    data: null,
    timestamp: 0,
    userId: null
  }
}

/**
 * Get task title by ID from a list of tasks
 * @param taskId - The task ID to look up
 * @param tasks - Array of tasks with id and title properties
 * @returns The task title or "Unknown Task"
 */
export function getTaskTitleById(taskId: string, tasks: Array<{ id: string; title: string }>): string {
  const task = tasks.find(t => t.id === taskId)
  return task ? task.title : "Unknown Task"
}

/**
 * Format priority reason for display
 * @param reason - The raw reason from AI
 * @returns Formatted reason string
 */
export function formatPriorityReason(reason: string): string {
  // Clean up common AI response patterns
  return reason
    .replace(/^Task ID: [a-zA-Z0-9-]+\.?\s*/i, '')
    .replace(/^This task should be prioritized because:?\s*/i, '')
    .replace(/^Priority reason:?\s*/i, '')
    .trim()
}

/**
 * Get priority color based on task insight
 * @param insight - The task insight object
 * @returns CSS class for priority styling
 */
export function getPriorityColor(insight: TaskInsight): string {
  const reason = insight.reason.toLowerCase()
  
  if (reason.includes('urgent') || reason.includes('critical') || reason.includes('deadline')) {
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
  }
  if (reason.includes('high') || reason.includes('important')) {
    return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
  }
  if (reason.includes('medium') || reason.includes('moderate')) {
    return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
  }
  
  return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
}
