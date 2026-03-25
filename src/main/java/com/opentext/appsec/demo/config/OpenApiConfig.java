package com.opentext.appsec.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Paths;
import io.swagger.v3.oas.models.Operation;
import java.util.ArrayList;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        SecurityScheme bearerScheme = new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .in(SecurityScheme.In.HEADER)
            .name("Authorization");

        return new OpenAPI()
            .components(new Components().addSecuritySchemes("bearerAuth", bearerScheme))
            .info(new Info()
                .title("Fortify Demo API")
                .version("1.0.0")
                .description("OpenAPI docs for the Fortify Demo application. Endpoints are intentionally insecure for testing."));
    }

    // No OpenApiCustomiser here — keep security annotations as-is in code.
}
