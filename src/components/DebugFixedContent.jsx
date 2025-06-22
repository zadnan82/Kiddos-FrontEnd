// Create this as src/components/DebugFixedContent.jsx
import React, { useState } from 'react'
import { useFixedContentStore } from '../stores/fixedContentStore'
import { useAuthStore } from '../stores/authStore'

const DebugFixedContent = () => {
  const [logs, setLogs] = useState([])
  const { 
    subjects, 
    courses, 
    userProgress, 
    loading, 
    error, 
    fetchSubjects, 
    fetchCourses, 
    fetchUserProgress 
  } = useFixedContentStore()
  const { token, isAuthenticated } = useAuthStore()

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    addLog('Testing connection...')
    addLog(`Auth status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`)
    addLog(`Token exists: ${!!token}`)
    
    try {
      await fetchSubjects()
      addLog('Subjects fetch: SUCCESS')
    } catch (error) {
      addLog(`Subjects fetch: ERROR - ${error.message}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 max-w-md max-h-96 overflow-auto shadow-lg">
      <h3 className="font-bold mb-2">Fixed Content Debug</h3>
      
      <div className="mb-4">
        <p>Subjects: {subjects.length}</p>
        <p>Courses: {courses.length}</p>
        <p>Progress entries: {Object.keys(userProgress).length}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
      </div>
      
      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
      >
        Test Connection
      </button>
      
      <div className="text-xs space-y-1 max-h-32 overflow-auto">
        {logs.map((log, index) => (
          <div key={index} className="border-b pb-1">{log}</div>
        ))}
      </div>
    </div>
  )
}

export default DebugFixedContent