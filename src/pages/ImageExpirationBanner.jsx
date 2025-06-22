// 1. FIXED: ImageExpirationBanner.jsx - Proper timezone handling

import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle, RefreshCw, Lightbulb } from 'lucide-react'

const ImageExpirationBanner = ({ content, onRegenerateClick }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  const hasImages = content?.generated_images && content.generated_images.length > 0

  useEffect(() => {
    if (!hasImages || !content?.created_at) {
      setIsExpired(false)
      setTimeLeft('')
      return
    }

    const updateTimer = () => {
      const now = new Date()
      
      // FIXED: Parse the creation date correctly
      // Your date is: "2025-06-21T19:56:36.802461" (local time)
      const createdAt = content.created_at
      let generationDate
      
      // Try to determine if it's already UTC or local time
      if (createdAt.endsWith('Z') || createdAt.includes('+')) {
        // Already has timezone info
        generationDate = new Date(createdAt)
      } else {
        // Assume it's local time, convert to current timezone
        generationDate = new Date(createdAt)
      }
      
      const expiryTime = new Date(generationDate.getTime() + 2 * 60 * 60 * 1000) // +2 hours
      const timeDiff = expiryTime - now
      
      console.log('🕐 FINAL Timer check:', {
        originalCreatedAt: createdAt,
        parsedGenerationDate: generationDate.toISOString(),
        expiryTime: expiryTime.toISOString(),
        now: now.toISOString(),
        timeDiff: timeDiff,
        timeDiffMinutes: Math.round(timeDiff / (1000 * 60)),
        isExpired: timeDiff <= 0
      })
      
      if (timeDiff <= 0) {
        setIsExpired(true)
        setTimeLeft('Expired')
      } else {
        setIsExpired(false)
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeLeft(`${hours}h ${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [hasImages, content?.created_at])

  if (!hasImages) {
    return null
  }

  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 mb-2">
              🖼️ Images from this story have expired
            </h3>
            <p className="text-orange-700 text-sm mb-3">
              The AI-generated images have expired after 2 hours. The story text remains available forever.
            </p>
            <button
              onClick={onRegenerateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate New Version with Fresh Images</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Clock className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-green-800">
            🖼️ Images available for {timeLeft}
          </h3>
          <p className="text-green-700 text-sm mt-1">
            These AI-generated images will expire 2 hours after creation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ImageExpirationBanner
 