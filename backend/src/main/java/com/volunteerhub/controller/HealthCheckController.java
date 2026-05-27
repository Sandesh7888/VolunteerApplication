package com.volunteerhub.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {

    @GetMapping("/")
    public String healthCheck() {
        return "Volunteer Hub API is running!";
    }

    @GetMapping("favicon.ico")
    public org.springframework.http.ResponseEntity<Void> disableFavicon() {
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
