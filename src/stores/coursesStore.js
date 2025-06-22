import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { fixedContentApi } from '../services/fixedContentApi'

const useCoursesStore = create()(
  devtools(
    (set, get) => ({
      // State
      allCourses: [],
      filteredCourses: [],
      courseDetails: {},
      filters: {
        subject_id: '',
        age_group: '',
        difficulty_level: '',
        search: '',
        is_featured: null,
        language: 'en'
      },
      sorting: {
        sort_by: 'sort_order',
        sort_order: 'asc'
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },
      loading: false,
      error: null,

      // Actions
      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, page: 1 } // Reset to first page
        }))
        get().fetchCourses()
      },

      setSorting: (newSorting) => {
        set(state => ({
          sorting: { ...state.sorting, ...newSorting },
          pagination: { ...state.pagination, page: 1 }
        }))
        get().fetchCourses()
      },

      setPage: (page) => {
        set(state => ({
          pagination: { ...state.pagination, page }
        }))
        get().fetchCourses()
      },

      fetchCourses: async () => {
        const { filters, sorting, pagination } = get()
        
        set({ loading: true, error: null })
        
        try {
          const params = {
            ...filters,
            ...sorting,
            page: pagination.page,
            limit: pagination.limit
          }
          
          // Remove empty values
          Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
              delete params[key]
            }
          })

          const response = await fixedContentApi.getCourses(params)
          
          set({
            allCourses: response.items || response, // Handle both paginated and simple responses
            filteredCourses: response.items || response,
            pagination: response.total ? {
              page: response.page,
              limit: response.limit,
              total: response.total,
              pages: response.pages
            } : get().pagination,
            loading: false
          })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      fetchCourseDetails: async (courseId, childId = null) => {
        set({ loading: true, error: null })
        
        try {
          const course = await fixedContentApi.getCourse(courseId, childId)
          
          set(state => ({
            courseDetails: {
              ...state.courseDetails,
              [courseId]: course
            },
            loading: false
          }))
          
          return course
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      getCourseById: (courseId) => {
        const { allCourses, courseDetails } = get()
        return courseDetails[courseId] || allCourses.find(c => c.id === courseId)
      },

      searchCourses: async (query, filters = {}) => {
        set({ loading: true, error: null })
        
        try {
          const results = await fixedContentApi.searchContent(query, {
            type: 'courses',
            ...filters
          })
          
          set({
            filteredCourses: results.results.courses || [],
            loading: false
          })
          
          return results
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      getRecommendations: async (childId = null, limit = 5) => {
        try {
          const recommendations = await fixedContentApi.getRecommendations(childId, limit)
          return recommendations
        } catch (error) {
          console.error('Failed to get recommendations:', error)
          return []
        }
      },

      clearFilters: () => {
        set({
          filters: {
            subject_id: '',
            age_group: '',
            difficulty_level: '',
            search: '',
            is_featured: null,
            language: get().filters.language // Keep language
          },
          pagination: { ...get().pagination, page: 1 }
        })
        get().fetchCourses()
      },

      reset: () => {
        set({
          allCourses: [],
          filteredCourses: [],
          courseDetails: {},
          filters: {
            subject_id: '',
            age_group: '',
            difficulty_level: '',
            search: '',
            is_featured: null,
            language: 'en'
          },
          sorting: {
            sort_by: 'sort_order',
            sort_order: 'asc'
          },
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          },
          loading: false,
          error: null
        })
      }
    }),
    {
      name: 'courses-store'
    }
  )
)

export { useCoursesStore }