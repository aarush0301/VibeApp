import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '../supabaseClient.js'

import { T } from '../theme.js'
import { Send, Minus, Sparkles } from 'lucide-react'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})



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

function ResizeMap() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

function AIChatPanel({ plan, onClose, isVisible = true }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `I can suggest places, food spots, and activities around ${plan.location}. What would you like to know?`,
      coords: [],
    }
  ])
  const [input, setInput]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [mapCoords, setMapCoords]   = useState([])
  const [mapCenter, setMapCenter]   = useState([12.9716, 77.5946])
  const messageListRef              = useRef(null)

  useEffect(() => {
    const list = messageListRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages, loading, isVisible])

  

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userMessage, coords: [] }])
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  },
  body: JSON.stringify({ planId: plan.id, question: userMessage }),
})
const result = await response.json()
if (!response.ok) throw new Error(result.error || 'The AI request failed.')
const reply = result.reply

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
    <section className="ai-panel" aria-labelledby="ai-panel-title">

        {/* Header */}
        <header className="ai-header">
          <div>
            <h2 id="ai-panel-title"><Sparkles size={18} aria-hidden="true" /> AI Assistant</h2>
            <p title={`${plan.title} · ${plan.location}`}>{plan.title} · {plan.location}</p>
          </div>
          <button onClick={onClose} className="ai-minimize" aria-label="Minimize AI assistant"><Minus size={20} aria-hidden="true" /></button>
        </header>

        {/* Map */}
        {mapCoords.length > 0 && <div className="ai-map" role="region" aria-label="Suggested places map">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            style={{ width: "100%", height: "100%" }}
            key={mapCenter.toString()}
          >
            <ResizeMap />
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
        </div>}

        {/* Messages */}
        <div ref={messageListRef} className="ai-messages" role="log" aria-label="AI conversation" aria-live="polite" tabIndex={0}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              ...styles.messageRow,
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
  ...styles.bubble,
  background:   msg.role === "user" ? T.raised : T.card,
  color:        T.text,
  border:       msg.role === "user" ? "none" : `1px solid ${T.border}`,
  borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
}}>
                <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
              <div role="status" style={{ ...styles.bubble, background: T.card, color: T.textSec }}>
                Thinking...
              </div>
            </div>
          )}

        </div>

        {/* Input */}
        <form className="ai-composer" onSubmit={event => { event.preventDefault(); sendMessage() }}>
          <input
            value={input}
            aria-label="Message AI assistant"
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about places, food, activities..."
            className="ai-input"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={loading || !input.trim()}
            className="ai-send send-tap"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </form>

    </section>
  )
}

const styles = {
  messageRow:   { display: "flex" },
  bubble:       { maxWidth: "88%", minWidth: 0, padding: "10px 14px", fontSize: 14, lineHeight: 1.5, overflowWrap: "anywhere" },
}
export default AIChatPanel
