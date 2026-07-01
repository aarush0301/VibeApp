// The type colours — each plan type gets its own colour
const typeColors = {
  Party:        { background: "#FAECE7", color: "#1f3d7d" },
  Trip:         { background: "#E1F5EE", color: "#4671f1" },
  Outing:       { background: "#EEEDFE", color: "#3C3489" },
  "Food Run":   { background: "#d2c3aa", color: "#0e216ee7" },
  Sports:       { background: "#EAF3DE", color: "#484bf7" },
  "Study Sesh": { background: "#E6F1FB", color: "#185FA5" },
  Other:        { background: "#F1EFE8", color: "#266993" },
}

function PlanCard({ plan }) {
  // Pull the right colours for this plan's type
  const colors = typeColors[plan.type] || typeColors.Other

  return (
    <div style={styles.card}>

      {/* Type badge — coloured pill showing plan type */}
      <div style={{
        ...styles.badge,
        backgroundColor: colors.background,
        color: colors.color,
      }}>
        {plan.type}
      </div>

      {/* Plan title */}
      <h2 style={styles.title}>{plan.title}</h2>

      {/* Description */}
      <p style={styles.description}>{plan.description}</p>

      {/* Info row — location, date, spots */}
      <div style={styles.infoRow}>
        <span>📍 {plan.location}</span>
        <span>📅 {plan.date}</span>
        <span>👥 {plan.memberIds.length}/{plan.maxMembers}</span>
      </div>

      {/* Public or Private label */}
      {plan.isPublic
        ? <p style={styles.publicLabel}>🌍 Public</p>
        : <p style={styles.privateLabel}>🔒 Private</p>
      }

    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #E8E6E1",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "12px",
  },
  badge: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "8px",
  },
  title: {
    margin: "0 0 6px 0",
    fontSize: "17px",
    fontWeight: "700",
    color: "#1A1917",
  },
  description: {
    margin: "0 0 12px 0",
    fontSize: "13px",
    color: "#6B6864",
    lineHeight: "1.5",
  },
  infoRow: {
    display: "flex",
    gap: "14px",
    fontSize: "12px",
    color: "#6B6864",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  publicLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#1D9E75",
    fontWeight: "500",
  },
  privateLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#D85A30",
    fontWeight: "500",
  },
}

export default PlanCard