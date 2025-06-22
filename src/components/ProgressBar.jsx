import React from 'react'

const ProgressBar = ({ 
  current, 
  total, 
  label, 
  showPercentage = true, 
  color = 'blue',
  size = 'md' 
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  }

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {!label && showPercentage && (
        <div className="text-center mt-1">
          <span className="text-sm text-gray-500">
            {current} of {total} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar