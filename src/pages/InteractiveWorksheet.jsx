// Save this as: src/components/InteractiveWorksheet.jsx

import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy,
  FileText,
  ArrowRight,
  ArrowLeft,
  Clock,
  Lightbulb
} from 'lucide-react' 
import Button from '../components/ui/Button'

const InteractiveWorksheet = ({ worksheetData, onComplete, onBack }) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [worksheetStartTime] = useState(Date.now())

  // Convert questions to worksheet activities
  const activities = worksheetData.questions?.map((question, index) => ({
    id: index,
    type: question.type === 'multiple_choice' ? 'fill_blank' : 'short_answer',
    question: question.question,
    answer: question.answer,
    explanation: question.explanation,
    options: question.options,
    // Convert multiple choice to fill-in-the-blank by removing the answer from options
    blanks: question.type === 'multiple_choice' ? 
      question.question.replace(question.answer, '______') : 
      question.question
  })) || []

  const currentActivity = activities[currentActivityIndex]
  const totalActivities = activities.length
  const isLastActivity = currentActivityIndex === totalActivities - 1
  const hasAnsweredCurrent = userAnswers[currentActivityIndex] !== undefined

  // Smart answer checking (same as quiz)
  const checkAnswer = (userAnswer, correctAnswer, activity) => {
    if (!userAnswer || !correctAnswer) return false
    
    const userLower = userAnswer.toLowerCase().trim()
    const correctLower = correctAnswer.toLowerCase().trim()
    
    // Exact match
    if (userLower === correctLower) return true
    
    // Check if user answer contains the main concept
    const correctWords = correctLower.split(/[\s,]+/).filter(word => word.length > 2)
    const containsMainConcept = correctWords.some(word => userLower.includes(word))
    
    return containsMainConcept
  }

  const calculateResults = () => {
    let correct = 0
    activities.forEach((activity, index) => {
      const userAnswer = userAnswers[index]
      if (checkAnswer(userAnswer, activity.answer, activity)) {
        correct++
      }
    })
    return {
      correct,
      total: totalActivities,
      percentage: Math.round((correct / totalActivities) * 100)
    }
  }

  const handleAnswerSubmit = (answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentActivityIndex]: answer
    }))
  }

  const handleNext = () => {
    if (isLastActivity) {
      setShowResults(true)
      const results = calculateResults()
      const timeSpent = Math.round((Date.now() - worksheetStartTime) / 1000)
      onComplete?.({ ...results, timeSpent, userAnswers })
    } else {
      setCurrentActivityIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentActivityIndex(prev => prev - 1)
  }

  const handleRestart = () => {
    setCurrentActivityIndex(0)
    setUserAnswers({})
    setShowResults(false)
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreEmoji = (percentage) => {
    if (percentage >= 90) return '🏆'
    if (percentage >= 80) return '⭐'
    if (percentage >= 70) return '👍'
    if (percentage >= 60) return '😊'
    return '💪'
  }

  if (showResults) {
    const results = calculateResults()
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Worksheet Complete! {getScoreEmoji(results.percentage)}
          </h2>
          
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(results.percentage)}`}>
            {results.correct}/{results.total}
          </div>
          
          <p className="text-xl text-gray-600">
            You completed {results.percentage}% correctly
          </p>
          
          {results.percentage >= 80 && (
            <p className="text-green-600 font-medium mt-2">
              Fantastic work! You've mastered this topic! 🌟
            </p>
          )}
          
          {results.percentage >= 60 && results.percentage < 80 && (
            <p className="text-yellow-600 font-medium mt-2">
              Great effort! Keep practicing to improve! 📚
            </p>
          )}
          
          {results.percentage < 60 && (
            <p className="text-blue-600 font-medium mt-2">
              Good try! Practice makes perfect - try again! 💪
            </p>
          )}
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
            <h3 className="text-xl font-semibold">Review Your Work</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {activities.map((activity, index) => {
              const userAnswer = userAnswers[index]
              const isCorrect = checkAnswer(userAnswer, activity.answer, activity)
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-3">
                        Activity {index + 1}: {activity.question}
                      </p>
                      
                      <div className="space-y-2">
                        <div className={`p-2 rounded border ${
                          isCorrect 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <p className="text-sm font-medium text-gray-700">Your answer:</p>
                          <p className={isCorrect ? 'text-green-800' : 'text-yellow-800'}>
                            {userAnswer || 'No answer provided'}
                          </p>
                          {!isCorrect && userAnswer && (
                            <p className="text-xs text-yellow-700 mt-1">
                              💡 Good thinking! Here's what we were looking for:
                            </p>
                          )}
                        </div>
                        
                        <div className="p-2 rounded border bg-blue-50 border-blue-200">
                          <p className="text-sm font-medium text-gray-700">Expected answer:</p>
                          <p className="text-blue-800">{activity.answer}</p>
                        </div>
                      </div>
                      
                      {activity.explanation && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                          <p className="text-sm font-medium text-purple-800 mb-1">Learn more:</p>
                          <p className="text-purple-700 text-sm">{activity.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRestart}
            variant="outline"
            icon={<RotateCcw className="w-5 h-5" />}
            className="px-6"
          >
            Try Again
          </Button>
          
          <Button
            onClick={onBack}
            icon={<ArrowLeft className="w-5 h-5" />}
            className="px-6"
          >
            Back to Content
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{worksheetData.title}</h2>
          <span className="text-sm text-gray-500">
            Activity {currentActivityIndex + 1} of {totalActivities}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentActivityIndex + 1) / totalActivities) * 100}%` }}
          />
        </div>
      </div>

      {/* Activity Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Activity {currentActivityIndex + 1}</span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentActivity.question}
          </h3>
          
          {/* Fill in the blank style */}
          {currentActivity.type === 'fill_blank' && currentActivity.options && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">Choose the correct answer:</p>
                <div className="grid grid-cols-2 gap-3">
                  {currentActivity.options.map((option, index) => {
                    const isSelected = userAnswers[currentActivityIndex] === option
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSubmit(option)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Text input for short answers */}
          {currentActivity.type === 'short_answer' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="block text-green-800 font-medium mb-2">
                  Write your answer:
                </label>
                <input
                  type="text"
                  value={userAnswers[currentActivityIndex] || ''}
                  onChange={(e) => handleAnswerSubmit(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
          )}
          
          {/* Helpful hint */}
          {currentActivity.explanation && !hasAnsweredCurrent && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Hint:</p>
                  <p className="text-yellow-700 text-sm">{currentActivity.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentActivityIndex === 0}
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          Previous
        </Button>
        
        <div className="text-sm text-gray-500">
          {Object.keys(userAnswers).length} of {totalActivities} completed
        </div>
        
        <Button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          {isLastActivity ? 'Finish Worksheet' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default InteractiveWorksheet