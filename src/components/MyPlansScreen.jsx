import PlanCard from './PlanCard.jsx'
import { users } from '../data.js'

function MyPlansScreen({ plans, currentUserId, onOpenPlan, onAcceptRequest, onDeclineRequest }) {

  // Plans this user created
  const createdPlans = plans.filter(p => p.creatorId === currentUserId)

  // Plans this user joined (but didn't create)
  const joinedPlans = plans.filter(p =>
    p.memberIds.includes(currentUserId) && p.creatorId !== currentUserId
  )

  // Total pending requests across all created plans
  const totalPending = createdPlans.reduce((total, p) => total + p.requestIds.length, 0)

  // Helper to get user by id
  const getUserById = (id) => users.find(u => u.id === id) || { name: "Unknown", college: "" }

  return (
    <div style={{ padding: "20px 16px 100px" }}>

      {/* Header */}
      <h1 style={styles.heading}>My Plans 📋</h1>

      {/* Pending requests banner */}
      {totalPending > 0 && (
        <div style={styles.pendingBanner}>
          ⏳ You have {totalPending} pending join request{totalPending !== 1 ? "s" : ""}
        </div>
      )}

      {/* ── Plans I Created ── */}
      {createdPlans.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={styles.sectionLabel}>Plans you created</p>

          {createdPlans.map(plan => (
            <div key={plan.id}>
              {/* Plan card — tappable */}
              <div onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }}>
                <PlanCard plan={plan} />
              </div>

              {/* Pending requests for this plan */}
              {plan.requestIds.length > 0 && (
                <div style={styles.requestsBox}>
                  <p style={styles.requestsTitle}>
                    ⏳ {plan.requestIds.length} request{plan.requestIds.length !== 1 ? "s" : ""} waiting
                  </p>

                  {plan.requestIds.map(uid => {
                    const u = getUserById(uid)
                    return (
                      <div key={uid} style={styles.requestRow}>
                        {/* Avatar */}
                        <div style={styles.avatar}>
                          {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={styles.requestName}>{u.name}</div>
                          <div style={styles.requestSub}>{u.college} · {u.year} yr</div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => onAcceptRequest(plan.id, uid)}
                            style={styles.acceptBtn}
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => onDeclineRequest(plan.id, uid)}
                            style={styles.declineBtn}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Plans I Joined ── */}
      {joinedPlans.length > 0 && (
        <div>
          <p style={styles.sectionLabel}>Plans you joined</p>
          {joinedPlans.map(plan => (
            <div key={plan.id} onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }}>
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {createdPlans.length === 0 && joinedPlans.length === 0 && (
        <div style={styles.emptyState}>
          <p style={{ fontSize: 40, margin: "0 0 12px" }}>🌴</p>
          <p style={{ fontSize: 15, fontWeight: "600", color: "#1A1917" }}>No plans yet</p>
          <p style={{ fontSize: 13, color: "#9E9B96", margin: "4px 0 0" }}>
            Discover plans or create your own!
          </p>
        </div>
      )}

    </div>
  )
}

const styles = {
  heading:       { fontSize: "22px", fontWeight: "700", color: "#1A1917", margin: "0 0 16px" },
  pendingBanner: { background: "#FFF8EC", border: "1px solid #FAC775", borderRadius: 12, padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#854F0B", marginBottom: 20 },
  sectionLabel:  { fontSize: "12px", fontWeight: "600", color: "#9E9B96", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 10px" },
  requestsBox:   { background: "#FFF8EC", border: "1px solid #FAC775", borderRadius: 12, padding: "12px 14px", marginTop: -8, marginBottom: 14 },
  requestsTitle: { fontSize: "13px", fontWeight: "600", color: "#854F0B", margin: "0 0 10px" },
  requestRow:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar:        { width: 36, height: 36, borderRadius: "50%", background: "#EF9F27", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 12, flexShrink: 0 },
  requestName:   { fontSize: "13px", fontWeight: "600", color: "#1A1917" },
  requestSub:    { fontSize: "11px", color: "#6B6864", marginTop: 2 },
  acceptBtn:     { background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer", fontWeight: "600" },
  declineBtn:    { background: "transparent", color: "#D85A30", border: "1px solid #D85A30", borderRadius: 8, padding: "6px 10px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" },
  emptyState:    { textAlign: "center", padding: "60px 0" },
}

export default MyPlansScreen