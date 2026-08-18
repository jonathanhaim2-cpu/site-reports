import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AUTH_KEY = 'sitereports_auth_token'

export function loadToken() {
  try {
    const t = localStorage.getItem(AUTH_KEY)
    if (!t) return null
    const [expires] = t.split('.')
    if (Date.now() > Number(expires)) { localStorage.removeItem(AUTH_KEY); return null }
    return t
  } catch { return null }
}

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const attempt = async () => {
    if (!password || loading) return
    setLoading(true)
    setError(false)
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (r.ok) {
        const { token } = await r.json()
        localStorage.setItem(AUTH_KEY, token)
        navigate('/dashboard')
      } else {
        setError(true)
        setPassword('')
      }
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <div className="page center">
      <div className="card login-card">
        <img src="/logo.png" alt="קל פלד" className="brand-logo" style={{ marginBottom: 12 }} />
        <h1>כניסת מנהלים</h1>
        <p className="muted">דשבורד דיווחי אתרים - למורשים בלבד</p>
        <input
          className={`text-input ${error ? 'input-error' : ''}`}
          type="password"
          placeholder="סיסמה"
          value={password}
          autoFocus
          onChange={e => { setError(false); setPassword(e.target.value) }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
        />
        {error && <p className="error-msg">סיסמה שגויה, נסה שוב</p>}
        <button className="btn" onClick={attempt} disabled={loading}>
          {loading ? '...' : 'כניסה'}
        </button>
      </div>
    </div>
  )
}
