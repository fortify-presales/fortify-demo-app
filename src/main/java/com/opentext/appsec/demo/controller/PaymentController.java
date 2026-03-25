package com.opentext.appsec.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opentext.appsec.demo.model.Payment;
import com.opentext.appsec.demo.repository.PaymentRepository;
import com.opentext.appsec.demo.repository.UserRepository;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

/**
 * Payment controller exposing insecure demo endpoints.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Operation(summary = "Get all payments (INSECURE: exposes sensitive data)")
    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Operation(summary = "Get payments by user id")
    @GetMapping("/user/{userId}")
    public List<Payment> getByUser(@Parameter(description = "User id") @PathVariable Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    @Operation(summary = "Create a payment method (INSECURE: stores card data in plain text)")
    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        // INSECURE (intentional): storing payment data including card details in plain text for demo.
        return paymentRepository.save(payment);
    }

    @Operation(summary = "Delete a payment method")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(@PathVariable Long id) {
        if (!paymentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        paymentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Simulate charging a payment (insecure demo)")
    @PostMapping("/charge")
    public ResponseEntity<String> chargePayment(@Parameter(description = "Payment id to charge") @RequestParam Long paymentId,
                                                @Parameter(description = "Amount") @RequestParam double amount) {
        Payment p = paymentRepository.findById(paymentId).orElse(null);
        if (p == null) {
            return ResponseEntity.notFound().build();
        }
        // INSECURE (intentional): logging sensitive card data and simulating a charge
        String debug = "Charging payment id=" + paymentId + " card=" + p.getCardNumber() + " amount=" + amount;
        return ResponseEntity.ok(debug);
    }

    @Operation(summary = "Debug endpoint showing raw card numbers (INSECURE - demo)")
    @GetMapping("/debug/rawcards")
    public String listRawCards() {
        StringBuilder sb = new StringBuilder();
        for (Payment p : paymentRepository.findAll()) {
            sb.append("paymentId=").append(p.getId()).append(" card=").append(p.getCardNumber()).append("\n");
        }
        return sb.toString();
    }
}
