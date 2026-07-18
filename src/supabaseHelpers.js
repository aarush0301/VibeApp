import { supabase } from './supabaseClient.js'

export async function fetchAllData() {
  const results = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('plans').select('*'),
    supabase.from('plan_members').select('*'),
    supabase.from('plan_requests').select('*'),
    supabase.from('itinerary_items').select('*').order('created_at'),
    supabase.from('messages').select('*').order('created_at'),
  ])

  const tableNames = ['users', 'plans', 'plan_members', 'plan_requests', 'itinerary_items', 'messages']
  const failedQuery = results.find(result => result.error)

  if (failedQuery) {
    throw new Error('Could not load ' + tableNames[results.indexOf(failedQuery)] + ': ' + failedQuery.error.message)
  }

  const [usersData, plansData, membersData, requestsData, itineraryData, messagesData] = results.map(result => result.data)

  // Rebuild each plan with its related data nested inside
  const plans = (plansData || []).map(plan => ({
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

    memberIds: (membersData || [])
      .filter(m => m.plan_id === plan.id)
      .map(m => m.user_id),

    requestIds: (requestsData || [])
      .filter(r => r.plan_id === plan.id)
      .map(r => r.user_id),

    itinerary: (itineraryData || [])
      .filter(i => i.plan_id === plan.id)
      .map(i => ({ id: i.id, time: i.time, activity: i.activity, note: i.note })),

    chat: (messagesData || [])
      .filter(m => m.plan_id === plan.id)
      .map(m => ({
        id:     m.id,
        userId: m.user_id,
        text:   m.text,
        time:   new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      })),
  }))

  const users = (usersData || []).map(u => ({
    id:      u.id,
    name:    u.name,
    college: u.college,
    year:    u.year,
    age:     u.age,
    bio:     u.bio,
    vibes:   u.vibes || [],
  }))

  return { plans, users }
}