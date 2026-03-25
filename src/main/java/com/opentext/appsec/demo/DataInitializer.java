package com.opentext.appsec.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.model.Payment;
import com.opentext.appsec.demo.repository.UserRepository;
import com.opentext.appsec.demo.repository.PaymentRepository;

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

    @Bean
    CommandLineRunner initPayments(PaymentRepository paymentRepository, UserRepository userRepository) {
        return args -> {
            // INSECURE (intentional): sample payment data includes plain-text card numbers and CVV for demo purposes.
            try {
                User user = userRepository.findByUsername("user");
                if (user != null) {
                    paymentRepository.save(new Payment(user.getId(), "CREDIT_CARD", "4111111111111111", "12/25", "123", null, "ACTIVE"));
                }
                User john = userRepository.findByUsername("john");
                if (john != null) {
                    paymentRepository.save(new Payment(john.getId(), "PAYPAL", null, null, null, "john.paypal@example.com", "ACTIVE"));
                }
                User alice = userRepository.findByUsername("alice");
                if (alice != null) {
                    paymentRepository.save(new Payment(alice.getId(), "CREDIT_CARD", "5555555555554444", "01/26", "999", null, "INACTIVE"));
                }
            } catch (Exception e) {
                // swallow - demo initializer should not fail startup
            }
        };
    }
}
