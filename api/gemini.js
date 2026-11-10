import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Please log in first.' })

  const { planId, question } = req.body || {}
  if (typeof planId !== 'string' || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Missing plan or question.' })
  }
  const userQuestion = question.trim().slice(0, 500)

  // A client that acts as the logged-in user, so row level security applies
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' })
  }

  const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).maybeSingle()
  if (!plan) return res.status(404).json({ error: 'Plan not found.' })

  const { data: items } = await supabase
    .from('itinerary_items').select('time, activity').eq('plan_id', planId).order('created_at')
  const itineraryText = items?.length
    ? items.map(i => `${i.time} - ${i.activity}`).join(', ')
    : 'No itinerary yet'

  if (!process.env.GEMINI_KEY) {
    return res.status(500).json({ error: 'The AI service is not configured.' })
  }

  const prompt = `
You are a helpful and fun trip planning assistant for a college social app called Vibe App.

Current plan details:
- Title: ${plan.title}
- Type: ${plan.type}
- Location: ${plan.location}
- Date: ${plan.date}
- Time: ${plan.time}
- Description: ${plan.description}
- Current Itinerary: ${itineraryText}

The user is asking: "${userQuestion}"

Instructions:
- Give helpful specific suggestions relevant to ${plan.location}
- Keep your tone fun and casual
- For EVERY specific place you mention include its coordinates like this: [latitude, longitude]
- Example: "Visit Abbey Falls [12.4051, 75.6551] — it's stunning!"
- Only use real accurate coordinates
- Keep it to 3 to 5 suggestions max
- You can only READ the itinerary not change it
- You can also suggest if any plan in the itinerary should better be changed as they might be closed or currently it might not be the best to go for it and suggest alternatives if they are better.
`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    return res.status(200).json({ reply: result.response.text() })
  } catch (err) {
    console.error('Gemini error:', err)
    return res.status(502).json({ error: 'The AI service is busy. Try again in a minute.' })
  }
}