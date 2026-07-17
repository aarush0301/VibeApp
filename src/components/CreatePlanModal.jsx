import { useState } from 'react'
import { T } from '../theme.js'

const PLAN_TYPES = ["Party", "Trip", "Outing", "Food Run", "Sports", "Study Sesh", "Other"]
const LOCATIONS  = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "JP Nagar", "Coorg", "Nandi Hills", "Goa", "Mysore", "Other"]
const VIBES      = ["🎉 Party animal", "🏕️ Adventurous", "🤙 Chill", "🏃 Active", "🍕 Foodie", "🎮 Gamer", "💬 Outgoing", "🎨 Creative", "🌿 Nature lover"]

function CreatePlanModal({ onClose, onCreatePlan }) {
  const [form, setForm] = useState({
    title: "", type: "Party", location: "", date: "", time: "",
    description: "", maxMembers: "8", isPublic: true, tags: [], itineraryPermission: "creator",
  })
  const [error, setError] = useState("")

  const update    = (field, value) => setForm({ ...form, [field]: value })
  const toggleTag = tag => {
    if (form.tags.includes(tag)) update("tags", form.tags.filter(t => t !== tag))
    else if (form.tags.length < 4) update("tags", [...form.tags, tag])
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return setError("Give your plan a title!")
    if (!form.location)     return setError("Pick a location!")
    if (!form.date)         return setError("Pick a date!")
    onCreatePlan({ ...form, maxMembers: parseInt(form.maxMembers) || 8 })
  }

  return (
    <div style={styles.backdrop} className="backdrop-fade">
  <div style={styles.sheet} className="slide-up">
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Create a Plan ✨</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Plan name *</label>
          <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. Rooftop Party 🎉" style={styles.input} />

          <label style={styles.label} className='chip-tap'>Type</label>
          <div style={styles.chipRow}>
            {PLAN_TYPES.map(type => (
              <button key={type} onClick={() => update("type", type)} className="chip-tap" style={{ ...styles.chip, background: form.type === type ? T.orange : T.muted, color: "#fff", fontWeight: form.type === type ? "700" : "400" }}>
                {type}
              </button>
            ))}
          </div>

          <label style={styles.label}>Location *</label>
          <div style={styles.chipRow}>
            {LOCATIONS.map(loc => (
              <button key={loc} onClick={() => update("location", loc)} className="chip-tap" style={{ ...styles.chip, background: form.location === loc ? T.purple : T.muted, color: "#fff", fontWeight: form.location === loc ? "700" : "400" }}>
                {loc}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Date *</label>
              <input type="date" value={form.date} onChange={e => update("date", e.target.value)} style={styles.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Time</label>
              <input type="time" value={form.time} onChange={e => update("time", e.target.value)} style={styles.input} />
            </div>
          </div>

          <label style={styles.label}>Description</label>
          <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Tell people what this plan is about..." rows={3} style={{ ...styles.input, resize: "none" }} />

          <label style={styles.label}>Max members</label>
          <input type="number" min="2" max="50" value={form.maxMembers} onChange={e => update("maxMembers", e.target.value)} style={{ ...styles.input, width: "30%" }} />

          <label style={styles.label}>Visibility</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => update("isPublic", true)}  style={{ ...styles.chip, background: form.isPublic  ? T.green  : T.muted, color: "#fff", fontWeight: form.isPublic  ? "700" : "400" }}>🌍 Public</button>
            <button onClick={() => update("isPublic", false)} style={{ ...styles.chip, background: !form.isPublic ? T.orange : T.muted, color: "#fff", fontWeight: !form.isPublic ? "700" : "400" }}>🔒 Private</button>
          </div>

          <label style={styles.label}>Looking for (up to 4)</label>
          <div style={styles.chipRow} >
            {VIBES.map(vibe => (
              <button key={vibe} onClick={() => toggleTag(vibe)} className="chip-tap" style={{
                ...styles.chip,
                background: form.tags.includes(vibe) ? "#1A1840" : T.muted,
                color:      form.tags.includes(vibe) ? "#A09EFF" : T.textSec,
                border:     form.tags.includes(vibe) ? `1.5px solid ${T.purple}` : "1.5px solid transparent",
                fontWeight: form.tags.includes(vibe) ? "600" : "400",
              }}>
                {vibe}
              </button>
            ))}
          </div>

          <label style={styles.label}>Who can edit the itinerary?</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[["creator","Only me"],["select","Select members"],["all","Everyone"]].map(([val,lbl]) => (
              <button key={val} onClick={() => update("itineraryPermission", val)} style={{ ...styles.chip, background: form.itineraryPermission === val ? T.purple : T.muted, color: "#fff", fontWeight: form.itineraryPermission === val ? "700" : "400" }}>
                {lbl}
              </button>
            ))}
          </div>

         <button onClick={handleSubmit} style={styles.submitBtn} className="tap">Create Plan 🚀</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-end" },
  sheet:       { background: T.card, borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", border: `1px solid ${T.border}` },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: "700", color: T.text },
  closeBtn:    { background: T.muted, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, color: T.textSec, display: "flex", alignItems: "center", justifyContent: "center" },
  form:        { overflowY: "auto", padding: "20px 20px 40px" },
  label:       { display: "block", fontSize: 12, fontWeight: "600", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 },
  input:       { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 16, color: T.text },
  chipRow:     { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip:        { padding: "7px 14px", borderRadius: 20, border: "1.5px solid transparent", fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  error:       { background: "#2D1810", color: "#FF8060", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16, border: `1px solid #4A2A1A` },
  submitBtn:   { width: "100%", padding: 14, borderRadius: 12, border: "none", background: T.orange, color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
}

export default CreatePlanModal