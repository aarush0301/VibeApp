import { useState } from 'react'
import { T, getAvatarColor } from '../theme.js'

const initials = name => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

function FriendsModal({ users, friendships, currentUserId, onSendRequest, onAccept, onRemove, onClose }) {
  const [tab, setTab]     = useState("friends")
  const [query, setQuery] = useState("")

  const mine     = friendships.filter(f => f.requester_id === currentUserId || f.addressee_id === currentUserId)
  const otherId  = f => (f.requester_id === currentUserId ? f.addressee_id : f.requester_id)
  const getUser  = id => users.find(u => u.id === id)

  const friends  = mine.filter(f => f.status === "accepted")
  const incoming = mine.filter(f => f.status === "pending" && f.addressee_id === currentUserId)
  const outgoing = mine.filter(f => f.status === "pending" && f.requester_id === currentUserId)

  const q = query.trim().toLowerCase()
  const results = q.length < 2 ? [] : users
    .filter(u => u.id !== currentUserId)
    .filter(u => u.name.toLowerCase().includes(q) || (u.college || "").toLowerCase().includes(q))
    .slice(0, 15)

  const Row = ({ user, right }) => (
    <div style={styles.row}>
      <div style={{ ...styles.avatar, background: getAvatarColor(user.name) }}>{initials(user.name)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: "600", color: T.text }}>{user.name}</div>
        <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>
          {user.college}{user.year ? ` · ${user.year} yr` : ""}
        </div>
      </div>
      {right}
    </div>
  )

  const tabs = [
    { id: "friends",  label: `Friends (${friends.length})` },
    { id: "requests", label: incoming.length ? `Requests (${incoming.length})` : "Requests" },
    { id: "find",     label: "Find people" },
  ]

  return (
    <div style={styles.backdrop} className="backdrop-fade">
      <div style={styles.sheet} className="slide-up">
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: "700", color: T.text }}>Friends 👥</h2>
          <button onClick={onClose} className="tap" style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.tabRow}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="chip-tap"
              style={{ ...styles.tabBtn, background: tab === t.id ? T.orange : T.muted, color: tab === t.id ? "#fff" : T.textSec }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={styles.body}>

          {tab === "friends" && (
            friends.length === 0 ? (
              <p style={styles.empty}>No friends yet. Use "Find people" to add some.</p>
            ) : friends.map(f => {
              const u = getUser(otherId(f))
              if (!u) return null
              return (
                <Row key={f.id} user={u} right={
                  <button onClick={() => onRemove(f.id)} className="tap" style={styles.ghostBtn}>Remove</button>
                } />
              )
            })
          )}

          {tab === "requests" && (
            <>
              {incoming.length === 0 && outgoing.length === 0 && <p style={styles.empty}>No pending requests.</p>}

              {incoming.length > 0 && <p style={styles.label}>Received</p>}
              {incoming.map(f => {
                const u = getUser(f.requester_id)
                if (!u) return null
                return (
                  <Row key={f.id} user={u} right={
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => onAccept(f.id)} className="tap" style={styles.acceptBtn}>✓ Accept</button>
                      <button onClick={() => onRemove(f.id)} className="tap" style={styles.ghostBtn}>✕</button>
                    </div>
                  } />
                )
              })}

              {outgoing.length > 0 && <p style={{ ...styles.label, marginTop: 16 }}>Sent</p>}
              {outgoing.map(f => {
                const u = getUser(f.addressee_id)
                if (!u) return null
                return (
                  <Row key={f.id} user={u} right={
                    <button onClick={() => onRemove(f.id)} className="tap" style={styles.ghostBtn}>Cancel</button>
                  } />
                )
              })}
            </>
          )}

          {tab === "find" && (
            <>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or college..."
                style={styles.input}
              />
              {q.length < 2 && <p style={styles.empty}>Type at least 2 letters.</p>}
              {q.length >= 2 && results.length === 0 && <p style={styles.empty}>No one found.</p>}

              {results.map(u => {
                const f = mine.find(x => otherId(x) === u.id)
                let right
                if (!f) {
                  right = <button onClick={() => onSendRequest(u.id)} className="tap" style={styles.acceptBtn}>+ Add</button>
                } else if (f.status === "accepted") {
                  right = <span style={{ fontSize: 12, color: "#50D4A0" }}>✓ Friends</span>
                } else if (f.requester_id === currentUserId) {
                  right = <span style={{ fontSize: 12, color: T.yellow }}>Pending</span>
                } else {
                  right = <button onClick={() => onAccept(f.id)} className="tap" style={styles.acceptBtn}>✓ Accept</button>
                }
                return <Row key={u.id} user={u} right={right} />
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  backdrop:  { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-end" },
  sheet:     { background: T.card, borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", border: `1px solid ${T.border}` },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 },
  closeBtn:  { background: T.muted, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, color: T.textSec },
  tabRow:    { display: "flex", gap: 8, padding: "12px 20px", flexShrink: 0, overflowX: "auto" },
  tabBtn:    { padding: "7px 14px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: "600", fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" },
  body:      { overflowY: "auto", padding: "4px 20px 32px" },
  row:       { display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.border}` },
  avatar:    { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: 13, flexShrink: 0 },
  label:     { fontSize: 11, fontWeight: "700", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 },
  empty:     { textAlign: "center", padding: "30px 0", color: T.textMut, fontSize: 14 },
  input:     { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", color: T.text, marginBottom: 14 },
  acceptBtn: { background: T.green, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", fontWeight: "600" },
  ghostBtn:  { background: "transparent", color: "#FF8060", border: "1px solid #FF8060", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" },
}

export default FriendsModal