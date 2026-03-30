import React, { useState } from 'react'
import { login } from '../api'
import Register from './Register'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState(localStorage.getItem('username') || 'user')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('username'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const token = await login(username, password)
      // remember username only if user checked rememberMe
      if (rememberMe) {
        localStorage.setItem('username', username)
      } else {
        localStorage.removeItem('username')
      }
      onLogin(token)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (showRegister) {
    return <Register onRegister={onLogin} onCancel={() => setShowRegister(false)} />
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
    <div className="card w-full max-w-md mx-4">
      <h1 className="text-3xl font-bold text-center mt-2 mb-8 text-blue-700">Fortify Demo App</h1>
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="label">Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <span className="text-sm">Remember me</span>
          </label>
          <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => alert('Demo: password reset link would be sent to your registered email.')}>Forgot password?</button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
          <button className="px-3 py-2 bg-gray-200 rounded" type="button" onClick={() => setShowRegister(true)}>Register</button>
        </div>
        {error && <div className="mt-3 text-red-600">{error}</div>}
      </form>
    </div>
    </div>
  )
}
