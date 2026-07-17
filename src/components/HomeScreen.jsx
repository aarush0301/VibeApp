import { useState } from 'react'
import { users } from '../data.js'
import { T, getAvatarColor } from '../theme.js'
import PlanCard from './PlanCard.jsx'

const FILTERS = ["All", "Party", "Trip", "Outing", "Food Run", "Sports", "Study Sesh"]

function HomeScreen({ plans, onOpenPlan, currentUserId }) {
  const [activeFilter, setActiveFilter] = useState("All")
  const currentUser  = users.find(u => u.id === currentUserId)
  const getFirstName = () => currentUser?.name?.split(" ")[0] || "there"
  const getGreeting  = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }
  const getUserInitials = () =>
    currentUser?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??"
  const getUserById = id => users.find(u => u.id === id)

  const filteredPlans = activeFilter === "All"
    ? plans
    : plans.filter(p => p.type === activeFilter)

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>{getGreeting()} 👋</p>
          <h1 style={styles.heading}>Hey, {getFirstName()}!</h1>
          <p style={styles.subheading}>{filteredPlans.length} plans around you</p>
        </div>
        <div style={{ ...styles.avatar, background: getAvatarColor(currentUser?.name || "x") }}>
          {getUserInitials()}
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterScroll}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} className="chip-tap"  style={{
            ...styles.filterChip,
            background: activeFilter === f ? T.orange  : T.card,
            color:      activeFilter === f ? "#ffffff" : T.textSec,
            border:     activeFilter === f ? `1.5px solid ${T.orange}` : `1.5px solid ${T.border}`,
            fontWeight: activeFilter === f ? "700" : "400",
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={styles.cardList}>
        {filteredPlans.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🌴</p>
            <p style={{ fontSize: 15, fontWeight: "600", color: T.text }}>No {activeFilter} plans yet</p>
            <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>Be the first to create one!</p>
          </div>
        ) : (
          filteredPlans.map(plan => {
            const creator = getUserById(plan.creatorId)
            return (
              <div key={plan.id} onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }} className="fade-in">
                <PlanCard plan={plan} creatorName={creator?.name || "Unknown"} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const styles = {
  screen:       { paddingBottom: 100, minHeight: "100vh", background: T.bg },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "52px 20px 20px", background: T.card, borderBottom: `1px solid ${T.border}` },
  greeting:     { fontSize: 13, color: T.textMut, marginBottom: 4 },
  heading:      { fontSize: 24, fontWeight: "800", color: T.text, marginBottom: 4, letterSpacing: -0.5 },
  subheading:   { fontSize: 13, color: T.textMut },
  avatar:       { width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 15, flexShrink: 0 },
  filterScroll: { display: "flex", gap: 8, padding: "14px 20px", overflowX: "auto", background: T.card, borderBottom: `1px solid ${T.border}`, scrollbarWidth: "none" },
  filterChip:   { padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" },
  cardList:     { padding: "16px 16px 0" },
  emptyState:   { textAlign: "center", padding: "60px 20px" },
}

export default HomeScreen