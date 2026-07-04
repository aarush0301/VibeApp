import { users } from '../data.js'

function ProfileScreen({ currentUserId, plans }) {

  // Get current user's data
  const user = users.find(u => u.id === currentUserId)

  // Their stats
  const plansCreated = plans.filter(p => p.creatorId === currentUserId).length
  const plansJoined  = plans.filter(p =>
    p.memberIds.includes(currentUserId) && p.creatorId !== currentUserId
  ).length

  if (!user) return null

  return (
    <div style={{ padding: "20px 16px 100px" }}>

      {/* Header */}
      <h1 style={styles.heading}>Profile 👤</h1>

      {/* Profile card */}
      <div style={styles.profileCard}>

        {/* Avatar */}
        <div style={styles.avatar}>
          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>

        {/* Name and college */}
        <h2 style={styles.name}>{user.name}</h2>
        <p style={styles.college}>{user.college}</p>

        {/* Info row */}
        <div style={styles.infoRow}>
          <div style={styles.infoItem}>
            <div style={styles.infoValue}>{user.year}</div>
            <div style={styles.infoLabel}>Year</div>
          </div>
          <div style={styles.infoDivider} />
          <div style={styles.infoItem}>
            <div style={styles.infoValue}>{user.age}</div>
            <div style={styles.infoLabel}>Age</div>
          </div>
          <div style={styles.infoDivider} />
          <div style={styles.infoItem}>
            <div style={styles.infoValue}>{plansCreated}</div>
            <div style={styles.infoLabel}>Created</div>
          </div>
          <div style={styles.infoDivider} />
          <div style={styles.infoItem}>
            <div style={styles.infoValue}>{plansJoined}</div>
            <div style={styles.infoLabel}>Joined</div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Bio</p>
          <p style={styles.bio}>{user.bio}</p>
        </div>
      )}

      {/* Vibes */}
      {user.vibes?.length > 0 && (
        <div style={styles.section}>
          <p style={styles.sectionLabel}>Vibes</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {user.vibes.map(vibe => (
              <span key={vibe} style={styles.vibePill}>{vibe}</span>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

const styles = {
  heading:     { fontSize: "22px", fontWeight: "700", color: "#1A1917", margin: "0 0 20px" },
  profileCard: { background: "#ffffff", borderRadius: 20, padding: "24px 20px", textAlign: "center", marginBottom: 16, border: "1px solid #E8E6E1" },
  avatar:      { width: 72, height: 72, borderRadius: "50%", background: "#7F77DD", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 24, margin: "0 auto 14px" },
  name:        { fontSize: "20px", fontWeight: "700", color: "#1A1917", margin: "0 0 4px" },
  college:     { fontSize: "13px", color: "#6B6864", margin: "0 0 20px" },
  infoRow:     { display: "flex", alignItems: "center", justifyContent: "center", gap: 0 },
  infoItem:    { flex: 1, textAlign: "center" },
  infoValue:   { fontSize: "18px", fontWeight: "700", color: "#1A1917" },
  infoLabel:   { fontSize: "11px", color: "#9E9B96", textTransform: "uppercase", letterSpacing: "0.4px", marginTop: 2 },
  infoDivider: { width: 1, height: 32, background: "#E8E6E1" },
  section:     { background: "#ffffff", borderRadius: 16, padding: "16px", marginBottom: 12, border: "1px solid #E8E6E1" },
  sectionLabel:{ fontSize: "12px", fontWeight: "600", color: "#9E9B96", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 },
  bio:         { fontSize: "14px", color: "#1A1917", lineHeight: "1.6", margin: "8px 0 0" },
  vibePill:    { background: "#EEEDFE", color: "#3C3489", fontSize: "13px", padding: "6px 14px", borderRadius: 20, fontWeight: "500" },
}

export default ProfileScreen