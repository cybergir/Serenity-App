import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired token.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-surface)' }}>
        <div className="card-padded p-8 text-center">
          <p className="text-secondary">Invalid reset link.</p>
          <Link to="/login" className="text-sm text-brand hover:underline mt-4 block">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-surface)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-primary">serenity</h1>
          <p className="text-secondary mt-2">Choose a new password.</p>
        </div>

        {success ? (
          <div className="card-padded p-8 text-center space-y-4">
            <p className="text-primary">Password reset successful.</p>
            <p className="text-sm text-secondary">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-padded p-8 space-y-5 shadow-sm">
            {error && (
              <div className="rounded-lg text-sm p-3" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-secondary mb-1">New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input w-full" placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="input w-full" placeholder="Type it again" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}