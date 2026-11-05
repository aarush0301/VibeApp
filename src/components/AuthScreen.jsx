import { useState } from 'react'
import { ArrowRight, CircleAlert, Eye, EyeOff, Coffee, Mountain, Utensils } from 'lucide-react'
import { supabase } from '../supabaseClient.js'
import { T } from '../theme.js'
import './AuthScreen.css'
import Brand from './Brand.jsx'

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode]         = useState("login")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]         = useState("")
  const [college, setCollege]   = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isSignup = mode === 'signup'

  const changeMode = nextMode => {
    setMode(nextMode)
    setError('')
    setShowPassword(false)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (loading) return
    setError("")
    if (!email.trim() || !password) return setError("Enter your email and password.")
    if (isSignup && (!name.trim() || !college.trim())) return setError("Enter your full name and college.")

    setLoading(true)
    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (signUpError) {
          setError(signUpError.message)
          return
        }
        if (!data.user) {
          setError('Your account could not be created. Please try again.')
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
          return
        }
        onAuthSuccess(newUserId)
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (loginError) {
          setError(loginError.message)
          return
        }
        if (!data.user) {
          setError('You could not be logged in. Please try again.')
          return
        }
        onAuthSuccess(data.user.id)
      }
    } catch {
      setError('Could not connect. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-screen" style={themeVariables}>
      <div className="auth-layout">
        <div className="auth-intro">
          <div className="auth-brand"><Brand /></div>
          <p className="auth-tagline">
            College plans,<br /> your crew,<br /> <span>your vibe.</span>
          </p>
          <p className="auth-intro-copy">The best part of college happens between the plans. Find a hangout, meet your people, and make it a story.</p>
          <div className="auth-activities" aria-label="Find your kind of plan">
            <span><Coffee size={20} />Coffee & catch-ups</span>
            <span><Mountain size={20} />A little adventure</span>
            <span><Utensils size={20} />Late-night food runs</span>
          </div>
          <p className="auth-signoff">Less scrolling. More showing up.</p>
        </div>

        <div className="auth-panel">
          <form onSubmit={handleSubmit} aria-labelledby="auth-title" aria-describedby="auth-description" aria-busy={loading}>
            <div className="auth-modes" role="group" aria-label="Account access">
              {['login', 'signup'].map(option => (
                <button key={option} type="button" data-auth-mode={option} className="auth-mode-button" aria-pressed={mode === option} disabled={loading} onClick={() => changeMode(option)}>
                  {option === 'login' ? 'Log in' : 'Sign up'}
                </button>
              ))}
            </div>

            <div className="auth-heading">
              <h1 id="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
              <p id="auth-description">{isSignup ? 'Your next good story starts here.' : 'Your people. Your plans. Right here.'}</p>
            </div>

            {error && (
              <div id="auth-error" role="alert" className="auth-error">
                <CircleAlert size={18} aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <div className="auth-fields">
              {isSignup && (
                <>
                  <div className="auth-field">
                    <label htmlFor="auth-name">Full name</label>
                    <input id="auth-name" name="name" autoComplete="name" placeholder="Your full name" required disabled={loading} value={name} onChange={event => setName(event.target.value)} />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="auth-college">College</label>
                    <input id="auth-college" name="college" autoComplete="organization" placeholder="Your college" required disabled={loading} value={college} onChange={event => setCollege(event.target.value)} />
                  </div>
                </>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email</label>
                <input id="auth-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@college.edu" required disabled={loading} value={email} onChange={event => setEmail(event.target.value)} />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <div className="auth-password">
                  <input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} required disabled={loading} value={password} onChange={event => setPassword(event.target.value)} />
                  <button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="auth-password" disabled={loading} onClick={() => setShowPassword(visible => !visible)}>
                    {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              <span aria-live="polite">{loading ? (isSignup ? 'Creating account…' : 'Logging in…') : isSignup ? 'Create account' : 'Log in'}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>
          <p className="auth-bottom-note">Made for life after class.</p>
        </div>
      </div>
    </main>
  )
}

const themeVariables = {
  '--auth-bg': T.bg,
  '--auth-panel': T.card,
  '--auth-raised': T.raised,
  '--auth-border': T.chip,
  '--auth-divider': T.border,
  '--auth-text': T.text,
  '--auth-secondary': T.textSec,
  '--auth-accent': T.orange,
}

export default AuthScreen
