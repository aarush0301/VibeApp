
import { T, getAvatarColor } from '../theme.js'
import { getRatingStats } from '../ratingUtils.js'
import PlanCard from './PlanCard.jsx'

const initialsOf = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

function MyPlansScreen({
  plans, users, currentUserId,
  onOpenPlan, onAcceptRequest, onDeclineRequest, onOpenProfile,
}) {
  const getUserById = id =>
    users.find(u => u.id === id) || { id, name: "Unknown", college: "", year: "", ratings: [] }

  const createdPlans = plans.filter(p => p.creatorId === currentUserId)
  const joinedPlans  = plans.filter(p => p.memberIds.includes(currentUserId) && p.creatorId !== currentUserId)
  const totalPending = createdPlans.reduce((total, p) => total + p.requestIds.length, 0)

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <h1 style={styles.heading}>My Plans</h1>
        {totalPending > 0 && <span style={styles.pendingBadge}>{totalPending} pending</span>}
      </div>

      {createdPlans.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={styles.sectionLabel}>Plans you created</p>

          {createdPlans.map(plan => {
            const creator = getUserById(plan.creatorId)
            return (
              <div key={plan.id}>
                <div onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }}>
                  <PlanCard
                    plan={plan}
                    creatorName={creator.name}
                    creatorRating={getRatingStats(creator.ratings)}
                  />
                </div>

                {plan.requestIds.length > 0 && (
                  <div style={styles.requestsBox}>
                    <p style={styles.requestsTitle}>
                      {plan.requestIds.length} request{plan.requestIds.length !== 1 ? "s" : ""} waiting
                    </p>

                    {plan.requestIds.map(uid => {
                      const u = getUserById(uid)
                      return (
                        <div key={uid} style={styles.requestRow}>
                          <div
                            onClick={() => onOpenProfile(uid)}
                            style={{ ...styles.avatar, background: getAvatarColor(u.name), cursor: "pointer" }}
                          >
                            {initialsOf(u.name)}
                          </div>
                          <div onClick={() => onOpenProfile(uid)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                            <div style={{ fontSize: 13, fontWeight: "700", color: T.text }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>
                              {u.college}{u.year ? ` · ${u.year} yr` : ""}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => onAcceptRequest(plan.id, uid)} className="tap" style={styles.acceptBtn}>Accept</button>
                            <button onClick={() => onDeclineRequest(plan.id, uid)} className="tap" style={styles.declineBtn}>Decline</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {joinedPlans.length > 0 && (
        <div>
          <p style={styles.sectionLabel}>Plans you joined</p>
          {joinedPlans.map(plan => {
            const creator = getUserById(plan.creatorId)
            return (
              <div key={plan.id} onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }}>
                <PlanCard
                  plan={plan}
                  creatorName={creator.name}
                  creatorRating={getRatingStats(creator.ratings)}
                />
              </div>
            )
          })}
        </div>
      )}

      {createdPlans.length === 0 && joinedPlans.length === 0 && (
        <div style={styles.empty}>
          <p style={{ fontSize: 16, fontWeight: "700", color: T.text }}>No plans yet</p>
          <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>
            Join one from Discover, or tap + to create your own.
          </p>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen:        { padding: "0 16px 120px", minHeight: "100vh", background: "radial-gradient(ellipse at 50% -10%, rgba(139,124,255,0.18) 0%, transparent 55%), #0E0B1A" },
  header:        { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "56px 6px 20px" },
  heading:       { fontSize: 30, fontWeight: "800", color: T.text, letterSpacing: -0.8 },
  pendingBadge:  { background: "rgba(251,191,36,0.14)", color: T.yellow, fontSize: 12, fontWeight: "700", padding: "6px 14px", borderRadius: 20 },
  sectionLabel:  { fontSize: 12, fontWeight: "700", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 6px 12px" },
  requestsBox:   { background: "rgba(251,191,36,0.10)", borderRadius: 22, padding: "14px 14px 4px", marginTop: -6, marginBottom: 18 },
  requestsTitle: { fontSize: 13, fontWeight: "700", color: T.yellow, margin: "0 0 12px 2px" },
  requestRow:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  avatar:        { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: 12, flexShrink: 0 },
  acceptBtn:     { background: T.green, color: "#07281E", border: "none", borderRadius: 12, padding: "7px 12px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: "800" },
  declineBtn:    { background: "transparent", color: "#FF8A70", border: "1px solid rgba(255,138,112,0.5)", borderRadius: 12, padding: "7px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: "600" },
  empty:         { textAlign: "center", padding: "70px 20px" },
}

export default MyPlansScreen