import { useState } from 'react'
import { plans as initialPlans } from './data.js'
import HomeScreen       from './components/HomeScreen.jsx'
import MyPlansScreen    from './components/MyPlansScreen.jsx'
import ProfileScreen    from './components/ProfileScreen.jsx'
import PlanDetailScreen from './components/PlanDetailScreen.jsx'
import BottomNav        from './components/BottomNav.jsx'

// For now we use a hardcoded "logged in" user
const CURRENT_USER_ID = "u1"

function App() {
  const [screen, setScreen]             = useState("home")
  const [selectedPlan, setSelectedPlan] = useState(null)

  // Plans now live in state — not just imported data
  const [plans, setPlans] = useState(initialPlans)

  // Open a plan detail — find the LATEST version from state
  const handleOpenPlan = (plan) => {
    setSelectedPlan(plan)
    setScreen("planDetail")
  }

  // Go back
  const handleBack = () => {
    setSelectedPlan(null)
    setScreen("home")
  }

  // ── Join request ──────────────────────────────────────────────────────────
  const handleJoinRequest = (planId) => {
    setPlans(plans.map(plan =>
      plan.id === planId
        ? { ...plan, requestIds: [...plan.requestIds, CURRENT_USER_ID] }
        : plan
    ))
  }

  // ── Cancel request ────────────────────────────────────────────────────────
  const handleCancelRequest = (planId) => {
    setPlans(plans.map(plan =>
      plan.id === planId
        ? { ...plan, requestIds: plan.requestIds.filter(id => id !== CURRENT_USER_ID) }
        : plan
    ))
  }

  // Keep selectedPlan in sync with latest plans state
  const currentPlan = plans.find(p => p.id === selectedPlan?.id)

  return (
    <div style={{
      maxWidth: "480px",
      margin: "0 auto",
      backgroundColor: "#F7F6F3",
      minHeight: "100vh",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div>
        {screen === "home" &&
          <HomeScreen
            plans={plans}
            onOpenPlan={handleOpenPlan}
          />
        }
        {screen === "myplans" &&
          <MyPlansScreen
            plans={plans}
            currentUserId={CURRENT_USER_ID}
          />
        }
        {screen === "profile" &&
          <ProfileScreen />
        }
        {screen === "planDetail" && currentPlan &&
          <PlanDetailScreen
            plan={currentPlan}
            currentUserId={CURRENT_USER_ID}
            onBack={handleBack}
            onJoinRequest={handleJoinRequest}
            onCancelRequest={handleCancelRequest}
          />
        }
      </div>

      {screen !== "planDetail" && (
        <BottomNav currentScreen={screen} onNavigate={setScreen} />
      )}
    </div>
  )
}

export default App