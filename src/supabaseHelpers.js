import { supabase } from './supabaseClient.js'

function rows(result, label) {
  if (result.error) throw new Error(`Could not load ${label}: ${result.error.message}`)
  return result.data || []
}

const timeOf = ts =>
  new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })

export async function fetchAllData() {
  const [u, p, m, r] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('plans').select('*'),
    supabase.from('plan_members').select('*'),
    supabase.from('plan_requests').select('*'),
  ])
  const usersData = rows(u, 'users')
  const plansData = rows(p, 'plans')
  const members   = rows(m, 'members')
  const requests  = rows(r, 'requests')

  const plans = plansData.map(plan => ({
    id:                  plan.id,
    title:               plan.title,
    type:                plan.type,
    location:            plan.location,
    date:                plan.date,
    time:                plan.time,
    description:         plan.description,
    isPublic:            plan.is_public,
    maxMembers:          plan.max_members,
    creatorId:           plan.creator_id,
    tags:                plan.tags || [],
    itineraryPermission: plan.itinerary_permission,
    latitude:            plan.latitude,
    longitude:           plan.longitude,
    memberIds:           members.filter(x => x.plan_id === plan.id).map(x => x.user_id),
    selectMembers:       members.filter(x => x.plan_id === plan.id && x.can_edit).map(x => x.user_id),
    requestIds:          requests.filter(x => x.plan_id === plan.id).map(x => x.user_id),
    itinerary:           [],
    chat:                [],
  }))

  const users = usersData.map(x => ({
    id: x.id, name: x.name, college: x.college, year: x.year,
    age: x.age, bio: x.bio, vibes: x.vibes || [],
  }))

  return { plans, users }
}

export async function fetchPlanDetails(planId) {
  const [i, m] = await Promise.all([
    supabase.from('itinerary_items').select('*').eq('plan_id', planId).order('created_at'),
    supabase.from('messages').select('*').eq('plan_id', planId).order('created_at'),
  ])
  return {
    itinerary: rows(i, 'itinerary').map(x => ({ id: x.id, time: x.time, activity: x.activity, note: x.note })),
    chat: rows(m, 'messages').map(x => ({ id: x.id, userId: x.user_id, text: x.text, time: timeOf(x.created_at) })),
  }
}

export async function fetchRatings() {
  return rows(await supabase.from('ratings').select('*').order('created_at'), 'ratings')
}

export async function fetchFriendships() {
  return rows(await supabase.from('friendships').select('*'), 'friendships')
}

export async function fetchNotifications() {
  return rows(
    await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
    'notifications'
  )
}