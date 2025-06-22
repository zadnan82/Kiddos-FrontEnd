import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFixedContentStore } from '../stores/fixedContentStore'
import { useLanguageStore } from '../stores/languageStore'
import LessonViewer from '../components/LessonViewer'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const LessonDetail = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { 
    currentLesson, 
    currentCourse,
    loading, 
    error, 
    fetchLesson, 
    startLesson, 
    completeLesson 
  } = useFixedContentStore()
  const { language } = useLanguageStore()
  const [completionLoading, setCompletionLoading] = useState(false)

  useEffect(() => {
    const initLesson = async () => {
      try {
        await fetchLesson(lessonId)
        // Auto-start the lesson if not already started
        if (currentLesson && (!currentLesson.user_progress || currentLesson.user_progress.status === 'not_started')) {
          await startLesson(lessonId)
        }
      } catch (error) {
        console.error('Failed to initialize lesson:', error)
      }
    }

    initLesson()
  }, [lessonId, fetchLesson, startLesson])

  const handleComplete = async (completionData) => {
    try {
      setCompletionLoading(true)
      const result = await completeLesson(lessonId, {
        ...completionData,
        child_id: null // Add child selection if needed
      })
      
      // Show completion notification
      console.log('Lesson completed:', result)
      
      // Optionally navigate to next lesson or course
      // navigate('/fixed-content/courses/' + currentCourse?.id)
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    } finally {
      setCompletionLoading(false)
    }
  }

  const handleNext = () => {
    if (currentCourse?.lessons) {
      const currentIndex = currentCourse.lessons.findIndex(l => l.id === lessonId)
      const nextLesson = currentCourse.lessons[currentIndex + 1]
      
      if (nextLesson) {
        navigate(`/fixed-content/lessons/${nextLesson.id}`)
      } else {
        // Last lesson, go back to course
        navigate(`/fixed-content/courses/${currentCourse.id}`)
      }
    }
  }

  const handlePrevious = () => {
    if (currentCourse?.lessons) {
      const currentIndex = currentCourse.lessons.findIndex(l => l.id === lessonId)
      const prevLesson = currentCourse.lessons[currentIndex - 1]
      
      if (prevLesson) {
        navigate(`/fixed-content/lessons/${prevLesson.id}`)
      } else {
        // First lesson, go back to course
        navigate(`/fixed-content/courses/${currentCourse.id}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading lesson..." />
      </div>
    )
  }

  if (error || !currentLesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-4 text-lg font-medium">
            {error || 'Lesson not found'}
          </div>
          <Link 
            to="/fixed-content" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link 
            to="/fixed-content"
            className="text-blue-600 hover:text-blue-700"
          >
            Courses
          </Link>
          <span>/</span>
          {currentCourse && (
            <>
              <Link 
                to={`/fixed-content/courses/${currentCourse.id}`}
                className="text-blue-600 hover:text-blue-700"
              >
                {currentCourse.title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900">{currentLesson.title}</span>
        </div>
      </nav>

      {/* Lesson Header */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded">
                Lesson {currentLesson.lesson_order}
              </span>
              <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded capitalize">
                {currentLesson.lesson_type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentLesson.title}
            </h1>
            {currentLesson.description && (
              <p className="text-gray-600">
                {currentLesson.description}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Estimated time</div>
            <div className="text-lg font-semibold text-gray-900">
              {currentLesson.estimated_duration_minutes} min
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <LessonViewer
        lesson={currentLesson}
        onComplete={handleComplete}
        onNext={handleNext}
        onPrevious={handlePrevious}
        loading={completionLoading}
      />
    </div>
  )
}

export default LessonDetail