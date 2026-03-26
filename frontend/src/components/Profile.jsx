import React, { useEffect, useState } from 'react'
import { getUserByUsername, updateUser } from '../api'

export default function Profile({ token, onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const load = async () => {
      const username = localStorage.getItem('username') || 'user'
      const u = await getUserByUsername(username, token)
      setUser(u)
    }
    load()
  }, [token])

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUser(user.id, user, token)
      setMessage('Profile updated')
    } catch (err) {
      setMessage('Update failed: ' + (err.message || err))
    } finally { setLoading(false) }
  }

  if (!user) return <div>Loading profile…</div>

  return (
    <div style={{ maxWidth: 600 }}>
      <h3>Profile</h3>
      {message && <div>{message}</div>}
      <form onSubmit={handleSave}>
        <div>
          <label>Username</label>
          <input value={user.username} disabled />
        </div>
        <div>
          <label>Email</label>
          <input value={user.email || ''} onChange={(e) => setUser({...user, email: e.target.value})} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={user.password || ''} onChange={(e) => setUser({...user, password: e.target.value})} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
