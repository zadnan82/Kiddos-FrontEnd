import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFixedContentStore } from '../stores/fixedContentStore'
import { useLanguageStore } from '../stores/languageStore'
import CourseCard from '../components/CourseCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react'

const CourseList = () => {
  const { subjectId } = useParams()
  const { 
    courses, 
    userProgress, 
    loading, 
    error, 
    fetchCourses, 
    fetchUserProgress 
  } = useFixedContentStore()
  const { language } = useLanguageStore()
  
  const [filters, setFilters] = useState({
    search: '',
    age_group: '',
    difficulty_level: '',
    is_featured: null
  })

  useEffect(() => {
    const courseFilters = {
      subject_id: subjectId,
      language,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      )
    }
    
    fetchCourses(courseFilters)
    fetchUserProgress()
  }, [subjectId, language, filters, fetchCourses, fetchUserProgress])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      age_group: '',
      difficulty_level: '',
      is_featured: null
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" text="Loading courses..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => fetchCourses({ subject_id: subjectId, language })}
          className="btn btn-primary"
       >
         Try Again
       </button>
     </div>
   )
 }

 return (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     {/* Header */}
     <div className="mb-8">
       <Link 
         to="/fixed-content/subjects"
         className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
       >
         <ArrowLeft className="w-4 h-4" />
         Back to Subjects
       </Link>
       <h1 className="text-3xl font-bold text-gray-900 mb-4">
         Available Courses
       </h1>
       <p className="text-xl text-gray-600">
         Choose from our carefully crafted courses to start your learning journey
       </p>
     </div>

     {/* Filters */}
     <div className="bg-white rounded-lg border p-6 mb-8">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {/* Search */}
         <div className="lg:col-span-2">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Search Courses
           </label>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input
               type="text"
               placeholder="Search by title or description..."
               value={filters.search}
               onChange={(e) => handleFilterChange('search', e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             />
           </div>
         </div>

         {/* Age Group */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Age Group
           </label>
           <select
             value={filters.age_group}
             onChange={(e) => handleFilterChange('age_group', e.target.value)}
             className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           >
             <option value="">All Ages</option>
             <option value="2">2-3 years</option>
             <option value="4">4-5 years</option>
             <option value="6">6-7 years</option>
             <option value="8">8-9 years</option>
             <option value="10">10-11 years</option>
             <option value="12">12+ years</option>
           </select>
         </div>

         {/* Difficulty */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Difficulty
           </label>
           <select
             value={filters.difficulty_level}
             onChange={(e) => handleFilterChange('difficulty_level', e.target.value)}
             className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           >
             <option value="">All Levels</option>
             <option value="beginner">Beginner</option>
             <option value="intermediate">Intermediate</option>
             <option value="advanced">Advanced</option>
           </select>
         </div>
       </div>

       <div className="flex items-center justify-between mt-4">
         <div className="flex items-center gap-4">
           <label className="flex items-center gap-2">
             <input
               type="checkbox"
               checked={filters.is_featured === true}
               onChange={(e) => handleFilterChange('is_featured', e.target.checked ? true : null)}
               className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
             />
             <span className="text-sm text-gray-700">Featured only</span>
           </label>
         </div>
         
         <button
           onClick={clearFilters}
           className="text-sm text-gray-500 hover:text-gray-700"
         >
           Clear filters
         </button>
       </div>
     </div>

     {/* Results */}
     <div className="mb-6">
       <p className="text-gray-600">
         Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
       </p>
     </div>

     {/* Courses Grid */}
     {courses.length > 0 ? (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {courses.map((course) => (
           <CourseCard 
             key={course.id} 
             course={course}
             userProgress={userProgress[course.id]}
             language={language}
           />
         ))}
       </div>
     ) : (
       <div className="text-center py-12">
         <div className="text-gray-500 mb-4">No courses found matching your criteria</div>
         <button
           onClick={clearFilters}
           className="text-blue-600 hover:text-blue-700 font-medium"
         >
           Clear filters to see all courses
         </button>
       </div>
     )}
   </div>
 )
}

export default CourseList