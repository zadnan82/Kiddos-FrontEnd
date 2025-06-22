import React from 'react'
import { Link } from 'react-router-dom'
import { Play, CheckCircle, Clock, Lock } from 'lucide-react'

const LessonCard = ({ lesson, userProgress, isLocked = false, courseId }) => {
  const isCompleted = userProgress?.status === 'completed'
  const isInProgress = userProgress?.status === 'in_progress'
  const canAccess = !isLocked

  const getLessonTypeIcon = (type) => {
    const icons = {
      story: '📖',
      quiz: '❓',
      worksheet: '📝',
      activity: '🎯',
      video: '🎥',
      interactive: '🎮'
    }
    return icons[type] || '📚'
  }

  const getLessonTypeColor = (type) => {
    const colors = {
      story: 'bg-purple-100 text-purple-700',
      quiz: 'bg-blue-100 text-blue-700',
      worksheet: 'bg-green-100 text-green-700',
      activity: 'bg-orange-100 text-orange-700',
      video: 'bg-red-100 text-red-700',
      interactive: 'bg-indigo-100 text-indigo-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className={`bg-white rounded-lg border transition-all duration-200 ${
      canAccess ? 'hover:shadow-md cursor-pointer' : 'opacity-50'
    } ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${getLessonTypeColor(lesson.lesson_type)}`}>
              {getLessonTypeIcon(lesson.lesson_type)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
              <p className="text-sm text-gray-500">Lesson {lesson.lesson_order}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
            {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {lesson.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {lesson.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lesson.estimated_duration_minutes}m</span>
            </div>
            <span className="capitalize">{lesson.lesson_type}</span>
          </div>

          {canAccess ? (
            <Link
              to={`/fixed-content/lessons/${lesson.id}`}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isCompleted 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : isInProgress 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Review
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {isInProgress ? 'Continue' : 'Start'}
                </>
              )}
            </Link>
          ) : (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Progress indicator for in-progress lessons */}
        {isInProgress && userProgress?.score && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{userProgress.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full"
                style={{ width: `${userProgress.score}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonCard