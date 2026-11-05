import { MapPin, Calendar, Clock, Navigation, Globe2, LockKeyhole, ArrowUpRight } from 'lucide-react'
import { T, TYPE_CONFIG, getAvatarColor, formatDate } from '../theme.js'
import Stars from './Stars.jsx'
import ActivityIcon from './ActivityIcon.jsx'

export default function PlanCard({ plan, creatorName, distance, creatorRating, participation }) {
  const config = TYPE_CONFIG[plan.type] || TYPE_CONFIG.Other
  const spotsLeft = Math.max(0, plan.maxMembers - plan.memberIds.length)
  const initials = creatorName ? creatorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

  return (
    <article className="plan-card card-tap">
      <div className="plan-card-top">
        <span className="activity-label" style={{ background: config.bg, color: config.color }}><ActivityIcon type={plan.type} />{plan.type}</span>
        <span className="plan-visibility">{plan.isPublic ? <Globe2 size={13} /> : <LockKeyhole size={13} />}{plan.isPublic ? 'Public' : 'Friends only'}</span>
      </div>
      <h2>{plan.title}</h2>
      <p className="plan-description">{plan.description}</p>
      <div className="plan-meta">
        <span><MapPin size={14} />{plan.location}</span>
        <span><Calendar size={14} />{formatDate(plan.date)}</span>
        {plan.time && <span><Clock size={14} />{plan.time}</span>}
        {distance != null && <span><Navigation size={14} />{distance < 1 ? '< 1 km' : `${distance.toFixed(1)} km`}</span>}
      </div>
      <div className="plan-footer">
        <div className="plan-host">
          <div className="avatar" style={{ background: getAvatarColor(creatorName) }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="plan-host-name">{participation === 'created' ? 'Created by you' : creatorName || 'Unknown'}</div>
            <div className="plan-rating">{participation === 'created' ? `${plan.memberIds.length} members` : creatorRating ? <><Stars score={creatorRating.avg} size={11} /><span>{creatorRating.avg} ({creatorRating.count})</span></> : 'New host'}</div>
          </div>
        </div>
        <span className="plan-spots" style={{ color: spotsLeft === 0 ? T.textMut : spotsLeft <= 2 ? T.orange : T.green }}>{spotsLeft ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left` : 'Full'}<ArrowUpRight size={16} aria-hidden="true" /></span>
      </div>
    </article>
  )
}
