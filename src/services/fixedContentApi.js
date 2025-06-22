// src/services/fixedContentApi.js - UPDATE
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class FixedContentApi {
  constructor() {
    // FIXED: Use correct API path from backend
    this.baseUrl = `${API_BASE}/fixed_content` // NOT /api/v1/fixed_content
  }

  async request(endpoint, options = {}) {
    // FIXED: Get token from auth store, not localStorage directly
    const authStorage = localStorage.getItem('auth-storage')
    let token = null
    
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        token = state?.token
      } catch (error) {
        console.warn('Failed to parse auth storage:', error)
      }
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    console.log('Fixed Content API Request:', `${this.baseUrl}${endpoint}`, config)
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }))
      console.error('Fixed Content API Error:', response.status, error)
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  }

  // ===== FIXED: Correct subject endpoints =====
  async getSubjects(language = 'en') {
    return this.request(`/subjects?language=${language}`)
  }

  // ===== FIXED: Handle pagination properly =====
  async getCourses(filters = {}) {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value)
      }
    })

    const response = await this.request(`/courses?${params.toString()}`)
    
    // Handle both paginated and non-paginated responses
    if (response.items) {
      return response // Paginated response
    } else if (Array.isArray(response)) {
      return { items: response, total: response.length } // Non-paginated
    } else {
      return { items: [], total: 0 }
    }
  }

  // ===== FIXED: Course enrollment with proper error handling =====
  async enrollInCourse(courseId, childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    return this.request(`/courses/${courseId}/enroll?${params.toString()}`, {
      method: 'POST'
    })
  }

  // Add this method to your existing FixedContentApi class
async getCourseFromFile(ageGroup, subject, courseName) {
  return this.request(`/courses/file/${ageGroup}/${subject}/${courseName}`)
}

// Add to your existing FixedContentApi class
async listCoursesFromFiles(ageGroup, subject) {
  return this.request(`/courses/file/${ageGroup}/${subject}`)
}
  // ===== FIXED: Progress endpoints =====
  async getUserProgress(childId = null) {
    const params = new URLSearchParams()
    if (childId) params.append('child_id', childId)
    
    const response = await this.request(`/progress/courses?${params.toString()}`)
    
    // Convert array to object keyed by course_id for easier lookup
    if (Array.isArray(response)) {
      const progressMap = {}
      response.forEach(progress => {
        progressMap[progress.course_id] = progress
      })
      return progressMap
    }
    
    return response
  }
}

export const fixedContentApi = new FixedContentApi()