import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-surface)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-primary">serenity</h1>
          <p className="text-secondary mt-2">Welcome back. Take your time.</p>
        </div>

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

          <div>
            <label className="block text-sm text-secondary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-full"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Forgot password?{' '}
          <Link to="/forgot-password" className="text-brand hover:underline">
            Reset
          </Link>
          <span className="mx-2">·</span>
          New here?{' '}
          <Link to="/register" className="text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}