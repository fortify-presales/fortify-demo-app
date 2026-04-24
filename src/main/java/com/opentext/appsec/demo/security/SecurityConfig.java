package com.opentext.appsec.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// INSECURE (intentional): Minimal security configuration that enforces JWT on /api/** endpoints.
@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService blacklistService;

    public SecurityConfig(JwtUtil jwtUtil, TokenBlacklistService blacklistService) {
        this.jwtUtil = jwtUtil;
        this.blacklistService = blacklistService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtUtil, blacklistService);

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/users/login", "/api/users/debug/credentials").permitAll()
                    .requestMatchers("/api/auth/entra/exchange").permitAll()
                    // Allow anonymous registration
                    .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

            // Enable OAuth2 Resource Server JWT support.
            // JwtDecoder is auto-configured from spring.security.oauth2.resourceserver.jwt.* properties.
            // Skip bearer-token extraction for token exchange endpoint so controller handles it explicitly.
            BearerTokenResolver defaultResolver = new DefaultBearerTokenResolver();
            http.oauth2ResourceServer(oauth2 -> oauth2
                    .bearerTokenResolver(request -> {
                        if ("/api/auth/entra/exchange".equals(request.getRequestURI())) {
                            return null;
                        }
                        return defaultResolver.resolve(request);
                    })
                    .jwt(Customizer.withDefaults()));

        // Allow frames for H2 console
        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }
}
