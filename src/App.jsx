import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Store
import { useAuthStore } from './stores/authstore'
import { useLanguageStore } from './stores/languageStore'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Children from './pages/Children'
import ContentGeneration from './pages/ContentGeneration'
import ContentHistory from './pages/ContentHistory'
import Credits from './pages/Credits'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const { language } = useLanguageStore()

  useEffect(() => {
    // Initialize authentication state
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Update document direction when language changes
    const direction = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = language
    
    // Add font class to body for RTL languages
    if (language === 'ar') {
      document.body.classList.add('font-cairo')
    } else {
      document.body.classList.remove('font-cairo')
    }
  }, [language])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Kiddos..." />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route 
          path="login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="children" element={<Children />} />
        <Route path="generate" element={<ContentGeneration />} />
        <Route path="history" element={<ContentHistory />} />
        <Route path="credits" element={<Credits />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App