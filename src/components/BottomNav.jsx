
import { T } from '../theme.js'

function BottomNav({ currentScreen, onNavigate, onCreatePlan }) {
  const navItems = [
    { id: "home",    label: "Discover", icon: "🔍" },
    { id: "myplans", label: "My Plans", icon: "📋" },
    { id: "profile", label: "Profile",  icon: "👤" },
  ]

  return (
    <div style={styles.nav}>
      <button onClick={() => onNavigate(navItems[0].id)} className="nav-tap" style={{
        ...styles.navBtn,
        color:     currentScreen === navItems[0].id ? T.orange : T.textMut,
        borderTop: currentScreen === navItems[0].id ? `2px solid ${T.orange}` : "2px solid transparent",
      }}>
        <span style={{ fontSize: 20 }}>{navItems[0].icon}</span>
        <span style={{ fontSize: 10, fontWeight: currentScreen === navItems[0].id ? "700" : "400" }}>
          {navItems[0].label}
        </span>
      </button>

      <button onClick={onCreatePlan} className="fab-tap" style={styles.createBtn}>
        <span style={{ fontSize: 24, color: "#fff", lineHeight: 1 }}>+</span>
      </button>

      {navItems.slice(1).map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} className="chip-tap" style={{
          ...styles.navBtn,
          color:     currentScreen === item.id ? T.orange : T.textMut,
          borderTop: currentScreen === item.id ? `2px solid ${T.orange}` : "2px solid transparent",
        }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: currentScreen === item.id ? "700" : "400" }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

const styles = {
  nav:       { width: "100%", backgroundColor: T.card, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", paddingBottom: 8, flexShrink: 0 },
  navBtn:    { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" },
  createBtn: { width: 52, height: 52, borderRadius: "50%", background: T.orange, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(216,90,48,0.5)", flexShrink: 0, marginBottom: 8 },
}

export default BottomNav