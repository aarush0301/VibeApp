import { T, TYPE_CONFIG, getAvatarColor, formatDate } from '../theme.js'

function PlanCard({ plan, creatorName }) {
  const config    = TYPE_CONFIG[plan.type] || TYPE_CONFIG.Other
  const spotsLeft = plan.maxMembers - plan.memberIds.length
  const initials  = creatorName
    ? creatorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "??"

  return (
    <div style={styles.card} className="card-tap fade-in">
      <div style={styles.topRow}>
        <span style={{ ...styles.badge, background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
          <span style={{ ...styles.dot, background: config.dot }} />
          {plan.type}
        </span>
        <span style={styles.visibility}>{plan.isPublic ? "🌍 Public" : "🔒 Private"}</span>
      </div>

      <h2 style={styles.title}>{plan.title}</h2>
      <p style={styles.description}>{plan.description}</p>

      <div style={styles.infoRow}>
        <span style={styles.infoPill}>📍 {plan.location}</span>
        <span style={styles.infoPill}>📅 {formatDate(plan.date)}</span>
        <span style={styles.infoPill}>🕐 {plan.time}</span>
      </div>

      <div style={styles.bottomRow}>
        <div style={styles.creatorRow}>
          <div style={{ ...styles.avatar, background: getAvatarColor(creatorName || "x") }}>
            {initials}
          </div>
          <span style={styles.creatorName}>{creatorName || "Unknown"}</span>
        </div>
        <div style={{
          ...styles.spots,
          color:      spotsLeft <= 2 ? "#FF8060" : "#50D4A0",
          background: spotsLeft <= 2 ? "#2D1810" : "#0D2820",
        }}>
          {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card:        { background: T.card, borderRadius: 20, padding: "16px 18px", marginBottom: 14, border: `1px solid ${T.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
  topRow:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  badge:       { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: "600", padding: "4px 10px", borderRadius: 20 },
  dot:         { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  visibility:  { fontSize: 11, color: T.textMut, fontWeight: "500" },
  title:       { fontSize: 17, fontWeight: "700", color: T.text, marginBottom: 6, lineHeight: 1.3 },
  description: { fontSize: 13, color: T.textSec, lineHeight: 1.55, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  infoRow:     { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
  infoPill:    { fontSize: 12, color: T.textSec, background: T.muted, padding: "4px 10px", borderRadius: 20, border: `1px solid ${T.chip}` },
  bottomRow:   { display: "flex", justifyContent: "space-between", alignItems: "center" },
  creatorRow:  { display: "flex", alignItems: "center", gap: 8 },
  avatar:      { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: "700", flexShrink: 0 },
  creatorName: { fontSize: 12, color: T.textMut, fontWeight: "500" },
  spots:       { fontSize: 11, fontWeight: "600", padding: "4px 10px", borderRadius: 20 },
}

export default PlanCard