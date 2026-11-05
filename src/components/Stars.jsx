import { T } from '../theme.js'
import { Star } from 'lucide-react'

function Stars({ score = 0, size = 16 }) {
  const rounded = Math.round(Number(score) || 0)
  return <span aria-label={`${score} out of 5 stars`} style={{ color: T.yellow, display: 'inline-flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(star => <Star key={star} size={size} fill={star <= rounded ? 'currentColor' : 'none'} strokeWidth={1.5} aria-hidden="true" />)}</span>
}

export default Stars
