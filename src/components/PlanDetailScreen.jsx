import { useState } from 'react'
import { users } from '../data.js'
import { T, TYPE_CONFIG, getAvatarColor } from '../theme.js'
import AIChatPanel from './AIChatPanel.jsx'

function PlanDetailScreen({ plan, currentUserId, onBack, onJoinRequest, onCancelRequest, onAddItineraryItem, onSendMessage, onAcceptRequest, onDeclineRequest }) {
  const [activeTab, setActiveTab]             = useState("info")
  const [newItemTime, setNewItemTime]         = useState("")
  const [newItemActivity, setNewItemActivity] = useState("")
  const [newItemNote, setNewItemNote]         = useState("")
  const [showAddItem, setShowAddItem]         = useState(false)
  const [chatInput, setChatInput]             = useState("")
  const [showAI, setShowAI]                   = useState(false)

  const hasRequested = plan.requestIds.includes(currentUserId)
  const isMember     = plan.memberIds.includes(currentUserId)
  const isCreator    = plan.creatorId === currentUserId
  const spotsLeft    = plan.maxMembers - plan.memberIds.length
  const config       = TYPE_CONFIG[plan.type] || TYPE_CONFIG.Other

  const canEditItinerary =
    isCreator ||
    plan.itineraryPermission === "all" ||
    (plan.itineraryPermission === "select" && plan.selectMembers?.includes(currentUserId))

  const getUserById = id => users.find(u => u.id === id) || { name: "Unknown", college: "" }

  const handleAddItem = () => {
    if (!newItemTime || !newItemActivity) return
    onAddItineraryItem(plan.id, { id: "i" + Date.now(), time: newItemTime, activity: newItemActivity, note: newItemNote })
    setNewItemTime(""); setNewItemActivity(""); setNewItemNote(""); setShowAddItem(false)
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    onSendMessage(plan.id, {
      id: "m" + Date.now(), userId: currentUserId, text: chatInput,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
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
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* Back */}
      <button onClick={onBack} style={styles.backBtn}>← Back</button>

      {/* Header */}
      <div style={{ background: T.card, padding: "12px 16px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: "700", padding: "4px 12px", borderRadius: 20, background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.dot, display: "inline-block" }} />
            {plan.type}
          </span>
          <span style={{ fontSize: 12, color: T.textMut }}>{plan.isPublic ? "🌍 Public" : "🔒 Private"}</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: "800", color: T.text, marginBottom: 10, letterSpacing: -0.3 }}>{plan.title}</h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[`📍 ${plan.location}`, `📅 ${plan.date}`, `🕐 ${plan.time}`].map(pill => (
            <span key={pill} style={{ fontSize: 12, color: T.textSec, background: T.muted, padding: "4px 10px", borderRadius: 20, border: `1px solid ${T.chip}` }}>{pill}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: T.card, borderBottom: `1px solid ${T.border}` }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "12px 0", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit",
            color:        activeTab === tab.id ? T.orange : T.textMut,
            borderBottom: activeTab === tab.id ? `2px solid ${T.orange}` : "2px solid transparent",
            fontWeight:   activeTab === tab.id ? "600" : "400",
          }} className="tab-btn">
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 120px" }}>

        {/* INFO */}
        {activeTab === "info" && (
          <div>
            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 20 }}>{plan.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                ["Type",       plan.type,       config.bg,    config.color],
                ["Members",    `${plan.memberIds.length}/${plan.maxMembers}`, "#1A1840", "#A09EFF"],
                ["Spots Left", spotsLeft,       spotsLeft <= 2 ? "#2D1810" : "#0D2820", spotsLeft <= 2 ? "#FF8060" : "#50D4A0"],
                ["Visibility", plan.isPublic ? "Public 🌍" : "Private 🔒", T.muted, T.textSec],
              ].map(([label, value, bg, color]) => (
                <div key={label} style={{ background: bg, borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4, color }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: "600", color }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: T.card, borderRadius: 12, padding: 14, marginBottom: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Created by</div>
              <div style={{ fontSize: 15, fontWeight: "600", color: T.text }}>{getUserById(plan.creatorId).name}</div>
              <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>{getUserById(plan.creatorId).college}</div>
            </div>

            {plan.tags?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Looking for</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {plan.tags.map(tag => <span key={tag} style={{ background: "#1A1840", color: "#A09EFF", fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: "500", border: "1px solid #2E2A60" }}>{tag}</span>)}
                </div>
              </div>
            )}

            {isCreator    && <div style={styles.infoBox("#1A1840","#A09EFF")}>👑 You created this plan</div>}
            {isMember && !isCreator && <div style={styles.infoBox("#0D2820","#50D4A0")}>✅ You're in this plan!</div>}
            {hasRequested && !isMember && (
              <div>
                <div style={styles.infoBox("#2A2008", T.yellow)}>⏳ Request pending — waiting for creator to accept</div>
                <button onClick={() => onCancelRequest(plan.id)} style={styles.cancelBtn} className='tap'>
                  Cancel Request
                </button>
              </div>
            )}
            {!isMember && !hasRequested && !isCreator && spotsLeft > 0 && (
              <button onClick={() => onJoinRequest(plan.id)} style={styles.joinBtn} className='tap'>
                Request to Join
              </button>
            )}
            {!isMember && spotsLeft === 0 && <div style={styles.infoBox(T.muted, T.textSec)}>😔 This plan is full</div>}
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <div>
            <p style={{ fontSize: 13, fontWeight: "600", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
              {plan.memberIds.length} member{plan.memberIds.length !== 1 ? "s" : ""}
            </p>
            {plan.memberIds.map(uid => {
              const u = getUserById(uid)
              return (
                <div key={uid} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ ...styles.memberAvatar, background: getAvatarColor(u.name) }}>
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: "600", color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                      {u.name}
                      {uid === plan.creatorId && <span style={{ fontSize: 10, background: "#1A1840", color: "#A09EFF", padding: "2px 8px", borderRadius: 10, fontWeight: "600" }}>Admin</span>}
                    </div>
                    <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>{u.college} · {u.year} yr</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {u.vibes?.slice(0, 2).map(v => <span key={v} style={{ fontSize: 11, background: T.muted, color: T.textSec, padding: "2px 8px", borderRadius: 10 }}>{v}</span>)}
                    </div>
                  </div>
                </div>
              )
            })}

            {isCreator && plan.requestIds.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 13, fontWeight: "600", color: T.yellow, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                  ⏳ {plan.requestIds.length} pending
                </p>
                {plan.requestIds.map(uid => {
                  const u = getUserById(uid)
                  return (
                    <div key={uid} style={{ display: "flex", alignItems: "center", gap: 10, background: "#2A2008", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                      <div style={{ ...styles.memberAvatar, background: T.yellow }}>
                        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: "600", color: T.text }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{u.college} · {u.year} yr</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => onAcceptRequest(plan.id, uid)} style={{ background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: "600" }}>✓</button>
                        <button onClick={() => onDeclineRequest(plan.id, uid)} style={{ background: "transparent", color: "#FF8060", border: "1px solid #FF8060", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ITINERARY */}
        {activeTab === "itinerary" && (
          <div>
            <p style={{ fontSize: 12, color: T.textMut, marginBottom: 16, fontStyle: "italic" }}>
              {plan.itineraryPermission === "all" ? "✏️ All members can edit" : plan.itineraryPermission === "creator" ? "🔒 Only the creator can edit" : "👥 Select members can edit"}
            </p>

            {plan.itinerary.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textMut, fontSize: 14 }}>
                {canEditItinerary ? "No items yet. Add the first one! 👇" : "No itinerary items yet."}
              </div>
            ) : plan.itinerary.map((item, index) => (
              <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 75, display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, paddingTop: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: "600", color: T.orange, whiteSpace: "nowrap" }}>{item.time}</span>
                  {index < plan.itinerary.length - 1 && <div style={{ width: 1, flex: 1, background: T.border, marginTop: 6, minHeight: 24 }} />}
                </div>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.orange, flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: "500", color: T.text }}>{item.activity}</div>
                  {item.note && <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>{item.note}</div>}
                </div>
              </div>
            ))}

            {canEditItinerary && (
              <div style={{ marginTop: 20 }}>
                {!showAddItem ? (
                  <button onClick={() => setShowAddItem(true)} style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px dashed ${T.orange}`, background: "transparent", color: T.orange, fontSize: 14, fontWeight: "600", fontFamily: "inherit", cursor: "pointer" }}>
                    + Add Item
                  </button>
                ) : (
                  <div style={{ background: T.card, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8, border: `1px solid ${T.border}` }}>
                    <input value={newItemTime}     onChange={e => setNewItemTime(e.target.value)}     placeholder="Time (e.g. 9:00 AM)" style={styles.input} />
                    <input value={newItemActivity} onChange={e => setNewItemActivity(e.target.value)} placeholder="Activity *"           style={styles.input} />
                    <input value={newItemNote}     onChange={e => setNewItemNote(e.target.value)}     placeholder="Note (optional)"      style={styles.input} />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button onClick={handleAddItem}          style={styles.joinBtn}>Add</button>
                      <button onClick={() => setShowAddItem(false)} style={styles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && isMember && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {plan.chat.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: T.textMut, fontSize: 14 }}>No messages yet. Say hi! 👋</div>}
              {plan.chat.map(msg => {
                const isMe   = msg.userId === currentUserId
                const sender = getUserById(msg.userId)
                return (
                  <div key={msg.id} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
                    {!isMe && (
                      <div style={{ ...styles.memberAvatar, width: 28, height: 28, fontSize: 10, flexShrink: 0, background: getAvatarColor(sender.name) }}>
                        {sender.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div style={{ maxWidth: "70%" }}>
                      {!isMe && <div style={{ fontSize: 11, color: T.textMut, marginBottom: 3 }}>{sender.name.split(" ")[0]}</div>}
                      <div style={{ padding: "9px 13px", fontSize: 14, lineHeight: 1.45, color: "#fff", background: isMe ? T.orange : T.card, borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px", border: isMe ? "none" : `1px solid ${T.border}` }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: 10, color: T.textMut, marginTop: 3, textAlign: isMe ? "right" : "left" }}>{msg.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMessage()} placeholder="Message..." style={{ ...styles.input, flex: 1, margin: 0 }} />
              <button onClick={handleSendMessage} style={{ width: 40, height: 40, borderRadius: "50%", background: T.orange, border: "none", color: "#fff", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} className="send-tap">
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Button */}
      <button onClick={() => setShowAI(true)} style={{ position: "fixed", bottom: 90, right: 16, background: T.purple, color: "#fff", border: "none", borderRadius: 20, padding: "10px 18px", fontSize: 13, fontWeight: "700", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 14px rgba(127,119,221,0.5)", zIndex: 10 }}>
        ✨ AI Assistant
      </button>

      {showAI && <AIChatPanel plan={plan} onClose={() => setShowAI(false)} />}
    </div>
  )
}

const infoBox = (bg, color) => ({ padding: "14px 16px", borderRadius: 12, fontSize: 14, fontWeight: "500", marginBottom: 12, background: bg, color })

const styles = {
  backBtn:      { background: "none", border: "none", fontSize: 15, color: T.orange, cursor: "pointer", padding: "16px 16px 0", fontFamily: "inherit", fontWeight: "600", display: "block" },
  infoBox:      (bg, color) => ({ padding: "14px 16px", borderRadius: 12, fontSize: 14, fontWeight: "500", marginBottom: 12, background: bg, color }),
  joinBtn:      { width: "100%", padding: 14, borderRadius: 12, border: "none", background: T.orange, color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  cancelBtn:    { width: "100%", padding: 13, borderRadius: 12, border: `1.5px solid ${T.chip}`, background: "transparent", color: T.textSec, fontSize: 14, fontWeight: "600", fontFamily: "inherit", cursor: "pointer", marginTop: 8 },
  memberAvatar: { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 13, flexShrink: 0 },
  input:        { padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box", color: T.text },
}

export default PlanDetailScreen