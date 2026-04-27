import React from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import App from './App'
import { msalConfig } from './authConfig'
import './index.css'

// Initialize MSAL if Entra config is available, otherwise run without SSO
let msalInstance = null
if (import.meta.env.ENTRA_CLIENT_ID) {
  msalInstance = new PublicClientApplication(msalConfig)
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {msalInstance ? (
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
)
