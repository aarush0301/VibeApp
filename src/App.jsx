import { useState } from 'react'
import { plans as initialPlans } from './data.js'
import HomeScreen        from './components/HomeScreen.jsx'
import MyPlansScreen     from './components/MyPlansScreen.jsx'
import ProfileScreen     from './components/ProfileScreen.jsx'
import PlanDetailScreen  from './components/PlanDetailScreen.jsx'
import BottomNav         from './components/BottomNav.jsx'
import CreatePlanModal   from './components/CreatePlanModal.jsx'

const CURRENT_USER_ID = "u1"

function App() {
  const [screen, setScreen]               = useState("home")
  const [selectedPlan, setSelectedPlan]   = useState(null)
  const [plans, setPlans]                 = useState(initialPlans)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleOpenPlan = (plan) => {
    setSelectedPlan(plan)
    setScreen("planDetail")
  }

  const handleBack = () => {
    setSelectedPlan(null)
    setScreen("home")
  }

  const handleJoinRequest = (planId) => {
    setPlans(plans.map(p =>
      p.id === planId
        ? { ...p, requestIds: [...p.requestIds, CURRENT_USER_ID] }
        : p
    ))
  }

  const handleCancelRequest = (planId) => {
    setPlans(plans.map(p =>
      p.id === planId
        ? { ...p, requestIds: p.requestIds.filter(id => id !== CURRENT_USER_ID) }
        : p
    ))
  }

  const handleAcceptRequest = (planId, userId) => {
    setPlans(plans.map(p =>
      p.id === planId
        ? { ...p, requestIds: p.requestIds.filter(id => id !== userId), memberIds: [...p.memberIds, userId] }
        : p
    ))
  }

  const handleDeclineRequest = (planId, userId) => {
    setPlans(plans.map(p =>
      p.id === planId
        ? { ...p, requestIds: p.requestIds.filter(id => id !== userId) }
        : p
    ))
  }

  const handleAddItineraryItem = (planId, item) => {
    setPlans(plans.map(p =>
      p.id === planId
        ? { ...p, itinerary: [...p.itinerary, item] }
        : p
    ))
  }

  const handleSendMessage = (planId, message) => {
    setPlans(plans.map(p =>
      p.id === planId
        ? { ...p, chat: [...p.chat, message] }
        : p
    ))
  }

  // ── Create a new plan ─────────────────────────────────────────────────────
  const handleCreatePlan = (formData) => {
    const newPlan = {
      ...formData,
      id:         "PLAN-" + Date.now(),
      creatorId:  CURRENT_USER_ID,
      memberIds:  [CURRENT_USER_ID],
      requestIds: [],
      itinerary:  [],
      chat:       [],
    }
    setPlans([...plans, newPlan])
    setShowCreateModal(false)
    setScreen("myplans")
  }

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
          <HomeScreen plans={plans} onOpenPlan={handleOpenPlan} />
        }
        {screen === "myplans" &&
          <MyPlansScreen
            plans={plans}
            currentUserId={CURRENT_USER_ID}
            onOpenPlan={handleOpenPlan}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
          />
        }
        {screen === "profile" &&
          <ProfileScreen currentUserId={CURRENT_USER_ID} plans={plans} />
        }
        {screen === "planDetail" && currentPlan &&
          <PlanDetailScreen
            plan={currentPlan}
            currentUserId={CURRENT_USER_ID}
            onBack={handleBack}
            onJoinRequest={handleJoinRequest}
            onCancelRequest={handleCancelRequest}
            onAddItineraryItem={handleAddItineraryItem}
            onSendMessage={handleSendMessage}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
          />
        }
      </div>

      {/* Bottom nav */}
      {screen !== "planDetail" && (
        <BottomNav
          currentScreen={screen}
          onNavigate={setScreen}
          onCreatePlan={() => setShowCreateModal(true)}
        />
      )}

      {/* Create plan modal */}
      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onCreatePlan={handleCreatePlan}
        />
      )}
    </div>
  )
}

export default App