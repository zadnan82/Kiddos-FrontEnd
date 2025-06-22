import { useState, useCallback } from 'react'
import { useFixedContentStore } from '../stores/fixedContentStore'

export const useProgress = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { enrollInCourse, startLesson, completeLesson } = useFixedContentStore()

  const enroll = useCallback(async (courseId, childId = null) => {
    try {
      setLoading(true)
      setError(null)
      const result = await enrollInCourse(courseId, childId)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [enrollInCourse])

  const start = useCallback(async (lessonId, childId = null) => {
    try {
      setLoading(true)
      setError(null)
      const result = await startLesson(lessonId, childId)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [startLesson])

  const complete = useCallback(async (lessonId, completionData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await completeLesson(lessonId, completionData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [completeLesson])

  return {
    enroll,
    start,
    complete,
    loading,
    error
  }
}