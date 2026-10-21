import { MapPin, Calendar, Clock, Navigation } from 'lucide-react'
import { T, TYPE_CONFIG, getAvatarColor, formatDate } from '../theme.js'
import Stars from './Stars.jsx'

function Meta({ Icon, children }) {
  return (
    <span style={styles.meta}>
      <Icon size={13} color={T.textMut} />
      {children}
    </span>
  )
}

function PlanCard({ plan, creatorName, distance, creatorRating }) {
  const config    = TYPE_CONFIG[plan.type] || TYPE_CONFIG.Other
  const spotsLeft = plan.maxMembers - plan.memberIds.length
  const initials  = creatorName
    ? creatorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "??"

  

  return (
    <div
      className="card-tap fade-in"
      style={{ ...styles.card, background: `radial-gradient(circle at 100% 0%, ${config.bg} 0%, transparent 55%), ${T.cardGradient}` }}
    >
      <div style={styles.topRow}>
        <span style={{ ...styles.badge, background: config.bg, color: config.color }}>
          <span style={{ ...styles.dot, background: config.dot }} />
          {plan.type}
        </span>
        <span style={styles.visibility}>{plan.isPublic ? "🌍 Public" : "🔒 Friends only"}</span>
      </div>

      <h2 style={styles.title}>{plan.title}</h2>
      <p style={styles.description}>{plan.description}</p>

      <div style={styles.metaRow}>
        <Meta Icon={MapPin}>{plan.location}</Meta>
        <Meta Icon={Calendar}>{formatDate(plan.date)}</Meta>
        {plan.time && <Meta Icon={Clock}>{plan.time}</Meta>}
        {distance !== null && distance !== undefined && (
          <span style={{ ...styles.meta, color: T.green }}>
            <Navigation size={13} color={T.green} />
            {distance < 1 ? "< 1 km" : `${distance.toFixed(1)} km`}
          </span>
        )}
      </div>

      <div style={styles.bottomRow}>
        <div style={styles.creatorRow}>
          <div style={{ ...styles.avatar, background: getAvatarColor(creatorName || "x") }}>{initials}</div>
          <div>
            <div style={styles.creatorName}>{creatorName || "Unknown"}</div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              {creatorRating ? (
                <>
                  <Stars score={creatorRating.avg} size={10} />
                  <span style={{ fontSize: 10, color: T.yellow, fontWeight: "700" }}>{creatorRating.avg}</span>
                  <span style={{ fontSize: 10, color: T.textMut }}>({creatorRating.count})</span>
                </>
              ) : (
                <span style={{ fontSize: 10, color: T.textMut }}>New host</span>
              )}
            </div>
          </div>
        </div>

        <div style={{
          ...styles.spots,
          color:      spotsLeft <= 0 ? T.textMut : spotsLeft <= 2 ? "#FF8A70" : "#5EE0B0",
          background: spotsLeft <= 0 ? "rgba(255,255,255,0.06)" : spotsLeft <= 2 ? "rgba(255,107,74,0.14)" : "rgba(52,211,153,0.14)",
        }}>
          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` : "Full"}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card:        { borderRadius: 26, padding: "18px 20px", marginBottom: 16, boxShadow: T.shadow, border: "1px solid rgba(255,255,255,0.05)" },
  topRow:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badge:       { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: "700", padding: "5px 12px", borderRadius: 20 },
  dot:         { width: 6, height: 6, borderRadius: "50%" },
  visibility:  { fontSize: 11, color: T.textMut, fontWeight: "500" },
  title:       { fontSize: 19, fontWeight: "800", color: T.text, marginBottom: 6, lineHeight: 1.25, letterSpacing: -0.3 },
  description: { fontSize: 13, color: T.textSec, lineHeight: 1.55, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  metaRow:     { display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 },
  meta:        { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: T.textSec },
  bottomRow:   { display: "flex", justifyContent: "space-between", alignItems: "center" },
  creatorRow:  { display: "flex", alignItems: "center", gap: 10 },
  avatar:      { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: "800", flexShrink: 0 },
  creatorName: { fontSize: 13, color: T.text, fontWeight: "600" },
  spots:       { fontSize: 11, fontWeight: "700", padding: "6px 12px", borderRadius: 20 },
}

export default PlanCard