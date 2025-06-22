// src/components/JsonCourseDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom' 
import { ArrowLeft, Play, Clock, Users, BookOpen, Award } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import LessonViewer from './LessonViewer'

const JsonCourseDetail = () => {
  const { ageGroup, subject, courseName } = useParams()
  const [course, setCourse] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCourse()
  }, [ageGroup, subject, courseName])

  const loadCourse = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const jsonCourse = await contentLoader.loadCourse(ageGroup, subject, courseName)
      const courseData = contentLoader.transformCourseData(jsonCourse, courseName)
      setCourse(courseData)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const startLesson = (lesson) => {
    setSelectedLesson(lesson)
  }

  const handleLessonComplete = (completionData) => {
    console.log('Lesson completed:', completionData)
    // Handle lesson completion - could save to localStorage or update state
    setSelectedLesson(null)
  }

  const handleNextLesson = () => {
    if (!selectedLesson || !course?.lessons) return
    
    const currentIndex = course.lessons.findIndex(l => l.id === selectedLesson.id)
    const nextLesson = course.lessons[currentIndex + 1]
    
    if (nextLesson) {
      setSelectedLesson(nextLesson)
    } else {
      setSelectedLesson(null) // Back to course overview
    }
  }

  const handlePreviousLesson = () => {
    if (!selectedLesson || !course?.lessons) return
    
    const currentIndex = course.lessons.findIndex(l => l.id === selectedLesson.id)
    const prevLesson = course.lessons[currentIndex - 1]
    
    if (prevLesson) {
      setSelectedLesson(prevLesson)
    } else {
      setSelectedLesson(null) // Back to course overview
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error || 'Course not found'}</div>
          <Link 
            to="/json-courses"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  // If a lesson is selected, show the lesson viewer
  if (selectedLesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/json-courses" className="text-blue-600 hover:text-blue-700">
              Courses
            </Link>
            <span>/</span>
            <button 
              onClick={() => setSelectedLesson(null)}
              className="text-blue-600 hover:text-blue-700"
            >
              {course.title}
            </button>
            <span>/</span>
            <span className="text-gray-900">{selectedLesson.title}</span>
          </div>
        </nav>

        <LessonViewer
          lesson={selectedLesson}
          onComplete={handleLessonComplete}
          onNext={handleNextLesson}
          onPrevious={handlePreviousLesson}
        />
      </div>
    )
  }

  // Show course overview
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link 
          to="/json-courses"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
      </nav>

      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            
            {course.description && (
              <p className="text-lg text-gray-600 mb-6">
                {course.description}
              </p>
            )}

            {/* Course Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{Math.round(course.estimated_duration_minutes / 60)}h total</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Ages {course.age_group_min}-{course.age_group_max}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.lesson_count} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>+{course.credit_reward} credits</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Beginner Level
              </span>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:w-80">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Ready to start learning?</h3>
              <button
                onClick={() => startLesson(course.lessons[0])}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start First Lesson
              </button>
              <p className="text-sm text-gray-500 mt-2">
                JSON-based course content
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lessons</h2>
        
        <div className="space-y-4">
          {course.lessons.map((lesson, index) => (
            <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded">
                      Lesson {lesson.lesson_order}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded capitalize">
                      {lesson.lesson_type}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{lesson.title}</h3>
                  <p className="text-sm text-gray-600">{lesson.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <span>{lesson.estimated_duration_minutes} minutes</span>
                  </div>
                </div>
                
                <button
                  onClick={() => startLesson(lesson)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default JsonCourseDetail