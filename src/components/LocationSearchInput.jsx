import { useState, useEffect, useRef } from 'react'
import { T } from '../theme.js'

function LocationSearchInput({ value, onChange }) {
  const [query, setQuery]               = useState(value || "")
  const [suggestions, setSuggestions]   = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading]           = useState(false)
  const wrapperRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`
        )
        const data = await res.json()
        setSuggestions(data)
      } catch {
        setSuggestions([])
      }
      setLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  const handleTyping = (text) => {
    setQuery(text)
    onChange(text) // keep parent form updated even before a suggestion is picked
    setShowDropdown(true)
  }

  const selectSuggestion = (place) => {
    // Build a clean short label like "Andheri, Mumbai"
    const parts = place.display_name.split(",").map(p => p.trim())
    const label = parts.slice(0, 2).join(", ")

    setQuery(label)
    onChange(label)
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        value={query}
        onChange={e => handleTyping(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        placeholder="Search any city, area, or landmark..."
        style={styles.input}
      />

      {loading && (
        <div style={styles.loadingText}>Searching...</div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div style={styles.dropdown}>
          {suggestions.map((place, i) => (
            <div
              key={i}
              onClick={() => selectSuggestion(place)}
              style={styles.suggestionItem}
            >
              📍 {place.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  input:           { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", color: T.text, marginBottom: 4 },
  loadingText:     { fontSize: 12, color: T.textMut, padding: "4px 2px", marginBottom: 12 },
  dropdown:        { position: "absolute", top: "100%", left: 0, right: 0, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, marginTop: 4, maxHeight: 220, overflowY: "auto", zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" },
  suggestionItem:  { padding: "10px 14px", fontSize: 13, color: T.textSec, cursor: "pointer", borderBottom: `1px solid ${T.border}` },
}

export default LocationSearchInput