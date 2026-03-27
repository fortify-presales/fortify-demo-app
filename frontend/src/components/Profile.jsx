import React, { useEffect, useState } from 'react'
import { getUserByUsername, updateUser } from '../api'

export default function Profile({ token }) {
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
    <div className="max-w-2xl">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.username}</h3>
              <div className="text-sm text-gray-500">{user.email || 'No email set'}</div>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">Active</span>
          </div>
        </div>
        {message && <div className="mb-3 text-green-600">{message}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" value={user.username} disabled />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user.email || ''} onChange={(e) => setUser({...user, email: e.target.value})} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={user.password || ''} onChange={(e) => setUser({...user, password: e.target.value})} />
          </div>
          <div className="pt-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
