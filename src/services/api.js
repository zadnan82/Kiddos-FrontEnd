import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.warn('Failed to parse auth storage:', error)
      }
    }

    // Add language header
    const langStorage = localStorage.getItem('language-storage')
    if (langStorage) {
      try {
        const { state } = JSON.parse(langStorage)
        if (state?.language) {
          config.headers['Accept-Language'] = state.language
        }
      } catch (error) {
        console.warn('Failed to parse language storage:', error)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth-storage')
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          toast.error('Access denied')
          break
          
        case 404:
          // Don't show toast for 404s in history - handle in component
          if (!window.location.pathname.includes('/history')) {
            toast.error('Resource not found')
          }
          break
          
        case 422:
          // Validation errors
          if (data?.detail) {
            if (Array.isArray(data.detail)) {
              // Pydantic validation errors
              const errorMessages = data.detail.map(err => err.msg || err.message).join(', ')
              toast.error(`Validation error: ${errorMessages}`)
            } else {
              toast.error(data.detail)
            }
          }
          break
          
        case 429:
          // Rate limit exceeded
          const retryAfter = error.response.headers['retry-after']
          toast.error(`Rate limit exceeded. Try again in ${retryAfter || '60'} seconds.`)
          break
          
        case 500:
          toast.error('Server error. Please try again later.')
          break
          
        default:
          // Don't show toast for certain endpoints
          if (!window.location.pathname.includes('/history')) {
            toast.error(data?.detail || data?.message || 'An error occurred')
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getSessions: () => api.get('/auth/sessions'),
  logoutAll: () => api.post('/auth/logout-all'),
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getLimits: () => api.get('/user/limits'),
  exportData: (data) => api.post('/user/export-data', data),
  deleteData: (data) => api.post('/user/delete-data', data),
}

export const childrenAPI = {
  getChildren: () => api.get('/children'),
  getChild: (id) => api.get(`/children/${id}`),
  createChild: (data) => api.post('/children', data),
  updateChild: (id, data) => api.put(`/children/${id}`, data),
  deleteChild: (id) => api.delete(`/children/${id}`),
}

export const contentAPI = {
  generate: (data) => api.post('/content/generate', data),
  
  approve: (sessionId, data) => api.post(`/content/${sessionId}/approve`, data),
  regenerate: (sessionId, data) => api.post(`/content/${sessionId}/regenerate`, data),
  
  // FIXED: Better parameter handling for history
  getHistory: (params) => {
    console.log('API: Getting content history with params:', params)
    
    // Handle both URLSearchParams and object
    let queryParams = {}
    
    if (params instanceof URLSearchParams) {
      // Convert URLSearchParams to object
      for (const [key, value] of params.entries()) {
        queryParams[key] = value
      }
    } else if (typeof params === 'object' && params !== null) {
      // Filter out empty values
      queryParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      )
    }
    
    console.log('API: Processed params:', queryParams)
    return api.get('/content/history', { params: queryParams })
  },
  
  deleteContent: (sessionId) => {
    console.log('API: Deleting content session:', sessionId)
    return api.delete(`/content/${sessionId}`)
  },

  // FIXED: Correct content endpoint path
  getContent: (sessionId) => {
    console.log('API: Getting content for session:', sessionId)
    return api.get(`/content/content/${sessionId}`)
      .catch(error => {
        console.error('Direct content fetch failed:', error.response?.status, error.response?.data)
        // If direct content fails, try getting it via status
        return api.get(`/content/status/${sessionId}`)
          .then(response => {
            if (response.data?.content) {
              console.log('API: Content found via status endpoint')
              return { data: response.data.content }
            }
            throw new Error('No content available')
          })
      })
  },
  
  getDebug: (sessionId) => api.get(`/content/debug/${sessionId}`),
  
  // FIXED: Single getStatus function with normalization
  getStatus: (sessionId) => {
    console.log('API: Getting status for session:', sessionId)
    return api.get(`/content/status/${sessionId}`)
      .then(response => {
        // Normalize status to lowercase
        if (response.data?.status) {
          response.data.status = response.data.status.toLowerCase()
        }
        console.log('API: Status response:', response.data)
        return response
      })
      .catch(error => {
        console.error('Status check failed:', error)
        throw error
      })
  },
}

export const creditsAPI = {
  getPackages: () => api.get('/credits/packages'),
  purchaseCredits: (data) => api.post('/credits/purchase', data),
  getBalance: () => api.get('/credits/balance'),
  getTransactions: (params) => api.get('/credits/transactions', { params }),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
  getSummary: () => api.get('/dashboard/summary'),
  getInsights: () => api.get('/dashboard/insights'),
}

export const systemAPI = {
  getHealth: () => api.get('/health'),
  ping: () => api.get('/ping'),
  getVersion: () => api.get('/version'),
}

export default api