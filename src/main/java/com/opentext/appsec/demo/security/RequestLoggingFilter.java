package com.opentext.appsec.demo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Request logging filter that inspects request bodies and logs them raw (INSECURE - intentional demo behavior).
 *
 * This is intentionally insecure for demo/training purposes: it logs raw request payloads including
 * sensitive fields such as passwords and card numbers. In real applications do NOT enable this.
 * The filter preserves the request body for downstream handlers by using ContentCachingRequestWrapper
 * and performs logging after the request is processed.
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Log logger = LogFactory.getLog(RequestLoggingFilter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        HttpServletRequest requestToUse = request;
        if (!(request instanceof ContentCachingRequestWrapper)) {
            requestToUse = new ContentCachingRequestWrapper(request);
        }

        try {
            filterChain.doFilter(requestToUse, response);
        } finally {
            String method = requestToUse.getMethod();
            if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
                ContentCachingRequestWrapper wrapper = (ContentCachingRequestWrapper) requestToUse;
                byte[] buf = wrapper.getContentAsByteArray();
                if (buf != null && buf.length > 0) {
                    java.nio.charset.Charset cs;
                    if (wrapper.getCharacterEncoding() != null) {
                        cs = java.nio.charset.Charset.forName(wrapper.getCharacterEncoding());
                    } else {
                        cs = StandardCharsets.UTF_8;
                    }
                    String payload = new String(buf, cs);
                    // INSECURE (intentional): log raw payload for demo/training purposes
                    logger.info("Request " + method + " " + requestToUse.getRequestURI() + " payload: " + payload);
                }
            }
        }
    }

}
