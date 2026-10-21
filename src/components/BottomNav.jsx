
import { Compass, ListChecks, User, Plus } from 'lucide-react'
import { T } from '../theme.js'

function Item({ id, label, Icon, currentScreen, onNavigate }) {
  const active = currentScreen === id
  return (
    <button onClick={() => onNavigate(id)} className="nav-tap" style={styles.item}>
      <span style={{ ...styles.iconWrap, background: active ? "rgba(255,107,74,0.16)" : "transparent" }}>
        <Icon size={21} color={active ? T.orange : T.textMut} strokeWidth={active ? 2.4 : 2} />
      </span>
      <span style={{ fontSize: 10, fontWeight: active ? "700" : "500", color: active ? T.orange : T.textMut }}>
        {label}
      </span>
    </button>
  )
}

function BottomNav({ currentScreen, onNavigate, onCreatePlan }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.bar}>
        <Item id="home"    label="Discover" Icon={Compass}    currentScreen={currentScreen} onNavigate={onNavigate} />
        <button onClick={onCreatePlan} className="fab-tap" style={styles.fab} aria-label="Create plan">
          <Plus size={26} color="#fff" strokeWidth={2.6} />
        </button>
        <Item id="myplans" label="My Plans" Icon={ListChecks} currentScreen={currentScreen} onNavigate={onNavigate} />
        <Item id="profile" label="Profile"  Icon={User}       currentScreen={currentScreen} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

const styles = {
  wrap:     { position: "fixed", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50, pointerEvents: "none" },
  bar:      { pointerEvents: "auto", width: "calc(100% - 32px)", maxWidth: 440, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 10px", borderRadius: 30, background: "rgba(24,19,48,0.82)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" },
  item:     { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: "inherit" },
  iconWrap: { width: 44, height: 28, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" },
  fab:      { width: 54, height: 54, borderRadius: "50%", background: T.gradient, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: T.glow, marginTop: -26, flexShrink: 0 },
}

export default BottomNav