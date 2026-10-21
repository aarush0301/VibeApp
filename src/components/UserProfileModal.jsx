import { X } from 'lucide-react'
import { T, getAvatarColor } from '../theme.js'
import { getRatingStats, ratingLabel } from '../ratingUtils.js'
import Stars from './Stars.jsx'

function UserProfileModal({ user, users, friendships, currentUserId, onSendRequest, onAccept, onRemove, onClose }) {
  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const stats    = getRatingStats(user.ratings)

  const friendship = friendships.find(f =>
    (f.requester_id === currentUserId && f.addressee_id === user.id) ||
    (f.requester_id === user.id && f.addressee_id === currentUserId)
  )

  let friendAction
  if (!friendship) {
    friendAction = <button onClick={() => onSendRequest(user.id)} className="tap" style={styles.primaryBtn}>Add friend</button>
  } else if (friendship.status === "accepted") {
    friendAction = (
      <div style={{ display: "flex", gap: 8 }}>
        <span style={styles.statusPill}>Friends</span>
        <button onClick={() => onRemove(friendship.id)} className="tap" style={styles.ghostBtn}>Remove</button>
      </div>
    )
  } else if (friendship.requester_id === currentUserId) {
    friendAction = (
      <div style={{ display: "flex", gap: 8 }}>
        <span style={{ ...styles.statusPill, color: T.yellow }}>Request sent</span>
        <button onClick={() => onRemove(friendship.id)} className="tap" style={styles.ghostBtn}>Cancel</button>
      </div>
    )
  } else {
    friendAction = <button onClick={() => onAccept(friendship.id)} className="tap" style={styles.primaryBtn}>Accept friend request</button>
  }

  return (
    <div style={styles.backdrop} className="backdrop-fade" onClick={onClose}>
      <div style={styles.sheet} className="slide-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="tap" style={styles.closeBtn} aria-label="Close">
          <X size={16} color={T.textSec} />
        </button>

        <div style={{ textAlign: "center", padding: "8px 20px 0" }}>
          <div style={{ ...styles.avatar, background: getAvatarColor(user.name) }}>{initials}</div>
          <h2 style={styles.name}>{user.name}</h2>
          <p style={styles.college}>
            {user.college}{user.year ? ` · ${user.year} yr` : ""}{user.age ? ` · ${user.age}` : ""}
          </p>

          <div style={{ marginBottom: 14 }}>
            {stats ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                <Stars score={stats.avg} size={14} />
                <span style={{ fontSize: 13, fontWeight: "700", color: T.yellow }}>{stats.avg}</span>
                <span style={{ fontSize: 11, color: T.textMut }}>({stats.count})</span>
                <span style={styles.label}>{ratingLabel(stats.avg)}</span>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: T.textMut }}>No ratings yet</span>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>{friendAction}</div>
        </div>

        <div style={styles.body}>
          {user.bio && (
            <div style={styles.section}>
              <p style={styles.sectionLabel}>About</p>
              <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{user.bio}</p>
            </div>
          )}

          {user.vibes?.length > 0 && (
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Vibes</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {user.vibes.map(v => <span key={v} style={styles.vibePill}>{v}</span>)}
              </div>
            </div>
          )}

          {user.ratings?.length > 0 && (
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Reviews</p>
              {[...user.ratings].reverse().map(r => {
                const rater = users.find(u => u.id === r.rater_id)
                return (
                  <div key={r.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <Stars score={r.score} size={12} />
                      <span style={{ fontSize: 11, color: T.textMut }}>{rater?.name?.split(" ")[0] || "Someone"}</span>
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>"{r.comment}"</p>}
                  </div>
                )
              })}
            </div>
          )}

          {!user.bio && !(user.vibes?.length > 0) && !(user.ratings?.length > 0) && (
            <p style={{ textAlign: "center", color: T.textMut, fontSize: 13, padding: "20px 0" }}>
              This person hasn't filled in their profile yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 250, display: "flex", alignItems: "flex-end" },
  sheet:        { position: "relative", background: T.card, borderRadius: "28px 28px 0 0", width: "100%", maxHeight: "88vh", overflowY: "auto", paddingTop: 28, boxShadow: T.shadow },
  closeBtn:     { position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  avatar:       { width: 76, height: 76, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: 26, margin: "0 auto 12px", boxShadow: "0 0 0 4px rgba(255,255,255,0.06)" },
  name:         { fontSize: 21, fontWeight: "800", color: T.text, letterSpacing: -0.4, marginBottom: 4 },
  college:      { fontSize: 13, color: T.textMut, marginBottom: 10 },
  label:        { fontSize: 10, background: "rgba(251,191,36,0.14)", color: T.yellow, padding: "2px 8px", borderRadius: 10, fontWeight: "700" },
  primaryBtn:   { background: T.gradient, color: "#fff", border: "none", borderRadius: 18, padding: "10px 22px", fontSize: 13, fontWeight: "700", fontFamily: "inherit", cursor: "pointer", boxShadow: T.glow },
  statusPill:   { background: "rgba(255,255,255,0.07)", color: T.green, borderRadius: 18, padding: "10px 18px", fontSize: 13, fontWeight: "700" },
  ghostBtn:     { background: "transparent", color: "#FF8A70", border: "1px solid rgba(255,138,112,0.5)", borderRadius: 18, padding: "10px 16px", fontSize: 13, fontWeight: "600", fontFamily: "inherit", cursor: "pointer" },
  body:         { padding: "16px 16px 32px" },
  section:      { background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "16px 18px", marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 },
  vibePill:     { background: "rgba(139,124,255,0.16)", color: "#B4A9FF", fontSize: 13, padding: "6px 14px", borderRadius: 20, fontWeight: "500" },
}

export default UserProfileModal