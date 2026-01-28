package com.volunteerhub.controller;

import com.volunteerhub.model.User;
import com.volunteerhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.register(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return org.springframework.http.ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/role/{role}")
    public List<User> getByRole(@PathVariable User.Role role) {
        return userService.getUsersByRole(role);
    }

    @GetMapping("/admin/dashboard")
    public Map<String, Object> adminDashboard() {
        List<User> organizers = userService.getUsersByRole(User.Role.ORGANIZER);
        List<User> volunteers = userService.getUsersByRole(User.Role.VOLUNTEER);
        return Map.of("organizers", organizers, "volunteers", volunteers);
    }

    @GetMapping("/organizer/{id}/details")
    public Map<String, Object> getOrganizerDetails(@PathVariable Long id) {
        return userService.getOrganizerDetails(id);
    }
}
