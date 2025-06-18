import React from 'react'
import { clsx } from 'clsx'

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  text = null 
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colors = {
    blue: 'border-blue-200 border-t-blue-600',
    gray: 'border-gray-200 border-t-gray-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600',
    purple: 'border-purple-200 border-t-purple-600',
    white: 'border-white border-opacity-30 border-t-white'
  }

  const spinnerClasses = clsx(
    'border-3 rounded-full animate-spin',
    sizes[size],
    colors[color],
    className
  )

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-3">
        <div className={spinnerClasses} />
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    )
  }

  return <div className={spinnerClasses} />
}

export default LoadingSpinner