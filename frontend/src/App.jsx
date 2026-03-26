import React, { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Payments from './components/Payments'
import SideNav from './components/SideNav'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [view, setView] = useState('dashboard')

  const handleLogin = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) return (
    <div style={{ padding: 20 }}>
      <Login onLogin={handleLogin} />
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SideNav view={view} setView={setView} onLogout={handleLogout} />
      <div style={{ padding: 20, flex: 1, overflow: 'auto' }}>
        {view === 'dashboard' && <Dashboard token={token} onLogout={handleLogout} />}
        {view === 'payments' && <Payments token={token} onLogout={handleLogout} />}
        {view === 'profile' && <Profile token={token} onLogout={handleLogout} />}
      </div>
    </div>
  )
}
