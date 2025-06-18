import React, { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguageStore } from '../stores/languageStore'

const LanguageSwitch = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { language, availableLanguages, setLanguage, isRTL } = useLanguageStore()

  const currentLang = availableLanguages.find(lang => lang.code === language)

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:block">{currentLang?.flag}</span>
        <span className="hidden md:block">{currentLang?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute ${isRTL() ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50`}>
            <div className="py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${
                    language === lang.code
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 rtl:ml-3 rtl:mr-0 text-lg">
                    {lang.flag}
                  </span>
                  <span className="flex-1 text-left rtl:text-right">
                    {lang.name}
                  </span>
                  {language === lang.code && (
                    <span className="text-blue-600">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitch