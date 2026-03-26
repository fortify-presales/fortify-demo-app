package com.opentext.appsec.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opentext.appsec.demo.model.Payment;
import com.opentext.appsec.demo.repository.PaymentRepository;
import com.opentext.appsec.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PaymentControllerTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    private PaymentController controller;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        controller = new PaymentController();
        ReflectionTestUtils.setField(controller, "paymentRepository", paymentRepository);
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getAllPayments_returnsList() throws Exception {
        Payment p = new Payment(1L, "CREDIT_CARD", "4111111111111111", "12/25", "123", null, "ACTIVE");
        when(paymentRepository.findAll()).thenReturn(List.of(p));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/payments"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("[0].cardNumber").value("4111111111111111"));
    }

    @Test
    void createPayment_returnsSaved() throws Exception {
        Payment input = new Payment(2L, "PAYPAL", null, null, null, "bob@paypal", "ACTIVE");
        Payment saved = new Payment(2L, "PAYPAL", null, null, null, "bob@paypal", "ACTIVE");
        saved.setId(5L);
        when(paymentRepository.save(any(Payment.class))).thenReturn(saved);

        String json = "{\"userId\":2,\"type\":\"PAYPAL\",\"cardNumber\":null,\"cardExpiry\":null,\"cvv\":null,\"paypalEmail\":\"bob@paypal\",\"status\":\"ACTIVE\"}";
        mockMvc.perform(MockMvcRequestBuilders.post("/api/payments")
                .contentType("application/json")
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath(".id").value(5));
    }

    @Test
    void deletePayment_notFound_returns404() throws Exception {
        when(paymentRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/payments/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void chargePayment_notFound_returns404() throws Exception {
        when(paymentRepository.findById(77L)).thenReturn(Optional.empty());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/payments/charge").param("paymentId", "77").param("amount", "5.00"))
                .andExpect(status().isNotFound());
    }

    @Test
    void chargePayment_happy_returnsDebugString() throws Exception {
        Payment p = new Payment(3L, "CREDIT_CARD", "5555555555554444", "01/26", "999", null, "ACTIVE");
        p.setId(10L);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(p));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/payments/charge").param("paymentId", "10").param("amount", "12.34"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Charging payment id=10")));
    }
}
