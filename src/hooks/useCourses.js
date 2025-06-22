import { useEffect, useState, useCallback } from 'react'
import { useCoursesStore } from '../stores/coursesStore'
import { useProgressStore } from '../stores/progressStore'

export const useCourses = (initialFilters = {}) => {
  const {
    allCourses,
    filteredCourses,
    filters,
    sorting,
    pagination,
    loading,
    error,
    setFilters,
    setSorting,
    setPage,
    fetchCourses,
    clearFilters,
    searchCourses,
    getRecommendations
  } = useCoursesStore()

  const { courseProgress, fetchAllProgress } = useProgressStore()

  // Initialize with filters and fetch data
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters)
    } else {
      fetchCourses()
    }
    fetchAllProgress()
  }, [])

  // Enhanced course data with progress
  const coursesWithProgress = filteredCourses.map(course => ({
    ...course,
    userProgress: courseProgress[course.id] || null
  }))

  return {
    courses: coursesWithProgress,
    allCourses,
    filters,
    sorting,
    pagination,
    loading,
    error,
    
    // Actions
    setFilters,
    setSorting,
    setPage,
    refresh: fetchCourses,
    clearFilters,
    search: searchCourses,
    getRecommendations,
    
    // Computed values
    hasResults: filteredCourses.length > 0,
    isEmpty: !loading && filteredCourses.length === 0,
    hasFilters: Object.values(filters).some(value => value !== '' && value !== null),
    
    // Progress summary
    progressSummary: {
      enrolled: Object.keys(courseProgress).length,
      completed: Object.values(courseProgress).filter(p => p.status === 'completed').length,
      inProgress: Object.values(courseProgress).filter(p => p.status === 'in_progress').length
    }
  }
}

export const useCourse = (courseId, childId = null) => {
  const { 
    courseDetails, 
    fetchCourseDetails, 
    getCourseById 
  } = useCoursesStore()
  
  const { 
    courseProgress, 
    lessonProgress, 
    fetchCourseProgress,
    enrollInCourse,
    getCourseProgress 
  } = useProgressStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const course = getCourseById(courseId)
  const progress = getCourseProgress(courseId)

  const fetchData = useCallback(async () => {
    if (!courseId) return

    try {
      setLoading(true)
      setError(null)
      
      // Fetch course details and progress in parallel
      await Promise.all([
        fetchCourseDetails(courseId, childId),
        fetchCourseProgress(courseId, childId)
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [courseId, childId, fetchCourseDetails, fetchCourseProgress])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const enroll = useCallback(async () => {
    try {
      await enrollInCourse(courseId, childId)
      await fetchData() // Refresh data after enrollment
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [courseId, childId, enrollInCourse, fetchData])

  // Enhanced course with lessons and their progress
  const courseWithProgress = course ? {
    ...course,
    userProgress: progress,
    lessons: course.lessons?.map(lesson => ({
      ...lesson,
      userProgress: lessonProgress[lesson.id] || null
    })) || []
  } : null

  return {
    course: courseWithProgress,
    progress,
    loading,
    error,
    enroll,
    refresh: fetchData,
    
    // Computed values
    isEnrolled: !!progress,
    isCompleted: progress?.status === 'completed',
    canStart: !progress || progress.status === 'not_started',
    nextLesson: courseWithProgress?.lessons?.find(lesson => 
      !lesson.userProgress || lesson.userProgress.status !== 'completed'
    ),
    completedLessons: courseWithProgress?.lessons?.filter(lesson => 
      lesson.userProgress?.status === 'completed'
    ).length || 0
  }
}

export const useCoursesFilters = () => {
  const { filters, setFilters, clearFilters } = useCoursesStore()
  
  const updateFilter = useCallback((key, value) => {
    setFilters({ [key]: value })
  }, [setFilters])

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [setFilters])

  const resetFilters = useCallback(() => {
    clearFilters()
  }, [clearFilters])

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters: Object.values(filters).some(value => value !== '' && value !== null)
  }
}

export const useCourseRecommendations = (childId = null, limit = 5) => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { getRecommendations } = useCoursesStore()

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const recs = await getRecommendations(childId, limit)
      setRecommendations(recs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [childId, limit, getRecommendations])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations
  }
}