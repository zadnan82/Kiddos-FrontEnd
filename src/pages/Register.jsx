import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuthStore } from '../stores/authstore'
import { useLanguageStore } from '../stores/languageStore'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const { t, isRTL, availableLanguages } = useLanguageStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      preferred_language: 'ar',
      timezone: 'Asia/Dubai',
      gdpr_consent: false,
      coppa_consent: false,
      marketing_consent: false
    }
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error(t('passwordsDoNotMatch'))
      return
    }

    if (!data.gdpr_consent || !data.coppa_consent) {
      toast.error('Please accept the required terms and conditions')
      return
    }

    // Remove confirmPassword from data
    const { confirmPassword, ...submitData } = data

    const result = await registerUser(submitData)
    
    if (result.success) {
      toast.success(t('registrationSuccess'))
      navigate('/dashboard')
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  const passwordStrength = (password) => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getStrengthColor = (strength) => {
    if (strength < 2) return 'bg-red-500'
    if (strength < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength) => {
    if (strength < 2) return 'Weak'
    if (strength < 4) return 'Medium'
    return 'Strong'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Kiddos</span>
          </Link>
          
          <h2 className={`text-3xl font-bold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
            Create your account
          </h2>
          <p className={`mt-2 text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
            Join thousands of families creating educational content
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  {t('firstName')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL() ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    type="text"
                    className={`block w-full ${isRTL() ? 'pr-10 text-right font-cairo' : 'pl-10'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                      errors.first_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="Ahmed"
                    {...register('first_name', {
                      required: t('required'),
                      minLength: { value: 2, message: 'Too short' }
                    })}
                  />
                </div>
                {errors.first_name && (
                  <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  {t('lastName')}
                </label>
                <input
                  id="last_name"
                  type="text"
                  className={`block w-full ${isRTL() ? 'text-right font-cairo' : ''} py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.last_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="Al-Rashid"
                  {...register('last_name', {
                    required: t('required'),
                    minLength: { value: 2, message: 'Too short' }
                  })}
                />
                {errors.last_name && (
                  <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                {t('email')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL() ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full ${isRTL() ? 'pr-10 text-right font-cairo' : 'pl-10'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="ahmed@example.com"
                  {...register('email', {
                    required: t('required'),
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: t('invalidEmail'),
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                {t('password')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL() ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full ${isRTL() ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: t('required'),
                    minLength: { value: 8, message: t('passwordTooShort') },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Password must contain uppercase, lowercase, number and special character'
                    }
                  })}
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 ${isRTL() ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength(password))}`}
                        style={{ width: `${(passwordStrength(password) / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs ${passwordStrength(password) < 4 ? 'text-red-600' : 'text-green-600'}`}>
                      {getStrengthText(passwordStrength(password))}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL() ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full ${isRTL() ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: t('required'),
                  })}
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 ${isRTL() ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={`mt-1 text-sm text-red-600 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Language Selection */}
            <div>
              <label htmlFor="preferred_language" className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL() ? 'font-cairo text-right' : ''}`}>
                Preferred Language
              </label>
              <select
                id="preferred_language"
                className={`block w-full ${isRTL() ? 'text-right font-cairo' : ''} py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                {...register('preferred_language')}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  id="gdpr_consent"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  {...register('gdpr_consent', { required: true })}
                />
                <label htmlFor="gdpr_consent" className={`ml-3 rtl:mr-3 rtl:ml-0 text-sm text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="coppa_consent"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  {...register('coppa_consent', { required: true })}
                />
                <label htmlFor="coppa_consent" className={`ml-3 rtl:mr-3 rtl:ml-0 text-sm text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                  I confirm that I am the parent/guardian and consent to create educational content for my children
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="marketing_consent"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  {...register('marketing_consent')}
                />
                <label htmlFor="marketing_consent" className={`ml-3 rtl:mr-3 rtl:ml-0 text-sm text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                  I would like to receive updates and educational tips via email (optional)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
              className="py-4"
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
            What you get with Kiddos:
          </h3>
          <ul className="space-y-3">
            {[
              'AI-powered personalized content',
              '10 free credits to get started',
              'Safe, moderated content for children',
              'Multi-language support (Arabic & English)',
              'Progress tracking and analytics'
            ].map((benefit, index) => (
              <li key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Register