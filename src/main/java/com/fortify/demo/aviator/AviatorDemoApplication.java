package com.fortify.demo.aviator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for Fortify Aviator Demo.
 * This application intentionally contains security vulnerabilities for demonstration purposes.
 */
@SpringBootApplication
public class AviatorDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(AviatorDemoApplication.class, args);
    }
}
