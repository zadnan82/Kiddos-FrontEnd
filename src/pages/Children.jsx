import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  User, 
  Calendar,
  BookOpen,
  Settings,
  Heart,
  Star,
  X,
  Check,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useLanguageStore } from '../stores/languageStore'
import { childrenAPI } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const Children = () => {
  const { t, isRTL } = useLanguageStore()
  const [children, setChildren] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nickname: '',
      age_group: 6,
      learning_level: 'beginner',
      interests: [],
      preferred_language: '',
      content_difficulty: 'age_appropriate',
      avatar_id: 1
    }
  })

  const watchedInterests = watch('interests') || []
  const watchedAvatarId = watch('avatar_id') || 1

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      setIsLoading(true)
      const response = await childrenAPI.getChildren()
      setChildren(response.data || [])
    } catch (error) {
      console.error('Load children error:', error)
      toast.error('Failed to load children')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrUpdate = async (data) => {
    try {
      setIsSubmitting(true)
      clearErrors() // Clear any previous errors
      
      console.log('Raw form data:', data)
      
      // Validate required fields on frontend
      if (!data.nickname || data.nickname.trim() === '') {
        setError('nickname', { 
          type: 'required', 
          message: 'Nickname is required' 
        })
        return
      }
      
      if (!data.age_group || data.age_group < 2 || data.age_group > 12) {
        setError('age_group', { 
          type: 'range', 
          message: 'Age must be between 2 and 12' 
        })
        return
      }

      // COMPREHENSIVE FIX: Properly format all data
      const formattedData = {
        nickname: data.nickname.trim(),
        age_group: parseInt(data.age_group),
        learning_level: data.learning_level || 'beginner',
        interests: Array.isArray(data.interests) ? data.interests : [],
        content_difficulty: data.content_difficulty || 'age_appropriate',
        avatar_id: parseInt(data.avatar_id) || 1
      }

      // Handle optional fields - only include them if they have actual values
      if (data.full_name && data.full_name.trim()) {
        formattedData.full_name = data.full_name.trim()
      }

      // CRITICAL FIX: Only include preferred_language if it's not empty
      if (data.preferred_language && data.preferred_language.trim() && data.preferred_language !== '') {
        formattedData.preferred_language = data.preferred_language.trim()
      }
      
      console.log('Formatted data being sent to API:', formattedData)
      
      let response
      if (editingChild) {
        response = await childrenAPI.updateChild(editingChild.id, formattedData)
        toast.success('Child profile updated successfully!')
      } else {
        response = await childrenAPI.createChild(formattedData)
        toast.success('Child profile created successfully!')
      }
      
      console.log('API Response:', response.data)
      await loadChildren()
      resetForm()
      
    } catch (error) {
      console.error('Create/Update child error:', error)
      
      // ENHANCED: Better error logging
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        console.error('Response headers:', error.response.headers)
        
        // Log the exact validation errors
        if (error.response.status === 422 && error.response.data?.detail) {
          console.error('Validation errors:', error.response.data.detail)
        }
      }
      
      // Handle validation errors from backend
      if (error.response?.status === 422) {
        const errorDetail = error.response.data?.detail
        
        if (Array.isArray(errorDetail)) {
          // Pydantic validation errors
          console.log('Processing Pydantic validation errors:', errorDetail)
          
          errorDetail.forEach((err, index) => {
            console.log(`Error ${index}:`, err)
            
            // Extract field name from location array
            const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : null
            const message = err.msg || err.message || 'Invalid value'
            
            console.log(`Field: ${field}, Message: ${message}`)
            
            if (field && typeof field === 'string') {
              setError(field, { 
                type: 'server', 
                message: message 
              })
            } else {
              // If we can't map to a specific field, show a general error
              toast.error(`Validation error: ${message}`)
            }
          })
          
          toast.error('Please check the form for errors')
          
        } else if (typeof errorDetail === 'string') {
          console.log('String error detail:', errorDetail)
          toast.error(errorDetail)
        } else {
          console.log('Unknown error format:', errorDetail)
          toast.error('Validation error occurred')
        }
      } else {
        const errorMessage = error.response?.data?.detail || 'Failed to save child profile'
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (child) => {
    setEditingChild(child)
    setShowForm(true)
    
    // Populate form with child data
    const formData = {
      nickname: child.nickname || '',
      age_group: child.age_group,
      learning_level: child.learning_level || 'beginner',
      interests: child.interests || [],
      preferred_language: child.preferred_language || '',
      content_difficulty: child.content_difficulty || 'age_appropriate',
      avatar_id: child.avatar_id || 1
    }
    
    // Set each field individually
    Object.keys(formData).forEach(key => {
      setValue(key, formData[key])
    })
  }

  const handleDelete = async (childId) => {
    if (!confirm('Are you sure you want to delete this child profile?')) {
      return
    }

    try {
      await childrenAPI.deleteChild(childId)
      toast.success('Child profile deleted successfully!')
      await loadChildren()
    } catch (error) {
      console.error('Delete child error:', error)
      toast.error('Failed to delete child profile')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingChild(null)
    reset({
      nickname: '',
      age_group: 6,
      learning_level: 'beginner',
      interests: [],
      preferred_language: '',
      content_difficulty: 'age_appropriate',
      avatar_id: 1
    })
    clearErrors()
  }

  const availableInterests = [
    { id: 'animals', name: 'Animals', icon: '🐾' },
    { id: 'space', name: 'Space', icon: '🚀' },
    { id: 'math', name: 'Mathematics', icon: '🔢' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'art', name: 'Art', icon: '🎨' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'cooking', name: 'Cooking', icon: '👨‍🍳' },
    { id: 'nature', name: 'Nature', icon: '🌿' },
    { id: 'stories', name: 'Stories', icon: '📚' },
    { id: 'puzzles', name: 'Puzzles', icon: '🧩' },
    { id: 'history', name: 'History', icon: '🏛️' }
  ]

  const avatars = [
    '👦', '👧', '🧒', '👶', '🤓', '😊', '😄', '🥰', '😇', '🤗',
    '🌟', '🦄', '🐻', '🐱', '🐶', '🦊', '🐸', '🐵', '🦋', '🌈'
  ]

  const toggleInterest = (interestId) => {
    const currentInterests = watchedInterests || []
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId]
    
    setValue('interests', newInterests)
    clearErrors('interests') // Clear interest errors when changing
  }

  // Helper function to safely render error messages
  const renderErrorMessage = (error) => {
    if (!error) return null
    
    if (typeof error.message === 'string') {
      return error.message
    } else if (typeof error === 'string') {
      return error
    } else {
      return 'Invalid input'
    }
  }

  const ChildCard = ({ child }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-2xl">
            {avatars[child.avatar_id - 1] || '👶'}
          </div>
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
              {child.nickname || `Child ${child.age_group}`}
            </h3>
            <p className="text-sm text-gray-500">
              Age {child.age_group} • {child.learning_level}
            </p>
            <p className="text-xs text-gray-400">
              {child.content_count || 0} content pieces created
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => handleEdit(child)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(child.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interests */}
      {child.interests && child.interests.length > 0 && (
        <div className="mb-4">
          <p className={`text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
            Interests:
          </p>
          <div className="flex flex-wrap gap-2">
            {child.interests.slice(0, 3).map(interest => {
              const interestData = availableInterests.find(i => i.id === interest)
              return (
                <span 
                  key={interest}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <span className="mr-1 rtl:ml-1 rtl:mr-0">{interestData?.icon}</span>
                  {interestData?.name || interest}
                </span>
              )
            })}
            {child.interests.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{child.interests.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{child.content_count || 0}</p>
          <p className="text-xs text-gray-500">Content</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            {(child.preferred_language || 'AR').toUpperCase()}
          </p>
          <p className="text-xs text-gray-500">Language</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            {child.last_used ? new Date(child.last_used).toLocaleDateString() : 'Never'}
          </p>
          <p className="text-xs text-gray-500">Last Used</p>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading children..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
              {t('children')} Profiles
            </h1>
            <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
              Manage your children's profiles and learning preferences
            </p>
          </div>
          
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              icon={<Plus className="w-5 h-5" />}
              className="shadow-lg hover:shadow-xl"
            >
              Add Child
            </Button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-semibold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                    {editingChild ? 'Edit Child Profile' : 'Add New Child'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      Nickname *
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''} ${
                        errors.nickname ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                      placeholder={isRTL() ? 'اسم الطفل' : "Child's nickname"}
                      {...register('nickname', { 
                        required: 'Nickname is required',
                        minLength: { value: 1, message: 'Nickname cannot be empty' },
                        maxLength: { value: 50, message: 'Nickname too long' }
                      })}
                    />
                    {errors.nickname && (
                      <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                        {renderErrorMessage(errors.nickname)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      Age *
                    </label>
                    <select
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''} ${
                        errors.age_group ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                      }`}
                      {...register('age_group', { 
                        required: 'Age is required',
                        min: { value: 2, message: 'Age must be at least 2' },
                        max: { value: 12, message: 'Age must be at most 12' }
                      })}
                    >
                      <option value="">Select age</option>
                      {[...Array(11)].map((_, i) => (
                        <option key={i + 2} value={i + 2}>
                          {i + 2} years old
                        </option>
                      ))}
                    </select>
                    {errors.age_group && (
                      <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                        {renderErrorMessage(errors.age_group)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-3 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                    Choose Avatar
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {avatars.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setValue('avatar_id', index + 1)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all duration-200 ${
                          watchedAvatarId === index + 1
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register('avatar_id')} />
                </div>

                {/* Learning Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      Learning Level
                    </label>
                    <select
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                      {...register('learning_level')}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      Preferred Language
                    </label>
                    <select
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                      {...register('preferred_language')}
                    >
                      <option value="">Use parent's language</option>
                      <option value="ar">🇸🇦 Arabic</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="fr">🇫🇷 French</option>
                      <option value="de">🇩🇪 German</option>
                    </select>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-3 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                    Interests & Hobbies
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableInterests.map(interest => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg border transition-all duration-200 ${
                          watchedInterests.includes(interest.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span>{interest.icon}</span>
                        <span className="text-sm">{interest.name}</span>
                        {watchedInterests.includes(interest.id) && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register('interests')} />
                  {errors.interests && (
                    <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      {renderErrorMessage(errors.interests)}
                    </p>
                  )}
                </div>

                {/* Content Difficulty */}
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                    Content Difficulty Preference
                  </label>
                  <select
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                    {...register('content_difficulty')}
                  >
                    <option value="easy">Easy - Simple concepts</option>
                    <option value="age_appropriate">Age Appropriate - Standard level</option>
                    <option value="challenging">Challenging - Advanced for age</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    icon={editingChild ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  >
                    {editingChild ? 'Update Profile' : 'Create Profile'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Children Grid */}
        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
              No Children Profiles Yet
            </h3>
            <p className={`text-gray-600 mb-8 max-w-md mx-auto ${isRTL() ? 'font-cairo' : ''}`}>
              Create your first child profile to start generating personalized educational content tailored to their age and interests.
            </p>
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                icon={<Plus className="w-5 h-5" />}
                className="shadow-lg hover:shadow-xl"
              >
                Add Your First Child
              </Button>
            )}
          </div>
        )}

        {/* Tips Section */}
        {children.length > 0 && (
          <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className={`font-semibold text-blue-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                  Tips for Better Content Generation
                </h4>
                <ul className={`text-blue-800 text-sm space-y-1 ${isRTL() ? 'font-cairo' : ''}`}>
                  <li>• Add specific interests to get more personalized content</li>
                  <li>• Update the learning level as your child progresses</li>
                  <li>• Choose the right content difficulty to keep them engaged</li>
                  <li>• Multiple profiles help tailor content for each child's unique needs</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Children