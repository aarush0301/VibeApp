import { useState } from 'react'
import { T, getAvatarColor } from '../theme.js'
import { getDistanceKm, getUserLocation } from '../locationUtils.js'
import { getRatingStats } from '../ratingUtils.js'
import { MapPin, Compass, Bell} from 'lucide-react'
import PlanCard from './PlanCard.jsx'

const FILTERS   = ["All", "Party", "Trip", "Outing", "Food Run", "Sports", "Study Sesh"]
const DISTANCES = [
  { label: "Any distance", value: null },
  { label: "5 km",  value: 5 },
  { label: "15 km", value: 15 },
  { label: "50 km", value: 50 },
]

function HomeScreen({ plans, users, onOpenPlan, currentUserId, unreadCount, onOpenNotifications  }) {
  const [activeFilter, setActiveFilter]     = useState("All")
  const [maxDistance, setMaxDistance]       = useState(null)
  const [userLocation, setUserLocation]     = useState(null)
  const [locationStatus, setLocationStatus] = useState("idle")

  const currentUser  = users.find(u => u.id === currentUserId)
  const getFirstName = () => currentUser?.name?.split(" ")[0] || "there"
  const getGreeting  = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }
  const initials = currentUser?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??"
  const getUserById = id => users.find(u => u.id === id)

  const requestLocation = async () => {
    setLocationStatus("asking")
    const loc = await getUserLocation()
    if (loc) { setUserLocation(loc); setLocationStatus("granted") }
    else setLocationStatus("denied")
  }

  const plansWithDistance = plans.map(plan => ({
    ...plan,
    distance: userLocation && plan.latitude && plan.longitude
      ? getDistanceKm(userLocation.lat, userLocation.lng, plan.latitude, plan.longitude)
      : null,
  }))

  let filtered = activeFilter === "All" ? plansWithDistance : plansWithDistance.filter(p => p.type === activeFilter)

  if (maxDistance && userLocation) {
    filtered = filtered.filter(p => p.distance !== null && p.distance <= maxDistance)
  }
  if (userLocation) {
    filtered = [...filtered].sort((a, b) => {
      if (a.distance === null) return 1
      if (b.distance === null) return -1
      return a.distance - b.distance
    })
  }

  const Chip = ({ label, active, onClick, gradient }) => (
    <button
      onClick={onClick}
      className="chip-tap"
      style={{
        ...styles.chip,
        background: active ? gradient : "rgba(255,255,255,0.06)",
        color:      active ? "#fff" : T.textSec,
        fontWeight: active ? "700" : "500",
        boxShadow:  active ? "0 4px 14px rgba(0,0,0,0.3)" : "none",
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>{getGreeting()} 👋</p>
          <h1 style={styles.heading}>Hey, {getFirstName()}</h1>
          <p style={styles.subheading}>{filtered.length} plan{filtered.length !== 1 ? "s" : ""} near you</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onOpenNotifications} className="tap" style={styles.bell} aria-label="Notifications">
           <Bell size={20} color={T.textSec} />
             {unreadCount > 0 && <span style={styles.bellBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
               </button>
                 <div style={{ ...styles.avatar, background: getAvatarColor(currentUser?.name || "x") }}>{initials}</div>
</div>
            </div>

      {locationStatus === "idle" && (
        <div style={styles.locationCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MapPin size={18} color={T.orange} />
            <span style={{ fontSize: 13, color: T.textSec }}>See plans closest to you</span>
          </div>
          <button onClick={requestLocation} className="tap" style={styles.locationBtn}>Enable</button>
        </div>
      )}
      {locationStatus === "asking" && <p style={styles.note}>Waiting for permission...</p>}
      {locationStatus === "denied" && <p style={styles.note}>Location is off, showing all plans.</p>}

      <div style={styles.chipRow}>
        {FILTERS.map(f => (
          <Chip key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} gradient={T.gradient} />
        ))}
      </div>

      {userLocation && (
        <div style={styles.chipRow}>
          {DISTANCES.map(d => (
            <Chip key={d.label} label={d.label} active={maxDistance === d.value} onClick={() => setMaxDistance(d.value)} gradient={T.gradientPurple} />
          ))}
        </div>
      )}

      <div style={styles.cardList}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 44, marginBottom: 12 }}>🌴</p>
            <p style={{ fontSize: 16, fontWeight: "700", color: T.text }}>Nothing here yet</p>
            <p style={{ fontSize: 13, color: T.textMut, marginTop: 4 }}>Try another filter, or create the first plan.</p>
          </div>
        ) : filtered.map(plan => {
          const creator = getUserById(plan.creatorId)
          return (
            <div key={plan.id} onClick={() => onOpenPlan(plan)} style={{ cursor: "pointer" }}>
              <PlanCard
                plan={plan}
                creatorName={creator?.name || "Unknown"}
                distance={plan.distance}
                creatorRating={getRatingStats(creator?.ratings)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  screen:       { paddingBottom: 120, minHeight: "100vh", background: "radial-gradient(ellipse at 50% -10%, rgba(139,124,255,0.22) 0%, transparent 55%), #0E0B1A" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "56px 22px 18px" },
  greeting:     { fontSize: 13, color: T.textMut, marginBottom: 4 },
  heading:      { fontSize: 30, fontWeight: "800", color: T.text, marginBottom: 4, letterSpacing: -0.8 },
  subheading:   { fontSize: 13, color: T.textSec },
  avatar:       { width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: 15, flexShrink: 0, boxShadow: "0 0 0 3px rgba(255,255,255,0.08)" },
  locationCard: { margin: "0 16px 14px", padding: "12px 14px 12px 16px", borderRadius: 20, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  locationBtn:  { background: T.gradient, color: "#fff", border: "none", borderRadius: 16, padding: "7px 16px", fontSize: 12, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  note:         { fontSize: 12, color: T.textMut, padding: "0 22px 12px" },
  chipRow:      { display: "flex", gap: 8, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" },
  chip:         { padding: "8px 16px", borderRadius: 20, border: "none", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit", transition: "all 0.15s" },
  cardList:     { padding: "6px 16px 0" },
  empty:        { textAlign: "center", padding: "60px 20px" },
  bell:          { position: "relative", width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  bellBadge: { position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: T.orange, color: "#fff", fontSize: 10, fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" },
}

export default HomeScreen