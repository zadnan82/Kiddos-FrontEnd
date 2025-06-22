import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { fixedContentApi } from '../services/fixedContentApi' 

// Create the store
const useFixedContentStore = create()(
  devtools(
    (set, get) => ({
      // State
      subjects: [],
      courses: [],
      currentCourse: null,
      currentLesson: null,
      userProgress: {}, // Object keyed by course_id for easier lookup
      loading: false,
      error: null,

      // Subject Actions
      fetchSubjects: async (language = 'en') => {
        set({ loading: true, error: null })
        try {
          console.log('Fetching subjects...')
          const subjects = await fixedContentApi.getSubjects(language)
          console.log('Subjects received:', subjects)
          set({ subjects: subjects || [], loading: false })
          return subjects
        } catch (error) {
          console.error('Failed to fetch subjects:', error)
          set({ error: error.message, loading: false, subjects: [] })
          throw error
        }
      },

      // Course Actions
      fetchCourses: async (filters = {}) => {
        set({ loading: true, error: null })
        try {
          console.log('Fetching courses with filters:', filters)
          const response = await fixedContentApi.getCourses(filters)
          console.log('Courses response:', response)
          
          // Handle both paginated and non-paginated responses
          const courses = response.items || response || []
          set({ courses, loading: false })
          return courses
        } catch (error) {
          console.error('Failed to fetch courses:', error)
          set({ error: error.message, loading: false, courses: [] })
          throw error
        }
      },

      fetchCourse: async (courseId, childId = null, language = 'en') => {
        set({ loading: true, error: null })
        try {
          console.log('Fetching course:', courseId)
          const course = await fixedContentApi.getCourse(courseId, childId, language)
          console.log('Course received:', course)
          set({ currentCourse: course, loading: false })
          return course
        } catch (error) {
          console.error('Failed to fetch course:', error)
          set({ error: error.message, loading: false, currentCourse: null })
          throw error
        }
      },

      // Lesson Actions
      fetchLesson: async (lessonId, childId = null, language = 'en') => {
        set({ loading: true, error: null })
        try {
          console.log('Fetching lesson:', lessonId)
          const lesson = await fixedContentApi.getLesson(lessonId, childId, language)
          console.log('Lesson received:', lesson)
          set({ currentLesson: lesson, loading: false })
          return lesson
        } catch (error) {
          console.error('Failed to fetch lesson:', error)
          set({ error: error.message, loading: false, currentLesson: null })
          throw error
        }
      },

      // Progress Actions
      fetchUserProgress: async (childId = null) => {
        try {
          console.log('Fetching user progress...')
          const progress = await fixedContentApi.getUserProgress(childId)
          console.log('Progress received:', progress)
          
          // Ensure progress is an object
          const progressObj = progress || {}
          set({ userProgress: progressObj })
          return progressObj
        } catch (error) {
          console.error('Failed to fetch progress:', error)
          set({ error: error.message, userProgress: {} })
          throw error
        }
      },

      enrollInCourse: async (courseId, childId = null) => {
        try {
          console.log('Enrolling in course:', courseId)
          const progress = await fixedContentApi.enrollInCourse(courseId, childId)
          console.log('Enrollment successful:', progress)
          
          // Update progress in state
          set(state => ({
            userProgress: {
              ...state.userProgress,
              [courseId]: progress
            }
          }))
          
          return progress
        } catch (error) {
          console.error('Failed to enroll in course:', error)
          set({ error: error.message })
          throw error
        }
      },

      startLesson: async (lessonId, childId = null) => {
        try {
          console.log('Starting lesson:', lessonId)
          const progress = await fixedContentApi.startLesson(lessonId, childId)
          console.log('Lesson started:', progress)
          return progress
        } catch (error) {
          console.error('Failed to start lesson:', error)
          set({ error: error.message })
          throw error
        }
      },

      completeLesson: async (lessonId, completionData) => {
        try {
          console.log('Completing lesson:', lessonId, completionData)
          const result = await fixedContentApi.completeLesson(lessonId, completionData)
          console.log('Lesson completed:', result)
          
          // Update progress in state if we have course progress data
          if (result.course_progress) {
            const courseId = result.course_progress.course_id
            set(state => ({
              userProgress: {
                ...state.userProgress,
                [courseId]: result.course_progress
              }
            }))
          }
          
          return result
        } catch (error) {
          console.error('Failed to complete lesson:', error)
          set({ error: error.message })
          throw error
        }
      },

      // Utility Methods
      getCourseProgress: (courseId) => {
        const progress = get().userProgress[courseId]
        console.log('Getting course progress for', courseId, ':', progress)
        return progress || null
      },

      isEnrolledInCourse: (courseId) => {
        const progress = get().userProgress[courseId]
        return !!progress
      },

      getCourseById: (courseId) => {
        const { courses, currentCourse } = get()
        
        // Check if it's the current course
        if (currentCourse && currentCourse.id === courseId) {
          return currentCourse
        }
        
        // Look in courses array
        return courses.find(course => course.id === courseId) || null
      },

      getLessonById: (lessonId) => {
        const { currentLesson, currentCourse } = get()
        
        // Check if it's the current lesson
        if (currentLesson && currentLesson.id === lessonId) {
          return currentLesson
        }
        
        // Look in current course lessons
        if (currentCourse && currentCourse.lessons) {
          return currentCourse.lessons.find(lesson => lesson.id === lessonId) || null
        }
        
        return null
      },

      // Search and Recommendations
      searchContent: async (query, filters = {}) => {
        set({ loading: true, error: null })
        try {
          console.log('Searching content:', query, filters)
          const results = await fixedContentApi.searchContent(query, filters)
          console.log('Search results:', results)
          set({ loading: false })
          return results
        } catch (error) {
          console.error('Search failed:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      getRecommendations: async (childId = null, limit = 5, language = 'en') => {
        try {
          console.log('Getting recommendations...')
          const recommendations = await fixedContentApi.getRecommendations(childId, limit, language)
          console.log('Recommendations received:', recommendations)
          return recommendations
        } catch (error) {
          console.error('Failed to get recommendations:', error)
          return []
        }
      },

      // Dashboard and Analytics
      getDashboard: async (language = 'en') => {
        set({ loading: true, error: null })
        try {
          console.log('Fetching dashboard...')
          const dashboard = await fixedContentApi.getDashboard(language)
          console.log('Dashboard received:', dashboard)
          set({ loading: false })
          return dashboard
        } catch (error) {
          console.error('Failed to fetch dashboard:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      getLearningStats: async (childId = null) => {
        try {
          console.log('Fetching learning stats...')
          const stats = await fixedContentApi.getLearningStats(childId)
          console.log('Learning stats received:', stats)
          return stats
        } catch (error) {
          console.error('Failed to fetch learning stats:', error)
          throw error
        }
      },

      // State Management
      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      // Reset all state
      reset: () => {
        console.log('Resetting fixed content store')
        set({
          subjects: [],
          courses: [],
          currentCourse: null,
          currentLesson: null,
          userProgress: {},
          loading: false,
          error: null
        })
      },

      // Batch operations
      updateCourseProgress: (courseId, progressData) => {
        set(state => ({
          userProgress: {
            ...state.userProgress,
            [courseId]: {
              ...state.userProgress[courseId],
              ...progressData
            }
          }
        }))
      },

      // Debug helpers
      getState: () => {
        const state = get()
        return {
          subjectsCount: state.subjects.length,
          coursesCount: state.courses.length,
          progressCount: Object.keys(state.userProgress).length,
          currentCourse: state.currentCourse?.id || null,
          currentLesson: state.currentLesson?.id || null,
          loading: state.loading,
          error: state.error
        }
      },

      logState: () => {
        console.log('Fixed Content Store State:', get().getState())
      }
    }),
    {
      name: 'fixed-content-store'
    }
  )
)


const additionalMethods = {
  // Load course from JSON files
  fetchCourseFromFile: async (ageGroup, subject, courseName) => {
    set({ loading: true, error: null })
    try {
      const jsonCourse = await contentLoader.loadCourse(ageGroup, subject, courseName)
      const course = contentLoader.transformCourseData(jsonCourse, `${subject}-${courseName}`)
      set({ currentCourse: course, loading: false })
      return course
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // List available courses from JSON files
  fetchCoursesFromFiles: async (ageGroup, subject) => {
    set({ loading: true, error: null })
    try {
      const courseNames = await contentLoader.listCourses(ageGroup, subject)
      const courses = []
      
      for (const courseName of courseNames) {
        try {
          const jsonCourse = await contentLoader.loadCourse(ageGroup, subject, courseName)
          const course = contentLoader.transformCourseData(jsonCourse, `${subject}-${courseName}`)
          courses.push(course)
        } catch (error) {
          console.warn(`Failed to load course ${courseName}:`, error)
        }
      }
      
      set({ courses, loading: false })
      return courses
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Get subjects from available course files
  fetchSubjectsFromFiles: async () => {
    set({ loading: true, error: null })
    try {
      // Hardcoded subjects based on your folder structure
      const subjects = [
        {
          id: 'science',
          name: 'science',
          category: 'science',
          display_name: 'Science',
          description: 'Learn about the world around us',
          icon_name: '🔬',
          color_code: '#10B981',
          is_active: true,
          course_count: 4
        },
        {
          id: 'math',
          name: 'math', 
          category: 'math',
          display_name: 'Mathematics',
          description: 'Fun with numbers and shapes',
          icon_name: '🔢',
          color_code: '#3B82F6',
          is_active: true,
          course_count: 3
        },
        {
          id: 'language_arts',
          name: 'language_arts',
          category: 'language_arts', 
          display_name: 'Language Arts',
          description: 'Reading, writing, and communication',
          icon_name: '📖',
          color_code: '#8B5CF6',
          is_active: true,
          course_count: 3
        },
        {
          id: 'social_studies',
          name: 'social_studies',
          category: 'social_studies',
          display_name: 'Social Studies', 
          description: 'Learning about people and communities',
          icon_name: '👥',
          color_code: '#F59E0B',
          is_active: true,
          course_count: 3
        }
      ]
      
      set({ subjects, loading: false })
      return subjects
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}
// Export the store
export { useFixedContentStore }

// Also provide a default export for convenience
export default useFixedContentStore