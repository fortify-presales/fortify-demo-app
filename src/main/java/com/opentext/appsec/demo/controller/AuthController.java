package com.opentext.appsec.demo.controller;

import com.opentext.appsec.demo.security.EntraTokenService;
import com.opentext.appsec.demo.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for Entra token exchange.
 * Exchanges Microsoft Entra tokens for application JWTs.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EntraTokenService entraTokenService;
    private final JwtUtil jwtUtil;

    public AuthController(EntraTokenService entraTokenService, JwtUtil jwtUtil) {
        this.entraTokenService = entraTokenService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Exchange Entra access token for application JWT.
     * POST /api/auth/entra/exchange
     * Header: Authorization: Bearer <entra_access_token>
     *
     * @param authHeader the Authorization header containing the Entra token
     * @return application JWT if successful
     */
    @PostMapping("/entra/exchange")
    public ResponseEntity<String> exchangeEntraToken(@RequestHeader("Authorization") String authHeader) {
        if (!entraTokenService.isEntraEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Entra authentication is not configured");
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid Authorization header");
        }

        String entraToken = authHeader.substring(7);

        try {
            // Validate Entra token and extract username
            String username = entraTokenService.validateEntraTokenAndGetUsername(entraToken);

            // Generate application JWT
            String appJwt = jwtUtil.generateToken(username);

            return ResponseEntity.ok(appJwt);
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Entra token: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Token exchange failed: " + e.getMessage());
        }
    }
}
