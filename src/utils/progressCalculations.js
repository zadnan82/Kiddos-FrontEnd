export const calculateProgress = (completed, total) => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export const getTimeSpentDisplay = (minutes) => {
  if (minutes < 60) return `${minutes} minutes`
  if (minutes < 1440) { // Less than a day
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
  }
  
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  return hours > 0 ? `${days}d ${hours}h` : `${days} days`
}

export const getCompletionRate = (progress) => {
  if (!progress || !Array.isArray(progress)) return 0
  
  const completed = progress.filter(p => p.status === 'completed').length
  return progress.length > 0 ? Math.round((completed / progress.length) * 100) : 0
}

export const getAverageScore = (progress) => {
  if (!progress || !Array.isArray(progress)) return 0
  
  const withScores = progress.filter(p => p.average_score != null)
  if (withScores.length === 0) return 0
  
  const total = withScores.reduce((sum, p) => sum + p.average_score, 0)
  return Math.round(total / withScores.length)
}

export const sortByProgress = (courses, userProgress) => {
  return [...courses].sort((a, b) => {
    const progressA = userProgress[a.id]
    const progressB = userProgress[b.id]
    
    // Prioritize in-progress courses
    if (progressA?.status === 'in_progress' && progressB?.status !== 'in_progress') return -1
    if (progressB?.status === 'in_progress' && progressA?.status !== 'in_progress') return 1
    
    // Then by last accessed date
    if (progressA?.last_accessed_at && progressB?.last_accessed_at) {
      return new Date(progressB.last_accessed_at) - new Date(progressA.last_accessed_at)
    }
    
    // Finally by course order
    return (a.sort_order || 0) - (b.sort_order || 0)
  })
}