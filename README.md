# Fortify Demo App

## ⚠️ WARNING
**This application contains intentional security vulnerabilities and should NEVER be deployed to production or exposed to the internet.**  
This is for educational and demonstration purposes only.

## Overview

This is a simple Spring Boot application that demonstrates various security vulnerabilities that can be detected by application security testing tools such as provided by [OpenText Application Security](https://www.opentext.com/products/application-security).

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

See [ENTRA_SETUP_GUIDE.md](ENTRA_SETUP_GUIDE.md) for information on how to setup Login Authentication using Microsoft Entra.

## Intentional Security Vulnerabilities

This application includes the following intentional security vulnerabilities:

### 1. SQL Injection
- Unparameterized SQL queries in `UserService`
- Direct concatenation of user input in SQL statements

### 2. Path Traversal
- File operations without path validation in `FileService`
- Allows reading/writing arbitrary files on the system

### 3. Command Injection
- Direct execution of user-supplied commands in `FileService`
No input validation or sanitization

### 4. Cross-Site Scripting (XSS)
- Unescaped user input reflected in HTML responses
- No output encoding in `UserController`

### 5. Hardcoded Credentials/Secrets
- Hardcoded API keys in source code
- Hardcoded database credentials in `application.properties`
- Exposed secrets in configuration files

### 6. Weak Cryptography
- Use of MD5 for password hashing (cryptographically broken)
- Plain text password storage

### 7. Information Disclosure
- Exposure of stack traces to users
- Sensitive credentials exposed via API endpoints
- Database credentials accessible through debug endpoints

### 8. Insecure Authentication
- Weak password validation
- Plain text password comparison
- Password echoed back in login response

### 9. Insecure Payment Handling
- Storing full payment card PAN and CVV in plain text (`Payment` entity) - PCI/PII violation (INSECURE, demo only)
- Debug endpoints that return or log raw card numbers (`/api/payments/debug/rawcards`) — information disclosure
- No input validation or sanitization on payment inputs (allows malformed/attacker-controlled values)
- Missing access controls and audit for payment operations (debug endpoints expose sensitive data even with minimal auth)
- No encryption or tokenization for payment data at rest or in transit beyond default TLS (demo lacks proper PCI controls)

### 10. Insecure Entra / OAuth Token Handling
- Relaxed issuer validation fallback for Entra token exchange (accepts signature-valid token even when issuer claim mismatches) - INSECURE demo behavior
- Token exchange endpoint accepts externally obtained Entra access tokens and converts them to local demo JWTs with minimal claim hardening
- Frontend may fall back from custom API scope to `User.Read` when consent is unavailable, weakening intended API audience restrictions
- Auth artifacts are cached in browser localStorage, increasing exposure if XSS is present
- Audience (`aud`) and Authorized Party (`azp`) claims are not validated in token exchange
- Backend disables CSRF protection for authentication flows

## Building the Application

```bash
# with a local Gradle installation
gradle clean build

# or using the Gradle wrapper (recommended if present)
./gradlew clean build
```

## Running the Application

```bash
# with a local Gradle installation
gradle bootRun

# or using the Gradle wrapper (recommended if present)
./gradlew bootRun

# or run the jar file:
java -jar build/libs/fortify-demo-app-1.0.0-SNAPSHOT.jar

# or if you have Docker installed
docker build .
docker run -d --name fortify-demo-app -p 8080:8080 fortify-demo-app:latest
```

The application will be available on `http://localhost:8080`, you can browse to the frontend at this address or the Backend API at `http://localhost:8080/swagger-ui/index.html`.

## Developing the Application

If you wish to develop new features for the application you can start the backend and frontend up separately. To start the backend (without frontend):

```
./gradlew clean bootRun -PskipFrontend=true
```

Then to start the frontend:

```
cd frontend
npm run dev
```

Note: if you make changes to the frontend the vite server will automatically reload. However, for changes to the backend you will need to stop and start the backend.

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

## Testing with OpenText Application Security (Fortify)

This application is designed to be scanned with OpenText Application Security's SAST, SCA and DAST engines as well as AI remediation using Aviator.

Most of the vulnerabilities described above should be detected during static analysis. 

You can use the [Postman collection](postman/FortifyDemoApp.postman_collection.json) provided to run a DAST API scan.

You can use the [Login macro](fortify/FortifyDemoApp-Dev-Login.webmacro) provided to run a DAST Website scan.

Note: the Login macro above sets the Logout condition URL to the custom logout endpoint used by this app:
```
[URI]/api/users/logout
```
This tells the scanner the application logout location so it can detect end-of-session events.

### Expected Findings

The security scan should identify:
- Multiple SQL Injection vulnerabilities
- Path Traversal vulnerabilities
- Command Injection vulnerabilities
- Cross-Site Scripting (XSS) vulnerabilities
- Hardcoded credentials and API keys
- Weak cryptographic algorithms
- Information disclosure issues
- Insecure authentication mechanisms
- Insecure storage and exposure of payment card data (plain-text PAN/CVV) — PCI/PII issues
- Endpoints that deliberately log or reflect sensitive payment data (information disclosure)
- OAuth / OpenID Connect token validation weaknesses in the Entra integration
- Weak claim validation and insecure token exchange behavior in the Entra login flow

## License

This project is for demonstration purposes only. See [LICENSE](./LICENSE) file for additional details.