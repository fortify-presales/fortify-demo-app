package com.opentext.appsec.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.service.UserService;
import com.opentext.appsec.demo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    private UserController controller;
    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        controller = new UserController();
        ReflectionTestUtils.setField(controller, "userService", userService);
        ReflectionTestUtils.setField(controller, "jwtUtil", jwtUtil);

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getAllUsers_returnsList() throws Exception {
        User u = new User("u1","p","u1@e","USER");
        when(userService.getAllUsers()).thenReturn(List.of(u));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/users")).andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("[0].username").value("u1"));
    }

    @Test
    void login_returnsToken_whenAuthenticated() throws Exception {
        when(userService.authenticateUser("bob", "secret")).thenReturn(true);
        when(jwtUtil.generateToken("bob")).thenReturn("token123");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/users/login")
                        .param("username", "bob")
                        .param("password", "secret"))
                .andExpect(status().isOk())
                .andExpect(content().string("token123"));
    }

    @Test
    void searchUsers_delegatesToService() throws Exception {
        User u = new User("s","p","s@e","USER");
        when(userService.searchUsers("term")).thenReturn(List.of(u));

        mockMvc.perform(MockMvcRequestBuilders.get("/api/users/search").param("query", "term"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("[0].username").value("s"));
    }
}
