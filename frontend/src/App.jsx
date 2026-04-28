import React, { useState } from 'react'
import { useMsal } from '@azure/msal-react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Payments from './components/Payments'
import Users from './components/Users'
import Files from './components/Files'
import SideNav from './components/SideNav'
import { logout as apiLogout } from './api'


export default function App({ msalAvailable }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [view, setView] = useState('dashboard')
  const [paymentsAction, setPaymentsAction] = useState(null)

  // Only call useMsal if MSAL is available
  const msalContext = msalAvailable ? (() => {
    try {
      return useMsal()
    } catch {
      return null
    }
  })() : null;

  const handleLogin = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const handleLogout = () => {
    const t = localStorage.getItem('token')
    // Call backend logout to blacklist the token (demo)
    if (t) {
      apiLogout(t).catch(() => {
        // ignore errors - still clear client state
      }).finally(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        setToken(null)
        
        // Also logout from Entra if using SSO
        if (msalContext?.accounts.length > 0) {
          msalContext.instance.logoutRedirect({
            account: msalContext.accounts[0],
            postLogoutRedirectUri: window.location.origin,
          }).catch(err => console.error('Entra logout error:', err))
        }
      })
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      setToken(null)
      
      // Also logout from Entra if using SSO
      if (msalContext?.accounts.length > 0) {
        msalContext.instance.logoutRedirect({
          account: msalContext.accounts[0],
          postLogoutRedirectUri: window.location.origin,
        }).catch(err => console.error('Entra logout error:', err))
      }
    }
  }


  if (!token) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Login onLogin={handleLogin} msalAvailable={msalAvailable} />
      </div>
    </div>
  )

  return (
    <div className="flex h-screen">
      <SideNav view={view} setView={setView} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {view === 'dashboard' && <Dashboard token={token} setView={setView} setPaymentsAction={setPaymentsAction} />}
        {view === 'payments' && <Payments token={token} onLogout={handleLogout} paymentsAction={paymentsAction} clearPaymentsAction={() => setPaymentsAction(null)} />}
        {view === 'profile' && <Profile token={token} onLogout={handleLogout} />}
        {view === 'users' && <Users token={token} />}
        {view === 'files' && <Files token={token} />}
      </div>
    </div>
  )
}
