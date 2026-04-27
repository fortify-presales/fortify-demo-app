// Microsoft Authentication Library (MSAL) configuration

const authorityFromTenant = import.meta.env.ENTRA_TENANT_ID
  ? `https://login.microsoftonline.com/${import.meta.env.ENTRA_TENANT_ID}`
  : undefined;

const redirectUri = import.meta.env.ENTRA_API_REDIRECT_URI || window.location.origin;

const popupRedirectUriValue =
  import.meta.env.ENTRA_POPUP_REDIRECT_URI || `${window.location.origin}/auth-popup.html`;

export const msalConfig = {
  auth: {
    clientId: import.meta.env.ENTRA_CLIENT_ID,
    authority: import.meta.env.ENTRA_AUTHORITY || authorityFromTenant,
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
  scopes: (import.meta.env.ENTRA_API_SCOPES || 'User.Read')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
