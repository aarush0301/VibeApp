
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import { fetchAllData, fetchRatings } from './supabaseHelpers.js'
import HomeScreen        from './components/HomeScreen.jsx'
import MyPlansScreen     from './components/MyPlansScreen.jsx'
import ProfileScreen     from './components/ProfileScreen.jsx'
import PlanDetailScreen  from './components/PlanDetailScreen.jsx'
import BottomNav         from './components/BottomNav.jsx'
import CreatePlanModal   from './components/CreatePlanModal.jsx'
import AuthScreen        from './components/AuthScreen.jsx'

function App() {
  const [screen, setScreen]                   = useState("home")
  const [selectedPlanId, setSelectedPlanId]   = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [plans, setPlans]                     = useState([])
  const [users, setUsers]                     = useState([])
  const [loading, setLoading]                 = useState(true)
  const [databaseError, setDatabaseError]     = useState(null)
  const [currentUserId, setCurrentUserId]     = useState(null)
  const [authChecked, setAuthChecked]         = useState(false)
  const [ratings, setRatings] = useState([])

  // ── Load everything from Supabase ─────────────────────────────────────────
  const loadData = async () => {
    setLoading(true)
    setDatabaseError(null)
    try {
      const { plans: loadedPlans, users: loadedUsers } = await fetchAllData()
      const loadedRatings = await fetchRatings()
      setPlans(loadedPlans)
      setUsers(loadedUsers)
      setRatings(loadedRatings)
    } catch (error) {
      console.error('Supabase load failed:', error)
      setDatabaseError(error.message || 'Could not connect to the database.')
    } finally {
      setLoading(false)
    }
  }

  // Check if a session already exists (so refreshing doesn't log you out)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setCurrentUserId(data.session.user.id)
      }
      setAuthChecked(true)
    }
    checkSession()
  }, [])

  // Once we know who's logged in, load their data
  useEffect(() => {
    if (currentUserId) {
      loadData()
    }
  }, [currentUserId])

  const handleOpenPlan = (plan) => {
    setSelectedPlanId(plan.id)
    setScreen("planDetail")
  }

  const handleBack = () => {
    setSelectedPlanId(null)
    setScreen("home")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentUserId(null)
    setPlans([])
    setUsers([])
    setScreen("home")
  }

  // ── Join request ───────────────────────────────────────────────────────────
  const handleJoinRequest = async (planId) => {
    await supabase.from('plan_requests').insert({ plan_id: planId, user_id: currentUserId })
    await loadData()
  }

  const handleCancelRequest = async (planId) => {
    await supabase.from('plan_requests').delete().eq('plan_id', planId).eq('user_id', currentUserId)
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

  const handleRateHost = async (planId, hostId, score, comment) => {
    const { error } = await supabase.from('ratings').insert({
      plan_id: planId,
      host_id: hostId,
      rater_id: currentUserId,
      score,
      comment: comment || null,
    })
    if (error) {
      alert(error.code === '23505' ? "You've already rated this plan." : "Couldn't submit rating: " + error.message)
      return false
    }
    await loadData()
    return true
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
      .eq('id', currentUserId)

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
      creator_id:            currentUserId,
      tags:                  formData.tags,
      itinerary_permission:  formData.itineraryPermission,
      latitude:              formData.latitude,
      longitude:             formData.longitude,
    })

    // Creator automatically becomes a member
    await supabase.from('plan_members').insert({ plan_id: newPlanId, user_id: currentUserId })

    await loadData()
    setShowCreateModal(false)
    setScreen("myplans")
  }

  const currentPlan = plans.find(p => p.id === selectedPlanId)
  const usersWithRatings = users.map(user => ({
    ...user,
    ratings: ratings.filter(rating => rating.host_id === user.id),
  }))

  // Still checking if a session exists
  if (!authChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0B1133", color: "#fff", fontFamily: "system-ui" }}>
        Loading...
      </div>
    )
  }

  // No one logged in — show auth screen
  if (!currentUserId) {
    return <AuthScreen onAuthSuccess={(userId) => setCurrentUserId(userId)} />
  }

  // Logged in but still fetching plans/users
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
            users={usersWithRatings}
            onOpenPlan={handleOpenPlan}
            currentUserId={currentUserId}
          />
        }
        {screen === "myplans" &&
          <MyPlansScreen
            plans={plans}
            users={usersWithRatings}
            currentUserId={currentUserId}
            onOpenPlan={handleOpenPlan}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
          />
        }
        {screen === "profile" &&
          <ProfileScreen
            currentUserId={currentUserId}
            plans={plans}
            users={usersWithRatings}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        }
        {screen === "planDetail" && currentPlan &&
          <PlanDetailScreen
            plan={currentPlan}
            users={usersWithRatings}
            currentUserId={currentUserId}
            onBack={handleBack}
            onJoinRequest={handleJoinRequest}
            onCancelRequest={handleCancelRequest}
            onAddItineraryItem={handleAddItineraryItem}
            onSendMessage={handleSendMessage}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onRateHost={handleRateHost}
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
