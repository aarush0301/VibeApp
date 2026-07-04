import { useState } from 'react'

const PLAN_TYPES = ["Party", "Trip", "Outing", "Food Run", "Sports", "Study Sesh", "Other"]
const LOCATIONS  = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "JP Nagar", "Coorg", "Nandi Hills", "Goa", "Mysore", "Other"]
const VIBES      = ["🎉 Party animal", "🏕️ Adventurous", "🤙 Chill", "🏃 Active", "🍕 Foodie", "🎮 Gamer", "💬 Outgoing", "🎨 Creative", "🌿 Nature lover"]

function CreatePlanModal({ onClose, onCreatePlan }) {

  const [form, setForm] = useState({
    title:                "",
    type:                 "Party",
    location:             "",
    date:                 "",
    time:                 "",
    description:          "",
    maxMembers:           "8",
    isPublic:             true,
    tags:                 [],
    itineraryPermission:  "creator",
  })

  const [error, setError] = useState("")

  // Update a single field
  const update = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  // Toggle a vibe tag
  const toggleTag = (tag) => {
    if (form.tags.includes(tag)) {
      update("tags", form.tags.filter(t => t !== tag))
    } else if (form.tags.length < 4) {
      update("tags", [...form.tags, tag])
    }
  }

  // Submit
  const handleSubmit = () => {
    if (!form.title.trim())    return setError("Give your plan a title!")
    if (!form.location)        return setError("Pick a location!")
    if (!form.date)            return setError("Pick a date!")

    onCreatePlan({
      ...form,
      maxMembers: parseInt(form.maxMembers) || 8,
    })
  }

  return (
    // Backdrop
    <div style={styles.backdrop}>

      {/* Sheet */}
      <div style={styles.sheet}>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Create a Plan ✨</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Scrollable form */}
        <div style={styles.form}>

          {/* Error */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Title */}
          <label style={styles.label}>Plan name *</label>
          <input
            value={form.title}
            onChange={e => update("title", e.target.value)}
            placeholder="e.g. Rooftop Party 🎉"
            style={styles.input}
          />

          {/* Type */}
          <label style={styles.label}>Type</label>
          <div style={styles.chipRow}>
            {PLAN_TYPES.map(type => (
              <button
                key={type}
                onClick={() => update("type", type)}
                style={{
                  ...styles.chip,
                  background:  form.type === type ? "#D85A30" : "#F0EEE9",
                  color:       form.type === type ? "#fff"     : "#6B6864",
                  fontWeight:  form.type === type ? "600"      : "400",
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Location */}
          <label style={styles.label}>Location *</label>
          <div style={styles.chipRow}>
            {LOCATIONS.map(loc => (
              <button
                key={loc}
                onClick={() => update("location", loc)}
                style={{
                  ...styles.chip,
                  background: form.location === loc ? "#7F77DD" : "#F0EEE9",
                  color:      form.location === loc ? "#fff"     : "#6B6864",
                  fontWeight: form.location === loc ? "600"      : "400",
                }}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Date and Time */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => update("date", e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => update("time", e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Description */}
          <label style={styles.label}>Description</label>
          <textarea
            value={form.description}
            onChange={e => update("description", e.target.value)}
            placeholder="Tell people what this plan is about..."
            rows={3}
            style={{ ...styles.input, resize: "none" }}
          />

          {/* Max members */}
          <label style={styles.label}>Max members</label>
          <input
            type="number"
            min="2"
            max="50"
            value={form.maxMembers}
            onChange={e => update("maxMembers", e.target.value)}
            style={{ ...styles.input, width: "30%" }}
          />

          {/* Visibility */}
          <label style={styles.label}>Visibility</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => update("isPublic", true)}
              style={{
                ...styles.chip,
                background: form.isPublic ? "#1D9E75" : "#F0EEE9",
                color:      form.isPublic ? "#fff"     : "#6B6864",
                fontWeight: form.isPublic ? "600"      : "400",
              }}
            >
              🌍 Public
            </button>
            <button
              onClick={() => update("isPublic", false)}
              style={{
                ...styles.chip,
                background: !form.isPublic ? "#D85A30" : "#F0EEE9",
                color:      !form.isPublic ? "#fff"     : "#6B6864",
                fontWeight: !form.isPublic ? "600"      : "400",
              }}
            >
              🔒 Private
            </button>
          </div>

          {/* Vibe tags */}
          <label style={styles.label}>Looking for (pick up to 4)</label>
          <div style={styles.chipRow}>
            {VIBES.map(vibe => (
              <button
                key={vibe}
                onClick={() => toggleTag(vibe)}
                style={{
                  ...styles.chip,
                  background: form.tags.includes(vibe) ? "#EEEDFE" : "#F0EEE9",
                  color:      form.tags.includes(vibe) ? "#3C3489"  : "#6B6864",
                  fontWeight: form.tags.includes(vibe) ? "600"      : "400",
                  border:     form.tags.includes(vibe) ? "1.5px solid #7F77DD" : "1.5px solid transparent",
                }}
              >
                {vibe}
              </button>
            ))}
          </div>

          {/* Itinerary permission */}
          <label style={styles.label}>Who can edit the itinerary?</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[
              { value: "creator", label: "Only me" },
              { value: "select",  label: "Select members" },
              { value: "all",     label: "Everyone" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => update("itineraryPermission", opt.value)}
                style={{
                  ...styles.chip,
                  background: form.itineraryPermission === opt.value ? "#7F77DD" : "#F0EEE9",
                  color:      form.itineraryPermission === opt.value ? "#fff"     : "#6B6864",
                  fontWeight: form.itineraryPermission === opt.value ? "600"      : "400",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} style={styles.submitBtn}>
            Create Plan 🚀
          </button>

        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop:   { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" },
  sheet:      { background: "#ffffff", borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: "1px solid #F0EEE9", flexShrink: 0 },
  headerTitle:{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1A1917" },
  closeBtn:   { background: "#F0EEE9", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: "14px", color: "#6B6864", display: "flex", alignItems: "center", justifyContent: "center" },
  form:       { overflowY: "auto", padding: "20px 20px 40px" },
  label:      { display: "block", fontSize: "12px", fontWeight: "600", color: "#6B6864", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 },
  input:      { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E8E6E1", background: "#F7F6F3", fontSize: "14px", fontFamily: "inherit", outline: "none", marginBottom: 16, color: "#1A1917" },
  chipRow:    { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip:       { padding: "7px 14px", borderRadius: 20, border: "1.5px solid transparent", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" },
  error:      { background: "#FAECE7", color: "#993C1D", padding: "10px 14px", borderRadius: 10, fontSize: "13px", marginBottom: 16 },
  submitBtn:  { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#D85A30", color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
}

export default CreatePlanModal