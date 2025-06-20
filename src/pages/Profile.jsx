import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  Globe, 
  Clock, 
  Shield, 
  Settings, 
  Bell,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Edit3,
  Save,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

// FIXED: Added missing import
import { useAuthStore } from '../stores/authstore'
import { useLanguageStore } from '../stores/languageStore'
import { userAPI } from '../services/api'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const Profile = () => {
  const { user, updateUser } = useAuthStore() // FIXED: Now properly imported
  const { t, isRTL, availableLanguages, setLanguage } = useLanguageStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      preferred_language: user?.preferred_language || 'ar',
      timezone: user?.timezone || 'Asia/Dubai',
      marketing_consent: user?.marketing_consent || false
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        preferred_language: user.preferred_language || 'ar',
        timezone: user.timezone || 'Asia/Dubai',
        marketing_consent: user.marketing_consent || false
      })
    }
  }, [user, reset])

  const handleSaveProfile = async (data) => {
    try {
      setIsLoading(true)
      const response = await userAPI.updateProfile(data)
      
      // Update local user state
      updateUser(response.data)
      
      // Update language if changed
      if (data.preferred_language !== user?.preferred_language) {
        setLanguage(data.preferred_language)
      }
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      await userAPI.exportData({
        data_types: ['profile', 'children', 'content', 'transactions'],
        format: 'json'
      })
      toast.success('Data export request submitted. You will receive an email when ready.')
    } catch (error) {
      console.error('Export data error:', error)
      toast.error('Failed to request data export')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    )
    
    if (confirmation !== 'DELETE') {
      return
    }

    try {
      await userAPI.deleteData({
        deletion_type: 'account',
        reason: 'User requested account deletion',
        confirm_deletion: true
      })
      toast.success('Account deletion request submitted. Your account will be deleted within 30 days.')
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Failed to request account deletion')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  const timezones = [
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' }
  ]

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <tab.icon className="w-4 h-4" />
      <span>{tab.label}</span>
    </button>
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
            Profile Settings
          </h1>
          <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
            Manage your account information and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-semibold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      icon={<Edit3 className="w-4 h-4" />}
                    >
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          reset()
                        }}
                        icon={<X className="w-4 h-4" />}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit(handleSaveProfile)}
                        loading={isLoading}
                        disabled={!isDirty}
                        icon={<Save className="w-4 h-4" />}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-6">
                  {/* Profile Picture Placeholder */}
                  <div className="flex items-center space-x-6 rtl:space-x-reverse">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-medium text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                        {user?.first_name} {user?.last_name}
                      </h3>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-sm text-gray-400">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                        First Name
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${isRTL() ? 'text-right font-cairo' : ''} ${
                          errors.first_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                        {...register('first_name', { required: 'First name is required' })}
                      />
                      {errors.first_name && (
                        <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                          {errors.first_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${isRTL() ? 'text-right font-cairo' : ''} ${
                          errors.last_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                        }`}
                        {...register('last_name', { required: 'Last name is required' })}
                      />
                      {errors.last_name && (
                        <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                          {errors.last_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className={`w-full ${isRTL() ? 'pr-10 text-right font-cairo' : 'pl-10'} py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500`}
                      />
                    </div>
                    <p className={`mt-1 text-xs text-gray-500 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className={`text-xl font-semibold text-gray-900 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
                  Preferences
                </h2>

                <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      <Globe className="w-4 h-4 inline mr-1 rtl:ml-1 rtl:mr-0" />
                      Preferred Language
                    </label>
                    <select
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                      {...register('preferred_language')}
                    >
                      {availableLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                      <Clock className="w-4 h-4 inline mr-1 rtl:ml-1 rtl:mr-0" />
                      Timezone
                    </label>
                    <select
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${isRTL() ? 'text-right font-cairo' : ''}`}
                      {...register('timezone')}
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={isLoading}
                        disabled={!isDirty}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Privacy & Data Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
                    Privacy & Data Management
                  </h2>

                  <div className="space-y-6">
                    {/* Data Export */}
                    <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className={`font-medium text-blue-900 ${isRTL() ? 'font-cairo' : ''}`}>
                            Export Your Data
                          </h3>
                          <p className={`text-sm text-blue-700 mt-1 ${isRTL() ? 'font-cairo' : ''}`}>
                            Download a copy of all your data including profile, children, and content history.
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleExportData}
                        icon={<Download className="w-4 h-4" />}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        Export Data
                      </Button>
                    </div>

                    {/* Privacy Settings */}
                    <div className="space-y-4">
                      <h3 className={`font-medium text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                        Privacy Settings
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                              Marketing Communications
                            </p>
                            <p className={`text-sm text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                              Receive updates about new features and educational tips
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              {...register('marketing_consent')}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                              Usage Analytics
                            </p>
                            <p className={`text-sm text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                              Help us improve by sharing anonymous usage data
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Data Retention */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className={`font-medium text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                        Data Retention
                      </h3>
                      <p className={`text-sm text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                        We retain your data to provide our services. Content is automatically deleted after 90 days unless saved. 
                        Account data is kept until you delete your account.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-semibold text-red-900 ${isRTL() ? 'font-cairo' : ''}`}>
                      Danger Zone
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowDangerZone(!showDangerZone)}
                      icon={showDangerZone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      className="text-red-600 hover:text-red-700"
                    >
                      {showDangerZone ? 'Hide' : 'Show'}
                    </Button>
                  </div>

                  {showDangerZone && (
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start space-x-3 rtl:space-x-reverse">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <h3 className={`font-medium text-red-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                              Delete Account
                            </h3>
                            <p className={`text-sm text-red-700 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
                              Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <Button
                              variant="danger"
                              onClick={handleDeleteAccount}
                              icon={<Trash2 className="w-4 h-4" />}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className={`text-xl font-semibold text-gray-900 mb-6 ${isRTL() ? 'font-cairo' : ''}`}>
                  Notification Preferences
                </h2>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className={`font-medium text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                            Content Generation Updates
                          </p>
                          <p className={`text-sm text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                            Get notified when your content is ready for review
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                            Weekly Summary
                          </p>
                          <p className={`text-sm text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                            Receive a weekly summary of your children's learning progress
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                            Low Credits Warning
                          </p>
                          <p className={`text-sm text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                            Get notified when your credit balance is running low
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                            Product Updates
                          </p>
                          <p className={`text-sm text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                            Stay informed about new features and improvements
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className={`font-medium text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
                      Push Notifications
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className={`text-sm text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                        Push notifications are not yet available. We'll notify you via email when this feature becomes available.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                      icon={<Save className="w-4 h-4" />}
                    >
                      Save Notification Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile