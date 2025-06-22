const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class FixedContentApi {
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

  // Subjects
  async getSubjects(language = 'en') {
    return this.request(`/subjects?language=${language}`)
  }

  async getSubject(subjectId, language = 'en') {
    return this.request(`/subjects/${subjectId}?language=${language}`)
  }

  // Courses
  async getCourses(filters = {}) {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value)
      }
    })

    return this.request(`/courses?${params.toString()}`)
  }

  async getCourse(courseId, childId = null, language = 'en') {
    const params = new URLSearchParams({ language })
    if (childId) params.append('child_id', childId)
    
    return this.request(`/courses/${courseId}?${params.toString()}`)
  }

  async enrollInCourse(courseId, childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/courses/${courseId}/enroll?${params.toString()}`, {
      method: 'POST'
    })
  }

  // Lessons
  async getLesson(lessonId, childId = null, language = 'en') {
    const params = new URLSearchParams({ language })
    if (childId) params.append('child_id', childId)
    
    return this.request(`/lessons/${lessonId}?${params.toString()}`)
  }

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

  // Progress
  async getUserProgress(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/courses?${params.toString()}`)
  }

  async getCourseProgress(courseId, childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/progress/courses/${courseId}?${params.toString()}`)
  }

  // Dashboard
  async getDashboard(language = 'en') {
    return this.request(`/dashboard?language=${language}`)
  }

  async getLearningStats(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/stats?${params.toString()}`)
  }

  // Recommendations
  async getRecommendations(childId = null, limit = 5, language = 'en') {
    const params = new URLSearchParams({ limit, language })
    if (childId) params.append('child_id', childId)
    
    return this.request(`/recommendations?${params.toString()}`)
  }

  // Search
  async searchContent(query, filters = {}) {
    const params = new URLSearchParams({ q: query })
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value)
      }
    })

    return this.request(`/search?${params.toString()}`)
  }
}

export const fixedContentApi = new FixedContentApi()