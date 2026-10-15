import { useState } from 'react'
import { T } from '../theme.js'

function RateModal({ hostName, onClose, onSubmit }) {
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!score || saving) return
    setSaving(true)
    const success = await onSubmit(score, comment.trim())
    setSaving(false)
    if (success) onClose()
  }

  return <div style={styles.overlay} role="presentation" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="rate-title" style={styles.modal} onClick={event => event.stopPropagation()}>
      <h2 id="rate-title" style={{ color: T.text, margin: '0 0 8px' }}>Rate {hostName}</h2>
      <p style={{ color: T.textMut, fontSize: 13, margin: '0 0 14px' }}>How was your experience with the host?</p>
      <div role="group" aria-label="Choose a rating" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map(value => <button key={value} type="button" aria-label={`${value} star${value === 1 ? '' : 's'}`} aria-pressed={score === value} onClick={() => setScore(value)} style={{ ...styles.star, color: value <= score ? T.yellow : T.textMut }}>★</button>)}
      </div>
      <textarea value={comment} onChange={event => setComment(event.target.value)} maxLength={500} placeholder="Leave a comment (optional)" style={styles.textarea} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" onClick={onClose} style={styles.cancel}>Cancel</button>
        <button type="button" disabled={!score || saving} onClick={submit} style={{ ...styles.submit, opacity: !score || saving ? 0.55 : 1 }}>{saving ? 'Submitting…' : 'Submit rating'}</button>
      </div>
    </section>
  </div>
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { width: '100%', maxWidth: 400, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 },
  star: { background: 'transparent', border: 0, fontSize: 30, cursor: 'pointer', padding: 0 },
  textarea: { boxSizing: 'border-box', width: '100%', minHeight: 90, resize: 'vertical', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.muted, color: T.text, font: 'inherit' },
  cancel: { flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, cursor: 'pointer' },
  submit: { flex: 1, padding: 12, borderRadius: 10, border: 0, background: T.orange, color: '#fff', fontWeight: 700, cursor: 'pointer' },
}

export default RateModal
