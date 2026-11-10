import { useState } from 'react'
import { ArrowRight, CircleAlert, CircleCheck, Eye, EyeOff, Coffee, Mountain, Utensils } from 'lucide-react'
import { supabase } from '../supabaseClient.js'
import { T } from '../theme.js'
import './AuthScreen.css'
import Brand from './Brand.jsx'

const HEADINGS = {
  login:  ['Welcome back', 'Your people. Your plans. Right here.'],
  signup: ['Create your account', 'Your next good story starts here.'],
  forgot: ['Reset your password', 'Enter your email and we will send you a link.'],
  reset:  ['Choose a new password', 'Pick one you have not used here before.'],
}
const LABELS = {
  login:  'Log in',
  signup: 'Create account',
  forgot: 'Send reset link',
  reset:  'Update password',
}
const LOADING_LABELS = {
  login:  'Logging in…',
  signup: 'Creating account…',
  forgot: 'Sending link…',
  reset:  'Updating…',
}

function AuthScreen({ onAuthSuccess, recovery = false, onRecoveryDone }) {
  const [mode, setMode]         = useState(recovery ? "reset" : "login")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]         = useState("")
  const [college, setCollege]   = useState("")
  const [error, setError]       = useState("")
  const [notice, setNotice]     = useState("")
  const [loading, setLoading]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isSignup      = mode === 'signup'
  const isForgot      = mode === 'forgot'
  const isReset       = mode === 'reset'
  const needsEmail    = !isReset
  const needsPassword = !isForgot
  const [title, description] = HEADINGS[mode]

  const changeMode = nextMode => {
    setMode(nextMode)
    setError('')
    setNotice('')
    setShowPassword(false)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (loading) return
    setError("")
    setNotice("")

    if (needsEmail && !email.trim()) return setError("Enter your email.")
    if (needsPassword && !password) return setError(isReset ? "Enter a new password." : "Enter your password.")
    if (isReset && password.length < 6) return setError("Use at least 6 characters.")
    if (isSignup && (!name.trim() || !college.trim())) return setError("Enter your full name and college.")

    setLoading(true)
    try {
      if (isForgot) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        })
        if (resetError) {
          setError(resetError.message)
          return
        }
        setNotice("If an account exists for that email, a reset link is on its way. Check your inbox.")
        return
      }

      if (isReset) {
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) {
          setError(updateError.message)
          return
        }
        onRecoveryDone?.()
        return
      }

      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim(), college: college.trim() } },
        })
        if (signUpError) {
          setError(signUpError.message)
          return
        }
        if (!data.user) {
          setError('Your account could not be created. Please try again.')
          return
        }

        // With email confirmation on, there is no session until the user clicks the link
        if (!data.session) {
          setPassword("")
          setMode("login")
          setNotice("Account created. Check your email, click the confirmation link, then log in.")
          return
        }

        onAuthSuccess(data.user.id)
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
            {!isForgot && !isReset && (
              <div className="auth-modes" role="group" aria-label="Account access">
                {['login', 'signup'].map(option => (
                  <button key={option} type="button" data-auth-mode={option} className="auth-mode-button" aria-pressed={mode === option} disabled={loading} onClick={() => changeMode(option)}>
                    {option === 'login' ? 'Log in' : 'Sign up'}
                  </button>
                ))}
              </div>
            )}

            <div className="auth-heading">
              <h1 id="auth-title">{title}</h1>
              <p id="auth-description">{description}</p>
            </div>

            {error && (
              <div id="auth-error" role="alert" className="auth-error">
                <CircleAlert size={18} aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            {notice && (
              <div role="status" style={noticeStyle}>
                <CircleCheck size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                <p>{notice}</p>
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

              {needsEmail && (
                <div className="auth-field">
                  <label htmlFor="auth-email">Email</label>
                  <input id="auth-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@college.edu" required disabled={loading} value={email} onChange={event => setEmail(event.target.value)} />
                </div>
              )}

              {needsPassword && (
                <div className="auth-field">
                  <label htmlFor="auth-password">{isReset ? 'New password' : 'Password'}</label>
                  <div className="auth-password">
                    <input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup || isReset ? 'new-password' : 'current-password'} required disabled={loading} value={password} onChange={event => setPassword(event.target.value)} />
                    <button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="auth-password" disabled={loading} onClick={() => setShowPassword(visible => !visible)}>
                      {showPassword ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <button type="button" disabled={loading} onClick={() => changeMode('forgot')} style={linkButton}>
                      Forgot password?
                    </button>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              <span aria-live="polite">{loading ? LOADING_LABELS[mode] : LABELS[mode]}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>

            {isForgot && (
              <button type="button" disabled={loading} onClick={() => changeMode('login')} style={{ ...linkButton, marginTop: 14 }}>
                Back to log in
              </button>
            )}
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

const noticeStyle = {
  display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px',
  borderRadius: 14, background: 'rgba(52,211,153,0.14)', color: '#5EE0B0',
  fontSize: 14, lineHeight: 1.5, marginBottom: 16,
}

const linkButton = {
  background: 'none', border: 'none', padding: 0, marginTop: 8,
  color: 'var(--auth-accent)', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', display: 'block',
}

export default AuthScreen