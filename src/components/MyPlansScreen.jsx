import { useRef, useState } from 'react'
import { T, getAvatarColor } from '../theme.js'
import { getRatingStats } from '../ratingUtils.js'
import PlanCard from './PlanCard.jsx'
import { CalendarDays, Plus } from 'lucide-react'

const initialsOf = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

function MyPlansScreen({
  plans, users, currentUserId,
  onOpenPlan, onAcceptRequest, onDeclineRequest, onOpenProfile, onCreatePlan, onDiscover,
}) {
  const getUserById = id =>
    users.find(u => u.id === id) || { id, name: "Unknown", college: "", year: "", ratings: [] }

  const createdPlans = plans.filter(p => p.creatorId === currentUserId)
  const joinedPlans  = plans.filter(p => p.memberIds.includes(currentUserId) && p.creatorId !== currentUserId)
  const totalPending = createdPlans.reduce((total, p) => total + p.requestIds.length, 0)
  const [activeTab, setActiveTab] = useState(() => createdPlans.length || !joinedPlans.length ? 'created' : 'joined')
  const tabRefs = useRef({})
  const visiblePlans = activeTab === 'created' ? createdPlans : joinedPlans
  const tabs = [
    { id: 'created', label: 'Created', count: createdPlans.length },
    { id: 'joined', label: 'Joined', count: joinedPlans.length },
  ]

  const selectTab = id => {
    setActiveTab(id)
    tabRefs.current[id]?.focus()
  }

  const handleTabKeyDown = event => {
    let next
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') next = activeTab === 'created' ? 'joined' : 'created'
    if (event.key === 'Home') next = 'created'
    if (event.key === 'End') next = 'joined'
    if (next) {
      event.preventDefault()
      selectTab(next)
    }
  }

  return (
    <section className="app-page">
      <div className="page-header">
        <div><h1 className="page-heading">Your social calendar.</h1><p className="page-description">The plans you’re making and the ones you’re joining.</p></div>
        {totalPending > 0 && (
          <button
            type="button"
            onClick={() => selectTab('created')}
            aria-label={`View ${totalPending} join request${totalPending === 1 ? '' : 's'}`}
            className="tap"
            style={styles.pendingButton}
          >
            {totalPending} request{totalPending === 1 ? '' : 's'}
          </button>
        )}
      </div>

      <div role="tablist" aria-label="Your plans" className="plans-tabs" onKeyDown={handleTabKeyDown}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            ref={element => { tabRefs.current[tab.id] = element }}
            id={`myplans-${tab.id}-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`myplans-${tab.id}-panel`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            className="plans-tab tab-btn"
          >
            {tab.label}<span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div
          key={tab.id}
          id={`myplans-${tab.id}-panel`}
          role="tabpanel"
          aria-labelledby={`myplans-${tab.id}-tab`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
          className={activeTab === tab.id ? 'plan-grid' : undefined}
        >
          {activeTab === tab.id && (visiblePlans.length ? visiblePlans.map(plan => {
            const creator = getUserById(plan.creatorId)
            return (
              <div key={plan.id} className="plan-entry">
                <div role="button" tabIndex={0} aria-label={`Open ${plan.title}`} className="plan-link" onClick={() => onOpenPlan(plan)} onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpenPlan(plan)
                  }
                }}>
                  <PlanCard
                    plan={plan}
                    creatorName={creator.name}
                    creatorRating={getRatingStats(creator.ratings)}
                    participation={activeTab}
                  />
                </div>

                {activeTab === 'created' && plan.requestIds.length > 0 && (
                  <div style={styles.requestsBox}>
                    <p style={styles.requestsTitle}>
                      {plan.requestIds.length} request{plan.requestIds.length !== 1 ? 's' : ''} waiting
                    </p>
                    {plan.requestIds.map(uid => {
                      const u = getUserById(uid)
                      return (
                        <div key={uid} style={styles.requestRow}>
                          <button type="button" onClick={() => onOpenProfile(uid)} aria-label={`View ${u.name}’s profile`} className="tap" style={styles.requester}>
                            <span style={{ ...styles.avatar, background: getAvatarColor(u.name) }}>{initialsOf(u.name)}</span>
                            <span style={{ minWidth: 0 }}>
                              <span style={styles.requesterName}>{u.name}</span>
                              <span style={styles.requesterCollege}>{u.college}{u.year ? ` · ${u.year} yr` : ''}</span>
                            </span>
                          </button>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={() => onAcceptRequest(plan.id, uid)} aria-label={`Accept ${u.name}’s request`} className="tap" style={styles.acceptBtn}>Accept</button>
                            <button type="button" onClick={() => onDeclineRequest(plan.id, uid)} aria-label={`Decline ${u.name}’s request`} className="tap" style={styles.declineBtn}>Decline</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }) : (
            <div className="empty-state">
              <CalendarDays size={36} strokeWidth={1.5} />
              <h2>{activeTab === 'created' ? 'Good times start with a plan.' : 'Your next hangout is out there.'}</h2>
              <p>
                {activeTab === 'created' ? 'Coffee, a game, a weekend away. Put an idea out there and bring your people together.' : 'Explore what’s happening and find a plan that feels like you.'}
              </p>
              <button type="button" className="primary-button" onClick={activeTab === 'created' ? onCreatePlan : onDiscover}>{activeTab === 'created' && <Plus size={17} />}{activeTab === 'created' ? 'Create a plan' : 'Explore plans'}</button>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

const styles = {
  pendingButton: { background: "none", border: "none", borderRadius: 8, padding: "8px 4px", minHeight: 44, color: T.yellow, fontSize: 13, fontWeight: "600", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 },
  requestsBox:   { padding: "4px 4px 12px", marginBottom: 20, borderBottom: `1px solid ${T.border}` },
  requestsTitle: { fontSize: 13, fontWeight: "600", color: T.text, marginBottom: 12 },
  requestRow:    { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  requester:     { flex: "1 1 144px", minWidth: 0, minHeight: 44, display: "flex", alignItems: "center", gap: 10, padding: 0, background: "none", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" },
  requesterName: { display: "block", fontSize: 13, fontWeight: "600", color: T.text, overflowWrap: "anywhere" },
  requesterCollege: { display: "block", fontSize: 12, color: T.textMut, marginTop: 2, overflowWrap: "anywhere" },
  avatar:        { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: T.bg, fontWeight: "700", fontSize: 12, flexShrink: 0 },
  acceptBtn:     { background: T.orange, color: T.bg, border: "none", borderRadius: 8, minHeight: 44, padding: "8px 12px", fontSize: 12, cursor: "pointer", fontWeight: "700" },
  declineBtn:    { background: "transparent", color: T.textSec, border: `1px solid ${T.chip}`, borderRadius: 8, minHeight: 44, padding: "8px 10px", fontSize: 12, cursor: "pointer", fontWeight: "600" },
}

export default MyPlansScreen
