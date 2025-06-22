import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { progressApi } from '../services/progressApi'

const useProgressStore = create()(
  devtools(
    persist(
      (set, get) => ({
        // State
        courseProgress: {}, // { courseId: progressData }
        lessonProgress: {}, // { lessonId: progressData }
        monthlyCredits: null,
        learningStats: null,
        dashboard: null,
        loading: false,
        error: null,

        // Progress Actions
        enrollInCourse: async (courseId, childId = null) => {
          set({ loading: true, error: null })
          
          try {
            const progress = await progressApi.enrollInCourse(courseId, childId)
            
            set(state => ({
              courseProgress: {
                ...state.courseProgress,
                [courseId]: progress
              },
              loading: false
            }))
            
            return progress
          } catch (error) {
            set({ error: error.message, loading: false })
            throw error
          }
        },

        startLesson: async (lessonId, childId = null) => {
          set({ loading: true, error: null })
          
          try {
            const progress = await progressApi.startLesson(lessonId, childId)
            
            set(state => ({
              lessonProgress: {
                ...state.lessonProgress,
                [lessonId]: progress
              },
              loading: false
            }))
            
            return progress
          } catch (error) {
            set({ error: error.message, loading: false })
            throw error
          }
        },

        completeLesson: async (lessonId, completionData) => {
          set({ loading: true, error: null })
          
          try {
            const result = await progressApi.completeLesson(lessonId, completionData)
            
            set(state => ({
              lessonProgress: {
                ...state.lessonProgress,
                [lessonId]: result.lesson_progress
              },
              courseProgress: {
                ...state.courseProgress,
                [result.course_progress.course_id]: result.course_progress
              },
              loading: false
            }))
            
            return result
          } catch (error) {
            set({ error: error.message, loading: false })
            throw error
          }
        },

        fetchCourseProgress: async (courseId, childId = null) => {
          try {
            const progress = await progressApi.getCourseProgress(courseId, childId)
            
            if (progress) {
              set(state => ({
                courseProgress: {
                  ...state.courseProgress,
                  [courseId]: progress
                }
              }))
            }
            
            return progress
          } catch (error) {
            console.error('Failed to fetch course progress:', error)
            return null
          }
        },

        fetchAllProgress: async (childId = null) => {
          set({ loading: true, error: null })
          
          try {
            const progressList = await progressApi.getAllProgress(childId)
            
            // Convert array to object keyed by course_id
            const progressByCoursed = {}
            progressList.forEach(progress => {
              progressByCoursed[progress.course_id] = progress
            })
            
            set({
              courseProgress: progressByCoursed,
              loading: false
            })
            
            return progressList
          } catch (error) {
            set({ error: error.message, loading: false })
            throw error
          }
        },

        // Credits Actions
        fetchMonthlyCredits: async () => {
          try {
            const credits = await progressApi.getMonthlyCredits()
            set({ monthlyCredits: credits })
            return credits
          } catch (error) {
            console.error('Failed to fetch monthly credits:', error)
            return null
          }
        },

        fetchCreditHistory: async (months = 12) => {
          try {
            const history = await progressApi.getCreditHistory(months)
            return history
          } catch (error) {
            console.error('Failed to fetch credit history:', error)
            return null
          }
        },

        // Stats & Dashboard
        fetchLearningStats: async (childId = null) => {
          set({ loading: true, error: null })
          
          try {
            const stats = await progressApi.getLearningStats(childId)
            set({ learningStats: stats, loading: false })
            return stats
          } catch (error) {
            set({ error: error.message, loading: false })
            throw error
          }
        },

        fetchDashboard: async (language = 'en') => {
          set({ loading: true, error: null })
          
          try {
            const dashboard = await progressApi.getDashboard(language)
            set({ dashboard, loading: false })
            return dashboard
          } catch (error) {
            set({ error: error.message, loading: false })
            throw error
          }
        },

        // Utility Functions
        getCourseProgress: (courseId) => {
          return get().courseProgress[courseId] || null
        },

        getLessonProgress: (lessonId) => {
          return get().lessonProgress[lessonId] || null
        },

        getOverallProgress: () => {
          const { courseProgress } = get()
          const progressArray = Object.values(courseProgress)
          
          if (progressArray.length === 0) return null
          
          const totals = progressArray.reduce(
            (acc, progress) => ({
              totalCourses: acc.totalCourses + 1,
              completedCourses: acc.completedCourses + (progress.status === 'completed' ? 1 : 0),
              totalLessons: acc.totalLessons + (progress.total_lessons || 0),
              completedLessons: acc.completedLessons + (progress.lessons_completed || 0),
              creditsEarned: acc.creditsEarned + (progress.credits_earned || 0),
              timeSpent: acc.timeSpent + (progress.total_time_spent_minutes || 0)
            }),
            {
              totalCourses: 0,
              completedCourses: 0,
              totalLessons: 0,
              completedLessons: 0,
              creditsEarned: 0,
              timeSpent: 0
            }
          )
          
          return {
            ...totals,
            completionRate: totals.totalCourses > 0 ? (totals.completedCourses / totals.totalCourses) * 100 : 0,
            lessonCompletionRate: totals.totalLessons > 0 ? (totals.completedLessons / totals.totalLessons) * 100 : 0
          }
        },

        getInProgressCourses: () => {
          const { courseProgress } = get()
          return Object.values(courseProgress).filter(p => p.status === 'in_progress')
        },

        getCompletedCourses: () => {
          const { courseProgress } = get()
          return Object.values(courseProgress).filter(p => p.status === 'completed')
        },

        // Reset
        reset: () => {
          set({
            courseProgress: {},
            lessonProgress: {},
            monthlyCredits: null,
            learningStats: null,
            dashboard: null,
            loading: false,
            error: null
          })
        }
      }),
      {
        name: 'progress-store',
        partialize: (state) => ({
          courseProgress: state.courseProgress,
          lessonProgress: state.lessonProgress
        })
      }
    ),
    {
      name: 'progress-store'
    }
  )
)

export { useProgressStore }