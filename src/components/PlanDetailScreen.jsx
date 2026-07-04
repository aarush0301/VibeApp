import { useState } from 'react'
import { users } from '../data.js'

function PlanDetailScreen({ plan, currentUserId, onBack, onJoinRequest, onCancelRequest, onAddItineraryItem, onSendMessage, onAcceptRequest, onDeclineRequest }) {

  const [activeTab, setActiveTab] = useState("info")
  const [newItemTime, setNewItemTime]         = useState("")
  const [newItemActivity, setNewItemActivity] = useState("")
  const [newItemNote, setNewItemNote]         = useState("")
  const [showAddItem, setShowAddItem]         = useState(false)
  const [chatInput, setChatInput]             = useState("")

  // ── Derived values ────────────────────────────────────────────────────────
  const hasRequested = plan.requestIds.includes(currentUserId)
  const isMember     = plan.memberIds.includes(currentUserId)
  const isCreator    = plan.creatorId === currentUserId
  const spotsLeft    = plan.maxMembers - plan.memberIds.length

  // Can this user edit the itinerary?
  const canEditItinerary =
    isCreator ||
    plan.itineraryPermission === "all" ||
    (plan.itineraryPermission === "select" && plan.selectMembers?.includes(currentUserId))

  // Helper — get user object by id
  const getUserById = (id) => users.find(u => u.id === id) || { name: "Unknown", college: "" }

  // Add itinerary item
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

  // Send chat message
  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    onSendMessage(plan.id, {
      id: "m" + Date.now(),
      userId: currentUserId,
      text: chatInput,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    })
    setChatInput("")
  }

  // Tabs to show — chat only if member
  const tabs = [
    { id: "info",      label: "Info" },
    { id: "members",   label: "Members" },
    { id: "itinerary", label: "Itinerary" },
    ...(isMember ? [{ id: "chat", label: "Chat" }] : []),
  ]

  return (
    <div style={styles.screen}>

      {/* ── Back button ── */}
      <button onClick={onBack} style={styles.backBtn}>← Back</button>

      {/* ── Plan header ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>{plan.title}</h1>
        <p style={styles.subtitle}>📍 {plan.location} · 📅 {plan.date} · 🕐 {plan.time}</p>
      </div>

      {/* ── Tab bar ── */}
      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              color:          activeTab === tab.id ? "#D85A30" : "#9E9B96",
              borderBottom:   activeTab === tab.id ? "2px solid #D85A30" : "2px solid transparent",
              fontWeight:     activeTab === tab.id ? "600" : "400",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={styles.tabContent}>

        {/* ════ INFO TAB ════ */}
        {activeTab === "info" && (
          <div>
            <p style={styles.description}>{plan.description}</p>

            {/* Details grid */}
            <div style={styles.grid}>
              {[
                ["Type",       plan.type],
                ["Members",    `${plan.memberIds.length}/${plan.maxMembers}`],
                ["Spots Left", spotsLeft],
                ["Visibility", plan.isPublic ? "Public 🌍" : "Private 🔒"],
              ].map(([label, value]) => (
                <div key={label} style={styles.gridItem}>
                  <div style={styles.gridLabel}>{label}</div>
                  <div style={styles.gridValue}>{value}</div>
                </div>
              ))}
            </div>

            {/* Creator info */}
            <div style={styles.creatorBox}>
              <div style={styles.creatorLabel}>Created by</div>
              <div style={styles.creatorName}>{getUserById(plan.creatorId).name}</div>
              <div style={styles.creatorCollege}>{getUserById(plan.creatorId).college}</div>
            </div>

            {/* Vibe tags */}
            {plan.tags?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={styles.gridLabel}>Looking for</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {plan.tags.map(tag => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Action button ── */}
            {isCreator && (
              <div style={{ ...styles.infoBox, background: "#EEEDFE", color: "#3C3489" }}>
                👑 You created this plan
              </div>
            )}
            {isMember && !isCreator && (
              <div style={{ ...styles.infoBox, background: "#E1F5EE", color: "#0F6E56" }}>
                ✅ You're in this plan!
              </div>
            )}
            {hasRequested && !isMember && (
              <div>
                <div style={{ ...styles.infoBox, background: "#FFF8EC", color: "#854F0B" }}>
                  ⏳ Request pending — waiting for creator to accept
                </div>
                <button onClick={() => onCancelRequest(plan.id)} style={styles.cancelBtn}>
                  Cancel Request
                </button>
              </div>
            )}
            {!isMember && !hasRequested && !isCreator && spotsLeft > 0 && (
              <button onClick={() => onJoinRequest(plan.id)} style={styles.joinBtn}>
                Request to Join
              </button>
            )}
            {!isMember && spotsLeft === 0 && (
              <div style={{ ...styles.infoBox, background: "#F1EFE8", color: "#5F5E5A" }}>
                😔 This plan is full
              </div>
            )}
          </div>
        )}

        {/* ════ MEMBERS TAB ════ */}
        {activeTab === "members" && (
          <div>
            <p style={styles.sectionLabel}>
              {plan.memberIds.length} member{plan.memberIds.length !== 1 ? "s" : ""}
            </p>

            {plan.memberIds.map(uid => {
              const u = getUserById(uid)
              return (
                <div key={uid} style={styles.memberRow}>
                  {/* Avatar circle */}
                  <div style={{
                    ...styles.avatar,
                    background: uid === "u1" ? "#7F77DD" : uid === "u2" ? "#D85A30" : "#1D9E75",
                  }}>
                    {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.memberName}>
                      {u.name}
                      {uid === plan.creatorId && (
                        <span style={styles.creatorBadge}>Admin</span>
                      )}
                    </div>
                    <div style={styles.memberSub}>{u.college} · {u.year} yr</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {u.vibes?.slice(0, 2).map(v => (
                        <span key={v} style={styles.vibePill}>{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pending requests — only creator sees this */}
            {isCreator && plan.requestIds.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ ...styles.sectionLabel, color: "#854F0B" }}>
                  ⏳ {plan.requestIds.length} pending request{plan.requestIds.length !== 1 ? "s" : ""}
                </p>
                {plan.requestIds.map(uid => {
                  const u = getUserById(uid)
                  return (
                    <div key={uid} style={{ ...styles.memberRow, background: "#FFF8EC", borderRadius: 12, padding: 12, marginBottom: 10 }}>
                      <div style={{ ...styles.avatar, background: "#EF9F27" }}>
                        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.memberName}>{u.name}</div>
                        <div style={styles.memberSub}>{u.college} · {u.year} yr</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                  onClick={() => onAcceptRequest(plan.id, uid)}
                     style={styles.acceptBtn} >✓ Accept</button>
                     <button
                     onClick={() => onDeclineRequest(plan.id, uid)}
                     style={styles.declineBtn}>  ✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ════ ITINERARY TAB ════ */}
        {activeTab === "itinerary" && (
          <div>
            {/* Permission label */}
            <p style={styles.permissionNote}>
              {plan.itineraryPermission === "all"
                ? "✏️ All members can edit"
                : plan.itineraryPermission === "creator"
                ? "🔒 Only the creator can edit"
                : "👥 Select members can edit"}
            </p>

            {/* Timeline */}
            {plan.itinerary.length === 0 ? (
              <div style={styles.emptyState}>
                {canEditItinerary
                  ? "No items yet. Add the first one below! 👇"
                  : "No itinerary items yet."}
              </div>
            ) : (
              <div style={styles.timeline}>
                {plan.itinerary.map((item, index) => (
                  <div key={item.id} style={styles.timelineRow}>
                    {/* Time column */}
                    <div style={styles.timeColumn}>
                      <span style={styles.timeText}>{item.time}</span>
                      {/* Vertical line connecting items */}
                      {index < plan.itinerary.length - 1 && (
                        <div style={styles.timelineLine} />
                      )}
                    </div>
                    {/* Dot */}
                    <div style={styles.timelineDot} />
                    {/* Activity column */}
                    <div style={styles.activityColumn}>
                      <div style={styles.activityText}>{item.activity}</div>
                      {item.note && (
                        <div style={styles.activityNote}>{item.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add item — only if permitted */}
            {canEditItinerary && (
              <div style={{ marginTop: 20 }}>
                {!showAddItem ? (
                  <button onClick={() => setShowAddItem(true)} style={styles.addItemBtn}>
                    + Add Item
                  </button>
                ) : (
                  <div style={styles.addItemForm}>
                    <input
                      value={newItemTime}
                      onChange={e => setNewItemTime(e.target.value)}
                      placeholder="Time (e.g. 9:00 AM)"
                      style={styles.input}
                    />
                    <input
                      value={newItemActivity}
                      onChange={e => setNewItemActivity(e.target.value)}
                      placeholder="Activity *"
                      style={styles.input}
                    />
                    <input
                      value={newItemNote}
                      onChange={e => setNewItemNote(e.target.value)}
                      placeholder="Note (optional)"
                      style={styles.input}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button onClick={handleAddItem} style={styles.joinBtn}>
                        Add
                      </button>
                      <button onClick={() => setShowAddItem(false)} style={styles.cancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════ CHAT TAB ════ */}
        {activeTab === "chat" && isMember && (
          <div style={styles.chatContainer}>
            {/* Messages */}
            <div style={styles.messageList}>
              {plan.chat.length === 0 && (
                <div style={styles.emptyState}>No messages yet. Say hi! 👋</div>
              )}
              {plan.chat.map(msg => {
                const isMe = msg.userId === currentUserId
                const sender = getUserById(msg.userId)
                return (
                  <div key={msg.id} style={{
                    ...styles.messageRow,
                    flexDirection: isMe ? "row-reverse" : "row",
                  }}>
                    {!isMe && (
                      <div style={{ ...styles.avatar, width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>
                        {sender.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div style={{ maxWidth: "70%" }}>
                      {!isMe && (
                        <div style={styles.senderName}>{sender.name.split(" ")[0]}</div>
                      )}
                      <div style={{
                        ...styles.bubble,
                        background:   isMe ? "#D85A30" : "#ffffff",
                        color:        isMe ? "#ffffff" : "#1A1917",
                        borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                      }}>
                        {msg.text}
                      </div>
                      <div style={{
                        ...styles.msgTime,
                        textAlign: isMe ? "right" : "left",
                      }}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input */}
            <div style={styles.chatInputRow}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="Message..."
                style={{ ...styles.input, flex: 1, margin: 0 }}
              />
              <button onClick={handleSendMessage} style={styles.sendBtn}>➤</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  screen:      { padding: "16px 16px 120px", fontFamily: "system-ui, sans-serif" },
  backBtn:     { background: "none", border: "none", fontSize: "15px", color: "#D85A30", cursor: "pointer", padding: "0 0 12px 0", fontFamily: "inherit", fontWeight: "600" },
  header:      { marginBottom: 16 },
  title:       { fontSize: "22px", fontWeight: "700", color: "#1A1917", margin: "0 0 6px 0" },
  subtitle:    { fontSize: "13px", color: "#6B6864", margin: 0 },
  tabBar:      { display: "flex", borderBottom: "1px solid #E8E6E1", marginBottom: 20 },
  tabBtn:      { flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "inherit" },
  tabContent:  { },
  description: { fontSize: "14px", color: "#1A1917", lineHeight: "1.6", marginBottom: 20 },
  grid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 },
  gridItem:    { background: "#F0EEE9", borderRadius: 12, padding: 12 },
  gridLabel:   { fontSize: "11px", color: "#6B6864", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  gridValue:   { fontSize: "15px", fontWeight: "600", color: "#1A1917" },
  creatorBox:  { background: "#F0EEE9", borderRadius: 12, padding: 14, marginBottom: 20 },
  creatorLabel:{ fontSize: "11px", color: "#6B6864", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  creatorName: { fontSize: "15px", fontWeight: "600", color: "#1A1917" },
  creatorCollege: { fontSize: "12px", color: "#6B6864", marginTop: 2 },
  tag:         { background: "#EEEDFE", color: "#3C3489", fontSize: "12px", padding: "4px 10px", borderRadius: 20, fontWeight: "500" },
  infoBox:     { padding: "14px 16px", borderRadius: 12, fontSize: "14px", fontWeight: "500", marginBottom: 12 },
  joinBtn:     { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#D85A30", color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  cancelBtn:   { width: "100%", padding: "13px", borderRadius: 12, border: "1.5px solid #FAC775", background: "#fff", color: "#C8530A", fontSize: "14px", fontWeight: "600", fontFamily: "inherit", cursor: "pointer", marginTop: 8 },
  sectionLabel:{ fontSize: "13px", fontWeight: "600", color: "#6B6864", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 },
  memberRow:   { display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #F0EEE9" },
  avatar:      { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 13, flexShrink: 0 },
  memberName:  { fontSize: "14px", fontWeight: "600", color: "#1A1917", display: "flex", alignItems: "center", gap: 6 },
  memberSub:   { fontSize: "12px", color: "#6B6864", marginTop: 2 },
  creatorBadge:{ fontSize: "10px", background: "#EEEDFE", color: "#3C3489", padding: "2px 8px", borderRadius: 10, fontWeight: "600" },
  vibePill:    { fontSize: "11px", background: "#F0EEE9", color: "#6B6864", padding: "2px 8px", borderRadius: 10 },
  acceptBtn:   { background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer", fontWeight: "600" },
  declineBtn:  { background: "transparent", color: "#D85A30", border: "1px solid #D85A30", borderRadius: 8, padding: "6px 10px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" },
  permissionNote: { fontSize: "12px", color: "#6B6864", marginBottom: 16, fontStyle: "italic" },
  emptyState:  { textAlign: "center", padding: "40px 0", color: "#9E9B96", fontSize: "14px" },
  timeline:    { display: "flex", flexDirection: "column", gap: 0 },
  timelineRow: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  timeColumn:  { width: 75, display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, paddingTop: 2 },
  timeText:    { fontSize: "12px", fontWeight: "600", color: "#D85A30", whiteSpace: "nowrap" },
  timelineLine:{ width: 1, flex: 1, background: "#E8E6E1", marginTop: 6, minHeight: 24, alignSelf: "center" },
  timelineDot: { width: 10, height: 10, borderRadius: "50%", background: "#D85A30", flexShrink: 0, marginTop: 4 },
  activityColumn: { flex: 1 },
  activityText:{ fontSize: "14px", fontWeight: "500", color: "#1A1917" },
  activityNote:{ fontSize: "12px", color: "#6B6864", marginTop: 2 },
  addItemBtn:  { width: "100%", padding: "12px", borderRadius: 12, border: "1.5px dashed #D85A30", background: "transparent", color: "#D85A30", fontSize: "14px", fontWeight: "600", fontFamily: "inherit", cursor: "pointer" },
  addItemForm: { background: "#F7F6F3", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 },
  input:       { padding: "10px 14px", borderRadius: 10, border: "1px solid #E8E6E1", background: "#fff", fontSize: "14px", fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  chatContainer: { display: "flex", flexDirection: "column", gap: 0 },
  messageList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 },
  messageRow:  { display: "flex", gap: 8, alignItems: "flex-end" },
  senderName:  { fontSize: "11px", color: "#9E9B96", marginBottom: 3 },
  bubble:      { padding: "9px 13px", fontSize: "14px", lineHeight: "1.45" },
  msgTime:     { fontSize: "10px", color: "#9E9B96", marginTop: 3 },
  chatInputRow:{ display: "flex", gap: 8, alignItems: "center" },
  sendBtn:     { width: 40, height: 40, borderRadius: "50%", background: "#D85A30", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
}

export default PlanDetailScreen