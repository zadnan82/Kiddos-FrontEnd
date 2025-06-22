import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Store
import { useAuthStore } from './stores/authstore'
import { useLanguageStore } from './stores/languageStore'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Regular Pages
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

// Fixed Content Layout and Pages (Database-driven)
import FixedContentLayout from './components/FixedContenLayout'
import FixedContentHome from './pages/FixedContentHome'
import SubjectList from './pages/SubjectList'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'
import LessonDetail from './pages/LessonDetail'
import LearningDashboard from './pages/LearningDashboard'

// NEW: JSON Course Components (File-driven) 
import JsonCourseDetail from './components/JsonCourseDetail'
import JsonCourseViewer from './components/JsonCourseViewer'
import DynamicCourseBrowser from './components/DynamicCourseBrowser'

function App() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const { language } = useLanguageStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    const direction = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dir = direction
    document.documentElement.lang = language
    
    if (language === 'ar') {
      document.body.classList.add('font-cairo')
    } else {
      document.body.classList.remove('font-cairo')
    }
  }, [language])

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
<Route path="/json-course-test" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  <Route index element={<DynamicCourseBrowser />} />
</Route>
 
      <Route path="/json-course-test" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  <Route index element={<JsonCourseViewer />} />
</Route>

      {/* Protected routes - Regular App */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="children" element={<Children />} />
        <Route path="generate" element={<ContentGeneration />} />
        <Route path="history" element={<ContentHistory />} />
        <Route path="credits" element={<Credits />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Protected routes - Fixed Content System with Special Layout (Database-driven) */}
      <Route path="/fixed-content" element={<ProtectedRoute><FixedContentLayout /></ProtectedRoute>}>
        <Route index element={<FixedContentHome />} />
        <Route path="dashboard" element={<LearningDashboard />} />
        <Route path="subjects" element={<SubjectList />} />
        <Route path="subjects/:subjectId" element={<CourseList />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route path="lessons/:lessonId" element={<LessonDetail />} />
      </Route>

      {/* NEW: Protected routes - JSON Course System (File-driven) */}
      <Route path="/json-courses" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        
        <Route path=":ageGroup/:subject/:courseName" element={<JsonCourseDetail />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App