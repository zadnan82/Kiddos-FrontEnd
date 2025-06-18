// src/pages/NotFound.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Link to="/">
          <Button 
            size="lg" 
            icon={<Home className="w-5 h-5" />}
            className="px-8 py-4"
          >
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound