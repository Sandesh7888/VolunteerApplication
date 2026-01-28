package com.volunteerhub.service.impl;

import com.volunteerhub.model.User;
import com.volunteerhub.repository.UserRepository;
import com.volunteerhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final com.volunteerhub.repository.EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Generate unique VMS ID
        String prefix = user.getRole() == User.Role.VOLUNTEER ? "VOL-" : "ORG-";
        user.setVmsId(prefix + System.currentTimeMillis() % 1000000);

        return userRepository.save(user);
    }

    @Override
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);

        if (updatedUser.getName() != null)
            user.setName(updatedUser.getName());
        if (updatedUser.getNumber() != null)
            user.setNumber(updatedUser.getNumber());

        // Preserve vmsId if not present
        if (user.getVmsId() == null) {
            String prefix = user.getRole() == User.Role.VOLUNTEER ? "VOL-" : "ORG-";
            user.setVmsId(prefix + System.currentTimeMillis() % 1000000);
        }

        // Only update password if a new one is explicitly provided
        // And ensure we don't re-hash an empty string or null
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    public java.util.Map<String, Object> getOrganizerDetails(Long id) {
        User user = getUserById(id);
        if (user.getRole() != User.Role.ORGANIZER) {
            throw new RuntimeException("User is not an organizer");
        }
        List<com.volunteerhub.model.Event> events = eventRepository.findByOrganizer(user);
        return java.util.Map.of(
                "organizer", user,
                "events", events);
    }
}
