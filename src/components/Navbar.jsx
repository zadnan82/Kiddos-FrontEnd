import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Home, 
  LayoutDashboard, 
  Users, 
  PenTool, 
  History, 
  Coins, 
  User,
  LogOut,
  ChevronDown,
  GraduationCap, // Icon for courses
  BookOpen      // NEW ICON for JSON courses
} from 'lucide-react'
import { useAuthStore } from '../stores/authstore'
import { useLanguageStore } from '../stores/languageStore'
import Button from './ui/Button'
import LanguageSwitch from './LanguageSwitch'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCoursesOpen, setIsCoursesOpen] = useState(false) // NEW: Courses dropdown
  
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { t, isRTL } = useLanguageStore()

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  // UPDATED: Navigation items with courses dropdown
  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/children', label: t('children'), icon: Users },
    { path: '/generate', label: t('generate'), icon: PenTool },
    { 
      path: '/fixed-content', 
      label: t('courses'), 
      icon: GraduationCap,
      hasDropdown: true, // NEW: Indicates this has a dropdown
      // In your Navbar component, update the dropdownItems:
dropdownItems: [
  { path: '/fixed-content', label: 'Database Courses', icon: GraduationCap },
  { path: '/json-course-test', label: 'JSON Course Test', icon: BookOpen } // Only this one works
]
    },
    { path: '/history', label: t('history'), icon: History },
    { path: '/credits', label: t('credits'), icon: Coins },
  ]

  // UPDATED: Check if current path is active (handle nested routes)
  const isActive = (path) => {
    if (path === '/fixed-content') {
      return location.pathname.startsWith('/fixed-content')
    }
    if (path === '/json-courses') {
      return location.pathname.startsWith('/json-courses')
    }
    return location.pathname === path
  }

  // NEW: Check if courses section is active
  const isCoursesActive = () => {
    return location.pathname.startsWith('/fixed-content') || 
           location.pathname.startsWith('/json-courses')
  }

  const renderNavItem = (item) => {
    if (item.hasDropdown) {
      return (
        <div key={item.path} className="relative">
          <button
            onClick={() => setIsCoursesOpen(!isCoursesOpen)}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              isCoursesActive()
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } ${isRTL() ? 'font-cairo' : ''}`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Courses Dropdown */}
          {isCoursesOpen && (
            <div className={`absolute ${isRTL() ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50`}>
              <div className="py-1">
                {item.dropdownItems.map((dropdownItem) => (
                  <Link
                    key={dropdownItem.path}
                    to={dropdownItem.path}
                    className={`flex items-center px-4 py-2 text-sm transition-colors ${
                      isActive(dropdownItem.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsCoursesOpen(false)}
                  >
                    <dropdownItem.icon className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                    {dropdownItem.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          isActive(item.path)
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } ${isRTL() ? 'font-cairo' : ''}`}
      >
        <item.icon className="w-4 h-4" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? '/dashboard' : '/'} 
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Kiddos</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              {navItems.map(renderNavItem)}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switch */}
            <LanguageSwitch />

            {isAuthenticated ? (
              // Authenticated user menu
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-3 py-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block">
                    {user?.first_name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div className={`absolute ${isRTL() ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50`}>
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        <div className="font-medium">{user?.first_name || 'User'}</div>
                        <div className="text-xs">{user?.email}</div>
                        <div className="text-xs mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {user?.credits || 0} {t('credits')}
                          </span>
                        </div>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                        {t('profile')}
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-3 rtl:ml-3 rtl:mr-0" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Guest user buttons
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isAuthenticated && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                if (item.hasDropdown) {
                  return (
                    <div key={item.path}>
                      <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </div>
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.path}
                          to={dropdownItem.path}
                          className={`flex items-center space-x-3 rtl:space-x-reverse px-6 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                            isActive(dropdownItem.path)
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } ${isRTL() ? 'font-cairo' : ''}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <dropdownItem.icon className="w-5 h-5" />
                          <span>{dropdownItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } ${isRTL() ? 'font-cairo' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileOpen || isCoursesOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileOpen(false)
            setIsCoursesOpen(false)
          }}
        />
      )}
    </nav>
  )
}

export default Navbar