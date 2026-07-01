function PlanDetailScreen({ plan, currentUserId, onBack, onJoinRequest, onCancelRequest }) {

  // Check if current user has already requested
  const hasRequested = plan.requestIds.includes(currentUserId)

  // Check if current user is already a member
  const isMember = plan.memberIds.includes(currentUserId)

  // Check if current user is the creator
  const isCreator = plan.creatorId === currentUserId

  // How many spots left
  const spotsLeft = plan.maxMembers - plan.memberIds.length

  return (
    <div style={{ padding: "20px 16px 100px" }}>

      {/* Back button */}
      <button onClick={onBack} style={styles.backBtn}>
        ← Back
      </button>

      {/* Title and location */}
      <h1 style={styles.title}>{plan.title}</h1>
      <p style={styles.location}>📍 {plan.location} · 📅 {plan.date}</p>

      {/* About section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>About</h3>
        <p style={styles.description}>{plan.description}</p>
      </div>

      {/* Details grid */}
      <div style={styles.grid}>
        <div style={styles.gridItem}>
          <div style={styles.gridLabel}>Type</div>
          <div style={styles.gridValue}>{plan.type}</div>
        </div>
        <div style={styles.gridItem}>
          <div style={styles.gridLabel}>Members</div>
          <div style={styles.gridValue}>
            {plan.memberIds.length}/{plan.maxMembers}
          </div>
        </div>
        <div style={styles.gridItem}>
          <div style={styles.gridLabel}>Time</div>
          <div style={styles.gridValue}>{plan.time}</div>
        </div>
        <div style={styles.gridItem}>
          <div style={styles.gridLabel}>Spots Left</div>
          <div style={styles.gridValue}>{spotsLeft}</div>
        </div>
      </div>

      {/* ── Action area ── */}

      {/* You're the creator */}
      {isCreator && (
        <div style={styles.infoBox}>
          👑 You created this plan
        </div>
      )}

      {/* Already a member (not creator) */}
      {isMember && !isCreator && (
        <div style={{ ...styles.infoBox, backgroundColor: "#E1F5EE", color: "#0F6E56" }}>
          ✅ You're in this plan!
        </div>
      )}

      {/* Pending request */}
      {hasRequested && !isMember && (
        <div>
          <div style={{ ...styles.infoBox, backgroundColor: "#FFF8EC", color: "#854F0B" }}>
            ⏳ Request pending — waiting for creator to accept
          </div>
          <button
            onClick={() => onCancelRequest(plan.id)}
            style={styles.cancelBtn}
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Can join */}
      {!isMember && !hasRequested && !isCreator && spotsLeft > 0 && (
        <button
          onClick={() => onJoinRequest(plan.id)}
          style={styles.joinBtn}
        >
          Request to Join
        </button>
      )}

      {/* Plan is full */}
      {!isMember && !hasRequested && spotsLeft === 0 && (
        <div style={{ ...styles.infoBox, backgroundColor: "#F1EFE8", color: "#5F5E5A" }}>
          😔 This plan is full
        </div>
      )}

    </div>
  )
}

const styles = {
  backBtn: {
    background: "none", border: "none", fontSize: "15px",
    color: "#D85A30", cursor: "pointer", padding: "0 0 16px 0",
    fontFamily: "inherit", fontWeight: "600",
  },
  title: {
    fontSize: "22px", fontWeight: "700",
    color: "#1A1917", margin: "0 0 6px 0",
  },
  location: {
    fontSize: "13px", color: "#6B6864", margin: "0 0 20px 0",
  },
  section: { marginBottom: "20px" },
  sectionTitle: {
    fontSize: "13px", fontWeight: "600", color: "#6B6864",
    textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0",
  },
  description: {
    fontSize: "14px", color: "#1A1917", lineHeight: "1.6", margin: 0,
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "10px", marginBottom: "24px",
  },
  gridItem: {
    backgroundColor: "#F0EEE9", borderRadius: "12px", padding: "12px",
  },
  gridLabel: {
    fontSize: "11px", color: "#6B6864",
    marginBottom: "4px", textTransform: "uppercase",
  },
  gridValue: {
    fontSize: "15px", fontWeight: "600", color: "#1A1917",
  },
  infoBox: {
    padding: "14px 16px", borderRadius: "12px",
    fontSize: "14px", fontWeight: "500",
    backgroundColor: "#EEEDFE", color: "#3C3489",
    marginBottom: "12px",
  },
  joinBtn: {
    width: "100%", padding: "14px", borderRadius: "12px",
    border: "none", backgroundColor: "#D85A30", color: "#fff",
    fontSize: "15px", fontWeight: "700",
    fontFamily: "inherit", cursor: "pointer",
  },
  cancelBtn: {
    width: "100%", padding: "13px", borderRadius: "12px",
    border: "1.5px solid #FAC775", backgroundColor: "#fff",
    color: "#C8530A", fontSize: "14px", fontWeight: "600",
    fontFamily: "inherit", cursor: "pointer",
  },
}

export default PlanDetailScreen