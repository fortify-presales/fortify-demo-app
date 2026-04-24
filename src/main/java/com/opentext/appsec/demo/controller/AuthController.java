package com.opentext.appsec.demo.controller;

import com.opentext.appsec.demo.model.User;
import com.opentext.appsec.demo.repository.UserRepository;
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
    private final UserRepository userRepository;

    public AuthController(EntraTokenService entraTokenService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.entraTokenService = entraTokenService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
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
            // Validate Entra token and extract Entra principal (UPN/email/unique name)
            String entraPrincipal = entraTokenService.validateEntraTokenAndGetUsername(entraToken);
            String username = mapToLocalUsername(entraPrincipal);
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("No mapped local user found for Entra principal: " + entraPrincipal);
            }

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

    private String mapToLocalUsername(String entraPrincipal) {
        if (entraPrincipal == null || entraPrincipal.isBlank()) {
            return null;
        }

        String principal = entraPrincipal.trim();

        // 1) direct username match (case-insensitive)
        User byUsername = userRepository.findByUsernameIgnoreCase(principal).orElse(null);
        if (byUsername != null) {
            return byUsername.getUsername();
        }

        // 2) direct email match (case-insensitive)
        User byEmail = userRepository.findByEmailIgnoreCase(principal).orElse(null);
        if (byEmail != null) {
            return byEmail.getUsername();
        }

        // 3) UPN local-part mapping: user@tenant.onmicrosoft.com -> user
        int atPos = principal.indexOf('@');
        if (atPos > 0) {
            String localPart = principal.substring(0, atPos);
            User byLocalPart = userRepository.findByUsernameIgnoreCase(localPart).orElse(null);
            if (byLocalPart != null) {
                return byLocalPart.getUsername();
            }
        }

        return null;
    }
}
