import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFixedContentStore } from '../stores/fixedContentStore'
import { useLanguageStore } from '../stores/languageStore'
import ProgressBar from '../components/ProgressBar'
import CourseCard from '../components/CourseCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Trophy, 
  Clock, 
  Target, 
  Star, 
  BookOpen, 
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react'

const LearningDashboard = () => {
  const { 
    userProgress, 
    courses,
    loading, 
    error, 
    fetchUserProgress,
    fetchCourses 
  } = useFixedContentStore()
  const { language } = useLanguageStore()
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    creditsEarned: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    currentStreak: 0
  })

  useEffect(() => {
    fetchUserProgress()
    fetchCourses({ limit: 5 }) // Get recent courses for recommendations
  }, [fetchUserProgress, fetchCourses])

  useEffect(() => {
    // Calculate statistics from user progress
    if (userProgress && typeof userProgress === 'object') {
      const progressArray = Object.values(userProgress)
      
      const newStats = {
        totalCourses: progressArray.length,
        completedCourses: progressArray.filter(p => p.status === 'completed').length,
        totalLessons: progressArray.reduce((sum, p) => sum + (p.total_lessons || 0), 0),
        completedLessons: progressArray.reduce((sum, p) => sum + (p.lessons_completed || 0), 0),
        creditsEarned: progressArray.reduce((sum, p) => sum + (p.credits_earned || 0), 0),
        totalTimeSpent: progressArray.reduce((sum, p) => sum + (p.total_time_spent_minutes || 0), 0),
        averageScore: progressArray.length > 0 
          ? progressArray.reduce((sum, p) => sum + (p.average_score || 0), 0) / progressArray.length 
          : 0,
        currentStreak: 7 // This would come from backend calculation
      }
      
      setStats(newStats)
    }
  }, [userProgress])

  const getRecentActivity = () => {
    if (!userProgress || typeof userProgress !== 'object') return []
    
    return Object.values(userProgress)
      .filter(p => p.last_accessed_at)
      .sort((a, b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at))
      .slice(0, 5)
  }

  const getInProgressCourses = () => {
    if (!userProgress || typeof userProgress !== 'object') return []
    
    return Object.values(userProgress)
      .filter(p => p.status === 'in_progress')
      .sort((a, b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => fetchUserProgress()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  const recentActivity = getRecentActivity()
  const inProgressCourses = getInProgressCourses()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Learning Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Track your progress and continue your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Courses Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedCourses}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              current={stats.completedCourses}
              total={Math.max(stats.totalCourses, 1)}
              color="green"
              size="sm"
              showPercentage={false}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedLessons}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              current={stats.completedLessons}
              total={Math.max(stats.totalLessons, 1)}
              color="blue"
              size="sm"
              showPercentage={false}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Earned</p>
              <p className="text-2xl font-bold text-gray-900">
               {stats.creditsEarned.toFixed(1)}
             </p>
           </div>
           <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
             <Award className="w-5 h-5 text-purple-600" />
           </div>
         </div>
         <p className="text-sm text-gray-500 mt-2">
           From course completions
         </p>
       </div>

       <div className="bg-white rounded-xl shadow-sm p-6">
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-600">Learning Time</p>
             <p className="text-2xl font-bold text-gray-900">
               {Math.round(stats.totalTimeSpent / 60)}h
             </p>
           </div>
           <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
             <Clock className="w-5 h-5 text-orange-600" />
           </div>
         </div>
         <p className="text-sm text-gray-500 mt-2">
           Total time invested
         </p>
       </div>
     </div>

     {/* Additional Stats Row */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       <div className="bg-white rounded-xl shadow-sm p-6">
         <div className="flex items-center gap-3 mb-4">
           <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
             <Star className="w-4 h-4 text-yellow-600" />
           </div>
           <h3 className="font-semibold text-gray-900">Average Score</h3>
         </div>
         <p className="text-3xl font-bold text-gray-900 mb-2">
           {stats.averageScore ? Math.round(stats.averageScore) : 0}%
         </p>
         <p className="text-sm text-gray-500">Across all assessments</p>
       </div>

       <div className="bg-white rounded-xl shadow-sm p-6">
         <div className="flex items-center gap-3 mb-4">
           <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
             <TrendingUp className="w-4 h-4 text-green-600" />
           </div>
           <h3 className="font-semibold text-gray-900">Learning Streak</h3>
         </div>
         <p className="text-3xl font-bold text-gray-900 mb-2">
           {stats.currentStreak}
         </p>
         <p className="text-sm text-gray-500">Days in a row</p>
       </div>

       <div className="bg-white rounded-xl shadow-sm p-6">
         <div className="flex items-center gap-3 mb-4">
           <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
             <Target className="w-4 h-4 text-indigo-600" />
           </div>
           <h3 className="font-semibold text-gray-900">Completion Rate</h3>
         </div>
         <p className="text-3xl font-bold text-gray-900 mb-2">
           {stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}%
         </p>
         <p className="text-sm text-gray-500">Of enrolled courses</p>
       </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* Continue Learning */}
       <div className="bg-white rounded-xl shadow-sm p-6">
         <h2 className="text-xl font-bold text-gray-900 mb-6">Continue Learning</h2>
         
         {inProgressCourses.length > 0 ? (
           <div className="space-y-4">
             {inProgressCourses.slice(0, 3).map((progress) => {
               const course = courses.find(c => c.id === progress.course_id)
               return course ? (
                 <div key={progress.course_id} className="border rounded-lg p-4">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="font-medium text-gray-900">{course.title}</h3>
                     <span className="text-sm text-gray-500">
                       {Math.round(progress.progress_percentage)}%
                     </span>
                   </div>
                   <ProgressBar
                     current={progress.lessons_completed}
                     total={progress.total_lessons}
                     color="blue"
                     size="sm"
                     showPercentage={false}
                   />
                   <div className="flex items-center justify-between mt-3">
                     <span className="text-sm text-gray-500">
                       {progress.lessons_completed} of {progress.total_lessons} lessons
                     </span>
                     <Link
                       to={`/fixed-content/courses/${course.id}`}
                       className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                     >
                       Continue →
                     </Link>
                   </div>
                 </div>
               ) : null
             })}
           </div>
         ) : (
           <div className="text-center py-8">
             <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">
               No courses in progress
             </h3>
             <p className="text-gray-500 mb-4">
               Start a new course to begin your learning journey
             </p>
             <Link
               to="/fixed-content"
               className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
             >
               <BookOpen className="w-4 h-4" />
               Browse Courses
             </Link>
           </div>
         )}
       </div>

       {/* Recent Activity */}
       <div className="bg-white rounded-xl shadow-sm p-6">
         <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
         
         {recentActivity.length > 0 ? (
           <div className="space-y-4">
             {recentActivity.map((progress) => {
               const course = courses.find(c => c.id === progress.course_id)
               return course ? (
                 <div key={progress.course_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                     progress.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                   }`}>
                     {progress.status === 'completed' ? (
                       <Trophy className="w-5 h-5 text-green-600" />
                     ) : (
                       <BookOpen className="w-5 h-5 text-blue-600" />
                     )}
                   </div>
                   <div className="flex-1">
                     <h3 className="font-medium text-gray-900">{course.title}</h3>
                     <p className="text-sm text-gray-500">
                       {progress.status === 'completed' ? 'Completed' : 'In Progress'} • 
                       {new Date(progress.last_accessed_at).toLocaleDateString()}
                     </p>
                   </div>
                   <Link
                     to={`/fixed-content/courses/${course.id}`}
                     className="text-blue-600 hover:text-blue-700"
                   >
                     <span className="sr-only">View course</span>
                     →
                   </Link>
                 </div>
               ) : null
             })}
           </div>
         ) : (
           <div className="text-center py-8">
             <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">
               No recent activity
             </h3>
             <p className="text-gray-500">
               Your learning activity will appear here
             </p>
           </div>
         )}
       </div>
     </div>

     {/* Quick Actions */}
     <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
       <div className="flex flex-col md:flex-row items-center justify-between">
         <div>
           <h2 className="text-xl font-bold mb-2">Ready to Learn More?</h2>
           <p className="text-blue-100">
             Explore new subjects and earn credits by completing courses
           </p>
         </div>
         <div className="flex gap-3 mt-4 md:mt-0">
           <Link
             to="/fixed-content"
             className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
           >
             Browse Courses
           </Link>
           <Link
             to="/fixed-content/subjects"
             className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors"
           >
             View Subjects
           </Link>
         </div>
       </div>
     </div>
   </div>
 )
}

export default LearningDashboard