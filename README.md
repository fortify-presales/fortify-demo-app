# Fortify Demo App: Payments Portal

## ⚠️ WARNING
**This application contains intentional security vulnerabilities and should NEVER be deployed to production or exposed to the internet.**  
This is for educational and demonstration purposes only.

## Overview

This is a simple Spring Boot application that demonstrates various security vulnerabilities that can be detected by application security testing tools such as those provided by [Fortify ](https://www.opentext.com/products/application-security).

## Technologies Used

- Java 17
- Spring Boot 3.2.1
- Spring Data JPA
- H2 In-Memory Database
- Gradle 8.7
- React
- Tailwind CSS

Optional:
- Microsoft Entra ID (Azure AD) for Single Sign-On (SSO) and OAuth2 authentication
- MSAL.js (frontend) for Entra login and token handling
- Spring Security (backend) as OAuth2 resource server with Entra JWT validation

See [ENTRA_SETUP_GUIDE.md](docs\ENTRA_SETUP_GUIDE.md) for information on how to setup Login Authentication using Microsoft Entra.

## Intentional Security Vulnerabilities

The application deliberately contains SQL injection, path traversal, command injection, XSS, hardcoded
secrets, weak cryptography, information disclosure, insecure authentication, plaintext cardholder data,
broken object-level authorization and an Entra token-validation downgrade.

See **[VULNERABILITY_CATALOG.md](docs/VULNERABILITY_CATALOG.md)** for the full catalog: each issue with
its CWE, exact location, affected endpoints, a secure alternative, and which tool class (SAST, SCA, DAST
or Fortify Agentic Analyzer) is expected to detect it.

Two issues have dedicated demo write-ups:

- [FAA_BOLA_USE_CASE.md](docs/FAA_BOLA_USE_CASE.md) - broken object-level authorization
- [FAA_ENTRA_ISSUER_VALIDATION_USE_CASE.md](docs/FAA_ENTRA_ISSUER_VALIDATION_USE_CASE.md) - Entra issuer validation downgrade

## Building the Application

The SPA is **not** built by default, so backend-only work never pays the npm cost:

```bash
# backend only - no npm involved
./gradlew build

# full artifact with the SPA embedded in the jar
./gradlew build -PwithFrontend
```

When `-PwithFrontend` is passed, the SPA tasks (`npmInstall` -> `buildFrontend` -> `copyFrontend`) are
incremental: Gradle marks them `UP-TO-DATE` and skips npm unless something under `frontend/` actually
changed. Generated assets are staged in `build/frontend-resources/static` and folded into the jar under
`static/`; nothing is written back into `src/`. `npm ci` is used when a CI environment variable is
present, `npm install` otherwise.

For day-to-day frontend work, do not build the SPA through Gradle at all - use the Vite dev server
described in [Developing the Application](#developing-the-application).

## Running the Application

```bash
# Linux/UNIX example
./gradlew bootRun

# or run the jar file:
java -jar build/libs/fortify-demo-app-1.0.0-SNAPSHOT.jar

# or run with Docker Compose (recommended)
docker compose up --build -d
```

The application frontend UI will then be available on `http://localhost:8080`, or you can browse to the backend API at `http://localhost:8080/swagger-ui/index.html`.

### Docker Compose + Entra Variables

When running with Docker Compose, the frontend is built into static assets during image build. This means frontend Entra settings are read at build time from `frontend/.env.local` (via `--env-file`) and passed as Docker build args.

Expected frontend variables in `frontend/.env.local`:

```dotenv
ENTRA_CLIENT_ID=<frontend-client-id>
ENTRA_TENANT_ID=<tenant-id>
ENTRA_AUTHORITY=https://login.microsoftonline.com/<tenant-id>
ENTRA_API_SCOPES=api://<backend-client-id>/access_as_user
ENTRA_API_REDIRECT_URI=http://localhost:8080
ENTRA_POPUP_REDIRECT_URI=http://localhost:8080/auth-popup.html
```

Backend token validation uses `ENTRA_TENANT_ID` at runtime. You can set this in your root `.env` file or pass it from your shell.

Quick pairing setup for Docker Compose:

```bash
# root backend runtime variable
cp .env.example .env

# frontend build-time variables are read from this file
docker compose --env-file frontend/.env.local up --build -d
```

## Running Playwright End-to-End Tests

Playwright is used for E2E testing of the frontend (React) application. These tests simulate real user workflows and validate the UI and API integration.

### Prerequisites
- Node.js (v18+ recommended)
- All backend and frontend dependencies installed (`npm install` in `frontend/`)
- Backend server running (or use Docker Compose)

### How to Run Tests

1. Open a terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run Playwright tests:
   ```bash
   npx playwright test
   ```
   This will execute all tests in `frontend/tests/`.

### HAR File Generation
- When you run the workflow test, a HAR file of all network traffic is generated at `fortify/network.har` in the repo root.
- This can be analyzed with tools like Chrome DevTools or HAR viewers.

### Screenshots & Debugging
- Screenshots are saved in `frontend/tests/screenshots/` for each major workflow step.
- If a test fails, Playwright will also save a trace for debugging.

### Customizing Test Users
- By default, tests use the seeded user: `user` / `password`.
- You can override credentials with environment variables:
  ```bash
  E2E_USERNAME=myuser E2E_PASSWORD=mypass npx playwright test
  ```

### More Info
- See `frontend/tests/workflow.spec.ts` for the main E2E workflow.
- See Playwright docs: https://playwright.dev/docs/test-intro

## Developing the Application

Run the two sides separately - this is the normal development loop and avoids rebuilding the SPA on
every backend change.

Terminal 1 (backend, no frontend build):

```
# Linux/UNIX example
./gradlew bootRun
```

Terminal 2 (frontend with hot reload):

```
cd frontend
npm run dev
```

Then browse to `http://localhost:5173` - **not** 8080. The Vite dev server proxies every `/api/*`
request to Spring Boot on port 8080 (see `frontend/vite.config.js`), so the browser sees a single
origin and auth/cookies behave the same as in the packaged app.

Notes:
- Frontend edits hot-reload automatically; backend changes require restarting `bootRun`.
- Plain `bootRun` serves no SPA of its own on port 8080. That is expected - use 5173. To exercise the
  embedded single-artifact build, run `./gradlew bootRun -PwithFrontend`.
- Backend-only work needs no frontend at all: use `http://localhost:8080/swagger-ui/index.html` or the
  Postman collection in `fortify/`.

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/search?query={query}` - Search users (SQL Injection vulnerable)
- `GET /api/users/find?username={username}` - Find user (SQL Injection vulnerable)
- `POST /api/users` - Create new user (stores plaintext password — INSECURE demo)
- `PUT /api/users/{id}` - Update user (demo-only)
- `POST /api/users/login?username={username}&password={password}` - Login (returns demo JWT)
- `POST /api/users/logout` - Logout (blacklist provided token)
- `GET /api/users/welcome?name={name}` - Welcome page (XSS vulnerable)
- `GET /api/users/{id}/profile?message={message}` - User profile (XSS vulnerable)
- `GET /api/users/debug/credentials` - Expose database credentials (INSECURE)

### File Operations
- `GET /api/files/read?filename={filename}` - Read file (Path Traversal vulnerable)
- `POST /api/files/write?filename={filename}` - Write file (Path Traversal vulnerable)
- `GET /api/files/exec?cmd={cmd}` - Execute command (Command Injection vulnerable)
- `GET /api/files/shell?input={input}` - Execute shell command (Command Injection vulnerable)
- `GET /api/files/readabs?path={path}` - Read absolute path (Path Traversal vulnerable)
- `DELETE /api/files/delete?filename={filename}` - Delete file (Path Traversal vulnerable)

### Payment Endpoints
- `GET /api/payments` - Get all payments (exposes card data)
- `GET /api/payments/user/{userId}` - Get payments for a user
- `POST /api/payments` - Create a payment method (stores card number/CVV in plain text)
- `DELETE /api/payments/{id}` - Delete a payment method
- `POST /api/payments/charge?paymentId={id}&amount={amt}` - Simulate charging a payment (debug/demo)
- `GET /api/payments/debug/rawcards` - Debug endpoint returning raw card numbers (INSECURE)

### Transactions
- `GET /api/transactions/payment/{paymentId}` - Get transactions for a given payment

### H2 Console
- `http://localhost:8080/h2-console` - H2 Database Console

## API Documentation

After starting the application (see [Running the Application](#running-the-application)), the OpenAPI JSON and Swagger UI are available at:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Notes:
- These docs describe the intentionally insecure endpoints in this demo application.
- If you change the server port, update the host/port in the URLs above accordingly.
- The Swagger UI and OpenAPI JSON remain publicly accessible even when Entra integration is enabled.
- Protected `/api/**` operations still require an `Authorization: Bearer <token>` header when you use `Try it out`.
- You can keep using the API the same way as before by logging in via `/api/users/login` to obtain the demo JWT, then pasting that token into the Swagger **Authorize** dialog.

## Creating the JWT

The `/api/users/login` endpoint returns a raw JWT token on successful authentication. Use the token in an `Authorization: Bearer <token>` header to call protected endpoints (all `/api/**` except `/api/users/login` and `/api/users/debug/credentials`).

Examples (replace username/password with valid demo credentials):

### curl (bash / Linux / macOS):

```bash
# obtain token
TOKEN=$(curl -s -X POST "http://localhost:8080/api/users/login?username=alice&password=alice456")
echo "Token: $TOKEN"

# call a protected endpoint
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/users"
```

### PowerShell (Windows):

```powershell
# obtain token
$token = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/users/login?username=alice&password=alice456"
Write-Host "Token: $token"

# call a protected endpoint
Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Headers @{ Authorization = "Bearer $token" }
```

Notes:
- The token returned by the demo is intentionally insecure (hard-coded secret and demo claims). Do not reuse in production.
- If your server port differs, update the URLs accordingly.

Seeded demo users:

- `alice` / `alice456` (see [src/main/java/com/opentext/appsec/demo/DataInitializer.java](src/main/java/com/opentext/appsec/demo/DataInitializer.java#L1-L25))

## Testing with Postman & Newman

You can test the REST API interactively with Postman or run the collection from the command line using `newman`.

Prerequisites:
- Node.js (v14+)

Run the included Postman collection (uses `{{baseUrl}}` collection variable, default `http://localhost:8080`):

```bash
# run with npx (no global install required)
npx newman run postman/FortifyDemoApp.postman_collection.json
```

If you want HTML output (install reporter locally or use npx):

```bash
npx newman run postman/FortifyDemoApp.postman_collection.json -r cli,html
# The HTML report will be written to the current folder (newman-run-report.html)
```

Notes:
- The `Auth - Login` request uses the seeded `admin` / `admin123` credentials and stores the JWT in a collection variable named `token`.
- Subsequent requests use the header `Authorization: Bearer {{token}}`.

## Testing with Fortify

This application is designed to be scanned with OpenText Application Security's SAST, SCA and DAST engines as well as AI remediation using Aviator.

Most of the vulnerabilities described above should be detected during static analysis. 

You can use the [Postman collection](postman/FortifyDemoApp.postman_collection.json) provided to run a DAST API scan.

You can use the [Login macro](fortify/FortifyDemoApp-Dev-Login.webmacro) provided to run a DAST Website scan.

Note: the Login macro above sets the Logout condition URL to the custom logout endpoint used by this app:
```
[URI]/api/users/logout
```
This tells the scanner the application logout location so it can detect end-of-session events.

## License

This project is for demonstration purposes only. See [LICENSE](./LICENSE) file for additional details.