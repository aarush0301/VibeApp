import { useState } from 'react'
import { getAvatarColor } from '../theme.js'
import { getDistanceKm, getUserLocation } from '../locationUtils.js'
import { getRatingStats } from '../ratingUtils.js'
import { MapPin, Bell, Plus, Compass, ArrowUpRight } from 'lucide-react'
import PlanCard from './PlanCard.jsx'
import ActivityIcon from './ActivityIcon.jsx'

const FILTERS   = ["All", "Party", "Trip", "Outing", "Food Run", "Sports", "Study Sesh"]
const DISTANCES = [
  { label: "Any distance", value: null },
  { label: "5 km",  value: 5 },
  { label: "15 km", value: 15 },
  { label: "50 km", value: 50 },
]

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="filter-chip chip-tap"
    >
      {label}
    </button>
  )
}

function HomeScreen({ plans, users, onOpenPlan, currentUserId, unreadCount, onOpenNotifications, onCreatePlan }) {
  const [activeFilter, setActiveFilter]     = useState("All")
  const [maxDistance, setMaxDistance]       = useState(null)
  const [userLocation, setUserLocation]     = useState(null)
  const [locationStatus, setLocationStatus] = useState("idle")

  const currentUser  = users.find(u => u.id === currentUserId)
  const getFirstName = () => currentUser?.name?.split(" ")[0] || "there"
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
    distance: userLocation && plan.latitude != null && plan.longitude != null
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

  return (
    <section className="app-page">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Hey, {getFirstName()}.</h1>
          <p className="page-description">What’s the plan today?</p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={onOpenNotifications} className="icon-button tap" aria-label="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
          <div className="avatar" style={{ background: getAvatarColor(currentUser?.name || "x") }} aria-label={currentUser?.name || 'Your profile'}>{initials}</div>
        </div>
      </div>

      <div className="welcome-strip">
        <div><h2>Good plans. Great company.</h2><p>A coffee break, a weekend out, or something spontaneous. Find your people, one plan at a time.</p></div>
        <button type="button" onClick={onCreatePlan} className="primary-button tap"><Plus size={17} />Create a plan<ArrowUpRight size={17} /></button>
      </div>
      <div className="discovery-controls">
        <h2>Find your next hangout</h2>
        {locationStatus === 'idle' && <button type="button" onClick={requestLocation} className="location-control tap"><MapPin size={15} />Near me</button>}
      </div>
      {locationStatus === "asking" && <p className="results-count" role="status">Waiting for location permission…</p>}
      {locationStatus === "denied" && <p className="results-count">Location is off. You can still explore every plan.</p>}

      <div className="filter-row" role="group" aria-label="Filter plans by activity">
        {FILTERS.map(f => (
          <Chip key={f} label={<><ActivityIcon type={f} />{f === 'All' ? 'All plans' : f}</>} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
        ))}
      </div>

      {userLocation && (
        <div className="filter-row" role="group" aria-label="Filter by distance">
          {DISTANCES.map(d => (
            <Chip key={d.label} label={d.label} active={maxDistance === d.value} onClick={() => setMaxDistance(d.value)} />
          ))}
        </div>
      )}
      <p className="results-count" aria-live="polite">{filtered.length} plan{filtered.length !== 1 ? 's' : ''} to explore</p>
      <div className="plan-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Compass size={36} strokeWidth={1.5} />
            <h2>A little quiet here.</h2>
            <p>Try another filter, or get the crew together with a plan of your own.</p>
            <button type="button" onClick={onCreatePlan} className="primary-button"><Plus size={17} />Create a plan</button>
          </div>
        ) : filtered.map(plan => {
          const creator = getUserById(plan.creatorId)
          return (
            <div
              key={plan.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${plan.title}`}
              className="plan-link"
              onClick={() => onOpenPlan(plan)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpenPlan(plan)
                }
              }}
            >
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
    </section>
  )
}

export default HomeScreen
