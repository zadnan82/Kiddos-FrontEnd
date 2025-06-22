import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Download,
  Eye,
  Share2,
  Bookmark,
  Activity,
  Globe,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  HelpCircle,
  Lightbulb,
  Star,
  Heart
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useLanguageStore } from '../stores/languageStore'
import { contentAPI } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import InteractiveQuiz from './InteractiveQuiz'
import InteractiveWorksheet from './InteractiveWorksheet'
import RobustImage from './RobustImage'
import ImageExpirationBanner from './ImageExpirationBanner'
import SimpleImageDisplay from './SimpleImageDisplay'

const ContentPreview = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { t, isRTL } = useLanguageStore() 
  const [content, setContent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('preview') // 'preview', 'interactive'
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sessionId) {
      loadContent()
    }
  }, [sessionId])

  const loadContent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Loading content for session:', sessionId)
      
      // Try direct content endpoint first
      try {
        const contentResponse = await contentAPI.getContent(sessionId)
        if (contentResponse.data) {
          console.log('✅ Content loaded from direct endpoint:', contentResponse.data)
          setContent(contentResponse.data)
          return
        }
      } catch (contentError) {
        console.log('Direct content endpoint failed, trying status endpoint:', contentError)
      }

      // Fall back to status endpoint
      const statusResponse = await contentAPI.getStatus(sessionId)
      console.log('Status response:', statusResponse.data)

      if (statusResponse.data?.content) {
        console.log('✅ Content found via status endpoint')
        setContent(statusResponse.data.content)
      } else {
        const status = statusResponse.data?.status
        if (status === 'pending' || status === 'processing') {
          setError('Content is still being generated. Please wait and refresh the page.')
        } else if (status === 'failed') {
          setError(statusResponse.data?.error_message || 'Content generation failed')
        } else {
          setError(`Content not available (status: ${status})`)
        }
      }
    } catch (error) {
      console.error('Load content error:', error)
      setError(error.response?.data?.detail || 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    try {
      const element = document.createElement('a')
      const fileContent = `${content.title}\n\n${content.content}`
      const file = new Blob([fileContent], { type: 'text/plain; charset=utf-8' })
      element.href = URL.createObjectURL(file)
      element.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success('Content downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download content')
    }
  }

  const getContentTypeIcon = (type) => {
    const icons = {
      story: BookOpen,
      worksheet: FileText,
      quiz: HelpCircle,
      exercise: Activity
    }
    const IconComponent = icons[type] || BookOpen
    return <IconComponent className="w-6 h-6" />
  }

  const getContentTypeColor = (type) => {
    const colors = {
      story: 'from-green-400 to-green-600',
      worksheet: 'from-blue-400 to-blue-600',
      quiz: 'from-purple-400 to-purple-600',
      exercise: 'from-orange-400 to-orange-600'
    }
    return colors[type] || 'from-gray-400 to-gray-600'
  }

  useEffect(() => {
  if (content) {
    console.log('🔍 Debug - Full content object:', content)
    console.log('🔍 Debug - Content keys:', Object.keys(content))
    console.log('🔍 Debug - Generated images:', content.generated_images)
    console.log('🔍 Debug - Created at:', content.created_at)
    console.log('🔍 Debug - Generation completed at:', content.generation_completed_at)
    console.log('🔍 Debug - Has images:', content.has_images)
    
    if (content.generated_images && content.generated_images.length > 0) {
      console.log('🔍 Debug - First image URL:', content.generated_images[0].image_url)
      console.log('🔍 Debug - First image object:', content.generated_images[0])
    }
  }
}, [content])


const ImageTester = ({ imageUrl }) => {
  const [testResults, setTestResults] = useState({})

  const testImageMethods = async () => {
    const results = {}
    
    // Test 1: Basic img tag
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        results.basicImg = 'SUCCESS'
        setTestResults({...results})
      }
      img.onerror = () => {
        results.basicImg = 'FAILED'
        setTestResults({...results})
      }
      img.src = imageUrl
    } catch (e) {
      results.basicImg = 'ERROR: ' + e.message
    }

    // Test 2: Fetch API
    try {
      const response = await fetch(imageUrl, { mode: 'cors' })
      results.fetchCors = response.ok ? 'SUCCESS' : 'FAILED'
    } catch (e) {
      results.fetchCors = 'ERROR: ' + e.message
    }

    // Test 3: Fetch no-cors
    try {
      const response = await fetch(imageUrl, { mode: 'no-cors' })
      results.fetchNoCors = response.type === 'opaque' ? 'SUCCESS' : 'FAILED'
    } catch (e) {
      results.fetchNoCors = 'ERROR: ' + e.message
    }

    setTestResults(results)
  }

  useEffect(() => {
    if (imageUrl) {
      testImageMethods()
    }
  }, [imageUrl])

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h4 className="font-bold text-red-800 mb-2">🧪 Image Loading Test Results</h4>
      <div className="text-sm space-y-1">
        <p><strong>URL:</strong> {imageUrl?.substring(0, 80)}...</p>
        <p><strong>Basic img tag:</strong> {testResults.basicImg || 'Testing...'}</p>
        <p><strong>Fetch CORS:</strong> {testResults.fetchCors || 'Testing...'}</p>
        <p><strong>Fetch no-CORS:</strong> {testResults.fetchNoCors || 'Testing...'}</p>
      </div>
      <button 
        onClick={() => window.open(imageUrl, '_blank')}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
      >
        Test Direct Open
      </button>
    </div>
  )
}
// Also add this debug component temporarily (remove it after debugging):
const DebugPanel = ({ content }) => {
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug Info (Dev Only)</h3>
      <div className="text-xs text-yellow-700 space-y-1">
        <p><strong>Created:</strong> {content?.created_at}</p>
        <p><strong>Generation completed:</strong> {content?.generation_completed_at}</p>
        <p><strong>Has images:</strong> {String(content?.has_images)}</p>
        <p><strong>Images array length:</strong> {content?.generated_images?.length || 0}</p>
        {content?.generated_images?.[0] && (
          <p><strong>First image URL:</strong> {content.generated_images[0].image_url.substring(0, 100)}...</p>
        )}
      </div>
    </div>
  )
}

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading content preview..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <DebugPanel content={content} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Available</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/history')}
                variant="outline"
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to History
              </Button>
              <Button
                onClick={loadContent}
                icon={<Clock className="w-5 h-5" />}
              >
                Retry Loading
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Content Found</h2>
            <p className="text-gray-600 mb-8">The requested content could not be found.</p>
            <Button
              onClick={() => navigate('/history')}
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Back to History
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isQuiz = content.content_type === 'quiz' && content.questions && content.questions.length > 0
  const isWorksheet = content.content_type === 'worksheet' && content.questions && content.questions.length > 0
  const canBeInteractive = isQuiz || isWorksheet

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button and title */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/history')}
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to History
              </Button>
              
              <div className="hidden sm:block h-6 border-l border-gray-300" />
              
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getContentTypeColor(content.content_type)} flex items-center justify-center text-white`}>
                  {getContentTypeIcon(content.content_type)}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                    {content.title}
                  </h1>
                  <p className="text-sm text-gray-500 capitalize">
                    {content.content_type} • Age {content.age_group}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Mode toggle and actions */}
            <div className="flex items-center space-x-3">
              {/* Mode Toggle for Interactive Content */}
              {canBeInteractive && (
                <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      viewMode === 'preview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    📄 Preview
                  </button>
                  <button
                    onClick={() => setViewMode('interactive')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      viewMode === 'interactive'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🎮 Interactive
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                Download
              </Button>

              <Button
                onClick={() => {
                  navigator.share?.({
                    title: content.title,
                    text: `Check out this educational content: ${content.title}`,
                    url: window.location.href
                  }) || toast.info('Share URL copied!')
                }}
                variant="ghost"
                size="sm"
                icon={<Share2 className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Interactive Mode */}
        {canBeInteractive && viewMode === 'interactive' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              {isQuiz && (
                <InteractiveQuiz
                  quizData={content}
                  onComplete={(results) => {
                    console.log('Quiz completed with results:', results)
                    toast.success(`Excellent! You scored ${results.percentage}% on the quiz!`)
                  }}
                  onBack={() => setViewMode('preview')}
                />
              )}
              
              {isWorksheet && (
                <InteractiveWorksheet 
                  worksheetData={content}
                  onComplete={(results) => {
                    console.log('Worksheet completed with results:', results)
                    toast.success(`Great work! You completed ${results.percentage}% of the worksheet!`)
                  }}
                  onBack={() => setViewMode('preview')}
                />
              )}
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {viewMode === 'preview' && (
          <div className="space-y-8">
            
            {/* Content Header Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`bg-gradient-to-r ${getContentTypeColor(content.content_type)} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
                    <p className="text-white/90 text-lg">{content.topic}</p>
                  </div>
                  {content.generated_images && content.generated_images.length > 0 && (
                    <div className="bg-white/20 rounded-lg px-3 py-1 ml-4">
                      <span className="text-sm font-medium">🖼️ {content.generated_images.length} images</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Metadata */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{content.language?.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{content.age_group} years</span>
                  </div>
                  
                  {content.credits_used && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">{content.credits_used}</span>
                    </div>
                  )}
                  
                  {content.created_at && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {canBeInteractive && (
                    <Button
                      onClick={() => setViewMode('interactive')}
                      icon={<Activity className="w-4 h-4" />}
                      size="sm"
                    >
                      Try Interactive Mode
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download Content
                  </Button>
                  
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    size="sm"
                    icon={<FileText className="w-4 h-4" />}
                  >
                    Print
                  </Button>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            {content.learning_objectives && content.learning_objectives.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  🎯 Learning Objectives
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {content.learning_objectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800">{objective}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                📄 Story Content
              </h2>
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-xl">
                  {content.content}
                </div>
              </div>
            </div>

            <ImageExpirationBanner 
  content={content}  // Pass entire content object
  onRegenerateClick={() => navigate('/generate', { 
    state: { 
      regenerateFrom: content.session_id,
      topic: content.topic,
      includeImages: true 
    }
  })}
/>

{content.generated_images && content.generated_images[0] && (
  <ImageTester imageUrl={content.generated_images[0].image_url} />
)}

         {/* Image Gallery - SIMPLIFIED */}
{content.generated_images && content.generated_images.length > 0 && (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between">
      <span>🖼️ Story Images ({content.generated_images.length})</span>
      
      <div className="text-sm text-gray-500">
        Click images to view full size
      </div>
    </h2>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.generated_images.map((image, index) => (
        <div key={index} className="group">
          <div className="relative overflow-hidden rounded-xl bg-gray-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="aspect-[4/3] w-full">
              <SimpleImageDisplay
                src={image.image_url}
                alt={image.description || `Scene: ${image.scene}`}
                scene={image.scene}
                description={image.description}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Image info */}
          <div className="mt-3">
            <h3 className="font-medium text-gray-900 text-sm">
              {image.scene || `Image ${index + 1}`}
            </h3>
            {image.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {image.description}
              </p>
            )}
            {image.style && (
              <p className="text-xs text-purple-600 mt-1 font-medium">
                Style: {image.style}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
    
    {/* Simple info box */}
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        💡 <strong>Tip:</strong> Click any image to view it full size in a new tab. 
        Images are available for 2 hours after generation.
      </p>
    </div>
  </div>
)}

            {/* Questions */}
            {content.questions && content.questions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    📝 Questions ({content.questions.length})
                  </h2>
                  {canBeInteractive && (
                    <Button
                      onClick={() => setViewMode('interactive')}
                      size="sm"
                      icon={<Activity className="w-4 h-4" />}
                    >
                      Try Interactive
                    </Button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {content.questions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-4">
                            {question.question}
                          </h3>
                          
                          {/* Multiple Choice Options */}
                          {question.type === 'multiple_choice' && question.options && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-3">Options:</p>
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex} 
                                    className={`p-3 rounded-lg border-2 ${
                                      option === question.answer 
                                        ? 'border-green-300 bg-green-50 text-green-800' 
                                        : 'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>
                                        <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                      </span>
                                      {option === question.answer && (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Answer */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-800 mb-2">✓ Answer:</p>
                            <p className="text-blue-700">{question.answer}</p>
                            
                            {question.explanation && (
                              <>
                                <p className="text-sm font-medium text-blue-800 mb-2 mt-3">💡 Explanation:</p>
                                <p className="text-blue-700 text-sm">{question.explanation}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Educational Content */}
            {(content.educational_facts || content.key_points || content.vocabulary) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Educational Facts */}
                {content.educational_facts && content.educational_facts.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      🧠 Educational Facts
                    </h3>
                    <div className="space-y-3">
                      {content.educational_facts.map((fact, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-green-800 text-sm">{fact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Points */}
                {content.key_points && content.key_points.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      ⭐ Key Points
                    </h3>
                    <div className="space-y-3">
                      {content.key_points.map((point, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <Star className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-800 text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentPreview