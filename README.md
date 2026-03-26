# Fortify Demo App

## ⚠️ WARNING
**This application contains intentional security vulnerabilities and should NEVER be deployed to production or exposed to the internet.**  
This is for educational and demonstration purposes only.

## Overview

This is a simple Spring Boot microservice application that demonstrates various security vulnerabilities that can be detected by application security testing tools such as provided by [OpenText Application Security](https://www.opentext.com/products/application-security).

## Technologies Used

- Java 17
- Spring Boot 3.2.1
- Spring Data JPA
- H2 In-Memory Database
- Gradle 8.7

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
```

The application will start on `http://localhost:8080`

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/search?query={query}` - Search users (SQL Injection vulnerable)
- `GET /api/users/find?username={username}` - Find user (SQL Injection vulnerable)
- `POST /api/users` - Create new user
- `POST /api/users/login?username={username}&password={password}` - Login
- `GET /api/users/welcome?name={name}` - Welcome page (XSS vulnerable)
- `GET /api/users/{id}/profile?message={message}` - User profile (XSS vulnerable)
- `GET /api/users/debug/credentials` - Expose database credentials

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
- `GET /api/payments/debug/rawcards` - Debug endpoint returning raw card numbers (requires auth)

### H2 Console
- `http://localhost:8080/h2-console` - H2 Database Console

## API Documentation

After starting the application (see [Running the Application](#running-the-application)), the OpenAPI JSON and Swagger UI are available at:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Notes:
- These docs describe the intentionally insecure endpoints in this demo application.
- If you change the server port, update the host/port in the URLs above accordingly.

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

You can use the postman collection provided to also run a DAST scan.

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

## License

This project is for demonstration purposes only. See [LICENSE](./LICENSE) file for additional details.
