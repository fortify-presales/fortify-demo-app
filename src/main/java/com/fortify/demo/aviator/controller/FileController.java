package com.fortify.demo.aviator.controller;

import com.fortify.demo.aviator.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * File controller with intentional security vulnerabilities.
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    /**
     * Read file with path traversal vulnerability.
     */
    @GetMapping("/read")
    public ResponseEntity<String> readFile(@RequestParam String filename) {
        try {
            // Path Traversal vulnerability - allows reading any file
            String content = fileService.readFile(filename);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            // Information disclosure - exposing stack trace
            return ResponseEntity.status(500).body("Error: " + e.getMessage() + "\n" + java.util.Arrays.toString(e.getStackTrace()));
        }
    }

    /**
     * Write file with path traversal vulnerability.
     */
    @PostMapping("/write")
    public ResponseEntity<String> writeFile(@RequestParam String filename, @RequestBody String content) {
        try {
            // Path Traversal vulnerability
            fileService.writeFile(filename, content);
            return ResponseEntity.ok("File written successfully: " + filename);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Execute command with command injection vulnerability.
     */
    @GetMapping("/exec")
    public ResponseEntity<String> executeCommand(@RequestParam String cmd) {
        try {
            // Command Injection vulnerability - extremely dangerous
            String output = fileService.executeCommand(cmd);
            return ResponseEntity.ok(output);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Execute shell command with command injection vulnerability.
     */
    @GetMapping("/shell")
    public ResponseEntity<String> executeShellCommand(@RequestParam String input) {
        try {
            // Command Injection via shell
            String output = fileService.executeShellCommand(input);
            return ResponseEntity.ok(output);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Read file with absolute path - path traversal vulnerability.
     */
    @GetMapping("/readabs")
    public ResponseEntity<String> readAbsolutePath(@RequestParam String path) {
        try {
            // Allows reading any file on the system
            String content = fileService.readAbsolutePath(path);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Delete file without validation.
     */
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFile(@RequestParam String filename) {
        // Path Traversal vulnerability - could delete system files
        boolean deleted = fileService.deleteFile(filename);
        if (deleted) {
            return ResponseEntity.ok("File deleted: " + filename);
        }
        return ResponseEntity.status(404).body("File not found: " + filename);
    }
}
