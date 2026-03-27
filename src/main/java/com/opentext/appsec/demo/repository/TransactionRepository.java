package com.opentext.appsec.demo.repository;

import com.opentext.appsec.demo.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository interface for managing transactions.
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByPaymentId(Long paymentId);
}
