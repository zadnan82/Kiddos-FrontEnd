import React, { useState } from 'react'
import { ExternalLink, AlertCircle, Download } from 'lucide-react'

const ImageDisplay = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  scene,
  description 
}) => {
  const [imageStatus, setImageStatus] = useState('loading') // loading, loaded, error
  const [showFallback, setShowFallback] = useState(false)

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', src.substring(0, 100))
    setImageStatus('loaded')
    setShowFallback(false)
  }

  const handleImageError = (e) => {
    console.error('❌ Image failed to load:', src.substring(0, 100))
    console.error('Error details:', e)
    setImageStatus('error')
    setShowFallback(true)
  }

  const openImageDirectly = () => {
    window.open(src, '_blank')
  }

  const downloadImage = async () => {
    try {
      // Try to download through a proxy or direct link
      const response = await fetch(src, { mode: 'cors' })
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
      openImageDirectly()
    }
  }

  if (showFallback) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-center p-6 ${containerClassName}`}>
        <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
        <h4 className="font-medium text-gray-700 mb-2">{scene || 'Scene Image'}</h4>
        {description && (
          <p className="text-xs text-gray-600 mb-4 line-clamp-3">{description}</p>
        )}
        
        <div className="space-y-2 w-full max-w-xs">
          <button 
            onClick={openImageDirectly}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Image</span>
          </button>
          
          <button
            onClick={downloadImage}
            className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          DALL-E images may be blocked by browser security policies
        </p>
      </div>
    )
  }

  return (
    <div className={`relative group ${containerClassName}`}>
      {/* Loading state */}
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105 ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={openImageDirectly}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      
      {/* Hover overlay - only show if image loaded */}
      {imageStatus === 'loaded' && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <ExternalLink className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageDisplay


// 3. Updated ContentPreview.jsx usage:

// Replace your image gallery section with:
{content.generated_images && content.generated_images.length > 0 && (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">
      🖼️ Story Images ({content.generated_images.length})
    </h2>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.generated_images.map((image, index) => (
        <div key={index} className="group">
          <div className="relative overflow-hidden rounded-xl bg-gray-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="aspect-[4/3] w-full">
              <ImageDisplay
                src={image.image_url}
                alt={image.description || `Scene: ${image.scene}`}
                scene={image.scene}
                description={image.description}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <h3 className="font-medium text-gray-900 text-sm">
              {image.scene || `Image ${index + 1}`}
            </h3>
            {image.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {image.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">
        <strong>Note:</strong> If images appear black or fail to load, this is due to DALL-E's security policies. 
        Click the "View Image" button to open them directly.
      </p>
    </div>
  </div>
)}