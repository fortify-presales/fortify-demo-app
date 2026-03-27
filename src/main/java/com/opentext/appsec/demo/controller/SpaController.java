package com.opentext.appsec.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    private final ResourceLoader resourceLoader;

    public SpaController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Forward any unmapped paths (except for static resources, actuator, swagger, api, etc.) to index.html
     * so that client-side routing can handle them. If a static or documentation resource exists, forward
     * to it so Spring's resource handling serves it instead of the SPA.
     */
    // Note: do NOT map `/` here — static index.html should be served by Spring's resource handler.
    @RequestMapping({"/{path:[^\\.]*}", "/**/{path:[^\\.]*}"})
    public String forward(HttpServletRequest request) {
        String uri = request.getRequestURI();

        // Paths we explicitly don't want to hijack
        if (uri.startsWith("/actuator") || uri.startsWith("/api") || uri.startsWith("/v3/api-docs") || uri.startsWith("/swagger") || uri.startsWith("/swagger-ui")) {
            return "forward:" + uri;
        }

        // If the request is for a file (has an extension), let resource handling serve it
        if (uri.contains(".")) {
            return "forward:" + uri;
        }

        // Check common classpath locations for existing static resources (so swagger UI in META-INF/resources is found)
        Resource r1 = resourceLoader.getResource("classpath:/static" + uri);
        Resource r2 = resourceLoader.getResource("classpath:/META-INF/resources" + uri);
        if ((r1 != null && r1.exists()) || (r2 != null && r2.exists())) {
            return "forward:" + uri;
        }

        // Default: serve the SPA entry
        return "forward:/index.html";
    }
}
