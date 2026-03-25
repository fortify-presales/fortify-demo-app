package com.opentext.appsec.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.repository.UserRepository;

/**
 * Data initializer for demo purposes.
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository repository) {
        return args -> {
            // Storing passwords in plain text - security vulnerability
            repository.save(new User("admin", "admin123", "admin@example.com", "ADMIN"));
            repository.save(new User("user", "password", "user@example.com", "USER"));
            repository.save(new User("john", "john123", "john@example.com", "USER"));
            repository.save(new User("alice", "alice456", "alice@example.com", "USER"));
        };
    }
}
