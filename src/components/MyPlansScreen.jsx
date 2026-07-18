
import { T, getAvatarColor } from '../theme.js'
import PlanCard from './PlanCard.jsx'

function MyPlansScreen({ plans, users, currentUserId, onOpenPlan, onAcceptRequest, onDeclineRequest }) {
  const getUserById  = id => users.find(u => u.id === id) || { name: "Unknown", college: "" }
  const createdPlans = plans.filter(p => p.creatorId === currentUserId)
  const joinedPlans  = plans.filter(p => p.memberIds.includes(currentUserId) && p.creatorId !== currentUserId)
  const totalPending = createdPlans.reduce((total, p) => total + p.requestIds.length, 0)

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <h1 style={styles.heading}>My Plans</h1>
        {totalPending > 0 && <span style={styles.pendingBadge}>{totalPending} pending</span>}
      </div>

      {totalPending > 0 && (
        <div style={styles.pendingBanner}>
          ⏳ You have {totalPending} pending join request{totalPending !== 1 ? "s" : ""}
        </div>
      )}

      {createdPlans.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={styles.sectionLabel}>Plans you created</p>
          {createdPlans.map(plan => (
            <div key={plan.id}>
              <div onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }}>
                <PlanCard plan={plan} creatorName={getUserById(plan.creatorId)?.name} />
              </div>
              {plan.requestIds.length > 0 && (
                <div style={styles.requestsBox}>
                  <p style={styles.requestsTitle}>⏳ {plan.requestIds.length} request{plan.requestIds.length !== 1 ? "s" : ""} waiting</p>
                  {plan.requestIds.map(uid => {
                    const u = getUserById(uid)
                    return (
                      <div key={uid} style={styles.requestRow}>
                        <div style={{ ...styles.avatar, background: getAvatarColor(u.name) }}>
                          {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: "600", color: T.text }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{u.college} · {u.year} yr</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => onAcceptRequest(plan.id, uid)} style={styles.acceptBtn}>✓ Accept</button>
                          <button onClick={() => onDeclineRequest(plan.id, uid)} style={styles.declineBtn}>✕</button>
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

      {joinedPlans.length > 0 && (
        <div>
          <p style={styles.sectionLabel}>Plans you joined</p>
          {joinedPlans.map(plan => (
            <div key={plan.id} onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }}>
              <PlanCard plan={plan} creatorName={getUserById(plan.creatorId)?.name} />
            </div>
          ))}
        </div>
      )}

      {createdPlans.length === 0 && joinedPlans.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🌴</p>
          <p style={{ fontSize: 15, fontWeight: "600", color: T.text }}>No plans yet</p>
          <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>Discover plans or create your own!</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen:        { padding: "0 16px 100px", minHeight: "100vh", background: T.bg },
  header:        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 0 20px" },
  heading:       { fontSize: 24, fontWeight: "800", color: T.text, letterSpacing: -0.5 },
  pendingBadge:  { background: "#2A2008", color: T.yellow, fontSize: 12, fontWeight: "700", padding: "4px 12px", borderRadius: 20, border: `1px solid #4A3800` },
  pendingBanner: { background: "#2A2008", border: `1px solid #4A3800`, borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: "500", color: T.yellow, marginBottom: 20 },
  sectionLabel:  { fontSize: 12, fontWeight: "700", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 10px" },
  requestsBox:   { background: "#2A2008", border: `1px solid #4A3800`, borderRadius: 12, padding: "12px 14px", marginTop: -8, marginBottom: 14 },
  requestsTitle: { fontSize: 13, fontWeight: "600", color: T.yellow, margin: "0 0 10px" },
  requestRow:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar:        { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 12, flexShrink: 0 },
  acceptBtn:     { background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: "600" },
  declineBtn:    { background: "transparent", color: "#FF8060", border: "1px solid #FF8060", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" },
}

export default MyPlansScreen