// Save this as: src/components/InteractiveQuiz.jsx

import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy,
  Star,
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react' 
import Button from '../components/ui/Button'

const InteractiveQuiz = ({ quizData, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [quizStartTime] = useState(Date.now())

  const currentQuestion = quizData.questions[currentQuestionIndex]
  const totalQuestions = quizData.questions.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const hasAnsweredCurrent = userAnswers[currentQuestionIndex] !== undefined

  // Smart answer checking for short answers
  const checkShortAnswer = (userAnswer, correctAnswer, question) => {
    if (!userAnswer || !correctAnswer) return false
    
    const userLower = userAnswer.toLowerCase().trim()
    const correctLower = correctAnswer.toLowerCase().trim()
    
    // Exact match
    if (userLower === correctLower) return true
    
    // For "name X animals" type questions - check if user listed valid animals
    if (question.question.toLowerCase().includes('name') && question.question.toLowerCase().includes('animal')) {
      const userAnimals = userLower.split(/[\s,]+/).filter(word => word.length > 2)
      const correctAnimals = correctLower.split(/[\s,]+/).filter(word => word.length > 2)
      
      // Check if user provided at least the requested number of valid animals
      const requestedNumber = question.question.match(/(\d+)/)?.[1]
      if (requestedNumber && userAnimals.length >= parseInt(requestedNumber)) {
        // Check if user's animals are in the correct answer or are common animals
        const commonAnimals = ['fish', 'shark', 'whale', 'dolphin', 'seal', 'penguin', 'otter', 'turtle', 'frog', 'duck', 'swan']
        const validUserAnimals = userAnimals.filter(animal => 
          correctAnimals.some(correct => correct.includes(animal) || animal.includes(correct)) ||
          commonAnimals.includes(animal)
        )
        
        if (validUserAnimals.length >= parseInt(requestedNumber)) return true
      }
    }
    
    // For descriptive questions - check if key concepts are mentioned
    if (question.question.toLowerCase().includes('special') || question.question.toLowerCase().includes('what')) {
      const keyWords = correctLower.split(/[\s,]+/).filter(word => word.length > 3)
      const userWords = userLower.split(/[\s,]+/)
      
      // If user mentioned any key concept, give partial credit
      const hasKeyword = keyWords.some(keyword => 
        userWords.some(userWord => 
          userWord.includes(keyword) || keyword.includes(userWord)
        )
      )
      
      if (hasKeyword) return true
    }
    
    // Check if user answer contains the main concept from correct answer
    const correctWords = correctLower.split(/[\s,]+/).filter(word => word.length > 3)
    const containsMainConcept = correctWords.some(word => userLower.includes(word))
    
    return containsMainConcept
  }

  // Calculate results with smart checking
  const calculateResults = () => {
    let correct = 0
    quizData.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index]
      
      if (question.type === 'multiple_choice') {
        if (userAnswer === question.answer) {
          correct++
        }
      } else if (question.type === 'short_answer') {
        if (checkShortAnswer(userAnswer, question.answer, question)) {
          correct++
        }
      }
    })
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100)
    }
  }

  const handleAnswerSelect = (answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true)
      const results = calculateResults()
      const timeSpent = Math.round((Date.now() - quizStartTime) / 1000)
      onComplete?.({ ...results, timeSpent, userAnswers })
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1)
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
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
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Complete! {getScoreEmoji(results.percentage)}
          </h2>
          
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(results.percentage)}`}>
            {results.correct}/{results.total}
          </div>
          
          <p className="text-xl text-gray-600">
            You scored {results.percentage}%
          </p>
          
          {results.percentage >= 80 && (
            <p className="text-green-600 font-medium mt-2">
              Excellent work! You really know your stuff! 🌟
            </p>
          )}
          
          {results.percentage >= 60 && results.percentage < 80 && (
            <p className="text-yellow-600 font-medium mt-2">
              Good job! Keep practicing to improve even more! 📚
            </p>
          )}
          
          {results.percentage < 60 && (
            <p className="text-blue-600 font-medium mt-2">
              Nice try! Practice makes perfect - try again! 💪
            </p>
          )}
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <h3 className="text-xl font-semibold">Review Your Answers</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {quizData.questions.map((question, index) => {
              const userAnswer = userAnswers[index]
              let isCorrect = false
              
              if (question.type === 'multiple_choice') {
                isCorrect = userAnswer === question.answer
              } else if (question.type === 'short_answer') {
                isCorrect = checkShortAnswer(userAnswer, question.answer, question)
              }
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-3">
                        Question {index + 1}: {question.question}
                      </p>
                      
                      {question.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isUserChoice = option === userAnswer
                            const isCorrectAnswer = option === question.answer
                            
                            return (
                              <div 
                                key={optIndex} 
                                className={`p-2 rounded border ${
                                  isCorrectAnswer 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : isUserChoice && !isCorrectAnswer
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    {String.fromCharCode(65 + optIndex)})
                                  </span>
                                  <span>{option}</span>
                                  {isCorrectAnswer && <span className="text-green-600">✅</span>}
                                  {isUserChoice && !isCorrectAnswer && <span className="text-red-600">❌</span>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {question.type === 'short_answer' && (
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
                                💡 Your answer shows good thinking! The expected answer included more details.
                              </p>
                            )}
                          </div>
                          
                          <div className="p-2 rounded border bg-blue-50 border-blue-200">
                            <p className="text-sm font-medium text-gray-700">Sample answer:</p>
                            <p className="text-blue-800">{question.answer}</p>
                          </div>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                          <p className="text-blue-700 text-sm">{question.explanation}</p>
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
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{quizData.title}</h2>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span className="font-medium">Question {currentQuestionIndex + 1}</span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>
          
          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = userAnswers[currentQuestionIndex] === option
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        <span className={`text-sm font-bold ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          
          {/* Short Answer Input */}
          {currentQuestion.type === 'short_answer' && (
            <div>
              <textarea
                value={userAnswers[currentQuestionIndex] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentQuestionIndex === 0}
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          Previous
        </Button>
        
        <div className="text-sm text-gray-500">
          {Object.keys(userAnswers).length} of {totalQuestions} answered
        </div>
        
        <Button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default InteractiveQuiz