package com.opentext.appsec.demo.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Simple in-memory token blacklist for demo purposes.
@Component
public class TokenBlacklistService {
    // token -> expiryMillis
    private final Map<String, Long> blacklist = new ConcurrentHashMap<>();

    public void blacklistToken(String token, long expiryMillis) {
        if (token == null || token.isBlank()) return;
        blacklist.put(token, expiryMillis);
    }

    public boolean isBlacklisted(String token) {
        if (token == null) return false;
        Long exp = blacklist.get(token);
        if (exp == null) return false;
        if (System.currentTimeMillis() > exp) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }
}
