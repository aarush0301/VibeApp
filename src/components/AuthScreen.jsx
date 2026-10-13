import { useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { T } from '../theme.js'

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode]         = useState("login")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]         = useState("")
  const [college, setCollege]   = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async () => {
    setError("")
    if (!email.trim() || !password.trim()) return setError("Email and password required")
    if (mode === "signup" && (!name.trim() || !college.trim())) return setError("Name and college required")

    setLoading(true)

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      const newUserId = data.user.id
      const { error: profileError } = await supabase.from('users').insert({
        id: newUserId,
        name: name.trim(),
        college: college.trim(),
        year: "",
        age: null,
        bio: "",
        vibes: [],
      })

      if (profileError) {
        setError("Account created but profile setup failed: " + profileError.message)
        setLoading(false)
        return
      }

      onAuthSuccess(newUserId)

    } else {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }

      onAuthSuccess(data.user.id)
    }

    setLoading(false)
  }

  return (
    <div style={styles.screen}>
      <div style={styles.hero}>
        <div style={styles.logo}>✌️</div>
        <h1 style={styles.appName}>Vibe App</h1>
        <p style={styles.tagline}>College plans, your crew, your vibe</p>
      </div>

      <div style={styles.card}>
        <div style={styles.tabRow}>
          <button onClick={() => setMode("login")} className="tap" style={{ ...styles.tabBtn, background: mode === "login" ? T.orange : "transparent", color: mode === "login" ? "#fff" : T.textMut }}>
            Log In
          </button>
          <button onClick={() => setMode("signup")} className="tap" style={{ ...styles.tabBtn, background: mode === "signup" ? T.orange : "transparent", color: mode === "signup" ? "#fff" : T.textMut }}>
            Sign Up
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {mode === "signup" && (
          <>
            <label style={styles.label}>Full name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={styles.input} />

            <label style={styles.label}>College</label>
            <input value={college} onChange={e => setCollege(e.target.value)} placeholder="Your college" style={styles.input} />
          </>
        )}

        <label style={styles.label}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" type="email" style={styles.input} />

        <label style={styles.label}>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={styles.input} />

        <button onClick={handleSubmit} disabled={loading} className="tap" style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </button>
      </div>
    </div>
  )
}

const styles = {
  screen:    { minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" },
  hero:      { textAlign: "center", marginBottom: 32 },
  logo:      { fontSize: 48, marginBottom: 8 },
  appName:   { fontSize: 26, fontWeight: "800", color: T.text, marginBottom: 4, letterSpacing: -0.5 },
  tagline:   { fontSize: 13, color: T.textMut },
  card:      { background: T.card, borderRadius: 20, padding: 24, border: `1px solid ${T.border}` },
  tabRow:    { display: "flex", gap: 8, marginBottom: 20, background: T.muted, borderRadius: 12, padding: 4 },
  tabBtn:    { flex: 1, padding: "10px 0", borderRadius: 9, border: "none", fontSize: 14, fontWeight: "700", fontFamily: "inherit", cursor: "pointer" },
  label:     { display: "block", fontSize: 12, fontWeight: "600", color: T.textMut, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 },
  input:     { width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.muted, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 16, color: T.text },
  error:     { background: "#2D1810", color: "#FF8060", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16, border: "1px solid #4A2A1A" },
  submitBtn: { width: "100%", padding: 14, borderRadius: 12, border: "none", background: T.orange, color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "inherit", cursor: "pointer", marginTop: 4 },
}

export default AuthScreen