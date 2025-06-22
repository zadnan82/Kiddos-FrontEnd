import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFixedContentStore } from '../stores/fixedContentStore'
import { useLanguageStore } from '../stores/languageStore'
import LessonCard from '../components/LessonCard'
import ProgressBar from '../components/ProgressBar'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Award, 
  Play, 
  CheckCircle,
  BookOpen,
  Star
} from 'lucide-react'

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { 
    currentCourse, 
    userProgress, 
    loading, 
    error, 
    fetchCourse, 
    enrollInCourse, 
    fetchUserProgress 
  } = useFixedContentStore()
  const { language } = useLanguageStore()
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchCourse(courseId)
    fetchUserProgress()
  }, [courseId, fetchCourse, fetchUserProgress])

  const courseProgress = userProgress[courseId]
  const isEnrolled = !!courseProgress
  const isCompleted = courseProgress?.status === 'completed'

  const handleEnroll = async () => {
    try {
      setEnrolling(true)
      await enrollInCourse(courseId)
      // Refresh course data to get lessons
      await fetchCourse(courseId)
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const startFirstLesson = () => {
    if (currentCourse?.lessons && currentCourse.lessons.length > 0) {
      const firstLesson = currentCourse.lessons.find(lesson => lesson.lesson_order === 1)
      if (firstLesson) {
        navigate(`/fixed-content/lessons/${firstLesson.id}`)
      }
    }
  }

  const continueFromLastLesson = () => {
    if (currentCourse?.lessons && courseProgress) {
      // Find the next incomplete lesson
      const nextLesson = currentCourse.lessons.find(lesson => {
        const lessonProgress = courseProgress.lesson_progress?.find(lp => lp.lesson_id === lesson.id)
        return !lessonProgress || lessonProgress.status !== 'completed'
      })
      
      if (nextLesson) {
        navigate(`/fixed-content/lessons/${nextLesson.id}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading course..." />
      </div>
    )
  }

  if (error || !currentCourse) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Course not found'}</div>
        <Link to="/fixed-content" className="btn btn-primary">
          Back to Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link 
          to="/fixed-content"
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
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentCourse.title}
              </h1>
              {currentCourse.is_featured && (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  Featured
                </div>
              )}
            </div>
            
            {currentCourse.description && (
              <p className="text-lg text-gray-600 mb-6">
                {currentCourse.description}
              </p>
            )}

            {/* Course Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{Math.round(currentCourse.estimated_duration_minutes / 60)}h total</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Ages {currentCourse.age_group_min}-{currentCourse.age_group_max}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{currentCourse.lesson_count} lessons</span>
              </div>
              {currentCourse.credit_reward > 0 && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>+{currentCourse.credit_reward} credits</span>
                </div>
              )}
            </div>

            {/* Difficulty Badge */}
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentCourse.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                currentCourse.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentCourse.difficulty_level.charAt(0).toUpperCase() + currentCourse.difficulty_level.slice(1)}
              </span>
            </div>

            {/* Progress */}
            {isEnrolled && (
              <div className="mb-6">
                <ProgressBar
                  current={courseProgress.lessons_completed}
                  total={courseProgress.total_lessons}
                  label="Course Progress"
                  color="blue"
                  size="md"
                />
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600 mt-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Course Completed!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="lg:w-80">
            <div className="bg-gray-50 rounded-lg p-6">
              {!isEnrolled ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Ready to start learning?</h3>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Free to enroll • Earn credits on completion
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">
                    {isCompleted ? 'Review Course' : 'Continue Learning'}
                  </h3>
                  <button
                    onClick={courseProgress.lessons_completed === 0 ? startFirstLesson : continueFromLastLesson}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {courseProgress.lessons_completed === 0 ? 'Start First Lesson' : 'Continue'}
                  </button>
                  
                  {courseProgress.lessons_completed > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Last accessed: {new Date(courseProgress.last_accessed_at).toLocaleDateString()}</p>
                      <p>Time spent: {Math.round(courseProgress.total_time_spent_minutes / 60)}h</p>
                      {courseProgress.average_score && (
                        <p>Average score: {Math.round(courseProgress.average_score)}%</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      {currentCourse.lessons && currentCourse.lessons.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lessons</h2>
          
          <div className="space-y-4">
            {currentCourse.lessons
              .sort((a, b) => a.lesson_order - b.lesson_order)
              .map((lesson, index) => {
                const lessonProgress = courseProgress?.lesson_progress?.find(
                  lp => lp.lesson_id === lesson.id
                )
                const isLocked = !isEnrolled || (index > 0 && !courseProgress?.lesson_progress?.find(
                  lp => lp.lesson_id === currentCourse.lessons[index - 1].id && lp.status === 'completed'
                ))
                
                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    userProgress={lessonProgress}
                    isLocked={isLocked}
                    courseId={courseId}
                  />
                )
              })}
          </div>
        </div>
      )}

      {/* Prerequisites */}
      {currentCourse.prerequisite && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Prerequisites</h3>
          <p className="text-yellow-700">
            Complete "{currentCourse.prerequisite.title}" before starting this course.
          </p>
          <Link
            to={`/fixed-content/courses/${currentCourse.prerequisite.id}`}
            className="inline-block mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            View Prerequisite Course
          </Link>
        </div>
      )}
    </div>
  )
}

export default CourseDetail