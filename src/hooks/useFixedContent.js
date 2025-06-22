import { useEffect } from 'react'
import { useFixedContentStore } from '../stores/fixedContentStore'

export const useFixedContent = () => {
  const store = useFixedContentStore()
  
  return store
}

export const useSubjects = (language = 'en') => {
  const { subjects, loading, error, fetchSubjects } = useFixedContentStore()
  
  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects, language])
  
  return { subjects, loading, error, refetch: fetchSubjects }
}

export const useCourses = (filters = {}) => {
  const { courses, loading, error, fetchCourses } = useFixedContentStore()
  
  useEffect(() => {
    fetchCourses(filters)
  }, [fetchCourses, JSON.stringify(filters)])
  
  return { courses, loading, error, refetch: () => fetchCourses(filters) }
}

export const useCourse = (courseId, childId = null, language = 'en') => {
  const { currentCourse, loading, error, fetchCourse } = useFixedContentStore()
  
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId)
    }
  }, [courseId, childId, language, fetchCourse])
  
  return { course: currentCourse, loading, error, refetch: () => fetchCourse(courseId) }
}

export const useLesson = (lessonId, childId = null, language = 'en') => {
  const { currentLesson, loading, error, fetchLesson } = useFixedContentStore()
  
  useEffect(() => {
    if (lessonId) {
      fetchLesson(lessonId)
    }
  }, [lessonId, childId, language, fetchLesson])
  
  return { lesson: currentLesson, loading, error, refetch: () => fetchLesson(lessonId) }
}

export const useProgress = (childId = null) => {
  const { userProgress, loading, error, fetchUserProgress } = useFixedContentStore()
  
  useEffect(() => {
    fetchUserProgress(childId)
  }, [childId, fetchUserProgress])
  
  return { progress: userProgress, loading, error, refetch: () => fetchUserProgress(childId) }
}