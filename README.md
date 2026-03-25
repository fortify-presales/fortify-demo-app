# Fortify Demo App

## ⚠️ WARNING
**This application contains intentional security vulnerabilities and should NEVER be deployed to production or exposed to the internet.**  
This is for educational and demonstration purposes only.

## Overview

This is a simple Spring Boot microservice application that demonstrates various security vulnerabilities that can be detected by application security testing tools such as Fortify Static Code Analyzer or Fortify on Demand and remediated with Fortify Aviator.

## Technologies Used

- Java 17
- Spring Boot 3.2.1
- Spring Data JPA
- H2 In-Memory Database
- Gradle 8.7

## Intentional Security Vulnerabilities

```bash
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

## Building the Application

```bash
# With a local Gradle installation
gradle clean build

# Or using the Gradle wrapper (recommended if present)
./gradlew clean build
```

## Running the Application

```bash
# With a local Gradle installation
gradle bootRun

# Or using the Gradle wrapper (recommended if present)
./gradlew bootRun
```

Or run the jar file:

```bash
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

### H2 Console
- `http://localhost:8080/h2-console` - H2 Database Console

## API Documentation

After starting the application (see "Running the Application"), the OpenAPI JSON and Swagger UI are available at:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Notes:
- These docs describe the intentionally insecure endpoints in this demo application.
- If you changed the server port, update the host/port in the URLs above accordingly.

## Using the JWT (INSECURE demo)

The `/api/users/login` endpoint returns a raw JWT token on successful authentication. Use the token in an `Authorization: Bearer <token>` header to call protected endpoints (all `/api/**` except `/api/users/login` and `/api/users/debug/credentials`).

Examples (replace username/password with valid demo credentials):

curl (bash / Linux / macOS):

```bash
# Obtain token
TOKEN=$(curl -s -X POST "http://localhost:8080/api/users/login?username=alice&password=alice456")
echo "Token: $TOKEN"

# Call a protected endpoint
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/users"
```

PowerShell (Windows):

```powershell
# Obtain token
$token = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/users/login?username=alice&password=alice456"
Write-Host "Token: $token"

# Call a protected endpoint
Invoke-RestMethod -Uri "http://localhost:8080/api/users" -Headers @{ Authorization = "Bearer $token" }
```

Notes:
- The token returned by the demo is intentionally insecure (hard-coded secret and demo claims). Do not reuse in production.
- If your server port differs, update the URLs accordingly.

Seeded demo users:

- `alice` / `alice456` (see [src/main/java/com/opentext/appsec/demo/DataInitializer.java](src/main/java/com/opentext/appsec/demo/DataInitializer.java#L1-L25))

## Testing with Fortify

This application is designed to be scanned with Fortify Static Code Analyzer or Fortify on Demand. The vulnerabilities should be detected during static analysis.

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

## License

This project is for demonstration purposes only. See LICENSE file for details.

