package com.fortify.demo.aviator.service;

import com.fortify.demo.aviator.model.User;
import com.fortify.demo.aviator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.security.MessageDigest;
import java.util.List;

/**
 * User service with intentional security vulnerabilities.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    // Hardcoded database credentials - security vulnerability
    private static final String DB_USERNAME = "admin";
    private static final String DB_PASSWORD = "P@ssw0rd123!";

    /**
     * Find user by username using SQL injection vulnerability.
     * Vulnerable to SQL Injection attack.
     */
    public User findUserByUsername(String username) {
        // SQL Injection vulnerability - concatenating user input directly
        String sql = "SELECT * FROM users WHERE username = '" + username + "'";
        Query query = entityManager.createNativeQuery(sql, User.class);
        List<User> results = query.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Authenticate user with weak password hashing.
     * Uses MD5 which is cryptographically broken.
     */
    public boolean authenticateUser(String username, String password) {
        try {
            // Weak cryptography - MD5 is broken and should not be used
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            String hashedPassword = sb.toString();

            User user = userRepository.findByUsername(username);
            if (user != null) {
                // Comparing plain text password - another vulnerability
                return user.getPassword().equals(password);
            }
        } catch (Exception e) {
            e.printStackTrace();  // Exposing stack trace - information disclosure
        }
        return false;
    }

    /**
     * Create a new user.
     */
    public User createUser(User user) {
        // Storing password in plain text - security vulnerability
        return userRepository.save(user);
    }

    /**
     * Get all users.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Search users with SQL injection vulnerability.
     */
    public List<User> searchUsers(String searchTerm) {
        // SQL Injection vulnerability
        String sql = "SELECT * FROM users WHERE username LIKE '%" + searchTerm + "%' OR email LIKE '%" + searchTerm + "%'";
        Query query = entityManager.createNativeQuery(sql, User.class);
        return query.getResultList();
    }

    /**
     * Get database credentials - exposing sensitive data.
     */
    public String getDatabaseCredentials() {
        return "Username: " + DB_USERNAME + ", Password: " + DB_PASSWORD;
    }
}
