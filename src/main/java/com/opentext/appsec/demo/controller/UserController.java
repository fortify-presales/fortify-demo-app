package com.opentext.appsec.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.service.UserService;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

/**
 * User controller with intentional security vulnerabilities.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private com.opentext.appsec.demo.security.JwtUtil jwtUtil;

    /**
     * Get all users.
     */
    @Operation(summary = "Get all users", security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")})
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * Search users with SQL injection vulnerability.
     */
    @Operation(summary = "Search users (insecure - demo)", security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")})
    @GetMapping("/search")
    public List<User> searchUsers(@Parameter(description = "Search query (unsanitized, demonstrates SQLi)") @RequestParam String query) {
        // Passes unsanitized input to service - SQL Injection
        return userService.searchUsers(query);
    }

    /**
     * Find user by username with SQL injection vulnerability.
     */
    @Operation(summary = "Find user by username (insecure - demo)", security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")})
    @GetMapping("/find")
    public ResponseEntity<User> findUser(@Parameter(description = "Username to find (unsanitized, demonstrates SQLi)") @RequestParam String username) {
        // SQL Injection vulnerability
        User user = userService.findUserByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Create a new user.
     * Stores password in plain text.
     */
        @Operation(summary = "Create a new user (stores plaintext password - INSECURE)",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "User object to create"),
            security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")})
    @PostMapping
    public User createUser(@RequestBody User user) {
        // No password hashing - stores plain text password
        return userService.createUser(user);
    }

    /**
     * Authenticate user with weak authentication.
     */
    @Operation(summary = "Authenticate user (weak, demo only)", security = {})
    @PostMapping("/login")
    public ResponseEntity<String> login(@Parameter(description = "Username") @RequestParam String username,
                                        @Parameter(description = "Password (plaintext) - INSECURE") @RequestParam String password) {
        // Weak authentication logic
        boolean authenticated = userService.authenticateUser(username, password);
        if (authenticated) {
            // INSECURE (intentional): generate a JWT with a hard-coded secret for demo purposes
            String token = jwtUtil.generateToken(username);
            return ResponseEntity.ok(token);
        }
        return ResponseEntity.status(401).body("Authentication failed");
    }

    /**
     * Get database credentials - exposes sensitive data.
     */
    @Operation(summary = "Get database credentials (insecure - demo)", security = {})
    @GetMapping("/debug/credentials")
    public String getCredentials() {
        // Exposing sensitive credentials
        return userService.getDatabaseCredentials();
    }

    /**
     * Reflect user input without sanitization - XSS vulnerability.
     */
    @Operation(summary = "Welcome page (reflects input - XSS demo)", security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")})
    @GetMapping("/welcome")
    public String welcome(@Parameter(description = "Name to welcome (not escaped)") @RequestParam String name) {
        // Cross-Site Scripting (XSS) vulnerability - no HTML escaping
        return "<html><body><h1>Welcome " + name + "!</h1></body></html>";
    }

    /**
     * Display user profile with XSS vulnerability.
     */
    @Operation(summary = "User profile (reflects message - XSS demo)", security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")})
    @GetMapping("/{id}/profile")
    public String getUserProfile(@Parameter(description = "User id") @PathVariable Long id,
                                 @Parameter(description = "Optional message reflected into HTML (not escaped)") @RequestParam(required = false) String message) {
        // XSS vulnerability - unsanitized user input reflected in HTML
        return "<html><body><h1>User Profile #" + id + "</h1>" +
                (message != null ? "<div class='message'>" + message + "</div>" : "") +
                "</body></html>";
    }
}
