import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { fixedContentApi } from '../services/fixedContentApi'

const useFixedContentStore = create()(
  devtools(
    (set, get) => ({
      // State
      subjects: [],
      courses: [],
      lessons: [],
      currentCourse: null,
      currentLesson: null,
      userProgress: {},
      loading: false,
      error: null,

      // Actions
      fetchSubjects: async () => {
        set({ loading: true, error: null })
        try {
          const subjects = await fixedContentApi.getSubjects()
          set({ subjects, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      fetchCourses: async (filters = {}) => {
        set({ loading: true, error: null })
        try {
          const courses = await fixedContentApi.getCourses(filters)
          set({ courses, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      fetchCourse: async (courseId) => {
        set({ loading: true, error: null })
        try {
          const course = await fixedContentApi.getCourse(courseId)
          set({ currentCourse: course, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      fetchLesson: async (lessonId, childId = null) => {
        set({ loading: true, error: null })
        try {
          const lesson = await fixedContentApi.getLesson(lessonId, childId)
          set({ currentLesson: lesson, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      enrollInCourse: async (courseId, childId = null) => {
        try {
          const progress = await fixedContentApi.enrollInCourse(courseId, childId)
          const userProgress = get().userProgress
          set({ 
            userProgress: {
              ...userProgress,
              [courseId]: progress
            }
          })
          return progress
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      startLesson: async (lessonId, childId = null) => {
        try {
          const progress = await fixedContentApi.startLesson(lessonId, childId)
          return progress
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      completeLesson: async (lessonId, completionData) => {
        try {
          const result = await fixedContentApi.completeLesson(lessonId, completionData)
          // Update progress in state
          const { userProgress } = get()
          const courseId = result.course_progress.course_id
          set({
            userProgress: {
              ...userProgress,
              [courseId]: result.course_progress
            }
          })
          return result
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      fetchUserProgress: async (childId = null) => {
        try {
          const progress = await fixedContentApi.getUserProgress(childId)
          set({ userProgress: progress })
        } catch (error) {
          set({ error: error.message })
        }
      },

      // Reset state
      reset: () => {
        set({
          subjects: [],
          courses: [],
          lessons: [],
          currentCourse: null,
          currentLesson: null,
          userProgress: {},
          loading: false,
          error: null
        })
      }
    }),
    {
      name: 'fixed-content-store'
    }
  )
)

export { useFixedContentStore }