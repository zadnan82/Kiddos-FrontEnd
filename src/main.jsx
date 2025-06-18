import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Initialize language direction
const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('kiddos-language') || 'ar'
  const direction = savedLanguage === 'ar' ? 'rtl' : 'ltr'
  
  document.documentElement.dir = direction
  document.documentElement.lang = savedLanguage
  
  // Add font class for Arabic
  if (savedLanguage === 'ar') {
    document.body.classList.add('font-cairo')
  }
}

// Initialize language before rendering
initializeLanguage()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'bg-white text-gray-700 shadow-xl border border-gray-200 rounded-lg text-sm max-w-md',
          success: {
            className: 'bg-green-50 text-green-800 border-green-200',
          },
          error: {
            className: 'bg-red-50 text-red-800 border-red-200',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)