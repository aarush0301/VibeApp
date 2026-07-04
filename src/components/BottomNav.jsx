

function BottomNav({ currentScreen, onNavigate, onCreatePlan }) {
  const navItems = [
    { id: "home",    label: "Discover", icon: "🔍" },
    { id: "myplans", label: "My Plans", icon: "📋" },
    { id: "profile", label: "Profile",  icon: "👤" },
  ]

  return (
    <div style={styles.nav}>
      {/* Discover */}
      <button
        onClick={() => onNavigate(navItems[0].id)}
        style={{
          ...styles.navBtn,
          color:      currentScreen === navItems[0].id ? "#D85A30" : "#9E9B96",
          borderTop:  currentScreen === navItems[0].id ? "2px solid #D85A30" : "2px solid transparent",
        }}
      >
        <span style={{ fontSize: 20 }}>{navItems[0].icon}</span>
        <span style={{ fontSize: 10, fontWeight: currentScreen === navItems[0].id ? "600" : "400" }}>
          {navItems[0].label}
        </span>
      </button>

      {/* + Create button in the middle */}
      <button onClick={onCreatePlan} style={styles.createBtn}>
        <span style={{ fontSize: 24, color: "#fff", lineHeight: 1 }}>+</span>
      </button>

      {/* My Plans and Profile */}
      {navItems.slice(1).map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            ...styles.navBtn,
            color:     currentScreen === item.id ? "#D85A30" : "#9E9B96",
            borderTop: currentScreen === item.id ? "2px solid #D85A30" : "2px solid transparent",
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: currentScreen === item.id ? "600" : "400" }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

const styles = {
  nav:       { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "480px", backgroundColor: "#ffffff", borderTop: "1px solid #E8E6E1", display: "flex", alignItems: "center", zIndex: 50, paddingBottom: 8 },
  navBtn:    { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" },
  createBtn: { width: 52, height: 52, borderRadius: "50%", background: "#D85A30", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(216,90,48,0.4)", flexShrink: 0, marginBottom: 8 },
}

export default BottomNav