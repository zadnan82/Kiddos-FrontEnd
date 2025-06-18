
import React from 'react'
import { useLanguageStore } from '../stores/languageStore'
import { useAuthStore } from '../stores/authStore'

const Dashboard = () => {
  const { t, isRTL } = useLanguageStore()
  const { user } = useAuthStore()
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
            {t('welcomeBack')}, {user?.first_name || 'User'}!
          </h1>
          <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
            Welcome to your dashboard
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Credits</h3>
            <p className="text-3xl font-bold text-blue-600">{user?.credits || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Children</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This Week</h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <p className="text-gray-600 mb-4">Start by adding your first child profile and generate educational content!</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">• Add child profiles</p>
            <p className="text-sm text-gray-500">• Generate your first story or worksheet</p>
            <p className="text-sm text-gray-500">• Track your content history</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard