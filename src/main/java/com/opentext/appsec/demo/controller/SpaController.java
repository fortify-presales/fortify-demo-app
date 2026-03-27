package com.opentext.appsec.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaTypeFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    private final ResourceLoader resourceLoader;

    public SpaController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    /**
     * Serve any unmapped client-side paths (except static resources, actuator, swagger, api, etc.)
     * by returning static resources directly. This avoids internal forwards which can
     * cause DispatcherServlet re-dispatch loops in some environments.
     */
    // Do NOT match the root path here; require at least one character in the path.
    @RequestMapping({
        "/{path:^(?!(?:api|actuator|v3|swagger-ui|swagger|webjars|assets|static|favicon))[^.].+}",
        "/{path:^(?!(?:api|actuator|v3|swagger-ui|swagger|webjars|assets|static|favicon))[^.].+}/**"
    })
    public ResponseEntity<Resource> forward(HttpServletRequest request) {
        String uri = request.getRequestURI();

        // Attempt to serve the request as a static resource if it exists
        Resource resource = resourceLoader.getResource("classpath:/static" + uri);
        if (resource != null && resource.exists()) {
            MediaType mt = MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok().contentType(mt).body(resource);
        }

        // For client-side routes, serve the SPA index.html directly (no forward)
        Resource index = resourceLoader.getResource("classpath:/static/index.html");
        if (index != null && index.exists()) {
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(index);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
