// src/components/SubjectCourseBrowser.jsx
import React, { useState, useEffect } from 'react'
import { fixedContentApi } from '../services/fixedContentApi'
import LoadingSpinner from './LoadingSpinner'
import { 
  Play, 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Users,
  ChevronRight,
  Star,
  Award
} from 'lucide-react'

const SubjectCourseBrowser = () => {
  const [view, setView] = useState('subjects') // 'subjects' | 'courses' | 'course-detail' | 'lesson'
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('age2-4')
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Available subjects with their metadata
  // Update your subjects array in DynamicCourseBrowser.jsx or SubjectCourseBrowser.jsx

// In your DynamicCourseBrowser.jsx or SubjectCourseBrowser.jsx
const subjects = [
  { value: 'science', label: 'Science', icon: '🔬' },
  { value: 'math', label: 'Math', icon: '🔢' },
  { value: 'language_arts', label: 'Language Arts', icon: '📚' },  // Note: underscore
  { value: 'social_studies', label: 'Social Studies', icon: '🌍' }, // Note: underscore
  { value: 'art', label: 'Art', icon: '🎨' },
  { value: 'music', label: 'Music', icon: '🎵' }
]

  // Available age groups
  const ageGroups = [
    { value: 'age2-4', label: 'Ages 2-4', description: 'Toddlers & Preschoolers' },
    { value: 'age5-7', label: 'Ages 5-7', description: 'Early Elementary' },
    { value: 'age8-10', label: 'Ages 8-10', description: 'Middle Elementary' },
    { value: 'age11-12', label: 'Ages 11-12', description: 'Upper Elementary' }
  ]

  const loadCoursesForSubject = async (subject, ageGroup) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fixedContentApi.listCoursesFromFiles(ageGroup, subject)
      
      if (response && response.courses && Array.isArray(response.courses)) {
        const courseDetails = []
        
        for (const courseName of response.courses) {
          try {
            const courseData = await fixedContentApi.getCourseFromFile(ageGroup, subject, courseName)
            
            const courseInfo = {
              id: courseName,
              name: courseName,
              title: courseData.course.title_en,
              description: courseData.course.description_en,
              lesson_count: courseData.lessons.length,
              estimated_duration_minutes: courseData.course.estimated_duration_minutes,
              subject: subject,
              ageGroup: ageGroup,
              rawData: courseData
            }
            
            courseDetails.push(courseInfo)
          } catch (error) {
            console.error(`Failed to load course ${courseName}:`, error)
          }
        }
        
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

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject)
    setView('courses')
    loadCoursesForSubject(subject.value, selectedAgeGroup)
  }

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
    setView('course-detail')
  }

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson)
    setView('lesson')
  }

  const handleBackToSubjects = () => {
    setView('subjects')
    setSelectedSubject(null)
    setCourses([])
  }

  const handleBackToCourses = () => {
    setView('courses')
    setSelectedCourse(null)
    setSelectedLesson(null)
  }

  const handleBackToCourse = () => {
    setView('course-detail')
    setSelectedLesson(null)
  }

  const handleAgeGroupChange = (ageGroup) => {
    setSelectedAgeGroup(ageGroup)
    if (selectedSubject) {
      loadCoursesForSubject(selectedSubject.value, ageGroup)
    }
  }

  const getCurrentAgeGroup = () => {
    return ageGroups.find(ag => ag.value === selectedAgeGroup) || ageGroups[0]
  }

  // Render lesson view
  if (view === 'lesson' && selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button onClick={handleBackToSubjects} className="text-blue-600 hover:text-blue-700">
              Subjects
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={handleBackToCourses} className="text-blue-600 hover:text-blue-700">
              {selectedSubject?.label}
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={handleBackToCourse} className="text-blue-600 hover:text-blue-700">
              {selectedCourse?.title}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{selectedLesson.title_en}</span>
          </div>

          <button 
            onClick={handleBackToCourse}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>
        </nav>

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

  // Render course detail view
  if (view === 'course-detail' && selectedCourse) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button onClick={handleBackToSubjects} className="text-blue-600 hover:text-blue-700">
              Subjects
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={handleBackToCourses} className="text-blue-600 hover:text-blue-700">
              {selectedSubject?.label}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{selectedCourse.title}</span>
          </div>

          <button 
            onClick={handleBackToCourses}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {selectedSubject?.label} Courses
          </button>
        </nav>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{selectedSubject?.icon}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{selectedCourse.title}</h1>
              <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {selectedCourse.lesson_count} lessons
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.round(selectedCourse.estimated_duration_minutes / 60)}h total
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {getCurrentAgeGroup().label}
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Complete for rewards
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Course Lessons</h2>
          {selectedCourse.rawData.lessons.map((lesson, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                  <h3 className="font-semibold mb-1">{lesson.title_en}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{lesson.estimated_duration_minutes} minutes</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleLessonSelect(lesson)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render courses list view
  if (view === 'courses' && selectedSubject) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button onClick={handleBackToSubjects} className="text-blue-600 hover:text-blue-700">
              Subjects
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{selectedSubject.label}</span>
          </div>

          <button 
            onClick={handleBackToSubjects}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </button>
        </nav>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{selectedSubject.icon}</div>
            <div>
              <h1 className="text-3xl font-bold">{selectedSubject.label} Courses</h1>
              <p className="text-gray-600">{selectedSubject.description}</p>
            </div>
          </div>

          {/* Age Group Selector */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium mb-3">Select Age Group</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ageGroups.map((ageGroup) => (
                <button
                  key={ageGroup.value}
                  onClick={() => handleAgeGroupChange(ageGroup.value)}
                  className={`p-3 rounded-lg border text-sm transition-colors ${
                    selectedAgeGroup === ageGroup.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{ageGroup.label}</div>
                  <div className="text-xs opacity-75">{ageGroup.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Loading {selectedSubject.label.toLowerCase()} courses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <button 
              onClick={() => loadCoursesForSubject(selectedSubject.value, selectedAgeGroup)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No {selectedSubject.label} Courses Available
                </h3>
                <p className="text-gray-500 mb-4">
                  No courses found for {getCurrentAgeGroup().label.toLowerCase()}
                </p>
                <p className="text-sm text-gray-400">
                  Try selecting a different age group or check back later
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${selectedSubject.color}`}>
                        {selectedSubject.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lesson_count} lessons
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round(course.estimated_duration_minutes / 60)}h
                          </div>
                        </div>

                        <button 
                          onClick={() => handleCourseSelect(course)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Start Course
                        </button>
                      </div>
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

  // Render subjects grid (default view)
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Learning Subjects</h1>
        <p className="text-gray-600 text-lg">Choose a subject to explore courses and start learning!</p>
      </div>

      {/* Age Group Selector */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Age Group</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ageGroups.map((ageGroup) => (
            <button
              key={ageGroup.value}
              onClick={() => setSelectedAgeGroup(ageGroup.value)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedAgeGroup === ageGroup.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">{ageGroup.label}</div>
              <div className="text-sm opacity-75">{ageGroup.description}</div>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Currently viewing content for: <span className="font-medium">{getCurrentAgeGroup().label}</span>
        </p>
      </div>

      {/* Subjects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <button
            key={subject.value}
            onClick={() => handleSubjectSelect(subject)}
            className="bg-white border rounded-xl p-6 text-left hover:shadow-lg transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl ${subject.color}`}>
                {subject.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                  {subject.label}
                </h3>
                <p className="text-gray-600 text-sm">{subject.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Explore courses</span>
              <ChevronRight className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Featured Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center">
          <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Start Your Learning Journey</h2>
          <p className="text-gray-600 mb-4">
            Choose any subject above to begin exploring age-appropriate courses designed for {getCurrentAgeGroup().description.toLowerCase()}.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Interactive lessons
            </div>
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4" />
              Engaging activities
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              Progress tracking
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// LessonContentViewer component (same as before)
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

export default SubjectCourseBrowser