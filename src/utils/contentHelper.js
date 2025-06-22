export const getDifficultyColor = (level) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }
  return colors[level] || colors.beginner
}

export const getLessonTypeIcon = (type) => {
  const icons = {
    story: '📖',
    quiz: '❓',
    worksheet: '📝',
    activity: '🎯',
    video: '🎥',
    interactive: '🎮'
  }
  return icons[type] || '📚'
}

export const getLessonTypeColor = (type) => {
  const colors = {
    story: 'bg-purple-100 text-purple-700',
    quiz: 'bg-blue-100 text-blue-700',
    worksheet: 'bg-green-100 text-green-700',
    activity: 'bg-orange-100 text-orange-700',
    video: 'bg-red-100 text-red-700',
    interactive: 'bg-indigo-100 text-indigo-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

export const getStatusBadge = (status) => {
  const badges = {
    not_started: { text: 'Not Started', class: 'bg-gray-100 text-gray-700' },
    in_progress: { text: 'In Progress', class: 'bg-blue-100 text-blue-700' },
    completed: { text: 'Completed', class: 'bg-green-100 text-green-700' }
  }
  return badges[status] || badges.not_started
}

export const filterCourses = (courses, filters) => {
  return courses.filter(course => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = course.title.toLowerCase().includes(searchLower)
      const matchesDescription = course.description?.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesDescription) return false
    }
    
    // Age group filter
    if (filters.age_group) {
      const age = parseInt(filters.age_group)
      if (age < course.age_group_min || age > course.age_group_max) return false
    }
    
    // Difficulty filter
    if (filters.difficulty_level && course.difficulty_level !== filters.difficulty_level) {
      return false
    }
    
    // Featured filter
    if (filters.is_featured === true && !course.is_featured) {
      return false
    }
    
    return true
  })
}

export const validateLessonCompletion = (lesson, responses) => {
  const errors = []
  
  // Check if lesson has required questions
  if (lesson.content?.questions) {
    const questions = lesson.content.questions
    const requiredQuestions = questions.filter(q => q.required !== false)
    
    requiredQuestions.forEach(question => {
      const questionId = question.id || questions.indexOf(question)
      if (!responses[questionId] || responses[questionId].trim() === '') {
        errors.push(`Question ${questions.indexOf(question) + 1} is required`)
      }
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}