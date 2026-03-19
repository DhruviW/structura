import { useState } from 'react'
import { useAuthStore } from './authStore'

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, error } = useAuthStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSignUp) {
      await signUpWithEmail(email, password, displayName)
    } else {
      await signInWithEmail(email, password)
    }
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: 400,
    margin: '80px auto',
    padding: '2rem',
    fontFamily: 'sans-serif',
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    marginBottom: '1rem',
    padding: '0.5rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
  }

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '0.75rem',
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {isSignUp ? 'Create Account' : 'Sign In'} — Structura
      </h2>

      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: 4,
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <input
            style={inputStyle}
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required={isSignUp}
          />
        )}
        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={btnStyle} type="submit" disabled={loading}>
          {loading ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button style={btnStyle} onClick={signInWithGoogle} disabled={loading}>
        Sign in with Google
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button
          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}
