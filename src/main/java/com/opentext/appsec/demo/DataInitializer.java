package com.opentext.appsec.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.model.Payment;
import com.opentext.appsec.demo.model.Transaction;
import com.opentext.appsec.demo.repository.UserRepository;
import com.opentext.appsec.demo.repository.PaymentRepository;
import com.opentext.appsec.demo.repository.TransactionRepository;

/**
 * Data initializer for demo purposes.
 */
@Configuration
public class DataInitializer {

    private static final Log logger = LogFactory.getLog(DataInitializer.class);

    @Bean
    @Order(1)
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
    @Order(2)
    CommandLineRunner initPayments(PaymentRepository paymentRepository, UserRepository userRepository, TransactionRepository transactionRepository) {
        return args -> {
            // INSECURE (intentional): sample payment data includes plain-text card numbers and CVV for demo purposes.
            try {
                User user = userRepository.findByUsername("user");
                if (user != null) {
                    paymentRepository.save(new Payment(user.getId(), "CREDIT_CARD", "4111111111111111", "12/25", "123", null, "ACTIVE"));
                    logger.info("Seeded credit card for user 'user' id=" + user.getId());
                }
                User john = userRepository.findByUsername("john");
                if (john != null) {
                    paymentRepository.save(new Payment(john.getId(), "PAYPAL", null, null, null, "john.paypal@example.com", "ACTIVE"));
                    logger.info("Seeded PayPal for 'john' id=" + john.getId());
                }
                User alice = userRepository.findByUsername("alice");
                if (alice != null) {
                    // keep an example credit card and also add a PayPal account for alice
                    paymentRepository.save(new Payment(alice.getId(), "CREDIT_CARD", "5555555555554444", "01/26", "999", null, "INACTIVE"));
                    paymentRepository.save(new Payment(alice.getId(), "PAYPAL", null, null, null, "alice.paypal@example.com", "ACTIVE"));
                }
            } catch (Exception e) {
                logger.error("Error seeding payments", e);
            }
            try {
                // find payments and create a few transactions per payment so UI shows history
                for (Payment p : paymentRepository.findAll()) {
                    try {
                        logger.info("Seeding transactions for payment id=" + p.getId() + " userId=" + p.getUserId());
                        // create a few sample transactions with varying amounts/statuses
                        Transaction t1 = new Transaction(p.getId(), 12.34, "APPROVED");
                        Transaction t2 = new Transaction(p.getId(), 5.00, "APPROVED");
                        Transaction t3 = new Transaction(p.getId(), 2.50, "DECLINED");
                        transactionRepository.save(t1);
                        transactionRepository.save(t2);
                        transactionRepository.save(t3);
                        logger.info("Saved 3 transactions for payment id=" + p.getId());
                    } catch (Exception inner) {
                        logger.error("Failed to seed transactions for payment id=" + p.getId(), inner);
                    }
                }
            } catch (Exception e) {
                logger.error("Error seeding transactions", e);
            }
        };
    }
}
