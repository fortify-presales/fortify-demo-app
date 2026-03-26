package com.opentext.appsec.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.service.UserService;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

/**
 * User controller with intentional security vulnerabilities.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Log logger = LogFactory.getLog(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private com.opentext.appsec.demo.security.JwtUtil jwtUtil;

    @Autowired
    private com.opentext.appsec.demo.security.TokenBlacklistService blacklistService;

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
                requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "User object to create"))
        @PostMapping
        public User createUser(@RequestBody(required = false) String rawBody) {
            try {
                logger.info("createUser rawBody: " + rawBody);
                if (rawBody == null || rawBody.isBlank()) {
                    throw new IllegalArgumentException("Empty request body");
                }
                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<String, Object> body = om.readValue(rawBody, java.util.Map.class);
                User user = new User();
                Object u = body.get("username");
                Object p = body.get("password");
                Object e = body.get("email");
                Object r = body.get("role");
                if (u != null) user.setUsername(u.toString());
                if (p != null) user.setPassword(p.toString());
                if (e != null) user.setEmail(e.toString());
                user.setRole(r != null ? r.toString() : "USER");
                return userService.createUser(user);
            } catch (Exception ex) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid request: " + ex.getMessage(), ex);
            }
        }

    /**
     * Update an existing user (demo only).
     */
    @Operation(summary = "Update user (demo)")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updated) {
        User existing = userService.getAllUsers().stream().filter(u -> u.getId().equals(id)).findFirst().orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        // INSECURE (demo): allow updating email and password directly
        existing.setEmail(updated.getEmail());
        existing.setPassword(updated.getPassword());
        existing.setRole(updated.getRole());
        // Do not change username in this demo
        // Save via userService
        userService.createUser(existing);
        return ResponseEntity.ok(existing);
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
     * Logout: blacklist the provided token until its expiry.
     */
    @Operation(summary = "Logout (blacklist token)")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                long exp = jwtUtil.getExpirationMillis(token);
                // Blacklist token until its expiry
                blacklistService.blacklistToken(token, exp);
                return ResponseEntity.ok("Logged out") ;
            } catch (Exception ex) {
                logger.warn("Failed to parse token during logout", ex);
                return ResponseEntity.status(400).body("Invalid token") ;
            }
        }
        return ResponseEntity.badRequest().body("Missing Authorization header") ;
    }

    /**
     * Reflect user input without sanitization - XSS vulnerability.
     */
    @Operation(summary = "Welcome page (reflects input - XSS demo)", security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")})
    @GetMapping("/welcome")
    public String welcome(@Parameter(description = "Name to welcome (not escaped)") @RequestParam String name) {
        // Cross-Site Scripting (XSS) vulnerability - no HTML escaping
        // Return a longer, more interesting welcome HTML for the demo
        String html = "<html><body>" +
                "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:0 auto;\">" +
                "<h1 style=\"color:#1f2937;\">Welcome, " + name + "!</h1>" +
                "<p style=\"color:#374151;\">Glad to see you back. Here's a quick summary of your demo account and recent activity — useful for demoing dashboards and data visualizations.</p>" +
                "<ul style=\"color:#374151;\">" +
                "<li><strong>Payments:</strong> You have sample payment methods (credit cards and PayPal) seeded for demo purposes.</li>" +
                "<li><strong>Transactions:</strong> Example transactions are available. Use the Payments view to inspect or simulate charges.</li>" +
                "<li><strong>Security note:</strong> This demo intentionally stores sensitive fields in plain text — do not replicate this in production.</li>" +
                "</ul>" +
                "<h3 style=\"color:#111827;margin-top:18px;\">Tips & next steps</h3>" +
                "<ol style=\"color:#374151;\">" +
                "<li>Try creating a new user via the Register button and then add a payment method.</li>" +
                "<li>Use the debug endpoints to explore seeded data (this app intentionally exposes sensitive data for scanning exercises).</li>" +
                "<li>Check the Payments page to simulate charges and then view the transactions list.</li>" +
                "</ol>" +
                "<p style=\"color:#6b7280; font-size:0.9em; margin-top:12px;\">(This welcome message is intentionally reflective and not escaped to demonstrate XSS findings during security scans.)</p>" +
                "</div></body></html>";
        return html;
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
