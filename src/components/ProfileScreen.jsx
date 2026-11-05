
import { useState } from 'react'
import { Pencil, Users, Radio, LogOut } from 'lucide-react'
import { T, getAvatarColor } from '../theme.js'
import { getRatingStats, ratingLabel } from '../ratingUtils.js'
import Stars from './Stars.jsx'
import EditProfileModal from './EditProfileModal.jsx'
import FriendsModal from './FriendsModal.jsx'

function ProfileScreen({
  currentUserId, plans, users, friendships,
  onUpdateProfile, onLogout,
  onSendFriendRequest, onAcceptFriend, onRemoveFriendship,
}) {
  const [showEdit, setShowEdit]       = useState(false)
  const [showFriends, setShowFriends] = useState(false)

  const user = users.find(u => u.id === currentUserId)
  if (!user) return null

  const plansCreated = plans.filter(p => p.creatorId === currentUserId).length
  const plansJoined  = plans.filter(p => p.memberIds.includes(currentUserId) && p.creatorId !== currentUserId).length
  const initials     = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const stats        = getRatingStats(user.ratings)

  const myFriendships = friendships.filter(f => f.requester_id === currentUserId || f.addressee_id === currentUserId)
  const friendCount   = myFriendships.filter(f => f.status === "accepted").length
  const pendingIn     = myFriendships.filter(f => f.status === "pending" && f.addressee_id === currentUserId).length

  return (
    <section className="app-page profile-page">
      {/* Hero */}
      <div className="profile-cover"><p>Your people.<br />Your kind of energy.</p><Radio size={48} strokeWidth={1.3} aria-hidden="true" /></div>
      <div>
        <div className="profile-intro">
        <div className="avatar profile-avatar" style={{ background: getAvatarColor(user.name) }}>{initials}</div>
        <div><h1 className="page-heading">{user.name}</h1>
        <p className="page-description">{user.college}</p>

        <div style={{ marginTop: 10 }}>
          {stats ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Stars score={stats.avg} size={14} />
              <span style={{ fontSize: 13, fontWeight: "700", color: T.yellow }}>{stats.avg}</span>
              <span style={{ fontSize: 11, color: T.textMut }}>({stats.count} ratings)</span>
              <span style={{ fontSize: 10, background: "#FAEDCB", color: T.yellow, padding: "2px 7px", borderRadius: 10, fontWeight: "600" }}>{ratingLabel(stats.avg)}</span>
            </span>
          ) : (
            <span style={{ fontSize: 12, color: T.textMut }}>No ratings yet</span>
          )}
        </div>
        </div></div>

        <div className="profile-actions">
          <button onClick={() => setShowEdit(true)} className="secondary-button tap"><Pencil size={15} aria-hidden="true" /> Edit Profile</button>
          <button onClick={() => setShowFriends(true)} className="secondary-button tap">
            <Users size={15} aria-hidden="true" /> Friends ({friendCount})
            {pendingIn > 0 && <span style={styles.badge}>{pendingIn}</span>}
          </button>
        </div>

        <dl className="profile-stats">
          {[["Year", user.year || "-"], ["Age", user.age || "-"], ["Created", plansCreated], ["Joined", plansJoined]].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {user.bio && (
        <div className="profile-section">
          <h2>A little about you</h2>
          <p style={styles.bioText}>{user.bio}</p>
        </div>
      )}

      {user.vibes?.length > 0 && (
        <div className="profile-section">
          <h2>Your frequency</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {user.vibes.map(vibe => <span key={vibe} className="vibe-pill">{vibe}</span>)}
          </div>
        </div>
      )}

      {user.ratings?.length > 0 && (
        <div className="profile-section">
          <h2>Word from the crew</h2>
          {[...user.ratings].reverse().map(r => {
            const rater = users.find(u => u.id === r.rater_id)
            return (
              <div key={r.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Stars score={r.score} size={13} />
                  <span style={{ fontSize: 11, color: T.textMut }}>{rater?.name?.split(" ")[0] || "Someone"}</span>
                </div>
                {r.comment && <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>"{r.comment}"</p>}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ paddingTop: 28, marginBottom: 20 }}>
        <button onClick={onLogout} className="secondary-button tap">
          <LogOut size={16} />Log Out
        </button>
      </div>

      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(updatedData) => {
            onUpdateProfile(updatedData)
            setShowEdit(false)
          }}
        />
      )}

      {showFriends && (
        <FriendsModal
          users={users}
          friendships={friendships}
          currentUserId={currentUserId}
          onSendRequest={onSendFriendRequest}
          onAccept={onAcceptFriend}
          onRemove={onRemoveFriendship}
          onClose={() => setShowFriends(false)}
        />
      )}
    </section>
  )
}

const styles = {
  badge:        { background: T.orange, color: T.bg, borderRadius: 10, fontSize: 11, fontWeight: "700", padding: "1px 6px" },
  bioText:      { fontSize: 14, color: T.textSec, lineHeight: 1.6 },
}

export default ProfileScreen
