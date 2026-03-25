package com.opentext.appsec.demo.model;

import jakarta.persistence.*;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * Payment entity for demo purposes.
 */
@Schema(description = "Payment entity (INSECURE: contains demo vulnerabilities)")
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Schema(description = "Owner user id")
    private Long userId;

    @Schema(description = "Payment method type (e.g., CREDIT_CARD, PAYPAL)")
    private String type;

    @Schema(description = "Card number stored in plain text (INSECURE)")
    private String cardNumber; // INSECURE (intentional): storing full card number in plain text for demo purposes. Secure alternative: tokenize + encrypt and never store CVV.

    @Schema(description = "Card expiry date")
    private String cardExpiry;

    @Schema(description = "Card CVV stored in plain text (INSECURE)")
    private String cvv; // INSECURE (intentional): storing CVV in plain text for demo purposes. Secure alternative: do not store CVV.

    @Schema(description = "PayPal email (if applicable)")
    private String paypalEmail;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Payment status")
    private String status;

    public Payment() {
    }

    public Payment(Long userId, String type, String cardNumber, String cardExpiry, String cvv, String paypalEmail, String status) {
        this.userId = userId;
        this.type = type;
        this.cardNumber = cardNumber;
        this.cardExpiry = cardExpiry;
        this.cvv = cvv;
        this.paypalEmail = paypalEmail;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardExpiry() {
        return cardExpiry;
    }

    public void setCardExpiry(String cardExpiry) {
        this.cardExpiry = cardExpiry;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public String getPaypalEmail() {
        return paypalEmail;
    }

    public void setPaypalEmail(String paypalEmail) {
        this.paypalEmail = paypalEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
