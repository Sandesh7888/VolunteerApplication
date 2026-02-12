package com.volunteerhub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace(); // Print stack trace to logs
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage()); // 'message' for useApi.js
        error.put("error", ex.getClass().getSimpleName());
        error.put("status", "400");
        System.err.println("❌ RUNTIME ERROR: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        ex.printStackTrace();
        Map<String, String> error = new HashMap<>();
        error.put("message", "Internal Server Error: " + ex.getMessage());
        error.put("error", ex.getClass().getSimpleName());
        error.put("status", "500");
        System.err.println("❌ SYSTEM ERROR: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
