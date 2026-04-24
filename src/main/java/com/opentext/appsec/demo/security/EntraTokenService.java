package com.opentext.appsec.demo.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

/**
 * Service for validating Microsoft Entra ID tokens.
 * This service validates incoming Entra tokens and extracts user information for JWT creation.
 */
@Service
public class EntraTokenService {

    private final JwtDecoder jwtDecoder;
    private final JwtDecoder relaxedJwtDecoder;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:#{null}}")
    private String issuerUri;

    public EntraTokenService(
            JwtDecoder jwtDecoder,
            @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:#{null}}") String jwkSetUri
    ) {
        this.jwtDecoder = jwtDecoder;
        if (jwkSetUri != null && !jwkSetUri.isBlank()) {
            // INSECURE (intentional): fallback decoder skips strict issuer validation for demo compatibility.
            // Secure alternative: enforce exact issuer + audience validation for the expected tenant/app only.
            this.relaxedJwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        } else {
            this.relaxedJwtDecoder = null;
        }
    }

    /**
     * Validates an Entra access token and extracts claims.
     * Returns the username/UPN from the token.
     *
     * @param token the Entra access token
     * @return the username/UPN from the token
     * @throws JwtException if token is invalid or cannot be decoded
     */
    public String validateEntraTokenAndGetUsername(String token) throws JwtException {
        if (token == null || token.isBlank()) {
            throw new JwtException("Token is empty");
        }

        // Remove "Bearer " prefix if present
        String cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

        try {
            Jwt jwt;
            try {
                jwt = jwtDecoder.decode(cleanToken);
            } catch (JwtException primaryException) {
                boolean issuerMismatch = primaryException.getMessage() != null
                        && primaryException.getMessage().toLowerCase().contains("iss claim is not valid");
                if (issuerMismatch && relaxedJwtDecoder != null) {
                    jwt = relaxedJwtDecoder.decode(cleanToken);
                } else {
                    throw primaryException;
                }
            }

            // Extract username from claims
            // Entra typically uses 'preferred_username' or 'upn' for user identity
            String username = (String) jwt.getClaims().getOrDefault("preferred_username",
                    jwt.getClaims().getOrDefault("upn",
                            jwt.getClaims().getOrDefault("unique_name", null)));

            if (username == null || username.isBlank()) {
                throw new JwtException("No username found in Entra token");
            }

            return username;
        } catch (JwtException e) {
            throw new JwtException("Invalid or expired Entra token: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if Entra validation is enabled (requires issuer-uri to be configured).
     */
    public boolean isEntraEnabled() {
        return issuerUri != null && !issuerUri.isBlank();
    }
}
