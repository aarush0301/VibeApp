import { useState } from 'react'
import { T } from '../theme.js'

const VIBES = ["🎉 Party animal", "🏕️ Adventurous", "🤙 Chill", "🏃 Active", "🍕 Foodie", "🎮 Gamer", "💬 Outgoing", "🎨 Creative", "🌿 Nature lover"]
const YEARS = ["1st", "2nd", "3rd", "4th", "5th", "Alumni"]

function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name:    user.name    || "",
    college: user.college || "",
    year:    user.year    || "",
    age:     user.age     || "",
    bio:     user.bio     || "",
    vibes:   user.vibes   || [],
  })
  const [error, setError] = useState("")

  const update = (field, value) => setForm({ ...form, [field]: value })

  const toggleVibe = (vibe) => {
    if (form.vibes.includes(vibe)) {
      update("vibes", form.vibes.filter(v => v !== vibe))
    } else if (form.vibes.length < 5) {
      update("vibes", [...form.vibes, vibe])
    }
  }

  const handleSubmit = () => {
    if (!form.name.trim())    return setError("Name can't be empty!")
    if (!form.college.trim()) return setError("College can't be empty!")

    onSave({
      ...form,
      age: parseInt(form.age) || null,
    })
  }

  return (
    <div style={styles.backdrop} className="backdrop-fade">
      <div style={styles.sheet} className="slide-up">

        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Edit Profile ✏️</h2>
          <button onClick={onClose} style={styles.closeBtn} className="tap">✕</button>
        </div>

        <div style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Full name *</label>
          <input
            value={form.name}
            onChange={e => update("name", e.target.value)}
            placeholder="Your name"
            style={styles.input}
          />

          <label style={styles.label}>College *</label>
          <input
            value={form.college}
            onChange={e => update("college", e.target.value)}
            placeholder="Your college"
            style={styles.input}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Year</label>
              <div style={styles.chipRow}>
                {YEARS.map(y => (
                  <button
                    key={y}
                    onClick={() => update("year", y)}
                    className="chip-tap"
                    style={{
                      ...styles.chip,
                      background: form.year === y ? T.purple : T.muted,
                      fontWeight: form.year === y ? "700" : "400",
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label style={styles.label}>Age</label>
          <input
            type="number"
            min="17"
            max="30"
            value={form.age}
            onChange={e => update("age", e.target.value)}
            placeholder="Your age"
            style={{ ...styles.input, width: "30%" }}
          />

          <label style={styles.label}>Bio</label>
          <textarea
            value={form.bio}
            onChange={e => update("bio", e.target.value)}
            placeholder="Tell people about yourself..."
            rows={3}
            style={{ ...styles.input, resize: "none" }}
          />

          <label style={styles.label}>Your vibes (up to 5)</label>
          <div style={styles.chipRow}>
            {VIBES.map(vibe => (
              <button
                key={vibe}
                onClick={() => toggleVibe(vibe)}
                className="chip-tap"
                style={{
                  ...styles.chip,
                  background: form.vibes.includes(vibe) ? "#1A1840" : T.muted,
                  color:      form.vibes.includes(vibe) ? "#A09EFF" : T.textSec,
                  border:     form.vibes.includes(vibe) ? `1.5px solid ${T.purple}` : "1.5px solid transparent",
                  fontWeight: form.vibes.includes(vibe) ? "600" : "400",
                }}
              >
                {vibe}
              </button>
            ))}
          </div>

          <button onClick={handleSubmit} style={styles.submitBtn} className="tap">
            Save Changes ✓
          </button>
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
  label:       { display: "block", fontSize: 12, fontWeight: "600", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, marginTop: 4 },
  input:       { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 16, color: T.text },
  chipRow:     { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip:        { padding: "7px 14px", borderRadius: 20, border: "1.5px solid transparent", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "#fff" },
  error:       { background: "#2D1810", color: "#FF8060", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16, border: "1px solid #4A2A1A" },
  submitBtn:   { width: "100%", padding: 14, borderRadius: 12, border: "none", background: T.orange, color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
}

export default EditProfileModal