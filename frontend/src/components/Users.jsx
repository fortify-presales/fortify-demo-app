import React, { useEffect, useState } from 'react'
import { getAllUsers } from '../api'

export default function Users({ token }) {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllUsers(token)
        setUsers(res)
      } catch (err) {
        setError(err.message || String(err))
      }
    }
    load()
  }, [token])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      {error && <div className="text-red-600 mb-3">Error: {error}</div>}
      <div className="card">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="p-2">ID</th>
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2 text-sm">{u.id}</td>
                <td className="p-2 font-medium">{u.username}</td>
                <td className="p-2 text-sm text-gray-600">{u.email}</td>
                <td className="p-2 text-sm">{u.role}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-600">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
