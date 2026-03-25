package com.opentext.appsec.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.service.UserService;

import java.util.List;

/**
 * User controller with intentional security vulnerabilities.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Get all users.
     */
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * Search users with SQL injection vulnerability.
     */
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String query) {
        // Passes unsanitized input to service - SQL Injection
        return userService.searchUsers(query);
    }

    /**
     * Find user by username with SQL injection vulnerability.
     */
    @GetMapping("/find")
    public ResponseEntity<User> findUser(@RequestParam String username) {
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
    @PostMapping
    public User createUser(@RequestBody User user) {
        // No password hashing - stores plain text password
        return userService.createUser(user);
    }

    /**
     * Authenticate user with weak authentication.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String username, @RequestParam String password) {
        // Weak authentication logic
        boolean authenticated = userService.authenticateUser(username, password);
        if (authenticated) {
            // Exposing sensitive information in response
            return ResponseEntity.ok("Login successful for user: " + username + " with password: " + password);
        }
        return ResponseEntity.status(401).body("Authentication failed");
    }

    /**
     * Get database credentials - exposes sensitive data.
     */
    @GetMapping("/debug/credentials")
    public String getCredentials() {
        // Exposing sensitive credentials
        return userService.getDatabaseCredentials();
    }

    /**
     * Reflect user input without sanitization - XSS vulnerability.
     */
    @GetMapping("/welcome")
    public String welcome(@RequestParam String name) {
        // Cross-Site Scripting (XSS) vulnerability - no HTML escaping
        return "<html><body><h1>Welcome " + name + "!</h1></body></html>";
    }

    /**
     * Display user profile with XSS vulnerability.
     */
    @GetMapping("/{id}/profile")
    public String getUserProfile(@PathVariable Long id, @RequestParam(required = false) String message) {
        // XSS vulnerability - unsanitized user input reflected in HTML
        return "<html><body><h1>User Profile #" + id + "</h1>" +
                (message != null ? "<div class='message'>" + message + "</div>" : "") +
                "</body></html>";
    }
}
