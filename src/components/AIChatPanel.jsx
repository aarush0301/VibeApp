import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { T } from '../theme.js'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

function extractCoordinates(text) {
  const regex = /\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/g
  const coords = []
  let match
  while ((match = regex.exec(text)) !== null) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      coords.push([lat, lng])
    }
  }
  return coords
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>")              // italic
    .replace(/\n/g, "<br/>")                           // line breaks
    .replace(/\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/g, "") // remove coords
    .trim()
}

function AIChatPanel({ plan, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hey! 👋 I'm your trip assistant for ${plan.title}. I can suggest places, food spots, and activities around ${plan.location}. What would you like to know?`,
      coords: [],
    }
  ])
  const [input, setInput]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [mapCoords, setMapCoords]   = useState([])
  const [mapCenter, setMapCenter]   = useState([12.9716, 77.5946])
  const bottomRef                   = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const itineraryText = plan.itinerary.length > 0
    ? plan.itinerary.map(i => `${i.time} - ${i.activity}`).join(", ")
    : "No itinerary yet"

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMessage, coords: [] }])
    setLoading(true)

    try {
      // Use the official Google Generative AI SDK
      const genAI = new GoogleGenerativeAI(GEMINI_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

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

The user is asking: "${userMessage}"

Instructions:
- Give helpful specific suggestions relevant to ${plan.location}
- Keep your tone fun and casual
- For EVERY specific place you mention include its coordinates like this: [latitude, longitude]
- Example: "Visit Abbey Falls [12.4051, 75.6551] — it's stunning!"
- Only use real accurate coordinates
- Keep it to 3 to 5 suggestions max
- You can only READ the itinerary not change it
`

      const result = await model.generateContent(prompt)
      const reply  = result.response.text()

      const coords = extractCoordinates(reply)
      if (coords.length > 0) {
        setMapCoords(coords)
        setMapCenter(coords[0])
      }

      setMessages(prev => [...prev, { role: "assistant", text: reply, coords }])

    } catch (err) {
      console.error("Gemini error:", err)
      setMessages(prev => [...prev, {
        role: "assistant",
        text: `Sorry something went wrong: ${err.message}. Try again!`,
        coords: [],
      }])
    }

    setLoading(false)
  }

  return (
    <div style={styles.overlay} className="backdrop-fade">
  <div style={styles.panel} className="slide-up">

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>✨ AI Assistant</h2>
            <p style={styles.headerSub}>{plan.title} · {plan.location}</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Map */}
        <div style={styles.mapContainer}>
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ width: "100%", height: "100%" }}
            key={mapCenter.toString()}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            {mapCoords.map((coord, i) => (
              <Marker key={i} position={coord}>
                <Popup>Suggested spot {i + 1}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Messages */}
        <div style={styles.messageList}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              ...styles.messageRow,
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
  ...styles.bubble,
  background:   msg.role === "user" ? T.orange : T.card,
  color:        "#ffffff",
  border:       msg.role === "user" ? "none" : `1px solid ${T.border}`,
  borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
}}>
                <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
              <div style={{ ...styles.bubble, background: "#ffffff", color: "#9E9B96" }}>
                ✨ Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask about places, food, activities..."
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{ ...styles.sendBtn, opacity: loading ? 0.5 : 1 }} className="send-tap"
          >
            ➤
          </button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  overlay:      { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end" },
  panel:        { background: T.card, borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "95vh", display: "flex", flexDirection: "column", border: `1px solid ${T.border}` },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: T.card, borderRadius: "20px 20px 0 0", borderBottom: `1px solid ${T.border}`, flexShrink: 0 },
  headerTitle:  { margin: 0, fontSize: 17, fontWeight: "700", color: T.text },
  headerSub:    { margin: "2px 0 0", fontSize: 12, color: T.textMut },
  closeBtn:     { background: T.muted, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, color: T.textSec },
  mapContainer: { height: "220px", flexShrink: 0 },
  messageList:  { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, background: T.bg },
  messageRow:   { display: "flex" },
  bubble:       { maxWidth: "78%", padding: "10px 14px", fontSize: 14, lineHeight: 1.5, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  inputRow:     { display: "flex", gap: 8, padding: "12px 16px", background: T.card, borderTop: `1px solid ${T.border}`, flexShrink: 0 },
  input:        { flex: 1, padding: "10px 14px", borderRadius: 20, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", color: T.text },
  sendBtn:      { width: 40, height: 40, borderRadius: "50%", background: T.orange, border: "none", color: "#fff", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
}
export default AIChatPanel