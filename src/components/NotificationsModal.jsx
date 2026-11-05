import ModalFrame from './ModalFrame.jsx'
import { X, Trash2 } from 'lucide-react'
import { T } from '../theme.js'

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotificationsModal({ notifications, users, onMarkAllRead, onMarkRead, onDelete, onClose }) {
  const unread = notifications.filter(n => !n.read).length

  return (
    <ModalFrame title="Notifications" onClose={onClose}>
        <div style={styles.header}>
          <h2 style={{ fontSize: 18, fontWeight: "800", color: T.text }}>Notifications</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="tap" style={styles.linkBtn}>Mark all read</button>
            )}
            <button onClick={onClose} className="tap" style={styles.closeBtn} aria-label="Close"><X size={16} color={T.textSec} /></button>
          </div>
        </div>

        <div style={styles.body}>
          {notifications.length === 0 && <p style={styles.empty}>Nothing here yet.</p>}

          {notifications.map(n => {
            const from = users.find(u => u.id === n.from_user_id)
            return (
              <div
                key={n.id}
                style={{ ...styles.item, background: n.read ? "transparent" : T.peach }}
              >
                {!n.read && <span style={styles.dot} />}
                <button type="button" onClick={() => !n.read && onMarkRead(n.id)} aria-label={`${n.read ? '' : 'Mark as read: '}${n.title}`} style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: "700", color: T.text }}>{n.title}</div>
                  {n.body && (
                    <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, marginTop: 4 }}>
                      {from ? `${from.name.split(" ")[0]}: ` : ""}"{n.body}"
                    </p>
                  )}
                  <div style={{ fontSize: 11, color: T.textMut, marginTop: 6 }}>{timeAgo(n.created_at)}</div>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(n.id) }}
                  className="tap"
                  style={styles.iconBtn}
                  aria-label="Delete notification"
                >
                  <Trash2 size={14} color={T.textMut} />
                </button>
              </div>
            )
          })}
        </div>
    </ModalFrame>
  )
}

const styles = {
  header:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 14px", flexShrink: 0 },
  body:     { overflowY: "auto", padding: "0 12px 32px" },
  item:     { display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 10px", borderRadius: 16, marginBottom: 4 },
  dot:      { width: 8, height: 8, borderRadius: "50%", background: T.orange, marginTop: 6, flexShrink: 0 },
  empty:    { textAlign: "center", padding: "40px 0", color: T.textMut, fontSize: 14 },
  linkBtn:  { background: "none", border: "none", color: T.orange, fontSize: 12, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  closeBtn: { background: T.raised, border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  iconBtn:  { background: "none", border: "none", cursor: "pointer", padding: 6, flexShrink: 0 },
}

export default NotificationsModal
