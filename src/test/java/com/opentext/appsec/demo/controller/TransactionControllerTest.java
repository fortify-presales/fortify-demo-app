package com.opentext.appsec.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opentext.appsec.demo.model.Transaction;
import com.opentext.appsec.demo.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TransactionControllerTest {

    @Mock
    private TransactionRepository transactionRepository;

    private TransactionController controller;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        controller = new TransactionController();
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "transactionRepository", transactionRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getByPayment_returnsList() throws Exception {
        Transaction t = new Transaction(5L, 1.50, "APPROVED");
        t.setId(11L);
        t.setCreatedAt(LocalDateTime.now());

        when(transactionRepository.findByPaymentId(5L)).thenReturn(List.of(t));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/transactions/payment/5"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("[0].id").value(11))
                .andExpect(jsonPath("[0].paymentId").value(5))
                .andExpect(jsonPath("[0].amount").value(1.5))
                .andExpect(jsonPath("[0].status").value("APPROVED"));
    }

    @Test
    void getByPayment_empty_returnsEmptyArray() throws Exception {
        when(transactionRepository.findByPaymentId(99L)).thenReturn(List.of());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/transactions/payment/99"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(content().string("[]"));
    }
}
