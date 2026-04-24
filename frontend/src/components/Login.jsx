import React, { useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser'
import { login, exchangeEntraTokenForJwt } from '../api'
import { loginRequest } from '../authConfig'
import Register from './Register'

export default function Login({ onLogin }) {
  // Check if MSAL is available
  const msalContext = (() => {
    try {
      return useMsal()
    } catch {
      return null
    }
  })()

  // Prefill only if rememberMe was explicitly set previously
  const remembered = localStorage.getItem('rememberMe') === 'true'
  // If the demo 'rememberMe' flag was set previously, prefill username/password.
  // INSECURE (intentional): storing passwords in localStorage is unsafe in real apps.
  const [username, setUsername] = useState(remembered ? (localStorage.getItem('username') || '') : '')
  const [password, setPassword] = useState(remembered ? (localStorage.getItem('password') || '') : '')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [rememberMe, setRememberMe] = useState(remembered)
  const primaryScopes = loginRequest.scopes
  const fallbackScopes = ['User.Read']

  const toReadableError = (err) => {
    if (!err) return 'Unknown error'
    if (typeof err === 'string') return err
    return err.errorMessage || err.message || 'Unknown error'
  }

  const withScopeFallback = async (account) => {
    const primaryRequest = { scopes: primaryScopes, account }
    try {
      return await msalContext.instance.acquireTokenSilent(primaryRequest)
    } catch (primaryErr) {
      const canFallback =
        primaryScopes.length !== fallbackScopes.length ||
        primaryScopes.some((s, i) => s !== fallbackScopes[i])
      if (!canFallback) {
        throw primaryErr
      }

      // Fallback for tenants where custom API scopes are not visible/consentable.
      const fallbackRequest = { scopes: fallbackScopes, account }
      return await msalContext.instance.acquireTokenSilent(fallbackRequest)
    }
  }

  useEffect(() => {
    const completeLoginAfterRedirect = async () => {
      if (!msalContext) return
      if (msalContext.inProgress !== InteractionStatus.None) return
      if (!msalContext.accounts || msalContext.accounts.length === 0) return
      if (localStorage.getItem('token')) return

      setLoading(true)
      setError(null)
      try {
        const account = msalContext.accounts[0]
        const tokenResponse = await withScopeFallback(account)
        await completeEntraLogin(tokenResponse)
      } catch (err) {
        // Consent or conditional-access flows can require one more redirect interaction.
        if (err instanceof InteractionRequiredAuthError) {
          await msalContext.instance.acquireTokenRedirect({
            scopes: primaryScopes,
            account: msalContext.accounts[0],
          })
          return
        }
        setError(`Entra login failed: ${toReadableError(err)}`)
        console.error('Entra post-redirect login error:', err)
      } finally {
        setLoading(false)
      }
    }

    completeLoginAfterRedirect()
  }, [msalContext?.inProgress, msalContext?.accounts])

  const completeEntraLogin = async (tokenResponse) => {
    // Exchange Entra token for JWT from backend
    const jwtToken = await exchangeEntraTokenForJwt(tokenResponse.accessToken)
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('username', tokenResponse.account?.username || '')
    onLogin(jwtToken)
  }

  const handleLocalLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const token = await login(username, password)
      // persist rememberMe and username only when requested
      if (rememberMe) {
        // INSECURE (intentional): demo persists password to localStorage when rememberMe is used
        localStorage.setItem('username', username)
        localStorage.setItem('password', password)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('username')
        localStorage.removeItem('password')
        localStorage.removeItem('rememberMe')
      }
      onLogin(token)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMsalLogin = async () => {
    if (!msalContext) {
      setError('Entra SSO not configured')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await msalContext.instance.loginRedirect({ scopes: primaryScopes })
    } catch (err) {
      // Fallback for tenants where app-specific scopes cannot be consented by this user.
      if (primaryScopes.join(',') !== fallbackScopes.join(',')) {
        try {
          await msalContext.instance.loginRedirect({ scopes: fallbackScopes })
          return
        } catch (fallbackErr) {
          setError('Entra login failed: ' + toReadableError(fallbackErr))
          console.error('Entra login fallback error:', fallbackErr)
          setLoading(false)
          return
        }
      }
      setError('Entra login failed: ' + toReadableError(err))
      console.error('Entra login error:', err)
      setLoading(false)
      return
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
      
      {/* Entra SSO login button (shown if configured) */}
      {msalContext && (
        <div className="mb-4">
          <button
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            type="button"
            onClick={handleMsalLogin}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in with Microsoft'}
          </button>
          <div className="my-4 flex items-center">
            <div className="flex-1 border-t"></div>
            <span className="px-2 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t"></div>
          </div>
        </div>
      )}

      {/* Local login form */}
      <form onSubmit={handleLocalLogin}>
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
