// Microsoft Authentication Library (MSAL) configuration

const isViteDevServer =
  typeof window !== 'undefined' && window.location && window.location.port === '5173';

const redirectUri = isViteDevServer
  ? (import.meta.env.VITE_API_REDIRECT_URI || window.location.origin)
  : window.location.origin;

const popupRedirectUriValue = isViteDevServer
  ? (import.meta.env.VITE_ENTRA_POPUP_REDIRECT_URI || `${window.location.origin}/auth-popup.html`)
  : `${window.location.origin}/auth-popup.html`;

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: import.meta.env.VITE_ENTRA_AUTHORITY,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message) => {
        if (level === 3) console.error(message);
      },
    },
  },
};

export const popupRedirectUri = popupRedirectUriValue;

export const loginRequest = {
  scopes: (import.meta.env.VITE_API_SCOPES || 'User.Read')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
