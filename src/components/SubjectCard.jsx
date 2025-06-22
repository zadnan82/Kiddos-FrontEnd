import React from 'react'
import { Link } from 'react-router-dom'

const SubjectCard = ({ subject, language }) => {
  return (
    <Link 
      to={`/fixed-content/subjects/${subject.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-center mb-4">
        {subject.icon_name && (
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mr-4"
            style={{ backgroundColor: subject.color_code || '#3B82F6' }}
          >
            {subject.icon_name}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {subject.display_name}
          </h3>
          {subject.course_count && (
            <p className="text-sm text-gray-500">
              {subject.course_count} courses
            </p>
          )}
        </div>
      </div>
      
      {subject.description && (
        <p className="text-gray-600 text-sm line-clamp-2">
          {subject.description}
        </p>
      )}
    </Link>
  )
}

export default SubjectCard