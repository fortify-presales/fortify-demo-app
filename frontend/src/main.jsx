import React from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import App from './App'
import { msalConfig } from './authConfig'
import './index.css'

// Initialize MSAL if Entra config is available, otherwise run without SSO


let msalInstance = null;
function isCryptoAvailable() {
  return typeof window !== 'undefined'
    && window.isSecureContext
    && window.crypto
    && typeof window.crypto.subtle === 'object';
}

try {
  if (import.meta.env.ENTRA_CLIENT_ID && isCryptoAvailable()) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
} catch (e) {
  // If MSAL fails, log and continue with local login only
  console.warn('MSAL initialization failed, falling back to local login:', e);
  msalInstance = null;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {msalInstance ? (
      <MsalProvider instance={msalInstance}>
        <App msalAvailable={true} />
      </MsalProvider>
    ) : (
      <App msalAvailable={false} />
    )}
  </React.StrictMode>
)
