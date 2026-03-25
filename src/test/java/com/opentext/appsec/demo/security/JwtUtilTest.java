package com.opentext.appsec.demo.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    @Test
    void tokenLifecycle() {
        JwtUtil jwtUtil = new JwtUtil();
        String token = jwtUtil.generateToken("alice");

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("alice", jwtUtil.getUsernameFromToken(token));
    }
}
