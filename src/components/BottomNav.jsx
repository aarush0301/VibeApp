import { Compass, CalendarDays, UserRound, Plus } from 'lucide-react'
import Brand from './Brand.jsx'

function Item({ id, label, Icon, currentScreen, onNavigate }) {
  return <button type="button" onClick={() => onNavigate(id)} aria-current={currentScreen === id ? 'page' : undefined} className="nav-item nav-tap"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span></button>
}

export default function BottomNav({ currentScreen, onNavigate, onCreatePlan }) {
  return (
    <nav aria-label="Main navigation" className={`app-nav ${currentScreen === 'planDetail' ? 'is-detail' : ''}`}>
      <div className="nav-brand"><Brand /></div>
      <div className="nav-items">
        <Item id="home" label="Discover" Icon={Compass} currentScreen={currentScreen} onNavigate={onNavigate} />
        <Item id="myplans" label="My Plans" Icon={CalendarDays} currentScreen={currentScreen} onNavigate={onNavigate} />
        <button type="button" onClick={onCreatePlan} className="nav-item nav-create nav-tap"><Plus size={22} strokeWidth={1.8} aria-hidden="true" /><span>Create</span></button>
        <Item id="profile" label="Profile" Icon={UserRound} currentScreen={currentScreen} onNavigate={onNavigate} />
      </div>
      <p className="nav-note"><strong>Find your frequency.</strong>Good plans. Your people.<br />A little more life after class.</p>
    </nav>
  )
}
