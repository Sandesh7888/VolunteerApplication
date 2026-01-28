package com.volunteerhub.controller;

import com.volunteerhub.model.User;
import com.volunteerhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {
        if (user.getRole() == null) {
            user.setRole(User.Role.VOLUNTEER);
        }
        userService.register(user);
        return Map.of("message", "User Registered Successfully");
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        User user = userService.login(request.get("email"), request.get("password"));
        // TEMP: Return userId for frontend to use in API calls
        return Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name(),
                "points", user.getPoints() != null ? user.getPoints() : 0,
                "vmsId", user.getVmsId() != null ? user.getVmsId() : "N/A",
                "message", "Login successful");
    }

    // TEMP: Recovery endpoint for corrupted passwords
    @PostMapping("/reset")
    public Map<String, String> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("password");
        User user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(newPassword); // Will be hashed by updateUser
        userService.updateUser(user.getId(), user);
        return Map.of("message", "Password Reset Successfully for " + email);
    }
}
