import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlusCircle, 
  BookOpen, 
  Users, 
  Coins, 
  TrendingUp,
  Calendar,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  Activity,
  Target
} from 'lucide-react'
import { useAuthStore } from '../stores/authstore'
import { useLanguageStore } from '../stores/languageStore'
import { dashboardAPI, childrenAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Button from '../components/ui/Button'

const Dashboard = () => {
  const { user } = useAuthStore()
  const { t, isRTL } = useLanguageStore()
  const [stats, setStats] = useState(null)
  const [children, setChildren] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [statsResponse, childrenResponse, summaryResponse] = await Promise.all([
        dashboardAPI.getStats(),
        childrenAPI.getChildren(),
        dashboardAPI.getSummary()
      ])

      setStats(statsResponse.data)
      setChildren(childrenResponse.data)
      setRecentActivity(summaryResponse.data.recent_activity || [])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium text-gray-600 mb-1 ${isRTL() ? 'font-cairo' : ''}`}>
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className={`text-xs text-gray-500 mt-1 ${isRTL() ? 'font-cairo' : ''}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1 rtl:ml-1 rtl:mr-0" />
          <span className="text-green-600 font-medium">{trend}</span>
          <span className="text-gray-500 ml-1 rtl:mr-1 rtl:ml-0">vs last week</span>
        </div>
      )}
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, to, color, disabled = false }) => (
    <Link 
      to={disabled ? '#' : to} 
      className={`block ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:shadow-md'} transition-all duration-200`}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
          {title}
        </h3>
        <p className={`text-gray-600 text-sm ${isRTL() ? 'font-cairo' : ''}`}>
          {description}
        </p>
        {!disabled && (
          <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
            <span>{t('getStarted')}</span>
            <ArrowRight className="w-4 h-4 ml-1 rtl:mr-1 rtl:ml-0" />
          </div>
        )}
      </div>
    </Link>
  )

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-3 rtl:space-x-reverse py-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
          {activity.topic}
        </p>
        <p className={`text-xs text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
          {activity.content_type} • Age {activity.age_group}
        </p>
      </div>
      <div className="text-xs text-gray-400">
        {new Date(activity.created_at).toLocaleDateString()}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${isRTL() ? 'font-cairo' : ''}`}>
                {t('welcomeBack')}, {user?.first_name || 'User'}!
              </h1>
              <p className={`text-gray-600 ${isRTL() ? 'font-cairo' : ''}`}>
                Here's what's happening with your children's learning today
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/generate">
                <Button 
                  size="lg" 
                  icon={<PlusCircle className="w-5 h-5" />}
                  className="shadow-lg hover:shadow-xl"
                >
                  {t('generate')} Content
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('credits')}
            value={user?.credits || 0}
            icon={Coins}
            color="bg-gradient-to-br from-yellow-400 to-yellow-600"
            subtitle="Available for content generation"
          />
          <StatCard
            title={t('children')}
            value={children.length}
            icon={Users}
            color="bg-gradient-to-br from-green-400 to-green-600"
            subtitle="Active profiles"
          />
          <StatCard
            title="Total Content"
            value={stats?.total_content_generated || 0}
            icon={BookOpen}
            color="bg-gradient-to-br from-blue-400 to-blue-600"
            subtitle="Content pieces created"
          />
          <StatCard
            title="This Week"
            value={stats?.content_this_week || 0}
            icon={TrendingUp}
            color="bg-gradient-to-br from-purple-400 to-purple-600"
            subtitle="New content generated"
            trend="+12%"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Add Child Profile"
              description="Create a new profile for your child to get personalized content"
              icon={Users}
              to="/children"
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <QuickActionCard
              title="Generate Story"
              description="Create an engaging educational story for your child"
              icon={BookOpen}
              to="/generate?type=story"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickActionCard
              title="Create Worksheet"
              description="Design interactive worksheets for learning activities"
              icon={Sparkles}
              to="/generate?type=worksheet"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                  Recent Activity
                </h3>
                <Link 
                  to="/history" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1 rtl:mr-1 rtl:ml-0" />
                </Link>
              </div>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-1">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className={`text-gray-500 ${isRTL() ? 'font-cairo' : ''}`}>
                    No recent activity. Start by generating your first content!
                  </p>
                  <Link to="/generate" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      Generate Content
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Children Profiles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                  Your Children
                </h3>
                <Link to="/children">
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
              
              {children.length > 0 ? (
                <div className="space-y-3">
                  {children.slice(0, 3).map((child) => (
                    <div key={child.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {child.nickname?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-gray-900 ${isRTL() ? 'font-cairo' : ''}`}>
                          {child.nickname || `Child ${child.age_group}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Age {child.age_group} • {child.content_count} content pieces
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className={`text-sm text-gray-500 mb-3 ${isRTL() ? 'font-cairo' : ''}`}>
                    Add your first child profile
                  </p>
                  <Link to="/children">
                    <Button size="sm" fullWidth>
                      Add Child
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL() ? 'font-cairo' : ''}`}>
                Learning Goals
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm text-gray-700 ${isRTL() ? 'font-cairo' : ''}`}>
                      Weekly Content
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.content_this_week || 0}/5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((stats?.content_this_week || 0) / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Credit Status */}
            {user?.credits < 10 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Coins className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h4 className={`font-semibold text-yellow-800 ${isRTL() ? 'font-cairo' : ''}`}>
                      Low Credits
                    </h4>
                    <p className={`text-sm text-yellow-700 ${isRTL() ? 'font-cairo' : ''}`}>
                      You have {user?.credits || 0} credits remaining
                    </p>
                  </div>
                </div>
                <Link to="/credits" className="mt-4 block">
                  <Button variant="warning" size="sm" fullWidth>
                    Purchase Credits
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard