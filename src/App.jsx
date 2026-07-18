
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import { fetchAllData } from './supabaseHelpers.js'
import HomeScreen        from './components/HomeScreen.jsx'
import MyPlansScreen     from './components/MyPlansScreen.jsx'
import ProfileScreen     from './components/ProfileScreen.jsx'
import PlanDetailScreen  from './components/PlanDetailScreen.jsx'
import BottomNav         from './components/BottomNav.jsx'
import CreatePlanModal   from './components/CreatePlanModal.jsx'

const CURRENT_USER_ID = "u1"

function App() {
  const [screen, setScreen]                   = useState("home")
  const [selectedPlanId, setSelectedPlanId]   = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [plans, setPlans]                     = useState([])
  const [users, setUsers]                     = useState([])
  const [loading, setLoading]                 = useState(true)
  const [databaseError, setDatabaseError]     = useState(null)

  // ── Load everything from Supabase ─────────────────────────────────────────
  const loadData = async () => {
    setLoading(true)
    setDatabaseError(null)
    try {
      const { plans: loadedPlans, users: loadedUsers } = await fetchAllData()
      setPlans(loadedPlans)
      setUsers(loadedUsers)
    } catch (error) {
      console.error('Supabase load failed:', error)
      setDatabaseError(error.message || 'Could not connect to the database.')
    } finally {
      setLoading(false)
    }
  }

  // Run once when the app first opens
  useEffect(() => {
    window.setTimeout(loadData, 0)
  }, [])

  const handleOpenPlan = (plan) => {
    setSelectedPlanId(plan.id)
    setScreen("planDetail")
  }

  const handleBack = () => {
    setSelectedPlanId(null)
    setScreen("home")
  }

  // ── Join request ───────────────────────────────────────────────────────────
  const handleJoinRequest = async (planId) => {
    await supabase.from('plan_requests').insert({ plan_id: planId, user_id: CURRENT_USER_ID })
    await loadData()
  }

  const handleCancelRequest = async (planId) => {
    await supabase.from('plan_requests').delete().eq('plan_id', planId).eq('user_id', CURRENT_USER_ID)
    await loadData()
  }

  const handleAcceptRequest = async (planId, userId) => {
    await supabase.from('plan_requests').delete().eq('plan_id', planId).eq('user_id', userId)
    await supabase.from('plan_members').insert({ plan_id: planId, user_id: userId })
    await loadData()
  }

  const handleDeclineRequest = async (planId, userId) => {
    await supabase.from('plan_requests').delete().eq('plan_id', planId).eq('user_id', userId)
    await loadData()
  }

  const handleAddItineraryItem = async (planId, item) => {
    await supabase.from('itinerary_items').insert({
      id: item.id, plan_id: planId, time: item.time, activity: item.activity, note: item.note,
    })
    await loadData()
  }

  const handleSendMessage = async (planId, message) => {
    await supabase.from('messages').insert({
      id: message.id, plan_id: planId, user_id: message.userId, text: message.text,
    })
    await loadData()
  }

  const handleUpdateProfile = async (updatedData) => {
  await supabase
    .from('users')
    .update({
      name:    updatedData.name,
      college: updatedData.college,
      year:    updatedData.year,
      age:     updatedData.age,
      bio:     updatedData.bio,
      vibes:   updatedData.vibes,
    })
    .eq('id', CURRENT_USER_ID)

  await loadData()
}

  const handleCreatePlan = async (formData) => {
    const newPlanId = "PLAN-" + Date.now()

    await supabase.from('plans').insert({
      id:                    newPlanId,
      title:                 formData.title,
      type:                  formData.type,
      location:              formData.location,
      date:                  formData.date,
      time:                  formData.time,
      description:           formData.description,
      is_public:             formData.isPublic,
      max_members:           formData.maxMembers,
      creator_id:            CURRENT_USER_ID,
      tags:                  formData.tags,
      itinerary_permission:  formData.itineraryPermission,
    })

    // Creator automatically becomes a member
    await supabase.from('plan_members').insert({ plan_id: newPlanId, user_id: CURRENT_USER_ID })

    await loadData()
    setShowCreateModal(false)
    setScreen("myplans")
  }

  const currentPlan = plans.find(p => p.id === selectedPlanId)

  if (loading || databaseError) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0B1133", color: "#fff", fontFamily: "system-ui",
      }}>
        {databaseError ? (
          <div role="alert">
            <p>Database error: {databaseError}</p>
            <button type="button" onClick={loadData}>Retry</button>
          </div>
        ) : 'Loading your plans...'}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div>
        {screen === "home" &&
          <HomeScreen
            plans={plans}
            users={users}
            onOpenPlan={handleOpenPlan}
            currentUserId={CURRENT_USER_ID}
          />
        }
        {screen === "myplans" &&
          <MyPlansScreen
            plans={plans}
            users={users}
            currentUserId={CURRENT_USER_ID}
            onOpenPlan={handleOpenPlan}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
          />
        }
        {screen === "profile" &&
          <ProfileScreen
            currentUserId={CURRENT_USER_ID}
            plans={plans}
            users={users}
            onUpdateProfile={handleUpdateProfile}
          />
        }
        {screen === "planDetail" && currentPlan &&
          <PlanDetailScreen
            plan={currentPlan}
            users={users}
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

      {screen !== "planDetail" && (
        <BottomNav
          currentScreen={screen}
          onNavigate={setScreen}
          onCreatePlan={() => setShowCreateModal(true)}
        />
      )}

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