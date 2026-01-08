# Fortify Aviator Demo

Example Spring Boot microservice application with intentional security vulnerabilities for demonstration of Fortify/OpenText Application Security testing tools.

## ⚠️ WARNING
**This application contains intentional security vulnerabilities and should NEVER be deployed to production or exposed to the internet.**  
This is for educational and demonstration purposes only.

## Overview

This is a simple Spring Boot microservice application that demonstrates various security vulnerabilities that can be detected by application security testing tools such as Fortify Static Code Analyzer and Fortify Aviator.

## Technologies Used

- Java 17
- Spring Boot 3.2.1
- Spring Data JPA
- H2 In-Memory Database
- Maven

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
- No input validation or sanitization

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
mvn clean package
```

## Running the Application

```bash
mvn spring-boot:run
```

Or run the jar file:

```bash
java -jar target/aviator-demo-1.0.0-SNAPSHOT.jar
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

## Testing with Fortify

This application is designed to be scanned with Fortify Static Code Analyzer or Fortify Aviator. The vulnerabilities should be detected during static analysis.

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

