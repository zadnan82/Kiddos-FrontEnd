import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Activity,
  Wand2,
  Users,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useLanguageStore } from '../stores/languageStore'
import { useAuthStore } from '../stores/authStore' // FIXED: Added missing import
import { contentAPI, childrenAPI } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const ContentGeneration = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { t, isRTL } = useLanguageStore()
  
  const [children, setChildren] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState(null)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [step, setStep] = useState('form') // form, generating, review, complete
  const [pollAttempts, setPollAttempts] = useState(0) // FIXED: Track polling attempts
  const [maxPollAttempts] = useState(60) // FIXED: Maximum 2 minutes of polling

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      content_type: searchParams.get('type') || 'story',
      language: 'ar',
      age_group: 6,
      difficulty_level: 'age_appropriate',
      include_questions: true,
      include_activity: false
    }
  })

  const watchedValues = watch()

  useEffect(() => {
    loadChildren()
  }, [])

  // FIXED: Better polling logic with proper cleanup
  useEffect(() => {
    let interval
    if (sessionId && isGenerating && step === 'generating') {
      console.log('Starting polling for session:', sessionId)
      interval = setInterval(() => {
        checkGenerationStatus()
      }, 3000) // FIXED: Increased to 3 seconds to reduce load
    }
    
    return () => {
      if (interval) {
        console.log('Cleaning up polling interval')
        clearInterval(interval)
      }
    }
  }, [sessionId, isGenerating, step])

  const loadChildren = async () => {
    try {
      const response = await childrenAPI.getChildren()
      setChildren(response.data)
    } catch (error) {
      console.error('Failed to load children:', error)
      // Don't show error toast for this as it's not critical
    }
  }

  const checkGenerationStatus = async () => {
    if (!sessionId) {
      console.warn('No session ID for status check')
      return
    }

    console.log(`Checking status for session ${sessionId}, attempt ${pollAttempts + 1}`)

    // FIXED: Stop polling after max attempts
    if (pollAttempts >= maxPollAttempts) {
      console.error('Max polling attempts reached')
      setIsGenerating(false)
      setStep('form')
      setPollAttempts(0)
      toast.error('Content generation timed out. Please try again.')
      return
    }

    try {
      const response = await contentAPI.getStatus(sessionId)
      const status = response.data

      console.log('Status response:', status)
      setGenerationStatus(status)
      
      // FIXED: Increment counter AFTER successful API call
      setPollAttempts(prev => {
        const newCount = prev + 1
        console.log(`Poll attempt ${newCount} of ${maxPollAttempts}`)
        return newCount
      })

      if (status.status === 'completed' && status.content) {
        console.log('Content generation completed successfully')
        setGeneratedContent(status.content)
        setIsGenerating(false)
        setStep('review')
        setPollAttempts(0) // Reset counter
      } else if (status.status === 'failed') {
        console.error('Content generation failed:', status.error_message)
        setIsGenerating(false)
        setStep('form')
        setPollAttempts(0) // Reset counter
        toast.error(status.error_message || 'Content generation failed')
      } else if (status.status === 'processing') {
        console.log('Content still processing...')
        // Continue polling
      } else {
        console.log('Status:', status.status, 'continuing to poll...')
        // Continue polling for pending status
      }
    } catch (error) {
      console.error('Failed to check status:', error)
      
      // FIXED: Increment counter even on error
      setPollAttempts(prev => {
        const newCount = prev + 1
        console.log(`Poll error attempt ${newCount}`)
        
        // Stop polling after multiple failures
        if (newCount >= 5) {
          console.error('Too many status check failures, stopping polling')
          setIsGenerating(false)
          setStep('form')
          toast.error('Failed to check generation status. Please try again.')
          return 0 // Reset counter
        }
        
        return newCount
      })
    }
  }

  const onSubmit = async (data) => {
    console.log('Form data being submitted:', data)
    
    if (user?.credits < getRequiredCredits(data.content_type)) {
      toast.error('Insufficient credits for this content type')
      navigate('/credits')
      return
    }

    try {
      setIsGenerating(true)
      setStep('generating')
      setPollAttempts(0) // FIXED: Reset counter
      
      console.log('Sending to API:', data)
      const response = await contentAPI.generate(data)
      const newSessionId = response.data.session_id
      
      console.log('Generation started, session ID:', newSessionId)
      setSessionId(newSessionId)
      
      toast.success('Content generation started!')
    } catch (error) {
      console.error('API Error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      setIsGenerating(false)
      setStep('form')
      setPollAttempts(0) // FIXED: Reset counter
      
      // FIXED: Better error handling
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers['retry-after'] || '60'
        toast.error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`)
      } else {
        toast.error(error.response?.data?.detail || 'Failed to start generation')
      }
    }
  }

  // FIXED: Debug function to check rate limits
  const debugRateLimit = async () => {
    try {
      // Check current user's rate limit status
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/user/limits`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Rate Limit Info:', data)
        toast.success(`Rate limits checked - see console for details`)
      } else {
        console.error('Rate limit check failed:', response.status, response.statusText)
        toast.error(`Rate limit check failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Debug request failed:', error)
      toast.error('Debug request failed')
    }
  }

  const handleApprove = async (approved, feedback = '') => {
    if (!sessionId) return
    
    try {
      await contentAPI.approve(sessionId, { approved, feedback })
      
      if (approved) {
        toast.success('Content approved and saved!')
        setStep('complete')
      } else {
        toast.success('Content rejected. You can regenerate with feedback.')
        setStep('form')
        // Reset state for new generation
        setSessionId(null)
        setGeneratedContent(null)
        setGenerationStatus(null)
      }
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Failed to process approval')
    }
  }

  const handleRegenerate = async (feedback) => {
    if (!sessionId) return
    
    try {
      setIsGenerating(true)
      setStep('generating')
      setPollAttempts(0) // Reset counter
      
      await contentAPI.regenerate(sessionId, { feedback })
      toast.success('Regenerating content with your feedback...')
    } catch (error) {
      console.error('Regenerate error:', error)
      setIsGenerating(false)
      setStep('review')
      toast.error(error.response?.data?.detail || 'Failed to regenerate')
    }
  }

  const getRequiredCredits = (contentType) => {
    const costs = {
      story: 1,
      worksheet: 2,
      quiz: 2,
      exercise: 1
    }
    return costs[contentType] || 1
  }

  const contentTypes = [
    {
      id: 'story',
      name: t('story'),
      description: 'Engaging narratives that teach and entertain',
      icon: BookOpen,
      color: 'from-green-400 to-green-600',
      credits: 1
    },
    {
      id: 'worksheet',
      name: t('worksheet'),
      description: 'Interactive exercises for hands-on learning',
      icon: FileText,
      color: 'from-blue-400 to-blue-600',
      credits: 2
    },
    {
      id: 'quiz',
      name: t('quiz'),
      description: 'Fun assessments to test knowledge',
      icon: HelpCircle,
      color: 'from-purple-400 to-purple-600',
      credits: 2
    },
    {
      id: 'exercise',
      name: t('exercise'),
      description: 'Practical activities for skill building',
      icon: Activity,
      color: 'from-orange-400 to-orange-600',
      credits: 1
    }
  ]

  const ContentTypeCard = ({ type, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} mb-4`}>
        <type.icon className="w-6 h-6 text-white" />
      </div>
      <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
        {type.name}
      </h3>
      <p className="text-gray-600 text-sm mb-3">
        {type.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-600">
          {type.credits} {type.credits === 1 ? 'credit' : 'credits'}
        </span>
        {isSelected && (
          <CheckCircle className="w-5 h-5 text-blue-500" />
        )}
      </div>
    </div>
  )

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce" />
              </div>
            </div>
            
            <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Creating Your Content
            </h2>
            <p className={`text-gray-600 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
              Our AI is carefully crafting personalized educational content for your child...
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Estimated time: {generationStatus?.estimated_completion_time || 30} seconds
                </span>
              </div>
              
              {generationStatus && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationStatus.progress_percentage || 0}%` }}
                  />
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Attempt {pollAttempts} of {maxPollAttempts}
              </div>
              
              {/* FIXED: Add cancel button */}
              <Button
                variant="outline"
                onClick={() => {
                  setIsGenerating(false)
                  setStep('form')
                  setSessionId(null)
                  setPollAttempts(0)
                  toast.info('Content generation cancelled')
                }}
                className="mt-4"
              >
                Cancel Generation
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'review' && generatedContent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className={`text-2xl font-bold mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                Review Your Content
              </h2>
              <p className={isRTL() ? 'font-cairo' : ''}>
                Please review the generated content before approving
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
                  {generatedContent.title}
                </h3>
                <div className={`prose max-w-none ${isRTL() ? 'font-cairo' : ''}`}>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {generatedContent.content}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => handleApprove(true)}
                  className="flex-1"
                  icon={<CheckCircle className="w-5 h-5" />}
                >
                  Approve & Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleApprove(false)}
                  className="flex-1"
                  icon={<RefreshCw className="w-5 h-5" />}
                >
                  Reject & Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              Content Created Successfully!
            </h2>
            <p className={`text-gray-600 mb-8 ${isRTL() ? 'font-cairo' : ''}`}>
              Your educational content has been saved and is ready for your child.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/history')}
                variant="outline"
                className="flex-1"
              >
                View in History
              </Button>
              <Button
                onClick={() => {
                  setStep('form')
                  setGeneratedContent(null)
                  setSessionId(null)
                  setGenerationStatus(null)
                  setPollAttempts(0)
                }}
                className="flex-1"
              >
                Create More Content
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
            {t('generate')} Educational Content
          </h1>
          <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
            Create personalized learning materials for your children
          </p>
        </div>

        {/* Credits Warning */}
        {user?.credits < 5 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className={`text-yellow-800 font-medium ${isRTL() ? 'font-cairo' : ''}`}>
                  Low Credits Warning
                </p>
                <p className={`text-yellow-700 text-sm ${isRTL() ? 'font-cairo' : ''}`}>
                  You have {user?.credits || 0} credits remaining. Consider purchasing more credits to continue creating content.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Content Type Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              1. Choose Content Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contentTypes.map((type) => (
                <ContentTypeCard
                  key={type.id}
                  type={type}
                  isSelected={watchedValues.content_type === type.id}
                  onClick={() => setValue('content_type', type.id)}
                />
              ))}
            </div>
            <input
              type="hidden"
              {...register('content_type', { required: true })}
            />
          </div>

          {/* Content Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className={`text-xl font-semibold text-gray-900 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
              2. Content Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Child Selection */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  Select Child (Optional)
                </label>
                <select
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                  {...register('child_id')}
                >
                  <option value="">No specific child</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.nickname || `Child (Age ${child.age_group})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Group */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  Age Group
                </label>
                <select
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                  {...register('age_group', { required: true })}
                >
                  {[...Array(11)].map((_, i) => (
                    <option key={i + 2} value={i + 2}>
                      {i + 2} years old
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  <Globe className="w-4 h-4 inline mr-1 rtl:ml-1 rtl:mr-0" />
                  Language
                </label>
                <select
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                  {...register('language', { required: true })}
                >
                  <option value="ar">🇸🇦 Arabic</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="de">🇩🇪 German</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  <Settings className="w-4 h-4 inline mr-1 rtl:ml-1 rtl:mr-0" />
                  Difficulty Level
                </label>
                <select
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                  {...register('difficulty_level')}
                >
                  <option value="easy">Easy</option>
                  <option value="age_appropriate">Age Appropriate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
            </div>

            {/* Topic */}
            <div className="mt-6">
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                Topic or Subject *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''} ${
                  errors.topic ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                }`}
                placeholder={isRTL() ? 'مثل: الحيوانات، الرياضيات، العلوم' : 'e.g., Animals, Mathematics, Science'}
                {...register('topic', { 
                  required: 'Topic is required',
                  minLength: { value: 3, message: 'Topic must be at least 3 characters' }
                })}
              />
              {errors.topic && (
                <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  {errors.topic.message}
                </p>
              )}
            </div>

            {/* Additional Requirements */}
            <div className="mt-6">
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                Additional Requirements (Optional)
              </label>
              <textarea
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                rows={3}
                placeholder={isRTL() ? 'أي متطلبات خاصة أو تفاصيل إضافية...' : 'Any specific requirements or additional details...'}
                {...register('specific_requirements')}
              />
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              3. Content Options
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include_questions"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register('include_questions')}
                />
                <label 
                  htmlFor="include_questions" 
                  className={`ml-3 rtl:mr-3 rtl:ml-0 text-sm text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}
                >
                  Include comprehension questions
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include_activity"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register('include_activity')}
                />
                <label 
                  htmlFor="include_activity" 
                  className={`ml-3 rtl:mr-3 rtl:ml-0 text-sm text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}
                >
                  Include hands-on activity
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                  Credit Cost: <span className="font-semibold">{getRequiredCredits(watchedValues.content_type)} credits</span>
                </p>
                <p className={`text-xs text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                  Your balance: {user?.credits || 0} credits
                </p>
              </div>
              
              <div className="flex space-x-4 rtl:space-x-reverse">
                {/* FIXED: Debug button for development */}
                {import.meta.env.DEV && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={debugRateLimit}
                  >
                    Debug Limits
                  </Button>
                )}
                
                <Button
                  type="submit"
                  size="lg"
                  disabled={isGenerating || (user?.credits || 0) < getRequiredCredits(watchedValues.content_type)}
                  loading={isGenerating}
                  icon={<Wand2 className="w-5 h-5" />}
                  className="px-8"
                >
                  Generate Content
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContentGeneration