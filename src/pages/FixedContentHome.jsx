import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFixedContentStore } from '../stores/fixedContentStore'
import { useLanguageStore } from '../stores/languageStore'
import SubjectCard from '../components/SubjectCard'
import LoadingSpinner from '../components/LoadingSpinner'
import DebugFixedContent from '../components/DebugFixedContent'

const FixedContentHome = () => {
  const { subjects, loading, error, fetchSubjects } = useFixedContentStore()
  const { language, t } = useLanguageStore()

  useEffect(() => {
  const loadData = async () => {
    try {
      await fetchSubjects()
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }
  
  loadData()
}, []) // Remove fetchSubjects from dependencies to avoid loops


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => fetchSubjects()}
          className="btn btn-primary"
        >
          {t('common.tryAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('fixedContent.title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('fixedContent.subtitle')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {subjects.length}
          </div>
          <div className="text-gray-600">{t('fixedContent.subjects')}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {subjects.reduce((total, subject) => total + (subject.course_count || 0), 0)}
          </div>
          <div className="text-gray-600">{t('fixedContent.courses')}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {t('fixedContent.earnCredits')}
          </div>
          <div className="text-gray-600">{t('fixedContent.earnCreditsDesc')}</div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard 
            key={subject.id} 
            subject={subject}
            language={language}
          />
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <Link 
          to="/fixed-content/dashboard"
          className="btn btn-primary btn-lg"
        >
          {t('fixedContent.viewProgress')}
        </Link>
      </div>
      {process.env.NODE_ENV === 'development' && <DebugFixedContent />}
    </div>
  )
}

export default FixedContentHome