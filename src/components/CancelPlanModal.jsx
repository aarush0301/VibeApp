import ModalFrame from './ModalFrame.jsx'
import { useState } from 'react'
import { T } from '../theme.js'

function CancelPlanModal({ plan, notifyCount, onConfirm, onClose }) {
  const [note, setNote]             = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (submitting) return
    setSubmitting(true)
    const ok = await onConfirm(note.trim())
    if (!ok) setSubmitting(false)
  }

  return (
    <ModalFrame title="Cancel this plan?" onClose={onClose} compact>
        <h3 style={styles.title}>Cancel this plan?</h3>
        <p style={styles.text}>
          "{plan.title}" will be permanently deleted, including its chat, itinerary and ratings. This cannot be undone.
        </p>

        <label htmlFor="cancel-note" style={styles.label}>
          Note for members {notifyCount > 0 ? `(${notifyCount} will be notified)` : "(nobody to notify)"}
        </label>
        <textarea id="cancel-note"
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Let them know why, for example: rain forecast, moving this to next weekend..."
          style={styles.textarea}
        />
        <div style={styles.count}>{note.length}/500</div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="tap" style={styles.keepBtn}>Keep plan</button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="tap"
            style={{ ...styles.deleteBtn, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Cancelling..." : "Cancel plan"}
          </button>
        </div>
    </ModalFrame>
  )
}

const styles = {
  title:     { fontSize: 18, fontWeight: "800", color: T.text, marginBottom: 8 },
  text:      { fontSize: 13, color: T.textSec, lineHeight: 1.55, marginBottom: 16 },
  label:     { display: "block", fontSize: 12, fontWeight: "600", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 },
  textarea:  { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12, border: "1.5px solid transparent", background: T.muted, fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", color: T.text },
  count:     { fontSize: 11, color: T.textMut, textAlign: "right", margin: "4px 0 14px" },
  keepBtn:   { flex: 1, padding: 12, borderRadius: 14, border: "none", background: T.raised, color: T.textSec, fontSize: 14, fontWeight: "600", fontFamily: "inherit", cursor: "pointer" },
  deleteBtn: { flex: 1, padding: 12, borderRadius: 14, border: "none", background: T.danger, color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
}

export default CancelPlanModal