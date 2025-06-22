import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, Award, ArrowLeft, ArrowRight } from 'lucide-react'

const LessonViewer = ({ lesson, onComplete, onNext, onPrevious }) => {
  const [currentSection, setCurrentSection] = useState('content')
  const [answers, setAnswers] = useState({})
  const [startTime] = useState(Date.now())
  const [isCompleted, setIsCompleted] = useState(false)

  const sections = ['content', 'activities', 'assessment']

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleComplete = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60) // minutes
    const score = calculateScore()
    
    onComplete({
      score,
      time_spent_minutes: timeSpent,
      responses: answers
    })
    
    setIsCompleted(true)
  }

  const calculateScore = () => {
    if (!lesson.content?.questions) return null
    
    const questions = lesson.content.questions
    const correctAnswers = Object.entries(answers).filter(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId)
      return question && question.answer === answer
    }).length
    
    return Math.round((correctAnswers / questions.length) * 100)
  }

  const renderContent = () => {
    const content = lesson.content

    switch (currentSection) {
      case 'content':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-6">{content.title}</h2>
            
            {/* Story Content */}
            {content.content && (
              <div className="mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {content.content}
                  </div>
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {content.learning_objectives && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">What You'll Learn</h3>
                <ul className="space-y-2">
                  {content.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Generated Images */}
            {content.generated_images && content.generated_images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Story Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.generated_images.map((image, index) => (
                    <div key={index} className="bg-white rounded-lg border p-4">
                      <img 
                        src={image.image_url} 
                        alt={image.description}
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                      <p className="text-sm text-gray-600">{image.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'activities':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Activities</h2>
            {content.activities && content.activities.length > 0 ? (
              <div className="space-y-6">
                {content.activities.map((activity, index) => (
                  <div key={index} className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-3">{activity.title}</h3>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    
                    {activity.materials && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Materials Needed:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {activity.materials.map((material, idx) => (
                            <li key={idx}>{material}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {activity.instructions && (
                      <div>
                        <h4 className="font-medium mb-2">Instructions:</h4>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                          {activity.instructions}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No activities available for this lesson.</p>
              </div>
            )}
          </div>
        )

      case 'assessment':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Assessment</h2>
            {content.questions && content.questions.length > 0 ? (
              <div className="space-y-6">
                {content.questions.map((question, index) => (
                  <div key={question.id || index} className="bg-white rounded-lg border p-6">
                    <h3 className="font-medium mb-4">
                      Question {index + 1}: {question.question}
                    </h3>
                    
                    {question.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question_${question.id || index}`}
                              value={option}
                              onChange={(e) => handleAnswerChange(question.id || index, e.target.value)}
                              className="w-4 h-4"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        placeholder="Type your answer here..."
                        value={answers[question.id || index] || ''}
                        onChange={(e) => handleAnswerChange(question.id || index, e.target.value)}
                        className="w-full p-3 border rounded-lg"
                        rows={3}
                      />
                    )}
                    
                    {question.explanation && answers[question.id || index] && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {!isCompleted && (
                  <button
                    onClick={handleComplete}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Complete Lesson
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No assessment questions for this lesson.</p>
                {!isCompleted && (
                  <button
                    onClick={handleComplete}
                    className="mt-4 bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Navigation */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="flex">
          {sections.map((section, index) => (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                currentSection === section
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              } ${index === 0 ? 'rounded-l-lg' : index === sections.length - 1 ? 'rounded-r-lg' : ''}`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        {renderContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Lesson
        </button>

        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600">
            <Award className="w-5 h-5" />
            <span className="font-medium">Lesson Completed!</span>
          </div>
        )}

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next Lesson
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default LessonViewer