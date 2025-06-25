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
import { useNavigate } from 'react-router-dom'

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
const navigate = useNavigate()
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

 // Add these functions to your ContentHistory.jsx component (inside the component, before the return statement):

// Status text helper
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
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
  }
}

// Status icon helper
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
    return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
  } else if (status === 'pending') {
    return <Clock className="w-5 h-5 text-gray-400" />
  } else {
    return <Clock className="w-5 h-5 text-gray-400" />
  }
}

// Content type icon helper
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

// Can preview content helper
const canPreviewContent = (content) => {
  // Normalize status to lowercase
  const status = content.status?.toLowerCase()
  
  // Allow preview for these statuses
  const previewableStatuses = ['completed', 'approved']
  
  return content.session_id && previewableStatuses.includes(status)
}

// Navigate to preview page
const handlePreview = (sessionId) => {
  console.log('Navigating to preview page for session:', sessionId)
  navigate(`/preview/${sessionId}`)
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

 
  
   
 
 const ContentCard = ({ content }) => {
  const canPreview = canPreviewContent(content)
  
  // Debug what data we have
  console.log('Content card data:', content)
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            {getContentTypeIcon(content.content_type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 line-clamp-2 ${isRTL() ? 'font-cairo' : ''}`}>
              {content.title || content.generated_title || content.topic || 'Untitled Content'}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {content.content_type} • Age {content.age_group}
            </p>
            
            {/* Show topic if different from title */}
            {content.topic && content.topic !== content.title && (
              <p className="text-xs text-blue-600 mt-1">
                Topic: {content.topic}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {getStatusIcon(content.status, content.parent_approved)}
        </div>
      </div>

      {/* Content Preview - Show first few lines if available */}
      {content.content && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-3">
            {content.content.length > 150 
              ? content.content.substring(0, 150) + '...' 
              : content.content
            }
          </p>
        </div>
      )}

      {/* Metadata Grid */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium px-2 py-1 rounded-full text-xs ${
              content.status === 'completed' && content.parent_approved === true
                ? 'bg-green-100 text-green-700'
                : content.status === 'failed' || content.parent_approved === false
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {getStatusText(content.status, content.parent_approved)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Language:</span>
            <span className="font-medium flex items-center">
              <Globe className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
              {content.language?.toUpperCase() || 'N/A'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Created:</span>
            <span className="font-medium text-xs">
              {content.created_at 
                ? new Date(content.created_at).toLocaleDateString()
                : 'Unknown'
              }
            </span>
          </div>
          
          {content.credits_charged && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Credits:</span>
              <span className="font-medium">
                {content.credits_cost || 1}
              </span>
            </div>
          )}
        </div>

        {/* Additional Info Row */}
        <div className="flex flex-wrap gap-2 text-xs">
          {content.has_images && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              🖼️ Has Images
            </span>
          )}
          
          {content.safety_approved && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✅ Safe
            </span>
          )}
          
          {content.generation_time && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              ⏱️ {content.generation_time}s
            </span>
          )}

          {content.child_name && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              👤 {content.child_name}
            </span>
          )}
        </div>

         
      </div>

      {/* Action Buttons */}
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
            title="Download content"
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
          title="Delete content"
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
 
 // In your PreviewModal component, add:
useEffect(() => {
  if (selectedContent) {
    console.log('Preview content raw:', selectedContent)
    console.log('Preview content keys:', Object.keys(selectedContent))
  }
}, [selectedContent])
 
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
 
      </div>
    </div>
  )
}

export default ContentHistory