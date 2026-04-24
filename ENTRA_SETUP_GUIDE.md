# Microsoft Entra SSO Setup Guide

This guide explains how to add Microsoft Entra ID (formerly Azure AD) single sign-on to the Fortify Demo App.

## Prerequisites

- Microsoft Azure subscription with access to Microsoft Entra ID
- Azure Portal access
- The demo app running locally or in Azure

## Overview

The app now supports two authentication methods:
1. **Local JWT Authentication** (demo mode) - Username/password login
2. **Microsoft Entra SSO** (production-ready) - Single sign-on via Microsoft identity

Both can coexist - users can choose which method to use.

---

## Part 1: Azure Portal Setup

### Step 1.1: Register Frontend Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** → **App registrations** → **New registration**
3. Enter details:
   - **Name**: `fortify-demo-frontend`
   - **Supported account types**: Choose based on your organization
   - **Redirect URI**: Select `Single-page application (SPA)`
     - Add: `http://localhost:5173` (dev)
     - Add: `https://yourdomain.com` (production)
4. Click **Register**
5. On the app overview page, copy and save:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### Step 1.2: Configure Frontend Authentication

1. Go to **Authentication** tab
2. Ensure **Platform configurations** shows SPA with your redirect URIs
3. Under **Implicit grant and hybrid flows**, enable:
   - ☑ Access tokens
   - ☑ ID tokens
4. **Save**

### Step 1.3: Configure API Permissions (Frontend)

1. Go to **API permissions** tab
2. Click **Add a permission**
3. Prefer **APIs my organization uses** (in many tenants, **My APIs** may be empty)
4. Search for your backend app by name or client ID (see Step 1.4)
5. Select delegated permissions (e.g., `access_as_user`)
6. Click **Add permissions**
7. Click **Grant admin consent** if available

Notes:
- If you cannot see **Grant admin consent**, your account likely does not have directory rights to consent on behalf of the tenant.
- In that case, ask an Entra admin to grant consent, or to temporarily assign an app admin role.

### Step 1.4: Register Backend Application

1. Create another app registration:
   - **Name**: `fortify-demo-backend`
   - **Supported account types**: Same as frontend
   - **Redirect URI**: `http://localhost:8080` (not needed for backend, but can add for testing)
2. Click **Register**
3. Copy and save:
   - **Application (client) ID**
   - **Directory (tenant) ID**

### Step 1.5: Configure Backend API Scopes

1. Go to **Expose an API** tab
2. Click **Add a scope**
3. If prompted to set Application ID URI:
   - Accept the suggested URI: `api://<client-id>`
   - Or set custom: `api://fortify-demo-backend`
4. Create scope:
   - **Scope name**: `access_as_user`
   - **Admin consent display name**: `Access Fortify Demo App`
   - **Admin consent description**: `Allows access to the Fortify Demo App API`
   - **User consent display name**: `Access Fortify Demo App`
   - **User consent description**: `Allows access to the Fortify Demo App API`
5. Click **Add scope**
6. Copy the full scope: `api://fortify-demo-backend/access_as_user`

Optional (recommended for easier consent flow):
- In **Expose an API** -> **Authorized client applications**, add your frontend app client ID and authorize `access_as_user`.

### Step 1.6: Configure Backend Authentication

1. Go to **Certificates & secrets** tab
2. Click **New client secret**
3. Add description: `demo-app-secret`
4. Select expiration (e.g., 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret value immediately (you won't see it again)
7. Go to **API permissions** tab
8. Click **Add a permission**
9. Select **Microsoft Graph**
10. Select **Delegated permissions**
11. Search and add: `User.Read`
12. Click **Grant admin consent**

---

## Part 2: Local Development Setup

### Step 2.1: Configure Frontend Environment

1. In `frontend/` directory, create `.env.local`:

```bash
# Copy from .env.example and fill in your Azure values
VITE_ENTRA_CLIENT_ID=<frontend-client-id-from-step-1.1>
VITE_ENTRA_TENANT_ID=<tenant-id-from-step-1.1>
VITE_ENTRA_AUTHORITY=https://login.microsoftonline.com/<tenant-id>
VITE_API_SCOPES=api://<backend-client-id>/access_as_user
VITE_API_REDIRECT_URI=http://localhost:5173
```

If your tenant restrictions prevent consenting to custom API scopes:
- Temporarily set `VITE_API_SCOPES=User.Read` to unblock login while consent issues are resolved.

### Step 2.2: Configure Backend

1. Update `src/main/resources/application.properties`:

```properties
# Uncomment and set these values from Step 1.4 and 1.5:
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://login.microsoftonline.com/<tenant-id>/v2.0
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://login.microsoftonline.com/<tenant-id>/discovery/v2.0/keys
```

### Step 2.3: Build and Run

**Backend:**
```bash
./gradlew bootRun -PskipFrontend=true
# Windows alternative:
.\gradlew.bat bootRun -PskipFrontend=true
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The app should now be running at `http://localhost:5173` with:
- A "Sign in with Microsoft" button (if Entra is configured)
- A fallback local login form

---

## Part 3: Testing

### Test Entra Login
1. Click "Sign in with Microsoft" button
2. Sign in with your organizational account
3. You should be redirected back to the main app tab and logged in

### Test Local Fallback
1. Click the local login form (below "or" divider)
2. Use demo credentials
3. You should be able to log in

### Troubleshooting

**"Entra SSO not configured" error**
- Verify `.env.local` is set correctly
- Restart frontend dev server after changing `.env.local`
- Check browser console for MSAL errors

**Token validation fails on backend**
- Verify `application.properties` has correct issuer URI and JWK set URI
- Check that tenant ID matches in both frontend and backend configs
- Restart backend after config changes

**Cannot find backend app under "My APIs"**
- Use **APIs my organization uses** instead.
- Search by backend app name or backend client ID.
- Ensure frontend and backend app registrations are in the same tenant.

**No "Grant admin consent" button shown**
- Your account likely lacks directory consent permissions.
- Ask an Entra admin to grant consent (or assign temporary app admin rights).

**"Entra login failed: Token exchange failed"**
- Confirm backend is actually running on port 8080 during login.
- Confirm frontend is using the latest `.env.local` values.
- Confirm API permission for `access_as_user` is added and consented, or use temporary fallback `VITE_API_SCOPES=User.Read`.

**"The iss claim is not valid"**
- This means issuer mismatch between token and configured issuer URI.
- For this demo app, a fallback decoder path was added to accept signature-valid tokens when issuer differs.
- For production, do not rely on this fallback; enforce strict issuer and audience validation.

**Redirect URI mismatch**
- Ensure registered redirect URIs in Azure Portal match your deployment URL
- Ensure `http://localhost:5173` is configured for local development

---

## Entra Security Findings (Intentional)

These items are intentionally left insecure in this demo so scanners and reviewers can identify and discuss them.

- INSECURE (intentional): backend token exchange can fall back to relaxed issuer handling when issuer claim mismatch occurs. Secure alternative: enforce strict issuer and audience validation for the expected tenant and API only.
- INSECURE (intentional): frontend may fall back from custom API scope to `User.Read` when consent is unavailable. Secure alternative: require only explicit API scopes and block login if required scope consent is missing.
- INSECURE (intentional): Entra access tokens are exchanged for local demo JWTs without strong claim hardening (for example strict audience/tenant/azp checks). Secure alternative: validate required claims before minting any local session token.
- INSECURE (intentional): token exchange endpoint is publicly reachable and optimized for demo compatibility rather than anti-abuse controls. Secure alternative: add rate limiting, abuse monitoring, and stricter request validation.

---

## Part 4: Production Deployment

### Azure App Service (Example)

1. Set environment variables on the App Service:
   - `VITE_ENTRA_CLIENT_ID`
   - `VITE_ENTRA_TENANT_ID`
   - `VITE_ENTRA_AUTHORITY`
   - `VITE_API_SCOPES`
   - `VITE_API_REDIRECT_URI` (set to your production domain)

2. Update backend config:
   - Set `spring.security.oauth2.resourceserver.jwt.issuer-uri`
   - Set `spring.security.oauth2.resourceserver.jwt.jwk-set-uri`

3. Update Azure Portal app registrations:
   - Add production redirect URIs (e.g., `https://yourapp.azurewebsites.net`)
   - Remove localhost URIs

4. Deploy the app

---

## Security Notes

This implementation demonstrates SSO integration. For production use, consider:

- Store secrets (client secrets) in Azure Key Vault, not in code
- Enable conditional access policies in Entra
- Use HTTPS only in production
- Implement proper token refresh logic
- Add rate limiting to token exchange endpoint
- Enable audit logging for auth events
- Regularly rotate client secrets

Demo-specific implementation note:
- The backend currently includes an issuer-mismatch fallback decoder to improve compatibility across tenant/account setups used in this demo.
- This is intentionally relaxed behavior for demo/training purposes and should be removed in production.

---

## References

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Spring Security OAuth2 Resource Server](https://spring.io/projects/spring-security-oauth2-resource-server)
- [Azure AD App Registration Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
