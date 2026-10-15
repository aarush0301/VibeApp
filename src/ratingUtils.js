export function getRatingStats(ratings) {
  if (!ratings || ratings.length === 0) return null
  const total = ratings.reduce((sum, r) => sum + r.score, 0)
  return { avg: Math.round((total / ratings.length) * 10) / 10, count: ratings.length }
}

export function ratingLabel(avg) {
  if (avg >= 4.7) return "Top Host 🏆"
  if (avg >= 4.0) return "Great Host ⭐"
  if (avg >= 3.0) return "Decent Host"
  return "Mixed reviews"
}