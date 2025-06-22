import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  ArrowRight,
  Calendar,
  Target
} from 'lucide-react'
import ProgressBar from './ProgressBar'
import LessonCard from './LessonCard'

const CourseDetail = ({ 
  course, 
  userProgress, 
  onEnroll, 
  onStartLesson,
  loading = false,
  className = '' 
}) => {
  const [showAllLessons, setShowAllLessons] = useState(false)
  
  if (!course) return null

  const isEnrolled = !!userProgress
  const isCompleted = userProgress?.status === 'completed'
  const progress = userProgress?.progress_percentage || 0
  const lessonsToShow = showAllLessons ? course.lessons : course.lessons?.slice(0, 3)

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getDifficultyColor = (level) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[level] || colors.beginner
  }

  const getNextLesson = () => {
    if (!course.lessons || !isEnrolled) return null
    
    return course.lessons.find(lesson => {
      const lessonProgress = lesson.userProgress
      return !lessonProgress || lessonProgress.status !== 'completed'
    })
  }

  const getCompletedLessonsCount = () => {
    if (!course.lessons) return 0
    return course.lessons.filter(lesson => 
      lesson.userProgress?.status === 'completed'
    ).length
  }

  const nextLesson = getNextLesson()
  const completedLessons = getCompletedLessonsCount()

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${className}`}>
      {/* Course Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                  {course.is_featured && (
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                </div>
                
                {course.description && (
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>
              
              {isCompleted && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>

            {/* Course Meta */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {formatDuration(course.estimated_duration_minutes)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  Ages {course.age_group_min}-{course.age_group_max}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">
                  {course.lesson_count} lessons
                </span>
              </div>
              {course.credit_reward > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">
                    +{course.credit_reward} credits
                  </span>
                </div>
              )}
            </div>

            {/* Difficulty Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(course.difficulty_level)}`}>
                {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
              </span>
              
              {course.published_at && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Published {new Date(course.published_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Progress Section */}
            {isEnrolled && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Your Progress</h3>
                  <span className="text-sm text-gray-600">
                    {completedLessons} of {course.lesson_count} lessons
                  </span>
                </div>
                
                <ProgressBar
                  current={completedLessons}
                  total={course.lesson_count}
                  label=""
                  color="blue"
                  size="md"
               />
               
               {userProgress && (
                 <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                   <div>
                     <span className="text-gray-600">Time spent:</span>
                     <span className="font-medium ml-1">
                       {formatDuration(userProgress.total_time_spent_minutes || 0)}
                     </span>
                   </div>
                   {userProgress.average_score && (
                     <div>
                       <span className="text-gray-600">Average score:</span>
                       <span className="font-medium ml-1">
                         {Math.round(userProgress.average_score)}%
                       </span>
                     </div>
                   )}
                 </div>
               )}
             </div>
           )}
         </div>

         {/* Action Panel */}
         <div className="lg:w-80">
           <div className="bg-gray-50 rounded-lg p-6">
             {!isEnrolled ? (
               <div className="text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Play className="w-8 h-8 text-blue-600" />
                 </div>
                 <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
                 <p className="text-gray-600 text-sm mb-4">
                   Begin your learning journey with this course
                 </p>
                 <button
                   onClick={onEnroll}
                   disabled={loading}
                   className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   {loading ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       Enrolling...
                     </>
                   ) : (
                     <>
                       <Play className="w-4 h-4" />
                       Enroll Now
                     </>
                   )}
                 </button>
                 <p className="text-xs text-gray-500 mt-2">
                   Free to enroll • Earn credits on completion
                 </p>
               </div>
             ) : (
               <div className="text-center">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                   isCompleted ? 'bg-green-100' : 'bg-blue-100'
                 }`}>
                   {isCompleted ? (
                     <CheckCircle className="w-8 h-8 text-green-600" />
                   ) : (
                     <Target className="w-8 h-8 text-blue-600" />
                   )}
                 </div>
                 
                 <h3 className="text-lg font-semibold mb-2">
                   {isCompleted ? 'Course Completed!' : 'Continue Learning'}
                 </h3>
                 
                 <p className="text-gray-600 text-sm mb-4">
                   {isCompleted 
                     ? 'Great job! You can review lessons anytime.' 
                     : nextLesson 
                     ? `Next: ${nextLesson.title}`
                     : 'Keep up the great work!'
                   }
                 </p>

                 {nextLesson && (
                   <button
                     onClick={() => onStartLesson(nextLesson.id)}
                     className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                   >
                     <Play className="w-4 h-4" />
                     {completedLessons === 0 ? 'Start First Lesson' : 'Continue Learning'}
                   </button>
                 )}

                 {isCompleted && (
                   <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                     <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                       <Award className="w-4 h-4" />
                       Credits Earned
                     </div>
                     <p className="text-green-600 text-lg font-bold">
                       +{userProgress.credits_earned || course.credit_reward} credits
                     </p>
                   </div>
                 )}

                 {userProgress && (
                   <div className="mt-4 text-xs text-gray-500 space-y-1">
                     <div>Last accessed: {new Date(userProgress.last_accessed_at).toLocaleDateString()}</div>
                     {userProgress.started_at && (
                       <div>Started: {new Date(userProgress.started_at).toLocaleDateString()}</div>
                     )}
                   </div>
                 )}
               </div>
             )}
           </div>
         </div>
       </div>
     </div>

     {/* Prerequisites */}
     {course.prerequisite && (
       <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
         <div className="flex items-start gap-3">
           <div className="w-5 h-5 text-yellow-600 mt-0.5">
             <Lock className="w-full h-full" />
           </div>
           <div>
             <h4 className="font-medium text-yellow-800 mb-1">Prerequisite Required</h4>
             <p className="text-yellow-700 text-sm mb-2">
               Complete "{course.prerequisite.title}" before starting this course.
             </p>
             <Link
               to={`/fixed-content/courses/${course.prerequisite.id}`}
               className="inline-flex items-center gap-1 text-yellow-800 hover:text-yellow-900 text-sm font-medium"
             >
               View Course
               <ArrowRight className="w-3 h-3" />
             </Link>
           </div>
         </div>
       </div>
     )}

     {/* Course Lessons */}
     {course.lessons && course.lessons.length > 0 && (
       <div className="p-6">
         <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-gray-900">Course Lessons</h2>
           {course.lessons.length > 3 && (
             <button
               onClick={() => setShowAllLessons(!showAllLessons)}
               className="text-blue-600 hover:text-blue-700 text-sm font-medium"
             >
               {showAllLessons ? 'Show Less' : `Show All ${course.lessons.length} Lessons`}
             </button>
           )}
         </div>

         <div className="space-y-4">
           {lessonsToShow?.map((lesson, index) => {
             const isLocked = !isEnrolled || (
               index > 0 && 
               !course.lessons[index - 1].userProgress?.status === 'completed'
             )

             return (
               <LessonCard
                 key={lesson.id}
                 lesson={lesson}
                 userProgress={lesson.userProgress}
                 isLocked={isLocked}
                 courseId={course.id}
                 showCourseInfo={false}
               />
             )
           })}
         </div>

         {!showAllLessons && course.lessons.length > 3 && (
           <div className="text-center mt-6">
             <button
               onClick={() => setShowAllLessons(true)}
               className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
             >
               View {course.lessons.length - 3} More Lessons
               <ArrowRight className="w-4 h-4" />
             </button>
           </div>
         )}
       </div>
     )}

     {/* Learning Objectives */}
     {course.learning_objectives && course.learning_objectives.length > 0 && (
       <div className="px-6 pb-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h3>
         <div className="grid gap-3">
           {course.learning_objectives.map((objective, index) => (
             <div key={index} className="flex items-start gap-3">
               <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                 <CheckCircle className="w-3 h-3 text-blue-600" />
               </div>
               <span className="text-gray-700">{objective}</span>
             </div>
           ))}
         </div>
       </div>
     )}
   </div>
 )
}

export default CourseDetail