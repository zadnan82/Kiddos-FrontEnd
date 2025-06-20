import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Activity,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useLanguageStore } from '../stores/languageStore'
import { contentAPI } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import InteractiveQuiz from './InteractiveQuiz'
import InteractiveWorksheet from './InteractiveWorksheet'

const ContentHistory = () => {
  const { t, isRTL } = useLanguageStore()
  const [contentHistory, setContentHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    content_type: '',
    language: '',
    status: '',
    date_from: '',
    date_to: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12
  })
  const [selectedContent, setSelectedContent] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isDeleting, setIsDeleting] = useState(null) // Track which item is being deleted

  useEffect(() => {
    loadContentHistory()
  }, [filters, pagination])

  const loadContentHistory = async () => {
  try {
    setIsLoading(true);
    
    const response = await contentAPI.getHistory({
      page: pagination.page,
      per_page: pagination.per_page,
      ...filters
    });
    
    if (response.data) {
      setContentHistory(response.data);
    } else {
      setContentHistory([]);
      toast.error('No content history found');
    }
  } catch (error) {
    console.error('Load history error:', error);
    
    // Handle CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      toast.error('Connection error. Please check your network and try again.');
    } else {
      toast.error(error.response?.data?.detail || 'Failed to load content history');
    }
    
    setContentHistory([]);
  } finally {
    setIsLoading(false);
  }
};

  // Add this test function to your ContentHistory component

const testContentDetails = async () => {
  try {
    const sessionId = '32364375-f6d3-4d81-affd-b371577b2c2c' // Your problem session
    
    console.log('🔍 Testing content details for session:', sessionId)
    
    // Test the debug endpoint
    try {
      const debugResponse = await api.get(`/content/debug/${sessionId}`)
      console.log('🐛 Debug response:', debugResponse.data)
    } catch (debugError) {
      console.log('🐛 Debug endpoint not available:', debugError.message)
    }
    
    // Test the status endpoint
    const statusResponse = await contentAPI.getStatus(sessionId)
    console.log('📊 Status response:', statusResponse.data)
    
    // Check what we get from the API directly
    const directApiCall = await api.get(`/content/status/${sessionId}`)
    console.log('🌐 Direct API call:', directApiCall.data)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('❌ Error response:', error.response?.data)
  }
}

// Add this button temporarily to your header for testing
const renderDebugButton = () => (
  <button
    onClick={testContentDetails}
    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
    style={{ position: 'fixed', top: '60px', right: '10px', zIndex: 1000 }}
  >
    Debug Content
  </button>
)

// Add this to your JSX return statement temporarily
{/* {renderDebugButton()} */}

// Also add this to check the current database enum values
const checkEnumValues = () => {
  console.log('ContentStatus enum should include:')
  console.log('- PENDING')
  console.log('- PROCESSING') 
  console.log('- COMPLETED')
  console.log('- APPROVED')  // ← This might be missing
  console.log('- REJECTED')
  console.log('- FAILED')
}

 const handlePreview = async (sessionId) => {
  try {
    console.log('Loading preview for session:', sessionId)
    
    // Try direct content endpoint first
    try {
      const contentResponse = await contentAPI.getContent(sessionId)
      if (contentResponse.data) {
        console.log('✅ Content loaded from direct endpoint:', contentResponse.data)
        console.log('📊 Content structure:', {
          hasTitle: !!contentResponse.data.title,
          hasContent: !!contentResponse.data.content,
          hasQuestions: !!(contentResponse.data.questions && contentResponse.data.questions.length > 0),
          contentType: contentResponse.data.content_type,
          questionsCount: contentResponse.data.questions?.length || 0
        })
        
        setSelectedContent(contentResponse.data)
        setShowPreview(true)
        return
      }
    } catch (contentError) {
      console.log('Direct content endpoint failed, trying status endpoint:', contentError)
    }

    // Fall back to status endpoint
    const statusResponse = await contentAPI.getStatus(sessionId)
    console.log('Status response:', statusResponse.data)

    if (statusResponse.data?.content) {
      console.log('✅ Content found via status endpoint:', statusResponse.data.content)
      setSelectedContent(statusResponse.data.content)
      setShowPreview(true)
    } else {
      const status = statusResponse.data?.status
      if (status === 'pending' || status === 'processing') {
        toast.error('Content is still being generated. Please wait...')
      } else if (status === 'failed') {
        toast.error(statusResponse.data?.error_message || 'Content generation failed')
      } else {
        toast.error(`Content not available (status: ${status})`)
      }
    }
  } catch (error) {
    console.error('Preview error:', error)
    toast.error(error.response?.data?.detail || 'Failed to load content preview')
  }
}


// Add this inside your component
const debugContentItem = async (sessionId) => {
  try {
    console.log('Debugging content item:', sessionId)
    
    // Check history endpoint
    const historyResponse = await contentAPI.getHistory(new URLSearchParams())
    console.log('History response:', historyResponse.data)
    
    // Check status endpoint
    const statusResponse = await contentAPI.getStatus(sessionId)
    console.log('Status response:', statusResponse.data)
    
    // Check debug endpoint
    const debugResponse = await contentAPI.get(`/debug/${sessionId}`)
    console.log('Debug response:', debugResponse.data)
    
    // Check content endpoint
    try {
      const contentResponse = await contentAPI.get(`/content/${sessionId}`)
      console.log('Content endpoint response:', contentResponse.data)
    } catch (contentError) {
      console.log('Content endpoint error:', contentError.response?.data)
    }
    
    toast.success('Debug information logged to console')
  } catch (error) {
    console.error('Debug failed:', error)
    toast.error('Debug failed - check console')
  }
}

 
  const canPreviewContent = (content) => {
  // Normalize status to lowercase
  const status = content.status?.toLowerCase()
  
  // Allow preview for these statuses
  const previewableStatuses = ['completed', 'approved']
  
  return content.session_id && previewableStatuses.includes(status)
}

const DebugButton = ({ sessionId }) => {
  const debugContent = async () => {
    try {
      console.group('Debugging Content Session')
      
      // 1. Check status
      console.log('Checking status...')
      const status = await contentAPI.getStatus(sessionId)
      console.log('Status:', status.data)
      
      // 2. Try direct content
      console.log('Trying direct content...')
      try {
        const content = await contentAPI.getContent(sessionId)
        console.log('Direct content:', content.data)
      } catch (contentError) {
        console.log('Direct content failed:', contentError.response?.data)
      }
      
      // 3. Check debug info
      console.log('Getting debug info...')
      try {
        const debug = await contentAPI.getDebug(sessionId)
        console.log('Debug info:', debug.data)
      } catch (debugError) {
        console.log('Debug failed:', debugError.response?.data)
      }
      
      console.groupEnd()
      toast.success('Debug info logged to console')
    } catch (error) {
      console.error('Debug failed:', error)
      toast.error('Debug failed - check console')
    }
  }

  return (
    <button 
      onClick={debugContent}
      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
    >
      Debug
    </button>
  )
}
  // UPDATED: Better status text handling
  const getStatusText = (status, parentApproved) => {
    if (status === 'completed' && parentApproved === true) {
      return 'Approved'
    } else if (status === 'approved') {
      return 'Approved'
    } else if (status === 'completed' && parentApproved === false) {
      return 'Rejected'
    } else if (status === 'rejected') {
      return 'Rejected'
    } else if (status === 'completed' && parentApproved === null) {
      return 'Pending Review'
    } else if (status === 'failed') {
      return 'Failed'
    } else if (status === 'processing') {
      return 'Processing'
    } else if (status === 'pending') {
      return 'Pending'
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // UPDATED: Better status icon handling  
  const getStatusIcon = (status, parentApproved) => {
    if (status === 'completed' && parentApproved === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (status === 'approved') {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (status === 'completed' && parentApproved === false) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else if (status === 'rejected') {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else if (status === 'completed' && parentApproved === null) {
      return <Clock className="w-5 h-5 text-yellow-500" />
    } else if (status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else if (status === 'processing') {
      return <Clock className="w-5 h-5 text-blue-500" />
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />
    }
  }
 
  const ContentCard = ({ content }) => {
    const canPreview = canPreviewContent(content)
    
    console.log('Rendering content card:', {
      session_id: content.session_id,
      status: content.status,
      canPreview: canPreview
    })
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
              {getContentTypeIcon(content.content_type)}
            </div>
            <div>
              <h3 className={`font-semibold text-gray-900 line-clamp-1 ${isRTL() ? 'font-cairo' : ''}`}>
                {content.title || content.topic}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {content.content_type} • Age {content.age_group}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {getStatusIcon(content.status, content.parent_approved)}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium ${
              content.status === 'completed' && content.parent_approved === true
                ? 'text-green-600'
                : content.status === 'failed' || content.parent_approved === false
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}>
              {getStatusText(content.status, content.parent_approved)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Language:</span>
            <span className="font-medium flex items-center">
              <Globe className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
              {content.language?.toUpperCase() || 'N/A'}
            </span>
          </div>
          
          {content.child_name && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Child:</span>
              <span className="font-medium">{content.child_name}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Created:</span>
            <span className="font-medium">
              {new Date(content.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* DEBUG: Show raw status info */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Debug:</span>
            <span>Status: {content.status} | Approved: {String(content.parent_approved)}</span>
          </div>
        </div>

        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePreview(content.session_id)}
            icon={<Eye className="w-4 h-4" />}
            className="flex-1"
            disabled={!canPreview}
            title={canPreview ? 'Preview content' : `Cannot preview: status is ${content.status}`}
          >
            Preview
          </Button>
          
          {(content.status === 'completed' || content.status === 'approved') && content.parent_approved === true && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownload(content)}
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(content.session_id)}
            icon={<Trash2 className="w-4 h-4" />}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            loading={isDeleting === content.session_id}
            disabled={isDeleting === content.session_id}
          >
            Delete
          </Button>
        </div>
      </div>
    )
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return
    }

    try {
      setIsDeleting(sessionId)
      console.log('Deleting content with session ID:', sessionId)
      
      await contentAPI.deleteContent(sessionId)
      toast.success('Content deleted successfully!')
      
      // Remove from local state
      setContentHistory(prev => prev.filter(item => item.session_id !== sessionId))
      
    } catch (error) {
      console.error('Delete content error:', error)
      if (error.response?.status === 404) {
        toast.error('Content not found or already deleted')
        // Remove from local state anyway
        setContentHistory(prev => prev.filter(item => item.session_id !== sessionId))
      } else {
        toast.error(error.response?.data?.detail || 'Failed to delete content')
      }
    } finally {
      setIsDeleting(null)
    }
  }

  

  const handleDownload = (content) => {
    try {
      // Create a simple text file download
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
    return <IconComponent className="w-5 h-5" />
  }
 // In your PreviewModal component, add:
useEffect(() => {
  if (selectedContent) {
    console.log('Preview content raw:', selectedContent)
    console.log('Preview content keys:', Object.keys(selectedContent))
  }
}, [selectedContent])

 const PreviewModal = () => {
  const [previewMode, setPreviewMode] = useState('interactive') // 'interactive' or 'static'
  
  if (!selectedContent) return null

  const isQuiz = selectedContent.content_type === 'quiz' && selectedContent.questions && selectedContent.questions.length > 0
  const isWorksheet = selectedContent.content_type === 'worksheet' && selectedContent.questions && selectedContent.questions.length > 0
  const canBeInteractive = isQuiz || isWorksheet

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        
        {/* Header with Mode Toggle */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className={`text-xl font-semibold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                Content Preview
              </h2>
              
              {/* Mode Toggle */}
              {canBeInteractive && (
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('interactive')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      previewMode === 'interactive'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🎮 Interactive
                  </button>
                  <button
                    onClick={() => setPreviewMode('static')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      previewMode === 'static'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    📄 Review
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          {/* Interactive Mode */}
          {canBeInteractive && previewMode === 'interactive' && (
            <div className="p-4">
              {isQuiz && (
                <InteractiveQuiz
                  quizData={selectedContent}
                  onComplete={(results) => {
                    console.log('Quiz completed with results:', results)
                    toast.success(`Great! You scored ${results.percentage}% on the quiz!`)
                  }}
                  onBack={() => setPreviewMode('static')}
                />
              )}
              
              {isWorksheet && (
                <InteractiveWorksheet 
                  worksheetData={selectedContent}
                  onComplete={(results) => {
                    console.log('Worksheet completed with results:', results)
                    toast.success(`Excellent! You completed ${results.percentage}% of the worksheet!`)
                  }}
                  onBack={() => setPreviewMode('static')}
                />
              )}
            </div>
          )}

          {/* Static Mode - Your existing detailed preview */}
          {(!canBeInteractive || previewMode === 'static') && (
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h3 className={`text-2xl font-bold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
                  {selectedContent.title}
                </h3>
                
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                  <span className="flex items-center">
                    {getContentTypeIcon(selectedContent.content_type)}
                    <span className="ml-1 rtl:mr-1 rtl:ml-0 capitalize">{selectedContent.content_type}</span>
                  </span>
                  <span>Age {selectedContent.age_group}</span>
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    {selectedContent.language?.toUpperCase()}
                  </span>
                  {selectedContent.credits_used && (
                    <span>{selectedContent.credits_used} credits used</span>
                  )}
                  {selectedContent.generation_time && (
                    <span>Generated in {selectedContent.generation_time}s</span>
                  )}
                </div>
              </div>

              {/* Learning Objectives */}
              {selectedContent.learning_objectives && selectedContent.learning_objectives.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    🎯 Learning Objectives
                  </h4>
                  <ul className="space-y-2">
                    {selectedContent.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Content */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  📄 Content
                </h4>
                <div className={`prose max-w-none ${isRTL() ? 'font-cairo' : ''}`}>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {selectedContent.content}
                  </div>
                </div>
              </div>

              {/* Questions - Enhanced display */}
              {selectedContent.questions && selectedContent.questions.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      📝 Questions ({selectedContent.questions.length})
                    </h4>
                    {canBeInteractive && (
                      <Button
                        onClick={() => setPreviewMode('interactive')}
                        size="sm"
                        icon={<Activity className="w-4 h-4" />}
                      >
                        Try Interactive Mode
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {selectedContent.questions.map((question, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <p className="font-medium text-gray-900 mb-3">
                          <span className="text-blue-600 font-bold">Q{index + 1}:</span> {question.question}
                        </p>
                        
                        {/* Multiple Choice Display */}
                        {question.type === 'multiple_choice' && question.options && (
                          <div className="ml-4 mb-3">
                            <p className="text-sm text-gray-600 mb-2">Options:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex} 
                                  className={`p-2 rounded border ${
                                    option === question.answer 
                                      ? 'bg-green-50 border-green-200 text-green-800' 
                                      : 'bg-gray-50 border-gray-200 text-gray-700'
                                  }`}
                                >
                                  <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                                  {option === question.answer && (
                                    <span className="ml-2 text-green-600 font-bold">✓ Correct</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Matching Questions Display */}
                        {question.type === 'matching' && question.options && (
                          <div className="ml-4 mb-3">
                            <p className="text-sm text-gray-600 mb-2">Match these pairs:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {question.options.map((option, optIndex) => {
                                const [baby, parent] = option.split('-')
                                return (
                                  <div key={optIndex} className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-200">
                                    <span className="text-blue-700 font-medium">{baby}</span>
                                    <span className="text-gray-400 mx-2">→</span>
                                    <span className="text-green-700 font-medium">{parent}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Answer and Explanation */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="space-y-2">
                            <p className="text-green-700 text-sm">
                              <span className="font-medium">✓ Answer:</span> {question.answer}
                            </p>
                            {question.explanation && (
                              <p className="text-blue-700 text-sm">
                                <span className="font-medium">💡 Explanation:</span> {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="flex-1"
                >
                  Close Preview
                </Button>
                <Button
                  onClick={() => handleDownload(selectedContent)}
                  icon={<Download className="w-4 h-4" />}
                  className="flex-1"
                >
                  Download Content
                </Button>
                {canBeInteractive && previewMode === 'static' && (
                  <Button
                    onClick={() => setPreviewMode('interactive')}
                    icon={<Activity className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Try Interactive
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
 
const testContentStatus = async () => {
  try {
    console.log('Testing content history API...')
    
    // Test the history endpoint
    const historyResponse = await contentAPI.getHistory(new URLSearchParams('page=1&per_page=5'))
    console.log('History response:', historyResponse.data)
    
    if (historyResponse.data && historyResponse.data.length > 0) {
      const firstContent = historyResponse.data[0]
      console.log('First content item:', firstContent)
      
      // Test the status endpoint
      console.log('Testing status endpoint for session:', firstContent.session_id)
      const statusResponse = await contentAPI.getStatus(firstContent.session_id)
      console.log('Status response:', statusResponse.data)
      
      if (statusResponse.data?.content) {
        console.log('✅ Content is available!')
        console.log('Content preview:', statusResponse.data.content)
      } else {
        console.log('❌ No content in status response')
        console.log('Status details:', {
          status: statusResponse.data?.status,
          progress: statusResponse.data?.progress_percentage,
          error: statusResponse.data?.error_message
        })
      }
    } else {
      console.log('No content in history')
    }
  } catch (error) {
    console.error('Test failed:', error)
    console.error('Error response:', error.response?.data)
  }
}

// Add a test button to your header (temporary for debugging)
const renderTestButton = () => (
  <button
    onClick={testContentStatus}
    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}
  >
    Test API
  </button>
)

// Add this to your JSX return statement (temporary)
{/* {renderTestButton()} */}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
            Content {t('history')}
          </h1>
          <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
            View and manage all your generated educational content
          </p>

           {renderTestButton()} 
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search content..."
                className={`w-full ${isRTL() ? 'pr-10 text-right font-cairo' : 'pl-10'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Content Type */}
            <select
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
              value={filters.content_type}
              onChange={(e) => handleFilterChange('content_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="story">Stories</option>
              <option value="worksheet">Worksheets</option>
              <option value="quiz">Quizzes</option>
              <option value="exercise">Exercises</option>
            </select>

            {/* Language */}
            <select
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="ar">🇸🇦 Arabic</option>
              <option value="en">🇺🇸 English</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
            </select>

            {/* Status */}
            <select
              className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  search: '',
                  content_type: '',
                  language: '',
                  status: '',
                  date_from: '',
                  date_to: ''
                })
              }}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading content history..." />
          </div>
        ) : contentHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentHistory.map(content => (
              <ContentCard key={content.session_id} content={content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              No Content Found
            </h3>
            <p className={`text-gray-600 mb-8 max-w-md mx-auto ${isRTL() ? 'font-cairo' : ''}`}>
              {Object.values(filters).some(f => f !== '') 
                ? 'No content matches your current filters. Try adjusting your search criteria.'
                : 'You haven\'t generated any content yet. Start creating educational materials for your children!'
              }
            </p>
            <Button
              onClick={() => window.location.href = '/generate'}
              size="lg"
              icon={<BookOpen className="w-5 h-5" />}
            >
              Generate Content
            </Button>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && <PreviewModal />}

        // Add this to your JSX (temporarily)
<Button
  onClick={() => debugContentItem(contentHistory[0]?.session_id)}
  className="mb-4"
>
  Debug First Item
</Button>
      </div>
    </div>
  )
}

export default ContentHistory