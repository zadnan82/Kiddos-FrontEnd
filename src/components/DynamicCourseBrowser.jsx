// src/components/DynamicCourseBrowser.jsx
import React, { useState, useEffect } from 'react'
import { fixedContentApi } from '../services/fixedContentApi'
import LoadingSpinner from './LoadingSpinner'
import { Play, ArrowLeft, Clock, BookOpen, Filter, ChevronDown } from 'lucide-react'

const DynamicCourseBrowser = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Dynamic filters
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('age2-4')
  const [selectedSubject, setSelectedSubject] = useState('science')
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Available options
  const ageGroups = [
    { value: 'age2-4', label: 'Ages 2-4' },
    { value: 'age5-7', label: 'Ages 5-7' },
    { value: 'age8-10', label: 'Ages 8-10' },
    { value: 'age11-12', label: 'Ages 11-12' }
  ]

  const subjects = [
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'math', label: 'Math', icon: '🔢' },
    { value: 'language', label: 'Language', icon: '📚' },
    { value: 'art', label: 'Art', icon: '🎨' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'social_studies', label: 'Social Studies', icon: '🌍' }
  ]

  useEffect(() => {
    loadCourses()
  }, [selectedAgeGroup, selectedSubject])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fixedContentApi.listCoursesFromFiles(selectedAgeGroup, selectedSubject)
      
      console.log('API Response:', response)
      
      if (response && response.courses && Array.isArray(response.courses)) {
        const courseDetails = []
        
        for (const courseName of response.courses) {
          try {
            const courseData = await fixedContentApi.getCourseFromFile(selectedAgeGroup, selectedSubject, courseName)
            console.log(`Course data for ${courseName}:`, courseData)
            
            const courseInfo = {
              id: courseName,
              name: courseName,
              title: courseData.course.title_en,
              description: courseData.course.description_en,
              lesson_count: courseData.lessons.length,
              estimated_duration_minutes: courseData.course.estimated_duration_minutes,
              subject: selectedSubject,
              ageGroup: selectedAgeGroup
            }
            
            console.log(`Course info created:`, courseInfo)
            courseDetails.push(courseInfo)
          } catch (error) {
            console.error(`Failed to load course ${courseName}:`, error)
          }
        }
        
        console.log('Final course details:', courseDetails)
        setCourses(courseDetails)
      } else {
        setCourses([])
      }
    } catch (err) {
      console.error('Load courses error:', err)
      setError(err.message)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const loadCourse = async (courseName) => {
    try {
      setLoading(true)
      const courseData = await fixedContentApi.getCourseFromFile(selectedAgeGroup, selectedSubject, courseName)
      setSelectedCourse(courseData)
      setSelectedLesson(null)
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

  const backToCourses = () => {
    setSelectedCourse(null)
    setSelectedLesson(null)
  }

  const handleAgeGroupChange = (ageGroup) => {
    setSelectedAgeGroup(ageGroup)
    setSelectedCourse(null)
    setSelectedLesson(null)
  }

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject)
    setSelectedCourse(null)
    setSelectedLesson(null)
  }

  const getSubjectInfo = (subjectValue) => {
    return subjects.find(s => s.value === subjectValue) || { label: subjectValue, icon: '📖' }
  }

  const getAgeGroupLabel = (ageGroupValue) => {
    return ageGroups.find(ag => ag.value === ageGroupValue)?.label || ageGroupValue
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">Error: {error}</div>

  // Show lesson viewer
  if (selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button 
          onClick={backToCourse}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>

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

        <div className="bg-white rounded-lg border p-6">
          <LessonContentViewer content={selectedLesson.content_data} />
        </div>
      </div>
    )
  }

  // Show course detail
  if (selectedCourse) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button 
          onClick={backToCourses}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        <h1 className="text-3xl font-bold mb-4">{selectedCourse.course.title_en}</h1>
        <p className="text-gray-600 mb-6">{selectedCourse.course.description_en}</p>
        
        <div className="grid gap-4">
          {selectedCourse.lessons.map((lesson, index) => (
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

  // Show course list with filters
  const currentSubject = getSubjectInfo(selectedSubject)
  const currentAgeGroup = getAgeGroupLabel(selectedAgeGroup)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with current selection */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {currentSubject.icon} {currentSubject.label} Courses
        </h1>
        <p className="text-gray-600 mb-4">{currentAgeGroup} • Choose a course to start learning!</p>
        
        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          Change Subject or Age Group
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Subject and Age Group</h3>
          
          {/* Age Group Selection */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Age Group</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ageGroups.map((ageGroup) => (
                <button
                  key={ageGroup.value}
                  onClick={() => handleAgeGroupChange(ageGroup.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedAgeGroup === ageGroup.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {ageGroup.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div>
            <h4 className="font-medium mb-3">Subject</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.value}
                  onClick={() => handleSubjectChange(subject.value)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedSubject === subject.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{subject.icon}</div>
                  <div className="font-medium">{subject.label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowFilters(false)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="text-gray-500 mt-2">Loading {currentSubject.label.toLowerCase()} courses...</p>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && (
        <>
          {!Array.isArray(courses) || courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                No {currentSubject.label.toLowerCase()} courses available for {currentAgeGroup.toLowerCase()}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Try selecting a different subject or age group above
              </p>
              <button 
                onClick={loadCourses}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{currentSubject.icon}</span>
                        <span className="text-sm text-gray-500">{currentSubject.label}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {course.lesson_count} lessons
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.round(course.estimated_duration_minutes / 60)}h total
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => loadCourse(course.name)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Keep your existing LessonContentViewer component here...
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

export default DynamicCourseBrowser