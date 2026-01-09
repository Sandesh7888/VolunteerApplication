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
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully";
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

}
