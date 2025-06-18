import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          const { token, user } = response.data
          
          // Store token and user
          set({ 
            token, 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.detail || 'Login failed'
          return { success: false, error: message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data
          
          // Store token and user
          set({ 
            token, 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
          
          // Set token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.detail || 'Registration failed'
          return { success: false, error: message }
        }
      },

      logout: async () => {
        const { token } = get()
        
        try {
          // Call logout endpoint if token exists
          if (token) {
            await api.post('/auth/logout')
          }
        } catch (error) {
          // Ignore logout errors - still proceed with local logout
          console.warn('Logout API call failed:', error.message)
        } finally {
          // Clear local state regardless of API response
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          })
          
          // Remove token from API defaults
          delete api.defaults.headers.common['Authorization']
          
          // Clear persisted storage
          localStorage.removeItem('auth-storage')
        }
      },

      checkAuth: async () => {
        const { token } = get()
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false })
          return
        }

        try {
          // Set token for API request
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Verify token is still valid by fetching user profile
          const response = await api.get('/user/profile')
          const user = response.data
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } catch (error) {
          console.warn('Auth check failed:', error.message)
          // Token is invalid, clear auth state
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
          delete api.defaults.headers.common['Authorization']
        }
      },

      updateUser: (userData) => {
        set(state => ({
          user: { ...state.user, ...userData }
        }))
      },

      refreshToken: async () => {
        // TODO: Implement token refresh if needed
        // For now, just check if current token is still valid
        return get().checkAuth()
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)