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
    public String register(@RequestBody User user) {
        if (user.getRole() == null) {
            user.setRole(User.Role.VOLUNTEER);
        }
        userService.register(user);
        return "User Registered Successfully";
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {
        User user = userService.login(request.get("email"), request.get("password"));
        // TEMP: Return userId for frontend to use in API calls
        return Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "name", user.getName(),
                "message", "Login successful"
        );
    }
}
