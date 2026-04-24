// Microsoft Authentication Library (MSAL) configuration

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: import.meta.env.VITE_ENTRA_AUTHORITY,
    redirectUri: import.meta.env.VITE_API_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_API_REDIRECT_URI || window.location.origin,
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

export const popupRedirectUri =
  import.meta.env.VITE_ENTRA_POPUP_REDIRECT_URI || `${window.location.origin}/auth-popup.html`;

export const loginRequest = {
  scopes: (import.meta.env.VITE_API_SCOPES || 'User.Read')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
