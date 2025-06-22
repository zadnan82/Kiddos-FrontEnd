// Updated RobustImage.jsx to use your backend proxy

import React, { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, ExternalLink, Eye, Download, CheckCircle } from 'lucide-react'

const RobustImage = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  scene,
  description,
  onImageClick
}) => {
  const [imageStatus, setImageStatus] = useState('loading')
  const [currentUrl, setCurrentUrl] = useState(src)
  const [loadMethod, setLoadMethod] = useState('direct') // 'direct', 'backend-proxy', 'external-proxy'
  const [retryCount, setRetryCount] = useState(0)

  // Backend proxy URL
  const createBackendProxyUrl = (originalUrl) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return `${baseUrl}/api/images/proxy?url=${encodeURIComponent(originalUrl)}`
  }

  // External proxy URLs as fallback
  const externalProxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`,
    `https://corsproxy.io/?${encodeURIComponent(src)}`,
  ]

  useEffect(() => {
    if (src) {
      loadImage()
    }
  }, [src])

  const loadImage = () => {
    setImageStatus('loading')
    setLoadMethod('direct')
    setCurrentUrl(src)
    tryDirectLoad()
  }

  const tryDirectLoad = () => {
    console.log('🔄 Trying direct image load:', src)
    const img = new Image()
    
    img.onload = () => {
      console.log('✅ Direct image load successful')
      setImageStatus('loaded')
    }
    
    img.onerror = () => {
      console.log('❌ Direct load failed, trying backend proxy...')
      tryBackendProxy()
    }
    
    img.src = src
    
    // Timeout for direct load (5 seconds)
    setTimeout(() => {
      if (imageStatus === 'loading' && loadMethod === 'direct') {
        console.log('⏰ Direct load timeout, trying backend proxy...')
        tryBackendProxy()
      }
    }, 5000)
  }

  const tryBackendProxy = () => {
    const proxyUrl = createBackendProxyUrl(src)
    console.log('🔄 Trying backend proxy:', proxyUrl)
    
    setLoadMethod('backend-proxy')
    setCurrentUrl(proxyUrl)
    
    const img = new Image()
    
    img.onload = () => {
      console.log('✅ Backend proxy successful!')
      setImageStatus('loaded')
    }
    
    img.onerror = () => {
      console.log('❌ Backend proxy failed, trying external proxies...')
      tryExternalProxies()
    }
    
    img.src = proxyUrl
    
    // Timeout for backend proxy (10 seconds)
    setTimeout(() => {
      if (imageStatus === 'loading' && loadMethod === 'backend-proxy') {
        console.log('⏰ Backend proxy timeout, trying external proxies...')
        tryExternalProxies()
      }
    }, 10000)
  }

  const tryExternalProxies = () => {
    if (externalProxies.length === 0) {
      setImageStatus('error')
      return
    }

    const proxyUrl = externalProxies[0]
    console.log('🔄 Trying external proxy:', proxyUrl)
    
    setLoadMethod('external-proxy')
    setCurrentUrl(proxyUrl)
    
    const img = new Image()
    
    img.onload = () => {
      console.log('✅ External proxy successful!')
      setImageStatus('loaded')
    }
    
    img.onerror = () => {
      console.log('❌ External proxy failed')
      setImageStatus('cors-error')
    }
    
    img.src = proxyUrl
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    loadImage()
  }

  const handleOpenDirect = () => {
    window.open(src, '_blank')
  }

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(currentUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${scene || 'image'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      handleOpenDirect()
    }
  }

  // Loading state
  if (imageStatus === 'loading') {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center ${containerClassName}`}>
        <div className="text-center p-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-blue-600 font-medium">Loading image...</p>
          <p className="text-xs text-blue-500 mt-1">
            Method: {loadMethod === 'direct' ? 'Direct' : 
                    loadMethod === 'backend-proxy' ? 'Backend Proxy' : 
                    'External Proxy'}
          </p>
          {scene && <p className="text-xs text-gray-500 mt-1">{scene}</p>}
        </div>
      </div>
    )
  }

  // Success state
  if (imageStatus === 'loaded') {
    return (
      <div className={`relative group ${containerClassName}`}>
        <img
          src={currentUrl}
          alt={alt}
          className={`w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105 ${className}`}
          onClick={onImageClick || handleOpenDirect}
          onError={() => {
            console.error('Image failed to render even after proxying')
            setImageStatus('error')
          }}
        />
        
        {/* Success indicator showing which method worked */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`text-white text-xs px-2 py-1 rounded-full ${
            loadMethod === 'direct' ? 'bg-green-500' :
            loadMethod === 'backend-proxy' ? 'bg-blue-500' :
            'bg-purple-500'
          }`}>
            {loadMethod === 'direct' ? '✓ Direct' :
             loadMethod === 'backend-proxy' ? '✓ Proxied' :
             '✓ External'}
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <Eye className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error states
  return (
    <div className={`bg-gradient-to-br from-red-50 to-orange-50 border-2 border-dashed border-red-200 flex flex-col items-center justify-center text-center p-6 ${containerClassName}`}>
      <div className="mb-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-red-600 mb-1">Image Unavailable</h3>
        <p className="text-sm text-red-500">
          {imageStatus === 'cors-error' 
            ? 'All proxy methods failed' 
            : 'Failed to load image'
          }
        </p>
      </div>

      {scene && (
        <div className="mb-4 p-3 bg-white bg-opacity-70 rounded-lg">
          <p className="text-sm font-medium text-gray-800">Scene: {scene}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-3">{description}</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3 w-full max-w-xs">
        <button 
          onClick={handleOpenDirect}
          className="w-full px-4 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 shadow-md"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Original Image</span>
        </button>
        
        <button
          onClick={handleDownloadImage}
          className="w-full px-4 py-3 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Download Image</span>
        </button>
        
        <button
          onClick={handleRetry}
          className="w-full px-4 py-3 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 shadow-md"
          disabled={retryCount > 2}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry ({retryCount}/3)</span>
        </button>
      </div>

      {/* Troubleshooting info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">What we tried:</h4>
        <ul className="text-xs text-yellow-700 space-y-1 text-left">
          <li>✗ Direct image loading</li>
          <li>✗ Backend proxy server</li>
          <li>✗ External CORS proxies</li>
          <li>💡 Try "View Original Image" to see it directly</li>
        </ul>
      </div>

      {/* Debug info for developers */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 w-full">
          <summary className="text-xs text-gray-500 cursor-pointer mb-2">Debug Info</summary>
          <div className="text-xs text-left bg-gray-100 p-3 rounded break-all space-y-1">
            <p><strong>Original URL:</strong> {src}</p>
            <p><strong>Current URL:</strong> {currentUrl}</p>
            <p><strong>Load Method:</strong> {loadMethod}</p>
            <p><strong>Status:</strong> {imageStatus}</p>
            <p><strong>Retry Count:</strong> {retryCount}</p>
          </div>
        </details>
      )}
    </div>
  )
}

export default RobustImage