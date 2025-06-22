import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Star, Users, CheckCircle } from 'lucide-react'

const CourseCard = ({ course, userProgress, language = 'en' }) => {
  const progress = userProgress ? userProgress.progress_percentage : 0
  const isCompleted = userProgress?.status === 'completed'
  const isEnrolled = !!userProgress

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getDifficultyColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    }
    return colors[level] || colors.beginner
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            {course.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {course.description}
              </p>
            )}
          </div>
          {isCompleted && (
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Course Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(course.estimated_duration_minutes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.age_group_min}-{course.age_group_max} years</span>
          </div>
          {course.lesson_count && (
            <div className="flex items-center gap-1">
              <span>{course.lesson_count} lessons</span>
            </div>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
            {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
          </span>
          {course.is_featured && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs font-medium">Featured</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Credits Info */}
        {course.credit_reward > 0 && (
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-gray-600">Earn on completion:</span>
            <span className="font-medium text-green-600">+{course.credit_reward} credits</span>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/fixed-content/courses/${course.id}`}
          className={`block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
            isCompleted 
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : isEnrolled 
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isCompleted ? 'Review Course' : isEnrolled ? 'Continue Learning' : 'Start Course'}
        </Link>
      </div>
    </div>
  )
}

export default CourseCard