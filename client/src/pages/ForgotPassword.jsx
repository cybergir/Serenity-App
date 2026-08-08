import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-surface)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-primary">serenity</h1>
          <p className="text-secondary mt-2">We'll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="card-padded p-8 text-center space-y-4">
            <p className="text-primary">Check your email.</p>
            <p className="text-sm text-secondary">
              If an account exists for {email}, you'll receive a reset link shortly.
            </p>
            <Link to="/login" className="text-sm text-brand hover:underline">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-padded p-8 space-y-5 shadow-sm">
            {error && (
              <div className="rounded-lg text-sm p-3" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input w-full"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <p className="text-center text-sm text-muted">
              <Link to="/login" className="text-brand hover:underline">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}