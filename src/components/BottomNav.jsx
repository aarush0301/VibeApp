function BottomNav({ currentScreen, onNavigate }) {
  const navItems = [
    { id: "home",    label: "Discover", icon: "🔍" },
    { id: "myplans", label: "My Plans", icon: "📋" },
    { id: "profile", label: "Profile",  icon: "👤" },
  ]

  return (
    <div style={styles.nav}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              ...styles.navBtn,
              color: isActive ? "#D85A30" : "#9E9B96",
              borderTop: isActive ? "2px solid #D85A30" : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: "20px" }}>{item.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: isActive ? "600" : "400" }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const styles = {
  nav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: "480px", backgroundColor: "#ffffff",
    borderTop: "1px solid #E8E6E1", display: "flex", zIndex: 50,
  },
  navBtn: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    gap: "3px", padding: "10px 0 14px", background: "none",
    border: "none", cursor: "pointer", fontFamily: "inherit",
  },
}

export default BottomNav