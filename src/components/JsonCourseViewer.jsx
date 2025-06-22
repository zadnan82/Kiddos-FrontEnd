// src/components/JsonCourseViewer.jsx
import React, { useState, useEffect } from 'react'
import { fixedContentApi } from '../services/fixedContentApi'
import LoadingSpinner from './LoadingSpinner'
import { Play, ArrowLeft, Clock, BookOpen } from 'lucide-react'

const JsonCourseViewer = () => {
  const [courseData, setCourseData] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const ageGroup = 'age2-4'
  const subject = 'science' 
  const courseName = 'farm-animals'

  useEffect(() => {
    loadCourse()
  }, [])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const data = await fixedContentApi.getCourseFromFile(ageGroup, subject, courseName)
      setCourseData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const viewLesson = (lesson) => {
    setSelectedLesson(lesson)
  }

  const backToCourse = () => {
    setSelectedLesson(null)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error: {error}</div>
  if (!courseData) return <div>No course data found</div>

  // If a lesson is selected, show the lesson viewer
  if (selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button 
          onClick={backToCourse}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>

        {/* Lesson Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{selectedLesson.title_en}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Lesson {selectedLesson.lesson_order}
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
              {selectedLesson.lesson_type}
            </span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {selectedLesson.estimated_duration_minutes} minutes
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-lg border p-6">
          <LessonContentViewer content={selectedLesson.content_data} />
        </div>
      </div>
    )
  }

  // Show course overview
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{courseData.course.title_en}</h1>
      <p className="text-gray-600 mb-6">{courseData.course.description_en}</p>
      
      <div className="grid gap-4">
        {courseData.lessons.map((lesson, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{lesson.title_en}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="capitalize">{lesson.lesson_type}</span>
                  <span>{lesson.estimated_duration_minutes} minutes</span>
                </div>
              </div>
              <button 
                onClick={() => viewLesson(lesson)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Component to display lesson content
const LessonContentViewer = ({ content }) => {
  if (!content) return <div>No content available</div>

  return (
    <div className="space-y-6">
      {/* Story Title */}
      {content.title && (
        <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
      )}

      {/* Main Content */}
      {content.content && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {content.content}
            </div>
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      {content.learning_objectives && content.learning_objectives.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
          <ul className="space-y-2">
            {content.learning_objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary Words */}
      {content.vocabulary_words && content.vocabulary_words.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">New Words</h3>
          <div className="grid gap-3">
            {content.vocabulary_words.map((word, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-900">{word.word}</div>
                <div className="text-sm text-gray-600">{word.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {content.activities && content.activities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Activities</h3>
          <div className="space-y-4">
            {content.activities.map((activity, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{activity.title}</h4>
                {activity.description && (
                  <p className="text-gray-600 mb-3">{activity.description}</p>
                )}
                {activity.materials && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Materials needed:</div>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {activity.materials.map((material, idx) => (
                        <li key={idx}>{material}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activity.instructions && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Instructions:</div>
                    <p className="text-sm text-gray-600">{activity.instructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussion Questions */}
      {content.discussion_questions && content.discussion_questions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Discussion Questions</h3>
          <div className="space-y-2">
            {content.discussion_questions.map((question, index) => (
              <div key={index} className="bg-yellow-50 rounded-lg p-3">
                <div className="text-gray-800">💭 {question}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      {content.questions && content.questions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Quiz Questions</h3>
          <div className="space-y-4">
            {content.questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="font-medium mb-3">
                  Question {index + 1}: {question.question}
                </div>
                {question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs">
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span className={option === question.answer ? 'font-medium text-green-600' : ''}>
                          {option}
                        </span>
                        {option === question.answer && <span className="text-green-600">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
                {question.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                    💡 {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default JsonCourseViewer