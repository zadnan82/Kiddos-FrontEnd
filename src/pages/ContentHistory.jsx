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
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useLanguageStore } from '../stores/languageStore'
import { contentAPI } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'

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

  useEffect(() => {
    loadContentHistory()
  }, [filters, pagination])

  const loadContentHistory = async () => {
    try {
      setIsLoading(true)
      const params = {
        ...pagination,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      }
      
      const response = await contentAPI.getHistory(params)
      setContentHistory(response.data)
    } catch (error) {
      toast.error('Failed to load content history')
      console.error('Load history error:', error)
    } finally {
      setIsLoading(false)
    }
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
      await contentAPI.deleteContent(sessionId)
      toast.success('Content deleted successfully!')
      await loadContentHistory()
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const handlePreview = async (sessionId) => {
    try {
      const response = await contentAPI.getStatus(sessionId)
      if (response.data.content) {
        setSelectedContent(response.data.content)
        setShowPreview(true)
      } else {
        toast.error('Content not available for preview')
      }
    } catch (error) {
      toast.error('Failed to load content preview')
    }
  }

  const handleDownload = (content) => {
    // Create a simple text file download
    const element = document.createElement('a')
    const fileContent = `${content.title}\n\n${content.content}`
    const file = new Blob([fileContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const getStatusIcon = (status, parentApproved) => {
    if (status === 'completed' && parentApproved === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (status === 'completed' && parentApproved === false) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else if (status === 'completed' && parentApproved === null) {
      return <Clock className="w-5 h-5 text-yellow-500" />
    } else if (status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status, parentApproved) => {
    if (status === 'completed' && parentApproved === true) {
      return 'Approved'
    } else if (status === 'completed' && parentApproved === false) {
      return 'Rejected'
    } else if (status === 'completed' && parentApproved === null) {
      return 'Pending Review'
    } else if (status === 'failed') {
      return 'Failed'
    } else {
      return 'Processing'
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

  const ContentCard = ({ content }) => (
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
            {content.language.toUpperCase()}
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
      </div>

      <div className="flex space-x-2 rtl:space-x-reverse">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handlePreview(content.session_id)}
          icon={<Eye className="w-4 h-4" />}
          className="flex-1"
        >
          Preview
        </Button>
        
        {content.status === 'completed' && content.parent_approved === true && (
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
        >
          Delete
        </Button>
      </div>
    </div>
  )

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
              Content Preview
            </h2>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {selectedContent && (
            <>
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
                    {selectedContent.language.toUpperCase()}
                  </span>
                  <span>{selectedContent.credits_used} credits used</span>
                </div>
              </div>

              <div className={`prose max-w-none ${isRTL() ? 'font-cairo' : ''}`}>
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedContent.content}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownload(selectedContent)}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

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