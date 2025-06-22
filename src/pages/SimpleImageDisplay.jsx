// Create SimpleImageDisplay.jsx - No error buttons, just images

import React, { useState } from 'react'
import { Eye, ExternalLink } from 'lucide-react'

const SimpleImageDisplay = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  scene,
  description,
  onClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Open image in new tab
      window.open(src, '_blank')
    }
  }

  return (
    <div className={`relative group ${containerClassName}`}>
      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105 ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={handleClick}
        style={{ display: imageError ? 'none' : 'block' }}
      />
      
      {/* Fallback for broken images */}
      {imageError && (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-center p-4 cursor-pointer"
             onClick={() => window.open(src, '_blank')}>
          <div className="text-gray-500 mb-2">
            <ExternalLink className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Image Unavailable</p>
          </div>
          {scene && (
            <p className="text-xs text-gray-600 mb-2 font-medium">{scene}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
          )}
          <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline">
            Click to try viewing directly
          </button>
        </div>
      )}
      
      {/* Hover overlay - only show if image loaded */}
      {imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <Eye className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleImageDisplay