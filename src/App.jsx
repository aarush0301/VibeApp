
import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient.js'
import HomeScreen        from './components/HomeScreen.jsx'
import UserProfileModal from './components/UserProfileModal.jsx'
import MyPlansScreen     from './components/MyPlansScreen.jsx'
import ProfileScreen     from './components/ProfileScreen.jsx'
import PlanDetailScreen  from './components/PlanDetailScreen.jsx'
import BottomNav         from './components/BottomNav.jsx'
import CreatePlanModal   from './components/CreatePlanModal.jsx'
import AuthScreen        from './components/AuthScreen.jsx'
import { fetchAllData, fetchPlanDetails, fetchRatings, fetchFriendships, fetchNotifications } from './supabaseHelpers.js'
import NotificationsModal from './components/NotificationsModal.jsx'
import Brand from './components/Brand.jsx'
import './App.css'
import './components/ModalFrame.css'


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
  const [friendships, setFriendships] = useState([])
  const hasLoaded  = useRef(false)
  const loadingNow = useRef(false)
  const loadQueued = useRef(false)
  const [notifications, setNotifications]         = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [viewingUserId, setViewingUserId] = useState(null)
  const [details, setDetails] = useState({})
  const selectedPlanRef = useRef(null)
  useEffect(() => { selectedPlanRef.current = selectedPlanId }, [selectedPlanId])
  // ── Load everything from Supabase ─────────────────────────────────────────
  const loadData = async () => {
  // Never run two loads at once. A change that arrives mid-load triggers one more load afterwards.
  if (loadingNow.current) {
    if (hasLoaded.current) loadQueued.current = true
    return
  }
  loadingNow.current = true

  // Only the very first load may show the full-screen loading state.
  const isFirstLoad = !hasLoaded.current
  if (isFirstLoad) { setLoading(true); setDatabaseError(null) }

  try {
    const [core, loadedRatings, loadedFriendships, loadedNotifications] = await Promise.all([
  fetchAllData(), fetchRatings(), fetchFriendships(), fetchNotifications(),
])
setPlans(core.plans)
setUsers(core.users)
setRatings(loadedRatings)
setFriendships(loadedFriendships)
setNotifications(loadedNotifications)
hasLoaded.current = true
  } catch (error) {
    console.error('Supabase load failed:', error)
    if (isFirstLoad) setDatabaseError(error.message || 'Could not connect to the database.')
  } finally {
    if (isFirstLoad) setLoading(false)
    loadingNow.current = false
    if (loadQueued.current) { loadQueued.current = false; loadData() }
  }
}

const loadPlanDetails = async (planId) => {
  if (!planId) return
  try {
    const d = await fetchPlanDetails(planId)
    setDetails(prev => ({ ...prev, [planId]: d }))
  } catch (error) {
    console.error('Plan details failed:', error)
  }
}

useEffect(() => {
  if (!selectedPlanId) return

  const timeoutId = setTimeout(() => loadPlanDetails(selectedPlanId), 0)
  return () => clearTimeout(timeoutId)
}, [selectedPlanId])

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
  if (!currentUserId) return

  let coreTimer = null
  let detailTimer = null
  const initialLoad = setTimeout(() => loadData(), 0)
  const refreshCore = () => {
    clearTimeout(coreTimer)
    coreTimer = setTimeout(() => loadData(true), 600)
  }
  const refreshDetails = () => {
    clearTimeout(detailTimer)
    detailTimer = setTimeout(() => loadPlanDetails(selectedPlanRef.current), 300)
  }

  const channel = supabase.channel('vibe-live')
  ;['users', 'plans', 'plan_members', 'plan_requests', 'ratings', 'friendships', 'notifications']
    .forEach(table => channel.on('postgres_changes', { event: '*', schema: 'public', table }, refreshCore))
  ;['itinerary_items', 'messages']
    .forEach(table => channel.on('postgres_changes', { event: '*', schema: 'public', table }, refreshDetails))
  channel.subscribe()

  const fallback = setInterval(() => {
    loadData(true)
    loadPlanDetails(selectedPlanRef.current)
  }, 60000)

  return () => {
    clearTimeout(initialLoad)
    clearTimeout(coreTimer)
    clearTimeout(detailTimer)
    clearInterval(fallback)
    supabase.removeChannel(channel)
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

  const handleOpenUserProfile = (id) => {
  if (id === currentUserId) {
    setSelectedPlanId(null)
    setScreen("profile")
    return
  }
  setViewingUserId(id)
}

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentUserId(null)
    setPlans([])
    setUsers([])
    setFriendships([])
    setRatings([])
    setScreen("home")
    hasLoaded.current = false
    setLoading(true)
    setNotifications([])
    setShowNotifications(false)
    setViewingUserId(null)
    setDetails({})
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
    await loadPlanDetails(planId)
  }

  const handleSendMessage = async (planId, message) => {
    await supabase.from('messages').insert({
      id: message.id, plan_id: planId, user_id: message.userId, text: message.text,
    })
    await loadPlanDetails(planId)
  }

const handleSendFriendRequest = async (otherId) => {
  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: currentUserId, addressee_id: otherId })
  if (error) {
    alert(error.code === '23505'
      ? "A request already exists between you two."
      : "Couldn't send request: " + error.message)
    return
  }
  await loadData(true)
}

const handleAcceptFriend = async (friendshipId) => {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
  if (error) { alert("Couldn't accept: " + error.message); return }
  await loadData(true)
}

const handleRemoveFriendship = async (friendshipId) => {
  const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
  if (error) { alert("Couldn't remove: " + error.message); return }
  await loadData(true)
}

const handleToggleEditor = async (planId, userId, value) => {
  const { error } = await supabase
    .from('plan_members')
    .update({ can_edit: value })
    .eq('plan_id', planId)
    .eq('user_id', userId)
  if (error) { alert("Couldn't update permission: " + error.message); return }
  await loadData(true)
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

  const handleCancelPlan = async (planId, note) => {
  const { error } = await supabase.rpc('cancel_plan', { p_plan_id: planId, p_note: note || null })
  if (error) {
    alert("Couldn't cancel the plan: " + error.message)
    return false
  }
  setSelectedPlanId(null)
  setScreen("home")
  await loadData()
  return true
}

const handleMarkNotificationRead = async (id) => {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
  await loadData()
}

const handleMarkAllNotificationsRead = async () => {
  await supabase.from('notifications').update({ read: true }).eq('read', false)
  await loadData()
}

const handleDeleteNotification = async (id) => {
  await supabase.from('notifications').delete().eq('id', id)
  await loadData()
}

  const handleUpdateItineraryItem = async (itemId, fields) => {
  const { data, error } = await supabase
    .from('itinerary_items')
    .update({ time: fields.time, activity: fields.activity, note: fields.note })
    .eq('id', itemId)
    .select()
  if (error || !data || data.length === 0) {
    alert("Couldn't update this item" + (error ? ": " + error.message : ". You may not have permission."))
    return false
  }
  await loadPlanDetails(selectedPlanRef.current)
  return true
}

const handleDeleteItineraryItem = async (itemId) => {
  const { data, error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .select()
  if (error || !data || data.length === 0) {
    alert("Couldn't delete this item" + (error ? ": " + error.message : ". You may not have permission."))
    return
  }
  await loadPlanDetails(selectedPlanRef.current)
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

  const basePlan = plans.find(p => p.id === selectedPlanId)
  const currentPlan = basePlan
   ? { ...basePlan, itinerary: details[basePlan.id]?.itinerary || [], chat: details[basePlan.id]?.chat || [] }
  : undefined
  useEffect(() => {
  if (screen === "planDetail" && hasLoaded.current && !currentPlan) {
    setSelectedPlanId(null)
    setScreen("home")
  }
}, [screen, currentPlan])
  const usersWithRatings = users.map(user => ({
    ...user,
    ratings: ratings.filter(rating => rating.host_id === user.id),
  }))

  // Still checking if a session exists
  if (!authChecked) {
    return (
      <div className="app-status" role="status">
        <Brand />
        Getting things ready…
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
      <div className="app-status">
        <Brand />
        {databaseError ? (
          <div role="alert" className="status-message">
            <h1 className="page-heading">Couldn’t load your plans.</h1>
            <p className="page-description">{databaseError}</p>
            <button type="button" className="primary-button" onClick={loadData}>Try again</button>
          </div>
        ) : <p role="status">Finding your next good plan…</p>}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === "home" &&
          <HomeScreen
            plans={plans}
            users={usersWithRatings}
            onOpenPlan={handleOpenPlan}
            currentUserId={currentUserId}
            unreadCount={notifications.filter(n => !n.read).length}
            onOpenNotifications={() => setShowNotifications(true)}
            onCreatePlan={() => setShowCreateModal(true)}
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
            onOpenProfile={handleOpenUserProfile}
            onCreatePlan={() => setShowCreateModal(true)}
            onDiscover={() => setScreen('home')}
          />
        }
        
        {screen === "profile" &&
          <ProfileScreen
            currentUserId={currentUserId}
            plans={plans}
            users={usersWithRatings}
            friendships={friendships}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptFriend={handleAcceptFriend}
            onRemoveFriendship={handleRemoveFriendship}
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
            onToggleEditor={handleToggleEditor}
            onUpdateItineraryItem={handleUpdateItineraryItem}
            onDeleteItineraryItem={handleDeleteItineraryItem}
            onCancelPlan={handleCancelPlan}
            onOpenProfile={handleOpenUserProfile}
          />
        }
          {showNotifications && (
    <NotificationsModal
      notifications={notifications}
      users={users}
      onMarkRead={handleMarkNotificationRead}
      onMarkAllRead={handleMarkAllNotificationsRead}
      onDelete={handleDeleteNotification}
      onClose={() => setShowNotifications(false)}
    />
  )}
      </main>

        <BottomNav
          currentScreen={screen}
          onNavigate={setScreen}
          onCreatePlan={() => setShowCreateModal(true)}
        />

      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onCreatePlan={handleCreatePlan}
        />
      )}
      {viewingUserId && usersWithRatings.find(u => u.id === viewingUserId) && (
  <UserProfileModal
    user={usersWithRatings.find(u => u.id === viewingUserId)}
    users={usersWithRatings}
    friendships={friendships}
    currentUserId={currentUserId}
    onSendRequest={handleSendFriendRequest}
    onAccept={handleAcceptFriend}
    onRemove={handleRemoveFriendship}
    onClose={() => setViewingUserId(null)}
  />
)}
    </div>
  )
}

export default App
