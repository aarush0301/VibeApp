import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { ArrowLeft, Pencil, Trash2, Sparkles, Send } from 'lucide-react'
import { T, TYPE_CONFIG, getAvatarColor, formatDate } from '../theme.js'
import { getRatingStats, ratingLabel } from '../ratingUtils.js'
import Stars from './Stars.jsx'
import RateModal from './RateModal.jsx'
import CancelPlanModal from './CancelPlanModal.jsx'

const AIChatPanel = lazy(() => import('./AIChatPanel.jsx'))

const initialsOf = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

function PlanDetailScreen({
  plan, users, currentUserId, onBack,
  onJoinRequest, onCancelRequest,
  onAddItineraryItem, onSendMessage,
  onAcceptRequest, onDeclineRequest,
  onRateHost, onToggleEditor,
  onUpdateItineraryItem, onDeleteItineraryItem,
  onCancelPlan, onOpenProfile,
}) {
  const [activeTab, setActiveTab]             = useState("info")
  const [newItemTime, setNewItemTime]         = useState("")
  const [newItemActivity, setNewItemActivity] = useState("")
  const [newItemNote, setNewItemNote]         = useState("")
  const [showAddItem, setShowAddItem]         = useState(false)
  const [editingId, setEditingId]             = useState(null)
  const [editTime, setEditTime]               = useState("")
  const [editActivity, setEditActivity]       = useState("")
  const [editNote, setEditNote]               = useState("")
  const [chatInput, setChatInput]             = useState("")
  const [showAI, setShowAI]                   = useState(false)
  const [showRate, setShowRate]               = useState(false)
  const [showCancel, setShowCancel]           = useState(false)

  const chatEndRef = useRef(null)
  useEffect(() => {
    if (activeTab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [plan.chat.length, activeTab])

  const getUserById = id =>
    users.find(u => u.id === id) || { id, name: "Unknown", college: "", year: "", vibes: [], ratings: [] }
  const profileTrigger = id => ({
    role: 'button', tabIndex: 0, 'aria-label': `View ${getUserById(id).name}'s profile`,
    onClick: () => onOpenProfile(id),
    onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenProfile(id) } },
  })

  const hasRequested = plan.requestIds.includes(currentUserId)
  const isMember     = plan.memberIds.includes(currentUserId)
  const isCreator    = plan.creatorId === currentUserId
  const spotsLeft    = plan.maxMembers - plan.memberIds.length
  const config       = TYPE_CONFIG[plan.type] || TYPE_CONFIG.Other

  const host      = getUserById(plan.creatorId)
  const hostStats = getRatingStats(host.ratings)
  const canRate   = isMember && !isCreator
  const hasRated  = (host.ratings || []).some(r => r.plan_id === plan.id && r.rater_id === currentUserId)

  const canEditItinerary =
    isCreator ||
    (isMember && plan.itineraryPermission === "all") ||
    (isMember && plan.itineraryPermission === "select" && plan.selectMembers?.includes(currentUserId))

  const handleAddItem = () => {
    if (!newItemTime || !newItemActivity) return
    onAddItineraryItem(plan.id, {
      id: "i" + Date.now(),
      time: newItemTime,
      activity: newItemActivity,
      note: newItemNote,
    })
    setNewItemTime("")
    setNewItemActivity("")
    setNewItemNote("")
    setShowAddItem(false)
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditTime(item.time || "")
    setEditActivity(item.activity || "")
    setEditNote(item.note || "")
  }

  const saveEdit = async () => {
    if (!editTime.trim() || !editActivity.trim()) return
    const ok = await onUpdateItineraryItem(editingId, {
      time: editTime.trim(),
      activity: editActivity.trim(),
      note: editNote.trim(),
    })
    if (ok) setEditingId(null)
  }

  const handleDelete = (item) => {
    if (window.confirm(`Delete "${item.activity}" from the itinerary?`)) {
      onDeleteItineraryItem(item.id)
    }
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    onSendMessage(plan.id, {
      id: "m" + Date.now(),
      userId: currentUserId,
      text: chatInput,
    })
    setChatInput("")
  }

  const tabs = [
    { id: "info",      label: "Info" },
    { id: "members",   label: "Members" },
    { id: "itinerary", label: "Itinerary" },
    ...(isMember ? [{ id: "chat", label: "Chat" }] : []),
  ]

  return (
    <section className="app-page detail-page">

      {/* Back */}
      <button onClick={onBack} className="detail-back tap">
        <ArrowLeft size={18} /> Back to plans
      </button>

      {/* Header */}
      <div className="detail-header" style={{ background: config.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: "700", padding: "5px 12px", borderRadius: 20, background: config.bg, color: config.color }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.dot, display: "inline-block" }} />
            {plan.type}
          </span>
          <span style={{ fontSize: 12, color: T.textMut }}>{plan.isPublic ? "Public" : "Friends only"}</span>
        </div>
        <h1>{plan.title}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[plan.location, formatDate(plan.date), plan.time || "Time TBD"].map(pill => (
            <span key={pill} style={styles.pill}>{pill}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs" role="tablist" aria-label="Plan details">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            id={`detail-${tab.id}`}
            aria-controls="detail-content"
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={event => {
              const index = tabs.findIndex(item => item.id === tab.id)
              const nextIndex = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
              if (nextIndex !== null) { event.preventDefault(); setActiveTab(tabs[nextIndex].id); document.getElementById(`detail-${tabs[nextIndex].id}`)?.focus() }
            }}
            className="tab-btn"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div id="detail-content" role="tabpanel" aria-labelledby={`detail-${activeTab}`} className="detail-content">

        {/* ═════ INFO ═════ */}
        {activeTab === "info" && (
          <div>
            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.65, marginBottom: 20 }}>{plan.description}</p>

            <div className="detail-facts">
              {[
                ["Type",       plan.type,                                      config.bg,                                                         config.color],
                ["Members",    `${plan.memberIds.length}/${plan.maxMembers}`,  T.lavender,                                         T.purple],
                ["Spots left", spotsLeft,                                      spotsLeft <= 2 ? T.peach : T.success, spotsLeft <= 2 ? T.orange : T.green],
                ["Visibility", plan.isPublic ? "Public" : "Friends only",      T.raised,                                          T.textSec],
              ].map(([label, value]) => (
                <div key={label} className="detail-fact">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            {/* Host card */}
            <div style={styles.card}>
              <div {...profileTrigger(host.id)} className="tap" style={{ flex: 1, cursor: "pointer" }}>
                <div style={styles.cardLabel}>Created by</div>
                <div style={{ fontSize: 15, fontWeight: "700", color: T.text }}>{host.name}</div>
                <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>{host.college}</div>
                <div style={{ marginTop: 8 }}>
                  {hostStats ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Stars score={hostStats.avg} size={13} />
                      <span style={{ fontSize: 12, fontWeight: "700", color: T.yellow }}>{hostStats.avg}</span>
                      <span style={{ fontSize: 11, color: T.textMut }}>({hostStats.count})</span>
                      <span style={styles.ratingTag}>{ratingLabel(hostStats.avg)}</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: T.textMut }}>No ratings yet</span>
                  )}
                </div>
              </div>
              {canRate && (
                hasRated
                  ? <span style={{ fontSize: 11, color: T.green, background: T.success, padding: "5px 12px", borderRadius: 12, fontWeight: "700" }}>Rated</span>
                  : <button onClick={() => setShowRate(true)} className="tap" style={styles.rateBtn}>Rate host</button>
              )}
            </div>

            {plan.tags?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={styles.cardLabel}>Looking for</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {plan.tags.map(tag => (
                    <span key={tag} style={{ background: T.lavender, color: T.purple, fontSize: 12, padding: "5px 12px", borderRadius: 20, fontWeight: "500" }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {isCreator && <div style={styles.infoBox(T.lavender, T.purple)}>You created this plan</div>}
            {isCreator && (
              <button onClick={() => setShowCancel(true)} className="tap" style={styles.dangerBtn}>
                Cancel this plan
              </button>
            )}
            {isMember && !isCreator && <div style={styles.infoBox(T.success, T.green)}>You're in this plan</div>}

            {hasRequested && !isMember && (
              <div>
                <div style={styles.infoBox("#FAEDCB", T.yellow)}>Request pending, waiting for the creator to accept</div>
                <button onClick={() => onCancelRequest(plan.id)} className="tap" style={styles.cancelBtn}>Cancel request</button>
              </div>
            )}

            {!isMember && !hasRequested && !isCreator && spotsLeft > 0 && (
              <button onClick={() => onJoinRequest(plan.id)} className="tap" style={styles.joinBtn}>Request to join</button>
            )}

            {!isMember && !hasRequested && spotsLeft === 0 && (
              <div style={styles.infoBox(T.raised, T.textSec)}>This plan is full</div>
            )}
          </div>
        )}

        {/* ═════ MEMBERS ═════ */}
        {activeTab === "members" && (
          <div>
            <p style={{ ...styles.cardLabel, marginBottom: 14 }}>
              {plan.memberIds.length} member{plan.memberIds.length !== 1 ? "s" : ""}
            </p>

            {plan.memberIds.map(uid => {
              const u       = getUserById(uid)
              const stats   = getRatingStats(u.ratings)
              const canEdit = plan.selectMembers?.includes(uid)
              return (
                <div key={uid} style={styles.row}>
                  <div {...profileTrigger(uid)} style={{ ...styles.memberAvatar, background: getAvatarColor(u.name), cursor: "pointer" }}>
                    {initialsOf(u.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: "700", color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                      {u.name}
                      {uid === plan.creatorId && (
                        <span style={{ fontSize: 10, background: T.lavender, color: T.purple, padding: "2px 8px", borderRadius: 10, fontWeight: "700" }}>Admin</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>
                      {u.college}{u.year ? ` · ${u.year} yr` : ""}
                    </div>
                    <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                      {stats ? (
                        <>
                          <Stars score={stats.avg} size={11} />
                          <span style={{ fontSize: 11, fontWeight: "700", color: T.yellow }}>{stats.avg}</span>
                          <span style={{ fontSize: 10, color: T.textMut }}>({stats.count})</span>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: T.textMut }}>No ratings yet</span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {u.vibes?.slice(0, 2).map(v => (
                        <span key={v} style={{ fontSize: 11, background: T.raised, color: T.textSec, padding: "2px 9px", borderRadius: 10 }}>{v}</span>
                      ))}
                    </div>
                  </div>

                  {/* Creator toggles who can edit the itinerary (select mode only) */}
                  {isCreator && plan.itineraryPermission === "select" && uid !== plan.creatorId && (
                    <button
                      onClick={() => onToggleEditor(plan.id, uid, !canEdit)}
                      className="tap"
                      style={{
                        flexShrink: 0, padding: "7px 12px", borderRadius: 12, fontSize: 11, fontWeight: "700", fontFamily: "inherit", cursor: "pointer", border: "none",
                        background: canEdit ? T.success : T.raised,
                        color:      canEdit ? T.green : T.textMut,
                      }}
                    >
                      {canEdit ? "Can edit" : "Can't edit"}
                    </button>
                  )}
                </div>
              )
            })}

            {isCreator && plan.requestIds.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ ...styles.cardLabel, color: T.yellow, marginBottom: 12 }}>
                  {plan.requestIds.length} pending request{plan.requestIds.length !== 1 ? "s" : ""}
                </p>
                {plan.requestIds.map(uid => {
                  const u = getUserById(uid)
                  return (
                    <div key={uid} style={{ display: "flex", alignItems: "center", gap: 12, background: "#FAEDCB", borderRadius: 18, padding: 12, marginBottom: 10 }}>
                      <div {...profileTrigger(uid)} style={{ ...styles.memberAvatar, background: getAvatarColor(u.name), cursor: "pointer" }}>
                        {initialsOf(u.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
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
        )}

        {/* ═════ ITINERARY ═════ */}
        {activeTab === "itinerary" && (
          <div>
            <p style={{ fontSize: 12, color: T.textMut, marginBottom: 18, fontStyle: "italic" }}>
              {plan.itineraryPermission === "all"
                ? "All members can edit"
                : plan.itineraryPermission === "creator"
                ? "Only the creator can edit"
                : "Members picked by the creator can edit"}
            </p>

            {plan.itinerary.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textMut, fontSize: 14 }}>
                {canEditItinerary ? "No items yet. Add the first one below." : "No itinerary items yet."}
              </div>
            ) : plan.itinerary.map((item, index) => (
              editingId === item.id ? (
                <div key={item.id} style={{ background: T.card, borderRadius: 18, padding: 14, display: "flex", flexDirection: "column", gap: 8, boxShadow: `0 0 0 1.5px ${T.orange}`, marginBottom: 12 }}>
                  <input value={editTime}     onChange={e => setEditTime(e.target.value)}     placeholder="Time"            style={styles.input} />
                  <input value={editActivity} onChange={e => setEditActivity(e.target.value)} placeholder="Activity *"      style={styles.input} />
                  <input value={editNote}     onChange={e => setEditNote(e.target.value)}     placeholder="Note (optional)" style={styles.input} />
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={saveEdit} className="tap" style={styles.joinBtn}>Save</button>
                    <button onClick={() => setEditingId(null)} className="tap" style={{ ...styles.cancelBtn, marginTop: 0 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 75, display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, paddingTop: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: "700", color: T.orange, whiteSpace: "nowrap" }}>{item.time}</span>
                    {index < plan.itinerary.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: T.raised, marginTop: 6, minHeight: 24, borderRadius: 1 }} />
                    )}
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.orange, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: "600", color: T.text }}>{item.activity}</div>
                    {item.note && <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>{item.note}</div>}
                  </div>
                  {canEditItinerary && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => startEdit(item)} className="tap" style={styles.iconBtn} aria-label="Edit item">
                        <Pencil size={14} color={T.textSec} />
                      </button>
                      <button onClick={() => handleDelete(item)} className="tap" style={styles.iconBtn} aria-label="Delete item">
                        <Trash2 size={14} color={T.orange} />
                      </button>
                    </div>
                  )}
                </div>
              )
            ))}

            {canEditItinerary && (
              <div style={{ marginTop: 20 }}>
                {!showAddItem ? (
                  <button onClick={() => setShowAddItem(true)} className="tap" style={styles.addItemBtn}>
                    + Add item
                  </button>
                ) : (
                  <div style={{ background: T.card, borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    <input value={newItemTime}     onChange={e => setNewItemTime(e.target.value)}     placeholder="Time (e.g. 9:00 AM)" style={styles.input} />
                    <input value={newItemActivity} onChange={e => setNewItemActivity(e.target.value)} placeholder="Activity *"           style={styles.input} />
                    <input value={newItemNote}     onChange={e => setNewItemNote(e.target.value)}     placeholder="Note (optional)"      style={styles.input} />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button onClick={handleAddItem} className="tap" style={styles.joinBtn}>Add</button>
                      <button onClick={() => setShowAddItem(false)} className="tap" style={{ ...styles.cancelBtn, marginTop: 0 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═════ CHAT ═════ */}
        {activeTab === "chat" && isMember && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {plan.chat.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: T.textMut, fontSize: 14 }}>No messages yet. Say hi.</div>
              )}
              {plan.chat.map(msg => {
                const isMe   = msg.userId === currentUserId
                const sender = getUserById(msg.userId)
                return (
                  <div key={msg.id} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
                    {!isMe && (
                      <div {...profileTrigger(msg.userId)} style={{ ...styles.memberAvatar, width: 36, height: 36, fontSize: 11, background: getAvatarColor(sender.name), cursor: "pointer" }}>
                        {initialsOf(sender.name)}
                      </div>
                    )}
                    <div style={{ maxWidth: "72%" }}>
                      {!isMe && <div style={{ fontSize: 11, color: T.textMut, marginBottom: 3 }}>{sender.name.split(" ")[0]}</div>}
                      <div style={{
                        padding: "10px 14px", fontSize: 14, lineHeight: 1.6, color: isMe ? T.onAccent : T.text, overflowWrap: 'anywhere',
                        background:   isMe ? T.gradient : T.card,
                        borderRadius: isMe ? "20px 6px 20px 20px" : "6px 20px 20px 20px",
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: 10, color: T.textMut, marginTop: 3, textAlign: isMe ? "right" : "left" }}>{msg.time}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="Message..."
                aria-label="Message the group"
                style={{ ...styles.input, flex: 1, margin: 0, borderRadius: 22 }}
              />
              <button
                onClick={handleSendMessage}
                className="send-tap"
                style={{ width: 42, height: 42, borderRadius: "50%", background: T.gradient, border: "none", color: "#fff", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: T.glow }}
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating AI button */}
      <button onClick={() => setShowAI(true)} className="ai-launch tap">
        <Sparkles size={15} /> AI Assistant
      </button>

      {showRate && (
        <RateModal
          hostName={host.name}
          onClose={() => setShowRate(false)}
          onSubmit={(score, comment) => onRateHost(plan.id, plan.creatorId, score, comment)}
        />
      )}

      {showCancel && (
        <CancelPlanModal
          plan={plan}
          notifyCount={Math.max(plan.memberIds.length - 1, 0) + plan.requestIds.length}
          onClose={() => setShowCancel(false)}
          onConfirm={(note) => onCancelPlan(plan.id, note)}
        />
      )}

      {showAI && (
        <Suspense fallback={null}>
          <AIChatPanel plan={plan} onClose={() => setShowAI(false)} />
        </Suspense>
      )}
    </section>
  )
}

const styles = {
  pill:        { fontSize: 12, color: T.textSec, background: T.raised, padding: "6px 12px", borderRadius: 20 },
  card:        { background: T.card, borderRadius: 20, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, boxShadow: T.shadow },
  cardLabel:   { fontSize: 11, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: "700", marginBottom: 4 },
  ratingTag:   { fontSize: 10, background: "#FAEDCB", color: T.yellow, padding: "2px 8px", borderRadius: 10, fontWeight: "700" },
  rateBtn:     { background: "#FAEDCB", color: "#1A1305", border: "none", borderRadius: 14, padding: "9px 14px", fontSize: 12, fontWeight: "800", fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" },
  infoBox:     (bg, color) => ({ padding: "14px 16px", borderRadius: 16, fontSize: 14, fontWeight: "600", marginBottom: 12, background: bg, color }),
  joinBtn:     { width: "100%", padding: 14, borderRadius: 16, border: "none", background: T.gradient, color: "#fff", fontSize: 15, fontWeight: "800", fontFamily: "inherit", cursor: "pointer", boxShadow: T.glow },
  cancelBtn:   { width: "100%", padding: 13, borderRadius: 16, border: "none", background: T.raised, color: T.textSec, fontSize: 14, fontWeight: "600", fontFamily: "inherit", cursor: "pointer", marginTop: 8 },
  dangerBtn:   { width: "100%", padding: 13, borderRadius: 16, border: `1px solid ${T.danger}`, background: "transparent", color: T.danger, fontSize: 14, fontWeight: "700", fontFamily: "inherit", cursor: "pointer", marginTop: 4 },
  row:         { display: "flex", alignItems: "center", gap: 12, padding: "14px 4px", borderBottom: `1px solid ${T.border}` },
  memberAvatar:{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: 13, flexShrink: 0 },
  acceptBtn:   { background: T.green, color: T.onAccent, border: "none", borderRadius: 12, padding: "7px 12px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: "800" },
  declineBtn:  { background: "transparent", color: T.orange, border: `1px solid ${T.chip}`, borderRadius: 12, padding: "7px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: "600" },
  iconBtn:     { background: T.raised, border: "none", borderRadius: 10, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  addItemBtn:  { width: "100%", padding: 13, borderRadius: 16, border: `1.5px dashed ${T.orange}`, background: "transparent", color: T.orange, fontSize: 14, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  input:       { padding: "11px 14px", borderRadius: 14, border: "1.5px solid transparent", background: T.muted, fontSize: 16, fontFamily: "inherit", width: "100%", boxSizing: "border-box", color: T.text },
}

export default PlanDetailScreen
