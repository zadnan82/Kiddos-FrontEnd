const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ProgressApi {
  constructor() {
    this.baseUrl = `${API_BASE}/api/v1/fixed-content`
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token')
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  }

  // Course Progress
  async enrollInCourse(courseId, childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/courses/${courseId}/enroll?${params.toString()}`, {
      method: 'POST'
    })
  }

  async getCourseProgress(courseId, childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/courses/${courseId}?${params.toString()}`)
  }

  async getAllProgress(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/courses?${params.toString()}`)
  }

  // Lesson Progress
  async startLesson(lessonId, childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/lessons/${lessonId}/start?${params.toString()}`, {
      method: 'POST'
    })
  }

  async completeLesson(lessonId, completionData) {
    return this.request(`/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify(completionData)
    })
  }

  // Credits
  async getMonthlyCredits() {
    return this.request('/credits/monthly')
  }

  async getCreditHistory(months = 12) {
    return this.request(`/credits/history?months=${months}`)
  }

  // Dashboard & Stats
  async getDashboard(language = 'en') {
    return this.request(`/dashboard?language=${language}`)
  }

  async getLearningStats(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/stats?${params.toString()}`)
  }

  // Batch Operations
  async batchUpdateProgress(updates) {
    return this.request('/progress/batch', {
      method: 'POST',
      body: JSON.stringify({ updates })
    })
  }

  // Progress Analytics
  async getProgressAnalytics(childId = null, timeframe = '30d') {
    const params = new URLSearchParams({ timeframe })
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/analytics?${params.toString()}`)
  }

  async getCompletionTrends(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/trends?${params.toString()}`)
  }

  // Leaderboard & Social
  async getLeaderboard(timeframe = 'weekly', limit = 10) {
    const params = new URLSearchParams({ timeframe, limit })
    return this.request(`/progress/leaderboard?${params.toString()}`)
  }

  async getUserRank(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/rank?${params.toString()}`)
  }

  // Achievements
  async getAchievements(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/achievements?${params.toString()}`)
  }

  async unlockAchievement(achievementId, childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/achievements/${achievementId}/unlock?${params.toString()}`, {
      method: 'POST'
    })
  }
}

export const progressApi = new ProgressApi()