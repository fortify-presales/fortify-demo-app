import React, { useEffect, useState } from 'react'
import { getWelcome } from '../api'

export default function Dashboard({ token, onLogout }) {
  const [welcomeHtml, setWelcomeHtml] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const username = localStorage.getItem('username') || 'user'
        const html = await getWelcome(username, token)
        setWelcomeHtml(html)
      } catch (err) {
        console.error(err)
        setWelcomeHtml('<div>Unable to load welcome message</div>')
      }
    }
    load()
  }, [token])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <div>
        <h3>Welcome</h3>
        <div dangerouslySetInnerHTML={{ __html: welcomeHtml || 'Loading…' }} />
      </div>
    </div>
  )
}
