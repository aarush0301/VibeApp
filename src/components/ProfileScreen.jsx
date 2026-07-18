
import { useState } from 'react'
import { T, getAvatarColor } from '../theme.js'
import EditProfileModal from './EditProfileModal.jsx'

function ProfileScreen({ currentUserId, plans, users, onUpdateProfile }) {
  const [showEdit, setShowEdit] = useState(false)


  const user = users.find(u => u.id === currentUserId)
  if (!user) return null

  const plansCreated = plans.filter(p => p.creatorId === currentUserId).length
  const plansJoined  = plans.filter(p => p.memberIds.includes(currentUserId) && p.creatorId !== currentUserId).length
  const initials     = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div style={styles.screen}>
      {/* Hero */}
      <div style={styles.hero}>
  <div style={{ ...styles.avatar, background: getAvatarColor(user.name) }}>{initials}</div>
  <h1 style={styles.name}>{user.name}</h1>
  <p style={styles.college}>{user.college}</p>

  <button onClick={() => setShowEdit(true)} style={styles.editBtn} className="tap">
    ✏️ Edit Profile
  </button>
        <div style={styles.statsRow}>
          {[["Year", user.year], ["Age", user.age], ["Created", plansCreated], ["Joined", plansJoined]].map(([label, value], i, arr) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{value}</div>
                <div style={styles.statLabel}>{label}</div>
              </div>
              {i < arr.length - 1 && <div style={styles.statDivider} />}
            </div>
          ))}
        </div>
      </div>

      {user.bio && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>About</p>
          <p style={styles.bioText}>{user.bio}</p>
        </div>
      )}

      {user.vibes?.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Vibes</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {user.vibes.map(vibe => (
              <span key={vibe} style={styles.vibePill}>{vibe}</span>
            ))}
          </div>
        </div>
      )}

      <div style={styles.section}>
        <p style={styles.sectionLabel}>Activity</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "#2D1810", borderRadius: 14, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: "800", color: T.orange, marginBottom: 4 }}>{plansCreated}</div>
            <div style={{ fontSize: 12, fontWeight: "600", color: "#FF8060" }}>Plans Created</div>
          </div>
          <div style={{ background: "#1A1840", borderRadius: 14, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: "800", color: T.purple, marginBottom: 4 }}>{plansJoined}</div>
            <div style={{ fontSize: 12, fontWeight: "600", color: "#A09EFF" }}>Plans Joined</div>
          </div>
        </div>
      </div>
      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(updatedData) => {
            onUpdateProfile(updatedData)
            setShowEdit(false)
          }}
        />
      )}
    </div>
  )
}

const styles = {
  screen:       { paddingBottom: 100, minHeight: "100vh", background: T.bg },
  hero:         { background: T.card, padding: "52px 20px 28px", textAlign: "center", borderBottom: `1px solid ${T.border}`, marginBottom: 12 },
  avatar:       { width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: 28, margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" },
  name:         { fontSize: 22, fontWeight: "800", color: T.text, marginBottom: 4, letterSpacing: -0.3 },
  college:      { fontSize: 13, color: T.textMut, marginBottom: 20 },
  statsRow:     { display: "flex", justifyContent: "center", alignItems: "center", background: T.muted, borderRadius: 16, padding: "14px 8px" },
  statItem:     { flex: 1, textAlign: "center", padding: "0 8px" },
  statValue:    { fontSize: 18, fontWeight: "800", color: T.text },
  statLabel:    { fontSize: 10, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 },
  statDivider:  { width: 1, height: 28, background: T.chip },
  section:      { background: T.card, borderRadius: 20, padding: "18px 20px", marginBottom: 12, marginLeft: 16, marginRight: 16, border: `1px solid ${T.border}` },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 },
  bioText:      { fontSize: 14, color: T.textSec, lineHeight: 1.6 },
  vibePill:     { background: T.muted, color: T.textSec, fontSize: 13, padding: "6px 14px", borderRadius: 20, fontWeight: "500", border: `1px solid ${T.chip}` },
  editBtn:      { background: T.muted, color: T.textSec, border: `1px solid ${T.chip}`, borderRadius: 20, padding: "7px 18px", fontSize: 13, fontWeight: "600", fontFamily: "inherit", cursor: "pointer", marginTop: 4 },
}

export default ProfileScreen