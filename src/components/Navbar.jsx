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
  ChevronDown
} from 'lucide-react'
import { useAuthStore } from '../stores/authstore'
import { useLanguageStore } from '../stores/languageStore'
import Button from './ui/Button'
import LanguageSwitch from './LanguageSwitch'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { t, isRTL } = useLanguageStore()

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  // Navigation items for authenticated users
  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/children', label: t('children'), icon: Users },
    { path: '/generate', label: t('generate'), icon: PenTool },
    { path: '/history', label: t('history'), icon: History },
    { path: '/credits', label: t('credits'), icon: Coins },
  ]

  // Check if current path is active
  const isActive = (path) => location.pathname === path

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
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } ${isRTL() ? 'font-cairo' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
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
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } ${isRTL() ? 'font-cairo' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar