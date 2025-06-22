import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  Trophy,
  Search,
  User,
  Settings
} from 'lucide-react'
import { useLanguageStore } from '../stores/languageStore'
import { useAuthStore } from '../stores/authstore'
import { useProgressStore } from '../stores/progressStore'

const FixedContentLayout = ({ children }) => {
  const location = useLocation()
  const { language, t } = useLanguageStore()
  const { user } = useAuthStore()
  const { getOverallProgress } = useProgressStore()
  
  const progress = getOverallProgress()
  
  const navigation = [
    {
      name: 'Overview',
      href: '/fixed-content',
      icon: Home,
      description: 'Browse subjects and courses'
    },
    {
      name: 'Subjects',
      href: '/fixed-content/subjects',
      icon: BookOpen,
      description: 'All learning subjects'
    },
    {
      name: 'Dashboard',
      href: '/fixed-content/dashboard',
      icon: BarChart3,
      description: 'Track your progress'
    }
  ]

  const isActivePath = (path) => {
    if (path === '/fixed-content') {
      return location.pathname === '/fixed-content'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link 
                to="/fixed-content" 
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Courses</span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = isActivePath(item.href)
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Progress and User Info */}
            <div className="flex items-center space-x-4">
              {/* Quick Progress */}
              {progress && (
                <div className="hidden lg:block">
                  <div className="text-xs text-gray-500 mb-1">Your Progress</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {Math.round(progress.completionRate)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Credits */}
              {progress && (
                <div className="text-center">
                  <div className="text-xs text-gray-500">Credits Earned</div>
                  <div className="font-semibold text-green-600">
                    {progress.creditsEarned}
                  </div>
                </div>
              )}

              {/* Back to Main App */}
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back to Main App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb (for deeper pages) */}
      {location.pathname !== '/fixed-content' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <Link to="/fixed-content" className="hover:text-gray-700">
                    Courses
                  </Link>
                </li>
                {location.pathname.includes('/subjects/') && (
                  <>
                    <span>/</span>
                    <li>
                      <Link to="/fixed-content/subjects" className="hover:text-gray-700">
                        Subjects
                      </Link>
                    </li>
                  </>
                )}
                {location.pathname.includes('/courses/') && (
                  <>
                    <span>/</span>
                    <li className="text-gray-900">Course</li>
                  </>
                )}
                {location.pathname.includes('/lessons/') && (
                  <>
                    <span>/</span>
                    <li className="text-gray-900">Lesson</li>
                  </>
                )}
                {location.pathname.includes('/dashboard') && (
                  <>
                    <span>/</span>
                    <li className="text-gray-900">Dashboard</li>
                  </>
                )}
              </ol>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Quick Stats */}
            {progress && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Learning Journey</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{progress.completedCourses}</div>
                    <div className="text-sm text-blue-700">Courses Completed</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{progress.creditsEarned}</div>
                    <div className="text-sm text-green-700">Credits Earned</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">{progress.completedLessons}</div>
                    <div className="text-sm text-purple-700">Lessons Completed</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(progress.timeSpent / 60)}h
                    </div>
                    <div className="text-sm text-orange-700">Time Invested</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900 block"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="/help" className="hover:text-gray-900">Help Center</Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-gray-900">Contact Support</Link>
                </li>
                <li>
                  <Link to="/feedback" className="hover:text-gray-900">Give Feedback</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Kiddos. Made with ❤️ for young learners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FixedContentLayout