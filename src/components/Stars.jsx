import { T } from '../theme.js'

function Stars({ score = 0, size = 16 }) {
  const rounded = Math.round(Number(score) || 0)
  return <span aria-label={`${score} out of 5 stars`} style={{ color: T.yellow, fontSize: size, letterSpacing: 1 }}>{[1, 2, 3, 4, 5].map(star => <span key={star}>{star <= rounded ? '★' : '☆'}</span>)}</span>
}

export default Stars
