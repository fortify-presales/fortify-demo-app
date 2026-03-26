import React, { useState } from 'react'
import { createUser, login } from '../api'

export default function Register({ onRegister, onCancel }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // create user (backend will return created user)
      await createUser({ username, password, email, role: 'USER' })
      // auto-login after successful registration
      const token = await login(username, password)
      if (onRegister) onRegister(token)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="label">Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit" disabled={loading}>{loading ? 'Registering…' : 'Register'}</button>
          <button className="px-3 py-2 bg-gray-200 rounded" type="button" onClick={onCancel}>Cancel</button>
        </div>
        {error && <div className="mt-3 text-red-600">{error}</div>}
      </form>
    </div>
  )
}
