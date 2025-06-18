import React from 'react'
import { useLanguageStore } from '../stores/languageStore'

const ContentGeneration = () => {
  const { t, isRTL } = useLanguageStore()
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl font-bold text-gray-900 mb-8 ${isRTL() ? 'font-cairo' : ''}`}>
          {t('generate')}
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Content generation coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default ContentGeneration
