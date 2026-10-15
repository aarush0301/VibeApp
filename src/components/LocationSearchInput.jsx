import { useState, useEffect, useRef } from 'react'
import { T } from '../theme.js'

function buildLabel(p) {
  const main  = p.name || p.street || p.city || p.state || p.country || "Unknown place"
  const extra = [p.district, p.city, p.state].filter(part => part && part !== main)
  return [main, ...extra.slice(0, 2)].join(", ")
}

function buildSubtitle(p) {
  return [p.street, p.district, p.city, p.state, p.country].filter(Boolean).join(", ")
}

function LocationSearchInput({ value, onChange }) {
  const [query, setQuery]               = useState(value || "")
  const [suggestions, setSuggestions]   = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [searched, setSearched]         = useState(false)
  const wrapperRef = useRef(null)
  const skipSearch = useRef(false)

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

  // Debounced search that cancels outdated requests
  useEffect(() => {
    if (skipSearch.current) {
      skipSearch.current = false
      return
    }

    const q = query.trim()
    if (q.length < 2) {
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`,
          { signal: controller.signal }
        )
        const data = await res.json()

        const seen = new Set()
        const results = (data.features || [])
          .map(f => ({
            label:    buildLabel(f.properties),
            subtitle: buildSubtitle(f.properties),
            lat:      f.geometry.coordinates[1],
            lng:      f.geometry.coordinates[0],
          }))
          .filter(r => {
            const key = r.label + r.subtitle
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })

        setSuggestions(results)
        setSearched(true)
      } catch (err) {
        if (err.name === "AbortError") return
        setSuggestions([])
        setSearched(true)
      }
      setLoading(false)
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const handleTyping = (text) => {
    setQuery(text)
    if (text.trim().length < 2) {
      setSuggestions([])
      setSearched(false)
    }
    onChange(text, null, null) // typed text has no coordinates until a suggestion is picked
    setShowDropdown(true)
  }

  const selectSuggestion = (place) => {
    skipSearch.current = true
    setQuery(place.label)
    onChange(place.label, place.lat, place.lng)
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

      {loading && <div style={styles.hint}>Searching...</div>}

      {showDropdown && suggestions.length > 0 && (
        <div style={styles.dropdown}>
          {suggestions.map((place, i) => (
            <div key={i} onClick={() => selectSuggestion(place)} style={styles.item}>
              <div style={{ fontSize: 14, color: T.text, fontWeight: "600" }}>📍 {place.label}</div>
              {place.subtitle && (
                <div style={{ fontSize: 12, color: T.textMut, marginTop: 2 }}>{place.subtitle}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown && searched && !loading && suggestions.length === 0 && (
        <div style={styles.hint}>No places found. Try a different spelling.</div>
      )}
    </div>
  )
}

const styles = {
  input:    { width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", color: T.text, marginBottom: 4 },
  hint:     { fontSize: 12, color: T.textMut, padding: "4px 2px", marginBottom: 12 },
  dropdown: { position: "absolute", top: "100%", left: 0, right: 0, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, marginTop: 4, maxHeight: 260, overflowY: "auto", zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" },
  item:     { padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${T.border}` },
}

export default LocationSearchInput