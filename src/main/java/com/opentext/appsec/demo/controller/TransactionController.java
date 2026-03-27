package com.opentext.appsec.demo.controller;

import com.opentext.appsec.demo.model.Transaction;
import com.opentext.appsec.demo.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Operation(summary = "Get transactions for a payment")
    @GetMapping("/payment/{paymentId}")
    public List<Transaction> getByPayment(@Parameter(description = "Payment id") @PathVariable Long paymentId) {
        return transactionRepository.findByPaymentId(paymentId);
    }
}
