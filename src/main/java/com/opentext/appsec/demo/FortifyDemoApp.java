package com.opentext.appsec.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for Fortify Demo App.
 * This application intentionally contains security vulnerabilities for demonstration purposes.
 */
@SpringBootApplication
public class FortifyDemoApp {

    public static void main(String[] args) {
        SpringApplication.run(FortifyDemoApp.class, args);
    }
}
