import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { T } from '../theme.js'
import LocationSearchInput from './LocationSearchInput.jsx'

const PLAN_TYPES = ["Party", "Trip", "Outing", "Food Run", "Sports", "Study Sesh", "Other"]
const VIBES      = ["🎉 Party animal", "🏕️ Adventurous", "🤙 Chill", "🏃 Active", "🍕 Foodie", "🎮 Gamer", "💬 Outgoing", "🎨 Creative", "🌿 Nature lover"]

function CreatePlanModal({ onClose, onCreatePlan }) {
  const [form, setForm] = useState({
    title: "", type: "Party", location: "", date: "", time: "",
    description: "", maxMembers: "8", isPublic: true, tags: [], itineraryPermission: "creator", customType: "", longitude: null, latitude: null,
  })
  const [error, setError] = useState("")
  const sheetRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    sheetRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  const handleDialogKey = event => {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
    }
    if (event.key !== "Tab") return
    const controls = [...sheetRef.current.querySelectorAll('button, input, textarea, select, [tabindex="0"]')].filter(element => !element.disabled)
    const first = controls[0]
    const last = controls.at(-1)
    if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const update    = (field, value) => setForm({ ...form, [field]: value })
  const toggleTag = tag => {
    if (form.tags.includes(tag)) update("tags", form.tags.filter(t => t !== tag))
    else if (form.tags.length < 4) update("tags", [...form.tags, tag])
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return setError("Enter a plan name.")
    if (!form.location) return setError("Choose a location.")
    if (!form.date) return setError("Choose a date.")
    if (form.type === "Other" && !form.customType.trim()) return setError("Enter a plan type.")

    const finalType = form.type === "Other" ? form.customType.trim() : form.type
    onCreatePlan({
      ...form,
      type: finalType,
      maxMembers: parseInt(form.maxMembers) || 8,
    })
  }

  return (
    <div className="modal-backdrop backdrop-fade">
      <div ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="create-plan-heading" tabIndex={-1} onKeyDown={handleDialogKey} className="modal-sheet slide-up">
        <div style={styles.header}>
          <h2 id="create-plan-heading" style={styles.headerTitle}>Create a Plan</h2>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close create plan"><X size={20} /></button>
        </div>

        <div style={styles.form}>
          <p className="muted-copy" style={{ marginBottom: 24 }}>Put an idea out there. Your crew will follow.</p>
          {error && <div role="alert" style={styles.error}>{error}</div>}

          <label htmlFor="plan-name" style={styles.label}>Plan name *</label>
          <input id="plan-name" value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. Rooftop party" style={styles.input} />

          <p style={styles.label}>Type</p>
          <div style={styles.chipRow} role="group" aria-label="Plan type">
            {PLAN_TYPES.map(type => (
              <button
                key={type}
                onClick={() => update("type", type)}
                aria-pressed={form.type === type}
                className="choice chip-tap"
                style={styles.chip}
              >
                {type}
              </button>
            ))}
          </div>

          {form.type === "Other" && (
            <input
              value={form.customType}
              aria-label="Custom plan type"
              onChange={e => update("customType", e.target.value)}
              placeholder="What kind of plan is this?"
              style={{ ...styles.input, marginTop: -8 }}
            />
          )}

          <label htmlFor="plan-location" style={styles.label}>Location *</label>
          <div style={{ marginBottom: 16 }}>
            <LocationSearchInput
              id="plan-location"
              value={form.location}
              onChange={(location, latitude, longitude) => {
                setForm(current => ({ ...current, location, latitude, longitude }))
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="plan-date" style={styles.label}>Date *</label>
              <input id="plan-date" type="date" value={form.date} onChange={e => update("date", e.target.value)} style={styles.input} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="plan-time" style={styles.label}>Time</label>
              <input id="plan-time" type="time" value={form.time} onChange={e => update("time", e.target.value)} style={styles.input} />
            </div>
          </div>

          <label htmlFor="plan-description" style={styles.label}>Description</label>
          <textarea id="plan-description" value={form.description} onChange={e => update("description", e.target.value)} placeholder="What should people know?" rows={3} style={{ ...styles.input, resize: "vertical" }} />

          <label htmlFor="plan-capacity" style={styles.label}>Max members</label>
          <input id="plan-capacity" type="number" min="2" max="50" value={form.maxMembers} onChange={e => update("maxMembers", e.target.value)} style={{ ...styles.input, width: 100 }} />

          <p style={styles.label}>Visibility</p>
          <div style={styles.chipRow} role="group" aria-label="Visibility">
            <button onClick={() => update("isPublic", true)} aria-pressed={form.isPublic} className="choice chip-tap" style={styles.chip}>Public</button>
            <button onClick={() => update("isPublic", false)} aria-pressed={!form.isPublic} className="choice chip-tap" style={styles.chip}>Private</button>
          </div>

          <p style={styles.label}>Looking for (up to 4)</p>
          <div style={styles.chipRow} role="group" aria-label="Looking for, choose up to 4">
            {VIBES.map(vibe => (
              <button key={vibe} onClick={() => toggleTag(vibe)} aria-pressed={form.tags.includes(vibe)} className="choice chip-tap" style={styles.chip}>
                {vibe}
              </button>
            ))}
          </div>

          <p style={styles.label}>Who can edit the itinerary?</p>
          <div style={styles.chipRow} role="group" aria-label="Who can edit the itinerary?">
            {[["creator","Only me"],["select","Select members"],["all","Everyone"]].map(([val,lbl]) => (
              <button key={val} onClick={() => update("itineraryPermission", val)} aria-pressed={form.itineraryPermission === val} className="choice chip-tap" style={styles.chip}>
                {lbl}
              </button>
            ))}
          </div>

          <button onClick={handleSubmit} style={styles.submitBtn} className="tap">Create Plan</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: "700", color: T.text },
  closeBtn:    { background: "transparent", border: "none", borderRadius: 8, width: 44, height: 44, cursor: "pointer", color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" },
  form:        { overflowY: "auto", padding: "20px 20px 40px" },
  label:       { display: "block", fontSize: 14, fontWeight: "500", color: T.textSec, marginBottom: 8 },
  input:       { width: "100%", minWidth: 0, padding: "11px 12px", borderRadius: 8, border: `1px solid ${T.chip}`, background: T.bg, fontSize: 16, marginBottom: 20, color: T.text },
  chipRow:     { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip:        { padding: "8px 12px", minHeight: 44, borderRadius: 8, fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  error:       { background: T.dangerBg, color: T.danger, padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 },
  submitBtn:   { width: "100%", padding: 14, borderRadius: 8, border: "none", background: T.orange, color: T.bg, fontSize: 15, fontWeight: "700", cursor: "pointer" },
}

export default CreatePlanModal
