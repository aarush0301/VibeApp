import { useState, useEffect } from 'react'
import { getRatingStats } from '../ratingUtils.js'
import { T, getAvatarColor } from '../theme.js'
import { getDistanceKm, getUserLocation } from '../locationUtils.js'
import PlanCard from './PlanCard.jsx'

const FILTERS   = ["All", "Party", "Trip", "Outing", "Food Run", "Sports", "Study Sesh"]
const DISTANCES = [
  { label: "Any distance", value: null },
  { label: "Within 5 km",  value: 5 },
  { label: "Within 15 km", value: 15 },
  { label: "Within 50 km", value: 50 },
]

function HomeScreen({ plans, users, onOpenPlan, currentUserId }) {
  const [activeFilter, setActiveFilter]     = useState("All")
  const [maxDistance, setMaxDistance]       = useState(null)
  const [userLocation, setUserLocation]     = useState(null)
  const [locationStatus, setLocationStatus] = useState("idle") // idle | asking | granted | denied

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

  const requestLocation = async () => {
    setLocationStatus("asking")
    const loc = await getUserLocation()
    if (loc) {
      setUserLocation(loc)
      setLocationStatus("granted")
    } else {
      setLocationStatus("denied")
    }
  }

  // Attach a distance number to every plan (or null if we can't calculate it)
  const plansWithDistance = plans.map(plan => {
    const distance = userLocation && plan.latitude && plan.longitude
      ? getDistanceKm(userLocation.lat, userLocation.lng, plan.latitude, plan.longitude)
      : null
    return { ...plan, distance }
  })

  // Apply type filter
  let filteredPlans = activeFilter === "All"
    ? plansWithDistance
    : plansWithDistance.filter(p => p.type === activeFilter)

  // Apply distance filter — only if user granted location and picked a max distance
  if (maxDistance && userLocation) {
    filteredPlans = filteredPlans.filter(p => p.distance !== null && p.distance <= maxDistance)
  }

  // Sort by distance when we have it, closest first
  if (userLocation) {
    filteredPlans = [...filteredPlans].sort((a, b) => {
      if (a.distance === null) return 1
      if (b.distance === null) return -1
      return a.distance - b.distance
    })
  }

  const getUserById = id => users.find(u => u.id === id)

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

      {/* Location prompt */}
      {locationStatus === "idle" && (
        <div style={styles.locationPrompt}>
          <span style={{ fontSize: 13, color: T.textSec }}>📍 See plans sorted by distance</span>
          <button onClick={requestLocation} className="tap" style={styles.locationBtn}>
            Enable Location
          </button>
        </div>
      )}
      {locationStatus === "asking" && (
        <div style={styles.locationPrompt}>
          <span style={{ fontSize: 13, color: T.textMut }}>Waiting for permission...</span>
        </div>
      )}
      {locationStatus === "denied" && (
        <div style={styles.locationPrompt}>
          <span style={{ fontSize: 13, color: T.textMut }}>📍 Location access denied — showing all plans</span>
        </div>
      )}

      {/* Type filters */}
      <div style={styles.filterScroll}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} className="chip-tap" style={{
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

      {/* Distance filters — only show once location is granted */}
      {userLocation && (
        <div style={styles.filterScroll}>
          {DISTANCES.map(d => (
            <button key={d.label} onClick={() => setMaxDistance(d.value)} className="chip-tap" style={{
              ...styles.filterChip,
              background: maxDistance === d.value ? T.purple  : T.card,
              color:      maxDistance === d.value ? "#ffffff" : T.textSec,
              border:     maxDistance === d.value ? `1.5px solid ${T.purple}` : `1.5px solid ${T.border}`,
              fontWeight: maxDistance === d.value ? "700" : "400",
            }}>
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      <div style={styles.cardList}>
        {filteredPlans.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🌴</p>
            <p style={{ fontSize: 15, fontWeight: "600", color: T.text }}>No plans match your filters</p>
            <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>Try a wider distance or different type!</p>
          </div>
        ) : (
          filteredPlans.map(plan => {
            const creator = getUserById(plan.creatorId)
            return (
              <div key={plan.id} onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }} className="fade-in">
                <PlanCard plan={plan} creatorName={creator?.name || "Unknown"} distance={plan.distance} creatorRating={getRatingStats(creator?.ratings)} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const styles = {
  screen:          { paddingBottom: 100, minHeight: "100vh", background: T.bg },
  header:          { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "52px 20px 20px", background: T.card, borderBottom: `1px solid ${T.border}` },
  greeting:        { fontSize: 13, color: T.textMut, marginBottom: 4 },
  heading:         { fontSize: 24, fontWeight: "800", color: T.text, marginBottom: 4, letterSpacing: -0.5 },
  subheading:      { fontSize: 13, color: T.textMut },
  avatar:          { width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 15, flexShrink: 0 },
  locationPrompt:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: T.card, borderBottom: `1px solid ${T.border}` },
  locationBtn:     { background: T.orange, color: "#fff", border: "none", borderRadius: 16, padding: "6px 14px", fontSize: 12, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  filterScroll:    { display: "flex", gap: 8, padding: "14px 20px", overflowX: "auto", background: T.card, borderBottom: `1px solid ${T.border}`, scrollbarWidth: "none" },
  filterChip:      { padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" },
  cardList:        { padding: "16px 16px 0" },
  emptyState:      { textAlign: "center", padding: "60px 20px" },
}

export default HomeScreen
